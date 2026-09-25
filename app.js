// ISO Standard Shaft Diameters (Table 9.1 ISO/R 775-1969)
const ISO_STANDARD_DIAMETERS = [
    6, 7, 8, 9, 10, 12, 14, 18, 20, 25, 30, 35, 40, 45, 50, 
    55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 
    150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380
];

// Material Presets
const MATERIAL_PRESETS = {
    SS400: { sy: 250, sut: 400, e_gpa: 205 },
    AISI1020: { sy: 290, sut: 380, e_gpa: 205 },
    AISI1045: { sy: 310, sut: 570, e_gpa: 205 },
    AISI4140: { sy: 415, sut: 655, e_gpa: 205 },
    POM: { sy: 68, sut: 70, e_gpa: 3.0 }
};

// Stress Concentration Presets
const SC_PRESETS = {
    KEYWAY_PROFILE: { kt: 2.1, kts: 1.8 },
    SHOULDER_FILLET: { kt: 1.7, kts: 1.5 },
    SMOOTH: { kt: 1.0, kts: 1.0 },
    SHARP_NOTCH: { kt: 2.5, kts: 2.0 }
};

// ASME Load & Shock Factors Presets (Cm, Ct)
const ASME_LOAD_PRESETS = {
    steady: { cm: 1.5, ct: 1.0 },
    light_shock: { cm: 1.75, ct: 1.25 },
    heavy_shock: { cm: 2.5, ct: 2.25 },
    stat_steady: { cm: 1.0, ct: 1.0 }
};

// ISO 600 & 6200 Deep Groove Ball Bearing Series Data
const ISO_6200_BEARINGS = [
    { designation: "606",  bore_mm: 6,  outer_mm: 17, width_mm: 6,  c_dynamic_n: 2250,  c0_static_n: 840 },
    { designation: "607",  bore_mm: 7,  outer_mm: 19, width_mm: 6,  c_dynamic_n: 2340,  c0_static_n: 880 },
    { designation: "608",  bore_mm: 8,  outer_mm: 22, width_mm: 7,  c_dynamic_n: 3300,  c0_static_n: 1370 },
    { designation: "609",  bore_mm: 9,  outer_mm: 24, width_mm: 7,  c_dynamic_n: 3700,  c0_static_n: 1660 },
    { designation: "6200", bore_mm: 10, outer_mm: 30, width_mm: 9,  c_dynamic_n: 5100,  c0_static_n: 2390 },
    { designation: "6201", bore_mm: 12, outer_mm: 32, width_mm: 10, c_dynamic_n: 6800,  c0_static_n: 3050 },
    { designation: "6202", bore_mm: 15, outer_mm: 35, width_mm: 11, c_dynamic_n: 7800,  c0_static_n: 3750 },
    { designation: "6203", bore_mm: 17, outer_mm: 40, width_mm: 12, c_dynamic_n: 9550,  c0_static_n: 4800 },
    { designation: "6204", bore_mm: 20, outer_mm: 47, width_mm: 14, c_dynamic_n: 12800, c0_static_n: 6650 },
    { designation: "6205", bore_mm: 25, outer_mm: 52, width_mm: 15, c_dynamic_n: 14000, c0_static_n: 7800 },
    { designation: "6206", bore_mm: 30, outer_mm: 62, width_mm: 16, c_dynamic_n: 19500, c0_static_n: 11200 },
    { designation: "6207", bore_mm: 35, outer_mm: 72, width_mm: 17, c_dynamic_n: 25500, c0_static_n: 15300 },
    { designation: "6208", bore_mm: 40, outer_mm: 80, width_mm: 18, c_dynamic_n: 29100, c0_static_n: 17800 },
    { designation: "6209", bore_mm: 45, outer_mm: 85, width_mm: 19, c_dynamic_n: 32500, c0_static_n: 20400 },
    { designation: "6210", bore_mm: 50, outer_mm: 90, width_mm: 20, c_dynamic_n: 35000, c0_static_n: 23200 },
    { designation: "6211", bore_mm: 55, outer_mm: 100, width_mm: 21, c_dynamic_n: 43600, c0_static_n: 29000 },
    { designation: "6212", bore_mm: 60, outer_mm: 110, width_mm: 22, c_dynamic_n: 52000, c0_static_n: 36000 }
];

// Lewis Form Factor Y Table (20 deg Full Depth)
const LEWIS_Y_TABLE_20_FD = {
    10: 0.201, 11: 0.226, 12: 0.245, 13: 0.264, 14: 0.276, 15: 0.289, 16: 0.295, 17: 0.302,
    18: 0.308, 19: 0.314, 20: 0.320, 25: 0.340, 30: 0.358, 35: 0.373, 40: 0.389, 50: 0.408,
    56: 0.415, 60: 0.421, 100: 0.446, 150: 0.458, 200: 0.463
};

function lookupLewisY(teethCount) {
    const z = Math.round(teethCount);
    if (LEWIS_Y_TABLE_20_FD[z]) return LEWIS_Y_TABLE_20_FD[z];

    const keys = Object.keys(LEWIS_Y_TABLE_20_FD).map(Number).sort((a,b)=>a-b);
    if (z < keys[0]) return LEWIS_Y_TABLE_20_FD[keys[0]];
    if (z > keys[keys.length - 1]) return LEWIS_Y_TABLE_20_FD[keys[keys.length - 1]];

    for (let i = 0; i < keys.length - 1; i++) {
        if (z >= keys[i] && z <= keys[i+1]) {
            const k1 = keys[i], k2 = keys[i+1];
            const y1 = LEWIS_Y_TABLE_20_FD[k1], y2 = LEWIS_Y_TABLE_20_FD[k2];
            return y1 + ((y2 - y1) * (z - k1)) / (k2 - k1);
        }
    }
    return 0.320;
}

// State for Multi-Load V-M Diagram Engine
let vmLoadsList = [
    { w_n: 800, dir: 'downward', x_mm: 50 }
];

// DOM Elements - Shaft Tab
const inputs = {
    powerW: document.getElementById('powerW'),
    rpm: document.getElementById('rpm'),
    bendingMoment: document.getElementById('bendingMoment'),
    shaftLength: document.getElementById('shaftLength'),
    axialForce: document.getElementById('axialForce'),
    forceType: document.getElementById('forceType'),
    endCondition: document.getElementById('endCondition'),
    scPreset: document.getElementById('scPreset'),
    ktValue: document.getElementById('ktValue'),
    ktsValue: document.getElementById('ktsValue'),
    materialPreset: document.getElementById('materialPreset'),
    yieldStrength: document.getElementById('yieldStrength'),
    tensileStrength: document.getElementById('tensileStrength'),
    elasticModulus: document.getElementById('elasticModulus'),
    fos: document.getElementById('fos'),
    hasKeyway: document.getElementById('hasKeyway'),
    loadType: document.getElementById('loadType'),
    cmValue: document.getElementById('cmValue'),
    ctValue: document.getElementById('ctValue'),

    // V-M Diagram & Coordinate System Controls
    vmBeamType: document.getElementById('vmBeamType'),
    vmXa: document.getElementById('vmXa'),
    vmXb: document.getElementById('vmXb'),
    vmOrigin: document.getElementById('vmOrigin'),
    vmYDir: document.getElementById('vmYDir'),
    vmMomentSign: document.getElementById('vmMomentSign'),
    decimalDigits: document.getElementById('decimalDigits')
};

const outputs = {
    resIsoDia: document.getElementById('resIsoDia'),
    resCalcDia: document.getElementById('resCalcDia'),
    resTorque: document.getElementById('resTorque'),
    resTorqueNmm: document.getElementById('resTorqueNmm'),
    resTwistDeg: document.getElementById('resTwistDeg'),
    resTwistPerM: document.getElementById('resTwistPerM'),
    resCriticalSpeed: document.getElementById('resCriticalSpeed'),
    resOperatingCheck: document.getElementById('resOperatingCheck'),
    resTauD: document.getElementById('resTauD'),
    resAlpha: document.getElementById('resAlpha'),
    resYieldFos: document.getElementById('resYieldFos'),
    resGoodmanFos: document.getElementById('resGoodmanFos'),
    verdictBadge: document.getElementById('verdictBadge'),
    adviceBox: document.getElementById('adviceBox'),
    adviceText: document.getElementById('adviceText'),

    // V-M Diagram Outputs
    resVmRa: document.getElementById('resVmRa'),
    resVmRb: document.getElementById('resVmRb'),
    resVmVmax: document.getElementById('resVmVmax'),
    resVmMmaxNm: document.getElementById('resVmMmaxNm'),
    resVmMmaxNmm: document.getElementById('resVmMmaxNmm')
};

// DOM Elements - Bearing Tab
const bearingInputs = {
    shaftDia: document.getElementById('bearingShaftDia'),
    rpm: document.getElementById('bearingRpm'),
    fr: document.getElementById('bearingFr'),
    fa: document.getElementById('bearingFa'),
    type: document.getElementById('bearingType'),
    cRating: document.getElementById('bearingCRating'),
    vFactor: document.getElementById('bearingVFactor')
};

const bearingOutputs = {
    pEq: document.getElementById('resBearingP'),
    l10Mr: document.getElementById('resBearingL10Mr'),
    l10Hours: document.getElementById('resBearingL10Hours'),
    years: document.getElementById('resBearingYears'),
    tbody: document.getElementById('tbodyIsoBearings')
};

// DOM Elements - Gear Tab (Excel Full Model)
const gearInputs = {
    powerW: document.getElementById('gearPowerW'),
    rpm: document.getElementById('gearRpm'),
    gearRatio: document.getElementById('gearRatio'),
    teethZ1: document.getElementById('gearTeethZ1'),
    module: document.getElementById('gearModule'),
    faceRatio: document.getElementById('gearFaceRatio'),
    kf: document.getElementById('gearKf'),
    wearK: document.getElementById('gearWearK'),
    sigmaP: document.getElementById('gearSigmaP'),
    sigmaG: document.getElementById('gearSigmaG'),
    profileQuality: document.getElementById('gearProfileQuality')
};

const gearOutputs = {
    // Pinion outputs
    pinionDp: document.getElementById('resPinionDp'),
    pinionNp: document.getElementById('resPinionNp'),
    pinionSpeedSigma: document.getElementById('resPinionSpeedSigma'),
    pinionYIndex: document.getElementById('resPinionYIndex'),
    pinionFb: document.getElementById('resPinionFb'),
    pinionBendingStatus: document.getElementById('resPinionBendingStatus'),

    // Gear outputs
    gearDg: document.getElementById('resGearDg'),
    gearNg: document.getElementById('resGearNg'),
    gearSpeedSigma: document.getElementById('resGearSpeedSigma'),
    gearYIndex: document.getElementById('resGearYIndex'),
    gearFbVal: document.getElementById('resGearFbVal'),
    gearBendingStatusVal: document.getElementById('resGearBendingStatusVal'),

    // Mesh pair outputs
    weaker: document.getElementById('resGearWeaker'),
    bcVal: document.getElementById('resGearBCVal'),
    vFtVal: document.getElementById('resGearVFtVal'),
    kvFdVal: document.getElementById('resGearKvFdVal'),
    fwVal: document.getElementById('resGearFwVal'),
    wearStatusVal: document.getElementById('resGearWearStatusVal'),

    // Overall
    verdictBadge: document.getElementById('gearVerdictBadge'),
    tbodyTrial: document.getElementById('tbodyModuleMatrix')
};

const btnSyncMoment = document.getElementById('btnSyncMoment');
const btnAddLoadRow = document.getElementById('btnAddLoadRow');
const overhangingPosRow = document.getElementById('overhangingPosRow');
const vmLoadsTbody = document.getElementById('vmLoadsTbody');

const shaftCanvas = document.getElementById('shaftCanvas');
const sfdCanvas = document.getElementById('sfdCanvas');
const bmdCanvas = document.getElementById('bmdCanvas');

const ctxShaft = shaftCanvas.getContext('2d');
const ctxSFD = sfdCanvas.getContext('2d');
const ctxBMD = bmdCanvas.getContext('2d');

let lastCalculatedMmaxNm = 20.0;

// Function to strictly switch tabs (1 Tab = 1 Dedicated Function)
function switchTab(targetTabId, clickedBtn) {
    document.querySelectorAll('.mode-tab-btn, .tab-btn').forEach(b => {
        b.classList.remove('active');
        b.style.backgroundColor = '#f1f5f9';
        b.style.color = '#334155';
    });
    if (clickedBtn) {
        clickedBtn.classList.add('active');
        clickedBtn.style.backgroundColor = '#1e3a8a';
        clickedBtn.style.color = '#ffffff';
    }

    document.querySelectorAll('.tab-panel').forEach(panel => {
        if (panel.id === targetTabId) {
            panel.classList.add('active');
            panel.style.setProperty('display', 'block', 'important');
        } else {
            panel.classList.remove('active');
            panel.style.setProperty('display', 'none', 'important');
        }
    });

    renderKaTeXMath();
    if (targetTabId === 'tabGear') calculateGear();
    if (targetTabId === 'tabBearing') calculateBearing();
    if (targetTabId === 'tabShaft') calculate();
}

document.querySelectorAll('.mode-tab-btn, .tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        switchTab(targetTab, e.currentTarget);
    });
});

// Helper Functions
function getDecimalDigits() {
    const el = document.getElementById('decimalDigits');
    return el ? parseInt(el.value) || 4 : 4;
}

function formatDec(num, digits) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    const dec = digits !== undefined ? digits : getDecimalDigits();
    return Number(num).toFixed(dec);
}

function formatDecComma(num, digits) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    const dec = digits !== undefined ? digits : getDecimalDigits();
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function getIsoStandardDiameter(dCalc) {
    for (let std of ISO_STANDARD_DIAMETERS) {
        if (std >= dCalc) return std;
    }
    return Math.ceil(dCalc);
}

function calculateBucklingAlpha(d, L, isCompressive, endCondition, Sy, E) {
    if (!isCompressive || d <= 0) return 1.0;

    const k_gyration = d / 4.0;
    const slenderness = L / k_gyration;
    const n_map = { SS: 1.00, CC: 2.25, SC: 1.60, CF: 0.25 };
    const n_end = n_map[endCondition] || 1.00;

    if (slenderness <= 115.0) {
        const denom = 1.0 - (0.0044 * slenderness);
        return 1.0 / Math.max(denom, 0.01);
    } else {
        return (Sy * Math.pow(slenderness, 2)) / (Math.pow(Math.PI, 2) * n_end * E);
    }
}

// Multi-Load Dynamic Table Rendering
function renderVmLoadsTable() {
    vmLoadsTbody.innerHTML = '';
    vmLoadsList.forEach((load, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${idx + 1}</td>
            <td>
                <select class="load-dir-select" data-idx="${idx}">
                    <option value="downward" ${load.dir === 'downward' ? 'selected' : ''}>ชี้ลง (↓)</option>
                    <option value="upward" ${load.dir === 'upward' ? 'selected' : ''}>ชี้ขึ้น (↑)</option>
                </select>
            </td>
            <td>
                <div class="unit-wrapper">
                    <input type="number" class="load-w-input" data-idx="${idx}" value="${load.w_n}" step="any">
                    <span class="unit-tag">N</span>
                </div>
            </td>
            <td>
                <div class="unit-wrapper">
                    <input type="number" class="load-x-input" data-idx="${idx}" value="${load.x_mm}" step="any">
                    <span class="unit-tag">mm</span>
                </div>
            </td>
            <td>
                ${vmLoadsList.length > 1 ? `<button class="btn-scientific btn-remove-load" data-idx="${idx}" style="background:#fee2e2; border-color:#fca5a5; color:#dc2626;"><i class="fa-solid fa-trash"></i> ลบ</button>` : `<span class="unit-tag">หลัก</span>`}
            </td>
        `;
        vmLoadsTbody.appendChild(tr);
    });

    document.querySelectorAll('.load-dir-select').forEach(select => {
        select.addEventListener('change', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            vmLoadsList[idx].dir = e.target.value;
            calculate();
        });
    });

    document.querySelectorAll('.load-w-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            vmLoadsList[idx].w_n = Math.abs(parseFloat(e.target.value) || 0);
            calculate();
        });
    });

    document.querySelectorAll('.load-x-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const idx = parseInt(e.target.getAttribute('data-idx'));
            vmLoadsList[idx].x_mm = parseFloat(e.target.value) || 0;
            calculate();
        });
    });

    document.querySelectorAll('.btn-remove-load').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
            vmLoadsList.splice(idx, 1);
            renderVmLoadsTable();
            calculate();
        });
    });
}

btnAddLoadRow.addEventListener('click', () => {
    const L_mm = parseFloat(inputs.shaftLength.value) || 100;
    vmLoadsList.push({ w_n: 200, dir: 'downward', x_mm: Math.round(L_mm / 2) });
    renderVmLoadsTable();
    calculate();
});

inputs.vmBeamType.addEventListener('change', (e) => {
    const val = e.target.value;
    overhangingPosRow.style.display = val === 'overhanging' ? 'grid' : 'none';
    calculate();
});

// Advanced Multi-Load Vector V-M Diagram Engine
function updateVmDiagram(L_mm) {
    const beamType = inputs.vmBeamType.value;
    const originChoice = inputs.vmOrigin ? inputs.vmOrigin.value : 'left';
    const yDirChoice = inputs.vmYDir ? inputs.vmYDir.value : 'upward';
    const momentSignChoice = inputs.vmMomentSign ? inputs.vmMomentSign.value : 'sagging';

    let xa = 0.0;
    let xb = L_mm;

    if (beamType === 'overhanging') {
        xa = parseFloat(inputs.vmXa.value) || 0.0;
        xb = parseFloat(inputs.vmXb.value) || L_mm;
    }

    const signedLoads = vmLoadsList.map(l => ({
        w_n: l.dir === 'upward' ? Math.abs(l.w_n) : -Math.abs(l.w_n),
        x_mm: l.x_mm
    }));

    const total_w = signedLoads.reduce((sum, l) => sum + l.w_n, 0);
    let Ra = 0, Rb = 0, maFixed = 0;

    if (beamType === 'cantilever') {
        Ra = -total_w;
        Rb = 0;
        maFixed = signedLoads.reduce((sum, l) => sum + (l.w_n * (l.x_mm - xa)), 0);
    } else {
        const span = Math.max(xb - xa, 1.0);
        Rb = -signedLoads.reduce((sum, l) => sum + (l.w_n * (l.x_mm - xa)), 0) / span;
        Ra = -total_w - Rb;
    }

    const numPoints = 200;
    const xPoints = [];
    const vPoints = [];
    const mPoints = [];

    for (let i = 0; i <= numPoints; i++) {
        const x = (i * L_mm) / numPoints;
        xPoints.push(x);

        const term_ra = x >= xa ? Ra : 0;
        const term_rb = x >= xb ? Rb : 0;
        const term_w = signedLoads.reduce((sum, l) => sum + (l.x_mm <= x ? l.w_n : 0), 0);
        let v_x = term_ra + term_rb + term_w;
        if (yDirChoice === 'downward') v_x = -v_x;

        const m_fixed_term = x >= xa ? maFixed : 0;
        const m_ra = Ra * Math.max(x - xa, 0);
        const m_rb = Rb * Math.max(x - xb, 0);
        const m_w = signedLoads.reduce((sum, l) => sum + (l.x_mm <= x ? l.w_n * (x - l.x_mm) : 0), 0);
        let m_x = m_fixed_term + m_ra + m_rb + m_w;
        if (momentSignChoice === 'hogging') m_x = -m_x;

        vPoints.push(v_x);
        mPoints.push(m_x);
    }

    const Vmax = Math.max(...vPoints.map(Math.abs), 0);
    const Mmax_nmm = Math.max(...mPoints.map(Math.abs), 0);
    const Mmax_nm = Mmax_nmm / 1000.0;

    lastCalculatedMmaxNm = Mmax_nm;

    const raDisp = yDirChoice === 'downward' ? -Ra : Ra;
    const rbDisp = yDirChoice === 'downward' ? -Rb : Rb;

    outputs.resVmRa.innerText = `${raDisp >= 0 ? '+' : ''}${formatDec(raDisp)} N (${Ra >= 0 ? '↑' : '↓'})`;
    outputs.resVmRb.innerText = beamType === 'cantilever' 
        ? `M_fixed = ${formatDec(maFixed/1000)} N-m` 
        : `${rbDisp >= 0 ? '+' : ''}${formatDec(rbDisp)} N (${Rb >= 0 ? '↑' : '↓'})`;
    outputs.resVmVmax.innerText = `${formatDec(Vmax)} N`;
    outputs.resVmMmaxNm.innerText = `${formatDec(Mmax_nm)} N-m`;
    outputs.resVmMmaxNmm.innerText = `${formatDecComma(Mmax_nmm)} N-mm`;
    btnSyncMoment.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> นำค่า M<sub>max</sub> (${formatDec(Mmax_nm)} N-m) เข้าไปตั้งค่า Bending Moment หลัก (Optional Sync)`;

    drawMultiLoadSFD(L_mm, xPoints, vPoints, Vmax, beamType, xa, xb);
    drawMultiLoadBMD(L_mm, xPoints, mPoints, Mmax_nm, Mmax_nmm, beamType);
}

// Draw SFD & BMD
function drawMultiLoadSFD(L, xPoints, vPoints, Vmax, beamType, xa, xb) {
    const width = sfdCanvas.width;
    const height = sfdCanvas.height;
    ctxSFD.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const startX = 60;
    const endX = width - 60;
    const plotWidth = endX - startX;

    ctxSFD.strokeStyle = '#94a3b8';
    ctxSFD.setLineDash([4, 4]);
    ctxSFD.beginPath();
    ctxSFD.moveTo(startX, centerY);
    ctxSFD.lineTo(endX, centerY);
    ctxSFD.stroke();
    ctxSFD.setLineDash([]);

    if (Vmax <= 0 || !vPoints.length) return;

    const maxH = height / 2 - 25;

    ctxSFD.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctxSFD.strokeStyle = '#0284c7';
    ctxSFD.lineWidth = 2;

    ctxSFD.beginPath();
    ctxSFD.moveTo(startX, centerY);

    for (let i = 0; i < xPoints.length; i++) {
        const px = startX + (xPoints[i] / L) * plotWidth;
        const py = centerY - (vPoints[i] / Vmax) * maxH;
        ctxSFD.lineTo(px, py);
    }

    ctxSFD.lineTo(endX, centerY);
    ctxSFD.closePath();
    ctxSFD.fill();
    ctxSFD.stroke();

    ctxSFD.fillStyle = '#1e3a8a';
    ctxSFD.font = '600 11px Inter, sans-serif';
    ctxSFD.fillText(`V_max = ${Vmax.toFixed(1)} N`, startX + 10, 18);
}

function drawMultiLoadBMD(L, xPoints, mPoints, MmaxNm, MmaxNmm, beamType) {
    const width = bmdCanvas.width;
    const height = bmdCanvas.height;
    ctxBMD.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const startX = 60;
    const endX = width - 60;
    const plotWidth = endX - startX;

    ctxBMD.strokeStyle = '#94a3b8';
    ctxBMD.setLineDash([4, 4]);
    ctxBMD.beginPath();
    ctxBMD.moveTo(startX, centerY);
    ctxBMD.lineTo(endX, centerY);
    ctxBMD.stroke();
    ctxBMD.setLineDash([]);

    if (MmaxNm <= 0 || !mPoints.length) return;

    const maxH = height / 2 - 25;

    ctxBMD.fillStyle = 'rgba(15, 118, 110, 0.15)';
    ctxBMD.strokeStyle = '#0f766e';
    ctxBMD.lineWidth = 2;

    ctxBMD.beginPath();
    ctxBMD.moveTo(startX, centerY);

    let peakPx = startX;
    let peakPy = centerY;

    for (let i = 0; i < xPoints.length; i++) {
        const px = startX + (xPoints[i] / L) * plotWidth;
        const py = centerY - (mPoints[i] / (MmaxNmm || 1)) * maxH;

        if (Math.abs(Math.abs(mPoints[i]) - MmaxNmm) < 1e-3) {
            peakPx = px;
            peakPy = py;
        }

        ctxBMD.lineTo(px, py);
    }

    ctxBMD.lineTo(endX, centerY);
    ctxBMD.closePath();
    ctxBMD.fill();
    ctxBMD.stroke();

    ctxBMD.fillStyle = '#0f766e';
    ctxBMD.font = '700 12px Inter, sans-serif';
    ctxBMD.textAlign = 'center';
    const textY = peakPy > centerY ? peakPy + 16 : peakPy - 8;
    ctxBMD.fillText(`M_max = ${MmaxNm.toFixed(2)} N-m`, peakPx, textY);
}

// Shaft Calculation Engine (Tab 1)
function calculate() {
    const P = parseFloat(inputs.powerW.value) || 0;
    const N = parseFloat(inputs.rpm.value) || 1;
    const M_nm = parseFloat(inputs.bendingMoment.value) || 0;
    const L_mm = parseFloat(inputs.shaftLength.value) || 100;
    const F_axial = Math.abs(parseFloat(inputs.axialForce.value) || 0);
    const isCompressive = inputs.forceType.value === 'compressive';
    const endCondition = inputs.endCondition.value;
    const Kt = parseFloat(inputs.ktValue.value) || 1.0;
    const Kts = parseFloat(inputs.ktsValue.value) || 1.0;
    const Sy = parseFloat(inputs.yieldStrength.value) || 250;
    const Sut = parseFloat(inputs.tensileStrength.value) || 400;
    const E_gpa = parseFloat(inputs.elasticModulus.value) || 205;
    const targetFos = parseFloat(inputs.fos.value) || 2.0;
    const hasKeyway = inputs.hasKeyway.value === 'true';

    const cm = parseFloat(inputs.cmValue.value) || 1.5;
    const ct = parseFloat(inputs.ctValue.value) || 1.0;

    const omega = (2 * Math.PI * N) / 60.0;
    const T_nm = P > 0 ? P / omega : 0;
    const T_nmm = T_nm * 1000.0;
    const M_nmm = M_nm * 1000.0;

    const tau_d = hasKeyway ? 41.0 : 55.0;

    const E = E_gpa * 1000.0;
    let d_curr = 10.0;
    let alpha = 1.0;

    for (let iter = 0; iter < 50; iter++) {
        if (F_axial > 0) {
            alpha = calculateBucklingAlpha(d_curr, L_mm, isCompressive, endCondition, Sy, E);
        } else {
            alpha = 1.0;
        }

        const axial_term = F_axial > 0 ? (alpha * F_axial * d_curr) / 8.0 : 0;
        const bending_total = axial_term + (cm * M_nmm);
        const eqTerm = Math.sqrt(Math.pow(ct * T_nmm, 2) + Math.pow(bending_total, 2));

        const d3 = (16.0 / (Math.PI * tau_d)) * eqTerm;
        const d_next = d3 > 0 ? Math.pow(d3, 1.0 / 3.0) : 10;

        if (Math.abs(d_next - d_curr) < 1e-4) {
            d_curr = d_next;
            break;
        }
        d_curr = d_next;
    }

    const d_calc = d_curr;
    const d_iso = getIsoStandardDiameter(d_calc);

    const G = 79000.0;
    const theta_deg = d_iso > 0 ? (584.0 * T_nmm * L_mm) / (G * Math.pow(d_iso, 4)) : 0;
    const theta_per_m = theta_deg * (1000.0 / L_mm);

    const I = (Math.PI * Math.pow(d_iso, 4)) / 64.0;
    const W_dummy = 10.0;
    const y_deflect = (W_dummy * Math.pow(L_mm, 3)) / (48.0 * E * I);
    const nc_rpm = y_deflect > 0 ? 945.0 * Math.sqrt(1.0 / y_deflect) : 99999;

    const se_prime = Sut <= 1400 ? 0.5 * Sut : 700.0;
    const ka = 4.51 * Math.pow(Sut, -0.265);
    const kb = d_iso <= 51 ? 1.24 * Math.pow(d_iso, -0.107) : 1.51 * Math.pow(d_iso, -0.157);
    const se = ka * kb * se_prime;

    const q = 0.8;
    const kf = 1.0 + q * (Kt - 1.0);
    const sigma_a_prime = kf * (32.0 * M_nmm) / (Math.PI * Math.pow(d_iso, 3));
    const tau_m = (16.0 * T_nmm) / (Math.PI * Math.pow(d_iso, 3));
    const sigma_m_prime = Math.sqrt(3.0) * tau_m;

    const inv_goodman = (sigma_a_prime / se) + (sigma_m_prime / Sut);
    const n_goodman = inv_goodman > 0 ? 1.0 / inv_goodman : 99.0;
    const sigma_max_vm = Math.sqrt(Math.pow(sigma_a_prime, 2) + Math.pow(sigma_m_prime, 2));
    const n_yield = sigma_max_vm > 0 ? Sy / sigma_max_vm : 99.0;

    outputs.resIsoDia.innerText = `${d_iso} mm`;
    outputs.resCalcDia.innerText = `${formatDec(d_calc)} mm`;
    outputs.resTorque.innerText = `${formatDec(T_nm)} N-m`;
    outputs.resTorqueNmm.innerText = `${formatDecComma(T_nmm)} N-mm`;
    outputs.resTwistDeg.innerText = `${formatDec(theta_deg)}°`;
    outputs.resTwistPerM.innerText = `${formatDec(theta_per_m)} deg/m`;
    outputs.resCriticalSpeed.innerText = `${formatDecComma(nc_rpm)} RPM`;

    const isSafeOperating = N < 0.75 * nc_rpm || N > 1.25 * nc_rpm;
    outputs.resOperatingCheck.innerText = `N = ${formatDec(N)} RPM (${isSafeOperating ? 'Safe Range' : '⚠️ Resonance Warning'})`;

    outputs.resTauD.innerText = `${formatDec(tau_d)} MPa`;
    outputs.resAlpha.innerText = formatDec(alpha);
    outputs.resYieldFos.innerText = formatDec(n_yield);
    outputs.resGoodmanFos.innerText = formatDec(n_goodman);

    if (n_goodman >= targetFos && n_yield >= targetFos && isSafeOperating) {
        outputs.verdictBadge.className = 'verdict-tag verdict-pass';
        outputs.verdictBadge.innerHTML = '<i class="fa-solid fa-check"></i> DESIGN SAFE';
        outputs.adviceBox.style.background = '#f0fdf4';
        outputs.adviceBox.style.borderColor = '#bbf7d0';
        outputs.adviceBox.style.color = '#15803d';
        outputs.adviceText.innerText = `เพลาขนาด ${d_iso} mm ผ่านเกณฑ์วิศวกรรมทั้ง Static Yield (FOS=${n_yield.toFixed(2)}) และ Fatigue Goodman (FOS=${n_goodman.toFixed(2)})`;
    } else {
        outputs.verdictBadge.className = 'verdict-tag verdict-warn';
        outputs.verdictBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> RECOMMEND RESIZING';
        outputs.adviceBox.style.background = '#fffbeb';
        outputs.adviceBox.style.borderColor = '#fde68a';
        outputs.adviceBox.style.color = '#b45309';
        let recNext = getIsoStandardDiameter(d_iso + 1);
        outputs.adviceText.innerText = `เพลาขนาด ${d_iso} mm มี Goodman FOS=${n_goodman.toFixed(2)} แนะนำขยายเป็นขนาดมาตรฐาน ${recNext} mm`;
    }

    renderKaTeXMath();
    updateVmDiagram(L_mm);
    drawShaftVisualizer(d_iso, L_mm, hasKeyway, T_nm, F_axial, isCompressive);

    if (bearingInputs.shaftDia) bearingInputs.shaftDia.value = d_iso;
    if (bearingInputs.rpm) bearingInputs.rpm.value = N;
}

// Bearing Calculation Engine (Tab 2)
function calculateBearing() {
    const d = parseFloat(bearingInputs.shaftDia.value) || 14;
    const n = parseFloat(bearingInputs.rpm.value) || 60;
    const fr = Math.abs(parseFloat(bearingInputs.fr.value) || 0);
    const fa = Math.abs(parseFloat(bearingInputs.fa.value) || 0);
    const type = bearingInputs.type.value;
    const cRating = parseFloat(bearingInputs.cRating.value) || 6800;
    const vFactor = parseFloat(bearingInputs.vFactor.value) || 1.0;

    const x = 0.56, y = 1.5;
    const pEq = fa === 0 ? vFactor * fr : Math.max((x * vFactor * fr) + (y * fa), fr);
    const pEqFinal = Math.max(pEq, 1.0);

    const k = type === 'ball' ? 3.0 : 3.333333333;
    const l10Mr = Math.pow(cRating / pEqFinal, k);
    const l10Hours = (1e6 / (60.0 * n)) * l10Mr;
    const years = l10Hours / (24.0 * 365.25);

    bearingOutputs.pEq.innerText = `${formatDec(pEqFinal)} N`;
    bearingOutputs.l10Mr.innerText = `${formatDecComma(l10Mr)} ล้านรอบ`;
    bearingOutputs.l10Hours.innerText = `${formatDecComma(l10Hours)} ชั่วโมง`;
    bearingOutputs.years.innerText = `${formatDec(years)} ปี (24/7)`;

    // Automatic Bearing Recommendation Engine
    let recommendedBearing = ISO_6200_BEARINGS.find(b => b.bore_mm === d);
    if (!recommendedBearing) {
        recommendedBearing = ISO_6200_BEARINGS.find(b => b.bore_mm > d) || ISO_6200_BEARINGS[ISO_6200_BEARINGS.length - 1];
    }

    const reqL10h = 12000;
    const reqL10 = (60.0 * n * reqL10h) / 1e6;
    const reqC = pEqFinal * Math.pow(reqL10, 1.0 / k);

    let adequateBearing = ISO_6200_BEARINGS.find(b => b.bore_mm >= d && b.c_dynamic_n >= reqC);
    if (adequateBearing) {
        recommendedBearing = adequateBearing;
    }

    const recNameEl = document.getElementById('recBearingName');
    const recDetailEl = document.getElementById('recBearingDetail');
    if (recNameEl && recDetailEl && recommendedBearing) {
        const recL10Mr = Math.pow(recommendedBearing.c_dynamic_n / pEqFinal, k);
        const recL10Hours = (1e6 / (60.0 * n)) * recL10Mr;
        const recYears = recL10Hours / (24.0 * 365.25);
        recNameEl.innerText = `ISO ${recommendedBearing.designation}`;
        recDetailEl.innerText = `ขนาดรูเพลา d = ${recommendedBearing.bore_mm} mm | โตนอก D = ${recommendedBearing.outer_mm} mm | หนา B = ${recommendedBearing.width_mm} mm | Dynamic Capacity C = ${recommendedBearing.c_dynamic_n.toLocaleString()} N (คาดการณ์อายุใช้งาน: ${formatDecComma(recL10Hours)} ชั่วโมง / ${formatDec(recYears)} ปี)`;
    }

    bearingOutputs.tbody.innerHTML = '';
    ISO_6200_BEARINGS.forEach(b => {
        const tr = document.createElement('tr');
        const isRecommended = recommendedBearing && b.designation === recommendedBearing.designation;
        if (isRecommended) {
            tr.className = 'highlight-row';
            tr.style.backgroundColor = '#f0fdf4';
        }
        tr.innerHTML = `
            <td>
                <strong>ISO ${b.designation}</strong>
                ${isRecommended ? '<span class="status-badge pass" style="margin-left:6px;"><i class="fa-solid fa-star"></i> แนะนำ (Recommended)</span>' : ''}
            </td>
            <td>${b.bore_mm} mm</td>
            <td>${b.outer_mm} mm</td>
            <td>${b.width_mm} mm</td>
            <td><strong>${b.c_dynamic_n.toLocaleString()} N</strong></td>
            <td>
                <button class="btn-scientific btn-select-bearing" data-c="${b.c_dynamic_n}" data-des="${b.designation}">
                    <i class="fa-solid fa-check"></i> เลือกใช้งาน (C=${b.c_dynamic_n.toLocaleString()}N)
                </button>
            </td>
        `;
        bearingOutputs.tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-select-bearing').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cVal = parseFloat(e.currentTarget.getAttribute('data-c'));
            bearingInputs.cRating.value = cVal;
            calculateBearing();
        });
    });
}

// Full Excel Model Gear Calculation Engine (Tab 3)
function calculateGear() {
    const P = parseFloat(gearInputs.powerW.value) || 2000;
    const N1 = parseFloat(gearInputs.rpm.value) || 690;
    const mw = parseFloat(gearInputs.gearRatio.value) || 3.5;
    const Np = parseInt(gearInputs.teethZ1.value) || 16;
    const m = parseFloat(gearInputs.module.value) || 6.0;
    const kb = parseFloat(gearInputs.faceRatio.value) || 10.0;
    const kf = parseFloat(gearInputs.kf.value) || 1.5;
    const wearK = parseFloat(gearInputs.wearK.value) || 1.182;
    const sigmaP = parseFloat(gearInputs.sigmaP.value) || 103;
    const sigmaG = parseFloat(gearInputs.sigmaG.value) || 82;
    const profileQuality = gearInputs.profileQuality.value;

    const Ng = Math.round(Np * mw);
    const dp = m * Np;
    const dg = m * Ng;
    const ng = N1 / mw;
    const b = kb * m;
    const Ccenter = (dp + dg) / 2.0;

    const V = (Math.PI * dp * N1) / (60.0 * 1000.0);
    const Ft = V > 0 ? P / V : 0;

    let Kv = (3.0 + V) / 3.0;
    if (profileQuality === 'cut') Kv = (6.0 + V) / 6.0;
    if (profileQuality === 'precision') Kv = (5.6 + Math.sqrt(V)) / 5.6;

    const Fd = Ft * Kv;

    const Yp = lookupLewisY(Np);
    const Yg = lookupLewisY(Ng);

    const indexP = sigmaP * Yp;
    const indexG = sigmaG * Yg;

    const Fb_pinion = (sigmaP * b * m * Yp) / kf;
    const Fb_gear = (sigmaG * b * m * Yg) / kf;

    const Q = (2.0 * Ng) / (Np + Ng);
    const Fw = dp * b * Q * wearK;

    const pinionBendingPass = Fb_pinion >= Fd;
    const gearBendingPass = Fb_gear >= Fd;
    const wearPass = Fw >= Fd;
    const overallPass = pinionBendingPass && gearBendingPass && wearPass;

    // 1. Pinion Outputs
    if (gearOutputs.pinionDp) gearOutputs.pinionDp.innerText = `${formatDec(dp)} mm`;
    if (gearOutputs.pinionNp) gearOutputs.pinionNp.innerText = `Np = ${Np} teeth`;
    if (gearOutputs.pinionSpeedSigma) gearOutputs.pinionSpeedSigma.innerText = `${formatDec(N1, 0)} rpm | ${formatDec(sigmaP)} N/mm²`;
    if (gearOutputs.pinionYIndex) gearOutputs.pinionYIndex.innerText = `Yp = ${formatDec(Yp, 4)} | Index = ${formatDec(indexP)} N/mm²`;
    if (gearOutputs.pinionFb) gearOutputs.pinionFb.innerHTML = `<strong class="primary-val">${formatDecComma(Fb_pinion)} N</strong>`;
    if (gearOutputs.pinionBendingStatus) gearOutputs.pinionBendingStatus.innerHTML = `<span class="status-badge ${pinionBendingPass ? 'pass' : 'warn'}">${pinionBendingPass ? 'PASS: Safe' : 'FAIL: Fracture'}</span>`;

    // 2. Gear Outputs
    if (gearOutputs.gearDg) gearOutputs.gearDg.innerText = `${formatDec(dg)} mm`;
    if (gearOutputs.gearNg) gearOutputs.gearNg.innerText = `Ng = ${Ng} teeth`;
    if (gearOutputs.gearSpeedSigma) gearOutputs.gearSpeedSigma.innerText = `${formatDec(ng)} rpm | ${formatDec(sigmaG)} N/mm²`;
    if (gearOutputs.gearYIndex) gearOutputs.gearYIndex.innerText = `Yg = ${formatDec(Yg, 4)} | Index = ${formatDec(indexG)} N/mm²`;
    if (gearOutputs.gearFbVal) gearOutputs.gearFbVal.innerHTML = `<strong class="primary-val">${formatDecComma(Fb_gear)} N</strong>`;
    if (gearOutputs.gearBendingStatusVal) gearOutputs.gearBendingStatusVal.innerHTML = `<span class="status-badge ${gearBendingPass ? 'pass' : 'warn'}">${gearBendingPass ? 'PASS: Safe' : 'FAIL: Fracture'}</span>`;

    // 3. Mesh Pair Transmission & Wear Verification
    let weakerLabel = "Pinion & Gear Equal Strength";
    if (indexP < indexG) weakerLabel = "Pinion governs (อ่อนแอกว่า)";
    else if (indexG < indexP) weakerLabel = "Gear governs (อ่อนแอกว่า)";

    if (gearOutputs.weaker) gearOutputs.weaker.innerHTML = `<strong id="resWeakerText">${weakerLabel}</strong>`;
    if (gearOutputs.bcVal) gearOutputs.bcVal.innerText = `b = ${formatDec(b)} mm | C = ${formatDec(Ccenter)} mm`;
    if (gearOutputs.vFtVal) gearOutputs.vFtVal.innerText = `V = ${formatDec(V)} m/s | Ft = ${formatDec(Ft)} N`;
    if (gearOutputs.kvFdVal) gearOutputs.kvFdVal.innerText = `Kv = ${formatDec(Kv)} | Fd = ${formatDecComma(Fd)} N`;
    if (gearOutputs.fwVal) gearOutputs.fwVal.innerText = `Fw = ${formatDecComma(Fw)} N`;
    if (gearOutputs.wearStatusVal) gearOutputs.wearStatusVal.innerHTML = `<span class="status-badge ${wearPass ? 'pass' : 'warn'}">${wearPass ? 'PASS: Safe' : 'FAIL: Pitting'}</span>`;

    // Overall Verdict
    if (gearOutputs.verdictBadge) {
        if (overallPass) {
            gearOutputs.verdictBadge.className = 'verdict-tag verdict-pass';
            gearOutputs.verdictBadge.innerHTML = '<i class="fa-solid fa-check"></i> DESIGN SAFE';
        } else {
            gearOutputs.verdictBadge.className = 'verdict-tag verdict-warn';
            gearOutputs.verdictBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> UNSAFE DESIGN';
        }
    }

    // 4. Render Module Trial Matrix Table (m = 2.0 to 9.0 mm)
    if (gearOutputs.tbodyTrial) {
        gearOutputs.tbodyTrial.innerHTML = '';
        const trialModules = [2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0];
        trialModules.forEach(mod => {
            const t_dp = mod * Np;
            const t_dg = mod * Ng;
            const t_b = kb * mod;
            const t_V = (Math.PI * t_dp * N1) / 60000.0;
            const t_Ft = t_V > 0 ? P / t_V : 0;
            let t_Kv = (3.0 + t_V) / 3.0;
            if (profileQuality === 'cut') t_Kv = (6.0 + t_V) / 6.0;
            if (profileQuality === 'precision') t_Kv = (5.6 + Math.sqrt(t_V)) / 5.6;
            const t_Fd = t_Ft * t_Kv;

            const t_Fb_p = (sigmaP * t_b * mod * Yp) / kf;
            const t_Fb_g = (sigmaG * t_b * mod * Yg) / kf;

            const t_Fw = t_dp * t_b * Q * wearK;
            const t_pass = (t_Fb_p >= t_Fd) && (t_Fb_g >= t_Fd) && (t_Fw >= t_Fd);

            const tr = document.createElement('tr');
            if (mod === m) tr.className = 'highlight-row';
            tr.innerHTML = `
                <td><strong>m = ${formatDec(mod, 1)} mm</strong></td>
                <td>${formatDec(t_b, 1)} mm</td>
                <td>${formatDec(t_dp, 1)} / ${formatDec(t_dg, 1)} mm</td>
                <td>${formatDecComma(t_Fd)} N</td>
                <td>${formatDecComma(t_Fb_p)} N</td>
                <td>${formatDecComma(t_Fb_g)} N</td>
                <td>${formatDecComma(t_Fw)} N</td>
                <td>
                    <span class="status-badge ${t_pass ? 'pass' : 'warn'}">${t_pass ? 'Safe' : 'Unsafe'}</span>
                </td>
            `;
            gearOutputs.tbodyTrial.appendChild(tr);
        });
    }
}

// Render KaTeX Formulas dynamically
function renderKaTeXMath() {
    const doRender = () => {
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(document.body, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '$', right: '$', display: false }
                ],
                throwOnError: false
            });
        }
    };

    if (typeof renderMathInElement === 'function') {
        doRender();
    } else {
        window.addEventListener('load', doRender);
        document.addEventListener('DOMContentLoaded', doRender);
        setTimeout(doRender, 500);
    }
}

// Draw 2D Shaft Visualizer
function drawShaftVisualizer(d, L, hasKeyway, T, F, isCompressive) {
    const width = shaftCanvas.width;
    const height = shaftCanvas.height;
    ctxShaft.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const shaftX = 100;
    const shaftWidth = 400;
    const shaftHeight = Math.min(Math.max(d * 2.5, 20), 80);

    ctxShaft.strokeStyle = '#94a3b8';
    ctxShaft.setLineDash([6, 6]);
    ctxShaft.beginPath();
    ctxShaft.moveTo(30, centerY);
    ctxShaft.lineTo(width - 30, centerY);
    ctxShaft.stroke();
    ctxShaft.setLineDash([]);

    ctxShaft.fillStyle = '#f1f5f9';
    ctxShaft.strokeStyle = '#1e3a8a';
    ctxShaft.lineWidth = 2;
    ctxShaft.beginPath();
    ctxShaft.rect(shaftX, centerY - shaftHeight / 2, shaftWidth, shaftHeight);
    ctxShaft.fill();
    ctxShaft.stroke();

    if (hasKeyway) {
        ctxShaft.fillStyle = '#ffffff';
        ctxShaft.strokeStyle = '#b45309';
        ctxShaft.lineWidth = 1.5;
        ctxShaft.fillRect(shaftX + shaftWidth / 2 - 25, centerY - shaftHeight / 2, 50, 10);
        ctxShaft.strokeRect(shaftX + shaftWidth / 2 - 25, centerY - shaftHeight / 2, 50, 10);
    }

    ctxShaft.fillStyle = '#64748b';
    ctxShaft.fillRect(shaftX + 20, centerY - shaftHeight / 2 - 14, 24, shaftHeight + 28);
    ctxShaft.fillRect(shaftX + shaftWidth - 44, centerY - shaftHeight / 2 - 14, 24, shaftHeight + 28);

    ctxShaft.fillStyle = '#0f172a';
    ctxShaft.font = '12px Inter, sans-serif';
    ctxShaft.textAlign = 'center';
    ctxShaft.fillText(`ISO Nominal Diameter d = ${d} mm`, shaftX + shaftWidth / 2, centerY + shaftHeight / 2 + 35);
}

// Preset Handlers (Shaft Tab)
document.getElementById('btnPresetTable').addEventListener('click', () => {
    setActiveButton('btnPresetTable');
    inputs.powerW.value = 150;
    inputs.rpm.value = 60;
    inputs.bendingMoment.value = 20;
    inputs.shaftLength.value = 100;
    inputs.axialForce.value = 0;
    inputs.scPreset.value = 'KEYWAY_PROFILE';
    inputs.ktValue.value = 2.1;
    inputs.ktsValue.value = 1.8;
    inputs.materialPreset.value = 'SS400';
    inputs.yieldStrength.value = 250;
    inputs.tensileStrength.value = 400;
    inputs.fos.value = 2.0;
    inputs.hasKeyway.value = 'true';
    inputs.loadType.value = 'steady';
    inputs.cmValue.value = 1.5;
    inputs.ctValue.value = 1.0;
    vmLoadsList = [{ w_n: 800, dir: 'downward', x_mm: 50 }];
    renderVmLoadsTable();
    calculate();
});

document.getElementById('btnPresetEx1').addEventListener('click', () => {
    setActiveButton('btnPresetEx1');
    inputs.powerW.value = 6785.8;
    inputs.rpm.value = 60;
    inputs.bendingMoment.value = 1798.3;
    inputs.shaftLength.value = 875;
    inputs.axialForce.value = 0;
    inputs.scPreset.value = 'KEYWAY_PROFILE';
    inputs.ktValue.value = 2.1;
    inputs.ktsValue.value = 1.8;
    inputs.materialPreset.value = 'SS400';
    inputs.yieldStrength.value = 250;
    inputs.tensileStrength.value = 400;
    inputs.hasKeyway.value = 'true';
    inputs.loadType.value = 'steady';
    inputs.cmValue.value = 1.5;
    inputs.ctValue.value = 1.0;
    vmLoadsList = [{ w_n: 8220, dir: 'downward', x_mm: 437.5 }];
    renderVmLoadsTable();
    calculate();
});

document.getElementById('btnPresetEx4').addEventListener('click', () => {
    setActiveButton('btnPresetEx4');
    inputs.powerW.value = 10;
    inputs.rpm.value = 1000;
    inputs.bendingMoment.value = 0.16;
    inputs.shaftLength.value = 160;
    inputs.axialForce.value = 0;
    inputs.scPreset.value = 'SMOOTH';
    inputs.ktValue.value = 1.0;
    inputs.ktsValue.value = 1.0;
    inputs.materialPreset.value = 'SS400';
    inputs.yieldStrength.value = 250;
    inputs.tensileStrength.value = 400;
    inputs.cmValue.value = 1.5;
    inputs.ctValue.value = 1.0;
    vmLoadsList = [{ w_n: 4, dir: 'downward', x_mm: 80 }];
    renderVmLoadsTable();
    calculate();
});

// Active Button Utility
function setActiveButton(btnId) {
    document.querySelectorAll('.btn-scientific').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
}

// Event Listeners for Shaft Inputs
Object.values(inputs).forEach(input => {
    if (input) {
        input.addEventListener('input', () => {
            calculate();
            if (input.id === 'decimalDigits') {
                calculateBearing();
                calculateGear();
            }
        });
        input.addEventListener('change', () => {
            if (input.id === 'vmYDir') {
                renderVmLoadsTable();
            }
            calculate();
            if (input.id === 'decimalDigits') {
                calculateBearing();
                calculateGear();
            }
        });
    }
});

if (inputs.materialPreset) {
    inputs.materialPreset.addEventListener('change', () => {
        const val = inputs.materialPreset.value;
        if (val && MATERIAL_PRESETS[val]) {
            inputs.yieldStrength.value = MATERIAL_PRESETS[val].sy;
            inputs.tensileStrength.value = MATERIAL_PRESETS[val].sut;
            inputs.elasticModulus.value = MATERIAL_PRESETS[val].e_gpa;
        }
        calculate();
    });
}

if (inputs.scPreset) {
    inputs.scPreset.addEventListener('change', () => {
        const val = inputs.scPreset.value;
        if (val && SC_PRESETS[val]) {
            inputs.ktValue.value = SC_PRESETS[val].kt;
            inputs.ktsValue.value = SC_PRESETS[val].kts;
        }
        calculate();
    });
}

// Event Listeners for Bearing Inputs
Object.values(bearingInputs).forEach(input => {
    if (input) {
        input.addEventListener('input', calculateBearing);
        input.addEventListener('change', calculateBearing);
    }
});

// Event Listeners for Gear Inputs
Object.values(gearInputs).forEach(input => {
    if (input) {
        input.addEventListener('input', calculateGear);
        input.addEventListener('change', calculateGear);
    }
});

// Sync Peak Bending Moment (Mmax) to Main Calculation
if (btnSyncMoment) {
    btnSyncMoment.addEventListener('click', () => {
        inputs.bendingMoment.value = lastCalculatedMmaxNm.toFixed(2);
        calculate();
    });
}

// Initial Run on Page Load - Strictly activate Tab 1 only
window.addEventListener('DOMContentLoaded', () => {
    renderVmLoadsTable();
    calculate();
    calculateBearing();
    calculateGear();

    const initialBtn = document.getElementById('btnTabShaft');
    switchTab('tabShaft', initialBtn);
});

renderVmLoadsTable();
calculate();
calculateBearing();
calculateGear();
switchTab('tabShaft', document.getElementById('btnTabShaft'));
