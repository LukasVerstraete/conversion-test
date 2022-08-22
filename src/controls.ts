import { loadPages } from './book-utils';
import { books, BookData } from './data';

export function initPageSelectorControls(): void {
	const bookSelector: HTMLSelectElement = document.getElementById(
		'book-selector'
	) as HTMLSelectElement;
	const pageSelector: HTMLInputElement = document.getElementById(
		'page-selector'
	) as HTMLInputElement;
	pageSelector.value = '0';
	pageSelector.min = '0';
	const loadButton: HTMLButtonElement = document.getElementById(
		'load-button'
	) as HTMLButtonElement;

	addBookOptions(bookSelector);
	addBookSelectorEvents(bookSelector, pageSelector);
	addLoadButtonEvents(loadButton, bookSelector, pageSelector);
}

function addBookOptions(bookSelector: HTMLSelectElement): void {
	for (const book of books) {
		const option = document.createElement('option');
		option.value = book.title;
		option.text = book.title;
		bookSelector.add(option);
	}
}

function addBookSelectorEvents(
	bookSelector: HTMLSelectElement,
	pageSelect: HTMLInputElement
): void {
	bookSelector.addEventListener('change', () => {
		const book: BookData | undefined = books.find(
			(b) => b.title === bookSelector.value
		);
		if (book) {
			pageSelect.max = String(book.pages);
			pageSelect.value = '0';
		}
	});
}

function addLoadButtonEvents(
	loadButton: HTMLButtonElement,
	bookSelector: HTMLSelectElement,
	pageSelector: HTMLInputElement
): void {
	loadButton.addEventListener('click', () => {
		const book: BookData | undefined = books.find(
			(b) => b.title === bookSelector.value
		);
		if (book) {
			loadPages('app', book.title, Number(pageSelector.value));
		}
	});
}
