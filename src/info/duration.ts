export const parseDurationStart = (duration: string) => {
	const match = duration.match(/^(\d{4})\/(\d{2})/);
	return match ? Number(`${match[1]}${match[2]}`) : Number.NaN;
};
