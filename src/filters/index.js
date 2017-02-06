const Nf = new Intl.NumberFormat('en-US');

export function humanize(number) {
	return Nf.format(number);
}
