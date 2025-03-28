/*
 * @Author: haobin.wang
 * @Date: 2024-12-17 11:43:12
 * @LastEditors: haobin.wang
 * @LastEditTime: 2024-12-25 11:13:39
 * @Description: Do not edit
 */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import PagPreview from './plugins/pag-preview';
import FileSize from './plugins/file-size';
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let fileSizeStatusBarItem: vscode.StatusBarItem;
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "pag-preview" is now active!');

  fileSizeStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('pag-preview.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Pag Preview!');
	});

	context.subscriptions.push(disposable);
  context.subscriptions.push(PagPreview(context));
  context.subscriptions.push(FileSize(context, fileSizeStatusBarItem));
}

// This method is called when your extension is deactivated
export function deactivate() {
  // 清理状态栏项
  if (fileSizeStatusBarItem) {
    fileSizeStatusBarItem.dispose();
  }
}
