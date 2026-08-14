"use client";

const JOURNAL_PREFIX = "nivio:journal:v1:";
const WRAPPED_KEY_PREFIX = "nivio:journal:wrapped-key:v1:";
const SESSION_KEY_PREFIX = "nivio:journal:session-key:v1:";
const LEGACY_DEVICE_KEY_PREFIX = "nivio:journal:key:v1:";
const KEY_DERIVATION_ITERATIONS = 210000;

interface EncryptedJournalEnvelope {
  v: 1;
  alg: "AES-GCM";
  key: "account" | "device";
  iv: string;
  data: string;
}

interface WrappedJournalKeyEnvelope {
  v: 1;
  alg: "AES-GCM";
  kdf: "PBKDF2-SHA-256";
  iterations: number;
  salt: string;
  iv: string;
  data: string;
}

export interface JournalPayload {
  title: string;
  content: string;
}

export function isEncryptedJournalContent(value: string): boolean {
  return value.startsWith(JOURNAL_PREFIX);
}

export function getJournalEncryptionKeyType(value: string): "account" | "device" | null {
  if (!isEncryptedJournalContent(value)) return null;

  try {
    const envelope = JSON.parse(
      value.slice(JOURNAL_PREFIX.length)
    ) as Partial<EncryptedJournalEnvelope>;
    return envelope.key === "account" || envelope.key === "device" ? envelope.key : null;
  } catch {
    return null;
  }
}

export function hasUnlockedJournalKey(userId: string): boolean {
  return Boolean(sessionStorage.getItem(getSessionKeyName(userId)));
}

export async function unlockAccountJournalKey(
  userId: string,
  email: string,
  password: string,
  wrappedJournalKey?: string | null
): Promise<string> {
  if (wrappedJournalKey) {
    const rawKey = await unwrapJournalKey(email, password, wrappedJournalKey);
    sessionStorage.setItem(getSessionKeyName(userId), bytesToBase64(rawKey));
    return wrappedJournalKey;
  }

  const rawKey = crypto.getRandomValues(new Uint8Array(32));
  const wrappedKey = await wrapJournalKey(email, password, rawKey);
  sessionStorage.setItem(getSessionKeyName(userId), bytesToBase64(rawKey));
  return wrappedKey;
}

export function clearUnlockedJournalKey(userId: string): void {
  sessionStorage.removeItem(getSessionKeyName(userId));
}

export async function encryptJournalPayload(
  payload: JournalPayload,
  userId: string
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getUnlockedAccountJournalKey(userId);
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(plaintext)
  );

  const envelope: EncryptedJournalEnvelope = {
    v: 1,
    alg: "AES-GCM",
    key: "account",
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  };

  return `${JOURNAL_PREFIX}${JSON.stringify(envelope)}`;
}

export async function decryptJournalPayload(
  encryptedValue: string,
  userId: string
): Promise<JournalPayload> {
  if (!isEncryptedJournalContent(encryptedValue)) {
    throw new Error("Journal entry is not encrypted.");
  }

  try {
    const envelope = JSON.parse(
      encryptedValue.slice(JOURNAL_PREFIX.length)
    ) as EncryptedJournalEnvelope;

    if (envelope.v !== 1 || envelope.alg !== "AES-GCM") {
      throw new Error("Unsupported journal encryption format.");
    }

    const iv = base64ToBytes(envelope.iv);
    const data = base64ToBytes(envelope.data);
    const key =
      envelope.key === "device"
        ? await getLegacyDeviceJournalKey(userId)
        : await getUnlockedAccountJournalKey(userId);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(data)
    );

    return JSON.parse(new TextDecoder().decode(plaintext)) as JournalPayload;
  } catch (error) {
    throw new Error("Could not decrypt journal entry in this session.");
  }
}

async function wrapJournalKey(
  email: string,
  password: string,
  rawJournalKey: Uint8Array
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const wrappingKey = await derivePasswordKey(email, password, salt);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    wrappingKey,
    toArrayBuffer(rawJournalKey)
  );

  const envelope: WrappedJournalKeyEnvelope = {
    v: 1,
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA-256",
    iterations: KEY_DERIVATION_ITERATIONS,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(encryptedKey)),
  };

  return `${WRAPPED_KEY_PREFIX}${JSON.stringify(envelope)}`;
}

async function unwrapJournalKey(
  email: string,
  password: string,
  wrappedJournalKey: string
): Promise<Uint8Array> {
  if (!wrappedJournalKey.startsWith(WRAPPED_KEY_PREFIX)) {
    throw new Error("Unsupported journal key format.");
  }

  const envelope = JSON.parse(
    wrappedJournalKey.slice(WRAPPED_KEY_PREFIX.length)
  ) as WrappedJournalKeyEnvelope;
  const salt = base64ToBytes(envelope.salt);
  const iv = base64ToBytes(envelope.iv);
  const data = base64ToBytes(envelope.data);
  const wrappingKey = await derivePasswordKey(email, password, salt, envelope.iterations);
  const rawKey = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    wrappingKey,
    toArrayBuffer(data)
  );

  return new Uint8Array(rawKey);
}

async function derivePasswordKey(
  email: string,
  password: string,
  salt: Uint8Array,
  iterations = KEY_DERIVATION_ITERATIONS
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(`${email.toLowerCase()}:${password}`),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: toArrayBuffer(salt),
      iterations,
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function getUnlockedAccountJournalKey(userId: string): Promise<CryptoKey> {
  const rawKey = sessionStorage.getItem(getSessionKeyName(userId));

  if (!rawKey) {
    throw new Error("Journal key is locked. Sign in again to unlock it.");
  }

  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(base64ToBytes(rawKey)),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

async function getLegacyDeviceJournalKey(userId: string): Promise<CryptoKey> {
  const rawKey = localStorage.getItem(`${LEGACY_DEVICE_KEY_PREFIX}${userId}`);

  if (!rawKey) {
    throw new Error("Legacy device journal key is missing.");
  }

  return crypto.subtle.importKey(
    "raw",
    toArrayBuffer(base64ToBytes(rawKey)),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

function getSessionKeyName(userId: string): string {
  return `${SESSION_KEY_PREFIX}${userId}`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
