const STORAGE_KEY = "vehicleLocationLogRecords";

const saveView = document.getElementById("saveView");
const searchView = document.getElementById("searchView");
const showSaveViewBtn = document.getElementById("showSaveViewBtn");
const showSearchViewBtn = document.getElementById("showSearchViewBtn");

const saveLocationForm = document.getElementById("saveLocationForm");
const regInput = document.getElementById("regInput");
const staffInput = document.getElementById("staffInput");
const vehicleTypeInput = document.getElementById("vehicleTypeInput");
const noteInput = document.getElementById("noteInput");
const markOutBtn = document.getElementById("markOutBtn");

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const vehicleResult = document.getElementById("vehicleResult");
const historyList = document.getElementById("historyList");
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

function switchView(viewName) {
  const saveActive = viewName === "save";
  saveView.classList.toggle("hidden", !saveActive);
  searchView.classList.toggle("hidden", saveActive);
  showSaveViewBtn.classList.toggle("active", saveActive);
  showSearchViewBtn.classList.toggle("active", !saveActive);
}

function createBaseRecord(status, position = null) {
  const reg = normaliseReg(regInput.value);

  if (!reg) {
    alert("Enter a vehicle registration first.");
    return null;
  }

  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    reg,
    status,
    staff: staffInput.value.trim() || "Demo User",
    vehicleType: vehicleTypeInput.value,
    note: noteInput.value.trim(),
    lat: position ? position.coords.latitude : null,
    lng: position ? position.coords.longitude : null,
    accuracy: position ? position.coords.accuracy : null,
    createdAt: new Date().toISOString()
  };
}

function storeRecord(record) {
  const records = getRecords();
  records.push(record);
  saveRecords(records);
  renderHistory();
  renderVehicleResult(getLatestRecordByReg(record.reg));
}

function getLatestRecordByReg(reg) {
  const cleanedReg = normaliseReg(reg);
  return getRecords()
    .slice()
    .reverse()
    .find(record => record.reg === cleanedReg);
}

function getRegHistory(reg) {
  const cleanedReg = normaliseReg(reg);
  return getRecords()
    .filter(record => record.reg === cleanedReg)
    .slice()
    .reverse();
}

function mapsUrl(record) {
  return `https://www.google.com/maps?q=${record.lat},${record.lng}`;
}

function renderVehicleResult(record) {
  if (!record) {
    vehicleResult.className = "vehicle-result empty";
    vehicleResult.innerHTML = "<p>No saved record found for that registration.</p>";
    return;
  }

  const hasLocation = record.lat !== null && record.lng !== null;
  const statusClass = record.status === "IN" ? "status-in" : "status-out";
  const history = getRegHistory(record.reg);

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
    </div>

    ${hasLocation ? `<a class="maps-button" href="${mapsUrl(record)}" target="_blank" rel="noopener">Open Location in Google Maps</a>` : ""}

    <div class="detail-card" style="margin-top: 14px;">
      <div class="detail-label">Movement history</div>
      <p class="detail-value">${history.length} saved movement${history.length === 1 ? "" : "s"}</p>
    </div>
  `;

  searchInput.value = record.reg;
  switchView("search");
}

function renderHistory() {
  const records = getRecords().slice().reverse();

  if (records.length === 0) {
    historyList.innerHTML = `<div class="empty-state">No demo vehicle movements saved yet.</div>`;
    return;
  }

  historyList.innerHTML = records
    .map(record => {
      const statusLabel = record.status === "IN" ? "Location updated" : "Marked out";
      const accuracy = record.accuracy ? ` · ${Math.round(record.accuracy)}m approx.` : "";
      return `
        <article class="history-card" data-reg="${record.reg}">
          <div class="history-top">
            <span class="history-reg">${record.reg}</span>
            <span class="history-time">${formatTime(record.createdAt)}</span>
          </div>
          <p class="history-note">
            ${statusLabel} by ${record.staff}${accuracy}
            ${record.note ? ` · ${record.note}` : ""}
          </p>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".history-card").forEach(card => {
    card.addEventListener("click", () => {
      renderVehicleResult(getLatestRecordByReg(card.dataset.reg));
    });
  });
}

function resetForm() {
  regInput.value = "";
  noteInput.value = "";
}

showSaveViewBtn.addEventListener("click", () => switchView("save"));
showSearchViewBtn.addEventListener("click", () => switchView("search"));

saveLocationForm.addEventListener("submit", event => {
  event.preventDefault();

  if (!navigator.geolocation) {
    alert("This browser does not support GPS location capture.");
    return;
  }

  const submitButton = saveLocationForm.querySelector("button[type='submit']");
  submitButton.textContent = "Getting GPS...";
  submitButton.disabled = true;

  navigator.geolocation.getCurrentPosition(
    position => {
      const record = createBaseRecord("IN", position);
      submitButton.textContent = "Save Current Location";
      submitButton.disabled = false;

      if (!record) return;

      storeRecord(record);
      resetForm();
    },
    error => {
      submitButton.textContent = "Save Current Location";
      submitButton.disabled = false;
      alert(`Location could not be captured: ${error.message}`);
    },
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 0
    }
  );
});

markOutBtn.addEventListener("click", () => {
  const record = createBaseRecord("OUT", null);
  if (!record) return;

  storeRecord(record);
  resetForm();
});

searchForm.addEventListener("submit", event => {
  event.preventDefault();

  const reg = normaliseReg(searchInput.value);

  if (!reg) {
    alert("Enter a registration to search.");
    return;
  }

  renderVehicleResult(getLatestRecordByReg(reg));
});

clearDemoBtn.addEventListener("click", () => {
  const confirmed = confirm("Clear all demo records from this device?");
  if (!confirmed) return;

  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
  vehicleResult.className = "vehicle-result empty";
  vehicleResult.innerHTML = "<p>Search for a registration to see the latest saved location.</p>";
});

renderHistory();
