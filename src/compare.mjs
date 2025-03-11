import fs from 'fs/promises';
import path from 'path';

export async function compareFiles(config) {
    const notInB = [];
    const notInA = [];

    // Flatten the arrays in objectA and objectB
    const flatA = config.objectA.flat();
    const flatB = config.objectB.flat();

    // Find entries in objectA that are not in objectB
    flatA.forEach(entry => {
        if (!flatB.includes(entry)) {
            notInB.push(entry);
        }
    });

    // Find entries in objectB that are not in objectA
    flatB.forEach(entry => {
        if (!flatA.includes(entry)) {
            notInA.push(entry);
        }
    });

    // Entries in B that are also in A
    const inBoth = flatB.filter(entry => flatA.includes(entry));
    const stringResult = `Entries in both “${config.objectAname.name}” and “${config.objectBname.name }”: ` + JSON.stringify(inBoth, null, 2);    

    console.log('\n\n');
    console.log(stringResult);

    // Write stringResult to a file
    await fs
        .writeFile(path.join('.', 'result.txt'), stringResult)
        .catch(console.error);
    
    return { notInB, notInA, inBoth };
}
