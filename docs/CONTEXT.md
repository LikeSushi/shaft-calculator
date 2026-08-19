# Project Context & Terminology (Ubiquitous Language)

## Core Domain Concepts
- **Shaft (เพลา)**: Rotating or stationary mechanical element transmitting torque and bending moments.
- **ASME Shaft Design Method**: Standardized design procedure using allowable shear stress $\tau_d$ and load combination factors $C_m, C_t$.
- **Axial Load ($F$)**: Longitudinal push/pull thrust force acting along the shaft axis.
- **Buckling Factor ($\alpha$)**: Amplification factor for axial compressive loads depending on slenderness ratio $L/k$.
- **Stress Concentration Factors ($K_t, K_{ts}$)**: Stress amplification factors at geometric discontinuities (keyways, fillets, grooves).
- **ISO/R 775-1969 Standard Size**: Standard nominal shaft diameters (6mm to 380mm).
- **Modified Goodman Criterion**: Fatigue failure criterion combining alternating bending stress ($\sigma'_a$) and steady mean torsional stress ($\sigma'_m$).
- **Von Mises Distortion Energy Theory**: Combined multi-axial stress yield failure criterion $\sigma'_{max} = \sqrt{(\sigma'_a)^2 + (\sigma'_m)^2}$.
- **Critical Speed ($n_c$)**: Rotational speed at which natural frequency matches shaft resonance (Rayleigh-Dunkerley method).

## Project Glossary
- **$P$**: Motor Power (Watts)
- **$N$**: Rotational Speed (RPM)
- **$M$**: Bending Moment ($\text{N}\cdot\text{m}$)
- **$T$**: Transmitted Torque ($\text{N}\cdot\text{m}$)
- **$F$**: Axial Force ($\text{N}$) — Tensile ($+$) or Compressive ($-$)
- **$K_t$**: Theoretical Stress Concentration Factor for Bending
- **$K_{ts}$**: Theoretical Stress Concentration Factor for Torsion
- **$\alpha$**: Buckling Factor
- **$\theta$**: Twist Angle ($\text{deg}$ or $\text{deg/m}$)
- **$FOS$**: Factor of Safety (Target FOS $\ge 2.0$)

## Architecture Decisions Log (ADRs)
1. **[0001-shaft-calculator-architecture.md](file:///C:/Users/Chard/Desktop/Structure/docs/adr/0001-shaft-calculator-architecture.md)** — Standalone HTML5/CSS3/JS UI with HTML5 2D Canvas.
2. **[0002-axial-force-and-buckling-support.md](file:///C:/Users/Chard/Desktop/Structure/docs/adr/0002-axial-force-and-buckling-support.md)** — Full ASME equation with axial load $F$ and buckling factor $\alpha$.
3. **[0003-user-friendly-stress-concentration-presets.md](file:///C:/Users/Chard/Desktop/Structure/docs/adr/0003-user-friendly-stress-concentration-presets.md)** — User-friendly $K_t, K_{ts}$ notch presets with custom input overrides.
4. **[0004-focus-on-interactive-web-calculator.md](file:///C:/Users/Chard/Desktop/Structure/docs/adr/0004-focus-on-interactive-web-calculator.md)** — High-performance real-time calculator focus without PDF overhead.
5. **[0005-alignment-with-fra232-lecture-slides.md](file:///C:/Users/Chard/Desktop/Structure/docs/adr/0005-alignment-with-fra232-lecture-slides.md)** — Full alignment with FRA232 Week 03 lecture material.
