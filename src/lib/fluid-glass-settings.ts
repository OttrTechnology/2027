export type FluidGlassMode = "lens" | "cube"

export const DEFAULT_FLUID_GLASS_SETTINGS = {
  mode: "lens" as FluidGlassMode,
  scale: 0.15,
  ior: 1.15,
  thickness: 5,
  chromaticAberration: 0.1,
  anisotropy: 0.01,
}

export type FluidGlassSettings = typeof DEFAULT_FLUID_GLASS_SETTINGS
