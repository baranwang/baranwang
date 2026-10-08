import "./App.css";

import { Footer } from "./components/footer";
import { Header } from "./components/header";
import { MDXContent } from "./components/mdx-content";
import { Section } from "./components/section";
import { Tag } from "./components/tag";
import { INFO } from "./info";
import skills from "./info/skills.mdx";
import { cn } from "./libs";

const EDUCATION = [
	{
		duration: "2026 ～ 2028",
		school: "上海开放大学",
		major: "人工智能",
		degree: "本科 · 在读",
	},
	{
		duration: "2011 ～ 2014",
		school: "平顶山学院",
		major: "艺术设计",
		degree: "专科",
	},
];

const Tags = ({ tags }: { tags?: string[] }) =>
	tags?.length ? (
		<div className="flex flex-wrap gap-1.5">
			{tags.map((tag) => (
				<Tag key={tag}>{tag}</Tag>
			))}
		</div>
	) : null;

/** Groups in order of first appearance, so the sort order of items decides the order of groups. */
const groupBy = <T,>(items: T[], keyOf: (item: T) => string) => {
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const key = keyOf(item);
		groups.set(key, [...(groups.get(key) ?? []), item]);
	}
	return [...groups];
};

const repoPath = (href: string) => href.replace(/^https:\/\/github\.com\//, "");

const App = () => {
	return (
		<div className="resume-paper min-h-screen w-full font-sans text-stone-700">
			<main className="mx-auto w-full max-w-3xl space-y-14 px-6 py-14 md:px-12">
				<Header />

				<Section title="工作经历" command="git log --graph --career">
					<ol className="relative space-y-7 border-stone-200 border-l pl-6">
						{INFO.workExperience.map((item, index) => (
							<li key={item.key} className="relative space-y-2">
								<span
									className={cn(
										"-left-[1.97rem] absolute top-1.5 size-3 rounded-full border-2 border-white ring-1",
										index === 0
											? "bg-accent ring-accent"
											: "bg-stone-300 ring-stone-300",
									)}
								/>
								<div className="flex flex-wrap items-baseline justify-between gap-x-4">
									<h3 className="font-semibold text-stone-900">
										{item.company}
										<span className="mx-2 text-stone-300">/</span>
										<span className="font-normal text-stone-600">
											{item.title}
										</span>
										{item.tag ? (
											<Tag className="ml-2 align-middle">{item.tag}</Tag>
										) : null}
									</h3>
									<time className="font-mono text-stone-400 text-xs tabular-nums">
										{item.duration}
									</time>
								</div>
								<MDXContent content={item.default} />
							</li>
						))}
					</ol>
				</Section>

				<Section title="重点项目" command="ls projects/">
					<div className="space-y-10">
						{INFO.projectExperience.map((item) => (
							<article key={item.key} className="space-y-2.5">
								<div className="flex flex-wrap items-baseline justify-between gap-x-4">
									<h3 className="font-semibold text-stone-900">{item.title}</h3>
									{item.team ? (
										<span className="font-mono text-stone-400 text-xs">
											{item.team}
										</span>
									) : null}
								</div>
								<Tags tags={item.tags} />
								<MDXContent content={item.default} />
							</article>
						))}
					</div>
				</Section>

				<Section title="开源作品" command="gh repo list --sort stars">
					<div className="space-y-8">
						{groupBy(INFO.openSource, (item) => item.category).map(
							([category, items]) => (
								<div key={category} className="space-y-3">
									<h3 className="font-mono text-stone-400 text-xs">
										<span className="text-accent"># </span>
										{category}
									</h3>
									<div className="grid gap-3 md:grid-cols-2">
										{items.map((item) => (
											<article
												key={item.key}
												className={cn(
													"flex flex-col gap-2.5 rounded-xl border border-stone-200 bg-white p-4",
													{ "md:col-span-2": item.featured },
												)}
											>
												<div className="space-y-0.5">
													<div className="flex flex-wrap items-baseline justify-between gap-x-3">
														<h3 className="font-semibold text-stone-900">
															<a
																className="hover:text-accent"
																href={item.href}
																target="_blank"
																rel="noopener noreferrer"
															>
																{item.title}
															</a>
														</h3>
														<span className="font-mono text-accent text-xs tabular-nums">
															{item.meta}
														</span>
													</div>
													<p className="font-mono text-[11px] text-stone-400">
														{repoPath(item.href)}
													</p>
												</div>
												<MDXContent
													content={item.default}
													className={cn("flex-1", {
														"text-sm leading-6": !item.featured,
													})}
												/>
												<Tags tags={item.tags} />
											</article>
										))}
									</div>
								</div>
							),
						)}
					</div>
				</Section>

				<Section title="核心能力" command="cat skills.md">
					<MDXContent content={skills} />
				</Section>

				<Section title="教育经历" command="cat education.md">
					<div className="space-y-2">
						{EDUCATION.map((item) => (
							<div
								key={item.school}
								className="flex flex-wrap items-baseline justify-between gap-x-4"
							>
								<p>
									<span className="font-semibold text-stone-900">
										{item.school}
									</span>
									<span className="mx-2 text-stone-300">/</span>
									{item.major}
									<Tag className="ml-2 align-middle">{item.degree}</Tag>
								</p>
								<time className="font-mono text-stone-400 text-xs tabular-nums">
									{item.duration}
								</time>
							</div>
						))}
					</div>
				</Section>

				<Footer />
			</main>

			<div className="print:hidden">
				<a
					className="-translate-x-1/2 fixed bottom-6 left-1/2 z-40 rounded-full bg-stone-900 px-5 py-2 font-mono text-white text-xs shadow-lg transition hover:bg-accent"
					href="/resume.pdf"
					download={`${INFO.name.zh}-${INFO.role.replace(/\s/g, "").replace("/", "-")}.pdf`}
				>
					❯ download resume.pdf
				</a>
				<div className="h-16" />
			</div>
		</div>
	);
};

export default App;
