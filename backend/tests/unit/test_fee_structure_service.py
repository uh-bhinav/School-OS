from datetime import date

import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.class_fee_structure import ClassFeeStructure
from app.models.class_model import Class
from app.models.fee_component import FeeComponent
from app.models.fee_template import FeeTemplate
from app.models.fee_template_component import FeeTemplateComponent
from app.schemas.class_fee_structure_schema import AssignTemplateToClassSchema
from app.schemas.fee_component_schema import FeeComponentCreate
from app.schemas.fee_template_schema import FeeTemplateCreate
from app.schemas.fee_term_schema import FeeTermCreate
from app.services.fee_structure_service import FeeStructureService

# Mark all tests in this file as asynchronous
pytestmark = pytest.mark.asyncio


async def test_create_fee_component_success(db_session, mock_admin_profile):
    """
    Tests that an admin can successfully create a new fee component.
    """
    service = FeeStructureService(db_session)
    component_data = FeeComponentCreate(
        # Use the mock profile data
        school_id=mock_admin_profile.school_id,
        component_name="Annual Sports Fee",
        component_type="Service",
        base_amount=2500.00,
        is_mandatory=True,
    )

    new_component = await service.create_fee_component(component_data=component_data)

    assert new_component is not None
    assert new_component.component_name == "Annual Sports Fee"
    assert new_component.school_id == mock_admin_profile.school_id

    saved_component = await db_session.get(FeeComponent, new_component.id)
    assert saved_component is not None
    assert saved_component.component_name == "Annual Sports Fee"


# CHANGE: Renamed 'admin_profile' to 'mock_admin_profile'
async def test_create_fee_component_duplicate_name_fails(db_session, mock_admin_profile):
    """
    Tests that creating a fee component with a duplicate name for the same school fails.
    """
    service = FeeStructureService(db_session)
    initial_component_data = FeeComponentCreate(
        # Use the mock profile data
        school_id=mock_admin_profile.school_id,
        component_name="Duplicate Test Fee",
        component_type="Service",
        base_amount=100.00,
    )
    await service.create_fee_component(component_data=initial_component_data)

    duplicate_component_data = FeeComponentCreate(school_id=mock_admin_profile.school_id, component_name="Duplicate Test Fee", component_type="Academic", base_amount=200.00)

    with pytest.raises(HTTPException) as exc_info:
        await service.create_fee_component(component_data=duplicate_component_data)

    assert exc_info.value.status_code == 409
    assert "already exists" in exc_info.value.detail.lower()


async def test_create_fee_template_with_components_and_terms(db_session, mock_admin_profile):
    """
    Tests creating a complete FeeTemplate with linked components and nested payment terms.
    """
    # --- FIX: Manually create prerequisite data within the test's transaction ---
    # Arrange: Create and flush components to get their IDs without committing.
    comp1 = FeeComponent(school_id=mock_admin_profile.school_id, component_name="Test Tuition Fee", component_type="Academic", base_amount=20000)
    comp2 = FeeComponent(school_id=mock_admin_profile.school_id, component_name="Test Library Fee", component_type="Service", base_amount=500)
    db_session.add_all([comp1, comp2])
    await db_session.flush()  # This assigns comp1.id and comp2.id without ending the transaction

    # Now, comp1 and comp2 are "live" and attached to the session. Accessing .id will not cause an error.

    # Prepare the data for the new template
    template_data = FeeTemplateCreate(
        school_id=mock_admin_profile.school_id,
        academic_year_id=1,
        name="Grade 5 Annual Test Template",
        component_ids=[comp1.id, comp2.id],
        terms=[FeeTermCreate(name="Term 1", due_date=date(2025, 4, 15), amount=10250), FeeTermCreate(name="Term 2", due_date=date(2025, 10, 15), amount=10250)],
    )

    # Act: Call the service function we are actually testing
    service = FeeStructureService(db_session)
    new_template = await service.create_fee_template(template_data=template_data)

    # Assert: Verify the template and its relationships were created correctly
    assert new_template is not None
    assert new_template.name == "Grade 5 Annual Test Template"

    # Verify directly from the database
    stmt = select(FeeTemplate).options(selectinload(FeeTemplate.components), selectinload(FeeTemplate.fee_terms)).where(FeeTemplate.id == new_template.id)
    result = await db_session.execute(stmt)
    saved_template = result.scalars().first()

    assert saved_template is not None
    assert len(saved_template.components) == 2
    assert len(saved_template.fee_terms) == 2
    assert saved_template.fee_terms[0].name == "Term 1"


async def test_assign_template_to_class_bulk(db_session, mock_admin_profile):
    """
    Tests that assigning a fee template to a class correctly creates
    all the necessary class_fee_structure records for each component.
    """
    # Arrange: Create all prerequisite data
    comp1 = FeeComponent(school_id=mock_admin_profile.school_id, component_name="Bulk Assign Tuition", component_type="Academic", base_amount=50000)
    comp2 = FeeComponent(school_id=mock_admin_profile.school_id, component_name="Bulk Assign Sports Fee", component_type="Service", base_amount=3000)
    db_session.add_all([comp1, comp2])

    template = FeeTemplate(school_id=mock_admin_profile.school_id, academic_year_id=1, name="Bulk Assign Template")
    db_session.add(template)

    test_class = Class(school_id=mock_admin_profile.school_id, grade_level=6, section="C", academic_year_id=1)
    db_session.add(test_class)

    await db_session.flush()  # Flush once to get all IDs

    link1 = FeeTemplateComponent(fee_template_id=template.id, fee_component_id=comp1.id)
    link2 = FeeTemplateComponent(fee_template_id=template.id, fee_component_id=comp2.id)
    db_session.add_all([link1, link2])
    await db_session.flush()

    # --- THE CRITICAL FIX ---
    # Store all necessary IDs in simple variables BEFORE the service call.
    expected_component_ids = {comp1.id, comp2.id}
    class_id_to_check = test_class.class_id  # This is the key fix

    assignment_data = AssignTemplateToClassSchema(class_id=class_id_to_check, template_id=template.id, academic_year_id=1)  # Use the stored variable

    # Act: Call the service function which will commit the transaction and detach our objects
    service = FeeStructureService(db_session)
    await service.assign_template_to_class(assignment_data=assignment_data)

    # Assert: Verify the records were created using the stored ID
    stmt = select(ClassFeeStructure).where(ClassFeeStructure.class_id == class_id_to_check)
    result = await db_session.execute(stmt)
    created_assignments = result.scalars().all()

    assert len(created_assignments) == 2

    created_component_ids = {assignment.component_id for assignment in created_assignments}
    assert created_component_ids == expected_component_ids
