import { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Building2, Mail, Phone, MapPin, UserPlus, Save, Loader2, Users, Edit2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ClinicSettingsPage = () => {
  const { user } = useContext(AuthContext);
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New doctor form state
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    licenseNumber: ''
  });

  // Edit doctor form state
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editDoctorData, setEditDoctorData] = useState({});

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  const fetchData = async () => {
    try {
      const [clinicRes, doctorsRes] = await Promise.all([
        api.get('/clinics/me'),
        api.get('/clinics/doctors')
      ]);
      setClinic(clinicRes.data.data);
      setDoctors(doctorsRes.data.data);
    } catch (err) {
      toast.error('Failed to load clinic data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClinicChange = (e) => {
    setClinic({ ...clinic, [e.target.name]: e.target.value });
  };

  const handleSaveClinic = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/clinics/me', clinic);
      toast.success('Clinic profile updated');
    } catch (err) {
      toast.error('Failed to update clinic');
    } finally {
      setSaving(false);
    }
  };

  const handleNewDoctorChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.post('/clinics/doctors', newDoctor);
      toast.success('Doctor added successfully');
      setIsAddingDoctor(false);
      setNewDoctor({ name: '', email: '', password: '', specialization: '', licenseNumber: '' });
      fetchData(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (doc) => {
    setEditingDoctorId(doc._id);
    setEditDoctorData({
      name: doc.name,
      email: doc.email,
      specialization: doc.specialization || '',
      licenseNumber: doc.licenseNumber || '',
      password: '' // empty so they can leave it blank
    });
  };

  const cancelEditing = () => {
    setEditingDoctorId(null);
    setEditDoctorData({});
  };

  const handleEditDoctorChange = (e) => {
    setEditDoctorData({ ...editDoctorData, [e.target.name]: e.target.value });
  };

  const handleUpdateDoctor = async (e, id) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...editDoctorData };
      if (!payload.password) delete payload.password; // Don't send empty password

      await api.put(`/clinics/doctors/${id}`, payload);
      toast.success('Doctor updated successfully');
      setEditingDoctorId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update doctor');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteDoctor = async () => {
    if (!doctorToDelete) return;
    try {
      setSaving(true);
      await api.delete(`/clinics/doctors/${doctorToDelete}`);
      toast.success('Doctor removed');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    } finally {
      setSaving(false);
      setDoctorToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[var(--accent-primary)]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="mb-6">
        <h1 className="heading-1 mb-2">Clinic Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your clinic profile and roster of doctors.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Clinic Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 pb-4 border-b border-[var(--border-color)]">
              <Building2 size={20} className="text-[var(--accent-primary)]" />
              Clinic Profile
            </h2>
            
            <form onSubmit={handleSaveClinic} className="space-y-4">
              <div>
                <label className="label-text">Clinic Name</label>
                <input
                  type="text"
                  name="name"
                  value={clinic?.name || ''}
                  onChange={handleClinicChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="label-text">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="address"
                    value={clinic?.address || ''}
                    onChange={handleClinicChange}
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    name="contactEmail"
                    value={clinic?.contactEmail || ''}
                    onChange={handleClinicChange}
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    name="contactPhone"
                    value={clinic?.contactPhone || ''}
                    onChange={handleClinicChange}
                    className="input-field pl-9"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full flex items-center justify-center mt-4"
              >
                <Save size={16} className="mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Doctors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-blue-400" />
                Doctors
              </h2>
              <button 
                onClick={() => setIsAddingDoctor(!isAddingDoctor)}
                className="btn-secondary text-sm flex items-center gap-2"
              >
                <UserPlus size={16} />
                {isAddingDoctor ? 'Cancel' : 'Add New Doctor'}
              </button>
            </div>

            {isAddingDoctor && (
              <div className="bg-[var(--bg-primary)] p-5 rounded-lg border border-[var(--border-color)] mb-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-white mb-4">Add Doctor Account</h3>
                <form onSubmit={handleAddDoctor} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Full Name</label>
                    <input type="text" name="name" value={newDoctor.name} onChange={handleNewDoctorChange} className="input-field" required />
                  </div>
                  <div>
                    <label className="label-text">Email Address</label>
                    <input type="email" name="email" value={newDoctor.email} onChange={handleNewDoctorChange} className="input-field" required />
                  </div>
                  <div>
                    <label className="label-text">Specialization</label>
                    <input type="text" name="specialization" value={newDoctor.specialization} onChange={handleNewDoctorChange} className="input-field" required />
                  </div>
                  <div>
                    <label className="label-text">License Number</label>
                    <input type="text" name="licenseNumber" value={newDoctor.licenseNumber} onChange={handleNewDoctorChange} className="input-field" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-text">Temporary Password</label>
                    <input type="password" name="password" value={newDoctor.password} onChange={handleNewDoctorChange} className="input-field" minLength={6} required />
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Provide this password to the doctor so they can log in.</p>
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button type="submit" disabled={saving} className="btn-primary">
                      {saving ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-sm text-[var(--text-secondary)] uppercase">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Specialization</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor._id} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--bg-primary)] transition-colors">
                      {editingDoctorId === doctor._id ? (
                        <td colSpan="4" className="p-4 bg-[var(--bg-elevated)] animate-fade-in">
                          <form onSubmit={(e) => handleUpdateDoctor(e, doctor._id)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="label-text">Full Name</label>
                                <input type="text" name="name" value={editDoctorData.name} onChange={handleEditDoctorChange} className="input-field py-2" required />
                              </div>
                              <div>
                                <label className="label-text">Email</label>
                                <input type="email" name="email" value={editDoctorData.email} onChange={handleEditDoctorChange} className="input-field py-2" required />
                              </div>
                              <div>
                                <label className="label-text">Specialization</label>
                                <input type="text" name="specialization" value={editDoctorData.specialization} onChange={handleEditDoctorChange} className="input-field py-2" />
                              </div>
                              <div>
                                <label className="label-text">License Number</label>
                                <input type="text" name="licenseNumber" value={editDoctorData.licenseNumber} onChange={handleEditDoctorChange} className="input-field py-2" />
                              </div>
                              <div className="md:col-span-2">
                                <label className="label-text">New Password (leave blank to keep current)</label>
                                <input type="password" name="password" value={editDoctorData.password} onChange={handleEditDoctorChange} className="input-field py-2" minLength={6} />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={cancelEditing} className="btn-secondary py-2 px-4 text-sm" disabled={saving}>Cancel</button>
                              <button type="submit" className="btn-primary py-2 px-4 text-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                            </div>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-4">
                            <div className="font-medium text-white flex items-center gap-2">
                              {doctor.name}
                              {doctor.role === 'clinic_admin' && (
                                <span className="badge badge-primary text-[10px] px-1.5 py-0.5">Admin</span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--text-secondary)]">{doctor.licenseNumber || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">{doctor.email}</td>
                          <td className="py-3 px-4 text-sm text-white">{doctor.specialization || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => startEditing(doctor)}
                                className="p-1.5 text-gray-400 hover:text-[var(--accent-primary)] hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Edit Doctor"
                              >
                                <Edit2 size={16} />
                              </button>
                              {doctor._id !== user?._id && (
                                <button 
                                  onClick={() => {
                                    setDoctorToDelete(doctor._id);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Remove Doctor"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {doctors.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-[var(--text-secondary)]">
                        No doctors found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
          </div>
        </div>

      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setDoctorToDelete(null);
        }}
        onConfirm={confirmDeleteDoctor}
        title="Remove Doctor"
        message="Are you sure you want to remove this doctor from the clinic? They will lose access to the platform."
      />
    </div>
  );
};

export default ClinicSettingsPage;
