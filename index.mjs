#!/usr/bin/env node

import fs from 'fs';
import path from "path";
import { downloadMarkdownFiles } from "./src/download-markdown-files.mjs";
import { getUserInput } from './get-user-input.mjs';
import { extractTermsToJson } from './src/extract-terms-to-json.mjs';
import { compareTerms } from "./src/compare-terms.mjs";
import { extractTermsAndDefsToJson } from './src/extract-terms-and-defs-to-json.mjs';
import { diffTermsAndDefs } from './src/diff-terms-and-defs.mjs';

async function loadConfig() {
    try {
        const configModule = await import(path.join(process.cwd(), 'config.js'));
        return configModule.default; // Assuming config.js uses module.exports
    } catch (error) {
        console.error('❌ Error loading config:', error);
        throw error; // Rethrow to handle it in the caller
    }
}

(async () => {
    try {
        async function loadJSON(filePath) {
            const fullPath = path.join('.', filePath);
            const data = await fs.promises.readFile(fullPath, 'utf8');
            return JSON.parse(data);
        }

        // Step 1: Get user input and create config.js
        await getUserInput();

        // Step 2: Load the config
        const config = await loadConfig();

        // if config.outputDir as a directory exists, stop the process
        if (fs.existsSync(path.join(process.cwd(), config.outputDir))) {
            console.log('ℹ️ The output directory already exists. Please delete or rename it.\n\n👉 For more info, see https://github.com/kordwarshuis/compare-spec-up-t-repos/blob/main/README.md');
            process.exit(1);
        }

        // Step 3: Create output directory if it doesn't exist
        if (!fs.existsSync(config.outputDir)) {
            fs.mkdirSync(config.outputDir, { recursive: true });
        }

        // Perform operations that depend on config

        // Step 4: Download markdown files
        await downloadMarkdownFiles(config.token, config.outputDir, config.repoA);
        await downloadMarkdownFiles(config.token, config.outputDir, config.repoB);



        await extractTermsToJson(path.join(config.outputDir, '/', '' + config.repoA.name));
        await extractTermsToJson(path.join(config.outputDir, '/', config.repoB.name));

        await extractTermsAndDefsToJson(
            path.join(config.outputDir, config.repoA.name),
            path.join(config.outputDir, 'extracted-terms-and-defs-' + config.repoA.name + '.json')
        );
        await extractTermsAndDefsToJson(
            path.join(config.outputDir, config.repoB.name),
            path.join(config.outputDir, 'extracted-terms-and-defs-' + config.repoB.name + '.json')
        );

        // Compare terms and definitions
        await diffTermsAndDefs(
            path.join(config.outputDir, 'extracted-terms-and-defs-' + config.repoA.name + '.json'),
            path.join(config.outputDir, 'extracted-terms-and-defs-' + config.repoB.name + '.json'),
            path.join(`diff-terms-and-defs-${config.outputDir}.html`));

        const jsonA = 'extracted-terms-' + config.repoA.name + '.json';
        const jsonB = 'extracted-terms-' + config.repoB.name + '.json';

        const objectA = await loadJSON(path.join(config.outputDir, jsonA)).catch(console.error);
        const objectB = await loadJSON(path.join(config.outputDir, jsonB)).catch(console.error);

        // Step 5: Compare files
        const configCompare = {
            outputDir: config.outputDir,
            objectA: objectA,
            objectAname: config.repoA,
            objectB: objectB,
            objectBname: config.repoB
        };
        await compareTerms(configCompare);

        // Dynamically import createIndexHtmlFile after config is loaded
        const { createIndexHtmlFile } = await import('./src/create-indexhtml-file.mjs');
        await createIndexHtmlFile();

    } catch (error) {
        console.error('❌ An error occurred:', error);
        process.exit(1); // Exit with error code if something fails
    }
})();