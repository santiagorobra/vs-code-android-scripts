import * as vscode from "vscode";

let terminal: vscode.Terminal | undefined;
let savedEnvironment: string | undefined;

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "android-scripts.chooseCommand",
    async () => {
      if (!terminal) {
        terminal = vscode.window.createTerminal("Android Scripts");
      }

      const selectedOption = await vscode.window.showQuickPick(
        ["Assemble", "Open APK Folder", "Clean Build"],
        {
          placeHolder: "Select a command to execute",
        }
      );

      if (selectedOption) {
        let command = "";
        switch (selectedOption) {
          case "Assemble":
            const environment = await getEnvironment(
              "Enter the environment (optional) for assembling:"
            );
            if (environment !== undefined) {
              command = `cd ./android && ./gradlew assemble${environment} && cd ..`;
            } else {
              command = `cd ./android && ./gradlew assemble && cd ..`;
            }
            break;
          case "Open APK Folder":
            command = "open android/app/build/outputs/apk";
            break;
          case "Clean Build":
            command = "cd android && ./gradlew clean && cd ..";
            break;
          default:
            break;
        }

        if (command) {
          await runCommand(command);
          if (!terminal) {
            terminal = vscode.window.createTerminal("Android Scripts");
          }
          terminal.show();
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

async function getEnvironment(prompt: string): Promise<string | undefined> {
  if (savedEnvironment) {
    const useSaved = await vscode.window.showQuickPick(
      ["Use Saved", "Enter Manually"],
      {
        placeHolder: `Use saved environment "${savedEnvironment}" or enter a new one:`,
      }
    );
    if (useSaved === "Use Saved") {
      return savedEnvironment;
    }
  }
  const environment = await vscode.window.showInputBox({
    placeHolder: "Enter the environment (e.g., dev, prod)",
    prompt,
  });
  if (environment) {
    savedEnvironment = environment;
  }
  return environment;
}

async function runCommand(command: string) {
  return new Promise<void>((resolve, reject) => {
    if (terminal) {
      terminal.sendText(command);
      terminal.sendText(
        'echo "Command executed: ' + command + '" && echo "";',
        true
      );
      setTimeout(resolve, 1000);
    } else {
      reject("Terminal not available.");
    }
  });
}

export function deactivate() {}
