import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askForToken() {
    return new Promise((resolve) => {
        rl.question('Please enter your GitHub API token: ', (token) => {
            resolve(token);
            rl.close();
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

const GITHUB_API_TOKEN = await getGithubToken();


// Configuration
export const config = {
    
    ctwg: {
        owner: 'trustoverip',
        repo: 'ctwg-main-glossary',
        path: path.join('spec', 'terms-definitions'),
        outputDir: path.join('.', 'outputfiles', 'ctwg-markdown-files'),
        githubToken: GITHUB_API_TOKEN,
        outputDirJson: path.join('.', 'outputfiles')
    },
    ks: {
        owner: 'henkvancann',
        repo: 'ks',
        path: path.join('spec', 'spec_terms_directory'),
        outputDir: path.join('.', 'outputfiles', 'ks-markdown-files'),
        githubToken: GITHUB_API_TOKEN,
        outputDirJson: path.join('.', 'outputfiles')
    }
};