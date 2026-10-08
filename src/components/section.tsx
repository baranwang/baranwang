import { cn } from "@/libs";

interface SectionProps {
	title: React.ReactNode;
	command: string;
	children: React.ReactNode;
	className?: string;
}

export const Section: React.FC<SectionProps> = ({
	title,
	command,
	children,
	className,
}) => {
	return (
		<section className={cn("space-y-5", className)}>
			<header className="space-y-1">
				<p className="font-mono text-stone-400 text-xs">
					<span className="text-accent">~/baran</span>
					<span className="mx-1.5 text-emerald-600">$</span>
					{command}
				</p>
				<h2 className="font-semibold text-stone-900 text-xl tracking-tight">
					{title}
				</h2>
			</header>
			{children}
		</section>
	);
};
