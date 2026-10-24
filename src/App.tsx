import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentAuthModal } from './components/auth/StudentAuthModal';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { CompleteProfileModal } from './components/auth/CompleteProfileModal';
import { DEFAULT_MESSES } from './firebase/seed';
import { AlertCircle, CheckCircle2, Shield, Loader2, Mail } from 'lucide-react';

function MainApp() {
  const { 
    currentUser, 
    userProfile, 
    isAdmin, 
    isStudent, 
    needsProfileSetup, 
    loading,
    resendVerificationEmail
  } = useAuth();

  const [currentView, setCurrentView] = useState<'home' | 'student-dashboard' | 'admin-dashboard'>('home');
  const [studentModalOpen, setStudentModalOpen] = useState<boolean>(false);
  const [studentModalInitialMode, setStudentModalInitialMode] = useState<'login' | 'signup'>('login');
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [qrMessId, setQrMessId] = useState<string | null>(null);
  const [verificationNoticeSent, setVerificationNoticeSent] = useState<boolean>(false);

  // Parse QR code from URL search param (?mess=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messParam = params.get('mess') || params.get('location');
    if (messParam) {
      setQrMessId(messParam);
      // If user isn't logged in, prompt student sign-in/up with that mess pre-selected
      if (!currentUser) {
        setStudentModalInitialMode('login');
        setStudentModalOpen(true);
      }
    }
  }, [currentUser]);

  // Handle default redirection on login
  useEffect(() => {
    if (currentUser && userProfile) {
      if (isAdmin && currentView === 'home') {
        setCurrentView('admin-dashboard');
      } else if (isStudent && currentView === 'home') {
        setCurrentView('student-dashboard');
      }
    } else if (!currentUser) {
      setCurrentView('home');
    }
  }, [currentUser, userProfile, isAdmin, isStudent]);

  // Route protection
  const handleNavigate = (view: string) => {
    if (view === 'admin-dashboard') {
      if (!currentUser) {
        setAdminModalOpen(true);
        return;
      }
      if (!isAdmin) {
        alert('Access Restricted: You are logged in as a student. Only authorized mess administrators may access the Admin Dashboard.');
        setCurrentView('student-dashboard');
        return;
      }
      setCurrentView('admin-dashboard');
    } else if (view === 'student-dashboard') {
      if (!currentUser) {
        setStudentModalInitialMode('login');
        setStudentModalOpen(true);
        return;
      }
      setCurrentView('student-dashboard');
    } else {
      setCurrentView('home');
    }
  };

  const handleResendVerification = async () => {
    try {
      await resendVerificationEmail();
      setVerificationNoticeSent(true);
      setTimeout(() => setVerificationNoticeSent(false), 5000);
    } catch (e: any) {
      alert(e.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col font-sans selection:bg-[#2F6B4F] selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        onOpenStudentAuth={() => {
          setStudentModalInitialMode('login');
          setStudentModalOpen(true);
        }}
        onOpenAdminAuth={() => setAdminModalOpen(true)}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Email Verification Banner if signed in via email and not verified */}
      {currentUser && !currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password' && (
        <div className="bg-amber-100/90 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Your email (<b>{currentUser.email}</b>) is unverified. Please check your inbox for the verification link.
            </span>
          </div>
          <button
            onClick={handleResendVerification}
            className="text-xs font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
          >
            {verificationNoticeSent ? 'Verification link sent!' : 'Resend Email'}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {loading && !currentUser ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#2F6B4F] animate-spin" />
            <span className="text-xs font-semibold text-[#747A75]">Connecting to MessMate...</span>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <LandingPage
                onOpenStudentAuth={() => {
                  setStudentModalInitialMode('login');
                  setStudentModalOpen(true);
                }}
                onOpenAdminAuth={() => setAdminModalOpen(true)}
                onNavigateToDashboard={() => {
                  if (isAdmin) setCurrentView('admin-dashboard');
                  else setCurrentView('student-dashboard');
                }}
              />
            )}

            {currentView === 'student-dashboard' && <StudentDashboard />}

            {currentView === 'admin-dashboard' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Student Auth Modal */}
      <StudentAuthModal
        isOpen={studentModalOpen}
        onClose={() => setStudentModalOpen(false)}
        initialMode={studentModalInitialMode}
        qrMessId={qrMessId}
        onSuccess={() => {
          setStudentModalOpen(false);
          setCurrentView('student-dashboard');
        }}
      />

      {/* Admin Auth Modal */}
      <AdminAuthModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={() => {
          setAdminModalOpen(false);
          setCurrentView('admin-dashboard');
        }}
        onSwitchToStudent={() => {
          setAdminModalOpen(false);
          setStudentModalInitialMode('login');
          setStudentModalOpen(true);
        }}
      />

      {/* Missing Google Profile Completion Modal */}
      <CompleteProfileModal
        isOpen={needsProfileSetup}
        onSuccess={() => {
          setCurrentView('student-dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
