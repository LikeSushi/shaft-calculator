# 5. Full Alignment with FRA232 Week 03 Lecture Curriculum

* Status: Accepted
* Date: 2026-08-19

## Context and Problem Statement
The user confirmed that the feature set and calculation scope should align 100% with the authoritative teaching material in `FRA232-week-03.pdf` (Asst. Prof. Dr. Supachai Vongbunyong, FIBO KMUTT).

## Decision
The Web Application UI and Python backend (`shaft_cal.py`) are finalized to include all core topics taught in FRA232 Week 03:
1. **ASME Shaft Design**: Full equation with torque $T$, bending $M$, axial load $F$, and buckling factor $\alpha$.
2. **ISO/R 775-1969 Standard Size Table Lookup** (6mm to 380mm).
3. **Twisted Angle Calculation** ($\theta = \frac{584 T L}{G d^4}$).
4. **Rayleigh-Dunkerley Critical Speed ($n_c$)** & 25% safe operating buffer.
5. **Modified Goodman Fatigue & Von Mises Static Yield FOS**.
6. **Stress Concentration Factors ($K_t, K_{ts}$)** with user-friendly presets and manual overrides.

## Outcome
The project scope is fully closed, validated against lecture examples 9.1 and 9.4, and verified with a 10/10 passing unit test suite.
