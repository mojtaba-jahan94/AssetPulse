# LiquidGlass Configuration Reference

Complete breakdown of all options in `GlassConfig` (`@ybouane/liquidglass/dist/defaults`).

```typescript
export interface GlassConfig {
  blurAmount: number;      // 0.00 to 1.00 (Default: 0.00)
  refraction: number;      // 0.00 to 2.00 (Default: 0.69)
  chromAberration: number; // 0.00 to 0.50 (Default: 0.05)
  edgeHighlight: number;   // 0.00 to 1.00 (Default: 0.05)
  specular: number;        // 0.00 to 1.00 (Default: 0.00)
  fresnel: number;         // 0.00 to 2.00 (Default: 1.00)
  distortion: number;      // 0.00 to 0.20 (Default: 0.00)
  cornerRadius: number;    // CSS px (Default: 65)
  zRadius: number;         // CSS px (Default: 40)
  opacity: number;         // 0.00 to 1.00 (Default: 1.00)
  saturation: number;      // -1.00 to 1.00 (Default: 0.00)
  tintStrength: number;    // 0.00 to 1.00 (Default: 0.00)
  brightness: number;      // -0.50 to 0.50 (Default: 0.00)
  shadowOpacity: number;   // 0.00 to 1.00 (Default: 0.30)
  shadowSpread: number;    // CSS px (Default: 10)
  shadowOffsetY: number;   // CSS px (Default: 1)
  floating: boolean;       // Enable drag (Default: false)
  button: boolean;         // Enable button hover/press (Default: false)
  bevelMode: number;       // 0: biconvex pill, 1: dome magnifier (Default: 0)
}
```

## Parameter Details

### Optical Simulation
- `refraction`: Normal vectors from the bevel shape distort the scene UV coordinates. Higher values cause dramatic lens warping.
- `chromAberration`: Offsets the Red, Green, and Blue texture samples proportionally to refraction strength, producing prismatic rainbow edges.
- `distortion`: Samples a procedural simplex noise texture inside the fragment shader to simulate handmade or rippling glass imperfections.

### Lighting & Material
- `fresnel`: Schlick's approximation for Fresnel reflectance. Grazing view angles reflect more ambient light.
- `specular`: Blinn-Phong specular formula using dynamic light sources. Produces crisp glints on rounded bevels.
- `edgeHighlight`: Emissive rim along the bevel curvature, giving a distinctive luminous outline.
- `tintStrength`: Shifts glass transmission towards a cool blue/cyan tint, characteristic of thick silicate glass.

### Physics & Interactivity
- `floating`: Attaches pointer event listeners (`pointerdown`, `pointermove`, `pointerup`) allowing users to drag the glass panel across the container while dynamically refracting elements in real-time.
- `button`: Adds `.liquid-glass-button` CSS class, listening for hover (slight lift) and active/press states (depression with altered focal refraction).
