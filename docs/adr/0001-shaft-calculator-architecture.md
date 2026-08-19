# 1. Architecture for Mechanical Shaft Design Studio

* Status: Accepted
* Date: 2026-08-19

## Context and Problem Statement
The user needed a reliable, offline-first, easy-to-use web application and calculation engine for Mechanical Shaft Design based on the FRA232 curriculum (FIBO, KMUTT).

## Decision Drivers
* Offline standalone browser execution without complex build tools.
* Accurate implementation of ASME, Modified Goodman, Von Mises, and Rayleigh-Dunkerley critical speed formulas.
* High design aesthetics (Modern Soft Glassmorphic Light/Dark UI) and real-time 2D Canvas visualization.

## Considered Options
1. Vanilla HTML5 + CSS3 + JS + Canvas 2D
2. React / Vite Web App
3. Python Streamlit / Custom Tkinter GUI

## Decision Outcome
Chosen Option: **Vanilla HTML5 + CSS3 + JS + Canvas 2D** because it runs instantly in any browser without build steps, supports 100% offline access via `index.html`, and allows simple deployment to GitHub Pages.
