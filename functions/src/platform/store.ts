import type { Firestore } from 'firebase-admin/firestore';

export interface Transaction {
  get(path: string): Promise<unknown>;
  set(path: string, value: Record<string, unknown>): void;
}
export interface Store {
  transact<T>(work: (transaction: Transaction) => Promise<T>): Promise<T>;
}
export function firestoreStore(database: Firestore): Store {
  return {
    transact: (work) =>
      database.runTransaction(async (transaction) =>
        work({
          get: async (path) => (await transaction.get(database.doc(path))).data(),
          set: (path, value) => {
            transaction.set(database.doc(path), value);
          },
        }),
      ),
  };
}
