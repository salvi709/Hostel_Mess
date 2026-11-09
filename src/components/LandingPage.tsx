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
  CalendarCheck,
  Clock,
  TrendingUp,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  HeartHandshake,
  AlertCircle,
  Eye,
  Smartphone,
  ChevronRight,
  CheckCircle,
  Layers,
  Send,
  Zap
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
  const [interactiveDishReaction, setInteractiveDishReaction] = useState<string>('Delicious & freshly prepared');
  const [votedPollChoice, setVotedPollChoice] = useState<number>(0);
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'student' | 'admin'>('student');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleRatingClick = (score: number) => {
    setInteractiveRating(score);
    if (score === 5) setInteractiveDishReaction('Delicious & freshly prepared');
    else if (score === 4) setInteractiveDishReaction('Good meal quality & taste');
    else if (score === 3) setInteractiveDishReaction('Average today • needs spice adjustment');
    else if (score === 2) setInteractiveDishReaction('Below expectation • warden alerted');
    else setInteractiveDishReaction('Poor quality • urgent inspection requested');
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    {
      q: 'How do students check the daily menu and rate meals?',
      a: 'Students simply scan the MessMate QR poster displayed at their hostel dining hall entrance or visit their campus portal URL on any smartphone. No mobile app download or app store installation is required. Today\'s live course schedule, meal timings, and instant 5-star rating forms open immediately in their browser.'
    },
    {
      q: 'How does MessMate ensure reviews are genuine and constructive?',
      a: 'MessMate employs a dual-tier validation pipeline. When students submit written remarks, our intelligent validation verifies that the feedback genuinely discusses food taste, hygiene, portion size, meal temperature, freshness, or dining hall service. Meaningless characters, casual greetings ("hi"), and spam are caught before submission, while both honest praise and critical complaints are protected.'
    },
    {
      q: 'Can a college manage multiple hostel dining halls under one account?',
      a: 'Yes. MessMate Pro provides multi-mess campus architecture. Administrators can configure multiple hostel dining halls (e.g., Hostel 12 Boys Mess, Hostel 14 Girls Mess, International Hostel Dining) with dedicated catering contractors, custom meal timings, individual menus, and isolated analytics under a unified college workspace.'
    },
    {
      q: 'How quickly do mess administrators receive student grievances?',
      a: 'In real time. Complaints filed in the Grievance & Suggestion Box appear instantly on the warden\'s dashboard. Administrators can review the complaint, post an official resolution reply, and mark the issue as "In Review" or "Resolved", which instantly reflects back on the student resident\'s screen.'
    },
    {
      q: 'Is there a free trial for colleges and institutions?',
      a: 'Yes. Every new college registration includes a 14-Day Full Demo Trial on either the Starter or Pro tier with no upfront credit card required. You can immediately create dining halls, publish weekly menus, generate QR posters, and test student reviews.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#292E2A] selection:bg-[#244D3C] selection:text-white font-body">
      
      {/* =========================================================================
          SECTION B — HERO: EDITORIAL HOSPITALITY IDENTITY
         ========================================================================= */}
      <section className="relative pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-[#E4E5DE] overflow-hidden">
        {/* Subtle architectural grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#E4E5DE_1px,transparent_1px)] [background-size:28px_28px] opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Column (7 cols): Editorial Typography & High-Conversion CTAs */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              
              {/* Refined Eyebrow Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E4E5DE] shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#244D3C] animate-pulse" />
                <span className="text-xs font-semibold text-[#244D3C] tracking-wide">
                  Smart Hostel Mess Feedback &amp; Menu Platform
                </span>
                <span className="text-[#E4E5DE]">|</span>
                <span className="text-[11px] font-medium text-[#777D76]">Campus Dining OS</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-[#292E2A] leading-[1.08] font-heading">
                Better food.<br />
                Better feedback.<br />
                <span className="text-[#244D3C]">Better mess experiences.</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-[#777D76] max-w-xl mx-auto lg:mx-0 leading-relaxed font-body">
                MessMate connects students and mess administrators through simple feedback, smarter menus and meaningful insights.
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 max-w-md mx-auto lg:mx-0">
                <button
                  onClick={() => handleScrollTo('how-it-works')}
                  className="px-6 py-3.5 rounded-lg bg-[#244D3C] text-white hover:bg-[#19382D] transition-all font-semibold text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore MessMate</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={currentUser && isAdmin ? onNavigateToDashboard : onOpenAdminAuth}
                  className="px-6 py-3.5 rounded-lg bg-white text-[#292E2A] border border-[#E4E5DE] hover:bg-[#E5E9E1]/50 transition-colors font-semibold text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#244D3C]" />
                  <span>Admin Portal</span>
                </button>
              </div>

              {/* Quick Institutional Micro-Proof */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#777D76]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                  <span>Zero student app install</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                  <span>Verified food reviews</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                  <span>Instant 14-day trial</span>
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Editorial Culinary & Product Composition */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[440px] lg:max-w-none">
                
                {/* Culinary Showcase Card with Organic Arched Aperture */}
                <div className="bg-white rounded-2xl p-5 shadow-lg border border-[#E4E5DE] relative overflow-hidden space-y-4">
                  
                  {/* Card Header: Live Mess Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#244D3C]/10 flex items-center justify-center text-[#244D3C]">
                        <ChefHat className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#292E2A] font-heading">Hostel 12 Central Mess</div>
                        <div className="text-[10px] text-[#777D76] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          <span>Lunch Service • 12:00 – 14:15</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#244D3C]/10 text-[#244D3C]">
                      Live
                    </span>
                  </div>

                  {/* Editorial Food Image Container (Rounded Culinary Aperture) */}
                  <div className="relative h-52 sm:h-60 rounded-xl overflow-hidden border border-[#E4E5DE]/80 group">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85" 
                      alt="Fresh nutritious meal bowl"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                    
                    {/* Floating Dish Badge on Image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#244D3C] text-white">
                          Today's Special
                        </span>
                        <h4 className="text-sm sm:text-base font-bold font-heading mt-1 leading-tight text-white drop-shadow-xs">
                          Dal Makhani, Jeera Rice &amp; Fresh Salad
                        </h4>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="flex items-center gap-1 bg-white/95 text-[#292E2A] px-2 py-1 rounded-md text-xs font-bold shadow-xs">
                          <span>4.8</span>
                          <Star className="w-3.5 h-3.5 fill-[#B77950] text-[#B77950]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Star Rating Simulator Widget */}
                  <div className="p-3.5 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#292E2A]">
                      <span>Rate today's lunch</span>
                      <span className="text-[11px] text-[#244D3C] font-mono tabular-nums font-bold">
                        {interactiveRating}.0 ★
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRatingClick(star)}
                            className="p-1 transition-transform hover:scale-120 cursor-pointer"
                            title={`Rate ${star} Stars`}
                          >
                            <Star 
                              className={`w-6 h-6 ${
                                star <= interactiveRating 
                                  ? 'fill-[#B77950] text-[#B77950]' 
                                  : 'text-[#E4E5DE]'
                              }`}
                            />
                          </button>
                        ))}
                      </div>

                      <span className="text-[11px] font-medium text-[#777D76] truncate max-w-[150px]">
                        {interactiveDishReaction}
                      </span>
                    </div>

                    {/* Criteria Breakdown Indicators */}
                    <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-medium text-[#777D76]">
                      <div className="bg-white p-1.5 rounded-md border border-[#E4E5DE] flex justify-between">
                        <span>Taste</span>
                        <b className="text-[#244D3C] font-mono">4.9★</b>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-[#E4E5DE] flex justify-between">
                        <span>Hygiene</span>
                        <b className="text-[#244D3C] font-mono">5.0★</b>
                      </div>
                      <div className="bg-white p-1.5 rounded-md border border-[#E4E5DE] flex justify-between">
                        <span>Portion</span>
                        <b className="text-[#244D3C] font-mono">4.8★</b>
                      </div>
                    </div>
                  </div>

                  {/* Verified Student Feedback Snippet */}
                  <div className="p-3 rounded-xl bg-white border border-[#E4E5DE] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#244D3C] text-white text-[10px] font-bold flex items-center justify-center">
                          A
                        </div>
                        <span className="font-semibold text-[#292E2A] text-[11px]">
                          Ananya R. <span className="text-[#777D76] font-normal">• Hostel 12</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        ✓ Verified Review
                      </span>
                    </div>
                    <p className="text-[11px] text-[#777D76] italic">
                      "Today's dal was cooked to perfection and spices were spot on. Hygiene in the serving line was excellent!"
                    </p>
                  </div>

                </div>

                {/* Floating QR Check-in Badge */}
                <div className="hidden sm:flex absolute -bottom-5 -left-6 bg-white p-3 rounded-xl shadow-md border border-[#E4E5DE] items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-10 h-10 rounded-lg bg-[#244D3C] text-white flex items-center justify-center">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#292E2A] font-heading">Dining Hall QR</div>
                    <div className="text-[10px] text-[#777D76]">Scan to rate today's meal</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — TRUST / VALUE STRIP
         ========================================================================= */}
      <section className="bg-white border-b border-[#E4E5DE] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E4E5DE]">
            
            {/* Pillar 1 */}
            <div className="pt-6 md:pt-0 md:px-6 first:pl-0 space-y-2">
              <div className="flex items-center gap-2 text-[#244D3C]">
                <MessageSquare className="w-4 h-4 text-[#244D3C]" />
                <span className="text-xs font-bold uppercase tracking-wider font-heading">Student Feedback</span>
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Direct, friction-free resident voice</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Instant QR check-in and multi-criteria dish ratings empower students to share honest meal thoughts without paperwork.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="pt-6 md:pt-0 md:px-6 space-y-2">
              <div className="flex items-center gap-2 text-[#244D3C]">
                <TrendingUp className="w-4 h-4 text-[#244D3C]" />
                <span className="text-xs font-bold uppercase tracking-wider font-heading">Smarter Mess Decisions</span>
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Data-driven menu intelligence</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Real-time rating analytics reveal meal popularity patterns, reduce kitchen food waste by up to 28%, and guide procurement.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="pt-6 md:pt-0 md:px-6 last:pr-0 space-y-2">
              <div className="flex items-center gap-2 text-[#244D3C]">
                <ShieldCheck className="w-4 h-4 text-[#244D3C]" />
                <span className="text-xs font-bold uppercase tracking-wider font-heading">Better Dining Experiences</span>
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Continuous quality accountability</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Structured feedback loops hold catering contractors to high hygiene standards and resolve student grievances proactively.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — HOW IT WORKS: 3 DISTINCT BEAUTIFUL STEPS
         ========================================================================= */}
      <section id="how-it-works" className="py-20 lg:py-28 border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C] px-3 py-1 rounded-md bg-[#244D3C]/10">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              How MessMate elevates everyday dining
            </h2>
            <p className="text-sm text-[#777D76]">
              A seamless, modern workflow connecting hostel residents and campus mess management.
            </p>
          </div>

          {/* 3 Visually Varied Step Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Step 1: Scan */}
            <div className="bg-white rounded-2xl p-7 border border-[#E4E5DE] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-[#244D3C] font-heading font-mono">01</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#B77950] px-2.5 py-0.5 rounded-full bg-[#B77950]/15">
                    Scan
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                  Scan the mess QR code
                </h3>
                <p className="text-xs text-[#777D76] leading-relaxed">
                  Scan the mess QR code to access your meal experience. Every hostel dining hall is equipped with printed table posters.
                </p>
              </div>

              {/* Step 1 Visual preview */}
              <div className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white p-1 border border-[#E4E5DE] shrink-0">
                    <QrCode className="w-full h-full text-[#244D3C]" />
                  </div>
                  <div className="text-xs space-y-0.5">
                    <div className="font-bold text-[#292E2A]">messmate.edu/dining</div>
                    <div className="text-[11px] text-[#777D76]">Instant browser launch</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">✓ No app download needed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Share */}
            <div className="bg-white rounded-2xl p-7 border border-[#E4E5DE] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-[#244D3C] font-heading font-mono">02</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C] px-2.5 py-0.5 rounded-full bg-[#244D3C]/10">
                    Share
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                  Rate your meal &amp; share feedback
                </h3>
                <p className="text-xs text-[#777D76] leading-relaxed">
                  Rate your meal and submit meaningful feedback. Score overall satisfaction plus specific criteria: taste, hygiene, portion size, and freshness.
                </p>
              </div>

              {/* Step 2 Visual preview */}
              <div className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#292E2A]">
                  <span>Criterion Breakdown</span>
                  <span className="text-[#244D3C]">4.8 ★</span>
                </div>
                <div className="space-y-1.5 text-[10px] text-[#777D76]">
                  <div className="flex justify-between bg-white px-2 py-1 rounded border border-[#E4E5DE]">
                    <span>Taste &amp; Seasoning</span>
                    <b className="text-[#292E2A]">4.9 ★</b>
                  </div>
                  <div className="flex justify-between bg-white px-2 py-1 rounded border border-[#E4E5DE]">
                    <span>Mess Cleanliness</span>
                    <b className="text-[#292E2A]">5.0 ★</b>
                  </div>
                </div>
                <div className="text-[10px] text-[#244D3C] font-semibold flex items-center gap-1 pt-1">
                  <CheckCircle className="w-3 h-3 text-[#244D3C]" />
                  <span>AI Review Validation active</span>
                </div>
              </div>
            </div>

            {/* Step 3: Improve */}
            <div className="bg-white rounded-2xl p-7 border border-[#E4E5DE] shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-extrabold text-[#244D3C] font-heading font-mono">03</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C] px-2.5 py-0.5 rounded-full bg-[#244D3C]/10">
                    Improve
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                  Help administrators improve meals
                </h3>
                <p className="text-xs text-[#777D76] leading-relaxed">
                  Help administrators understand student preferences and improve meals. Wardens respond to grievances and optimize weekly recipes.
                </p>
              </div>

              {/* Step 3 Visual preview */}
              <div className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#292E2A]">Warden Response Loop</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Resolved
                  </span>
                </div>
                <p className="text-[11px] text-[#777D76] italic bg-white p-2 rounded-lg border border-[#E4E5DE]">
                  "Kitchen roster adjusted. Hot rotis now served in smaller batches during peak dining."
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION E — PRODUCT EXPERIENCE: REALISTIC DUAL-PANE SHOWCASE
         ========================================================================= */}
      <section className="py-20 lg:py-28 border-b border-[#E4E5DE] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C] px-3 py-1 rounded-md bg-[#244D3C]/10">
              Interactive Product Tour
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              Two powerful interfaces. One unified platform.
            </h2>
            <p className="text-sm text-[#777D76]">
              Explore the student dining experience alongside the administrative analytics suite.
            </p>

            {/* Switcher Tabs */}
            <div className="pt-2 inline-flex p-1 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] text-xs font-semibold">
              <button
                onClick={() => setActiveShowcaseTab('student')}
                className={`px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeShowcaseTab === 'student'
                    ? 'bg-[#244D3C] text-white shadow-xs'
                    : 'text-[#777D76] hover:text-[#292E2A]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Student Resident View</span>
              </button>
              <button
                onClick={() => setActiveShowcaseTab('admin')}
                className={`px-5 py-2.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                  activeShowcaseTab === 'admin'
                    ? 'bg-[#244D3C] text-white shadow-xs'
                    : 'text-[#777D76] hover:text-[#292E2A]'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Administrator Dashboard</span>
              </button>
            </div>
          </div>

          {/* Product Frame Showcase */}
          <div className="bg-[#F6F4EE] rounded-2xl border border-[#E4E5DE] p-6 lg:p-8 shadow-sm">
            
            {activeShowcaseTab === 'student' ? (
              /* STUDENT PANE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left side details */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#244D3C]">
                      Mobile-First Resident Interface
                    </span>
                    <h3 className="text-2xl font-bold text-[#292E2A] font-heading">
                      Daily menus, live polls &amp; instant ratings in seconds.
                    </h3>
                    <p className="text-xs text-[#777D76] leading-relaxed">
                      Residents can check today's timetable across Breakfast, Lunch, Snacks, and Dinner, submit validated ratings, vote on Sunday feasts, and file grievances directly to the warden.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#292E2A]">Instant Day Selector: </span>
                        <span className="text-[#777D76]">Browse weekly scheduled menus (Mon–Sun) with exact service hours.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#292E2A]">Democratic Food Polls: </span>
                        <span className="text-[#777D76]">Cast votes on weekend dessert choices and special festival recipes.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#292E2A]">Closed-Loop Grievance Tracker: </span>
                        <span className="text-[#777D76]">Track warden response updates (Submitted, In Review, Resolved) in real time.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onOpenStudentAuth}
                    className="px-5 py-2.5 rounded-lg bg-[#244D3C] text-white text-xs font-semibold hover:bg-[#19382D] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
                  >
                    <span>Launch Student Demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right side live interactive preview card */}
                <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-[#E4E5DE] shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-[#244D3C]" />
                      <span className="text-xs font-bold text-[#292E2A] font-heading">Today's Meal Timetable</span>
                    </div>
                    <div className="flex gap-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, 4).map((d, i) => (
                        <span key={d} className={`text-[10px] px-2 py-0.5 rounded font-semibold ${i === 1 ? 'bg-[#244D3C] text-white' : 'text-[#777D76]'}`}>
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Meal tab */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#F6F4EE] rounded-lg text-xs font-semibold text-center">
                    <span className="py-1.5 text-[#777D76]">Breakfast</span>
                    <span className="py-1.5 bg-white text-[#244D3C] rounded shadow-2xs">Lunch</span>
                    <span className="py-1.5 text-[#777D76]">Snacks</span>
                    <span className="py-1.5 text-[#777D76]">Dinner</span>
                  </div>

                  {/* Active Course Card */}
                  <div className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#244D3C] uppercase tracking-wider text-[10px]">Lunch Course</span>
                      <span className="text-[11px] text-[#777D76]">12:00 – 14:15</span>
                    </div>
                    <div className="text-sm font-bold text-[#292E2A] font-heading">
                      Paneer Butter Masala, Yellow Dal Tadka, Steamed Basmati Rice &amp; Phulkas
                    </div>
                    <div className="text-[11px] text-[#777D76]">
                      Special: Boondi Raita &amp; Gulab Jamun
                    </div>
                  </div>

                  {/* Poll Sample */}
                  <div className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#292E2A]">Democratic Food Poll: Sunday Special</span>
                      <span className="text-[10px] font-bold text-[#244D3C]">482 votes</span>
                    </div>
                    <div className="space-y-1.5">
                      <div 
                        onClick={() => setVotedPollChoice(0)}
                        className={`p-2.5 rounded-lg border text-xs flex justify-between items-center cursor-pointer ${
                          votedPollChoice === 0 ? 'border-[#244D3C] bg-white ring-1 ring-[#244D3C]' : 'border-[#E4E5DE] bg-white'
                        }`}
                      >
                        <span className="font-semibold text-[#292E2A]">A. Chole Bhature with Sweet Lassi</span>
                        <span className="text-[#244D3C] font-bold font-mono">68%</span>
                      </div>
                      <div 
                        onClick={() => setVotedPollChoice(1)}
                        className={`p-2.5 rounded-lg border text-xs flex justify-between items-center cursor-pointer ${
                          votedPollChoice === 1 ? 'border-[#244D3C] bg-white ring-1 ring-[#244D3C]' : 'border-[#E4E5DE] bg-white'
                        }`}
                      >
                        <span className="font-semibold text-[#292E2A]">B. Pav Bhaji with Gulab Jamun</span>
                        <span className="text-[#777D76] font-bold font-mono">32%</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            ) : (
              /* ADMIN PANE */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left side details */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#244D3C]">
                      Administrative Intelligence Suite
                    </span>
                    <h3 className="text-2xl font-bold text-[#292E2A] font-heading">
                      Complete visibility into food satisfaction &amp; dining operations.
                    </h3>
                    <p className="text-xs text-[#777D76] leading-relaxed">
                      Wardens and mess committees get real-time metrics across multiple hostel dining halls, track contractor SLA compliance, manage weekly menus, and resolve grievances before escalation.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#292E2A]">Multi-Mess Campus Management: </span>
                        <span className="text-[#777D76]">Switch seamlessly between Hostel 12, Hostel 14, and Central Dining.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#292E2A]">Catering Contractor Accountability: </span>
                        <span className="text-[#777D76]">Quantifiable taste and hygiene scorecards backed by verified resident data.</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#292E2A]">Printable QR Posters: </span>
                        <span className="text-[#777D76]">One-click export of high-resolution dining entrance QR codes.</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={onOpenAdminAuth}
                    className="px-5 py-2.5 rounded-lg bg-[#244D3C] text-white text-xs font-semibold hover:bg-[#19382D] transition-colors cursor-pointer shadow-xs inline-flex items-center gap-2"
                  >
                    <span>Open Admin Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right side live interactive preview card */}
                <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-[#E4E5DE] shadow-xs space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
                    <div className="space-y-0.5">
                      <div className="text-[10px] text-[#777D76]">Campus / IIT Bombay / Central Dining Hall</div>
                      <div className="text-xs font-bold text-[#292E2A] font-heading">Quality Scorecards &amp; Grievance Inbox</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Live Firestore Sync
                    </span>
                  </div>

                  {/* 4 Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE]">
                      <div className="text-[10px] text-[#777D76]">Satisfaction</div>
                      <div className="text-lg font-bold text-[#244D3C] font-mono">4.82 ★</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE]">
                      <div className="text-[10px] text-[#777D76]">Taste Rating</div>
                      <div className="text-lg font-bold text-[#244D3C] font-mono">4.75 ★</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE]">
                      <div className="text-[10px] text-[#777D76]">Hygiene Score</div>
                      <div className="text-lg font-bold text-[#244D3C] font-mono">4.92 ★</div>
                    </div>
                    <div className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE]">
                      <div className="text-[10px] text-[#777D76]">Total Reviews</div>
                      <div className="text-lg font-bold text-[#244D3C] font-mono">1,420</div>
                    </div>
                  </div>

                  {/* Urgent Grievances Queue */}
                  <div className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-[#292E2A]">
                      <span>Urgent Grievance Queue (1 pending)</span>
                      <span className="text-[10px] text-[#244D3C] underline cursor-pointer">Quick Resolve</span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-[#E4E5DE] text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#292E2A]">Water cooler filter replacement</span>
                        <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          In Review
                        </span>
                      </div>
                      <p className="text-[11px] text-[#777D76]">
                        "The RO dispenser near block C was making noise during dinner service."
                      </p>
                      <div className="text-[10px] text-[#244D3C] font-semibold pt-1">
                        Warden Response: Maintenance team scheduled for 10:00 AM inspection.
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION F — FEATURES: ASYMMETRICAL BENTO GRID
         ========================================================================= */}
      <section id="features" className="py-20 lg:py-28 border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C] px-3 py-1 rounded-md bg-[#244D3C]/10">
              Complete Feature Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              Purpose-built tools for collegiate dining
            </h2>
            <p className="text-sm text-[#777D76]">
              Engineered to replace chaotic WhatsApp groups and paper suggestion boxes with a single operational OS.
            </p>
          </div>

          {/* Asymmetrical Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1: Multi-Criteria Feedback */}
            <div className="bg-white p-7 rounded-2xl border border-[#E4E5DE] shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Meal Feedback &amp; Ratings</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Multi-dimensional rating across taste, hygiene, portion size, and freshness. Built-in AI validation filters random spam while keeping constructive negative and positive feedback safe.
              </p>
              <div className="pt-2 text-[10px] font-bold text-[#244D3C] flex items-center gap-1">
                <span>Validated with Google Gemini AI</span>
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            {/* Feature 2: Digital Menus */}
            <div className="bg-white p-7 rounded-2xl border border-[#E4E5DE] shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Dynamic Digital Menus</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Weekly schedules updated in seconds with exact serving timings, dietary tags, and dish allergens. Synchronizes in real time to all resident screens across the campus.
              </p>
              <div className="pt-2 text-[10px] font-bold text-[#244D3C]">
                Mon–Sun schedule planner • 4 meal courses
              </div>
            </div>

            {/* Feature 3: Polls */}
            <div className="bg-white p-7 rounded-2xl border border-[#E4E5DE] shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <Vote className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Polls &amp; Student Opinions</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Empower student residents to democratically vote on Sunday feast menus, festival specials, and regional delicacies with live percentage tally bars.
              </p>
              <div className="pt-2 text-[10px] font-bold text-[#244D3C]">
                Democratic single-choice voting • Live results
              </div>
            </div>

            {/* Feature 4: Announcements */}
            <div className="bg-white p-7 rounded-2xl border border-[#E4E5DE] shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Dining Notices &amp; Broadcasts</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Publish time-sensitive alerts for exam dining schedules, holiday timing shifts, and festival feast menus directly onto resident dashboard banners.
              </p>
              <div className="pt-2 text-[10px] font-bold text-[#244D3C]">
                High-priority notice ticker • Instant broadcast
              </div>
            </div>

            {/* Feature 5: Admin Analytics */}
            <div className="bg-white p-7 rounded-2xl border border-[#E4E5DE] shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Admin Analytics &amp; Trends</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Deep-dive into multi-week satisfaction trajectories, meal-type distributions, and catering contractor scorecards to ensure consistent quality standards.
              </p>
              <div className="pt-2 text-[10px] font-bold text-[#244D3C]">
                Detailed feedback logs • Time-window filters
              </div>
            </div>

            {/* Feature 6: Mess Management */}
            <div className="bg-white p-7 rounded-2xl border border-[#E4E5DE] shadow-xs space-y-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Multi-Mess Campus Management</h3>
              <p className="text-xs text-[#777D76] leading-relaxed">
                Manage multiple dining halls under one institutional workspace. Assign dedicated caterers, individual QR codes, and custom timings per hostel.
              </p>
              <div className="pt-2 text-[10px] font-bold text-[#244D3C]">
                Role-based access • Multi-hall campus support
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION G — BENEFITS: DEEP FOREST-GREEN SECTION (#19382D)
         ========================================================================= */}
      <section id="benefits" className="py-20 lg:py-28 bg-[#19382D] text-[#F6F4EE] relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#244D3C]/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B77950] px-3 py-1 rounded-md bg-[#B77950]/20">
              Institutional Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading text-white">
              Built for every stakeholder on campus
            </h2>
            <p className="text-sm text-[#E5E9E1]/80">
              Bridging the gap between resident expectations and kitchen execution.
            </p>
          </div>

          {/* Dual Perspective Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Student Perspective Card */}
            <div className="bg-[#244D3C]/40 border border-[#E5E9E1]/20 rounded-2xl p-8 space-y-6 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">For Student Residents</h3>
                  <p className="text-xs text-[#E5E9E1]/70">Make your voice heard at every meal</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-[#E5E9E1]/90">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Zero friction:</b> No mobile app to download. Simply scan the table QR code on your phone to view the menu.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Verified impact:</b> Constructive feedback is protected and delivered directly to the mess committee and warden.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Democratic voting:</b> Influence weekend feasts and festival dinners through real-time student polls.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Closed-loop accountability:</b> View official warden replies and tracking status on your grievances.</span>
                </div>
              </div>

              <button
                onClick={onOpenStudentAuth}
                className="w-full py-3 rounded-lg bg-white text-[#19382D] font-semibold text-xs hover:bg-[#F6F4EE] transition-colors cursor-pointer"
              >
                Join as Student Resident
              </button>
            </div>

            {/* Administrator Perspective Card */}
            <div className="bg-[#244D3C]/40 border border-[#E5E9E1]/20 rounded-2xl p-8 space-y-6 backdrop-blur-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">For College Administrators</h3>
                  <p className="text-xs text-[#E5E9E1]/70">Make informed decisions with verified student data</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-[#E5E9E1]/90">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Contractor governance:</b> Track caterer food quality, seasoning, and hygiene compliance with hard data.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Cut food wastage:</b> Identify unpopular dishes and optimize weekly raw material procurement.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Prevent escalations:</b> Handle student grievances inside a private, structured resolution queue before unrest.</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
                  <span><b>Multi-hall oversight:</b> Monitor all hostel messes across the campus from a single central command center.</span>
                </div>
              </div>

              <button
                onClick={onOpenAdminAuth}
                className="w-full py-3 rounded-lg bg-[#B77950] text-white font-semibold text-xs hover:bg-[#A36640] transition-colors cursor-pointer"
              >
                Register Campus as Admin
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION H — PRICING: CLEAN INSTITUTIONAL PLANS
         ========================================================================= */}
      <section id="pricing" className="py-20 lg:py-28 border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C] px-3 py-1 rounded-md bg-[#244D3C]/10">
              Institutional Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              Transparent plans for any campus scale
            </h2>
            <p className="text-sm text-[#777D76]">
              Includes our 14-day full demo trial. No credit card required to start.
            </p>
          </div>

          {/* Pricing Cards Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Starter Plan */}
            <div className="bg-white rounded-2xl p-8 border border-[#E4E5DE] shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#292E2A] font-heading">Starter Plan</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F6F4EE] text-[#777D76] border border-[#E4E5DE]">
                    Single Mess
                  </span>
                </div>
                <p className="text-xs text-[#777D76]">
                  Ideal for standalone colleges or individual hostel dining halls.
                </p>
                <div className="pt-2">
                  <div className="text-3xl font-extrabold text-[#244D3C] font-mono">
                    ₹1,500 <span className="text-xs font-normal text-[#777D76]">/ month</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    Includes 14-Day Free Demo Trial
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4E5DE] space-y-3 text-xs text-[#292E2A]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span><b>1 Hostel Mess Hall</b> included</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Unlimited student ratings &amp; reviews</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Full digital menu schedule manager</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Printable high-res dining QR posters</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Student grievance &amp; suggestion inbox</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenAdminAuth}
                className="w-full py-3 rounded-lg bg-[#F6F4EE] hover:bg-white text-[#292E2A] border border-[#E4E5DE] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="bg-white rounded-2xl p-8 border-2 border-[#244D3C] shadow-md flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 right-6 bg-[#244D3C] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
                Recommended
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-[#292E2A] font-heading">Pro Plan</h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#244D3C]/10 text-[#244D3C]">
                    Multi-Mess Campus
                  </span>
                </div>
                <p className="text-xs text-[#777D76]">
                  For universities and multi-hostel campuses requiring full oversight.
                </p>
                <div className="pt-2">
                  <div className="text-3xl font-extrabold text-[#244D3C] font-mono">
                    ₹2,999 <span className="text-xs font-normal text-[#777D76]">/ month</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 font-semibold mt-1">
                    Includes 14-Day Free Demo Trial
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E4E5DE] space-y-3 text-xs text-[#292E2A]">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span><b>Up to 5 Campus Mess Halls</b> included</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Everything in Starter Plan</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span><b>Advanced Feedback Analytics Suite</b></span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Democratic food polls creator</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Student mobile viewport simulator</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Priority university support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenAdminAuth}
                className="w-full py-3 rounded-lg bg-[#244D3C] hover:bg-[#19382D] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
              >
                Upgrade to Pro Trial
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION I — FAQ: CLEAN ACCORDION
         ========================================================================= */}
      <section id="faq" className="py-20 lg:py-28 border-b border-[#E4E5DE] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#244D3C] px-3 py-1 rounded-md bg-[#244D3C]/10">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              Everything you need to know about MessMate
            </h2>
            <p className="text-sm text-[#777D76]">
              Clear answers for students, mess committees, and college management.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="rounded-xl border border-[#E4E5DE] bg-[#F6F4EE]/60 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#292E2A] font-heading cursor-pointer hover:bg-[#F6F4EE]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-[#777D76] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#244D3C]' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-[#777D76] leading-relaxed border-t border-[#E4E5DE]/60 bg-white">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION J — FOOTER: INSTITUTIONAL BRAND CLOSURE
         ========================================================================= */}
      <footer className="bg-[#19382D] text-[#F6F4EE] pt-16 pb-12 border-t border-[#E5E9E1]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#E5E9E1]/10">
            
            {/* Col 1 & 2: Brand & Mission */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-[#19382D] flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xl font-heading text-white tracking-tight">MessMate</span>
              </div>
              <p className="text-xs text-[#E5E9E1]/70 leading-relaxed max-w-sm">
                The smart hostel mess feedback and menu optimization platform. Connecting collegiate residents and catering administrations through verified feedback loops.
              </p>
              <div className="text-[11px] text-[#E5E9E1]/60">
                Multi-tenant cloud architecture • Protected with Firebase Auth &amp; Cloud Firestore.
              </div>
            </div>

            {/* Col 3: Product Navigation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B77950] font-heading">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-[#E5E9E1]/80">
                <li><button onClick={() => handleScrollTo('features')} className="hover:text-white cursor-pointer">Features</button></li>
                <li><button onClick={() => handleScrollTo('how-it-works')} className="hover:text-white cursor-pointer">How It Works</button></li>
                <li><button onClick={() => handleScrollTo('benefits')} className="hover:text-white cursor-pointer">Benefits</button></li>
                <li><button onClick={() => handleScrollTo('pricing')} className="hover:text-white cursor-pointer">Pricing</button></li>
                <li><button onClick={() => handleScrollTo('faq')} className="hover:text-white cursor-pointer">FAQ</button></li>
              </ul>
            </div>

            {/* Col 4: Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B77950] font-heading">
                Access Portals
              </h4>
              <ul className="space-y-2 text-xs text-[#E5E9E1]/80">
                <li><button onClick={onOpenStudentAuth} className="hover:text-white cursor-pointer">Student Resident Login</button></li>
                <li><button onClick={onOpenAdminAuth} className="hover:text-white cursor-pointer">Admin &amp; Warden Portal</button></li>
                <li><button onClick={onOpenAdminAuth} className="hover:text-white cursor-pointer">Register New College</button></li>
                <li><button onClick={onOpenAdminAuth} className="hover:text-white cursor-pointer">14-Day Free Demo</button></li>
              </ul>
            </div>

            {/* Col 5: Security & Governance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#B77950] font-heading">
                Trust &amp; Governance
              </h4>
              <ul className="space-y-2 text-xs text-[#E5E9E1]/80">
                <li><span className="text-[#E5E9E1]/60">ISO 9001 Food Standards</span></li>
                <li><span className="text-[#E5E9E1]/60">AI Review Validation</span></li>
                <li><span className="text-[#E5E9E1]/60">Cloud Firestore Security</span></li>
                <li><span className="text-[#E5E9E1]/60">Zero Spam Tolerance</span></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Terms */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E5E9E1]/60">
            <div>
              © 2026 MessMate Platform Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Security Practices</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
