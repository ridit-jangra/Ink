import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "./firebase";
import { AuthService } from "./authService";

export const db = getFirestore(app);

type StorageKey = string;

interface StorageValue<T> {
  data: T;
  timestamp: number;
}

export class Storage {
  private static async getUser() {
    const user = await AuthService.getCurrentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }
    return user;
  }

  private static isLocalUser(email?: string | null) {
    return !!email && email.endsWith("@ink.local");
  }

  private static sanitizeData<T>(data: T): T {
    if (data === null || data === undefined) return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item)) as T;
    }

    if (typeof data === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized as T;
    }

    return data;
  }

  private static localKey(collectionName: string, userId: string, key: string) {
    return `${collectionName}:${userId}:${key}`;
  }

  static async setItem<T>(
    collectionName: string,
    key: StorageKey,
    value: T,
  ): Promise<void> {
    try {
      const user = await this.getUser();
      const sanitizedValue = this.sanitizeData(value);

      const storageValue: StorageValue<T> = {
        data: sanitizedValue,
        timestamp: Date.now(),
      };

      if (this.isLocalUser(user.email)) {
        const fullKey = this.localKey(collectionName, user.id, key);
        localStorage.setItem(fullKey, JSON.stringify(storageValue));
        return;
      }

      const docRef = doc(db, collectionName, user.id, "items", key);
      await setDoc(docRef, storageValue);
    } catch (e) {
      console.error(`Error storing data in ${collectionName}:`, e);
      throw e;
    }
  }

  static async getItem<T>(
    collectionName: string,
    key: StorageKey,
    defaultValue?: T,
  ): Promise<T | null> {
    try {
      const user = await this.getUser();

      if (this.isLocalUser(user.email)) {
        const fullKey = this.localKey(collectionName, user.id, key);
        const raw = localStorage.getItem(fullKey);
        if (!raw) return defaultValue ?? null;

        const parsed = JSON.parse(raw) as StorageValue<T>;
        return parsed.data;
      }

      const docRef = doc(db, collectionName, user.id, "items", key);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return defaultValue ?? null;
      }

      const parsed = docSnap.data() as StorageValue<T>;
      return parsed.data;
    } catch (e) {
      console.error(`Error retrieving data from ${collectionName}:`, e);
      return defaultValue ?? null;
    }
  }

  static async removeItem(
    collectionName: string,
    key: StorageKey,
  ): Promise<void> {
    try {
      const user = await this.getUser();

      if (this.isLocalUser(user.email)) {
        const fullKey = this.localKey(collectionName, user.id, key);
        localStorage.removeItem(fullKey);
        return;
      }

      const docRef = doc(db, collectionName, user.id, "items", key);
      await deleteDoc(docRef);
    } catch (e) {
      console.error(`Error removing data from ${collectionName}:`, e);
      throw e;
    }
  }

  static async getUserInfo() {
    return await AuthService.getCurrentUser();
  }
}
