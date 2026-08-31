import "./App.css";

import { Fragment } from "react";
import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { MDXContent } from "./components/mdx-content";
import { Section } from "./components/section";
import { Tag } from "./components/tag";
import { INFO } from "./info";
import profile from "./info/profile.mdx";
import skills from "./info/skills.mdx";
import { cn } from "./libs";

const App = () => {
	return (
		<div className="relative w-full bg-stone-900 text-white">
			<Header />

			<main className="relative z-10 mx-auto w-full space-y-14 px-10 py-14 font-light md:max-w-3xl">
				<section className="flex flex-col gap-2">
					我是
					<div className="font-semibold text-2xl">
						{INFO.name.zh} / {INFO.name.en}
					</div>
					<MDXContent content={profile} />
					<div className="mt-4 hidden flex-wrap gap-2 print:flex">
						<a href={`tel:${INFO.phone}`}>📱️ {INFO.phoneDisplay}</a>
						{" · "}
						<a href={`mailto:${INFO.email}`}>📧 {INFO.email}</a>
					</div>
				</section>

				<Section title="专业技能">
					<MDXContent content={skills} />
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

				<Section title="教育经历">
					<p>
						2026 ～ 2028 · 上海开放大学 · 人工智能
						<Tag className="ml-2">本科 · 在读</Tag>
					</p>
					<p>
						2011 ～ 2014 · 平顶山学院 · 艺术设计
						<Tag className="ml-2">专科</Tag>
					</p>
				</Section>

				<Section title="项目经历">
					{INFO.projectExperience.map((item, index, array) => {
						return (
							<Fragment key={item.key}>
								<h3 className="flex items-start justify-between">
									<span className="font-bold">{item.title}</span>
									<span className="whitespace-nowrap">{item.team}</span>
								</h3>
								<div
									className={cn("my-2 flex flex-wrap items-center gap-2", {
										hidden: !item.tags?.length,
									})}
								>
									{item.tags?.map((tag) => (
										<Tag key={tag}>{tag}</Tag>
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

			<div className="print:hidden">
				<a
					className="-translate-x-1/2 fixed bottom-8 left-1/2 z-50 min-w-xs cursor-pointer rounded-md bg-white/10 px-4 py-2 text-center shadow-md backdrop-blur-lg"
					type="button"
					href="/resume.pdf"
					download={`${INFO.name.zh}-${INFO.phone.replace(/^\+86/, "")}-${INFO.email}.pdf`}
				>
					下载 PDF
				</a>
				<div className="h-24" />
			</div>

			<Footer />
		</div>
	);
};

export default App;
