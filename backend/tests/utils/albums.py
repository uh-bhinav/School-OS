from __future__ import annotations

import uuid
from datetime import date, timedelta
from typing import Any, Iterable

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.academic_year import AcademicYear
from app.models.album import Album
from app.models.album_target import AlbumTarget
from app.models.class_model import Class
from app.models.media_item import MediaItem
from app.models.profile import Profile
from app.models.role_definition import RoleDefinition
from app.models.school import School
from app.models.student import Student
from app.models.user_roles import UserRole
from app.schemas.album_schema import AccessScope, AlbumType

__all__ = [
    "ensure_school",
    "get_profile_with_role",
    "get_student_context",
    "create_album_record",
    "clear_school_albums",
]


def _disable_expire_on_commit(db: AsyncSession) -> None:
    sync_session = getattr(db, "sync_session", None)
    if sync_session and getattr(sync_session, "expire_on_commit", True):
        sync_session.expire_on_commit = False


async def ensure_school(db: AsyncSession, *, school_id: int) -> School:
    """Retrieve or seed a school record for the supplied identifier."""
    _disable_expire_on_commit(db)
    school = await db.get(School, school_id)
    if school:
        return school

    school = School(
        school_id=school_id,
        name=f"Test School {school_id}",
        city="Test City",
        state="Test State",
        country="Test Country",
        is_active=True,
    )
    db.add(school)
    await db.flush()
    await db.refresh(school)
    return school


async def _get_or_create_role(db: AsyncSession, role_name: str) -> RoleDefinition:
    stmt = select(RoleDefinition).where(RoleDefinition.role_name == role_name)
    result = await db.execute(stmt)
    role = result.scalars().first()
    if role:
        return role

    role = RoleDefinition(role_name=role_name)
    db.add(role)
    await db.flush()
    return role


async def _fetch_profile_with_role(db: AsyncSession, role_name: str, school_id: int) -> Profile | None:
    stmt = select(Profile).options(selectinload(Profile.roles).selectinload(UserRole.role_definition)).join(UserRole).join(RoleDefinition).where(RoleDefinition.role_name == role_name, Profile.school_id == school_id).limit(1)
    result = await db.execute(stmt)
    return result.scalars().first()


async def get_profile_with_role(db: AsyncSession, role_name: str, *, school_id: int) -> Profile:
    """Return a profile in the target school that advertises the requested role."""
    _disable_expire_on_commit(db)
    school = await ensure_school(db, school_id=school_id)
    role = await _get_or_create_role(db, role_name)

    actual_school_id = school.school_id

    profile = await _fetch_profile_with_role(db, role_name, actual_school_id)
    if profile:
        return profile

    user_id = uuid.uuid4()
    profile = Profile(
        user_id=user_id,
        school_id=actual_school_id,
        first_name=f"{role_name}",
        last_name="User",
        is_active=True,
    )
    db.add(profile)

    user_role = UserRole(user_id=user_id, role_definition=role)
    profile.roles.append(user_role)
    db.add(user_role)

    await db.flush()
    return await _fetch_profile_with_role(db, role_name, actual_school_id)


async def _ensure_academic_year(db: AsyncSession, school_id: int) -> AcademicYear:
    stmt = select(AcademicYear).where(AcademicYear.school_id == school_id, AcademicYear.is_active.is_(True)).limit(1)
    result = await db.execute(stmt)
    academic_year = result.scalars().first()
    if academic_year:
        return academic_year

    today = date.today()
    academic_year = AcademicYear(
        school_id=school_id,
        name=f"{today.year}-{today.year + 1}",
        start_date=today - timedelta(days=90),
        end_date=today + timedelta(days=275),
        is_active=True,
    )
    db.add(academic_year)
    await db.flush()
    return academic_year


async def _ensure_class(db: AsyncSession, school_id: int) -> Class:
    stmt = select(Class).where(Class.school_id == school_id).limit(1)
    result = await db.execute(stmt)
    class_obj = result.scalars().first()
    if class_obj:
        return class_obj

    academic_year = await _ensure_academic_year(db, school_id)
    class_obj = Class(
        school_id=school_id,
        grade_level=7,
        section="A",
        academic_year_id=academic_year.id,
        is_active=True,
    )
    db.add(class_obj)
    await db.flush()
    await db.refresh(class_obj)
    return class_obj


async def get_student_context(db: AsyncSession, school_id: int) -> tuple[Profile, Student, Class]:
    """Provision a student profile alongside the linked student and class records."""
    _disable_expire_on_commit(db)
    school = await ensure_school(db, school_id=school_id)
    student_profile = await get_profile_with_role(db, "Student", school_id=school.school_id)

    stmt = select(Student).where(Student.user_id == student_profile.user_id)
    result = await db.execute(stmt)
    student = result.scalars().first()

    class_obj: Class | None = None
    if student and student.current_class_id:
        class_stmt = select(Class).where(Class.class_id == student.current_class_id)
        class_result = await db.execute(class_stmt)
        class_obj = class_result.scalars().first()

    if class_obj is None:
        class_obj = await _ensure_class(db, school.school_id)
        if student:
            student.current_class_id = class_obj.class_id
        else:
            student = Student(
                user_id=student_profile.user_id,
                current_class_id=class_obj.class_id,
                roll_number="STU-001",
                enrollment_date=date.today(),
                academic_status="Active",
                is_active=True,
            )
            db.add(student)
        await db.flush()
        await db.refresh(class_obj)

    if student and student.current_class_id != class_obj.class_id:
        student.current_class_id = class_obj.class_id
        await db.flush()

    if student is None:
        # Defensive fallback; should not happen but keeps the contract intact.
        student = Student(
            user_id=student_profile.user_id,
            current_class_id=class_obj.class_id,
            roll_number="STU-001",
            enrollment_date=date.today(),
            academic_status="Active",
            is_active=True,
        )
        db.add(student)
        await db.flush()

    await db.refresh(student)
    return student_profile, student, class_obj


def _coerce_album_type(value: AlbumType | str) -> str:
    return value.value if isinstance(value, AlbumType) else str(value)


def _coerce_access_scope(value: AccessScope | str) -> str:
    return value.value if isinstance(value, AccessScope) else str(value)


def _coerce_target_payload(target: Any) -> tuple[str, int] | None:
    if hasattr(target, "model_dump"):
        payload = target.model_dump()
    elif hasattr(target, "dict"):
        payload = target.dict()
    else:
        payload = target

    if isinstance(payload, dict):
        target_type = payload.get("target_type")
        target_id = payload.get("target_id")
    else:
        return None

    if target_type is None or target_id is None:
        return None

    if hasattr(target_type, "value"):
        target_type = target_type.value

    return str(target_type), int(target_id)


async def create_album_record(
    db: AsyncSession,
    *,
    school_id: int,
    published_by_id: uuid.UUID | str,
    title: str,
    album_type: AlbumType | str,
    access_scope: AccessScope | str,
    is_public: bool | None = None,
    metadata: dict[str, Any] | None = None,
    targets: Iterable[dict[str, Any]] | None = None,
) -> Album:
    """Insert an album with optional targeting rows for use in tests."""
    _disable_expire_on_commit(db)
    school = await ensure_school(db, school_id=school_id)

    album_type_value = _coerce_album_type(album_type)
    access_scope_value = _coerce_access_scope(access_scope)
    public_flag = is_public if is_public is not None else access_scope_value == AccessScope.PUBLIC.value

    published_uuid = published_by_id if isinstance(published_by_id, uuid.UUID) else uuid.UUID(str(published_by_id))

    album = Album(
        title=title,
        school_id=school.school_id,
        published_by_id=published_uuid,
        album_type=album_type_value,
        access_scope=access_scope_value,
        is_public=public_flag,
        album_metadata=metadata or {},
    )
    db.add(album)
    await db.flush()

    target_rows: list[AlbumTarget] = []
    for target in targets or []:
        coerced = _coerce_target_payload(target)
        if not coerced:
            continue
        target_type, target_id = coerced
        target_rows.append(
            AlbumTarget(
                album_id=album.id,
                target_type=target_type,
                target_id=target_id,
            )
        )

    if target_rows:
        db.add_all(target_rows)
        await db.flush()

    await db.refresh(album)
    db.expunge(album)
    return album


async def clear_school_albums(db: AsyncSession, *, school_id: int) -> None:
    """Remove albums and related rows for the provided school in the current transaction."""
    _disable_expire_on_commit(db)
    stmt = select(Album.id).where(Album.school_id == school_id)
    result = await db.execute(stmt)
    album_ids = [album_id for album_id in result.scalars().all()]
    if not album_ids:
        return

    await db.execute(delete(AlbumTarget).where(AlbumTarget.album_id.in_(album_ids)))
    await db.execute(delete(MediaItem).where(MediaItem.album_id.in_(album_ids)))
    await db.execute(delete(Album).where(Album.id.in_(album_ids)))
    await db.flush()
