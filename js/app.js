const STORAGE_KEY = "vehicleLocationLogRecordsV2";

const checkInTab = document.getElementById("checkInTab");
const findTab = document.getElementById("findTab");
const checkInView = document.getElementById("checkInView");
const findView = document.getElementById("findView");
const updatePanel = document.getElementById("updatePanel");

const checkInForm = document.getElementById("checkInForm");
const checkInReg = document.getElementById("checkInReg");
const checkInStaff = document.getElementById("checkInStaff");
const checkInType = document.getElementById("checkInType");
const checkInNote = document.getElementById("checkInNote");

const searchForm = document.getElementById("searchForm");
const searchReg = document.getElementById("searchReg");
const vehicleResult = document.getElementById("vehicleResult");

const updateForm = document.getElementById("updateForm");
const updateTitle = document.getElementById("updateTitle");
const updateReg = document.getElementById("updateReg");
const updateStaff = document.getElementById("updateStaff");
const updateStage = document.getElementById("updateStage");
const updateNote = document.getElementById("updateNote");
const cancelUpdateBtn = document.getElementById("cancelUpdateBtn");

const activityList = document.getElementById("activityList");
const clearDemoBtn = document.getElementById("clearDemoBtn");

function getRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function normaliseReg(value) {
  return value.trim().toUpperCase().replace(/\s+/g, " ");
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
}

function getLatestRecord(reg) {
  const cleaned = normaliseReg(reg);
  return getRecords().slice().reverse().find(r => r.reg === cleaned);
}

function getVehicleHistory(reg) {
  const cleaned = normaliseReg(reg);
  return getRecords().filter(r => r.reg === cleaned).slice().reverse();
}

function mapsUrl(record) {
  return `https://www.google.com/maps?q=${record.lat},${record.lng}`;
}

function buildRecord({ reg, staff, vehicleType, stage, note, status, action, position }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    reg: normaliseReg(reg),
    staff: staff.trim() || "Demo User",
    vehicleType: vehicleType || "Customer vehicle",
    stage,
    note: note.trim(),
    status,
    action,
    lat: position ? position.coords.latitude : null,
    lng: position ? position.coords.longitude : null,
    accuracy: position ? position.coords.accuracy : null,
    createdAt: new Date().toISOString()
  };
}

function addRecord(record) {
  const records = getRecords();
  records.push(record);
  saveRecords(records);
  renderActivity();
  renderVehicleResult(getLatestRecord(record.reg));
}

function captureLocation(successCallback, button) {
  if (!navigator.geolocation) {
    alert("This browser does not support GPS location capture.");
    return;
  }

  const originalText = button.textContent;
  button.textContent = "Getting GPS...";
  button.disabled = true;

  navigator.geolocation.getCurrentPosition(
    position => {
      button.textContent = originalText;
      button.disabled = false;
      successCallback(position);
    },
    error => {
      button.textContent = originalText;
      button.disabled = false;
      alert(`Location could not be captured: ${error.message}`);
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    }
  );
}

function renderVehicleResult(record) {
  if (!record) {
    vehicleResult.className = "vehicle-result empty";
    vehicleResult.innerHTML = "<p>No saved record found for that registration.</p>";
    return;
  }

  const history = getVehicleHistory(record.reg);
  const hasLocation = record.lat !== null && record.lng !== null;
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
        <div class="detail-label">GPS accuracy</div>
        <p class="detail-value">${hasLocation ? `Approx. ${Math.round(record.accuracy)}m` : "No location saved"}</p>
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

  if (updateButton) {
    updateButton.addEventListener("click", () => openUpdatePanel(record.reg));
  }

  if (markOutButton) {
    markOutButton.addEventListener("click", () => markVehicleOut(record.reg));
  }

  if (historyButton) {
    historyButton.addEventListener("click", () => toggleVehicleHistory(record.reg));
  }

  searchReg.value = record.reg;
  switchMainView("find");
}

function openUpdatePanel(reg) {
  const latest = getLatestRecord(reg);
  if (!latest) return;

  updateReg.value = latest.reg;
  updateStaff.value = latest.staff === "Demo User" ? "" : latest.staff;
  updateNote.value = "";
  updateStage.value = "Moved / Reparked";
  updateTitle.textContent = `Update ${latest.reg}`;
  updatePanel.classList.remove("hidden");
  updatePanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function toggleVehicleHistory(reg) {
  const panel = document.getElementById("vehicleHistoryPanel");
  const history = getVehicleHistory(reg);

  if (!panel) return;

  if (!panel.classList.contains("hidden")) {
    panel.classList.add("hidden");
    panel.innerHTML = "";
    return;
  }

  panel.classList.remove("hidden");
  panel.innerHTML = history.map(record => `
    <article class="history-card">
      <div class="history-top">
        <span class="history-reg">${record.stage}</span>
        <span class="history-time">${formatTime(record.createdAt)}</span>
      </div>
      <p class="history-note">
        ${record.action} by ${record.staff}
        ${record.accuracy ? ` · GPS approx. ${Math.round(record.accuracy)}m` : ""}
        ${record.note ? ` · ${record.note}` : ""}
      </p>
    </article>
  `).join("");
}

function markVehicleOut(reg) {
  const latest = getLatestRecord(reg);
  if (!latest || latest.status === "OUT") return;

  const record = buildRecord({
    reg: latest.reg,
    staff: latest.staff || "Demo User",
    vehicleType: latest.vehicleType,
    stage: "Out",
    note: "",
    status: "OUT",
    action: "Marked out",
    position: null
  });

  addRecord(record);
}

function renderActivity() {
  const records = getRecords().slice().reverse();

  if (records.length === 0) {
    activityList.innerHTML = `<div class="empty-state">No demo activity saved yet.</div>`;
    return;
  }

  activityList.innerHTML = records.map(record => `
    <article class="history-card" data-reg="${record.reg}">
      <div class="history-top">
        <span class="history-reg">${record.reg}</span>
        <span class="history-time">${formatTime(record.createdAt)}</span>
      </div>
      <p class="history-note">
        ${record.action} · ${record.stage} · ${record.staff}
        ${record.note ? ` · ${record.note}` : ""}
      </p>
    </article>
  `).join("");

  document.querySelectorAll("#activityList .history-card").forEach(card => {
    card.addEventListener("click", () => renderVehicleResult(getLatestRecord(card.dataset.reg)));
  });
}

checkInTab.addEventListener("click", () => switchMainView("checkin"));
findTab.addEventListener("click", () => switchMainView("find"));

checkInForm.addEventListener("submit", event => {
  event.preventDefault();

  const reg = normaliseReg(checkInReg.value);
  if (!reg) {
    alert("Enter a vehicle registration first.");
    return;
  }

  const button = checkInForm.querySelector("button[type='submit']");
  captureLocation(position => {
    const record = buildRecord({
      reg,
      staff: checkInStaff.value,
      vehicleType: checkInType.value,
      stage: "Checked In",
      note: checkInNote.value,
      status: "IN",
      action: "Checked in",
      position
    });

    addRecord(record);
    checkInReg.value = "";
    checkInNote.value = "";
  }, button);
});

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  const reg = normaliseReg(searchReg.value);
  if (!reg) {
    alert("Enter a registration to search.");
    return;
  }

  renderVehicleResult(getLatestRecord(reg));
});

updateForm.addEventListener("submit", event => {
  event.preventDefault();

  const latest = getLatestRecord(updateReg.value);
  if (!latest) return;

  const button = updateForm.querySelector("button[type='submit']");
  captureLocation(position => {
    const record = buildRecord({
      reg: latest.reg,
      staff: updateStaff.value,
      vehicleType: latest.vehicleType,
      stage: updateStage.value,
      note: updateNote.value,
      status: "IN",
      action: "Location updated",
      position
    });

    addRecord(record);
    updatePanel.classList.add("hidden");
    updateNote.value = "";
  }, button);
});

cancelUpdateBtn.addEventListener("click", () => {
  updatePanel.classList.add("hidden");
});

clearDemoBtn.addEventListener("click", () => {
  if (!confirm("Clear all demo records from this device?")) return;

  localStorage.removeItem(STORAGE_KEY);
  renderActivity();
  vehicleResult.className = "vehicle-result empty";
  vehicleResult.innerHTML = "<p>Search for a registration to view the latest status, location, and movement history.</p>";
  updatePanel.classList.add("hidden");
});

renderActivity();
