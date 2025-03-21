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

// Function to create HTML diff between two strings with Bootstrap classes
function createHtmlDiff(text1, text2) {
    const diff = diffLines(text1, text2, { ignoreWhitespace: true });
    let html = '';
    diff.forEach(part => {
        if (part.added) {
            html += `<ins class="bg-success p-1">${escapeHtml(part.value)}</ins>`;
        } else if (part.removed) {
            html += `<del class="bg-danger p-1">${escapeHtml(part.value)}</del>`;
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
async function diffTermsAndDefs(jsonPath1, jsonPath2, outputHtmlPath) {
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

    // Build HTML content with Bootstrap CDN
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>Term Comparison</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <style>
        ins, del {
                display: block;
        }
        ins.bg-success {
                background-color: #cfc !important;
        }
        del.bg-danger {
                background-color: #fcc !important;
                text-decoration: none;
        }
        ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
        }
    </style>
</head>
<body>
<div class="container mt-4">
    <table class="table table-bordered table-striped">
        <thead class="table-light">
            <tr>
                <th scope="col">Term</th>
                <th scope="col">File1 Definitions</th>
                <th scope="col">File2 Definitions</th>
                <th scope="col">Diff</th>
            </tr>
        </thead>
        <tbody>
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
        </tbody>
    </table>
</div>
</body>
</html>
`;

    // Write to file
    await writeFile(outputHtmlPath, html, 'utf8');
}

// Export the function
export { diffTermsAndDefs };

// Usage example
// compareTerms('file1.json', 'file2.json', 'output.html').catch(console.error);