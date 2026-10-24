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
    <header className="sticky top-0 z-40 bg-[#F8F7F3]/95 backdrop-blur-md border-b border-[#E5E8E3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate && onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#285943] flex items-center justify-center text-white shadow-xs group-hover:bg-[#1E4433] transition-colors">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-[#242925]">MessMate</span>
              <span className="text-[11px] text-[#6B716D] font-normal hidden sm:inline">
                Hostel Dining Platform
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav Links (When on Landing Page or general browsing) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#6B716D]">
          <button 
            onClick={() => handleScrollTo('features')}
            className="hover:text-[#285943] transition-colors cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => handleScrollTo('how-it-works')}
            className="hover:text-[#285943] transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button 
            onClick={() => handleScrollTo('pricing')}
            className="hover:text-[#285943] transition-colors cursor-pointer"
          >
            Pricing
          </button>
          {userProfile?.messName && (
            <button
              onClick={onOpenMessSelector}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E5E8E3] text-[#242925] hover:border-[#285943]/40 transition-colors"
              title="Click to view or switch mess"
            >
              <Building2 className="w-3.5 h-3.5 text-[#285943]" />
              <span className="truncate max-w-[150px]">{userProfile.messName}</span>
              <ChevronDown className="w-3 h-3 text-[#6B716D]" />
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {currentUser && userProfile ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Navigation tabs if authenticated */}
              <div className="hidden sm:flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E5E8E3] text-xs">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => onNavigate && onNavigate('admin-dashboard')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        currentView === 'admin-dashboard' 
                          ? 'bg-[#285943] text-white' 
                          : 'text-[#242925] hover:bg-[#F8F7F3]'
                      }`}
                    >
                      Admin Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate && onNavigate('student-dashboard')}
                      className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                        currentView === 'student-dashboard' 
                          ? 'bg-[#285943] text-white' 
                          : 'text-[#242925] hover:bg-[#F8F7F3]'
                      }`}
                    >
                      Student View
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate && onNavigate('student-dashboard')}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      currentView === 'student-dashboard' 
                        ? 'bg-[#285943] text-white' 
                        : 'text-[#242925] hover:bg-[#F8F7F3]'
                    }`}
                  >
                    My Mess Dashboard
                  </button>
                )}
              </div>

              {/* User profile identifier */}
              <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg bg-white border border-[#E5E8E3]">
                <div className="w-7 h-7 rounded-md bg-[#285943]/10 text-[#285943] flex items-center justify-center font-semibold text-xs">
                  {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-[#242925] leading-tight truncate max-w-[110px]">
                    {userProfile.name}
                  </div>
                  <div className="text-[10px] text-[#6B716D]">
                    {isAdmin ? 'Admin' : 'Student'}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-1 rounded-md text-[#6B716D] hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenStudentAuth}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#285943] text-white hover:bg-[#1E4433] transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Login</span>
              </button>

              <button
                onClick={onOpenAdminAuth}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#242925] bg-white border border-[#E5E8E3] hover:bg-[#F8F7F3] hover:border-[#6B716D] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#285943]" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
