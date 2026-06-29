// // // const GUEST_COOKIE_KEY = "guestId";
// // // const EXPIRY_DAYS = 60;

// // // function setCookie(name, value, days) {
// // //   const expires = new Date(Date.now() + days * 864e5).toUTCString();
// // //   document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
// // // }

// // // function getCookie(name) {
// // //   return (
// // //     document.cookie
// // //       .split("; ")
// // //       .find((row) => row.startsWith(name + "="))
// // //       ?.split("=")[1] || null
// // //   );
// // // }

// // // export function getOrCreateGuestId() {
// // //   let guestId = getCookie(GUEST_COOKIE_KEY);
// // //   if (!guestId) {
// // //     const random =
// // //       Math.random().toString(36).substring(2, 12) +
// // //       Math.random().toString(36).substring(2, 12);
// // //     guestId = "guest_" + random;
// // //     setCookie(GUEST_COOKIE_KEY, guestId, EXPIRY_DAYS);
// // //   }
// // //   return guestId;
// // // }

// // // export function getGuestId() {
// // //   return getCookie(GUEST_COOKIE_KEY) || null;
// // // }

// // // export function clearGuestCookie() {
// // //   document.cookie = `${GUEST_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
// // // }

const GUEST_COOKIE_KEY = "guestId";
const GUEST_LS_KEY = "guest_id_backup";
const EXPIRY_DAYS = 60;

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  if (!match) return null;
  try {
    return decodeURIComponent(match.split("=")[1]);
  } catch {
    return null;
  }
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

async function buildFingerprint() {
  const scr = window.screen || {};
  const parts = [
    navigator.userAgent || "",
    (scr.width || 0) + "x" + (scr.height || 0) + "x" + (scr.colorDepth || 0),
    navigator.language || "",
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    String(navigator.hardwareConcurrency || ""),
    navigator.platform || "",
  ];

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Cwm fjordbank", 2, 15);
    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillText("Cwm fjordbank", 4, 17);
    parts.push(canvas.toDataURL().slice(-64));
  } catch {
    parts.push("no-canvas");
  }

  const raw = parts.join("|");

  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hexHash = (hash >>> 0).toString(16).padStart(8, "0");

  let hash2 = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash2 = (hash2 * 33) ^ raw.charCodeAt(i);
    hash2 = hash2 & hash2;
  }
  const hexHash2 = (hash2 >>> 0).toString(16).padStart(8, "0");

  return hexHash + hexHash2;
}

async function resolveFromServer(fingerprintHash) {
  try {
    const BASE = process.env.REACT_APP_API_URL || "";

    const res = await fetch(`${BASE}/guest/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fingerprintHash }),
    });

    if (!res.ok) {
      console.warn("⚠️ Guest resolve failed, status:", res.status);
      return null;
    }

    const data = await res.json();

    if (data?.success && data?.data?.guest_id) {
      return data.data.guest_id;
    }
    return null;
  } catch (err) {
    return null;
  }
}

function saveGuestId(guestId) {
  setCookie(GUEST_COOKIE_KEY, guestId, EXPIRY_DAYS);
  try {
    localStorage.setItem(GUEST_LS_KEY, guestId);
  } catch {}
}

let _resolvePromise = null;

// ─── MAIN: resolveGuestId ─────────────────────────────────────────────
/**
 * 3-layer recovery:
 * 1. Cookie → return immediately
 * 2. localStorage → restore cookie, return
 * 3. Server fingerprint → recover or create, save both
 */
export async function resolveGuestId() {
  const fromCookie = getCookie(GUEST_COOKIE_KEY);
  if (fromCookie) {
    try {
      localStorage.setItem(GUEST_LS_KEY, fromCookie);
    } catch {}
    return fromCookie;
  }

  let fromLS = null;
  try {
    fromLS = localStorage.getItem(GUEST_LS_KEY);
  } catch {}
  if (fromLS) {
    setCookie(GUEST_COOKIE_KEY, fromLS, EXPIRY_DAYS);
    return fromLS;
  }

  if (!_resolvePromise) {
    _resolvePromise = (async () => {
      try {
        const fpHash = await buildFingerprint();

        const guestId = await resolveFromServer(fpHash);

        if (guestId) {
          saveGuestId(guestId);
          return guestId;
        }

        const local =
          "guest_" +
          Math.random().toString(36).slice(2, 10) +
          Math.random().toString(36).slice(2, 8);
        saveGuestId(local);
        console.warn("⚠️ Server unreachable, using local ID:", local);
        return local;
      } finally {
        setTimeout(() => {
          _resolvePromise = null;
        }, 3000);
      }
    })();
  }

  return _resolvePromise;
}

export function getGuestId() {
  const fromCookie = getCookie(GUEST_COOKIE_KEY);
  if (fromCookie) return fromCookie;
  try {
    return localStorage.getItem(GUEST_LS_KEY) || null;
  } catch {
    return null;
  }
}

export function clearGuestCookie() {
  deleteCookie(GUEST_COOKIE_KEY);
  try {
    localStorage.removeItem(GUEST_LS_KEY);
  } catch {}
}
