import { useEffect, useRef } from "react";

/** Pointer position over the whole window, normalized to -1..1 (y up). */
export const useWindowPointer = () => {
	const pointer = useRef({ x: 0, y: 0 });
	useEffect(() => {
		const onMove = (event: PointerEvent) => {
			pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
			pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
		};
		window.addEventListener("pointermove", onMove);
		return () => window.removeEventListener("pointermove", onMove);
	}, []);
	return pointer;
};

export const damp = (current: number, target: number, delta: number) =>
	current + (target - current) * Math.min(1, delta * 6);

const BLINK_DURATION = 0.14;

/** Returns 1 for open eyes, dipping towards 0 during a blink. */
export const createBlinker = () => {
	let next = 2 + Math.random() * 3;
	return (elapsed: number) => {
		if (elapsed > next + BLINK_DURATION) {
			next = elapsed + 2.5 + Math.random() * 3.5;
		}
		const t = elapsed - next;
		if (t < 0 || t > BLINK_DURATION) return 1;
		return Math.abs(Math.cos((t / BLINK_DURATION) * Math.PI));
	};
};

export const GESTURE_DURATION = {
	wave: 1.6,
	nod: 1.1,
	tilt: 1.5,
	shrug: 1.3,
	hop: 0.9,
};

export type GestureName = keyof typeof GESTURE_DURATION;

export interface Gesture {
	name: GestureName;
	startedAt: number;
}

const GESTURES = Object.keys(GESTURE_DURATION) as GestureName[];

/** A random gesture other than `previous`, so taps never repeat back to back. */
export const pickGesture = (previous?: GestureName) => {
	const options = GESTURES.filter((name) => name !== previous);
	return options[Math.floor(Math.random() * options.length)];
};

export const isGesturing = (elapsed: number, gesture: Gesture | null) =>
	!!gesture && elapsed - gesture.startedAt < GESTURE_DURATION[gesture.name];

const smoothstep = (from: number, to: number, value: number) => {
	const x = Math.min(1, Math.max(0, (value - from) / (to - from)));
	return x * x * (3 - 2 * x);
};

/** Eases in over the first `edge` of progress and out over the last. */
const hold = (progress: number, edge: number) =>
	smoothstep(0, edge, progress) * (1 - smoothstep(1 - edge, 1, progress));

const REST_POSE = {
	bend: 0,
	raise: 0,
	swing: 0,
	nod: 0,
	tilt: 0,
	shrug: 0,
	hop: 0,
};

export type GesturePose = typeof REST_POSE;

/**
 * Pose amounts for the running gesture, all 0 at rest.
 *
 * Wave: `bend` folds the elbow, `raise` lifts the upper arm, `swing` rocks the
 * forearm. The elbow bends before the arm lifts and stays bent until it is
 * down again, so the arm is never held out straight.
 * Nod / tilt: head pitch (positive looks down) and roll.
 * Shrug: both shoulders up, 0..1. Hop: height above the ground, 0..1.
 */
export const gesturePose = (
	elapsed: number,
	gesture: Gesture | null,
): GesturePose => {
	if (!gesture) return REST_POSE;
	const t = elapsed - gesture.startedAt;
	const duration = GESTURE_DURATION[gesture.name];
	if (t < 0 || t > duration) return REST_POSE;
	const progress = t / duration;

	switch (gesture.name) {
		case "wave": {
			const bend =
				smoothstep(0, 0.18, progress) * (1 - smoothstep(0.78, 1, progress));
			const raise =
				smoothstep(0.08, 0.32, progress) *
				(1 - smoothstep(0.64, 0.9, progress));
			return { ...REST_POSE, bend, raise, swing: Math.sin(t * 10) * raise };
		}
		case "nod":
			// sin² gives two dips that start and end at rest.
			return { ...REST_POSE, nod: Math.sin(progress * Math.PI * 2) ** 2 };
		case "tilt":
			return {
				...REST_POSE,
				tilt: hold(progress, 0.25) * (1 + Math.sin(t * 6) * 0.08),
			};
		case "shrug":
			return { ...REST_POSE, shrug: hold(progress, 0.3) };
		case "hop": {
			// Two small hops, each a parabola.
			const phase = (progress * 2) % 1;
			return {
				...REST_POSE,
				hop: 4 * phase * (1 - phase) * (1 - progress * 0.4),
			};
		}
	}
};

export const markAvatarReady = () => {
	document.documentElement.dataset.avatarReady = "true";
};
