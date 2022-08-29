import { initPageSelectorControls } from './controls';
import { initializeSelectionState } from './selection';
import './style.css';

// const deleteButton: HTMLButtonElement | null = document.getElementById(
// 	'delete-button'
// ) as HTMLButtonElement;
// let activeElement: HTMLElement | null = document.activeElement as HTMLElement;

// if (deleteButton) {
// 	deleteButton.disabled = true;
// 	deleteButton.addEventListener('mousedown', () => {
// 		document.activeElement?.remove();
// 	});

// 	document.getElementById('app')?.addEventListener('click', () => {
// 		if (document.activeElement !== document.querySelector('body')) {
// 			if (
// 				document
// 					.getElementById('app')
// 					?.contains(document.activeElement as HTMLElement)
// 			) {
// 				activeElement = document.activeElement as HTMLElement;
// 			}
// 			deleteButton.disabled = false;
// 		} else {
// 			deleteButton.disabled = true;
// 		}
// 	});
// }

// const fontSelector: HTMLSelectElement | null = document.getElementById(
// 	'font'
// ) as HTMLSelectElement;
// if (fontSelector) {
// 	fontSelector.addEventListener('change', (value: Event) => {
// 		if (!activeElement) {
// 			return;
// 		}
// 		activeElement.style.fontFamily = (
// 			value.target as HTMLSelectElement
// 		).value;
// 	});
// }

initPageSelectorControls();

const rootElement: HTMLElement | null = document.querySelector('#app');
if (rootElement) {
	initializeSelectionState(rootElement);
}

export {};
