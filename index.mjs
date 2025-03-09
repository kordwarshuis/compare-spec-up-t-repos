import fs from 'fs';
import path from "path";
import { downloadMarkdownFiles } from "./src/fetch-md-files.mjs";
import {config} from "./config.mjs";
import { processFiles } from './src/process.mjs';
import { compareFiles } from "./src/compare.mjs";

async function loadJSON(filePath) {
    const fullPath = path.join('.', filePath);
    const data = await fs.promises.readFile(fullPath, 'utf8');
    return JSON.parse(data);
}

await downloadMarkdownFiles(config.ctwg).catch(console.error);
await downloadMarkdownFiles(config.ks).catch(console.error);
await processFiles(config.ctwg.outputDir).catch(console.error);
await processFiles(config.ks.outputDir).catch(console.error);

const ctwg = await loadJSON('outputfiles/ctwg-markdown-files.json').catch(console.error);
const ks = await loadJSON('outputfiles/ks-markdown-files.json').catch(console.error);

var configCompare = {
    objectA: ctwg,
    objectAname: config.ctwg.repo,
    objectB: ks,
    objectBname: config.ks.repo
}
await compareFiles(configCompare).catch(console.error);
