# backend/app/api/deps.py
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import get_current_user_profile
from app.models.class_model import Class
from app.models.profile import Profile
from app.models.student import Student


async def get_current_active_user(
    current_user: Profile = Depends(get_current_user_profile),
) -> Profile:
    """Ensure the authenticated user is active before proceeding."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


def is_teacher(user: Profile) -> bool:
    """Return True when the profile has a Teacher role."""
    user_roles = {role.role_definition.role_name for role in user.roles}
    return "Teacher" in user_roles


def is_school_admin(user: Profile) -> bool:
    """Return True when the profile has an Admin role."""
    user_roles = {role.role_definition.role_name for role in user.roles}
    return "Admin" in user_roles


def is_student(user: Profile) -> bool:
    """Return True when the profile has a Student role."""
    user_roles = {role.role_definition.role_name for role in user.roles}
    return "Student" in user_roles


async def get_user_context_from_user(db: AsyncSession, user: Profile) -> dict:
    """Build a minimal context dict used for permission checks."""
    context = {
        "user_id": str(user.user_id),
        "school_id": user.school_id,
        "roles": [role.role_definition.role_name for role in user.roles],
    }

    if is_student(user):
        stmt = select(Student).where(Student.user_id == user.user_id)
        result = await db.execute(stmt)
        student = result.scalars().first()

        if student:
            grade_level = None
            if student.current_class_id:
                class_stmt = select(Class.grade_level).where(Class.class_id == student.current_class_id)
                class_result = await db.execute(class_stmt)
                grade_level = class_result.scalar_one_or_none()

            context.update(
                {
                    "student_id": student.student_id,
                    "current_class_id": student.current_class_id,
                }
            )
            if grade_level is not None:
                context["grade_level"] = grade_level

    return context
