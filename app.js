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

// DOM Elements
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

    // V-M Diagram Inputs
    vmLoadN: document.getElementById('vmLoadN'),
    vmPosA: document.getElementById('vmPosA')
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

const btnSyncMoment = document.getElementById('btnSyncMoment');

const shaftCanvas = document.getElementById('shaftCanvas');
const sfdCanvas = document.getElementById('sfdCanvas');
const bmdCanvas = document.getElementById('bmdCanvas');

const ctxShaft = shaftCanvas.getContext('2d');
const ctxSFD = sfdCanvas.getContext('2d');
const ctxBMD = bmdCanvas.getContext('2d');

let lastCalculatedMmaxNm = 20.0;

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

// V-M Diagram Calculation Engine (User Request 2)
function updateVmDiagram(L_mm) {
    const W = Math.abs(parseFloat(inputs.vmLoadN.value) || 0);
    let a = parseFloat(inputs.vmPosA.value) || 0;
    if (a < 0) a = 0;
    if (a > L_mm) a = L_mm;

    const b = L_mm - a;

    // Reactions
    const Ra = L_mm > 0 ? (W * b) / L_mm : 0;
    const Rb = L_mm > 0 ? (W * a) / L_mm : 0;

    // Max Shear & Max Moment
    const Vmax = Math.max(Math.abs(Ra), Math.abs(Rb));
    const Mmax_nmm = Ra * a;
    const Mmax_nm = Mmax_nmm / 1000.0;

    lastCalculatedMmaxNm = Mmax_nm;

    outputs.resVmRa.innerText = `${Ra.toFixed(1)} N`;
    outputs.resVmRb.innerText = `${Rb.toFixed(1)} N`;
    outputs.resVmVmax.innerText = `${Vmax.toFixed(1)} N`;
    outputs.resVmMmaxNm.innerText = `${Mmax_nm.toFixed(2)} N-m`;
    outputs.resVmMmaxNmm.innerText = `${Math.round(Mmax_nmm).toLocaleString()} N-mm`;
    btnSyncMoment.innerHTML = `<i class="fa-solid fa-arrows-rotate"></i> นำค่า M<sub>max</sub> (${Mmax_nm.toFixed(2)} N-m) เข้าไปคำนวณเพลาหลักทันที`;

    // Draw SFD and BMD Canvases
    drawSFDDiagram(L_mm, a, Ra, Rb, Vmax);
    drawBMDDiagram(L_mm, a, Mmax_nm, Mmax_nmm);
}

// Draw Shear Force Diagram V(x)
function drawSFDDiagram(L, a, Ra, Rb, Vmax) {
    const width = sfdCanvas.width;
    const height = sfdCanvas.height;
    ctxSFD.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const startX = 60;
    const endX = width - 60;
    const plotWidth = endX - startX;
    const loadX = startX + (a / L) * plotWidth;

    // Zero Line
    ctxSFD.strokeStyle = '#94a3b8';
    ctxSFD.setLineDash([4, 4]);
    ctxSFD.beginPath();
    ctxSFD.moveTo(startX, centerY);
    ctxSFD.lineTo(endX, centerY);
    ctxSFD.stroke();
    ctxSFD.setLineDash([]);

    if (Vmax <= 0) return;

    const maxH = height / 2 - 25;
    const hRa = (Ra / Vmax) * maxH;
    const hRb = (Rb / Vmax) * maxH;

    // SFD Shape
    ctxSFD.fillStyle = 'rgba(2, 132, 199, 0.15)';
    ctxSFD.strokeStyle = '#0284c7';
    ctxSFD.lineWidth = 2;

    ctxSFD.beginPath();
    ctxSFD.moveTo(startX, centerY);
    ctxSFD.lineTo(startX, centerY - hRa);
    ctxSFD.lineTo(loadX, centerY - hRa);
    ctxSFD.lineTo(loadX, centerY + hRb);
    ctxSFD.lineTo(endX, centerY + hRb);
    ctxSFD.lineTo(endX, centerY);
    ctxSFD.closePath();
    ctxSFD.fill();
    ctxSFD.stroke();

    // Values Text
    ctxSFD.fillStyle = '#1e3a8a';
    ctxSFD.font = '600 11px Inter, sans-serif';
    ctxSFD.fillText(`+V = ${Ra.toFixed(1)} N`, startX + 10, centerY - hRa - 6);
    ctxSFD.fillStyle = '#dc2626';
    ctxSFD.fillText(`-V = ${Rb.toFixed(1)} N`, loadX + 10, centerY + hRb + 14);
}

// Draw Bending Moment Diagram M(x)
function drawBMDDiagram(L, a, MmaxNm, MmaxNmm) {
    const width = bmdCanvas.width;
    const height = bmdCanvas.height;
    ctxBMD.clearRect(0, 0, width, height);

    const centerY = height - 25;
    const startX = 60;
    const endX = width - 60;
    const plotWidth = endX - startX;
    const loadX = startX + (a / L) * plotWidth;

    // Zero Line
    ctxBMD.strokeStyle = '#94a3b8';
    ctxBMD.setLineDash([4, 4]);
    ctxBMD.beginPath();
    ctxBMD.moveTo(startX, centerY);
    ctxBMD.lineTo(endX, centerY);
    ctxBMD.stroke();
    ctxBMD.setLineDash([]);

    if (MmaxNm <= 0) return;

    const maxH = height - 55;

    // BMD Shape
    ctxBMD.fillStyle = 'rgba(15, 118, 110, 0.15)';
    ctxBMD.strokeStyle = '#0f766e';
    ctxBMD.lineWidth = 2;

    ctxBMD.beginPath();
    ctxBMD.moveTo(startX, centerY);
    ctxBMD.lineTo(loadX, centerY - maxH);
    ctxBMD.lineTo(endX, centerY);
    ctxBMD.closePath();
    ctxBMD.fill();
    ctxBMD.stroke();

    // Peak Label
    ctxBMD.fillStyle = '#0f766e';
    ctxBMD.font = '700 12px Inter, sans-serif';
    ctxBMD.textAlign = 'center';
    ctxBMD.fillText(`M_max = ${MmaxNm.toFixed(2)} N-m`, loadX, centerY - maxH - 8);
}

// Calculation Engine
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

    // Custom Cm & Ct (User Request 1)
    const cm = parseFloat(inputs.cmValue.value) || 1.5;
    const ct = parseFloat(inputs.ctValue.value) || 1.0;

    // 1. Calculate Torque (T)
    const omega = (2 * Math.PI * N) / 60.0;
    const T_nm = P > 0 ? P / omega : 0;
    const T_nmm = T_nm * 1000.0;
    const M_nmm = M_nm * 1000.0;

    // 2. ASME Allowable Shear Stress (tau_d)
    const tau_d = hasKeyway ? 41.0 : 55.0;

    // 3. Full ASME Sizing Equation with Axial Load & Buckling (Iterative Solver)
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

    // 4. Angle of Twist (584 * T * L) / (G * d^4)
    const G = 79000.0;
    const theta_deg = d_iso > 0 ? (584.0 * T_nmm * L_mm) / (G * Math.pow(d_iso, 4)) : 0;
    const theta_per_m = theta_deg * (1000.0 / L_mm);

    // 5. Critical Speed (nc)
    const I = (Math.PI * Math.pow(d_iso, 4)) / 64.0;
    const W_dummy = 10.0;
    const y_deflect = (W_dummy * Math.pow(L_mm, 3)) / (48.0 * E * I);
    const nc_rpm = y_deflect > 0 ? 945.0 * Math.sqrt(1.0 / y_deflect) : 99999;

    // 6. Fatigue (Goodman) & Yield (Von Mises)
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

    // Update UI Outputs
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

    // Verdict Badge & Advice
    if (n_goodman >= targetFos && n_yield >= targetFos && isSafeOperating) {
        outputs.verdictBadge.className = 'verdict-tag verdict-pass';
        outputs.verdictBadge.innerHTML = '<i class="fa-solid fa-check"></i> DESIGN SAFE';
        outputs.adviceBox.style.background = '#f0fdf4';
        outputs.adviceBox.style.borderColor = '#bbf7d0';
        outputs.adviceBox.style.color = '#15803d';
        outputs.adviceText.innerText = `เพลาขนาด ${d_iso} mm ผ่านเกณฑ์วิศวกรรมทั้ง Static Yield (FOS=${n_yield.toFixed(2)}) และ Fatigue Goodman (FOS=${n_goodman.toFixed(2)}) [Cm=${cm}, Ct=${ct}]`;
    } else {
        outputs.verdictBadge.className = 'verdict-tag verdict-warn';
        outputs.verdictBadge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> RECOMMEND RESIZING';
        outputs.adviceBox.style.background = '#fffbeb';
        outputs.adviceBox.style.borderColor = '#fde68a';
        outputs.adviceBox.style.color = '#b45309';
        
        let recNext = getIsoStandardDiameter(d_iso + 1);
        outputs.adviceText.innerText = `เพลาขนาด ${d_iso} mm มี Goodman FOS=${n_goodman.toFixed(2)} (เป้าหมาย=${targetFos}) แนะนำขยายเป็นขนาดมาตรฐาน ${recNext} mm`;
    }

    // Trigger KaTeX Math Render & V-M Diagram Update
    renderKaTeXMath();
    updateVmDiagram(L_mm);

    // Draw Shaft Visualizer
    drawShaftVisualizer(d_iso, L_mm, hasKeyway, T_nm, F_axial, isCompressive);
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

// Draw Scientific Paper Shaft Diagram
function drawShaftVisualizer(d, L, hasKeyway, T, F, isCompressive) {
    const width = shaftCanvas.width;
    const height = shaftCanvas.height;
    ctxShaft.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const shaftX = 100;
    const shaftWidth = 400;
    const shaftHeight = Math.min(Math.max(d * 2.5, 20), 80);

    // Center Axis Line
    ctxShaft.strokeStyle = '#94a3b8';
    ctxShaft.setLineDash([6, 6]);
    ctxShaft.beginPath();
    ctxShaft.moveTo(30, centerY);
    ctxShaft.lineTo(width - 30, centerY);
    ctxShaft.stroke();
    ctxShaft.setLineDash([]);

    // Shaft Body
    ctxShaft.fillStyle = '#f1f5f9';
    ctxShaft.strokeStyle = '#1e3a8a';
    ctxShaft.lineWidth = 2;
    ctxShaft.beginPath();
    ctxShaft.rect(shaftX, centerY - shaftHeight / 2, shaftWidth, shaftHeight);
    ctxShaft.fill();
    ctxShaft.stroke();

    // Keyway Notch
    if (hasKeyway) {
        ctxShaft.fillStyle = '#ffffff';
        ctxShaft.strokeStyle = '#b45309';
        ctxShaft.lineWidth = 1.5;
        ctxShaft.fillRect(shaftX + shaftWidth / 2 - 25, centerY - shaftHeight / 2, 50, 10);
        ctxShaft.strokeRect(shaftX + shaftWidth / 2 - 25, centerY - shaftHeight / 2, 50, 10);
    }

    // Bearings
    ctxShaft.fillStyle = '#64748b';
    ctxShaft.fillRect(shaftX + 20, centerY - shaftHeight / 2 - 14, 24, shaftHeight + 28);
    ctxShaft.fillRect(shaftX + shaftWidth - 44, centerY - shaftHeight / 2 - 14, 24, shaftHeight + 28);

    // Torque Arrow
    if (T > 0) {
        ctxShaft.strokeStyle = '#0284c7';
        ctxShaft.lineWidth = 3;
        ctxShaft.beginPath();
        ctxShaft.arc(shaftX + shaftWidth - 10, centerY, shaftHeight / 2 + 15, -Math.PI / 2, Math.PI / 2);
        ctxShaft.stroke();
        ctxShaft.fillStyle = '#0284c7';
        ctxShaft.beginPath();
        ctxShaft.arc(shaftX + shaftWidth - 10, centerY + shaftHeight / 2 + 15, 5, 0, Math.PI * 2);
        ctxShaft.fill();
    }

    // Axial Force Arrow (F)
    if (F > 0) {
        ctxShaft.strokeStyle = '#dc2626';
        ctxShaft.fillStyle = '#dc2626';
        ctxShaft.lineWidth = 3;
        ctxShaft.beginPath();
        if (isCompressive) {
            ctxShaft.moveTo(35, centerY);
            ctxShaft.lineTo(shaftX - 5, centerY);
            ctxShaft.stroke();
            ctxShaft.beginPath();
            ctxShaft.moveTo(shaftX - 5, centerY);
            ctxShaft.lineTo(shaftX - 15, centerY - 6);
            ctxShaft.lineTo(shaftX - 15, centerY + 6);
            ctxShaft.closePath();
            ctxShaft.fill();
        } else {
            ctxShaft.moveTo(shaftX, centerY);
            ctxShaft.lineTo(35, centerY);
            ctxShaft.stroke();
            ctxShaft.beginPath();
            ctxShaft.moveTo(35, centerY);
            ctxShaft.lineTo(45, centerY - 6);
            ctxShaft.lineTo(45, centerY + 6);
            ctxShaft.closePath();
            ctxShaft.fill();
        }
        ctxShaft.font = '11px Inter, sans-serif';
        ctxShaft.fillText(`F = ${F} N`, 50, centerY - 12);
    }

    // Dimension Annotations
    ctxShaft.fillStyle = '#0f172a';
    ctxShaft.font = '12px Inter, sans-serif';
    ctxShaft.textAlign = 'center';
    ctxShaft.fillText(`ISO Nominal Diameter d = ${d} mm`, shaftX + shaftWidth / 2, centerY + shaftHeight / 2 + 35);
    ctxShaft.fillText(`Length L = ${L} mm`, shaftX + shaftWidth / 2, centerY - shaftHeight / 2 - 25);
}

// Active Button Utility
function setActiveButton(btnId) {
    document.querySelectorAll('.btn-scientific').forEach(b => b.classList.remove('active'));
    document.getElementById(btnId).classList.add('active');
}

// Preset Handlers
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
    calculate();
});

// ASME Load Type Dropdown Event (User Request 1)
inputs.loadType.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'CUSTOM' && ASME_LOAD_PRESETS[val]) {
        inputs.cmValue.value = ASME_LOAD_PRESETS[val].cm;
        inputs.ctValue.value = ASME_LOAD_PRESETS[val].ct;
    }
    calculate();
});

// Stress Concentration Dropdown Event
inputs.scPreset.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'CUSTOM' && SC_PRESETS[val]) {
        inputs.ktValue.value = SC_PRESETS[val].kt;
        inputs.ktsValue.value = SC_PRESETS[val].kts;
    }
    calculate();
});

// Material Dropdown Event
inputs.materialPreset.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val !== 'CUSTOM' && MATERIAL_PRESETS[val]) {
        inputs.yieldStrength.value = MATERIAL_PRESETS[val].sy;
        inputs.tensileStrength.value = MATERIAL_PRESETS[val].sut;
    }
    calculate();
});

// Sync Peak Bending Moment (Mmax) to Main Calculation
btnSyncMoment.addEventListener('click', () => {
    inputs.bendingMoment.value = lastCalculatedMmaxNm.toFixed(2);
    calculate();
});

// Live Event Listeners
Object.values(inputs).forEach(input => {
    if (input) {
        input.addEventListener('input', calculate);
        input.addEventListener('change', calculate);
    }
});

// Initial Run with KaTeX rendering on load
window.addEventListener('DOMContentLoaded', () => {
    calculate();
    renderKaTeXMath();
});

calculate();
