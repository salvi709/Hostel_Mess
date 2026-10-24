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
  deleteDoc, 
  doc, 
  setDoc,
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Menu, 
  MealRating, 
  FeedbackItem, 
  Poll, 
  PollResponse, 
  Announcement, 
  AdminRequest, 
  MealType,
  Mess,
  Subscription,
  SubscriptionPlan
} from '../../types';
import { DEFAULT_MESSES } from '../../firebase/seed';
import { 
  Shield, 
  ChefHat, 
  Plus, 
  Edit3, 
  Trash2, 
  Vote, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Star, 
  CheckCircle2, 
  Clock, 
  Send, 
  QrCode, 
  Download, 
  Printer, 
  UserCheck, 
  X, 
  Calendar,
  AlertTriangle,
  FileText,
  CreditCard,
  Layers,
  Building,
  Check,
  Zap,
  Sparkles,
  ChevronDown,
  Smartphone
} from 'lucide-react';
import QRCode from 'qrcode';
import { FeedbackAnalytics } from './FeedbackAnalytics';
import { StudentMobilePreview } from './StudentMobilePreview';

export const AdminDashboard: React.FC = () => {
  const { currentUser, userProfile, createNewMess, updateSubscriptionPlan } = useAuth();
  const collegeId = userProfile?.collegeId || 'inst-iitb';

  // College Messes and Subscription state
  const [messes, setMesses] = useState<Mess[]>([]);
  const [selectedMessId, setSelectedMessId] = useState<string>(userProfile?.messId || '');
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Firestore real-time state for currently selected mess
  const [menus, setMenus] = useState<Menu[]>([]);
  const [ratings, setRatings] = useState<MealRating[]>([]);
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pollVotes, setPollVotes] = useState<PollResponse[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);

  // Navigation tab inside admin
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'preview' | 'menus' | 'feedback' | 'polls' | 'announcements' | 'requests' | 'qr' | 'subscription'>('overview');

  // Multi-Mess & Add Mess Modal State
  const [addMessModalOpen, setAddMessModalOpen] = useState<boolean>(false);
  const [newMessName, setNewMessName] = useState<string>('');
  const [newMessLocation, setNewMessLocation] = useState<string>('');
  const [newMessDesc, setNewMessDesc] = useState<string>('');
  const [newMessBreakfast, setNewMessBreakfast] = useState<string>('07:30 - 09:30');
  const [newMessLunch, setNewMessLunch] = useState<string>('12:00 - 14:15');
  const [newMessSnacks, setNewMessSnacks] = useState<string>('16:45 - 18:00');
  const [newMessDinner, setNewMessDinner] = useState<string>('19:45 - 21:45');
  const [isAddingMess, setIsAddingMess] = useState<boolean>(false);
  const [addMessError, setAddMessError] = useState<string | null>(null);

  // Plan Upgrade State
  const [isUpgradingPlan, setIsUpgradingPlan] = useState<boolean>(false);
  const [upgradeSuccessMsg, setUpgradeSuccessMsg] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Menu Editor Modal
  const [menuModalOpen, setMenuModalOpen] = useState<boolean>(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [formDay, setFormDay] = useState<number>(1);
  const [formMealType, setFormMealType] = useState<MealType>('lunch');
  const [formDishes, setFormDishes] = useState<string>('');
  const [formLabels, setFormLabels] = useState<string>('Vegetarian, Balanced');
  const [formStart, setFormStart] = useState<string>('12:00');
  const [formEnd, setFormEnd] = useState<string>('14:15');

  // Poll Creator Modal
  const [pollModalOpen, setPollModalOpen] = useState<boolean>(false);
  const [pollQuestion, setPollQuestion] = useState<string>('');
  const [pollOptionsInput, setPollOptionsInput] = useState<string>('Option 1, Option 2');
  const [pollDeadline, setPollDeadline] = useState<string>('');

  // Announcement Creator Modal
  const [annModalOpen, setAnnModalOpen] = useState<boolean>(false);
  const [annTitle, setAnnTitle] = useState<string>('');
  const [annBody, setAnnBody] = useState<string>('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'urgent'>('normal');

  // Feedback Resolution Modal
  const [resolvingItem, setResolvingItem] = useState<FeedbackItem | null>(null);
  const [resolutionResponse, setResolutionResponse] = useState<string>('');
  const [resolutionStatus, setResolutionStatus] = useState<'Submitted' | 'In Review' | 'Resolved'>('Resolved');

  // QR Code
  const [qrPosterUrl, setQrPosterUrl] = useState<string>('');

  // Real-time listener for Messes under this college
  useEffect(() => {
    if (!collegeId) return;
    const q = query(collection(db, 'messes'), where('collegeId', '==', collegeId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Mess));
      setMesses(docs);
      if (docs.length > 0) {
        setSelectedMessId(prev => (prev && docs.some(d => d.id === prev) ? prev : docs[0].id));
      }
    }, (err) => {
      console.warn('Messes listener warning:', err);
    });
    return () => unsubscribe();
  }, [collegeId]);

  // Real-time listener for Subscription plan of this college
  useEffect(() => {
    if (!collegeId) return;
    const unsub = onSnapshot(doc(db, 'subscriptions', `sub-${collegeId}`), (snap) => {
      if (snap.exists()) {
        setSubscription({ id: snap.id, ...snap.data() } as Subscription);
      }
    }, (err) => {
      console.warn('Subscription listener warning:', err);
    });
    return () => unsub();
  }, [collegeId]);

  // Active mess resolution
  const activeMessId = selectedMessId || userProfile?.messId || (messes[0]?.id) || 'mess-iitb-h12';
  const currentMess = messes.find(m => m.id === activeMessId) || null;
  const currentPlan = subscription?.plan || 'starter';
  const maxMessesAllowed = subscription?.maxMesses || (currentPlan === 'starter' ? 1 : 5);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

  // Real-time listener for Ratings across college messes
  useEffect(() => {
    if (!currentUser) return;
    const q = collegeId
      ? query(collection(db, 'mealRatings'), where('collegeId', '==', collegeId))
      : query(collection(db, 'mealRatings'), where('messId', '==', activeMessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MealRating));
      setRatings(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'mealRatings');
    });
    return () => unsubscribe();
  }, [currentUser, collegeId, activeMessId]);

  // Real-time listener for Feedback
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'feedback'), where('messId', '==', activeMessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FeedbackItem));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setFeedbackList(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'feedback');
    });
    return () => unsubscribe();
  }, [currentUser, activeMessId]);

  // Real-time listener for Polls & Votes
  useEffect(() => {
    if (!currentUser) return;
    const qPolls = query(collection(db, 'polls'), where('messId', '==', activeMessId));
    const unsubPolls = onSnapshot(qPolls, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Poll));
      setPolls(docs);
    });

    const qVotes = query(collection(db, 'pollResponses'), where('messId', '==', activeMessId));
    const unsubVotes = onSnapshot(qVotes, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PollResponse));
      setPollVotes(docs);
    });

    return () => {
      unsubPolls();
      unsubVotes();
    };
  }, [currentUser, activeMessId]);

  // Real-time listener for Announcements
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'announcements'), where('messId', '==', activeMessId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Announcement));
      docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(docs);
    });
    return () => unsubscribe();
  }, [currentUser, activeMessId]);

  // Real-time listener for Admin Requests
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'adminRequests'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AdminRequest));
      setAdminRequests(docs);
    }, (error) => {
      console.warn('Admin requests permission check:', error);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Generate QR Code for poster
  useEffect(() => {
    if (activeMessId) {
      const url = `${window.location.origin}/?mess=${activeMessId}`;
      QRCode.toDataURL(url, { width: 450, margin: 2, color: { dark: '#2F6B4F', light: '#FFFFFF' } })
        .then(setQrPosterUrl)
        .catch(console.error);
    }
  }, [activeMessId]);

  // Save / Update Menu
  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDishes.trim()) return;

    try {
      if (editingMenu) {
        await updateDoc(doc(db, 'menus', editingMenu.id), {
          day: formDay,
          mealType: formMealType,
          dishes: formDishes.trim(),
          labels: formLabels.trim(),
          startTime: formStart,
          endTime: formEnd,
          updatedAt: new Date().toISOString()
        });
      } else {
        const newMenuId = `menu-${activeMessId}-${formDay}-${formMealType.slice(0, 1)}-${Date.now()}`;
        const newMenu: Menu = {
          id: newMenuId,
          messId: activeMessId,
          collegeId,
          day: formDay,
          mealType: formMealType,
          dishes: formDishes.trim(),
          labels: formLabels.trim(),
          startTime: formStart,
          endTime: formEnd,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'menus', newMenuId), newMenu);
      }
      setMenuModalOpen(false);
      setEditingMenu(null);
      setFormDishes('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'menus');
    }
  };

  // Delete Menu
  const handleDeleteMenu = async (id: string) => {
    if (!window.confirm('Delete this meal from the schedule?')) return;
    try {
      await deleteDoc(doc(db, 'menus', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menus/${id}`);
    }
  };

  // Open Edit Menu
  const openEditMenu = (m: Menu) => {
    setEditingMenu(m);
    setFormDay(m.day);
    setFormMealType(m.mealType);
    setFormDishes(m.dishes);
    setFormLabels(m.labels);
    setFormStart(m.startTime);
    setFormEnd(m.endTime);
    setMenuModalOpen(true);
  };

  // Create Poll
  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollQuestion.trim()) return;

    try {
      const optionsArray = pollOptionsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const newPoll: Omit<Poll, 'id'> = {
        messId: activeMessId,
        collegeId,
        question: pollQuestion.trim(),
        options: optionsArray,
        status: 'active',
        closesAt: pollDeadline || 'Next Sunday',
        createdAt: new Date().toISOString(),
        createdBy: userProfile?.name || 'Mess Admin'
      };

      await addDoc(collection(db, 'polls'), newPoll);
      setPollModalOpen(false);
      setPollQuestion('');
      setPollOptionsInput('Option 1, Option 2');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'polls');
    }
  };

  // Close Poll
  const handleClosePoll = async (id: string) => {
    try {
      await updateDoc(doc(db, 'polls', id), {
        status: 'closed'
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `polls/${id}`);
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;

    try {
      const newAnn: Omit<Announcement, 'id'> = {
        messId: activeMessId,
        collegeId,
        title: annTitle.trim(),
        body: annBody.trim(),
        priority: annPriority,
        authorName: userProfile?.name || 'Mess Management',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'announcements'), newAnn);
      setAnnModalOpen(false);
      setAnnTitle('');
      setAnnBody('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'announcements');
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `announcements/${id}`);
    }
  };

  // Resolve Feedback
  const handleResolveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingItem) return;

    try {
      await updateDoc(doc(db, 'feedback', resolvingItem.id), {
        status: resolutionStatus,
        response: resolutionResponse.trim(),
        updatedAt: new Date().toISOString()
      });
      setResolvingItem(null);
      setResolutionResponse('');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `feedback/${resolvingItem.id}`);
    }
  };

  // Approve Admin Request
  const handleApproveRequest = async (req: AdminRequest) => {
    try {
      await setDoc(doc(db, 'admins', req.uid), {
        uid: req.uid,
        email: req.email,
        role: 'admin',
        collegeId: collegeId,
        messId: activeMessId,
        approvedAt: new Date().toISOString(),
        approvedBy: currentUser?.email || 'admin'
      });
      await updateDoc(doc(db, 'adminRequests', req.id), {
        status: 'approved',
        reviewedBy: currentUser?.email || 'admin',
        reviewedAt: new Date().toISOString()
      });
      // Synchronize user profile if present
      try {
        const userDocRef = doc(db, 'users', req.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          await updateDoc(userDocRef, {
            role: 'admin',
            updatedAt: new Date().toISOString()
          });
        }
      } catch (profileErr) {
        console.warn('Profile sync note:', profileErr);
      }
      alert(`Admin privileges approved for ${req.name} (${req.email})!`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `admins/${req.uid}`);
    }
  };

  // Reject Admin Request
  const handleRejectRequest = async (req: AdminRequest) => {
    try {
      await updateDoc(doc(db, 'adminRequests', req.id), {
        status: 'rejected',
        reviewedBy: currentUser?.email || 'admin',
        reviewedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `adminRequests/${req.id}`);
    }
  };

  // Add new mess under this college
  const handleAddNewMess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessName.trim()) return;
    setAddMessError(null);
    setIsAddingMess(true);

    try {
      const created = await createNewMess(collegeId, {
        name: newMessName.trim(),
        locationBlock: newMessLocation.trim() || undefined,
        description: newMessDesc.trim() || undefined,
        breakfastTime: newMessBreakfast,
        lunchTime: newMessLunch,
        snacksTime: newMessSnacks,
        dinnerTime: newMessDinner
      });
      setSelectedMessId(created.id);
      setAddMessModalOpen(false);
      setNewMessName('');
      setNewMessLocation('');
      setNewMessDesc('');
    } catch (err: any) {
      setAddMessError(err.message || 'Failed to create mess dining hall.');
    } finally {
      setIsAddingMess(false);
    }
  };

  // Upgrade subscription to Pro
  const handleUpgradeToPro = async () => {
    setUpgradeError(null);
    setUpgradeSuccessMsg(null);
    setIsUpgradingPlan(true);

    try {
      await updateSubscriptionPlan(collegeId, 'pro');
      setUpgradeSuccessMsg('Upgraded to Pro Plan (₹2,999/mo)! You can now manage up to 5 mess dining halls.');
      setTimeout(() => setUpgradeSuccessMsg(null), 6000);
    } catch (err: any) {
      setUpgradeError(err.message || 'Failed to upgrade plan.');
    } finally {
      setIsUpgradingPlan(false);
    }
  };

  // Metrics Calculations
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0 
    ? (ratings.reduce((acc, c) => acc + c.score, 0) / totalRatings).toFixed(1)
    : '—';
  const avgTaste = totalRatings > 0
    ? (ratings.reduce((acc, c) => acc + (c.taste || c.score), 0) / totalRatings).toFixed(1)
    : '—';
  const avgHygiene = totalRatings > 0
    ? (ratings.reduce((acc, c) => acc + (c.hygiene || c.score), 0) / totalRatings).toFixed(1)
    : '—';
  const pendingFeedbackCount = feedbackList.filter(f => f.status !== 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8F7F3]">
      
      {/* Admin Header Banner with Multi-Mess Selector & Subscription */}
      <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-[#E5E8E3] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#285943]/10 text-[#285943] text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Mess Administration</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F8F7F3] border border-[#E5E8E3] text-[#242925] text-xs font-medium">
              <Building className="w-3.5 h-3.5 text-[#285943]" />
              <span>{userProfile?.collegeName || 'Campus Institution'}</span>
            </div>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                currentPlan === 'pro'
                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                  : 'bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <Zap className="w-3 h-3 text-amber-600" />
              <span>{currentPlan === 'pro' ? 'Pro Plan (₹2,999/mo)' : 'Starter Plan (₹1,500/mo)'}</span>
              <span className="text-[10px] text-[#6B716D]">({messes.length}/{maxMessesAllowed} Messes)</span>
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#242925] tracking-tight">
              {currentMess?.name || userProfile?.messName || 'Hostel Dining Hall'}
            </h1>
            <p className="text-xs text-[#6B716D] mt-1 flex flex-wrap items-center gap-2">
              <span>{currentMess?.locationBlock || 'Campus Dining Block'}</span>
              <span>·</span>
              <span>Administrator: <b className="text-[#242925] font-semibold">{userProfile?.name}</b></span>
            </p>
          </div>
        </div>

        {/* Multi-Mess Switcher & Add Mess CTA */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#F8F7F3] p-1.5 rounded-lg border border-[#E5E8E3]">
            <span className="text-xs font-semibold text-[#6B716D] pl-2 whitespace-nowrap">Active Mess:</span>
            <select
              value={activeMessId}
              onChange={(e) => setSelectedMessId(e.target.value)}
              className="px-2.5 py-1.5 rounded-md bg-white border border-[#E5E8E3] text-xs font-semibold text-[#242925] focus:outline-none focus:border-[#285943] cursor-pointer"
            >
              {messes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} {m.locationBlock ? `(${m.locationBlock})` : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setAddMessError(null);
              setAddMessModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-[#285943] hover:bg-[#1E4433] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mess</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Tabs */}
      <div className="bg-white rounded-xl p-1.5 border border-[#E5E8E3] shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 text-xs font-semibold min-w-max">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Feedback Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-[#C87942]" />
            <span>Student Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('menus')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'menus' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            Daily Menus ({menus.length})
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer relative ${
              activeTab === 'feedback' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            Complaints ({pendingFeedbackCount})
            {pendingFeedbackCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('polls')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'polls' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            Student Polls ({polls.length})
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'announcements' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            Notices ({announcements.length})
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'qr' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            Dining QR Poster
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'subscription' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Plan & Messes ({messes.length}/{maxMessesAllowed})</span>
          </button>
          {adminRequests.length > 0 && (
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'requests' ? 'bg-[#285943] text-white' : 'text-[#6B716D] hover:text-[#242925] hover:bg-[#F8F7F3]'
              }`}
            >
              Admin Log ({adminRequests.filter(r => r.status === 'pending').length})
            </button>
          )}
        </div>
      </div>

      {/* TAB: FEEDBACK ANALYTICS (IN-DEPTH SUITE) */}
      {activeTab === 'analytics' && (
        <FeedbackAnalytics
          ratings={ratings}
          messes={messes}
          activeMessId={activeMessId}
          onSelectMess={setSelectedMessId}
          feedbackList={feedbackList}
        />
      )}

      {/* TAB: STUDENT PREVIEW (READ-ONLY MOBILE VIEWPORT) */}
      {activeTab === 'preview' && (
        <StudentMobilePreview
          currentMess={currentMess || undefined}
          collegeName={userProfile?.collegeName}
          menus={menus}
          polls={polls}
          announcements={announcements}
        />
      )}

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#2F6B4F]/15 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#747A75]">
                <span className="font-semibold">Overall Satisfaction</span>
                <Star className="w-4 h-4 fill-[#E8873A] text-[#E8873A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#2F6B4F]">{avgRating} <span className="text-sm font-normal text-[#747A75]">/ 5.0</span></div>
              <p className="text-xs text-[#747A75]">Across {totalRatings} student reviews</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#2F6B4F]/15 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#747A75]">
                <span className="font-semibold">Taste & Flavor Rating</span>
                <ChefHat className="w-4 h-4 text-[#2F6B4F]" />
              </div>
              <div className="text-3xl font-extrabold text-[#2F6B4F]">{avgTaste} ★</div>
              <p className="text-xs text-[#747A75]">Quality of spices & cooking</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#2F6B4F]/15 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#747A75]">
                <span className="font-semibold">Mess Hygiene Score</span>
                <CheckCircle2 className="w-4 h-4 text-[#2F6B4F]" />
              </div>
              <div className="text-3xl font-extrabold text-[#2F6B4F]">{avgHygiene} ★</div>
              <p className="text-xs text-[#747A75]">Clean utensils & dining area</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#2F6B4F]/15 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-[#747A75]">
                <span className="font-semibold">Pending Grievances</span>
                <AlertTriangle className="w-4 h-4 text-[#E8873A]" />
              </div>
              <div className="text-3xl font-extrabold text-[#E8873A]">{pendingFeedbackCount}</div>
              <p className="text-xs text-[#747A75]">{feedbackList.length} total received</p>
            </div>
          </div>

          {/* Quick Actions & Recent Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#2F6B4F]/15 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2F6B4F]/10">
                <h3 className="font-bold text-base text-[#292D2A]">Urgent Student Grievances</h3>
                <button onClick={() => setActiveTab('feedback')} className="text-xs text-[#2F6B4F] font-bold hover:underline">
                  View All ({feedbackList.length})
                </button>
              </div>

              {feedbackList.filter(f => f.status !== 'Resolved').length > 0 ? (
                <div className="space-y-3">
                  {feedbackList.filter(f => f.status !== 'Resolved').slice(0, 3).map(f => (
                    <div key={f.id} className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#2F6B4F]/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#292D2A]">{f.category} ({f.userName})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#747A75]">{f.body}</p>
                      <button
                        onClick={() => {
                          setResolvingItem(f);
                          setResolutionResponse(f.response || '');
                          setResolutionStatus(f.status);
                        }}
                        className="text-xs font-bold text-[#2F6B4F] underline cursor-pointer"
                      >
                        Respond & Resolve →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#747A75] italic py-4">No unresolved complaints! All grievances have been addressed.</p>
              )}
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#2F6B4F]/15 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#2F6B4F]/10">
                <h3 className="font-bold text-base text-[#292D2A]">Active Food Polls Engagement</h3>
                <button onClick={() => setActiveTab('polls')} className="text-xs text-[#2F6B4F] font-bold hover:underline">
                  Manage Polls
                </button>
              </div>

              {polls.length > 0 ? (
                <div className="space-y-4">
                  {polls.slice(0, 2).map(poll => {
                    const votesForPoll = pollVotes.filter(v => v.pollId === poll.id);
                    return (
                      <div key={poll.id} className="p-4 rounded-2xl bg-[#FFF9F0] border border-[#2F6B4F]/10 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#292D2A]">{poll.question}</span>
                          <span className="font-bold text-[#2F6B4F]">{votesForPoll.length} votes</span>
                        </div>
                        <div className="text-xs text-[#747A75]">
                          Status: <span className="capitalize font-semibold text-[#292D2A]">{poll.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#747A75] italic py-4">No active polls. Create one in the Polls tab.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU PLANNER */}
      {activeTab === 'menus' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#2F6B4F]/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2F6B4F]/10">
            <div>
              <h2 className="text-xl font-bold text-[#292D2A]">Weekly Mess Schedule & Menu Planner</h2>
              <p className="text-xs text-[#747A75]">Changes publish instantly to all student dashboards via Firestore.</p>
            </div>
            <button
              onClick={() => {
                setEditingMenu(null);
                setFormDishes('');
                setMenuModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Meal to Menu</span>
            </button>
          </div>

          <div className="space-y-6">
            {daysOfWeek.map((dayName, dayIndex) => {
              const dayMeals = menus.filter(m => m.day === dayIndex);
              return (
                <div key={dayName} className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#2F6B4F]/10 space-y-3">
                  <div className="font-bold text-sm text-[#2F6B4F] uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{dayName}</span>
                  </div>

                  {dayMeals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {dayMeals.map((m) => (
                        <div key={m.id} className="bg-white p-4 rounded-xl border border-[#2F6B4F]/15 shadow-2xs flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-full bg-[#2F6B4F] text-white text-[10px] font-bold uppercase">
                                {m.mealType}
                              </span>
                              <span className="text-[11px] text-[#747A75] font-medium">
                                {m.startTime} - {m.endTime}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#292D2A] leading-snug">
                              {m.dishes}
                            </p>
                            {m.labels && (
                              <p className="text-[10px] text-[#E8873A] font-semibold">
                                {m.labels}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#2F6B4F]/10 flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditMenu(m)}
                              className="p-1.5 rounded-lg text-[#2F6B4F] hover:bg-[#FFF9F0] cursor-pointer"
                              title="Edit meal"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteMenu(m.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete meal"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#747A75] italic">No meals scheduled for {dayName}.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK & COMPLAINTS RESOLUTION */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#2F6B4F]/15 space-y-6">
          <div className="pb-4 border-b border-[#2F6B4F]/10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#292D2A]">Student Grievance & Feedback Inbox</h2>
              <p className="text-xs text-[#747A75]">Review and reply to complaints. Your responses appear live in the student's dashboard.</p>
            </div>
          </div>

          <div className="space-y-4">
            {feedbackList.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#2F6B4F]/15 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      item.kind === 'complaint' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.kind}
                    </span>
                    <span className="font-bold text-[#292D2A]">{item.category}</span>
                    <span className="text-[#747A75]">by {item.userName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#747A75]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#292D2A] leading-relaxed bg-white p-3.5 rounded-xl border border-[#2F6B4F]/10">
                  {item.body}
                </p>

                {item.response && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
                    <div className="font-bold">Official Response:</div>
                    <p>{item.response}</p>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setResolvingItem(item);
                      setResolutionResponse(item.response || '');
                      setResolutionStatus(item.status);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {item.response ? 'Update Resolution Response' : 'Write Response & Resolve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: POLLS */}
      {activeTab === 'polls' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#2F6B4F]/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2F6B4F]/10">
            <div>
              <h2 className="text-xl font-bold text-[#292D2A]">Mess Food Polls</h2>
              <p className="text-xs text-[#747A75]">Democratically decide special meals and Sunday feast options.</p>
            </div>
            <button
              onClick={() => setPollModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Poll</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls.map((poll) => {
              const pollVotesList = pollVotes.filter(v => v.pollId === poll.id);
              const totalVotes = pollVotesList.length;
              const rawOptions = Array.isArray(poll.options) 
                ? poll.options 
                : typeof poll.options === 'string' 
                ? (poll.options as string).split(',').map(s => s.trim()) 
                : [];

              return (
                <div key={poll.id} className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#2F6B4F]/15 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        poll.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {poll.status}
                      </span>
                      <span className="text-[#747A75] font-semibold">{totalVotes} total votes</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#292D2A]">{poll.question}</h3>

                    {/* Options breakdown */}
                    <div className="space-y-2">
                      {rawOptions.map((opt, oIdx) => {
                        const optVotes = pollVotesList.filter(v => v.choice === oIdx).length;
                        const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        return (
                          <div key={oIdx} className="bg-white p-3 rounded-xl border border-[#2F6B4F]/15 text-xs space-y-1">
                            <div className="flex justify-between font-semibold text-[#292D2A]">
                              <span>{opt}</span>
                              <span className="text-[#2F6B4F] font-bold">{pct}% ({optVotes})</span>
                            </div>
                            <div className="w-full bg-[#FFF9F0] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#2F6B4F] h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {poll.status === 'active' && (
                    <div className="pt-2 border-t border-[#2F6B4F]/10 flex justify-end">
                      <button
                        onClick={() => handleClosePoll(poll.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer"
                      >
                        Close Voting
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#2F6B4F]/15 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2F6B4F]/10">
            <div>
              <h2 className="text-xl font-bold text-[#292D2A]">Mess Notice Board Publisher</h2>
              <p className="text-xs text-[#747A75]">Broadcast food alerts, timing changes, and festival feast announcements.</p>
            </div>
            <button
              onClick={() => setAnnModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#2F6B4F]/15 space-y-2 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#292D2A]">{ann.title}</span>
                    {ann.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#747A75] leading-relaxed">{ann.body}</p>
                  <div className="text-[10px] text-[#2F6B4F] font-semibold pt-1">
                    Published by {ann.authorName} on {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                  title="Delete notice"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ONBOARDING REQUESTS */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#2F6B4F]/15 space-y-6">
          <div className="pb-4 border-b border-[#2F6B4F]/10">
            <h2 className="text-xl font-bold text-[#292D2A]">Mess Administrator Access Requests</h2>
            <p className="text-xs text-[#747A75]">
              Verify applicants requesting management privileges. Approving adds them securely to the database.
            </p>
          </div>

          {adminRequests.length > 0 ? (
            <div className="space-y-4">
              {adminRequests.map((req) => (
                <div key={req.id} className="p-5 rounded-2xl bg-[#FFF9F0] border border-[#2F6B4F]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#292D2A]">{req.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'approved' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : req.status === 'rejected' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#747A75]">
                      Email: <b>{req.email}</b> • Campus: <b>{req.collegeName}</b> • Hall: <b>{req.messName}</b>
                    </p>
                    <p className="text-[10px] text-[#747A75]">
                      Submitted: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveRequest(req)}
                        className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve Admin</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req)}
                        className="px-3.5 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#747A75] italic">No pending admin authorization requests.</p>
          )}
        </div>
      )}

      {/* TAB 7: MESS QR POSTER */}
      {activeTab === 'qr' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#2F6B4F]/15 space-y-6">
          <div className="pb-4 border-b border-[#2F6B4F]/10">
            <h2 className="text-xl font-bold text-[#292D2A]">Mess Entrance QR Code Poster</h2>
            <p className="text-xs text-[#747A75]">
              Print and display this QR code at the dining hall entrance for students to check the menu and submit ratings.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#FFF9F0] p-8 rounded-3xl border border-[#2F6B4F]/15">
            <div className="bg-white p-5 rounded-2xl shadow-md border border-[#2F6B4F]/20 text-center space-y-3">
              {qrPosterUrl && (
                <img src={qrPosterUrl} alt="Mess QR Poster" className="w-64 h-64 mx-auto rounded-xl" />
              )}
              <div className="text-xs font-bold text-[#2F6B4F]">Scan to View Live Menu</div>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <h3 className="font-extrabold text-xl text-[#292D2A]">{userProfile?.messName}</h3>
                <p className="text-xs text-[#747A75] mt-1">
                  Unique Link: <span className="text-[#2F6B4F] font-mono break-all">{`${window.location.origin}/?mess=${activeMessId}`}</span>
                </p>
              </div>

              <p className="text-xs text-[#292D2A] leading-relaxed">
                When students scan this with their smartphone camera, MessMate automatically opens the specific menu for this dining hall and retains the mess context across sign-up.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => {
                    const win = window.open('', '_blank');
                    if (win) {
                      win.document.write(`
                        <html>
                          <head>
                            <title>Print Mess QR - ${userProfile?.messName}</title>
                            <style>
                              body { font-family: sans-serif; text-align: center; padding: 40px; }
                              h1 { color: #2F6B4F; margin-bottom: 5px; }
                              p { color: #747A75; margin-bottom: 25px; }
                              img { width: 350px; height: 350px; }
                            </style>
                          </head>
                          <body>
                            <h1>${userProfile?.messName}</h1>
                            <p>Scan with your phone to view today's meal menu & submit dish ratings!</p>
                            <img src="${qrPosterUrl}" />
                            <p style="margin-top:20px;font-weight:bold;">Powered by MessMate</p>
                          </body>
                        </html>
                      `);
                      win.document.close();
                      win.print();
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] text-white text-xs font-bold shadow-xs hover:bg-[#23523c] flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dining Hall Poster</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SUBSCRIPTION & MESSES MANAGEMENT */}
      {activeTab === 'subscription' && (
        <div className="space-y-8">
          {upgradeSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{upgradeSuccessMsg}</span>
            </div>
          )}

          {upgradeError && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{upgradeError}</span>
            </div>
          )}

          {/* Active Plan Overview Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-[#2F6B4F]/15 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2F6B4F]/10">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#E8873A]/15 text-[#E8873A]">
                    {subscription?.status === 'trial' ? '14-Day Free Trial' : 'Active Plan'}
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#292D2A] mt-2">
                    {currentPlan === 'pro' ? 'Pro Plan — Multi-Mess Platform' : 'Starter Plan — Single Dining Hall'}
                  </h2>
                  <p className="text-xs text-[#747A75] mt-1">
                    Workspace for <b>{userProfile?.collegeName || 'Your Institution'}</b>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-extrabold text-[#2F6B4F]">
                    ₹{currentPlan === 'pro' ? '2,999' : '1,500'}
                    <span className="text-xs font-normal text-[#747A75]"> / month</span>
                  </div>
                  <div className="text-[10px] text-[#747A75] mt-0.5">
                    {subscription?.isDemo ? 'Demo trial activation • No credit card charged' : 'Billed monthly'}
                  </div>
                </div>
              </div>

              {/* Mess Capacity Usage Meter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#292D2A]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#2F6B4F]" />
                    <span>Dining Halls / Mess Utilization</span>
                  </span>
                  <span>
                    {messes.length} of {maxMessesAllowed} mess(es) active
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-[#FFF9F0] border border-[#2F6B4F]/20 overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      messes.length >= maxMessesAllowed ? 'bg-[#E8873A]' : 'bg-[#2F6B4F]'
                    }`}
                    style={{ width: `${Math.min(100, (messes.length / maxMessesAllowed) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#747A75]">
                  <span>
                    {messes.length >= maxMessesAllowed 
                      ? currentPlan === 'starter'
                        ? 'Starter limit reached (1 mess). Upgrade to Pro to add up to 5 messes.'
                        : 'Pro plan maximum reached (5 messes).'
                      : `${maxMessesAllowed - messes.length} mess slot(s) available.`}
                  </span>
                  <span>Renewal Date: {new Date(subscription?.renewalDate || Date.now() + 30*24*3600*1000).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setAddMessError(null);
                    setAddMessModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Mess Hall</span>
                </button>

                {currentPlan === 'starter' && (
                  <button
                    onClick={handleUpgradeToPro}
                    disabled={isUpgradingPlan}
                    className="px-5 py-2.5 rounded-xl bg-[#E8873A] hover:bg-[#d4762c] text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isUpgradingPlan ? 'Upgrading...' : 'Upgrade to Pro (₹2,999/mo)'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Plan Comparison / Features Card */}
            <div className="bg-[#FFF9F0] rounded-3xl p-6 sm:p-8 border border-[#2F6B4F]/15 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#2F6B4F]/10 text-[#2F6B4F] flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#292D2A]">
                      {currentPlan === 'pro' ? 'Pro Plan Features' : 'Unlock Pro Plan'}
                    </h3>
                    <p className="text-[11px] text-[#747A75]">Designed for multi-hostel campuses</p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-[#292D2A]">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2F6B4F] shrink-0 mt-0.5" />
                    <span>Manage up to <b>5 separate hostel dining halls</b></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2F6B4F] shrink-0 mt-0.5" />
                    <span>Cross-hostel menu analytics & reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2F6B4F] shrink-0 mt-0.5" />
                    <span>Live food voting & dietary polls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2F6B4F] shrink-0 mt-0.5" />
                    <span>Per-mess QR code poster generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#2F6B4F] shrink-0 mt-0.5" />
                    <span>Urgent catering alerts broadcast</span>
                  </li>
                </ul>
              </div>

              {currentPlan === 'starter' ? (
                <button
                  onClick={handleUpgradeToPro}
                  disabled={isUpgradingPlan}
                  className="w-full py-2.5 rounded-xl bg-white border border-[#2F6B4F]/30 hover:bg-[#2F6B4F] hover:text-white text-[#2F6B4F] text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
                >
                  {isUpgradingPlan ? 'Processing...' : 'Upgrade Workspace — ₹2,999/mo'}
                </button>
              ) : (
                <div className="text-center py-2 px-3 rounded-xl bg-emerald-100/60 text-emerald-800 text-xs font-bold border border-emerald-200">
                  All Pro features active
                </div>
              )}
            </div>
          </div>

          {/* Registered Messes Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#2F6B4F]/15 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2F6B4F]/10">
              <div>
                <h3 className="text-lg font-bold text-[#292D2A]">Campus Dining Halls ({messes.length})</h3>
                <p className="text-xs text-[#747A75]">
                  All messes configured under <b>{userProfile?.collegeName}</b>. Students can select any of these during onboarding.
                </p>
              </div>

              <button
                onClick={() => {
                  setAddMessError(null);
                  setAddMessModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Mess</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {messes.map((m) => (
                <div 
                  key={m.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    m.id === activeMessId
                      ? 'bg-[#FFF9F0] border-[#2F6B4F] shadow-xs'
                      : 'bg-white border-[#2F6B4F]/15 hover:border-[#2F6B4F]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#292D2A]">{m.name}</span>
                        {m.id === activeMessId && (
                          <span className="px-2 py-0.5 rounded-full bg-[#2F6B4F] text-white text-[10px] font-bold">
                            Active in View
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#747A75]">{m.locationBlock || 'Main Dining Block'}</p>
                      {m.description && <p className="text-xs text-[#292D2A] pt-1">{m.description}</p>}
                    </div>

                    {m.id !== activeMessId ? (
                      <button
                        onClick={() => setSelectedMessId(m.id)}
                        className="px-3 py-1.5 rounded-xl border border-[#2F6B4F]/30 hover:bg-[#2F6B4F] hover:text-white text-[#2F6B4F] text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Switch to Mess
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('menus')}
                        className="px-3 py-1.5 rounded-xl bg-[#2F6B4F] text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Manage Menus
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2F6B4F]/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#747A75]">
                    <div>
                      <span className="font-semibold block text-[#292D2A]">Breakfast</span>
                      <span>{m.breakfastTime || '07:30 - 09:30'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[#292D2A]">Lunch</span>
                      <span>{m.lunchTime || '12:00 - 14:15'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[#292D2A]">Snacks</span>
                      <span>{m.snacksTime || '16:45 - 18:00'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[#292D2A]">Dinner</span>
                      <span>{m.dinnerTime || '19:45 - 21:45'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add / Edit Menu */}
      {menuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#2F6B4F]/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F6B4F]/10">
              <h3 className="font-bold text-lg text-[#292D2A]">
                {editingMenu ? 'Edit Meal Schedule' : 'Add Meal to Schedule'}
              </h3>
              <button onClick={() => setMenuModalOpen(false)} className="p-1 rounded-lg text-[#747A75] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292D2A]">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#2F6B4F]/20 text-xs font-semibold text-[#292D2A] focus:outline-none focus:border-[#2F6B4F]"
                  >
                    {daysOfWeek.map((d, idx) => (
                      <option key={d} value={idx}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292D2A]">Meal Type</label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#2F6B4F]/20 text-xs font-semibold text-[#292D2A] focus:outline-none focus:border-[#2F6B4F] capitalize"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Dishes Served</label>
                <textarea
                  required
                  rows={3}
                  value={formDishes}
                  onChange={(e) => setFormDishes(e.target.value)}
                  placeholder="e.g. Chole Bhature, Pickle, Boiled Eggs, Tea & Coffee"
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292D2A]">Serving Start</label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292D2A]">Serving End</label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Nutritional / Dietary Labels</label>
                <input
                  type="text"
                  value={formLabels}
                  onChange={(e) => setFormLabels(e.target.value)}
                  placeholder="e.g. Vegetarian, High Protein, Special Feast"
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#747A75]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  {editingMenu ? 'Save Changes' : 'Publish Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Poll */}
      {pollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#2F6B4F]/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F6B4F]/10">
              <h3 className="font-bold text-lg text-[#292D2A]">Create Food Poll</h3>
              <button onClick={() => setPollModalOpen(false)} className="p-1 rounded-lg text-[#747A75] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Poll Question</label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. What sweet dish should we serve on Saturday?"
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Choices (comma separated)</label>
                <input
                  type="text"
                  required
                  value={pollOptionsInput}
                  onChange={(e) => setPollOptionsInput(e.target.value)}
                  placeholder="Gulab Jamun, Rasgulla, Kheer"
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Closing Deadline (optional)</label>
                <input
                  type="text"
                  value={pollDeadline}
                  onChange={(e) => setPollDeadline(e.target.value)}
                  placeholder="e.g. Friday 6 PM"
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPollModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#747A75]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Launch Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Publish Announcement */}
      {annModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#2F6B4F]/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F6B4F]/10">
              <h3 className="font-bold text-lg text-[#292D2A]">Publish Notice</h3>
              <button onClick={() => setAnnModalOpen(false)} className="p-1 rounded-lg text-[#747A75] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Notice Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Special Festival Feast this Friday"
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Details / Notice Body</label>
                <textarea
                  required
                  rows={3}
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  placeholder="e.g. Dinner will feature Pav Bhaji and Ice Cream from 7:30 PM..."
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Priority</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                >
                  <option value="normal">Normal Notice</option>
                  <option value="urgent">Urgent Announcement</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#747A75]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Post to Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Feedback */}
      {resolvingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#2F6B4F]/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F6B4F]/10">
              <h3 className="font-bold text-lg text-[#292D2A]">Respond to Grievance</h3>
              <button onClick={() => setResolvingItem(null)} className="p-1 rounded-lg text-[#747A75] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#FFF9F0] rounded-xl border border-[#2F6B4F]/10 text-xs space-y-1">
              <div className="font-bold text-[#292D2A]">{resolvingItem.category} ({resolvingItem.userName})</div>
              <p className="text-[#747A75]">{resolvingItem.body}</p>
            </div>

            <form onSubmit={handleResolveFeedback} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Update Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                >
                  <option value="Submitted">Submitted (Pending)</option>
                  <option value="In Review">In Review (Action initiated)</option>
                  <option value="Resolved">Resolved (Complete)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292D2A]">Official Response to Student</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionResponse}
                  onChange={(e) => setResolutionResponse(e.target.value)}
                  placeholder="e.g. Noted. Kitchen staff instructed to maintain food heating trays properly. Inspection conducted today."
                  className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#747A75]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Mess */}
      {addMessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292D2A]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2F6B4F]/20 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#2F6B4F]/10">
              <div>
                <h3 className="font-bold text-lg text-[#292D2A]">Register New Mess Hall</h3>
                <p className="text-xs text-[#747A75]">
                  Add a dining hall under <b>{userProfile?.collegeName || 'Campus'}</b>
                </p>
              </div>
              <button 
                onClick={() => setAddMessModalOpen(false)} 
                className="p-1.5 rounded-lg text-[#747A75] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Limit Check */}
            {messes.length >= maxMessesAllowed ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                  <div className="font-bold text-sm flex items-center gap-1.5 text-amber-950">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    <span>Plan Limit Reached</span>
                  </div>
                  <p>
                    Your current <b>{currentPlan.toUpperCase()}</b> subscription allows a maximum of <b>{maxMessesAllowed} mess(es)</b>. You currently have {messes.length} registered.
                  </p>
                  {currentPlan === 'starter' && (
                    <p className="font-medium text-amber-900">
                      Upgrade to the Pro Plan (₹2,999/mo) to unlock support for up to 5 hostel dining halls simultaneously.
                    </p>
                  )}
                </div>

                {currentPlan === 'starter' && (
                  <button
                    onClick={async () => {
                      await handleUpgradeToPro();
                    }}
                    disabled={isUpgradingPlan}
                    className="w-full py-3 rounded-xl bg-[#E8873A] hover:bg-[#d4762c] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isUpgradingPlan ? 'Upgrading...' : 'Upgrade to Pro Plan (₹2,999/mo)'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAddMessModalOpen(false)}
                  className="w-full py-2.5 rounded-xl border border-[#2F6B4F]/20 text-xs font-bold text-[#747A75] hover:bg-[#FFF9F0] cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddNewMess} className="space-y-4">
                {addMessError && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                    {addMessError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292D2A]">Mess / Dining Hall Name *</label>
                  <input
                    type="text"
                    required
                    value={newMessName}
                    onChange={(e) => setNewMessName(e.target.value)}
                    placeholder="e.g. Hostel 16 - South Indian Dining"
                    className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292D2A]">Location / Block *</label>
                  <input
                    type="text"
                    required
                    value={newMessLocation}
                    onChange={(e) => setNewMessLocation(e.target.value)}
                    placeholder="e.g. Block D Ground Floor / East Campus"
                    className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292D2A]">Description (optional)</label>
                  <textarea
                    rows={2}
                    value={newMessDesc}
                    onChange={(e) => setNewMessDesc(e.target.value)}
                    placeholder="e.g. Pure vegetarian dining hall serving North and South Indian menus."
                    className="w-full px-3 py-2 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F] resize-none"
                  />
                </div>

                <div className="border-t border-[#2F6B4F]/10 pt-3 space-y-3">
                  <h4 className="text-xs font-bold text-[#292D2A]">Standard Meal Timings</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#747A75]">Breakfast Time</label>
                      <input
                        type="text"
                        value={newMessBreakfast}
                        onChange={(e) => setNewMessBreakfast(e.target.value)}
                        placeholder="07:30 - 09:30"
                        className="w-full px-3 py-1.5 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#747A75]">Lunch Time</label>
                      <input
                        type="text"
                        value={newMessLunch}
                        onChange={(e) => setNewMessLunch(e.target.value)}
                        placeholder="12:00 - 14:15"
                        className="w-full px-3 py-1.5 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#747A75]">Evening Snacks</label>
                      <input
                        type="text"
                        value={newMessSnacks}
                        onChange={(e) => setNewMessSnacks(e.target.value)}
                        placeholder="16:45 - 18:00"
                        className="w-full px-3 py-1.5 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#747A75]">Dinner Time</label>
                      <input
                        type="text"
                        value={newMessDinner}
                        onChange={(e) => setNewMessDinner(e.target.value)}
                        placeholder="19:45 - 21:45"
                        className="w-full px-3 py-1.5 rounded-xl border border-[#2F6B4F]/20 text-xs focus:outline-none focus:border-[#2F6B4F]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddMessModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#747A75] hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingMess}
                    className="px-5 py-2.5 rounded-xl bg-[#2F6B4F] hover:bg-[#23523c] text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isAddingMess ? 'Creating Mess...' : 'Create Mess Hall'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
