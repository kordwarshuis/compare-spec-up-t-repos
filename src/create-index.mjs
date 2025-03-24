import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const configModule = await import(path.join(process.cwd(), 'config.js'));
const config = configModule.default;

// Async function to create the HTML file
const createIndex = async (fileName, menu) => {
    try {
        // Content for index.html with embedded data
        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compare Two Repositories</title>
    <!-- Bootstrap CSS CDN -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .terms-list {
            list-style-type: none;
            padding: 0;
        }
        .term-item {
            padding: 10px;
            margin: 5px 0;
            background-color: #f1f3f5;
            border-radius: 5px;
            transition: all 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .term-item:hover {
            background-color: #e9ecef;
            transform: translateX(5px);
        }
        .term-counts {
            font-size: 0.9em;
            color: #555;
        }
        .badge {
            margin-left: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        
        ${menu}
        <h1 class="mb-4 text-primary">Compare two repos</h1>
        
        <p>This tool shows the comparison of terms between two repositories and also a diff between the terms and definitions of two repositories.</p>

        <h2>More info</h2>
        <p>Find more info at 👉 <a href="https://github.com/kordwarshuis/compare-spec-up-t-repos/blob/main/README.md">the README.md on GitHub</a></p>

        <pre>
${config.repoA.name}: ${config.repoA.url}

${config.repoB.name}: ${config.repoB.url}
        </pre>
    </div>

    <!-- Bootstrap JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        // Write the HTML file
        await writeFile(fileName, htmlContent);
        console.log(`✅ ${fileName} has been created successfully!`);
    } catch (err) {
        console.error('❌ Error creating file:', err);
    }
};

// Execute the function
export {createIndex};

// If you want to run it directly when the file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
    createIndex(fileName);
}