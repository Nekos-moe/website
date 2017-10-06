const Nf = new Intl.NumberFormat('en-US');

export function humanize(number) {
	return Nf.format(number);
}

export function deCamelCase(string) {
	return string.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		.replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
		.toLowerCase()
		.replace(/./, c => c.toUpperCase());
}
