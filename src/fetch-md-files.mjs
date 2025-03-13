import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import url from 'url';
import { existsSync } from 'fs'; // Import the synchronous fs module
    
export async function downloadMarkdownFiles(token, outputDir, config) {
    // GitHub API client with authentication
    const github = axios.create({
        baseURL: 'https://api.github.com',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    try {

        // Get directory contents from GitHub

        // Parse the GitHub URL to construct the API endpoint
        const parsedUrl = url.parse(config.url);
        const pathParts = parsedUrl.pathname.split('/');
        const owner = pathParts[1];
        const repo = pathParts[2];
        const branch = pathParts[4];
        const repoPath = pathParts.slice(5).join('/');

        // Get directory contents from GitHub
        const response = await github.get(`/repos/${owner}/${repo}/contents/${repoPath}?ref=${branch}`);
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

                    // Create the directory structure if it doesn't exist
                    const outputPath = path.join(outputDir, config.name, file.name);
                    await fs.mkdir(path.dirname(outputPath), { recursive: true });

                    // Write to local file
                    await fs.writeFile(outputPath, fileResponse.data);
                    console.log(`✅ Downloaded: ${file.name}`);
                } catch (error) {
                    console.error(`❌ Error downloading ${file.name}:`, error.message);
                }
            });

        // Wait for all downloads to complete
        await Promise.all(downloadPromises);
        console.log('✅ Download complete!');
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('❌ GitHub API response:', error.response.data);
        }
    }
}

// If you want to run it directly when the file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
    downloadMarkdownFiles();
}