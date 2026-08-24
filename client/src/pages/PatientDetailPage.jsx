import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PatientForm from '../components/patients/PatientForm';
import { usePatient } from '../hooks/api/usePatients';
import toast from 'react-hot-toast';
import { Calendar, Phone, Mail, MapPin, Activity, FileText, UploadCloud, User, Clock, Image, ArrowLeft, Edit } from 'lucide-react';
import BodyPartIcon from '../components/common/BodyPartIcon';

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: patientData, isLoading: loading, error } = usePatient(id);
  const [showEditModal, setShowEditModal] = useState(false);

  if (error) {
    toast.error('Failed to load patient details');
    navigate('/patients');
    return null;
  }

  const patient = patientData || null;
  const scans = patientData?.recentScans || [];

  if (loading) return <div className="animate-pulse p-8">Loading patient data...</div>;
  if (!patient) return null;

  // Calculate age
  const age = Math.floor((new Date() - new Date(patient.dateOfBirth).getTime()) / 3.15576e+10);

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Patients
      </button>

      {/* Patient Header Card */}
      <div className="glass-panel p-6 sm:p-8 mb-8 flex flex-col sm:flex-row gap-6 justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-3xl shadow-inner border border-blue-500/20">
            {patient.firstName[0]}{patient.lastName[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{patient.firstName} {patient.lastName}</h1>
            <div className="flex flex-wrap gap-4 text-[var(--text-secondary)] text-sm">
              <span className="flex items-center gap-1"><User size={14} /> {patient.gender}, {age} yrs</span>
              <span>DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}</span>
              <span>ID: {patient._id}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setShowEditModal(true)} className="btn-secondary flex items-center gap-2">
            <Edit size={18} /> Edit Details
          </button>
          <Link to="/scans/upload" className="btn-primary flex items-center gap-2">
            <Image size={18} /> New Scan
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Medical Info */}
        <div className="space-y-8">
          <div className="glass-panel p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4 border-b border-[var(--border-color)] pb-2">
              <Activity size={18} className="text-amber-400" />
              Medical History
            </h3>
            {patient.medicalHistory?.length > 0 ? (
              <ul className="space-y-3">
                {patient.medicalHistory.map((history, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-white font-medium">{history.condition}</p>
                    <p className="text-[var(--text-secondary)]">{history.notes}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--text-muted)] text-sm italic">No history recorded.</p>
            )}
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-4 border-b border-[var(--border-color)] pb-2">
              <Activity size={18} className="text-red-400" />
              Allergies
            </h3>
            {patient.allergies?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">
                    {allergy}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-sm italic">No known allergies.</p>
            )}
          </div>
        </div>

        {/* Right Column: Scan History */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 h-full">
            <h3 className="text-white font-semibold flex items-center gap-2 mb-6 border-b border-[var(--border-color)] pb-2">
              <Clock size={18} className="text-[var(--accent-primary)]" />
              Recent Scans
            </h3>
            
            {scans.length > 0 ? (
              <div className="space-y-4">
                {scans.map(scan => (
                  <div key={scan._id} className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-[var(--border-color)]">
                        <img 
                          src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${scan.files?.[0]?.filePath || scan.filePath}`} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover opacity-80"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium capitalize flex items-center gap-2 mb-1">
                          <BodyPartIcon bodyPart={scan.bodyPart} className="text-[var(--text-secondary)]" />
                          {scan.bodyPart} <span className="badge badge-primary uppercase scale-75 origin-left">{scan.imageType}</span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {new Date(scan.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded-md border ${
                        scan.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        scan.status === 'analyzing' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 animate-pulse' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {scan.status}
                      </span>
                      <Link to={`/scans/${scan._id}`} className="btn-secondary py-1.5 px-3 text-sm">
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Image className="mx-auto text-[var(--text-muted)] mb-3" size={40} />
                <p className="text-[var(--text-secondary)]">No imaging studies found for this patient.</p>
                <Link to="/scans/upload" className="inline-block mt-4 text-[var(--accent-primary)] hover:underline text-sm font-medium">
                  Upload their first scan
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {showEditModal && (
        <PatientForm 
          onClose={() => setShowEditModal(false)} 
          onSave={() => setShowEditModal(false)} 
          initialData={patient}
        />
      )}
    </div>
  );
};

export default PatientDetailPage;
