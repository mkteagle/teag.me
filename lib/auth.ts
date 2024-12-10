import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export async function logout() {
  try {
    // Sign out from Firebase
    const response = await signOut(auth);

    // Clear local storage
    window.localStorage.removeItem("userId");

    // Redirect to login page
    window.location.href = "/auth/login";
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
