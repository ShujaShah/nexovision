import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Search, ExternalLink, Clock, FileCheck, Trash2 } from 'lucide-react';
import Pagination from '../components/common/Pagination';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports?page=${page}&limit=10&search=${searchTerm}`);
      setReports(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [page, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report? This will also delete the generated PDF file.')) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success('Report deleted successfully');
      fetchReports(); // Refresh list
    } catch (err) {
      toast.error('Failed to delete report');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'finalized': return <span className="badge badge-success flex items-center gap-1"><FileCheck size={12}/> Finalized</span>;
      case 'reviewed': return <span className="badge badge-primary flex items-center gap-1"><FileText size={12}/> Reviewed</span>;
      default: return <span className="badge badge-warning flex items-center gap-1"><Clock size={12}/> Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">AI Diagnostics Reports</h1>
          <p className="text-sm text-[var(--text-secondary)]">View and manage all MedGemma generated reports</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 flex gap-4">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Search by patient name, body part, etc..."
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
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Scan Modality</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Date Generated</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Doctor</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">No reports found</td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {report.patient ? `${report.patient.firstName} ${report.patient.lastName}` : 'Unknown Patient'}
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {report.scan ? `${report.scan.imageType} - ${report.scan.bodyPart}` : 'Unknown Scan'}
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">
                      {report.generatedBy?.name || 'Unknown'}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Link to={`/scans/${report.scan?._id || report.scan}`} className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg text-blue-400 inline-block transition-colors" title="View Full Scan Details">
                        <ExternalLink size={18} />
                      </Link>
                      <button onClick={() => handleDelete(report._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 inline-block transition-colors" title="Delete Report">
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
    </div>
  );
};

export default ReportsPage;
