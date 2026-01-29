/**
 * AeroCompare 2026 - Main Application Logic
 * Interface: Kali Linux XFCE Aesthetic
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Registry & Sort Alphabetically
    const registry = (window.planesRegistry || []).sort((a, b) => a.model.localeCompare(b.model));

    const p1Sel = document.getElementById('plane1');
    const p2Sel = document.getElementById('plane2');

    // 2. Populate Dropdowns with XFCE Style Placeholder
    const placeholder = '<option value="" disabled selected>Choose a plane...</option>';
    p1Sel.innerHTML = placeholder;
    p2Sel.innerHTML = placeholder;

    registry.forEach(plane => {
        const opt = `<option value="${plane.model}">${plane.model}</option>`;
        p1Sel.innerHTML += opt;
        p2Sel.innerHTML += opt;
    });

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
    const val1 = document.getElementById('plane1').value;
    const val2 = document.getElementById('plane2').value;
    const dist = parseFloat(document.getElementById('distance').value) || 0;

    if (!val1 || !val2) {
        alert("System Error: Please select two aircraft for comparison.");
        return;
    }

    const p1 = window.planesRegistry.find(p => p.model === val1);
    const p2 = window.planesRegistry.find(p => p.model === val2);

    const isDistanceApplied = dist > 0;
    const formatN_A = (value) => isDistanceApplied ? value : 'N/A';

    // --- FLIGHT PHYSICS ---
    const time1Dec = isDistanceApplied ? (dist / p1.cruiseSpeed) + 0.58 : null;
    const time2Dec = isDistanceApplied ? (dist / p2.cruiseSpeed) + 0.58 : null;

    const fuelUsed1 = isDistanceApplied ? (p1.burnRateKgHr / p1.fuelDensity) * time1Dec : null;
    const fuelUsed2 = isDistanceApplied ? (p2.burnRateKgHr / p2.fuelDensity) * time2Dec : null;

    const fuelPerPerson1 = isDistanceApplied ? (fuelUsed1 / p1.maxSeatingEcon).toFixed(2) : 'N/A';
    const fuelPerPerson2 = isDistanceApplied ? (fuelUsed2 / p2.maxSeatingEcon).toFixed(2) : 'N/A';

    // --- BUILD COMPARISON TABLE ---
    const html = `
    <table>
        <thead>
            <tr>
                <th class="plane-header">${p1.model}</th>
                <th class="vs-cell">VERSUS</th>
                <th class="plane-header">${p2.model}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Top: ${p1.topSpeed} / Cruise: ${p1.cruiseSpeed}</td>
                <td class="category-col">Speeds (km/h)</td>
                <td>Top: ${p2.topSpeed} / Cruise: ${p2.cruiseSpeed}</td>
            </tr>

            <!-- NEW ENGINE DISPLAY (Option C multi-line) -->
            <tr>
                <td>${formatEngines(p1.engineOptions)}</td>
                <td class="category-col">Engine(s)</td>
                <td>${formatEngines(p2.engineOptions)}</td>
            </tr>

            <tr>
                <td>${formatN_A(fuelUsed1?.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' L')}</td>
                <td class="category-col">Total Fuel for Trip</td>
                <td>${formatN_A(fuelUsed2?.toLocaleString(undefined, {maximumFractionDigits: 0}) + ' L')}</td>
            </tr>

            <tr>
                <td>${fuelPerPerson1} L</td>
                <td class="category-col">Fuel Used Per Person (Whole Trip)</td>
                <td>${fuelPerPerson2} L</td>
            </tr>

            <tr>
                <td>${p1.totalThrustLb.toLocaleString()} lb</td>
                <td class="category-col">Total Thrust</td>
                <td>${p2.totalThrustLb.toLocaleString()} lb</td>
            </tr>

            <tr>
                <td>${p1.powerToLift}</td>
                <td class="category-col">Power-to-Lift Ratio</td>
                <td>${p2.powerToLift}</td>
            </tr>

            <tr>
                <td>${p1.cabinDim}</td>
                <td class="category-col">Cabin Dimensions (L x W)</td>
                <td>${p2.cabinDim}</td>
            </tr>

            <tr>
                <td>${p1.fourClassCap}</td>
                <td class="category-col">4-Class Capacity</td>
                <td>${p2.fourClassCap}</td>
            </tr>

            <tr>
                <td>${p1.dragCoefficient}</td>
                <td class="category-col">Drag Coefficient</td>
                <td>${p2.dragCoefficient}</td>
            </tr>

            <tr>
                <td>${p1.materials}</td>
                <td class="category-col">Primary Materials</td>
                <td>${p2.materials}</td>
            </tr>

            <tr>
                <td>${formatN_A(formatRouteTime(time1Dec))}</td>
                <td class="category-col">Total Completion Time</td>
                <td>${formatN_A(formatRouteTime(time2Dec))}</td>
            </tr>

            <tr>
                <td>${p1.knownFor}</td>
                <td class="category-col">Known For</td>
                <td>${p2.knownFor}</td>
            </tr>

            <tr>
                <td>"${p1.pilotQuote}"</td>
                <td class="category-col">Pilot Insight</td>
                <td>"${p2.pilotQuote}"</td>
            </tr>

            <tr>
                <td>${p1.pilotExperience}/10</td>
                <td class="category-col">Pilot Experience Rating</td>
                <td>${p2.pilotExperience}/10</td>
            </tr>
        </tbody>
    </table>`;

    document.getElementById('comparison-table-container').innerHTML = html;

    // Render the noise table for only the selected planes
    renderNoiseTable([p1, p2]);

    // Reveal hidden containers
    document.getElementById('comparison-table-container').style.display = 'block';
    document.getElementById('noise-table-container').style.display = 'block';
}

function renderNoiseTable(planesToDisplay) {
    let noiseHtml = `
    <h3 style="text-align:center; color:var(--kali-blue); margin-top:50px; font-size:14px;">
        SYSTEM AUDIO PROFILE: ENGINE NOISE REGISTRY
    </h3>
    <table>
        <thead>
            <tr>
                <th>Aircraft Model</th>
                <th>Startup Volume (Inside)</th>
                <th>Cruise Volume (Inside)</th>
            </tr>
        </thead>
        <tbody>`;

    planesToDisplay.forEach(p => {
        noiseHtml += `
            <tr>
                <td>${p.model}</td>
                <td>${p.startupNoise} dB</td>
                <td>${p.cruiseNoise} dB</td>
            </tr>`;
    });

    noiseHtml += `</tbody></table>`;
    document.getElementById('noise-table-container').innerHTML = noiseHtml;
}

function formatRouteTime(decimalHours) {
    if (decimalHours === null) return 'N/A';

    const hrs = Math.floor(decimalHours);
    const mins = Math.round((decimalHours - hrs) * 60);
    return `${hrs} hours ${mins} minutes`;
}