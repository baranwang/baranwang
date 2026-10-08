import { cn } from "@/libs";

interface TagProps {
	children: React.ReactNode;
	className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className }) => {
	return (
		<span
			className={cn(
				"rounded-md border border-stone-200 bg-stone-50 px-1.5 font-mono text-[11px] text-stone-500 leading-5",
				className,
			)}
		>
			{children}
		</span>
	);
};
