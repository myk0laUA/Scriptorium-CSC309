const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function executeCSharpCode(code, input) {
    return new Promise((resolve, reject) => {
        const codeFile = 'code.cs';

        try {
            // Write the C# script to a file
            fs.writeFileSync(codeFile, code);
        } catch (error) {
            return reject(`Error writing to file: ${error.message}`);
        }

        const codePath = path.resolve(codeFile).replace(/\\/g, '/');
        const dockerImage = 'csharp-runner';

        // Command to run the C# script in the Docker container
        const command = `docker run --rm -i -v "${codePath}:/app/code.cs" ${dockerImage} dotnet-script /app/code.cs`;

        const docker = exec(command, (error, stdout, stderr) => {
            // Cleanup the file after execution
            try {
                if (fs.existsSync(codeFile)) {
                    fs.unlinkSync(codeFile);
                }
            } catch (unlinkError) {
                console.error(`Error cleaning up file: ${unlinkError.message}`);
            }

            if (error) {
                resolve(`Error: ${error.message}`); // Resolve with the error message
            } else if (stderr) {
                resolve(stderr.trim()); // Resolve with trimmed stderr output
            } else {
                resolve(stdout.trim()); // Resolve with stdout output
            }
        });

        // Write input to the Docker container's stdin
        if (input) {
            docker.stdin.write(input);
        }
        docker.stdin.end();
    });
}

module.exports = { executeCSharpCode };
