import { useQuery } from "@tanstack/react-query";
import { getReportCard, downloadReportCardPDF } from "./reportcard.api";

export function useReportCard(exam_id: number) {
  return useQuery({
    queryKey: ["report_card", exam_id],
    queryFn: () => getReportCard(exam_id),
    enabled: !!exam_id,
  });
}

export function useReportCardPDF(exam_id: number) {
  return useQuery({
    queryKey: ["report_card_pdf", exam_id],
    queryFn: () => downloadReportCardPDF(exam_id),
    enabled: !!exam_id,
  });
}
