import { cert, initializeApp } from "firebase-admin/app";
import { Firestore, getFirestore } from "firebase-admin/firestore";
import * as serviceAccount from "../../serviceAccountKey.json"; // Import JSON directly

const serviceAccountKey = serviceAccount as any;

initializeApp({
  credential: cert(serviceAccountKey),
});

export const db: Firestore = getFirestore();
