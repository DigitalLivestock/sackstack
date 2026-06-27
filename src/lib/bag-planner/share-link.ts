import type { Trip } from './types';
import { buildExport, parseImport } from './trip-io';

// Base64url-encode a UTF-8 string (works in browser).
function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): string {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function buildShareUrl(trip: Trip, origin?: string): string {
  const json = JSON.stringify(buildExport([trip]));
  const encoded = toBase64Url(json);
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/share#t=${encoded}`;
}

export function decodeSharedTrips(hash: string): Trip[] {
  const h = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(h);
  const data = params.get('t');
  if (!data) throw new Error('Missing share data');
  const json = fromBase64Url(data);
  return parseImport(json, { regenerateIds: true });
}
