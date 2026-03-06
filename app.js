navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  const map = L.map("map").setView([lat, lng], 15);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  // Mark user location
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup("📍 You are here")
    .openPopup();

  // Fetch nearby cafes using Overpass API (free, no key needed)
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
});