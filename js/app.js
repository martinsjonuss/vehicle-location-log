const checkInTab = document.getElementById("checkInTab");
const findTab = document.getElementById("findTab");
const checkInView = document.getElementById("checkInView");
const findView = document.getElementById("findView");
const updatePanel = document.getElementById("updatePanel");

const checkInForm = document.getElementById("checkInForm");
const checkInReg = document.getElementById("checkInReg");
const checkInMileage = document.getElementById("checkInMileage");
const checkInStaff = document.getElementById("checkInStaff");
const checkInType = document.getElementById("checkInType");
const checkInParking = document.getElementById("checkInParking");
const checkInNote = document.getElementById("checkInNote");

const searchForm = document.getElementById("searchForm");
const searchReg = document.getElementById("searchReg");
const vehicleResult = document.getElementById("vehicleResult");

const updateForm = document.getElementById("updateForm");
const updateTitle = document.getElementById("updateTitle");
const updateReg = document.getElementById("updateReg");
const updateStaff = document.getElementById("updateStaff");
const updateStage = document.getElementById("updateStage");
const updateParking = document.getElementById("updateParking");
const updateNote = document.getElementById("updateNote");
const cancelUpdateBtn = document.getElementById("cancelUpdateBtn");

const activityList = document.getElementById("activityList");
const refreshBtn = document.getElementById("refreshBtn");

function normaliseReg(value) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

function formatMileage(value) {
  if (!value) return "Not recorded";
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return value;
  return numeric.toLocaleString("en-GB");
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

function actionFromRecord(record) {
  if (record.status === "OUT") return "Marked out";
  if (record.stage === "Checked In") return "Checked in";
  return "Location updated";
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
    mileage: row.mileage || "",
    parkingLocation: row.parking_location || "",
    lat: row.latitude,
    lng: row.longitude,
    accuracy: row.accuracy,
    createdAt: row.created_at
  };
}

function mapRecordForInsert(record) {
  return {
    registration: record.reg,
    status: record.status,
    stage: record.stage,
    vehicle_type: record.vehicleType,
    mileage: record.mileage ? Number(record.mileage) : null,
    parking_location: record.parkingLocation || null,
    staff_name: record.staff,
    note: record.note || null,
    latitude: record.lat,
    longitude: record.lng,
    accuracy: record.accuracy
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

function mapsUrl(record) {
  return `https://www.google.com/maps?q=${record.lat},${record.lng}`;
}

function buildRecord({ reg, staff, vehicleType, stage, note, status, action, position, mileage, parkingLocation }) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    reg: normaliseReg(reg),
    staff: staff.trim() || "Demo User",
    vehicleType: vehicleType || "Customer vehicle",
    stage,
    note: note.trim(),
    status,
    action,
    mileage: mileage || "",
    parkingLocation: parkingLocation || "",
    lat: position ? position.coords.latitude : null,
    lng: position ? position.coords.longitude : null,
    accuracy: position ? position.coords.accuracy : null,
    createdAt: new Date().toISOString()
  };
}

async function addRecord(record) {
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

function movementLine(record) {
  return [
    `${record.action} by ${record.staff}`,
    record.status ? `Status: ${record.status}` : "",
    record.parkingLocation ? `Parking: ${record.parkingLocation}` : "",
    record.mileage ? `Mileage: ${formatMileage(record.mileage)}` : "",
    record.accuracy ? `GPS approx. ${Math.round(record.accuracy)}m` : "",
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
        <div class="detail-label">Mileage</div>
        <p class="detail-value">${formatMileage(record.mileage)}</p>
      </div>
      <div class="detail-card">
        <div class="detail-label">Parking location</div>
        <p class="detail-value">${record.parkingLocation || "Not selected"}</p>
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

  if (updateButton) updateButton.addEventListener("click", () => openUpdatePanel(record.reg));
  if (markOutButton) markOutButton.addEventListener("click", () => markVehicleOut(record.reg));
  if (historyButton) historyButton.addEventListener("click", () => toggleVehicleHistory(record.reg));

  searchReg.value = record.reg;
  switchMainView("find");
}

async function openUpdatePanel(reg) {
  const latest = await getLatestRecord(reg);
  if (!latest) return;

  updateReg.value = latest.reg;
  updateStaff.value = latest.staff === "Demo User" ? "" : latest.staff;
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

  const record = buildRecord({
    reg: latest.reg,
    staff: latest.staff || "Demo User",
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

checkInForm.addEventListener("submit", event => {
  event.preventDefault();

  const reg = normaliseReg(checkInReg.value);
  if (!reg) {
    alert("Enter a vehicle registration first.");
    return;
  }

  const button = checkInForm.querySelector("button[type='submit']");
  captureLocation(async position => {
    const record = buildRecord({
      reg,
      staff: checkInStaff.value,
      vehicleType: checkInType.value,
      stage: "Checked In",
      note: checkInNote.value,
      status: "IN",
      action: "Checked in",
      mileage: checkInMileage.value,
      parkingLocation: checkInParking.value,
      position
    });

    await addRecord(record);
    checkInReg.value = "";
    checkInMileage.value = "";
    checkInParking.value = "";
    checkInNote.value = "";
  }, button);
});

searchForm.addEventListener("submit", async event => {
  event.preventDefault();

  const reg = normaliseReg(searchReg.value);
  if (!reg) {
    alert("Enter a registration to search.");
    return;
  }

  await renderVehicleResult(reg);
});

updateForm.addEventListener("submit", async event => {
  event.preventDefault();

  const latest = await getLatestRecord(updateReg.value);
  if (!latest) return;

  const button = updateForm.querySelector("button[type='submit']");
  captureLocation(async position => {
    const record = buildRecord({
      reg: latest.reg,
      staff: updateStaff.value,
      vehicleType: latest.vehicleType,
      stage: updateStage.value,
      note: updateNote.value,
      status: "IN",
      action: "Location updated",
      mileage: latest.mileage || "",
      parkingLocation: updateParking.value,
      position
    });

    await addRecord(record);
    updatePanel.classList.add("hidden");
    updateNote.value = "";
  }, button);
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

renderActivity();
