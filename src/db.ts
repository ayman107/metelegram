import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;
if (serviceAccountVar) {
  try {
    const serviceAccount = JSON.parse(serviceAccountVar);
    initializeApp({
      credential: cert(serviceAccount)
    });
  } catch (e: any) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', e.message);
    initializeApp(); // Fallback to environment default/file
  }
} else {
  initializeApp(); // Use GOOGLE_APPLICATION_CREDENTIALS file path if present
}

const db = getFirestore();

export async function addMessage(userId: string, role: string, content: string) {
  const docRef = db.collection('users').doc(userId).collection('messages').doc();
  await docRef.set({
    role,
    content,
    timestamp: new Date()
  });
}

export async function getHistory(userId: string, limit = 20) {
  const snapshot = await db.collection('users')
    .doc(userId)
    .collection('messages')
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  
  const rows = snapshot.docs.map(doc => doc.data() as { role: string, content: string });
  return rows.reverse();
}
