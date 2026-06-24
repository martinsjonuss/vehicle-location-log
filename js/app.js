const loginScreen = document.getElementById("loginScreen");
const appShell = document.getElementById("appShell");
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginMessage = document.getElementById("loginMessage");
const signOutBtn = document.getElementById("signOutBtn");

const checkInTab = document.getElementById("checkInTab");
const findTab = document.getElementById("findTab");
const checkInView = document.getElementById("checkInView");
const findView = document.getElementById("findView");
const updatePanel = document.getElementById("updatePanel");

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
const refreshBtn = document.getElementById("refreshBtn");
const GPS_PREFERENCE_KEY = "vehicleLocationLogGpsEnabled";
const MAX_MILEAGE_DIGITS = 7;
const MAX_REGISTRATION_CHARS = 15;
const SEARCH_RESULTS_PER_PAGE = 5;
const searchResultsState = {
  records: [],
  page: 1
};

function normaliseReg(value) {
  return value.trim().toUpperCase().replace(/\s+/g, "").slice(0, MAX_REGISTRATION_CHARS);
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

function switchMainView(viewName) {
  const checkInActive = viewName === "checkin";
  checkInView.classList.toggle("hidden", !checkInActive);
  findView.classList.toggle("hidden", checkInActive);
  checkInTab.classList.toggle("active", checkInActive);
  findTab.classList.toggle("active", !checkInActive);
  updatePanel.classList.add("hidden");
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

function showLogin() {
  loginScreen.classList.remove("hidden");
  appShell.classList.add("hidden");
  updatePanel.classList.add("hidden");
  loginPassword.value = "";
}

async function showApp() {
  loginScreen.classList.add("hidden");
  appShell.classList.remove("hidden");
  loginMessage.textContent = "";
  await renderActivity();
}

async function getCurrentStaffName() {
  const {
    data: { user },
    error
  } = await db.auth.getUser();

  if (error) {
    console.error(error);
    return "Unknown User";
  }

  return user?.email || "Unknown User";
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

function buildRecord({ reg, staff, vehicleType, stage, note, status, action, position, mileage, parkingLocation }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    reg: normaliseReg(reg),
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
  const {
    data: { session }
  } = await db.auth.getSession();

  if (!session) {
    showLogin();
    alert("Please sign in before saving vehicle records.");
    return;
  }

  const { error } = await db
    .from("vehicle_movements")
    .insert(mapRecordForInsert(record));

  if (error) {
    console.error(error);
    alert("Vehicle record could not be saved. Please try again.");
    return;
  }

  await renderActivity();
  await renderVehicleResult(record.reg);
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
  return [
    `${record.action} by ${record.staff}`,
    record.status ? `Status: ${record.status}` : "",
    record.parkingLocation ? `Parking: ${record.parkingLocation}` : "",
    hasRecordedMileage(record) ? `Mileage: ${formatMileage(record.mileage)}` : "",
    hasValidAccuracy(record) ? `GPS approx. ${Math.round(record.accuracy)}m` : "",
    record.note ? record.note : ""
  ].filter(Boolean).join(" · ");
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
      <div>
        <div class="reg-large">${record.reg}</div>
        <p class="small-note">${record.vehicleType}</p>
      </div>
      <span class="status-pill ${statusClass}">${record.status}</span>
    </div>

    <div class="detail-grid">
      <div class="detail-card">
        <div class="detail-label">Current stage</div>
        <p class="detail-value">${record.stage}</p>
      </div>
      <div class="detail-card">
        <div class="detail-label">Last updated</div>
        <p class="detail-value">${formatTime(record.createdAt)}</p>
      </div>
      <div class="detail-card">
        <div class="detail-label">Updated by</div>
        <p class="detail-value">${record.staff}</p>
      </div>
      <div class="detail-card">
        <div class="detail-label">Mileage</div>
        <p class="detail-value">${formatMileage(record.mileage)}</p>
      </div>
      <div class="detail-card">
        <div class="detail-label">Parking location</div>
        <p class="detail-value">${record.parkingLocation || "Not selected"}</p>
      </div>
      <div class="detail-card">
        <div class="detail-label">GPS accuracy</div>
        <p class="detail-value">${hasValidAccuracy(record) ? `Approx. ${Math.round(record.accuracy)}m` : "Not available"}</p>
      </div>
      <div class="detail-card">
        <div class="detail-label">Note</div>
        <p class="detail-value">${record.note || "No note added"}</p>
      </div>
      <button class="detail-card history-toggle" data-action="toggle-history" data-reg="${record.reg}">
        <div class="detail-label">Movement history</div>
        <p class="detail-value">${history.length} saved movement${history.length === 1 ? "" : "s"}</p>
      </button>
    </div>

    <div class="result-actions">
      ${hasLocation ? `<a class="maps-button" href="${mapsUrl(record)}" target="_blank" rel="noopener">Open Location</a>` : ""}
      ${record.status === "IN" ? `<button class="primary-button" data-action="update-location" data-reg="${record.reg}">Update Location</button>` : ""}
      ${record.status === "IN" ? `<button class="secondary-button" data-action="mark-out" data-reg="${record.reg}">Mark Out</button>` : ""}
    </div>

    <div id="vehicleHistoryPanel" class="vehicle-history hidden"></div>
  `;

  const updateButton = vehicleResult.querySelector("[data-action='update-location']");
  const markOutButton = vehicleResult.querySelector("[data-action='mark-out']");
  const historyButton = vehicleResult.querySelector("[data-action='toggle-history']");

  if (updateButton) updateButton.addEventListener("click", () => openUpdatePanel(record.reg));
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
              <div>
                <span class="history-reg">${record.reg}</span>
                <div class="status-line">
                  <span class="activity-status ${statusClass}">${record.status}</span>
                </div>
              </div>
              <span class="history-time">${formatTime(record.createdAt)}</span>
            </div>
            <p class="history-note">
              ${[
                record.stage,
                record.parkingLocation ? `Parking: ${record.parkingLocation}` : ""
              ].filter(Boolean).join(" · ")}
            </p>
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
  updateParking.value = latest.parkingLocation || "";
  updateNote.value = "";
  updateStage.value = "Moved / Reparked";
  updateTitle.textContent = `Update ${latest.reg}`;
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
        <span class="history-reg">${record.stage}</span>
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
    .limit(10);

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
          <div>
            <span class="history-reg">${record.reg}</span>
            <div class="status-line">
              <span class="activity-status ${statusClass}">${record.status}</span>
            </div>
          </div>
          <span class="history-time">${formatTime(record.createdAt)}</span>
        </div>
        <p class="history-note">${movementLine(record)}</p>
      </article>
    `;
  }).join("");

  document.querySelectorAll("#activityList .history-card").forEach(card => {
    card.addEventListener("click", () => renderVehicleResult(card.dataset.reg));
  });
}

checkInTab.addEventListener("click", () => switchMainView("checkin"));
findTab.addEventListener("click", () => switchMainView("find"));

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

refreshBtn.addEventListener("click", async () => {
  await renderActivity();
  vehicleResult.className = "vehicle-result empty";
  vehicleResult.innerHTML = "<p>Search for a registration to view the latest status, location, and movement history.</p>";
  updatePanel.classList.add("hidden");
});

checkInGpsEnabled.addEventListener("change", () => setGpsEnabled(checkInGpsEnabled.checked));
updateGpsEnabled.addEventListener("change", () => setGpsEnabled(updateGpsEnabled.checked));

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
  const { error } = await db.auth.signOut();

  if (error) {
    console.error(error);
    alert("Sign out failed. Please try again.");
  }
});

db.auth.onAuthStateChange(async (_event, session) => {
  if (session) {
    await showApp();
  } else {
    showLogin();
  }
});

async function initialiseAuth() {
  const {
    data: { session },
    error
  } = await db.auth.getSession();

  if (error) {
    console.error(error);
    showLogin();
    return;
  }

  if (session) {
    await showApp();
  } else {
    showLogin();
  }
}

initialiseGpsPreference();
initialiseAuth();
