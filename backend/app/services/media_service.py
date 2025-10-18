import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.storage import storage_client
from app.models.album import Album
from app.models.media_item import MediaItem
from app.services.album_target_service import UnauthorizedAccessError, album_target_service

# A mapping from album type to the corresponding storage bucket name
BUCKET_MAP = {
    "profile": "profile-pictures",
    "cultural": "school-media-cultural",
    "ecommerce": "school-media-ecommerce",
}


class MediaService:
    """
    Service layer for handling media file operations and business logic.
    """

    def get_bucket_for_album(self, db: Session, *, album_id: int) -> str:
        """Determines the correct storage bucket for a given album."""
        album = db.query(Album).filter(Album.id == album_id).first()
        if not album:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")

        bucket_name = BUCKET_MAP.get(album.album_type)
        if not bucket_name:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"No bucket configured for album type: {album.album_type}")
        return bucket_name

    async def upload_media_item(self, db: Session, *, album_id: int, file: UploadFile, uploaded_by_id: uuid.UUID) -> MediaItem:
        """
        Uploads a media file to the appropriate storage bucket and creates a
        corresponding database record.

        Args:
            db (Session): The database session.
            album_id (int): The ID of the album to upload the media to.
            file (UploadFile): The file to be uploaded.
            uploaded_by_id (uuid.UUID): The ID of the user uploading the file.

        Returns:
            MediaItem: The newly created media item record.
        """
        # TODO: Add permission check to ensure the user is allowed to upload to this album.
        # For example: check if the user is a teacher for a 'cultural' album.

        bucket_name = self.get_bucket_for_album(db, album_id=album_id)

        # Generate a unique path for the file to prevent collisions
        file_extension = file.filename.split(".")[-1]
        storage_path = f"{album_id}/{uuid.uuid4()}.{file_extension}"

        # Read file content
        contents = await file.read()
        file_size = len(contents)

        # Use the centralized storage client to upload
        storage_client.upload_file(bucket=bucket_name, path=storage_path, file=contents, mime_type=file.content_type)

        # Create the database record
        db_media_item = MediaItem(album_id=album_id, storage_path=storage_path, mime_type=file.content_type, file_size_bytes=file_size, uploaded_by_id=uploaded_by_id)
        db.add(db_media_item)
        db.commit()
        db.refresh(db_media_item)

        return db_media_item

    def generate_signed_url(self, db: Session, *, media_item_id: int, user_context: dict, expiry_seconds: int = 3600) -> str:
        """
        Generates a time-limited signed URL for a media item after verifying user access.

        Args:
            db (Session): The database session.
            media_item_id (int): The ID of the media item.
            user_context (dict): The user's context for permission checking.
            expiry_seconds (int): The duration for which the URL is valid.

        Returns:
            str: The signed URL.
        """
        media_item = db.query(MediaItem).filter(MediaItem.id == media_item_id).first()
        if not media_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")

        album = media_item.album

        # Application-level access check
        is_public = album.access_scope == "public"
        has_targeted_access = album_target_service.validate_user_access(db, album_id=album.id, user_context=user_context)

        if not (is_public or has_targeted_access):
            raise UnauthorizedAccessError()

        bucket_name = self.get_bucket_for_album(db, album_id=album.id)

        return storage_client.generate_signed_url(bucket=bucket_name, path=media_item.storage_path, expires_in=expiry_seconds)

    def delete_media_item(self, db: Session, *, media_item_id: int, user_id: uuid.UUID):
        """
        Deletes a media item from storage and its corresponding database record.

        Args:
            db (Session): The database session.
            media_item_id (int): The ID of the media item to delete.
            user_id (uuid.UUID): The ID of the user attempting the deletion.
        """
        media_item = db.query(MediaItem).filter(MediaItem.id == media_item_id).first()
        if not media_item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")

        # TODO: Implement more robust permission checks (e.g., allow admins to delete)
        if media_item.uploaded_by_id != user_id:
            raise UnauthorizedAccessError("You can only delete your own media.")

        bucket_name = self.get_bucket_for_album(db, album_id=media_item.album_id)

        # Delete from storage first
        storage_client.delete_file(bucket=bucket_name, path=media_item.storage_path)

        # Delete from database
        db.delete(media_item)
        db.commit()


media_service = MediaService()
