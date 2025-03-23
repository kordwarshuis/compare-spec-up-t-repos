import fs from 'fs/promises';
import path from 'path';

export async function extractTermsToJson(directoryPath) {
    console.log('KORKOR directoryPath: ', directoryPath);
    const finalArray = [];
    const defPattern = /^\[\[def:/;
    const trefPattern = /^\[\[tref:.*?,/;

    try {
        const files = await fs.readdir(directoryPath);
        for (const file of files) {
            const filePath = path.join(directoryPath, file);
            const data = await fs.readFile(filePath, 'utf8');
            const lines = data.split('\n');

            for (const line of lines) {
                if (defPattern.test(line) || trefPattern.test(line)) {
                    const match = line.match(defPattern) || line.match(trefPattern);
                    if (match) {
                        const defContent = line.substring(match[0].length).split(']]')[0];
                        const entries = defContent.split(',').map(entry => entry.trim());
                        finalArray.push(entries);
                        break;
                    }
                }
            }
        }

        await fs.writeFile(
            path.join(directoryPath, '..', 'extracted-terms-' + path.basename(directoryPath) + '.json'),
            JSON.stringify(finalArray, null, 2)
        );
        return finalArray;
    } catch (err) {
        console.log('❌ Error processing files: ' + err);
        throw err;
    }
}