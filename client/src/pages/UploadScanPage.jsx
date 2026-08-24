import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUploadScan, useAnalyzeScan } from '../hooks/api/useScans';
import { useQueryClient } from '@tanstack/react-query';
import ScanUpload from '../components/scans/ScanUpload';
import toast from 'react-hot-toast';

const UploadScanPage = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const uploadScanMutation = useUploadScan();
  const analyzeScanMutation = useAnalyzeScan();

  const handleUpload = async (uploadData) => {
    try {
      setUploading(true);
      const { files, patientId, imageType, bodyPart, clinicalContext } = uploadData;
      
      setUploadProgress(`Uploading ${files.length} file${files.length !== 1 ? 's' : ''}...`);
      
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      formData.append('patientId', patientId);
      formData.append('imageType', imageType);
      formData.append('bodyPart', bodyPart);
      if (clinicalContext) {
        formData.append('clinicalContext', clinicalContext);
      }

      const res = await uploadScanMutation.mutateAsync(formData);
      
      toast.success('Study uploaded successfully!', { id: 'upload' });
      
      const scanId = res.data._id;
      
      // Optimistically seed the cache so the detail page knows it's analyzing!
      queryClient.setQueryData(['scan', scanId], { ...res.data, status: 'analyzing' });

      analyzeScanMutation.mutateAsync(scanId).catch(err => {
         console.error('Analysis trigger failed', err);
      });

      navigate(`/scans/${scanId}`);
      
    } catch (err) {
      toast.error('An unexpected error occurred during upload', { id: 'upload' });
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      {uploading && (
        <div className="absolute inset-0 z-50 bg-[var(--bg-primary)]/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="glass-panel p-8 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-[var(--accent-primary)] rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">{uploadProgress || 'Processing Upload...'}</p>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <h1 className="heading-1 mb-2">New Imaging Study</h1>
        <p className="text-[var(--text-secondary)]">Upload a new medical image for AI analysis.</p>
      </div>
      
      <ScanUpload onUpload={handleUpload} />
    </div>
  );
};

export default UploadScanPage;
