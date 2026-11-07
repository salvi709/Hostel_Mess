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
  Smartphone,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarDays
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

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
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

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
      QRCode.toDataURL(url, { width: 450, margin: 2, color: { dark: '#244D3C', light: '#FFFFFF' } })
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
      setAdminNotice(`Admin privileges approved for ${req.name} (${req.email})!`);
      setTimeout(() => setAdminNotice(null), 5000);
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
    <div className="min-h-[calc(100vh-4rem)] bg-[#F6F4EE] flex flex-col md:flex-row">
      
      {/* 1. PROFESSIONAL COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`bg-white border-r border-[#E4E5DE] transition-all duration-200 shrink-0 flex flex-col justify-between ${
          isSidebarCollapsed ? 'md:w-16' : 'md:w-64'
        } w-full md:min-h-[calc(100vh-4rem)]`}
      >
        <div className="p-4 space-y-5">
          {/* Sidebar Top: College / Administration Brand & Collapse Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
            {!isSidebarCollapsed && (
              <div className="space-y-0.5 truncate">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#244D3C] block">
                  Mess Administration
                </span>
                <span className="text-xs font-bold text-[#292E2A] truncate block" title={userProfile?.collegeName || 'Campus Institution'}>
                  {userProfile?.collegeName || 'Campus Institution'}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-md text-[#737A74] hover:text-[#292E2A] hover:bg-[#F6F4EE] transition-colors hidden md:block cursor-pointer ml-auto"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'menus', label: 'Menu Management', icon: ChefHat, count: menus.length },
              { id: 'analytics', label: 'Feedback & Analytics', icon: BarChart3 },
              { id: 'polls', label: 'Polls', icon: Vote, count: polls.length },
              { id: 'feedback', label: 'Grievance Resolution', icon: MessageSquare, badge: pendingFeedbackCount },
              { id: 'announcements', label: 'Announcements', icon: Bell, count: announcements.length },
              { id: 'preview', label: 'Student Preview', icon: Smartphone },
              { id: 'subscription', label: 'College & Messes', icon: Building, tag: `${messes.length}/${maxMessesAllowed}` },
              { id: 'qr', label: 'Dining QR Poster', icon: QrCode },
              ...(adminRequests.length > 0 ? [{ id: 'requests', label: 'Admin Requests', icon: Shield, badge: adminRequests.filter(r => r.status === 'pending').length }] : [])
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer group ${
                    isActive 
                      ? 'bg-[#244D3C] text-white shadow-2xs' 
                      : 'text-[#737A74] hover:text-[#292E2A] hover:bg-[#F6F4EE]'
                  }`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#737A74] group-hover:text-[#244D3C]'}`} />
                  {!isSidebarCollapsed && (
                    <span className="truncate flex-1 text-left">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-[#244D3C]' : 'bg-red-100 text-red-700'}`}>
                      {item.badge}
                    </span>
                  )}
                  {!isSidebarCollapsed && item.tag && (
                    <span className={`text-[10px] font-mono ${isActive ? 'text-white/80' : 'text-[#737A74]'}`}>
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Active Mess & Subscription Status */}
        <div className="p-4 border-t border-[#E4E5DE] bg-[#F6F4EE]/50 space-y-3">
          {!isSidebarCollapsed && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-[#737A74] uppercase tracking-wider block">
                Active Dining Hall
              </span>
              <select
                value={activeMessId}
                onChange={(e) => setSelectedMessId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-md bg-white border border-[#E4E5DE] text-xs font-semibold text-[#292E2A] focus:outline-none focus:border-[#244D3C] cursor-pointer"
              >
                {messes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#E4E5DE]/80">
              <span className="font-semibold text-[#292E2A]">Plan: {currentPlan === 'pro' ? 'Pro' : 'Starter'}</span>
              <button 
                onClick={() => setActiveTab('subscription')}
                className="text-[10px] font-bold text-[#244D3C] hover:underline cursor-pointer"
              >
                Manage Plan
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE VIEWPORT */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {adminNotice && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{adminNotice}</span>
            </div>
            <button onClick={() => setAdminNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Workspace Context Header with Breadcrumbs & Multi-Mess Action */}
        <div className="bg-white rounded-xl p-5 sm:p-6 shadow-xs border border-[#E4E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#737A74]">
              <span>Campus</span>
              <span>/</span>
              <span>{userProfile?.collegeName || 'Institution'}</span>
              <span>/</span>
              <span className="font-semibold text-[#244D3C]">{currentMess?.name || 'Dining Hall'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#292E2A] tracking-tight">
              {activeTab === 'overview' && 'Dining Quality Overview'}
              {activeTab === 'menus' && 'Weekly Menu Schedules'}
              {activeTab === 'analytics' && 'Feedback Analytics & Trends'}
              {activeTab === 'polls' && 'Democratic Student Polls'}
              {activeTab === 'feedback' && 'Student Grievances & Complaints'}
              {activeTab === 'announcements' && 'Dining Hall Notices'}
              {activeTab === 'preview' && 'Student Mobile Viewport Simulation'}
              {activeTab === 'subscription' && 'College & Mess Management'}
              {activeTab === 'qr' && 'Dining Hall QR Table Posters'}
              {activeTab === 'requests' && 'Admin Access Requests'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setAddMessError(null);
                setAddMessModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1B3C2E] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Mess</span>
            </button>

            <button
              onClick={() => setActiveTab('subscription')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentPlan === 'pro'
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : 'bg-[#F6F4EE] text-[#292E2A] border-[#E4E5DE] hover:bg-[#EFEEE8]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>{currentPlan === 'pro' ? 'Pro Plan' : 'Starter Plan'}</span>
            </button>
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
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#737A74]">
                <span className="font-medium">Overall Satisfaction</span>
                <Star className="w-4 h-4 fill-[#B77950] text-[#B77950]" />
              </div>
              <div className="text-2xl font-bold text-[#244D3C]">{avgRating} <span className="text-xs font-normal text-[#737A74]">/ 5.0</span></div>
              <p className="text-[11px] text-[#737A74]">Across {totalRatings} student reviews</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#737A74]">
                <span className="font-medium">Taste & Flavor Rating</span>
                <ChefHat className="w-4 h-4 text-[#244D3C]" />
              </div>
              <div className="text-2xl font-bold text-[#244D3C]">{avgTaste} ★</div>
              <p className="text-[11px] text-[#737A74]">Quality of spices & cooking</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#737A74]">
                <span className="font-medium">Mess Hygiene Score</span>
                <CheckCircle2 className="w-4 h-4 text-[#244D3C]" />
              </div>
              <div className="text-2xl font-bold text-[#244D3C]">{avgHygiene} ★</div>
              <p className="text-[11px] text-[#737A74]">Clean utensils & dining area</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E4E5DE] shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#737A74]">
                <span className="font-medium">Pending Grievances</span>
                <AlertTriangle className="w-4 h-4 text-[#B77950]" />
              </div>
              <div className="text-2xl font-bold text-[#B77950]">{pendingFeedbackCount}</div>
              <p className="text-[11px] text-[#737A74]">{feedbackList.length} total received</p>
            </div>
          </div>

          {/* Quick Actions & Recent Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
                <h3 className="font-bold text-sm text-[#292E2A]">Urgent Student Grievances</h3>
                <button onClick={() => setActiveTab('feedback')} className="text-xs text-[#244D3C] font-semibold hover:underline">
                  View All ({feedbackList.length})
                </button>
              </div>

              {feedbackList.filter(f => f.status !== 'Resolved').length > 0 ? (
                <div className="space-y-3">
                  {feedbackList.filter(f => f.status !== 'Resolved').slice(0, 3).map(f => (
                    <div key={f.id} className="p-4 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#292E2A]">{f.category} ({f.userName})</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#737A74]">{f.body}</p>
                      <button
                        onClick={() => {
                          setResolvingItem(f);
                          setResolutionResponse(f.response || '');
                          setResolutionStatus(f.status);
                        }}
                        className="text-xs font-semibold text-[#244D3C] underline cursor-pointer"
                      >
                        Respond & Resolve →
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#737A74] italic py-4">No unresolved complaints! All grievances have been addressed.</p>
              )}
            </div>

            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-[#E4E5DE] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
                <h3 className="font-bold text-sm text-[#292E2A]">Active Food Polls Engagement</h3>
                <button onClick={() => setActiveTab('polls')} className="text-xs text-[#244D3C] font-semibold hover:underline">
                  Manage Polls
                </button>
              </div>

              {polls.length > 0 ? (
                <div className="space-y-3">
                  {polls.slice(0, 2).map(poll => {
                    const votesForPoll = pollVotes.filter(v => v.pollId === poll.id);
                    return (
                      <div key={poll.id} className="p-4 rounded-lg bg-[#F6F4EE] border border-[#E4E5DE] space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#292E2A]">{poll.question}</span>
                          <span className="font-bold text-[#244D3C]">{votesForPoll.length} votes</span>
                        </div>
                        <div className="text-xs text-[#737A74]">
                          Status: <span className="capitalize font-semibold text-[#292E2A]">{poll.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#737A74] italic py-4">No active polls. Create one in the Polls tab.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU PLANNER */}
      {activeTab === 'menus' && (
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#E4E5DE] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E5DE]">
            <div>
              <h2 className="text-lg font-bold text-[#292E2A]">Weekly Mess Schedule & Menu Planner</h2>
              <p className="text-xs text-[#737A74]">Changes publish instantly to all student dashboards via Firestore.</p>
            </div>
            <button
              onClick={() => {
                setEditingMenu(null);
                setFormDishes('');
                setMenuModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Meal to Menu</span>
            </button>
          </div>

          <div className="space-y-6">
            {daysOfWeek.map((dayName, dayIndex) => {
              const dayMeals = menus.filter(m => m.day === dayIndex);
              return (
                <div key={dayName} className="p-5 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-3">
                  <div className="font-bold text-xs text-[#244D3C] uppercase tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{dayName}</span>
                  </div>

                  {dayMeals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {dayMeals.map((m) => (
                        <div key={m.id} className="bg-white p-4 rounded-lg border border-[#E4E5DE] shadow-2xs flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-full bg-[#244D3C] text-white text-[10px] font-bold uppercase">
                                {m.mealType}
                              </span>
                              <span className="text-[11px] text-[#737A74] font-medium">
                                {m.startTime} - {m.endTime}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-[#292E2A] leading-snug">
                              {m.dishes}
                            </p>
                            {m.labels && (
                              <p className="text-[10px] text-[#B77950] font-semibold">
                                {m.labels}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[#E4E5DE] flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditMenu(m)}
                              className="p-1.5 rounded-lg text-[#244D3C] hover:bg-[#F6F4EE] cursor-pointer"
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
                    <p className="text-xs text-[#737A74] italic">No meals scheduled for {dayName}.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACK & COMPLAINTS RESOLUTION */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#E4E5DE] space-y-6">
          <div className="pb-4 border-b border-[#E4E5DE] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#292E2A]">Student Grievance & Feedback Inbox</h2>
              <p className="text-xs text-[#737A74]">Review and reply to complaints. Your responses appear live in the student's dashboard.</p>
            </div>
          </div>

          <div className="space-y-4">
            {feedbackList.map((item) => (
              <div key={item.id} className="p-5 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                      item.kind === 'complaint' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {item.kind}
                    </span>
                    <span className="font-bold text-[#292E2A]">{item.category}</span>
                    <span className="text-[#737A74]">by {item.userName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#737A74]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#292E2A] leading-relaxed bg-white p-3.5 rounded-lg border border-[#E4E5DE]">
                  {item.body}
                </p>

                {item.response && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-0.5">
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
                    className="px-4 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#E4E5DE] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E5DE]">
            <div>
              <h2 className="text-lg font-bold text-[#292E2A]">Mess Food Polls</h2>
              <p className="text-xs text-[#737A74]">Democratically decide special meals and Sunday feast options.</p>
            </div>
            <button
              onClick={() => setPollModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
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
                <div key={poll.id} className="p-5 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        poll.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {poll.status}
                      </span>
                      <span className="text-[#737A74] font-semibold">{totalVotes} total votes</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#292E2A]">{poll.question}</h3>

                    {/* Options breakdown */}
                    <div className="space-y-2">
                      {rawOptions.map((opt, oIdx) => {
                        const optVotes = pollVotesList.filter(v => v.choice === oIdx).length;
                        const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                        return (
                          <div key={oIdx} className="bg-white p-3 rounded-lg border border-[#E4E5DE] text-xs space-y-1">
                            <div className="flex justify-between font-semibold text-[#292E2A]">
                              <span>{opt}</span>
                              <span className="text-[#244D3C] font-bold">{pct}% ({optVotes})</span>
                            </div>
                            <div className="w-full bg-[#F6F4EE] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-[#244D3C] h-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {poll.status === 'active' && (
                    <div className="pt-2 border-t border-[#E4E5DE] flex justify-end">
                      <button
                        onClick={() => handleClosePoll(poll.id)}
                        className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer"
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
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#E4E5DE] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E5DE]">
            <div>
              <h2 className="text-lg font-bold text-[#292E2A]">Mess Notice Board Publisher</h2>
              <p className="text-xs text-[#737A74]">Broadcast food alerts, timing changes, and festival feast announcements.</p>
            </div>
            <button
              onClick={() => setAnnModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Notice</span>
            </button>
          </div>

          <div className="space-y-4">
            {announcements.map((ann) => (
              <div key={ann.id} className="p-5 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] space-y-2 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#292E2A]">{ann.title}</span>
                    {ann.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#737A74] leading-relaxed">{ann.body}</p>
                  <div className="text-[10px] text-[#244D3C] font-semibold pt-1">
                    Published by {ann.authorName} on {new Date(ann.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAnnouncement(ann.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
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
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#E4E5DE] space-y-6">
          <div className="pb-4 border-b border-[#E4E5DE]">
            <h2 className="text-lg font-bold text-[#292E2A]">Mess Administrator Access Requests</h2>
            <p className="text-xs text-[#737A74]">
              Verify applicants requesting management privileges. Approving adds them securely to the database.
            </p>
          </div>

          {adminRequests.length > 0 ? (
            <div className="space-y-4">
              {adminRequests.map((req) => (
                <div key={req.id} className="p-5 rounded-xl bg-[#F6F4EE] border border-[#E4E5DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#292E2A]">{req.name}</span>
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
                    <p className="text-xs text-[#737A74]">
                      Email: <b>{req.email}</b> • Campus: <b>{req.collegeName}</b> • Hall: <b>{req.messName}</b>
                    </p>
                    <p className="text-[10px] text-[#737A74]">
                      Submitted: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveRequest(req)}
                        className="px-4 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Approve Admin</span>
                      </button>
                      <button
                        onClick={() => handleRejectRequest(req)}
                        className="px-3.5 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#737A74] italic">No pending admin authorization requests.</p>
          )}
        </div>
      )}

      {/* TAB 7: MESS QR POSTER */}
      {activeTab === 'qr' && (
        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-[#E4E5DE] space-y-6">
          <div className="pb-4 border-b border-[#E4E5DE]">
            <h2 className="text-lg font-bold text-[#292E2A]">Mess Entrance QR Code Poster</h2>
            <p className="text-xs text-[#737A74]">
              Print and display this QR code at the dining hall entrance for students to check the menu and submit ratings.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 bg-[#F6F4EE] p-8 rounded-xl border border-[#E4E5DE]">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-[#E4E5DE] text-center space-y-3">
              {qrPosterUrl && (
                <img src={qrPosterUrl} alt="Mess QR Poster" className="w-64 h-64 mx-auto rounded-lg" />
              )}
              <div className="text-xs font-semibold text-[#244D3C]">Scan to View Live Menu</div>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <h3 className="font-bold text-lg text-[#292E2A]">{userProfile?.messName}</h3>
                <p className="text-xs text-[#737A74] mt-1">
                  Unique Link: <span className="text-[#244D3C] font-mono break-all">{`${window.location.origin}/?mess=${activeMessId}`}</span>
                </p>
              </div>

              <p className="text-xs text-[#292E2A] leading-relaxed">
                When students scan this with their smartphone camera, MessMate automatically opens the specific menu for this dining hall and retains the mess context across sign-up.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                {qrPosterUrl && (
                  <a
                    href={qrPosterUrl}
                    download={`messmate-qr-${userProfile?.messName?.toLowerCase().replace(/\s+/g, '-') || 'mess'}.png`}
                    className="px-5 py-2 rounded-lg bg-[#244D3C] text-white text-xs font-semibold shadow-xs hover:bg-[#1b3a2d] flex items-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Download QR Code Image</span>
                  </a>
                )}
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
            <div className="md:col-span-2 bg-white rounded-xl p-6 sm:p-8 border border-[#E4E5DE] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E5DE]">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-[#B77950]/15 text-[#B77950]">
                    {subscription?.status === 'trial' ? '14-Day Free Trial' : 'Active Plan'}
                  </span>
                  <h2 className="text-xl font-bold text-[#292E2A] mt-2">
                    {currentPlan === 'pro' ? 'Pro Plan — Multi-Mess Platform' : 'Starter Plan — Single Dining Hall'}
                  </h2>
                  <p className="text-xs text-[#737A74] mt-1">
                    Workspace for <b>{userProfile?.collegeName || 'Your Institution'}</b>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-[#244D3C]">
                    ₹{currentPlan === 'pro' ? '2,999' : '1,500'}
                    <span className="text-xs font-normal text-[#737A74]"> / month</span>
                  </div>
                  <div className="text-[10px] text-[#737A74] mt-0.5">
                    {subscription?.isDemo ? 'Demo trial activation • No credit card charged' : 'Billed monthly'}
                  </div>
                </div>
              </div>

              {/* Mess Capacity Usage Meter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#292E2A]">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#244D3C]" />
                    <span>Dining Halls / Mess Utilization</span>
                  </span>
                  <span>
                    {messes.length} of {maxMessesAllowed} mess(es) active
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-[#F6F4EE] border border-[#E4E5DE] overflow-hidden p-0.5">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      messes.length >= maxMessesAllowed ? 'bg-[#B77950]' : 'bg-[#244D3C]'
                    }`}
                    style={{ width: `${Math.min(100, (messes.length / maxMessesAllowed) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#737A74]">
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
                  className="px-5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Mess Hall</span>
                </button>

                {currentPlan === 'starter' && (
                  <button
                    onClick={handleUpgradeToPro}
                    disabled={isUpgradingPlan}
                    className="px-5 py-2 rounded-lg bg-[#B77950] hover:bg-[#9e6642] text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isUpgradingPlan ? 'Upgrading...' : 'Upgrade to Pro (₹2,999/mo)'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Plan Comparison / Features Card */}
            <div className="bg-[#F6F4EE] rounded-xl p-6 sm:p-8 border border-[#E4E5DE] space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#244D3C]/10 text-[#244D3C] flex items-center justify-center font-bold">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#292E2A]">
                      {currentPlan === 'pro' ? 'Pro Plan Features' : 'Unlock Pro Plan'}
                    </h3>
                    <p className="text-[11px] text-[#737A74]">Designed for multi-hostel campuses</p>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-[#292E2A]">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                    <span>Manage up to <b>5 separate hostel dining halls</b></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                    <span>Cross-hostel menu analytics & reviews</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                    <span>Live food voting & dietary polls</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                    <span>Per-mess QR code poster generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#244D3C] shrink-0 mt-0.5" />
                    <span>Urgent catering alerts broadcast</span>
                  </li>
                </ul>
              </div>

              {currentPlan === 'starter' ? (
                <button
                  onClick={handleUpgradeToPro}
                  disabled={isUpgradingPlan}
                  className="w-full py-2 rounded-lg bg-white border border-[#E4E5DE] hover:bg-[#244D3C] hover:text-white text-[#244D3C] text-xs font-semibold transition-all shadow-xs cursor-pointer text-center"
                >
                  {isUpgradingPlan ? 'Processing...' : 'Upgrade Workspace — ₹2,999/mo'}
                </button>
              ) : (
                <div className="text-center py-2 px-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  All Pro features active
                </div>
              )}
            </div>
          </div>

          {/* Registered Messes Table */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-[#E4E5DE] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E5DE]">
              <div>
                <h3 className="text-base font-bold text-[#292E2A]">Campus Dining Halls ({messes.length})</h3>
                <p className="text-xs text-[#737A74]">
                  All messes configured under <b>{userProfile?.collegeName}</b>. Students can select any of these during onboarding.
                </p>
              </div>

              <button
                onClick={() => {
                  setAddMessError(null);
                  setAddMessModalOpen(true);
                }}
                className="px-4 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Mess</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {messes.map((m) => (
                <div 
                  key={m.id}
                  className={`p-5 rounded-xl border transition-all ${
                    m.id === activeMessId
                      ? 'bg-[#F6F4EE] border-[#244D3C] shadow-xs'
                      : 'bg-white border-[#E4E5DE] hover:border-[#244D3C]/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#292E2A]">{m.name}</span>
                        {m.id === activeMessId && (
                          <span className="px-2 py-0.5 rounded-full bg-[#244D3C] text-white text-[10px] font-bold">
                            Active in View
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#737A74]">{m.locationBlock || 'Main Dining Block'}</p>
                      {m.description && <p className="text-xs text-[#292E2A] pt-1">{m.description}</p>}
                    </div>

                    {m.id !== activeMessId ? (
                      <button
                        onClick={() => setSelectedMessId(m.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#E4E5DE] hover:bg-[#244D3C] hover:text-white text-[#244D3C] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Switch to Mess
                      </button>
                    ) : (
                      <button
                        onClick={() => setActiveTab('menus')}
                        className="px-3 py-1.5 rounded-lg bg-[#244D3C] text-white text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                      >
                        Manage Menus
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E4E5DE] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#737A74]">
                    <div>
                      <span className="font-semibold block text-[#292E2A]">Breakfast</span>
                      <span>{m.breakfastTime || '07:30 - 09:30'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[#292E2A]">Lunch</span>
                      <span>{m.lunchTime || '12:00 - 14:15'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[#292E2A]">Snacks</span>
                      <span>{m.snacksTime || '16:45 - 18:00'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-[#292E2A]">Dinner</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-[#E4E5DE] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
              <h3 className="font-bold text-base text-[#292E2A]">
                {editingMenu ? 'Edit Meal Schedule' : 'Add Meal to Schedule'}
              </h3>
              <button onClick={() => setMenuModalOpen(false)} className="p-1 rounded-lg text-[#737A74] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMenu} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292E2A]">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E4E5DE] text-xs font-semibold text-[#292E2A] focus:outline-none focus:border-[#244D3C]"
                  >
                    {daysOfWeek.map((d, idx) => (
                      <option key={d} value={idx}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292E2A]">Meal Type</label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value as MealType)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E4E5DE] text-xs font-semibold text-[#292E2A] focus:outline-none focus:border-[#244D3C] capitalize"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="snacks">Snacks</option>
                    <option value="dinner">Dinner</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Dishes Served</label>
                <textarea
                  required
                  rows={3}
                  value={formDishes}
                  onChange={(e) => setFormDishes(e.target.value)}
                  placeholder="e.g. Chole Bhature, Pickle, Boiled Eggs, Tea & Coffee"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292E2A]">Serving Start</label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292E2A]">Serving End</label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Nutritional / Dietary Labels</label>
                <input
                  type="text"
                  value={formLabels}
                  onChange={(e) => setFormLabels(e.target.value)}
                  placeholder="e.g. Vegetarian, High Protein, Special Feast"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#737A74] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-[#E4E5DE] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
              <h3 className="font-bold text-base text-[#292E2A]">Create Food Poll</h3>
              <button onClick={() => setPollModalOpen(false)} className="p-1 rounded-lg text-[#737A74] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePoll} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Poll Question</label>
                <input
                  type="text"
                  required
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="e.g. What sweet dish should we serve on Saturday?"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Choices (comma separated)</label>
                <input
                  type="text"
                  required
                  value={pollOptionsInput}
                  onChange={(e) => setPollOptionsInput(e.target.value)}
                  placeholder="Gulab Jamun, Rasgulla, Kheer"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Closing Deadline (optional)</label>
                <input
                  type="text"
                  value={pollDeadline}
                  onChange={(e) => setPollDeadline(e.target.value)}
                  placeholder="e.g. Friday 6 PM"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPollModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#737A74] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-[#E4E5DE] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
              <h3 className="font-bold text-base text-[#292E2A]">Publish Notice</h3>
              <button onClick={() => setAnnModalOpen(false)} className="p-1 rounded-lg text-[#737A74] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Notice Title</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Special Festival Feast this Friday"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Details / Notice Body</label>
                <textarea
                  required
                  rows={3}
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  placeholder="e.g. Dinner will feature Pav Bhaji and Ice Cream from 7:30 PM..."
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Priority</label>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                >
                  <option value="normal">Normal Notice</option>
                  <option value="urgent">Urgent Announcement</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAnnModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#737A74] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-[#E4E5DE] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
              <h3 className="font-bold text-base text-[#292E2A]">Respond to Grievance</h3>
              <button onClick={() => setResolvingItem(null)} className="p-1 rounded-lg text-[#737A74] hover:bg-black/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-[#F6F4EE] rounded-lg border border-[#E4E5DE] text-xs space-y-1">
              <div className="font-bold text-[#292E2A]">{resolvingItem.category} ({resolvingItem.userName})</div>
              <p className="text-[#737A74]">{resolvingItem.body}</p>
            </div>

            <form onSubmit={handleResolveFeedback} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Update Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                >
                  <option value="Submitted">Submitted (Pending)</option>
                  <option value="In Review">In Review (Action initiated)</option>
                  <option value="Resolved">Resolved (Complete)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292E2A]">Official Response to Student</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionResponse}
                  onChange={(e) => setResolutionResponse(e.target.value)}
                  placeholder="e.g. Noted. Kitchen staff instructed to maintain food heating trays properly. Inspection conducted today."
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C] resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingItem(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#737A74] hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 sm:p-8 shadow-xl border border-[#E4E5DE] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E5DE]">
              <div>
                <h3 className="font-bold text-base text-[#292E2A]">Register New Mess Hall</h3>
                <p className="text-xs text-[#737A74]">
                  Add a dining hall under <b>{userProfile?.collegeName || 'Campus'}</b>
                </p>
              </div>
              <button 
                onClick={() => setAddMessModalOpen(false)} 
                className="p-1.5 rounded-lg text-[#737A74] hover:bg-black/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Plan Limit Check */}
            {messes.length >= maxMessesAllowed ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
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
                    className="w-full py-2.5 rounded-lg bg-[#B77950] hover:bg-[#9e6642] text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isUpgradingPlan ? 'Upgrading...' : 'Upgrade to Pro Plan (₹2,999/mo)'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAddMessModalOpen(false)}
                  className="w-full py-2 rounded-lg border border-[#E4E5DE] text-xs font-semibold text-[#737A74] hover:bg-[#F6F4EE] cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddNewMess} className="space-y-4">
                {addMessError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                    {addMessError}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292E2A]">Mess / Dining Hall Name *</label>
                  <input
                    type="text"
                    required
                    value={newMessName}
                    onChange={(e) => setNewMessName(e.target.value)}
                    placeholder="e.g. Hostel 16 - South Indian Dining"
                    className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292E2A]">Location / Block *</label>
                  <input
                    type="text"
                    required
                    value={newMessLocation}
                    onChange={(e) => setNewMessLocation(e.target.value)}
                    placeholder="e.g. Block D Ground Floor / East Campus"
                    className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292E2A]">Description (optional)</label>
                  <textarea
                    rows={2}
                    value={newMessDesc}
                    onChange={(e) => setNewMessDesc(e.target.value)}
                    placeholder="e.g. Pure vegetarian dining hall serving North and South Indian menus."
                    className="w-full px-3 py-2 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C] resize-none"
                  />
                </div>

                <div className="border-t border-[#E4E5DE] pt-3 space-y-3">
                  <h4 className="text-xs font-bold text-[#292E2A]">Standard Meal Timings</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#737A74]">Breakfast Time</label>
                      <input
                        type="text"
                        value={newMessBreakfast}
                        onChange={(e) => setNewMessBreakfast(e.target.value)}
                        placeholder="07:30 - 09:30"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#737A74]">Lunch Time</label>
                      <input
                        type="text"
                        value={newMessLunch}
                        onChange={(e) => setNewMessLunch(e.target.value)}
                        placeholder="12:00 - 14:15"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#737A74]">Evening Snacks</label>
                      <input
                        type="text"
                        value={newMessSnacks}
                        onChange={(e) => setNewMessSnacks(e.target.value)}
                        placeholder="16:45 - 18:00"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-[#737A74]">Dinner Time</label>
                      <input
                        type="text"
                        value={newMessDinner}
                        onChange={(e) => setNewMessDinner(e.target.value)}
                        placeholder="19:45 - 21:45"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#E4E5DE] text-xs focus:outline-none focus:border-[#244D3C]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setAddMessModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-[#737A74] hover:bg-black/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingMess}
                    className="px-5 py-2.5 rounded-lg bg-[#244D3C] hover:bg-[#1b3a2d] text-white text-xs font-semibold shadow-xs cursor-pointer transition-all disabled:opacity-50"
                  >
                    {isAddingMess ? 'Creating Mess...' : 'Create Mess Hall'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      </main>
    </div>
  );
};
