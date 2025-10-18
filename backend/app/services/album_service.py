import uuid

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.album import Album
from app.models.album_target import AlbumTarget
from app.models.student import Student
from app.schemas.album_schema import AlbumCreate
from app.schemas.album_target_schema import AlbumTargetCreate
from app.services.album_target_service import album_target_service


class AlbumService:
    """
    Service layer for handling business logic related to albums.
    """

    def create_album_with_targets(self, db: Session, *, album_data: AlbumCreate, targets: list[AlbumTargetCreate], published_by_id: uuid.UUID, school_id: int) -> Album:
        """
        Creates an album and its associated targeting rules in a single database transaction.

        Args:
            db (Session): The database session.
            album_data (AlbumCreate): The Pydantic schema for creating an album.
            targets (List[AlbumTargetCreate]): The list of targeting rules.
            published_by_id (uuid.UUID): The ID of the user creating the album.
            school_id (int): The school ID the album belongs to.

        Returns:
            Album: The newly created album object.
        """
        try:
            # Create the album instance
            db_album = Album(**album_data.dict(), published_by_id=published_by_id, school_id=school_id)
            db.add(db_album)
            db.flush()  # Use flush to get the db_album.id before the final commit

            # Create the targets associated with the new album
            album_target_service.create_targets(db, album_id=db_album.id, targets=targets)

            db.commit()
            db.refresh(db_album)
            return db_album
        except Exception as e:
            db.rollback()
            raise e

    def get_accessible_albums(self, db: Session, *, user_context: dict, album_type: str = None) -> list[Album]:
        """
        Returns all albums a user can access based on their context.
        This includes public albums and albums targeted specifically at the user.

        Args:
            db (Session): The database session.
            user_context (dict): The user's context (school_id, grade_level, class_id, etc.).
            album_type (str, optional): Filter albums by type (e.g., 'cultural'). Defaults to None.

        Returns:
            List[Album]: A list of accessible album objects.
        """
        school_id = user_context.get("school_id")
        grade_level = user_context.get("grade_level")
        current_class_id = user_context.get("current_class_id")
        user_id = user_context.get("user_id")

        # Base query for albums in the user's school
        query = db.query(Album).filter(Album.school_id == school_id)

        if album_type:
            query = query.filter(Album.album_type == album_type)

        # Conditions for accessibility
        conditions = []

        # 1. Public albums
        conditions.append(Album.access_scope == "public")

        # 2. Targeted albums
        # Since you removed targeted RLS for cultural albums, we'll keep the service logic
        # in case you want to use it for application-level filtering (e.g., in the UI).
        target_conditions = [
            AlbumTarget.target_type == "grade" and AlbumTarget.target_id == grade_level,
            AlbumTarget.target_type == "class" and AlbumTarget.target_id == current_class_id,
        ]

        # Add student-specific target if applicable
        student = db.query(Student.student_id).filter(Student.user_id == user_id).first()
        if student:
            target_conditions.append(AlbumTarget.target_type == "individual_student" and AlbumTarget.target_id == student.student_id)

        conditions.append(Album.id.in_(db.query(AlbumTarget.album_id).filter(or_(*target_conditions))))

        query = query.filter(or_(*conditions))

        return query.all()


album_service = AlbumService()
