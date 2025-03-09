# Compare CTWG and KERI

## Instructions

- Create a dedicated directory and cd into into it (the script is not foolproof and may overwrite files in the current directory)
- Run:

```bash
npx @korkor/compare-ctwg-keri
```

- Enter GitHub Personal Access Token
- Check ./results.txt

## Explanation

Compares the terms in the [CTWG](https://github.com/trustoverip/ctwg-main-glossary/tree/main/spec/terms-definitions) and [henkvancann/ks](https://github.com/henkvancann/ks/tree/main/spec/spec_terms_directory) repositories.

Lists the terms that are in both repositories. Outputs the results to `./results.txt` and to console.