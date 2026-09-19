# Raghav Intro Animation (Apple Mac "hello")

This document records the exact specifications, asset details, and integration instructions for the **Raghav Intro Animation** created for EduVision / Raghav.

---

## 📌 Overview & Origin

- **Name**: **Raghav Intro Animation**
- **Type**: 1:1 Pixel-Perfect Official Apple macOS Boot & Screensaver "hello" handwriting animation.
- **Reference**: Official Apple Sonoma/Sequoia first-boot unboxing experience screen and `Hello.saver` vector coordinates.
- **Standalone File**: [`raghav_intro_animation.html`](file:///c:/Users/Sakshi%20Gupta/OneDrive/Documents/Phase%202.0/animations/raghav_intro_animation.html)
- **Status**: Production-ready & saved in codebase database.

---

## 🎨 Design & Motion Anatomy

### 1. Vector Geometry & Coordinate Space
- **ViewBox**: `-160 -60 2620 860`
- **Stroke Width**: `62px` with `stroke-linecap: round; stroke-linejoin: round`
- **Path 1 (Ascender of 'h')**:
  - Arc length: `~1665px`
  - Duration: `0.75s`
  - Easing: `cubic-bezier(0.3, 0, 0.2, 1)`
- **Path 2 (Continuous 'ello' + cross loops)**:
  - Arc length: `~8135px`
  - Duration: `2.0s` (starts with `0.68s` delay right as the 'h' downstroke begins)
  - Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)`

### 2. Apple Sonoma Gradient Backdrop
Pure CSS layered multi-stop radial gradients recreating Apple's California coastal sunset backdrop:
- Radial sky: `#3e526a` to `#1e2938`
- Warm sunlit horizon glows: `rgba(217, 145, 20, 0.42)` and `rgba(180, 83, 9, 0.38)`
- Deep navy base: `#05080c` to `#000000` with 36px hardware-accelerated blur.

### 3. Apple Glass "Get Started" Action Button
- Appears smoothly (`opacity: 1`, `transform: translateY(0)`) at 2.6s.
- Features circular glassmorphic pill button (`rgba(255, 255, 255, 0.18)`), Cupertino blue hover state (`#0071e3`), and directional right chevron.
- Triggering exit performs an Apple-native dissolve: `scale(1.06)`, `opacity: 0`, and `filter: blur(14px)` over `1.3s`.

---

## 🚀 How to Run & Preview
You can directly open the standalone file in any browser:
```powershell
Start-Process "animations/raghav_intro_animation.html"
```
Features included in the preview:
1. Full autoplay handwriting sequence.
2. Floating Apple Action Bar with:
   - **Replay** button.
   - **Auto-Loop** switch.
   - **Trigger Exit Dissolve** button to simulate transitioning into the main website.

---

## 🔧 Future Integration into `index.html`
When ready to integrate:
1. Replace `#intro` container in [`index.html`](file:///c:/Users/Sakshi%20Gupta/OneDrive/Documents/Phase%202.0/index.html) with `<div id="macStage">...</div>`.
2. Include the CSS from [`raghav_intro_animation.html`](file:///c:/Users/Sakshi%20Gupta/OneDrive/Documents/Phase%202.0/animations/raghav_intro_animation.html).
3. On animation completion or click, apply `.dissolve` class to smoothly reveal EduVision's main hero section.
