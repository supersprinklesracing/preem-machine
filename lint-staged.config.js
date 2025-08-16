module.exports = {
  // prettier-ignore
  '*': (files) => [
    'nx affected:lint --fix --files',
    `nx format:write --files='${files.join(',')}'`,
  ],
  // prettier-ignore
  '*.scss': [
    'npx stylelint --fix'
  ],
};
