/*
 * @Author: haobin.wang
 * @Date: 2024-12-25 10:13:50
 * @LastEditors: haobin.wang
 * @LastEditTime: 2024-12-25 14:37:56
 * @Description: Do not edit
 */
import * as vscode from "vscode";
const fs = require("fs");
export default (
  context: vscode.ExtensionContext,
  fileSizeStatusBarItem: vscode.StatusBarItem
) => {
  let disposable = vscode.commands.registerCommand(
    "pagViewer.fileDetail",
    (uri) => {
      console.log("uri8", uri);
      // 获取文件大小
      if (!uri) {
        fileSizeStatusBarItem.hide();
        return;
      }
      fileSizeStatusBarItem.hide(); // 默认隐藏
      context.subscriptions.push(fileSizeStatusBarItem);
      // 获取文件的基本信息
      const filePath = uri.fsPath;
      // 使用 Node.js fs 模块获取文件信息
      fs.stat(filePath, (err: any, stats: any) => {
        if (err) {
          vscode.window.showErrorMessage(`无法获取文件信息: ${err}`);
          return;
        }
        if (stats.isDirectory()) {
          vscode.window.showWarningMessage(`请选择文件类型`);
          return;
        }

        // 获取文件的大小、创建时间、最后修改时间
        let fileSize = stats.size; // 文件大小以字节为单位
        let fileSizeDisplay = "";
        if (fileSize >= 1024 * 1024) {
          fileSizeDisplay = (fileSize / (1024 * 1024)).toFixed(2) + " MB";
        } else {
          fileSizeDisplay = (fileSize / 1024).toFixed(2) + " KB";
        }
        fileSizeStatusBarItem.text = `pag: ${fileSizeDisplay}`;
        fileSizeStatusBarItem.show();
      });
    }
  );
  const handleFileChange = (filePath: string) => {
    if (!filePath || !filePath.endsWith(".pag")) {
      fileSizeStatusBarItem.hide();
    }
  };
  // 监听文件切换
  // context.subscriptions.push(
  // );
  vscode.window.onDidChangeActiveTextEditor((editor: any) => {
    console.log("文件切换了", editor.document.fileName);
    handleFileChange(editor.document.fileName);
  });

  // 监听文件关闭，有时候不执行
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      console.log("文件关闭了", document.fileName);
    })
  );
  return disposable;
};
