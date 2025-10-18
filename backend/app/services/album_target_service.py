from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.album_target import AlbumTarget
from app.schemas.album_target_schema import AlbumTargetCreate


class InvalidTargetError(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedAccessError(HTTPException):
    def __init__(self, detail: str = "User does not have access to this resource"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class AlbumTargetService:
    """
    Service layer for handling business logic related to album targets.
    """

    def create_targets(self, db: Session, *, album_id: int, targets: list[AlbumTargetCreate]) -> list[AlbumTarget]:  # Fixed: F821 - Changed List to list
        """
        Creates new targeting rules for an album.

        Args:
            db (Session): The database session.
            album_id (int): The ID of the album to add targets to.
            targets (list[AlbumTargetCreate]): A list of target objects to create.

        Returns:
            list[AlbumTarget]: The list of newly created album target records.
        """
        # TODO: Add validation to check if target_id is valid (e.g., class_id exists)

        db_targets = [AlbumTarget(**target.dict(), album_id=album_id) for target in targets]
        db.add_all(db_targets)
        db.commit()
        for db_target in db_targets:
            db.refresh(db_target)
        return db_targets

    def get_targets_for_album(self, db: Session, *, album_id: int) -> list[AlbumTarget]:
        """
        Fetches all targeting rules for a specific album.

        Args:
            db (Session): The database session.
            album_id (int): The ID of the album.

        Returns:
            list[AlbumTarget]: A list of album target records.
        """
        return db.query(AlbumTarget).filter(AlbumTarget.album_id == album_id).all()

    def delete_targets(self, db: Session, *, album_id: int) -> None:
        """
        Deletes all targeting rules associated with an album.
        This is useful when updating an album's entire set of access rules.

        Args:
            db (Session): The database session.
            album_id (int): The ID of the album whose targets will be deleted.
        """
        db.query(AlbumTarget).filter(AlbumTarget.album_id == album_id).delete()
        db.commit()

    def validate_user_access(self, db: Session, *, album_id: int, user_context: dict) -> bool:
        """
        Checks if a user, based on their context, has access to a targeted album.

        Note: This is an application-level check. RLS is the primary security boundary.
        This function is useful for preemptive checks before attempting expensive operations
        like generating signed URLs.

        Args:
            db (Session): The database session.
            album_id (int): The ID of the album to check access for.
            user_context (dict): A dictionary containing the user's context (school_id, roles, grade_level, etc.).

        Returns:
            bool: True if the user has access, False otherwise.
        """
        targets = self.get_targets_for_album(db, album_id=album_id)
        if not targets:
            # If an album has no targets, access is denied by default unless it's public.
            # Public album logic is handled separately in the album_service.
            return False

        for target in targets:
            if target.target_type == "grade" and target.target_id == user_context.get("grade_level"):
                return True
            if target.target_type == "class" and target.target_id == user_context.get("current_class_id"):
                return True
            # Add other target_type checks as needed (e.g., 'stream', 'individual_student')

        return False


album_target_service = AlbumTargetService()
