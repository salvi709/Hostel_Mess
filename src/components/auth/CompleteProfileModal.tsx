import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Institution, Mess } from '../../types';
import { Building2, MapPin, User, ArrowRight, Loader2, Sparkles, Search } from 'lucide-react';

interface CompleteProfileModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export const CompleteProfileModal: React.FC<CompleteProfileModalProps> = ({
  isOpen,
  onSuccess
}) => {
  const { currentUser, completeStudentProfile, fetchInstitutions, fetchMessesForCollege, loading } = useAuth();

  const [name, setName] = useState<string>(currentUser?.displayName || '');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<Institution | null>(null);
  const [availableMesses, setAvailableMesses] = useState<Mess[]>([]);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState<string>('');
  
  const [loadingInstitutions, setLoadingInstitutions] = useState<boolean>(false);
  const [loadingMesses, setLoadingMesses] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load institutions when modal is displayed
  useEffect(() => {
    if (isOpen) {
      if (currentUser?.displayName) {
        setName(currentUser.displayName);
      }
      setLoadingInstitutions(true);
      fetchInstitutions()
        .then((insts) => {
          setInstitutions(insts);
          if (insts.length > 0 && !selectedCollege) {
            setSelectedCollege(insts[0]);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch institutions:', err);
        })
        .finally(() => setLoadingInstitutions(false));
    }
  }, [isOpen, currentUser]);

  // Load messes when selected college changes
  useEffect(() => {
    if (selectedCollege) {
      setLoadingMesses(true);
      fetchMessesForCollege(selectedCollege.id)
        .then((messes) => {
          setAvailableMesses(messes);
          if (messes.length > 0) {
            setSelectedMess(messes[0]);
          } else {
            setSelectedMess(null);
          }
        })
        .catch((err) => {
          console.warn('Failed to fetch messes for college:', err);
          setAvailableMesses([]);
          setSelectedMess(null);
        })
        .finally(() => setLoadingMesses(false));
    } else {
      setAvailableMesses([]);
      setSelectedMess(null);
    }
  }, [selectedCollege]);

  if (!isOpen) return null;

  const filteredColleges = institutions.filter(inst =>
    inst.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
    (inst.code && inst.code.toLowerCase().includes(collegeSearchQuery.toLowerCase())) ||
    (inst.location && inst.location.toLowerCase().includes(collegeSearchQuery.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCollege) {
      setError('Please select your campus or university.');
      return;
    }

    if (!selectedMess) {
      setError('Please select a dining hall or mess.');
      return;
    }

    setIsSubmitting(true);

    try {
      await completeStudentProfile({
        name: name.trim() || currentUser?.displayName || 'Student',
        collegeId: selectedCollege.id,
        collegeName: selectedCollege.name,
        messId: selectedMess.id,
        messName: selectedMess.name
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to complete student profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#2F6B4F]/20 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#FFF9F0] px-6 py-5 border-b border-[#2F6B4F]/10 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8873A]/15 text-[#E8873A] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Almost Done!</span>
          </div>
          <h2 className="font-bold text-xl text-[#292D2A]">Complete Your Student Profile</h2>
          <p className="text-xs text-[#747A75] mt-1">
            Choose your campus institution and hostel dining hall to personalize your daily meal schedules and polls.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {error}
            </div>
          )}

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

          {/* College Selection with Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#292D2A] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#2F6B4F]" />
                <span>Campus / University</span>
              </span>
              {institutions.length > 5 && (
                <span className="text-[10px] text-[#747A75]">{institutions.length} institutions</span>
              )}
            </label>

            {institutions.length > 4 && (
              <div className="relative mb-1.5">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747A75]" />
                <input
                  type="text"
                  value={collegeSearchQuery}
                  onChange={(e) => setCollegeSearchQuery(e.target.value)}
                  placeholder="Search college by name or city..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#2F6B4F]/15 text-xs focus:outline-none focus:border-[#2F6B4F] bg-[#FFF9F0]/40"
                />
              </div>
            )}

            {loadingInstitutions ? (
              <div className="py-3 px-4 rounded-xl border border-[#2F6B4F]/10 bg-[#FFF9F0]/40 flex items-center justify-center gap-2 text-xs text-[#747A75]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2F6B4F]" />
                <span>Loading campuses...</span>
              </div>
            ) : filteredColleges.length === 0 ? (
              <div className="p-3 rounded-xl border border-dashed border-[#2F6B4F]/20 text-xs text-[#747A75] text-center bg-[#FFF9F0]/30">
                No institutions found matching "{collegeSearchQuery}".
              </div>
            ) : (
              <select
                value={selectedCollege?.id || ''}
                onChange={(e) => {
                  const inst = institutions.find(i => i.id === e.target.value) || null;
                  setSelectedCollege(inst);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
              >
                {filteredColleges.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} {inst.location ? `• ${inst.location}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mess Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#292D2A] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#2F6B4F]" />
                <span>Hostel Mess / Dining Hall</span>
              </span>
              {availableMesses.length > 0 && (
                <span className="text-[10px] text-[#747A75]">{availableMesses.length} dining halls</span>
              )}
            </label>

            {loadingMesses ? (
              <div className="py-3 px-4 rounded-xl border border-[#2F6B4F]/10 bg-[#FFF9F0]/40 flex items-center justify-center gap-2 text-xs text-[#747A75]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2F6B4F]" />
                <span>Loading mess halls...</span>
              </div>
            ) : availableMesses.length === 0 ? (
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800">
                No mess halls registered for this institution yet.
              </div>
            ) : (
              <select
                value={selectedMess?.id || ''}
                onChange={(e) => {
                  const m = availableMesses.find(item => item.id === e.target.value) || null;
                  setSelectedMess(m);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2F6B4F]/20 text-sm focus:outline-none focus:border-[#2F6B4F] bg-white transition-all"
              >
                {availableMesses.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.locationBlock ? `(${m.locationBlock})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading || !selectedCollege || !selectedMess}
            className="w-full py-3 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Enter Mess Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
