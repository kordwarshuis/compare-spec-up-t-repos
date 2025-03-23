import fs from 'fs/promises';
import path from 'path';

export async function compareTerms(config) {

    // console.log('KORKOR config.objectA: ', config.objectA);

    // Flatten the arrays in objectA and objectB
    // console.log('KORKOR config.objectA: ', config.objectA);
    const flatA = config.objectA.flat();
    const flatB = config.objectB.flat();

    // Get unique common entries (terms in both flatA and flatB)
    const uniqueInBoth = [...new Set(flatB.filter(entry => flatA.includes(entry)))];

    // Count occurrences in flatA and flatB for each common term
    const frequencyInBoth = uniqueInBoth.map(term => {
        // console.log('KORKOR term: ', term);
        const countInA = flatA.filter(item => item === term).length;
        const countInB = flatB.filter(item => item === term).length;
        return { term, countInA, countInB };
    });

    // Get unique entries for notInA and notInB
    const uniqueNotInA = [...new Set(flatB.filter(entry => !flatA.includes(entry)))];
    const uniqueNotInB = [...new Set(flatA.filter(entry => !flatB.includes(entry)))];

    // Count occurrences for notInA (in flatB) and notInB (in flatA)
    const frequencyNotInA = uniqueNotInA.map(term => ({
        term,
        countInB: flatB.filter(item => item === term).length
    }));
    const frequencyNotInB = uniqueNotInB.map(term => ({
        term,
        countInA: flatA.filter(item => item === term).length
    }));

    // Format the result strings
    const stringResultInBoth = `Frequency of terms in both “${config.objectAname.name}” and “${config.objectBname.name}”:\n` +
        frequencyInBoth.map(entry => `${entry.term}: A=${entry.countInA}, B=${entry.countInB}`).join('\n');
    const stringResultNotInA = `Frequency of terms in “${config.objectBname.name}” but not in “${config.objectAname.name}”:\n` +
        frequencyNotInA.map(entry => `${entry.term}: B=${entry.countInB}`).join('\n');
    const stringResultNotInB = `Frequency of terms in “${config.objectAname.name}” but not in “${config.objectBname.name}”:\n` +
        frequencyNotInB.map(entry => `${entry.term}: A=${entry.countInA}`).join('\n');

    // JSON results with frequencies
    const jsonResultInBoth = JSON.stringify(frequencyInBoth, null, 2);
    const jsonResultNotInA = JSON.stringify(frequencyNotInA, null, 2);
    const jsonResultNotInB = JSON.stringify(frequencyNotInB, null, 2);


    // Write results to files
    await fs.writeFile(path.join('.', config.outputDir, 'result-in-both.json'), jsonResultInBoth).catch(console.error);
    await fs.writeFile(path.join('.', config.outputDir, 'result-not-in-a.json'), jsonResultNotInA).catch(console.error);
    await fs.writeFile(path.join('.', config.outputDir, 'result-not-in-b.json'), jsonResultNotInB).catch(console.error);

    return { frequencyNotInB, frequencyNotInA, frequencyInBoth };
}