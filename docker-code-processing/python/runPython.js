const { exec } = require('child_process');

function executePythonCode(code, input = '') {
  return new Promise((resolve) => {
    const dockerImage = 'python:3.10-alpine';

    // 1) Build a little wrapper that feeds `input()` calls
    //    from our provided `input` string.
    const safeInput = JSON.stringify(input);
    const wrapper = `
import sys
_lines = ${safeInput}.splitlines()
def input(prompt=None):
    try:
        return _lines.pop(0)
    except IndexError:
        return ''
`;

    // 2) Concatenate wrapper + user code
    const fullScript = wrapper + '\n' + code + '\n';

    // 3) Run `python -` inside a clean container, piping in fullScript
    const cmd = `docker run --rm -i ${dockerImage} python -`;
    const child = exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
      if (err)   return resolve(`Error: ${err.message}`);
      if (stderr) return resolve(stderr.trim());
      resolve(stdout.trim());
    });

    // 4) Send the script (with embedded input) and close stdin
    child.stdin.end(fullScript);
  });
}

module.exports = { executePythonCode };