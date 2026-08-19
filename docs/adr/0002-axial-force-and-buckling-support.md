# 2. Support for Axial Force (F) and Buckling Factor (alpha) in ASME Shaft Sizing

* Status: Accepted
* Date: 2026-08-19

## Context and Problem Statement
Mechanical shafts in real robotics and industrial applications (such as bevel gears, helical gears, or lead screws) often experience axial push/pull forces ($F$) in addition to torque ($T$) and bending moment ($M$).

## Decision
The system will fully support axial load $F$ and calculate the Buckling Factor $\alpha$ according to ASME rules (Slide Pages 25 & 28 of FRA232):
* Full ASME Equation with Axial Load:
  $$d^3 = \frac{16}{\pi \tau_d (1 - K^4)} \sqrt{ (C_t T)^2 + \left( \frac{\alpha F d (1 + K^2)}{8} + C_m M \right)^2 }$$
* Tensile Force ($F > 0$): $\alpha = 1.0$
* Compressive Force ($F < 0$):
  - Slenderness Ratio: $\frac{L}{k} = \frac{4L}{d}$
  - For $\frac{L}{k} \le 115$: $\alpha = \frac{1}{1 - 0.0044 (L/k)}$
  - For $\frac{L}{k} > 115$: $\alpha = \frac{\sigma_y (L/k)^2}{\pi^2 n E}$
* Since $d$ appears on both sides of the equation when $F \neq 0$, the sizing algorithm will use fixed-point iterative convergence to solve for the exact $d_{calc}$.

## Consequences
* High fidelity calculation for real-world robotic/gear shafts subject to thrust loads.
* Provides end-condition selectors (Simply Supported, Fixed-Fixed, Fixed-Free) in the UI.
