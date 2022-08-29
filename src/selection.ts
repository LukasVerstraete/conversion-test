import { selectableElements, selectableChildElements } from './data';
export type SelectionState = {
	rootElement: HTMLElement;
	selection: Selection[];
};

export type Selection = {
	element: HTMLElement;
};

export const selectedClassName = 'selected';
export const onSelectEventName = 'content-select';

const bodyElement: HTMLElement | null = document.querySelector('body');

let selectionState: SelectionState = {
	rootElement: bodyElement ? bodyElement : document.createElement('div'),
	selection: []
};

export function initializeSelectionState(root: HTMLElement): void {
	selectionState = {
		rootElement: root,
		selection: []
	};
	setupEventHandlers();
}

export function dispatchSelect(selection: Selection[]): void {
	document.dispatchEvent(
		new CustomEvent(onSelectEventName, { detail: selection })
	);
}

export function deleteSelection(): void {
	selectionState.selection.forEach((selection: Selection) => {
		selection.element.remove();
	});

	setSelection([]);
}

export function getCurrentSelection(): Selection[] {
	return selectionState.selection;
}

function setupEventHandlers(): void {
	selectionState.rootElement.addEventListener('click', onElementClicked);
	dispatchSelect([]);
}

function onElementClicked(event: MouseEvent): void {
	const root: HTMLElement = selectionState.rootElement;
	const targetElement: HTMLElement = event.target as HTMLElement;
	const childSelectable: boolean = isSelectableChild(targetElement);
	if (
		!root.contains(targetElement) ||
		(!isElementSelectable(targetElement) && !childSelectable)
	)
		return;

	const elementToSelect: HTMLElement = childSelectable
		? targetElement.parentElement !== null
			? targetElement.parentElement
			: targetElement
		: targetElement;

	if (event.shiftKey) {
		addToSelection(elementToSelect);
	} else {
		setElementSelection([elementToSelect]);
	}
}

function isElementSelectable(element: HTMLElement): boolean {
	const tagName: string = element.tagName;

	return selectableElements
		.map((selectable: string) => selectable.toLowerCase())
		.includes(tagName.toLowerCase());
}

function isSelectableChild(element: HTMLElement): boolean {
	const tagName: string = element.tagName;

	return selectableChildElements
		.map((selectable: string) => selectable.toLowerCase())
		.includes(tagName.toLowerCase());
}

function addToSelection(element: HTMLElement): Selection {
	const selection: Selection = {
		element
	};

	const newSelections: Selection[] = [...selectionState.selection, selection];
	setSelection(newSelections);

	return selection;
}

function setElementSelection(elements: HTMLElement[]): Selection[] {
	const selection: Selection[] = elements.map((element: HTMLElement) => ({
		element
	}));

	setSelection(selection);

	return selection;
}

function setSelection(newSelection: Selection[]): void {
	selectionState.selection.forEach((selection: Selection) => {
		selection.element.classList.remove(selectedClassName);
	});

	newSelection.forEach((selection: Selection) => {
		selection.element.classList.add(selectedClassName);
	});

	selectionState = {
		...selectionState,
		selection: newSelection
	};

	dispatchSelect(newSelection);
}
