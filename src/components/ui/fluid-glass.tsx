/* eslint-disable react/no-unknown-property */
import * as THREE from "three"
import {
  useRef,
  useState,
  useEffect,
  memo,
  Suspense,
  type ReactNode,
} from "react"
import {
  Canvas,
  createPortal,
  useFrame,
  useThree,
  type ThreeElements,
} from "@react-three/fiber"
import {
  useFBO,
  useGLTF,
  Image,
  Preload,
  MeshTransmissionMaterial,
} from "@react-three/drei"
import { easing } from "maath"

type Mode = "lens" | "cube"

type ModeProps = Record<string, unknown>

interface FluidGlassProps {
  mode?: Mode
  lensProps?: ModeProps
  cubeProps?: ModeProps
  backgroundColor?: string
  imageUrl?: string
  className?: string
}

export default function FluidGlass({
  mode = "lens",
  lensProps = {},
  cubeProps = {},
  backgroundColor = "#120F17",
  imageUrl = "/logo-dark-mode.png",
  className,
}: FluidGlassProps) {
  const Wrapper = mode === "cube" ? Cube : Lens
  const modeProps = mode === "cube" ? cubeProps : lensProps

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "100svh",
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 20], fov: 15 }}
        gl={{
          alpha: true,
          antialias: true,
          toneMapping: THREE.NoToneMapping,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 1.5]}
        style={{
          backgroundColor,
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      >
        <Suspense fallback={null}>
          <Wrapper modeProps={modeProps} backgroundColor={backgroundColor}>
            <CenteredLogo url={imageUrl} />
          </Wrapper>
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload("/assets/3d/lens.glb")
useGLTF.preload("/assets/3d/cube.glb")

type MeshProps = ThreeElements["mesh"]

interface ModeWrapperProps extends MeshProps {
  children?: ReactNode
  glb: string
  geometryKey: string
  lockToBottom?: boolean
  followPointer?: boolean
  modeProps?: ModeProps
  backgroundColor?: string
}

type ModeComponentProps = Omit<ModeWrapperProps, "glb" | "geometryKey">

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  backgroundColor = "#120F17",
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!)
  const { nodes } = useGLTF(glb)
  const buffer = useFBO({ samples: 0 })
  const { viewport: vp } = useThree()
  const [scene] = useState<THREE.Scene>(() => new THREE.Scene())
  const geoWidthRef = useRef<number>(1)

  useEffect(() => {
    const mesh = nodes[geometryKey] as THREE.Mesh | undefined
    const geo = mesh?.geometry
    if (!geo) return
    geo.computeBoundingBox()
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1
  }, [nodes, geometryKey])

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state
    const v = viewport.getCurrentViewport(camera, [0, 0, 15])

    if (ref.current) {
      const destX = followPointer ? (pointer.x * v.width) / 2 : 0
      const destY = lockToBottom
        ? -v.height / 2 + 0.2
        : followPointer
          ? (pointer.y * v.height) / 2
          : 0
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta)

      if ((modeProps as { scale?: number }).scale == null) {
        const maxWorld = v.width * 0.9
        const desired = maxWorld / geoWidthRef.current
        ref.current.scale.setScalar(Math.min(0.15, desired))
      }
    }

    gl.setClearColor(0x000000, 0)
    gl.setRenderTarget(buffer)
    gl.clear(true, true, true)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
  })

  const {
    scale,
    ior,
    thickness,
    anisotropy,
    chromaticAberration,
    ...extraMat
  } = modeProps as {
    scale?: number
    ior?: number
    thickness?: number
    anisotropy?: number
    chromaticAberration?: number
    [key: string]: unknown
  }

  const geometry = (nodes[geometryKey] as THREE.Mesh | undefined)?.geometry

  return (
    <>
      {createPortal(
        <>
          <color attach="background" args={[backgroundColor]} />
          <mesh position={[0, 0, -5]} scale={[vp.width * 2, vp.height * 2, 1]}>
            <planeGeometry />
            <meshBasicMaterial color={backgroundColor} toneMapped={false} />
          </mesh>
          {children}
        </>,
        scene
      )}
      <mesh scale={[vp.width, vp.height, 1]} position={[0, 0, -1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} toneMapped={false} />
      </mesh>
      {geometry ? (
        <mesh
          ref={ref}
          scale={scale ?? 0.15}
          rotation-x={Math.PI / 2}
          geometry={geometry}
          {...props}
        >
          <MeshTransmissionMaterial
            buffer={buffer.texture}
            ior={ior ?? 1.15}
            thickness={thickness ?? 5}
            anisotropy={anisotropy ?? 0.01}
            chromaticAberration={chromaticAberration ?? 0.1}
            transmission={1}
            roughness={0}
            {...(typeof extraMat === "object" && extraMat !== null
              ? extraMat
              : {})}
          />
        </mesh>
      ) : null}
    </>
  )
})

function Lens({ modeProps, ...p }: ModeComponentProps) {
  return (
    <ModeWrapper
      glb="/assets/3d/lens.glb"
      geometryKey="Cylinder"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  )
}

function Cube({ modeProps, ...p }: ModeComponentProps) {
  return (
    <ModeWrapper
      glb="/assets/3d/cube.glb"
      geometryKey="Cube"
      followPointer
      modeProps={modeProps}
      {...p}
    />
  )
}

function CenteredLogo({ url }: { url: string }) {
  const { height, width } = useThree((s) => s.viewport)
  const size = Math.min(width, height) * 0.72

  return (
    <Image
      key={url}
      position={[0, 0, 0]}
      scale={[size, size]}
      url={url}
      transparent
      toneMapped={false}
    />
  )
}
