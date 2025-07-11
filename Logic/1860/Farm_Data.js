document.addEventListener('DOMContentLoaded', function () {
    const map = L.map('map').setView([37.8, -96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let geojsonLayer;
    let currentCategory = null;
    let currentAttribute = null;
    let showFullCategoryDetails = false;
    let initialBounds;

    const attributeConfigs = {
        'farmProduction': {
            label: 'Farm Production',
            attributes: {
                'AGY001': { label: 'Wheat (bushels)', grades: [0, 100000, 500000, 1000000, 2500000, 5000000, 10000000], colors: ['#edf8e9', '#c7e9c0', '#a1d99b', '#74c476', '#41ab5d', '#238b45', '#005a32'] },
                'AGY005': { label: 'Rice (pounds)', grades: [0, 100000, 500000, 1000000, 5000000, 10000000, 25000000], colors: ['#F7FBFF', '#DEEBF7', '#C6DBEF', '#9ECAE1', '#6BAED6', '#4292C6', '#2171B5', '#084594'] },
                'AGY014': { label: 'Wine (gallons)', grades: [0, 1000, 5000, 10000, 25000, 50000, 100000], colors: ['#f7f4f9', '#e7e1ef', '#d4b9da', '#c994c7', '#df65b0', '#e7298a', '#ce1256', '#91003f'] }
            }
        },
        'farmAcreage': {
            label: 'Farm Acreage',
            attributes: {
                'AGR001': { label: '3 to 9 acres', grades: [0, 500, 1000, 2500, 5000, 10000, 20000], colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'] },
                'AGR002': { label: '10 to 19 acres', grades: [0, 1000, 2500, 5000, 10000, 20000, 30000], colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'] },
                'AGR003': { label: '20 to 49 acres', grades: [0, 2500, 5000, 10000, 20000, 30000, 40000], colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'] },
                'AGR004': { label: '50 to 99 acres', grades: [0, 2500, 5000, 10000, 15000, 20000, 25000], colors: ['#fff7ec', '#fee8c8', '#fdd49e', '#fdbb84', '#fc8d59', '#ef6548', '#d7301f', '#990000'] }
            }
        },
        'landValue': {
            label: 'Avg. Land Value',
            attributes: {
                'AE7001': { label: 'Value ($/acre)', grades: [0, 5, 10, 15, 20, 30, 40], colors: ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'] }
            }
        }
    };

    function getColor(value, grades, colors) {
        if (value === null || isNaN(value)) return '#CCCCCC';
        for (let i = grades.length - 1; i >= 0; i--) {
            if (value > grades[i]) return colors[i + 1] || colors[colors.length - 1];
        }
        return colors[0];
    }

    function style(feature) {
        if (!currentCategory || !currentAttribute) {
            return { color: "#007bff", weight: 2, opacity: 1, fillOpacity: 0.2, fillColor: "#007bff" };
        }
        const config = attributeConfigs[currentCategory].attributes[currentAttribute];
        const value = feature.properties[currentAttribute];
        return {
            fillColor: getColor(value, config.grades, config.colors),
            weight: 2, opacity: 1, color: 'white', dashArray: '3', fillOpacity: 0.7
        };
    }

    function highlightFeature(e) {
        const layer = e.target;
        if (currentAttribute) layer.setStyle({ weight: 4, color: '#333', dashArray: '' });
        layer.bringToFront();
    }

    function resetHighlight(e) { geojsonLayer.resetStyle(e.target); }
    function onFeatureClick(e) { map.fitBounds(e.target.getBounds()); info.update(e.target.feature.properties); }

    const info = L.control({ position: 'topright' });
    info.onAdd = function() { this._div = L.DomUtil.create('div', 'info-panel'); this.update(); return this._div; };
    info.update = function(props) {
        let content = '<h4>1860 Black Belt Farm Data</h4>';
        const locationName = props ? props.STATENAM : 'Click a state for details';
        if (!currentAttribute) content += `<b>${locationName}</b>`;
        else if (props) {
            const config = attributeConfigs[currentCategory].attributes[currentAttribute];
            const value = props[currentAttribute] ? props[currentAttribute].toLocaleString() : 'N/A';
            content += `<b>${locationName}</b><br/>${config.label}: ${value}`;
        } else content += 'Click a state for details';
        this._div.innerHTML = content;
    };
    info.addTo(map);

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function() { this._div = L.DomUtil.create('div', 'info-panel legend'); return this._div; };
    legend.update = function() {
        if (!currentCategory || !currentAttribute) { this._div.innerHTML = ''; return; }
        const config = attributeConfigs[currentCategory].attributes[currentAttribute];
        const grades = config.grades;
        const colors = config.colors;
        let content = `<div class="legend-title">${config.label}</div>`;
        for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1];
            content += `<div class="legend-item"><i style="background:${colors[i + 1]}"></i><span>${from.toLocaleString()}${to ? '&ndash;' + to.toLocaleString() : '+'}</span></div>`;
        }
        this._div.innerHTML = content;
    };
    legend.addTo(map);

    const uiControls = L.control({ position: 'topright' });
    uiControls.onAdd = function() {
        const container = L.DomUtil.create('div', 'info-panel');
        container.id = 'ui-main-container';
        Object.keys(attributeConfigs).forEach(key => {
            const categoryConf = attributeConfigs[key];
            const categoryContainer = L.DomUtil.create('div', 'category-container', container);
            const button = L.DomUtil.create('button', '', categoryContainer);
            button.innerHTML = categoryConf.label;
            button.dataset.key = key;

            const selectorContainer = L.DomUtil.create('div', 'attribute-selector-container', categoryContainer);
            
            Object.keys(categoryConf.attributes).forEach(attrKey => {
                const attrLink = L.DomUtil.create('a', '', selectorContainer);
                attrLink.href = '#';
                attrLink.innerHTML = categoryConf.attributes[attrKey].label;
                attrLink.dataset.category = key;
                attrLink.dataset.attribute = attrKey;

                L.DomEvent.on(attrLink, 'click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    currentCategory = this.dataset.category;
                    currentAttribute = this.dataset.attribute;
                    
                    document.querySelectorAll('.attribute-selector-container').forEach(sel => sel.style.display = 'none');
                    
                    geojsonLayer.setStyle(style);
                    legend.update();
                    info.update();
                });
            });

            L.DomEvent.on(button, 'click', (e) => {
                e.stopPropagation();
                const wasActive = button.classList.contains('active');
                
                document.querySelectorAll('.category-container button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.attribute-selector-container').forEach(sel => sel.style.display = 'none');
                
                if (!wasActive) {
                    button.classList.add('active');
                    if (!showFullCategoryDetails) {
                        selectorContainer.style.display = 'block';
                    }
                    currentCategory = key;
                    currentAttribute = null;
                    geojsonLayer.setStyle(style);
                    legend.update();
                } else {
                    currentCategory = null;
                    currentAttribute = null;
                    geojsonLayer.setStyle(style);
                    legend.update();
                }
            });
        });
        
        const detailsToggleContainer = L.DomUtil.create('div', 'details-toggle-container', container);
        detailsToggleContainer.innerHTML = `<label><input type="checkbox" id="details-toggle"> Show Full Category Details</label>`;
        
        L.DomEvent.on(detailsToggleContainer, 'mousedown dblclick click', L.DomEvent.stopPropagation);
        
        L.DomEvent.on(detailsToggleContainer.querySelector('#details-toggle'), 'change', function(e) {
            showFullCategoryDetails = e.target.checked;
            document.querySelectorAll('.attribute-selector-container').forEach(sel => sel.style.display = 'none');
            map.eachLayer(layer => { if (layer.isPopupOpen()) { layer.getPopup().update(); } });
        });

        return container;
    };
    uiControls.addTo(map);

    map.on('click', function() {
        document.querySelectorAll('.category-container button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.attribute-selector-container').forEach(sel => sel.style.display = 'none');
    });

    fetch('/Geojson_Data/1860/Farm-Data.geojson')
        .then(res => {
            if (!res.ok) throw new Error(`Network response was not ok: ${res.statusText}`);
            return res.json();
        })
        .then(data => {
            geojsonLayer = L.geoJSON(data, {
                filter: feature => ["Alabama", "Arkansas", "Florida", "Georgia", "Louisiana", "Mississippi", "North Carolina", "South Carolina", "Tennessee", "Texas", "Virginia"].includes(feature.properties.STATENAM),
                style: style,
                onEachFeature: (feature, layer) => {
                    layer.on({ mouseover: highlightFeature, mouseout: resetHighlight, click: onFeatureClick });
                    layer.bindPopup(() => {
                        const props = feature.properties;
                        const safe = val => val != null ? val.toLocaleString() : "N/A";
                        let content = `<div class="popup-header">${props.STATENAM || 'Unknown State'}</div>`;
                        
                        if (currentAttribute) {
                            const attrConf = attributeConfigs[currentCategory].attributes[currentAttribute];
                            content += `<div class="popup-row"><span class="popup-row-label">${attrConf.label}:</span><span class="popup-row-value">${safe(props[currentAttribute])}</span></div>`;
                        } else if (currentCategory && showFullCategoryDetails) {
                            content += `<hr class="popup-hr"><div class="popup-category-title">${attributeConfigs[currentCategory].label}</div>`;
                            Object.keys(attributeConfigs[currentCategory].attributes).forEach(attrKey => {
                                const attrConf = attributeConfigs[currentCategory].attributes[attrKey];
                                content += `<div class="popup-row"><span class="popup-row-label">${attrConf.label}:</span><span class="popup-row-value">${safe(props[attrKey])}</span></div>`;
                            });
                        }
                        return content;
                    });
                }
            }).addTo(map);
            
            initialBounds = geojsonLayer.getBounds();
            map.fitBounds(initialBounds, { padding: [20, 20] });

            map.on('popupclose', function(e) {
                map.fitBounds(initialBounds);
            });
        })
        .catch(error => {
            console.error('Error loading or processing GeoJSON:', error);
            document.getElementById('map').innerHTML = `<div style="text-align:center; padding:20px; color:red;">
            <h2>Could not load map data.</h2><p>Please check the file path and ensure 'Farm-Data.geojson' is accessible.</p></div>`;
        });
});
