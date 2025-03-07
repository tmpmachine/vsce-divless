const vscode = require('vscode');
const divless = require('./divless.js');

async function fileExists(uri) {
	try {
		await vscode.workspace.fs.stat(uri);
		return true;
	} catch {
		return false;
	}
}

async function createDirectory(uri) {
	await vscode.workspace.fs.createDirectory(uri);
}

async function writeFile(uri, content) {
	const encoder = new TextEncoder();
	await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
}

async function readFile(uri) {
	const decoder = new TextDecoder();
	const data = await vscode.workspace.fs.readFile(uri);
	return decoder.decode(data);
}

function getFileName(uri) {
	return uri.path.split('/').pop();
}

function getFileExtension(uri) {
	return getFileName(uri).split('.').pop();
}

function activate(context) {
	let activeCommandListener = vscode.commands.registerCommand(
		'divlesshtml.createDivlessHTMLFile',
		async function () {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor');
				return;
			}

			const document = editor.document;
			const currentFileUri = document.uri;
			const currentFileDir = vscode.Uri.joinPath(currentFileUri, '..');
			const currentFileName = getFileName(currentFileUri);
			const currentExt = getFileExtension(currentFileUri);

			const divlessDirUri = vscode.Uri.joinPath(currentFileDir, '.divless');
			const divlessFileUri = vscode.Uri.joinPath(
				divlessDirUri,
				currentFileName.replace(`.${currentExt}`, `.divless.${currentExt}`)
			);

			if (!(await fileExists(divlessDirUri))) {
				await createDirectory(divlessDirUri);
			}

			if (!(await fileExists(divlessFileUri))) {
				const content = document.getText();
				await writeFile(divlessFileUri, content);
			}

			const doc = await vscode.workspace.openTextDocument(divlessFileUri);
			vscode.window.showTextDocument(doc);
		}
	);

	const openFileListener = vscode.workspace.onDidOpenTextDocument(
		async (event) => {
			const currentExt = getFileExtension(event.uri);
			if (event.fileName.includes(`.divless.${currentExt}`)) {
				return;
			}

			const currentFileUri = event.uri;
			const currentFileDir = vscode.Uri.joinPath(currentFileUri, '..');
			const currentFileName = getFileName(currentFileUri);
			const divlessFileUri = vscode.Uri.joinPath(
				currentFileDir,
				'.divless',
				currentFileName.replace(`.${currentExt}`, `.divless.${currentExt}`)
			);

			if (await fileExists(divlessFileUri)) {
				const openFileAction = 'Open divless File';
				vscode.window
					.showInformationMessage(
						'A divless version of this file exists. Avoid making changes to this file.',
						openFileAction
					)
					.then((selection) => {
						if (selection === openFileAction) {
							vscode.commands.executeCommand('vscode.open', divlessFileUri);
						}
					});
			}
		}
	);

	const saveListener = vscode.workspace.onDidSaveTextDocument(async (event) => {
		try {
			const currentExt = getFileExtension(event.uri);
			if (!event.fileName.includes(`.divless.${currentExt}`)) {
				return;
			}

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor');
				return;
			}

			const document = editor.document;
			const currentFileUri = document.uri;
			const currentFileDir = vscode.Uri.joinPath(currentFileUri, '..');
			const parentDirUri = vscode.Uri.joinPath(currentFileDir, '..');
			const currentFileName = getFileName(currentFileUri);

			const finalUri = vscode.Uri.joinPath(
				parentDirUri,
				currentFileName.replace(`.divless.${currentExt}`, `.${currentExt}`)
			);
			const content = event.getText();
			await writeFile(finalUri, divless.myFunction.replace(content));
		} catch (e) {
			console.error(e);
		}
	});

	context.subscriptions.push(activeCommandListener);
	context.subscriptions.push(openFileListener);
	context.subscriptions.push(saveListener);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
