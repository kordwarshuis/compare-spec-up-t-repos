import fs from 'fs';
import path from 'path';
import readline from 'readline';

export async function getUserInput() {
    const configPath = path.join(process.cwd(), 'config.js');

    if (fs.existsSync(configPath)) {
        console.log('ℹ️ config.js already exists. Skipping user input.');
        return;
    }

    console.log("👉 For more info, see https://github.com/kordwarshuis/compare-spec-up-t-repos/blob/main/README.md");

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