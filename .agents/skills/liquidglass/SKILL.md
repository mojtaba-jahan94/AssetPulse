---
name: liquidglass
description: Implement and configure realistic WebGL liquid glass effects (refraction, blur, chromatic aberration, specular highlights, floating draggable panels, and glass buttons) on web UI elements using @ybouane/liquidglass. Use when the user asks to add liquid glass or frosted glass refraction, Apple VisionOS-like glass panels, or integrate the liquidglass library in Vanilla HTML/JS, React, or Vue.
---

# LiquidGlass WebGL Effect Skill

A comprehensive guide and execution manual for integrating `@ybouane/liquidglass` into web applications. This skill enables AI agents to generate, configure, and debug realistic glass refraction, blur, chromatic aberration, and lighting effects for any HTML element using WebGL shaders.

- **NPM Package**: `@ybouane/liquidglass`
- **GitHub**: `https://github.com/ybouane/liquidglass`
- **Live Demo & Playground**: `https://liquid-glass.ybouane.com/`

---

## 1. When to Use This Skill

Activate this skill when:
- Creating or styling glassmorphism / liquid glass / Apple VisionOS / macOS Big Sur style UI components.
- Adding physical optical effects like chromatic aberration, refraction bending, rim highlights, specular glare, or frosted blur over backgrounds or videos.
- Implementing draggable glass widgets or responsive glass buttons with hover/press dynamics.
- Integrating `@ybouane/liquidglass` into HTML, React, Next.js, Vue, or Vite projects.

---

## 2. Core Architecture & Mental Model

LiquidGlass operates on a root container with direct child layers:

```
[#root container (relative/fixed, defined dimensions)]
 ├── [Background layers]  (e.g., <img class="bg">, <video data-dynamic>, <div>)
 ├── [Static DOM text/cards] (captured once via html-to-image to an offscreen canvas)
 ├── [Animated DOM elements] (must have `data-dynamic` to recapture every frame)
 └── [Glass elements]     (direct children of #root, receive injected WebGL canvas)
```

### Critical Rules:
1. **Direct Children Only**: All glass elements and background elements MUST be direct children of the `root` container passed to `LiquidGlass.init()`.
2. **`data-dynamic` Attribute**: Any DOM element behind the glass that changes, animates, or updates via JS/CSS MUST have the `data-dynamic` attribute so the compositor knows to re-rasterise it each frame. `<video>` elements are handled automatically.
3. **`data-config` Attribute**: Glass elements configure their shader parameters via a JSON string on `data-config` or global defaults during initialization.
4. **Clean Teardown**: Always retain the instance and call `instance.destroy()` on component unmount (React/Vue/Svelte) to cancel `requestAnimationFrame`, detach event listeners, and avoid WebGL context leaks.

---

## 3. Installation & Setup

### NPM / Modern Bundlers (Vite, Next.js, Webpack)
```bash
npm install @ybouane/liquidglass
```

### CDN / Vanilla HTML (No Build Step)
```html
<script type="module">
  import { LiquidGlass } from 'https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js';
  // Use LiquidGlass here
</script>
```

---

## 4. Quick Start: Vanilla HTML/JS

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    #glassRoot {
      position: relative;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: radial-gradient(circle at 30% 30%, #ff5e62, #ff9966, #6b11ff);
    }
    .hero-title {
      position: absolute;
      top: 20%;
      left: 10%;
      font-size: 4rem;
      color: white;
      font-family: sans-serif;
    }
    .glass-card {
      position: absolute;
      top: 35%;
      left: 25%;
      width: 380px;
      height: 220px;
      padding: 24px;
      box-sizing: border-box;
      color: white;
      border-radius: 32px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="glassRoot">
    <h1 class="hero-title">Liquid Glass UI</h1>

    <!-- Glass Element: direct child of #glassRoot -->
    <div class="glass-card" id="myCard">
      <h2>Refractive Card</h2>
      <p>Interactive glass panel powered by WebGL shaders.</p>
    </div>
  </div>

  <script type="module">
    import { LiquidGlass } from 'https://cdn.jsdelivr.net/npm/@ybouane/liquidglass/dist/index.js';

    const card = document.getElementById('myCard');
    card.dataset.config = JSON.stringify({
      blurAmount: 0.20,
      refraction: 0.75,
      chromAberration: 0.08,
      edgeHighlight: 0.15,
      specular: 0.10,
      fresnel: 1.0,
      cornerRadius: 32,
      floating: true // enables mouse/touch dragging
    });

    const instance = await LiquidGlass.init({
      root: document.getElementById('glassRoot'),
      glassElements: [card]
    });
  </script>
</body>
</html>
```

---

## 5. Parameter Reference (`GlassConfig`)

All options can be provided in `LiquidGlass.init({ defaults: { ... } })` or per-element in `element.dataset.config = JSON.stringify({ ... })`.

| Parameter | Type | Default | Valid Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| `refraction` | `number` | `0.69` | `0.0 - 2.0` | Strength of refraction bending the scene behind the glass. |
| `blurAmount` | `number` | `0.00` | `0.0 - 1.0` | Gaussian blur strength (0 = crystal clear, 1 = heavy frosted glass). |
| `chromAberration` | `number` | `0.05` | `0.0 - 0.5` | RGB color-fringing split at edges and bevels. |
| `edgeHighlight` | `number` | `0.05` | `0.0 - 1.0` | Rim lighting / inner glow brightness along bevel contour. |
| `specular` | `number` | `0.00` | `0.0 - 1.0` | Multi-light Blinn-Phong specular glare reflections. |
| `fresnel` | `number` | `1.00` | `0.0 - 2.0` | Reflection intensity at grazing incident angles. |
| `distortion` | `number` | `0.00` | `0.0 - 0.2` | Procedural noise micro-ripples across glass surface. |
| `cornerRadius` | `number` | `65` | `0 - 200` | Corner radius in CSS pixels for the bevel profile. |
| `zRadius` | `number` | `40` | `0 - 100` | Bevel depth / curved lens edge thickness. |
| `opacity` | `number` | `1.00` | `0.0 - 1.0` | Overall visibility of the glass layer. |
| `saturation` | `number` | `0.00` | `-1.0 - 1.0` | Color saturation (-1 is grayscale, 0 normal, 1 vivid). |
| `tintStrength` | `number` | `0.00` | `0.0 - 1.0` | Cool cyan/blue optical tint intensity. |
| `brightness` | `number` | `0.00` | `-0.5 - 0.5` | Exposure/brightness offset behind the lens. |
| `shadowOpacity` | `number` | `0.30` | `0.0 - 1.0` | Drop shadow density under the glass element. |
| `shadowSpread` | `number` | `10` | `0 - 50` | Blur radius of the drop shadow in pixels. |
| `shadowOffsetY` | `number` | `1` | `-20 - 50` | Vertical drop shadow offset in CSS pixels. |
| `floating` | `boolean` | `false` | `true/false` | Enables drag-and-drop pointer movements on the element. |
| `button` | `boolean` | `false` | `true/false` | Enables interactive hover-lift and click-press dynamics. |
| `bevelMode` | `number` | `0` | `0 or 1` | `0` = biconvex pill bevel (default); `1` = dome magnifier (flat bottom, spherical top). |

---

## 6. Curated Presets

### Preset A: "Apple VisionOS Frosted Glass Card"
```json
{
  "blurAmount": 0.35,
  "refraction": 0.45,
  "chromAberration": 0.04,
  "edgeHighlight": 0.12,
  "specular": 0.08,
  "fresnel": 0.90,
  "cornerRadius": 28,
  "zRadius": 20,
  "shadowOpacity": 0.25,
  "shadowSpread": 16,
  "shadowOffsetY": 4
}
```

### Preset B: "Water Droplet / Magnifying Dome"
```json
{
  "blurAmount": 0.00,
  "refraction": 1.25,
  "chromAberration": 0.15,
  "edgeHighlight": 0.20,
  "specular": 0.35,
  "distortion": 0.03,
  "bevelMode": 1,
  "cornerRadius": 60,
  "zRadius": 60
}
```

### Preset C: "Interactive Glassmorphism Button"
```json
{
  "blurAmount": 0.15,
  "refraction": 0.50,
  "chromAberration": 0.05,
  "edgeHighlight": 0.25,
  "specular": 0.15,
  "button": true,
  "cornerRadius": 20,
  "zRadius": 14
}
```

---

## 7. React / Next.js Component Pattern

```tsx
import React, { useEffect, useRef } from 'react';
import { LiquidGlass } from '@ybouane/liquidglass';
import type { GlassConfig } from '@ybouane/liquidglass/dist/defaults';

interface LiquidGlassContainerProps {
  children: React.ReactNode;
  className?: string;
  defaultConfig?: Partial<GlassConfig>;
}

export const LiquidGlassContainer: React.FC<LiquidGlassContainerProps> = ({
  children,
  className = '',
  defaultConfig = {
    blurAmount: 0.2,
    refraction: 0.7,
    edgeHighlight: 0.1,
  },
}) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    let instance: LiquidGlass | null = null;
    let isMounted = true;

    const glassElements = rootRef.current.querySelectorAll<HTMLElement>('[data-glass]');

    LiquidGlass.init({
      root: rootRef.current,
      glassElements: Array.from(glassElements),
      defaults: defaultConfig,
    }).then((inst) => {
      if (isMounted) {
        instance = inst;
      } else {
        inst.destroy();
      }
    });

    return () => {
      isMounted = false;
      if (instance) {
        instance.destroy();
      }
    };
  }, [defaultConfig]);

  return (
    <div ref={rootRef} className={`relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};
```

---

## 8. Troubleshooting & Best Practices

1. **"Glass is not showing the background"**:
   - Ensure background elements are inside the `root` container and are **direct siblings** of the glass element.
   - Verify images have completed loading before `LiquidGlass.init()` is called, or call `instance.markChanged()` once loaded.
2. **"Canvas text looks blurry"**:
   - LiquidGlass automatically respects `window.devicePixelRatio`. Ensure the CSS width and height of the root are explicitly defined.
3. **"Fonts did not render correctly in the glass"**:
   - Webfonts must be loaded prior to init. If fonts load asynchronously (e.g. Google Fonts), call `invalidateFontEmbedCache()` and re-initialize.
4. **"Lagging when animating content behind glass"**:
   - Only apply `data-dynamic` to elements that actually change every frame. Avoid putting `data-dynamic` on static containers.
