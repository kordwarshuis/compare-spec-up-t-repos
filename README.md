# Compare two Spec-Up-T repositories

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