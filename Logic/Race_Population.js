// Initialize the map
    const map = L.map('map').setView([37.8, -96], 4); // Center on USA

    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Load GeoJSON data
    fetch('/Geojson_Data/Race_Population.geojson')
      .then(res => res.json())
      .then(data => {
        const geoLayer = L.geoJSON(data, {
          filter: function(feature) {
            // Optional: If using full US GeoJSON, keep only these states:
            const keep = ["Alabama","Arkansas","Florida","Georgia","Louisiana","Mississippi","North Carolina","South Carolina","Tennessee","Texas","Virginia"];
            return keep.includes(feature.properties.STATENAM);
          },
          // onEachFeature: function(feature, layer) {
          //   const state = feature.properties.STATENAM || "Unknown";
          //   const population = feature.properties["Total-Population_1860_state_AG3001"] || "N/A";
          //   const content = `<strong>State:</strong> ${state}<br><strong>Total Population:</strong> ${population}`;
          //   layer.bindPopup(content);
          
          // },
          onEachFeature: function(feature, layer) {
          const props = feature.properties;

          // Helper to show value or "N/A"
          const safe = (val) => {
            if (val === null || val === "N/A" || val === undefined) return "N/A";
            const num = Number(val);
            return isNaN(num) ? val : num.toLocaleString();  // formats numbers with commas
          };



          const content = `
          <strong>State:</strong> ${safe(props.STATENAM)}<br><br>

          <strong>Total Population:</strong> ${safe(props["Total Population"])}<br><br>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div><strong>White:</strong> ${safe(props["White"])}</div>
            <div><strong>Black:</strong> ${safe(props["Black"])}</div>
            <div><strong>Black (Free):</strong> ${safe(props["Black (Free)"])}</div>
            <div><strong>Black (Slave):</strong> ${safe(props["Black (Slave)"])}</div><br>
            <div><strong>Native (American Indian, Eskimo, Aleut):</strong> ${safe(props["American Indian, Eskimo, and Aleut"])}</div>
            <div><strong>Asian & Pacific Islander:</strong> ${safe(props["Asian and Pacific Islander"])}</div>
            <div><strong>Other Race:</strong> ${safe(props["Other Race"])}</div>
            <div><strong>Hispanic Origin (any race):</strong> ${safe(props["Hispanic Origin (any race)"])}</div>
            <div><strong>White (not of Hispanic origin):</strong> ${safe(props["White (not of Hispanic origin)"])}</div>
          </div>
          `;



          layer.bindPopup(content);
        },



          style: {
            color: "blue",
            weight: 2,
            fillOpacity: 0.4
          }
        }).addTo(map);

        // This line zooms & centers the map to include only those states:
        map.fitBounds(geoLayer.getBounds(), { padding: [20, 20] });
      });
