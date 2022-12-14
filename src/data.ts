export type BookData = {
	title: string;
	pages: number;
};

export type Rectangle = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export const books: BookData[] = [
	{ title: 'CHNL60L_03_p59-90', pages: 31 },
	{ title: 'TITO5AW_02_p55-92_CORR-2018', pages: 37 },
	{ title: 'PICON30W_CHAP2', pages: 13 }
];

export const selectableElements: string[] = ['p', 'img'];
export const selectableChildElements: string[] = ['span'];
