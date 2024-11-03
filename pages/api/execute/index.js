import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const languageConfig = {
  javascript: { extension: '.js', command: 'node' },
  python: { extension: '.py', command: 'python' },
  c: { extension: '.c', command: 'gcc', output: './tempCode.out' },
  cpp: { extension: '.cpp', command: 'g++', output: './tempCode.out' },
  java: { extension: '.java', command: 'javac', output: 'Main' }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, input, language } = req.body;

  if (!code || !language || !languageConfig[language]) {
    return res.status(400).json({ error: 'Valid code and language are required' });
  }

  const { extension, command, output } = languageConfig[language];
  const fileName = language === 'java' ? 'Main' : 'tempCode';
  const filePath = path.join(process.cwd(), `${fileName}${extension}`);
  fs.writeFileSync(filePath, code);

  try {
    if (language === 'c' || language === 'cpp') {
      const compileResult = await compileCode(command, [filePath, '-o', output], filePath, language);
      if (compileResult.error) {
        return res.status(500).json({ error: `Compilation failed: ${compileResult.error}` });
      }
      await executeFile(res, `./${output}`, input, [], filePath, language);

    } else if (language === 'java') {
      const compileResult = await compileCode(command, [filePath], filePath, language);
      if (compileResult.error) {
        return res.status(500).json({ error: `Compilation failed: ${compileResult.error}` });
      }
      await executeFile(res, 'java', input, [output], filePath, language);

    } else {
      await executeFile(res, command, input, [filePath], filePath, language);
    }
  } catch (error) {
    fs.unlinkSync(filePath);
    return res.status(500).json({ error: `Execution error: ${error.message}` });
  }
}

function compileCode(command, args, filePath, language) {
  return new Promise((resolve) => {
    const compileProcess = spawn(command, args);

    let compileErrorOutput = '';
    compileProcess.stderr.on('data', (data) => {
      compileErrorOutput += data.toString();
    });

    compileProcess.on('close', (compileCode) => {
      if (compileCode !== 0) {
        fs.unlinkSync(filePath);
        const trimmedError = trimErrorOutput(compileErrorOutput, language);
        resolve({ error: trimmedError });
      } else {
        resolve({ error: null });
      }
    });
  });
}

function executeFile(res, command, input, args = [], filePath, language) {
  return new Promise((resolve) => {
    const child = spawn(command, args);
    let output = '';
    let errorOutput = '';

    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      fs.unlinkSync(filePath);
      if (language === 'c' || language === 'cpp') {
        fs.unlinkSync('./tempCode.out');
      } else if (language === 'java') {
        fs.unlinkSync('./Main.class');
      }

      if (errorOutput) {
        const trimmedError = trimErrorOutput(errorOutput, language);
        res.status(200).json({ error: trimmedError });
      } else {
        res.status(200).json({ output: output.trim() });
      }
      resolve();
    });
  });
}

// Helper function for language-specific error trimming
function trimErrorOutput(errorOutput, language, filePath) {
  const lines = errorOutput.split('\n');
  
  if (language === 'c' || language === 'cpp') {
    // Remove lines with caret symbols, context indicators, and keep main error message
    return lines
      .filter(line => !line.includes('^') && !line.includes('|') && !line.includes('note:') && !line.includes('In function'))
      .join('\n')
      .split(':').pop() // Keep the main error message after the last colon
      .trim();
  } else if (language === 'java') {
    // Remove caret symbols, code lines, and other unnecessary details for Java
    return lines
      .filter(line => !line.includes('^') && !line.includes('location') && !line.includes('symbol') && !line.includes(filePath) && !line.includes('public class'))
      .join('\n')
      .split(':').pop() // Keep only the main error message
      .trim();
  } else if (language === 'python') {
    // Remove traceback, caret markers, and keep the main Python error message
    return lines
      .filter(line => !line.includes('File') && !line.includes('Traceback') && !line.includes('^') && !line.trim().startsWith('print'))
      .join('\n')
      .trim();
  } else if (language === 'javascript') {
    // Remove file path references and internal Node.js details
    return lines
      .filter(line => !line.includes('at ') && !line.includes(filePath) && !line.includes('node:internal') && !line.includes('Node.js'))
      .join('\n')
      .split(':').pop() // Keep the main error message after the last colon
      .trim();
  } else {
    // Default case for other languages, remove caret lines and file paths
    return lines
      .filter(line => !line.includes('^') && !line.includes(filePath))
      .join('\n')
      .trim();
  }
}

