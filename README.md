# Mechanical Shaft Design Studio & Calculator

An interactive, scientific-grade Mechanical Shaft Design Calculator and 2D Visualizer web application built according to the **FRA232 Mechanical Structure Design** curriculum (Asst. Prof. Dr. Supachai Vongbunyong, FIBO, King Mongkut's University of Technology Thonburi).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Curriculum](https://img.shields.io/badge/KMUTT-FIBO%20FRA232-navy.svg)
![LaTeX](https://img.shields.io/badge/KaTeX-LaTeX%20Enabled-green.svg)

---

## 🌟 Key Features

* **ASME Shaft Design Method**: Full equation supporting torque ($T$), bending moment ($M$), axial thrust force ($F$), and buckling factor ($\alpha$).
* **ISO/R 775-1969 Standard Size Table Lookup**: Automatic lookup for standard nominal diameters (6mm to 380mm).
* **Twisted Angle Calculation**: Torsional deflection $\theta = \frac{584 T L}{G d^4}$ with degree/meter limits.
* **Rayleigh-Dunkerley Critical Speed ($n_c$)**: Rotational resonance calculation with $\pm 25\%$ safe operating buffer indicator.
* **Modified Goodman & Von Mises Yield Analysis**: Real-time fatigue & static yield safety factor (FOS) evaluation.
* **User-Friendly Stress Concentration Presets**: Quick dropdown for keyways, fillets, notches, and custom $K_t, K_{ts}$ numeric inputs.
* **LaTeX Formula Rendering**: Publication-quality KaTeX equation typesetting for scientific transparency.
* **Interactive 2D Canvas Visualizer**: Real-time rendering of shaft geometry, bearings, keyway notch, and force vectors.

---

## 📐 Governing Engineering Equations

### 1. ASME Shaft Sizing (Full Form with Axial Load & Buckling)
$$d^3 = \frac{16}{\pi \tau_d (1 - K^4)} \sqrt{ (C_t T)^2 + \left( \frac{\alpha F d (1+K^2)}{8} + C_m M \right)^2 }$$

### 2. Modified Goodman Fatigue Criteria
$$\frac{1}{n_{goodman}} = \frac{\sigma'_a}{S_e} + \frac{\sigma'_m}{S_{ut}}$$

### 3. Von Mises Maximum Stress & Yield Criteria
$$\sigma'_{max} = \sqrt{(\sigma'_a)^2 + (\sigma'_m)^2} \quad \Rightarrow \quad n_{yield} = \frac{S_y}{\sigma'_{max}}$$

### 4. Critical Speed ($n_c$)
$$n_c = 945 \sqrt{ \frac{\sum W_i y_i}{\sum W_i y_i^2} }$$

---

## 📂 Project Structure

```text
Structure/
├── index.html        # Web Application UI & KaTeX LaTeX Integration
├── style.css         # Scientific Report Paper Theme Styling
├── app.js            # Real-time Calculation Engine & 2D Canvas Visualizer
├── shaft_cal.py      # Core Python Shaft Calculation Engine
├── test_shaft_cal.py # 10/10 Passing Unit Test Suite
├── README.md         # Project Documentation
└── docs/             # Architecture Decision Records (ADR 0001 - 0005) & Context
    ├── CONTEXT.md
    └── adr/
        ├── 0001-shaft-calculator-architecture.md
        ├── 0002-axial-force-and-buckling-support.md
        ├── 0003-user-friendly-stress-concentration-presets.md
        ├── 0004-focus-on-interactive-web-calculator.md
        └── 0005-alignment-with-fra232-lecture-slides.md
```

---

## 🚀 Quick Start (Local Run)

Simply open [index.html](index.html) in any modern browser (Chrome, Edge, Firefox, Safari). No installation or build step required!

---

## 🌐 Deploy to GitHub Pages

1. Create a new public repository on GitHub named `shaft-calculator`.
2. Upload all files from this repository.
3. Navigate to **Settings** $\rightarrow$ **Pages** $\rightarrow$ select `main` branch $\rightarrow$ **Save**.
4. Your application will be live at `https://<your-username>.github.io/shaft-calculator/`

---

## 📄 License
Distributed under the MIT License. Built for educational & engineering design purposes.
