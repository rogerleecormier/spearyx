/**
 * Persistence layer for RACI Chart
 * Handles localStorage and IndexedDB operations
 */

import { RaciChart } from "@/types/raci";

const STORAGE_KEY = "raciChart";
const DB_NAME = "raciChartDB";
const STORE_NAME = "charts";

/**
 * Save chart to localStorage
 * Silently fails if quota exceeded (will try IndexedDB in useAutoSave)
 */
export function saveToLocalStorage(chart: RaciChart): void {
  try {
    const json = JSON.stringify(chart);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    // Quota exceeded or localStorage disabled
    // Silently fail - useAutoSave will try IndexedDB
    console.debug("localStorage save failed, will try IndexedDB");
  }
}

/**
 * Load chart from localStorage
 * Returns null if not found or version mismatch
 */
export function loadFromLocalStorage(): RaciChart | null {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    const chart = JSON.parse(json) as RaciChart;

    // Version check - discard if version mismatch
    if (chart.version !== "1.0.0" && chart.version !== "2.0.0") {
      console.warn("Stored chart version mismatch, discarding");
      return null;
    }

    return chart;
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return null;
  }
}

/**
 * Clear chart from localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
}

/**
 * Check available storage space in bytes
 */
export function getLocalStorageSize(): number {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  } catch (error) {
    return 0;
  }
}

/**
 * Initialize IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

/**
 * Save chart to IndexedDB
 */
export async function saveToIndexedDB(chart: RaciChart): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put({
        id: "current",
        chart: chart,
        savedAt: new Date().toISOString(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Failed to save to IndexedDB:", error);
    throw error;
  }
}

/**
 * Load chart from IndexedDB
 */
export async function loadFromIndexedDB(): Promise<RaciChart | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get("current");

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result?.chart) {
          resolve(result.chart);
        } else {
          resolve(null);
        }
      };
    });
  } catch (error) {
    console.error("Failed to load from IndexedDB:", error);
    return null;
  }
}

/**
 * Clear IndexedDB
 */
export async function clearIndexedDB(): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error("Failed to clear IndexedDB:", error);
  }
}
