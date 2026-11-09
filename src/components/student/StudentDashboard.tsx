import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  doc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { 
  Menu, 
  MealRating, 
  FeedbackItem, 
  Poll, 
  PollResponse, 
  Announcement, 
  MealType,
  Mess 
} from '../../types';
import { DEFAULT_MESSES } from '../../firebase/seed';
import { 
  UtensilsCrossed, 
  Star, 
  Clock, 
  ChefHat, 
  Vote, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Bell, 
  QrCode, 
  Sparkles,
  Calendar,
  ThumbsUp,
  MessageCircleQuestion,
  ChevronRight,
  Filter,
  X,
  Loader2
} from 'lucide-react';
import QRCode from 'qrcode';
import { validateReviewText, MSG_IRRELEVANT, MSG_UNCERTAIN } from '../../utils/reviewValidation';

export const StudentDashboard: React.FC = () => {
  const { currentUser, userProfile, updateUserMess } = useAuth();

  // State from Firestore real-time listeners
  const [collegeMesses, setCollegeMesses] = useState<Mess[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [todayRatings, setTodayRatings] = useState<MealRating[]>([]);
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollVotes, setPollVotes] = useState<PollResponse[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Local UI state
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [activeMealTab, setActiveMealTab] = useState<MealType>('lunch');
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [ratingTargetMeal, setRatingTargetMeal] = useState<{ mealType: MealType; menu?: Menu } | null>(null);
  
  // Rating form state
  const [score, setScore] = useState<number>(5);
  const [taste, setTaste] = useState<number>(5);
  const [quality, setQuality] = useState<number>(5);
  const [quantity, setQuantity] = useState<number>(5);
  const [hygiene, setHygiene] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingValidationWarning, setRatingValidationWarning] = useState<string | null>(null);
  const [ratingSuccessMsg, setRatingSuccessMsg] = useState<string | null>(null);

  // Feedback form state
  const [feedbackKind, setFeedbackKind] = useState<'complaint' | 'suggestion'>('complaint');
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Food Quality');
  const [feedbackBody, setFeedbackBody] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState<string | null>(null);
  const [feedbackValidationWarning, setFeedbackValidationWarning] = useState<string | null>(null);

  // QR Code state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedLinkNotice, setCopiedLinkNotice] = useState<boolean>(false);

  const activeMessId = userProfile?.messId || 'mess-iitb-h12';
  const todayStr = new Date().toISOString().split('T')[0];

  // Generate QR Code for this mess
  useEffect(() => {
    if (activeMessId) {
      const url = `${window.location.origin}/?mess=${activeMessId}`;
      QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#244D3C', light: '#FFFFFF' } })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [activeMessId]);

  // Real-time listener for messes in this college
  useEffect(() => {
    if (!userProfile?.collegeId) return;
    const q = query(collection(db, 'messes'), where('collegeId', '==', userProfile.collegeId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Mess));
      setCollegeMesses(docs);
    }, (error) => {
      console.warn('Student mess list listener warning:', error);
    });
    return () => unsubscribe();
  }, [userProfile?.collegeId]);

  // Real-time listener for Menus
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'menus'), where('messId', '==', activeMessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Menu));
      setMenus(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'menus');
    });
    return () => unsubscribe();
  }, [currentUser, activeMessId]);

  // Real-time listener for Today's Ratings
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'mealRatings'),
      where('messId', '==', activeMessId),
      where('serviceDate', '==', todayStr)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MealRating));
      setTodayRatings(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'mealRatings');
    });
    return () => unsubscribe();
  }, [currentUser, activeMessId, todayStr]);

  // Real-time listener for Student's own Feedback
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'feedback'),
      where('userId', '==', currentUser.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackItem));
      // Sort newest first
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyFeedback(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'feedback');
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Real-time listener for Polls
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'polls'), where('messId', '==', activeMessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Poll));
      setPolls(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'polls');
    });
    return () => unsubscribe();
  }, [currentUser, activeMessId]);

  // Real-time listener for Poll Votes
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'pollResponses'), where('messId', '==', activeMessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PollResponse));
      setPollVotes(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pollResponses');
    });
    return () => unsubscribe();
  }, [currentUser, activeMessId]);

  // Real-time listener for Announcements
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'announcements'), where('messId', '==', activeMessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'announcements');
    });
    return () => unsubscribe();
  }, [currentUser, activeMessId]);

  // Days mapping
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Current day's menus
  const dayMenus = menus.filter(m => m.day === selectedDay);
  const currentMeal = dayMenus.find(m => m.mealType === activeMealTab);

  // Check if current user already rated this meal today
  const myRatingForActiveMeal = todayRatings.find(
    r => r.userId === currentUser?.uid && r.mealType === activeMealTab
  );

  // Submit or Update Rating with LLM Validation for written remarks
  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !ratingTargetMeal) return;
    setIsSubmittingRating(true);
    setRatingValidationWarning(null);
    setRatingSuccessMsg(null);

    const trimmedComment = ratingComment.trim();

    try {
      // If student provided written remarks, validate strictly!
      if (trimmedComment.length > 0) {
        let isValidated = false;
        try {
          const valRes = await fetch('/api/validate-review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
            body: JSON.stringify({
              reviewText: trimmedComment,
              mealType: ratingTargetMeal.mealType,
              messName: userProfile.messName || 'Hostel Mess',
              collegeName: userProfile.collegeName || 'Campus',
              dishes: ratingTargetMeal.menu?.dishes || 'Served dishes'
            }),
          });

          if (valRes.ok) {
            const valData = await valRes.json();
            if (valData.decision === 'IRRELEVANT') {
              setIsSubmittingRating(false);
              setRatingValidationWarning(valData.userMessage || MSG_IRRELEVANT);
              return;
            } else if (valData.decision === 'UNCERTAIN') {
              setIsSubmittingRating(false);
              setRatingValidationWarning(valData.userMessage || MSG_UNCERTAIN);
              return;
            } else if (valData.decision === 'RELEVANT') {
              isValidated = true;
            }
          }
        } catch (fetchErr) {
          console.warn('Backend review validation notice:', fetchErr);
        }

        // Authoritative fallback: if backend did not confirm RELEVANT, run local deterministic validation
        if (!isValidated) {
          const localCheck = validateReviewText(trimmedComment);
          if (localCheck.decision === 'IRRELEVANT') {
            setIsSubmittingRating(false);
            setRatingValidationWarning(MSG_IRRELEVANT);
            return;
          } else if (localCheck.decision === 'UNCERTAIN') {
            setIsSubmittingRating(false);
            setRatingValidationWarning(MSG_UNCERTAIN);
            return;
          }
        }
      }

      if (myRatingForActiveMeal) {
        // Update existing rating for today's meal
        await updateDoc(doc(db, 'mealRatings', myRatingForActiveMeal.id), {
          score,
          taste,
          quality,
          quantity,
          hygiene,
          comment: trimmedComment,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new single rating
        const ratingDoc: Omit<MealRating, 'id'> = {
          messId: activeMessId,
          collegeId: userProfile.collegeId,
          menuId: ratingTargetMeal.menu?.id || 'adhoc',
          mealType: ratingTargetMeal.mealType,
          serviceDate: todayStr,
          score,
          taste,
          quality,
          quantity,
          hygiene,
          comment: trimmedComment,
          userId: currentUser.uid,
          actorName: userProfile.name || 'Student',
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'mealRatings'), ratingDoc);
      }

      setRatingSuccessMsg('Thank you! Your feedback has been submitted successfully.');
      setTimeout(() => {
        setRatingModalOpen(false);
        setRatingComment('');
        setRatingSuccessMsg(null);
        setRatingValidationWarning(null);
      }, 1200);
    } catch (err: any) {
      handleFirestoreError(err, myRatingForActiveMeal ? OperationType.UPDATE : OperationType.CREATE, 'mealRatings');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Submit Complaint / Suggestion with LLM Validation
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !userProfile || !feedbackBody.trim()) return;
    setIsSubmittingFeedback(true);
    setFeedbackSuccessMsg(null);
    setFeedbackValidationWarning(null);

    const trimmedBody = feedbackBody.trim();

    try {
      // Validate with LLM endpoint before saving to permanent feedback collection
      let isValidated = false;
      try {
        const valRes = await fetch('/api/validate-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(5000),
          body: JSON.stringify({
            reviewText: trimmedBody,
            mealType: activeMealTab,
            messName: userProfile.messName || 'Hostel Mess',
            collegeName: userProfile.collegeName || 'Campus',
            dishes: currentMeal?.dishes || 'Mess menu'
          }),
        });

        if (valRes.ok) {
          const valData = await valRes.json();
          if (valData.decision === 'IRRELEVANT') {
            setIsSubmittingFeedback(false);
            setFeedbackValidationWarning(valData.userMessage || MSG_IRRELEVANT);
            return;
          } else if (valData.decision === 'UNCERTAIN') {
            setIsSubmittingFeedback(false);
            setFeedbackValidationWarning(valData.userMessage || MSG_UNCERTAIN);
            return;
          } else if (valData.decision === 'RELEVANT') {
            isValidated = true;
          }
        }
      } catch (valErr) {
        console.warn('Feedback validation check notice:', valErr);
      }

      // Authoritative fallback: run deterministic check
      if (!isValidated) {
        const localCheck = validateReviewText(trimmedBody);
        if (localCheck.decision === 'IRRELEVANT') {
          setIsSubmittingFeedback(false);
          setFeedbackValidationWarning(MSG_IRRELEVANT);
          return;
        } else if (localCheck.decision === 'UNCERTAIN') {
          setIsSubmittingFeedback(false);
          setFeedbackValidationWarning(MSG_UNCERTAIN);
          return;
        }
      }

      const feedbackDoc: Omit<FeedbackItem, 'id'> = {
        messId: activeMessId,
        collegeId: userProfile.collegeId,
        userId: currentUser.uid,
        userName: userProfile.name || 'Student',
        kind: feedbackKind,
        category: feedbackCategory,
        body: trimmedBody,
        status: 'Submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'feedback'), feedbackDoc);
      setFeedbackBody('');
      setFeedbackSuccessMsg('Thank you! Your feedback has been submitted successfully.');
      setTimeout(() => setFeedbackSuccessMsg(null), 5000);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Submit Poll Vote
  const handleVote = async (pollId: string, choiceIndex: number) => {
    if (!currentUser || !userProfile) return;
    try {
      const voteDoc: Omit<PollResponse, 'id'> = {
        pollId,
        messId: activeMessId,
        userId: currentUser.uid,
        choice: choiceIndex,
        votedAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'pollResponses'), voteDoc);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, 'pollResponses');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F6F4EE]">
      
      {/* Student Welcome & Dining Hall Info Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#E4E5DE] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#244D3C]/10 text-[#244D3C] text-xs font-semibold">
              <ChefHat className="w-3.5 h-3.5 text-[#244D3C]" />
              <span>Hostel Resident Dining Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292E2A]">
              Welcome back, {userProfile?.name}!
            </h1>
            <p className="text-xs text-[#777D76]">
              Assigned Hall: <span className="font-semibold text-[#292E2A]">{userProfile?.messName || 'Hostel Dining Hall'}</span> ({userProfile?.collegeName || 'Campus'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowQrModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] text-[#292E2A] text-xs font-semibold hover:bg-white shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-[#244D3C]" />
              <span>Mess QR Check-in</span>
            </button>

            {/* Quick Mess Switcher */}
            {collegeMesses.length > 0 && (
              <select
                value={activeMessId}
                onChange={(e) => {
                  const found = collegeMesses.find(m => m.id === e.target.value);
                  if (found) updateUserMess(found.id, found.name);
                }}
                className="px-3.5 py-2.5 rounded-lg bg-white border border-[#E4E5DE] text-xs font-semibold text-[#292E2A] focus:outline-none focus:border-[#244D3C] cursor-pointer"
              >
                {collegeMesses.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.locationBlock ? `(${m.locationBlock})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Urgent Announcements ticker if any */}
        {announcements.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#E4E5DE] flex items-start gap-3 bg-[#F6F4EE] p-4 rounded-lg border border-[#E4E5DE]">
            <Bell className="w-4 h-4 text-[#B77950] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-[#292E2A] uppercase tracking-wider mr-2 text-[10px] bg-[#B77950]/15 text-[#B77950] px-2 py-0.5 rounded-md">
                Notice: {announcements[0].title}
              </span>
              <span className="text-[#292E2A]">{announcements[0].body}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Menus on Left, Community/Feedback on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (7 cols): Today's Menu & Weekly Schedule */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E4E5DE] space-y-6">
            
            {/* Header: Day picker */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E5DE]">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#244D3C]" />
                <h2 className="text-base font-bold text-[#292E2A]">Mess Schedule</h2>
              </div>

              {/* Day selection pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {daysOfWeek.map((dayName, idx) => (
                  <button
                    key={dayName}
                    onClick={() => setSelectedDay(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      selectedDay === idx 
                        ? 'bg-[#244D3C] text-white shadow-xs' 
                        : 'text-[#777D76] hover:bg-[#F6F4EE]'
                    }`}
                  >
                    {dayName.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Meal Type Tabs (Breakfast, Lunch, Snacks, Dinner) */}
            <div className="grid grid-cols-4 p-1 bg-[#F6F4EE] rounded-lg border border-[#E4E5DE] text-xs font-semibold">
              {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((mType) => (
                <button
                  key={mType}
                  onClick={() => setActiveMealTab(mType)}
                  className={`py-2 rounded-md capitalize transition-all cursor-pointer ${
                    activeMealTab === mType
                      ? 'bg-white text-[#244D3C] shadow-xs'
                      : 'text-[#777D76] hover:text-[#292E2A]'
                  }`}
                >
                  {mType}
                </button>
              ))}
            </div>

            {/* Active Meal Details Card */}
            {currentMeal ? (
              <div className="bg-[#F6F4EE] p-5 rounded-xl border border-[#E4E5DE] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#244D3C] text-white font-semibold text-xs uppercase tracking-wider">
                      {currentMeal.mealType}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#777D76] font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#244D3C]" />
                      {currentMeal.startTime} - {currentMeal.endTime}
                    </span>
                  </div>
                  {currentMeal.labels && (
                    <span className="px-2 py-0.5 rounded-md bg-[#B77950]/15 text-[#B77950] text-xs font-semibold">
                      {currentMeal.labels}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#777D76] uppercase tracking-wider">Menu Dishes</div>
                  <p className="text-sm font-bold text-[#292E2A] leading-relaxed">
                    {currentMeal.dishes}
                  </p>
                </div>

                {/* Rating CTA / Review status */}
                <div className="pt-3 border-t border-[#E4E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {myRatingForActiveMeal ? (
                    <div className="flex items-center gap-2 text-xs text-[#244D3C] font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
                      <span>You rated this meal ({myRatingForActiveMeal.score} ★)</span>
                      {myRatingForActiveMeal.comment && (
                        <span className="text-[#777D76] font-normal italic truncate max-w-[200px]">
                          "{myRatingForActiveMeal.comment}"
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#777D76]">
                      How was today's {currentMeal.mealType}? Your feedback improves tomorrow's menu.
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setRatingTargetMeal({ mealType: activeMealTab, menu: currentMeal });
                      if (myRatingForActiveMeal) {
                        setScore(myRatingForActiveMeal.score);
                        setTaste(myRatingForActiveMeal.taste || myRatingForActiveMeal.score);
                        setQuality(myRatingForActiveMeal.quality || myRatingForActiveMeal.score);
                        setQuantity(myRatingForActiveMeal.quantity || myRatingForActiveMeal.score);
                        setHygiene(myRatingForActiveMeal.hygiene || myRatingForActiveMeal.score);
                        setRatingComment(myRatingForActiveMeal.comment || '');
                      } else {
                        setScore(5);
                        setTaste(5);
                        setQuality(5);
                        setQuantity(5);
                        setHygiene(5);
                        setRatingComment('');
                      }
                      setRatingModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1B3C2E] text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{myRatingForActiveMeal ? 'Update Today\'s Rating' : 'Rate this Meal'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4 bg-[#F6F4EE] rounded-xl border border-dashed border-[#E4E5DE] text-[#777D76] space-y-2">
                <UtensilsCrossed className="w-8 h-8 mx-auto text-[#244D3C]/40" />
                <p className="text-sm font-semibold">No menu scheduled for {activeMealTab} on {daysOfWeek[selectedDay]}.</p>
                <p className="text-xs">The mess committee will publish updates shortly.</p>
              </div>
            )}

            {/* Today's Average Ratings Breakdown for this Mess */}
            {todayRatings.length > 0 && (
              <div className="pt-2">
                <div className="text-xs font-bold text-[#292E2A] uppercase tracking-wider mb-3">
                  Live Mess Ratings Today ({todayRatings.length} reviews)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['breakfast', 'lunch', 'snacks', 'dinner'].map((m) => {
                    const mealR = todayRatings.filter(r => r.mealType === m);
                    const avg = mealR.length > 0 
                      ? (mealR.reduce((acc, curr) => acc + curr.score, 0) / mealR.length).toFixed(1) 
                      : '—';
                    return (
                      <div key={m} className="p-3 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] text-center">
                        <div className="text-[11px] font-semibold text-[#777D76] capitalize">{m}</div>
                        <div className="text-base font-extrabold text-[#244D3C] flex items-center justify-center gap-1 mt-0.5">
                          <span>{avg}</span>
                          {avg !== '—' && <Star className="w-3.5 h-3.5 fill-[#B77950] text-[#B77950]" />}
                        </div>
                        <div className="text-[10px] text-[#777D76] mt-0.5">{mealR.length} votes</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Complaints Section */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E4E5DE] space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E4E5DE]">
              <MessageSquare className="w-5 h-5 text-[#244D3C]" />
              <h2 className="text-base font-bold text-[#292E2A]">Grievance & Suggestion Box</h2>
            </div>

            {feedbackSuccessMsg && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feedbackSuccessMsg}</span>
              </div>
            )}

            {/* Submission Form */}
            <form onSubmit={handleSubmitFeedback} className="space-y-4 bg-[#F6F4EE] p-5 rounded-xl border border-[#E4E5DE]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#292E2A]">Submission Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFeedbackKind('complaint')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        feedbackKind === 'complaint'
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'bg-white border-[#E4E5DE] text-[#777D76]'
                      }`}
                    >
                      Complaint
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeedbackKind('suggestion')}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        feedbackKind === 'suggestion'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                          : 'bg-white border-[#E4E5DE] text-[#777D76]'
                      }`}
                    >
                      Suggestion
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#292E2A]">Category</label>
                  <select
                    value={feedbackCategory}
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E4E5DE] text-xs font-semibold text-[#292E2A] focus:outline-none focus:border-[#244D3C]"
                  >
                    <option value="Food Quality">Food Quality & Freshness</option>
                    <option value="Hygiene & Cleanliness">Hygiene & Cleanliness</option>
                    <option value="Serving Timings">Serving Timings & Delay</option>
                    <option value="Quantity / Refill">Quantity / Shortage</option>
                    <option value="Menu Suggestions">Menu Suggestion</option>
                    <option value="Staff Behavior">Catering Staff Service</option>
                  </select>
                </div>
              </div>

              {/* Validation Warning Banner for Grievance Form */}
              {feedbackValidationWarning && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium">{feedbackValidationWarning}</span>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      You can modify your description to include specific food or mess details and submit again.
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292E2A]">Describe details clearly</label>
                <textarea
                  required
                  rows={3}
                  value={feedbackBody}
                  onChange={(e) => {
                    setFeedbackBody(e.target.value);
                    if (feedbackValidationWarning) setFeedbackValidationWarning(null);
                  }}
                  placeholder="e.g. Sambar was cold during today's lunch; water cooler needs filter replacement..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C] resize-none text-[#292E2A]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingFeedback || !feedbackBody.trim()}
                  className="px-5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1B3C2E] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingFeedback ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit to Warden</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* My Previous Feedback Tracker */}
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-[#292E2A] uppercase tracking-wider">
                My Submitted Complaints & Status ({myFeedback.length})
              </div>

              {myFeedback.length > 0 ? (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {myFeedback.map((item) => (
                    <div key={item.id} className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                            item.kind === 'complaint' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {item.kind}
                          </span>
                          <span className="font-semibold text-[#292E2A]">{item.category}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold ${
                          item.status === 'Resolved' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.status === 'In Review' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <p className="text-xs text-[#292E2A]">{item.body}</p>

                      {item.response && (
                        <div className="p-2.5 rounded-lg bg-white border border-[#E4E5DE] text-[11px] text-[#244D3C] mt-1 space-y-0.5">
                          <div className="font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#244D3C]" />
                            <span>Warden / Committee Response:</span>
                          </div>
                          <p className="text-[#292E2A]">{item.response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#777D76] italic">No grievances filed yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Food Polls & Active Announcements */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Democratic Food Polls Card */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E4E5DE] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
              <div className="flex items-center gap-2">
                <Vote className="w-5 h-5 text-[#244D3C]" />
                <h2 className="text-base font-bold text-[#292E2A]">Mess Food Polls</h2>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#244D3C]/10 text-[#244D3C]">
                Democratic
              </span>
            </div>

            {polls.length > 0 ? (
              <div className="space-y-5">
                {polls.map((poll) => {
                  const pollVotesList = pollVotes.filter(v => v.pollId === poll.id);
                  const totalVotes = pollVotesList.length;
                  const myVote = pollVotesList.find(v => v.userId === currentUser?.uid);
                  const rawOptions = Array.isArray(poll.options) 
                    ? poll.options 
                    : typeof poll.options === 'string' 
                    ? (poll.options as string).split(',').map(s => s.trim()) 
                    : [];

                  return (
                    <div key={poll.id} className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-3">
                      <div>
                        <h3 className="font-bold text-xs text-[#292E2A]">{poll.question}</h3>
                        <div className="flex items-center justify-between text-[11px] text-[#777D76] mt-1">
                          <span>{totalVotes} student votes</span>
                          {poll.closesAt && <span>Closes: {poll.closesAt}</span>}
                        </div>
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {rawOptions.map((opt, oIdx) => {
                          const optionVotes = pollVotesList.filter(v => v.choice === oIdx).length;
                          const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                          const isSelected = myVote?.choice === oIdx;

                          return (
                            <button
                              key={oIdx}
                              disabled={!!myVote || poll.status === 'closed'}
                              onClick={() => handleVote(poll.id, oIdx)}
                              className={`w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden group cursor-pointer disabled:cursor-default ${
                                isSelected 
                                  ? 'border-[#244D3C] bg-white ring-1 ring-[#244D3C]' 
                                  : 'border-[#E4E5DE] bg-white hover:border-[#244D3C]/40'
                              }`}
                            >
                              {/* Background progress fill if user has voted */}
                              {myVote && (
                                <div 
                                  className="absolute left-0 top-0 bottom-0 bg-[#244D3C]/10 transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              )}

                              <div className="relative flex items-center justify-between text-xs z-10">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                    isSelected ? 'border-[#244D3C] bg-[#244D3C]' : 'border-[#777D76]'
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className={`font-semibold ${isSelected ? 'text-[#244D3C]' : 'text-[#292E2A]'}`}>
                                    {opt}
                                  </span>
                                </div>
                                {myVote && (
                                  <span className="font-bold text-[#244D3C]">{pct}% ({optionVotes})</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {myVote && (
                        <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Your vote has been recorded! Results update live.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#777D76] italic">No active polls at the moment.</p>
            )}
          </div>

          {/* Announcements & Notices Board */}
          <div className="bg-white rounded-xl p-6 shadow-xs border border-[#E4E5DE] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E4E5DE]">
              <Bell className="w-5 h-5 text-[#244D3C]" />
              <h2 className="text-base font-bold text-[#292E2A]">Mess Notice Board</h2>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#292E2A]">{ann.title}</span>
                    <span className="text-[10px] text-[#777D76]">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#777D76] leading-relaxed">{ann.body}</p>
                  <div className="text-[10px] text-[#244D3C] font-semibold pt-1">
                    — {ann.authorName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Meal Rating Modal */}
      {ratingModalOpen && ratingTargetMeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292E2A]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-[#E4E5DE] overflow-hidden">
            <div className="bg-[#F6F4EE] px-6 py-4 border-b border-[#E4E5DE] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-[#292E2A] capitalize">
                  {myRatingForActiveMeal ? `Update Today's ${ratingTargetMeal.mealType} Rating` : `Rate Today's ${ratingTargetMeal.mealType}`}
                </h3>
                <p className="text-xs text-[#777D76] mt-0.5">
                  {ratingTargetMeal.menu?.dishes || 'Served meal course'}
                </p>
              </div>
              <button 
                onClick={() => setRatingModalOpen(false)}
                className="p-1.5 rounded-lg text-[#777D76] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {myRatingForActiveMeal && (
              <div className="bg-emerald-50 px-6 py-2 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>You previously recorded <b>{myRatingForActiveMeal.score} ★</b> for this meal today. Updating will save changes without duplicate entries.</span>
              </div>
            )}

            <form onSubmit={handleSubmitRating} className="p-6 space-y-5">
              {/* Overall Star Rating */}
              <div className="text-center space-y-2">
                <label className="text-xs font-semibold text-[#777D76] uppercase tracking-wider">Overall Satisfaction</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setScore(starVal)}
                      className="p-1 transition-transform hover:scale-115 cursor-pointer"
                    >
                      <Star 
                        className={`w-7 h-7 ${
                          starVal <= score 
                            ? 'fill-[#B77950] text-[#B77950]' 
                            : 'text-[#E4E5DE]'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
                <div className="text-xs font-bold text-[#244D3C]">
                  {score === 5 && 'Delicious & Fresh'}
                  {score === 4 && 'Good quality meal'}
                  {score === 3 && 'Average'}
                  {score === 2 && 'Needs improvement'}
                  {score === 1 && 'Poor experience'}
                </div>
              </div>

              {/* Specific Criteria Breakdown */}
              <div className="grid grid-cols-2 gap-4 bg-[#F6F4EE] p-4 rounded-xl border border-[#E4E5DE]">
                {/* Taste */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#292E2A]">
                    <span>Taste & Flavor</span>
                    <span className="text-[#244D3C] font-bold">{taste} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={taste}
                    onChange={(e) => setTaste(Number(e.target.value))}
                    className="w-full accent-[#244D3C] cursor-pointer"
                  />
                </div>

                {/* Hygiene */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#292E2A]">
                    <span>Mess Hygiene</span>
                    <span className="text-[#244D3C] font-bold">{hygiene} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={hygiene}
                    onChange={(e) => setHygiene(Number(e.target.value))}
                    className="w-full accent-[#244D3C] cursor-pointer"
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#292E2A]">
                    <span>Portion Size</span>
                    <span className="text-[#244D3C] font-bold">{quantity} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full accent-[#244D3C] cursor-pointer"
                  />
                </div>

                {/* Quality */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-[#292E2A]">
                    <span>Food Quality</span>
                    <span className="text-[#244D3C] font-bold">{quality} ★</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-[#244D3C] cursor-pointer"
                  />
                </div>
              </div>

              {/* LLM Validation Warning Banner */}
              {ratingValidationWarning && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-medium">{ratingValidationWarning}</span>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      You can edit your written remarks and click submit again.
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message Banner */}
              {ratingSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-medium">{ratingSuccessMsg}</span>
                </div>
              )}

              {/* Comment */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Specific comment or dish remarks (optional)</label>
                <textarea
                  rows={2}
                  value={ratingComment}
                  onChange={(e) => {
                    setRatingComment(e.target.value);
                    if (ratingValidationWarning) setRatingValidationWarning(null);
                  }}
                  placeholder="e.g. Rice was well-cooked, but dal needed slightly more salt..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C] resize-none text-[#292E2A]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRatingModalOpen(false);
                    setRatingValidationWarning(null);
                  }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#777D76] hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1B3C2E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmittingRating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmittingRating ? 'Validating...' : myRatingForActiveMeal ? 'Save Rating Update' : 'Submit Rating'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Dialog */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292E2A]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl border border-[#E4E5DE] text-center space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#244D3C]">Dining Hall QR</span>
              <button 
                onClick={() => {
                  setShowQrModal(false);
                  setCopiedLinkNotice(false);
                }} 
                className="p-1 rounded-lg text-[#777D76] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#F6F4EE] rounded-lg inline-block border border-[#E4E5DE]">
              {qrDataUrl && <img src={qrDataUrl} alt="Mess QR Code" className="w-56 h-56 mx-auto rounded-lg" />}
            </div>

            <div>
              <h3 className="font-bold text-sm text-[#292E2A]">{userProfile?.messName}</h3>
              <p className="text-xs text-[#777D76] mt-1">
                Scan with any phone camera to open this mess menu and check today's meals.
              </p>
            </div>

            {copiedLinkNotice && (
              <div className="p-2 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mess link copied to clipboard!</span>
              </div>
            )}

            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/?mess=${activeMessId}`);
                setCopiedLinkNotice(true);
                setTimeout(() => setCopiedLinkNotice(false), 3000);
              }}
              className="w-full py-2.5 rounded-lg bg-[#244D3C] text-white font-semibold text-xs shadow-xs hover:bg-[#1B3C2E] transition-colors cursor-pointer"
            >
              Copy Direct Mess Link
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
