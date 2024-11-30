// Import execution functions from each language module
const { executePythonCode } = require('./python/runPython');
const { executeJavaScriptCode } = require('./javascript/runJavaScript');
const { executeJavaCode } = require('./java/runJava');
const { executeCSharpCode } = require('./csharp/runCSharp');
const { executeCppCode } = require('./cpp/runCpp');
const { executePHPCode } = require('./php/runPhp');
const { executeRubyCode } = require('./ruby/runRuby');
const { executeGoCode } = require('./go/runGo');
const { executeSwiftCode } = require('./swift/runSwift');
const { executeRCode } = require('./r/runR');

// Create a mapping of language names to execution functions
const languageExecutors = {
    python: executePythonCode,
    javascript: executeJavaScriptCode,
    java: executeJavaCode,
    csharp: executeCSharpCode,
    cpp: executeCppCode,
    php: executePHPCode,
    ruby: executeRubyCode,
    go: executeGoCode,
    swift: executeSwiftCode,
    r: executeRCode,
};

// Main function to execute code based on language
async function executeCode(language, code, input) {
    const executor = languageExecutors[language.toLowerCase()];
    if (!executor) {
        throw new Error(`Language "${language}" is not supported.`);
    }

    return executor(code, input);
}

module.exports = { executeCode };
