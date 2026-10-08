import { ContactShadows, PresentationControls } from "@react-three/drei";
import { Canvas, type ThreeEvent } from "@react-three/fiber";
import {
	Component,
	type ReactNode,
	Suspense,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Clock, Group } from "three";

import avatarModelUrl from "@/assets/avatar.glb";
import { GlbModel } from "./glb-model";
import { HologramReveal } from "./hologram";
import {
	type Gesture,
	type GestureName,
	isGesturing,
	pickGesture,
} from "./motion";
import { PlaceholderModel } from "./placeholder-model";

export const AVATAR_MODEL_URL = avatarModelUrl;

const SHADOW_OPACITY = 0.35;

class FallbackOnError extends Component<
	{ fallback: ReactNode; children: ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };
	static getDerivedStateFromError() {
		return { failed: true };
	}
	render() {
		return this.state.failed ? this.props.fallback : this.props.children;
	}
}

/**
 * The dev server and most static hosts answer unknown paths with index.html,
 * so a missing model has to be detected by content type rather than status.
 */
const useModelAvailable = (url: string) => {
	const [available, setAvailable] = useState<boolean>();
	useEffect(() => {
		fetch(url, { method: "HEAD" })
			.then((response) => {
				const type = response.headers.get("content-type") ?? "";
				setAvailable(response.ok && !type.includes("text/html"));
			})
			.catch(() => setAvailable(false));
	}, [url]);
	return available;
};

const AvatarScene = () => {
	const gesture = useRef<Gesture | null>(null);
	const clock = useRef<Clock>(null);
	const shadow = useRef<Group>(null);
	const modelAvailable = useModelAvailable(AVATAR_MODEL_URL);
	const placeholder = <PlaceholderModel gesture={gesture} />;

	const play = (name?: GestureName) => {
		if (!clock.current) return;
		const now = clock.current.elapsedTime;
		if (isGesturing(now, gesture.current)) return;
		gesture.current = {
			name: name ?? pickGesture(gesture.current?.name),
			startedAt: now,
		};
	};

	const handleClick = (event: ThreeEvent<MouseEvent>) => {
		// Drag-to-rotate also ends in a click; only near-stationary taps count.
		if (event.delta > 6) return;
		event.stopPropagation();
		play();
	};

	return (
		<Canvas
			shadows="percentage"
			dpr={[1, 2]}
			// Framed so the feet sit just above the canvas bottom edge, which the
			// header aligns with its divider line.
			camera={{ position: [0, 1.12, 4.4], fov: 30 }}
			gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true }}
			onCreated={(state) => {
				state.camera.lookAt(0, 1.12, 0);
				clock.current = state.clock;
			}}
		>
			<ambientLight intensity={1.4} />
			<directionalLight position={[3, 5, 4]} intensity={2.2} castShadow />
			<directionalLight
				position={[-4, 2, -2]}
				intensity={0.8}
				color="#c7d2fe"
			/>

			<PresentationControls
				global
				cursor
				speed={1.4}
				polar={[-0.15, 0.2]}
				azimuth={[-Infinity, Infinity]}
			>
				{/* biome-ignore lint/a11y/noStaticElementInteractions: three.js group, not a DOM element */}
				<group onClick={handleClick}>
					<HologramReveal
						shadow={shadow}
						shadowOpacity={SHADOW_OPACITY}
						onRevealed={() => setTimeout(() => play("wave"), 300)}
					>
						{modelAvailable === false ? placeholder : null}
						{modelAvailable ? (
							<FallbackOnError fallback={placeholder}>
								<Suspense fallback={null}>
									<GlbModel url={AVATAR_MODEL_URL} gesture={gesture} />
								</Suspense>
							</FallbackOnError>
						) : null}
					</HologramReveal>
				</group>
			</PresentationControls>

			<ContactShadows
				ref={shadow}
				position={[0, 0, 0]}
				opacity={SHADOW_OPACITY}
				scale={4}
				blur={2.4}
				far={2}
			/>
		</Canvas>
	);
};

export default AvatarScene;
