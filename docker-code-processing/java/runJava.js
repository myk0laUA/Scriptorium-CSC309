const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function executeJavaCode(code, input) {
    return new Promise((resolve, reject) => {
        const codeFile = 'Main.java'; // File name should match the class name

        // Write Java code to a file
        fs.writeFileSync(codeFile, code);

        // Resolve the path and normalize for Docker
        const codePath = path.resolve(codeFile).replace(/\\/g, '/');
        const dockerImage = 'java-runner';

        // Docker command to compile and run the Java file
        const command = `
            docker run --rm -i 
            -v "${codePath}:/app/Main.java" 
            -w /app ${dockerImage} 
            sh -c "javac Main.java && java Main"
        `.replace(/\s+/g, ' '); // Normalize spaces for compatibility

        const docker = exec(command, (error, stdout, stderr) => {
            // Cleanup temp file AFTER execution
            fs.unlinkSync(codeFile);

            if (error) {
                resolve(`Error: ${error.message}`); // Resolve with the error message
            } else if (stderr) {
                resolve(stderr.trim()); // Resolve with trimmed stderr output
            } else {
                resolve(stdout.trim()); // Resolve with stdout output
            }
        });

        // Pass input to the Docker container's stdin if provided
        if (input) {
            docker.stdin.write(input);
        }
        docker.stdin.end();
    });
}

module.exports = { executeJavaCode };
