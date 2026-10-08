import path from "node:path";
import { createRsbuild, defineConfig, type RsbuildPlugin } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { chromium } from "playwright";
import rehypeExternalLinks from "rehype-external-links";

const pdfPlugin = (): RsbuildPlugin => {
	return {
		name: "pdf",
		setup(api) {
			api.onCloseBuild(async () => {
				// A dedicated strict port: with the default 3000, another local server
				// already listening there can be captured into the PDF instead.
				const rsbuild = await createRsbuild({
					cwd: api.context.rootPath,
					rsbuildConfig: { server: { port: 4790, strictPort: true } },
				});
				const preview = await rsbuild.preview();

				const browser = await chromium.launch();
				const page = await browser.newPage();

				await page.setViewportSize({ width: 800, height: 800 });
				await page.emulateMedia({ media: "print" });
				await page.goto(preview.urls[0], { waitUntil: "networkidle" });
				await page
					.waitForFunction(
						() => document.documentElement.dataset.avatarReady === "true",
						undefined,
						{ timeout: 15_000 },
					)
					.catch(() => console.warn("[pdf] avatar did not render in time"));
				// Let the first frames settle (shadows, entry wave) before capturing.
				await page.waitForTimeout(2_500);
				const contentHeight = await page.evaluate(
					() => document.querySelector("#root")?.getBoundingClientRect().height,
				);
				await page.pdf({
					path: path.resolve(api.context.distPath, "resume.pdf"),
					width: 800,
					height: contentHeight,
					printBackground: true,
					preferCSSPageSize: true,
				});

				await browser.close();
				await preview.server.close();
			});
		},
	};
};

export default defineConfig({
	html: {
		title: "王柄涵 Baran · 全栈工程师",
		meta: [
			{
				name: "description",
				content: "王柄涵（Baran）的简历：全栈工程师",
			},
			{
				name: "viewport",
				content:
					"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
			},
		],
	},
	plugins: [
		pluginReact(),
		pluginMdx({
			mdxLoaderOptions: {
				rehypePlugins: [
					[
						rehypeExternalLinks,
						{
							target: "_blank",
							rel: "noopener noreferrer",
						},
					],
				],
			},
		}),
		pdfPlugin(),
	],
	tools: {
		rspack: (_config, { appendRules }) => {
			// Hashed filenames so a regenerated model is never served from cache.
			appendRules({
				test: /\.glb$/,
				type: "asset/resource",
				generator: { filename: "static/models/[name].[contenthash:8][ext]" },
			});
		},
	},
});
