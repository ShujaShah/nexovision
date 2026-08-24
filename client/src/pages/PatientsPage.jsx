import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatients, useCreatePatient } from '../hooks/api/usePatients';
import toast from 'react-hot-toast';
import { Users, Search, Plus, UserPlus, X, Calendar, Phone } from 'lucide-react';

const PatientForm = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    contactInfo: { phone: '', email: '', address: '' },
  });

  const createPatientMutation = useCreatePatient();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createPatientMutation.mutateAsync(formData);
      toast.success('Patient added successfully');
      onSave(res.data);
      onClose();
    } catch (err) {
      toast.error('Failed to add patient');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserPlus size={20} className="text-[var(--accent-primary)]" />
            Add New Patient
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--text-secondary)] hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="label-text">First Name</label>
              <input type="text" required className="input-field"
                value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="label-text">Last Name</label>
              <input type="text" required className="input-field"
                value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <div>
              <label className="label-text">Date of Birth</label>
              <input type="date" required className="input-field"
                value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
              />
            </div>
            <div>
              <label className="label-text">Gender</label>
              <select required className="input-field"
                value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <h3 className="text-white font-medium mb-3 mt-6 border-b border-[var(--border-color)] pb-2">Contact Information</h3>
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <label className="label-text">Phone Number</label>
              <input type="tel" required className="input-field"
                value={formData.contactInfo.phone} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})}
              />
            </div>
            <div>
              <label className="label-text">Email Address (Optional)</label>
              <input type="email" className="input-field"
                value={formData.contactInfo.email} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, email: e.target.value}})}
              />
            </div>
            <div className="col-span-2">
              <label className="label-text">Home Address</label>
              <input type="text" className="input-field"
                value={formData.contactInfo.address} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, address: e.target.value}})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Patient</button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
