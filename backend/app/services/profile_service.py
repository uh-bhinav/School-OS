import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.storage import storage_client
from app.models.profile import Profile
from app.schemas.profile_schema import ProfileCreate, ProfileUpdate
from app.services.album_target_service import UnauthorizedAccessError


class ProfileService:
    def get_profile(self, db: Session, user_id: uuid.UUID):
        return db.query(Profile).filter(Profile.user_id == user_id).first()

    def get_profiles_by_school(self, db: Session, school_id: int, skip: int = 0, limit: int = 100):
        return db.query(Profile).filter(Profile.school_id == school_id).offset(skip).limit(limit).all()

    def create_profile(self, db: Session, profile: ProfileCreate, user_id: uuid.UUID, school_id: int):
        db_profile = Profile(**profile.dict(), user_id=user_id, school_id=school_id)
        db.add(db_profile)
        db.commit()
        db.refresh(db_profile)
        return db_profile

    def update_profile(self, db: Session, user_id: uuid.UUID, profile: ProfileUpdate):
        db_profile = self.get_profile(db, user_id)
        if db_profile:
            update_data = profile.dict(exclude_unset=True)
            for key, value in update_data.items():
                setattr(db_profile, key, value)
            db.commit()
            db.refresh(db_profile)
        return db_profile

    # --- NEW METHODS FROM ROADMAP ---

    async def upload_profile_picture(self, db: Session, *, user_id: uuid.UUID, file: UploadFile) -> Profile:
        """
        Uploads a profile picture for a user, validates it, and updates the profile record.

        Args:
            db (Session): The database session.
            user_id (uuid.UUID): The ID of the user whose profile picture is being uploaded.
            file (UploadFile): The image file to upload.

        Returns:
            Profile: The updated profile object.
        """
        db_profile = self.get_profile(db, user_id)
        if not db_profile:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

        # Basic file validation
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be an image.")

        contents = await file.read()

        # Enforce size limit (e.g., 5 MB from roadmap)
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File size cannot exceed 5MB.")

        # Generate the exact storage path as defined in the RLS policies
        file_extension = file.filename.split(".")[-1]
        storage_path = f"{user_id}/avatar.{file_extension}"
        bucket_name = "profile-pictures"

        # Upload the file
        storage_client.upload_file(bucket=bucket_name, path=storage_path, file=contents, mime_type=file.content_type)

        # Update the profile record with the relative storage path
        db_profile.profile_picture_url = storage_path
        db.commit()
        db.refresh(db_profile)

        return db_profile

    def get_profile_picture_url(self, db: Session, *, user_id: uuid.UUID, requesting_user_context: dict) -> str:
        """
        Generates a signed URL for a user's profile picture after verifying permissions.

        Args:
            db (Session): The database session.
            user_id (uuid.UUID): The ID of the user whose picture is being requested.
            requesting_user_context (dict): The context of the user making the request.

        Returns:
            str: The time-limited signed URL.
        """
        profile_to_view = self.get_profile(db, user_id)
        if not profile_to_view or not profile_to_view.profile_picture_url:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile picture not found.")

        # Permission check: Is the requester the owner or a School Admin?
        is_owner = requesting_user_context.get("user_id") == str(user_id)
        is_admin = "School Admin" in requesting_user_context.get("role_names", [])

        if not (is_owner or is_admin):
            raise UnauthorizedAccessError("You are not authorized to view this profile picture.")

        # Generate signed URL
        signed_url = storage_client.generate_signed_url(bucket="profile-pictures", path=profile_to_view.profile_picture_url, expires_in=3600)  # 1 hour

        return signed_url


profile_service = ProfileService()
