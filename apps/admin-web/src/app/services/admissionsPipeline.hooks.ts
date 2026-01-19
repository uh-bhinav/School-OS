import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockAdmissionsPipelineProvider } from '../mockDataProviders/mockAdmissionsPipeline';
import type { AdmissionLead, PaymentRecord } from '../types/admissions.types';

const QUERY_KEYS = {
  leads: ['admissions', 'pipeline', 'leads'],
  lead: (id: string) => ['admissions', 'pipeline', 'lead', id],
  timeline: (id: string) => ['admissions', 'pipeline', 'timeline', id],
  documents: (id: string) => ['admissions', 'pipeline', 'documents', id],
};

export function usePipelineLeads() {
  return useQuery({
    queryKey: QUERY_KEYS.leads,
    queryFn: () => mockAdmissionsPipelineProvider.getLeads(),
  });
}

export function usePipelineLead(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.lead(id),
    queryFn: () => mockAdmissionsPipelineProvider.getLead(id),
    enabled: !!id,
  });
}

export function useLeadTimeline(leadId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.timeline(leadId),
    queryFn: () => mockAdmissionsPipelineProvider.getLeadTimeline(leadId),
    enabled: !!leadId,
  });
}

export function useLeadDocuments(leadId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.documents(leadId),
    queryFn: () => mockAdmissionsPipelineProvider.getLeadDocuments(leadId),
    enabled: !!leadId,
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ leadId, status }: { leadId: string; status: AdmissionLead['status'] }) =>
      Promise.resolve(mockAdmissionsPipelineProvider.updateLeadStatus(leadId, status)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<PaymentRecord, 'id' | 'created_at'>) =>
      Promise.resolve(mockAdmissionsPipelineProvider.recordPayment(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
    },
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<AdmissionLead>) =>
      Promise.resolve(mockAdmissionsPipelineProvider.createLead(data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leads });
    },
  });
}
