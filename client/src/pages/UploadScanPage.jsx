import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ScanUpload from '../components/scans/ScanUpload';
import toast from 'react-hot-toast';

const UploadScanPage = () => {


  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async (formData) => {
    try {
      setUploading(true);
      toast.loading('Uploading scan...', { id: 'upload' });
      
      const res = await api.post('/scans/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Scan uploaded successfully!', { id: 'upload' });
      
      // Auto-trigger analysis (fire and forget)
      const scanId = res.data.data._id;
      
      api.post(`/scans/${scanId}/analyze`).catch(err => {
         console.error('Analysis trigger failed', err);
      });
      
      // We navigate to the scan detail page, where the analysis progress will be shown
      navigate(`/scans/${scanId}`);
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed', { id: 'upload' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      {uploading && (
        <div className="absolute inset-0 z-50 bg-[var(--bg-primary)]/50 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="glass-panel p-8 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-[var(--accent-primary)] rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">Processing Upload...</p>
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
