import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ScanViewer from '../components/scans/ScanViewer';
import FindingsPanel from '../components/reports/FindingsPanel';
import toast from 'react-hot-toast';
import { BrainCircuit, FileCheck, FileWarning, ArrowLeft, Loader2, Save } from 'lucide-react';

const ScanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [scan, setScan] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let pollingInterval;

    const fetchData = async () => {
      try {
        const scanRes = await api.get(`/scans/${id}`);
        setScan(scanRes.data.data);

        // If scan is completed, try to fetch its report
        if (scanRes.data.data.status === 'completed') {
          const reportsRes = await api.get('/reports'); // Should ideally have a /reports/scan/:scanId endpoint, but filtering client side for MVP
          const matchedReport = reportsRes.data.data.find(r => r.scan._id === id || r.scan === id);
          if (matchedReport) {
            // Fetch full report details
            const reportDetail = await api.get(`/reports/${matchedReport._id}`);
            setReport(reportDetail.data.data);
            setDoctorNotes(reportDetail.data.data.doctorNotes || '');
          }
        }
      } catch (err) {
        toast.error('Failed to load scan details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup polling if status is 'analyzing'
    if (scan?.status === 'analyzing') {
      pollingInterval = setInterval(fetchData, 5000); // Poll every 5s
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [id, scan?.status]);

  const handleSaveNotes = async () => {
    if (!report) return;
    try {
      setIsSaving(true);
      await api.put(`/reports/${report._id}/review`, { doctorNotes });
      toast.success('Notes saved successfully');
    } catch (err) {
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!scan) return;
    try {
      setScan(prev => ({ ...prev, status: 'analyzing' }));
      toast.loading('Initializing MedGemma Analysis...', { id: 'analysis' });
      await api.post(`/scans/${scan._id}/analyze`);
      toast.success('Analysis started', { id: 'analysis' });
      // The polling in useEffect will now take over
    } catch (err) {
      toast.error('Failed to start analysis', { id: 'analysis' });
      setScan(prev => ({ ...prev, status: 'pending' }));
    }
  };

  const handleFinalize = async () => {
    if (!report) return;
    try {
      setIsSaving(true);
      await api.put(`/reports/${report._id}/finalize`);
      toast.success('Report finalized');
      setReport(prev => ({ ...prev, status: 'finalized' }));
    } catch (err) {
      toast.error('Failed to finalize report');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={32} />
      </div>
    );
  }

  if (!scan) return <div className="text-white">Scan not found</div>;

  const imageUrl = scan.filePath.startsWith('http') ? scan.filePath : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${scan.filePath}`;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg text-[var(--text-secondary)]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              {scan.patient.firstName} {scan.patient.lastName}'s {scan.bodyPart} Scan
              
              {scan.status === 'completed' && <span className="badge badge-success flex items-center gap-1"><FileCheck size={12}/> Analyzed</span>}
              {scan.status === 'analyzing' && <span className="badge badge-primary flex items-center gap-1"><BrainCircuit size={12} className="animate-pulse"/> Analyzing</span>}
              {scan.status === 'failed' && <span className="badge badge-danger flex items-center gap-1"><FileWarning size={12}/> Failed</span>}
              {scan.status === 'pending' && <span className="badge badge-warning">Pending</span>}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Uploaded on {new Date(scan.createdAt).toLocaleDateString()} by {scan.uploadedBy.name}
            </p>
          </div>
        </div>
        
        {report && (
          <div className="flex gap-3">
            {report.status !== 'finalized' && (
              <button 
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <Save size={16} /> Save Notes
              </button>
            )}
            
            {report.status !== 'finalized' ? (
              <button 
                onClick={handleFinalize}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <FileCheck size={16} /> Finalize Report
              </button>
            ) : (
              <a 
                href={report.pdfPath ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.pdfPath}` : '#'} 
                target="_blank" 
                rel="noreferrer"
                className="btn-primary flex items-center gap-2 text-sm bg-purple-600 hover:bg-purple-700 shadow-purple-900/20"
              >
                <FileCheck size={16} /> Download PDF Report
              </a>
            )}
          </div>
        )}
      </div>

      {/* Main Content Split */}
      <div className="flex gap-6 h-full min-h-0">
        
        {/* Left Side - Viewer (60%) */}
        <div className="w-3/5 flex flex-col h-full">
          <ScanViewer scanUrl={imageUrl} type={scan.imageType} />
        </div>

        {/* Right Side - Analysis Panel (40%) */}
        <div className="w-2/5 flex flex-col h-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)] bg-purple-900/10 flex items-center gap-2 text-purple-400 font-medium">
            <BrainCircuit size={18} />
            <h2>MedGemma 1.5 Analysis</h2>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            {scan.status === 'analyzing' ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <BrainCircuit className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-400" size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Analyzing Scan...</h3>
                <p className="text-[var(--text-secondary)] text-sm mb-6">
                  MedGemma is processing the image. This typically takes 30-60 seconds depending on hardware.
                </p>
                <div className="w-full bg-[var(--bg-primary)] h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full animate-[pulse_2s_ease-in-out_infinite] w-full origin-left"></div>
                </div>
              </div>
            ) : scan.status === 'pending' ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-[var(--text-secondary)] mb-4">This scan has not been analyzed yet.</p>
                <button onClick={handleStartAnalysis} className="btn-primary flex items-center gap-2">
                  <BrainCircuit size={16} /> Start AI Analysis
                </button>
              </div>
            ) : scan.status === 'failed' ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <FileWarning size={48} className="text-red-500 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Analysis Failed</h3>
                <p className="text-[var(--text-secondary)] text-sm">Make sure the Ollama server is running and MedGemma is installed.</p>
              </div>
            ) : report ? (
              <div className="flex flex-col h-full gap-4">
                <div className="flex-1 min-h-0">
                  <FindingsPanel report={report} />
                </div>
                
                {/* Doctor's Notes Section */}
                <div className="border-t border-[var(--border-color)] pt-4 mt-auto">
                  <label className="text-white font-semibold text-sm mb-2 block">Doctor's Clinical Addendum</label>
                  <textarea 
                    className="input-field min-h-[100px] text-sm resize-y"
                    placeholder="Add your clinical notes, corrections, or final conclusions here..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    disabled={report.status === 'finalized'}
                  ></textarea>
                  
                  {report.status !== 'finalized' && (
                    <div className="flex justify-end mt-3">
                      <button 
                        onClick={handleSaveNotes}
                        disabled={isSaving}
                        className="btn-secondary flex items-center gap-2 text-sm"
                      >
                        <Save size={16} /> Save Notes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScanDetailPage;
