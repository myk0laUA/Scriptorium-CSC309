const { exec } = require('child_process');

function executeCppCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'gcc:latest';

    // Build the shell snippet to run inside the container:
    // 1) write code.cpp
    // 2) compile + run, piping in `input`
    const safeInput = JSON.stringify(input);
    const script = `
cat > code.cpp << 'EOF'
${code}
EOF
g++ code.cpp -o code
printf '%s' ${safeInput} | ./code
`;

    // Spawn a shell (-s) that reads our `script` from stdin
    const cmd = `docker run --rm -i ${dockerImage} sh -s`;
    const child = exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err)   return resolve(`Error: ${err.message}`);
      if (stderr) return resolve(stderr.trim());
      resolve(stdout.trim());
    });

    child.stdin.end(script);
  });
}

module.exports = { executeCppCode };