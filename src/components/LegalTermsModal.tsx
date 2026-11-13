import React, { useEffect } from 'react';
import { X, FileText, ShieldCheck, Lock, CreditCard, Check } from 'lucide-react';

export type LegalDocTab = 'terms' | 'privacy' | 'security' | 'billing';

interface LegalTermsModalProps {
  isOpen: boolean;
  initialTab?: LegalDocTab;
  onClose: () => void;
  onOpenAdminAuth?: () => void;
}

export const LegalTermsModal: React.FC<LegalTermsModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
  onOpenAdminAuth,
}) => {
  const [activeTab, setActiveTab] = React.useState<LegalDocTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const tabs: { id: LegalDocTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'terms', label: 'Terms of Service', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'security', label: 'AI Validation & Security', icon: ShieldCheck },
    { id: 'billing', label: 'Trial & Billing Terms', icon: CreditCard },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#19382D]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-xl border border-[#E4E5DE] shadow-xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#F6F4EE] border-b border-[#E4E5DE] flex items-center justify-between gap-4">
          <div>
            <h2 id="legal-modal-title" className="text-lg font-bold text-[#292E2A] font-heading">
              MessMate Terms, Privacy &amp; Governance
            </h2>
            <p className="text-xs text-[#777D76] mt-0.5">
              Plain-language institutional policies for campus residents and mess administrators · Last updated November 2026
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close terms and policies"
            className="p-2 rounded-lg text-[#777D76] hover:text-[#292E2A] hover:bg-white border border-transparent hover:border-[#E4E5DE] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 bg-[#F6F4EE]/60 border-b border-[#E4E5DE] flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'border-[#244D3C] text-[#244D3C] bg-white rounded-t-lg'
                    : 'border-transparent text-[#777D76] hover:text-[#292E2A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-[#292E2A] leading-relaxed">
          {activeTab === 'terms' && (
            <div className="space-y-5 max-w-[68ch]">
              <div>
                <h3 className="text-base font-bold text-[#292E2A] font-heading">1. Platform Scope &amp; Institutional Access</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  MessMate provides digital menu publishing, meal rating collection, democratic food polling, and grievance tracking for registered educational institutions, hostels, and residential dining halls. Access is separated by role into Student Resident accounts and authorized Mess Administrator accounts.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE]">
                <h3 className="text-base font-bold text-[#292E2A] font-heading">2. Resident Conduct &amp; Honest Feedback</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  Students agree to submit genuine, meal-related feedback regarding food taste, quality, portion size, hygiene, temperature, or dining hall service. Both constructive criticism and positive praise are protected equally. Automated spam, abusive remarks unrelated to dining, and casual non-meal chatter may be filtered prior to storage.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE]">
                <h3 className="text-base font-bold text-[#292E2A] font-heading">3. Administrator Responsibilities</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  College administrators and wardens are responsible for keeping weekly menus accurate, reviewing pending student grievances promptly, and verifying secondary admin authorization requests belonging to their campus.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-5 max-w-[68ch]">
              <div>
                <h3 className="text-base font-bold text-[#292E2A] font-heading">1. Minimal Campus Data Collection</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  MessMate collects only the information required to connect you with your campus dining hall: your name, verified institutional email address, selected college, and assigned hostel mess. We never sell student or campus data to advertisers or third-party data brokers.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE]">
                <h3 className="text-base font-bold text-[#292E2A] font-heading">2. Multi-Tenant Campus Isolation</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  All menus, ratings, grievances, polls, and notices are scoped strictly to your institution (`collegeId`) and dining hall (`messId`). Students and administrators from another institution cannot read or modify your campus dining records.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE]">
                <h3 className="text-base font-bold text-[#292E2A] font-heading">3. Review &amp; Grievance Visibility</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  Grievances and complaints are private between the submitting resident and authorized mess administrators for that dining hall. Warden replies appear directly inside your personal feedback tracker.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5 max-w-[68ch]">
              <div>
                <h3 className="text-base font-bold text-[#292E2A] font-heading">1. Two-Tier AI Review Validation</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  Written meal reviews and grievance descriptions are evaluated server-side through our Google Gemini validation pipeline alongside deterministic checks. Reviews that contain only greetings (such as "hi"), gibberish, or off-topic chat are blocked with helpful guidance before entering the database. Genuine negative reviews about taste, hygiene, or portions are always accepted.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE]">
                <h3 className="text-base font-bold text-[#292E2A] font-heading">2. Firebase Authentication &amp; Role Rules</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  User sessions are secured with Firebase Authentication (Email/Password and Google Sign-In). Cloud Firestore security rules verify role privileges on every write operation—ensuring only verified mess administrators can edit weekly schedules, close polls, or publish campus notices.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE]">
                <h3 className="text-base font-bold text-[#292E2A] font-heading">3. One-Rating-Per-Meal Integrity</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  Each student resident records one active rating per meal course per day, with the ability to update their score if needed—preventing ballot stuffing and keeping satisfaction analytics accurate.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-5 max-w-[68ch]">
              <div>
                <h3 className="text-base font-bold text-[#292E2A] font-heading">1. 14-Day Free Demo Trial</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  Every newly registered institution receives an immediate 14-day demo trial on either Starter or Pro with no upfront card charge. Administrators can configure dining halls, publish schedules, print QR table posters, and collect live resident ratings during evaluation.
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                  <div className="text-xs font-semibold text-[#777D76]">Starter Plan</div>
                  <div className="text-lg font-bold text-[#244D3C] font-mono tabular-nums">₹1,500 / month</div>
                  <ul className="text-xs text-[#292E2A] space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#244D3C]" /> 1 Hostel Mess Hall</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#244D3C]" /> Unlimited resident reviews</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-[#F6F4EE] border border-[#244D3C]/40 space-y-2">
                  <div className="text-xs font-semibold text-[#244D3C]">Pro Plan</div>
                  <div className="text-lg font-bold text-[#244D3C] font-mono tabular-nums">₹2,999 / month</div>
                  <ul className="text-xs text-[#292E2A] space-y-1">
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#244D3C]" /> Up to 5 Campus Mess Halls</li>
                    <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-[#244D3C]" /> Full Analytics &amp; Polls Suite</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E4E5DE]">
                <h3 className="text-base font-bold text-[#292E2A] font-heading">2. Upgrades &amp; Campus Scaling</h3>
                <p className="text-xs sm:text-sm text-[#777D76] mt-1.5">
                  Campuses starting on the Starter plan can upgrade to Pro anytime from the College &amp; Mess Management workspace tab to unlock additional dining halls, advanced trend analytics, and democratic student polls without losing historical data.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#F6F4EE] border-t border-[#E4E5DE] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-[#777D76]">
            Questions about institutional onboarding? Contact <span className="font-medium text-[#292E2A]">support@messmate.edu</span>
          </span>
          <div className="flex items-center gap-2.5">
            {onOpenAdminAuth && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminAuth();
                }}
                className="px-4 py-2 rounded-lg bg-[#244D3C] text-white text-xs font-semibold hover:bg-[#19382D] cursor-pointer"
              >
                Register Campus
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white border border-[#E4E5DE] text-xs font-semibold text-[#292E2A] hover:bg-[#E5E9E1]/50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
