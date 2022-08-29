import { Rectangle } from './data';
import { getSelectionBoundingBox } from './helpers';
import { getCurrentSelection, Selection } from './selection';

export type BlockSelectorState = {
	active: boolean;
	blocks: ElementBlock[];
};

export type ElementBlock = {
	element: HTMLElement;
	content: HTMLElement[];
};

export const blockSelectorEnabledEventName = 'block-selector-active';
export const blockSelectorDisabledEventName = 'block-selector-disabled';

let blockSelectorState: BlockSelectorState = {
	active: false,
	blocks: []
};

export function toggleBlockSelector(): void {
	setBlockSelectorActive(!blockSelectorState.active);
}

export function createBlockFromSelection(): void {
	const selection: Selection[] = getCurrentSelection();

	const boundingBox: Rectangle = getSelectionBoundingBox(selection);
	const blockElement: HTMLElement = document.createElement('div');
	blockElement.id = `block-${blockSelectorState.blocks.length}`;
	blockElement.classList.add('block-element');
	blockElement.style.width = boundingBox.width + 'px';
	blockElement.style.height = boundingBox.height + 'px';
	blockElement.style.left = boundingBox.x + 'px';
	blockElement.style.top = boundingBox.y + 'px';
	blockElement.style.position = 'absolute';
}

function setBlockSelectorActive(active: boolean): void {
	blockSelectorState = {
		...blockSelectorState,
		active
	};

	const event: CustomEvent = new CustomEvent(
		active ? blockSelectorEnabledEventName : blockSelectorDisabledEventName
	);

	document.dispatchEvent(event);
}
