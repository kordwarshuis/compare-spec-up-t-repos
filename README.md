# Compare two Spec-Up-T repositories

## Instructions

- Create a dedicated directory and `cd` into into it (the script is not foolproof and may overwrite files in the current directory)
- Run:

```bash
npx @korkor/compare-spec-up-t-repos
```

- Enter GitHub Personal Access Token
- Go to the URL of first repository in your browser and browse to the `terms and definitions` directory
- Copy the URL of the `terms and definitions` directory
- Paste the URL into the console
- Repeat the last two steps for the second repository
- Wait for the script to finish
- Check ./index.html

## Explanation

Compares the terms in two repositories.

Compares the terms that are in both repositories. Outputs the results to `./index.html`.