import uuid
from typing import Any

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

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
    """Service layer for handling media file operations and business logic."""

    async def _get_album(self, db: AsyncSession, *, album_id: int) -> Album:
        stmt = select(Album).where(Album.id == album_id)
        result = await db.execute(stmt)
        album = result.scalar_one_or_none()
        if album is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Album not found")
        return album

    def _resolve_bucket(self, *, album_type: str) -> str:
        bucket_name = BUCKET_MAP.get(album_type)
        if not bucket_name:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"No bucket configured for album type: {album_type}",
            )
        return bucket_name

    async def get_bucket_for_album(self, db: AsyncSession, *, album_id: int) -> str:
        album = await self._get_album(db, album_id=album_id)
        return self._resolve_bucket(album_type=album.album_type)

    async def upload_media_item(
        self,
        db: AsyncSession,
        *,
        album_id: int,
        file: UploadFile,
        uploaded_by_id: uuid.UUID | str,
    ) -> MediaItem:
        """Upload a media file to storage and persist its metadata."""

        album = await self._get_album(db, album_id=album_id)
        bucket_name = self._resolve_bucket(album_type=album.album_type)

        filename = file.filename or "upload"
        extension = filename.split(".")[-1] if "." in filename else None
        unique_name = f"{uuid.uuid4()}"
        storage_path = f"{album_id}/{unique_name}{'.' + extension if extension else ''}"

        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

        file_size = len(contents)
        mime_type = file.content_type or "application/octet-stream"

        storage_client.upload_file(
            bucket=bucket_name,
            path=storage_path,
            file=contents,
            mime_type=mime_type,
        )

        uploader_uuid = uploaded_by_id if isinstance(uploaded_by_id, uuid.UUID) else uuid.UUID(str(uploaded_by_id))

        db_media_item = MediaItem(
            album_id=album_id,
            storage_path=storage_path,
            mime_type=mime_type,
            file_size_bytes=file_size,
            uploaded_by_id=str(uploader_uuid),
        )
        db.add(db_media_item)

        try:
            await db.commit()
            await db.refresh(db_media_item)
        except Exception:
            await db.rollback()
            raise

        return db_media_item

    async def generate_signed_url(
        self,
        db: AsyncSession,
        *,
        media_item_id: int,
        user_context: dict[str, Any],
        expiry_seconds: int = 3600,
    ) -> str:
        """Return a signed URL for the requested media item when access is permitted."""

        stmt = select(MediaItem).options(selectinload(MediaItem.album)).where(MediaItem.id == media_item_id)
        result = await db.execute(stmt)
        media_item = result.scalars().first()
        if media_item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")

        album = media_item.album
        if album is None:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Media item has no album association")

        is_public = album.access_scope == "public"
        has_targeted_access = await album_target_service.validate_user_access(
            db,
            album_id=album.id,
            user_context=user_context,
        )
        roles = {role.lower() for role in user_context.get("roles", [])}
        elevated_access = "teacher" in roles or "admin" in roles

        if not (is_public or has_targeted_access or elevated_access):
            raise UnauthorizedAccessError()

        bucket_name = self._resolve_bucket(album_type=album.album_type)
        return storage_client.generate_signed_url(
            bucket=bucket_name,
            path=media_item.storage_path,
            expires_in=expiry_seconds,
        )

    async def delete_media_item(
        self,
        db: AsyncSession,
        *,
        media_item_id: int,
        user_id: uuid.UUID | str,
    ) -> None:
        """Delete a media item from storage and the database after validation."""

        stmt = select(MediaItem).options(selectinload(MediaItem.album)).where(MediaItem.id == media_item_id)
        result = await db.execute(stmt)
        media_item = result.scalar_one_or_none()
        if media_item is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media item not found")

        try:
            requester_uuid = user_id if isinstance(user_id, uuid.UUID) else uuid.UUID(str(user_id))
            uploader_uuid = uuid.UUID(str(media_item.uploaded_by_id))
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user identifier") from exc

        if requester_uuid != uploader_uuid:
            raise UnauthorizedAccessError("You can only delete your own media.")

        album = media_item.album or await self._get_album(db, album_id=media_item.album_id)
        bucket_name = self._resolve_bucket(album_type=album.album_type)

        storage_client.delete_file(bucket=bucket_name, path=media_item.storage_path)

        try:
            await db.delete(media_item)
            await db.commit()
        except Exception:
            await db.rollback()
            raise


media_service = MediaService()
