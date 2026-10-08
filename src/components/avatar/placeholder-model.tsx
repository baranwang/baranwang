import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";

import {
	createBlinker,
	damp,
	type Gesture,
	gesturePose,
	markAvatarReady,
	useWindowPointer,
} from "./motion";

const COLORS = {
	skin: "#f2c9a8",
	hair: "#1c1a1a",
	hoodie: "#24376e",
	pants: "#2e2c2c",
	shoes: "#f5f5f4",
	eye: "#1c1a1a",
};

const HAIR_SPIKES: [number, number, number][] = [
	[0, 0.55, 0.05],
	[0.25, 0.48, 0.2],
	[-0.25, 0.48, 0.2],
	[0.38, 0.32, 0.05],
	[-0.38, 0.32, 0.05],
	[0.15, 0.42, 0.36],
	[-0.15, 0.42, 0.36],
	[0, 0.4, -0.3],
];

interface PlaceholderModelProps {
	gesture: React.RefObject<Gesture | null>;
}

/** Stand-in chibi avatar built from primitives until public/avatar.glb exists. */
export const PlaceholderModel = ({ gesture }: PlaceholderModelProps) => {
	const pointer = useWindowPointer();
	const blink = useMemo(createBlinker, []);
	const body = useRef<Group>(null);
	const head = useRef<Group>(null);
	const eyes = useRef<Group>(null);
	const rightArm = useRef<Group>(null);
	const lookX = useRef(0);

	useEffect(markAvatarReady, []);

	useFrame((state, delta) => {
		const t = state.clock.elapsedTime;
		const pose = gesturePose(t, gesture.current);
		if (body.current) {
			body.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012;
			body.current.position.y = Math.sin(t * 2.2) * 0.008 + pose.hop * 0.18;
		}
		if (head.current) {
			head.current.rotation.y = damp(
				head.current.rotation.y,
				pointer.current.x * 0.6,
				delta,
			);
			lookX.current = damp(lookX.current, -pointer.current.y * 0.3, delta);
			head.current.rotation.x = lookX.current + pose.nod * 0.25;
			head.current.rotation.z = pose.tilt * 0.3;
			head.current.position.y = 1.42 - pose.shrug * 0.05;
		}
		if (eyes.current) eyes.current.scale.y = Math.max(0.1, blink(t));
		if (rightArm.current) {
			rightArm.current.rotation.z = 0.25 + pose.raise * 2.2 + pose.swing * 0.35;
		}
	});

	return (
		<group ref={body}>
			<group ref={head} position={[0, 1.42, 0]}>
				<mesh castShadow>
					<sphereGeometry args={[0.52, 48, 48]} />
					<meshStandardMaterial color={COLORS.skin} roughness={0.7} />
				</mesh>
				{[-1, 1].map((side) => (
					<mesh key={side} position={[side * 0.5, -0.02, 0]}>
						<sphereGeometry args={[0.1, 24, 24]} />
						<meshStandardMaterial color={COLORS.skin} roughness={0.7} />
					</mesh>
				))}
				<mesh position={[0, 0.12, -0.03]} scale={[1.08, 0.92, 1.06]}>
					<sphereGeometry
						args={[0.54, 48, 48, 0, Math.PI * 2, 0, Math.PI * 0.55]}
					/>
					<meshStandardMaterial color={COLORS.hair} roughness={0.85} />
				</mesh>
				{HAIR_SPIKES.map((position) => (
					<mesh
						key={position.join()}
						position={position}
						rotation={[position[2] * 1.4, 0, -position[0] * 1.6]}
					>
						<coneGeometry args={[0.16, 0.34, 16]} />
						<meshStandardMaterial color={COLORS.hair} roughness={0.85} />
					</mesh>
				))}
				<group ref={eyes} position={[0, -0.02, 0.47]}>
					{[-1, 1].map((side) => (
						<mesh
							key={side}
							position={[side * 0.17, 0, 0]}
							scale={[1, 1.25, 0.6]}
						>
							<sphereGeometry args={[0.055, 24, 24]} />
							<meshStandardMaterial color={COLORS.eye} roughness={0.3} />
						</mesh>
					))}
				</group>
			</group>

			<mesh position={[0, 0.78, 0]} castShadow>
				<capsuleGeometry args={[0.34, 0.32, 8, 24]} />
				<meshStandardMaterial color={COLORS.hoodie} roughness={0.9} />
			</mesh>
			<mesh position={[0, 1.02, -0.22]} scale={[1, 0.6, 0.7]}>
				<sphereGeometry args={[0.3, 24, 24]} />
				<meshStandardMaterial color={COLORS.hoodie} roughness={0.9} />
			</mesh>

			<group position={[-0.4, 0.98, 0]} rotation={[0, 0, -0.25]}>
				<mesh position={[0, -0.22, 0]}>
					<capsuleGeometry args={[0.1, 0.3, 8, 16]} />
					<meshStandardMaterial color={COLORS.hoodie} roughness={0.9} />
				</mesh>
				<mesh position={[0, -0.46, 0]}>
					<sphereGeometry args={[0.08, 16, 16]} />
					<meshStandardMaterial color={COLORS.skin} roughness={0.7} />
				</mesh>
			</group>
			<group ref={rightArm} position={[0.4, 0.98, 0]}>
				<mesh position={[0, -0.22, 0]}>
					<capsuleGeometry args={[0.1, 0.3, 8, 16]} />
					<meshStandardMaterial color={COLORS.hoodie} roughness={0.9} />
				</mesh>
				<mesh position={[0, -0.46, 0]}>
					<sphereGeometry args={[0.08, 16, 16]} />
					<meshStandardMaterial color={COLORS.skin} roughness={0.7} />
				</mesh>
			</group>

			{[-1, 1].map((side) => (
				<group key={side} position={[side * 0.15, 0, 0]}>
					<mesh position={[0, 0.3, 0]}>
						<cylinderGeometry args={[0.12, 0.12, 0.36, 16]} />
						<meshStandardMaterial color={COLORS.pants} roughness={0.9} />
					</mesh>
					<RoundedBox
						args={[0.22, 0.12, 0.34]}
						radius={0.05}
						position={[0, 0.06, 0.05]}
					>
						<meshStandardMaterial color={COLORS.shoes} roughness={0.6} />
					</RoundedBox>
				</group>
			))}
		</group>
	);
};
