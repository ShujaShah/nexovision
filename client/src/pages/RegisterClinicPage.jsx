import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, UserCircle, MapPin, Mail, Phone, Lock, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterClinicPage = () => {
  const [formData, setFormData] = useState({
    clinicName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { registerClinic } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await registerClinic(formData);
      toast.success('Clinic registered successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register clinic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background styling similar to LoginPage */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-4xl glass-panel p-8 z-10 animate-fade-in my-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10 bg-white/5 p-2">
              <img src="/favicon.png" alt="Nexovision Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Register Your Clinic</h1>
          <p className="text-[var(--text-secondary)]">Create a new Nexovision workspace for your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Clinic Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-[var(--border-color)] pb-2">Clinic Information</h3>
            
            <div>
              <label className="label-text">Clinic Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="clinicName"
                  value={formData.clinicName}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="e.g. Sunrise Radiology"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Full Address"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Contact Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="clinic@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </div>
          </div>

          {/* Admin Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-[var(--border-color)] pb-2">Administrator Account</h3>
            
            <div>
              <label className="label-text">Admin Full Name</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-lg justify-center shadow-lg shadow-purple-500/20 mt-2"
              >
                {loading ? 'Setting up Clinic...' : 'Register Clinic & Admin'}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-[var(--text-secondary)] mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-[var(--accent-primary)] hover:text-purple-400 transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterClinicPage;
