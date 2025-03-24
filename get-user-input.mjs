import fs from 'fs';
import path from 'path';
import readline from 'readline';

export async function getUserInput() {
    const configPath = path.join(process.cwd(), 'config.js');

    console.log(`

***********************************************

ℹ️ This tool shows the comparison of terms between two repositories and also a diff between the terms and definitions of two repositories.

    You will be asked for the following information:
    - Your GitHub Personal Access Token
    - Name for the output directory
    - Name and URL of the first repositor(A)
    - Name and URL of the second repositor(B)
    👉 For more info, see https://github.com/kordwarshuis/compare-spec-up-t-repos/blob/in/READmd

***********************************************
`);

    if (fs.existsSync(configPath)) {
        console.log('ℹ️ config.js already exists. Skipping user input.');
        return;
    }

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    const token = await question('Enter your token: ');
    const outputDir = await question('Choose name for the output directory: ');
    const repoAname = await question('Choose a name for the first repository (A): ');
    const repoAurl = await question('Enter the URL of the first repository (A): ');
    const repoBname = await question('Enter the name of the second repository (B): ');
    const repoBurl = await question('Enter the URL of the second repository (B): ');

    rl.close();

    const configContent = `
        module.exports = {
            token: '${token}',
            outputDir: '${outputDir}',
            repoA: { name: '${repoAname}', url: '${repoAurl}' },
            repoB: { name: '${repoBname}', url: '${repoBurl}' }
        };
    `;

    fs.writeFileSync(configPath, configContent.trim());
    console.log('✅ config.js has been created.');
}