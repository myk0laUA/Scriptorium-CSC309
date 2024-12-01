import { executeCode } from '../../../docker-code-processing/runCode';

// Helper function for language-specific error trimming
function trimErrorOutput(errorOutput, language) {
    const lines = errorOutput.split('\n');

    // Remove lines related to Docker, file paths, and irrelevant details
    const filteredLines = lines.filter(
        (line) =>
            !line.includes('docker') && // Remove Docker command references
            !line.includes('Command failed') && // Remove command failure line
            !line.includes('/app/') && // Remove file path references
            !line.includes('C:/') // Remove Windows file paths
    );

    switch (language.toLowerCase()) {
        case 'python':
            // Python: Focus on the actual error message (e.g., NameError)
            return filteredLines
                .filter((line) => !line.includes('Traceback')) // Remove Traceback header
                .join('\n')
                .trim();

        case 'javascript':
            // JavaScript: Remove Node.js internal references
            return filteredLines
                .filter((line) => !line.includes('at ') && !line.includes('node:internal'))
                .join('\n')
                .trim();

        case 'java':
            // Java: Focus on the actual exception message
            return filteredLines
                .filter((line) => !line.includes('location') && !line.includes('symbol'))
                .join('\n')
                .trim();

        case 'csharp':
            // C#: Focus on the error message and remove unnecessary context
            return filteredLines
                .filter((line) => !line.includes('at ') && !line.includes('in '))
                .join('\n')
                .trim();

        case 'cpp':
        case 'c':
            // C/C++: Remove caret markers and compiler context
            return filteredLines
                .filter((line) => !line.includes('^') && !line.includes('|') && !line.includes('note:'))
                .join('\n')
                .trim();

        case 'php':
            // PHP: Focus on the error message
            return filteredLines
                .filter((line) => !line.includes('Stack trace'))
                .join('\n')
                .trim();

        case 'ruby':
            // Ruby: Remove stack trace details and focus on the error
            return filteredLines
                .filter((line) => !line.includes('from '))
                .join('\n')
                .trim();

        case 'go':
            // Go: Focus on the panic message and remove goroutine details
            return filteredLines
                .filter((line) => !line.includes('goroutine') && !line.includes('panic'))
                .join('\n')
                .trim();

        case 'swift':
            // Swift: Remove stack trace and irrelevant details
            return filteredLines
                .filter((line) => !line.includes('Stack trace'))
                .join('\n')
                .trim();

        case 'r':
            // R: Remove stack trace and focus on the main error
            return filteredLines
                .filter((line) => !line.includes('Calls:'))
                .join('\n')
                .trim();

        default:
            // Default: Keep only lines without Docker or file path references
            return filteredLines.join('\n').trim();
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, input, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
    }

    try {
        // Execute the code asynchronously
        const output = await executeCode(language, code, input);

        // Check if the output indicates an error
        if (output.startsWith('Error:')) {
            const trimmedError = trimErrorOutput(output, language);
            return res.status(200).json({ error: trimmedError });
        }

        return res.status(200).json({ output }); // Return success output
    } catch (error) {
        return res.status(500).json({ error: `Execution error: ${error.message}` });
    }
}
