/**
 * ArthSetu — Offline Storage Utility
 * Uses IndexedDB (with localStorage fallback) to store cached reports and wizard drafts.
 */

import type { FeasibilityReport, WizardDraft } from '@/types';

const DB_NAME = 'arthsetu_offline_db';
const DB_VERSION = 1;
const STORE_REPORTS = 'feasibility_reports';
const STORE_DRAFTS = 'wizard_drafts';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        db.createObjectStore(STORE_REPORTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
        db.createObjectStore(STORE_DRAFTS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ── Reports Storage ──

export async function saveReportOffline(report: FeasibilityReport): Promise<void> {
  if (!report || !report.id) return;
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);
    store.put({ ...report, savedAt: new Date().toISOString() });
  } catch (err) {
    // Fallback to localStorage
    try {
      localStorage.setItem(`offline_report_${report.id}`, JSON.stringify(report));
    } catch {
      console.warn('Failed to save report offline:', err);
    }
  }
}

export async function getReportOffline(id: string): Promise<FeasibilityReport | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_REPORTS, 'readonly');
      const store = tx.objectStore(STORE_REPORTS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(`offline_report_${id}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export async function listCachedReports(): Promise<Array<{ id: string; idea: string; category: string; savedAt: string }>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_REPORTS, 'readonly');
      const store = tx.objectStore(STORE_REPORTS);
      const request = store.getAll();

      request.onsuccess = () => {
        const reports = (request.result || []) as Array<FeasibilityReport & { savedAt?: string }>;
        resolve(
          reports.map((r) => ({
            id: r.id as string,
            idea: r.businessIdea,
            category: r.businessCategory,
            savedAt: r.savedAt || r.createdAt,
          })),
        );
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

// ── Wizard Draft Storage ──

export async function saveDraftOffline(draft: WizardDraft): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, 'readwrite');
    const store = tx.objectStore(STORE_DRAFTS);
    store.put({ key: 'current_wizard_draft', draft, updatedAt: new Date().toISOString() });
  } catch {
    try {
      localStorage.setItem('offline_wizard_draft', JSON.stringify(draft));
    } catch (err) {
      console.warn('Failed to save wizard draft offline:', err);
    }
  }
}

export async function getDraftOffline(): Promise<WizardDraft | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_DRAFTS, 'readonly');
      const store = tx.objectStore(STORE_DRAFTS);
      const request = store.get('current_wizard_draft');

      request.onsuccess = () => {
        resolve(request.result ? (request.result.draft as WizardDraft) : null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    try {
      const raw = localStorage.getItem('offline_wizard_draft');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

export async function clearDraftOffline(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_DRAFTS, 'readwrite');
    const store = tx.objectStore(STORE_DRAFTS);
    store.delete('current_wizard_draft');
  } catch {
    localStorage.removeItem('offline_wizard_draft');
  }
}
