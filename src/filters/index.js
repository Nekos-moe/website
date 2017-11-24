export function humanize(number) {
	return number ? number.toLocaleString() : 0;
}

export function deCamelCase(string) {
	return string.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
		.toLowerCase()
		.replace(/./, c => c.toUpperCase());
}
