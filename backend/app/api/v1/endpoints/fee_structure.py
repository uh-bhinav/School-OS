from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.security import get_current_user_profile, require_role
from app.db.session import get_db
from app.schemas.class_fee_structure_schema import AssignTemplateToClassSchema
from app.schemas.fee_component_schema import FeeComponentCreate, FeeComponentOut, FeeComponentUpdate
from app.schemas.fee_template_schema import FeeTemplateCreate, FeeTemplateOut
from app.services.fee_structure_service import FeeStructureService
from app.models.profile import Profile
from app.models.class_model import Class

router = APIRouter()


def get_fee_structure_service(db: AsyncSession = Depends(get_db)):
    return FeeStructureService(db)


@router.post("/fee-components", response_model=FeeComponentOut, status_code=201, dependencies=[Depends(require_role("Admin"))])
async def create_fee_component(
    component_in: FeeComponentCreate,
    service: FeeStructureService = Depends(get_fee_structure_service),
    current_user: Profile = Depends(get_current_user_profile)
):
    """Create a new fee component (e.g., 'Tuition Fee')."""
    if hasattr(component_in, 'school_id') and component_in.school_id != current_user.school_id:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot create fee components for other schools."
        )
    return await service.create_fee_component(component_data=component_in)


@router.get("/fee-components/school/{school_id}", response_model=list[FeeComponentOut], dependencies=[Depends(get_current_user_profile)])
async def get_fee_components_for_school(
    school_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
    current_user: Profile = Depends(get_current_user_profile)
):
    """Get all fee components for a specific school."""
    if school_id != current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin can only view fee components for their own school."
        )
    return await service.get_fee_components_by_school(school_id=school_id)


@router.post(
    "/fee-templates",
    response_model=FeeTemplateOut,
    status_code=201,
    dependencies=[Depends(require_role("Admin"))]
)
async def create_fee_template(
    template_in: FeeTemplateCreate,
    service: FeeStructureService = Depends(get_fee_structure_service),
    # --- FIX: Add Auth Dependency ---
    current_user: Profile = Depends(get_current_user_profile)
):
    """[Admin Only] Create a new fee template with its associated payment terms."""
    # --- FIX: Add School Isolation Check ---
    if hasattr(template_in, 'school_id') and template_in.school_id != current_user.school_id:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot create fee templates for other schools."
        )
    # Ensure school_id comes from authenticated user if not in payload
    if not hasattr(template_in, 'school_id') or template_in.school_id is None:
        template_in.school_id = current_user.school_id

    return await service.create_fee_template(template_data=template_in)

@router.get(
    "/fee-components/{component_id}",
    response_model=FeeComponentOut,
    dependencies=[Depends(require_role("Admin"))]
)
async def get_fee_component_by_id(
    component_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
    current_user: Profile = Depends(get_current_user_profile)
):
    """[Admin Only] Get a specific fee component by ID."""
    component = await service.get_fee_component_by_id(component_id=component_id) # Assumes service has this method
    if not component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee Component not found")
    # School isolation check
    if component.school_id != current_user.school_id:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")
    return component

@router.put(
    "/fee-components/{component_id}",
    response_model=FeeComponentOut,
    dependencies=[Depends(require_role("Admin"))]
)
async def update_fee_component_by_id(
    component_id: int,
    component_in: FeeComponentUpdate, # Assumes FeeComponentUpdate schema exists
    service: FeeStructureService = Depends(get_fee_structure_service),
    current_user: Profile = Depends(get_current_user_profile)
):
    """[Admin Only] Update a fee component."""
    component = await service.get_fee_component_by_id(component_id=component_id)
    if not component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee Component not found")
    # School isolation check
    if component.school_id != current_user.school_id:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot update components for other schools.")
    # Prevent changing school_id if present in update schema
    if hasattr(component_in, 'school_id') and component_in.school_id != current_user.school_id:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot change component's school.")

    return await service.update_fee_component(db_obj=component, component_data=component_in) # Assumes service has this method

@router.delete(
    "/fee-components/{component_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_role("Admin"))]
)
async def delete_fee_component_by_id(
    component_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
    current_user: Profile = Depends(get_current_user_profile)
):
    """[Admin Only] Delete a fee component."""
    component = await service.get_fee_component_by_id(component_id=component_id)
    if not component:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee Component not found")
    # School isolation check
    if component.school_id != current_user.school_id:
         raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin cannot delete components for other schools.")

    # Add check for dependencies (e.g., if used in templates) before deleting
    is_used = await service.is_component_in_use(component_id=component_id)
    if is_used:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete fee component as it is used in active fee templates.")

    await service.delete_fee_component(db_obj=component) # Assumes service has this method
    return None


@router.get(
    "/fee-templates/school/{school_id}",
    response_model=list[FeeTemplateOut],
    # --- FIX: Role Check Added (Assuming Admin only) ---
    dependencies=[Depends(require_role("Admin"))]
)
async def get_fee_templates_for_school(
    school_id: int,
    service: FeeStructureService = Depends(get_fee_structure_service),
    # --- FIX: Auth Dependency Added ---
    current_user: Profile = Depends(get_current_user_profile)
):
    """[Admin Only] Get all fee templates for a specific school."""
    # --- FIX: School Isolation Check Added ---
    if school_id != current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin can only view fee templates for their own school."
        )
    return await service.get_fee_templates_by_school(school_id=school_id)


@router.post("/assign-template-to-class", status_code=200,  dependencies=[Depends(require_role("Admin"))])
async def assign_template_to_class(
    assignment_in: AssignTemplateToClassSchema,
    service: FeeStructureService = Depends(get_fee_structure_service),
    current_user: Profile = Depends(get_current_user_profile),
    db: AsyncSession = Depends(get_db)
):
    """
    Assign a fee template to a class for an academic year.
    This sets the default fees for all students in that class.
    """
    target_class = await db.get(Class, assignment_in.class_id) 
    if not target_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Target class not found"
        )
        
    if target_class.school_id != current_user.school_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin cannot assign templates to classes in other schools."
        )
    
    target_template = await service.get_fee_template_by_id(template_id=assignment_in.template_id)
    if not target_template or target_template.school_id != current_user.school_id:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, # Or 404/403
            detail="Fee template not found or does not belong to this school."
        )
    
    return await service.assign_template_to_class(assignment_data=assignment_in)