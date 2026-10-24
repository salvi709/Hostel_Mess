import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  query, 
  limit 
} from 'firebase/firestore';
import { db } from './config';
import { Institution, Mess, Menu } from '../types';

export const DEFAULT_INSTITUTIONS: Institution[] = [
  { 
    id: 'inst-iitb', 
    name: 'IIT Bombay', 
    location: 'Powai, Mumbai', 
    code: 'IITB', 
    officialEmail: 'mess@iitb.ac.in', 
    ownerUid: 'system-bootstrap', 
    status: 'active', 
    plan: 'pro', 
    createdAt: '2026-01-01' 
  },
  { 
    id: 'inst-nitt', 
    name: 'NIT Trichy', 
    location: 'Tiruchirappalli, Tamil Nadu', 
    code: 'NITT', 
    officialEmail: 'hostels@nitt.edu', 
    ownerUid: 'system-bootstrap', 
    status: 'active', 
    plan: 'pro', 
    createdAt: '2026-01-01' 
  },
  { 
    id: 'inst-bits', 
    name: 'BITS Pilani', 
    location: 'Pilani, Rajasthan', 
    code: 'BITS', 
    officialEmail: 'dining@pilani.bits-pilani.ac.in', 
    ownerUid: 'system-bootstrap', 
    status: 'active', 
    plan: 'starter', 
    createdAt: '2026-01-01' 
  },
  { 
    id: 'inst-dtu', 
    name: 'Delhi Technological University', 
    location: 'Bawana Road, Delhi', 
    code: 'DTU', 
    officialEmail: 'hosteloffice@dtu.ac.in', 
    ownerUid: 'system-bootstrap', 
    status: 'active', 
    plan: 'starter', 
    createdAt: '2026-01-01' 
  },
];

export const DEFAULT_MESSES: Mess[] = [
  {
    id: 'mess-iitb-h12',
    collegeId: 'inst-iitb',
    name: 'Hostel 12 - North Indian Dining',
    locationBlock: 'Hostel 12 Ground Floor',
    description: 'Specializes in North Indian thalis, rotis, and dal dishes.',
    timezone: 'Asia/Kolkata',
    active: true,
    breakfastTime: '07:30 - 09:30',
    lunchTime: '12:00 - 14:15',
    snacksTime: '16:45 - 18:00',
    dinnerTime: '19:45 - 21:45',
    createdAt: '2026-01-01',
  },
  {
    id: 'mess-iitb-h14',
    collegeId: 'inst-iitb',
    name: 'Hostel 14 - South Indian Special',
    locationBlock: 'Hostel 14 Block A',
    description: 'Authentic South Indian breakfast items, meals, and filter coffee.',
    timezone: 'Asia/Kolkata',
    active: true,
    breakfastTime: '07:30 - 09:30',
    lunchTime: '12:00 - 14:15',
    snacksTime: '16:45 - 18:00',
    dinnerTime: '19:45 - 21:45',
    createdAt: '2026-01-01',
  },
  {
    id: 'mess-iitb-gh',
    collegeId: 'inst-iitb',
    name: 'Girls Hostel Mess (GH Block)',
    locationBlock: 'Hostel 15 Dining Wing',
    description: 'Nutritious balanced vegetarian and non-vegetarian hostel meals.',
    timezone: 'Asia/Kolkata',
    active: true,
    breakfastTime: '07:30 - 09:30',
    lunchTime: '12:00 - 14:15',
    snacksTime: '16:45 - 18:00',
    dinnerTime: '19:45 - 21:45',
    createdAt: '2026-01-01',
  },
  {
    id: 'mess-nitt-main',
    collegeId: 'inst-nitt',
    name: 'Opal Dining Hall (Central Mess)',
    locationBlock: 'Central Dining Complex',
    description: 'Central dining complex serving students across hostel blocks.',
    timezone: 'Asia/Kolkata',
    active: true,
    breakfastTime: '07:30 - 09:30',
    lunchTime: '12:00 - 14:15',
    snacksTime: '16:45 - 18:00',
    dinnerTime: '19:45 - 21:45',
    createdAt: '2026-01-01',
  },
];

export async function seedInitialDatabaseIfEmpty() {
  try {
    const instSnap = await getDocs(query(collection(db, 'institutions'), limit(1)));
    if (!instSnap.empty) {
      return; // already seeded
    }

    // Seed Institutions
    for (const inst of DEFAULT_INSTITUTIONS) {
      await setDoc(doc(db, 'institutions', inst.id), inst);
      // Seed default subscription
      await setDoc(doc(db, 'subscriptions', `sub-${inst.id}`), {
        id: `sub-${inst.id}`,
        institutionId: inst.id,
        adminUid: inst.ownerUid,
        plan: inst.plan,
        priceMonthly: inst.plan === 'starter' ? 1500 : 2999,
        maxMesses: inst.plan === 'starter' ? 1 : 5,
        status: 'active',
        isDemo: true,
        startDate: '2026-01-01',
        renewalDate: '2027-01-01'
      });
    }

    // Seed Messes
    for (const mess of DEFAULT_MESSES) {
      await setDoc(doc(db, 'messes', mess.id), mess);
    }

    // Seed default Menus for Hostel 12
    const sampleMenus: Partial<Menu>[] = [
      {
        id: 'menu-h12-mon-b',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 1,
        mealType: 'breakfast',
        dishes: 'Aloo Paratha with Curd, Boiled Eggs / Banana, Tea & Coffee',
        labels: 'Vegetarian Option, High Energy',
        startTime: '07:30',
        endTime: '09:30',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu-h12-mon-l',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 1,
        mealType: 'lunch',
        dishes: 'Paneer Makhani / Chicken Curry, Dal Tadka, Jeera Rice, Phulkas, Green Salad, Gulab Jamun',
        labels: 'Special Lunch, Balanced Nutrition',
        startTime: '12:00',
        endTime: '14:15',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu-h12-mon-s',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 1,
        mealType: 'snacks',
        dishes: 'Samosa with Mint Chutney, Masala Chai, Biscuits',
        labels: 'Evening Snack',
        startTime: '16:45',
        endTime: '18:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu-h12-mon-d',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 1,
        mealType: 'dinner',
        dishes: 'Mix Veg Korma, Yellow Dal Fry, Steamed Basmati Rice, Chapati, Fresh Cut Fruits',
        labels: 'Vegetarian, Light Dinner',
        startTime: '19:45',
        endTime: '21:45',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu-h12-tue-b',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 2,
        mealType: 'breakfast',
        dishes: 'Idli, Medu Vada with Sambar & Coconut Chutney, Masala Omelette, Filter Coffee',
        labels: 'South Indian Classic, Protein Rich',
        startTime: '07:30',
        endTime: '09:30',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu-h12-tue-l',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 2,
        mealType: 'lunch',
        dishes: 'Rajma Masala, Steamed Rice, Tandoori Roti, Boondi Raita, Roasted Papad',
        labels: 'North Indian Comfort',
        startTime: '12:00',
        endTime: '14:15',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu-h12-tue-s',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 2,
        mealType: 'snacks',
        dishes: 'Poha with Sev, Roasted Peanuts & Lemon, Ginger Tea',
        labels: 'Healthy Snack',
        startTime: '16:45',
        endTime: '18:00',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'menu-h12-tue-d',
        messId: 'mess-iitb-h12',
        collegeId: 'inst-iitb',
        day: 2,
        mealType: 'dinner',
        dishes: 'Egg Bhurji / Kadai Mushroom, Dal Palak, Phulka, Steamed Rice, Ice Cream',
        labels: 'Chef Special',
        startTime: '19:45',
        endTime: '21:45',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const menu of sampleMenus) {
      await setDoc(doc(db, 'menus', menu.id!), menu);
    }

    // Seed Announcement
    await setDoc(doc(db, 'announcements', 'ann-welcome'), {
      id: 'ann-welcome',
      messId: 'mess-iitb-h12',
      collegeId: 'inst-iitb',
      title: 'Welcome to MessMate Portal! 🍽️',
      body: 'Review daily meals, rate each dish, vote in upcoming food polls, and report any hygiene or taste complaints directly to the mess committee.',
      priority: 'normal',
      authorName: 'Mess Secretary & Catering Committee',
      createdAt: new Date().toISOString(),
    });

    // Seed Active Poll
    await setDoc(doc(db, 'polls', 'poll-sunday-special'), {
      id: 'poll-sunday-special',
      messId: 'mess-iitb-h12',
      collegeId: 'inst-iitb',
      question: 'What would you like for this Sunday Feast Dinner?',
      options: ['Hyderabadi Dum Biryani (Veg/Non-Veg)', 'Paneer Tikka Butter Masala + Naan', 'South Indian Special Thali & Payasam'],
      status: 'active',
      closesAt: '2026-10-31',
      createdAt: new Date().toISOString(),
      createdBy: 'Mess Secretary',
    });

    console.log('MessMate database successfully seeded with initial defaults.');
  } catch (error) {
    console.warn('Initial seeding deferred until authenticated user visits.');
  }
}
