import './style.css';

const standardCSSFilenames: string[] = [
	'idGeneratedStyles.css',
	// 'myCustomCSS.css'
];

const standardScriptFilenames: string[] = [
	'FontData.js'
];

async function loadPages(
	rootElementId: string,
	project: string,
	pageCount: number
): Promise<void> {
	const rootElement: HTMLElement | null =
		document.getElementById(rootElementId);
	if (rootElement === null) return;

	await loadScripts(rootElement, project);
	await loadCSSFiles(rootElement, project);

	const pages: string[] = await fetchPageContent(project, pageCount);
	const pageElements: HTMLElement[] = createPageElements(pages);

	console.log(pageElements);

	showContent(rootElement, pageElements);
	makeContentEditable(rootElement);
}

async function loadCSSFiles(
	rootElement: HTMLElement,
	projectName: string
): Promise<void> {
	for (let i = 0; i < standardCSSFilenames.length; i++) {
		const cssFilename: string = standardCSSFilenames[i];
		const cssFilePath = `./${projectName}/${projectName}-web-resources/css/${cssFilename}`;
		const cssFile: Response = await fetch(cssFilePath);
		const cssFileText: string = (await cssFile.text()).replaceAll(new RegExp('span', 'g'), 'p');
		const cssElement: HTMLElement = document.createElement('style');
		cssElement.innerHTML = cssFileText;
		rootElement.appendChild(cssElement);
	}
}

async function loadScripts(rootElement: HTMLElement, projectName: string): Promise<void> {
	for (let i = 0; i < standardScriptFilenames.length; i++) {
		const scriptFileName: string = standardScriptFilenames[i];
		const scriptFilePath = `./${projectName}/${projectName}-web-resources/script/${scriptFileName}`;
		const scriptFile: Response = await fetch(scriptFilePath);
		const scriptFileText: string = (await scriptFile.text());
		const scriptElement: HTMLElement = document.createElement('script');
		scriptElement.innerHTML = scriptFileText;
		rootElement.appendChild(scriptElement);
	}
}

async function fetchPageContent(
	projectName: string,
	pageCount: number
): Promise<string[]> {
	const content: string[] = [];

	for (let i = 0; i < pageCount; i++) {
		const response: Response = await fetch(
			`./${projectName}/${projectName}${i > 0 ? '-' + i : ''}.html`
		);
		const fullPage: string = await response.text();
		content.push(getBodyContentText(projectName, fullPage));
	}

	return content;
}

function getBodyContentText(projectName: string, htmlText: string): string {
	const tempElement: HTMLElement = document.createElement('div');
	const fixedSrc: string = fixImageLinks(
		projectName,
		htmlText.trim()
	);
	tempElement.innerHTML = fixedSrc;

	const bodyElement: HTMLElement | null = tempElement.querySelector('div');

	if (bodyElement === null) return '';


	return bodyElement.innerHTML.trim();
}

function fixImageLinks(projectName: string, htmlText: string): string {
	return htmlText.replaceAll(
		new RegExp(`${projectName}-web-resources/image`, 'g'),
		`${projectName}/${projectName}-web-resources/image/`
	);
}

function createPageElements(pages: string[]): HTMLElement[] {
	const pageElements: HTMLElement[] = [];

	pages.forEach((page: string, index: number) => {
		const pageElement: HTMLElement = document.createElement('div');
		pageElement.id = `page-${index}`;
		pageElement.classList.add('page');
		pageElement.style.position = 'relative';
		pageElement.innerHTML = page;
		pageElements.push(pageElement);
	});

	return pageElements;
}

function calculatePageBounds(pageElement: HTMLElement): void {
	let maxX: number = 0;
	let maxY: number = 0;

	pageElement.childNodes.forEach((child: ChildNode) => {
		if (!(child instanceof HTMLElement)) return;
		const childElement: HTMLElement = child as HTMLElement;
		const style: CSSStyleDeclaration = window.getComputedStyle(childElement);
		const x: number = Number.parseInt(style.getPropertyValue('left').replace('px', ''));
		const y: number = Number.parseInt(style.getPropertyValue('top').replace('px', ''));

		const width: number = Number.parseInt(style.getPropertyValue('width').replace('px', ''));
		const height: number = Number.parseInt(style.getPropertyValue('height').replace('px', ''));

		if (x + width > maxX) maxX = x + width;
		if (y + height > maxY) maxY = y + height;
	});

	pageElement.style.width = `${maxX}px`;
	pageElement.style.height = `${maxY}px`;
}

type WordData = {
	word: string;
	paragraph: number;
};

function fixParagraphs(rootElement: HTMLElement): void {
	Array
		.from(rootElement.querySelectorAll('p'))
		.forEach((paragraph: HTMLElement) => {
			const words: WordData[] = [];
			const spans: HTMLElement[] = Array.from(paragraph.querySelectorAll('span'));
			const exampleSpanIndex: number = spans[1] && spans[0].innerHTML.trim() === '' ? 1 : 0;
			const exampleSpan: HTMLElement = spans[exampleSpanIndex];
			const classNames: string[] = exampleSpan.className.split(' ');
			const leftPosition: string = exampleSpan.style.left;
			const topPositionMapping: string[] = [];
			
			let paragraphCount: number = 0;
			let currentTopPosition: string = exampleSpan.style.top;

			spans
				.forEach((word: HTMLElement) => {
					if (currentTopPosition !== word.style.top) {
						paragraphCount++;
						currentTopPosition = word.style.top;
					}
					topPositionMapping.push(word.style.top);
					words.push({word: word.innerHTML, paragraph: paragraphCount});
					word.remove();
				});

			paragraph.classList.add(...classNames);
			paragraph.style.left = leftPosition;
			paragraph.style.top = topPositionMapping[exampleSpanIndex];
			paragraph.style.position = 'absolute';

			const paragraphs: HTMLElement[] = [paragraph];
			currentTopPosition = topPositionMapping[exampleSpanIndex];

			topPositionMapping.forEach((topPosition: string) => {
				if (topPosition !== currentTopPosition) {
					const newParagraph: HTMLElement = document.createElement('p');
					newParagraph.classList.add(...classNames);
					newParagraph.style.left = leftPosition;
					newParagraph.style.top = topPosition;
					newParagraph.style.position = 'absolute';

					paragraphs.push(newParagraph);
					currentTopPosition = topPosition;
				}
			});

			if (paragraphs.length > 1) {
				for (let i = 1; i < paragraphs.length; i++) {
					paragraphs[i - 1].insertAdjacentElement("afterend", paragraphs[i]);
				}
			}
			words.forEach((word: WordData) => {
				paragraphs[word.paragraph].innerHTML += ` ${word.word}`;
			});

		});
}

function makeContentEditable(rootElement: HTMLElement): void {
	Array
		.from(rootElement.querySelectorAll('p'))
		.forEach((paragraph: HTMLElement) => {
			paragraph.contentEditable = 'true';
		});
}

function showContent(rootElement: HTMLElement, pages: HTMLElement[]): void {
	pages.forEach((page: HTMLElement) => {
		rootElement.appendChild(page);
		calculatePageBounds(page);
	});
	// fixPagePositioning(rootElement);
	fixParagraphs(rootElement);
}

function fixPagePositioning(rootElement: HTMLElement): void {
	const pages: HTMLElement[] = Array.from(
		rootElement.querySelectorAll('.page >div')
	);
	pages.forEach((page: HTMLElement, index: number) => {
		page.style.position = 'fixed';
	});
}

const deleteButton: HTMLButtonElement | null = document.getElementById('delete-button') as HTMLButtonElement;
let activeElement: HTMLElement | null = document.activeElement as HTMLElement;

if (deleteButton) {
	deleteButton.disabled = true;
	deleteButton.addEventListener('mousedown', () => {
		document.activeElement?.remove();
	} );

	document.getElementById('app')?.addEventListener('click', () => {
		console.log('test');
		if (document.activeElement !== document.querySelector('body')) {
			if (document.getElementById('app')?.contains(document.activeElement as HTMLElement) ){
				activeElement = document.activeElement as HTMLElement;
			}
			deleteButton.disabled = false;
		} else {
			deleteButton.disabled = true;
		}
	});
}

const fontSelector: HTMLSelectElement | null = document.getElementById('font') as HTMLSelectElement;
if (fontSelector) {
	fontSelector.addEventListener('change', (value: Event) => {
		if (!activeElement) {
			return;
		}
		window.getComputedStyle(activeElement).setProperty('fontFamily',`${(value.target as unknown as {value: string}).value} !important`);
		console.log(activeElement.style);

	} );
}

loadPages('app', 'CHNL60L_03_p59-90', 1);


export {};