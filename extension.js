const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const divless = require('./divless.js');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

	let activeCommandListener = vscode.commands.registerCommand('divlesshtml.createDivlessHTMLFile', function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
		  vscode.window.showErrorMessage('No active editor');
		  return;
		}
	  
		const document = editor.document;
		const currentFilePath = document.uri.fsPath;
		const currentFileDir = path.dirname(currentFilePath);
		const currentFileName = path.basename(currentFilePath);
		const currentExt = path.extname(currentFilePath);
	  
		const divlessDirPath = path.join(currentFileDir, '.divless');
		const divlessFilePath = path.join(divlessDirPath, currentFileName.replace(`${currentExt}`, `.divless${currentExt}`));
	  
		if (!fs.existsSync(divlessDirPath)) {
		  fs.mkdirSync(divlessDirPath);
		}
	  
		if (!fs.existsSync(divlessFilePath)) {
		  const content = document.getText();
		  fs.writeFileSync(divlessFilePath, content);
		}
	  
		vscode.workspace.openTextDocument(divlessFilePath).then((document) => {
		  vscode.window.showTextDocument(document);
		});
	});
	  
	const openFileListener = vscode.workspace.onDidOpenTextDocument(async event => {
		const currentExt = path.extname(event.fileName);
		if (event.fileName.includes(`.divless${currentExt}`)) {
			return;
		}
	
		const currentFilePath = getFilePathFromUri(vscode.Uri.file(event.fileName));
		const currentFileDir = path.dirname(currentFilePath);
		const currentFileName = path.basename(currentFilePath);
		const divlessFilePath = path.join(currentFileDir, '.divless', currentFileName.replace(`${currentExt}`, `.divless${currentExt}`));
	
		if (fs.existsSync(divlessFilePath)) {
			const divlessFileUri = vscode.Uri.file(divlessFilePath);
			// const document = await vscode.workspace.openTextDocument(divlessFileUri);
			// await vscode.window.showTextDocument(document, { viewColumn: vscode.ViewColumn.Active, preserveFocus: true });

			// const filePath = divlessFileUri; // Replace with the desired file path

			const openFileAction = 'Open divless File';
			vscode.window.showInformationMessage('A divless version of this file is exists. Avoid making changes to this file.', openFileAction)
			.then(selection => {
				if (selection === openFileAction) {
					vscode.commands.executeCommand('vscode.open', divlessFileUri);
				}
			});
		}
	});

	function getFilePathFromUri(uri) {
		if (uri.scheme === 'file') {
		  return uri.fsPath;
		} else {
		  // Handle other schemes like 'untitled'
		  return null;
		}
	}

	const saveListener = vscode.workspace.onDidSaveTextDocument((event) => {
		try {
			const currentExt = path.extname(event.fileName);
			if (!event.fileName.includes(`.divless${currentExt}`)) {
				return;
			}

			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active editor');
				return;
			}
			const document = editor.document;
			const currentFilePath = document.uri.fsPath;
			const currentFileDir = path.dirname(currentFilePath);
    		const parentDirPath = path.dirname(currentFileDir);
			const currentFileName = path.basename(currentFilePath);

			const finalPath = path.join(parentDirPath, currentFileName.replace(`.divless${currentExt}`, `${currentExt}`));
			const content = event.getText();
			fs.writeFileSync(finalPath, divless.myFunction.replace(content));
		} catch (e) {
			console.error(e)
		}
	});
	
	context.subscriptions.push(activeCommandListener);
	context.subscriptions.push(openFileListener);
	context.subscriptions.push(saveListener);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}