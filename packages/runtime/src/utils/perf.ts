export const getPerfTime = () => process.hrtime();

export const getPerfDuration = (start: [number, number]) => {
	const end = process.hrtime(start);
	const durationInMs = end[0] * 1000 + end[1] / Math.pow(10, 9);

	return Number.parseFloat(durationInMs.toFixed(4));
};
