import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

// 🔥 Your Firebase config via Vite env (make sure all are defined)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, // must be numeric string like "132456251367"
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Lazily get Messaging only if supported, and after SW is registered
let messagingCtxPromise;
const getMessagingContext = async () => {
  if (!messagingCtxPromise) {
    messagingCtxPromise = (async () => {
      const supported = await isSupported().catch(() => false);
      if (!supported) return null;

      if (!("serviceWorker" in navigator)) return null;

      // The path MUST match your deployed file location (root)
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const messaging = getMessaging(app);
      return { messaging, registration };
    })();
  }
  return messagingCtxPromise;
};

// ✅ Request the FCM token (call this from your app)
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("❌ Notification permission not granted.");
      return null;
    }

    const ctx = await getMessagingContext();
    if (!ctx) {
      console.warn("⚠️ FCM not supported in this browser/context.");
      return null;
    }

    const { messaging, registration } = ctx;

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ Current FCM token:", token);
      return token;
    }
    console.warn("⚠️ No FCM registration token available.");
    return null;
  } catch (err) {
    console.error("🔥 Error getting FCM token:", err);
    return null;
  }
};

// ✅ Foreground message listener
export const onMessageListener = async (callback) => {
  const ctx = await getMessagingContext();
  if (!ctx) return () => { }; // unsupported → no-op unsubscribe
  const { messaging } = ctx;
  return onMessage(messaging, callback);
};
    