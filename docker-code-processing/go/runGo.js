const { exec } = require('child_process');

function executeGoCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'golang:1.17-alpine';

    const safeInput = JSON.stringify(input);
    const script = `
cat > code.go << 'EOF'
${code}
EOF
printf '%s' ${safeInput} | go run code.go
`;

    const cmd = `docker run --rm -i ${dockerImage} sh -s`;
    const child = exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err)   return resolve(`Error: ${err.message}`);
      if (stderr) return resolve(stderr.trim());
      resolve(stdout.trim());
    });

    child.stdin.end(script);
  });
}

module.exports = { executeGoCode };