import uuid
from typing import Optional

from sqlalchemy import and_, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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

    async def create_album_with_targets(
        self,
        db: AsyncSession,
        *,
        album_data: AlbumCreate,
        targets: list[AlbumTargetCreate],
        published_by_id: uuid.UUID,
        school_id: int,
    ) -> Album:
        """Create an album along with any supplied target rules."""

        try:
            album_fields = album_data.model_dump(exclude={"targets"})
        except AttributeError:
            album_fields = album_data.dict(exclude={"targets"})
        # Ensure the caller's school_id overrides any payload data.
        album_fields.pop("school_id", None)
        try:
            db_album = Album(**album_fields, published_by_id=published_by_id, school_id=school_id)
            db.add(db_album)
            await db.flush()

            if targets:
                await album_target_service.create_targets(db, album_id=db_album.id, targets=targets)

            album_id = db_album.id
            await db.commit()

            stmt = select(Album).options(selectinload(Album.targets)).where(Album.id == album_id)
            result = await db.execute(stmt)
            return result.scalar_one()
        except Exception:
            await db.rollback()
            raise

    async def get_accessible_albums(
        self,
        db: AsyncSession,
        *,
        user_context: dict,
        album_type: Optional[str] = None,
    ) -> list[Album]:
        """Return the albums visible to the provided context."""

        school_id: int | None = user_context.get("school_id")
        grade_level = user_context.get("grade_level")
        current_class_id = user_context.get("current_class_id")
        user_id = user_context.get("user_id")

        stmt = select(Album).options(selectinload(Album.targets)).where(Album.school_id == school_id)
        if album_type:
            stmt = stmt.where(Album.album_type == album_type)

        visibility_conditions = [Album.access_scope == "public"]

        target_filters = []
        if grade_level is not None:
            target_filters.append(and_(AlbumTarget.target_type == "grade", AlbumTarget.target_id == grade_level))
        if current_class_id is not None:
            target_filters.append(and_(AlbumTarget.target_type == "class", AlbumTarget.target_id == current_class_id))

        if user_id:
            try:
                user_uuid = uuid.UUID(str(user_id))
            except (TypeError, ValueError):
                user_uuid = None

            if user_uuid:
                student_stmt = select(Student.student_id).where(Student.user_id == user_uuid)
                student_result = await db.execute(student_stmt)
                student_id = student_result.scalar_one_or_none()
                if student_id is not None:
                    target_filters.append(and_(AlbumTarget.target_type == "individual_student", AlbumTarget.target_id == student_id))

        if target_filters:
            subquery = select(AlbumTarget.album_id).where(or_(*target_filters))
            visibility_conditions.append(Album.id.in_(subquery))

        stmt = stmt.where(or_(*visibility_conditions))
        result = await db.execute(stmt)
        return list(result.scalars().unique().all())


album_service = AlbumService()
