import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { FileImage, BrainCircuit, FileWarning, Search, Eye, Trash2 } from 'lucide-react';
import Pagination from '../components/common/Pagination';
import BodyPartIcon from '../components/common/BodyPartIcon';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ScansPage = () => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState(null);

  const fetchScans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/scans?page=${page}&limit=10&search=${searchTerm}`);
      setScans(res.data.data);
      setTotalPages(res.data.pages);
    } catch (err) {
      toast.error('Failed to fetch scans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
  }, [page, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!scanToDelete) return;
    try {
      await api.delete(`/scans/${scanToDelete}`);
      toast.success('Scan deleted successfully');
      fetchScans(); // Refresh list
    } catch (err) {
      toast.error('Failed to delete scan');
    } finally {
      setScanToDelete(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return <span className="badge badge-success">Analyzed</span>;
      case 'analyzing': return <span className="badge badge-primary flex items-center gap-1"><BrainCircuit size={12} className="animate-pulse"/> Analyzing</span>;
      case 'failed': return <span className="badge badge-danger flex items-center gap-1"><FileWarning size={12}/> Failed</span>;
      default: return <span className="badge badge-warning">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Medical Scans</h1>
          <p className="text-sm text-[var(--text-secondary)]">View and manage all patient imaging</p>
        </div>
        <Link to="/scans/upload" className="btn-primary flex items-center gap-2">
          <FileImage size={18} /> Upload New Scan
        </Link>
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
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Modality</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Body Part</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Date</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)]">Status</th>
                <th className="p-4 text-sm font-semibold text-[var(--text-secondary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {scans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-[var(--text-muted)]">No scans found</td>
                </tr>
              ) : (
                scans.map(scan => (
                  <tr key={scan._id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/30 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {scan.patient ? `${scan.patient.firstName} ${scan.patient.lastName}` : 'Unknown Patient'}
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]">{scan.imageType}</td>
                    <td className="p-4 text-[var(--text-primary)] capitalize">
                      <div className="flex items-center gap-2">
                        <BodyPartIcon bodyPart={scan.bodyPart} className="text-[var(--text-secondary)]" />
                        {scan.bodyPart}
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)]">
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(scan.status)}
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <Link to={`/scans/${scan._id}`} className="p-2 hover:bg-[var(--bg-elevated)] rounded-lg text-blue-400 inline-block transition-colors" title="View Scan">
                        <Eye size={18} />
                      </Link>
                      <button 
                        onClick={() => {
                          setScanToDelete(scan._id);
                          setIsModalOpen(true);
                        }} 
                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 inline-block transition-colors" 
                        title="Delete Scan"
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
          setScanToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Scan"
        message="Are you sure you want to delete this scan? This will also delete the physical file and its AI report. This action cannot be undone."
      />
    </div>
  );
};

export default ScansPage;
