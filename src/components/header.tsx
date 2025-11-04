import { Suspense, use } from "react";
import { codeToHtml } from "shiki";
import { INFO } from "@/info";

const code = `export class BaranWang {
  static name = '${INFO.name.zh}';

  static birthday = new Date('${INFO.birthDate.toLocaleString()}');

  call() {
    return 'tel:${INFO.phone}';
  }

  sendEmail() {
    return 'mailto:${INFO.email}';
  }
}`;

const CodeBlock = () => {
	const codeHtml = use(
		codeToHtml(code, {
			lang: "typescript",
			theme: "vitesse-black",
		}),
	);
	return (
		<div
			className="absolute top-9 right-4 opacity-50 [&_.shiki]:bg-transparent!"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: 渲染代码块
			dangerouslySetInnerHTML={{ __html: codeHtml }}
		/>
	);
};

export const Header = () => {
	return (
		<header className="absolute top-0 right-0 left-0 z-0 h-1/3 bg-linear-to-b from-blue-700/30 to-transparent">
			<Suspense fallback={null}>
				<CodeBlock />
			</Suspense>
		</header>
	);
};
