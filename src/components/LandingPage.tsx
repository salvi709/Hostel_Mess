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
  ChefHat, 
  BarChart3, 
  MessageSquare,
  Building,
  Check,
  ChevronDown,
  Sparkles,
  Sliders,
  CalendarCheck
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
  const { currentUser, isAdmin } = useAuth();
  const [interactiveRating, setInteractiveRating] = useState<number>(5);
  const [votedOption, setVotedOption] = useState<number>(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#292E2A] selection:bg-[#244D3C] selection:text-white">
      
      {/* 1. HERO SECTION */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines & Actions */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#244D3C] tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#244D3C]"></span>
                <span className="uppercase text-[11px] font-bold tracking-wider">Hostel Dining Quality Management</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-[#292E2A] leading-[1.12]">
                Better mess management starts with better feedback.
              </h1>

              <p className="text-base sm:text-lg text-[#737A74] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                A smarter way for students and institutions to improve everyday dining experiences.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 max-w-md mx-auto lg:mx-0">
                <button
                  onClick={currentUser && isAdmin ? onNavigateToDashboard : onOpenAdminAuth}
                  className="px-6 py-3.5 rounded-lg bg-[#244D3C] text-white hover:bg-[#1B3C2E] transition-colors font-semibold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Shield className="w-4 h-4 text-white/90" />
                  <span>Get Started as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={currentUser && !isAdmin ? onNavigateToDashboard : onOpenStudentAuth}
                  className="px-6 py-3.5 rounded-lg bg-white text-[#292E2A] border border-[#E4E5DE] hover:bg-[#EFEEE8] transition-colors font-semibold text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <User className="w-4 h-4 text-[#737A74]" />
                  <span>Explore as Student</span>
                </button>
              </div>

              {/* Quiet Trust Points */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-[#737A74]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                  <span>Institutional Firebase Auth</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                  <span>Verified Student Reviews</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                  <span>Single-Click QR Setup</span>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Application Preview (Enterprise SaaS Mock) */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-xl border border-[#E4E5DE] shadow-xs overflow-hidden max-w-lg mx-auto">
                {/* Application Chrome Header */}
                <div className="px-5 py-3.5 bg-[#EFEEE8] border-b border-[#E4E5DE] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E4E5DE]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E4E5DE]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E4E5DE]" />
                    <span className="text-xs font-semibold text-[#292E2A] ml-2">
                      Hostel 12 Dining Hall · Live Portal
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-[#244D3C] bg-[#244D3C]/10 px-2 py-0.5 rounded">
                    Lunch Active
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Top Analytics Snapshot Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE]">
                      <span className="text-[10px] text-[#737A74] uppercase tracking-wider font-semibold block">Today's Score</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-xl font-extrabold text-[#292E2A] tabular-nums">4.7</span>
                        <span className="text-[11px] text-[#B77950] font-semibold">★ / 5.0</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE]">
                      <span className="text-[10px] text-[#737A74] uppercase tracking-wider font-semibold block">Responses</span>
                      <div className="text-xl font-extrabold text-[#292E2A] tabular-nums mt-0.5">
                        342
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE]">
                      <span className="text-[10px] text-[#737A74] uppercase tracking-wider font-semibold block">Hygiene Rating</span>
                      <div className="text-xl font-extrabold text-[#244D3C] tabular-nums mt-0.5">
                        98%
                      </div>
                    </div>
                  </div>

                  {/* Meal Card Preview */}
                  <div className="p-4 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-semibold text-[#244D3C] uppercase tracking-wider">
                          Today's Lunch Menu · 12:00 PM – 2:15 PM
                        </div>
                        <h4 className="text-sm font-bold text-[#292E2A] mt-0.5">
                          Paneer Butter Masala &amp; Dal Tadka
                        </h4>
                        <p className="text-xs text-[#737A74] mt-1 leading-snug">
                          Steamed Jeera Rice, Whole Wheat Phulkas, Roasted Papad, Cucumber Raita &amp; Boondi Ladoo.
                        </p>
                      </div>
                    </div>

                    {/* Criteria Ratings Breakdown */}
                    <div className="grid grid-cols-4 gap-2 pt-2.5 border-t border-[#E4E5DE] text-center text-[10px]">
                      <div>
                        <span className="text-[#737A74] block">Taste</span>
                        <span className="font-bold text-[#292E2A] tabular-nums">4.8 ★</span>
                      </div>
                      <div>
                        <span className="text-[#737A74] block">Freshness</span>
                        <span className="font-bold text-[#292E2A] tabular-nums">4.9 ★</span>
                      </div>
                      <div>
                        <span className="text-[#737A74] block">Quantity</span>
                        <span className="font-bold text-[#292E2A] tabular-nums">4.6 ★</span>
                      </div>
                      <div>
                        <span className="text-[#737A74] block">Hygiene</span>
                        <span className="font-bold text-[#292E2A] tabular-nums">4.9 ★</span>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Rating Demo */}
                  <div className="p-3.5 rounded-lg border border-[#E4E5DE] bg-white space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#292E2A]">Rate your lunch experience</span>
                      <span className="text-[11px] text-[#737A74] tabular-nums">{interactiveRating} of 5 stars</span>
                    </div>
                    <div className="flex items-center justify-between gap-1 p-1.5 rounded-md bg-[#F6F4EE]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setInteractiveRating(star)}
                          className="p-1 hover:scale-105 transition-transform cursor-pointer"
                          title={`Rate ${star} stars`}
                        >
                          <Star 
                            className={`w-5 h-5 ${
                              star <= interactiveRating 
                                ? 'text-[#B77950] fill-[#B77950]' 
                                : 'text-[#E4E5DE]'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Democratic Menu Poll Preview */}
                  <div className="p-3.5 rounded-lg border border-[#E4E5DE] bg-white space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-[#292E2A]">
                        <Vote className="w-3.5 h-3.5 text-[#244D3C]" />
                        <span>Sunday Special Feast Vote</span>
                      </div>
                      <span className="text-[10px] text-[#737A74] font-medium">Closes 9:00 PM</span>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        { label: 'Pav Bhaji with Gulab Jamun', pct: 68 },
                        { label: 'Chole Bhature with Sweet Lassi', pct: 32 }
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => setVotedOption(idx)}
                          className={`p-2.5 rounded-md border text-xs cursor-pointer transition-colors ${
                            votedOption === idx 
                              ? 'bg-[#244D3C]/5 border-[#244D3C] text-[#292E2A]' 
                              : 'bg-white border-[#E4E5DE] text-[#737A74] hover:border-[#737A74]'
                          }`}
                        >
                          <div className="flex justify-between items-center font-medium">
                            <span>{item.label}</span>
                            <span className="font-bold tabular-nums text-[#292E2A]">{item.pct}%</span>
                          </div>
                          <div className="w-full bg-[#E4E5DE] h-1.5 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="bg-[#244D3C] h-full transition-all duration-300"
                              style={{ width: `${item.pct}%` }} 
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
        </div>
      </section>

      {/* 2. HOW IT WORKS (Clean Editorial Numbering) */}
      <section id="how-it-works" className="py-20 border-b border-[#E4E5DE] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C]">
              Operational Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-[#292E2A]">
              How MessMate Works
            </h2>
            <p className="text-sm text-[#737A74] leading-relaxed">
              Three straightforward steps eliminate friction between student diners, mess supervisors, and collegiate wardens.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Scan */}
            <div className="p-8 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-4">
              <div className="text-xs font-bold tracking-widest text-[#244D3C] font-mono">
                01 — SCAN
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] flex items-center gap-2">
                <QrCode className="w-5 h-5 text-[#244D3C]" />
                <span>Instant Dining Access</span>
              </h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Students scan table QR stands in the dining hall or open MessMate on their phone to see live serving dishes, portion guidelines, and meal hours.
              </p>
            </div>

            {/* Step 2: Rate */}
            <div className="p-8 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-4">
              <div className="text-xs font-bold tracking-widest text-[#B77950] font-mono">
                02 — RATE
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] flex items-center gap-2">
                <Star className="w-5 h-5 text-[#B77950]" />
                <span>Structured Feedback</span>
              </h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Rate meals in under 30 seconds across taste, quality, quantity, and hygiene. AI-validated written notes keep submissions focused on dining.
              </p>
            </div>

            {/* Step 3: Improve */}
            <div className="p-8 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-4">
              <div className="text-xs font-bold tracking-widest text-[#244D3C] font-mono">
                03 — IMPROVE
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#244D3C]" />
                <span>Data-Driven Quality</span>
              </h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Mess managers track daily ratings, resolve student grievances with tracked notes, and schedule upcoming menus based on verified preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES */}
      <section id="features" className="py-20 border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C]">
              Enterprise Features
            </span>
            <h2 className="text-3xl font-extrabold text-[#292E2A]">
              Comprehensive dining management for collegiate campuses
            </h2>
            <p className="text-sm text-[#737A74]">
              Built specifically for university administrations, residential colleges, and hostel catering committees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Digital Menu Management */}
            <div className="bg-white p-7 rounded-xl border border-[#E4E5DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#292E2A]">Digital Menu Management</h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Schedule recurring weekly breakfasts, lunches, evening snacks, and dinners. Push immediate substitutions whenever raw material deliveries change.
              </p>
            </div>

            {/* Feature 2: Student Meal Ratings */}
            <div className="bg-white p-7 rounded-xl border border-[#E4E5DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#B77950]/10 text-[#B77950] flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#292E2A]">Student Meal Ratings</h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Collect granular scores for Taste, Food Quality, Portion Quantity, and Kitchen Hygiene to identify recipe inconsistencies before they escalate.
              </p>
            </div>

            {/* Feature 3: Feedback Analytics */}
            <div className="bg-white p-7 rounded-xl border border-[#E4E5DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#292E2A]">Feedback Analytics</h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Visualize multi-week trends, meal course distribution, and contractor SLA compliance through real-time Firestore aggregation.
              </p>
            </div>

            {/* Feature 4: Polls & Announcements */}
            <div className="bg-white p-7 rounded-xl border border-[#E4E5DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <Vote className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#292E2A]">Polls &amp; Announcements</h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Gather democratic student votes on festival menus and publish urgent timing updates directly to student dashboards with priority tags.
              </p>
            </div>

            {/* Feature 5: Multi-Mess Architecture */}
            <div className="bg-white p-7 rounded-xl border border-[#E4E5DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#292E2A]">Multiple Mess Management</h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Administer multiple hostel blocks under a unified institution workspace with isolated menus, staff roles, and independent quality reports.
              </p>
            </div>

            {/* Feature 6: QR-Based Table Access */}
            <div className="bg-white p-7 rounded-xl border border-[#E4E5DE] space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#292E2A]">QR-Based Access</h3>
              <p className="text-xs text-[#737A74] leading-relaxed">
                Generate high-resolution printable table posters. Students scan to open their specific dining block without manually searching directories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AUDIENCE VALUE: FOR STUDENTS & INSTITUTIONS */}
      <section className="py-20 border-b border-[#E4E5DE] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C]">
              Institutional Alignment
            </span>
            <h2 className="text-3xl font-extrabold text-[#292E2A]">
              Designed for students, trusted by administrators
            </h2>
            <p className="text-sm text-[#737A74]">
              Clear benefits for resident students and university administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* For Students */}
            <div className="p-8 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4E5DE]">
                <User className="w-5 h-5 text-[#244D3C]" />
                <h3 className="text-base font-bold text-[#292E2A]">For Student Residents</h3>
              </div>
              <ul className="space-y-3.5 text-xs text-[#292E2A]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">View accurate daily menus and timings before walking to the mess hall.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Submit ratings and grievances privately without paperwork or awkward confrontations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Vote democratically in upcoming holiday feast and weekend menu polls.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Track grievance resolution with official responses posted by mess wardens.</span>
                </li>
              </ul>
            </div>

            {/* For Institutions */}
            <div className="p-8 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E4E5DE]">
                <Shield className="w-5 h-5 text-[#244D3C]" />
                <h3 className="text-base font-bold text-[#292E2A]">For College Management</h3>
              </div>
              <ul className="space-y-3.5 text-xs text-[#292E2A]">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Quantify catering vendor quality with real-time empirical satisfaction metrics.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Minimize catering food waste through accurate pre-meal student headcounts and polls.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Maintain high hygiene and temperature benchmarks with verifiable student oversight.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">Manage multiple dining complexes and hostels under a single administrative account.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="py-20 border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C]">
              Subscription Plans
            </span>
            <h2 className="text-3xl font-extrabold text-[#292E2A]">
              Transparent institutional pricing
            </h2>
            <p className="text-sm text-[#737A74]">
              Flexible plans for single hostels and multi-block university campuses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Starter Plan: ₹1,500/month */}
            <div className="bg-white p-8 rounded-xl border border-[#E4E5DE] shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#292E2A]">Starter</h3>
                  <p className="text-xs text-[#737A74] mt-1">One college, one dining hall.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#292E2A] tabular-nums">₹1,500</span>
                  <span className="text-xs text-[#737A74]">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#292E2A] pt-4 border-t border-[#E4E5DE]">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>1 College institution workspace</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>1 Mess dining hall location</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Daily menus &amp; instant dish updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>4-criteria student ratings (Taste, Hygiene, etc.)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>LLM-screened relevant review pipeline</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Student grievance resolution tracker</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Table QR stand poster download</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenAdminAuth}
                className="w-full py-2.5 rounded-lg border border-[#244D3C] text-[#244D3C] hover:bg-[#244D3C] hover:text-white transition-colors text-xs font-semibold cursor-pointer"
              >
                Start Starter Trial
              </button>
            </div>

            {/* Pro Plan: ₹2,999/month */}
            <div className="bg-white p-8 rounded-xl border-2 border-[#244D3C] shadow-sm flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 right-6 bg-[#244D3C] text-white px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                Recommended
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#292E2A]">Pro</h3>
                  <p className="text-xs text-[#737A74] mt-1">One college, up to five messes.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#292E2A] tabular-nums">₹2,999</span>
                  <span className="text-xs text-[#737A74]">/ month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#292E2A] pt-4 border-t border-[#E4E5DE]">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>1 College institution workspace</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Up to 5 mess dining blocks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>All Starter features included</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Individual dining hall analytics &amp; comparison</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Dedicated QR poster for every hostel block</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Multi-hall caterer SLA tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#244D3C]" />
                    <span>Priority warden resolution workflow</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onOpenAdminAuth}
                className="w-full py-2.5 rounded-lg bg-[#244D3C] text-white hover:bg-[#1B3C2E] transition-colors text-xs font-semibold shadow-xs cursor-pointer"
              >
                Get Started with Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section id="faq" className="py-20 border-b border-[#E4E5DE] bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C]">
              FAQ
            </span>
            <h2 className="text-3xl font-extrabold text-[#292E2A]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-[#737A74]">
              Common questions about deploying MessMate in university dining halls.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How do students verify their identity?",
                a: "Students authenticate securely via campus email or Google Sign-In with Firebase Auth. Upon login, they select their college and assigned mess block without complex physical paperwork."
              },
              {
                q: "How does the LLM review validation work?",
                a: "When students submit optional written meal feedback, our secure backend uses Gemini to ensure comments are relevant to taste, hygiene, food quality, or dining hall service. Both positive and critical reviews are accepted if they provide genuine dining feedback."
              },
              {
                q: "Can a college administer multiple dining blocks?",
                a: "Yes. On the Pro plan, administrators manage up to 5 individual messes with separate weekly menus, dedicated table QR stands, and isolated feedback analytics under one college registration."
              },
              {
                q: "What hardware is required in the dining hall?",
                a: "No special hardware or point-of-sale terminals are needed. Administrators simply download the auto-generated QR code poster from their dashboard and display it on dining tables or entry boards."
              },
              {
                q: "How are student grievances handled?",
                a: "Students submit complaints categorized under hygiene, temperature, quantity, or service. Wardens and mess supervisors review submissions on their admin dashboard and record official resolution notes."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-bold text-[#292E2A]">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-[#737A74] shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-[#244D3C]' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-[#737A74] leading-relaxed border-t border-[#E4E5DE]/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. COMPLETE FOOTER */}
      <footer className="py-14 bg-[#F6F4EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[#E4E5DE]">
            
            {/* Branding Column */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#244D3C] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  <UtensilsCrossed className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-base text-[#292E2A]">MessMate</span>
              </div>
              <p className="text-xs text-[#737A74] max-w-sm leading-relaxed">
                Smart Hostel Mess Feedback and Menu Optimization Platform connecting student diners and collegiate administrations.
              </p>
            </div>

            {/* Navigation Column */}
            <div className="md:col-span-3 space-y-2">
              <h4 className="text-xs font-bold text-[#292E2A] uppercase tracking-wider">Product</h4>
              <ul className="space-y-1.5 text-xs text-[#737A74]">
                <li><a href="#features" className="hover:text-[#244D3C] transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-[#244D3C] transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-[#244D3C] transition-colors">Subscription Pricing</a></li>
                <li><a href="#faq" className="hover:text-[#244D3C] transition-colors">Frequently Asked Questions</a></li>
              </ul>
            </div>

            {/* Portals & Legal Column */}
            <div className="md:col-span-4 space-y-2">
              <h4 className="text-xs font-bold text-[#292E2A] uppercase tracking-wider">Portals &amp; Legal</h4>
              <ul className="space-y-1.5 text-xs text-[#737A74]">
                <li>
                  <button onClick={onOpenStudentAuth} className="hover:text-[#244D3C] transition-colors cursor-pointer">
                    Student Dining Portal
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAdminAuth} className="hover:text-[#244D3C] transition-colors cursor-pointer">
                    Mess Administrator Portal
                  </button>
                </li>
                <li>
                  <span className="text-[#737A74]">Contact: </span>
                  <a href="mailto:support@messmate.edu" className="font-medium text-[#292E2A] hover:underline">
                    support@messmate.edu
                  </a>
                </li>
                <li className="text-[11px] text-[#737A74] pt-1">
                  <span>Privacy Policy · Terms of Service</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737A74]">
            <p>© {new Date().getFullYear()} MessMate. All rights reserved.</p>
            <p>Built for collegiate residential dining halls.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
