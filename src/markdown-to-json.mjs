import { readdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Processes markdown files in a directory and compiles them into a JSON file.
 * @param {string} directoryPath - The path to the directory containing markdown files.
 * @param {string} outputJsonPath - The path where the output JSON file will be written.
 */
async function processMarkdownFiles(directoryPath, outputJsonPath) {
    // Read all files in the specified directory
    const files = await readdir(directoryPath);

    // Filter to include only markdown files
    const mdFiles = files.filter(file => file.endsWith('.md'));

    // Array to hold the processed data
    const result = [];

    // Process each markdown file
    for (const file of mdFiles) {
        // Derive the key from the filename (without .md extension)
        const key = path.basename(file, '.md');

        // Read the file content as UTF-8 text
        const content = await readFile(path.join(directoryPath, file), 'utf8');

        // Split content into lines
        const lines = content.split('\n');

        // Extract terms from the first line, e.g., "[[def: ACDC, AceeDeeCee]]"
        const firstLine = lines[0];
        const start = firstLine.indexOf('[[def:') + 6; // Skip past "[[def:"
        const end = firstLine.indexOf(']]', start);
        const termsString = firstLine.substring(start, end);
        const terms = termsString.split(',').map(term => term.trim());

        // Extract definition from all subsequent lines
        const definition = lines.slice(1).join('\n');

        // Construct the object for this file
        const obj = {
            [key]: {
                term: terms,
                definition: definition
            }
        };

        // Add to the result array
        result.push(obj);
    }

    // Write the result array to the specified JSON file with pretty formatting
    await writeFile(outputJsonPath, JSON.stringify(result, null, 2), 'utf8');
}

// Export the function as a module
export { processMarkdownFiles };