import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export const usePatients = (page = 1, search = '') => {
  return useQuery({
    queryKey: ['patients', page, search],
    queryFn: async () => {
      const res = await api.get(`/patients?page=${page}&limit=10&search=${search}`);
      return res.data;
    },
    keepPreviousData: true,
  });
};

export const usePatient = (id) => {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const res = await api.get(`/patients/${id}`);
      return { ...res.data.data, recentScans: res.data.recentScans };
    },
    enabled: !!id,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData) => {
      const res = await api.post('/patients', formData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await api.put(`/patients/${id}`, formData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['patient', variables.id] });
      }
    },
  });
};
