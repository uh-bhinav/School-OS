import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as communicationApi from './communication.api';

export function useCallLogs() {
  return useQuery({
    queryKey: ['call-logs'],
    queryFn: communicationApi.getCallLogs,
    staleTime: 30000,
  });
}

export function useTodaySentiment() {
  return useQuery({
    queryKey: ['today-sentiment'],
    queryFn: communicationApi.getTodaySentiment,
    staleTime: 60000,
  });
}

export function useLogCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.logCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-logs'] });
      queryClient.invalidateQueries({ queryKey: ['today-sentiment'] });
    },
  });
}

export function useSendBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: communicationApi.sendBroadcast,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcasts'] });
    },
  });
}

export function useBroadcasts() {
  return useQuery({
    queryKey: ['broadcasts'],
    queryFn: communicationApi.getBroadcasts,
    staleTime: 30000,
  });
}
