export const Footer = () => {
	return (
		<footer className="border-stone-200 border-t pt-6 font-mono text-[11px] text-stone-400">
			<span className="text-emerald-600">✓</span> built with React · Rsbuild ·
			three.js — source:{" "}
			<a
				className="underline decoration-stone-300 underline-offset-4 hover:text-accent"
				href="https://github.com/baranwang/baranwang"
				target="_blank"
				rel="noopener noreferrer"
			>
				github.com/baranwang/baranwang
			</a>
		</footer>
	);
};
