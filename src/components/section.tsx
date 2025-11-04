import { cn } from "@/libs";

interface SectionProps {
	title: React.ReactNode;
	children: React.ReactNode;
	className?: string;
}

export const Section: React.FC<SectionProps> = ({
	title,
	children,
	className,
}) => {
	return (
		<section className={cn("leading-loose", className)}>
			<h2 className="text-2xl leading-loose font-bold">{title}</h2>
			{children}
		</section>
	);
};
