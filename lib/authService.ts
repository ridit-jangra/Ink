import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./storage";
import { User } from "./types";

// Temporary registration data stored in memory (or use sessionStorage for persistence)
interface PendingRegistration {
  name: string;
  email: string;
  password: string;
  gender: "Female" | "Male";
  otp: string;
  otpExpiry: Date;
}

export class AuthService {
  private static CURRENT_USER_KEY = "ink_current_user";
  private static USER_ID_KEY = "ink_user_id";
  private static PENDING_REGISTRATION_KEY = "ink_pending_registration";

  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async initiateRegistration(
    name: string,
    email: string,
    password: string,
    gender: "Female" | "Male"
  ): Promise<{ success: boolean; message: string }> {
    try {
      const collectionPath = "accounts/users/data";
      const accountsRef = collection(db, collectionPath);
      const q = query(accountsRef, where("email", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        throw new Error("An account with this email already exists");
      }

      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      const pendingData: PendingRegistration = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        gender: gender,
        otp: otp,
        otpExpiry: otpExpiry,
      };

      sessionStorage.setItem(
        this.PENDING_REGISTRATION_KEY,
        JSON.stringify(pendingData)
      );

      try {
        await fetch("/api/otp/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });
      } catch (emailError) {
        console.warn("Email send failed (dev mode continues):", emailError);

        localStorage.setItem(`otp_${email}`, otp);
        console.log("✅ OTP Generated:", otp);
      }

      return {
        success: true,
        message: "OTP sent to your email",
      };
    } catch (error) {
      console.error("Registration initiation error:", error);
      throw error;
    }
  }

  static async verifyOTPAndCreateAccount(
    email: string,
    otp: string
  ): Promise<User> {
    try {
      const pendingDataStr = sessionStorage.getItem(
        this.PENDING_REGISTRATION_KEY
      );

      if (!pendingDataStr) {
        throw new Error("Registration session expired. Please sign up again.");
      }

      const pendingData: PendingRegistration = JSON.parse(pendingDataStr);

      if (pendingData.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error("Email mismatch. Please sign up again.");
      }

      if (pendingData.otp !== otp) {
        throw new Error("Invalid OTP");
      }

      if (new Date() > new Date(pendingData.otpExpiry)) {
        sessionStorage.removeItem(this.PENDING_REGISTRATION_KEY);
        throw new Error("OTP expired. Please sign up again.");
      }

      const collectionPath = "accounts/users/data";
      const userId = `user_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const userData: User = {
        name: pendingData.name,
        email: pendingData.email,
        password: pendingData.password,
        gender: pendingData.gender,
        id: userId,
        isVerified: true,
      };

      const userDocRef = doc(db, collectionPath, userId);
      await setDoc(userDocRef, userData);

      sessionStorage.removeItem(this.PENDING_REGISTRATION_KEY);

      localStorage.setItem(this.USER_ID_KEY, userId);

      return userData;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  }

  static async resendRegistrationOTP(email: string): Promise<string> {
    const pendingDataStr = sessionStorage.getItem(
      this.PENDING_REGISTRATION_KEY
    );

    if (!pendingDataStr) {
      throw new Error("Registration session expired. Please sign up again.");
    }

    const pendingData: PendingRegistration = JSON.parse(pendingDataStr);

    if (pendingData.email.toLowerCase() !== email.toLowerCase()) {
      throw new Error("Email mismatch. Please sign up again.");
    }

    const newOtp = this.generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    pendingData.otp = newOtp;
    pendingData.otpExpiry = otpExpiry;

    sessionStorage.setItem(
      this.PENDING_REGISTRATION_KEY,
      JSON.stringify(pendingData)
    );

    await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: newOtp }),
    });

    localStorage.setItem(`otp_${email}`, newOtp);
    console.log("✅ New OTP Generated:", newOtp);

    return newOtp;
  }

  static async login(email: string, password: string): Promise<User> {
    try {
      const collectionPath = "accounts/users/data";

      const accountsRef = collection(db, collectionPath);
      const q = query(accountsRef, where("email", "==", email.toLowerCase()));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Invalid email or password");
      }

      const accountDoc = querySnapshot.docs[0];
      const accountData = accountDoc.data();

      if (accountData.password !== password) {
        throw new Error("Invalid email or password");
      }

      const user: User = {
        name: accountData.name,
        email: accountData.email,
        password: accountData.password,
        gender: accountData.gender,
        id: accountData.id,
      };

      localStorage.setItem(this.USER_ID_KEY, accountDoc.id);

      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userId = localStorage.getItem(this.USER_ID_KEY);

      if (!userId) {
        return null;
      }

      const collectionPath = "accounts/users/data";

      const userDocRef = doc(db, collectionPath, userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        this.logout();
        return null;
      }

      const userData = userDocSnap.data();

      const user: User = {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        gender: userData.gender,
        id: userData.id,
      };

      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const userId = localStorage.getItem(this.USER_ID_KEY);
    return !!userId;
  }

  static getUserId(): string | null {
    return localStorage.getItem(this.USER_ID_KEY);
  }

  static logout(): void {
    localStorage.removeItem(this.USER_ID_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
    sessionStorage.removeItem(this.PENDING_REGISTRATION_KEY);
    window.location.reload();
  }

  static async refreshCurrentUser(): Promise<User | null> {
    return this.getCurrentUser();
  }

  static getPendingRegistrationEmail(): string | null {
    const pendingDataStr = sessionStorage.getItem(
      this.PENDING_REGISTRATION_KEY
    );
    if (!pendingDataStr) return null;

    try {
      const pendingData: PendingRegistration = JSON.parse(pendingDataStr);
      return pendingData.email;
    } catch {
      return null;
    }
  }
}
