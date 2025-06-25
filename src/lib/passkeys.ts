/**
 * @fileOverview Manages VIP passkey validation, usage, and activation.
 * WARNING: THIS IS A CLIENT-SIDE IMPLEMENTATION FOR DEMONSTRATION.
 * In a real-world production application, passkeys and VIP status
 * MUST be managed on a secure backend server with a database.
 * Storing passkeys on the client is insecure as they can be extracted
 * from the application's source code. This implementation is purely
 * for creating the user experience as requested.
 */

const PASSKEYS_STORAGE_KEY = 'petedianoProUsedPasskeys';
const VIP_INFO_KEY = 'petedianoProVipInfo';

interface VipInfo {
  passkey: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  activationDate: string;
  expiryDate: string | null; // null for lifetime
}

const passkeys = {
  monthly: [
    'aB3!Xq', 'cD4@Yr', 'eF5#Zs', 'gH6$At', 'iJ7%Bu', 'kL8^Cv', 'mN9&Dw', 'oP0*Ex', 'qR1!Fy', 'sT2@Gz',
    'uV3#Ha', 'wX4$Ib', 'yZ5%Jc', 'bC6^Kd', 'dE7&Le', 'fG8*Mf', 'hI9!Ng', 'jK0@Oh', 'lM1#Pi', 'nO2$Qj',
    'pQ3%Rk', 'rS4^Tl', 'tU5&Um', 'vW6*Vn', 'xY7!Wo', 'zA8@Xp', 'cB9#Yq', 'eD0$Zr', 'gF1%As', 'iH2^Bt',
    'kJ3&Co', 'mL4*Dp', 'oN5!Eq', 'qP6@Fr', 'sR7#Gt', 'uT8$Hu', 'wV9%Iv', 'yX0^Jw', 'aZ1&Ka', 'cB2*Lb',
    'eD3!Mc', 'gF4@Nd', 'iH5#Oe', 'kJ6$Pf', 'mL7%Qg', 'oN8^Rh', 'qP9&Si', 'sR0*Ti', 'uT1!Uj', 'X3#Wl',
    'aZ4$Xm', 'cB5%Yn', 'eD6^Zo', 'gF7&Ap', 'iH8*Bq', 'kJ9!Cr', 'mL0@Ds', 'oN1#Et', 'qP2$Fu', 'sR3%Gv',
    'uT4^Hw', 'wV5&Ix', 'yX6*Jy', 'aZ7!Kz', 'cB8@La', 'eD9#Mb', 'gF0$Nc', 'iH1%Od', 'kJ2^Pe', 'mL3&Qf',
    'oN4*Rg', 'qP5!Sh', 'sR6@Ti', 'uT7#Uj', 'wV8$Vk', 'yX9%Wl', 'aZ0^Xm', 'cB1&Yn', 'eD2*Zo', 'gF3!Ap',
    'iH4@Bq', 'kJ5#Cr', 'mL6$Ds', 'oN7%Et', 'qP8^Fu', 'sR9&Gv', 'uT0*Hw', 'wV1!Ix', 'yX2@Jy', 'aZ3#Kz',
    'cB4$La', 'eD5%Mb', 'gF6^Nc', 'iH7&Od', 'kJ8*Pe', 'mL9!Qf', 'oN0@Rg', 'qP1#Sh', 'sR2$Ti'
  ],
  quarterly: [
    'A1#dG7!kR9', 'p6&Yh3@Tq2', 'Z9!mF2#rW4', 'j3%Kx8^Lp1', 'Q5$bN4&yV7', 'u2@Tg6!wJ8', 'H7^cR3#oM5', 'e4&Zx9@qP6', 'R1#fL8!nS3', 'y9%Hw2^kJ7',
    'B2@pV5#eN8', 't6$Lg3^yZ1', 'X8!jM4&uR2', 'k1%Yw7#oT5', 'N3^cF9!rQ6', 'v4&Gh2@pZ7', 'S5#dK8!mW1', 'h2$Qx6^jV4', 'L9!bT3&nX5', 'z7%Hk1#uR6',
    'C4@fV8!oP2', 'm3$Lx9^yJ5', 'Z1!dG6&hK7', 'p8#Yt2^wM3', 'Q6@rB4!eL9', 'u5$Tg1&nZ8', 'H2%jR7!oX4', 'e9#Lz3^qP6', 'R8@fK5!nS2', 'y1$Hw4^kJ7',
    'B7!pV2#eN9', 't5&Lg8@yZ3', 'X2#jM6!uR9', 'k4$Yw1^oT8', 'N8%cF3!rQ2', 'v1@Gh7#pZ5', 'S9&dK2!mW6', 'h4$Qx8^jV3', 'L6!bT9#nX1', 'z3%Hk5!uR7',
    'C1#fV7@oP4', 'm9$Lx2^yJ8', 'Z3!dG5#hK1', 'p7&Yt9@wM2', 'Q2#rB8!eL6', 'u9$Tg3^nZ1', 'H1!jR4#oX8', 'e6%Lz2!qP9', 'R5@fK1&nS7', 'y3#Hw7^kJ2',
    'B9!pV6#eN1', 't1$Lg5^yZ4', 'X3@jM7&uR6', 'k9%Yw2#oT1', 'N4!cF8@rQ3', 'v8$Gh5^pZ2', 'S2#dK1!mW9', 'h7&Qx3!jV6', 'L1$bT4^nX8', 'z5%Hk9#uR1',
    'C6@fV3!oP9', 'm1$Lx8^yJ2', 'Z2!dG1#hK5', 'p9&Yt4^wM6', 'Q3#rB2!eL7', 'u6@Tg1#nZ5', 'H2$jR9^oX3', 'e1!Lz6#qP8', 'R7%fK3!nS4', 'y2$Hw5^kJ9',
    'B8@pV1!eN3', 't4#Lg2^yZ7', 'X6!jM8#uR1', 'k2$Yw5^oT9', 'N1%cF7!rQ4', 'v3&Gh4^pZ6', 'S5@dK9!mW2', 'h8#Qx1^jV4', 'L2!bT6#nX3', 'z4$Hk1^uR8',
    'C9%fV5#oP1', 'm2@Lx7!yJ4', 'Z4!dG8#hK2', 'p3$Yt1^wM5', 'Q1%rB6!eL8', 'u8#Tg4@nZ2', 'H3!jR1#oX6', 'e7$Lz9^qP1', 'R2%fK5!nS8', 'y5#Hw1^kJ4',
    'B4@pV9!eN2', 't9$Lg6^yZ1', 'X1!jM2#uR7', 'k5%Yw3!oT2', 'N7#cF1^rQ5', 'v6$Gh2#pZ9', 'S3!dK8^mW1', 'h5@Qx7#jV2', 'L9$dT4^nX1', 'z1!Hk8#uR3'
  ],
  yearly: [
    'r8K#q9U!Dv2pL?Z', 'T5m^Jw7@nY3xRd4', '!Fh9Lp3#Gv8Rz2M', 'yN6$kQh4&Xb7Vj1', 'D2v#Rj9!Sx5Pq8A', 'zC7@Lm5^Gh2Xn4Y', 'Q1#wTg8!Vz3Kr9U', 'V5p$Kj2^Nb7Hx4F', 'fJ4!Lp6#Yt3Zq8W', 'M8$Qr2@Tb5Zn7Xj',
    'H3^Px9!Kv6Gj2Zm', 'wZ7#Rf5$Ty2Nv9L', 'cV6!Yj4^Km8Gx3Q', 'B2@Lh7#Np9Dg5Xw', 'uT5#Qv1!Pj8Kr4Z', 'S9$Xn3^Jm7Pb2Yg', 'dF4!Kh8#Vz5Rt1Q', 'G2^Jq6@Lp9Xn3Ws', 'yP7!Vb4#Nc2Tz8M', 'K5@Hz1$Wq3Tv7Jn',
    'rX2#Wp8!Zd5Yk3N', 'T6$Jg4^Mn9Px1Vk', '!Fh3Lp7#Gv2Rz9M', 'yN2$kQh9&Xb4Vj7', 'D6v#Rj3!Sx8Pq2A', 'zC1@Lm7^Gh5Xn3Y', 'Q8#wTg2!Vz6Kr1U', 'V5p$Kj9^Nb3Hx7F', 'fJ2!Lp8#Yt6Zq4W', 'M3$Qr9@Tb1Zn8Xj',
    'H7^Px4!Kv2Gj9Zm', 'wZ1#Rf8$Ty3Nv6L', 'cV9!Yj2^Km5Gx7Q', 'B4@Lh8#Np1Dg6Xw', 'uT2#Qv9!Pj4Kr6Z', 'S1$Xn7^Jm4Pb9Yg', 'dF2!Kh5#Vz7Rt3Q', 'G4^Jq1@Lp6Xn8Ws', 'yP1!Vb7#Nc4Tz5M', 'K2@Hz9$Wq8Tv3Jn',
    'rX7#Wp2!Zd1Yk5N', 'T8$Jg1^Mn4Px9Vk', '!Fh6Lp4#Gv1Rz3M', 'yN5$kQh2&Xb8Vj6', 'D9v#Rj1!Sx4Pq7A', 'zC5@Lm2^Gh6Xn8Y', 'Q3#wTg9!Vz1Kr5U', 'V1p$Kj4^Nb6Hx2F', 'fJ7!Lp2#Yt5Zq1W', 'M6$Qr1@Tb4Zn9Xj',
    'H2^Px8!Kv4Gj6Zm', 'wZ3#Rf1$Ty9Nv5L', 'cV8!Yj6^Km1Gx2Q', 'B9@Lh3#Np5Dg1Xw', 'uT6#Qv2!Pj9Kr8Z', 'S3$Xn1^Jm5Pb7Yg', 'dF8!Kh2#Vz4Rt9Q', 'G5^Jq7@Lp1Xn6Ws', 'yP3!Vb8#Nc1Tz2M', 'K4@Hz7$Wq2Tv9Jn',
    'rX1#Wp4!Zd8Yk2N', 'T2$Jg9^Mn1Px6Vk', '!Fh8Lp2#Gv6Rz5M', 'yN4$kQh7&Xb1Vj2', 'D1v#Rj8!Sx6Pq3A', 'zC6@Lm3^Gh1Xn7Y', 'Q2#wTg5!Vz9Kr4U', 'V4p$Kj1^Nb8Hx3F', 'fJ3!Lp9#Yt1Zq6W', 'M1$Qr6@Tb2Zn5Xj',
    'H4^Px2!Kv9Gj8Zm', 'wZ5#Rf9$Ty1Nv3L', 'cV2!Yj7^Km9Gx1Q', 'B1@Lh9#Np2Dg7Xw', 'uT8#Qv3!Pj1Kr2Z', 'S5$Xn2^Jm9Pb4Yg', 'dF1!Kh7#Vz6Rt4Q', 'G9^Jq4@Lp2Xn1Ws', 'yP2!Vb9#Nc7Tz1M', 'K1@Hz6$Wq7Tv8Jn',
    'rX3#Wp5!Zd2Yk9N', 'T4$Jg2^Mn8Px1Vk', '!Fh1Lp6#Gv7Rz8M', 'yN7$kQh5&Xb2Vj1', 'D3v#Rj6!Sx1Pq9A', 'zC8@Lm4^Gh9Xn2Y', 'Q6#wTg1!Vz2Kr8U', 'V3p$Kj7^Nb1Hx5F', 'fJ9!Lp1#Yt2Zq7W', 'M2$Qr5@Tb7Zn1Xj',
    'H1^Px6!Kv8Gj4Zm', 'wZ9#Rf2$Ty5Nv1L', 'cV3!Yj8^Km1Gx5Q', 'B2@Lh5#Np7Dg1Xw', 'uT9#Qv4!Pj1Kr3Z', 'S6$Xn3^Jm1Pb8Yg', 'dF7!Kh1#Vz2Rt6Q', 'G8^Jq3@Lp4Xn1Ws', 'yP5!Vb2#Nc1Tz7M', 'K7@Hz2$Wq1Tv3Jn'
  ],
  lifetime: [
    'vR7#Bk9@PzQ2!LmX5yGh', 'jT8$Qh4^FpZ1&GnD6rSt', 'Zx5&Lp2@VnQ3#HgJ8kFm', 'dK3!Jq6%UbT8^SrW1yNp', 'Mz9#Yr5$FpL2@GvX7dQw', 'aH2%Jk8&BmN4!RtZ6pWx', 'Cq7^Vb3#LpD5@YfH1gKx', 'eR4!Xy9%PtZ6^JwM2bLn', 'Yg1@Zm8#QwR5!VxL7kPj', 'fD6$Bc3&NqT2^SjY9hWr',
    'Uv5^Kg1#Lp2@ZxD8yHmF', 'nT3!Qp6%RdX9^HzW4gJb', 'Bc9#Fv2@LpD4!YtX6kZg', 'dQ8%Hm5&NjR1^VzG3yWp', 'Sn2^Zv4#WxD7@LpB9kQm', 'eT6!Ry3%PfB9^JxM2gLn', 'Xy7@Hg2#Lp8!QwVk1dZm', 'aD3%Jn5&BqT4^SrY9hWx', 'Cv1^Lp6#Dz2@HgX7bMfQ', 'fM4!Xr8%PtZ9^JwN2kGb',
    'Gz5#Tp2@Lc4!YvQ7kDhM', 'hK6%Bj8&Nr3^TwZ1gXpF', 'Uy1^Kg3#Pq5@LdX9yFmH', 'nR4!Qy7%Pd8^HzW2kJbT', 'Bd9#Lv2@Pk4!YxQ6jZmR', 'dQ7%Hd5&Bn1^VrG3kWpY', 'Sk2^Zv4#Wp6@LxB8gQmF', 'eT3!Ry9%Pf1^JxM5gLnK', 'Xy8@Hg5#Lp2!QwVk1dZm', 'aD1%Jn9&Bq3^SrY5hWxT',
    'Cv7^Lp2#Dz8@HgX4bMfQ', 'fM9!Xr3%Pt7^JwN2kGbL', 'Gz1#Tp8@Lc3!YvQ5kDhM', 'hK4%Bj6&Nr2^TwZ7gXpF', 'Uy9^Kg5#Pq1@LdX3yFmH', 'nR8!Qy2%Pd4^HzW6kJbT', 'Bd1#Lv7@Pk3!YxQ9jZmR', 'dQ2%Hd8&Bn4^VrG6kWpY', 'Sk5^Zv1#Wp7@LxB3gQmF', 'eT9!Ry4%Pf2^JxM6gLnK',
    'Xy1@Hg9#Lp8!QwVk2dZm', 'aD5%Jn3&Bq7^SrY1hWxT', 'Cv4^Lp9#Dz6@HgX2bMfQ', 'fM1!Xr7%Pt5^JwN3kGbL', 'Gz8#Tp1@Lc5!YvQ3kDhM', 'hK2%Bj4&Nr6^TwZ8gXpF', 'Uy7^Kg2#Pq9@LdX1yFmH', 'nR5!Qy3%Pd1^HzW4kJbT', 'Bd2#Lv3@Pk9!YxQ6jZmR', 'dQ6%Hd1&Bn8^VrG2kWpY',
    'Sk4^Zv8#Wp2@LxB9gQmF', 'eT7!Ry1%Pf3^JxM4gLnK', 'Xy3@Hg6#Lp1!QwVk9dZm', 'aD9%Jn2&Bq5^SrY8hWxT', 'Cv2^Lp7#Dz3@HgX6bMfQ', 'fM8!Xr1%Pt4^JwN5kGbL', 'Gz2#Tp5@Lc1!YvQ8kDhM', 'hK9%Bj3&Nr7^TwZ2gXpF', 'Uy4^Kg8#Pq6@LdX1yFmH', 'nR1!Qy5%Pd3^HzW7kJbT',
    'Bd3#Lv6@Pk2!YxQ7jZmR', 'dQ1%Hd5&Bn9^VrG4kWpY', 'Sk8^Zv3#Wp1@LxB5gQmF', 'eT2!Ry6%Pf8^JxM9gLnK', 'Xy2@Hg4#Lp3!QwVk8dZm', 'aD6%Jn1&Bq8^SrY2hWxT', 'Cv1^Lp5#Dz4@HgX9bMfQ', 'fM7!Xr2%Pt6^JwN1kGbL', 'Gz3#Tp7@Lc4!YvQ2kDhM', 'hK1%Bj9&Nr5^TwZ3gXpF',
    'Uy6^Kg1#Pq8@LdX2yFmH', 'nR2!Qy8%Pd6^HzW3kJbT', 'Bd4#Lv1@Pk5!YxQ2jZmR', 'dQ9%Hd2&Bn6^VrG1kWpY', 'Sk1^Zv9#Wp4@LxB2gQmF', 'eT5!Ry2%Pf7^JxM8gLnK', 'Xy4@Hg1#Lp5!QwVk3dZm', 'aD7%Jn2&Bq1^SrY4hWxT', 'Cv3^Lp6#Dz1@HgX5bMfQ', 'fM2!Xr9%Pt8^JwN7kGbL',
    'Gz4#Tp1@Lc6!YvQ3kDhM', 'hK5%Bj2&Nr1^TwZ6gXpF', 'Uy3^Kg7#Pq1@LdX4yFmH', 'nR6!Qy1%Pd5^HzW8kJbT', 'Bd5#Lv1@Pk6!YxQ3jZmR', 'dQ3%Hd1&Bn7^VrG2kWpY', 'Sk6^Zv1#Wp4@LxB3gQmF', 'eT1!Ry7%Pf5^JxM2gLnK', 'Xy5@Hg1#Lp6!QwVk3dZm', 'aD1%Jn8&Bq2^SrY4hWxT',
    'Cv6^Lp1#Dz3@HgX4bMfQ', 'fM3!Xr5%Pt7^JwN1kGbL', 'Gz5#Tp1@Lc3!YvQ2kDhM', 'hK3%Bj1&Nr4^TwZ5gXpF', 'Uy2^Kg9#Pq1@LdX3yFmH', 'nR4!Qy1%Pd3^HzW5kJbT', 'Bd6#Lv1@Pk2!YxQ3jZmR', 'dQ4%Hd1&Bn5^VrG6kWpY', 'Sk7^Zv1#Wp2@LxB3gQmF', 'eT1!Ry8%Pf4^JxM5gLnK'
  ]
};

function getUsedPasskeys(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(PASSKEYS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading used passkeys from localStorage:", error);
    return [];
  }
}

function addUsedPasskey(passkey: string): void {
  if (typeof window === 'undefined') return;
  try {
    const used = getUsedPasskeys();
    used.push(passkey);
    localStorage.setItem(PASSKEYS_STORAGE_KEY, JSON.stringify(used));
  } catch (error) {
    console.error("Error saving used passkey to localStorage:", error);
  }
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

export function validateAndUsePasskey(passkey: string): { success: boolean; type?: VipInfo['type']; message: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'Cannot validate passkey on the server.' };
  }

  const usedPasskeys = getUsedPasskeys();
  if (usedPasskeys.includes(passkey)) {
    return { success: false, message: 'This passkey has already been used.' };
  }

  let type: VipInfo['type'] | null = null;
  if (passkeys.monthly.includes(passkey)) type = 'monthly';
  else if (passkeys.quarterly.includes(passkey)) type = 'quarterly';
  else if (passkeys.yearly.includes(passkey)) type = 'yearly';
  else if (passkeys.lifetime.includes(passkey)) type = 'lifetime';

  if (type) {
    const activationDate = new Date();
    const expiryDate = calculateExpiry(type, activationDate);

    const vipInfo: VipInfo = {
      passkey,
      type,
      activationDate: activationDate.toISOString(),
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
    };

    localStorage.setItem(VIP_INFO_KEY, JSON.stringify(vipInfo));
    addUsedPasskey(passkey);

    return { success: true, type, message: `Successfully activated ${type} VIP access!` };
  }

  return { success: false, message: 'Invalid passkey.' };
}
