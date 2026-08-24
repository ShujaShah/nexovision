import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients, useCreatePatient } from '../hooks/api/usePatients';
import toast from 'react-hot-toast';
import { Users, Search, Plus, UserPlus, X, Calendar, Phone } from 'lucide-react';

import PatientForm from '../components/patients/PatientForm';
import Pagination from '../components/common/Pagination';

const PatientsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const { data: patientsData, isLoading: loading } = usePatients(page, searchTerm);

  const patients = patientsData?.data || [];
  const totalPages = patientsData?.pages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="heading-1 mb-1">Patient Management</h1>
          <p className="text-[var(--text-secondary)]">View and manage patient records and imaging history.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Patient
        </button>
      </div>

      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-6">
          <form onSubmit={handleSearch} className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              className="input-field pl-10" 
              placeholder="Search patients by name or phone..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="hidden">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-[var(--bg-secondary)] rounded-lg"></div>
            ))}
          </div>
        ) : patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                  <th className="py-3 px-4 font-medium">Patient Name</th>
                  <th className="py-3 px-4 font-medium">Age/DOB</th>
                  <th className="py-3 px-4 font-medium">Contact</th>
                  <th className="py-3 px-4 font-medium">Added By</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {patients.map(patient => (
                  <tr key={patient._id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                          {patient.firstName[0]}{patient.lastName[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-xs text-[var(--text-secondary)]">ID: {patient._id.substring(patient._id.length - 6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Calendar size={14} />
                        {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <Phone size={14} />
                        {patient.contactInfo?.phone}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[var(--text-secondary)]">
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">{patient.assignedDoctor?.name || 'Unknown'}</span>
                        <span className="text-xs">{new Date(patient.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link 
                        to={`/patients/${patient._id}`}
                        className="text-[var(--accent-primary)] hover:text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} pages={totalPages} onPageChange={setPage} />
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="mx-auto text-[var(--text-muted)] mb-4" size={48} />
            <h3 className="text-lg font-medium text-white mb-2">No patients found</h3>
            <p className="text-[var(--text-secondary)]">
              {searchTerm ? "No patients match your search criteria." : "Get started by adding your first patient."}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <PatientForm 
          onClose={() => setShowModal(false)} 
          onSave={() => {
            // Refetch is handled by query invalidation in the mutation
          }} 
        />
      )}
    </div>
  );
};

export default PatientsPage;
