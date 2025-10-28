
/**
 * @fileOverview Manages VIP passkey validation, usage, and activation.
 * WARNING: THIS IS A CLIENT-SIDE IMPLEMENTATION FOR DEMONSTRATION.
 * In a real-world production application, passkeys and VIP status
 * MUST be managed on a secure backend server with a database.
 * This implementation is purely for creating the user experience as requested.
 */
import { db } from './firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';

const PASSKEYS_COLLECTION = 'passkeys';
const USERS_COLLECTION = 'users';

interface VipInfo {
  type: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  activationDate: string;
  expiryDate: string | null; // null for lifetime
}

const passkeyPrefixes = {
  monthly: ['ab', 'cd', 'ef', 'gh', 'ij', 'kl', 'mn', 'op', 'qr', 'st', 'uv', 'wx', 'yz'],
  quarterly: ['A1', 'p6', 'Z9', 'j3', 'Q5', 'u2', 'H7', 'e4', 'R1', 'y9'],
  yearly: ['r8K', 'T5m', 'Fh9', 'yN6', 'D2v', 'zC7', 'Q1', 'V5p', 'fJ4', 'M8'],
  lifetime: ['vR7', 'jT8', 'Zx5', 'dK3', 'Mz9', 'aH2', 'Cq7', 'eR4', 'Yg1', 'fD6']
};

function getPasskeyType(passkey: string): VipInfo['type'] | null {
  for (const [type, prefixes] of Object.entries(passkeyPrefixes)) {
    for (const prefix of prefixes) {
      if (passkey.toLowerCase().startsWith(prefix.toLowerCase())) {
        return type as VipInfo['type'];
      }
    }
  }
  // Simplified check for demonstration. A real system would have a more robust validation method.
  if (passkey.length > 15) return 'lifetime';
  if (passkey.length > 10) return 'yearly';
  if (passkey.length > 8) return 'quarterly';
  if (passkey.length > 4) return 'monthly';

  return null;
}

function calculateExpiry(type: VipInfo['type'], activationDate: Date): Date | null {
  const expiry = new Date(activationDate);
  switch (type) {
    case 'monthly':
      expiry.setMonth(expiry.getMonth() + 1);
      return expiry;
    case 'quarterly':
      expiry.setMonth(expiry.getMonth() + 3);
      return expiry;
    case 'yearly':
      expiry.setFullYear(expiry.getFullYear() + 1);
      return expiry;
    case 'lifetime':
      return null;
    default:
      return null;
  }
}

export async function validateAndUsePasskey(userId: string, passkey: string): Promise<{ success: boolean; type?: VipInfo['type']; message: string }> {
  const passkeyType = getPasskeyType(passkey);
  
  if (!passkeyType) {
    return { success: false, message: 'Invalid passkey format.' };
  }

  const passkeyDocRef = doc(db, PASSKEYS_COLLECTION, passkey);
  const passkeyDoc = await getDoc(passkeyDocRef);

  if (passkeyDoc.exists() && passkeyDoc.data().used) {
    return { success: false, message: 'This passkey has already been used.' };
  }

  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const activationDate = new Date();
  const expiryDate = calculateExpiry(passkeyType, activationDate);

  const batch = writeBatch(db);

  // Mark passkey as used
  batch.set(passkeyDocRef, { used: true, usedBy: userId, usedAt: activationDate.toISOString() });
  
  // Update user's VIP status
  batch.update(userDocRef, {
    vipStatus: passkeyType,
    vipActivationDate: activationDate.toISOString(),
    vipExpiry: expiryDate ? expiryDate.toISOString() : null,
  });

  try {
    await batch.commit();
    return { success: true, type: passkeyType, message: `Successfully activated ${passkeyType} VIP access!` };
  } catch (error) {
    console.error("Error activating passkey:", error);
    return { success: false, message: 'An error occurred while activating the passkey.' };
  }
}
