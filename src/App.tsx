import "./App.css";

import { Fragment } from "react";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { MDXContent } from "./components/mdx-content";
import { Section } from "./components/section";
import { INFO } from "./info";

const App = () => {
	console.log(INFO.workExperience);
	return (
		<div className="relative w-full bg-stone-900 text-white">
			<Header />

			<main className="relative z-10 mx-auto w-full space-y-14 px-10 py-14 font-light md:max-w-3xl">
				<section className="flex flex-col gap-2">
					我是
					<div className="text-2xl">
						{INFO.name.zh} / {INFO.name.en}
					</div>
					<p>
						<span className="font-bold">{INFO.yearsOfExperience} 年</span>
						互联网从业经验，从 <span className="font-bold">UI 设计师</span>
						转型为<span className="font-bold">全栈设计师</span>，再到如今的
						<span className="font-bold">全栈开发工程师</span>
						。擅长从设计到开发的全链路工作，热衷于通过技术与设计提升产品价值。乐于与团队成员分享，有极强求知欲，对多领域事物充满好奇。
					</p>
					<div className="mt-4 flex gap-2">
						<a href={`tel:${INFO.phone}`}>📱️ {INFO.phoneDisplay}</a>
						{" · "}
						<a href={`mailto:${INFO.email}`}>📧 {INFO.email}</a>
					</div>
				</section>

				<Section title="教育经历">
					<p>2011 ～ 2014 · 平顶山学院 · 艺术设计</p>
				</Section>

				<Section title="工作履历">
					{INFO.workExperience.map((item, index, array) => {
						return (
							<Fragment key={item.key}>
								<div className="flex items-center justify-between">
									<h3 className="font-bold">
										{item.company} · {item.title}
									</h3>
									<time>{item.duration}</time>
								</div>
								<MDXContent content={item.default} />
								{index !== array.length - 1 && (
									<hr className="my-4 border-white/10" />
								)}
							</Fragment>
						);
					})}
				</Section>

				<Section title="项目经历">
					{INFO.projectExperience.map((item, index, array) => {
						return (
							<Fragment key={item.key}>
								<h3 className="flex items-center justify-between">
									<span className="font-bold">{item.title}</span>
									<span>{item.team}</span>
								</h3>
								<div className="my-2 flex items-center space-x-2">
									{item.tags?.map((tag) => (
										<span
											key={tag}
											className="rounded bg-white/60 px-2 py-0.5 font-semibold text-stone-900 text-xs"
										>
											{tag}
										</span>
									))}
								</div>
								<MDXContent content={item.default} />
								{index !== array.length - 1 && (
									<hr className="my-4 border-white/10" />
								)}
							</Fragment>
						);
					})}
				</Section>
			</main>

			<a
				className="-translate-x-1/2 fixed bottom-8 left-1/2 z-50 min-w-xs cursor-pointer rounded-md bg-white/10 px-4 py-2 text-center shadow-md backdrop-blur-lg print:hidden"
				type="button"
				href="/resume.pdf"
				download={`${INFO.name.zh}-${INFO.phone.replace(/^\+86/, "")}-${INFO.email}.pdf`}
			>
				下载 PDF
			</a>

			<Footer />
		</div>
	);
};

export default App;
