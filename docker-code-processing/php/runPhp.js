const { exec } = require('child_process');

function executePHPCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'php:8.0-cli-alpine';
    const safeInput = JSON.stringify(input);

    const script = `
cat > script.php << 'EOF'
<?php
${code}
EOF
printf '%s' ${safeInput} | php script.php
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

module.exports = { executePHPCode };