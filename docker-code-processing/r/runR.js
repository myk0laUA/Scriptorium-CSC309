const { exec } = require('child_process');

function executeRCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'r-base:4.3.1';
    const safeInput = JSON.stringify(input);

    // build script: write script.R, then pipe input into it
    const script = `
cat > script.R << 'EOF'
${code}
EOF
printf '%s' ${safeInput} | Rscript script.R
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

module.exports = { executeRCode };