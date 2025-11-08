from pydantic.v1 import BaseModel, Field

# --- Schemas for Report Card Tools (from report_cards.py) ---


class GetStudentReportCardSchema(BaseModel):
    """Input schema for the get_student_report_card tool."""

    student_id: int = Field(..., description="The unique ID of the student.")
    academic_year_id: int = Field(..., description="The ID of the academic year for the report card.")


class GetClassReportCardsSchema(BaseModel):
    """Input schema for the get_class_report_cards tool."""

    class_id: int = Field(..., description="The ID of the class.")
    academic_year_id: int = Field(..., description="The ID of the academic year for the report cards.")


class DownloadReportCardPDFSchema(BaseModel):
    """Input schema for the download_student_report_card_pdf tool."""

    student_id: int = Field(..., description="The unique ID of the student.")
    academic_year_id: int = Field(..., description="The ID of the academic year for the PDF.")


# Export all schemas
__all__ = ["GetStudentReportCardSchema", "GetClassReportCardsSchema", "DownloadReportCardPDFSchema"]
