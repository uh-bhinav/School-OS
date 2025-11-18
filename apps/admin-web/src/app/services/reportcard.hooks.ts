import { useQuery } from "@tanstack/react-query";
import { getReportCard, downloadReportCardPDF, getClassReportCards } from "./reportcard.api";

/**
 * Hook to fetch a student's report card
 */
export function useReportCard(student_id: number, academic_year_id: number) {
  return useQuery({
    queryKey: ["report_card", student_id, academic_year_id],
    queryFn: () => getReportCard(student_id, academic_year_id),
    enabled: !!student_id && !!academic_year_id,
  });
}

/**
 * Hook to download a student's report card as PDF
 */
export function useReportCardPDF(student_id: number, academic_year_id: number) {
  return useQuery({
    queryKey: ["report_card_pdf", student_id, academic_year_id],
    queryFn: () => downloadReportCardPDF(student_id, academic_year_id),
    enabled: !!student_id && !!academic_year_id,
  });
}

/**
 * Hook to fetch report cards for an entire class
 */
export function useClassReportCards(class_id: number, academic_year_id: number) {
  return useQuery({
    queryKey: ["class_report_cards", class_id, academic_year_id],
    queryFn: () => getClassReportCards(class_id, academic_year_id),
    enabled: !!class_id && !!academic_year_id,
  });
}
