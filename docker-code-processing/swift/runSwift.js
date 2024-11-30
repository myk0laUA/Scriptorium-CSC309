const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

function executeSwiftCode(code, input) {
    return new Promise((resolve, reject) => {
        const codeFile = 'code.swift';

        fs.writeFileSync(codeFile, code);

        const codePath = path.resolve(codeFile).replace(/\\/g, '/');
        const dockerImage = 'swift-runner';

        const command = `docker run --rm -i -v "${codePath}:/app/code.swift" ${dockerImage} swift code.swift`;

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

module.exports = { executeSwiftCode };
