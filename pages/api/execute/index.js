import { executeCode } from '../../../docker-code-processing/runCode';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { code, input, language } = req.body;

    if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
    }

    try {
        // Execute the code asynchronously
        const output = await executeCode(language, code, input);
        return res.status(200).json({ output });
    } catch (error) {
        return res.status(500).json({ error: `Execution error: ${error.message}` });
    }
}
