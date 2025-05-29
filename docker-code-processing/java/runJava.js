const { exec } = require('child_process');

function executeJavaCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'openjdk:17-alpine';
    const safeInput = JSON.stringify(input);

    // Build a shell script that writes Main.java, compiles, and runs with piped input
    const script = `
cat > Main.java << 'EOF'
${code}
EOF
javac Main.java
printf '%s' ${safeInput} | java Main
`;

    // Run the script inside sh (-s reads from stdin)
    const cmd = `docker run --rm -i ${dockerImage} sh -s`;
    const child = exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err)   return resolve(`Error: ${err.message}`);
      if (stderr) return resolve(stderr.trim());
      resolve(stdout.trim());
    });

    child.stdin.end(script);
  });
}

module.exports = { executeJavaCode };