import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { createHandler } from './http.js';
import { localFanCatalog } from './domain/local-fan-catalog.js';
import { firebaseAuthenticator } from './platform/auth.js';
import { assertLocalRuntime, localAttestation } from './platform/local.js';
import { firestoreStore } from './platform/store.js';
import { createAccountService } from './service.js';

assertLocalRuntime(process.env);
const app = initializeApp({ projectId: 'demo-social-foundation' });
export const accountApi = onRequest(
  { region: 'us-central1', cors: false, maxInstances: 2 },
  createHandler(
    firebaseAuthenticator(getAuth(app)),
    localAttestation(process.env),
    createAccountService(firestoreStore(getFirestore(app)), Date.now, localFanCatalog),
    (event) => {
      console.info(JSON.stringify(event));
    },
  ),
);
