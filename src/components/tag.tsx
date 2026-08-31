import { cn } from "@/libs";

interface TagProps {
	children: React.ReactNode;
	className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className }) => {
	return (
		<span
			className={cn(
				"rounded bg-white/60 px-2 py-0.5 font-semibold text-stone-900 text-xs",
				className,
			)}
		>
			{children}
		</span>
	);
};
