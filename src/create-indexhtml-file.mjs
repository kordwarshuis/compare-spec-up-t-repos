import { writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const configModule = await import(path.join(process.cwd(), 'config.js'));
const config = configModule.default;

// Async function to create the HTML file
const createIndexHtmlFile = async () => {
    try {
        // Read all three JSON files
        const bothData = await readFile(path.join('.', config.outputDir, 'result-in-both.json') , 'utf8');
        const repoAData = await readFile(path.join('.', config.outputDir, 'result-not-in-b.json'), 'utf8');
        const repoBData = await readFile(path.join('.', config.outputDir, 'result-not-in-a.json'), 'utf8');

        const termsBoth = JSON.parse(bothData);
        const termsRepoA = JSON.parse(repoAData);
        const termsRepoB = JSON.parse(repoBData);

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
        <h1 class="mb-4 text-primary">Compare two repos</h1>

        <h2>More info</h2>
        <p>Find more info at 👉 <a href="https://github.com/kordwarshuis/compare-spec-up-t-repos/blob/main/README.md">the README.md on GitHub</a></p>

        <p>This page shows the comparison of terms between two repositories.</p>
        <p>Terms are categorized into three groups:</p>
        <ol>
            <li>Terms in both repositories</li>
            <li>Terms only in ${config.repoA.name}</li>
            <li>Terms only in ${config.repoB.name}</li>
        </ol>
        <hr>
        <h2 class="mt-4">Comparison Summary</h2>
        <p>Number of terms:</p>
        <ul>
            <li>Terms in both repositories: ${termsBoth.length}</li>
            <li>Terms only in ${config.repoA.name}: ${termsRepoA.length}</li>
            <li>Terms only in ${config.repoB.name}: ${termsRepoB.length}</li>
        </ul>
        <hr>
        <h2>Repositories</h2>

        <p>Compare <a href="${config.repoA.url}" target="_blank" rel="noopener">${config.repoA.name}</a> and <a href="${config.repoB.url}" target="_blank" rel="noopener">${config.repoB.name}</a></p>

        <pre>
${config.repoA.name}: ${config.repoA.url}

${config.repoB.name}: ${config.repoB.url}
        </pre>

        <div class="accordion" id="repoCompareAccordion">
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#collapseBoth" 
                            aria-expanded="false" aria-controls="collapseBoth">
                        Terms in Both Repos (${termsBoth.length})
                    </button>
                </h2>
                <div id="collapseBoth" class="accordion-collapse collapse" 
                     data-bs-parent="#repoCompareAccordion">
                    <div class="accordion-body">
                        <ul class="terms-list" id="termsBothList"></ul>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#collapseRepoA" 
                            aria-expanded="false" aria-controls="collapseRepoA">
                        Terms only in first repository (A) (${termsRepoA.length})
                    </button>
                </h2>
                <div id="collapseRepoA" class="accordion-collapse collapse" 
                     data-bs-parent="#repoCompareAccordion">
                    <div class="accordion-body">
                        <ul class="terms-list" id="termsRepoAList"></ul>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" 
                            data-bs-toggle="collapse" data-bs-target="#collapseRepoB" 
                            aria-expanded="false" aria-controls="collapseRepoB">
                        Terms only in second repository (B) (${termsRepoB.length})
                    </button>
                </h2>
                <div id="collapseRepoB" class="accordion-collapse collapse" 
                     data-bs-parent="#repoCompareAccordion">
                    <div class="accordion-body">
                        <ul class="terms-list" id="termsRepoBList"></ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Embedded config data
        const config = ${JSON.stringify(config)};

        // Embedded JSON data
        const termsBoth = ${JSON.stringify(termsBoth)};
        const termsRepoA = ${JSON.stringify(termsRepoA)};
        const termsRepoB = ${JSON.stringify(termsRepoB)};
        
        // Function to populate a list
        function populateList(listId, terms) {
            const list = document.getElementById(listId);
            if (terms && Array.isArray(terms) && terms.length > 0) {
                terms.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'term-item';
                    
                    const termSpan = document.createElement('span');
                    termSpan.textContent = item.term;
                    
                    const countsSpan = document.createElement('span');
                    countsSpan.className = 'term-counts';
                    if (item.countInA && item.countInB) {
                        countsSpan.innerHTML = 
                            '<span class="badge bg-primary">A: ' + item.countInA + '</span>' +
                            '<span class="badge bg-secondary">B: ' + item.countInB + '</span>';
                    } else if (item.countInA) {
                        countsSpan.innerHTML = 
                            '<span class="badge bg-primary"> ' + item.countInA + '</span>';
                    } else if (item.countInB) {
                        countsSpan.innerHTML = 
                            '<span class="badge bg-primary"> ' + item.countInB + '</span>';
                    }
                    
                    li.appendChild(termSpan);
                    li.appendChild(countsSpan);
                    list.appendChild(li);
                });
            } else {
                list.innerHTML = 
                    '<li class="term-item text-muted">No terms found</li>';
            }
        }

        // Populate all lists
        (function() {
            populateList('termsBothList', termsBoth);
            populateList('termsRepoAList', termsRepoA);
            populateList('termsRepoBList', termsRepoB);
        })();
    </script>
    <!-- Bootstrap JS CDN -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;

        // Write the HTML file
        await writeFile('index-' + config.outputDir + '.html', htmlContent);
        console.log('✅ html file has been created successfully!');
    } catch (err) {
        console.error('❌ Error creating file:', err);
    }
};

// Execute the function
export {createIndexHtmlFile};

// If you want to run it directly when the file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
    createIndexHtmlFile();
}