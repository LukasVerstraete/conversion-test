import {
	toggleBlockSelector,
	blockSelectorEnabledEventName,
	blockSelectorDisabledEventName
} from './block-editor';
import { loadPages } from './book-utils';
import { books, BookData } from './data';
import { customEventHandler } from './helpers';
import { deleteSelection, onSelectEventName } from './selection';

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
	const deleteButton: HTMLButtonElement = document.getElementById(
		'delete-button'
	) as HTMLButtonElement;
	const blockEditorContainer: HTMLDivElement = document.getElementById(
		'block-creator'
	) as HTMLDivElement;
	const blockEditorToggle: HTMLButtonElement = document.getElementById(
		'block-editor-toggle'
	) as HTMLButtonElement;

	addBookOptions(bookSelector);
	addBookSelectorEvents(bookSelector, pageSelector);
	addLoadButtonEvents(loadButton, bookSelector, pageSelector);
	addDeleteButtonEvents(deleteButton);
	addSelectionEvents(deleteButton);
	addBlockCreatorEvents(blockEditorToggle, blockEditorContainer);
}

function addSelectionEvents(deleteButton: HTMLButtonElement): void {
	document.addEventListener(
		onSelectEventName,
		customEventHandler<Selection[]>(
			(selectionEvent: CustomEvent<Selection[]>) => {
				const selection: Selection[] = selectionEvent.detail;
				if (selection.length > 0) {
					deleteButton.disabled = false;
				} else {
					deleteButton.disabled = true;
				}
			}
		)
	);
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

function addDeleteButtonEvents(deleteButton: HTMLButtonElement): void {
	deleteButton.addEventListener('click', deleteSelection);
}

function addBlockCreatorEvents(
	blockCreatorToggle: HTMLButtonElement,
	blockCreatorContainer: HTMLDivElement
) {
	blockCreatorToggle.addEventListener('click', toggleBlockSelector);

	document.addEventListener(
		blockSelectorEnabledEventName,
		customEventHandler(() => {
			console.log('test');
			blockCreatorContainer.classList.add('active');
		})
	);

	document.addEventListener(
		blockSelectorDisabledEventName,
		customEventHandler(() => {
			blockCreatorContainer.classList.remove('active');
		})
	);
}
