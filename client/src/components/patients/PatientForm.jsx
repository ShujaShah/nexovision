import { useState, useEffect } from 'react';
import { useCreatePatient, useUpdatePatient } from '../../hooks/api/usePatients';
import toast from 'react-hot-toast';
import { UserPlus, UserCheck, X } from 'lucide-react';

const PatientForm = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    contactInfo: { phone: '', email: '', address: '' },
    medicalHistory: [{ condition: '', notes: '' }],
    allergies: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        dateOfBirth: initialData.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        allergies: Array.isArray(initialData.allergies) ? initialData.allergies.join(', ') : '',
        medicalHistory: initialData.medicalHistory?.length ? initialData.medicalHistory : [{ condition: '', notes: '' }],
      });
    }
  }, [initialData]);

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const isEditing = !!initialData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
        medicalHistory: formData.medicalHistory.filter(h => h.condition.trim() !== '')
      };
      
      let res;
      if (isEditing) {
        res = await updatePatientMutation.mutateAsync({ id: initialData._id, formData: payload });
        toast.success('Patient updated successfully');
      } else {
        res = await createPatientMutation.mutateAsync(payload);
        toast.success('Patient added successfully');
      }
      onSave(res.data);
      onClose();
    } catch (err) {
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} patient`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-color)] bg-[var(--bg-elevated)] shrink-0">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {isEditing ? (
              <><UserCheck size={20} className="text-[var(--accent-primary)]" /> Edit Patient</>
            ) : (
              <><UserPlus size={20} className="text-[var(--accent-primary)]" /> Add New Patient</>
            )}
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--text-secondary)] hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="patient-form" onSubmit={handleSubmit}>
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

            <h3 className="text-white font-medium mb-3 mt-6 border-b border-[var(--border-color)] pb-2">Medical History & Allergies</h3>
            <div className="grid grid-cols-1 gap-5 mb-5">
              <div>
                <label className="label-text">Allergies (comma separated)</label>
                <input type="text" className="input-field" placeholder="e.g. Penicillin, Peanuts"
                  value={formData.allergies} onChange={e => setFormData({...formData, allergies: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="label-text">Primary Condition (Optional)</label>
                  <input type="text" className="input-field" placeholder="e.g. Hypertension"
                    value={formData.medicalHistory[0].condition} 
                    onChange={e => {
                      const newHistory = [...formData.medicalHistory];
                      newHistory[0].condition = e.target.value;
                      setFormData({...formData, medicalHistory: newHistory});
                    }}
                  />
                </div>
                <div>
                  <label className="label-text">Condition Notes</label>
                  <input type="text" className="input-field" placeholder="Any relevant details"
                    value={formData.medicalHistory[0].notes} 
                    onChange={e => {
                      const newHistory = [...formData.medicalHistory];
                      newHistory[0].notes = e.target.value;
                      setFormData({...formData, medicalHistory: newHistory});
                    }}
                  />
                </div>
              </div>
            </div>

            <h3 className="text-white font-medium mb-3 mt-6 border-b border-[var(--border-color)] pb-2">Contact Information</h3>
            <div className="grid grid-cols-2 gap-5 mb-6">
              <div>
                <label className="label-text">Phone Number</label>
                <input type="tel" required className="input-field"
                  value={formData.contactInfo?.phone || ''} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, phone: e.target.value}})}
                />
              </div>
              <div>
                <label className="label-text">Email Address (Optional)</label>
                <input type="email" className="input-field"
                  value={formData.contactInfo?.email || ''} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, email: e.target.value}})}
                />
              </div>
              <div className="col-span-2">
                <label className="label-text">Home Address</label>
                <input type="text" className="input-field"
                  value={formData.contactInfo?.address || ''} onChange={e => setFormData({...formData, contactInfo: {...formData.contactInfo, address: e.target.value}})}
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-5 border-t border-[var(--border-color)] bg-[var(--bg-elevated)] shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" form="patient-form" className="btn-primary">
            {isEditing ? 'Save Changes' : 'Save Patient'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
