import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UtensilsCrossed, 
  Shield, 
  User, 
  Star, 
  Vote, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ChefHat, 
  BarChart3, 
  MessageSquare,
  Building,
  Check,
  ChevronRight
} from 'lucide-react';

interface LandingPageProps {
  onOpenStudentAuth: () => void;
  onOpenAdminAuth: () => void;
  onNavigateToDashboard?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudentAuth,
  onOpenAdminAuth,
  onNavigateToDashboard
}) => {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [interactiveRating, setInteractiveRating] = useState<number>(4);
  const [votedOption, setVotedOption] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F8F7F3] text-[#242925]">
      {/* 1. HERO SECTION */}
      <section className="pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#E5E8E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Required Headline & Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#285943]">
                <span className="w-2 h-2 rounded-full bg-[#285943]"></span>
                <span>Hostel Dining Management & Quality Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#242925] leading-[1.12]">
                Better mess management starts with better feedback.
              </h1>

              <p className="text-base sm:text-lg text-[#6B716D] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A simple platform for students to share meal feedback and for institutions to improve their mess services.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 max-w-md mx-auto lg:mx-0">
                <button
                  onClick={currentUser && !isAdmin ? onNavigateToDashboard : onOpenStudentAuth}
                  className="px-6 py-3.5 rounded-lg bg-[#285943] text-white hover:bg-[#1E4433] transition-colors font-semibold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Continue as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={currentUser && isAdmin ? onNavigateToDashboard : onOpenAdminAuth}
                  className="px-6 py-3.5 rounded-lg bg-white text-[#242925] border border-[#E5E8E3] hover:bg-[#F8F7F3] hover:border-[#6B716D] transition-colors font-semibold text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#285943]" />
                  <span>Get Started as Admin</span>
                </button>
              </div>

              {/* Unboxed Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-[#6B716D]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#285943]" />
                  <span>Verified Campus Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#285943]" />
                  <span>Instant QR Table Check-in</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#285943]" />
                  <span>Structured Warden Resolution</span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Interface Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-[#E5E8E3] shadow-sm p-5 space-y-4 max-w-md mx-auto">
                {/* Header bar of preview */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E8E3]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-[#285943]/10 text-[#285943] flex items-center justify-center font-bold text-xs">
                      H12
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#242925]">Hostel 12 Dining Hall</div>
                      <div className="text-[10px] text-[#6B716D]">Today’s Lunch · 12:00 PM – 2:15 PM</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#285943] bg-[#285943]/10 px-2 py-0.5 rounded-md">
                    Live Serving
                  </span>
                </div>

                {/* Today's Meal Details */}
                <div className="p-3.5 rounded-lg bg-[#F8F7F3] border border-[#E5E8E3] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#242925]">Paneer Butter Masala & Dal Tadka</h4>
                      <p className="text-[11px] text-[#6B716D] mt-0.5">Jeera Rice, Whole Wheat Phulkas, Fresh Curd & Boondi Ladoo</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#C87942] pl-2 whitespace-nowrap">
                      <Star className="w-3.5 h-3.5 fill-[#C87942]" />
                      <span>4.6</span>
                    </div>
                  </div>

                  {/* Criteria Rating Visual */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#E5E8E3] text-center text-[10px]">
                    <div>
                      <span className="text-[#6B716D]">Taste</span>
                      <div className="font-bold text-[#242925]">4.7 ★</div>
                    </div>
                    <div>
                      <span className="text-[#6B716D]">Hygiene</span>
                      <div className="font-bold text-[#242925]">4.9 ★</div>
                    </div>
                    <div>
                      <span className="text-[#6B716D]">Quantity</span>
                      <div className="font-bold text-[#242925]">4.5 ★</div>
                    </div>
                    <div>
                      <span className="text-[#6B716D]">Quality</span>
                      <div className="font-bold text-[#242925]">4.6 ★</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Rating Demo */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#242925]">How was your lunch today?</span>
                    <span className="text-[11px] text-[#6B716D]">{interactiveRating} of 5 stars</span>
                  </div>
                  <div className="flex items-center justify-between gap-1 p-2 rounded-lg bg-[#F8F7F3] border border-[#E5E8E3]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setInteractiveRating(star)}
                        className="p-1 text-center transition-transform hover:scale-110 cursor-pointer"
                        title={`Rate ${star} star`}
                      >
                        <Star 
                          className={`w-5 h-5 ${
                            star <= interactiveRating 
                              ? 'text-[#C87942] fill-[#C87942]' 
                              : 'text-[#E5E8E3]'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mini Democratic Poll Preview */}
                <div className="pt-2 border-t border-[#E5E8E3] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-[#242925]">
                      <Vote className="w-3.5 h-3.5 text-[#285943]" />
                      <span>Sunday Special Menu Poll</span>
                    </div>
                    <span className="text-[10px] text-[#6B716D]">Closes 9 PM</span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      { label: 'Pav Bhaji & Gulab Jamun', pct: 68 },
                      { label: 'Chole Bhature & Sweet Lassi', pct: 32 }
                    ].map((opt, idx) => (
                      <div
                        key={idx}
                        onClick={() => setVotedOption(idx)}
                        className={`p-2 rounded-md border text-xs cursor-pointer transition-colors ${
                          votedOption === idx 
                            ? 'bg-[#285943]/5 border-[#285943] text-[#242925]' 
                            : 'bg-white border-[#E5E8E3] text-[#6B716D]'
                        }`}
                      >
                        <div className="flex justify-between font-medium">
                          <span>{opt.label}</span>
                          <span className="font-bold">{opt.pct}%</span>
                        </div>
                        <div className="w-full bg-[#E5E8E3] h-1 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className="bg-[#285943] h-full transition-all duration-300" 
                            style={{ width: `${opt.pct}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-16 sm:py-20 border-b border-[#E5E8E3] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#285943]">
              Simple Operational Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#242925]">
              How MessMate Works
            </h2>
            <p className="text-sm text-[#6B716D]">
              Three straightforward steps eliminate friction between students and mess administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Scan */}
            <div className="p-6 rounded-xl bg-[#F8F7F3] border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-[#242925] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#285943]" />
                <span>Scan</span>
              </h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Scan the dining hall table QR code or open MessMate on your phone to see today’s published meal menu and serving timings.
              </p>
            </div>

            {/* Step 2: Rate */}
            <div className="p-6 rounded-xl bg-[#F8F7F3] border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-[#242925] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#C87942]" />
                <span>Rate</span>
              </h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Submit meal ratings in under 30 seconds. Score individual criteria like taste, freshness, hygiene, and portion size.
              </p>
            </div>

            {/* Step 3: Improve */}
            <div className="p-6 rounded-xl bg-[#F8F7F3] border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-[#242925] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#285943]" />
                <span>Improve</span>
              </h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Mess managers review daily analytics, resolve quality grievances, and adjust upcoming menus based on verified student input.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features" className="py-16 sm:py-20 border-b border-[#E5E8E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#285943]">
              Platform Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-[#242925]">
              Everything needed to run hostel dining smoothly
            </h2>
            <p className="text-sm text-[#6B716D]">
              Built specifically for universities, residential colleges, and hostel catering committees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943]/10 text-[#285943] flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#242925]">Daily Meal Schedules</h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Publish breakfast, lunch, snacks, and dinner schedules. Administrators can update dish substitutions instantaneously.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#C87942]/10 text-[#C87942] flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#242925]">Granular Criteria Ratings</h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Break down ratings by Taste, Food Quality, Hygiene, and Portion Quantity. Spot recurring recipe issues immediately.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943]/10 text-[#285943] flex items-center justify-center">
                <Vote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#242925]">Democratic Menu Polls</h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Host live voting on festival specials and weekend feasts. Single-vote enforcement ensures fair student participation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943]/10 text-[#285943] flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#242925]">Grievance Resolution</h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Structured categories for undercooked food, cleanliness, or timing concerns. Post official responses visible to students.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943]/10 text-[#285943] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#242925]">Dining Hall QR Posters</h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Generate printable dining hall posters. Scanning automatically directs students to the exact active mess.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-6 rounded-xl border border-[#E5E8E3] space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#285943]/10 text-[#285943] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#242925]">Multi-Mess Management</h3>
              <p className="text-xs text-[#6B716D] leading-relaxed">
                Manage multiple dining blocks under one college registration with isolated menus, feedback, and independent analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AUDIENCE COMPARISON: FOR STUDENTS & FOR MANAGEMENT */}
      <section className="py-16 sm:py-20 border-b border-[#E5E8E3] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#285943]">
              Designed for Campus Life
            </span>
            <h2 className="text-3xl font-extrabold text-[#242925]">
              Clarity for students, control for administration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* For Students */}
            <div className="p-6 rounded-xl bg-[#F8F7F3] border border-[#E5E8E3] space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E5E8E3]">
                <User className="w-5 h-5 text-[#285943]" />
                <h3 className="text-base font-bold text-[#242925]">For Hostel Residents</h3>
              </div>
              <ul className="space-y-3 text-xs text-[#242925]">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Check exact serving dishes before walking into the mess hall.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Submit honest taste and hygiene ratings without awkward paperwork.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Vote in democratic polls to choose upcoming Sunday menus.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Track complaint resolution with official warden replies.</span>
                </li>
              </ul>
            </div>

            {/* For Management */}
            <div className="p-6 rounded-xl bg-[#F8F7F3] border border-[#E5E8E3] space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E5E8E3]">
                <Shield className="w-5 h-5 text-[#285943]" />
                <h3 className="text-base font-bold text-[#242925]">For Mess Management</h3>
              </div>
              <ul className="space-y-3 text-xs text-[#242925]">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Quantified satisfaction metrics across individual meals and messes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Reduce catering food wastage with accurate pre-meal poll counts.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Monitor caterer hygiene and recipe standards systematically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#285943] shrink-0 mt-0.5" />
                  <span>Publish real-time announcements for timing changes and events.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-16 sm:py-20 border-b border-[#E5E8E3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#285943]">
              Institutional Plans
            </span>
            <h2 className="text-3xl font-extrabold text-[#242925]">
              Simple, transparent subscription pricing
            </h2>
            <p className="text-xs text-[#6B716D]">
              Free 14-day trial available during onboarding. Invoiced through institutional purchase order or digital subscription.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E5E8E3] shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#242925]">Starter Plan</h3>
                  <p className="text-xs text-[#6B716D] mt-1">Ideal for standalone hostels or single dining halls.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#242925]">₹1,500</span>
                  <span className="text-xs text-[#6B716D]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#242925] pt-2 border-t border-[#E5E8E3]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>One institution workspace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>One mess dining hall</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Student feedback & 5-criteria ratings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Weekly menu schedule manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Sunday feast food polls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Student grievance resolution tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Printable dining hall QR poster</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenAdminAuth}
                className="w-full py-2.5 rounded-lg border border-[#285943] text-[#285943] hover:bg-[#285943] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
              >
                Start Starter Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-6 sm:p-8 rounded-xl border-2 border-[#285943] shadow-sm flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 right-6 bg-[#285943] text-white px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#242925]">Pro Plan</h3>
                  <p className="text-xs text-[#6B716D] mt-1">For multi-block campuses and collegiate dining complexes.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#242925]">₹2,999</span>
                  <span className="text-xs text-[#6B716D]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-[#242925] pt-2 border-t border-[#E5E8E3]">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Up to 5 mess dining halls under one college</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>All Starter features included</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Individual mess analytics & comparison</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Combined college-level feedback dashboard</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Individual QR posters for each dining block</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#285943]" />
                    <span>Priority resolution support for wardens</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenAdminAuth}
                className="w-full py-2.5 rounded-lg bg-[#285943] text-white hover:bg-[#1E4433] transition-colors text-xs font-semibold shadow-xs cursor-pointer"
              >
                Get Started with Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E5E8E3]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#285943] text-white flex items-center justify-center font-bold text-xs">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-[#242925]">MessMate</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#6B716D]">
              <a href="#features" className="hover:text-[#285943]">Features</a>
              <a href="#how-it-works" className="hover:text-[#285943]">How It Works</a>
              <a href="#pricing" className="hover:text-[#285943]">Pricing</a>
              <button onClick={onOpenStudentAuth} className="hover:text-[#285943] cursor-pointer">Student Login</button>
              <button onClick={onOpenAdminAuth} className="hover:text-[#285943] cursor-pointer">Admin Login</button>
            </div>

            <div className="text-xs text-[#6B716D]">
              Support: <span className="font-medium text-[#242925]">support@messmate.edu</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B716D]">
            <p>© {new Date().getFullYear()} MessMate. Campus Mess Feedback & Menu Optimization Platform.</p>
            <p>Securely powered by Firebase Authentication & Cloud Firestore.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
