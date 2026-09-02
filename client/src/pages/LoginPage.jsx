import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff, Building2, UserCircle, MapPin, Mail, Phone, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// If you placed the uploaded image in public as bg-login.png, use that.
// Otherwise, we use the existing hero.png as fallback.
import heroBg from '../assets/hero.png';

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');

  // Clinic Registration State
  const [registrationStep, setRegistrationStep] = useState(1);
  const [regData, setRegData] = useState({
    clinicName: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);

  const { login, registerClinic, loading, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const success = await login(loginEmail, loginPassword);
    if (success) {
      toast.success('Login successful');
      navigate(from, { replace: true });
    } else {
      toast.error(error || 'Login failed');
    }
  };

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const nextRegStep = (e) => {
    e.preventDefault();
    // Validate Step 1
    if (!regData.clinicName || !regData.address || !regData.contactEmail || !regData.contactPhone) {
      toast.error('Please fill all mandatory fields for the clinic.');
      return;
    }
    setRegistrationStep(2);
  };

  const prevRegStep = () => {
    setRegistrationStep(1);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerClinic(regData);
      toast.success('Clinic registered successfully!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register clinic');
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Please enter your email address');
      return;
    }
    // Simulate sending email
    toast.success(`Password reset link sent to ${forgotEmail}`);
    setForgotEmail('');
    setActiveTab('login');
  };

  const backgroundUrl = '/images/Nexovision-bg.png';

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#050B14]">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${backgroundUrl}), url(${heroBg})`,
        }}
      />
      
      {/* Gradient Overlay to ensure readability and add depth */}
      <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/10 via-black/20 to-black/60"></div>

      {/* Main Content Container */}
      <div className="relative z-10 flex w-full h-full min-h-screen items-center justify-end px-6 md:px-16 lg:px-[10%]">
        
        <motion.div 
          initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Glass Card */}
          <div className="bg-[#0b1221]/70 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
            
            {/* Tabs */}
            <div className="flex border-b border-white/10">
              <button
                className={`flex-1 py-4 text-center text-[15px] font-medium transition-colors relative ${(activeTab === 'login' || activeTab === 'forgot_password') ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => {
                  setActiveTab('login');
                  setRegistrationStep(1);
                }}
              >
                Login
                {(activeTab === 'login' || activeTab === 'forgot_password') && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-[#4a90e2] rounded-t-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
              <button
                className={`flex-1 py-4 text-center text-[15px] font-medium transition-colors relative ${activeTab === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                onClick={() => setActiveTab('register')}
              >
                Register
                {activeTab === 'register' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-[20%] right-[20%] h-[2px] bg-[#4a90e2] rounded-t-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'login' && (
                  <motion.form 
                    key="loginForm"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleLoginSubmit} 
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                        placeholder="Username or Email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                          placeholder="Password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center pt-1">
                      <div className="relative flex items-center">
                        <input
                          id="remember-me"
                          type="checkbox"
                          className="peer h-4 w-4 rounded border-gray-600 bg-[#162032] text-[#4a90e2] focus:ring-[#4a90e2]/50 focus:ring-offset-0 transition-colors appearance-none checked:bg-[#4a90e2] checked:border-transparent"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <svg className="absolute left-0 top-0 w-4 h-4 pointer-events-none hidden peer-checked:block text-white p-[2px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400 cursor-pointer select-none hover:text-slate-300 transition-colors">
                        Remember me
                      </label>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white font-medium py-3 px-4 rounded-lg transition-all mt-4 shadow-[0_4px_14px_rgba(74,144,226,0.3)] active:scale-[0.98]"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        'Login'
                      )}
                    </button>

                    <div className="text-center mt-6">
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('forgot_password')}
                        className="text-[13px] text-[#4a90e2] hover:text-[#7ab0eb] transition-colors bg-transparent border-none p-0 cursor-pointer"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  </motion.form>
                )}

                {activeTab === 'forgot_password' && (
                  <motion.form 
                    key="forgotPasswordForm"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleForgotPasswordSubmit} 
                    className="space-y-5"
                  >
                    <div className="text-center mb-6">
                      <h2 className="text-white font-medium text-lg mb-2">Reset Password</h2>
                      <p className="text-sm text-slate-400">Enter your email address and we'll send you instructions to reset your password.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="email"
                          required
                          className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                          placeholder="admin@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white font-medium py-3 px-4 rounded-lg transition-all mt-6 shadow-[0_4px_14px_rgba(74,144,226,0.3)] active:scale-[0.98]"
                    >
                      Send Reset Link
                    </button>
                    
                    <div className="text-center mt-6">
                      <button 
                        type="button" 
                        onClick={() => setActiveTab('login')}
                        className="text-[13px] text-slate-400 hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer flex items-center justify-center w-full gap-1"
                      >
                        <ChevronLeft size={14} /> Back to Login
                      </button>
                    </div>
                  </motion.form>
                )}

                {activeTab === 'register' && (
                  <motion.div 
                    key="registerForm"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-white font-medium text-sm border-b border-white/10 pb-2 flex-1">
                        {registrationStep === 1 ? 'Phase 1: Clinic Details' : 'Phase 2: Admin Account'}
                      </h2>
                      <div className="text-xs text-slate-400 ml-4 font-mono">
                        {registrationStep}/2
                      </div>
                    </div>

                    {registrationStep === 1 ? (
                      <form onSubmit={nextRegStep} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Clinic Name <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              name="clinicName"
                              required
                              className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                              placeholder="e.g. Sunrise Radiology"
                              value={regData.clinicName}
                              onChange={handleRegChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Address <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              name="address"
                              required
                              className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                              placeholder="Full Address"
                              value={regData.address}
                              onChange={handleRegChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Email <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="email"
                              name="contactEmail"
                              required
                              className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                              placeholder="clinic@example.com"
                              value={regData.contactEmail}
                              onChange={handleRegChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Contact Phone <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              name="contactPhone"
                              required
                              className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                              placeholder="(555) 123-4567"
                              value={regData.contactPhone}
                              onChange={handleRegChange}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-[#4a90e2] hover:bg-[#357abd] text-white font-medium py-3 px-4 rounded-lg transition-all mt-6 shadow-[0_4px_14px_rgba(74,144,226,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                          Continue <ChevronRight size={18} />
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Full Name <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="text"
                              name="adminName"
                              required
                              className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                              placeholder="John Doe"
                              value={regData.adminName}
                              onChange={handleRegChange}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type="email"
                              name="adminEmail"
                              required
                              className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                              placeholder="admin@example.com"
                              value={regData.adminEmail}
                              onChange={handleRegChange}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">Password <span className="text-red-400">*</span></label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                              type={showRegPassword ? "text" : "password"}
                              name="adminPassword"
                              required
                              minLength={6}
                              className="w-full bg-[#162032]/80 border border-white/5 text-white rounded-lg pl-9 pr-12 py-2.5 text-sm focus:outline-none focus:border-[#4a90e2]/50 focus:ring-1 focus:ring-[#4a90e2]/50 transition-all placeholder:text-slate-500 shadow-inner"
                              placeholder="••••••••"
                              value={regData.adminPassword}
                              onChange={handleRegChange}
                            />
                            <button 
                              type="button"
                              onClick={() => setShowRegPassword(!showRegPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                          <button
                            type="button"
                            onClick={prevRegStep}
                            className="bg-transparent border border-white/20 hover:bg-white/5 text-white font-medium py-3 px-4 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-1 flex-1"
                          >
                            <ChevronLeft size={18} /> Back
                          </button>
                          
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#4a90e2] hover:bg-[#357abd] text-white font-medium py-3 px-4 rounded-lg transition-all shadow-[0_4px_14px_rgba(74,144,226,0.3)] active:scale-[0.98] flex-[2]"
                          >
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              'Complete Registration'
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
