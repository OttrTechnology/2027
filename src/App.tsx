import { Moon, Sun } from "lucide-react"
import { useMemo, useState } from "react"

import { FluidGlassControls } from "@/components/fluid-glass-controls"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import FluidGlass from "@/components/ui/fluid-glass"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { DEFAULT_FLUID_GLASS_SETTINGS } from "@/lib/fluid-glass-settings"

export function App() {
  const { resolvedTheme, setTheme } = useTheme()
  const [settings, setSettings] = useState(DEFAULT_FLUID_GLASS_SETTINGS)
  const applied = useDebouncedValue(
    {
      scale: settings.scale,
      ior: settings.ior,
      thickness: settings.thickness,
      chromaticAberration: settings.chromaticAberration,
      anisotropy: settings.anisotropy,
    },
    150
  )
  const isDark = resolvedTheme === "dark"
  const logoSrc = useMemo(
    () => (isDark ? "/logo-dark-mode.png" : "/logo-light-mode.png"),
    [isDark]
  )
  const backgroundColor = isDark ? "#0a0a0a" : "#ffffff"

  const modeProps = {
    scale: applied.scale,
    ior: applied.ior,
    thickness: applied.thickness,
    chromaticAberration: applied.chromaticAberration,
    anisotropy: applied.anisotropy,
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-background text-foreground">
      <FluidGlass
        className="absolute inset-0 h-svh w-full"
        mode={settings.mode}
        imageUrl={logoSrc}
        backgroundColor={backgroundColor}
        lensProps={modeProps}
        cubeProps={modeProps}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <p className="pointer-events-none text-xs tracking-[0.2em] text-muted-foreground uppercase">
          Ottr
        </p>
        <Button
          variant="outline"
          size="icon"
          className="pointer-events-auto"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? <Sun /> : <Moon />}
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-end p-4">
        <div className="pointer-events-auto">
          <FluidGlassControls
            value={settings}
            onChange={setSettings}
            onReset={() => setSettings(DEFAULT_FLUID_GLASS_SETTINGS)}
          />
        </div>
      </div>
    </div>
  )
}

export default App
