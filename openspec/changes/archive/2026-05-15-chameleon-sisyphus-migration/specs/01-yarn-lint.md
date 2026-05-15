# yarn lint - PASSED

## Exit Code: 0

## Output:
```
yarn run v1.22.19
warning ../../../package.json: No license field
$ eslint "{src,tests}/**/*.{ts,tsx}"
(node:99456) ESLintIgnoreWarning: The ".eslintignore" file is no longer supported. Switch to using the "ignores" property in "eslint.config.js": https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
(Use `node --trace-warnings ...` to show where the warning was created)
Done in 5.30s.
EXIT_CODE: 0
```

## Summary:
- No lint errors
- Only a warning about deprecated .eslintignore format (non-blocking)
- Exit code: 0 ✓
