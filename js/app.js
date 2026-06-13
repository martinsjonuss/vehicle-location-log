const vehicleForm = document.getElementById("vehicleForm");
const registrationInput = document.getElementById("registration");
const locationInput = document.getElementById("location");
const notesInput = document.getElementById("notes");
const searchInput = document.getElementById("searchInput");
const vehicleList = document.getElementById("vehicleList");

const STORAGE_KEY = "vehicleLocationLog";

function getVehicles() {
    const storedVehicles = localStorage.getItem(STORAGE_KEY);
    return storedVehicles ? JSON.parse(storedVehicles) : [];
}

function saveVehicles(vehicles) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

function normaliseRegistration(registration) {
    return registration.trim().toUpperCase().replace(/\s+/g, "");
}

function displayVehicles(filterText = "") {
    const vehicles = getVehicles();
    const searchValue = normaliseRegistration(filterText);

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.registration.includes(searchValue)
    );

    vehicleList.innerHTML = "";

    if (filteredVehicles.length === 0) {
        vehicleList.innerHTML = '<p class="empty-state">No vehicles found.</p>';
        return;
    }

    filteredVehicles.forEach(vehicle => {
        const item = document.createElement("div");
        item.className = "vehicle-item";

        item.innerHTML = `
            <strong>${vehicle.registration}</strong>
            <span>Location: ${vehicle.location}</span><br>
            <span>Logged: ${vehicle.loggedAt}</span>
            ${vehicle.notes ? `<p>${vehicle.notes}</p>` : ""}
        `;

        vehicleList.appendChild(item);
    });
}

vehicleForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const registration = normaliseRegistration(registrationInput.value);
    const location = locationInput.value;
    const notes = notesInput.value.trim();

    const vehicles = getVehicles();

    const newVehicle = {
        registration,
        location,
        notes,
        loggedAt: new Date().toLocaleString("en-GB")
    };

    vehicles.unshift(newVehicle);
    saveVehicles(vehicles);

    vehicleForm.reset();
    displayVehicles(searchInput.value);
});

searchInput.addEventListener("input", function () {
    displayVehicles(searchInput.value);
});

displayVehicles();
