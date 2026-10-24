import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionPlan } from '../../types';
import { 
  X, 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  MapPin,
  Loader2,
  Sparkles,
  Check,
  Zap,
  Crown,
  ChefHat
} from 'lucide-react';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSwitchToStudent: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToStudent,
}) => {
  const { 
    currentUser,
    loginAdminWithEmail, 
    registerAdminWithEmail,
    signInWithGoogle, 
    completeAdminOnboarding,
    authError, 
    clearError,
    loading 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);

  // Password visibility
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields for Login
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Step 1: Admin Credentials
  const [adminName, setAdminName] = useState<string>('');
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');

  // Step 2: Subscription Plan
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('starter');

  // Step 3: College & Mess Registration
  const [collegeName, setCollegeName] = useState<string>('');
  const [collegeLocation, setCollegeLocation] = useState<string>('');
  const [officialEmail, setOfficialEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [messName, setMessName] = useState<string>('');
  const [locationBlock, setLocationBlock] = useState<string>('');

  // Clear errors whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      clearError();
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Returning Admin Login (Dedicated Email & Password)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    setLocalError(null);
    clearError();

    if (!loginEmail.trim() || !loginPassword) {
      setLocalError('Please enter both your admin email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAdminWithEmail(loginEmail.trim(), loginPassword);
      if (res.needsOnboarding) {
        // Authenticated, but no college configured yet -> proceed to plan selection!
        setAdminEmail(loginEmail.trim());
        setMode('signup');
        setSignupStep(2);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Admin sign-in failed. Verify your authorized credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign-in for Admin (Completely Separate Flow)
  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    setLocalError(null);
    clearError();

    setIsSubmitting(true);
    try {
      const res = await signInWithGoogle('admin');
      if (res.needsOnboarding) {
        setMode('signup');
        setSignupStep(2);
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Google administrator sign-in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Account Creation in Signup
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!adminName.trim()) {
      setLocalError('Please enter your full name or title.');
      return;
    }
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      setLocalError('Please enter a valid official email address.');
      return;
    }
    if (adminPassword.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerAdminWithEmail(adminEmail.trim(), adminPassword, adminName.trim());
      setOfficialEmail(adminEmail.trim());
      setSignupStep(2);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to create admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 3: Complete Institution & Mess Setup
  const handleFinalOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!collegeName.trim()) {
      setLocalError('Please enter your college or institution name.');
      return;
    }
    if (!collegeLocation.trim()) {
      setLocalError('Please enter your college campus location.');
      return;
    }
    if (!messName.trim()) {
      setLocalError('Please provide the name of your primary hostel dining hall.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeAdminOnboarding({
        plan: selectedPlan,
        collegeName: collegeName.trim(),
        location: collegeLocation.trim(),
        officialEmail: officialEmail.trim() || adminEmail.trim() || currentUser?.email || '',
        contactPhone: contactPhone.trim(),
        messName: messName.trim(),
        locationBlock: locationBlock.trim() || 'Central Dining Block'
      });
      onSuccess();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to register institution and mess.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#2F6B4F]/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#FFF9F0] px-6 py-5 border-b border-[#2F6B4F]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2F6B4F] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 text-[#FFF9F0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-[#292D2A]">
                  {mode === 'login' ? 'Mess Admin Portal' : 'Register Your Institution'}
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2F6B4F]/10 text-[#2F6B4F] px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <p className="text-xs text-[#747A75]">
                {mode === 'login' 
                  ? 'Access your college mess schedules, ratings & feedback' 
                  : `Step ${signupStep} of 3: ${signupStep === 1 ? 'Admin Account' : signupStep === 2 ? 'Subscription Plan' : 'College Profile'}`}
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

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tabs: Sign In vs Register New College */}
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
              Returning Admin Login
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
              New College Registration
            </button>
          </div>

          {/* Error Message banner */}
          {(localError || authError) && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex flex-col gap-2">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span className="font-medium leading-relaxed">{localError || authError}</span>
              </div>
              {((localError || authError)?.toLowerCase().includes('popup') || (localError || authError)?.toLowerCase().includes('domain')) && (
                <div className="text-[11px] text-[#2F6B4F] bg-white/80 p-2 rounded-xl border border-[#2F6B4F]/20 font-medium">
                  💡 <strong>Tip:</strong> Email &amp; Password login is active and completely immune to browser popup or domain restrictions. Enter your email and password to log in directly.
                </div>
              )}
            </div>
          )}

          {/* TAB 1: RETURNING ADMIN LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292D2A] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2F6B4F]" />
                  <span>Admin Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (localError) setLocalError(null);
                    if (authError) clearError();
                  }}
                  placeholder="admin@institution.edu"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] focus:ring-1 focus:ring-[#2F6B4F] bg-white transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292D2A] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2F6B4F]" />
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (localError) setLocalError(null);
                      if (authError) clearError();
                    }}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] focus:ring-1 focus:ring-[#2F6B4F] bg-white transition-all"
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

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting || loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="relative flex items-center justify-center pt-2">
                <div className="border-t border-[#2F6B4F]/15 w-full"></div>
                <span className="bg-white px-3 text-[11px] uppercase font-bold text-[#747A75]">
                  Or sign in with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting || loading}
                className="w-full py-2.5 px-4 rounded-xl border border-[#2F6B4F]/20 hover:border-[#2F6B4F]/50 bg-white hover:bg-[#FFF9F0] text-sm font-semibold text-[#292D2A] shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Account (Admin)</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={onSwitchToStudent}
                  className="text-xs text-[#747A75] hover:text-[#2F6B4F] transition-colors cursor-pointer"
                >
                  Are you a student? <span className="font-semibold underline text-[#2F6B4F]">Open Student Portal</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTER NEW COLLEGE (3-STEP SMOOTH ONBOARDING) */}
          {mode === 'signup' && (
            <div className="space-y-5">
              {/* Step Indicators */}
              <div className="flex items-center justify-between pb-2 border-b border-[#2F6B4F]/10 text-xs">
                <div className={`flex items-center gap-1.5 font-bold ${signupStep >= 1 ? 'text-[#2F6B4F]' : 'text-gray-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-[#2F6B4F] text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Account</span>
                </div>
                <div className="w-8 h-0.5 bg-[#2F6B4F]/20"></div>
                <div className={`flex items-center gap-1.5 font-bold ${signupStep >= 2 ? 'text-[#2F6B4F]' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${signupStep >= 2 ? 'bg-[#2F6B4F] text-white' : 'bg-gray-200 text-gray-600'}`}>2</span>
                  <span>Subscription</span>
                </div>
                <div className="w-8 h-0.5 bg-[#2F6B4F]/20"></div>
                <div className={`flex items-center gap-1.5 font-bold ${signupStep >= 3 ? 'text-[#2F6B4F]' : 'text-gray-400'}`}>
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${signupStep >= 3 ? 'bg-[#2F6B4F] text-white' : 'bg-gray-200 text-gray-600'}`}>3</span>
                  <span>College & Mess</span>
                </div>
              </div>

              {/* STEP 1: ADMIN ACCOUNT CREATION */}
              {signupStep === 1 && (
                <form onSubmit={handleStep1Submit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#292D2A]">Admin Full Name / Title</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Verma (Mess Supervisor)"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#292D2A]">Admin Official Email</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="warden@university.edu"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#292D2A]">Set Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#747A75]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Continue to Select Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="relative flex items-center justify-center pt-1">
                    <div className="border-t border-[#2F6B4F]/15 w-full"></div>
                    <span className="bg-white px-3 text-[11px] uppercase font-bold text-[#747A75]">
                      Or register with
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-2.5 px-4 rounded-xl border border-[#2F6B4F]/20 hover:border-[#2F6B4F]/50 bg-white text-sm font-semibold text-[#292D2A] shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google Account</span>
                  </button>
                </form>
              )}

              {/* STEP 2: SUBSCRIPTION PLAN SELECTION */}
              {signupStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-base text-[#292D2A]">Choose Your MessMate Subscription</h3>
                    <p className="text-xs text-[#747A75]">
                      Select the tier matching your dining capacity. Enjoy a <b>14-Day Demo Trial</b> with full access.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Starter Card */}
                    <div 
                      onClick={() => setSelectedPlan('starter')}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        selectedPlan === 'starter' 
                          ? 'border-[#2F6B4F] bg-[#FFF9F0] shadow-md ring-1 ring-[#2F6B4F]' 
                          : 'border-gray-200 bg-white hover:border-[#2F6B4F]/40'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#292D2A] flex items-center gap-1.5">
                            <Zap className="w-4 h-4 text-[#E8873A]" /> Starter Plan
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            1 Mess
                          </span>
                        </div>
                        <div>
                          <div className="text-2xl font-extrabold text-[#2F6B4F]">₹1,500 <span className="text-xs font-normal text-[#747A75]">/ month</span></div>
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Trial Activation: Free for 14 Days</div>
                        </div>
                        <ul className="text-xs space-y-1.5 text-[#292D2A] pt-1">
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> One College & 1 Dining Mess
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Full Menu Schedule Planner
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Student Dish Ratings & Complaints
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Food Polls & Notice Board
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Dining Hall Entrance QR Code
                          </li>
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#2F6B4F]/10 flex items-center justify-between text-xs font-bold text-[#2F6B4F]">
                        <span>{selectedPlan === 'starter' ? 'Selected Plan' : 'Select Starter'}</span>
                        {selectedPlan === 'starter' && <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />}
                      </div>
                    </div>

                    {/* Pro Card */}
                    <div 
                      onClick={() => setSelectedPlan('pro')}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                        selectedPlan === 'pro' 
                          ? 'border-[#2F6B4F] bg-[#FFF9F0] shadow-md ring-1 ring-[#2F6B4F]' 
                          : 'border-gray-200 bg-white hover:border-[#2F6B4F]/40'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-[#292D2A] flex items-center gap-1.5">
                            <Crown className="w-4 h-4 text-[#E8873A]" /> Pro Plan
                          </span>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#E8873A]/20 text-[#E8873A]">
                            Up to 5 Messes
                          </span>
                        </div>
                        <div>
                          <div className="text-2xl font-extrabold text-[#2F6B4F]">₹2,999 <span className="text-xs font-normal text-[#747A75]">/ month</span></div>
                          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Trial Activation: Free for 14 Days</div>
                        </div>
                        <ul className="text-xs space-y-1.5 text-[#292D2A] pt-1">
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> One College & <b>Up to 5 Messes</b>
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Multi-Mess Switching in Admin
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Combined College-Level Analytics
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Individual Dining Hall QR Posters
                          </li>
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#2F6B4F]" /> Priority Grievance Resolution
                          </li>
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#2F6B4F]/10 flex items-center justify-between text-xs font-bold text-[#2F6B4F]">
                        <span>{selectedPlan === 'pro' ? 'Selected Plan' : 'Select Pro'}</span>
                        {selectedPlan === 'pro' && <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-snug">
                    ℹ️ <b>Billing Transparency:</b> Live payment gateway integration is currently in demo trial mode. No payment will be deducted today. Your subscription is activated instantly.
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="text-xs font-bold text-[#747A75] hover:text-[#292D2A]"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignupStep(3)}
                      className="px-6 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Continue with {selectedPlan === 'starter' ? 'Starter' : 'Pro'} Plan</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: COLLEGE & FIRST MESS PROFILE */}
              {signupStep === 3 && (
                <form onSubmit={handleFinalOnboarding} className="space-y-4">
                  <div className="text-xs font-semibold text-[#747A75]">
                    Enter your college name and dining hall details. Your college will be immediately available for students in the search directory.
                  </div>

                  {/* College Name - Free text input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#292D2A] flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#2F6B4F]" />
                      <span>College / Institution Name (Normal Text)</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. Delhi Technological University, IIT Delhi, Anna University"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
                    />
                  </div>

                  {/* Campus Location */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#292D2A] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2F6B4F]" />
                      <span>Campus Location / City</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeLocation}
                      onChange={(e) => setCollegeLocation(e.target.value)}
                      placeholder="e.g. Main Campus, Rohini, New Delhi"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
                    />
                  </div>

                  {/* Primary Mess Details */}
                  <div className="p-4 bg-[#FFF9F0] rounded-2xl border border-[#2F6B4F]/15 space-y-3">
                    <div className="text-xs font-bold text-[#2F6B4F] flex items-center gap-1.5 uppercase tracking-wider">
                      <ChefHat className="w-4 h-4" />
                      <span>Primary Hostel Dining Hall</span>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#292D2A]">Mess Name</label>
                      <input
                        type="text"
                        required
                        value={messName}
                        onChange={(e) => setMessName(e.target.value)}
                        placeholder="e.g. Aryabhatta Hostel Dining Hall, South Block Mess"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F] bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[#292D2A]">Location / Block (optional)</label>
                      <input
                        type="text"
                        value={locationBlock}
                        onChange={(e) => setLocationBlock(e.target.value)}
                        placeholder="e.g. Boys Hostel Block A, Ground Floor"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F] bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setSignupStep(2)}
                      className="text-xs font-bold text-[#747A75] hover:text-[#292D2A]"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="px-6 py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Setup & Launch Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Note */}
        <div className="bg-[#FFF9F0] px-6 py-3 border-t border-[#2F6B4F]/10 text-center text-[11px] text-[#747A75]">
          MessMate uses Firebase Authentication and isolated Cloud Firestore multi-tenant security.
        </div>
      </div>
    </div>
  );
};
