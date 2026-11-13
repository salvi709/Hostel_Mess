import React, { useState, useEffect } from 'react';
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
  CalendarCheck,
  Clock,
  TrendingUp,
  ShieldCheck,
  FileText,
  Lock,
  ArrowUp,
  Search,
  Sparkles,
  CreditCard,
  Compass
} from 'lucide-react';
import { LegalTermsModal, LegalDocTab } from './LegalTermsModal';

interface LandingPageProps {
  onOpenStudentAuth: () => void;
  onOpenAdminAuth: () => void;
  onNavigateToDashboard?: () => void;
}

type MealKey = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

const SAMPLE_COURSES: Record<MealKey, { label: string; timing: string; dishes: string; note: string }> = {
  breakfast: {
    label: 'Breakfast',
    timing: '07:30 – 09:30',
    dishes: 'Masala Dosa, Coconut Chutney, Sambar, Boiled Eggs & Ginger Chai',
    note: 'Fresh batter fermented overnight · Filter coffee counter open',
  },
  lunch: {
    label: 'Lunch',
    timing: '12:00 – 14:15',
    dishes: 'Paneer Butter Masala, Yellow Dal Tadka, Steamed Basmati Rice & Phulkas',
    note: 'Accompaniments: Boondi Raita, Green Salad & Gulab Jamun',
  },
  snacks: {
    label: 'Snacks',
    timing: '16:45 – 18:00',
    dishes: 'Hot Samosa, Mint Tamarind Chutney, Veg Cutlets & Lemon Iced Tea',
    note: 'Served hot in two batches to maintain crispness',
  },
  dinner: {
    label: 'Dinner',
    timing: '19:45 – 21:45',
    dishes: 'Rajma Masala, Jeera Rice, Aloo Gobhi Dry, Tandoori Roti & Kheer',
    note: 'Late-evening exam counter available until 22:15',
  },
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenStudentAuth,
  onOpenAdminAuth,
  onNavigateToDashboard,
}) => {
  const { currentUser, isAdmin } = useAuth();

  // Interactive Hero Rating State
  const [interactiveRating, setInteractiveRating] = useState<number>(5);
  const [interactiveDishReaction, setInteractiveDishReaction] = useState<string>('Delicious and freshly prepared');

  // Interactive Product Experience Showcase State
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<'student' | 'admin'>('student');
  const [activePreviewMeal, setActivePreviewMeal] = useState<MealKey>('lunch');
  const [votedPollChoice, setVotedPollChoice] = useState<number>(0);
  const [sampleGrievanceStatus, setSampleGrievanceStatus] = useState<'In Review' | 'Resolved'>('In Review');

  // Interactive FAQ & Terms State
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [faqFilter, setFaqFilter] = useState<'all' | 'students' | 'admins' | 'privacy'>('all');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [legalModalOpen, setLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalDocTab>('terms');
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 520);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleRatingClick = (score: number) => {
    setInteractiveRating(score);
    if (score === 5) setInteractiveDishReaction('Delicious and freshly prepared');
    else if (score === 4) setInteractiveDishReaction('Good meal quality and seasoning');
    else if (score === 3) setInteractiveDishReaction('Average today · needs spice balance');
    else if (score === 2) setInteractiveDishReaction('Below expectation · warden notified');
    else setInteractiveDishReaction('Poor quality · immediate review requested');
  };

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openLegalDoc = (tab: LegalDocTab) => {
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const faqs = [
    {
      topic: 'students' as const,
      q: 'How do students check the daily menu and rate meals?',
      a: 'Students scan the MessMate QR poster displayed at their hostel dining hall entrance or open their campus portal URL in any mobile browser. No app store download is required. Today’s meal schedule, service hours, and instant 5-star rating form open immediately.',
    },
    {
      topic: 'privacy' as const,
      q: 'How does MessMate ensure reviews are genuine without censoring criticism?',
      a: 'Written meal reviews and grievance descriptions are checked through our server-side Google Gemini validation pipeline alongside deterministic checks. Casual greetings ("hi"), random characters, or off-topic chat are blocked before submission, while all authentic positive and negative dining feedback is accepted.',
    },
    {
      topic: 'admins' as const,
      q: 'Can a college manage multiple hostel dining halls under one account?',
      a: 'Yes. MessMate Pro provides multi-mess campus architecture. Administrators can configure up to five hostel dining halls (such as Boys Hostel 12, Girls Hostel 14, and Central Dining) with separate menus, catering timings, QR posters, and consolidated analytics.',
    },
    {
      topic: 'admins' as const,
      q: 'How quickly do mess administrators receive student grievances?',
      a: 'In real time. Complaints filed in the Grievance & Suggestion Box appear immediately inside the administrator inbox. Wardens can update the status to In Review or Resolved and post an official reply that appears live on the student resident’s screen.',
    },
    {
      topic: 'admins' as const,
      q: 'Is there a free trial for colleges and what are the billing terms?',
      a: 'Every new campus registration includes a 14-day full demo trial on either the Starter (₹1,500/month) or Pro (₹2,999/month) plan with no card charged upfront. Campuses can review full trial and billing terms anytime before upgrading.',
    },
    {
      topic: 'privacy' as const,
      q: 'How is student and institution data protected and isolated?',
      a: 'All records are isolated per institution and dining hall in Cloud Firestore and secured with Firebase Authentication. Students only see menus, polls, and notices for their assigned campus, and administrators only access metrics for their verified institution.',
    },
  ];

  const filteredFaqs = faqs.filter((item) => {
    const matchesTopic = faqFilter === 'all' || item.topic === faqFilter;
    const matchesSearch =
      !faqSearch.trim() ||
      item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.a.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesTopic && matchesSearch;
  });

  const activeMealPreview = SAMPLE_COURSES[activePreviewMeal];

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-[#292E2A] selection:bg-[#244D3C] selection:text-white font-body">
      
      {/* =========================================================================
          SECTION B — HERO: EDITORIAL HOSPITALITY COMPOSITION
         ========================================================================= */}
      <section className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* Left Column (6 cols): Editorial Headline, Narrative & Portals */}
            <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-2 text-xs font-medium text-[#777D76]">
                <span className="text-[#244D3C] font-semibold">Hostel Dining &amp; Feedback Platform</span>
                <span aria-hidden="true">·</span>
                <span>Live Campus Operations</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#292E2A] leading-[1.08] font-heading">
                Better food. Better feedback.{' '}
                <span className="text-[#244D3C]">Better mess experiences.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#777D76] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                MessMate connects students and mess administrators through simple feedback, smarter menus and meaningful insights.
              </p>

              {/* Primary & Secondary Actions */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 max-w-md mx-auto lg:mx-0">
                <button
                  onClick={() => handleScrollTo('how-it-works')}
                  className="px-6 py-3.5 rounded-lg bg-[#244D3C] text-white hover:bg-[#19382D] transition-colors font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Explore MessMate</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={currentUser && isAdmin ? onNavigateToDashboard : onOpenAdminAuth}
                  className="px-6 py-3.5 rounded-lg bg-white text-[#292E2A] border border-[#E4E5DE] hover:border-[#244D3C]/40 hover:bg-[#E5E9E1]/40 transition-colors font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-[#244D3C]" />
                  <span>Admin Portal</span>
                </button>
              </div>

              {/* Direct Quick Access Row */}
              <div className="pt-4 border-t border-[#E4E5DE] flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-[#777D76]">
                <button
                  onClick={currentUser && !isAdmin ? onNavigateToDashboard : onOpenStudentAuth}
                  className="font-semibold text-[#244D3C] hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <span>Student Resident Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <span aria-hidden="true" className="text-[#E4E5DE]">|</span>
                <span>Zero app download required</span>
                <span aria-hidden="true" className="text-[#E4E5DE]">|</span>
                <button
                  onClick={() => openLegalDoc('billing')}
                  className="hover:text-[#292E2A] underline decoration-[#E4E5DE] underline-offset-4 cursor-pointer"
                >
                  14-day trial terms
                </button>
              </div>
            </div>

            {/* Right Column (6 cols): Single-Elevation Culinary & Live Rating Composition */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-xl border border-[#E4E5DE] shadow-sm overflow-hidden max-w-[540px] mx-auto lg:ml-auto">
                
                {/* Culinary Photography */}
                <div className="relative h-56 sm:h-64 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85"
                    alt="Freshly plated hostel dining meal bowl"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#19382D]/85 via-[#19382D]/20 to-transparent" />
                  <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4 text-white">
                    <div>
                      <div className="text-xs text-[#E5E9E1]/90 font-medium">
                        Hostel 12 Central Mess · Lunch · 12:00 – 14:15
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold font-heading text-white mt-0.5 leading-snug">
                        Dal Makhani, Jeera Rice &amp; Fresh Salad
                      </h2>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-bold font-mono tabular-nums text-white flex items-center gap-1">
                        <span>4.8</span>
                        <Star className="w-4 h-4 fill-[#B77950] text-[#B77950]" />
                      </div>
                      <div className="text-[11px] text-[#E5E9E1]/80 font-mono tabular-nums">184 ratings</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Star Rating Bar — Hairline separated, no nested cards */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#292E2A] font-heading">Interactive Meal Rating Preview</div>
                      <div className="text-xs text-[#777D76]">{interactiveDishReaction}</div>
                    </div>
                    <div className="flex items-center gap-1" role="group" aria-label="Try rating today's meal">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRatingClick(star)}
                          className="p-1.5 rounded-md hover:bg-[#F6F4EE] transition-colors cursor-pointer"
                          aria-label={`Rate ${star} out of 5 stars`}
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= interactiveRating
                                ? 'fill-[#B77950] text-[#B77950]'
                                : 'text-[#E4E5DE]'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-mono tabular-nums font-bold text-[#244D3C]">
                        {interactiveRating}.0 / 5
                      </span>
                    </div>
                  </div>

                  {/* Unboxed Criteria Metrics separated by hairline border */}
                  <div className="pt-3.5 border-t border-[#E4E5DE] grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-[#777D76]">Taste &amp; Spice</div>
                      <div className="font-bold font-mono tabular-nums text-[#292E2A] mt-0.5">4.9 / 5.0</div>
                    </div>
                    <div>
                      <div className="text-[#777D76]">Mess Hygiene</div>
                      <div className="font-bold font-mono tabular-nums text-[#292E2A] mt-0.5">5.0 / 5.0</div>
                    </div>
                    <div>
                      <div className="text-[#777D76]">Portion Size</div>
                      <div className="font-bold font-mono tabular-nums text-[#292E2A] mt-0.5">4.8 / 5.0</div>
                    </div>
                  </div>

                  {/* Verified Remark Row */}
                  <div className="pt-3.5 border-t border-[#E4E5DE] flex items-start justify-between gap-4 text-xs">
                    <p className="text-[#292E2A] leading-relaxed">
                      “Today’s dal was well-seasoned and served hot. Refills at the serving counter were prompt.”
                    </p>
                    <span className="shrink-0 text-[11px] font-medium text-[#244D3C]">
                      Ananya R. · Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          QUICK ACCESS INDEX BAR: EFFORTLESS SECTION & TERMS NAVIGATION
         ========================================================================= */}
      <section aria-label="Quick section and terms directory" className="bg-white border-b border-[#E4E5DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#292E2A]">
            <Compass className="w-4 h-4 text-[#244D3C]" />
            <span>Quick Jump:</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-[#777D76]">
            <button onClick={() => handleScrollTo('how-it-works')} className="hover:text-[#244D3C] cursor-pointer">
              01 How It Works
            </button>
            <button onClick={() => handleScrollTo('product-experience')} className="hover:text-[#244D3C] cursor-pointer">
              02 Live Tour
            </button>
            <button onClick={() => handleScrollTo('features')} className="hover:text-[#244D3C] cursor-pointer">
              03 Capabilities
            </button>
            <button onClick={() => handleScrollTo('benefits')} className="hover:text-[#244D3C] cursor-pointer">
              04 Campus Benefits
            </button>
            <button onClick={() => handleScrollTo('pricing')} className="hover:text-[#244D3C] cursor-pointer">
              05 Pricing
            </button>
            <button onClick={() => handleScrollTo('faq')} className="hover:text-[#244D3C] cursor-pointer">
              06 FAQ
            </button>
            <span aria-hidden="true" className="text-[#E4E5DE]">|</span>
            <button
              onClick={() => openLegalDoc('terms')}
              className="text-[#244D3C] font-semibold hover:underline cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Terms &amp; Policies</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — TRUST / VALUE STRIP
         ========================================================================= */}
      <section className="bg-[#F6F4EE] border-b border-[#E4E5DE] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E4E5DE]">
            
            <div className="pt-6 md:pt-0 md:pr-8 space-y-2">
              <div className="text-xs font-semibold text-[#244D3C]">Student Feedback</div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Direct, friction-free resident voice</h3>
              <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
                QR check-ins and multi-criteria meal ratings give every student a constructive channel to rate daily dishes without clutter.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:px-8 space-y-2">
              <div className="text-xs font-semibold text-[#244D3C]">Smarter Mess Decisions</div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Evidence-led menu planning</h3>
              <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
                Track course-by-course satisfaction trends, spot underperforming recipes early, and align procurement with student preferences.
              </p>
            </div>

            <div className="pt-6 md:pt-0 md:pl-8 space-y-2">
              <div className="text-xs font-semibold text-[#244D3C]">Better Dining Experiences</div>
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Accountability across every meal</h3>
              <p className="text-xs sm:text-sm text-[#777D76] leading-relaxed">
                Structured grievance tracking and verified quality scorecards help wardens and catering teams deliver consistently better meals.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — HOW IT WORKS: CONNECTED 3-STAGE SEQUENCE
         ========================================================================= */}
      <section id="how-it-works" className="py-20 lg:py-24 border-b border-[#E4E5DE] bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-semibold text-[#244D3C]">How It Works</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              Three steps from dining table to better menus
            </h2>
            <p className="text-sm sm:text-base text-[#777D76]">
              Designed for rapid adoption across busy hostel dining halls with zero onboarding friction.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 border-t border-[#E4E5DE] pt-10">
            
            {/* 01 Scan */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#E4E5DE] pb-3">
                <span className="text-2xl font-bold font-mono tabular-nums text-[#244D3C]">01</span>
                <span className="text-xs font-semibold text-[#B77950]">Scan</span>
              </div>
              <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                Scan your dining hall QR code
              </h3>
              <p className="text-sm text-[#777D76] leading-relaxed">
                Scan the mess QR poster at the entrance or dining table to launch today’s menu and timings directly in your mobile browser.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-[#292E2A]">
                <QrCode className="w-5 h-5 text-[#244D3C] shrink-0" />
                <span>Opens assigned hostel hall automatically · No app install</span>
              </div>
            </div>

            {/* 02 Share */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#E4E5DE] pb-3">
                <span className="text-2xl font-bold font-mono tabular-nums text-[#244D3C]">02</span>
                <span className="text-xs font-semibold text-[#244D3C]">Share</span>
              </div>
              <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                Rate meals &amp; submit real feedback
              </h3>
              <p className="text-sm text-[#777D76] leading-relaxed">
                Score overall satisfaction alongside taste, hygiene, portion size, and food quality. AI validation keeps written reviews constructive and spam-free.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-[#292E2A]">
                <ShieldCheck className="w-5 h-5 text-[#244D3C] shrink-0" />
                <span>Genuine positive &amp; negative reviews protected</span>
              </div>
            </div>

            {/* 03 Improve */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#E4E5DE] pb-3">
                <span className="text-2xl font-bold font-mono tabular-nums text-[#244D3C]">03</span>
                <span className="text-xs font-semibold text-[#244D3C]">Improve</span>
              </div>
              <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                Turn insights into better meals
              </h3>
              <p className="text-sm text-[#777D76] leading-relaxed">
                Wardens track course trends, resolve grievances with transparent status replies, and run democratic polls for upcoming special feasts.
              </p>
              <div className="pt-2 flex items-center gap-3 text-xs text-[#292E2A]">
                <TrendingUp className="w-5 h-5 text-[#244D3C] shrink-0" />
                <span>Real-time status loop back to students</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION E — PRODUCT EXPERIENCE: INTERACTIVE DUAL-WORKSPACE SHOWCASE
         ========================================================================= */}
      <section id="product-experience" className="py-20 lg:py-24 border-b border-[#E4E5DE] bg-[#F6F4EE] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="text-xs font-semibold text-[#244D3C]">Product Experience</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
                Two tailored interfaces. Real-time sync.
              </h2>
              <p className="text-sm sm:text-base text-[#777D76]">
                Switch between the resident dining portal and the warden intelligence workspace below.
              </p>
            </div>

            {/* Clean Segmented Switcher */}
            <div className="inline-flex p-1 rounded-lg bg-white border border-[#E4E5DE] text-xs font-semibold self-start lg:self-auto">
              <button
                onClick={() => setActiveShowcaseTab('student')}
                className={`px-4 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  activeShowcaseTab === 'student'
                    ? 'bg-[#244D3C] text-white'
                    : 'text-[#777D76] hover:text-[#292E2A]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Student Resident View</span>
              </button>
              <button
                onClick={() => setActiveShowcaseTab('admin')}
                className={`px-4 py-2 rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  activeShowcaseTab === 'admin'
                    ? 'bg-[#244D3C] text-white'
                    : 'text-[#777D76] hover:text-[#292E2A]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Administrator Dashboard</span>
              </button>
            </div>
          </div>

          {/* Single-Elevation Workspace Frame */}
          <div className="bg-white rounded-xl border border-[#E4E5DE] shadow-sm p-6 sm:p-8">
            {activeShowcaseTab === 'student' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                
                {/* Left Narrative */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#244D3C]">Resident Dining Portal</div>
                    <h3 className="text-2xl font-bold text-[#292E2A] font-heading">
                      Menus, ratings, polls &amp; grievance status in one place.
                    </h3>
                    <p className="text-sm text-[#777D76] leading-relaxed">
                      Try clicking the meal course tabs or voting on the Sunday poll to preview how residents interact every day.
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm text-[#292E2A] border-t border-[#E4E5DE] pt-5">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                      <span>Course-by-course weekly schedules with exact service hours</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                      <span>One verified rating per meal per day with criteria sliders</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                      <span>Private grievance submissions with live warden response tracking</span>
                    </li>
                  </ul>

                  <button
                    onClick={onOpenStudentAuth}
                    className="px-5 py-2.5 rounded-lg bg-[#244D3C] text-white text-xs font-semibold hover:bg-[#19382D] transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Open Student Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Interactive Preview */}
                <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-[#E4E5DE] lg:pl-8">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-[#292E2A] font-heading flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4 text-[#244D3C]" />
                      <span>Today’s Course Schedule</span>
                    </div>
                    <span className="text-xs text-[#777D76] font-mono tabular-nums">
                      {activeMealPreview.timing}
                    </span>
                  </div>

                  {/* Interactive Meal Switcher */}
                  <div className="grid grid-cols-4 gap-1 p-1 bg-[#F6F4EE] rounded-lg border border-[#E4E5DE] text-xs font-semibold">
                    {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => setActivePreviewMeal(key)}
                        className={`py-2 rounded-md capitalize transition-colors cursor-pointer ${
                          activePreviewMeal === key
                            ? 'bg-white text-[#244D3C] shadow-2xs'
                            : 'text-[#777D76] hover:text-[#292E2A]'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {/* Active Meal Readout */}
                  <div className="py-4 border-y border-[#E4E5DE] space-y-1.5">
                    <div className="text-xs font-semibold text-[#244D3C]">{activeMealPreview.label} Menu</div>
                    <div className="text-base font-bold text-[#292E2A] font-heading">
                      {activeMealPreview.dishes}
                    </div>
                    <div className="text-xs text-[#777D76]">{activeMealPreview.note}</div>
                  </div>

                  {/* Interactive Poll Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#292E2A]">Democratic Poll · Sunday Special Feast</span>
                      <span className="text-[#777D76] font-mono tabular-nums">482 votes</span>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: 'Chole Bhature with Sweet Lassi', pct: votedPollChoice === 0 ? 69 : 67 },
                        { label: 'Pav Bhaji with Gulab Jamun', pct: votedPollChoice === 1 ? 33 : 31 },
                      ].map((opt, idx) => {
                        const selected = votedPollChoice === idx;
                        return (
                          <button
                            key={opt.label}
                            onClick={() => setVotedPollChoice(idx)}
                            className={`w-full text-left p-3 rounded-lg border relative overflow-hidden cursor-pointer flex items-center justify-between text-xs ${
                              selected
                                ? 'border-[#244D3C] bg-[#F6F4EE]'
                                : 'border-[#E4E5DE] bg-white hover:border-[#244D3C]/40'
                            }`}
                          >
                            <div
                              className="absolute inset-y-0 left-0 bg-[#244D3C]/10 pointer-events-none transition-all duration-300"
                              style={{ width: `${opt.pct}%` }}
                            />
                            <span className="relative z-10 font-semibold text-[#292E2A]">{opt.label}</span>
                            <span className="relative z-10 font-mono tabular-nums font-bold text-[#244D3C]">
                              {opt.pct}%
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                
                {/* Left Narrative */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#244D3C]">Administrator Command Center</div>
                    <h3 className="text-2xl font-bold text-[#292E2A] font-heading">
                      Real-time quality scorecards across every dining hall.
                    </h3>
                    <p className="text-sm text-[#777D76] leading-relaxed">
                      Review verified student satisfaction scores, update weekly menus instantly, and resolve pending grievances directly from the warden workspace.
                    </p>
                  </div>

                  <ul className="space-y-3 text-xs sm:text-sm text-[#292E2A] border-t border-[#E4E5DE] pt-5">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                      <span>Multi-hall switcher for Boys, Girls, and Central dining blocks</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                      <span>Taste, hygiene, quantity, and quality analytics with date filters</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                      <span>One-click high-resolution dining entrance QR poster export</span>
                    </li>
                  </ul>

                  <button
                    onClick={onOpenAdminAuth}
                    className="px-5 py-2.5 rounded-lg bg-[#244D3C] text-white text-xs font-semibold hover:bg-[#19382D] transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Open Admin Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right Interactive Preview */}
                <div className="lg:col-span-7 space-y-6 lg:border-l lg:border-[#E4E5DE] lg:pl-8">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
                    <div>
                      <div className="text-[11px] text-[#777D76]">Campus / Hostel 12 Dining Hall</div>
                      <div className="text-sm font-bold text-[#292E2A] font-heading">Quality &amp; Grievance Summary</div>
                    </div>
                    <span className="text-xs font-medium text-[#244D3C]">Live Firestore Sync</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-[#E4E5DE]">
                    <div>
                      <div className="text-xs text-[#777D76]">Satisfaction</div>
                      <div className="text-xl font-bold text-[#244D3C] font-mono tabular-nums mt-0.5">4.82</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#777D76]">Taste</div>
                      <div className="text-xl font-bold text-[#244D3C] font-mono tabular-nums mt-0.5">4.75</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#777D76]">Hygiene</div>
                      <div className="text-xl font-bold text-[#244D3C] font-mono tabular-nums mt-0.5">4.92</div>
                    </div>
                    <div>
                      <div className="text-xs text-[#777D76]">Reviews</div>
                      <div className="text-xl font-bold text-[#292E2A] font-mono tabular-nums mt-0.5">1,420</div>
                    </div>
                  </div>

                  {/* Interactive Grievance Action Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#292E2A]">Grievance Resolution Preview</span>
                      <button
                        onClick={() =>
                          setSampleGrievanceStatus((prev) => (prev === 'In Review' ? 'Resolved' : 'In Review'))
                        }
                        className="text-xs font-semibold text-[#244D3C] hover:underline cursor-pointer"
                      >
                        Toggle Status ({sampleGrievanceStatus})
                      </button>
                    </div>

                    <div className="p-4 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#292E2A]">Hygiene &amp; Cleanliness · Block C Dispenser</span>
                        <span
                          className={`font-semibold ${
                            sampleGrievanceStatus === 'Resolved' ? 'text-[#244D3C]' : 'text-[#B77950]'
                          }`}
                        >
                          {sampleGrievanceStatus}
                        </span>
                      </div>
                      <p className="text-[#777D76]">
                        “Water cooler near Block C serving line needs filter servicing before evening dinner.”
                      </p>
                      <div className="pt-2 border-t border-[#E4E5DE] text-[#292E2A]">
                        <span className="font-semibold text-[#244D3C]">Warden Reply: </span>
                        {sampleGrievanceStatus === 'Resolved'
                          ? 'Filter cartridge replaced and tested. Flow restored before dinner service.'
                          : 'Maintenance team scheduled for 10:00 AM inspection.'}
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
          SECTION F — FEATURES: VARIED EDITORIAL BENTO ARCHITECTURE
         ========================================================================= */}
      <section id="features" className="py-20 lg:py-24 border-b border-[#E4E5DE] bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl space-y-2.5">
              <div className="text-xs font-semibold text-[#244D3C]">Platform Capabilities</div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
                Built specifically for hostel dining operations
              </h2>
            </div>
            <p className="text-sm text-[#777D76] max-w-md">
              Replace scattered chat groups and paper suggestion boxes with structured feedback loops.
            </p>
          </div>

          {/* Asymmetrical Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Flagship Feature 1 (7 cols): Meal Feedback + AI Validation Example */}
            <div className="lg:col-span-7 bg-[#F6F4EE] rounded-xl p-7 border border-[#E4E5DE] flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Star className="w-5 h-5 text-[#244D3C] fill-[#244D3C]" />
                  <span className="text-xs font-medium text-[#777D76]">Gemini AI Review Moderation</span>
                </div>
                <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                  Meal Feedback, Criteria Ratings &amp; Noise Filtering
                </h3>
                <p className="text-sm text-[#777D76] leading-relaxed">
                  Students rate overall satisfaction along with taste, hygiene, portion size, and food quality. Server-side AI validation blocks spam and casual greetings while preserving every valid complaint or compliment.
                </p>
              </div>

              {/* Clean Live Moderation Comparison Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E4E5DE] text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-[#E4E5DE] space-y-1">
                  <div className="font-semibold text-[#B77950]">Filtered before submission</div>
                  <div className="font-mono text-[#777D76]">“hi” · “asdfgh” · “okiesh”</div>
                  <div className="text-[11px] text-[#777D76]">Prompts resident for food context</div>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-[#E4E5DE] space-y-1">
                  <div className="font-semibold text-[#244D3C]">Accepted to Warden Inbox</div>
                  <div className="font-mono text-[#292E2A]">“Today’s dal was too salty”</div>
                  <div className="text-[11px] text-[#777D76]">Positive &amp; critical reviews protected</div>
                </div>
              </div>
            </div>

            {/* Feature 2 (5 cols): Dynamic Digital Menus */}
            <div className="lg:col-span-5 bg-white rounded-xl p-7 border border-[#E4E5DE] flex flex-col justify-between gap-6">
              <div className="space-y-3">
                <CalendarCheck className="w-5 h-5 text-[#244D3C]" />
                <h3 className="text-xl font-bold text-[#292E2A] font-heading">Dynamic Digital Menus</h3>
                <p className="text-sm text-[#777D76] leading-relaxed">
                  Update Monday–Sunday schedules with exact serving hours and dietary labels. Changes publish immediately to all student phones.
                </p>
              </div>
              <div className="border-t border-[#E4E5DE] pt-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-[#292E2A]">Breakfast</span>
                  <span className="font-mono tabular-nums text-[#777D76]">07:30 – 09:30</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#292E2A]">Lunch</span>
                  <span className="font-mono tabular-nums text-[#777D76]">12:00 – 14:15</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-[#292E2A]">Snacks &amp; Dinner</span>
                  <span className="font-mono tabular-nums text-[#777D76]">16:45 – 21:45</span>
                </div>
              </div>
            </div>

            {/* Feature 3 (4 cols): Polls */}
            <div className="lg:col-span-4 bg-white rounded-xl p-7 border border-[#E4E5DE] space-y-3">
              <Vote className="w-5 h-5 text-[#244D3C]" />
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Polls &amp; Student Opinions</h3>
              <p className="text-sm text-[#777D76] leading-relaxed">
                Run democratic votes for Sunday feasts and festival specials with single-vote integrity and live percentage bars.
              </p>
            </div>

            {/* Feature 4 (4 cols): Announcements */}
            <div className="lg:col-span-4 bg-white rounded-xl p-7 border border-[#E4E5DE] space-y-3">
              <Clock className="w-5 h-5 text-[#244D3C]" />
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Dining Notices &amp; Alerts</h3>
              <p className="text-sm text-[#777D76] leading-relaxed">
                Broadcast exam timing shifts, holiday closures, and special meal announcements directly onto resident banners.
              </p>
            </div>

            {/* Feature 5 (4 cols): Admin Analytics */}
            <div className="lg:col-span-4 bg-white rounded-xl p-7 border border-[#E4E5DE] space-y-3">
              <BarChart3 className="w-5 h-5 text-[#244D3C]" />
              <h3 className="text-lg font-bold text-[#292E2A] font-heading">Admin Analytics Suite</h3>
              <p className="text-sm text-[#777D76] leading-relaxed">
                Filter ratings by dining hall, meal course, and time window to hold catering teams to transparent hygiene benchmarks.
              </p>
            </div>

            {/* Wide Feature 6 (12 cols): Multi-Mess Campus Management */}
            <div className="lg:col-span-12 bg-[#F6F4EE] rounded-xl p-7 border border-[#E4E5DE] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#244D3C]">
                  <Building className="w-4 h-4" />
                  <span>Multi-Mess Campus Architecture</span>
                </div>
                <h3 className="text-xl font-bold text-[#292E2A] font-heading">
                  Manage every hostel dining hall from one institutional workspace
                </h3>
                <p className="text-sm text-[#777D76] leading-relaxed">
                  Register multiple hostel messes under your college, generate unique printable QR entrance posters per hall, and switch dashboards seamlessly.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleScrollTo('pricing')}
                  className="px-5 py-2.5 rounded-lg bg-white border border-[#E4E5DE] hover:border-[#244D3C]/50 text-xs font-semibold text-[#292E2A] cursor-pointer"
                >
                  Compare Plans
                </button>
                <button
                  onClick={onOpenAdminAuth}
                  className="px-5 py-2.5 rounded-lg bg-[#244D3C] hover:bg-[#19382D] text-white text-xs font-semibold cursor-pointer"
                >
                  Register Campus
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION G — BENEFITS: DEEP FOREST-GREEN INSTITUTIONAL SECTION (#19382D)
         ========================================================================= */}
      <section id="benefits" className="py-20 lg:py-24 bg-[#19382D] text-[#F6F4EE] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-2xl space-y-3">
            <div className="text-xs font-semibold text-[#B77950] tracking-wide">Institutional Impact</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
              Built for students and campus management alike
            </h2>
            <p className="text-sm sm:text-base text-[#E5E9E1]/85 tracking-[0.01em]">
              Aligning resident satisfaction with practical kitchen oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Student Benefits */}
            <div className="rounded-xl p-8 border border-[#E5E9E1]/20 bg-[#244D3C]/35 flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E5E9E1]/15">
                  <User className="w-5 h-5 text-[#B77950]" />
                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">For Student Residents</h3>
                    <p className="text-xs text-[#E5E9E1]/75">Make your voice heard at every meal</p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-[#E5E9E1]/90 tracking-[0.01em]">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Zero friction:</strong> Scan the entrance QR code in any browser—no app download needed.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Protected feedback:</strong> Honest reviews on taste, portions, and cleanliness go directly to wardens.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Democratic menus:</strong> Vote in student polls to shape weekend and festival special meals.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Transparent resolution:</strong> Track when complaints move from Submitted to Resolved with official replies.</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenStudentAuth}
                className="w-full py-3 rounded-lg bg-white text-[#19382D] font-semibold text-xs hover:bg-[#F6F4EE] transition-colors cursor-pointer"
              >
                Join as Student Resident
              </button>
            </div>

            {/* Admin Benefits */}
            <div className="rounded-xl p-8 border border-[#E5E9E1]/20 bg-[#244D3C]/35 flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#E5E9E1]/15">
                  <Shield className="w-5 h-5 text-[#B77950]" />
                  <div>
                    <h3 className="text-xl font-bold font-heading text-white">For College Administrators</h3>
                    <p className="text-xs text-[#E5E9E1]/75">Make informed decisions with verified resident data</p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-[#E5E9E1]/90 tracking-[0.01em]">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Caterer accountability:</strong> Measure taste, hygiene, and portion compliance using real meal data.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Lower food waste:</strong> Identify low-rated dishes quickly and refine weekly menu plans.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Early escalation control:</strong> Resolve dining issues in a private queue before campus dissatisfaction grows.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#B77950] shrink-0 mt-1" />
                    <span><strong className="text-white">Multi-hall oversight:</strong> Manage every campus dining facility from one centralized workspace.</span>
                  </li>
                </ul>
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
          SECTION H — PRICING: TRANSPARENT PLANS + DIRECT TERMS ACCESS
         ========================================================================= */}
      <section id="pricing" className="py-20 lg:py-24 border-b border-[#E4E5DE] bg-[#F6F4EE] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-semibold text-[#244D3C]">Institutional Pricing</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              Simple plans for every campus scale
            </h2>
            <p className="text-sm sm:text-base text-[#777D76]">
              Start with a 14-day full demo trial on either plan. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Starter Plan */}
            <div className="bg-white rounded-xl p-8 border border-[#E4E5DE] flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-[#292E2A] font-heading">Starter Plan</h3>
                  <span className="text-xs font-medium text-[#777D76]">Single Mess</span>
                </div>
                <p className="text-xs sm:text-sm text-[#777D76]">
                  Ideal for standalone colleges or individual hostel dining halls.
                </p>
                <div className="pt-1">
                  <div className="text-3xl font-extrabold text-[#244D3C] font-mono tabular-nums">
                    ₹1,500 <span className="text-xs font-sans font-normal text-[#777D76]">/ month</span>
                  </div>
                  <div className="text-xs text-[#244D3C] font-semibold mt-1">
                    Includes 14-Day Free Demo Trial
                  </div>
                </div>

                <ul className="pt-5 border-t border-[#E4E5DE] space-y-3 text-xs sm:text-sm text-[#292E2A]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span><strong>1 Hostel Mess Hall</strong> included</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Unlimited student ratings &amp; AI-validated reviews</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Digital weekly menu schedule manager</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Printable dining entrance QR posters</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Student grievance &amp; suggestion inbox</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenAdminAuth}
                className="w-full py-3 rounded-lg bg-[#F6F4EE] hover:bg-[#E5E9E1]/60 text-[#292E2A] border border-[#E4E5DE] font-semibold text-xs transition-colors cursor-pointer"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-xl p-8 border-2 border-[#244D3C] shadow-sm flex flex-col justify-between gap-8">
              <div className="space-y-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-xl font-bold text-[#292E2A] font-heading">Pro Plan</h3>
                  <span className="text-xs font-semibold text-[#244D3C]">Recommended · Multi-Mess</span>
                </div>
                <p className="text-xs sm:text-sm text-[#777D76]">
                  For universities and multi-hostel campuses requiring full oversight.
                </p>
                <div className="pt-1">
                  <div className="text-3xl font-extrabold text-[#244D3C] font-mono tabular-nums">
                    ₹2,999 <span className="text-xs font-sans font-normal text-[#777D76]">/ month</span>
                  </div>
                  <div className="text-xs text-[#244D3C] font-semibold mt-1">
                    Includes 14-Day Free Demo Trial
                  </div>
                </div>

                <ul className="pt-5 border-t border-[#E4E5DE] space-y-3 text-xs sm:text-sm text-[#292E2A]">
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span><strong>Up to 5 Campus Mess Halls</strong> included</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Everything in Starter Plan</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span><strong>Advanced Feedback Analytics Suite</strong></span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Democratic food polls creator</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Student mobile viewport simulator</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0" />
                    <span>Priority university support</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onOpenAdminAuth}
                className="w-full py-3 rounded-lg bg-[#244D3C] hover:bg-[#19382D] text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Upgrade to Pro Trial
              </button>
            </div>

          </div>

          {/* Transparent Terms Link Strip */}
          <div className="text-center text-xs text-[#777D76]">
            <span>All plans operate under clear campus data isolation. </span>
            <button
              onClick={() => openLegalDoc('billing')}
              className="font-semibold text-[#244D3C] hover:underline cursor-pointer"
            >
              Read Trial &amp; Billing Terms
            </button>
            <span aria-hidden="true"> · </span>
            <button
              onClick={() => openLegalDoc('terms')}
              className="font-semibold text-[#244D3C] hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION I — FAQ & EASY ACCESS DOCUMENTATION
         ========================================================================= */}
      <section id="faq" className="py-20 lg:py-24 border-b border-[#E4E5DE] bg-white scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <div className="text-xs font-semibold text-[#244D3C]">Frequently Asked Questions</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#292E2A] tracking-tight font-heading">
              Clear answers for students &amp; campus teams
            </h2>
            <p className="text-sm text-[#777D76]">
              Search answers by topic or inspect our official platform policies directly.
            </p>
          </div>

          {/* Interactive Filter & Search Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-[#F6F4EE] rounded-lg border border-[#E4E5DE] text-xs font-semibold overflow-x-auto">
              {[
                { id: 'all', label: 'All Topics' },
                { id: 'students', label: 'Students' },
                { id: 'admins', label: 'Admins & Billing' },
                { id: 'privacy', label: 'AI & Privacy' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFaqFilter(tab.id as typeof faqFilter);
                    setOpenFaq(0);
                  }}
                  className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    faqFilter === tab.id
                      ? 'bg-white text-[#244D3C] shadow-2xs'
                      : 'text-[#777D76] hover:text-[#292E2A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#777D76] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Filter questions..."
                aria-label="Filter frequently asked questions"
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] text-xs text-[#292E2A] placeholder-[#777D76] focus:outline-none focus:border-[#244D3C]"
              />
            </div>
          </div>

          {/* Hairline Accordion List */}
          <div className="divide-y divide-[#E4E5DE] border-y border-[#E4E5DE]">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q} className="transition-colors">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full py-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#292E2A] font-heading cursor-pointer hover:text-[#244D3C]"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#777D76] transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180 text-[#244D3C]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-5 pr-8 text-xs sm:text-sm text-[#777D76] leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-[#777D76]">
                No questions match “{faqSearch}”.{' '}
                <button
                  onClick={() => {
                    setFaqSearch('');
                    setFaqFilter('all');
                  }}
                  className="text-[#244D3C] font-semibold underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )}
          </div>

          {/* Direct Terms & Policies Hub Banner */}
          <div id="terms" className="bg-[#F6F4EE] rounded-xl border border-[#E4E5DE] p-6 sm:p-7 space-y-4 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-[#292E2A] font-heading">
                  Terms, Privacy &amp; Governance Directory
                </h3>
                <p className="text-xs text-[#777D76] mt-0.5">
                  Access MessMate’s institutional agreements and moderation policies anytime in one click.
                </p>
              </div>
              <span className="text-xs text-[#244D3C] font-semibold shrink-0">Updated Nov 2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <button
                onClick={() => openLegalDoc('terms')}
                className="p-3.5 rounded-lg bg-white border border-[#E4E5DE] hover:border-[#244D3C]/50 text-left space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#292E2A] group-hover:text-[#244D3C]">
                  <span>Terms of Service</span>
                  <FileText className="w-3.5 h-3.5 text-[#244D3C]" />
                </div>
                <div className="text-[11px] text-[#777D76]">Platform rules &amp; conduct</div>
              </button>

              <button
                onClick={() => openLegalDoc('privacy')}
                className="p-3.5 rounded-lg bg-white border border-[#E4E5DE] hover:border-[#244D3C]/50 text-left space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#292E2A] group-hover:text-[#244D3C]">
                  <span>Privacy Policy</span>
                  <Lock className="w-3.5 h-3.5 text-[#244D3C]" />
                </div>
                <div className="text-[11px] text-[#777D76]">Multi-tenant data isolation</div>
              </button>

              <button
                onClick={() => openLegalDoc('security')}
                className="p-3.5 rounded-lg bg-white border border-[#E4E5DE] hover:border-[#244D3C]/50 text-left space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#292E2A] group-hover:text-[#244D3C]">
                  <span>AI &amp; Security</span>
                  <Sparkles className="w-3.5 h-3.5 text-[#244D3C]" />
                </div>
                <div className="text-[11px] text-[#777D76]">Review validation standards</div>
              </button>

              <button
                onClick={() => openLegalDoc('billing')}
                className="p-3.5 rounded-lg bg-white border border-[#E4E5DE] hover:border-[#244D3C]/50 text-left space-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#292E2A] group-hover:text-[#244D3C]">
                  <span>Trial &amp; Billing</span>
                  <CreditCard className="w-3.5 h-3.5 text-[#244D3C]" />
                </div>
                <div className="text-[11px] text-[#777D76]">14-day trial &amp; plan rules</div>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION J — FOOTER: INSTITUTIONAL CLOSURE & INTERACTIVE LEGAL LINKS
         ========================================================================= */}
      <footer className="bg-[#19382D] text-[#F6F4EE] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#E5E9E1]/15">
            
            {/* Brand & Contact */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white text-[#19382D] flex items-center justify-center">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-xl font-heading text-white tracking-tight">MessMate</span>
              </div>
              <p className="text-xs text-[#E5E9E1]/80 leading-relaxed max-w-sm">
                Smart hostel mess feedback and menu optimization platform connecting campus residents and dining administrations.
              </p>
              <div className="text-xs text-[#E5E9E1]/75 space-y-1">
                <div>Institutional Support: <span className="text-white font-medium">support@messmate.edu</span></div>
                <div>Multi-tenant cloud isolation · Firebase Auth &amp; Cloud Firestore</div>
              </div>
            </div>

            {/* Platform Sections */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#B77950] font-heading">Platform Sections</h4>
              <ul className="space-y-2 text-xs text-[#E5E9E1]/80">
                <li><button onClick={() => handleScrollTo('how-it-works')} className="hover:text-white cursor-pointer">How It Works</button></li>
                <li><button onClick={() => handleScrollTo('product-experience')} className="hover:text-white cursor-pointer">Product Experience</button></li>
                <li><button onClick={() => handleScrollTo('features')} className="hover:text-white cursor-pointer">Features</button></li>
                <li><button onClick={() => handleScrollTo('benefits')} className="hover:text-white cursor-pointer">Benefits</button></li>
                <li><button onClick={() => handleScrollTo('pricing')} className="hover:text-white cursor-pointer">Pricing</button></li>
                <li><button onClick={() => handleScrollTo('faq')} className="hover:text-white cursor-pointer">FAQ</button></li>
              </ul>
            </div>

            {/* Access Portals */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#B77950] font-heading">Access Portals</h4>
              <ul className="space-y-2 text-xs text-[#E5E9E1]/80">
                <li><button onClick={onOpenStudentAuth} className="hover:text-white cursor-pointer">Student Resident Login</button></li>
                <li><button onClick={onOpenAdminAuth} className="hover:text-white cursor-pointer">Admin &amp; Warden Portal</button></li>
                <li><button onClick={onOpenAdminAuth} className="hover:text-white cursor-pointer">Register New College</button></li>
                <li><button onClick={() => handleScrollTo('pricing')} className="hover:text-white cursor-pointer">14-Day Demo Trial</button></li>
              </ul>
            </div>

            {/* Terms & Governance */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#B77950] font-heading">Terms &amp; Policies</h4>
              <ul className="space-y-2 text-xs text-[#E5E9E1]/80">
                <li><button onClick={() => openLegalDoc('terms')} className="hover:text-white cursor-pointer">Terms of Service</button></li>
                <li><button onClick={() => openLegalDoc('privacy')} className="hover:text-white cursor-pointer">Privacy Policy</button></li>
                <li><button onClick={() => openLegalDoc('security')} className="hover:text-white cursor-pointer">AI Validation &amp; Security</button></li>
                <li><button onClick={() => openLegalDoc('billing')} className="hover:text-white cursor-pointer">Trial &amp; Billing Terms</button></li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#E5E9E1]/70">
            <div>© 2026 MessMate Platform Inc. All rights reserved.</div>
            <div className="flex flex-wrap items-center gap-5">
              <button onClick={() => openLegalDoc('privacy')} className="hover:text-white cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => openLegalDoc('terms')} className="hover:text-white cursor-pointer">
                Terms of Service
              </button>
              <button onClick={() => openLegalDoc('security')} className="hover:text-white cursor-pointer">
                Security Practices
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Back-to-Top & Quick Terms Access */}
      {showBackToTop && (
        <div className="fixed bottom-5 right-5 z-30 flex items-center gap-2">
          <button
            onClick={() => openLegalDoc('terms')}
            className="px-3.5 py-2.5 rounded-lg bg-white border border-[#E4E5DE] shadow-md text-xs font-semibold text-[#292E2A] hover:border-[#244D3C] flex items-center gap-1.5 cursor-pointer"
            title="Read Terms & Privacy Policies"
          >
            <FileText className="w-3.5 h-3.5 text-[#244D3C]" />
            <span className="hidden sm:inline">Terms</span>
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="p-2.5 rounded-lg bg-[#244D3C] text-white shadow-md hover:bg-[#19382D] cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Terms, Privacy & Governance Reader Modal */}
      <LegalTermsModal
        isOpen={legalModalOpen}
        initialTab={legalModalTab}
        onClose={() => setLegalModalOpen(false)}
        onOpenAdminAuth={onOpenAdminAuth}
      />

    </div>
  );
};
