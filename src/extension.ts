import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('android-scripts.chooseCommand', async () => {
        const selectedOption = await vscode.window.showQuickPick(['Assemble QA', 'Open APK Folder', 'Clean Build'], {
            placeHolder: 'Select a command to execute'
        });

        if (selectedOption) {
            const terminal = vscode.window.createTerminal('Android Scripts');
            switch (selectedOption) {
                case 'Assemble QA':
                    await runCommand(terminal, 'cd ./android && ./gradlew assembleQa && cd ..');
                    break;
                case 'Open APK Folder':
                    await runCommand(terminal, 'open android/app/build/outputs/apk');
                    break;
                case 'Clean Build':
                    await runCommand(terminal, 'cd android && ./gradlew clean && cd ..');
                    break;
                default:
                    break;
            }

            terminal.show();
        }
    });

    context.subscriptions.push(disposable);
}

async function runCommand(terminal: vscode.Terminal, command: string) {
    return new Promise<void>((resolve, reject) => {
        terminal.sendText(command);
        terminal.sendText('echo "Command executed: ' + command + '" && echo "";', true);
        setTimeout(resolve, 1000);
    });
}

export function deactivate() {}
