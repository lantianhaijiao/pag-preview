/*
 * @Author: haobin.wang
 * @Date: 2024-12-17 11:50:59
 * @LastEditors: haobin.wang
 * @LastEditTime: 2025-03-30 09:57:24
 * @Description: Do not edit
 */
import * as vscode from "vscode";
const path = require("path");
const fs = require("fs");
class PagCustomDocument implements vscode.CustomDocument {
  uri: vscode.Uri;

  constructor(uri: vscode.Uri) {
    this.uri = uri;
  }

  dispose(): void {
    // 如果需要清理资源，可以在这里实现
  }
}

class PagCustomEditorProvider
  implements vscode.CustomReadonlyEditorProvider<PagCustomDocument>
{
  public static readonly viewType = "pagViewer.editor";
  private initializedWebviews: Map<string, vscode.WebviewPanel> = new Map();

  constructor(private readonly context: vscode.ExtensionContext) {}

  /**
   * openCustomDocument 方法，用于打开自定义文档
   */
  public openCustomDocument(
    uri: vscode.Uri,
    _openContext: vscode.CustomDocumentOpenContext,
    _token: vscode.CancellationToken
  ): vscode.CustomDocument | Thenable<vscode.CustomDocument> {
    // 创建并返回自定义文档实例
    return new PagCustomDocument(uri);
  }

  /**
   * resolveCustomEditor 方法，在文件被打开时触发
   */
  public async resolveCustomEditor(
    document: PagCustomDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    console.log(`Opening file: ${document.uri.fsPath}`);
    const documentUri = document.uri.toString();

    // vscode指令通信
    vscode.commands.executeCommand("pagViewer.fileDetail", document.uri);
    if (this.initializedWebviews.has(documentUri)) {
      console.log("Webview already initialized, skipping HTML update.");
      return;
    }
    // 设置 Webview 选项
    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(this.context.extensionPath, "dist")),
        vscode.Uri.file(path.dirname(document.uri.fsPath)),
      ],
    };

    // 将文件 URI 转为 Webview 可访问的路径
    const fileUri = webviewPanel.webview.asWebviewUri(document.uri);
    // console.log("uri--", fileUri.toString());
    const htmlPath = path.join(
      this.context.extensionPath,
      "dist/webview/pag.html"
    );
    // console.log("htmlPath", htmlPath);
    const htmlContent = fs.readFileSync(htmlPath, "utf-8");
    const fastDiffUri = webviewPanel.webview.asWebviewUri(
      vscode.Uri.file(
        path.join(this.context.extensionPath, "dist/webview/pag.min.js")
      )
    );
    const updatedHtmlContent = htmlContent.replace("./pag.min.js", fastDiffUri);
    // 设置 Webview 内容
    webviewPanel.webview.html = updatedHtmlContent;
     // 存储 Webview Panel 引用
    this.initializedWebviews.set(documentUri, webviewPanel);
    // 将文件内容发送到 Webview
    const noticeWebviewFile = () => {
      webviewPanel.webview.postMessage({
        type: "loadFile",
        fileUri: fileUri.toString(),
      });
    };
    noticeWebviewFile();

    // 监听来自 Webview 的消息
    webviewPanel.webview.onDidReceiveMessage((message) => {
      if (message.command === "alert") {
        vscode.window.showInformationMessage(message.text);
      }
    });
    // 处理自定义编辑器生命周期
    webviewPanel.onDidDispose(() => {
      console.log('pag文件关闭');
      this.initializedWebviews.delete(documentUri);
      vscode.commands.executeCommand("pagViewer.fileDetail");
    });
    // 监听 Webview 面板的可见性变化
    webviewPanel.onDidChangeViewState((event) => {
      if (event.webviewPanel.visible) {
        // noticeWebviewFile();
        vscode.commands.executeCommand("pagViewer.fileDetail", document.uri);
      }
    });
  }
}
export default (context: vscode.ExtensionContext) => {
  console.log("PAG Custom Editor Activated!");

  let disposable = vscode.window.registerCustomEditorProvider(
    PagCustomEditorProvider.viewType,
    new PagCustomEditorProvider(context),
    {
      webviewOptions: {
        retainContextWhenHidden: true, // 切换标签时保留上下文
      },
    }
  );
  return disposable;
};
