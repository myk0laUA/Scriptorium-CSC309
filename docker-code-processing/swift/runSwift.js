const { exec } = require('child_process');

function executeSwiftCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'swift:5.5';
    const safeInput = JSON.stringify(input);

    const script = `
cat > script.swift << 'EOF'
${code}
EOF
printf '%s' ${safeInput} | swift script.swift
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

module.exports = { executeSwiftCode };