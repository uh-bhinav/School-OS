# File: app/agents/modules/academics/leaves/period_agent/schemas.py

from typing import Optional

from pydantic.v1 import BaseModel, Field

# --- Tool Schemas ---


class ListPeriodsSchema(BaseModel):
    """Input schema for the list_periods tool."""

    school_id: Optional[int] = Field(default=None, description="Optional ID of the school. If not provided, it will be inferred from the user's context.")


class PeriodDefinition(BaseModel):
    """A sub-model defining a single period for the create_period_structure tool."""

    period_number: int = Field(..., description="The sequential number of the period (e.g., 1, 2).")
    name: str = Field(..., description="The name of the period (e.g., 'Period 1', 'Lunch').")
    start_time: str = Field(..., description="The start time in HH:MM format (e.g., '09:00').")
    end_time: str = Field(..., description="The end time in HH:MM format (e.g., '09:40').")


class CreatePeriodStructureSchema(BaseModel):
    """Input schema for the create_period_structure tool."""

    periods: list[PeriodDefinition] = Field(..., description="A list of period definitions that will replace the school's existing structure.")


class UpdatePeriodTimingSchema(BaseModel):
    """Input schema for the update_period_timing tool."""

    period_number: int = Field(..., description="The number of the period to update.")
    start_time: str = Field(..., description="The new start time in HH:MM format.")
    end_time: str = Field(..., description="The new end time in HH:MM format.")
    name: Optional[str] = Field(default=None, description="Optional new name for the period.")


# --- Exports ---

__all__ = ["ListPeriodsSchema", "CreatePeriodStructureSchema", "UpdatePeriodTimingSchema", "PeriodDefinition"]
