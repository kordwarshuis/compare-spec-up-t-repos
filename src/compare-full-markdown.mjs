import { readFile, writeFile } from 'fs/promises';
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import { diffLines } from 'diff';

// Function to escape HTML special characters (for terms and keys)
function escapeHtml(text) {
    return text
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '');
}

// Set up JSDOM and DOMPurify for sanitization
const { window } = new JSDOM();
const purify = DOMPurify(window);

// Preprocess definitions to handle custom syntax
function preprocessDefinition(text) {
    text = text.replace(/\[\[ref: ([^\]]+)\]\]/g, '[$1](#$1)');
    text = text.replace(/^~\s+/gm, '* ');
    return text;
}

// Function to create HTML diff between two strings with enhanced colors
function createHtmlDiff(text1, text2) {
    const diff = diffLines(text1, text2, { ignoreWhitespace: true });
    let html = '';
    diff.forEach(part => {
        if (part.added) {
            html += `<ins style="display: block; background-color: #00cc00; color: #111 !important;">${escapeHtml(part.value)}</ins>`;
        } else if (part.removed) {
            html += `<del style="display: block; background-color: #ff3333; color: #111 !important;">${escapeHtml(part.value)}</del>`;
        } else {
            html += escapeHtml(part.value);
        }
    });
    return html;
}

/**
 * Compares terms between two JSON files and generates an HTML table with diffs
 * @param {string} jsonPath1 - Path to the first JSON file
 * @param {string} jsonPath2 - Path to the second JSON file
 * @param {string} outputHtmlPath - Path for the output HTML file
 */
async function compareTerms(jsonPath1, jsonPath2, outputHtmlPath) {
    // Read and parse JSON files
    const file1Json = JSON.parse(await readFile(jsonPath1, 'utf8'));
    const file2Json = JSON.parse(await readFile(jsonPath2, 'utf8'));

    // Structure the data
    const file1Data = file1Json.map(obj => {
        const key = Object.keys(obj)[0];
        return { key, terms: obj[key].term, definition: obj[key].definition };
    });
    const file2Data = file2Json.map(obj => {
        const key = Object.keys(obj)[0];
        return { key, terms: obj[key].term, definition: obj[key].definition };
    });

    // Find common terms
    const file1Terms = new Set(file1Data.flatMap(obj => obj.terms));
    const file2Terms = new Set(file2Data.flatMap(obj => obj.terms));
    const commonTerms = [...new Set([...file1Terms].filter(term => file2Terms.has(term)))].sort();

    // Build HTML content
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Term Comparison</title>
    <style>
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
        th { background-color: #f2f2f2; }
        ins { background-color: #00cc00; color: white; text-decoration: none; padding: 2px; }
        del { background-color: #ff3333; color: white; text-decoration: none; padding: 2px; }
    </style>
</head>
<body>
<table>
    <tr>
        <th>Term</th>
        <th>File1 Definitions</th>
        <th>File2 Definitions</th>
        <th>Diff</th>
    </tr>
`;

    // Generate table rows
    for (const term of commonTerms) {
        const file1Defs = file1Data
            .filter(obj => obj.terms.includes(term))
            .map(obj => {
                const processedDef = preprocessDefinition(obj.definition);
                const mdHtml = marked(processedDef);
                return purify.sanitize(mdHtml);
            })
            .join('\n\n');

        const file2Defs = file2Data
            .filter(obj => obj.terms.includes(term))
            .map(obj => {
                const processedDef = preprocessDefinition(obj.definition);
                const mdHtml = marked(processedDef);
                return purify.sanitize(mdHtml);
            })
            .join('\n\n');

        const file1Display = file1Data
            .filter(obj => obj.terms.includes(term))
            .map(obj => {
                const processedDef = preprocessDefinition(obj.definition);
                const mdHtml = marked(processedDef);
                const sanitizedHtml = purify.sanitize(mdHtml);
                return `<strong>${escapeHtml(obj.key)}:</strong> ${sanitizedHtml}`;
            })
            .join('<br><br>');

        const file2Display = file2Data
            .filter(obj => obj.terms.includes(term))
            .map(obj => {
                const processedDef = preprocessDefinition(obj.definition);
                const mdHtml = marked(processedDef);
                const sanitizedHtml = purify.sanitize(mdHtml);
                return `<strong>${escapeHtml(obj.key)}:</strong> ${sanitizedHtml}`;
            })
            .join('<br><br>');

        const diffHtml = createHtmlDiff(file1Defs, file2Defs);

        html += `
    <tr>
        <td>${escapeHtml(term)}</td>
        <td>${file1Display}</td>
        <td>${file2Display}</td>
        <td>${diffHtml}</td>
    </tr>
`;
    }

    html += `
</table>
</body>
</html>
`;

    // Write to file
    await writeFile(outputHtmlPath, html, 'utf8');
}

// Export the function
export { compareTerms };

// Usage example
// compareTerms('file1.json', 'file2.json', 'output.html').catch(console.error);