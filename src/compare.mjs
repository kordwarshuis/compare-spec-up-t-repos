import fs from 'fs/promises';
import path from 'path';

export async function compareFiles(config) {
    // Flatten the arrays in objectA and objectB
    const flatA = config.objectA.flat();
    const flatB = config.objectB.flat();

    // Get unique common entries (terms in both flatA and flatB)
    const uniqueInBoth = [...new Set(flatB.filter(entry => flatA.includes(entry)))];

    // Count occurrences in flatA and flatB for each common term
    const frequencyInBoth = uniqueInBoth.map(term => {
        const countInA = flatA.filter(item => item === term).length;
        const countInB = flatB.filter(item => item === term).length;
        return { term, countInA, countInB };
    });

    // Format the result string
    const stringResult = `Frequency of terms in both “${config.objectAname.name}” and “${config.objectBname.name}”:\n` +
        frequencyInBoth.map(entry => `${entry.term}: A=${entry.countInA}, B=${entry.countInB}`).join('\n');

    // JSON result for inBoth with frequencies
    const jsonResultInBoth = JSON.stringify(frequencyInBoth, null, 2);

    // Compute notInA and notInB (unchanged)
    const notInB = flatA.filter(entry => !flatB.includes(entry));
    const notInA = flatB.filter(entry => !flatA.includes(entry));
    const jsonResultNotInA = JSON.stringify(notInA, null, 2);
    const jsonResultNotInB = JSON.stringify(notInB, null, 2);

    console.log('\n\n');
    console.log(stringResult);

    // Write results to files
    await fs.writeFile(path.join('.', 'result-in-both.txt'), stringResult).catch(console.error);
    await fs.writeFile(path.join('.', 'result-in-both.json'), jsonResultInBoth).catch(console.error);
    await fs.writeFile(path.join('.', 'result-not-in-a.json'), jsonResultNotInA).catch(console.error);
    await fs.writeFile(path.join('.', 'result-not-in-b.json'), jsonResultNotInB).catch(console.error);

    return { notInB, notInA, frequencyInBoth };
}