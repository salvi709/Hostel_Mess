import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Institution, Mess } from '../../types';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  QrCode,
  Search,
  Loader2,
  Check
} from 'lucide-react';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'login' | 'signup';
  qrMessId?: string | null;
}

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  qrMessId = null,
}) => {
  const { 
    loginWithEmail, 
    registerStudentWithEmail, 
    signInWithGoogle, 
    sendPasswordReset, 
    fetchInstitutions,
    fetchMessesForCollege,
    authError, 
    clearError,
    loading 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic colleges & messes from Firestore
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [availableMesses, setAvailableMesses] = useState<Mess[]>([]);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState<string>('');
  const [loadingInstitutions, setLoadingInstitutions] = useState<boolean>(false);
  const [loadingMesses, setLoadingMesses] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedCollege, setSelectedCollege] = useState<Institution | null>(null);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);

  // Load institutions dynamically from Firestore on modal open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLocalError(null);
      setResetSent(false);
      clearError();

      setLoadingInstitutions(true);
      fetchInstitutions()
        .then((insts) => {
          setInstitutions(insts);
          if (insts.length > 0 && !selectedCollege) {
            setSelectedCollege(insts[0]);
          }
        })
        .catch(console.warn)
        .finally(() => setLoadingInstitutions(false));
    }
  }, [isOpen, initialMode]);

  // When selected college changes, fetch its messes dynamically from Firestore
  useEffect(() => {
    if (selectedCollege) {
      setLoadingMesses(true);
      fetchMessesForCollege(selectedCollege.id)
        .then((messes) => {
          setAvailableMesses(messes);
          if (messes.length > 0) {
            // If qrMessId matches one, pick that, otherwise pick first
            const matched = qrMessId ? messes.find(m => m.id === qrMessId) : null;
            setSelectedMess(matched || messes[0]);
          } else {
            setSelectedMess(null);
          }
        })
        .catch(console.warn)
        .finally(() => setLoadingMesses(false));
    } else {
      setAvailableMesses([]);
      setSelectedMess(null);
    }
  }, [selectedCollege, qrMessId]);

  // Handle QR code mess pre-selection
  useEffect(() => {
    if (qrMessId && institutions.length > 0) {
      // Find which institution owns this mess
      institutions.forEach(inst => {
        fetchMessesForCollege(inst.id).then(messes => {
          const found = messes.find(m => m.id === qrMessId);
          if (found) {
            setSelectedCollege(inst);
            setSelectedMess(found);
          }
        });
      });
    }
  }, [qrMessId, institutions]);

  if (!isOpen) return null;

  // Filtered colleges by search query
  const filteredColleges = institutions.filter(inst => 
    inst.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
    (inst.code && inst.code.toLowerCase().includes(collegeSearchQuery.toLowerCase())) ||
    (inst.location && inst.location.toLowerCase().includes(collegeSearchQuery.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          setLocalError('Please enter both email and password.');
          setIsSubmitting(false);
          return;
        }
        await loginWithEmail(email.trim(), password);
        onSuccess();
      } else if (mode === 'signup') {
        if (!name.trim()) {
          setLocalError('Please provide your full name.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setLocalError('Please provide a valid email address.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setLocalError('Password must be at least 6 characters long.');
          setIsSubmitting(false);
          return;
        }
        if (!selectedCollege) {
          setLocalError('Please search and select your college.');
          setIsSubmitting(false);
          return;
        }
        if (!selectedMess) {
          setLocalError('Please select a dining mess for your college.');
          setIsSubmitting(false);
          return;
        }

        await registerStudentWithEmail({
          name: name.trim(),
          email: email.trim(),
          password,
          collegeId: selectedCollege.id,
          collegeName: selectedCollege.name,
          messId: selectedMess.id,
          messName: selectedMess.name
        });
        onSuccess();
      } else if (mode === 'forgot') {
        if (!email.trim() || !email.includes('@')) {
          setLocalError('Please provide a valid email address to receive password reset instructions.');
          setIsSubmitting(false);
          return;
        }
        await sendPasswordReset(email.trim());
        setResetSent(true);
      }
    } catch (err: any) {
      setLocalError(err.message || 'Authentication failed. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await signInWithGoogle('student');
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Google sign-in was cancelled or failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#2F6B4F]/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#FFF9F0] px-6 py-5 border-b border-[#2F6B4F]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F6B4F] text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5 text-[#FFF9F0]" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#292D2A]">
                {mode === 'login' && 'Student Login'}
                {mode === 'signup' && 'Student Registration'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="text-xs text-[#747A75]">
                {mode === 'login' && 'Access today’s menu & submit ratings'}
                {mode === 'signup' && 'Search your college & connect with your mess'}
                {mode === 'forgot' && 'Receive a secure reset link'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-[#747A75] hover:text-[#292D2A] hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Context Alert if scanning QR code */}
        {qrMessId && (
          <div className="bg-emerald-50 px-6 py-2.5 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <QrCode className="w-4 h-4 text-[#2F6B4F] shrink-0" />
            <span>Preserving scanned dining hall: <b>{selectedMess?.name || 'Assigned Mess'}</b></span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tabs for Login vs Signup */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-[#FFF9F0] rounded-2xl border border-[#2F6B4F]/15">
              <button
                type="button"
                onClick={() => { setMode('login'); setLocalError(null); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'login' 
                    ? 'bg-white text-[#2F6B4F] shadow-xs' 
                    : 'text-[#747A75] hover:text-[#292D2A]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setLocalError(null); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  mode === 'signup' 
                    ? 'bg-white text-[#2F6B4F] shadow-xs' 
                    : 'text-[#747A75] hover:text-[#292D2A]'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Error Message banner */}
          {(localError || authError) && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{localError || authError}</span>
            </div>
          )}

          {/* Password Reset Confirmation Banner */}
          {resetSent && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>
                <p className="font-bold">Password reset email dispatched!</p>
                <p className="mt-1">Please check your inbox at <b>{email}</b> to reset your password.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292D2A] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#2F6B4F]" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarthak Salvi"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
                />
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#292D2A] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2F6B4F]" />
                <span>Student / College Email</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@institution.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
              />
            </div>

            {/* Password field */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#292D2A] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#2F6B4F]" />
                    <span>Password</span>
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setLocalError(null); }}
                      className="text-[11px] font-semibold text-[#E8873A] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747A75] hover:text-[#292D2A]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Dynamic College & Mess Selection (Signup only) */}
            {mode === 'signup' && (
              <div className="space-y-4 pt-1">
                {/* Search & Select College */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#292D2A] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#2F6B4F]" />
                      <span>Search & Select College / University</span>
                    </span>
                    {loadingInstitutions && <span className="text-[10px] text-[#747A75]">Loading list...</span>}
                  </label>

                  {/* College Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={collegeSearchQuery}
                      onChange={(e) => setCollegeSearchQuery(e.target.value)}
                      placeholder="Type to filter registered colleges..."
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F] bg-white"
                    />
                  </div>

                  {/* College Selection Cards */}
                  <div className="max-h-36 overflow-y-auto space-y-1.5 border border-[#2F6B4F]/10 p-2 rounded-xl bg-[#FFF9F0]">
                    {filteredColleges.length > 0 ? (
                      filteredColleges.map((inst) => (
                        <div
                          key={inst.id}
                          onClick={() => setSelectedCollege(inst)}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            selectedCollege?.id === inst.id
                              ? 'border-[#2F6B4F] bg-white font-bold text-[#2F6B4F] shadow-2xs'
                              : 'border-transparent hover:bg-white text-[#292D2A]'
                          }`}
                        >
                          <div>
                            <div>{inst.name}</div>
                            {inst.location && <div className="text-[10px] text-[#747A75] font-normal">{inst.location}</div>}
                          </div>
                          {selectedCollege?.id === inst.id && <Check className="w-4 h-4 text-[#2F6B4F] shrink-0" />}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-3 text-xs text-[#747A75]">
                        No college matching "{collegeSearchQuery}". Admins can register new colleges anytime via the Admin Portal!
                      </div>
                    )}
                  </div>
                </div>

                {/* Mess Selection for the chosen college */}
                {selectedCollege && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#292D2A] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#2F6B4F]" />
                        <span>Dining Mess at {selectedCollege.name}</span>
                      </span>
                      {loadingMesses && <span className="text-[10px] text-[#747A75]">Loading messes...</span>}
                    </label>

                    {availableMesses.length > 0 ? (
                      <select
                        value={selectedMess?.id || ''}
                        onChange={(e) => {
                          const found = availableMesses.find(m => m.id === e.target.value);
                          if (found) setSelectedMess(found);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-xs font-semibold focus:outline-none focus:border-[#2F6B4F] bg-white"
                      >
                        {availableMesses.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} {m.locationBlock ? `(${m.locationBlock})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-[#2F6B4F]/20 text-xs text-[#747A75] text-center">
                        No active dining halls registered under this college yet.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Sign In to Student Dashboard'}
                    {mode === 'signup' && 'Complete Student Registration'}
                    {mode === 'forgot' && 'Send Password Reset Email'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Forgot mode back button */}
          {mode === 'forgot' && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setResetSent(false); setLocalError(null); }}
                className="text-xs font-semibold text-[#2F6B4F] hover:underline cursor-pointer"
              >
                Back to Student Sign In
              </button>
            </div>
          )}

          {/* Google Sign-in Divider (for Login & Signup) */}
          {mode !== 'forgot' && (
            <div className="space-y-4 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#2F6B4F]/15 w-full"></div>
                <span className="bg-white px-3 text-[11px] uppercase font-bold text-[#747A75]">
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || loading}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2F6B4F]/20 hover:border-[#2F6B4F]/50 bg-white hover:bg-[#FFF9F0] text-sm font-semibold text-[#292D2A] shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Account</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="bg-[#FFF9F0] px-6 py-3 border-t border-[#2F6B4F]/10 text-center text-[11px] text-[#747A75]">
          Mess schedules and student dish ratings update live via Cloud Firestore.
        </div>
      </div>
    </div>
  );
};
