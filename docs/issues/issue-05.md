# Issue 05 — Design System (globals.css)

**Labels:** `setup`, `frontend` | **Priority:** 🔴 Critical | **Depends on:** Issue 02

## Checklist
- [ ] Replace `src/app/globals.css` with the full design system

## File to Create

### `src/app/globals.css`

Replace the entire file with the following:

```css
@import "tailwindcss";

/* ==============================
   HANDCRAFTED HAVEN — Design System
   Tailwind CSS v4 / CSS-First Config
   ============================== */

@theme {
  /* Brand Colors */
  --color-primary: #2F4F4F;
  --color-primary-light: #3D6363;
  --color-primary-dark: #1E3535;
  --color-background: #DCDCDC;
  --color-background-light: #E8E8E8;
  --color-cta: #F26419;
  --color-cta-hover: #D9560F;
  --color-cta-light: #F4813E;
  --color-text: #000000;
  --color-text-muted: #333333; /* Darkened for accessibility/contrast */
  --color-text-light: #444444; /* Darkened for accessibility/contrast */
  --color-accent: #003380; /* Darkened for contrast */
  --color-accent-hover: #001A4D;
  --color-accent-light: #2A75FF;
  --color-white: #FFFFFF;
  --color-surface: #F5F5F5;
  --color-surface-warm: #FAF8F5;
  --color-border: #B0B0B0;
  --color-border-light: #D0D0D0;
  --color-success: #1B5E20; /* Darkened for contrast */
  --color-success-light: #C8E6C9;
  --color-error: #D32F2F;
  --color-error-light: #FFEBEE;
  --color-warning: #F57C00;
  --color-warning-light: #FFF3E0;
  --color-star: #F5A623;

  /* Fonts */
  --font-display: var(--font-display-family), cursive;
  --font-body: var(--font-body-family), sans-serif;
  --font-ui: var(--font-ui-family), sans-serif;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-card-hover: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.1);
  --shadow-modal: 0 16px 48px rgba(0, 0, 0, 0.2);
  --shadow-inset: inset 0 2px 4px rgba(0, 0, 0, 0.06);

  /* Border Radius */
  --radius-xs: 0.25rem;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 250ms;
  --transition-slow: 350ms;

  /* Breakpoints */
  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1440px;
}

/* ==============================
   BASE STYLES
   ============================== */

* {
  box-sizing: border-box;
}

html {
  font-size: 18px; /* Globally increases text size */
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-body);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  line-height: 1.2;
}

small, label, caption, .text-ui {
  font-family: var(--font-ui);
}

a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-fast);
}

img {
  max-width: 100%;
  height: auto;
}

/* ==============================
   FOCUS STYLES (Accessibility)
   ============================== */

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: var(--radius-xs);
}

/* ==============================
   SCROLLBAR
   ============================== */

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-background);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-primary-light);
}

/* ==============================
   ANIMATIONS
   ============================== */

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounceIn {
  0% { transform: scale(0.3); opacity: 0; }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}

.animate-fade-in {
  animation: fadeIn var(--transition-base) ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp var(--transition-slow) ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown var(--transition-slow) ease-out;
}

.animate-scale-in {
  animation: scaleIn var(--transition-base) ease-out;
}

.animate-slide-in-right {
  animation: slideInRight var(--transition-slow) ease-out;
}

.animate-slide-in-left {
  animation: slideInLeft var(--transition-slow) ease-out;
}

.animate-pulse-slow {
  animation: pulse 2s ease-in-out infinite;
}

.animate-shimmer {
  background: linear-gradient(90deg, var(--color-background) 25%, var(--color-background-light) 50%, var(--color-background) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-bounce-in {
  animation: bounceIn 0.5s ease-out;
}

/* Stagger children animations */
.stagger-children > * {
  opacity: 0;
  animation: fadeInUp var(--transition-slow) ease-out forwards;
}

.stagger-children > *:nth-child(1) { animation-delay: 0ms; }
.stagger-children > *:nth-child(2) { animation-delay: 80ms; }
.stagger-children > *:nth-child(3) { animation-delay: 160ms; }
.stagger-children > *:nth-child(4) { animation-delay: 240ms; }
.stagger-children > *:nth-child(5) { animation-delay: 320ms; }
.stagger-children > *:nth-child(6) { animation-delay: 400ms; }
.stagger-children > *:nth-child(7) { animation-delay: 480ms; }
.stagger-children > *:nth-child(8) { animation-delay: 560ms; }

/* ==============================
   COMPONENT UTILITIES
   ============================== */

/* Container */
.container-app {
  width: 100%;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  .container-app {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

/* Skip to content (Accessibility) */
.skip-to-content {
  position: absolute;
  top: -100%;
  left: 1rem;
  background: var(--color-primary);
  color: var(--color-white);
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  z-index: 9999;
  font-family: var(--font-ui);
  font-weight: 600;
  transition: top var(--transition-fast);
}

.skip-to-content:focus {
  top: 1rem;
}

/* Overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  animation: fadeIn var(--transition-fast) ease-out;
}

/* Line clamp utilities */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}
```
