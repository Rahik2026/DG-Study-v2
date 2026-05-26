'use client';

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { type DocumentData } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import {
  createUserProfile,
  getUserProfile,
  setUserOnline,
  subscribeUsers,
  subscribePosts,
  createPost,
  togglePostLike,
  subscribeChatRooms,
  subscribeMessages,
  sendChatMessage,
  subscribeHomework,
  subscribeExams,
  subscribeAnnouncements,
  subscribeFiles,
  subscribeQuestionBank,
  subscribeNotifications,
  markNotifRead,
  markAllNotifsRead,
  createChatRoom,
  seedInitialData,
} from '@/lib/firestore';

// ─── Types ──────────────────────────────────────────────
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: string;
  department: string;
  semester: number;
  bio: string;
  isOnline: boolean;
  [key: string]: unknown;
}

interface AppState {
  // Auth
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  authInitialized: boolean;

  // UI
  isDarkMode: boolean;
  sidebarOpen: boolean;

  // Data from Firestore (live)
  users: DocumentData[];
  posts: DocumentData[];
  chatRooms: DocumentData[];
  messages: Record<string, DocumentData[]>;
  homework: DocumentData[];
  exams: DocumentData[];
  announcements: DocumentData[];
  files: DocumentData[];
  questionBank: DocumentData[];
  notifications: DocumentData[];

  // Active states
  activeChatId: string | null;

  // Actions
  initAuth: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, department?: string, semester?: number) => Promise<void>;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setActiveChatId: (id: string | null) => void;
  addPost: (content: string, tags: string[]) => Promise<void>;
  toggleLike: (postId: string) => void;
  sendMessage: (chatRoomId: string, text: string) => Promise<void>;
  createNewChat: (type: 'private' | 'group', name: string, members: string[]) => Promise<string>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Internal
  _unsubscribers: (() => void)[];
  _subscribeToData: (uid: string) => void;
  _cleanupSubscriptions: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  authInitialized: false,
  isDarkMode: true,
  sidebarOpen: true,

  users: [],
  posts: [],
  chatRooms: [],
  messages: {},
  homework: [],
  exams: [],
  announcements: [],
  files: [],
  questionBank: [],
  notifications: [],
  activeChatId: null,
  _unsubscribers: [],

  // ─── AUTH LISTENER ────────────────────────────────────
  initAuth: () => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in — load their profile
        let profile = await getUserProfile(firebaseUser.uid);
        if (!profile) {
          // Profile doesn't exist yet (edge case) — create it
          await createUserProfile(firebaseUser.uid, {
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
          });
          profile = await getUserProfile(firebaseUser.uid);
        }

        await setUserOnline(firebaseUser.uid, true);

        set({
          firebaseUser,
          user: profile as UserProfile,
          isAuthenticated: true,
          isLoading: false,
          authError: null,
          authInitialized: true,
        });

        // Subscribe to all live data
        get()._subscribeToData(firebaseUser.uid);
      } else {
        // Signed out
        get()._cleanupSubscriptions();
        set({
          firebaseUser: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          authInitialized: true,
          posts: [],
          chatRooms: [],
          messages: {},
          homework: [],
          exams: [],
          announcements: [],
          files: [],
          questionBank: [],
          notifications: [],
          users: [],
        });
      }
    });

    return () => {
      unsubAuth();
      get()._cleanupSubscriptions();
    };
  },

  // ─── SUBSCRIBE TO ALL FIRESTORE DATA ──────────────────
  _subscribeToData: (uid: string) => {
    // Clean up any existing subscriptions first
    get()._cleanupSubscriptions();

    const unsubs: (() => void)[] = [];

    unsubs.push(subscribeUsers((users) => set({ users })));
    unsubs.push(subscribePosts((posts) => set({ posts })));
    unsubs.push(subscribeChatRooms(uid, (chatRooms) => set({ chatRooms })));
    unsubs.push(subscribeHomework((homework) => set({ homework })));
    unsubs.push(subscribeExams((exams) => set({ exams })));
    unsubs.push(subscribeAnnouncements((announcements) => set({ announcements })));
    unsubs.push(subscribeFiles((files) => set({ files })));
    unsubs.push(subscribeQuestionBank((questionBank) => set({ questionBank })));
    unsubs.push(subscribeNotifications(uid, (notifications) => set({ notifications })));

    set({ _unsubscribers: unsubs });
  },

  _cleanupSubscriptions: () => {
    const { _unsubscribers } = get();
    _unsubscribers.forEach((fn) => fn());
    set({ _unsubscribers: [] });
  },

  // ─── LOGIN ────────────────────────────────────────────
  login: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      let msg = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') msg = 'No account found with this email.';
      if (error.code === 'auth/wrong-password') msg = 'Incorrect password.';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Please try later.';
      set({ isLoading: false, authError: msg });
      throw new Error(msg);
    }
  },

  // ─── SIGNUP ───────────────────────────────────────────
  signup: async (name: string, email: string, password: string, department?: string, semester?: number) => {
    set({ isLoading: true, authError: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Set display name on the Firebase Auth user
      await updateProfile(cred.user, { displayName: name });

      // Create Firestore profile
      await createUserProfile(cred.user.uid, {
        email,
        displayName: name,
        department: department || 'Computer Science',
        semester: semester || 1,
      });

      // Seed initial data if this is the very first user
      await seedInitialData(cred.user.uid, name);

      // onAuthStateChanged will handle setting state
    } catch (error: any) {
      let msg = 'Signup failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      if (error.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
      if (error.code === 'auth/invalid-email') msg = 'Invalid email address.';
      set({ isLoading: false, authError: msg });
      throw new Error(msg);
    }
  },

  // ─── LOGOUT ───────────────────────────────────────────
  logout: async () => {
    const { user } = get();
    if (user?.uid) {
      try {
        await setUserOnline(user.uid, false);
      } catch (e) {
        // ignore - might fail if already signed out
      }
    }
    await signOut(auth);
    // onAuthStateChanged will clear state
  },

  // ─── UI TOGGLES ───────────────────────────────────────
  toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  // ─── CHAT ─────────────────────────────────────────────
  setActiveChatId: (id) => {
    const prev = get().activeChatId;
    // Unsubscribe from previous chat messages
    // (we keep message subs in the messages map, handled by component)
    set({ activeChatId: id });
  },

  // ─── POSTS ────────────────────────────────────────────
  addPost: async (content: string, tags: string[]) => {
    const user = get().user;
    if (!user) return;
    await createPost({
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL || '',
      content,
      tags,
    });
    // Real-time listener will auto-update the posts array
  },

  toggleLike: (postId: string) => {
    const user = get().user;
    if (!user) return;
    const post = get().posts.find((p) => p.id === postId);
    if (!post) return;
    const isLiked = post.likes?.includes(user.uid);
    togglePostLike(postId, user.uid, isLiked);
    // Real-time listener will auto-update
  },

  // ─── MESSAGES ─────────────────────────────────────────
  sendMessage: async (chatRoomId: string, text: string) => {
    const user = get().user;
    if (!user) return;
    await sendChatMessage(chatRoomId, {
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL || '',
      text,
    });
    // Real-time listener will auto-update
  },

  createNewChat: async (type, name, members) => {
    const user = get().user;
    if (!user) return '';
    const id = await createChatRoom({ type, name, members, createdBy: user.uid });
    return id;
  },

  // ─── NOTIFICATIONS ────────────────────────────────────
  markNotificationRead: (id: string) => {
    markNotifRead(id);
    // Real-time listener will auto-update
  },

  markAllNotificationsRead: () => {
    const user = get().user;
    if (!user) return;
    markAllNotifsRead(user.uid);
  },
}));
