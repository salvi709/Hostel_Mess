export type UserRole = 'student' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId: string;
  collegeName?: string;
  messId: string;
  messName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export type SubscriptionPlan = 'starter' | 'pro';

export interface Subscription {
  id: string;
  institutionId: string;
  adminUid: string;
  plan: SubscriptionPlan;
  priceMonthly: number;
  maxMesses: number;
  status: 'active' | 'trial' | 'pending';
  isDemo: boolean;
  startDate: string;
  renewalDate: string;
}

export interface AdminRecord {
  uid: string;
  email: string;
  role: 'admin';
  collegeId: string;
  collegeName: string;
  messId?: string;
  plan: SubscriptionPlan;
  createdAt: string;
  approvedBy?: string;
}

export interface Institution {
  id: string;
  name: string;
  location: string;
  code: string;
  officialEmail: string;
  contactPhone?: string;
  ownerUid: string;
  status: 'active' | 'pending';
  plan: SubscriptionPlan;
  createdAt: string;
}

export interface Mess {
  id: string;
  collegeId: string;
  name: string;
  locationBlock?: string;
  description?: string;
  timezone: string;
  active: boolean;
  breakfastTime?: string;
  lunchTime?: string;
  snacksTime?: string;
  dinnerTime?: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export interface Menu {
  id: string;
  messId: string;
  collegeId: string;
  day: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  mealType: MealType;
  dishes: string;
  labels: string; // e.g. "Vegetarian, High Protein"
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "09:30"
  effectiveDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MealRating {
  id: string;
  messId: string;
  collegeId: string;
  menuId?: string;
  mealType: string;
  serviceDate: string; // YYYY-MM-DD
  score: number; // 1-5
  taste?: number;
  quality?: number;
  quantity?: number;
  hygiene?: number;
  comment?: string;
  userId: string;
  actorName: string;
  createdAt: string;
}

export type FeedbackKind = 'complaint' | 'suggestion' | 'general';
export type FeedbackStatus = 'Submitted' | 'In Review' | 'Resolved';

export interface FeedbackItem {
  id: string;
  messId: string;
  collegeId: string;
  userId: string;
  userName: string;
  kind: FeedbackKind;
  category: string;
  body: string;
  status: FeedbackStatus;
  response?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Poll {
  id: string;
  messId: string;
  collegeId: string;
  question: string;
  options: string[]; // parsed array or stringified
  status: 'active' | 'closed' | 'draft';
  closesAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface PollResponse {
  id: string;
  pollId: string;
  messId: string;
  userId: string;
  choice: number;
  votedAt: string;
}

export interface Announcement {
  id: string;
  messId: string;
  collegeId: string;
  title: string;
  body: string;
  priority: 'normal' | 'urgent';
  authorName: string;
  createdAt: string;
}

export interface AdminRequest {
  id: string;
  uid: string;
  name: string;
  email: string;
  collegeId: string;
  collegeName: string;
  messId: string;
  messName: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
