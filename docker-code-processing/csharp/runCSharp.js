const { exec } = require('child_process');

function executeCSharpCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'csharp-runner';
    const safeInput = JSON.stringify(input);

    // Emit a .csx script (no Program/Main boilerplate)
    const script = `
cat > code.csx << 'EOF'
#!/usr/bin/env dotnet-script
${code}
EOF
printf '%s' ${safeInput} | dotnet-script code.csx
`;

    const cmd = `docker run --rm -i --entrypoint sh ${dockerImage} -s`;
    console.log('⎈ CMD:', cmd);

    const child = exec(cmd, { timeout: 15000 }, (err, stdout, stderr) => {
      if (err)   return resolve(`Error: ${err.message}`);
      if (stderr) return resolve(stderr.trim());
      resolve(stdout.trim());
    });

    child.stdin.end(script);
  });
}

module.exports = { executeCSharpCode };