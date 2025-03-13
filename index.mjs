#!/usr/bin/env node

import fs from 'fs';
import path from "path";
import { downloadMarkdownFiles } from "./src/fetch-md-files.mjs";
import { getUserInput } from './userInput.mjs';
import { processFiles } from './src/process.mjs';
import { compareFiles } from "./src/compare.mjs";

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

        // Step 4: Perform operations that depend on config
        await downloadMarkdownFiles(config.token, config.outputDir, config.repoA);
        await downloadMarkdownFiles(config.token, config.outputDir, config.repoB);
        await processFiles(path.join(config.outputDir, '/', config.repoA.name));
        await processFiles(path.join(config.outputDir, '/', config.repoB.name));

        const jsonA = config.repoA.name + '.json';
        const jsonB = config.repoB.name + '.json';

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
        await compareFiles(configCompare);

        // Dynamically import createHtmlFile after config is loaded
        const { createHtmlFile } = await import('./src/create-front-end.mjs');
        await createHtmlFile();

    } catch (error) {
        console.error('❌ An error occurred:', error);
        process.exit(1); // Exit with error code if something fails
    }
})();