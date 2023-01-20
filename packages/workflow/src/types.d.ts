declare module '@quicksales.vn/riot-tmpl' {
	interface Brackets {
		set(token: string): void;
	}

	type ReturnValue = string | null | (() => unknown);
	type TmplFn = (value: string, data: unknown) => ReturnValue;
	interface Tmpl extends TmplFn {
		errorHandler?(error: Error): void;
	}

	let brackets: Brackets;
	let tmpl: Tmpl;
}
