export function normalizeSort(input: string): Record<string, 1 | -1> {
	let parsedInput: unknown = input;

	// If string might be a JSON string, try parsing
	try {
		const maybeJson = JSON.parse(input as string);
		parsedInput = maybeJson;
	} catch (error) {
		// not JSON, leave as string
	}

	if (typeof parsedInput === 'string') {
		return parsedInput
			.split(',')
			.reduce<Record<string, 1 | -1>>((acc, field) => {
				const dir = field.startsWith('-') ? -1 : 1;
				const key = field.replace('-', '');
				acc[key] = dir;
				return acc;
			}, {});
	}

	if (Array.isArray(parsedInput)) {
		return parsedInput.reduce<Record<string, 1 | -1>>((acc, field) => {
			const key = field[0];
			const dir = isDescending(field[1]);
			acc[key] = dir;
			return acc;
		}, {});
	}

	return Object.fromEntries(
		Object.entries(parsedInput as object).map(([key, dir]) => {
			return [key, isDescending(dir)];
		}),
	);
}

function isDescending(dir: string) {
	return dir === 'desc' || dir === '-1' ? -1 : 1;
}
