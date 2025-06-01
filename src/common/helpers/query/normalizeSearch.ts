export function normalizeSearch(input: string): string {
	const query = input.replaceAll(',', ' ');
	return query;
}
