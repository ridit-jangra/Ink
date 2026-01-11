export class Storage {
  static storageKey = "ink_app_storage";

  static getItem<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    return JSON.parse(
      localStorage.getItem(`${this.storageKey}_${key}`) || "null"
    );
  }

  static setItem<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`${this.storageKey}_${key}`, JSON.stringify(value));
  }

  static removeItem(key: string): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(`${this.storageKey}_${key}`);
  }
}
