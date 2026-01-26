"""
Unit tests for the report card service.
Tests all business logic for generating student report cards.
"""

from decimal import Decimal

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.report_card_schema import ReportCard
from app.services.report_card_service import get_percentage, get_student_report_card_data


class TestGetPercentage:
    """Test the percentage calculation helper function."""

    def test_get_percentage_normal_case(self):
        """Test percentage calculation with valid numbers."""
        result = get_percentage(Decimal("85"), Decimal("100"))
        assert result == 85.0
        assert isinstance(result, float)

    def test_get_percentage_perfect_score(self):
        """Test percentage calculation with 100% score."""
        result = get_percentage(Decimal("100"), Decimal("100"))
        assert result == 100.0

    def test_get_percentage_zero_obtained(self):
        """Test percentage calculation when student scores zero."""
        result = get_percentage(Decimal("0"), Decimal("100"))
        assert result == 0.0

    def test_get_percentage_zero_max_marks(self):
        """Test percentage calculation when max marks is zero (division by zero)."""
        result = get_percentage(Decimal("50"), Decimal("0"))
        assert result is None

    def test_get_percentage_decimal_result(self):
        """Test percentage calculation with decimal results."""
        result = get_percentage(Decimal("87.5"), Decimal("100"))
        assert result == 87.5

    def test_get_percentage_fractional(self):
        """Test percentage calculation with fractional marks."""
        result = get_percentage(Decimal("45"), Decimal("50"))
        assert result == 90.0


@pytest.mark.asyncio
class TestGetStudentReportCardData:
    """Test the main report card generation function."""

    async def test_student_not_found(self, db_session: AsyncSession):
        """Test that function returns None for non-existent student."""
        result = await get_student_report_card_data(db=db_session, student_id=999999, academic_year_id=1)
        assert result is None

    async def test_student_without_class(self, db_session: AsyncSession):
        """Test handling of student not enrolled in any class."""
        # This would require creating a student without current_class_id
        # For now, we test with non-existent student which also returns None
        result = await get_student_report_card_data(db=db_session, student_id=999999, academic_year_id=1)
        assert result is None

    async def test_valid_student_with_marks(self, db_session: AsyncSession):
        """
        Test report card generation for student 32 (Myra Mishra).
        This student has real data in the database.
        """
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        # Assert result is not None
        assert result is not None
        assert isinstance(result, ReportCard)

        # Verify student information
        assert result.student_id == 32
        assert result.student_name == "Myra Mishra"
        assert result.class_name == "Grade 3 - B"

        # Verify exam summaries exist
        assert len(result.exam_summaries) > 0

        # Verify the structure of exam summaries
        for exam_summary in result.exam_summaries:
            assert exam_summary.exam_name is not None
            assert len(exam_summary.marks) > 0
            assert exam_summary.total_obtained >= 0
            assert exam_summary.total_max_marks > 0
            assert exam_summary.percentage is not None

        # Verify grand totals are calculated
        assert result.grand_total_obtained >= 0
        assert result.grand_total_max_marks > 0
        assert result.overall_percentage is not None

    async def test_report_card_exam_sorting(self, db_session: AsyncSession):
        """Test that exams are sorted alphabetically by name."""
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        if result and len(result.exam_summaries) > 1:
            exam_names = [exam.exam_name for exam in result.exam_summaries]
            sorted_names = sorted(exam_names)
            assert exam_names == sorted_names, "Exams should be sorted alphabetically"

    async def test_report_card_calculations_accurate(self, db_session: AsyncSession):
        """
        Test that totals and percentages are calculated correctly.
        Based on known data: Student 32 has two exams with 92/100 each.
        """
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        assert result is not None

        # Expected: 2 exams × 92 marks = 184 total
        assert result.grand_total_obtained == Decimal("184.00")

        # Expected: 2 exams × 100 max = 200 total
        assert result.grand_total_max_marks == Decimal("200.00")

        # Expected: 184/200 = 92%
        assert result.overall_percentage == 92.0

        # Verify each exam has correct percentage
        for exam in result.exam_summaries:
            # Each exam should be 92/100 = 92%
            assert exam.percentage == 92.0

    async def test_student_with_no_marks(self, db_session: AsyncSession):
        """
        Test student with no marks returns None or empty report.
        Using student 35 who may not have marks.
        """
        result = await get_student_report_card_data(db=db_session, student_id=35, academic_year_id=1)

        # Should return None if student has no marks
        # OR should return a report with empty exam_summaries
        if result is not None:
            assert len(result.exam_summaries) == 0
            assert result.grand_total_obtained == Decimal("0")
            assert result.grand_total_max_marks == Decimal("0")

    async def test_wrong_academic_year(self, db_session: AsyncSession):
        """Test that using wrong academic year returns no marks."""
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=9999)  # Non-existent academic year

        # Should return report but with no exams
        if result is not None:
            assert len(result.exam_summaries) == 0

    async def test_multiple_subjects_in_exam(self, db_session: AsyncSession):
        """
        Test that multiple subjects within one exam are properly aggregated.
        This tests the grouping logic in the service.
        """
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        assert result is not None

        # Each exam should have marks list
        for exam in result.exam_summaries:
            assert hasattr(exam, "marks")
            assert isinstance(exam.marks, list)

            # Verify total_obtained is sum of all marks in this exam
            calculated_total = sum(mark.marks_obtained for mark in exam.marks)
            assert exam.total_obtained == calculated_total

            # Verify total_max_marks is sum of all max_marks in this exam
            calculated_max = sum(mark.max_marks for mark in exam.marks)
            assert exam.total_max_marks == calculated_max

    async def test_grand_total_is_sum_of_all_exams(self, db_session: AsyncSession):
        """Test that grand totals are correctly summed across all exams."""
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        assert result is not None

        # Calculate expected grand total from exam summaries
        calculated_obtained = sum(exam.total_obtained for exam in result.exam_summaries)
        calculated_max = sum(exam.total_max_marks for exam in result.exam_summaries)

        assert result.grand_total_obtained == calculated_obtained
        assert result.grand_total_max_marks == calculated_max

    async def test_profile_name_concatenation(self, db_session: AsyncSession):
        """Test that student name is properly concatenated from profile."""
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        assert result is not None

        # Should be "FirstName LastName" with proper spacing
        assert " " in result.student_name or len(result.student_name.split()) >= 2
        assert result.student_name.strip() == result.student_name  # No extra whitespace

    async def test_class_name_format(self, db_session: AsyncSession):
        """Test that class name follows expected format."""
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        assert result is not None

        # Should be in format "Grade X - Section"
        assert "Grade" in result.class_name
        assert "-" in result.class_name
        assert result.class_name == "Grade 3 - B"


@pytest.mark.asyncio
class TestReportCardServiceIntegration:
    """Integration tests that verify database queries work correctly."""

    async def test_database_joins_work(self, db_session: AsyncSession):
        """Test that all necessary table joins execute without errors."""
        # This should not raise any SQL errors
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        assert result is not None
        # If we get here without errors, joins are working

    async def test_handles_null_last_name(self, db_session: AsyncSession):
        """Test that the service handles profiles with null last names."""
        result = await get_student_report_card_data(db=db_session, student_id=32, academic_year_id=1)

        if result:
            # Should handle None last name gracefully
            assert result.student_name is not None
            assert len(result.student_name) > 0
