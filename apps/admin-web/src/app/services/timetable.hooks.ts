import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTimetableGrid, getTimetableKPIs, createEntry, updateEntry, deleteEntry,
  swapEntries, checkConflict, generateTimetable, publishWeek
} from "./timetable.api";
import { TimetableUpsert } from "./timetable.schema";

export function useTimetableGrid(q: {
  academic_year_id: number; class_id: number; section: string; week_start: string;
}) {
  return useQuery({
    queryKey: ["timetable","grid", q],
    queryFn: () => getTimetableGrid(q),
    staleTime: 60_000,
  });
}

export function useTimetableKPIs(q: {
  academic_year_id: number; class_id: number; section: string; week_start: string;
}) {
  return useQuery({
    queryKey: ["timetable","kpis", q],
    queryFn: () => getTimetableKPIs(q),
    staleTime: 60_000,
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: TimetableUpsert) => createEntry(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable","grid"] });
      qc.invalidateQueries({ queryKey: ["timetable","kpis"] });
    },
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { id: number; patch: Partial<TimetableUpsert> }) =>
      updateEntry(args.id, args.patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable","grid"] });
      qc.invalidateQueries({ queryKey: ["timetable","kpis"] });
    },
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["timetable","grid"] });
      qc.invalidateQueries({ queryKey: ["timetable","kpis"] });
    },
  });
}

export const useSwapEntries = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: swapEntries,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timetable","grid"] }),
  });
};

export const useCheckConflict = () =>
  useMutation({ mutationFn: checkConflict });

export const useGenerateTimetable = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: generateTimetable,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timetable","grid"] }),
  });
};

export const usePublishWeek = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishWeek,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["timetable","grid"] }),
  });
};
