const GUEST_COOKIE_KEY = "guestId";
const EXPIRY_DAYS = 60;

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name) {
  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1] || null
  );
}

export function getOrCreateGuestId() {
  let guestId = getCookie(GUEST_COOKIE_KEY);
  if (!guestId) {
    const random = Math.random().toString(36).substring(2, 12) +
      Math.random().toString(36).substring(2, 12);
    guestId = "guest_" + random;
    setCookie(GUEST_COOKIE_KEY, guestId, EXPIRY_DAYS);
  }
  return guestId;
}

export function clearGuestCookie() {
  document.cookie = `${GUEST_COOKIE_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}