import { lazy, Suspense } from "react";

const AvatarScene = lazy(() => import("./scene"));

export const Avatar = () => (
	<figure className="group relative h-80 cursor-grab active:cursor-grabbing">
		<Suspense fallback={null}>
			<AvatarScene />
		</Suspense>
		<figcaption className="pointer-events-none absolute top-2 right-0 font-mono text-[10px] text-stone-400 opacity-0 transition-opacity group-hover:opacity-100 print:hidden">
			drag to rotate · click me
		</figcaption>
	</figure>
);
