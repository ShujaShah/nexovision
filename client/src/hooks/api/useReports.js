import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export const useReports = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['reports', page, search],
    queryFn: async () => {
      const res = await api.get(`/reports?page=${page}&limit=10&search=${search}`);
      return res.data;
    },
    keepPreviousData: true,
  });
};

// Assuming there's an endpoint to get reports for a specific scan.
// In the current implementation, it fetches all reports. 
// We will follow the existing logic where they filtered client-side if needed.
export const useReportsAll = () => {
  return useQuery({
    queryKey: ['reports', 'all'],
    queryFn: async () => {
      const res = await api.get('/reports');
      return res.data.data; // Assumes structure { success: true, data: [...] }
    }
  });
};

export const useReport = (id) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const res = await api.get(`/reports/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/reports/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useReviewReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, doctorNotes }) => {
      const res = await api.put(`/reports/${id}/review`, { doctorNotes });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useFinalizeReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.put(`/reports/${id}/finalize`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
