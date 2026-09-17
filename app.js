// ISO Standard Shaft Diameters (Table 9.1 ISO/R 775-1969)
const ISO_STANDARD_DIAMETERS = [
    6, 7, 8, 9, 10, 12, 14, 18, 20, 25, 30, 35, 40, 45, 50, 
    55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 110, 120, 130, 140, 
    150, 160, 170, 180, 190, 200, 220, 240, 260, 280, 300, 320, 340, 360, 380
];

// Material Presets
const MATERIAL_PRESETS = {
    SS400: { sy: 250, sut: 400 },
    AISI1020: { sy: 290, sut: 380 },
    AISI1045: { sy: 310, sut: 570 },
    AISI4140: { sy: 415, sut: 655 }
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

// ISO 6200 Deep Groove Ball Bearing Series Data
const ISO_6200_BEARINGS = [
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
    fos: document.getElementById('fos'),
    hasKeyway: document.getElementById('hasKeyway'),
    loadType: document.getElementById('loadType'),
    cmValue: document.getElementById('cmValue'),
    ctValue: document.getElementById('ctValue'),

    // V-M Diagram Controls
    vmBeamType: document.getElementById('vmBeamType'),
    vmXa: document.getElementById('vmXa'),
    vmXb: document.getElementById('vmXb')
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

// DOM Elements - Gear Tab
const gearInputs = {
    powerW: document.getElementById('gearPowerW'),
    rpm: document.getElementById('gearRpm'),
    module: document.getElementById('gearModule'),
    faceWidth: document.getElementById('gearFaceWidth'),
    teethZ1: document.getElementById('gearTeethZ1'),
    teethZ2: document.getElementById('gearTeethZ2'),
    pressureAngle: document.getElementById('gearPressureAngle'),
    allowableStress: document.getElementById('gearAllowableStress')
};

const gearOutputs = {
    d1: document.getElementById('resGearD1'),
    d2: document.getElementById('resGearD2'),
    centerDist: document.getElementById('resGearCenterDist'),
    wt: document.getElementById('resGearWt'),
    wr: document.getElementById('resGearWr'),
    wtAllow: document.getElementById('resGearWtAllow'),
    lewisFos: document.getElementById('resGearLewisFos'),
    verdictBadge: document.getElementById('gearVerdictBadge')
};

const btnSyncMoment = document.getElementById('btnSyncMoment');
const btnAddLoadRow = document.getElementById('btnAddLoadRow');
const overhangingPosRow = document.getElementById('overhangingPosRow');
const vmLoadsTbody = document.getElementById('vmLoadsTbody');

const shaftCanvas = document.getElementById('shaftCanvas');
const sfdCanvas = document.getElementById('sfdCanvas');
const bmdCanvas = document.getElementById('bmdCanvas');
const gearCanvas = document.getElementById('gearCanvas');

const ctxShaft = shaftCanvas.getContext('2d');
const ctxSFD = sfdCanvas.getContext('2d');
const ctxBMD = bmdCanvas.getContext('2d');
const ctxGear = gearCanvas ? gearCanvas.getContext('2d') : null;

let lastCalculatedMmaxNm = 20.0;

// Top Tab Switcher Logic
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const targetTab = e.currentTarget.getAttribute('data-tab');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        e.currentTarget.classList.add('active');
        document.getElementById(targetTab).classList.add('active');

        // Re-render KaTeX Math & Canvases on tab switch
        renderKaTeXMath();
        if (targetTab === 'tabGear') calculateGear();
        if (targetTab === 'tabBearing') calculateBearing();
    });
});

// Helper Functions
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
                    <option value="downward" ${load.dir === 'downward' ? 'selected' : ''}>-Y ชี้ลง (↓)</option>
                    <option value="upward" ${load.dir === 'upward' ? 'selected' : ''}>+Y ชี้ขึ้น (↑)</option>
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
        const v_x = term_ra + term_rb + term_w;

        const m_fixed_term = x >= xa ? maFixed : 0;
        const m_ra = Ra * Math.max(x - xa, 0);
        const m_rb = Rb * Math.max(x - xb, 0);
        const m_w = signedLoads.reduce((sum, l) => sum + (l.x_mm <= x ? l.w_n * (x - l.x_mm) : 0), 0);
        const m_x = m_fixed_term + m_ra + m_rb + m_w;

        vPoints.push(v_x);
        mPoints.push(m_x);
    }

    const Vmax = Math.max(...vPoints.map(Math.abs), 0);
    const Mmax_nmm = Math.max(...mPoints.map(Math.abs), 0);
    const Mmax_nm = Mmax_nmm / 1000.0;

    lastCalculatedMmaxNm = Mmax_nm;

    outputs.resVmRa.innerText = `${Ra > 0 ? '+' : ''}${Ra.toFixed(1)} N (${Ra >= 0 ? '↑' : '↓'})`;
    outputs.resVmRb.innerText = beamType === 'cantilever' ? `M_fixed = ${(maFixed/1000).toFixed(2)} N-m` : `${Rb > 0 ? '+' : ''}${Rb.toFixed(1)} N (${Rb >= 0 ? '↑' : '↓'})`;
    outputs.resVmVmax.innerText = `${Vmax.toFixed(1)} N`;
    outputs.resVmMmaxNm.innerText = `${Mmax_nm.toFixed(2)} N-m`;
    outputs.resVmMmaxNmm.innerText = `${Math.round(Mmax_nmm).toLocaleString()} N-mm`;
    btnSyncMoment.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> นำค่า M<sub>max</sub> (${Mmax_nm.toFixed(2)} N-m) เข้าไปคำนวณเพลาหลักทันที`;

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
    const targetFos = parseFloat(inputs.fos.value) || 2.0;
    const hasKeyway = inputs.hasKeyway.value === 'true';

    const cm = parseFloat(inputs.cmValue.value) || 1.5;
    const ct = parseFloat(inputs.ctValue.value) || 1.0;

    const omega = (2 * Math.PI * N) / 60.0;
    const T_nm = P > 0 ? P / omega : 0;
    const T_nmm = T_nm * 1000.0;
    const M_nmm = M_nm * 1000.0;

    const tau_d = hasKeyway ? 41.0 : 55.0;

    const E = 205000.0;
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
    outputs.resCalcDia.innerText = `${d_calc.toFixed(2)} mm`;
    outputs.resTorque.innerText = `${T_nm.toFixed(2)} N-m`;
    outputs.resTorqueNmm.innerText = `${Math.round(T_nmm).toLocaleString()} N-mm`;
    outputs.resTwistDeg.innerText = `${theta_deg.toFixed(3)}°`;
    outputs.resTwistPerM.innerText = `${theta_per_m.toFixed(2)} deg/m`;
    outputs.resCriticalSpeed.innerText = `${Math.round(nc_rpm).toLocaleString()} RPM`;

    const isSafeOperating = N < 0.75 * nc_rpm || N > 1.25 * nc_rpm;
    outputs.resOperatingCheck.innerText = `N = ${N} RPM (${isSafeOperating ? 'Safe Range' : '⚠️ Resonance Warning'})`;

    outputs.resTauD.innerText = `${tau_d.toFixed(1)} MPa`;
    outputs.resAlpha.innerText = alpha.toFixed(2);
    outputs.resYieldFos.innerText = n_yield.toFixed(2);
    outputs.resGoodmanFos.innerText = n_goodman.toFixed(2);

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

    // Auto-sync calculated shaft diameter & RPM to Bearing Tab
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

    // Equivalent Radial Load P = X * V * Fr + Y * Fa
    const x = 0.56, y = 1.5;
    const pEq = fa === 0 ? vFactor * fr : Math.max((x * vFactor * fr) + (y * fa), fr);
    const pEqFinal = Math.max(pEq, 1.0);

    const k = type === 'ball' ? 3.0 : 3.333333333;
    const l10Mr = Math.pow(cRating / pEqFinal, k);
    const l10Hours = (1e6 / (60.0 * n)) * l10Mr;
    const years = l10Hours / (24.0 * 365.25);

    bearingOutputs.pEq.innerText = `${pEqFinal.toFixed(1)} N`;
    bearingOutputs.l10Mr.innerText = `${Math.round(l10Mr).toLocaleString()} ล้านรอบ`;
    bearingOutputs.l10Hours.innerText = `${Math.round(l10Hours).toLocaleString()} ชั่วโมง`;
    bearingOutputs.years.innerText = `${years.toFixed(1)} ปี (24/7)`;

    // Render Recommended ISO 62xx Bearing Table
    bearingOutputs.tbody.innerHTML = '';
    ISO_6200_BEARINGS.forEach(b => {
        const isSelected = b.bore_mm >= d && (!bearingOutputs.selectedDesignation || bearingOutputs.selectedDesignation === b.designation);
        const tr = document.createElement('tr');
        if (b.bore_mm === d || (b.bore_mm > d && !bearingOutputs.foundMatch)) {
            tr.className = 'highlight-row';
            bearingOutputs.foundMatch = true;
        }
        tr.innerHTML = `
            <td><strong>ISO ${b.designation}</strong></td>
            <td>${b.bore_mm} mm</td>
            <td>${b.outer_mm} mm</td>
            <td>${b.width_mm} mm</td>
            <td><strong>${b.c_dynamic_n.toLocaleString()} N</strong></td>
            <td>
                <button class="btn-scientific btn-select-bearing" data-c="${b.c_dynamic_n}" data-des="${b.designation}">
                    <i class="fa-solid fa-check"></i> เลือก (C=${b.c_dynamic_n}N)
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

// Gear Calculation Engine (Tab 3)
function calculateGear() {
    const P = parseFloat(gearInputs.powerW.value) || 150;
    const N1 = parseFloat(gearInputs.rpm.value) || 60;
    const m = parseFloat(gearInputs.module.value) || 2.0;
    const b = parseFloat(gearInputs.faceWidth.value) || 20;
    const z1 = parseInt(gearInputs.teethZ1.value) || 20;
    const z2 = parseInt(gearInputs.teethZ2.value) || 40;
    const phiDeg = parseFloat(gearInputs.pressureAngle.value) || 20;
    const sigmaB = parseFloat(gearInputs.allowableStress.value) || 140;

    const d1 = m * z1;
    const d2 = m * z2;
    const centerDist = (d1 + d2) / 2.0;

    const omega1 = (2 * Math.PI * N1) / 60.0;
    const T1_nm = P / omega1;
    const wt = (2000.0 * T1_nm) / d1;
    const wr = wt * Math.tan((phiDeg * Math.PI) / 180.0);

    // Lewis Form Factor y
    let y = 0.104;
    if (z1 <= 12) y = 0.067;
    else if (z1 <= 15) y = 0.092;
    else if (z1 <= 18) y = 0.100;
    else if (z1 <= 22) y = 0.104;
    else if (z1 <= 28) y = 0.112;
    else if (z1 <= 35) y = 0.118;
    else if (z1 <= 45) y = 0.125;
    else y = 0.130;

    const wtAllow = sigmaB * b * Math.PI * m * y;
    const fosLewis = wt > 0 ? wtAllow / wt : 99.0;

    gearOutputs.d1.innerText = `${d1.toFixed(1)} mm`;
    gearOutputs.d2.innerText = `${d2.toFixed(1)} mm`;
    gearOutputs.centerDist.innerText = `${centerDist.toFixed(1)} mm`;
    gearOutputs.wt.innerText = `${wt.toFixed(1)} N`;
    gearOutputs.wr.innerText = `${wr.toFixed(1)} N`;
    gearOutputs.wtAllow.innerText = `${wtAllow.toFixed(1)} N`;
    gearOutputs.lewisFos.innerText = `FOS = ${fosLewis.toFixed(2)} (${fosLewis >= 1.0 ? 'Pass Safe' : '⚠️ Overstress'})`;

    if (fosLewis >= 1.0) {
        gearOutputs.verdictBadge.className = 'verdict-tag verdict-pass';
        gearOutputs.verdictBadge.innerHTML = '<i class="fa-solid fa-check"></i> GEAR SAFE';
    } else {
        gearOutputs.verdictBadge.className = 'verdict-tag verdict-warn';
        gearOutputs.verdictBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> RESIZE MODULE';
    }

    drawGearMeshVisualizer(d1, d2, centerDist);
}

// Render KaTeX Formulas dynamically
function renderKaTeXMath() {
    if (typeof renderMathInElement === 'function') {
        renderMathInElement(document.body, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\(', right: '\\)', display: false }
            ],
            throwOnError: false
        });
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

// Draw 2D Spur Gear Mesh Visualizer
function drawGearMeshVisualizer(d1, d2, a) {
    if (!ctxGear) return;
    const width = gearCanvas.width;
    const height = gearCanvas.height;
    ctxGear.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const scale = 360.0 / Math.max(d1 + d2, 1.0);

    const r1 = (d1 / 2.0) * scale;
    const r2 = (d2 / 2.0) * scale;
    const c1x = 140 + r1;
    const c2x = c1x + r1 + r2;

    // Center Line
    ctxGear.strokeStyle = '#94a3b8';
    ctxGear.setLineDash([4, 4]);
    ctxGear.beginPath();
    ctxGear.moveTo(50, centerY);
    ctxGear.lineTo(width - 50, centerY);
    ctxGear.stroke();
    ctxGear.setLineDash([]);

    // Pinion Circle (Gear 1)
    ctxGear.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctxGear.strokeStyle = '#0284c7';
    ctxGear.lineWidth = 2;
    ctxGear.beginPath();
    ctxGear.arc(c1x, centerY, r1, 0, Math.PI * 2);
    ctxGear.fill();
    ctxGear.stroke();

    // Driven Gear Circle (Gear 2)
    ctxGear.fillStyle = 'rgba(15, 118, 110, 0.15)';
    ctxGear.strokeStyle = '#0f766e';
    ctxGear.lineWidth = 2;
    ctxGear.beginPath();
    ctxGear.arc(c2x, centerY, r2, 0, Math.PI * 2);
    ctxGear.fill();
    ctxGear.stroke();

    // Mesh Tangent Point
    ctxGear.fillStyle = '#dc2626';
    ctxGear.beginPath();
    ctxGear.arc(c1x + r1, centerY, 5, 0, Math.PI * 2);
    ctxGear.fill();

    // Labels
    ctxGear.fillStyle = '#1e3a8a';
    ctxGear.font = '600 12px Inter, sans-serif';
    ctxGear.textAlign = 'center';
    ctxGear.fillText(`Pinion d1 = ${d1.toFixed(1)} mm`, c1x, centerY - r1 - 10);
    ctxGear.fillText(`Gear d2 = ${d2.toFixed(1)} mm`, c2x, centerY - r2 - 10);
    ctxGear.fillText(`Center Distance a = ${a.toFixed(1)} mm`, (c1x + c2x) / 2, centerY + Math.max(r1, r2) + 20);
}

// Active Button Utility
function setActiveButton(btnId) {
    document.querySelectorAll('.btn-scientific').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(btnId);
    if (btn) btn.classList.add('active');
}

// Event Listeners for Shaft Inputs
Object.values(inputs).forEach(input => {
    if (input) {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
    }
});

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

// Initial Run on Page Load
window.addEventListener('DOMContentLoaded', () => {
    renderVmLoadsTable();
    calculate();
    calculateBearing();
    calculateGear();
    renderKaTeXMath();
});

renderVmLoadsTable();
calculate();
calculateBearing();
calculateGear();
