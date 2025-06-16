import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';
import url from 'url';
import { existsSync } from 'fs'; // Import the synchronous fs module
    
export async function downloadMarkdownFiles(token, outputDir, config) {
    // GitHub API client with or without authentication
    const githubConfig = {
        baseURL: 'https://api.github.com',
        headers: {
            'Accept': 'application/vnd.github.v3+json'
        }
    };
    
    // Only add Authorization header if token is provided
    if (token && token.trim() !== '') {
        githubConfig.headers['Authorization'] = `token ${token}`;
    } else {
        console.log('⚠️  No GitHub token provided. Rate limits may apply for API requests.');
    }
    
    const github = axios.create(githubConfig);
    
    try {
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

        console.log(`✅ Downloading ${repo} files`);

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
                    // console.log(`✅ Downloaded: ${file.name}`);
                } catch (error) {
                    console.error(`❌ Error downloading ${file.name}:`, error.message);
                }
            });

        // Wait for all downloads to complete
        await Promise.all(downloadPromises);
        console.log(`✅ Download ${repo} files complete!`);
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('❌ GitHub API response:', error.response.data);
            
            if (error.response.status === 403 && error.response.data.message.includes('rate limit')) {
                console.error('❌ GitHub API rate limit exceeded. Consider using a token for higher rate limits.');
            } else if (error.response.status === 404) {
                console.error('❌ Repository or path not found. Make sure the repository is public or you have the correct access token.');
            }
        }
    }
}

// If you want to run it directly when the file is executed
if (import.meta.url === `file://${process.argv[1]}`) {
    downloadMarkdownFiles();
}