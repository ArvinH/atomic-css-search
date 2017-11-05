// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const flattenDeep = require('lodash/flattenDeep');
const Rules = require('atomizer/src/rules');

function insertText(text) {
    var editor = vscode.window.activeTextEditor;
    editor.edit(function (editBuilder) {
        editBuilder.delete(editor.selection);
    }).then(function () {
        editor.edit(function (editBuilder) {
            editBuilder.insert(editor.selection.start, text);
        });
    });
}

function replaceRTLTokens(str = '') {
    if (typeof str !== 'string') {
        return str;
    }
    return str.replace(/__START__/g, 'left').replace(/__END__/g, 'right');
}

let processedRules;
try {
    processedRules = JSON.stringify(Rules);
    processedRules = replaceRTLTokens(processedRules);
    processedRules = JSON.parse(processedRules);
} catch (e) {
    processedRules = Rules;
    console.error('[ACSS searcher] process rules failed');
}

/* const regex = new RegExp(`${searchText}`, 'i');
const result = processedRules.filter(rule => {
    return rule.name.search(regex) > -1 || rule.matcher.search(regex) > -1;
}); */
const CUSTOM_PARAM = '<custom-param>';
const VALUE = '<value> or ';
const ruleArray = processedRules.map(rule => {
    const { allowParamToValue, arguments: { '0': argument = {} } = [], matcher, styles } = rule;
    const styleNames = Object.keys(styles);
    const matcherValueString = allowParamToValue ? VALUE : '';
    const acssClass = `${matcher}(${matcherValueString}${CUSTOM_PARAM})`;
    const styleClass = styleNames.map((styleName) => `${styleName}:value`);
    const mainClass = `${acssClass} ${styleClass}`;
    const subClass = Object.keys(argument).map(key => {
        const keyClass = `${matcher}(${key})`;
        const valueClass = styleNames.map((styleName) => `${styleName}: ${argument[key]}`);
        return `${keyClass} ${valueClass}`;
    })
    return [
        mainClass,
        ...subClass,
    ];
});
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "atomic-css-search" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.searchAtomic', function () {
        // The code you place here will be executed every time your command is executed

        vscode.window.showQuickPick(flattenDeep(ruleArray), {
            placeHolder: ''
        })
        .then(selected => {
            const selectedClass = selected.split(') ');
            const finalClass = `${selectedClass[0]}) `;
            insertText(finalClass);
        });
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;