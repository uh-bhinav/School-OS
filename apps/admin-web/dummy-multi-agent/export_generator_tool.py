"""
Export Generator Tool
======================
CSV and Excel export generation for SchoolOS finance and data queries.

Supports:
  - CSV export for any tabular data
  - Excel (XLSX) export with formatting
  - Auto-naming based on query type
  - Timestamped filenames to avoid collisions
"""

import csv
import io
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# ============================================================================
# EXPORT DIRECTORY
# ============================================================================

EXPORTS_DIR = Path(__file__).parent / "generated_exports"
EXPORTS_DIR.mkdir(exist_ok=True)


# ============================================================================
# CSV EXPORT
# ============================================================================


def generate_csv_export(
    data: List[Dict[str, Any]],
    export_type: str,
    filename: Optional[str] = None,
    columns: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Generate a CSV export from query results.

    Args:
        data: List of row dictionaries
        export_type: Type label (e.g. "unpaid_invoices", "attendance_summary")
        filename: Optional custom filename (without extension)
        columns: Optional column ordering. If None, uses keys from first row.

    Returns:
        {
            "status": "success" | "error",
            "file_path": "exports/unpaid_invoices_2026-02-17.csv",
            "file_name": "unpaid_invoices_2026-02-17.csv",
            "row_count": 25,
            "column_count": 8,
            "download_ready": True,
            "export_type": "csv",
            "message": "CSV export with 25 rows"
        }
    """
    if not data:
        return {
            "status": "error",
            "message": "No data to export",
            "download_ready": False,
        }

    try:
        # Determine columns
        if columns is None:
            columns = list(data[0].keys())

        # Generate filename
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        if filename:
            safe_name = _sanitize_filename(filename)
        else:
            safe_name = f"{export_type}_{timestamp}"

        if not safe_name.endswith(".csv"):
            safe_name += ".csv"

        file_path = EXPORTS_DIR / safe_name

        # Write CSV
        with open(file_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=columns, extrasaction="ignore")
            writer.writeheader()
            for row in data:
                writer.writerow(row)

        file_size = file_path.stat().st_size

        logger.info(
            f"CSV export generated: {safe_name} | "
            f"rows={len(data)} | cols={len(columns)} | size={file_size}"
        )

        return {
            "status": "success",
            "file_path": str(file_path),
            "file_name": safe_name,
            "row_count": len(data),
            "column_count": len(columns),
            "file_size": file_size,
            "download_ready": True,
            "export_type": "csv",
            "message": f"CSV export with {len(data)} rows",
        }

    except Exception as e:
        logger.exception(f"CSV export error: {e}")
        return {
            "status": "error",
            "message": f"Failed to generate CSV: {str(e)}",
            "download_ready": False,
        }


# ============================================================================
# EXCEL EXPORT (XLSX)
# ============================================================================


def generate_excel_export(
    data: List[Dict[str, Any]],
    export_type: str,
    filename: Optional[str] = None,
    columns: Optional[List[str]] = None,
    sheet_name: str = "Data",
) -> Dict[str, Any]:
    """
    Generate an Excel export from query results.

    Uses openpyxl if available, otherwise falls back to CSV.

    Args:
        data: List of row dictionaries
        export_type: Type label
        filename: Optional custom filename
        columns: Optional column ordering
        sheet_name: Excel sheet name (default "Data")

    Returns:
        Same structure as generate_csv_export.
    """
    try:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment
    except ImportError:
        logger.warning("openpyxl not installed, falling back to CSV export")
        return generate_csv_export(data, export_type, filename, columns)

    if not data:
        return {
            "status": "error",
            "message": "No data to export",
            "download_ready": False,
        }

    try:
        if columns is None:
            columns = list(data[0].keys())

        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        if filename:
            safe_name = _sanitize_filename(filename)
        else:
            safe_name = f"{export_type}_{timestamp}"

        if not safe_name.endswith(".xlsx"):
            safe_name = safe_name.replace(".csv", "") + ".xlsx"

        file_path = EXPORTS_DIR / safe_name

        # Create workbook
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = sheet_name

        # Header styling
        header_font = Font(bold=True, color="FFFFFF")
        header_fill = PatternFill(
            start_color="0B5F5A", end_color="0B5F5A", fill_type="solid"
        )
        header_align = Alignment(horizontal="center")

        # Write headers
        for col_idx, col_name in enumerate(columns, 1):
            cell = ws.cell(
                row=1, column=col_idx, value=col_name.replace("_", " ").title()
            )
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = header_align

        # Write data rows
        for row_idx, row_data in enumerate(data, 2):
            for col_idx, col_name in enumerate(columns, 1):
                value = row_data.get(col_name, "")
                ws.cell(row=row_idx, column=col_idx, value=value)

        # Auto-size columns
        for col_idx, col_name in enumerate(columns, 1):
            max_length = len(col_name)
            for row_data in data[:50]:  # Sample first 50 rows
                cell_val = str(row_data.get(col_name, ""))
                max_length = max(max_length, len(cell_val))
            adjusted_width = min(max_length + 4, 40)
            ws.column_dimensions[
                openpyxl.utils.get_column_letter(col_idx)
            ].width = adjusted_width

        wb.save(str(file_path))
        file_size = file_path.stat().st_size

        logger.info(
            f"Excel export generated: {safe_name} | "
            f"rows={len(data)} | cols={len(columns)} | size={file_size}"
        )

        return {
            "status": "success",
            "file_path": str(file_path),
            "file_name": safe_name,
            "row_count": len(data),
            "column_count": len(columns),
            "file_size": file_size,
            "download_ready": True,
            "export_type": "xlsx",
            "message": f"Excel export with {len(data)} rows",
        }

    except Exception as e:
        logger.exception(f"Excel export error: {e}")
        return {
            "status": "error",
            "message": f"Failed to generate Excel: {str(e)}",
            "download_ready": False,
        }


# ============================================================================
# DATA EXTRACTION HELPERS
# ============================================================================


def parse_csv_data(csv_string: str) -> List[Dict[str, str]]:
    """
    Parse an inline CSV string into a list of dicts.

    Args:
        csv_string: Multi-line CSV with headers

    Returns:
        List of row dictionaries
    """
    reader = csv.DictReader(io.StringIO(csv_string.strip()))
    return [dict(row) for row in reader]


def filter_data(
    data: List[Dict[str, str]],
    filters: Dict[str, Any],
) -> List[Dict[str, str]]:
    """
    Apply simple key-value filters to data rows.

    Supports:
      - Exact match: {"status": "overdue"}
      - Greater-than: {"balance__gt": "0"}
      - Less-than: {"attendance_pct__lt": "75"}
      - Contains: {"class_name__contains": "Grade 5"}

    Args:
        data: List of row dicts
        filters: Filter conditions

    Returns:
        Filtered list of row dicts
    """
    results = []

    for row in data:
        match = True
        for key, expected in filters.items():
            if "__gt" in key:
                field = key.replace("__gt", "")
                try:
                    if float(row.get(field, 0)) <= float(expected):
                        match = False
                        break
                except (ValueError, TypeError):
                    match = False
                    break

            elif "__lt" in key:
                field = key.replace("__lt", "")
                try:
                    if float(row.get(field, 0)) >= float(expected):
                        match = False
                        break
                except (ValueError, TypeError):
                    match = False
                    break

            elif "__contains" in key:
                field = key.replace("__contains", "")
                if expected.lower() not in row.get(field, "").lower():
                    match = False
                    break

            else:
                if row.get(key, "").lower() != str(expected).lower():
                    match = False
                    break

        if match:
            results.append(row)

    return results


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================


def export_unpaid_invoices(
    fees_csv: str,
    class_filter: Optional[str] = None,
    format: str = "csv",
) -> Dict[str, Any]:
    """
    Export unpaid/overdue invoices as CSV or Excel.

    Args:
        fees_csv: Raw fees CSV data string
        class_filter: Optional class name filter (e.g. "Grade 5")
        format: "csv" or "xlsx"

    Returns:
        Export result dict.
    """
    data = parse_csv_data(fees_csv)

    # Filter for unpaid
    unpaid = [
        row
        for row in data
        if row.get("status", "").lower() in ("overdue", "pending", "partial")
    ]

    # Apply class filter
    if class_filter:
        unpaid = [
            row
            for row in unpaid
            if class_filter.lower() in row.get("class_name", "").lower()
        ]

    # Select columns for export
    columns = [
        "invoice_no",
        "student_name",
        "class_name",
        "fee_type",
        "amount",
        "paid",
        "balance",
        "status",
        "due_date",
    ]

    label = "unpaid_invoices"
    if class_filter:
        label += f"_{class_filter.replace(' ', '_').lower()}"

    if format == "xlsx":
        return generate_excel_export(
            unpaid, label, columns=columns, sheet_name="Unpaid Invoices"
        )
    return generate_csv_export(unpaid, label, columns=columns)


def export_attendance_data(
    attendance_csv: str,
    status_filter: Optional[str] = None,
    format: str = "csv",
) -> Dict[str, Any]:
    """Export attendance data as CSV or Excel."""
    data = parse_csv_data(attendance_csv)

    if status_filter:
        data = [
            row
            for row in data
            if row.get("status", "").lower() == status_filter.lower()
        ]

    columns = [
        "student_name",
        "class_name",
        "section",
        "date",
        "status",
        "attendance_pct",
        "mail_id",
    ]

    label = f"attendance_{status_filter or 'all'}"

    if format == "xlsx":
        return generate_excel_export(
            data, label, columns=columns, sheet_name="Attendance"
        )
    return generate_csv_export(data, label, columns=columns)


def export_marks_data(
    marks_csv: str,
    grade_filter: Optional[str] = None,
    format: str = "csv",
) -> Dict[str, Any]:
    """Export marks data as CSV or Excel."""
    data = parse_csv_data(marks_csv)

    if grade_filter:
        data = [
            row for row in data if row.get("grade", "").upper() == grade_filter.upper()
        ]

    columns = [
        "student_name",
        "class_name",
        "subject",
        "exam",
        "max_marks",
        "obtained",
        "grade",
        "percentage",
    ]

    label = f"marks_{grade_filter or 'all'}"

    if format == "xlsx":
        return generate_excel_export(data, label, columns=columns, sheet_name="Marks")
    return generate_csv_export(data, label, columns=columns)


# ============================================================================
# LIST GENERATED EXPORTS
# ============================================================================


def list_exports(limit: int = 50) -> List[Dict[str, Any]]:
    """List available export files."""
    if not EXPORTS_DIR.exists():
        return []

    exports = []
    for ext in ("*.csv", "*.xlsx"):
        for f in EXPORTS_DIR.glob(ext):
            stat = f.stat()
            exports.append(
                {
                    "file_name": f.name,
                    "file_size": stat.st_size,
                    "created": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "export_type": f.suffix.lstrip("."),
                }
            )

    exports.sort(key=lambda x: x["created"], reverse=True)
    return exports[:limit]


# ============================================================================
# FILENAME SANITIZATION
# ============================================================================


def _sanitize_filename(name: str) -> str:
    """Remove unsafe characters from a filename."""
    import re

    safe = re.sub(r"[^\w\s\-\.]", "", name)
    safe = re.sub(r"\s+", "_", safe)
    return safe.strip("_.")
