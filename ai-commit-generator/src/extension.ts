import * as vscode from "vscode";
import { exec } from "child_process";
import axios from "axios";

interface CommitResponse {
  commitMessage: string;
  alternatives: string[];
  typeLabels: string[];
  prTitle: string;
  prBody: string;
}

async function getGitDiff(): Promise<string> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage("No workspace folder open.");
    return "";
  }
  const cwd = workspaceFolders[0].uri.fsPath;

  return new Promise((resolve, reject) => {
    exec("git diff HEAD", { cwd }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
}

async function fetchCommitSuggestions(diff: string): Promise<CommitResponse> {
  const res = await axios.post<CommitResponse>("http://localhost:8080/api/commit/generate", {
    diffContent: diff,
    style: "CONVENTIONAL",
    numAlternatives: 2,
    generatePr: true
  }, { timeout: 30000 });
  return res.data;
}

function showWebview(response: CommitResponse) {
  const panel = vscode.window.createWebviewPanel(
    "aiCommitGenerator",
    "AI Commit Messages",
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = `
    <html>
      <body style="font-family: sans-serif; padding: 10px;">
        <h2>Primary Commit Message</h2>
        <p>${response.commitMessage || "<i>(none)</i>"}</p>

        ${response.alternatives && response.alternatives.length > 0 ? `
          <h3>Alternatives</h3>
          <ul>${response.alternatives.map(a => `<li>${a}</li>`).join("")}</ul>
        ` : ""}

        ${response.typeLabels && response.typeLabels.length > 0 ? `
          <h3>Labels</h3>
          <p>${response.typeLabels.join(", ")}</p>
        ` : ""}

        ${response.prTitle ? `<h3>PR Title</h3><p>${response.prTitle}</p>` : ""}
        ${response.prBody ? `<h3>PR Body</h3><pre>${response.prBody}</pre>` : ""}
      </body>
    </html>
  `;
}

export function activate(context: vscode.ExtensionContext) {
  const cmdId = "ai-commit-generator.generateCommit";

  let disposable = vscode.commands.registerCommand(cmdId, async () => {
    try {
      await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Generating AI Commit Message...",
        cancellable: false
      }, async () => {
        const diff = await getGitDiff();
        if (!diff || diff.trim().length === 0) {
          vscode.window.showErrorMessage("No changes detected in git (git diff returned empty).");
          return;
        }
        // call backend
        let response: CommitResponse;
        try {
          response = await fetchCommitSuggestions(diff);
        } catch (err: any) {
          vscode.window.showErrorMessage("Failed to fetch from backend: " + (err?.message || err));
          return;
        }
        showWebview(response);
      });
    } catch (err: any) {
      vscode.window.showErrorMessage("Error generating commit: " + (err?.message || err));
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
