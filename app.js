let map;
let markers = [];

function clearMarkers() {
  markers.forEach(marker => marker.remove());
  markers = [];
}

function loadCafes(lat, lng) {
  clearMarkers();

  const radius = document.getElementById("radius-select")
    ? document.getElementById("radius-select").value
    : 1500;

  const query = `
    [out:json];
    node["amenity"="cafe"](around:${radius},${lat},${lng});
    out body;
  `;

  document.getElementById("loading").textContent = "Searching for cafés...";
  document.getElementById("results-count").textContent = "";

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("loading").textContent = "";

      if (data.elements.length === 0) {
        document.getElementById("cafe-list").innerHTML = `
          <li style="border-left: 3px solid #888; color: #888;">
            No cafés found in this area. Try increasing the radius!
          </li>
        `;
        document.getElementById("results-count").textContent = "No cafés found nearby";
        return;
      }

      document.getElementById("results-count").textContent =
        `Found ${data.elements.length} cafés nearby`;

      const list = document.getElementById("cafe-list");
      list.innerHTML = "";

      data.elements.forEach(cafe => {
        const name = cafe.tags.name || "Unnamed Café";
        const address = cafe.tags["addr:street"] || "Address not available";
        const hours = cafe.tags.opening_hours || "Hours not available";
        const phone = cafe.tags.phone || null;
        const rating = cafe.tags.stars || cafe.tags.rating || null;

        const marker = L.marker([cafe.lat, cafe.lon])
          .addTo(map)
          .bindPopup(`
            <strong>☕ ${name}</strong><br/>
            🕐 ${hours}<br/>
            ${phone ? `📞 ${phone}` : ""}
          `);
        markers.push(marker);

        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${name}</strong><br/>
          <span style="color:#888; font-size:12px">📍 ${address}</span><br/>
          ${rating ? `<span style="color:#c8a165; font-size:12px">⭐ ${rating}</span>` : ""}
        `;
        li.onclick = () => {
          map.setView([cafe.lat, cafe.lon], 17);
          marker.openPopup();
        };
        list.appendChild(li);
      });
    });
}

navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  map = L.map("map").setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  loadCafes(lat, lng);
});

function searchCity() {
  const query = document.getElementById("search-input").value;

  fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) {
        alert("City not found, try again!");
        return;
      }
      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);
      map.setView([lat, lng], 15);
      loadCafes(lat, lng);
    });
}

function locateMe() {
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    map.setView([lat, lng], 15);
    loadCafes(lat, lng);
  });
}

function toggleTheme() {
  document.body.classList.toggle("light");
  const btn = document.getElementById("theme-btn");
  btn.textContent = document.body.classList.contains("light")
    ? "🌙 Dark Mode"
    : "☀️ Light Mode";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("search-input")
    .addEventListener("keypress", function(e) {
      if (e.key === "Enter") searchCity();
    });
});