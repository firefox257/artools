function transformModuleStringToDynamicImport(moduleString) {
    let transformedString = moduleString

    // Regex to find various import formats. This is a simplified approach.
    // It tries to capture the key parts: variable names, module path.
    // It's important to handle different syntaxes:
    // import * as ui from "file.js"
    // import ui from "file.js"
    // import { named } from "file.js"
    // import { name1, name2 } from "file.js"
    // import { original as alias } from "file.js"
    // import "file.js" // Side effects only

    // Regex for: import * as variable from "module-path"
    transformedString = transformedString.replace(
        /import\s+\*\s+as\s+(\w+)\s+from\s+["'](.*?)["'];?/g,
        'var $1 = await import("$2");'
    )

    // Regex for: import variable from "module-path"
    // Need to capture the default export specifically
    transformedString = transformedString.replace(
        /import\s+([\w_$]+)\s+from\s+["'](.*?)["'];?/g,
        'var __module_$2_import = await import("$2"); var $1 = __module_$2_import.default;'
    )

    // Regex for: import { named } from "module-path"
    // Regex for: import { name1, name2 } from "module-path"
    // Regex for: import { original as alias } from "module-path"
    transformedString = transformedString.replace(
        /import\s+\{([^}]+)\}\s+from\s+["'](.*?)["'];?/g,
        'var __module_$2_import = await import("$2"); var {$1} = __module_$2_import;'
    )

    // Regex for: import "module-path" (side effects only)
    transformedString = transformedString.replace(
        /import\s+["'](.*?)["'];?/g,
        'await import("$1");'
    )

    // Clean up any potential double semicolons or extra spaces introduced
    transformedString = transformedString.replace(/;;\s*/g, ';')
    transformedString = transformedString.replace(/;\s*;/g, ';') // Catch adjacent ones too

    return transformedString
}

// --- Example Usage ---

const originalModuleString = `
import * as ui from "./ui.js";
import data from "./data.js";
import { utils, helpers as h } from "./utils.js";
import "./styles.css"; // Assuming a loader handles this
import { version } from "package";

console.log("Module loaded");

export function setup() {
    ui.init();
    const processedData = data.process();
    utils.log(processedData);
    h.cleanup();
    console.log("Version:", version);
}
`

const transformedString =
    transformModuleStringToDynamicImport(originalModuleString)

console.log('--- Original ---')
console.log(originalModuleString)

console.log('\n--- Transformed ---')
console.log(transformedString)

// How you would typically use this in a context loading code as a string:
// const fileContent = // ... load your file content as a string ...
// const transformedCode = transformModuleStringToDynamicImport(fileContent);
//
// You would then likely need to execute this transformed code.
// In a Node.js environment, you might use `eval` (with caution!) or vm.runInNewContext.
// In a browser, `eval` is also an option, but be aware of security implications.
// A more controlled approach in a browser is to create a Blob and a URL, then import that dynamically:
/*
async function loadTransformedModule(moduleString) {
    const transformedCode = transformModuleStringToDynamicImport(moduleString);
    const blob = new Blob([transformedCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    try {
        const module = await import(url);
        URL.revokeObjectURL(url); // Clean up the temporary URL
        return module;
    } catch (error) {
        URL.revokeObjectURL(url);
        throw error;
    }
}

// Example of loading and running the transformed code:
// loadTransformedModule(originalModuleString)
//    .then(module => {
//        module.setup();
//    })
//    .catch(error => {
//        console.error("Failed to load transformed module:", error);
//    });
*/



