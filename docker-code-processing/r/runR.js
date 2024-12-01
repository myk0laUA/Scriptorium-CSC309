const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function executeRCode(code, input) {
    return new Promise((resolve, reject) => {
        const codeFile = 'code.R';
        const inputFile = 'input.txt';

        // Default input to "\n" if none is provided
        const normalizedInput = input || '\n';

        // Write R code and input to files
        fs.writeFileSync(codeFile, code);
        fs.writeFileSync(inputFile, normalizedInput);

        // Resolve paths and convert backslashes to forward slashes
        const codePath = path.resolve(codeFile).replace(/\\/g, '/');
        const inputPath = path.resolve(inputFile).replace(/\\/g, '/');

        const dockerImage = 'r-runner';

        // Docker command to execute R code
        const command = `
            docker run --rm -i 
            -v "${codePath}:/app/code.R" 
            -v "${inputPath}:/app/input.txt" 
            ${dockerImage} 
            Rscript code.R < input.txt
        `.replace(/\s+/g, ' ');

        const docker = exec(command, (error, stdout, stderr) => {
            // Cleanup temp files AFTER the container completes execution
            fs.unlinkSync(codeFile);
            fs.unlinkSync(inputFile);

            if (error) {
                resolve(`Error: ${error.message}`); // Resolve with the error message
            } else if (stderr) {
                resolve(stderr.trim()); // Resolve with trimmed stderr output
            } else {
                resolve(stdout.trim()); // Resolve with stdout output
            }
        });
    });
}

module.exports = { executeRCode };
