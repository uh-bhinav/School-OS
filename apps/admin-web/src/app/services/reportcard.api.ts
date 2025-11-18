import { http } from "./http";
import { ReportCard } from "./reportcard.schema";

const BASE = "/report-card"; // Backend uses /api/v1/report-card

/**
 * Get report card for a student
 * Backend endpoint: GET /api/v1/report-card/student/{student_id}?academic_year_id={year_id}
 */
export async function getReportCard(student_id: number, academic_year_id: number) {
  const { data } = await http.get<ReportCard>(`${BASE}/student/${student_id}`, {
    params: { academic_year_id }
  });
  return data;
}

/**
 * Download report card PDF for a student
 * Backend endpoint: GET /api/v1/report-card/student/{student_id}/pdf?academic_year_id={year_id}
 */
export async function downloadReportCardPDF(student_id: number, academic_year_id: number) {
  const { data } = await http.get(`${BASE}/student/${student_id}/pdf`, {
    params: { academic_year_id },
    responseType: "blob"
  });
  return data;
}

/**
 * Get report cards for an entire class
 * Backend endpoint: GET /api/v1/report-card/class/{class_id}?academic_year_id={year_id}
 */
export async function getClassReportCards(class_id: number, academic_year_id: number) {
  const { data } = await http.get<ReportCard[]>(`${BASE}/class/${class_id}`, {
    params: { academic_year_id }
  });
  return data;
}
