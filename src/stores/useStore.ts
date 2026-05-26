'use client';

import { create } from 'zustand';
import {
  demoUser,
  demoUsers,
  demoPosts,
  demoChatRooms,
  demoMessages,
  demoHomework,
  demoExams,
  demoAnnouncements,
  demoFiles,
  demoQuestionBank,
  demoNotifications,
} from '@/lib/demo-data';

interface AppState {
  // Auth
  user: typeof demoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDarkMode: boolean;
  sidebarOpen: boolean;

  // Data
  users: typeof demoUsers;
  posts: typeof demoPosts;
  chatRooms: typeof demoChatRooms;
  messages: typeof demoMessages;
  homework: typeof demoHomework;
  exams: typeof demoExams;
  announcements: typeof demoAnnouncements;
  files: typeof demoFiles;
  questionBank: typeof demoQuestionBank;
  notifications: typeof demoNotifications;

  // Active selections
  activeChatId: string | null;

  // Actions
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setActiveChatId: (id: string | null) => void;
  addPost: (content: string, tags: string[]) => void;
  toggleLike: (postId: string) => void;
  sendMessage: (chatRoomId: string, text: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isDarkMode: true,
  sidebarOpen: true,

  users: demoUsers,
  posts: demoPosts,
  chatRooms: demoChatRooms,
  messages: demoMessages,
  homework: demoHomework,
  exams: demoExams,
  announcements: demoAnnouncements,
  files: demoFiles,
  questionBank: demoQuestionBank,
  notifications: demoNotifications,
  activeChatId: null,

  login: (_email: string, _password: string) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ user: demoUser, isAuthenticated: true, isLoading: false });
    }, 1000);
  },

  signup: (name: string, email: string, _password: string) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({
        user: { ...demoUser, displayName: name, email },
        isAuthenticated: true,
        isLoading: false,
      });
    }, 1000);
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
  },

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setActiveChatId: (id) => {
    set({ activeChatId: id });
  },

  addPost: (content: string, tags: string[]) => {
    const user = get().user;
    if (!user) return;
    const newPost = {
      id: `post-${Date.now()}`,
      authorId: user.uid,
      authorName: user.displayName,
      authorPhoto: user.photoURL,
      content,
      images: [],
      likes: [],
      commentCount: 0,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },

  toggleLike: (postId: string) => {
    const user = get().user;
    if (!user) return;
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          const liked = post.likes.includes(user.uid);
          return {
            ...post,
            likes: liked
              ? post.likes.filter((id) => id !== user.uid)
              : [...post.likes, user.uid],
          };
        }
        return post;
      }),
    }));
  },

  sendMessage: (chatRoomId: string, text: string) => {
    const user = get().user;
    if (!user) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      chatRoomId,
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL,
      text,
      fileAttachment: null,
      readBy: [user.uid],
      createdAt: new Date(),
    };
    set((state) => ({
      messages: {
        ...state.messages,
        [chatRoomId]: [...(state.messages[chatRoomId] || []), newMsg],
      },
      chatRooms: state.chatRooms.map((room) =>
        room.id === chatRoomId
          ? { ...room, lastMessage: text, lastMessageAt: new Date(), lastMessageBy: user.uid }
          : room
      ),
    }));
  },

  markNotificationRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },
}));
