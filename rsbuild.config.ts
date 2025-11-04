import path from "node:path";
import { createRsbuild, defineConfig, type RsbuildPlugin } from "@rsbuild/core";
import { pluginMdx } from "@rsbuild/plugin-mdx";
import { pluginReact } from "@rsbuild/plugin-react";
import { chromium } from "playwright";

const pdfPlugin = (): RsbuildPlugin => {
	return {
		name: "pdf",
		setup(api) {
			api.onCloseBuild(async () => {
				const rsbuild = await createRsbuild({ cwd: api.context.rootPath });
				const preview = await rsbuild.preview();

				const browser = await chromium.launch();
				const context = await browser.newContext();
				const page = await context.newPage();

				await page.setViewportSize({ width: 800, height: 800 });

				await page.goto(preview.urls[0], { waitUntil: "networkidle" });

				const contentHeight = await page.evaluate(() => {
					const body = document.body;
					return Math.max(body.scrollHeight, body.offsetHeight);
				});

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
	plugins: [pluginReact(), pluginMdx(), pdfPlugin()],
});
