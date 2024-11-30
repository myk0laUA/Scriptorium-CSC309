const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function executePythonCode(code, input) {
    return new Promise((resolve, reject) => {
        const codeFile = 'code.py';

        fs.writeFileSync(codeFile, code);

        const codePath = path.resolve(codeFile).replace(/\\/g, '/');
        const dockerImage = 'python-runner';

        const command = `docker run --rm -i -v "${codePath}:/app/code.py" ${dockerImage} python /app/code.py`;

        const docker = exec(command, (error, stdout, stderr) => {
            fs.unlinkSync(codeFile);

            if (error) {
                reject(`Error: ${error.message}`);
            } else if (stderr) {
                reject(`Stderr: ${stderr}`);
            } else {
                resolve(stdout.trim());
            }
        });

        if (input) {
            docker.stdin.write(input);
        }
        docker.stdin.end();
    });
}

module.exports = { executePythonCode };
