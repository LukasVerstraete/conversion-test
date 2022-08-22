const standardCSSFilenames: string[] = [
	'idGeneratedStyles.css'
	// 'myCustomCSS.css'
];

const standardScriptFilenames: string[] = ['FontData.js'];

export async function loadPages(
	rootElementId: string,
	project: string,
	pageNumber: number
): Promise<void> {
	const rootElement: HTMLElement | null =
		document.getElementById(rootElementId);
	if (rootElement === null) return;

	clearStyles();

	rootElement.innerHTML = '';

	await loadScripts(rootElement, project);
	await loadCSSFiles(rootElement, project);

	const page: string = await fetchPageContent(project, pageNumber);
	const pageElement: HTMLElement = createPageElements(page);

	showContent(rootElement, pageElement);
	makeContentEditable(rootElement);
}

function clearStyles(): void {
	document.querySelector('head')!.querySelectorAll('style').forEach((element: HTMLStyleElement) => {
		if (!element.attributes.getNamedItem('type')) {
			element.remove();
		}
	});
}

async function loadCSSFiles(
	rootElement: HTMLElement,
	projectName: string
): Promise<void> {
	for (let i = 0; i < standardCSSFilenames.length; i++) {
		const cssFilename: string = standardCSSFilenames[i];
		const cssFilePath = `./${projectName}/${projectName}-web-resources/css/${cssFilename}`;
		const cssFile: Response = await fetch(cssFilePath);
		const cssFileText: string = (await cssFile.text()).replaceAll(
			new RegExp('span', 'g'),
			''
		);
		const urlFixedFileText: string = cssFileText.replaceAll(
			new RegExp('../image', 'g'),
			`../${projectName}/${projectName}-web-resources/image/`
		);
		const cssElement: HTMLElement = document.createElement('style');
		cssElement.innerHTML = urlFixedFileText;
		rootElement.appendChild(cssElement);
	}
}

async function loadScripts(
	rootElement: HTMLElement,
	projectName: string
): Promise<void> {
	for (let i = 0; i < standardScriptFilenames.length; i++) {
		const scriptFileName: string = standardScriptFilenames[i];
		const scriptFilePath = `./${projectName}/${projectName}-web-resources/script/${scriptFileName}`;
		const scriptFile: Response = await fetch(scriptFilePath);
		const scriptFileText: string = await scriptFile.text();
		const scriptElement: HTMLElement = document.createElement('script');
		scriptElement.innerHTML = scriptFileText;
		rootElement.appendChild(scriptElement);
	}
}

async function fetchPageContent(
	projectName: string,
	pageNumber: number
): Promise<string> {
	// for (let i = 0; i < pageNumber; i++) {
	const response: Response = await fetch(
		`./${projectName}/${projectName}${
			pageNumber > 0 ? '-' + pageNumber : ''
		}.html`
	);
	const fullPage: string = await response.text();
	return getBodyContentText(projectName, fullPage);
	// }
}

function getBodyContentText(projectName: string, htmlText: string): string {
	const tempElement: HTMLElement = document.createElement('div');
	const fixedSrc: string = fixImageLinks(projectName, htmlText.trim());
	tempElement.innerHTML = fixedSrc;

	const bodyElement: HTMLElement | null = tempElement.querySelector('div');

	if (bodyElement === null) return '';

	return bodyElement.innerHTML.trim();
}

function fixImageLinks(projectName: string, htmlText: string): string {
	// console.log(htmlText.fi);

	return htmlText.replaceAll(
		new RegExp(`${projectName}-web-resources/image`, 'g'),
		`${projectName}/${projectName}-web-resources/image/`
	);
}

function createPageElements(page: string): HTMLElement {
	const pageElement: HTMLElement = document.createElement('div');
	pageElement.id = `page`;
	pageElement.classList.add('page');
	pageElement.style.position = 'relative';
	pageElement.innerHTML = page;

	return pageElement;
}

function calculatePageBounds(pageElement: HTMLElement): void {
	let maxX = 0;
	let maxY = 0;

	pageElement.childNodes.forEach((child: ChildNode) => {
		if (!(child instanceof HTMLElement)) return;
		const childElement: HTMLElement = child as HTMLElement;
		const style: CSSStyleDeclaration =
			window.getComputedStyle(childElement);
		const x: number = Number.parseInt(
			style.getPropertyValue('left').replace('px', '')
		);
		const y: number = Number.parseInt(
			style.getPropertyValue('top').replace('px', '')
		);

		const width: number = Number.parseInt(
			style.getPropertyValue('width').replace('px', '')
		);
		const height: number = Number.parseInt(
			style.getPropertyValue('height').replace('px', '')
		);

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
	Array.from(rootElement.querySelectorAll('p')).forEach(
		(paragraphElement: HTMLElement) => {
			const paragraphData: ParagraphData =
				extractWordDataFromParagraph(paragraphElement);

			// const width: string = calculateParagraphWidth(paragraphData) + 'px';

			paragraphElement.innerHTML = '';

			if (!paragraphData.words.length) {
				paragraphElement.remove();
				return;
			}

			// paragraphData.element.style.top = paragraphData.words[0].top;
			// paragraphData.element.style.left = paragraphData.words[0].left;
			// paragraphData.element.style.position = 'absolute';
			// paragraphData.element.style.maxWidth = width;
			// paragraphData.element.style.whiteSpace = 'normal';
			// paragraphData.element.classList.add(
			// 	...paragraphData.mainClass.split(' ')
			// );

			// paragraphData.words.forEach((word: WordData) => {
			// 	const wordElement: string =
			// 		word.class === paragraphData.mainClass
			// 			? ` ${word.word}`
			// 			: ` <span class="${word.class}">${word.word}</span>`;
			// 	paragraphData.element.innerHTML += wordElement;
			// });

			const paragraphs: ParagraphData[] = splitUpParagraph(paragraphData);
			// console.log(paragraphs);
			paragraphs.forEach((paragraph: ParagraphData) => {
				paragraph.element.style.top = paragraph.words[0].top;
				paragraph.element.style.left = paragraph.words[0].left;
				paragraph.element.style.position = 'absolute';
				paragraph.element.classList.add(
					...paragraph.mainClass.split(' ')
				);

				paragraph.words.forEach((word: WordData) => {
					const wordElement: string =
						word.class === paragraph.mainClass
							? ` ${word.word}`
							: ` <span class="${word.class}">${word.word}</span>`;
					paragraph.element.innerHTML += wordElement;
				});
			});

			if (paragraphs.length > 1) {
				for (let i = 1; i < paragraphs.length; i++) {
					paragraphs[i - 1].element.insertAdjacentElement(
						'afterend',
						paragraphs[i].element
					);
				}
			}
		}
	);
}

function calculateParagraphWidth(paragraph: ParagraphData): number {
	let maxX = 0;
	let minX = 0;
	paragraph.words.forEach((word: WordData) => {
		const endOfWord: number = removePx(word.left) + word.width;
		const startOfWord: number = removePx(word.left);
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
	const words: WordData[] = spans
		.map((span: HTMLElement) => {
			return {
				word: span.innerHTML.trim(),
				paragraph: 0,
				class: span.className,
				left: span.style.left,
				screenLeft: Math.round(span.getBoundingClientRect().left),
				top: span.style.top,
				width: span.clientWidth
			};
		})
		.filter((word: WordData) => word.word !== '');

	return {
		mainClass: determineParagraphMainClass(words),
		words: words,
		element: paragraph
	};
}

function determineParagraphMainClass(words: WordData[]): string {
	if (!words.length) return '';
	const classMap: { [className: string]: number } = {};
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
	if (!paragraph.words.length) return paragraphs;

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
		paragraphData.mainClass = determineParagraphMainClass(
			paragraphData.words
		);
	});

	return paragraphs;
}

function makeContentEditable(rootElement: HTMLElement): void {
	Array.from(rootElement.querySelectorAll('p')).forEach(
		(paragraph: HTMLElement) => {
			paragraph.contentEditable = 'true';
		}
	);
}

function showContent(rootElement: HTMLElement, page: HTMLElement): void {
	// pages.forEach((page: HTMLElement) => {
	rootElement.appendChild(page);
	calculatePageBounds(page);
	// });
	fixParagraphs(rootElement);
}
