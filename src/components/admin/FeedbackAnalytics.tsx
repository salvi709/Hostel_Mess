import React, { useState, useMemo } from 'react';
import { MealRating, FeedbackItem, Mess, MealType } from '../../types';
import { 
  Star, 
  BarChart3, 
  TrendingUp, 
  ChefHat, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Filter, 
  Search, 
  Building2, 
  Calendar, 
  ArrowUpDown, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Layers
} from 'lucide-react';

interface FeedbackAnalyticsProps {
  ratings: MealRating[];
  messes: Mess[];
  activeMessId: string;
  onSelectMess?: (messId: string) => void;
  feedbackList?: FeedbackItem[];
}

export const FeedbackAnalytics: React.FC<FeedbackAnalyticsProps> = ({
  ratings,
  messes,
  activeMessId,
  onSelectMess,
  feedbackList = []
}) => {
  // Filters for written comments & detailed ratings
  const [selectedMealFilter, setSelectedMealFilter] = useState<string>('all');
  const [selectedMessFilter, setSelectedMessFilter] = useState<string>(activeMessId || 'all');
  const [ratingThresholdFilter, setRatingThresholdFilter] = useState<string>('all'); // 'all', 'low' (<=2), 'high' (>=4)
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  // Filter ratings by mess if a specific mess is selected
  const messRatings = useMemo(() => {
    if (selectedMessFilter === 'all') return ratings;
    return ratings.filter(r => r.messId === selectedMessFilter);
  }, [ratings, selectedMessFilter]);

  // Total responses
  const totalResponses = messRatings.length;

  // 1. Overall average rating & normalized percentage score
  const overallAverage = useMemo(() => {
    if (totalResponses === 0) return 0;
    const sum = messRatings.reduce((acc, r) => acc + (r.score || 0), 0);
    return sum / totalResponses;
  }, [messRatings, totalResponses]);

  // Normalized percentage: (Average / 5) * 100
  const normalizedScore = totalResponses > 0 
    ? Math.round((overallAverage / 5) * 100) 
    : 0;

  // 2. 1 to 5 Star Distribution
  const starDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    messRatings.forEach(r => {
      const s = Math.min(5, Math.max(1, Math.round(r.score || 0))) as 1 | 2 | 3 | 4 | 5;
      if (counts[s] !== undefined) {
        counts[s]++;
      }
    });

    return [5, 4, 3, 2, 1].map(stars => {
      const count = counts[stars as 1 | 2 | 3 | 4 | 5];
      const pct = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
      return { stars, count, pct };
    });
  }, [messRatings, totalResponses]);

  // 3. Criteria Metrics (Taste, Food Quality, Quantity, Hygiene, Overall Satisfaction)
  // Strictly excluding missing answers from denominators!
  const criteriaMetrics = useMemo(() => {
    // Taste
    const tasteRatings = messRatings.filter(r => r.taste !== undefined && r.taste !== null && r.taste > 0);
    const tasteCount = tasteRatings.length;
    const tasteAvg = tasteCount > 0 ? tasteRatings.reduce((s, r) => s + r.taste!, 0) / tasteCount : 0;
    const tastePct = tasteCount > 0 ? Math.round((tasteAvg / 5) * 100) : 0;

    // Quality
    const qualityRatings = messRatings.filter(r => r.quality !== undefined && r.quality !== null && r.quality > 0);
    const qualityCount = qualityRatings.length;
    const qualityAvg = qualityCount > 0 ? qualityRatings.reduce((s, r) => s + r.quality!, 0) / qualityCount : 0;
    const qualityPct = qualityCount > 0 ? Math.round((qualityAvg / 5) * 100) : 0;

    // Quantity / Portions
    const quantityRatings = messRatings.filter(r => r.quantity !== undefined && r.quantity !== null && r.quantity > 0);
    const quantityCount = quantityRatings.length;
    const quantityAvg = quantityCount > 0 ? quantityRatings.reduce((s, r) => s + r.quantity!, 0) / quantityCount : 0;
    const quantityPct = quantityCount > 0 ? Math.round((quantityAvg / 5) * 100) : 0;

    // Hygiene
    const hygieneRatings = messRatings.filter(r => r.hygiene !== undefined && r.hygiene !== null && r.hygiene > 0);
    const hygieneCount = hygieneRatings.length;
    const hygieneAvg = hygieneCount > 0 ? hygieneRatings.reduce((s, r) => s + r.hygiene!, 0) / hygieneCount : 0;
    const hygienePct = hygieneCount > 0 ? Math.round((hygieneAvg / 5) * 100) : 0;

    // Overall Satisfaction
    const overallCount = totalResponses;
    const overallAvg = overallAverage;
    const overallPct = normalizedScore;

    return [
      { name: 'Overall Satisfaction', avg: overallAvg.toFixed(1), pct: overallPct, count: overallCount, desc: 'Holistic meal experience' },
      { name: 'Taste & Flavor', avg: tasteCount > 0 ? tasteAvg.toFixed(1) : '—', pct: tastePct, count: tasteCount, desc: 'Spices, seasoning, cooking authenticity' },
      { name: 'Food Quality', avg: qualityCount > 0 ? qualityAvg.toFixed(1) : '—', pct: qualityPct, count: qualityCount, desc: 'Ingredient freshness & temperature' },
      { name: 'Portion Quantity', avg: quantityCount > 0 ? quantityAvg.toFixed(1) : '—', pct: quantityPct, count: quantityCount, desc: 'Adequacy of serving sizes' },
      { name: 'Mess Hygiene', avg: hygieneCount > 0 ? hygieneAvg.toFixed(1) : '—', pct: hygienePct, count: hygieneCount, desc: 'Dining area & utensil cleanliness' }
    ];
  }, [messRatings, totalResponses, overallAverage, normalizedScore]);

  // 4. Meal-Type Breakdown
  const mealBreakdown = useMemo(() => {
    const mealOrder: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
    return mealOrder.map(mType => {
      const items = messRatings.filter(r => r.mealType === mType);
      const count = items.length;
      const avg = count > 0 ? (items.reduce((s, r) => s + r.score, 0) / count).toFixed(1) : '—';
      const pct = count > 0 ? Math.round(((Number(avg) / 5) * 100)) : 0;
      return {
        mealType: mType,
        count,
        avg,
        pct
      };
    });
  }, [messRatings]);

  // 5. Mess Breakdown (when in multi-mess view)
  const messBreakdown = useMemo(() => {
    return messes.map(m => {
      const mRatings = ratings.filter(r => r.messId === m.id);
      const count = mRatings.length;
      const avg = count > 0 ? (mRatings.reduce((s, r) => s + r.score, 0) / count).toFixed(1) : '—';
      const pct = count > 0 ? Math.round(((Number(avg) / 5) * 100)) : 0;
      return {
        messId: m.id,
        messName: m.name,
        location: m.locationBlock || 'Main Block',
        count,
        avg,
        pct
      };
    });
  }, [messes, ratings]);

  // 6. Trends over time (grouped by date)
  const dateTrends = useMemo(() => {
    const datesMap: Record<string, { count: number; sum: number }> = {};
    messRatings.forEach(r => {
      const d = r.serviceDate || r.createdAt?.split('T')[0] || 'Recent';
      if (!datesMap[d]) {
        datesMap[d] = { count: 0, sum: 0 };
      }
      datesMap[d].count++;
      datesMap[d].sum += r.score || 0;
    });

    const entries = Object.entries(datesMap).map(([date, data]) => ({
      date,
      count: data.count,
      avg: (data.sum / data.count).toFixed(1),
      pct: Math.round(((data.sum / data.count) / 5) * 100)
    }));

    // Sort chronologically ascending
    entries.sort((a, b) => a.date.localeCompare(b.date));
    return entries.slice(-7); // Last 7 active dates
  }, [messRatings]);

  // Filtered written feedback & reviews
  const filteredReviews = useMemo(() => {
    return messRatings.filter(r => {
      // Meal filter
      if (selectedMealFilter !== 'all' && r.mealType !== selectedMealFilter) {
        return false;
      }
      // Rating threshold filter
      if (ratingThresholdFilter === 'low' && r.score > 2) {
        return false;
      }
      if (ratingThresholdFilter === 'high' && r.score < 4) {
        return false;
      }
      // Date filter
      if (selectedDateFilter !== 'all' && r.serviceDate !== selectedDateFilter) {
        return false;
      }
      // Search comment
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hasComment = r.comment && r.comment.toLowerCase().includes(q);
        const hasActor = r.actorName && r.actorName.toLowerCase().includes(q);
        if (!hasComment && !hasActor) return false;
      }
      return true;
    });
  }, [messRatings, selectedMealFilter, ratingThresholdFilter, selectedDateFilter, searchQuery]);

  // Unique dates for dropdown
  const uniqueDates = useMemo(() => {
    const set = new Set<string>();
    messRatings.forEach(r => {
      if (r.serviceDate) set.add(r.serviceDate);
    });
    return Array.from(set).sort().reverse();
  }, [messRatings]);

  return (
    <div className="space-y-8">
      {/* 1. TOP STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Responses */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737A74]">
            <span>Total Responses</span>
            <MessageSquare className="w-4 h-4 text-[#244D3C]" />
          </div>
          <div className="text-3xl font-extrabold text-[#292E2A] tracking-tight">
            {totalResponses}
          </div>
          <div className="text-[11px] text-[#737A74]">
            Verified student meal reviews
          </div>
        </div>

        {/* Overall Average Rating */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737A74]">
            <span>Average Meal Rating</span>
            <Star className="w-4 h-4 fill-[#B77950] text-[#B77950]" />
          </div>
          <div className="text-3xl font-extrabold text-[#244D3C] tracking-tight flex items-baseline gap-1">
            <span>{totalResponses > 0 ? overallAverage.toFixed(2) : '—'}</span>
            <span className="text-sm font-normal text-[#737A74]">/ 5.0</span>
          </div>
          <div className="text-[11px] text-[#737A74]">
            Aggregate satisfaction score
          </div>
        </div>

        {/* Normalized Percentage Score */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737A74]">
            <span>Quality Index</span>
            <TrendingUp className="w-4 h-4 text-[#244D3C]" />
          </div>
          <div className="text-3xl font-extrabold text-[#292E2A] tracking-tight flex items-baseline gap-1">
            <span>{totalResponses > 0 ? normalizedScore : 0}</span>
            <span className="text-sm font-normal text-[#737A74]">%</span>
          </div>
          <div className="text-[11px] text-[#737A74]">
            Normalized: (Average / 5) × 100
          </div>
        </div>

        {/* Low-Rating Ratio Alert */}
        <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737A74]">
            <span>Attention Flagged (≤ 2★)</span>
            <AlertTriangle className="w-4 h-4 text-[#B77950]" />
          </div>
          <div className="text-3xl font-extrabold text-[#B77950] tracking-tight">
            {messRatings.filter(r => r.score <= 2).length}
          </div>
          <div className="text-[11px] text-[#737A74]">
            Reviews requiring catering inspection
          </div>
        </div>

      </div>

      {/* 2. CRITERIA BENCHMARKS & 1-5 STAR DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Criteria Benchmarks (Taste, Quality, Quantity, Hygiene, Overall) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E5DE]">
            <div>
              <h3 className="text-sm font-bold text-[#292E2A]">
                Granular Criteria Analysis
              </h3>
              <p className="text-xs text-[#737A74]">
                Excludes skipped answers from denominators for mathematical integrity.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {criteriaMetrics.map((crit) => (
              <div key={crit.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#292E2A]">{crit.name}</span>
                    <span className="text-[#737A74] text-[11px] ml-2">({crit.desc})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#737A74]">{crit.count} answers</span>
                    <span className="font-bold text-[#292E2A] w-12 text-right">{crit.avg} ★</span>
                    <span className="font-semibold text-[#244D3C] w-10 text-right">{crit.pct}%</span>
                  </div>
                </div>

                {/* Clean metric bar */}
                <div className="w-full bg-[#F6F4EE] border border-[#E4E5DE] h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#244D3C] h-full transition-all duration-500 rounded-full" 
                    style={{ width: `${crit.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1–5 Star Distribution */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-5">
          <div className="pb-3 border-b border-[#E4E5DE]">
            <h3 className="text-sm font-bold text-[#292E2A]">Star Rating Distribution</h3>
            <p className="text-xs text-[#737A74]">Counts and percentages across all student ratings</p>
          </div>

          <div className="space-y-3">
            {starDistribution.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 w-14 shrink-0 font-medium text-[#292E2A]">
                  <span>{row.stars}</span>
                  <Star className="w-3.5 h-3.5 fill-[#B77950] text-[#B77950]" />
                </div>

                <div className="flex-1 bg-[#F6F4EE] border border-[#E4E5DE] h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      row.stars >= 4 ? 'bg-[#244D3C]' : row.stars === 3 ? 'bg-amber-600' : 'bg-[#B77950]'
                    }`}
                    style={{ width: `${row.pct}%` }} 
                  />
                </div>

                <div className="flex items-center justify-end gap-2 w-20 shrink-0 text-right text-[11px]">
                  <span className="font-bold text-[#292E2A]">{row.pct}%</span>
                  <span className="text-[#737A74]">({row.count})</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E4E5DE] text-[11px] text-[#737A74] flex justify-between">
            <span>Positive (4-5★): {starDistribution.filter(s => s.stars >= 4).reduce((sum, s) => sum + s.count, 0)}</span>
            <span>Needs Review (≤2★): {starDistribution.filter(s => s.stars <= 2).reduce((sum, s) => sum + s.count, 0)}</span>
          </div>
        </div>

      </div>

      {/* 3. MEAL-TYPE BREAKDOWN & MULTI-MESS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Meal-type comparison */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E4E5DE]">
            <h3 className="text-sm font-bold text-[#292E2A]">Meal Course Performance</h3>
            <p className="text-xs text-[#737A74]">Comparative ratings for Breakfast, Lunch, Snacks, and Dinner</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {mealBreakdown.map((m) => (
              <div key={m.mealType} className="p-3.5 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold capitalize text-[#292E2A]">{m.mealType}</span>
                  <span className="text-[10px] text-[#737A74]">{m.count} ratings</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-xl font-extrabold text-[#244D3C]">
                    {m.avg} <span className="text-xs font-normal text-[#737A74]">★</span>
                  </div>
                  <span className="text-xs font-semibold text-[#292E2A]">{m.pct}%</span>
                </div>
                <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[#E4E5DE]">
                  <div 
                    className="bg-[#244D3C] h-full" 
                    style={{ width: `${m.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mess Comparison (if multi-mess exists) */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
            <div>
              <h3 className="text-sm font-bold text-[#292E2A]">Dining Hall Comparison</h3>
              <p className="text-xs text-[#737A74]">Performance across college mess halls</p>
            </div>
            {messes.length > 1 && (
              <span className="text-[11px] text-[#737A74] font-medium">
                {messes.length} Halls Registered
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {messBreakdown.map((m) => (
              <div 
                key={m.messId}
                onClick={() => onSelectMess && onSelectMess(m.messId)}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  selectedMessFilter === m.messId 
                    ? 'bg-[#244D3C]/10 border-[#244D3C]' 
                    : 'bg-white border-[#E4E5DE] hover:bg-[#F6F4EE]'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-[#292E2A] flex items-center gap-1.5">
                    <span>{m.messName}</span>
                    {selectedMessFilter === m.messId && (
                      <span className="text-[10px] font-semibold text-[#244D3C] bg-[#244D3C]/10 px-1.5 rounded-sm">Selected</span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#737A74]">{m.location} · {m.count} ratings</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#292E2A]">{m.avg} ★</div>
                    <div className="text-[10px] text-[#737A74]">{m.pct}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. RATING TRENDS OVER TIME */}
      {dateTrends.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
            <div>
              <h3 className="text-sm font-bold text-[#292E2A]">Rating Trends (Recent Serving Dates)</h3>
              <p className="text-xs text-[#737A74]">Daily student satisfaction trajectories</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {dateTrends.map((d) => (
              <div key={d.date} className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] text-center space-y-1">
                <div className="text-[11px] font-semibold text-[#737A74] truncate">{d.date}</div>
                <div className="text-base font-extrabold text-[#244D3C]">{d.avg} ★</div>
                <div className="text-[10px] text-[#292E2A]">{d.count} reviews</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FILTERABLE WRITTEN REVIEWS & COMMENTS */}
      <div className="bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-6">
        
        {/* Filter controls toolbar */}
        <div className="space-y-3 pb-4 border-b border-[#E4E5DE]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#292E2A]">
                Student Written Feedback & Dish Ratings ({filteredReviews.length})
              </h3>
              <p className="text-xs text-[#737A74]">
                Inspect specific student notes, identify repeated complaints, and filter low scores.
              </p>
            </div>

            {/* Threshold filter segmented buttons */}
            <div className="flex items-center gap-1 bg-[#F6F4EE] p-1 rounded-lg border border-[#E4E5DE] text-xs">
              <button
                onClick={() => setRatingThresholdFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  ratingThresholdFilter === 'all' 
                    ? 'bg-white text-[#292E2A] shadow-xs font-bold' 
                    : 'text-[#737A74] hover:text-[#292E2A]'
                }`}
              >
                All Scores
              </button>
              <button
                onClick={() => setRatingThresholdFilter('low')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  ratingThresholdFilter === 'low' 
                    ? 'bg-red-50 text-red-700 shadow-xs font-bold border border-red-200' 
                    : 'text-[#737A74] hover:text-[#292E2A]'
                }`}
              >
                Low (≤ 2★)
              </button>
              <button
                onClick={() => setRatingThresholdFilter('high')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  ratingThresholdFilter === 'high' 
                    ? 'bg-emerald-50 text-emerald-800 shadow-xs font-bold border border-emerald-200' 
                    : 'text-[#737A74] hover:text-[#292E2A]'
                }`}
              >
                High (≥ 4★)
              </button>
            </div>
          </div>

          {/* Secondary filter dropdowns & search */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
            {/* Search query */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#737A74]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search comments..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white border border-[#E4E5DE] text-[#292E2A] focus:outline-none focus:border-[#244D3C]"
              />
            </div>

            {/* Mess selector */}
            <select
              value={selectedMessFilter}
              onChange={(e) => setSelectedMessFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E4E5DE] text-[#292E2A] focus:outline-none focus:border-[#244D3C] cursor-pointer"
            >
              <option value="all">All Mess Halls</option>
              {messes.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {/* Meal filter */}
            <select
              value={selectedMealFilter}
              onChange={(e) => setSelectedMealFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E4E5DE] text-[#292E2A] focus:outline-none focus:border-[#244D3C] cursor-pointer capitalize"
            >
              <option value="all">All Meals</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="snacks">Snacks</option>
              <option value="dinner">Dinner</option>
            </select>

            {/* Date filter */}
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white border border-[#E4E5DE] text-[#292E2A] focus:outline-none focus:border-[#244D3C] cursor-pointer"
            >
              <option value="all">All Dates</option>
              {uniqueDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Written feedback list */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-3">
            {filteredReviews.map((r) => {
              const messInfo = messes.find(m => m.id === r.messId);
              return (
                <div 
                  key={r.id} 
                  className={`p-4 rounded-xl border text-xs space-y-2 transition-colors ${
                    r.score <= 2 
                      ? 'bg-red-50/40 border-red-200' 
                      : 'bg-[#F6F4EE] border-[#E4E5DE]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 font-bold text-[#292E2A]">
                        <span>{r.score}</span>
                        <Star className="w-3.5 h-3.5 fill-[#B77950] text-[#B77950]" />
                      </div>
                      <span className="text-[#737A74]">·</span>
                      <span className="font-semibold text-[#292E2A] capitalize">{r.mealType}</span>
                      {messInfo && (
                        <>
                          <span className="text-[#737A74]">·</span>
                          <span className="text-[#737A74]">{messInfo.name}</span>
                        </>
                      )}
                      <span className="text-[#737A74]">·</span>
                      <span className="text-[#737A74]">{r.serviceDate || r.createdAt?.split('T')[0]}</span>
                    </div>

                    <div className="text-[11px] text-[#737A74]">
                      by <span className="font-medium text-[#292E2A]">{r.actorName || 'Student'}</span>
                    </div>
                  </div>

                  {/* Comment */}
                  {r.comment ? (
                    <p className="text-xs text-[#292E2A] bg-white p-2.5 rounded-lg border border-[#E4E5DE] leading-relaxed">
                      "{r.comment}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#737A74] italic">
                      Star rating submitted with no written remarks.
                    </p>
                  )}

                  {/* Criteria tags */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#737A74] pt-1">
                    {r.taste && <span>Taste: <b className="text-[#292E2A]">{r.taste}★</b></span>}
                    {r.quality && <span>Quality: <b className="text-[#292E2A]">{r.quality}★</b></span>}
                    {r.quantity && <span>Quantity: <b className="text-[#292E2A]">{r.quantity}★</b></span>}
                    {r.hygiene && <span>Hygiene: <b className="text-[#292E2A]">{r.hygiene}★</b></span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-[#737A74] bg-[#F6F4EE] rounded-xl border border-[#E4E5DE]">
            No meal feedback matches the active filter criteria.
          </div>
        )}

      </div>
    </div>
  );
};
