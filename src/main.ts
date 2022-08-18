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
		const cssFileText: string = (await cssFile.text()).replaceAll(new RegExp('span', 'g'), '');
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
	let maxX = 0;
	let maxY = 0;

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
	class: string;
	left: string;
	top: string;
	width: number;
};

type ParagraphData = {
	element: HTMLElement;
	mainClass: string;
	words: WordData[];
};

function fixParagraphs(rootElement: HTMLElement): void {
	Array
		.from(rootElement.querySelectorAll('p'))
		.forEach((paragraphElement: HTMLElement) => {
			const paragraphData: ParagraphData = extractWordDataFromParagraph(paragraphElement);

			const width: string = calculateParagraphWidth(paragraphData) + 'px';
			console.log(width);

			paragraphElement.innerHTML = '';

			// paragraphData.element.style.top = paragraphData.words[0].top;
			// paragraphData.element.style.left = paragraphData.words[0].left;
			// paragraphData.element.style.position = 'absolute';
			// paragraphData.element.style.maxWidth = width;
			// paragraphData.element.style.whiteSpace = 'normal';
			// paragraphData.element.classList.add(...paragraphData.mainClass.split(' '));

			// paragraphData.words.forEach((word: WordData) => {
			// 	const wordElement: string = word.class === paragraphData.mainClass 
			// 		? ` ${word.word}`
			// 		: ` <span class="${word.class}">${word.word}</span>`; 
			// 	paragraphData.element.innerHTML += wordElement;
			// });

			const paragraphs: ParagraphData[] = splitUpParagraph(paragraphData);
			console.log(paragraphs);
			paragraphs.forEach((paragraph: ParagraphData) => {
				paragraph.element.style.top = paragraph.words[0].top;
				paragraph.element.style.left = paragraph.words[0].left;
				paragraph.element.style.position = 'absolute';
				paragraph.element.classList.add(...paragraph.mainClass.split(' '));

				paragraph.words.forEach((word: WordData) => {
					const wordElement: string = word.class === paragraph.mainClass 
						? ` ${word.word}`
						: ` <span class="${word.class}">${word.word}</span>`; 
					paragraph.element.innerHTML += wordElement;
				});
			});

			if (paragraphs.length > 1) {
				for (let i = 1; i < paragraphs.length; i++) {
					paragraphs[i - 1].element.insertAdjacentElement("afterend", paragraphs[i].element);
				}
			}
		});
}

function calculateParagraphWidth(paragraph: ParagraphData): number {
	let maxX = 0;
	let minX = 0;
	paragraph.words.forEach((word: WordData) => {
		const endOfWord: number = removePx(word.left) + word.width;
		const startOfWord: number = removePx(word.left)
		if (endOfWord > maxX) {
			maxX = endOfWord;
		}
		if (startOfWord < minX) {
			minX = startOfWord;
		}
	});

	const width: number = maxX - minX;

	return width;
}

function removePx(value: string): number {
	return parseInt(value.replace('px', ''));
}

function extractWordDataFromParagraph(paragraph: HTMLElement): ParagraphData {
	const spans: HTMLElement[] = Array.from(paragraph.querySelectorAll('span'));
	const words: WordData[] = spans.map((span: HTMLElement) => {
		return {
			word: span.innerHTML.trim(), 
			paragraph: 0, 
			class: span.className,
			left: span.style.left,
			screenLeft: Math.round(span.getBoundingClientRect().left),
			top: span.style.top,
			width: span.clientWidth,
		};
	}).filter((word: WordData) => word.word !== '');


	return {
		mainClass: determineParagraphMainClass(words),
		words: words,
		element: paragraph
	};
}

function determineParagraphMainClass(words: WordData[]): string {
	const classMap: {[className: string]: number;} = {};
	let most = 0;
	let mostClass: string = words[0].class;
	words.forEach((word: WordData) => {
		if (classMap[word.class]) {
			classMap[word.class]++;
		} else {
			classMap[word.class] = 1;
		}

		if (classMap[word.class] > most) {
			most = classMap[word.class];
			mostClass = word.class;
		}
	});

	return mostClass;
}

function splitUpParagraph(paragraph: ParagraphData): ParagraphData[] {
	const paragraphs: ParagraphData[] = [paragraph];

	const words: WordData[] = [...paragraph.words];
	let currentTopPosition: string = paragraph.words[0].top;
	let currentParagraph: ParagraphData = paragraph;
	paragraph.words = [];

	words.forEach((word: WordData) => {
		if (word.top !== currentTopPosition) {
			const newParagraph: ParagraphData = {
				element: document.createElement('p'),
				mainClass: '',
				words: [word]
			};
			paragraphs.push(newParagraph);
			currentTopPosition = word.top;
			currentParagraph = newParagraph;
		} else {
			currentParagraph.words.push(word);
		}
	});

	paragraphs.forEach((paragraphData: ParagraphData) => {
		paragraphData.mainClass = determineParagraphMainClass(paragraphData.words);
	});

	return paragraphs;
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
	fixParagraphs(rootElement);
}

const deleteButton: HTMLButtonElement | null = document.getElementById('delete-button') as HTMLButtonElement;
let activeElement: HTMLElement | null = document.activeElement as HTMLElement;

if (deleteButton) {
	deleteButton.disabled = true;
	deleteButton.addEventListener('mousedown', () => {
		document.activeElement?.remove();
	} );

	document.getElementById('app')?.addEventListener('click', () => {
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
		activeElement.style.fontFamily = (value.target as HTMLSelectElement).value;


	} );
}

loadPages('app', 'CHNL60L_03_p59-90', 2);


export {};