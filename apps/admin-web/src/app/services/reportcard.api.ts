import { http } from "./http";
import { ReportCard } from "./exams.schema";

const BASE = "/api/v1/report_cards";
const PDF = "/api/v1/pdf/report_card";

export async function getReportCard(exam_id: number) {
  const { data } = await http.get<ReportCard>(`${BASE}/${exam_id}`);
  return data;
}

export async function downloadReportCardPDF(exam_id: number) {
  const { data } = await http.get(`${PDF}/${exam_id}`, { responseType: "blob" });
  return data;
}
