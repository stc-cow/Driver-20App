const API_BASE = window.location.origin;
const CSV_API_URL = `${API_BASE}/api/fetch-csv`;
const INVOICE_CSV_URL =
  "https://script.google.com/macros/s/AKfycbxU7WENKAEkhJnBvCPbcGqiwZbUr5ZTT93Gfpw6AmiP7lPYfGUobDpOZh1qvppYgF3RVw/exec";

const ACES_ACCESS_CODE = "ACES2025";

const VVVIP_SITES_LIST = [
  "COW779",
  "COW820",
  "COW020",
  "COW059",
  "COWE05",
  "COW626",
  "COW774",
  "COW739",
  "COW772",
  "COW518",
  "COW535",
  "COW529",
  "CWH972",
  "COW552",
];

// ==========================================
// IMMEDIATE FETCH ERROR SUPPRESSION
// ==========================================
// Override console methods IMMEDIATELY, before any other code runs
// This intercepts "Failed to fetch" errors early
const suppressFetchErrorMsg = (...args) => {
  const message = args.map((arg) => String(arg)).join(" ");
  return message.includes("Failed to fetch");
};

const _originalError = console.error;
const _originalWarn = console.warn;
const _originalTrace = console.trace;

console.error = function (...args) {
  if (suppressFetchErrorMsg(...args)) return;
  _originalError.apply(console, args);
};

console.warn = function (...args) {
  if (suppressFetchErrorMsg(...args)) return;
  _originalWarn.apply(console, args);
};

console.trace = function (...args) {
  if (suppressFetchErrorMsg(...args)) return;
  _originalTrace.apply(console, args);
};

// ==========================================
// CONSOLE LOCK - Security Protection
// ==========================================

// Disable all console methods
// TEMPORARILY DISABLED FOR DEBUGGING
// if (window.location.hostname !== "localhost") {
//   const noop = () => {};
//   console.log = noop;
//   console.error = noop;
//   console.warn = noop;
//   console.info = noop;
//   console.debug = noop;
//   console.trace = noop;
//   console.group = noop;
//   console.groupEnd = noop;
//   console.time = noop;
//   console.timeEnd = noop;
// }

// Detect and block DevTools keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // F12 - Opens DevTools
  if (e.key === "F12" || e.keyCode === 123) {
    e.preventDefault();
    return false;
  }

  // Ctrl+Shift+I (Windows/Linux) - Opens DevTools
  if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
    e.preventDefault();
    return false;
  }

  // Ctrl+Shift+J (Windows/Linux) - Opens Console
  if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
    e.preventDefault();
    return false;
  }

  // Ctrl+Shift+C (Windows/Linux) - Opens Inspector
  if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
    e.preventDefault();
    return false;
  }

  // Cmd+Option+I (Mac) - Opens DevTools
  if (e.metaKey && e.altKey && e.keyCode === 73) {
    e.preventDefault();
    return false;
  }

  // Cmd+Option+J (Mac) - Opens Console
  if (e.metaKey && e.altKey && e.keyCode === 74) {
    e.preventDefault();
    return false;
  }

  // Cmd+Option+U (Mac) - View Source
  if (e.metaKey && e.altKey && e.keyCode === 85) {
    e.preventDefault();
    return false;
  }

  // Ctrl+S (Windows/Linux) - Save page (optional, prevent download)
  // Uncomment if you want to prevent saving the page
  // if (e.ctrlKey && e.keyCode === 83) {
  //   e.preventDefault();
  //   return false;
  // }
});

// Disable right-click context menu (optional - uncomment to enable)
// document.addEventListener("contextmenu", (e) => {
//   e.preventDefault();
//   return false;
// });

// ==========================================
// FETCH ERROR SUPPRESSION
// ==========================================
// Suppress "Failed to fetch" errors that occur due to CORS proxy rotation and network instability
// These errors are expected and handled by the try-catch blocks in fetchCSV

// Wrap window.fetch to suppress errors at the source
const originalFetch = window.fetch;
window.fetch = function (...args) {
  try {
    // Call the original fetch
    const promise = originalFetch.apply(this, args);
    // Chain a catch handler to suppress Failed to fetch errors
    return promise
      .catch((err) => {
        if (err && err.message && err.message.includes("Failed to fetch")) {
          // Silently suppress and return a rejected promise
          return Promise.reject(err);
        }
        throw err;
      })
      .catch((err) => {
        // If error still reaches here, suppress console output
        if (err && err.message && err.message.includes("Failed to fetch")) {
          return Promise.reject(err);
        }
        throw err;
      });
  } catch (syncErr) {
    // Catch any synchronous errors from fetch initialization
    if (
      syncErr &&
      syncErr.message &&
      syncErr.message.includes("Failed to fetch")
    ) {
      // Return a rejected promise that won't log to console
      return Promise.reject(syncErr);
    }
    throw syncErr;
  }
};

// Aggressive global error suppression
window.addEventListener("error", (event) => {
  if (event.message && event.message.includes("Failed to fetch")) {
    event.preventDefault();
    return true;
  }
});

// Suppress unhandled promise rejections from fetch failures
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  let isFetchError = false;

  if (reason && typeof reason === "object" && reason.message) {
    isFetchError = reason.message.includes("Failed to fetch");
  } else if (typeof reason === "string") {
    isFetchError = reason.includes("Failed to fetch");
  }

  if (isFetchError) {
    event.preventDefault();
  }
});

// Also set as property handlers for maximum coverage
window.onerror = function (msg, url, lineNo, colNo, error) {
  if (msg && typeof msg === "string" && msg.includes("Failed to fetch")) {
    return true; // Suppress the error
  }
  return false;
};

window.onunhandledrejection = function (event) {
  const reason = event.reason;
  if (
    reason &&
    typeof reason === "object" &&
    reason.message &&
    reason.message.includes("Failed to fetch")
  ) {
    event.preventDefault();
    return true;
  }
  return false;
};

// Detect if DevTools is open using debounce technique
setInterval(() => {
  const threshold = 160; // Approximate height of DevTools
  const widthThreshold = 160; // Approximate width when DevTools opens on side

  if (
    window.outerWidth - window.innerWidth > widthThreshold ||
    window.outerHeight - window.innerHeight > threshold
  ) {
    // DevTools detected - optionally lock user out
    // console.clear() is disabled, so we skip it
    // Uncomment below to logout user when DevTools is detected:
    // handleLogout();
  }
}, 500);

// ==========================================
// END CONSOLE LOCK
// ==========================================

// Suppress unhandled fetch rejections
window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const reasonStr = String(reason || "").toLowerCase();
  const messageStr = (
    reason && reason.message ? String(reason.message) : ""
  ).toLowerCase();

  if (
    reasonStr.includes("failed to fetch") ||
    messageStr.includes("failed to fetch") ||
    messageStr.includes("timeout") ||
    reasonStr.includes("timeout") ||
    messageStr === "timeout" ||
    messageStr === "proxy_timeout" ||
    messageStr === "direct_timeout" ||
    messageStr === "csv fetch timeout"
  ) {
    event.preventDefault();
  }
});

// Extract username from URL params
const urlParams = new URLSearchParams(window.location.search);
let urlUsername = urlParams.get("username") || "Guest";

// Initialize or retrieve session ID
function getOrCreateSessionId() {
  let sessionId = localStorage.getItem("session_id");
  if (!sessionId) {
    sessionId =
      "session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    localStorage.setItem("session_id", sessionId);
  }
  return sessionId;
}

// Get or create device ID
// All remember-me functionality removed

const SA_CENTER = [23.8859, 45.0792];
const SA_BOUNDS = [
  [16.3, 32.0],
  [32.15, 55.8],
];

const STATUS_COLORS = {
  due: "#d32f2f",
  today: "#ff9e00",
  coming3: "#ffd700",
  next15: "#27ae60",
};

let map;
let sitesData = [];
let markers = [];
let siteMap = {};
let pulsingCircles = [];
let pulsingIntervals = [];
let markersLayer;
let currentPopupOverlay = null;
let dashboardInitialized = false;
let headerIntervalId = null;
let refreshIntervalId = null;
let selectedRegion = "CER";

// Load dashboard on page load
document.addEventListener("DOMContentLoaded", async () => {
  await initializeApp();
});

// Clean up intervals when page is closed or navigated away
window.addEventListener("beforeunload", () => {
  if (headerIntervalId) clearInterval(headerIntervalId);
  if (refreshIntervalId) clearInterval(refreshIntervalId);
  pulsingIntervals.forEach((interval) => clearInterval(interval));
});

async function initializeApp() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    showDashboard();
    startDashboardAsync();
  } else {
    showLoginPage();
    setupLoginForm();
  }
}

function showLoginPage() {
  const loginPage = document.getElementById("loginPage");
  loginPage.classList.add("show");
  document.getElementById("dashboardPage").style.display = "none";
  document.getElementById("analyticsPage").style.display = "none";
}

function showDashboard() {
  document.getElementById("loginPage").classList.remove("show");
  document.getElementById("dashboardPage").style.display = "grid";
  document.getElementById("analyticsPage").style.display = "none";
}

function setupLoginForm() {
  const loginForm = document.getElementById("loginForm");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });
}

async function handleLogin() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const loginError = document.getElementById("loginError");

  // Validate inputs
  if (!username || !password) {
    loginError.textContent = "Please enter both username and password";
    loginError.style.display = "block";
    return;
  }

  // Validate credentials
  if (username === "Aces@MSD" && password === "ACES@2025") {
    try {
      // Hide error message
      loginError.style.display = "none";

      // Store login status
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("username", username);

      // Show dashboard
      showDashboard();

      // Load data
      await startDashboardAsync();

      // Clear form
      document.getElementById("username").value = "";
      document.getElementById("password").value = "";
    } catch (error) {
      loginError.textContent =
        "An error occurred during login. Please try again.";
      loginError.style.display = "block";

      // Reset login state on error
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem("username");
      dashboardInitialized = false;
      showLoginPage();
    }
  } else {
    // Show error
    loginError.textContent = "Invalid username or password";
    loginError.style.display = "block";
    document.getElementById("password").value = "";
  }
}

async function startDashboardAsync() {
  if (dashboardInitialized) return;
  dashboardInitialized = true;

  try {
    initMap();
    await loadDashboard();

    updateHeaderDate();
    if (headerIntervalId) clearInterval(headerIntervalId);
    headerIntervalId = setInterval(updateHeaderDate, 1000);

    // Auto-sync from CSV in background without duplicating intervals
    if (refreshIntervalId) clearInterval(refreshIntervalId);
    refreshIntervalId = setInterval(() => {
      backgroundSyncData();
    }, 30000);

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          searchSite(searchInput.value);
        }
      });
    }

    const searchModal = document.getElementById("searchModal");
    const invoiceModal = document.getElementById("invoiceModal");

    window.addEventListener("click", (e) => {
      if (e.target === searchModal) {
        closeSearchModal();
      }
      if (e.target === invoiceModal) {
        closeInvoiceModal();
      }
    });
  } catch (error) {}
}

window.handleLogout = function handleLogout() {
  // Clear login status
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("username");

  // Clear intervals
  if (headerIntervalId) clearInterval(headerIntervalId);
  if (refreshIntervalId) clearInterval(refreshIntervalId);

  // Clear pulsing intervals
  pulsingIntervals.forEach((interval) => clearInterval(interval));
  pulsingIntervals = [];

  // Reset dashboard state
  dashboardInitialized = false;

  // Clear markers and map
  if (map) {
    map.off();
    map.remove();
    map = null;
  }
  markers = [];
  siteMap = {};
  sitesData = [];

  // Show login page
  showLoginPage();

  // Clear form fields
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
  document.getElementById("loginError").style.display = "none";
};

// Helper function to safely fetch with proper error suppression
async function safeFetch(url, options = {}) {
  try {
    return await fetch(url, options);
  } catch (err) {
    // Return rejected promise - error will be caught by caller and suppressed globally
    return Promise.reject(err);
  }
}

async function fetchCSV() {
  const baseURL =
    "https://script.google.com/macros/s/AKfycbxU7WENKAEkhJnBvCPbcGqiwZbUr5ZTT93Gfpw6AmiP7lPYfGUobDpOZh1qvppYgF3RVw/exec";
  const CSV_URL = baseURL + "&t=" + Date.now();
  const CORS_PROXIES = [
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
  ];

  console.log("[fetchCSV] Starting CSV fetch...");

  // Check if API endpoint is available (not static hosting like GitHub Pages)
  const isStaticHosting = window.location.hostname.includes("github.io");

  console.log(
    "[fetchCSV] isStaticHosting:",
    isStaticHosting,
    "hostname:",
    window.location.hostname,
  );

  // Try API endpoint first (for servers with backend like Fly.dev)
  if (!isStaticHosting) {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 3000);
      });

      try {
        let fetchPromise;
        try {
          fetchPromise = fetch(CSV_API_URL, {
            method: "GET",
            headers: {
              Accept: "text/csv",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }).catch((err) => {
            // Immediately catch to prevent unhandled rejection
            return Promise.reject(err);
          });
        } catch (err) {
          fetchPromise = Promise.reject(err);
        }

        const response = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]).catch(() => null);

        if (response && response.ok) {
          try {
            const csvText = await response.text();
            if (csvText.trim()) {
              const parsed = parseCSV(csvText);
              return parsed;
            }
          } catch (textErr) {
            // Silent fail
          }
        }
      } catch (fetchError) {
        // Silently ignore timeout and fetch failures
      }
    } catch (error) {
      // API endpoint not available, try alternatives
    }
  }

  // Try CORS proxies
  console.log("[fetchCSV] Trying CORS proxies...");
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    let proxyUrl;
    if (CORS_PROXIES[i].includes("?")) {
      proxyUrl = CORS_PROXIES[i] + CSV_URL;
    } else {
      proxyUrl = CORS_PROXIES[i] + encodeURIComponent(CSV_URL);
    }

    console.log(
      `[fetchCSV] Attempting proxy ${i + 1}/${CORS_PROXIES.length}:`,
      CORS_PROXIES[i],
    );

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("proxy_timeout")), 3000);
      });

      try {
        let fetchPromise;
        try {
          fetchPromise = fetch(proxyUrl, {
            method: "GET",
            headers: {
              Accept: "text/plain",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }).catch((err) => {
            // Immediately catch to prevent unhandled rejection
            return Promise.reject(err);
          });
        } catch (err) {
          fetchPromise = Promise.reject(err);
        }

        const response = await Promise.race([
          fetchPromise,
          timeoutPromise,
        ]).catch(() => null);

        if (response && response.ok) {
          try {
            const csvText = await response.text();
            console.log(
              `[fetchCSV] Proxy ${i + 1} returned data, length:`,
              csvText.length,
            );
            if (csvText.trim()) {
              const parsed = parseCSV(csvText);
              console.log(
                `[fetchCSV] Parsed ${parsed.length} rows from proxy ${i + 1}`,
              );
              return parsed;
            }
          } catch (textErr) {
            console.warn(
              `[fetchCSV] Error parsing text from proxy ${i + 1}:`,
              textErr.message,
            );
            continue;
          }
        } else {
          console.log(
            `[fetchCSV] Proxy ${i + 1} failed - response:`,
            response?.status,
          );
        }
      } catch (fetchErr) {
        // Catch fetch errors silently and continue to next proxy
        console.warn(`[fetchCSV] Proxy ${i + 1} error:`, fetchErr.message);
        continue;
      }
    } catch (proxyError) {
      // Continue to next proxy on error
      continue;
    }
  }

  // Last resort: try direct Google Sheets fetch
  console.log("[fetchCSV] Trying direct Google Sheets fetch (no proxy)...");
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("direct_timeout")), 3000);
    });

    try {
      let fetchPromise;
      try {
        fetchPromise = fetch(CSV_URL, {
          method: "GET",
          mode: "cors",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }).catch((err) => {
          // Immediately catch to prevent unhandled rejection
          return Promise.reject(err);
        });
      } catch (err) {
        fetchPromise = Promise.reject(err);
      }

      const response = await Promise.race([fetchPromise, timeoutPromise]).catch(
        () => null,
      );

      if (response && response.ok) {
        try {
          const csvText = await response.text();
          console.log(
            "[fetchCSV] Direct fetch successful, data length:",
            csvText.length,
          );
          if (csvText.trim()) {
            const parsed = parseCSV(csvText);
            console.log(
              "[fetchCSV] Parsed",
              parsed.length,
              "rows from direct fetch",
            );
            return parsed;
          }
        } catch (textErr) {
          console.error(
            "[fetchCSV] Error parsing direct fetch:",
            textErr.message,
          );
          return [];
        }
      } else {
        console.log(
          "[fetchCSV] Direct fetch failed - status:",
          response?.status,
        );
      }
    } catch (fetchErr) {
      // Catch fetch errors silently
      console.warn("[fetchCSV] Direct fetch error:", fetchErr.message);
      return [];
    }
  } catch (error) {
    // Silent fail on direct fetch
    console.error("[fetchCSV] Outer direct fetch error:", error.message);
  }

  console.warn("[fetchCSV] All fetch attempts failed, returning empty array");
  return [];
}

function escapeHTML(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function parseCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = parseCSVLine(line);
    const row = {};

    headers.forEach((header, index) => {
      row[header.toLowerCase()] = values[index] ? values[index].trim() : "";
    });

    data.push(row);
  }

  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function filterAndValidateSites(rawData) {
  return rawData
    .filter((row) => {
      const regionname = row.regionname ? row.regionname.trim() : "";

      const cowstatusKey = Object.keys(row).find(
        (key) => key.toLowerCase() === "cowstatus",
      );
      const cowstatus = cowstatusKey
        ? row[cowstatusKey].trim().toUpperCase()
        : "";

      const lat = parseFloat(row.lat || row.latitude || "");
      const lng = parseFloat(row.lng || row.longitude || "");
      const sitename = row.sitename || "";

      const siteObj = { regionname };
      return (
        isInSelectedRegion(siteObj) &&
        (cowstatus === "ON-AIR" || cowstatus === "IN PROGRESS") &&
        sitename.trim() !== "" &&
        !isNaN(lat) &&
        !isNaN(lng)
      );
    })
    .map((row) => {
      const lat = parseFloat(row.lat || row.latitude || "");
      const lng = parseFloat(row.lng || row.longitude || "");

      const nextfuelingplanKey = Object.keys(row).find(
        (key) => key.toLowerCase() === "nextfuelingplan",
      );
      const nextfuelingplan = nextfuelingplanKey ? row[nextfuelingplanKey] : "";
      const fuelDate = parseFuelDate(nextfuelingplan);
      const days = dayDiff(fuelDate);
      const statusObj = classify(days);

      const lastfuelingdateKey = Object.keys(row).find(
        (key) => key.toLowerCase() === "lastfuelingdate",
      );
      const lastfuelingdate = lastfuelingdateKey ? row[lastfuelingdateKey] : "";

      const lastfuelingqtyKey = Object.keys(row).find(
        (key) => key.toLowerCase() === "lastfuelingqty",
      );
      const lastfuelingqty = lastfuelingqtyKey ? row[lastfuelingqtyKey] : "";

      const districtKey = Object.keys(row).find(
        (key) => key.toLowerCase() === "districtname",
      );
      const districtname = districtKey ? row[districtKey] : "";

      const cityKey = Object.keys(row).find(
        (key) => key.toLowerCase() === "cityname",
      );
      const cityname = cityKey ? row[cityKey] : "";

      const sitelabelKey = Object.keys(row).find(
        (key) => key.toLowerCase() === "sitelabel",
      );
      const sitelabel = sitelabelKey ? row[sitelabelKey] : "";

      let siteColor = statusObj.color;

      if (nextfuelingplan.trim() === "SEC Site") {
        siteColor = "#9b59b6";
      }

      return {
        sitename: row.sitename || "Unknown Site",
        regionname: row.regionname || "",
        districtname: districtname || "",
        cityname: cityname || "",
        cowstatus: row.cowstatus || "",
        sitelabel: sitelabel || "",
        lat: lat,
        lng: lng,
        lastfuelingdate: lastfuelingdate || "",
        lastfuelingqty: lastfuelingqty || "",
        nextfuelingplan: nextfuelingplan || "",
        fuelDate: fuelDate,
        days: days,
        status: statusObj.label,
        color: siteColor,
      };
    });
}

function parseFuelDate(str) {
  if (!str || str.includes("#") || str.trim() === "") return null;

  // Handle DD/MM/YYYY format from CSV Column AE
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = str.trim().match(ddmmyyyyRegex);

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Create date object (month is 0-indexed in JS)
    const d = new Date(year, month - 1, day);

    // Validate the date
    if (isNaN(d.getTime())) {
      return null;
    }

    return d;
  }

  // Fallback: try parsing as standard date format
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// Convert date string to YYYY-MM-DD format
// Handle multiple possible formats from CSV
function convertDateToISO(dateStr) {
  if (!dateStr || dateStr.trim() === "") return null;

  dateStr = dateStr.trim();

  // Silently skip Excel error codes and invalid values
  if (
    dateStr === "#N/A" ||
    dateStr === "#REF!" ||
    dateStr === "#VALUE!" ||
    dateStr === "#ERROR!"
  ) {
    return null;
  }

  // Try DD/MM/YYYY format
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  let match = dateStr.match(ddmmyyyyRegex);

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    // Validate month and day
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    // Format as YYYY-MM-DD
    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");

    return `${year}-${monthStr}-${dayStr}`;
  }

  // Try YYYY-MM-DD format (already correct)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Try MM/DD/YYYY format
  const mmddyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  match = dateStr.match(mmddyyyyRegex);
  if (match) {
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    const monthStr = String(month).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");

    return `${year}-${monthStr}-${dayStr}`;
  }

  // Silently fail for unparseable dates (data quality issue, not code error)
  return null;
}

function dayDiff(targetDate) {
  if (!targetDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const t = new Date(targetDate);
  t.setHours(0, 0, 0, 0);

  return Math.round((t - today) / (1000 * 60 * 60 * 24));
}

function classify(days) {
  if (days === null) return { label: "next15", color: "#27ae60" };

  if (days < 0) return { label: "due", color: "#d32f2f" };
  if (days === 0) return { label: "today", color: "#d32f2f" };
  if (days >= 1 && days <= 3) return { label: "coming3", color: "#27ae60" };
  if (days >= 4 && days <= 15) return { label: "next15", color: "#27ae60" };

  return { label: "next15", color: "#27ae60" };
}

function getStatusColor(status) {
  return STATUS_COLORS[status] || STATUS_COLORS.next15;
}

function getStatusLabel(status) {
  const labels = {
    due: "Overdue",
    today: "Today",
    coming3: "Coming Soon",
    next15: "Healthy",
  };
  return labels[status] || "Unknown";
}

function isDueSite(site) {
  if (!isInSelectedRegion(site)) {
    return false;
  }

  const validStatus =
    site.cowstatus === "ON-AIR" || site.cowstatus === "In Progress";
  if (!validStatus) {
    return false;
  }

  if (!site.nextfuelingplan || !site.nextfuelingplan.trim()) {
    return false;
  }

  const nextFuelingDate = new Date(site.nextfuelingplan);
  if (isNaN(nextFuelingDate.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return nextFuelingDate < today;
}

function updateMetrics(sites) {
  const totalSites = sites.length;
  const dueSites = sites.filter((s) => isDueSite(s)).length;
  const todaySites = sites.filter((s) => s.status === "today").length;
  const futureSites = sites.filter((s) => s.status === "next15").length;

  document.getElementById("totalSites").textContent = totalSites;
  document.getElementById("dueSites").textContent = dueSites;
  document.getElementById("todaySites").textContent = todaySites;
  document.getElementById("futureSites").textContent = futureSites;

  updateKPIChart(totalSites, dueSites, todaySites);
}

function updateKPIChart(totalSites, dueSites, todaySites) {
  const compliantCount = totalSites - dueSites;
  const performancePercentage =
    totalSites > 0 ? Math.round((compliantCount / totalSites) * 100) : 0;
  const nonCompliantPercentage = 100 - performancePercentage;

  document.getElementById("kpiPercentage").textContent =
    performancePercentage + "%";

  const ctx = document.getElementById("kpiChart");
  if (!ctx) return;

  if (window.kpiChartInstance) {
    window.kpiChartInstance.data.datasets[0].data = [
      performancePercentage,
      nonCompliantPercentage,
    ];
    window.kpiChartInstance.update();
  } else {
    window.kpiChartInstance = new Chart(ctx, {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [performancePercentage, nonCompliantPercentage],
            backgroundColor: ["#3ad17c", "#ff6b6b"],
            borderColor: ["#3ad17c", "#ff6b6b"],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: false,
          },
        },
        cutout: "70%",
      },
    });
  }
}

function populateDueTable(sites) {
  const dueSites = sites
    .filter((s) => isDueSite(s))
    .sort((a, b) => {
      const cityCompare = (a.cityname || "").localeCompare(b.cityname || "");
      if (cityCompare !== 0) return cityCompare;
      return new Date(a.nextfuelingplan) - new Date(b.nextfuelingplan);
    });

  const todaySites = sites
    .filter((s) => s.status === "today")
    .sort((a, b) => {
      const cityCompare = (a.cityname || "").localeCompare(b.cityname || "");
      if (cityCompare !== 0) return cityCompare;
      return new Date(a.nextfuelingplan) - new Date(b.nextfuelingplan);
    });

  const comingSites = sites
    .filter((s) => s.status === "coming3")
    .sort((a, b) => {
      const cityCompare = (a.cityname || "").localeCompare(b.cityname || "");
      if (cityCompare !== 0) return cityCompare;
      return a.days - b.days;
    });

  populateOverdueTable(dueSites);
  populateTodayTable(todaySites);
  populateComingTable(comingSites);
}

function populateOverdueTable(sites) {
  const tbody = document.getElementById("overdueTableBody");
  tbody.innerHTML = "";

  if (sites.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="3" style="text-align: center; color: #94a3b8; padding: 12px;">No overdue sites</td>';
    tbody.appendChild(tr);
    return;
  }

  sites.forEach((site) => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.innerHTML =
      "<td>" +
      site.sitename +
      "</td><td>" +
      (site.cityname || "N/A") +
      "</td><td>" +
      formatDateWithoutYear(site.nextfuelingplan) +
      "</td>";
    tr.addEventListener("click", () => zoomToSite(site.sitename));
    tbody.appendChild(tr);
  });
}

function populateTodayTable(sites) {
  const tbody = document.getElementById("todayTableBody");
  tbody.innerHTML = "";

  if (sites.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="3" style="text-align: center; color: #94a3b8; padding: 12px;">No sites due today</td>';
    tbody.appendChild(tr);
    return;
  }

  sites.forEach((site) => {
    const tr = document.createElement("tr");
    tr.style.cursor = "pointer";
    tr.innerHTML =
      "<td>" +
      site.sitename +
      "</td><td>" +
      (site.cityname || "N/A") +
      "</td><td>" +
      formatDateWithoutYear(site.nextfuelingplan) +
      "</td>";
    tr.addEventListener("click", () => zoomToSite(site.sitename));
    tbody.appendChild(tr);
  });
}

function populateComingTable(sites) {
  const tbody = document.getElementById("comingTableBody");
  tbody.innerHTML = "";

  const oneDay = sites.filter((s) => s.days === 1).length;
  const twoDays = sites.filter((s) => s.days === 2).length;
  const threeDays = sites.filter((s) => s.days === 3).length;

  const summaryElement = document.getElementById("comingSummary");
  if (summaryElement) {
    summaryElement.textContent = `- One day (${oneDay}), Two days (${twoDays}), Three days (${threeDays})`;
  }

  if (sites.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td colspan="3" style="text-align: center; color: #94a3b8; padding: 12px;">No sites coming in 3 days</td>';
    tbody.appendChild(tr);
    return;
  }

  sites.forEach((site) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${site.sitename}</td>
            <td>${site.cityname || "N/A"}</td>
            <td><span style="color: #ffbe0b; font-weight: 600;">${site.days}</span></td>
        `;
    tbody.appendChild(tr);
  });
}

function formatDateWithoutYear(dateStr) {
  if (!dateStr) return "N/A";

  let date;

  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    date = new Date(dateStr + "T00:00:00");
  } else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    const parts = dateStr.split("/");
    date = new Date(parts[2], parts[1] - 1, parts[0]);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return "N/A";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()];

  return day + " " + month;
}

function initMap() {
  // Initialize Leaflet map
  map = L.map("map").setView([SA_CENTER[0], SA_CENTER[1]], 5);

  // Street Layer (OSM Standard)
  const street = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    },
  );

  // Satellite Layer (ESRI)
  const satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 19,
      attribution: "Tiles © Esri",
    },
  );

  // Hybrid Layer (satellite + labels)
  const hybrid = L.layerGroup([
    satellite,
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 19,
        attribution: "Labels © Esri",
      },
    ),
  ]);

  // Terrain Layer
  const terrain = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 17,
      attribution: "Map data © OpenTopoMap",
    },
  );

  // Add default street layer
  street.addTo(map);

  // Add layer control
  L.control
    .layers(
      {
        Street: street,
        Satellite: satellite,
        Hybrid: hybrid,
        Terrain: terrain,
      },
      {},
      { position: "topright" },
    )
    .addTo(map);

  // Create feature group for markers
  markersLayer = L.featureGroup().addTo(map);

  // Listen for zoom changes
  map.on("zoomend", function () {
    const zoom = map.getZoom();
    updateMapVisualization(zoom);
  });

  // Add map legend
  addMapLegend();
}

function addMapLegend() {
  const legendContainer = document.createElement("div");
  legendContainer.className = "map-legend";
  legendContainer.innerHTML = `
    <div class="legend-title">Status Legend</div>
    <div class="legend-item">
      <div class="legend-color healthy"></div>
      <span class="legend-label">Healthy</span>
    </div>
    <div class="legend-item">
      <div class="legend-color due"></div>
      <span class="legend-label">Due</span>
    </div>
    <div class="legend-item">
      <div class="legend-color coming"></div>
      <span class="legend-label">Coming Soon</span>
    </div>
    <div class="legend-item">
      <div class="legend-color sec"></div>
      <span class="legend-label">SEC Site</span>
    </div>
  `;

  const mapContainer = document.getElementById("map");
  mapContainer.appendChild(legendContainer);

  legendContainer.style.position = "absolute";
  legendContainer.style.bottom = "15px";
  legendContainer.style.left = "15px";
  legendContainer.style.zIndex = "100";
}

function addPulsingCircles(markers) {
  if (!markers || markers.length === 0) return;

  let pulsePhase = 0;
  const pulseInterval = setInterval(() => {
    pulsePhase += 0.05;
    if (pulsePhase > 2 * Math.PI) {
      pulsePhase = 0;
    }

    markers.forEach((marker) => {
      const siteData = marker.siteData;
      if (siteData && siteData.status === "due") {
        const scale = 1 + 0.8 * Math.sin(pulsePhase);
        const radius = 8 * scale;
        const opacity = 0.5 * (1.8 - scale);

        marker.setRadius(radius);
        marker.setStyle({
          fillOpacity: opacity,
          opacity: opacity,
          color: "#ff6b6b",
        });
      }
    });
  }, 50);

  pulsingIntervals.push(pulseInterval);
}

function updateMapVisualization(zoom) {
  const HEATMAP_THRESHOLD = 10;
  const LABEL_THRESHOLD = 13;

  markersLayer.eachLayer((marker) => {
    if (zoom >= HEATMAP_THRESHOLD) {
      // Show individual markers at high zoom
      marker.setRadius(8);
      marker.setStyle({
        fillOpacity: 0.8,
        opacity: 1,
      });
    } else {
      // Show heatmap-style visualization at low zoom
      const radius = 15 - (zoom || 5);
      marker.setRadius(radius);
      marker.setStyle({
        fillOpacity: 0.6,
        opacity: 0.6,
      });
    }

    // Show site name labels at high zoom levels
    if (zoom >= LABEL_THRESHOLD) {
      marker.openTooltip();
    } else {
      marker.closeTooltip();
    }
  });
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function addMarkersToMap(sites) {
  // Clear existing markers and pulsing intervals
  markersLayer.clearLayers();
  markers = [];
  siteMap = {};

  // Clear any existing pulsing intervals
  pulsingIntervals.forEach((interval) => clearInterval(interval));
  pulsingIntervals = [];

  const bounds = L.latLngBounds();

  sites.forEach((site) => {
    const color = site.color || getStatusColor(site.status);

    // Create circle marker for all sites
    const marker = L.circleMarker([site.lat, site.lng], {
      radius: 8,
      fillColor: color,
      color: "white",
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    });

    marker.addTo(markersLayer);

    // Store marker reference
    marker.siteData = {
      siteName: site.sitename,
      status: site.status,
      days: site.days,
      nextFuelingPlan: site.nextfuelingplan,
      statusLabel: getStatusLabel(site.status),
    };
    markers.push(marker);

    // Store marker info for interaction
    siteMap[site.sitename] = {
      marker: marker,
      site: site,
      coords: [site.lat, site.lng],
    };

    // Add tooltip with site name
    marker.bindTooltip(site.sitename, {
      permanent: false,
      direction: "top",
      offset: [0, -10],
      className: "site-name-tooltip",
      sticky: false,
    });

    // Add popup on click
    marker.on("click", () => {
      const popupContent = `
        <div class="leaflet-popup-content-wrapper">
          <div class="ol-popup-header">
            <h4>${site.sitename}</h4>
          </div>
          <p><strong>Status:</strong> ${getStatusLabel(site.status)}</p>
          <p><strong>Days:</strong> ${site.days !== null ? site.days : "N/A"}</p>
          <p><strong>Fuel Date:</strong> ${site.nextfuelingplan || "No Date"}</p>
        </div>
      `;

      marker.bindPopup(popupContent).openPopup();
    });

    // Add to bounds
    bounds.extend([site.lat, site.lng]);
  });

  // Initialize map visualization
  const zoom = map.getZoom();
  updateMapVisualization(zoom);

  // Add pulsing circles for red sites (due/overdue)
  addPulsingCircles(markers);

  // Fit map to bounds
  if (bounds.isValid()) {
    map.fitBounds(bounds, {
      padding: [50, 50, 50, 50],
      maxZoom: 17,
    });
  }
}

window.zoomToSite = function zoomToSite(sitename) {
  const siteInfo = siteMap[sitename];
  if (siteInfo && siteInfo.coords && siteInfo.marker) {
    map.setView(siteInfo.coords, 17, { animate: true, duration: 0.5 });

    // Show popup on the marker
    const popupContent = `
      <div style="background: white; padding: 10px; border-radius: 5px; min-width: 200px;">
        <h4 style="margin-top: 0;">${siteInfo.site.sitename}</h4>
        <p><strong>Status:</strong> ${getStatusLabel(siteInfo.site.status)}</p>
        <p><strong>Days:</strong> ${siteInfo.site.days !== null ? siteInfo.site.days : "N/A"}</p>
        <p><strong>Fuel Date:</strong> ${siteInfo.site.nextfuelingplan || "No Date"}</p>
      </div>
    `;
    siteInfo.marker.bindPopup(popupContent).openPopup();
  }
};

async function loadDashboard() {
  try {
    console.log("[loadDashboard] Starting dashboard load...");
    const rawData = await fetchCSV();
    console.log(
      "[loadDashboard] fetchCSV returned",
      rawData?.length || 0,
      "rows",
    );

    sitesData = filterAndValidateSites(rawData);
    console.log(
      "[loadDashboard] After filtering, sitesData has",
      sitesData?.length || 0,
      "sites",
    );

    // Update UI regardless of migration success
    try {
      updateMetrics(sitesData);
      populateDueTable(sitesData);
      addMarkersToMap(sitesData);
      updateEventCards(sitesData);
      console.log("[loadDashboard] Dashboard UI updated successfully");
    } catch (uiErr) {
      console.error("[loadDashboard] Error updating UI:", uiErr.message);
    }
  } catch (error) {
    console.error("[loadDashboard] Error in loadDashboard:", error.message);
  }
}

function formatFuelDate(fuelDate) {
  if (!fuelDate) return "N/A";
  const d = new Date(fuelDate);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatDateShort(dateStr) {
  if (!dateStr) return "N/A";

  // Try parsing the date string
  let date;

  // Try ISO format first (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    date = new Date(dateStr + "T00:00:00");
  }
  // Try DD/MM/YYYY format
  else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
    const parts = dateStr.split("/");
    date = new Date(parts[2], parts[1] - 1, parts[0]);
  }
  // Try standard Date parsing
  else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return "N/A";

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

window.searchSite = function searchSite(siteName) {
  const searchTerm = siteName.trim().toUpperCase();
  const result = sitesData.find(
    (site) => site.sitename.toUpperCase() === searchTerm,
  );

  const modal = document.getElementById("searchModal");
  const resultDiv = document.getElementById("searchResult");

  if (result) {
    const nextFuelingDate = formatDateShort(result.nextfuelingplan);
    const lastFuelingDate = formatDateShort(result.lastfuelingdate);
    const lastFuelingQty = result.lastfuelingqty
      ? parseFloat(result.lastfuelingqty).toFixed(2)
      : "N/A";

    // Calculate days remaining until next fueling
    const daysRemaining = dayDiff(result.nextfuelingplan);
    let daysStatusText = "N/A";
    let highlightColor = "#e8f5e9";
    let borderColor = "#27ae60";
    let statusColor = "#27ae60";

    if (daysRemaining !== null) {
      if (daysRemaining < 0) {
        daysStatusText = `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? "s" : ""}`;
        highlightColor = "#ffebee";
        borderColor = "#d32f2f";
        statusColor = "#d32f2f";
      } else if (daysRemaining === 0) {
        daysStatusText = "Due Today";
        highlightColor = "#fff8e1";
        borderColor = "#ff9e00";
        statusColor = "#ff9e00";
      } else {
        daysStatusText = `Coming in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}`;
        highlightColor = "#e8f5e9";
        borderColor = "#27ae60";
        statusColor = "#27ae60";
      }
    }

    resultDiv.innerHTML = `
      <div class="search-result-item" style="background: linear-gradient(135deg, ${highlightColor} 0%, #ffffff 100%); border: 3px solid ${borderColor};">
        <div class="search-result-header">
          <div class="search-result-site-name">${escapeHTML(result.sitename)}</div>
        </div>
        <div class="search-result-table">
          <div class="search-result-row">
            <div class="search-result-label">Last Fueling Date</div>
            <div class="search-result-value">${escapeHTML(lastFuelingDate)}</div>
          </div>
          <div class="search-result-row">
            <div class="search-result-label">Last Fueling Qty</div>
            <div class="search-result-value">${escapeHTML(lastFuelingQty)}</div>
          </div>
          <div class="search-result-row">
            <div class="search-result-label">Next Fueling Date</div>
            <div class="search-result-value">${escapeHTML(nextFuelingDate)}</div>
          </div>
          <div class="search-result-row">
            <div class="search-result-label">Days Remaining</div>
            <div class="search-result-value" style="font-weight: 700; color: ${statusColor};">${daysStatusText}</div>
          </div>
        </div>
      </div>
    `;
  } else {
    resultDiv.innerHTML = `<div class="search-no-result">No site found with name "${siteName}"</div>`;
  }

  modal.classList.add("active");
};

window.closeSearchModal = function closeSearchModal() {
  const modal = document.getElementById("searchModal");
  modal.classList.remove("active");
  document.getElementById("searchInput").value = "";
};

function formatDateTimeForExcel() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const s = String(now.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yy} ${h}:${m}:${s}`;
}

window.downloadExcel = function downloadExcel() {
  try {
    if (!window.XLSX) {
      alert("Excel library is still loading. Please try again.");
      return;
    }

    const timestamp = formatDateTimeForExcel();

    const exportData = sitesData
      .filter((site) => isInSelectedRegion(site))
      .map((site) => ({
        "Site Name": site.sitename,
        "Region Name": site.regionname,
        "District Name": site.districtname || "",
        "City Name": site.cityname || "",
        "COW Status": site.cowstatus,
        Latitude: site.lat,
        Longitude: site.lng,
        "Last Fueling Date": site.lastfuelingdate || "",
        "Last Fueling QTY": site.lastfuelingqty || "",
        "Next Fueling Plan": site.nextfuelingplan || "",
      }));

    if (exportData.length === 0) {
      alert("No data to export");
      return;
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    const navyColor = "202B6D";
    const whiteFill = "FFFFFF";
    const blackFont = "000000";
    const whiteFont = "FFFFFF";

    const borderStyle = {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    };

    const headerStyle = {
      fill: { fgColor: { rgb: navyColor } },
      font: { bold: true, color: { rgb: whiteFont }, size: 12 },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: borderStyle,
    };

    const dataStyle = {
      font: { color: { rgb: blackFont } },
      alignment: { horizontal: "left", vertical: "center" },
      border: borderStyle,
    };

    const headerRow = Object.keys(exportData[0]);
    headerRow.forEach((key, idx) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: idx });
      worksheet[cellRef].s = headerStyle;
    });

    exportData.forEach((row, rowIdx) => {
      Object.keys(row).forEach((key, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIdx + 1, c: colIdx });
        if (worksheet[cellRef]) {
          worksheet[cellRef].s = dataStyle;
        }
      });
    });

    worksheet["!cols"] = Array(Object.keys(exportData[0]).length).fill({
      wch: 18,
    });

    XLSX.utils.book_append_sheet(workbook, worksheet, "Central Fuel Plan");

    const fileName = `Central_Fuel_Plan_${timestamp.replace(/[/:]/g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    alert("Failed to download Excel file. Please try again.");
  }
};

function updateHeaderDate() {
  const headerDateElement = document.getElementById("headerDate");
  if (headerDateElement) {
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    headerDateElement.textContent = `${formattedDate} ${formattedTime}`;
  }
}

function isVVVIPSite(site) {
  if (!isInSelectedRegion(site)) {
    return false;
  }

  const validStatus =
    site.cowstatus === "ON-AIR" || site.cowstatus === "In Progress";
  if (!validStatus) {
    return false;
  }

  if (!VVVIP_SITES_LIST.includes(site.sitename)) {
    return false;
  }

  return true;
}

function getGradientStyleForFuelDate(days) {
  if (days === null || days === undefined) {
    return { backgroundColor: "#e0e0e0", color: "#333" };
  }

  if (days < 0) {
    // Overdue: Red gradient (more red as days overdue increase)
    const intensityDays = Math.min(Math.abs(days), 10);
    const intensity = intensityDays / 10;
    const red = Math.round(255);
    const green = Math.round(200 * (1 - intensity));
    const blue = Math.round(200 * (1 - intensity));
    return {
      backgroundColor: `rgb(${red}, ${green}, ${blue})`,
      color: intensity > 0.6 ? "#fff" : "#000",
    };
  } else if (days > 0) {
    // Remaining days: Green gradient (more green as days remaining increase)
    const intensityDays = Math.min(days, 30);
    const intensity = intensityDays / 30;
    const red = Math.round(200 * (1 - intensity));
    const green = Math.round(255);
    const blue = Math.round(200 * (1 - intensity));
    return {
      backgroundColor: `rgb(${red}, ${green}, ${blue})`,
      color: intensity > 0.5 ? "#fff" : "#000",
    };
  } else {
    // Today: Yellow/Orange
    return {
      backgroundColor: "#ffbe0b",
      color: "#000",
    };
  }
}

function updateEventCards(sites) {
  // Show all unique sitelabel values
  const uniqueLabels = [
    ...new Set(sites.map((s) => s.sitelabel).filter(Boolean)),
  ];

  // Show sites that have VVVIP in sitelabel
  const sitesWithVVVIP = sites.filter(
    (s) => s.sitelabel && s.sitelabel.toUpperCase().includes("VVVIP"),
  );

  const vvvipSites = sites.filter((s) => isVVVIPSite(s));

  document.getElementById("vvvipCount").textContent = vvvipSites.length;
}

window.showVVVIPModal = function showVVVIPModal() {
  const modal = document.getElementById("vvvipModal");
  const tbody = document.getElementById("vvvipTableBody");
  tbody.innerHTML = "";

  const vvvipSites = sitesData.filter((s) => isVVVIPSite(s));

  if (vvvipSites.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" style="text-align: center; color: #999; padding: 20px;">No VVVIP sites</td></tr>';
  } else {
    vvvipSites.forEach((site) => {
      const tr = document.createElement("tr");

      let rowColor = "#f3f0ff";
      if (site.status === "due") {
        rowColor = "#ffebee";
      } else if (site.status === "today") {
        rowColor = "#fff8e1";
      } else if (site.status === "coming3") {
        rowColor = "#fff8e1";
      } else if (site.status === "next15") {
        rowColor = "#e8f5e9";
      }

      tr.style.backgroundColor = rowColor;

      const gradientStyle = getGradientStyleForFuelDate(site.days);
      const siteName = document.createElement("td");
      siteName.textContent = site.sitename;

      const fuelDateCell = document.createElement("td");
      fuelDateCell.textContent = site.nextfuelingplan || "N/A";
      fuelDateCell.style.backgroundColor = gradientStyle.backgroundColor;
      fuelDateCell.style.color = gradientStyle.color;
      fuelDateCell.style.padding = "8px";
      fuelDateCell.style.fontWeight = "500";

      const siteLabel = document.createElement("td");
      siteLabel.textContent = site.sitelabel || "N/A";

      tr.appendChild(siteName);
      tr.appendChild(fuelDateCell);
      tr.appendChild(siteLabel);
      tbody.appendChild(tr);
    });
  }

  modal.style.display = "block";
};

window.closeVVVIPModal = function closeVVVIPModal() {
  const modal = document.getElementById("vvvipModal");
  modal.style.display = "none";
};

window.addEventListener("click", (event) => {
  const vvvipModal = document.getElementById("vvvipModal");

  if (event.target === vvvipModal) {
    closeVVVIPModal();
  }
});

window.selectRegion = function selectRegion(region) {
  selectedRegion = region;

  // Save last selected region for remember-me restoration
  localStorage.setItem("last_selected_region", region);

  // Update active tab styling
  document.querySelectorAll(".region-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  if (event && event.target) {
    event.target.classList.add("active");
  }

  // Update event cards visibility based on region
  const eventCardsContainer = document.getElementById("eventCardsContainer");
  if (region === "East") {
    eventCardsContainer.style.display = "none";
  } else {
    eventCardsContainer.style.display = "flex";
  }

  // Reload dashboard with new region filter
  loadDashboard();
};

function isInSelectedRegion(site) {
  if (!site.regionname) {
    return false;
  }
  const regionLower = site.regionname.toLowerCase().trim();
  if (selectedRegion === "CER") {
    return regionLower.includes("central") || regionLower.includes("east");
  }
  return regionLower.includes(selectedRegion.toLowerCase());
}

function startDashboard() {
  startDashboardAsync();
}

async function backgroundSyncData() {
  try {
    // Check network connectivity before syncing
    if (!navigator.onLine) {
      return;
    }

    // Silently fetch latest CSV data with shorter timeout
    let rawData = [];
    try {
      rawData = await Promise.race([
        fetchCSV(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("CSV fetch timeout")), 5000),
        ),
      ]).catch((err) => {
        // Log for debugging but don't throw
        if (err && err.message && !err.message.includes("Failed to fetch")) {
          console.debug("[backgroundSyncData] Fetch error:", err.message);
        }
        return [];
      });
    } catch (csvErr) {
      // Catch any errors and silently return
      console.debug(
        "[backgroundSyncData] CSV fetch exception:",
        csvErr?.message,
      );
      return;
    }

    if (rawData.length === 0) {
      return;
    }

    // Filter and validate sites
    const newSitesData = filterAndValidateSites(rawData);

    // Check if data has changed compared to current sitesData
    const dataChanged = hasDataChanged(sitesData, newSitesData);

    if (dataChanged) {
      sitesData = newSitesData;

      // Soft update: only update metrics and tables, not the map
      try {
        updateMetrics(sitesData);
        populateDueTable(sitesData);
        updateEventCards(sitesData);
        addMarkersToMap(sitesData);
      } catch (uiErr) {
        // Silent fail - don't disrupt the application
      }
    }
  } catch (error) {
    // Silent fail - don't disrupt the application
  }
}

function hasDataChanged(oldData, newData) {
  // Check if the number of sites changed
  if (oldData.length !== newData.length) {
    return true;
  }

  // Create maps for easier comparison
  const oldMap = {};
  const newMap = {};

  oldData.forEach((site) => {
    oldMap[site.sitename] = site;
  });

  newData.forEach((site) => {
    newMap[site.sitename] = site;
  });

  // Check if any site data changed
  for (const sitename in newMap) {
    const oldSite = oldMap[sitename];
    const newSite = newMap[sitename];

    if (!oldSite) {
      return true; // New site added
    }

    // Check all important fields for changes
    if (
      oldSite.status !== newSite.status ||
      oldSite.days !== newSite.days ||
      oldSite.nextfuelingplan !== newSite.nextfuelingplan ||
      oldSite.lastfuelingdate !== newSite.lastfuelingdate ||
      oldSite.cityname !== newSite.cityname ||
      oldSite.lastfuelingqty !== newSite.lastfuelingqty ||
      oldSite.color !== newSite.color
    ) {
      return true;
    }
  }

  // Check if any old site was removed
  for (const sitename in oldMap) {
    if (!newMap[sitename]) {
      return true;
    }
  }

  return false;
}

// Screenshot Export Functions
window.downloadTableScreenshot = async function downloadTableScreenshot(
  tableBodyId,
  tableName,
) {
  try {
    const tableBody = document.getElementById(tableBodyId);
    if (!tableBody) {
      alert("Table not found");
      return;
    }

    // Get the parent table element
    const table = tableBody.closest(".sites-table");
    if (!table) {
      alert("Could not find table element");
      return;
    }

    // Create a container to hold the table for screenshot
    const container = document.createElement("div");
    container.style.cssText = `
      position: fixed;
      left: -9999px;
      top: -9999px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 900px;
    `;

    // Clone the entire table (including headers)
    const tableClone = table.cloneNode(true);
    tableClone.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      font-family: Arial, sans-serif;
      font-size: 12px;
    `;

    // Style the cloned table for better appearance
    const thead = tableClone.querySelector("thead");
    if (thead) {
      thead.style.cssText = `
        display: table-header-group;
        background: linear-gradient(135deg, #202b6d 0%, #1a1f4d 100%);
        color: white;
      `;
      const theadRows = thead.querySelectorAll("tr");
      theadRows.forEach((row) => {
        row.style.cssText = `
          background: linear-gradient(135deg, #202b6d 0%, #1a1f4d 100%);
          color: white;
        `;
        const ths = row.querySelectorAll("th");
        ths.forEach((th) => {
          th.style.cssText = `
            padding: 14px 12px;
            text-align: center;
            font-weight: 600;
            border: 1px solid #1a1f4d;
            color: white;
            background: linear-gradient(135deg, #202b6d 0%, #1a1f4d 100%);
          `;
        });
      });
    }

    const tbody = tableClone.querySelector("tbody");
    if (tbody) {
      const tbodyRows = tbody.querySelectorAll("tr");
      tbodyRows.forEach((row, index) => {
        row.style.cssText = `
          background: ${index % 2 === 0 ? "#f9fbff" : "white"};
          border-bottom: 1px solid #e2e8f0;
        `;
        const tds = row.querySelectorAll("td");
        tds.forEach((td) => {
          td.style.cssText = `
            padding: 12px 10px;
            text-align: center;
            border: 1px solid #e2e8f0;
          `;
        });
      });
    }

    container.appendChild(tableClone);
    document.body.appendChild(container);

    // Capture the table as image
    const canvas = await html2canvas(container, {
      allowTaint: true,
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff",
    });

    // Generate filename with date and table name
    const now = new Date();
    const dateStr = now
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");
    const timeStr = now
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
      .replace(/:/g, "-");
    const filename = `${tableName}_${dateStr}_${timeStr}.png`;

    // Download the image
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    document.body.removeChild(container);
  } catch (error) {
    alert("Failed to download screenshot. Please try again.");
  }
};

// Invoicing Module Functions
let invoiceData = [];
let filteredInvoiceData = [];

window.showInvoiceModal = async function showInvoiceModal() {
  try {
    const modal = document.getElementById("invoiceModal");
    if (!modal) {
      console.error("Invoice modal not found");
      return;
    }

    modal.style.display = "flex";
    document.getElementById("invoiceSiteName").value = "";
    await loadInvoiceData();
    window.applyInvoiceFilters();
  } catch (error) {
    console.error("Error showing invoice modal:", error);
  }
};

window.closeInvoiceModal = function closeInvoiceModal() {
  document.getElementById("invoiceModal").style.display = "none";
};

// Helper function to parse dates from various formats and return as YYYY-MM-DD string
// Handles Google Sheets text dates, Excel serial numbers, and common formats
// This is used in both parseInvoiceCSV and applyInvoiceFilters for consistency
function parseDateToString(dateStr) {
  if (!dateStr && dateStr !== 0) return null;

  // Convert to string if needed
  let str = String(dateStr).trim();
  if (!str) return null;

  // Silently skip Excel error codes and invalid values
  if (
    str === "#N/A" ||
    str === "#REF!" ||
    str === "#VALUE!" ||
    str === "#ERROR!"
  ) {
    return null;
  }

  // Try ISO format first (YYYY-MM-DD or YYYY-MM-DD HH:MM:SS)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.substring(0, 10);
  }

  // Try numeric Excel serial date (Google Sheets may export as number)
  const numValue = Number(str);
  if (!isNaN(numValue) && numValue > 0) {
    // Excel serial dates start at 1 (Jan 1, 1900)
    if (numValue > 30000 && numValue < 50000) {
      const excelDate = new Date((numValue - 25569) * 86400 * 1000); // Convert Excel serial to JS date
      if (!isNaN(excelDate.getTime())) {
        const year = excelDate.getFullYear();
        const month = String(excelDate.getMonth() + 1).padStart(2, "0");
        const day = String(excelDate.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    }
  }

  // Try slash-separated format (MM/DD/YYYY or DD/MM/YYYY)
  const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashMatch) {
    const first = parseInt(slashMatch[1]);
    const second = parseInt(slashMatch[2]);
    let year = parseInt(slashMatch[3]);

    // Handle 2-digit years
    if (year < 100) {
      year = year < 30 ? 2000 + year : 1900 + year;
    }

    let month, day;

    // If first part > 12, it must be day (DD/MM format)
    if (first > 12) {
      day = first;
      month = second;
    }
    // If second part > 12, it must be day (MM/DD format)
    else if (second > 12) {
      month = first;
      day = second;
    }
    // Both could be valid for either format, assume DD/MM (international format)
    else {
      day = first;
      month = second;
    }

    // Validate
    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31 &&
      year >= 1900 &&
      year <= 2100
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // Try dash-separated format (DD-MM-YYYY or MM-DD-YYYY)
  const dashMatch = str.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
  if (dashMatch) {
    const first = parseInt(dashMatch[1]);
    const second = parseInt(dashMatch[2]);
    let year = parseInt(dashMatch[3]);

    if (year < 100) {
      year = year < 30 ? 2000 + year : 1900 + year;
    }

    let month, day;

    // If first part > 12, it must be day (DD-MM format)
    if (first > 12) {
      day = first;
      month = second;
    }
    // If second part > 12, it must be day (MM-DD format)
    else if (second > 12) {
      month = first;
      day = second;
    }
    // Ambiguous - assume DD-MM (international format)
    else {
      day = first;
      month = second;
    }

    // Validate
    if (
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= 31 &&
      year >= 1900 &&
      year <= 2100
    ) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  // Try JavaScript's built-in Date parser
  try {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();
      const month = String(parsed.getMonth() + 1).padStart(2, "0");
      const day = String(parsed.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // Fall through
  }

  return null;
}

async function loadInvoiceData() {
  console.log("Loading invoice data from:", INVOICE_CSV_URL);
  const CORS_PROXIES = [
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
  ];

  try {
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      try {
        let proxyUrl;
        if (CORS_PROXIES[i].includes("?")) {
          proxyUrl = CORS_PROXIES[i] + INVOICE_CSV_URL;
        } else {
          proxyUrl = CORS_PROXIES[i] + encodeURIComponent(INVOICE_CSV_URL);
        }

        console.log("Trying proxy:", CORS_PROXIES[i]);

        try {
          let fetchPromise;
          try {
            fetchPromise = fetch(proxyUrl, {
              method: "GET",
              headers: {
                Accept: "text/plain",
              },
            }).catch((err) => {
              // Immediately catch to prevent unhandled rejection
              return Promise.reject(err);
            });
          } catch (err) {
            fetchPromise = Promise.reject(err);
          }

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error("timeout")), 8000);
          });

          try {
            const response = await Promise.race([fetchPromise, timeoutPromise]);

            if (response.ok) {
              const csvText = await response.text();
              console.log("CSV fetched successfully, length:", csvText.length);
              if (csvText.trim()) {
                invoiceData = parseInvoiceCSV(csvText);
                console.log("Invoice data loaded:", invoiceData.length, "rows");
                return;
              }
            }
          } catch (fetchError) {
            if (fetchError.message !== "timeout") {
              console.log("Proxy fetch failed:", fetchError.message);
            }
          }
        } catch (error) {
          console.debug("Proxy error:", error.message);
        }
      } catch (proxyError) {
        console.log("Proxy setup failed:", proxyError.message);
      }
    }

    try {
      console.log("Trying direct fetch (no proxy)");

      let fetchPromise;
      try {
        fetchPromise = fetch(INVOICE_CSV_URL, {
          method: "GET",
          mode: "cors",
        }).catch((err) => {
          // Immediately catch to prevent unhandled rejection
          return Promise.reject(err);
        });
      } catch (err) {
        fetchPromise = Promise.reject(err);
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("timeout")), 8000);
      });

      try {
        const response = await Promise.race([fetchPromise, timeoutPromise]);

        if (response.ok) {
          const csvText = await response.text();
          console.log("CSV fetched directly, length:", csvText.length);
          if (csvText.trim()) {
            invoiceData = parseInvoiceCSV(csvText);
            console.log("Invoice data loaded:", invoiceData.length, "rows");
            return;
          }
        } else {
          console.debug("Direct fetch failed with status:", response.status);
        }
      } catch (fetchError) {
        if (fetchError.message !== "timeout") {
          console.debug("Direct fetch error:", fetchError.message);
        }
      }
    } catch (error) {
      console.debug("Invoice data loading fallback:", error.message);
    }
  } catch (error) {
    console.debug("Invoice loading outer catch:", error.message);
  }

  console.warn("No invoice data loaded, invoiceData set to empty array");
  invoiceData = [];
}

function parseInvoiceCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const headerLower = headers.map((h) => h.toLowerCase());
  const data = [];

  // Find column indices - handle different possible header names
  const siteNameIndex = headerLower.findIndex(
    (h) => h === "sitename" || h === "site name" || h === "site_name",
  );
  const regionIndex = headerLower.findIndex((h) => h === "region");
  const dateIndex = headerLower.findIndex(
    (h) =>
      h === "lastfuelingdate" ||
      h === "last fueling date" ||
      h === "last_fueling_date",
  );
  const qtyIndex = headerLower.findIndex(
    (h) =>
      h === "lastfuelingqty" ||
      h === "lastfuelingquantity" ||
      h === "last fueling qty" ||
      h === "last fueling quantity",
  );

  console.log("Invoice CSV Headers:", headers);
  console.log(
    "Column indices - Site:",
    siteNameIndex,
    "Region:",
    regionIndex,
    "Date:",
    dateIndex,
    "Qty:",
    qtyIndex,
  );

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = parseCSVLine(line);
    const sitename =
      siteNameIndex >= 0 ? (values[siteNameIndex] || "").trim() : "";
    const region = regionIndex >= 0 ? (values[regionIndex] || "").trim() : "";
    const lastfuelingdate =
      dateIndex >= 0 ? (values[dateIndex] || "").trim() : "";
    const lastfuelingqty = qtyIndex >= 0 ? (values[qtyIndex] || "").trim() : "";

    // Validate required fields
    if (sitename && lastfuelingdate && lastfuelingqty) {
      // Use the same robust date parsing as applyInvoiceFilters
      const parsedDate = parseDateToString(lastfuelingdate);
      const quantity = parseFloat(lastfuelingqty);

      // Only include if we have a valid date and valid positive quantity
      if (parsedDate && !isNaN(quantity) && quantity > 0) {
        data.push({
          sitename,
          region,
          lastfuelingdate,
          lastfuelingquantity: quantity,
        });
      }
    }
  }

  console.log("Parsed invoice data:", data.length, "rows");
  // Log comprehensive debugging info
  if (data.length > 0) {
    console.log("First row:", data[0]);
    console.log("Last row:", data[data.length - 1]);

    // Sample all rows to show date format
    const maxToLog = Math.min(20, data.length);
    console.log(`First ${maxToLog} rows with dates:`);
    for (let i = 0; i < maxToLog; i++) {
      const row = data[i];
      console.log(
        `  [${i}] ${row.sitename} | Date: "${row.lastfuelingdate}" | Qty: ${row.lastfuelingquantity}`,
      );
    }

    // Count rows by month
    const monthCounts = {};
    const noDateCount = { empty: 0, null: 0 };
    data.forEach((row) => {
      const dateStr = row.lastfuelingdate;
      if (!dateStr) {
        noDateCount.empty++;
        return;
      }

      // Extract month from various formats
      let month = null;
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        month = dateStr.substring(5, 7);
      } else if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
        // DD/MM/YYYY
        month = dateStr.substring(3, 5);
      } else if (/^\d{2}-\d{2}-\d{4}/.test(dateStr)) {
        month = dateStr.substring(3, 5);
      }

      if (month) {
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });
    console.log("Rows with dates by month:", monthCounts);
    console.log("Rows with missing dates:", noDateCount);
  }
  return data;
}

window.applyInvoiceFilters = function applyInvoiceFilters() {
  const startDate = document.getElementById("invoiceStartDate").value;
  const endDate = document.getElementById("invoiceEndDate").value;
  const region = document.getElementById("invoiceRegion").value;
  const siteName = document
    .getElementById("invoiceSiteName")
    .value.toLowerCase()
    .trim();

  console.log(
    "Applying filters - Start:",
    startDate,
    "End:",
    endDate,
    "Region:",
    region,
    "Site Name:",
    siteName,
  );
  console.log("Total invoice data rows:", invoiceData.length);

  // Log sample raw data to understand the structure
  if (invoiceData.length > 0) {
    console.log("First 3 raw invoice rows:");
    invoiceData.slice(0, 3).forEach((row, i) => {
      console.log(
        `  [${i}] ${row.sitename} | ${row.lastfuelingdate} | ${row.region} | ${row.lastfuelingquantity}`,
      );
    });
  }

  filteredInvoiceData = invoiceData.filter((row) => {
    // Apply site name filter if provided
    if (siteName && siteName !== "") {
      if (!row.sitename.toLowerCase().includes(siteName)) {
        return false;
      }
    }

    // Apply region filter if selected
    if (region && region !== "") {
      const rowRegion = row.region.toLowerCase();
      const filterRegion = region.toLowerCase();

      if (filterRegion === "cer") {
        if (!rowRegion.includes("central") && !rowRegion.includes("east")) {
          return false;
        }
      } else {
        if (!rowRegion.includes(filterRegion)) {
          return false;
        }
      }
    }

    // If no date filters, include all rows (capture all Column AE data)
    if (!startDate && !endDate) {
      return true;
    }

    // Parse the row date - only matters when date filter is active
    const rowDateStr = parseDateToString(row.lastfuelingdate);

    // If we can't parse the date and date filtering is active, still try to include it
    // (better to show data that might be valid than hide it)
    if (!rowDateStr) {
      // When date filtering is active but we can't parse, include anyway if date field is non-empty
      if (row.lastfuelingdate) {
        console.debug(
          `Could not fully parse date "${row.lastfuelingdate}" for ${row.sitename}, but including anyway`,
        );
        return true;
      }
      return false;
    }

    // Log first 10 parsed dates for debugging
    const rowIndex = invoiceData.indexOf(row);
    if (
      rowIndex < 10 ||
      (startDate &&
        rowDateStr >= startDate &&
        endDate &&
        rowDateStr <= endDate &&
        rowIndex < 20)
    ) {
      console.log(
        `[${rowIndex}] Site=${row.sitename}, CSV="${row.lastfuelingdate}", Parsed="${rowDateStr}", InRange=${!startDate || rowDateStr >= startDate} && ${!endDate || rowDateStr <= endDate}`,
      );
    }

    // Apply date range filters with parsed date
    if (startDate && rowDateStr < startDate) {
      return false;
    }

    if (endDate && rowDateStr > endDate) {
      return false;
    }

    return true;
  });

  console.log(
    `Filter results: ${filteredInvoiceData.length} rows (from ${invoiceData.length} total)`,
  );
  console.log(
    `Filters applied - Start: "${startDate}", End: "${endDate}", Region: "${region}"`,
  );

  // Debug: analyze why rows are excluded
  if (invoiceData.length > filteredInvoiceData.length) {
    const excluded = [];
    invoiceData.forEach((row) => {
      const isInFiltered = filteredInvoiceData.some(
        (fr) => fr.sitename === row.sitename,
      );
      if (!isInFiltered) {
        const dateStr = parseDateToString(row.lastfuelingdate);
        excluded.push({
          site: row.sitename,
          rawDate: row.lastfuelingdate,
          parsedDate: dateStr,
          region: row.region,
        });
      }
    });
    console.log(`Excluded ${excluded.length} rows. First 10 excluded:`);
    excluded.slice(0, 10).forEach((row) => {
      console.log(
        `  ${row.site} | Raw: "${row.rawDate}" | Parsed: "${row.parsedDate}" | Region: ${row.region}`,
      );
    });
  }

  if (filteredInvoiceData.length > 0 && filteredInvoiceData.length <= 50) {
    console.log(`All ${filteredInvoiceData.length} matching rows:`);
    filteredInvoiceData.forEach((row, i) => {
      const parsed = parseDateToString(row.lastfuelingdate);
      console.log(
        `  [${i}] ${row.sitename} | ${row.lastfuelingdate} (→ ${parsed}) | ${row.region}`,
      );
    });
  }

  displayInvoiceTable();
  updateInvoiceSummary();
};

function displayInvoiceTable() {
  const tbody = document.getElementById("invoiceTableBody");
  tbody.innerHTML = "";

  filteredInvoiceData.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHTML(row.sitename)}</td>
      <td>${escapeHTML(row.region)}</td>
      <td>${escapeHTML(row.lastfuelingdate)}</td>
      <td>${row.lastfuelingquantity.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function updateInvoiceSummary() {
  const rowCount = filteredInvoiceData.length;
  const totalQty = filteredInvoiceData.reduce(
    (sum, row) => sum + row.lastfuelingquantity,
    0,
  );

  document.getElementById("invoiceRowCount").textContent = rowCount;
  document.getElementById("invoiceTotalQty").textContent = totalQty.toFixed(2);
}

window.downloadInvoiceExcel = function downloadInvoiceExcel() {
  const startDate = document.getElementById("invoiceStartDate").value || "All";
  const endDate = document.getElementById("invoiceEndDate").value || "All";
  const region = document.getElementById("invoiceRegion").value || "All";

  const filename = `invoice_${startDate}_to_${endDate}_${region}.xlsx`;

  const wsData = [
    ["Site Name", "Region", "Last Fueling Date", "Last Fueling Qty"],
    ...filteredInvoiceData.map((row) => [
      row.sitename,
      row.region,
      row.lastfuelingdate,
      row.lastfuelingquantity,
    ]),
    [],
    ["Total Rows:", filteredInvoiceData.length],
    [
      "Total Quantity:",
      filteredInvoiceData
        .reduce((sum, row) => sum + row.lastfuelingquantity, 0)
        .toFixed(2),
    ],
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoice");

  // Set column widths
  ws["!cols"] = [{ wch: 20 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];

  XLSX.writeFile(wb, filename);
};

// ==========================================
// CER FUELING ANALYSIS - Secured Feature
// ==========================================

const ANALYSIS_CREDENTIALS = {
  username: "Admin",
  password: "Aces@6343",
};

// URLs for analysis data sources
const INVOICE_ARCHIVE_URL =
  "https://script.google.com/macros/s/AKfycbxU7WENKAEkhJnBvCPbcGqiwZbUr5ZTT93Gfpw6AmiP7lPYfGUobDpOZh1qvppYgF3RVw/exec";
const ENERGY_DASHBOARD_URL =
  "https://script.google.com/macros/s/AKfycbxU7WENKAEkhJnBvCPbcGqiwZbUr5ZTT93Gfpw6AmiP7lPYfGUobDpOZh1qvppYgF3RVw/exec";

let analysisAuthSession = null;
let analysisData = {
  invoiceArchive: [],
  energyDashboard: [],
};
let fuelingChartInstance = null;

// Global functions for inline onclick handlers
window.openAnalysisModal = function openAnalysisModal() {
  const authModal = document.getElementById("analysisAuthModal");
  if (authModal) {
    authModal.style.display = "flex";
    document.getElementById("analysisAuthError").style.display = "none";
    document.getElementById("analysisUsername").value = "";
    document.getElementById("analysisPassword").value = "";
  }
};

window.closeAnalysisAuthModal = function closeAnalysisAuthModal() {
  const authModal = document.getElementById("analysisAuthModal");
  if (authModal) {
    authModal.style.display = "none";
  }
  const errorMsg = document.getElementById("analysisAuthError");
  if (errorMsg) {
    errorMsg.style.display = "none";
  }
};

window.expandAnalysisModal = function expandAnalysisModal() {
  const modal = document.getElementById("analysisModal");
  if (modal) {
    modal.classList.add("analysis-modal-expanded");
    document.getElementById("analysisExpandBtn").style.display = "none";
    document.getElementById("analysisMinimizeBtn").style.display = "block";
  }
};

window.minimizeAnalysisModal = function minimizeAnalysisModal() {
  const modal = document.getElementById("analysisModal");
  if (modal) {
    modal.classList.remove("analysis-modal-expanded");
    document.getElementById("analysisExpandBtn").style.display = "block";
    document.getElementById("analysisMinimizeBtn").style.display = "none";
  }
};

window.closeAnalysisModal = function closeAnalysisModal() {
  const modal = document.getElementById("analysisModal");
  if (modal) {
    modal.style.display = "none";
    modal.classList.remove("analysis-modal-expanded");
  }
  document.getElementById("analysisExpandBtn").style.display = "block";
  document.getElementById("analysisMinimizeBtn").style.display = "none";
  analysisAuthSession = null;
  if (fuelingChartInstance) {
    fuelingChartInstance.destroy();
    fuelingChartInstance = null;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const analysisAuthForm = document.getElementById("analysisAuthForm");
  if (analysisAuthForm) {
    analysisAuthForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleAnalysisLogin();
    });
  }

  const analysisModal = document.getElementById("analysisAuthModal");
  const analysisDataModal = document.getElementById("analysisModal");

  window.addEventListener("click", (e) => {
    if (e.target === analysisModal) {
      closeAnalysisAuthModal();
    }
    if (e.target === analysisDataModal) {
      closeAnalysisModal();
    }
  });

  // Add event listeners for analysis filters
  const filterInputs = [
    "analysis1Filter",
    "analysis2Filter",
    "analysis3Filter",
  ];
  const filterSelects = ["analysis1Status", "analysis2Status"];

  filterInputs.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", () => {
        const analysisId = id.replace("Filter", "");
        applyAnalysisFilters(analysisId);
      });
    }
  });

  filterSelects.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", () => {
        const analysisId = id.replace("Status", "");
        applyAnalysisFilters(analysisId);
      });
    }
  });
});

window.handleAnalysisLogin = async function handleAnalysisLogin() {
  const username = document.getElementById("analysisUsername").value.trim();
  const password = document.getElementById("analysisPassword").value;
  const errorMsg = document.getElementById("analysisAuthError");

  if (!username || !password) {
    errorMsg.textContent = "Please enter both username and password";
    errorMsg.style.display = "block";
    return;
  }

  if (
    username === ANALYSIS_CREDENTIALS.username &&
    password === ANALYSIS_CREDENTIALS.password
  ) {
    errorMsg.style.display = "none";
    analysisAuthSession = {
      username: username,
      timestamp: Date.now(),
    };

    // Close auth modal and open analysis modal
    closeAnalysisAuthModal();
    document.getElementById("analysisModal").style.display = "flex";

    // Reset to first tab
    switchAnalysisTab("analysis1");

    // Load analysis data
    loadAnalysisData();
  } else {
    errorMsg.textContent = "Invalid username or password";
    errorMsg.style.display = "block";
    document.getElementById("analysisPassword").value = "";
  }
};

async function loadAnalysisData() {
  try {
    showAnalysisLoading(true);

    // Fetch both data sources in parallel
    const [invoiceData, energyData] = await Promise.all([
      fetchInvoiceArchiveData(),
      fetchEnergyDashboardData(),
    ]);

    analysisData.invoiceArchive = invoiceData;
    analysisData.energyDashboard = energyData;

    // Generate analyses
    generateAnalysis1();
    generateAnalysis2();
    generateAnalysis3();
    generateFuelingChart();
    analyzeDiscrepancies();

    showAnalysisLoading(false);
  } catch (error) {
    console.error("Error loading analysis data:", error);
    showAnalysisLoading(false);
    document.getElementById("analysis1NoData").style.display = "block";
  }
}

async function fetchInvoiceArchiveData() {
  try {
    const csvUrl = INVOICE_ARCHIVE_URL + "&t=" + Date.now();
    const CORS_PROXIES = [
      "https://corsproxy.io/?",
      "https://api.codetabs.com/v1/proxy?quest=",
    ];

    for (let i = 0; i < CORS_PROXIES.length; i++) {
      try {
        let proxyUrl;
        if (CORS_PROXIES[i].includes("?")) {
          proxyUrl = CORS_PROXIES[i] + csvUrl;
        } else {
          proxyUrl = CORS_PROXIES[i] + encodeURIComponent(csvUrl);
        }

        const response = await fetch(proxyUrl, {
          method: "GET",
          headers: {
            Accept: "text/plain",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (response.ok) {
          const csvText = await response.text();
          if (csvText.trim()) {
            return parseInvoiceArchiveCSV(csvText);
          }
        }
      } catch (proxyError) {
        continue;
      }
    }

    try {
      const response = await fetch(csvUrl, {
        method: "GET",
        mode: "cors",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (response.ok) {
        const csvText = await response.text();
        if (csvText.trim()) {
          return parseInvoiceArchiveCSV(csvText);
        }
      }
    } catch (error) {
      console.error("Direct fetch failed:", error);
    }

    return [];
  } catch (error) {
    console.error("Error fetching invoice archive:", error);
    return [];
  }
}

async function fetchEnergyDashboardData() {
  try {
    const csvUrl = ENERGY_DASHBOARD_URL + "&t=" + Date.now();
    const CORS_PROXIES = [
      "https://corsproxy.io/?",
      "https://api.codetabs.com/v1/proxy?quest=",
    ];

    // Wrap entire function with timeout
    return await Promise.race([
      fetchEnergyDashboardWithProxies(csvUrl, CORS_PROXIES),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Energy dashboard fetch timeout")),
          10000,
        ),
      ),
    ]).catch(() => []);
  } catch (error) {
    return [];
  }
}

async function fetchEnergyDashboardWithProxies(csvUrl, CORS_PROXIES) {
  try {
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      try {
        let proxyUrl;
        if (CORS_PROXIES[i].includes("?")) {
          proxyUrl = CORS_PROXIES[i] + csvUrl;
        } else {
          proxyUrl = CORS_PROXIES[i] + encodeURIComponent(csvUrl);
        }

        let fetchPromise;
        try {
          fetchPromise = fetch(proxyUrl, {
            method: "GET",
            headers: {
              Accept: "text/plain",
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          });
        } catch (fetchErr) {
          continue;
        }

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("proxy_timeout")), 3000);
        });

        const response = await Promise.race([
          fetchPromise.catch(() => null),
          timeoutPromise,
        ]).catch(() => null);

        if (response && response.ok) {
          try {
            const csvText = await response.text();
            if (csvText.trim()) {
              return parseEnergyDashboardCSV(csvText);
            }
          } catch (textErr) {
            continue;
          }
        }
      } catch (proxyError) {
        continue;
      }
    }

    try {
      let fetchPromise;
      try {
        fetchPromise = fetch(csvUrl, {
          method: "GET",
          mode: "cors",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
      } catch (fetchErr) {
        return [];
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("direct_timeout")), 3000);
      });

      const response = await Promise.race([
        fetchPromise.catch(() => null),
        timeoutPromise,
      ]).catch(() => null);

      if (response && response.ok) {
        try {
          const csvText = await response.text();
          if (csvText.trim()) {
            return parseEnergyDashboardCSV(csvText);
          }
        } catch (textErr) {
          return [];
        }
      }
    } catch (error) {
      // Silent fail
    }

    return [];
  } catch (error) {
    return [];
  }
}

function parseInvoiceArchiveCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const headerLower = headers.map((h) => h.toLowerCase());
  const data = [];

  const siteNameIndex = headerLower.findIndex(
    (h) => h === "sitename" || h === "site name" || h === "site_name",
  );
  const qtyIndex = headerLower.findIndex(
    (h) =>
      h === "fuelquantity" ||
      h === "fuel quantity" ||
      h === "qty" ||
      h === "quantity" ||
      h === "lastfuelingqty" ||
      h === "lastfuelingquantity" ||
      h === "d",
  );
  const invoiceDateIndex = headerLower.findIndex(
    (h) =>
      h === "invoicedate" ||
      h === "invoice date" ||
      h === "fuelingdate" ||
      h === "fueling date" ||
      h === "lastfuelingdate" ||
      h === "last fueling date" ||
      h === "c",
  );

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = parseCSVLine(line);
    const sitename =
      siteNameIndex >= 0 ? (values[siteNameIndex] || "").trim() : "";
    const quantity = qtyIndex >= 0 ? (values[qtyIndex] || "").trim() : "";
    const invoiceDate =
      invoiceDateIndex >= 0 ? (values[invoiceDateIndex] || "").trim() : "";

    if (sitename && quantity && invoiceDate) {
      const qty = parseFloat(quantity);
      if (!isNaN(qty) && qty > 0) {
        data.push({
          sitename: sitename,
          fuelquantity: qty,
          invoicedate: invoiceDate,
          fuelingdate: invoiceDate,
          lastfuelingdate: invoiceDate,
        });
      }
    }
  }

  return data;
}

function parseEnergyDashboardCSV(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const headerLower = headers.map((h) => h.toLowerCase());
  const data = [];

  const siteNameIndex = headerLower.findIndex(
    (h) => h === "sitename" || h === "site name" || h === "site_name",
  );

  // Column mappings (0-indexed)
  // AG = 32 (Before Fueling Qty - quantity before refueling)
  // AH = 33 (Tank Capacity)
  // J = 9 (COW Status)

  const statusIndex =
    headerLower.findIndex(
      (h) =>
        h === "cowstatus" ||
        h === "cow status" ||
        h === "status" ||
        h === "j" ||
        h.includes("column j"),
    ) >= 0
      ? headerLower.findIndex(
          (h) =>
            h === "cowstatus" ||
            h === "cow status" ||
            h === "status" ||
            h === "j" ||
            h.includes("column j"),
        )
      : 9;

  const beforeFuelingQtyIndex =
    headerLower.findIndex(
      (h) =>
        h.includes("before fueling") ||
        h.includes("before refueling") ||
        h.includes("qty before") ||
        h === "ag" ||
        h.includes("column ag"),
    ) >= 0
      ? headerLower.findIndex(
          (h) =>
            h.includes("before fueling") ||
            h.includes("before refueling") ||
            h.includes("qty before") ||
            h === "ag" ||
            h.includes("column ag"),
        )
      : 32;

  const tankCapacityIndex =
    headerLower.findIndex(
      (h) =>
        h.includes("tank capacity") ||
        h.includes("tank quantity") ||
        h === "ah" ||
        h.includes("column ah"),
    ) >= 0
      ? headerLower.findIndex(
          (h) =>
            h.includes("tank capacity") ||
            h.includes("tank quantity") ||
            h === "ah" ||
            h.includes("column ah"),
        )
      : 33;

  const lastFuelingDateIndex =
    headerLower.findIndex(
      (h) =>
        h.includes("last fueling date") ||
        h.includes("planned") ||
        h.includes("fueling date") ||
        h === "ae" ||
        h.includes("column ae"),
    ) >= 0
      ? headerLower.findIndex(
          (h) =>
            h.includes("last fueling date") ||
            h.includes("planned") ||
            h.includes("fueling date") ||
            h === "ae" ||
            h.includes("column ae"),
        )
      : 30;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const values = parseCSVLine(line);
    const sitename =
      siteNameIndex >= 0 ? (values[siteNameIndex] || "").trim() : "";
    const status =
      statusIndex >= 0 ? (values[statusIndex] || "").trim().toUpperCase() : "";
    const beforeFuelingQty =
      beforeFuelingQtyIndex >= 0
        ? (values[beforeFuelingQtyIndex] || "").trim()
        : "";
    const tankCapacity =
      tankCapacityIndex >= 0 ? (values[tankCapacityIndex] || "").trim() : "";
    const lastFuelingDate =
      lastFuelingDateIndex >= 0
        ? (values[lastFuelingDateIndex] || "").trim()
        : "";

    if (sitename) {
      const beforeQtyValue = parseFloat(beforeFuelingQty);
      const tankCapacityValue = parseFloat(tankCapacity);

      data.push({
        sitename: sitename,
        status: status || "",
        beforefuelingqty: !isNaN(beforeQtyValue) ? beforeQtyValue : 0,
        tankcapacity: !isNaN(tankCapacityValue) ? tankCapacityValue : 0,
        lastfuelingdate: lastFuelingDate || "",
      });
    }
  }

  return data;
}

function generateAnalysis1() {
  // Analysis 1: Highest Fueling Quantity vs Consumption
  const tbody = document.getElementById("analysis1Body");
  tbody.innerHTML = "";

  if (
    analysisData.invoiceArchive.length === 0 ||
    analysisData.energyDashboard.length === 0
  ) {
    document.getElementById("analysis1NoData").style.display = "block";
    return;
  }

  const siteConsumptionMap = {};
  analysisData.energyDashboard.forEach((row) => {
    const siteName = row.sitename.toLowerCase().trim();
    siteConsumptionMap[siteName] = row.fuelconsumption;
  });

  // Group invoice data by site name
  const siteInvoiceMap = {};
  analysisData.invoiceArchive.forEach((row) => {
    const siteName = row.sitename.toLowerCase().trim();
    if (!siteInvoiceMap[siteName]) {
      siteInvoiceMap[siteName] = {
        totalQuantity: 0,
        count: 0,
        originalName: row.sitename,
      };
    }
    siteInvoiceMap[siteName].totalQuantity += row.fuelquantity;
    siteInvoiceMap[siteName].count += 1;
  });

  // Find duplicated sites and perform comparison
  const analysisRows = [];
  Object.keys(siteInvoiceMap).forEach((siteName) => {
    const invoiceInfo = siteInvoiceMap[siteName];

    // Only process duplicated sites (where fuel was added multiple times)
    if (invoiceInfo.count >= 1) {
      const consumption = siteConsumptionMap[siteName] || 0;
      const totalFuel = invoiceInfo.totalQuantity;
      const variance = totalFuel - consumption;
      const status = variance > consumption * 0.1 ? "High Fueling" : "Normal";

      analysisRows.push({
        sitename: invoiceInfo.originalName,
        totalfuel: totalFuel,
        avgconsumption: consumption,
        variance: variance,
        status: status,
      });
    }
  });

  if (analysisRows.length === 0) {
    document.getElementById("analysis1NoData").style.display = "block";
    return;
  }

  document.getElementById("analysis1NoData").style.display = "none";
  window.analysis1Data = analysisRows;
  displayAnalysisTable("analysis1", analysisRows);
}

function generateAnalysis2() {
  // Analysis 2: Planned Date Validation (±2 Days Rule)
  const tbody = document.getElementById("analysis2Body");
  tbody.innerHTML = "";

  if (analysisData.invoiceArchive.length === 0) {
    document.getElementById("analysis2NoData").style.display = "block";
    return;
  }

  // Get planned dates from main sites data
  const sitePlanMap = {};
  sitesData.forEach((site) => {
    const siteName = site.sitename.toLowerCase().trim();
    sitePlanMap[siteName] = {
      plannedDate: site.nextfuelingplan,
      fuelDate: site.fuelDate,
      originalName: site.sitename,
    };
  });

  const analysisRows = [];
  const processedSites = new Set();

  analysisData.invoiceArchive.forEach((invoice) => {
    const siteName = invoice.sitename.toLowerCase().trim();

    if (processedSites.has(siteName)) return;
    processedSites.add(siteName);

    const planInfo = sitePlanMap[siteName];
    if (!planInfo || !planInfo.fuelDate) {
      return;
    }

    const plannedDate = planInfo.fuelDate;
    const invoiceDate = parseFuelDate(invoice.invoicedate);

    if (!invoiceDate) {
      return;
    }

    const dayDifference = Math.round(
      (invoiceDate - plannedDate) / (1000 * 60 * 60 * 24),
    );
    const status = Math.abs(dayDifference) <= 2 ? "OK" : "Discrepancy";

    analysisRows.push({
      sitename: planInfo.originalName,
      planneddate: planInfo.plannedDate,
      actualdate: invoice.invoicedate,
      daydiff: dayDifference,
      status: status,
    });
  });

  if (analysisRows.length === 0) {
    document.getElementById("analysis2NoData").style.display = "block";
    return;
  }

  document.getElementById("analysis2NoData").style.display = "none";
  window.analysis2Data = analysisRows;
  displayAnalysisTable("analysis2", analysisRows);
}

function generateAnalysis3() {
  // Analysis 3: Site-Level Fuel Quantity Summary
  const tbody = document.getElementById("analysis3Body");
  tbody.innerHTML = "";

  if (analysisData.invoiceArchive.length === 0) {
    document.getElementById("analysis3NoData").style.display = "block";
    return;
  }

  // Aggregate by site
  const siteTotalMap = {};
  analysisData.invoiceArchive.forEach((invoice) => {
    const siteName = invoice.sitename.toLowerCase().trim();
    if (!siteTotalMap[siteName]) {
      siteTotalMap[siteName] = {
        totalQty: 0,
        originalName: invoice.sitename,
      };
    }
    siteTotalMap[siteName].totalQty += invoice.fuelquantity;
  });

  const analysisRows = Object.keys(siteTotalMap).map((siteName) => ({
    sitename: siteTotalMap[siteName].originalName,
    totalqty: siteTotalMap[siteName].totalQty,
  }));

  if (analysisRows.length === 0) {
    document.getElementById("analysis3NoData").style.display = "block";
    return;
  }

  document.getElementById("analysis3NoData").style.display = "none";
  window.analysis3Data = analysisRows;
  displayAnalysisTable("analysis3", analysisRows);
}

function displayAnalysisTable(analysisId, rows) {
  const tbody = document.getElementById(`${analysisId}Body`);
  tbody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");

    if (analysisId === "analysis1") {
      tr.innerHTML = `
        <td>${escapeHTML(row.sitename)}</td>
        <td>${row.totalfuel.toFixed(2)}</td>
        <td>${row.avgconsumption.toFixed(2)}</td>
        <td>${row.variance.toFixed(2)}</td>
        <td><span class="status-badge ${row.status === "High Fueling" ? "status-high" : "status-normal"}">${row.status}</span></td>
      `;
    } else if (analysisId === "analysis2") {
      const statusClass =
        row.status === "OK" ? "status-ok" : "status-discrepancy";
      tr.innerHTML = `
        <td>${escapeHTML(row.sitename)}</td>
        <td>${row.planneddate}</td>
        <td>${row.actualdate}</td>
        <td>${row.daydiff}</td>
        <td><span class="status-badge ${statusClass}">${row.status}</span></td>
      `;
    } else if (analysisId === "analysis3") {
      tr.innerHTML = `
        <td>${escapeHTML(row.sitename)}</td>
        <td>${row.totalqty.toFixed(2)}</td>
      `;
    }

    tbody.appendChild(tr);
  });
}

window.switchAnalysisTab = function switchAnalysisTab(tabId) {
  // Hide all tabs
  document.querySelectorAll(".analysis-tab-content").forEach((tab) => {
    tab.style.display = "none";
  });

  // Deactivate all buttons
  document.querySelectorAll(".analysis-tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) {
    selectedTab.style.display = "block";
    selectedTab.classList.add("active");
  }

  // Activate corresponding button
  const buttons = document.querySelectorAll(".analysis-tab-btn");
  const tabIndex = [
    "analysis1",
    "analysis2",
    "analysis3",
    "analysisChart",
    "discrepancyAnalysis",
  ].indexOf(tabId);
  if (tabIndex >= 0 && buttons[tabIndex]) {
    buttons[tabIndex].classList.add("active");
  }

  // Update chart if switching to chart tab
  if (tabId === "analysisChart" && fuelingChartInstance) {
    setTimeout(() => {
      fuelingChartInstance.resize();
    }, 100);
  }
};

window.sortAnalysisTable = function sortAnalysisTable(analysisId, column) {
  const data = window[`${analysisId}Data`];
  if (!data) return;

  data.sort((a, b) => {
    let aVal = a[column];
    let bVal = b[column];

    if (typeof aVal === "string") {
      return aVal.localeCompare(bVal);
    }
    return aVal - bVal;
  });

  applyAnalysisFilters(analysisId);
};

function applyAnalysisFilters(analysisId) {
  const data = window[`${analysisId}Data`];
  if (!data) return;

  const filterInput = document.getElementById(`${analysisId}Filter`);
  const filterSelect = document.getElementById(`${analysisId}Status`);

  let filteredData = data;

  // Apply text filter
  if (filterInput && filterInput.value.trim()) {
    const searchTerm = filterInput.value.trim().toLowerCase();
    filteredData = filteredData.filter((row) =>
      row.sitename.toLowerCase().includes(searchTerm),
    );
  }

  // Apply status filter (only for analysis1 and analysis2)
  if (
    filterSelect &&
    filterSelect.value &&
    (analysisId === "analysis1" || analysisId === "analysis2")
  ) {
    filteredData = filteredData.filter(
      (row) => row.status === filterSelect.value,
    );
  }

  displayAnalysisTable(analysisId, filteredData);
}

function showAnalysisLoading(show) {
  const loadingElements = [
    document.getElementById("analysis1Loading"),
    document.getElementById("analysis2Loading"),
    document.getElementById("analysis3Loading"),
  ];

  loadingElements.forEach((el) => {
    if (el) {
      el.style.display = show ? "block" : "none";
    }
  });
}

function generateFuelingChart() {
  if (analysisData.invoiceArchive.length === 0) {
    document.getElementById("analysisChartNoData").style.display = "block";
    return;
  }

  // Aggregate fuel by site
  const siteFuelMap = {};
  analysisData.invoiceArchive.forEach((invoice) => {
    const siteName = invoice.sitename;
    if (!siteFuelMap[siteName]) {
      siteFuelMap[siteName] = 0;
    }
    siteFuelMap[siteName] += invoice.fuelquantity;
  });

  // Convert to array and sort from highest to lowest
  const siteData = Object.entries(siteFuelMap).map(([siteName, quantity]) => ({
    siteName,
    quantity,
  }));

  siteData.sort((a, b) => b.quantity - a.quantity);

  // Store for limit selector
  window.fuelingChartData = siteData;

  document.getElementById("analysisChartNoData").style.display = "none";
  updateFuelingChart();
}

window.updateFuelingChart = function updateFuelingChart() {
  if (!window.fuelingChartData || window.fuelingChartData.length === 0) return;

  const limitSelect = document.getElementById("chartLimitSelect");
  const limit = parseInt(limitSelect?.value || "10");

  const displayData = window.fuelingChartData.slice(0, limit);

  const ctx = document.getElementById("fuelingChart");
  if (!ctx) {
    // Retry after a short delay
    setTimeout(() => window.updateFuelingChart(), 100);
    return;
  }

  const labels = displayData.map((item) => item.siteName);
  const data = displayData.map((item) => item.quantity);

  // Generate color gradient from red (high) to orange/yellow/green (low)
  const colors = displayData.map((_, index) => {
    const ratio = index / Math.max(displayData.length - 1, 1);
    // Red (#d32f2f) -> Orange (#ff6b35) -> Yellow (#ffb300) -> Green (#27ae60)
    if (ratio < 0.33) {
      // Red to Orange
      const localRatio = ratio / 0.33;
      const r = Math.round(211 + (255 - 211) * localRatio);
      const g = Math.round(47 + (107 - 47) * localRatio);
      const b = Math.round(47 + (53 - 47) * localRatio);
      return `rgba(${r}, ${g}, ${b}, 0.85)`;
    } else if (ratio < 0.66) {
      // Orange to Yellow
      const localRatio = (ratio - 0.33) / 0.33;
      const r = 255;
      const g = Math.round(107 + (179 - 107) * localRatio);
      const b = Math.round(53 - 53 * localRatio);
      return `rgba(${r}, ${g}, ${b}, 0.85)`;
    } else {
      // Yellow to Green
      const localRatio = (ratio - 0.66) / 0.34;
      const r = Math.round(255 - (255 - 39) * localRatio);
      const g = Math.round(179 - (179 - 174) * localRatio);
      const b = Math.round(0 + (96 - 0) * localRatio);
      return `rgba(${r}, ${g}, ${b}, 0.85)`;
    }
  });

  if (fuelingChartInstance) {
    fuelingChartInstance.data.labels = labels;
    fuelingChartInstance.data.datasets[0].data = data;
    fuelingChartInstance.data.datasets[0].backgroundColor = colors;
    fuelingChartInstance.options.indexAxis =
      window.innerWidth < 768 ? "y" : "x";
    fuelingChartInstance.update();
  } else {
    fuelingChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Total Fuel Quantity (Liters)",
            data: data,
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("0.8", "1")),
            borderWidth: 2,
            borderRadius: 8,
            barPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        indexAxis: window.innerWidth < 768 ? "y" : "x",
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              font: {
                size: 13,
                weight: "600",
                family: "Verdana, sans-serif",
              },
              color: "#202b6d",
              usePointStyle: true,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: "rgba(32, 43, 109, 0.9)",
            padding: 12,
            titleFont: {
              size: 14,
              weight: "700",
              family: "Verdana, sans-serif",
            },
            bodyFont: {
              size: 13,
              weight: "500",
              family: "Verdana, sans-serif",
            },
            borderColor: "#27ae60",
            borderWidth: 2,
            displayColors: false,
            callbacks: {
              label: function (context) {
                const value = context.parsed.y || context.parsed.x;
                return `Fuel Quantity: ${value.toFixed(2)} L`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            grid: {
              color: "rgba(232, 236, 255, 0.5)",
              drawBorder: false,
            },
            ticks: {
              font: {
                size: 12,
                weight: "500",
                family: "Verdana, sans-serif",
              },
              color: "#64748b",
            },
            title: {
              display: true,
              text: "Sites",
              font: {
                size: 13,
                weight: "700",
                family: "Verdana, sans-serif",
              },
              color: "#202b6d",
            },
          },
          y: {
            display: true,
            grid: {
              color: "rgba(232, 236, 255, 0.5)",
              drawBorder: false,
            },
            ticks: {
              font: {
                size: 12,
                weight: "500",
                family: "Verdana, sans-serif",
              },
              color: "#64748b",
              callback: function (value) {
                return value.toFixed(0) + " L";
              },
            },
            title: {
              display: true,
              text: "Fuel Quantity (Liters)",
              font: {
                size: 13,
                weight: "700",
                family: "Verdana, sans-serif",
              },
              color: "#202b6d",
            },
          },
        },
      },
    });
  }
};

// ==========================================
// DISCREPANCY ANALYSIS SECTION
// ==========================================

window.discrepancyAnalysisTolerance = 10; // Default tolerance percentage
window.discrepancyAnalysisData = { discrepancies: [], riskSummary: [] };

function parseDateDMY(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split("/");
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const date = new Date(year, month - 1, day);
  return isNaN(date.getTime()) ? null : date;
}

window.analyzeDiscrepancies = function analyzeDiscrepancies() {
  const DAILY_CONSUMPTION = 116;

  if (
    !analysisData.invoiceArchive ||
    analysisData.invoiceArchive.length === 0
  ) {
    document.getElementById("discrepancyNoData").style.display = "block";
    document.getElementById("discrepancyLoading").style.display = "none";
    document.getElementById("riskNoData").style.display = "block";
    document.getElementById("riskLoading").style.display = "none";
    return;
  }

  // Step 1: Group records by site with proper date parsing
  const sitesMap = {};
  analysisData.invoiceArchive.forEach((invoice) => {
    const siteName = invoice.sitename || "";
    const dateStr = invoice.fuelingdate || invoice.lastfuelingdate || "";

    if (!siteName.trim() || !dateStr.trim()) return;

    const date = parseDateDMY(dateStr);
    const qty = parseFloat(invoice.fuelquantity || invoice.lastfuelingqty || 0);

    if (!date || qty <= 0) return;

    if (!sitesMap[siteName]) {
      sitesMap[siteName] = [];
    }
    sitesMap[siteName].push({
      siteName: siteName,
      date: date,
      qty: qty,
      raw: invoice,
    });
  });

  // Step 2: Analyze each site
  const discrepancies = [];
  const riskSummary = [];

  Object.keys(sitesMap).forEach((siteName) => {
    const records = sitesMap[siteName]
      .filter((r) => r.date && r.qty > 0)
      .sort((a, b) => a.date - b.date);

    // Ignore non-duplicated sites
    if (records.length < 2) return;

    // Find corresponding Energy Dashboard record for OFF-AIR protection
    const energyDashboardSite = analysisData.energyDashboard.find(
      (site) =>
        site.sitename && site.sitename.toUpperCase() === siteName.toUpperCase(),
    );

    const siteStatus = energyDashboardSite
      ? (energyDashboardSite.status || "").toUpperCase()
      : "";

    // OFF-AIR Protection: Skip non-active sites
    if (siteStatus !== "ON-AIR" && siteStatus !== "IN PROGRESS") {
      riskSummary.push({
        sitename: siteName,
        issuetype: "Data Issue",
        rootcausehint: `Site status is ${siteStatus} (not ON-AIR)`,
      });
      return;
    }

    let siteIsTheft = false;
    let siteIsEarly = false;

    // Step 3: Analyze each consecutive pair (i-1 vs i)
    for (let i = 1; i < records.length; i++) {
      const prev = records[i - 1];
      const curr = records[i];

      const gapDays = Math.floor(
        (curr.date - prev.date) / (1000 * 60 * 60 * 24),
      );
      const expectedRuntimeDays = prev.qty / DAILY_CONSUMPTION;

      // NORMAL CONDITION: If gap >= runtime - 2, skip this pair (it's OK)
      if (gapDays >= expectedRuntimeDays - 2) {
        continue;
      }

      // EARLY REFUEL: Gap is less than expected runtime minus buffer
      siteIsEarly = true;

      // IMPOSSIBLE CONSUMPTION -> THEFT: Expected usage exceeds available fuel
      if (gapDays * DAILY_CONSUMPTION > prev.qty) {
        siteIsTheft = true;
      }

      // Add pair-level discrepancy record
      const expectedUsed = gapDays * DAILY_CONSUMPTION;
      discrepancies.push({
        sitename: siteName,
        planneddate: prev.date.toISOString().split("T")[0],
        actualdate: curr.date.toISOString().split("T")[0],
        span: gapDays,
        expectedconsumption: expectedUsed.toFixed(2),
        actualfueladded: prev.qty.toFixed(2),
        variance:
          (((expectedUsed - prev.qty) / prev.qty) * 100).toFixed(2) + "%",
        status: siteIsTheft ? "Theft" : siteIsEarly ? "Early Refuel" : "Normal",
      });
    }

    // WORST STATUS WINS for the site
    let siteStatus_ = "Normal";
    let rootCauseHint = "All fuel cycles align with consumption";

    if (siteIsTheft) {
      siteStatus_ = "Theft";
      rootCauseHint =
        "Impossible fuel consumption detected across one or more cycles";
    } else if (siteIsEarly) {
      siteStatus_ = "Early Refuel";
      rootCauseHint =
        "Site refueled earlier than expected in one or more cycles";
    }

    // Add site-level risk summary if not normal
    if (siteStatus_ !== "Normal") {
      riskSummary.push({
        sitename: siteName,
        issuetype: siteStatus_,
        rootcausehint: rootCauseHint,
      });
    }
  });

  // Store data for filtering
  window.discrepancyAnalysisData = { discrepancies, riskSummary };

  // Populate tables
  populateDiscrepancyTable(discrepancies);
  populateRiskSummaryTable(riskSummary);

  document.getElementById("discrepancyNoData").style.display =
    discrepancies.length === 0 ? "block" : "none";
  document.getElementById("discrepancyLoading").style.display = "none";

  document.getElementById("riskNoData").style.display =
    riskSummary.length === 0 ? "block" : "none";
  document.getElementById("riskLoading").style.display = "none";
};

function populateDiscrepancyTable(data) {
  const tbody = document.getElementById("discrepancyTableBody");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    return;
  }

  data.forEach((row) => {
    const tr = document.createElement("tr");
    const statusClass =
      row.status === "Normal" ? "status-ok" : "status-discrepancy";

    tr.innerHTML = `
      <td>${escapeHTML(row.sitename)}</td>
      <td>${escapeHTML(row.planneddate)}</td>
      <td>${escapeHTML(row.actualdate)}</td>
      <td>${row.span}</td>
      <td>${row.expectedconsumption}</td>
      <td>${row.actualfueladded} L</td>
      <td>${row.variance}</td>
      <td><span class="${statusClass}">${escapeHTML(row.status)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function populateRiskSummaryTable(data) {
  const tbody = document.getElementById("riskSummaryTableBody");
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    return;
  }

  data.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHTML(row.sitename)}</td>
      <td>${escapeHTML(row.issuetype)}</td>
      <td>${escapeHTML(row.rootcausehint)}</td>
    `;
    tbody.appendChild(tr);
  });
}

window.switchDiscrepancyTab = function switchDiscrepancyTab(tabId) {
  // Hide all discrepancy tab panes
  document.querySelectorAll(".discrepancy-tab-pane").forEach((pane) => {
    pane.classList.remove("active");
  });

  // Deactivate all discrepancy tab buttons
  document.querySelectorAll(".discrepancy-tab-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Show selected tab pane
  const selectedPane = document.getElementById(tabId);
  if (selectedPane) {
    selectedPane.classList.add("active");
  }

  // Activate corresponding button
  const buttons = document.querySelectorAll(".discrepancy-tab-btn");
  const tabIndex = ["discrepancyTable", "riskSummaryTable"].indexOf(tabId);
  if (tabIndex >= 0 && buttons[tabIndex]) {
    buttons[tabIndex].classList.add("active");
  }
};

window.filterDiscrepancyTable = function filterDiscrepancyTable() {
  const filterInput = document
    .getElementById("discrepancyFilter")
    .value.toUpperCase();
  const statusFilter = document.getElementById("discrepancyStatusFilter").value;
  const rows = document.querySelectorAll("#discrepancyTableBody tr");

  rows.forEach((row) => {
    const siteName = row.cells[0].textContent.toUpperCase();
    const status = row.cells[7].textContent.trim();

    const matchesName = siteName.includes(filterInput);
    const matchesStatus = statusFilter === "" || status.includes(statusFilter);

    row.style.display = matchesName && matchesStatus ? "" : "none";
  });
};

window.filterRiskSummaryTable = function filterRiskSummaryTable() {
  const filterInput = document.getElementById("riskFilter").value.toUpperCase();
  const typeFilter = document.getElementById("riskTypeFilter").value;
  const rows = document.querySelectorAll("#riskSummaryTableBody tr");

  rows.forEach((row) => {
    const siteName = row.cells[0].textContent.toUpperCase();
    const issueType = row.cells[1].textContent.trim();

    const matchesName = siteName.includes(filterInput);
    const matchesType = typeFilter === "" || issueType.includes(typeFilter);

    row.style.display = matchesName && matchesType ? "" : "none";
  });
};

window.applyDiscrepancyTolerance = function applyDiscrepancyTolerance() {
  const toleranceInput = document.getElementById("toleranceInput");
  const tolerance = parseInt(toleranceInput.value, 10);

  if (isNaN(tolerance) || tolerance < 0 || tolerance > 100) {
    alert("Please enter a valid tolerance value between 0 and 100");
    return;
  }

  window.discrepancyAnalysisTolerance = tolerance;

  // Show loading state
  document.getElementById("discrepancyLoading").style.display = "block";
  document.getElementById("discrepancyNoData").style.display = "none";
  document.getElementById("riskLoading").style.display = "block";
  document.getElementById("riskNoData").style.display = "none";

  // Re-run analysis with new tolerance
  window.analyzeDiscrepancies();
};

export {};
