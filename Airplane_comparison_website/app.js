/**
 * AeroCompare 2026 - Main Application Logic
 * Interface: Kali Linux XFCE Aesthetic
 */

document.addEventListener('DOMContentLoaded', function () {
    // 1. Initialize Registry & Sort Alphabetically
    var registry = (window.planesRegistry || []);
    registry.sort(function (a, b) {
        return a.model.localeCompare(b.model);
    });

    var p1Sel = document.getElementById('plane1');
    var p2Sel = document.getElementById('plane2');

    // 2. Populate Dropdowns with XFCE Style Placeholder
    var placeholder = '<option value="" disabled="disabled" selected="selected">Choose a plane...</option>';
    p1Sel.innerHTML = placeholder;
    p2Sel.innerHTML = placeholder;

    for (var i = 0; i < registry.length; i++) {
        var plane = registry[i];
        var opt = '<option value="' + plane.model + '">' + plane.model + '</option>';
        p1Sel.innerHTML = p1Sel.innerHTML + opt;
        p2Sel.innerHTML = p2Sel.innerHTML + opt;
    }

    // 3. Noise table stays hidden until comparison is triggered
});

/* ============================
   ENGINE FORMATTER (Option C)
   ============================ */
function formatEngines(engineArray) {
    if (!engineArray || engineArray.length === 0) return "N/A";
    return engineArray.join('<br>');
}

function comparePlanes() {

    var val1 = document.getElementById('plane1').value;
    var val2 = document.getElementById('plane2').value;
    var dist = parseFloat(document.getElementById('distance').value) || 0;

    if (!val1 || !val2) {
        alert("System Error: Please select two aircraft for comparison.");
        return;
    }

    // Manual .find()
    var p1 = null;
    var p2 = null;

    for (var i = 0; i < window.planesRegistry.length; i++) {
        var p = window.planesRegistry[i];
        if (p.model === val1) p1 = p;
        if (p.model === val2) p2 = p;
    }

    var isDistanceApplied = dist > 0;
    function formatNA(value) {
        return isDistanceApplied ? value : "N/A";
    }

    // --- FLIGHT PHYSICS ---
    var time1Dec = isDistanceApplied ? (dist / p1.cruiseSpeed) + 0.58 : null;
    var time2Dec = isDistanceApplied ? (dist / p2.cruiseSpeed) + 0.58 : null;

    var fuelUsed1 = isDistanceApplied ? (p1.burnRateKgHr / p1.fuelDensity) * time1Dec : null;
    var fuelUsed2 = isDistanceApplied ? (p2.burnRateKgHr / p2.fuelDensity) * time2Dec : null;

    var fuelPerPerson1 = isDistanceApplied ? (fuelUsed1 / p1.maxSeatingEcon).toFixed(2) : "N/A";
    var fuelPerPerson2 = isDistanceApplied ? (fuelUsed2 / p2.maxSeatingEcon).toFixed(2) : "N/A";

    // --- BUILD COMPARISON TABLE ---
    var html = '';
    html += '<table><thead><tr>';
    html += '<th class="plane-header">' + p1.model + '</th>';
    html += '<th class="vs-cell">VERSUS</th>';
    html += '<th class="plane-header">' + p2.model + '</th>';
    html += '</tr></thead><tbody>';

    html += '<tr><td>Top: ' + p1.topSpeed + ' / Cruise: ' + p1.cruiseSpeed + '</td>';
    html += '<td class="category-col">Speeds (km/h)</td>';
    html += '<td>Top: ' + p2.topSpeed + ' / Cruise: ' + p2.cruiseSpeed + '</td></tr>';

    // ENGINE
    html += '<tr><td>' + formatEngines(p1.engineOptions) + '</td>';
    html += '<td class="category-col">Engine(s)</td>';
    html += '<td>' + formatEngines(p2.engineOptions) + '</td></tr>';

    // Total fuel
    html += '<tr><td>' +
        formatNA(fuelUsed1 ? Math.round(fuelUsed1).toString() + ' L' : "N/A") +
        '</td><td class="category-col">Total Fuel for Trip</td><td>' +
        formatNA(fuelUsed2 ? Math.round(fuelUsed2).toString() + ' L' : "N/A") +
        '</td></tr>';

    // Fuel per person
    html += '<tr><td>' + fuelPerPerson1 + ' L</td>';
    html += '<td class="category-col">Fuel Used Per Person (Whole Trip)</td>';
    html += '<td>' + fuelPerPerson2 + ' L</td></tr>';

    // Thrust
    html += '<tr><td>' + p1.totalThrustLb + ' lb</td>';
    html += '<td class="category-col">Total Thrust</td>';
    html += '<td>' + p2.totalThrustLb + ' lb</td></tr>';

    // Power-to-lift
    html += '<tr><td>' + p1.powerToLift + '</td>';
    html += '<td class="category-col">Power-to-Lift Ratio</td>';
    html += '<td>' + p2.powerToLift + '</td></tr>';

    // Cabin dimensions
    html += '<tr><td>' + p1.cabinDim + '</td>';
    html += '<td class="category-col">Cabin Dimensions (L x W)</td>';
    html += '<td>' + p2.cabinDim + '</td></tr>';

    // 4-class capacity
    html += '<tr><td>' + p1.fourClassCap + '</td>';
    html += '<td class="category-col">4-Class Capacity</td>';
    html += '<td>' + p2.fourClassCap + '</td></tr>';

    // Drag
    html += '<tr><td>' + p1.dragCoefficient + '</td>';
    html += '<td class="category-col">Drag Coefficient</td>';
    html += '<td>' + p2.dragCoefficient + '</td></tr>';

    // Materials
    html += '<tr><td>' + p1.materials + '</td>';
    html += '<td class="category-col">Primary Materials</td>';
    html += '<td>' + p2.materials + '</td></tr>';

    // Time to complete route
    html += '<tr><td>' + formatNA(formatRouteTime(time1Dec)) + '</td>';
    html += '<td class="category-col">Total Completion Time</td>';
    html += '<td>' + formatNA(formatRouteTime(time2Dec)) + '</td></tr>';

    // Known For
    html += '<tr><td>' + p1.knownFor + '</td>';
    html += '<td class="category-col">Known For</td>';
    html += '<td>' + p2.knownFor + '</td></tr>';

    // Pilot Quote
    html += '<tr><td>"' + p1.pilotQuote + '"</td>';
    html += '<td class="category-col">Pilot Insight</td>';
    html += '<td>"' + p2.pilotQuote + '"</td></tr>';

    // Pilot Experience
    html += '<tr><td>' + p1.pilotExperience + '/10</td>';
    html += '<td class="category-col">Pilot Experience Rating</td>';
    html += '<td>' + p2.pilotExperience + '/10</td></tr>';

    html += '</tbody></table>';

    document.getElementById('comparison-table-container').innerHTML = html;

    // Noise table for selected planes
    renderNoiseTable([p1, p2]);

    // Reveal hidden containers
    document.getElementById('comparison-table-container').style.display = 'block';
    document.getElementById('noise-table-container').style.display = 'block';
}

function renderNoiseTable(planesToDisplay) {
    var noiseHtml = '';
    noiseHtml += '<h3 style="text-align:center; margin-top:50px; font-size:14px;">';
    noiseHtml += 'SYSTEM AUDIO PROFILE: ENGINE NOISE REGISTRY</h3>';
    noiseHtml += '<table><thead><tr>';
    noiseHtml += '<th>Aircraft Model</th><th>Startup Volume (Inside)</th><th>Cruise Volume (Inside)</th>';
    noiseHtml += '</tr></thead><tbody>';

    for (var i = 0; i < planesToDisplay.length; i++) {
        var p = planesToDisplay[i];
        noiseHtml += '<tr><td>' + p.model + '</td>';
        noiseHtml += '<td>' + p.startupNoise + ' dB</td>';
        noiseHtml += '<td>' + p.cruiseNoise + ' dB</td></tr>';
    }

    noiseHtml += '</tbody></table>';
    document.getElementById('noise-table-container').innerHTML = noiseHtml;
}

function formatRouteTime(hours) {
    if (hours === null) return "N/A";
    var hrs = Math.floor(hours);
    var mins = Math.round((hours - hrs) * 60);
    return hrs + " hours " + mins + " minutes";
}
