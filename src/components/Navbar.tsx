import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Shield, User, LogOut, Building2, ChevronDown, Menu, X, ArrowRight } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleScrollTo = (id: string) => {
    setMobileMenuOpen(false);
    if (currentView !== 'home' && onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4EE]/95 backdrop-blur-md border-b border-[#E4E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <div 
          onClick={() => {
            setMobileMenuOpen(false);
            if (onNavigate) onNavigate('home');
          }}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#244D3C] flex items-center justify-center text-white shadow-xs group-hover:bg-[#19382D] transition-colors">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-lg tracking-tight text-[#292E2A] font-heading">MessMate</span>
            <span className="text-[11px] text-[#777D76] font-medium hidden sm:inline">
              Campus Dining OS
            </span>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#777D76]">
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
            onClick={() => handleScrollTo('benefits')}
            className="hover:text-[#244D3C] transition-colors cursor-pointer whitespace-nowrap"
          >
            Benefits
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#E4E5DE] text-[#292E2A] hover:border-[#244D3C]/50 transition-colors cursor-pointer"
              title="Current dining hall"
            >
              <Building2 className="w-3.5 h-3.5 text-[#244D3C]" />
              <span className="truncate max-w-[140px] font-medium">{userProfile.messName}</span>
              <ChevronDown className="w-3 h-3 text-[#777D76]" />
            </button>
          )}
        </nav>

        {/* Zone 3: Desktop Actions & User Profile */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {currentUser && userProfile ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#E4E5DE] text-xs">
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => onNavigate && onNavigate('admin-dashboard')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        currentView === 'admin-dashboard' 
                          ? 'bg-[#244D3C] text-white shadow-xs' 
                          : 'text-[#292E2A] hover:bg-[#F6F4EE]'
                      }`}
                    >
                      Admin Workspace
                    </button>
                    <button
                      onClick={() => onNavigate && onNavigate('student-dashboard')}
                      className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                        currentView === 'student-dashboard' 
                          ? 'bg-[#244D3C] text-white shadow-xs' 
                          : 'text-[#292E2A] hover:bg-[#F6F4EE]'
                      }`}
                    >
                      Student View
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onNavigate && onNavigate('student-dashboard')}
                    className={`px-3.5 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      currentView === 'student-dashboard' 
                        ? 'bg-[#244D3C] text-white shadow-xs' 
                        : 'text-[#292E2A] hover:bg-[#F6F4EE]'
                    }`}
                  >
                    My Dining Hall
                  </button>
                )}
              </div>

              {/* User Avatar Chip */}
              <div className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-white border border-[#E4E5DE]">
                <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center font-bold text-xs">
                  {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-[#292E2A] leading-tight truncate max-w-[120px]">
                    {userProfile.name}
                  </div>
                  <div className="text-[10px] text-[#777D76]">
                    {isAdmin ? 'Administrator' : 'Student'}
                  </div>
                </div>
                <button
                  onClick={() => logout()}
                  title="Sign out"
                  className="p-1 rounded-md text-[#777D76] hover:text-red-700 hover:bg-red-50 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenStudentAuth}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#292E2A] hover:text-[#244D3C] hover:bg-white border border-transparent hover:border-[#E4E5DE] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#777D76]" />
                <span>Student Login</span>
              </button>

              <button
                onClick={onOpenAdminAuth}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#244D3C] text-white hover:bg-[#19382D] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Shield className="w-3.5 h-3.5 text-white/90" />
                <span>Admin Login</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {currentUser && (
            <button
              onClick={() => {
                if (isAdmin) onNavigate && onNavigate('admin-dashboard');
                else onNavigate && onNavigate('student-dashboard');
              }}
              className="px-2.5 py-1 rounded-md bg-[#244D3C] text-white text-[11px] font-semibold"
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#292E2A] hover:bg-white border border-[#E4E5DE] transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#E4E5DE] bg-white px-4 pt-3 pb-6 space-y-4 shadow-sm animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-2 text-sm font-semibold text-[#292E2A]">
            <button
              onClick={() => handleScrollTo('features')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F6F4EE] text-[#777D76] hover:text-[#244D3C] cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo('how-it-works')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F6F4EE] text-[#777D76] hover:text-[#244D3C] cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleScrollTo('benefits')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F6F4EE] text-[#777D76] hover:text-[#244D3C] cursor-pointer"
            >
              Benefits
            </button>
            <button
              onClick={() => handleScrollTo('pricing')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F6F4EE] text-[#777D76] hover:text-[#244D3C] cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => handleScrollTo('faq')}
              className="text-left py-2 px-3 rounded-md hover:bg-[#F6F4EE] text-[#777D76] hover:text-[#244D3C] cursor-pointer"
            >
              FAQ
            </button>
          </nav>

          <div className="pt-3 border-t border-[#E4E5DE] space-y-2">
            {currentUser && userProfile ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F6F4EE]">
                  <div>
                    <div className="text-xs font-bold text-[#292E2A]">{userProfile.name}</div>
                    <div className="text-[10px] text-[#777D76]">{userProfile.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="p-1.5 rounded-md text-red-700 bg-red-50 text-xs font-semibold"
                  >
                    Logout
                  </button>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isAdmin) onNavigate && onNavigate('admin-dashboard');
                    else onNavigate && onNavigate('student-dashboard');
                  }}
                  className="w-full py-2.5 rounded-lg bg-[#244D3C] text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <span>Go to {isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenStudentAuth();
                  }}
                  className="py-2.5 rounded-lg border border-[#E4E5DE] text-xs font-semibold text-[#292E2A] bg-[#F6F4EE] hover:bg-white text-center cursor-pointer"
                >
                  Student Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdminAuth();
                  }}
                  className="py-2.5 rounded-lg bg-[#244D3C] text-white text-xs font-semibold hover:bg-[#19382D] text-center cursor-pointer shadow-xs"
                >
                  Admin Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
