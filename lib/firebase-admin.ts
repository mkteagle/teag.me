import type * as admin from "firebase-admin";

let adminInstance: typeof admin | null = null;

async function getFirebaseAdmin() {
  if (!adminInstance) {
    adminInstance = await import("firebase-admin");
  }

  if (!adminInstance.apps.length) {
    try {
      adminInstance.initializeApp({
        credential: adminInstance.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
            /\\n/g,
            "\n"
          ),
        } as admin.ServiceAccount),
      });
      console.log("Firebase Admin initialized successfully");
    } catch (error) {
      console.error("Firebase Admin initialization error:", error);
      throw error;
    }
  }
  return adminInstance;
}

export async function getAdminAuth() {
  const admin = await getFirebaseAdmin();
  return admin.auth();
}
