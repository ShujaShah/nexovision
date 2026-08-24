import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export const useScans = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['scans', page, search],
    queryFn: async () => {
      const res = await api.get(`/scans?page=${page}&limit=10&search=${search}`);
      return res.data;
    },
    keepPreviousData: true,
  });
};

export const useScan = (id, options = {}) => {
  return useQuery({
    queryKey: ['scan', id],
    queryFn: async () => {
      const res = await api.get(`/scans/${id}`);
      return res.data.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useDeleteScan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/scans/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
};

export const useUploadScan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/scans/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
};

export const useAnalyzeScan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['scan', id] });
      const previousScan = queryClient.getQueryData(['scan', id]);
      queryClient.setQueryData(['scan', id], old => old ? { ...old, status: 'analyzing' } : old);
      return { previousScan };
    },
    onError: (err, id, context) => {
      if (context?.previousScan) {
        queryClient.setQueryData(['scan', id], context.previousScan);
      }
    },
    mutationFn: async (id) => {
      const res = await api.post(`/scans/${id}/analyze`);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['scan', variables] });
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
