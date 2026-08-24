import { useState } from 'react';
import { Link } from 'react-router-dom';
import BodyPartIcon from '../components/common/BodyPartIcon';
import { useReports, useDeleteReport } from '../hooks/api/useReports';
import toast from 'react-hot-toast';
import { FileText, Search, ExternalLink, Clock, FileCheck, Trash2, CheckCircle, Eye, Download } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ReportsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const { data: reportsData, isLoading: loading } = useReports(page, searchTerm);
  const deleteReportMutation = useDeleteReport();

  const reports = reportsData?.data || [];
  const totalPages = reportsData?.pages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    try {
      await deleteReportMutation.mutateAsync(reportToDelete);
      toast.success('Report deleted successfully');
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to delete report');
    } finally {
      setReportToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Diagnostic Reports</h1>
          <p className="text-sm text-[var(--text-secondary)]">Review AI-generated and finalized reports</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 flex gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search by patient name, condition..."
            className="input-field pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="animate-pulse text-white">Loading...</div>
      ) : (
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Patient</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Impression</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Generated</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-[var(--text-muted)]">No reports found</td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {report.patient ? `${report.patient.firstName} ${report.patient.lastName}` : 'Unknown'}
                      </div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {report.scan ? `${report.scan.imageType.toUpperCase()} - ${report.scan.bodyPart}` : ''}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-[var(--text-primary)] max-w-md truncate">
                        {report.structuredFindings?.impression || 'No impression recorded'}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-[var(--text-secondary)]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {report.status === 'finalized' 
                        ? <span className="badge badge-success flex items-center gap-1 w-max"><CheckCircle size={12}/> Finalized</span>
                        : <span className="badge badge-warning flex items-center gap-1 w-max"><Clock size={12}/> Needs Review</span>
                      }
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Link to={`/scans/${report.scan?._id || report.scan}`} className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg text-blue-400 inline-block transition-colors" title="View Details">
                        <Eye size={18} />
                      </Link>
                      {report.pdfPath && (
                        <a 
                          href={report.pdfPath.startsWith('http') ? report.pdfPath : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${report.pdfPath}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg text-purple-400 inline-block transition-colors"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </a>
                      )}
                      <button 
                        onClick={() => {
                          setReportToDelete(report._id);
                          setIsModalOpen(true);
                        }} 
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 inline-block transition-colors" 
                        title="Delete Report"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination page={page} pages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setReportToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This will also delete the generated PDF file. This action cannot be undone."
      />
    </div>
  );
};

export default ReportsPage;
