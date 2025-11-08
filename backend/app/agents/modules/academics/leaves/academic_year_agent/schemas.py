from datetime import date
from typing import Optional

from pydantic.v1 import BaseModel, Field

# We are using Pydantic v2 (BaseModel) as seen in your academic_year_schema.py
# Your attendance_agent/schemas.py uses Pydantic v1, but we should
# follow the v2 pattern for new code.


class ListYearsSchema(BaseModel):
    """Input schema for the list_academic_years tool."""

    include_inactive: Optional[bool] = Field(default=False, description="Set to true to include inactive academic years. (Admin Only)")


class CreateYearSchema(BaseModel):
    """Input schema for the create_academic_year tool."""

    school_id: int = Field(..., description="The ID of the school. Must match the Admin's school ID.")
    name: str = Field(..., description="The full name of the academic year (e.g., '2025-2026').")
    start_date: date = Field(..., description="The start date of the academic year (YYYY-MM-DD).")
    end_date: date = Field(..., description="The end date of the academic year (YYYY-MM-DD).")

    @classmethod
    def check_dates(self) -> "CreateYearSchema":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("End date cannot be before start date")
        return self


class UpdateYearSchema(BaseModel):
    """Input schema for the update_academic_year tool."""

    year_id: int = Field(..., description="The unique ID of the academic year to update.")
    name: Optional[str] = Field(default=None, description="The new name for the academic year.")
    start_date: Optional[date] = Field(default=None, description="The new start date (YYYY-MM-DD).")
    end_date: Optional[date] = Field(default=None, description="The new end date (YYYY-MM-DD).")
    is_active: Optional[bool] = Field(default=None, description="Set the active status.")


class SetActiveYearSchema(BaseModel):
    """Input schema for the set_active_academic_year tool."""

    year_id: int = Field(..., description="The unique ID of the academic year to set as active.")


class DeleteYearSchema(BaseModel):
    """Input schema for the delete_academic_year tool."""

    year_id: int = Field(..., description="The unique ID of the academic year to soft-delete.")


# Export all schemas
__all__ = ["ListYearsSchema", "CreateYearSchema", "UpdateYearSchema", "SetActiveYearSchema", "DeleteYearSchema"]
