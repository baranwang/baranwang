interface MDXContentProps {
	content: () => React.JSX.Element;
}
export const MDXContent = ({ content }: MDXContentProps) => {
	const Content = content;
	return (
		<article className="[&_ul]:list-disc [&_ul]:pl-4">
			<Content />
		</article>
	);
};
