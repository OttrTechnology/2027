import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  type FluidGlassMode,
  type FluidGlassSettings,
} from "@/lib/fluid-glass-settings"
import { cn } from "@/lib/utils"

type FluidGlassControlsProps = {
  value: FluidGlassSettings
  onChange: (next: FluidGlassSettings) => void
  onReset: () => void
}

const MODES: FluidGlassMode[] = ["lens", "cube"]

function NumberSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  format = (n) => n.toString(),
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (value: number) => string
  onChange: (value: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
          {label}
        </Label>
        <span className="font-mono text-[11px] tabular-nums">
          {format(value)}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(next) => {
          const parsed = Array.isArray(next) ? next[0] : next
          if (typeof parsed === "number") onChange(parsed)
        }}
      />
    </div>
  )
}

export function FluidGlassControls({
  value,
  onChange,
  onReset,
}: FluidGlassControlsProps) {
  const patch = (partial: Partial<FluidGlassSettings>) =>
    onChange({ ...value, ...partial })

  return (
    <Card
      size="sm"
      className="max-h-[min(70svh,560px)] w-[min(calc(100vw-1.5rem),280px)] overflow-y-auto bg-card/85 backdrop-blur-md"
    >
      <CardHeader className="border-b">
        <CardTitle>Glass</CardTitle>
        <CardAction>
          <Button variant="ghost" size="xs" onClick={onReset}>
            <RotateCcw />
            Reset
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 py-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-normal text-muted-foreground">
            Mode
          </Label>
          <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
            {MODES.map((mode) => (
              <Button
                key={mode}
                type="button"
                variant="ghost"
                size="xs"
                className={cn(
                  "flex-1 capitalize",
                  value.mode === mode &&
                    "bg-background text-foreground shadow-sm hover:bg-background"
                )}
                onClick={() => patch({ mode })}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        <NumberSlider
          id="scale"
          label="Scale"
          value={value.scale}
          min={0.08}
          max={0.5}
          step={0.01}
          format={(n) => n.toFixed(2)}
          onChange={(scale) => patch({ scale })}
        />
        <NumberSlider
          id="thickness"
          label="Thickness"
          value={value.thickness}
          min={1}
          max={20}
          step={0.5}
          format={(n) => n.toFixed(1)}
          onChange={(thickness) => patch({ thickness })}
        />
        <NumberSlider
          id="ior"
          label="IOR"
          value={value.ior}
          min={1}
          max={2}
          step={0.01}
          format={(n) => n.toFixed(2)}
          onChange={(ior) => patch({ ior })}
        />
        <NumberSlider
          id="chromaticAberration"
          label="Chromatic aberration"
          value={value.chromaticAberration}
          min={0}
          max={1}
          step={0.01}
          format={(n) => n.toFixed(2)}
          onChange={(chromaticAberration) => patch({ chromaticAberration })}
        />
        <NumberSlider
          id="anisotropy"
          label="Anisotropy"
          value={value.anisotropy}
          min={0}
          max={0.1}
          step={0.001}
          format={(n) => n.toFixed(3)}
          onChange={(anisotropy) => patch({ anisotropy })}
        />
      </CardContent>
    </Card>
  )
}
