import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';

export async function downloadMarkdownFiles(config) {
    // GitHub API client with authentication
    const github = axios.create({
        baseURL: 'https://api.github.com',
        headers: {
            'Authorization': `token ${config.githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    try {
        // Create output directory if it doesn't exist
        await fs.mkdir(config.outputDir, { recursive: true });

        // Get directory contents from GitHub
        const response = await github.get(`/repos/${config.owner}/${config.repo}/contents/${config.path}`);
        const files = response.data;

        // Filter for markdown files and download each one
        const downloadPromises = files
            .filter(file => file.name.endsWith('.md'))
            .map(async (file) => {
                try {
                    // Get the file content
                    const fileResponse = await axios.get(file.download_url, {
                        responseType: 'text'
                    });

                    // Write to local file
                    const outputPath = path.join(config.outputDir, file.name);
                    await fs.writeFile(outputPath, fileResponse.data);
                    console.log(`Downloaded: ${file.name}`);
                } catch (error) {
                    console.error(`Error downloading ${file.name}:`, error.message);
                }
            });

        // Wait for all downloads to complete
        await Promise.all(downloadPromises);
        console.log('Download complete!');
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('GitHub API response:', error.response.data);
        }
    }
}

// If you want to run it directly when the file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
    downloadMarkdownFiles();
}