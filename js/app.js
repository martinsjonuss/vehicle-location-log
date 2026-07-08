const loadingScreen = document.getElementById("loadingScreen");
const loginScreen = document.getElementById("loginScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const profileMenuBtn = document.getElementById("profileMenuBtn");
const profileInitials = document.getElementById("profileInitials");
const signOutBtn = document.getElementById("signOutBtn");
const profileDrawer = document.getElementById("profileDrawer");
const profileDrawerOverlay = document.getElementById("profileDrawerOverlay");
const profileDrawerClose = document.getElementById("profileDrawerClose");
const profileDrawerTitle = document.getElementById("profileDrawerTitle");
const drawerProfileInitials = document.getElementById("drawerProfileInitials");
const themeToggle = document.getElementById("themeToggle");
const themeColorMeta = document.getElementById("themeColorMeta");
const heroCard = document.querySelector(".hero-card");
const homeNavBtn = document.getElementById("homeNavBtn");
const myStatsNavBtn = document.getElementById("myStatsNavBtn");

const checkInTab = document.getElementById("checkInTab");
const findTab = document.getElementById("findTab");
const checkInView = document.getElementById("checkInView");
const findView = document.getElementById("findView");
const updatePanel = document.getElementById("updatePanel");
const statsView = document.getElementById("statsView");
const statsPeriod = document.getElementById("statsPeriod");
const statsContent = document.getElementById("statsContent");
const homeSections = document.querySelectorAll(".home-section");

const checkInForm = document.getElementById("checkInForm");
const checkInReg = document.getElementById("checkInReg");
const checkInMileage = document.getElementById("checkInMileage");
const checkInType = document.getElementById("checkInType");
const checkInParking = document.getElementById("checkInParking");
const checkInGpsEnabled = document.getElementById("checkInGpsEnabled");
const checkInNote = document.getElementById("checkInNote");
const checkInMessage = document.getElementById("checkInMessage");

const searchForm = document.getElementById("searchForm");
const searchReg = document.getElementById("searchReg");
const vehicleResult = document.getElementById("vehicleResult");

const updateForm = document.getElementById("updateForm");
const updateTitle = document.getElementById("updateTitle");
const updateReg = document.getElementById("updateReg");
const updateStage = document.getElementById("updateStage");
const updateParking = document.getElementById("updateParking");
const updateGpsEnabled = document.getElementById("updateGpsEnabled");
const updateNote = document.getElementById("updateNote");
const updateMessage = document.getElementById("updateMessage");
const cancelUpdateBtn = document.getElementById("cancelUpdateBtn");

const activityList = document.getElementById("activityList");
const parkingMapButtons = document.querySelectorAll(".parking-map-info");
const parkingMapModal = document.getElementById("parkingMapModal");
const parkingMapClose = document.getElementById("parkingMapClose");
const parkingMapViewport = document.getElementById("parkingMapViewport");
const parkingMapMessage = document.getElementById("parkingMapMessage");
const parkingMapImage = document.getElementById("parkingMapImage");
const GPS_PREFERENCE_KEY = "vehicleLocationLogGpsEnabled";
const PARKING_MAP_BUCKET = "parking-maps";
const PARKING_MAP_FILE = "compound-map.webp";
const PARKING_MAP_URL_LIFETIME_SECONDS = 60;
const THEME_PREFERENCE_KEY = "vehicleLocationLogTheme";
const MAX_MILEAGE_DIGITS = 7;
const MAX_REGISTRATION_CHARS = 15;
const SEARCH_RESULTS_PER_PAGE = 5;
const PARKING_LOCATIONS = [
  "Drive Thru",
  "Budget",
  "Sales",
  "S1",
  "S2",
  "S3",
  "S4",
  "S7",
  "Customer Car Park",
  "Fruit Market",
  "Breakdown Hill",
  "Other"
];
const searchResultsState = {
  records: [],
  page: 1
};
const PERIOD_LABELS = {
  today: "today",
  week: "this week",
  month: "this month"
};
const STATS_MESSAGES = {
  empty: [
    ["Ready when you are.", "Fresh page, fresh tyres. First movement is waiting."],
    ["Quiet so far.", "No vehicle moves yet, but the day is young."],
    ["Your stats are warming up.", "Create a movement and this panel springs to life."]
  ],
  light: [
    ["Nice start.", "A tidy bit of movement logged already."],
    ["You are on the board.", "Small numbers still count when the car is found faster."],
    ["Good start.", "The logbook is awake and paying attention."]
  ],
  steady: [
    ["Good work.", "You are keeping the vehicle trail clear."],
    ["Solid rhythm.", "The compound is less mysterious because of you."],
    ["Nice flow.", "Those updates are doing useful work."]
  ],
  busy: [
    ["Busy shift.", "That is a healthy stack of vehicle movements."],
    ["Great work.", "You have been keeping the operation moving."],
    ["Strong pace.", "The vehicle trail is looking sharp."]
  ],
  huge: [
    ["Big day.", "That movement count deserves a proper cup of tea."],
    ["Excellent shift.", "You have been moving through this list like a pro."],
    ["Serious output.", "The compound did not know what hit it."]
  ]
};
let currentUserProfile = null;
let currentAuthUser = null;
let initialAuthResolved = false;
let currentPage = "home";

function setTheme(theme, persist = true) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  themeToggle.checked = nextTheme === "dark";
  themeColorMeta.content = nextTheme === "dark" ? "#0d141d" : "#f4f7fb";
  if (persist) localStorage.setItem(THEME_PREFERENCE_KEY, nextTheme);
}

function initialiseTheme() {
  const savedTheme = localStorage.getItem(THEME_PREFERENCE_KEY);
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  setTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : systemTheme, false);
}

function normaliseReg(value) {
  return value.trim().toUpperCase().replace(/\s+/g, "").slice(0, MAX_REGISTRATION_CHARS);
}

function formatRegistration(value) {
  const original = String(value || "").trim().toUpperCase();
  const compact = original.replace(/[\s-]+/g, "");

  const irish = compact.match(/^(\d{2,3})([A-Z]{1,2})(\d{1,6})$/);
  if (irish) return `${irish[1]}-${irish[2]}-${irish[3]}`;

  const ukCurrent = compact.match(/^([A-Z]{2}\d{2})([A-Z]{3})$/);
  if (ukCurrent) return `${ukCurrent[1]} ${ukCurrent[2]}`;

  const ukPrefix = compact.match(/^([A-Z]\d{1,3})([A-Z]{3})$/);
  if (ukPrefix) return `${ukPrefix[1]} ${ukPrefix[2]}`;

  const ukSuffix = compact.match(/^([A-Z]{3})(\d{1,3}[A-Z])$/);
  if (ukSuffix) return `${ukSuffix[1]} ${ukSuffix[2]}`;

  const lettersFirst = compact.match(/^([A-Z]{1,3})(\d{1,4})$/);
  if (lettersFirst) return `${lettersFirst[1]} ${lettersFirst[2]}`;

  const numbersFirst = compact.match(/^(\d{1,4})([A-Z]{1,3})$/);
  if (numbersFirst) return `${numbersFirst[1]} ${numbersFirst[2]}`;

  return original;
}

function formatMileage(value) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString("en-GB");
}

function cleanMileage(value) {
  const cleaned = String(value || "").replace(/\D/g, "").slice(0, MAX_MILEAGE_DIGITS);
  return cleaned ? Number(cleaned) : null;
}

function cleanNote(value) {
  return String(value || "").trim().slice(0, 150);
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getStatsRange(period) {
  const now = new Date();
  const end = now;
  let start;

  if (period === "today") {
    start = startOfDay(now);
  } else if (period === "month") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    const today = startOfDay(now);
    const dayOffset = (today.getDay() + 6) % 7;
    start = addDays(today, -dayOffset);
  }

  return { start, end };
}

function formatStatsDay(date) {
  return date.toLocaleDateString("en-GB", { weekday: "short", day: "2-digit" });
}

function formatHourRange(hour) {
  const start = String(hour).padStart(2, "0");
  const end = String((hour + 1) % 24).padStart(2, "0");
  return `${start}:00 - ${end}:00`;
}

function getMode(records, key) {
  const counts = new Map();
  records.forEach(record => {
    const value = record[key];
    if (value === null || value === undefined || value === "") return;
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])[0] || ["Not recorded", 0];
}

function isCheckInMovement(record) {
  return record.stage === "Checked In";
}

function isMarkedOutMovement(record) {
  return record.status === "OUT";
}

function switchMainView(viewName) {
  revealHomeView();
  const checkInActive = viewName === "checkin";
  checkInView.classList.toggle("hidden", !checkInActive);
  findView.classList.toggle("hidden", checkInActive);
  checkInTab.classList.toggle("active", checkInActive);
  findTab.classList.toggle("active", !checkInActive);
  updatePanel.classList.add("hidden");
}

function revealHomeView() {
  currentPage = "home";
  statsView.classList.add("hidden");
  homeSections.forEach(section => section.classList.remove("page-hidden"));
}

function showHomeView() {
  revealHomeView();
  closeProfileDrawer(false);
  switchMainView("find");
}

function goHome() {
  showHomeView();
  appShell.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function showStatsView() {
  currentPage = "stats";
  updatePanel.classList.add("hidden");
  homeSections.forEach(section => section.classList.add("page-hidden"));
  statsView.classList.remove("hidden");
  closeProfileDrawer();
  await renderMyStats();
  statsView.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isGpsEnabled() {
  return localStorage.getItem(GPS_PREFERENCE_KEY) !== "false";
}

function setGpsEnabled(enabled) {
  localStorage.setItem(GPS_PREFERENCE_KEY, enabled ? "true" : "false");
  checkInGpsEnabled.checked = enabled;
  updateGpsEnabled.checked = enabled;
}

function initialiseGpsPreference() {
  setGpsEnabled(isGpsEnabled());
}

function populateParkingLocations() {
  [checkInParking, updateParking].forEach(select => {
    const placeholder = select.querySelector("option[value='']");
    select.replaceChildren(placeholder);

    PARKING_LOCATIONS.forEach(location => {
      const option = document.createElement("option");
      option.value = location;
      option.textContent = location;
      select.appendChild(option);
    });
  });
}

function profileDisplayName() {
  return currentUserProfile?.first_name || currentAuthUser?.email || "Unknown User";
}

function getProfileInitials() {
  const firstName = String(currentUserProfile?.first_name || "").trim();
  const lastName = String(currentUserProfile?.last_name || "").trim();

  if (firstName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  const email = String(currentAuthUser?.email || "").trim();
  return email ? email.charAt(0).toUpperCase() : "?";
}

function updateProfileDisplay() {
  profileDrawerTitle.textContent = currentAuthUser ? profileDisplayName() : "Unknown User";
  const initials = getProfileInitials();
  profileInitials.textContent = initials;
  drawerProfileInitials.textContent = initials;
}

function openProfileDrawer() {
  if (!currentAuthUser) return;
  profileDrawer.classList.add("open");
  profileDrawerOverlay.classList.add("open");
  profileDrawer.removeAttribute("inert");
  profileDrawer.setAttribute("aria-hidden", "false");
  profileDrawerOverlay.setAttribute("aria-hidden", "false");
  profileMenuBtn.setAttribute("aria-expanded", "true");
  document.body.classList.add("drawer-open");
  profileDrawerClose.focus();
}

function closeProfileDrawer(restoreFocus = true) {
  const wasOpen = profileDrawer.classList.contains("open");
  profileDrawer.classList.remove("open");
  profileDrawerOverlay.classList.remove("open");
  profileDrawer.setAttribute("inert", "");
  profileDrawer.setAttribute("aria-hidden", "true");
  profileDrawerOverlay.setAttribute("aria-hidden", "true");
  profileMenuBtn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("drawer-open");
  if (wasOpen && restoreFocus) profileMenuBtn.focus();
}

function showLoading() {
  closeProfileDrawer(false);
  loadingScreen.classList.remove("hidden");
  loginScreen.classList.add("hidden");
  appShell.classList.add("hidden");
}

function showLogin(message) {
  closeParkingMap();
  loadingScreen.classList.add("hidden");
  loginScreen.classList.remove("hidden");
  appShell.classList.add("hidden");
  updatePanel.classList.add("hidden");
  loginPassword.value = "";
  updateProfileDisplay();
  if (message !== undefined) {
    loginMessage.textContent = message;
  }
}

function resetParkingMap() {
  parkingMapImage.removeAttribute("src");
  parkingMapImage.classList.add("hidden");
  parkingMapMessage.textContent = "";
  parkingMapMessage.classList.remove("hidden");
  parkingMapViewport.removeAttribute("aria-busy");
}

function closeParkingMap() {
  if (parkingMapModal.open) parkingMapModal.close();
  resetParkingMap();
}

async function openParkingMap() {
  const {
    data: { session },
    error: sessionError
  } = await db.auth.getSession();

  if (sessionError || !session) {
    if (sessionError) console.error(sessionError);
    showLogin("Please sign in to view the parking map.");
    return;
  }

  resetParkingMap();
  parkingMapMessage.textContent = "Loading parking map...";
  parkingMapViewport.setAttribute("aria-busy", "true");
  parkingMapModal.showModal();

  const { data, error } = await db.storage
    .from(PARKING_MAP_BUCKET)
    .createSignedUrl(PARKING_MAP_FILE, PARKING_MAP_URL_LIFETIME_SECONDS);

  if (!parkingMapModal.open) return;

  if (error || !data?.signedUrl) {
    if (error) console.error(error);
    parkingMapViewport.removeAttribute("aria-busy");
    parkingMapMessage.textContent = "Could not load parking map.";
    return;
  }

  parkingMapImage.onload = () => {
    parkingMapViewport.removeAttribute("aria-busy");
    parkingMapMessage.classList.add("hidden");
    parkingMapImage.classList.remove("hidden");
  };
  parkingMapImage.onerror = () => {
    parkingMapViewport.removeAttribute("aria-busy");
    parkingMapMessage.textContent = "Could not load parking map.";
  };
  parkingMapImage.src = data.signedUrl;
}

async function showApp() {
  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  loginMessage.textContent = "";
  updateProfileDisplay();
  switchMainView("find");
  await renderActivity();
  loadingScreen.classList.add("hidden");
}

async function loadCurrentUserProfile(user) {
  currentAuthUser = user;
  currentUserProfile = null;

  const { data: profile, error } = await db
    .from("user_profiles")
    .select("id, first_name, last_name, email, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    alert("Profile could not be loaded. Using account email.");
    updateProfileDisplay();
    return true;
  }

  if (profile?.is_active === false) {
    currentUserProfile = profile;
    return false;
  }

  currentUserProfile = profile;
  updateProfileDisplay();
  return true;
}

function getCurrentStaffName() {
  return currentUserProfile?.first_name || currentAuthUser?.email || "Unknown User";
}

async function getAuthenticatedMovementProfile() {
  const {
    data: { user },
    error: userError
  } = await db.auth.getUser();

  if (userError || !user) {
    if (userError) console.error(userError);
    showLogin();
    alert("Please sign in before saving vehicle records.");
    return null;
  }

  const { data: profile, error: profileError } = await db
    .from("user_profiles")
    .select("id, first_name, email, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    alert("Your profile could not be loaded. Vehicle record was not saved.");
    return null;
  }

  if (!profile) {
    alert("Your user profile is missing. Vehicle record was not saved.");
    return null;
  }

  if (profile.is_active === false) {
    await db.auth.signOut();
    currentAuthUser = null;
    currentUserProfile = null;
    showLogin("Your account is inactive. Please contact an administrator.");
    return null;
  }

  currentAuthUser = user;
  currentUserProfile = profile;
  updateProfileDisplay();
  return profile;
}

function actionFromRecord(record) {
  if (record.status === "OUT") return "Marked out";
  if (record.stage === "Checked In") return "Checked in";
  return "Location updated";
}

function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function mapDbRecord(row) {
  return {
    id: row.id,
    reg: row.registration,
    staff: row.staff_name || "Demo User",
    vehicleType: row.vehicle_type || "Customer vehicle",
    stage: row.stage,
    note: row.note || "",
    status: row.status,
    action: actionFromRecord(row),
    mileage: row.mileage ?? "",
    parkingLocation: row.parking_location || "",
    lat: toNullableNumber(row.latitude),
    lng: toNullableNumber(row.longitude),
    accuracy: toNullableNumber(row.accuracy),
    createdAt: row.created_at
  };
}

function mapRecordForInsert(record) {
  return {
    registration: record.reg,
    user_id: record.userId,
    status: record.status,
    stage: record.stage,
    vehicle_type: record.vehicleType,
    mileage: cleanMileage(record.mileage),
    parking_location: record.parkingLocation || null,
    staff_name: record.staff,
    note: cleanNote(record.note) || null,
    latitude: toNullableNumber(record.lat),
    longitude: toNullableNumber(record.lng),
    accuracy: toNullableNumber(record.accuracy)
  };
}

function handleDbError(error, fallback) {
  console.error(error);
  alert("Vehicle records could not be loaded. Please try again.");
  return fallback;
}

async function getRecords() {
  const { data, error } = await db
    .from("vehicle_movements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return handleDbError(error, []);
  return (data || []).map(mapDbRecord);
}

async function getLatestRecord(reg) {
  const cleaned = normaliseReg(reg);
  const { data, error } = await db
    .from("vehicle_movements")
    .select("*")
    .eq("registration", cleaned)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return handleDbError(error, null);
  return data ? mapDbRecord(data) : null;
}

async function getVehicleHistory(reg) {
  const cleaned = normaliseReg(reg);
  const { data, error } = await db
    .from("vehicle_movements")
    .select("*")
    .eq("registration", cleaned)
    .order("created_at", { ascending: false });

  if (error) return handleDbError(error, []);
  return (data || []).map(mapDbRecord);
}

async function getMatchingLatestRecords(searchTerm) {
  const cleaned = normaliseReg(searchTerm).replace(/[%_]/g, "");
  if (!cleaned) return [];

  const { data, error } = await db
    .from("vehicle_movements")
    .select("*")
    .ilike("registration", `%${cleaned}%`)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return handleDbError(error, []);

  const latestByReg = new Map();
  (data || []).forEach(row => {
    const record = mapDbRecord(row);
    if (!latestByReg.has(record.reg)) {
      latestByReg.set(record.reg, record);
    }
  });

  return Array.from(latestByReg.values());
}

function mapsUrl(record) {
  return `https://www.google.com/maps?q=${record.lat},${record.lng}`;
}

function isValidCoordinate(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function hasValidGps(record) {
  return isValidCoordinate(record.lat) && isValidCoordinate(record.lng);
}

function hasValidAccuracy(record) {
  return typeof record.accuracy === "number" && Number.isFinite(record.accuracy);
}

function hasRecordedMileage(record) {
  return record.mileage !== null && record.mileage !== undefined && record.mileage !== "";
}

function hasValidPosition(position) {
  return Boolean(position) &&
    Boolean(position.coords) &&
    isValidCoordinate(position.coords.latitude) &&
    isValidCoordinate(position.coords.longitude);
}

function showFormMessage(messageElement, message) {
  messageElement.textContent = message;
  alert(message);
}

function buildRecord({ reg, userId, staff, vehicleType, stage, note, status, action, position, mileage, parkingLocation }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    reg: normaliseReg(reg),
    userId: userId || null,
    staff: staff.trim() || "Demo User",
    vehicleType: vehicleType || "Customer vehicle",
    stage,
    note: cleanNote(note),
    status,
    action,
    mileage: cleanMileage(mileage),
    parkingLocation: parkingLocation || "",
    lat: position ? position.coords.latitude : null,
    lng: position ? position.coords.longitude : null,
    accuracy: position ? position.coords.accuracy : null,
    createdAt: new Date().toISOString()
  };
}

async function addRecord(record) {
  const profile = await getAuthenticatedMovementProfile();
  if (!profile?.id) return;

  const insertRecord = {
    ...record,
    userId: profile.id,
    staff: profile.first_name || profile.email || record.staff || "Unknown User"
  };

  const { error } = await db
    .from("vehicle_movements")
    .insert(mapRecordForInsert(insertRecord));

  if (error) {
    console.error(error);
    alert("Vehicle record could not be saved. Please try again.");
    return;
  }

  await renderActivity();
  if (currentPage === "stats") {
    await renderMyStats();
  } else {
    await renderVehicleResult(insertRecord.reg);
  }
}

function captureGpsPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  });
}

async function getGpsPositionIfEnabled(button) {
  if (!isGpsEnabled()) return null;

  const originalText = button.textContent;
  button.textContent = "Getting GPS...";

  try {
    return await captureGpsPosition();
  } catch (error) {
    console.warn("GPS unavailable:", error);
    return null;
  } finally {
    button.textContent = originalText;
  }
}

async function getPositionForSave({ button, parkingLocation, messageElement }) {
  const gpsEnabled = isGpsEnabled();
  const position = await getGpsPositionIfEnabled(button);

  if (hasValidPosition(position)) return position;

  if (parkingLocation) {
    if (gpsEnabled) {
      showFormMessage(messageElement, "GPS unavailable. Vehicle saved using parking location only.");
    }
    return null;
  }

  showFormMessage(messageElement, "GPS is unavailable. Please select a parking location before saving.");
  return undefined;
}

function movementLine(record) {
  const action = record.action === "Location updated" ? "Updated" : record.action;
  return [
    `${action} by ${record.staff || "Unknown user"}`,
    record.status ? `Status: ${record.status}` : "",
    record.stage ? `Current Stage: ${record.stage}` : "",
    record.parkingLocation ? `Parked: ${record.parkingLocation}` : "",
    hasRecordedMileage(record) ? `Mileage: ${formatMileage(record.mileage)}` : "",
    hasValidAccuracy(record) ? `GPS approx. ${Math.round(record.accuracy)}m` : "",
    record.note ? record.note : ""
  ].filter(Boolean).join(" · ");
}

function recentActivityDetails(record) {
  const action = record.action === "Location updated" ? "Updated" : record.action;
  return [
    `${action} by ${record.staff || "Unknown user"}`,
    record.stage ? `Current Stage: ${record.stage}` : "",
    hasRecordedMileage(record) ? `Mileage: ${formatMileage(record.mileage)}` : "",
    hasValidAccuracy(record) ? `GPS Accuracy: approx. ${Math.round(record.accuracy)}m` : "",
    record.note ? `Note: ${record.note}` : ""
  ].filter(Boolean).join(" · ");
}

function prepareVehicleCheckIn(record) {
  switchMainView("checkin");
  checkInReg.value = record.reg;

  const matchingType = Array.from(checkInType.options)
    .find(option => option.value === record.vehicleType);
  if (matchingType) checkInType.value = matchingType.value;

  checkInMessage.textContent = "";
  checkInView.scrollIntoView({ behavior: "smooth", block: "start" });
  checkInReg.focus({ preventScroll: true });
}

function setUpdateTitle(registration) {
  const plate = document.createElement("span");
  plate.className = "registration-plate update-registration-plate";
  plate.textContent = formatRegistration(registration);
  updateTitle.replaceChildren(document.createTextNode("Update "), plate);
}

async function renderVehicleResult(recordOrReg) {
  const record = typeof recordOrReg === "string" ? await getLatestRecord(recordOrReg) : recordOrReg;

  if (!record) {
    vehicleResult.className = "vehicle-result empty";
    vehicleResult.innerHTML = "<p>No saved record found for that registration.</p>";
    return;
  }

  const history = await getVehicleHistory(record.reg);
  const hasLocation = hasValidGps(record);
  const statusClass = record.status === "IN" ? "status-in" : "status-out";

  vehicleResult.className = "vehicle-result";
  vehicleResult.innerHTML = `
    <div class="result-top">
      <div class="reg-large registration-plate">${formatRegistration(record.reg)}</div>
      <span class="history-time">${formatTime(record.createdAt)}</span>
    </div>

    <div class="vehicle-info-list">
      ${record.status === "IN"
        ? `<button class="primary-button vehicle-primary-action" type="button" data-action="update-location" data-reg="${record.reg}">Update Location</button>`
        : `<button class="primary-button vehicle-primary-action" type="button" data-action="check-in" data-reg="${record.reg}">Check In</button>`}

      ${record.status === "IN" ? `
        <div class="activity-parked vehicle-parked-row">
          <div class="vehicle-parked-value"><span>Parked:</span> ${record.parkingLocation || "Not specified"}</div>
          ${hasLocation ? `
            <div class="vehicle-row-actions">
              <a class="detail-action-button" href="${mapsUrl(record)}" target="_blank" rel="noopener">Open</a>
            </div>
          ` : ""}
        </div>
      ` : ""}

      <div class="vehicle-info-row">
        <span class="vehicle-info-label">Current Stage:</span>
        <strong>${record.stage || "Not specified"}</strong>
      </div>
      <div class="vehicle-info-row">
        <span class="vehicle-info-label">Updated by:</span>
        <strong>${record.staff || "Unknown user"}</strong>
      </div>
      <div class="vehicle-info-row">
        <span class="vehicle-info-label">Mileage:</span>
        <strong>${formatMileage(record.mileage)}</strong>
      </div>
      <div class="vehicle-info-row vehicle-info-action-row">
        <div>
          <span class="vehicle-info-label">Movement History:</span>
          <strong>${history.length} saved movement${history.length === 1 ? "" : "s"}</strong>
        </div>
        <button class="detail-action-button" type="button" data-action="toggle-history" data-reg="${record.reg}">View</button>
      </div>
      ${hasValidAccuracy(record) ? `
        <div class="vehicle-info-row">
          <span class="vehicle-info-label">GPS Accuracy:</span>
          <strong>Approx. ${Math.round(record.accuracy)}m</strong>
        </div>
      ` : ""}
      <div class="vehicle-note-section">
        <div class="vehicle-info-label">Note</div>
        <p class="vehicle-note-block">${record.note || "No note added"}</p>
      </div>
    </div>

    <div class="vehicle-result-footer ${record.status === "OUT" ? "status-only" : ""}">
      ${record.status === "IN" ? `<button class="secondary-button" data-action="mark-out" data-reg="${record.reg}">Mark Out</button>` : ""}
      <span class="activity-status ${statusClass}">${record.status}</span>
    </div>

    <div id="vehicleHistoryPanel" class="vehicle-history hidden"></div>
  `;

  const updateButton = vehicleResult.querySelector("[data-action='update-location']");
  const checkInButton = vehicleResult.querySelector("[data-action='check-in']");
  const markOutButton = vehicleResult.querySelector("[data-action='mark-out']");
  const historyButton = vehicleResult.querySelector("[data-action='toggle-history']");

  if (updateButton) updateButton.addEventListener("click", () => openUpdatePanel(record.reg));
  if (checkInButton) checkInButton.addEventListener("click", () => prepareVehicleCheckIn(record));
  if (markOutButton) markOutButton.addEventListener("click", () => markVehicleOut(record.reg));
  if (historyButton) historyButton.addEventListener("click", () => toggleVehicleHistory(record.reg));

  searchReg.value = record.reg;
  switchMainView("find");
}

async function renderSearchResults(searchTerm) {
  const records = await getMatchingLatestRecords(searchTerm);
  searchResultsState.records = records;
  searchResultsState.page = 1;

  if (records.length === 0) {
    vehicleResult.className = "vehicle-result empty";
    vehicleResult.innerHTML = "<p>No matching vehicles found.</p>";
    return;
  }

  if (records.length === 1) {
    await renderVehicleResult(records[0]);
    return;
  }

  renderSearchResultsPage();
}

function renderSearchResultsPage() {
  const records = searchResultsState.records;
  const totalPages = Math.ceil(records.length / SEARCH_RESULTS_PER_PAGE);
  searchResultsState.page = Math.min(Math.max(searchResultsState.page, 1), totalPages);

  const startIndex = (searchResultsState.page - 1) * SEARCH_RESULTS_PER_PAGE;
  const pageRecords = records.slice(startIndex, startIndex + SEARCH_RESULTS_PER_PAGE);

  vehicleResult.className = "vehicle-result";
  vehicleResult.innerHTML = `
    <div class="search-results-heading">
      <p class="small-note">${records.length} matching vehicles found</p>
    </div>
    <div class="history-list">
      ${pageRecords.map(record => {
        const statusClass = record.status === "IN" ? "status-in" : "status-out";
        return `
          <article class="history-card search-result-card" data-reg="${record.reg}">
            <div class="history-top">
              <span class="history-reg registration-plate">${formatRegistration(record.reg)}</span>
              <span class="history-time">${formatTime(record.createdAt)}</span>
            </div>
            ${record.status === "IN" ? `<p class="activity-parked"><span>Parked:</span> ${record.parkingLocation || "Not specified"}</p>` : ""}
            <div class="activity-footer">
              <span class="activity-status ${statusClass}">${record.status}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>
    ${totalPages > 1 ? `
      <div class="search-pagination">
        <button class="ghost-button" type="button" data-action="search-prev" ${searchResultsState.page === 1 ? "disabled" : ""}>Previous</button>
        <span class="pagination-status">Page ${searchResultsState.page} of ${totalPages}</span>
        <button class="ghost-button" type="button" data-action="search-next" ${searchResultsState.page === totalPages ? "disabled" : ""}>Next</button>
      </div>
    ` : ""}
  `;

  vehicleResult.querySelectorAll(".search-result-card").forEach(card => {
    card.addEventListener("click", () => renderVehicleResult(card.dataset.reg));
  });

  const previousButton = vehicleResult.querySelector("[data-action='search-prev']");
  const nextButton = vehicleResult.querySelector("[data-action='search-next']");

  if (previousButton) {
    previousButton.addEventListener("click", () => {
      searchResultsState.page -= 1;
      renderSearchResultsPage();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      searchResultsState.page += 1;
      renderSearchResultsPage();
    });
  }
}

async function openUpdatePanel(reg) {
  const latest = await getLatestRecord(reg);
  if (!latest) return;

  updateReg.value = latest.reg;
  updateParking.value = "";
  updateNote.value = "";
  updateStage.value = "Parked";
  setUpdateTitle(latest.reg);
  updatePanel.classList.remove("hidden");
  updatePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function toggleVehicleHistory(reg) {
  const panel = document.getElementById("vehicleHistoryPanel");

  if (!panel) return;

  if (!panel.classList.contains("hidden")) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }

  const history = await getVehicleHistory(reg);
  panel.classList.remove("hidden");
  panel.innerHTML = history.map(record => `
    <article class="history-card">
      <div class="history-top">
        <span class="history-stage">${record.stage}</span>
        <span class="history-time">${formatTime(record.createdAt)}</span>
      </div>
      <p class="history-note">${movementLine(record)}</p>
    </article>
  `).join("");
}

async function markVehicleOut(reg) {
  const latest = await getLatestRecord(reg);
  if (!latest || latest.status === "OUT") return;
  const staffName = await getCurrentStaffName();

  const record = buildRecord({
    reg: latest.reg,
    staff: staffName,
    vehicleType: latest.vehicleType,
    stage: "Out",
    note: "",
    status: "OUT",
    action: "Marked out",
    mileage: latest.mileage || "",
    parkingLocation: latest.parkingLocation || "",
    position: null
  });

  await addRecord(record);
}

async function renderActivity() {
  const { data, error } = await db
    .from("vehicle_movements")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const records = error ? handleDbError(error, []) : (data || []).map(mapDbRecord);

  if (records.length === 0) {
    activityList.innerHTML = `<div class="empty-state">No vehicle updates saved yet.</div>`;
    return;
  }

  activityList.innerHTML = records.map(record => {
    const statusClass = record.status === "IN" ? "status-in" : "status-out";
    return `
      <article class="history-card" data-reg="${record.reg}">
        <div class="history-top">
          <span class="history-reg registration-plate">${formatRegistration(record.reg)}</span>
          <span class="history-time">${formatTime(record.createdAt)}</span>
        </div>
        <p class="activity-parked"><span>Parked:</span> ${record.parkingLocation || "Not specified"}</p>
        <p class="history-note">${recentActivityDetails(record)}</p>
        <div class="activity-footer">
          <span class="activity-status ${statusClass}">${record.status}</span>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("#activityList .history-card").forEach(card => {
    card.addEventListener("click", () => renderVehicleResult(card.dataset.reg));
  });
}

async function getStatsUserId() {
  if (currentAuthUser?.id) return currentAuthUser.id;

  const {
    data: { user },
    error
  } = await db.auth.getUser();

  if (error || !user) {
    if (error) console.error(error);
    return null;
  }

  currentAuthUser = user;
  return user.id;
}

function buildActivityByDay(records, range) {
  const counts = new Map();
  records.forEach(record => {
    const date = new Date(record.created_at);
    const key = startOfDay(date).toISOString();
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const days = [];
  let cursor = startOfDay(range.start);
  const lastDay = startOfDay(range.end);

  while (cursor <= lastDay) {
    const key = cursor.toISOString();
    days.push({
      label: formatStatsDay(cursor),
      count: counts.get(key) || 0
    });
    cursor = addDays(cursor, 1);
  }

  return days;
}

function renderStatsBarChart(days) {
  const maxCount = Math.max(...days.map(day => day.count), 1);

  return `
    <div class="stats-chart" aria-label="Activity over time">
      ${days.map(day => `
        <div class="stats-bar-item">
          <span class="stats-bar-count">${day.count || ""}</span>
          <span class="stats-bar-track">
            <span class="stats-bar-fill" style="height: ${Math.max((day.count / maxCount) * 100, day.count ? 12 : 0)}%"></span>
          </span>
          <span class="stats-bar-label">${escapeHtml(day.label)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderStatsActivity(records) {
  if (records.length === 0) {
    return `<div class="empty-state">No personal activity for this period yet.</div>`;
  }

  return `
    <div class="history-list">
      ${records.slice(0, 5).map(row => {
        const record = mapDbRecord(row);
        const statusClass = record.status === "IN" ? "status-in" : "status-out";
        return `
          <article class="history-card stats-activity-card" data-reg="${escapeHtml(record.reg)}">
            <div class="history-top">
              <span class="history-reg registration-plate">${escapeHtml(formatRegistration(record.reg))}</span>
              <span class="history-time">${escapeHtml(formatTime(record.createdAt))}</span>
            </div>
            ${record.parkingLocation ? `<p class="activity-parked"><span>Parked:</span> ${escapeHtml(record.parkingLocation)}</p>` : ""}
            <p class="history-note">${escapeHtml(recentActivityDetails(record))}</p>
            <div class="activity-footer">
              <span class="activity-status ${statusClass}">${escapeHtml(record.status)}</span>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function getStatsMessage(total, displayName, periodLabel) {
  let group = "empty";

  if (total >= 75) {
    group = "huge";
  } else if (total >= 25) {
    group = "busy";
  } else if (total >= 8) {
    group = "steady";
  } else if (total > 0) {
    group = "light";
  }

  const messages = STATS_MESSAGES[group];
  const index = total % messages.length;
  const [title, body] = messages[index];

  if (total === 0) {
    return {
      title,
      body: `${body} No activity recorded ${periodLabel} yet.`
    };
  }

  return {
    title: `${title} ${displayName}.`,
    body: `${body} You've logged ${total} vehicle movement${total === 1 ? "" : "s"} ${periodLabel}.`
  };
}

async function renderMyStats() {
  const userId = await getStatsUserId();

  if (!userId) {
    statsContent.innerHTML = `<div class="empty-state">Sign in to view your stats.</div>`;
    return;
  }

  const period = statsPeriod.value || "today";
  const range = getStatsRange(period);
  statsContent.innerHTML = `<div class="empty-state">Loading your stats...</div>`;

  const { data, error } = await db
    .from("vehicle_movements")
    .select("id, registration, status, stage, parking_location, mileage, accuracy, note, staff_name, created_at")
    .eq("user_id", userId)
    .gte("created_at", range.start.toISOString())
    .lte("created_at", range.end.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    statsContent.innerHTML = `<div class="empty-state">Your stats could not be loaded. Please try again.</div>`;
    return;
  }

  const records = data || [];
  const total = records.length;
  const checkedIn = records.filter(isCheckInMovement).length;
  const markedOut = records.filter(isMarkedOutMovement).length;
  const updates = records.filter(record => !isCheckInMovement(record) && !isMarkedOutMovement(record)).length;
  const activeVehicles = new Set(records.filter(record => record.status === "IN").map(record => record.registration)).size;
  const [topLocation, topLocationCount] = getMode(records, "parking_location");
  const [topHour, topHourCount] = getMode(
    records.map(record => ({ hour: new Date(record.created_at).getHours() })),
    "hour"
  );
  const days = buildActivityByDay(records, range);
  const activeDays = days.filter(day => day.count > 0).length;
  const bestDay = days.slice().sort((a, b) => b.count - a.count)[0];
  const periodLabel = PERIOD_LABELS[period] || "this period";
  const displayName = currentUserProfile?.first_name || "there";
  const statsMessage = getStatsMessage(total, displayName, periodLabel);

  statsContent.innerHTML = `
    <div class="stats-performance-card">
      <div>
        <span class="stats-total">${total}</span>
        <p>Total movements ${periodLabel}</p>
      </div>
      <div>
        <h3>${escapeHtml(statsMessage.title)}</h3>
        <p>${escapeHtml(statsMessage.body)}</p>
      </div>
    </div>

    <div class="stats-grid">
      <article class="stat-card">
        <span>Checked in</span>
        <strong>${checkedIn}</strong>
      </article>
      <article class="stat-card">
        <span>Location updates</span>
        <strong>${updates}</strong>
      </article>
      <article class="stat-card">
        <span>Marked OUT</span>
        <strong>${markedOut}</strong>
      </article>
      <article class="stat-card">
        <span>Active vehicles handled</span>
        <strong>${activeVehicles}</strong>
      </article>
      <article class="stat-card stat-card-wide">
        <span>Most used location</span>
        <strong>${escapeHtml(topLocation)}</strong>
        <small>${topLocationCount} movement${topLocationCount === 1 ? "" : "s"}</small>
      </article>
      <article class="stat-card stat-card-wide">
        <span>Most active time</span>
        <strong>${topHourCount ? formatHourRange(Number(topHour)) : "Not recorded"}</strong>
        <small>${topHourCount} movement${topHourCount === 1 ? "" : "s"}</small>
      </article>
    </div>

    <section class="stats-panel">
      <div class="section-title">
        <h2>Activity over time</h2>
      </div>
      ${renderStatsBarChart(days)}
    </section>

    <div class="stats-grid stats-feedback-grid">
      <article class="stat-card stat-card-wide">
        <span>Active days</span>
        <strong>${activeDays}</strong>
        <small>${periodLabel}</small>
      </article>
      <article class="stat-card stat-card-wide">
        <span>Best day</span>
        <strong>${escapeHtml(bestDay?.label || "Not recorded")}</strong>
        <small>${bestDay?.count || 0} movement${bestDay?.count === 1 ? "" : "s"}</small>
      </article>
    </div>

    <section class="stats-panel">
      <div class="section-title">
        <h2>Recent personal activity</h2>
      </div>
      ${renderStatsActivity(records)}
    </section>
  `;

  statsContent.querySelectorAll(".stats-activity-card").forEach(card => {
    card.addEventListener("click", () => renderVehicleResult(card.dataset.reg));
  });
}

checkInTab.addEventListener("click", () => switchMainView("checkin"));
findTab.addEventListener("click", () => switchMainView("find"));
homeNavBtn.addEventListener("click", goHome);
myStatsNavBtn.addEventListener("click", () => {
  showStatsView().catch(error => {
    console.error(error);
    statsContent.innerHTML = `<div class="empty-state">Your stats could not be loaded. Please try again.</div>`;
  });
});
heroCard.addEventListener("click", goHome);
heroCard.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    goHome();
  }
});
profileMenuBtn.addEventListener("click", event => {
  event.stopPropagation();
  openProfileDrawer();
});
profileDrawerClose.addEventListener("click", () => closeProfileDrawer());
profileDrawerOverlay.addEventListener("click", () => closeProfileDrawer());
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && profileDrawer.classList.contains("open")) {
    closeProfileDrawer();
  }
});
parkingMapButtons.forEach(button => button.addEventListener("click", openParkingMap));
parkingMapClose.addEventListener("click", closeParkingMap);
parkingMapModal.addEventListener("click", event => {
  if (event.target === parkingMapModal) closeParkingMap();
});
parkingMapModal.addEventListener("close", resetParkingMap);

checkInMileage.addEventListener("input", () => {
  checkInMileage.value = String(checkInMileage.value || "").replace(/\D/g, "").slice(0, MAX_MILEAGE_DIGITS);
});

checkInForm.addEventListener("submit", async event => {
  event.preventDefault();
  checkInMessage.textContent = "";

  const reg = normaliseReg(checkInReg.value);
  if (!reg) {
    alert("Enter a vehicle registration first.");
    return;
  }

  const latest = await getLatestRecord(reg);
  if (latest?.status === "IN") {
    checkInMessage.textContent = "Vehicle is already checked in. Use Find Vehicle to Update Location instead.";
    return;
  }

  const button = checkInForm.querySelector("button[type='submit']");
  const parkingLocation = checkInParking.value;
  button.disabled = true;

  try {
    const position = await getPositionForSave({
      button,
      parkingLocation,
      messageElement: checkInMessage
    });

    if (position === undefined) return;

    const staffName = await getCurrentStaffName();
    const record = buildRecord({
      reg,
      staff: staffName,
      vehicleType: checkInType.value,
      stage: "Checked In",
      note: checkInNote.value,
      status: "IN",
      action: "Checked in",
      mileage: checkInMileage.value,
      parkingLocation,
      position
    });

    await addRecord(record);
    checkInReg.value = "";
    checkInMileage.value = "";
    checkInParking.value = "";
    checkInNote.value = "";
  } finally {
    button.disabled = false;
  }
});

searchForm.addEventListener("submit", async event => {
  event.preventDefault();

  const reg = normaliseReg(searchReg.value);
  if (!reg) {
    alert("Enter a registration to search.");
    return;
  }

  await renderSearchResults(reg);
});

updateForm.addEventListener("submit", async event => {
  event.preventDefault();
  updateMessage.textContent = "";

  const latest = await getLatestRecord(updateReg.value);
  if (!latest) return;

  const button = updateForm.querySelector("button[type='submit']");
  const parkingLocation = updateParking.value;
  button.disabled = true;

  try {
    const position = await getPositionForSave({
      button,
      parkingLocation,
      messageElement: updateMessage
    });

    if (position === undefined) return;

    const staffName = await getCurrentStaffName();
    const record = buildRecord({
      reg: latest.reg,
      staff: staffName,
      vehicleType: latest.vehicleType,
      stage: updateStage.value,
      note: updateNote.value,
      status: "IN",
      action: "Location updated",
      mileage: latest.mileage || "",
      parkingLocation,
      position
    });

    await addRecord(record);
    updatePanel.classList.add("hidden");
    updateNote.value = "";
  } finally {
    button.disabled = false;
  }
});

cancelUpdateBtn.addEventListener("click", () => {
  updatePanel.classList.add("hidden");
});

checkInGpsEnabled.addEventListener("change", () => setGpsEnabled(checkInGpsEnabled.checked));
updateGpsEnabled.addEventListener("change", () => setGpsEnabled(updateGpsEnabled.checked));
themeToggle.addEventListener("change", () => setTheme(themeToggle.checked ? "dark" : "light"));
statsPeriod.addEventListener("change", () => {
  renderMyStats().catch(error => {
    console.error(error);
    statsContent.innerHTML = `<div class="empty-state">Your stats could not be loaded. Please try again.</div>`;
  });
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  loginMessage.textContent = "";

  const button = loginForm.querySelector("button[type='submit']");
  button.disabled = true;
  button.textContent = "Signing In...";

  const { error } = await db.auth.signInWithPassword({
    email: loginEmail.value.trim(),
    password: loginPassword.value
  });

  button.disabled = false;
  button.textContent = "Sign In";

  if (error) {
    console.error(error);
    loginMessage.textContent = "Sign in failed. Check your email and password.";
  }
});

signOutBtn.addEventListener("click", async () => {
  showLoading();
  const { error } = await db.auth.signOut();

  if (error) {
    console.error(error);
    alert("Sign out failed. Please try again.");
    await showApp();
  }
});

async function handleAuthenticatedSession(session) {
  const canAccess = await loadCurrentUserProfile(session.user);

  if (!canAccess) {
    await db.auth.signOut();
    currentAuthUser = null;
    currentUserProfile = null;
    showLogin("Your account is inactive. Please contact an administrator.");
    return;
  }

  await showApp();
}

async function resolveAuthState(session) {
  showLoading();

  if (session) {
    await handleAuthenticatedSession(session);
  } else {
    currentAuthUser = null;
    currentUserProfile = null;
    showLogin();
  }
}

db.auth.onAuthStateChange((event, session) => {
  if (!initialAuthResolved || event === "INITIAL_SESSION") return;

  if (event === "TOKEN_REFRESHED" && session?.user) {
    currentAuthUser = session.user;
    return;
  }

  if (
    event === "SIGNED_IN" &&
    currentAuthUser?.id === session?.user?.id &&
    !appShell.classList.contains("hidden")
  ) {
    return;
  }

  resolveAuthState(session).catch(error => {
    console.error(error);
    showLogin("Could not verify your session. Please sign in again.");
  });
});

async function initialiseAuth() {
  showLoading();

  try {
    const {
      data: { session },
      error
    } = await db.auth.getSession();

    if (error) throw error;
    await resolveAuthState(session);
  } catch (error) {
    console.error(error);
    showLogin("Could not verify your session. Please sign in again.");
  } finally {
    initialAuthResolved = true;
  }
}

initialiseTheme();
populateParkingLocations();
initialiseGpsPreference();
initialiseAuth();
