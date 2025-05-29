const { exec } = require('child_process');

function executeRubyCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'ruby:3.0-alpine';
    const safeInput = JSON.stringify(input);

    const script = `
cat > script.rb << 'EOF'
${code}
EOF
printf '%s' ${safeInput} | ruby script.rb
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

module.exports = { executeRubyCode };
