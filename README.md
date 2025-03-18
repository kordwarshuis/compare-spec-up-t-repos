# Compare two Spec-Up-T repositories

This is a local-machine command line tool. People who prepare the comparison of two Spec-Up-T-based glossaries run this tool to see which terms match the two glossaries. The reason why people compare could be:
- inventory of shared understanding, scope, or mental model
- (partly) replace their definitions with references to the companion glossary
Read below how to make a comparison that results in an index.html file with the results of an exact match (no fuzzy search possible yet)

> ⚠️ **Warning**
> 
> If you decide to put this tool in a public repository, make sure to remove the token before pushing it to the repository. You can do this by removing the token from the `config.js`.
> 
> Example:
> 
> ```js
> module.exports = {
>     token: 'ghp_ABCDEFG123456789',
>     …
>     …
> }
> ```
> 
> Remove `ghp_ABCDEFG123456789` from the file before pushing it to the repository.

## Instructions

- Go to the URL of the first repository in your browser and browse to the `terms and definitions` directory
- Copy the URL of the directory where the terms and definitions are stored (usually `/specs/terms-and-definitions`) and save it somewhere
- Do the same for the second repository

- In your command line run:

```bash
npx @korkor/compare-spec-up-t-repos
```

- Enter GitHub Personal Access Token
- Enter a name for the output directory (you are free to choose any name)
- Enter a name for the first repository (you are free to choose any name)
- Enter the URL for the first repository
- Enter a name for the second repository (you are free to choose any name)
- Wait for the script to finish

## Results

You now have a directory with the name you chose earlier. Inside the directory, you will find the downloaded terms and definitions from the two repositories. You will also find json files with the terms that are in both repositories and the terms that are in only one of the repositories.

In the root of the directory, you will find an `index-<name of directory>.html` file that you can open in your browser to see the results.
