import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  getDocs,
  increment,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signOutUser = () => signOut(auth);
export const onUserChanged = (handler) => onAuthStateChanged(auth, handler);

export async function loadMyData(uid) {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists()
    ? snapshot.data()
    : { favoriteItems: [], favoriteMarkets: [], interests: [] };
}

export async function saveMyData(uid, data) {
  await setDoc(
    doc(db, 'users', uid),
    { ...data, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function fetchCommunityPosts() {
  const snapshot = await getDocs(query(collection(db, 'community_posts'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function createCommunityPost(post) {
  if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
  return addDoc(collection(db, 'community_posts'), {
    ...post,
    userId: auth.currentUser.uid,
    likes: 0,
    views: 0,
    likedBy: [],
    viewedBy: [],
    createdAt: serverTimestamp(),
  });
}

export async function removeCommunityPost(id) {
  await deleteDoc(doc(db, 'community_posts', id));
}

export async function updateCommunityPost(id, changes) {
  await updateDoc(doc(db, 'community_posts', id), changes);
}

export const addOneView = (id) => updateDoc(doc(db, 'community_posts', id), { views: increment(1) });

export async function toggleCommunityLike(post) {
  if (!auth.currentUser) throw new Error('로그인이 필요합니다.');
  const uid = auth.currentUser.uid;
  const likedBy = post.likedBy || [];
  const alreadyLiked = likedBy.includes(uid);
  await updateDoc(doc(db, 'community_posts', post.id), {
    likedBy: alreadyLiked ? arrayRemove(uid) : arrayUnion(uid),
    likes: increment(alreadyLiked ? -1 : 1),
  });
}
