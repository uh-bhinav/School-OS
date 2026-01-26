# backend/app/api/v1/endpoints/report_cards.py

import io

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import StreamingResponse

from app import schemas
from app.db.session import get_db
from app.services.pdf_service import create_report_card_pdf
from app.services.report_card_service import get_student_report_card_data
from app.services.student_service import get_all_students_for_class

router = APIRouter()


@router.get(
    "/student/{student_id}",
    response_model=schemas.ReportCard,
    summary="Get a single student's report card",
    tags=["Report Cards"],
    # dependencies=[Depends(deps.get_current_user)] # Uncomment for Phase 5
)
async def get_student_report_card(
    student_id: int,
    academic_year_id: int = Query(..., description="The academic year ID is required"),
    db: AsyncSession = Depends(get_db),
    # current_user: models.Profile = Depends(deps.get_current_user), # Uncomment for Phase 5
):
    """
    Retrieve a fully calculated report card for a single student.

    - **student_id**: The ID of the student.
    - **academic_year_id**: The ID of the academic year to fetch marks for.
    """

    # TODO: Add authorization logic here (Phase 5)

    report_data = await get_student_report_card_data(db, student_id, academic_year_id)
    if not report_data:
        raise HTTPException(status_code=404, detail="Report card data not found for this student and academic year.")
    return report_data


@router.get(
    "/class/{class_id}",
    response_model=list[schemas.ReportCard],
    summary="Get report cards for an entire class",
    tags=["Report Cards"],
    # dependencies=[Depends(deps.get_current_user)] # Uncomment for Phase 5
)
async def get_class_report_cards(
    class_id: int,
    academic_year_id: int = Query(..., description="The academic year ID is required"),
    db: AsyncSession = Depends(get_db),
    # current_user: models.Profile = Depends(deps.get_current_user), # Uncomment for Phase 5
):
    """
    Retrieve a list of fully calculated report cards for every student
    currently enrolled in a specific class.

    - **class_id**: The ID of the class.
    - **academic_year_id**: The ID of the academic year to fetch marks for.
    """

    # TODO: Add authorization logic here (Phase 5)

    students_in_class = await get_all_students_for_class(db, class_id)
    if not students_in_class:
        return []  # Return an empty list if the class has no students

    report_cards = []
    for student in students_in_class:
        report_data = await get_student_report_card_data(db, student.student_id, academic_year_id)
        if report_data:
            report_cards.append(report_data)

    return report_cards


@router.get(
    "/student/{student_id}/pdf",
    summary="Download a student's report card as a PDF",
    tags=["Report Cards"],
    # Note: No response_model for StreamingResponse
    # dependencies=[Depends(deps.get_current_user)] # Uncomment for Phase 5
)
async def download_student_report_card_pdf(
    student_id: int,
    academic_year_id: int = Query(..., description="The academic year ID is required"),
    db: AsyncSession = Depends(get_db),
    # current_user: models.Profile = Depends(deps.get_current_user), # Uncomment for Phase 5
):
    """
    Retrieve a single student's report card, generate a PDF,
    and return it for download.

    - **student_id**: The ID of the student.
    - **academic_year_id**: The ID of the academic year to fetch marks for.
    """

    # TODO: Add authorization logic here (Phase 5)

    report_data = await get_student_report_card_data(db, student_id, academic_year_id)
    if not report_data:
        raise HTTPException(status_code=404, detail="Report card data not found for this student and academic year.")

    # --- This part is NOW ACTIVE ---
    pdf_bytes = await create_report_card_pdf(report_data)

    return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=report_card_{student_id}.pdf"})
    # --- End of Active block ---
