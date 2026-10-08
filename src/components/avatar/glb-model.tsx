import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
	type AnimationClip,
	Box3,
	Euler,
	type Group,
	LoopOnce,
	type Mesh,
	type Object3D,
	Quaternion,
	Vector3,
} from "three";

import {
	createBlinker,
	damp,
	GESTURE_DURATION,
	type Gesture,
	gesturePose,
	markAvatarReady,
	useWindowPointer,
} from "./motion";

const TARGET_HEIGHT = 2;
/** Max pupil shift in model units; the iris must stay inside the painted eye. */
const EYE_TRAVEL = { x: 0.0035, y: 0.002 };
const eyeOffset = new Vector3();
/** Twist that turns the raised palm toward the viewer instead of sideways. */
const PALM_TURN = Math.PI / 2;
/** Shrug: shoulder lift, forearm pitch forwards, forearm roll outwards. */
const SHRUG = { lift: 0.3, elbow: 1.1, flare: 0.3 };

const findByName = (root: Object3D, pattern: RegExp) => {
	let found: Object3D | undefined;
	root.traverse((child) => {
		if (!found && pattern.test(child.name)) found = child;
	});
	return found;
};

const findBlinkTargets = (root: Object3D) => {
	const targets: { mesh: Mesh; index: number }[] = [];
	root.traverse((child) => {
		const dictionary = (child as Mesh).morphTargetDictionary;
		if (!dictionary) return;
		for (const [name, index] of Object.entries(dictionary)) {
			if (/blink|eyes?_?close/i.test(name)) {
				targets.push({ mesh: child as Mesh, index });
			}
		}
	});
	return targets;
};

const isAnimatedBy = (bone: Object3D | undefined, clips: AnimationClip[]) =>
	!!bone &&
	clips.some((clip) =>
		clip.tracks.some((track) => track.name.startsWith(`${bone.name}.`)),
	);

const worldOffset = new Quaternion();
const parentWorld = new Quaternion();
const offsetEuler = new Euler(0, 0, 0, "YXZ");

/**
 * Rotates a bone by an offset expressed in world axes, so it behaves the same
 * whatever local axis convention the rigging tool used. Bones driven by a clip
 * get the offset on top of the clip pose; bones no clip touches would
 * accumulate it, so they are offset from their rest pose instead.
 */
const applyWorldOffset = (
	bone: Object3D,
	rest: Quaternion,
	animated: boolean,
	offset: { x?: number; y?: number; z?: number },
) => {
	if (!animated) bone.quaternion.copy(rest);
	worldOffset.setFromEuler(
		offsetEuler.set(offset.x ?? 0, offset.y ?? 0, offset.z ?? 0),
	);
	premultiplyWorld(bone, worldOffset);
};

/** local' = P⁻¹ · rotation · P · local, P being the parent's world rotation. */
const premultiplyWorld = (bone: Object3D, rotation: Quaternion) => {
	bone.parent?.getWorldQuaternion(parentWorld) ?? parentWorld.identity();
	bone.quaternion.premultiply(parentWorld).premultiply(rotation);
	bone.quaternion.premultiply(parentWorld.invert());
};

const twistAxis = new Vector3();
const childPosition = new Vector3();
const twist = new Quaternion();

/** Rolls a bone around its own length, i.e. the line towards `child`. */
const applyTwist = (bone: Object3D, child: Object3D, angle: number) => {
	bone.getWorldPosition(twistAxis);
	child.getWorldPosition(childPosition);
	twistAxis.subVectors(childPosition, twistAxis).normalize();
	premultiplyWorld(bone, twist.setFromAxisAngle(twistAxis, angle));
};

interface GlbModelProps {
	url: string;
	gesture: React.RefObject<Gesture | null>;
}

/**
 * Accepts whatever an image-to-3D tool exports: the model is normalized to a
 * fixed height, and rig features (head bone, idle / wave clips, blink morph
 * targets) are used only when the file provides them.
 */
export const GlbModel = ({ url, gesture }: GlbModelProps) => {
	const { scene, animations } = useGLTF(url);
	const root = useRef<Group>(null);
	const pointer = useWindowPointer();
	const blink = useMemo(createBlinker, []);
	const { actions } = useAnimations(animations, root);
	const look = useRef({ x: 0, y: 0 });
	const gaze = useRef({ x: 0, y: 0 });
	const lastWave = useRef(-1);

	const fit = useMemo(() => {
		const box = new Box3().setFromObject(scene);
		const size = box.getSize(new Vector3());
		const center = box.getCenter(new Vector3());
		const scale = TARGET_HEIGHT / (size.y || 1);
		const position: [number, number, number] = [
			-center.x * scale,
			-box.min.y * scale,
			-center.z * scale,
		];
		return { scale, position };
	}, [scene]);

	const rig = useMemo(() => {
		const bone = (pattern: RegExp) => {
			const object = findByName(scene, pattern);
			return object
				? {
						object,
						rest: object.quaternion.clone(),
						animated: isAnimatedBy(object, animations),
					}
				: undefined;
		};
		const eyes: Object3D[] = [];
		scene.traverse((child) => {
			if (/^eye_\d$/.test(child.name)) eyes.push(child);
		});
		// Eye positions live in the head's space; this maps a model-space (front
		// facing) offset into it.
		const eyeSpace = new Quaternion();
		if (eyes[0]?.parent) {
			scene.updateMatrixWorld(true);
			eyeSpace
				.copy(scene.getWorldQuaternion(new Quaternion()))
				.invert()
				.multiply(eyes[0].parent.getWorldQuaternion(new Quaternion()))
				.invert();
		}
		return {
			head: bone(/head/i),
			neck: bone(/neck/i),
			shoulder: bone(/right_?shoulder|clavicle_?r\b/i),
			leftShoulder: bone(/left_?shoulder|clavicle_?l\b/i),
			leftUpperArm: bone(/left_?(upper_?)?arm|upperarm_?l\b|arm_?l\b/i),
			leftForeArm: bone(/left_?(fore|lower)_?arm|(fore|lower)arm_?l\b/i),
			upperArm: bone(/right_?(upper_?)?arm|upperarm_?r\b|arm_?r\b/i),
			foreArm: bone(/right_?(fore|lower)_?arm|(fore|lower)arm_?r\b/i),
			hand: bone(/right_?hand$|hand_?r$/i),
			fingers: findByName(scene, /right_?hand_?middle_?1|middle_?01_?r/i),
			eyes: eyes.map((object) => ({
				object,
				rest: object.position.clone(),
			})),
			eyeSpace,
			blinkTargets: findBlinkTargets(scene),
		};
	}, [scene, animations]);

	const clips = useMemo(() => {
		const names = Object.keys(actions);
		const wave = names.find((name) => /wave|hello|greet/i.test(name));
		const idle =
			names.find((name) => /idle|breath/i.test(name)) ??
			names.find((name) => name !== wave);
		return { idle, wave };
	}, [actions]);

	useEffect(() => {
		if (clips.idle) actions[clips.idle]?.reset().fadeIn(0.3).play();
		markAvatarReady();
	}, [actions, clips.idle]);

	useFrame((state, delta) => {
		const t = state.clock.elapsedTime;
		const current = gesture.current;
		const pose = gesturePose(t, current);

		if (
			clips.wave &&
			current?.name === "wave" &&
			current.startedAt !== lastWave.current
		) {
			lastWave.current = current.startedAt;
			const action = actions[clips.wave];
			action?.reset().setLoop(LoopOnce, 1).fadeIn(0.2).play();
			setTimeout(() => action?.fadeOut(0.3), GESTURE_DURATION.wave * 1000);
		}

		look.current.y = damp(look.current.y, pointer.current.x * 0.6, delta);
		look.current.x = damp(look.current.x, -pointer.current.y * 0.3, delta);

		const {
			head,
			neck,
			shoulder,
			upperArm,
			foreArm,
			hand,
			fingers,
			leftShoulder,
			leftUpperArm,
			leftForeArm,
		} = rig;
		if (head) {
			// Split between neck and head so the turn bends rather than pivots.
			const neckShare = neck ? 0.4 : 0;
			if (neck) {
				applyWorldOffset(neck.object, neck.rest, neck.animated, {
					x: look.current.x * neckShare,
					y: look.current.y * neckShare,
				});
			}
			applyWorldOffset(head.object, head.rest, head.animated, {
				x:
					look.current.x * (1 - neckShare) +
					pose.nod * 0.22 +
					pose.shrug * 0.08,
				y: look.current.y * (1 - neckShare),
				z: pose.tilt * 0.28,
			});
		} else if (root.current) {
			root.current.rotation.y = look.current.y * 0.4;
		}

		if (!clips.wave && upperArm) {
			const { bend, raise, swing, shrug } = pose;
			// The figure faces +z, so its right arm hangs on the -x side: a
			// negative roll around z lifts it outwards, a negative pitch around x
			// brings it forwards. The upper arm stops near shoulder height, since
			// lifting it further folds the arm against the oversized head.
			if (shoulder) {
				applyWorldOffset(shoulder.object, shoulder.rest, shoulder.animated, {
					z: -raise * 0.18 - shrug * SHRUG.lift,
				});
			}
			applyWorldOffset(upperArm.object, upperArm.rest, upperArm.animated, {
				x: -raise * 0.35,
				// Undo the shoulder lift so the shrug raises the shoulder without
				// swinging the whole arm out.
				z: -raise * 0.75 + shrug * SHRUG.lift,
			});
			if (foreArm) {
				// An elbow only hinges forwards, so the sideways roll that points
				// the forearm up must follow the shoulder lift, not lead it.
				applyWorldOffset(foreArm.object, foreArm.rest, foreArm.animated, {
					x: -bend * 0.7 - shrug * SHRUG.elbow,
					z: -raise * 1.45 + swing * 0.3 - shrug * SHRUG.flare,
				});
			}
			// The hand hangs palm-in; turning it to face the viewer is split
			// between forearm and wrist so neither joint visibly wrings.
			const palmTurn = raise * PALM_TURN;
			if (foreArm && hand)
				applyTwist(foreArm.object, hand.object, palmTurn * 0.5);
			if (hand) {
				if (!hand.animated) hand.object.quaternion.copy(hand.rest);
				if (fingers) applyTwist(hand.object, fingers, palmTurn * 0.5);
			}
		}

		// Mirror of the right side: positive roll lifts the left arm.
		if (leftShoulder) {
			applyWorldOffset(
				leftShoulder.object,
				leftShoulder.rest,
				leftShoulder.animated,
				{ z: pose.shrug * SHRUG.lift },
			);
		}
		if (leftUpperArm) {
			applyWorldOffset(
				leftUpperArm.object,
				leftUpperArm.rest,
				leftUpperArm.animated,
				{ z: -pose.shrug * SHRUG.lift },
			);
		}
		if (leftForeArm) {
			applyWorldOffset(
				leftForeArm.object,
				leftForeArm.rest,
				leftForeArm.animated,
				{ x: -pose.shrug * SHRUG.elbow, z: pose.shrug * SHRUG.flare },
			);
		}

		if (root.current)
			root.current.position.y = fit.position[1] + pose.hop * 0.14;

		if (!clips.idle && root.current) {
			root.current.scale.setScalar(fit.scale * (1 + Math.sin(t * 2.2) * 0.008));
		}

		// The eyes lead the head: they react to the raw pointer, the head lags.
		gaze.current.x = damp(gaze.current.x, pointer.current.x, delta * 2);
		gaze.current.y = damp(gaze.current.y, pointer.current.y, delta * 2);
		eyeOffset
			.set(gaze.current.x * EYE_TRAVEL.x, gaze.current.y * EYE_TRAVEL.y, 0)
			.applyQuaternion(rig.eyeSpace);
		for (const eye of rig.eyes) {
			eye.object.position.copy(eye.rest).add(eyeOffset);
		}

		// Iris-only eye meshes cannot blink (squashing them exposes the painted
		// sclera), so blinking is limited to models with blink morph targets.
		const open = blink(t);
		for (const { mesh, index } of rig.blinkTargets) {
			if (mesh.morphTargetInfluences) {
				mesh.morphTargetInfluences[index] = 1 - open;
			}
		}
	});

	return (
		<group ref={root} scale={fit.scale} position={fit.position}>
			<primitive object={scene} />
		</group>
	);
};
