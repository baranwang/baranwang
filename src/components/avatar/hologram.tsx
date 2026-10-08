import { useFrame, useThree } from "@react-three/fiber";
import {
	type ReactNode,
	type RefObject,
	useEffect,
	useMemo,
	useRef,
} from "react";
import {
	Box3,
	BufferAttribute,
	BufferGeometry,
	Color,
	type Group,
	Layers,
	type LineSegments,
	type Material,
	type Mesh,
	type MeshBasicMaterial,
	type Object3D,
	type Points,
	ShaderMaterial,
	type SkinnedMesh,
	Vector3,
	type WebGLProgramParametersWithUniforms,
	type WebGLRenderer,
} from "three";

/** `--color-accent` (oklch 0.5 0.17 262) and a light tint of it. */
const ACCENT = "#285dc2";
const ACCENT_LIGHT = "#a9c1f2";
const STONE = "#a8a29e";

const PARTICLE_COUNT = 1500;
/** Every n-th particle draws a light trail while it flies. */
const TRAIL_EVERY = 3;
const TRAIL_COUNT = Math.ceil(PARTICLE_COUNT / TRAIL_EVERY);

// Particles leave in bottom-to-top order, so the surface they land on is
// revealed upwards at the same pace.
const LAUNCH_DELAY = 0.1;
const LAUNCH_SPREAD = 1.3;
const LAUNCH_JITTER = 0.2;
const FLIGHT_DURATION = 0.75;
const LINGER_DURATION = 0.35;
const SETTLE_DURATION = 0.6;
const SCAN_START = LAUNCH_DELAY + FLIGHT_DURATION;
const SCAN_DURATION = LAUNCH_SPREAD + LAUNCH_JITTER;
const TOTAL_DURATION = SCAN_START + SCAN_DURATION + SETTLE_DURATION;

// ContactShadows renders the scene with its own default-layer camera, so
// particles and trails on another layer cast no shadow blob under the feet.
const EFFECT_CHANNEL = 1;
const EFFECT_LAYER = new Layers();
EFFECT_LAYER.set(EFFECT_CHANNEL);

/**
 * The loading cloud is shaped from ellipsoids traced off the avatar's
 * turnaround sheet (model height 2, feet at 0, facing +z), so the particles
 * already read as the figure before the real surface is known.
 */
const CLOUD_PARTS: { center: Vector3; radius: Vector3 }[] = [
	{ center: new Vector3(0, 1.53, 0), radius: new Vector3(0.44, 0.47, 0.42) },
	{ center: new Vector3(0, 0.81, 0), radius: new Vector3(0.34, 0.31, 0.28) },
	...[-1, 1].flatMap((side) => [
		{
			center: new Vector3(side * 0.43, 0.71, 0),
			radius: new Vector3(0.11, 0.28, 0.12),
		},
		{
			center: new Vector3(side * 0.19, 0.35, 0),
			radius: new Vector3(0.13, 0.17, 0.13),
		},
		{
			center: new Vector3(side * 0.2, 0.1, 0.05),
			radius: new Vector3(0.17, 0.1, 0.2),
		},
	]),
];
/** Rough surface areas, so every part gets a similar particle density. */
const CLOUD_WEIGHTS = CLOUD_PARTS.map(
	({ radius: r }) => r.x * r.y + r.y * r.z + r.x * r.z,
);
const CLOUD_TOTAL_WEIGHT = CLOUD_WEIGHTS.reduce((sum, w) => sum + w, 0);
/** Neighbouring particles in height order swap targets only among themselves. */
const PAIRING_CHUNK = 48;

// One avatar per page, and useGLTF caches materials across remounts, so the
// uniforms live at module level and every patched material shares them.
const uniforms = {
	uHoloScanY: { value: -1e6 },
	uHoloMix: { value: 0 },
	uHoloBand: { value: 0 },
	uHoloColor: { value: new Color(ACCENT) },
	uHoloLight: { value: new Color(ACCENT_LIGHT) },
};

const patched = new WeakSet<Material>();

const VERTEX_DECLARATIONS = /* glsl */ `
varying vec3 vHoloWorld;
varying vec3 vHoloView;
`;

const FRAGMENT_DECLARATIONS = /* glsl */ `
uniform float uHoloScanY;
uniform float uHoloMix;
uniform float uHoloBand;
uniform vec3 uHoloColor;
uniform vec3 uHoloLight;
${VERTEX_DECLARATIONS}
float holoHash(vec3 p) {
	return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}
`;

// Cells just above the scan line survive at random, so the edge dissolves
// into specks instead of being cut straight.
const FRAGMENT_CLIP = /* glsl */ `
float holoEdge = uHoloScanY - vHoloWorld.y;
float holoNoise = holoHash(floor(vHoloWorld * 70.0));
if (holoEdge + holoNoise * 0.12 * uHoloBand < 0.0) discard;
`;

// Normals come from screen-space derivatives so unlit materials, which have
// no normal varying, get the same rim light as lit ones.
const FRAGMENT_COLOR = /* glsl */ `
vec3 holoNormal = normalize(cross(dFdx(vHoloView), dFdy(vHoloView)));
float holoFresnel = pow(1.0 - abs(dot(holoNormal, normalize(-vHoloView))), 2.5);
float holoLineCoord = vHoloWorld.y * 60.0;
float holoLine = 1.0 - smoothstep(0.0, fwidth(holoLineCoord) * 1.2, abs(fract(holoLineCoord + 0.5) - 0.5));
float holoGlow = exp(-max(holoEdge, 0.0) / 0.18) * uHoloBand;
vec3 holoColor = mix(gl_FragColor.rgb, mix(gl_FragColor.rgb, uHoloColor, 0.3), uHoloMix);
holoColor = mix(holoColor, uHoloColor, clamp(holoFresnel * 0.7 + holoLine * 0.25, 0.0, 1.0) * uHoloMix);
holoColor = mix(holoColor, uHoloLight, holoEdge < 0.0 ? 1.0 : holoGlow * 0.85);
gl_FragColor.rgb = holoColor;
`;

const patchMaterial = (material: Material) => {
	if (patched.has(material)) return;
	patched.add(material);

	const previous = material.onBeforeCompile;
	material.onBeforeCompile = (
		shader: WebGLProgramParametersWithUniforms,
		renderer: WebGLRenderer,
	) => {
		previous.call(material, shader, renderer);
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = shader.vertexShader
			.replace("#include <common>", `#include <common>\n${VERTEX_DECLARATIONS}`)
			.replace(
				"#include <project_vertex>",
				`#include <project_vertex>
vHoloWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
vHoloView = mvPosition.xyz;`,
			);
		shader.fragmentShader = shader.fragmentShader
			.replace(
				"#include <common>",
				`#include <common>\n${FRAGMENT_DECLARATIONS}`,
			)
			.replace(
				"#include <clipping_planes_fragment>",
				`#include <clipping_planes_fragment>\n${FRAGMENT_CLIP}`,
			)
			.replace(
				"#include <tonemapping_fragment>",
				`${FRAGMENT_COLOR}\n#include <tonemapping_fragment>`,
			);
	};

	const cacheKey = material.customProgramCacheKey.bind(material);
	material.customProgramCacheKey = () => `${cacheKey()}|hologram`;
	material.needsUpdate = true;
};

const collectMeshes = (root: Object3D) => {
	const meshes: Mesh[] = [];
	root.traverse((object) => {
		if ((object as Mesh).isMesh) meshes.push(object as Mesh);
	});
	return meshes;
};

const patchMeshes = (meshes: Mesh[]) => {
	for (const mesh of meshes) {
		const materials = Array.isArray(mesh.material)
			? mesh.material
			: [mesh.material];
		for (const material of materials) patchMaterial(material);
	}
};

/** Random vertices of the current pose, in `space`'s local coordinates. */
const sampleSurface = (meshes: Mesh[], space: Object3D, count: number) => {
	const weights = meshes.map(
		(mesh) => mesh.geometry.getAttribute("position")?.count ?? 0,
	);
	const total = weights.reduce((sum, weight) => sum + weight, 0);
	const points = new Float32Array(count * 3);
	if (!total) return points;

	for (const mesh of meshes) {
		// Bone matrices are only refreshed at render time, and the first
		// frame of a fresh model has not been rendered yet.
		(mesh as SkinnedMesh).skeleton?.update();
	}
	const point = new Vector3();
	for (let i = 0; i < count; i++) {
		let pick = Math.random() * total;
		let index = 0;
		while (pick >= weights[index]) pick -= weights[index++];
		const mesh = meshes[index];
		mesh.getVertexPosition(Math.floor(pick), point);
		space.worldToLocal(point.applyMatrix4(mesh.matrixWorld));
		point.toArray(points, i * 3);
	}
	return points;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const ease = (value: number) => value * value * (3 - 2 * value);

const skipReveal = () =>
	window.matchMedia("print").matches ||
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const PARTICLE_VERTEX = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
attribute float aTone;
uniform float uPixelRatio;
varying float vAlpha;
varying float vTone;
void main() {
	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = aSize * uPixelRatio * (4.4 / -mvPosition.z);
	vAlpha = aAlpha;
	vTone = aTone;
}
`;

const PARTICLE_FRAGMENT = /* glsl */ `
uniform vec3 uAccent;
uniform vec3 uStone;
varying float vAlpha;
varying float vTone;
void main() {
	float alpha = smoothstep(0.5, 0.2, length(gl_PointCoord - 0.5)) * vAlpha;
	if (alpha < 0.01) discard;
	gl_FragColor = vec4(mix(uStone, uAccent, vTone), alpha);
	#include <colorspace_fragment>
}
`;

const createSwarm = () => {
	const cloud = new Float32Array(PARTICLE_COUNT * 3);
	const phase = new Float32Array(PARTICLE_COUNT);
	const size = new Float32Array(PARTICLE_COUNT);
	const tone = new Float32Array(PARTICLE_COUNT);
	const point = new Vector3();
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		let pick = Math.random() * CLOUD_TOTAL_WEIGHT;
		let part = 0;
		while (part < CLOUD_PARTS.length - 1 && pick >= CLOUD_WEIGHTS[part]) {
			pick -= CLOUD_WEIGHTS[part++];
		}
		// A loose shell around each part: dense enough to show the outline,
		// fuzzy enough to still read as particles.
		do {
			point.set(Math.random(), Math.random(), Math.random()).multiplyScalar(2);
			point.subScalar(1);
		} while (point.lengthSq() > 1 || point.lengthSq() < 1e-4);
		point.setLength(0.8 + Math.random() * 0.3);
		point.multiply(CLOUD_PARTS[part].radius).add(CLOUD_PARTS[part].center);
		point.toArray(cloud, i * 3);
		phase[i] = Math.random() * Math.PI * 2;
		size[i] = 1.6 + Math.random() * 2.4;
		tone[i] = Math.random() < 0.7 ? 1 : 0;
	}

	const particles = new BufferGeometry();
	particles.setAttribute("position", new BufferAttribute(cloud.slice(), 3));
	particles.setAttribute("aSize", new BufferAttribute(size.slice(), 1));
	particles.setAttribute(
		"aAlpha",
		new BufferAttribute(new Float32Array(PARTICLE_COUNT), 1),
	);
	particles.setAttribute("aTone", new BufferAttribute(tone, 1));

	const trails = new BufferGeometry();
	trails.setAttribute(
		"position",
		new BufferAttribute(new Float32Array(TRAIL_COUNT * 6), 3),
	);
	trails.setAttribute(
		"color",
		new BufferAttribute(new Float32Array(TRAIL_COUNT * 8), 4),
	);

	return {
		cloud,
		phase,
		size,
		particles,
		trails,
		start: new Float32Array(PARTICLE_COUNT * 3),
		target: new Float32Array(PARTICLE_COUNT * 3),
		delay: new Float32Array(PARTICLE_COUNT),
	};
};

type Swarm = ReturnType<typeof createSwarm>;

/** Gently drifting cloud shown while the model loads. */
const cloudPosition = (swarm: Swarm, i: number, t: number, out: Vector3) => {
	const p = swarm.phase[i];
	return out.set(
		swarm.cloud[i * 3] + Math.sin(t * 0.9 + p) * 0.02,
		swarm.cloud[i * 3 + 1] + Math.sin(t * 0.7 + p * 1.7) * 0.025,
		swarm.cloud[i * 3 + 2] + Math.cos(t * 0.8 + p) * 0.02,
	);
};

/**
 * Pairs cloud and surface by height rank, then by angle around the vertical
 * axis within small height bands, so each particle lands near where it was.
 */
const pairingOrder = (positions: Float32Array) => {
	const indices = Array.from({ length: PARTICLE_COUNT }, (_, i) => i).sort(
		(a, b) => positions[a * 3 + 1] - positions[b * 3 + 1],
	);
	const angle = (i: number) =>
		Math.atan2(positions[i * 3], positions[i * 3 + 2]);
	for (let from = 0; from < PARTICLE_COUNT; from += PAIRING_CHUNK) {
		const chunk = indices
			.slice(from, from + PAIRING_CHUNK)
			.sort((a, b) => angle(a) - angle(b));
		indices.splice(from, chunk.length, ...chunk);
	}
	return indices;
};

const assignTargets = (swarm: Swarm, surface: Float32Array, t: number) => {
	const point = new Vector3();
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		cloudPosition(swarm, i, t, point).toArray(swarm.start, i * 3);
	}
	const fromCloud = pairingOrder(swarm.start);
	const fromSurface = pairingOrder(surface);

	let minY = Number.POSITIVE_INFINITY;
	let maxY = Number.NEGATIVE_INFINITY;
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		minY = Math.min(minY, surface[i * 3 + 1]);
		maxY = Math.max(maxY, surface[i * 3 + 1]);
	}
	for (let k = 0; k < PARTICLE_COUNT; k++) {
		const particle = fromCloud[k];
		const sample = fromSurface[k];
		for (let axis = 0; axis < 3; axis++) {
			swarm.target[particle * 3 + axis] = surface[sample * 3 + axis];
		}
		const height = (surface[sample * 3 + 1] - minY) / (maxY - minY || 1);
		swarm.delay[particle] =
			LAUNCH_DELAY + height * LAUNCH_SPREAD + Math.random() * LAUNCH_JITTER;
	}
};

/** Position along the flight, bowing outwards so paths curve in. */
const flightPosition = (
	swarm: Swarm,
	i: number,
	progress: number,
	out: Vector3,
) => {
	const e = ease(clamp01(progress));
	const sx = swarm.start[i * 3];
	const sz = swarm.start[i * 3 + 2];
	const bow = Math.sin(Math.PI * e) * 0.06;
	const length = Math.hypot(sx, sz) || 1;
	return out.set(
		sx + (swarm.target[i * 3] - sx) * e + (sx / length) * bow,
		swarm.start[i * 3 + 1] +
			(swarm.target[i * 3 + 1] - swarm.start[i * 3 + 1]) * e +
			bow * 0.3,
		sz + (swarm.target[i * 3 + 2] - sz) * e + (sz / length) * bow,
	);
};

interface HologramRevealProps {
	children: ReactNode;
	/** ContactShadows ignores per-material discards, so it is faded in here. */
	shadow?: RefObject<Group | null>;
	shadowOpacity?: number;
	onRevealed?: () => void;
}

/**
 * While the children load, a cloud of particles drifts in their place. Once
 * the first mesh mounts, the particles fly onto its surface from the feet up
 * with light trails, and the model materializes behind them through a soft,
 * dissolving edge before settling into its regular materials.
 */
export const HologramReveal = ({
	children,
	shadow,
	shadowOpacity = 1,
	onRevealed,
}: HologramRevealProps) => {
	const root = useRef<Group>(null);
	const content = useRef<Group>(null);
	const points = useRef<Points>(null);
	const lines = useRef<LineSegments>(null);
	const pixelRatio = useThree((state) => state.viewport.dpr);
	const camera = useThree((state) => state.camera);
	useEffect(() => {
		camera.layers.enable(EFFECT_CHANNEL);
		return () => camera.layers.disable(EFFECT_CHANNEL);
	}, [camera]);
	const swarm = useMemo(createSwarm, []);
	const particleMaterial = useMemo(
		() =>
			new ShaderMaterial({
				vertexShader: PARTICLE_VERTEX,
				fragmentShader: PARTICLE_FRAGMENT,
				uniforms: {
					uPixelRatio: { value: 1 },
					uAccent: { value: new Color(ACCENT) },
					uStone: { value: new Color(STONE) },
				},
				transparent: true,
				depthWrite: false,
			}),
		[],
	);
	const state = useRef<{
		createdAt: number | null;
		startedAt: number | null;
		done: boolean;
		minY: number;
		maxY: number;
	}>({ createdAt: null, startedAt: null, done: false, minY: 0, maxY: 2 });

	const setShadowOpacity = (opacity: number) => {
		const mesh = shadow?.current?.children[0] as Mesh | undefined;
		if (mesh) (mesh.material as MeshBasicMaterial).opacity = opacity;
	};

	const finish = () => {
		state.current.done = true;
		uniforms.uHoloScanY.value = 1e6;
		uniforms.uHoloMix.value = 0;
		uniforms.uHoloBand.value = 0;
		if (points.current) points.current.visible = false;
		if (lines.current) lines.current.visible = false;
		setShadowOpacity(shadowOpacity);
		onRevealed?.();
	};

	const point = useMemo(() => new Vector3(), []);
	const previous = useMemo(() => new Vector3(), []);

	useFrame(({ clock }) => {
		const reveal = state.current;
		if (reveal.done || !content.current || !root.current) return;
		const now = clock.elapsedTime;
		if (reveal.createdAt === null) {
			reveal.createdAt = now;
			uniforms.uHoloScanY.value = -1e6;
			uniforms.uHoloMix.value = 0;
			uniforms.uHoloBand.value = 0;
		}
		particleMaterial.uniforms.uPixelRatio.value = pixelRatio;

		const meshes = collectMeshes(content.current);
		patchMeshes(meshes);

		if (reveal.startedAt === null) {
			if (skipReveal()) {
				if (points.current) points.current.visible = false;
				if (meshes.length) finish();
				return;
			}
			if (!meshes.length) {
				setShadowOpacity(0);
				const fadeIn = ease(clamp01((now - reveal.createdAt) / 0.6));
				const position = swarm.particles.getAttribute("position");
				const alpha = swarm.particles.getAttribute("aAlpha");
				for (let i = 0; i < PARTICLE_COUNT; i++) {
					cloudPosition(swarm, i, now, point).toArray(position.array, i * 3);
					alpha.array[i] =
						fadeIn * (0.35 + 0.25 * Math.sin(now * 1.3 + swarm.phase[i]));
				}
				position.needsUpdate = true;
				alpha.needsUpdate = true;
				return;
			}

			content.current.updateWorldMatrix(true, true);
			const box = new Box3().setFromObject(content.current);
			reveal.minY = box.min.y;
			reveal.maxY = box.max.y;
			assignTargets(
				swarm,
				sampleSurface(meshes, root.current, PARTICLE_COUNT),
				now,
			);
			reveal.startedAt = now;
			uniforms.uHoloMix.value = 1;
			uniforms.uHoloBand.value = 1;
		}

		const elapsed = now - reveal.startedAt;
		if (elapsed >= TOTAL_DURATION) {
			finish();
			return;
		}

		const scan = clamp01((elapsed - SCAN_START) / SCAN_DURATION);
		const settle = clamp01(
			(elapsed - SCAN_START - SCAN_DURATION) / SETTLE_DURATION,
		);
		uniforms.uHoloScanY.value =
			reveal.minY - 0.05 + (reveal.maxY - reveal.minY + 0.1) * scan;
		uniforms.uHoloMix.value = 1 - ease(settle);
		uniforms.uHoloBand.value = 1 - settle;
		setShadowOpacity(shadowOpacity * scan);

		const position = swarm.particles.getAttribute("position");
		const alpha = swarm.particles.getAttribute("aAlpha");
		const size = swarm.particles.getAttribute("aSize");
		const trailPosition = swarm.trails.getAttribute("position");
		const trailColor = swarm.trails.getAttribute("color");
		const accent = uniforms.uHoloColor.value;
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			const flight = (elapsed - swarm.delay[i]) / FLIGHT_DURATION;
			const landed = clamp01(
				(elapsed - swarm.delay[i] - FLIGHT_DURATION) / LINGER_DURATION,
			);
			flightPosition(swarm, i, flight, point).toArray(position.array, i * 3);
			alpha.array[i] = (flight < 0 ? 0.45 : 0.85) * (1 - landed);
			size.array[i] = swarm.size[i] * (1 - landed * 0.6);

			if (i % TRAIL_EVERY) continue;
			const trail = i / TRAIL_EVERY;
			const flying = flight > 0 && flight < 1;
			flightPosition(swarm, i, flight - 0.18, previous);
			point.toArray(trailPosition.array, trail * 6);
			(flying ? previous : point).toArray(trailPosition.array, trail * 6 + 3);
			const strength = flying ? Math.sin(Math.PI * flight) * 0.5 : 0;
			for (let end = 0; end < 2; end++) {
				const offset = trail * 8 + end * 4;
				trailColor.array[offset] = accent.r;
				trailColor.array[offset + 1] = accent.g;
				trailColor.array[offset + 2] = accent.b;
				trailColor.array[offset + 3] = end === 0 ? strength : 0;
			}
		}
		position.needsUpdate = true;
		alpha.needsUpdate = true;
		size.needsUpdate = true;
		trailPosition.needsUpdate = true;
		trailColor.needsUpdate = true;
	});

	return (
		<group ref={root}>
			<group ref={content}>{children}</group>
			<points
				ref={points}
				geometry={swarm.particles}
				material={particleMaterial}
				frustumCulled={false}
				raycast={() => null}
				layers={EFFECT_LAYER}
			/>
			<lineSegments
				ref={lines}
				geometry={swarm.trails}
				frustumCulled={false}
				raycast={() => null}
				layers={EFFECT_LAYER}
			>
				<lineBasicMaterial vertexColors transparent depthWrite={false} />
			</lineSegments>
		</group>
	);
};
