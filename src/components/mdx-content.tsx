import { cn } from "@/libs";

interface MDXContentProps {
	content: () => React.JSX.Element;
	className?: string;
}
export const MDXContent = ({ content, className }: MDXContentProps) => {
	const Content = content;
	return (
		<article
			className={cn(
				"space-y-2 text-[15px] text-stone-600 leading-7",
				"[&_li]:marker:text-stone-300 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4",
				"[&_strong]:font-semibold [&_strong]:text-stone-900",
				"[&_a:hover]:decoration-accent [&_a]:text-stone-900 [&_a]:underline [&_a]:decoration-stone-300 [&_a]:underline-offset-4",
				"[&_code]:rounded [&_code]:bg-stone-100 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.85em] [&_code]:text-stone-800",
				className,
			)}
		>
			<Content />
		</article>
	);
};
