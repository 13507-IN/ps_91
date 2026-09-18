import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK to verify ID tokens.
// We only need the projectId to verify tokens (it uses public certs).
if (getApps().length === 0) {
  initializeApp({
    projectId: 'ps91-e5e3d'
  });
}

export const admin = {
  auth: getAuth
};
