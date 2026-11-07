import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Shield, User, LogOut, Building2, ChevronDown } from 'lucide-react';

interface NavbarProps {
  onOpenStudentAuth: () => void;
  onOpenAdminAuth: () => void;
  onOpenMessSelector?: () => void;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenStudentAuth,
  onOpenAdminAuth,
  onOpenMessSelector,
  currentView = 'home',
  onNavigate,
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();

  const handleScrollTo = (id: string) => {
    if (currentView !== 'home' && onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4EE]/95 backdrop-blur-md border-b border-[#E4E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => onNavigate && onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#244D3C] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1B3C2E] transition-colors">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-lg tracking-tight text-[#292E2A]">MessMate</span>
            <span className="text-[11px] text-[#737A74] font-medium hidden sm:inline">
              Hostel Dining OS
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Restrained, single-line typography) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#737A74]">
          <button 
            onClick={() => handleScrollTo('features')}
            className="hover:text-[#244D3C] transition-colors cursor-pointer whitespace-nowrap"
          >
            Features
          </button>
          <button 
            onClick={() => handleScrollTo('how-it-works')}
            className="hover:text-[#244D3C] transition-colors cursor-pointer whitespace-nowrap"
          >
            How It Works
          </button>
          <button 
            onClick={() => handleScrollTo('pricing')}
            className="hover:text-[#244D3C] transition-colors cursor-pointer whitespace-nowrap"
          >
            Pricing
          </button>
          <button 
            onClick={() => handleScrollTo('faq')}
            className="hover:text-[#244D3C] transition-colors cursor-pointer whitespace-nowrap"
          >
            FAQ
          </button>
          {userProfile?.messName && (
            <button
              onClick={onOpenMessSelector}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E4E5DE] text-[#292E2A] hover:border-[#244D3C]/40 transition-colors cursor-pointer"
              title="Current dining hall"
            >
              <Building2 className="w-3.5 h-3.5 text-[#244D3C]" />
              <span className="truncate max-w-[140px] font-medium">{userProfile.messName}</span>
              <ChevronDown className="w-3 h-3 text-[#737A74]" />
            </button>
          )}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser && userProfile ? (
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E4E5DE] text-xs">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => onNavigate && onNavigate('admin-dashboard')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' 
                          ? 'bg-[#244D3C] text-white' 
                          : 'text-[#292E2A] hover:bg-[#EFEEE8]'
                      }`}
                    >
                      Admin Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate && onNavigate('student-dashboard')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                        currentView === 'student-dashboard' 
                          ? 'bg-[#244D3C] text-white' 
                          : 'text-[#292E2A] hover:bg-[#EFEEE8]'
                      }`}
                    >
                      Student View
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate && onNavigate('student-dashboard')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                      currentView === 'student-dashboard' 
                        ? 'bg-[#244D3C] text-white' 
                        : 'text-[#292E2A] hover:bg-[#EFEEE8]'
                    }`}
                  >
                    My Mess
                  </button>
                )}
              </div>

              {/* User Chip */}
              <div className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-white border border-[#E4E5DE]">
                <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center font-bold text-xs">
                  {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-[#292E2A] leading-tight truncate max-w-[110px]">
                    {userProfile.name}
                  </div>
                  <div className="text-[10px] text-[#737A74]">
                    {isAdmin ? 'Administrator' : 'Student'}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-1 rounded-md text-[#737A74] hover:text-red-700 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenStudentAuth}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#292E2A] hover:text-[#244D3C] hover:bg-[#EFEEE8] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#737A74]" />
                <span>Student Login</span>
              </button>

              <button
                onClick={onOpenAdminAuth}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#244D3C] text-white hover:bg-[#1B3C2E] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-white/90" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
