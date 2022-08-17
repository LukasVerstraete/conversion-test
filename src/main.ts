const standardCSSFilenames: string[] = [
	'idGeneratedStyles.css',
	'myCustomCSS.css'
];

async function loadPages(
	rootElementId: string,
	project: string,
	pageCount: number
): Promise<void> {
	const rootElement: HTMLElement | null =
		document.getElementById(rootElementId);
	if (rootElement === null) return;

	await loadCSSFiles(rootElement, project);

	const pages: string[] = await fetchPageContent(project, pageCount);

	showContent(rootElement, pages);
}

async function loadCSSFiles(
	rootElement: HTMLElement,
	projectName: string
): Promise<void> {
	for (let i = 0; i < standardCSSFilenames.length; i++) {
		const cssFilename: string = standardCSSFilenames[i];
		const cssFilePath = `./${projectName}/${projectName}-web-resources/css/${cssFilename}`;
		const cssFile: Response = await fetch(cssFilePath);
		const cssFileText: string = await cssFile.text();
		const cssElement: HTMLElement = document.createElement('style');
		cssElement.innerHTML = cssFileText;
		rootElement.appendChild(cssElement);
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

	console.log(content[0]);

	return content;
}

function getBodyContentText(projectName: string, htmlText: string): string {
	const tempElement: HTMLElement = document.createElement('div');
	tempElement.innerHTML = htmlText;

	const bodyElement: HTMLElement | null = tempElement.querySelector('div');

	if (bodyElement === null) return '';

	const fix = true;

	const fixedSrc: string = fixImageLinks(
		projectName,
		bodyElement.innerHTML.trim()
	);

	return fix ? fixedSrc : bodyElement.innerHTML.trim();
}

function fixImageLinks(projectName: string, htmlText: string): string {
	return htmlText.replaceAll(
		new RegExp(`${projectName}-web-resources/image`, 'g'),
		`${projectName}/${projectName}-web-resources/image/`
	);
}

function showContent(rootElement: HTMLElement, pages: string[]): void {
	pages.forEach((page: string, index: number) => {
		const pageElement: HTMLElement = document.createElement('div');
		pageElement.id = `page-${index}`;
		pageElement.classList.add('page');
		pageElement.style.position = 'relative';
		pageElement.innerHTML = page;
		rootElement.appendChild(pageElement);
	});
}

function fixPagePositioning(rootElement: HTMLElement): void {
	const pages: HTMLElement[] = Array.from(
		rootElement.querySelectorAll('.page >div')
	);
	pages.forEach((page: HTMLElement, index: number) => {
		page.style.position = 'fixed';
	});
}

loadPages('app', 'CHNL60L_03_p59-90', 2);

export {};
