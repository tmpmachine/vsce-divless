const vscode = require('vscode');
const divless = require('./divless.js');

async function writeFile(uri, content) {
	const encoder = new TextEncoder();
	await vscode.workspace.fs.writeFile(uri, encoder.encode(content));
}

function getFileName(uri) {
	return uri.path.split('/').pop();
}

function activate(context) {
	const saveListener = vscode.workspace.onDidSaveTextDocument(async (event) => {
		try {
			// Ensure the file is one of the allowed types
			const allowedExtensions = ['.html', '.htm', '.razor', '.vue', '.xml'];
			const fileExt = event.fileName.split('.').pop();
			if (!allowedExtensions.includes(`.${fileExt}`)) {
				return; // Exit if not an allowed file type
			}

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				return;
			}

			const document = editor.document;
			const currentFileUri = document.uri;
			const currentFileDir = vscode.Uri.joinPath(currentFileUri, '..');
			const currentDirUri = vscode.Uri.joinPath(currentFileDir);
			const parentDirUri = vscode.Uri.joinPath(currentFileDir, '..');
			const currentFileName = getFileName(currentFileUri);
			const parentDirName = currentDirUri.path.split('/').pop();

			if (parentDirName !== '.divless') {
				return; // Exit if not inside ".divless"
			}

			const finalUri = vscode.Uri.joinPath(parentDirUri, currentFileName);
			const content = event.getText();
			await writeFile(finalUri, divless.myFunction.replace(content));
		} catch (e) {
			console.error(e);
		}
	});

	context.subscriptions.push(saveListener);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
