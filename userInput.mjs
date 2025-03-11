import { promises as fs } from 'fs';
import readline from 'readline';

let config = {};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askForToken() {
    return new Promise((resolve) => {
        rl.question('Please enter your GitHub API token: ', (token) => {
            resolve(token);
        });
    });
}

function askForRepoA() {
    return new Promise((resolve) => {
        rl.question('Please enter URL to repo A terms dir: ', (urlRepoA) => {
            resolve(urlRepoA);
        });
    });
}

function askForRepoB() {
    return new Promise((resolve) => {
        rl.question('Please enter URL to repo B terms dir: ', (urlRepoB) => {
            resolve(urlRepoB);
        });
    });
}

async function getGithubToken() {
    let token = process.env.GITHUB_API_TOKEN;
    if (!token) {
        token = await askForToken();
    }
    return token;
}

async function getRepoA() {
    return await askForRepoA();
}

async function getRepoB() {
    return await askForRepoB();
}

export async function getUserInput() {
    config.token = await getGithubToken();
    config.outputDir = './compare-spec-up-t-repos-output';
    config.repoA = {};
    config.repoB = {};
    config.repoA.name = "repo-A";
    config.repoB.name = "repo-B";
    config.repoA.url = await getRepoA();
    config.repoB.url = await getRepoB();

    // Close the readline interface after all input has been collected
    rl.close();

    // Convert the config object to a JavaScript variable assignment
    const jsContent = `const config = ${JSON.stringify(config, null, 2).replace(/"([^"]+)":/g, '$1:')};\nmodule.exports = config;`;
    await fs.writeFile('config.js', jsContent, 'utf8');
}