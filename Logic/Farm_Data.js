// Initialize the map
    const map = L.map('map').setView([37.8, -96], 4); // Center on USA

    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Load GeoJSON data
    fetch('/Geojson_Data/Farm-Data.geojson')
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
          //const safe = (val) => (val === null || val === "N/A" ? "N/A" : val);

          const safe = (val) => {
            if (val === null || val === "N/A" || val === undefined) return "N/A";
            const num = Number(val);
            return isNaN(num) ? val : num.toLocaleString();  // formats numbers with commas
          };


          const content = `
            <strong>State:</strong> ${safe(props.STATENAM)}<br><br>

            <div style="display: flex; flex-direction: column; gap: 4px;">
            <div><strong>Farm Production:</strong></div>
            <div>Wheat: ${safe(props["AGY001"])} bushels</div>
            <div>Rice : ${safe(props["AGY005"])} pounds</div>
            <div>Wine: ${safe(props["AGY014"])} gallons</div><br>
            
            <div><strong>Price of Farm Products:</strong></div>
            <div>Wheat: ${safe(props["AG0001"])} bushels</div>
            <div>Rice: ${safe(props["AG0005"])} pounds</div>
            <div>Wine: ${safe(props["AG0014"])} gallons</div><br>

            <div><strong>Farm Acreage:</strong></div>
            <div>3 to 9 acres: ${safe(props["AGR001"])}</div>
            <div>10 to 19 acres: ${safe(props["AGR002"])}</div>
            <div>20 to 49 acres: ${safe(props["AGR003"])}</div>
            <div>50 to 99 acres: ${safe(props["AGR004"])}</div>
            </div><br>

            <strong>Average value of farmland and buildings per acre:</strong> ${safe(props["AE7001"])}
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

