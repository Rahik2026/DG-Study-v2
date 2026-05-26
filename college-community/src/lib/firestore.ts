/**
 * Firestore CRUD helpers
 * Every read/write to the database goes through here.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  Timestamp,
  type Unsubscribe,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── helpers ────────────────────────────────────────────
const ts = () => serverTimestamp();
const col = (name: string) => collection(db, name);

// ─── USERS ──────────────────────────────────────────────
export async function createUserProfile(uid: string, data: {
  email: string;
  displayName: string;
  department?: string;
  semester?: number;
}) {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: '',
    role: 'student',
    department: data.department || 'Computer Science',
    semester: data.semester || 1,
    bio: '',
    isOnline: true,
    lastSeen: ts(),
    createdAt: ts(),
    updatedAt: ts(),
  });
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } : null;
}

export async function updateUserProfile(uid: string, data: Partial<DocumentData>) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: ts() });
}

export async function setUserOnline(uid: string, online: boolean) {
  await updateDoc(doc(db, 'users', uid), {
    isOnline: online,
    lastSeen: ts(),
  });
}

export function subscribeUsers(callback: (users: DocumentData[]) => void): Unsubscribe {
  const q = query(col('users'), orderBy('displayName'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
  });
}

// ─── POSTS ──────────────────────────────────────────────
export async function createPost(data: {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
  tags: string[];
}) {
  const ref = await addDoc(col('posts'), {
    ...data,
    images: [],
    likes: [],
    commentCount: 0,
    createdAt: ts(),
    updatedAt: ts(),
  });
  return ref.id;
}

export function subscribePosts(callback: (posts: DocumentData[]) => void): Unsubscribe {
  const q = query(col('posts'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function togglePostLike(postId: string, userId: string, isLiked: boolean) {
  const ref = doc(db, 'posts', postId);
  await updateDoc(ref, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function deletePost(postId: string) {
  await deleteDoc(doc(db, 'posts', postId));
}

// ─── COMMENTS ───────────────────────────────────────────
export async function addComment(postId: string, data: {
  authorId: string;
  authorName: string;
  authorPhoto: string;
  content: string;
}) {
  await addDoc(collection(db, 'posts', postId, 'comments'), {
    ...data,
    createdAt: ts(),
  });
  await updateDoc(doc(db, 'posts', postId), {
    commentCount: increment(1),
  });
}

export function subscribeComments(postId: string, callback: (comments: DocumentData[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── CHAT ROOMS ─────────────────────────────────────────
export async function createChatRoom(data: {
  type: 'private' | 'group';
  name: string;
  members: string[];
  createdBy: string;
}) {
  const ref = await addDoc(col('chatRooms'), {
    ...data,
    avatar: '',
    lastMessage: '',
    lastMessageAt: null,
    lastMessageBy: '',
    createdAt: ts(),
  });
  return ref.id;
}

export function subscribeChatRooms(userId: string, callback: (rooms: DocumentData[]) => void): Unsubscribe {
  const q = query(
    col('chatRooms'),
    where('members', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (error) => {
    // If index not ready, fall back to unordered query
    console.warn('ChatRooms query error (index may be building):', error.message);
    const fallback = query(col('chatRooms'), where('members', 'array-contains', userId));
    onSnapshot(fallback, (snap) => {
      const rooms = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rooms.sort((a, b) => {
        const aTime = (a as any).lastMessageAt?.toMillis?.() || 0;
        const bTime = (b as any).lastMessageAt?.toMillis?.() || 0;
        return bTime - aTime;
      });
      callback(rooms);
    });
  });
}

// ─── MESSAGES ───────────────────────────────────────────
export async function sendChatMessage(chatRoomId: string, data: {
  senderId: string;
  senderName: string;
  senderPhoto: string;
  text: string;
}) {
  // Add the message
  await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), {
    ...data,
    fileAttachment: null,
    readBy: [data.senderId],
    createdAt: ts(),
  });
  // Update the room's last message
  await updateDoc(doc(db, 'chatRooms', chatRoomId), {
    lastMessage: data.text,
    lastMessageAt: ts(),
    lastMessageBy: data.senderId,
  });
}

export function subscribeMessages(chatRoomId: string, callback: (messages: DocumentData[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'chatRooms', chatRoomId, 'messages'),
    orderBy('createdAt', 'asc'),
    limit(200)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── HOMEWORK ───────────────────────────────────────────
export async function createHomework(data: {
  title: string;
  description: string;
  subject: string;
  semester: number;
  department: string;
  dueDate: Date;
  createdBy: string;
  createdByName: string;
}) {
  await addDoc(col('homework'), {
    ...data,
    dueDate: Timestamp.fromDate(data.dueDate),
    attachments: [],
    status: 'active',
    submissions: [],
    createdAt: ts(),
  });
}

export function subscribeHomework(callback: (hw: DocumentData[]) => void): Unsubscribe {
  const q = query(col('homework'), orderBy('dueDate', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── EXAMS ──────────────────────────────────────────────
export async function createExam(data: {
  title: string;
  subject: string;
  semester: number;
  department: string;
  date: Date;
  duration: number;
  venue: string;
  type: string;
  syllabus: string;
  createdBy: string;
}) {
  await addDoc(col('exams'), {
    ...data,
    date: Timestamp.fromDate(data.date),
    createdAt: ts(),
  });
}

export function subscribeExams(callback: (exams: DocumentData[]) => void): Unsubscribe {
  const q = query(col('exams'), orderBy('date', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── ANNOUNCEMENTS ──────────────────────────────────────
export async function createAnnouncement(data: {
  title: string;
  content: string;
  priority: string;
  category: string;
  authorId: string;
  authorName: string;
}) {
  await addDoc(col('announcements'), {
    ...data,
    attachments: [],
    readBy: [],
    createdAt: ts(),
  });
}

export function subscribeAnnouncements(callback: (anns: DocumentData[]) => void): Unsubscribe {
  const q = query(col('announcements'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── FILES (metadata only — actual files on Google Drive) ─
export async function createFileRecord(data: {
  fileId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  driveUrl: string;
  thumbnailUrl: string;
  category: string;
  subject: string;
  semester: number;
  uploadedBy: string;
  uploaderName: string;
}) {
  await addDoc(col('files'), {
    ...data,
    downloads: 0,
    createdAt: ts(),
  });
}

export function subscribeFiles(callback: (files: DocumentData[]) => void): Unsubscribe {
  const q = query(col('files'), orderBy('createdAt', 'desc'), limit(100));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function incrementDownload(fileId: string) {
  await updateDoc(doc(db, 'files', fileId), { downloads: increment(1) });
}

// ─── QUESTION BANK ──────────────────────────────────────
export function subscribeQuestionBank(callback: (qb: DocumentData[]) => void): Unsubscribe {
  const q = query(col('questionBank'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

// ─── NOTIFICATIONS ──────────────────────────────────────
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body: string;
  link: string;
}) {
  await addDoc(col('notifications'), {
    ...data,
    read: false,
    createdAt: ts(),
  });
}

export function subscribeNotifications(userId: string, callback: (notifs: DocumentData[]) => void): Unsubscribe {
  const q = query(
    col('notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(30)
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }, (error) => {
    console.warn('Notifications query error (index may be building):', error.message);
    callback([]);
  });
}

export async function markNotifRead(notifId: string) {
  await updateDoc(doc(db, 'notifications', notifId), { read: true });
}

export async function markAllNotifsRead(userId: string) {
  const q = query(col('notifications'), where('userId', '==', userId), where('read', '==', false));
  const snap = await getDocs(q);
  const updates = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
}

// ─── SEED (run once for initial data) ───────────────────
export async function seedInitialData(adminUid: string, adminName: string) {
  // Check if already seeded
  const postsSnap = await getDocs(query(col('posts'), limit(1)));
  if (!postsSnap.empty) {
    console.log('Database already has data, skipping seed.');
    return false;
  }

  console.log('Seeding initial data...');

  // Sample announcements
  const announcements = [
    { title: 'Welcome to CampusHub! 🎉', content: 'Welcome to our college community platform. Feel free to post, chat, share files, and explore!', priority: 'high', category: 'General', authorId: adminUid, authorName: adminName },
    { title: 'Platform Guidelines', content: 'Please be respectful, share knowledge, and help each other. Report any issues to admins.', priority: 'medium', category: 'Rules', authorId: adminUid, authorName: adminName },
  ];
  for (const ann of announcements) {
    await createAnnouncement(ann);
  }

  // Sample post
  await createPost({
    authorId: adminUid,
    authorName: adminName,
    authorPhoto: '',
    content: 'Welcome to CampusHub! 🎓\n\nThis is the first post on our community platform. Share your thoughts, ask questions, and connect with your classmates.\n\nLet\'s build an amazing community together! 🚀',
    tags: ['Welcome', 'Community'],
  });

  // Sample exam
  await createExam({
    title: 'Sample Midterm Exam',
    subject: 'Computer Science',
    semester: 1,
    department: 'Computer Science',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    duration: 180,
    venue: 'Hall A',
    type: 'midterm',
    syllabus: 'All topics covered in class',
    createdBy: adminUid,
  });

  // Sample homework
  await createHomework({
    title: 'Getting Started Assignment',
    description: 'Introduce yourself in the community feed. Share your name, department, and interests.',
    subject: 'General',
    semester: 1,
    department: 'All',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdBy: adminUid,
    createdByName: adminName,
  });

  console.log('Seed complete!');
  return true;
}
