import React, { useState } from 'react';
import { 
  Menu, 
  Poll, 
  Announcement, 
  Mess,
  MealType 
} from '../../types';
import { 
  UtensilsCrossed, 
  Star, 
  Clock, 
  ChefHat, 
  Vote, 
  Bell, 
  Info,
  Calendar,
  Smartphone,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface StudentMobilePreviewProps {
  currentMess?: Mess;
  collegeName?: string;
  menus?: Menu[];
  polls?: Poll[];
  announcements?: Announcement[];
}

export const StudentMobilePreview: React.FC<StudentMobilePreviewProps> = ({
  currentMess,
  collegeName = 'Campus Residential Hall',
  menus = [],
  polls = [],
  announcements = []
}) => {
  const [previewMealTab, setPreviewMealTab] = useState<MealType>('lunch');
  const [previewRating, setPreviewRating] = useState<number>(4);

  // Today's day index
  const todayDay = new Date().getDay();
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][todayDay];

  // Try to find the menu for today from live props, or provide a rich realistic fallback
  const liveMenuForMeal = menus.find(m => m.day === todayDay && m.mealType === previewMealTab);
  
  const sampleDishesByMeal: Record<MealType, { name: string; dishes: string; time: string; labels: string }> = {
    breakfast: {
      name: 'Breakfast Service',
      dishes: 'Masala Idli, Medu Vada, Coconut Chutney, Sambar, Tea & Coffee',
      time: currentMess?.breakfastTime || '07:30 - 09:30',
      labels: 'South Indian, High Protein'
    },
    lunch: {
      name: 'Lunch Special',
      dishes: 'Paneer Makhani, Dal Tadka, Steamed Jeera Rice, Hot Phulkas, Green Salad, Gulab Jamun',
      time: currentMess?.lunchTime || '12:00 - 14:15',
      labels: 'Vegetarian, Balanced'
    },
    snacks: {
      name: 'Evening Refreshment',
      dishes: 'Aloo Samosa with Mint Chutney, Mixed Biscuits, Filter Coffee & Ginger Cardamom Chai',
      time: currentMess?.snacksTime || '16:45 - 18:00',
      labels: 'Evening Snack'
    },
    dinner: {
      name: 'Dinner Service',
      dishes: 'Kadhai Veg, Yellow Moong Dal, Vegetable Pulao, Whole Wheat Rotis, Papad, Seasonal Fruit',
      time: currentMess?.dinnerTime || '19:45 - 21:45',
      labels: 'Nutritious & Light'
    }
  };

  const activeMenuDisplay = {
    dishes: liveMenuForMeal?.dishes || sampleDishesByMeal[previewMealTab].dishes,
    time: liveMenuForMeal ? `${liveMenuForMeal.startTime} - ${liveMenuForMeal.endTime}` : sampleDishesByMeal[previewMealTab].time,
    labels: liveMenuForMeal?.labels || sampleDishesByMeal[previewMealTab].labels
  };

  // Active poll from props or sample
  const activePoll = polls.length > 0 ? polls[0] : {
    id: 'sample-poll',
    question: 'Select preferred Sunday Dinner Special',
    options: ['Veg Biryani & Mirchi Salan', 'Chole Bhature & Sweet Lassi', 'Paneer Tikka & Butter Naan'],
    status: 'active'
  };

  const pollOptions: string[] = Array.isArray(activePoll.options) 
    ? activePoll.options 
    : typeof activePoll.options === 'string' 
    ? (activePoll.options as string).split(',').map(s => s.trim()) 
    : [];

  return (
    <div className="space-y-6">
      {/* Header bar explaining preview */}
      <div className="bg-white p-5 rounded-xl border border-[#E5E8E3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#285943]" />
            <h2 className="text-base font-bold text-[#242925]">Student Mobile Viewport Preview</h2>
          </div>
          <p className="text-xs text-[#6B716D] mt-1">
            Simulates how hostel residents experience daily menus, dish rating forms, and polls on mobile devices.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#285943]/10 text-[#285943] border border-[#285943]/20">
          <Lock className="w-3.5 h-3.5" />
          <span>Interactive Demo (Read-Only Mode)</span>
        </div>
      </div>

      {/* Main Container with Mobile Bezel Frame */}
      <div className="flex justify-center items-center py-4 bg-[#F8F7F3]">
        {/* Phone chassis */}
        <div className="w-full max-w-[380px] bg-[#242925] rounded-[44px] p-3 shadow-2xl border-4 border-[#242925] ring-1 ring-black/10">
          
          {/* Inner Phone Screen */}
          <div className="bg-[#F8F7F3] rounded-[36px] overflow-hidden border border-[#E5E8E3] relative flex flex-col h-[740px] select-none">
            
            {/* Status Bar */}
            <div className="bg-[#F8F7F3] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-[#242925] shrink-0 border-b border-[#E5E8E3]">
              <span>9:41</span>
              {/* Dynamic Island / Speaker Pill */}
              <div className="w-20 h-4 bg-[#242925] rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span>5G</span>
                <span className="font-bold">100%</span>
              </div>
            </div>

            {/* Read-Only Watermark Banner */}
            <div className="bg-[#285943] text-white px-3 py-1 text-[10px] font-medium flex items-center justify-center gap-1.5 shrink-0">
              <Lock className="w-3 h-3" />
              <span>Admin Preview Mode · No live data submitted</span>
            </div>

            {/* Scrollable Mobile Viewport Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* Top Bar inside app */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-medium text-[#6B716D] uppercase tracking-wider">
                    {collegeName}
                  </div>
                  <h3 className="text-sm font-bold text-[#242925] truncate max-w-[200px]">
                    {currentMess?.name || 'Central Hostel Mess'}
                  </h3>
                </div>
                <div className="w-7 h-7 rounded-lg bg-[#285943] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Day & Date Indicator */}
              <div className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-white border border-[#E5E8E3]">
                <div className="flex items-center gap-1.5 text-[#242925] font-semibold text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#285943]" />
                  <span>{dayName} Menu</span>
                </div>
                <span className="text-[10px] text-[#6B716D]">
                  {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* Meal Selector Tabs (Mobile Segmented Bar) */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-lg border border-[#E5E8E3]">
                {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPreviewMealTab(m)}
                    className={`py-1 text-[10px] font-semibold rounded-md capitalize transition-colors ${
                      previewMealTab === m
                        ? 'bg-[#285943] text-white'
                        : 'text-[#6B716D] hover:text-[#242925]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Active Meal Card */}
              <div className="bg-white p-4 rounded-xl border border-[#E5E8E3] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#242925] capitalize">
                    <ChefHat className="w-3.5 h-3.5 text-[#285943]" />
                    <span>{previewMealTab} Course</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-[#6B716D]">
                    <Clock className="w-3 h-3 text-[#285943]" />
                    <span>{activeMenuDisplay.time}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#242925] leading-snug">
                    {activeMenuDisplay.dishes}
                  </div>
                  <div className="text-[10px] text-[#C87942] font-semibold">
                    {activeMenuDisplay.labels}
                  </div>
                </div>

                {/* Simulated Rating Widget */}
                <div className="pt-2 border-t border-[#E5E8E3] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#242925]">Rate This Meal</span>
                    <span className="text-[10px] text-[#6B716D]">{previewRating} of 5 Stars</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#F8F7F3] border border-[#E5E8E3]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setPreviewRating(star)}
                        className="p-1 cursor-pointer"
                        title={`Preview rate ${star} star`}
                      >
                        <Star 
                          className={`w-4 h-4 ${
                            star <= previewRating 
                              ? 'text-[#C87942] fill-[#C87942]' 
                              : 'text-[#E5E8E3]'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>

                  {/* 4 Criteria Sliders Preview */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                    <div className="p-1.5 rounded-md bg-[#F8F7F3] border border-[#E5E8E3] flex justify-between">
                      <span className="text-[#6B716D]">Taste</span>
                      <span className="font-bold text-[#242925]">4.7 ★</span>
                    </div>
                    <div className="p-1.5 rounded-md bg-[#F8F7F3] border border-[#E5E8E3] flex justify-between">
                      <span className="text-[#6B716D]">Hygiene</span>
                      <span className="font-bold text-[#242925]">4.9 ★</span>
                    </div>
                    <div className="p-1.5 rounded-md bg-[#F8F7F3] border border-[#E5E8E3] flex justify-between">
                      <span className="text-[#6B716D]">Quantity</span>
                      <span className="font-bold text-[#242925]">4.5 ★</span>
                    </div>
                    <div className="p-1.5 rounded-md bg-[#F8F7F3] border border-[#E5E8E3] flex justify-between">
                      <span className="text-[#6B716D]">Quality</span>
                      <span className="font-bold text-[#242925]">4.6 ★</span>
                    </div>
                  </div>

                  <button
                    disabled
                    className="w-full py-1.5 rounded-md bg-[#E5E8E3] text-[#6B716D] text-[10px] font-semibold cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Submit Rating (Disabled in Preview)</span>
                  </button>
                </div>
              </div>

              {/* Active Poll Widget Preview */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E8E3] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#242925]">
                    <Vote className="w-3.5 h-3.5 text-[#285943]" />
                    <span className="text-[11px]">Active Food Poll</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                    Open
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-[#242925]">
                  {activePoll.question}
                </div>

                <div className="space-y-1.5">
                  {pollOptions.map((opt, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-md bg-[#F8F7F3] border border-[#E5E8E3] text-[10px] flex items-center justify-between text-[#242925]"
                    >
                      <span>{opt}</span>
                      <span className="text-[#6B716D] font-bold">{idx === 0 ? '62%' : '38%'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Announcements Preview */}
              <div className="bg-white p-3.5 rounded-xl border border-[#E5E8E3] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#242925] text-[11px]">
                  <Bell className="w-3.5 h-3.5 text-[#C87942]" />
                  <span>Mess Notice Board</span>
                </div>
                <div className="p-2.5 rounded-md bg-[#F8F7F3] border border-[#E5E8E3] space-y-1">
                  <div className="text-[10px] font-bold text-[#242925]">
                    {announcements.length > 0 ? announcements[0].title : 'Sunday Feast Timing Notice'}
                  </div>
                  <p className="text-[9px] text-[#6B716D] leading-snug">
                    {announcements.length > 0 
                      ? announcements[0].body 
                      : 'Special dinner service starts early at 7:30 PM due to the annual hostel sports meet. Extra ice cream counter will be open.'}
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Navigation Mock inside Mobile */}
            <div className="bg-white px-6 py-2.5 border-t border-[#E5E8E3] flex items-center justify-around text-[10px] font-medium text-[#6B716D] shrink-0">
              <div className="flex flex-col items-center text-[#285943]">
                <ChefHat className="w-3.5 h-3.5" />
                <span className="text-[9px] mt-0.5 font-bold">Menu</span>
              </div>
              <div className="flex flex-col items-center">
                <Vote className="w-3.5 h-3.5" />
                <span className="text-[9px] mt-0.5">Polls</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-3.5 h-3.5" />
                <span className="text-[9px] mt-0.5">Feedback</span>
              </div>
            </div>

            {/* Home indicator bar at bottom */}
            <div className="bg-white py-1 flex justify-center shrink-0">
              <div className="w-32 h-1 bg-[#242925]/30 rounded-full" />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
