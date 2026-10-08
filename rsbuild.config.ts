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

const SITE_URL = "https://resume.baran.wang";
const TITLE = "王柄涵 Baran · 全栈工程师";
const DESCRIPTION =
	"王柄涵（Baran）的简历：UI/UX 设计出身的全栈工程师，专注 React / TypeScript / Node.js 与 AI 工程。";
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const property = (name: string, content: string) => ({
	property: name,
	content,
});

export default defineConfig({
	html: {
		title: TITLE,
		meta: {
			description: DESCRIPTION,
			viewport:
				"width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
			"theme-color": "#fafaf9",
			"og:type": property("og:type", "profile"),
			"og:site_name": property("og:site_name", "王柄涵 Baran"),
			"og:locale": property("og:locale", "zh_CN"),
			"og:url": property("og:url", `${SITE_URL}/`),
			"og:title": property("og:title", TITLE),
			"og:description": property("og:description", DESCRIPTION),
			"og:image": property("og:image", OG_IMAGE),
			"og:image:type": property("og:image:type", "image/png"),
			"og:image:width": property("og:image:width", "1200"),
			"og:image:height": property("og:image:height", "630"),
			"og:image:alt": property("og:image:alt", `${TITLE}，附 Q 版形象`),
			"profile:first_name": property("profile:first_name", "柄涵"),
			"profile:last_name": property("profile:last_name", "王"),
			"profile:username": property("profile:username", "baranwang"),
			"twitter:card": "summary_large_image",
			"twitter:title": TITLE,
			"twitter:description": DESCRIPTION,
			"twitter:image": OG_IMAGE,
		},
		tags: [
			{ tag: "link", attrs: { rel: "canonical", href: `${SITE_URL}/` } },
			{
				tag: "link",
				attrs: {
					rel: "icon",
					href: "/icon-192.png",
					type: "image/png",
					sizes: "192x192",
				},
			},
			{
				tag: "link",
				attrs: { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
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
