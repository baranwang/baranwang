import { INFO } from "@/info";
import profile from "@/info/profile.mdx";
import { Avatar } from "./avatar";
import { MDXContent } from "./mdx-content";

const LINK_CLASS =
	"text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent";

export const Header = () => {
	return (
		<header className="space-y-8">
			<div className="grid items-end gap-x-8 border-stone-300 border-b md:grid-cols-[1fr_17rem]">
				<div className="space-y-5 pb-10">
					<p className="font-mono text-stone-400 text-xs">
						<span className="text-accent">~/baran</span>
						<span className="mx-1.5 text-emerald-600">❯</span>
						whoami
					</p>
					<h1 className="font-semibold text-5xl text-stone-900 tracking-tight">
						{INFO.name.zh}
						<span className="ml-3 font-light font-mono text-3xl text-stone-300">
							{INFO.name.en}
						</span>
					</h1>
					<div className="space-y-2">
						<p className="font-medium text-stone-800 text-xl">{INFO.role}</p>
						<p className="text-sm text-stone-500">
							{INFO.yearsOfExperience} 年经验
						</p>
					</div>
					<p className="flex flex-wrap gap-x-5 font-mono text-[13px]">
						<a className={LINK_CLASS} href={`mailto:${INFO.email}`}>
							{INFO.email}
						</a>
						<a
							className={LINK_CLASS}
							href={`https://github.com/${INFO.github}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							github.com/{INFO.github}
						</a>
					</p>
				</div>
				<Avatar />
			</div>

			<MDXContent content={profile} />
		</header>
	);
};
