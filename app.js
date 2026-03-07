let map;

function loadCafes(lat, lng) {
  const query = `
    [out:json];
    node["amenity"="cafe"](around:1500,${lat},${lng});
    out body;
  `;

  fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query
  })
    .then(res => res.json())
    .then(data => {
      data.elements.forEach(cafe => {
        L.marker([cafe.lat, cafe.lon])
          .addTo(map)
          .bindPopup(`☕ ${cafe.tags.name || "Café"}`);
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