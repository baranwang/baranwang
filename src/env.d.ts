/// <reference types="@rsbuild/core/types" />

declare module "*.glb" {
	const url: string;
	export default url;
}
declare module "*.md" {
	let MDXComponent: () => JSX.Element;
	export default MDXComponent;
}
declare module "*.mdx" {
	let MDXComponent: () => JSX.Element;
	export default MDXComponent;
}
