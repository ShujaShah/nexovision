import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export const useClinic = () => {
  return useQuery({
    queryKey: ['clinic', 'me'],
    queryFn: async () => {
      const res = await api.get('/clinics/me');
      return res.data.data;
    },
  });
};

export const useUpdateClinic = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clinicData) => {
      const res = await api.put('/clinics/me', clinicData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic', 'me'] });
    },
  });
};

export const useDoctors = () => {
  return useQuery({
    queryKey: ['clinic', 'doctors'],
    queryFn: async () => {
      const res = await api.get('/clinics/doctors');
      return res.data.data;
    },
  });
};

export const useAddDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doctorData) => {
      const res = await api.post('/clinics/doctors', doctorData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic', 'doctors'] });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await api.put(`/clinics/doctors/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic', 'doctors'] });
    },
  });
};

export const useDeleteDoctor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/clinics/doctors/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinic', 'doctors'] });
    },
  });
};
