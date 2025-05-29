const { exec } = require('child_process');

function executeJavaScriptCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'node:16-alpine';
    const safeInput = JSON.stringify(input);

    // 1) Build a little shell script that:
    //    - creates script.js via a here-doc
    //    - pipes our `input` into it via printf | node script.js
    const script = `
cat > script.js << 'EOF'
${code}
EOF
printf '%s' ${safeInput} | node script.js
`;

    // 2) Launch the container, feeding our 'script' into sh -s
    const cmd = `docker run --rm -i ${dockerImage} sh -s`;
    console.log('⎈ [DEBUG] executeJavaScriptCode CMD:', cmd);

    const child = exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      console.log('⎈ [DEBUG] STDOUT:', stdout);
      console.error('⎈ [DEBUG] STDERR:', stderr);

      if (err) {
        console.error('⎈ [DEBUG] ERROR OBJ:', err);
        return resolve(`Error: ${err.message}`);
      }
      if (stderr) {
        // filter out the pull/log lines if any
        const filtered = stderr
          .split('\n')
          .filter(line => !/Unable to find image|Pulling from library|Status:|Digest:/.test(line))
          .join('\n')
          .trim();
        if (filtered) return resolve(filtered);
      }
      resolve(stdout.trim());
    });

    // 3) send our in-container script
    child.stdin.end(script);
  });
}

module.exports = { executeJavaScriptCode };