from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.security import invite_user, require_role
from app.db.session import get_db
from app.models.role_definition import RoleDefinition
from app.models.teacher import Teacher
from app.models.user_roles import UserRole
from app.schemas.user_schema import UserInviteRequest, UserInviteResponse

router = APIRouter()


@router.post(
    "/invite",
    response_model=UserInviteResponse,
    dependencies=[Depends(require_role("Admin"))],  # only admins can invite
)
async def invite_new_user(request: UserInviteRequest, db: AsyncSession = Depends(get_db)):
    # 1. Call Supabase to invite and create user
    supabase_response = await invite_user(
        email=request.email,
        school_id=request.school_id,
        first_name=request.first_name,
        last_name=request.last_name,
        phone_number=request.phone_number,
        gender=request.gender,
        dob=request.date_of_birth,
    )

    user_id = supabase_response.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Supabase did not return a user id")

    # 2. Ensure role exists in roles_definition
    result = await db.execute(select(RoleDefinition).where(RoleDefinition.role_name == request.role_name))
    role_def = result.scalar_one_or_none()

    if not role_def:
        role_def = RoleDefinition(role_name=request.role_name)
        db.add(role_def)
        await db.commit()
        await db.refresh(role_def)

    # 3. Link user_id ↔ role_id in user_roles
    user_role = UserRole(user_id=user_id, role_id=role_def.role_id)
    db.add(user_role)
    await db.commit()

    # 4. If the role is "Teacher", create a Teacher record in the teachers table
    if request.role_name == "Teacher":
        # Check if teacher record already exists
        teacher_result = await db.execute(select(Teacher).where(Teacher.user_id == user_id))
        existing_teacher = teacher_result.scalar_one_or_none()
        
        if not existing_teacher:
            teacher = Teacher(
                user_id=user_id,
                school_id=request.school_id,
                is_active=True
            )
            db.add(teacher)
            await db.commit()
            await db.refresh(teacher)

    return {
        "id": user_id,
        "email": supabase_response["email"],
        "role": request.role_name,
        "status": supabase_response.get("status", "invited"),
    }
