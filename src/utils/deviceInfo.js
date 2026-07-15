const parseUserAgent = (uaRaw = "") => {
  const ua = uaRaw || "";

  let type = "Desktop";
  if (/tablet|ipad/i.test(ua)) type = "Tablet";
  else if (/mobile|android|iphone/i.test(ua)) type = "Mobile";

  let os = "Unknown";
  if (/Windows NT 10.0/i.test(ua)) {
    os = "Windows 10 / 11";
  } else if (/Windows NT 6.3/i.test(ua)) {
    os = "Windows 8.1";
  } else if (/Windows NT 6.2/i.test(ua)) {
    os = "Windows 8";
  } else if (/Windows NT 6.1/i.test(ua)) {
    os = "Windows 7";
  } else if (/Windows NT 6.0/i.test(ua)) {
    os = "Windows Vista";
  } else if (/Windows NT 5.1/i.test(ua)) {
    os = "Windows XP";
  } else if (/windows nt/i.test(ua)) {
    os = "Windows";
  } else if (/Android/i.test(ua)) {
    const m = ua.match(/Android\s([\d.]+)/i);
    if (m) {
      os = `Android ${m[1]}`;
    } else {
      os = "Android";
    }
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    const m = ua.match(/OS (\d+(?:[_]\d+)*)/i);

    if (m) {
      os = `iOS ${m[1].replace(/_/g, ".")}`;
    } else {
      os = "iOS";
    }
  } else if (/Mac OS X/i.test(ua)) {
    const m = ua.match(/Mac OS X (\d+(?:[_]\d+)*)/i);

    if (m) {
      os = `macOS ${m[1].replace(/_/g, ".")}`;
    } else {
      os = "macOS";
    }
  } else if (/Linux/i.test(ua)) {
    os = "Linux";
  }

  let browser = "Unknown";

  if (/edgios/i.test(ua)) {
    browser = "Microsoft Edge (iOS)";
  } else if (/edga/i.test(ua)) {
    browser = "Microsoft Edge (Android)";
  } else if (/edg\//i.test(ua)) {
    browser = "Microsoft Edge";
  } else if (/opr\//i.test(ua) || /opera/i.test(ua)) {
    browser = "Opera";
  } else if (/vivaldi/i.test(ua)) {
    browser = "Vivaldi";
  } else if (/yabrowser/i.test(ua)) {
    browser = "Yandex Browser";
  } else if (/duckduckgo/i.test(ua)) {
    browser = "DuckDuckGo Browser";
  } else if (/samsungbrowser/i.test(ua)) {
    browser = "Samsung Internet";
  } else if (/jiosphere/i.test(ua)) {
    browser = "JioSphere";
  } else if (/miuibrowser/i.test(ua)) {
    browser = "Mi Browser";
  } else if (/huaweibrowser/i.test(ua)) {
    browser = "Huawei Browser";
  } else if (/ucbrowser/i.test(ua)) {
    browser = "UC Browser";
  } else if (/qqbrowser/i.test(ua)) {
    browser = "QQ Browser";
  } else if (/baidubrowser/i.test(ua)) {
    browser = "Baidu Browser";
  } else if (/puffin/i.test(ua)) {
    browser = "Puffin";
  } else if (/whale/i.test(ua)) {
    browser = "Naver Whale";
  } else if (/coc_coc_browser/i.test(ua)) {
    browser = "Cốc Cốc";
  } else if (/focus/i.test(ua)) {
    browser = "Firefox Focus";
  } else if (/firefox\//i.test(ua)) {
    browser = "Firefox";
  } else if (/crios/i.test(ua)) {
    browser = "Chrome (iOS)";
  } else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) {
    browser = "Chrome";
  } else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari";
  } else if (/chromium/i.test(ua)) {
    browser = "Chromium";
  }
  return { type, os, browser };
};

const getClientIp = (req) => {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) {
    let ip = fwd.split(",")[0].trim();
    if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
    return ip;
  }
  let ip =
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    req.ip ||
    null;
  if (ip && ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");
  return ip;
};

const isPrivateIp = (ip) => {
  if (!ip) return true;
  return (
    ip === "::1" ||
    ip.startsWith("127.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  );
};

// Free public API — no key, no package. Returns city/state/country/zip/lat/lon.
const geoLookup = async (ip) => {
  const empty = {
    city: null,
    state: null,
    country: null,
    zip_code: null,
    latitude: null,
    longitude: null,
  };
  try {
    let queryIp = ip;

    // 👇 Local dev fallback: if IP is private (localhost / LAN wifi),
    // fetch YOUR machine's real public IP so you can still test geo lookup.
    // Remove this block (or guard it with NODE_ENV check) before going to production.
    if (isPrivateIp(queryIp)) {
      if (process.env.NODE_ENV === "production") return empty;
      try {
        const pubRes = await fetch("https://api.ipify.org?format=json");
        const pubData = await pubRes.json();
        queryIp = pubData.ip;
      } catch {
        return empty;
      }
    }

    const res = await fetch(
      `http://ip-api.com/json/${queryIp}?fields=status,message,city,regionName,country,zip,lat,lon,query`,
    );
    const data = await res.json();

    if (data.status === "success") {
      return {
        city: data.city || null,
        state: data.regionName || null,
        country: data.country || null,
        zip_code: data.zip || null,
        latitude: typeof data.lat === "number" ? data.lat : null,
        longitude: typeof data.lon === "number" ? data.lon : null,
      };
    }
    return empty;
  } catch (e) {
    console.error("[Tracking] geoLookup failed:", e.message);
    return empty;
  }
};

const buildDeviceSnapshot = async (req) => {
  console.log(req.headers["user-agent"]);

  const ip = getClientIp(req);
  const { type, os, browser } = parseUserAgent(req.headers["user-agent"]);
  const geo = await geoLookup(ip);
  return {
    type,
    os,
    browser,
    ip,
    city: geo.city,
    state: geo.state,
    country: geo.country,
    zip_code: geo.zip_code,
    latitude: geo.latitude,
    longitude: geo.longitude,
  };
};

module.exports = {
  parseUserAgent,
  getClientIp,
  geoLookup,
  buildDeviceSnapshot,
};
