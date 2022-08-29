import { Rectangle } from './data';
import { Selection } from './selection';
export function customEventHandler<T>(
	listener: (event: CustomEvent<T>) => void
): (event: Event) => void {
	return (event: Event) => {
		listener(event as CustomEvent<T>);
	};
}

export function getSelectionBoundingBox(selections: Selection[]): Rectangle {
	let minX: number = Number.MAX_SAFE_INTEGER;
	let maxX = 0;
	let minY: number = Number.MAX_SAFE_INTEGER;
	let maxY = 0;

	selections.forEach((selection: Selection) => {
		const { element } = selection;
		const left: number = removePx(element.style.left);
		const top: number = removePx(element.style.top);
		const right: number = left + element.clientWidth;
		const bottom: number = top + element.clientHeight;

		minX = left < minX ? left : minX;
		minY = top < minY ? top : minY;
		maxX = right > maxX ? right : maxX;
		maxY = bottom > maxY ? bottom : maxY;
	});

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY
	};
}

export function removePx(value: string): number {
	return parseInt(value.replace('px', ''));
}
