# 3. User-Friendly Stress Concentration Factors (Kt and Kts) UI

* Status: Accepted
* Date: 2026-08-19

## Context and Problem Statement
Calculating stress concentration factors ($K_t$ for bending, $K_{ts}$ for torsion) requires selecting geometric notch features (such as shoulder fillets, keyways, or retaining ring grooves). Entering raw $K_t$ numbers can be confusing for non-specialists, while rigid presets prevent advanced customization.

## Decision
Implement a hybrid user-friendly UI approach:
1. **Quick Presets Dropdown**: Provide standard options (Smooth Shaft $K_t=1.0, K_{ts}=1.0$, Standard Profile Keyway $K_t=2.1, K_{ts}=1.8$, Bearing Shoulder Fillet $K_t=1.7, K_{ts}=1.5$, Sharp Notch $K_t=2.5, K_{ts}=2.0$).
2. **Direct Custom Input**: Allow users to edit the numeric fields directly for custom geometries.

## Consequences
* Maximum user-friendliness for students and beginner engineers.
* Full flexibility for advanced mechanical designers needing precise notch sensitivity factors.
