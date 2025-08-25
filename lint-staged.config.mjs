export default {
  // prettier-ignore
  '**/*': (files) => [
    `npx nx --tuiAutoExit --outputStyle=static affected:lint --fix`,
    `npx nx --tuiAutoExit --outputStyle=static format:write --files='${files.join(',')}'`,
  ],
  // prettier-ignore
  '**/*.scss': [
    'npx stylelint --fix'
  ],
};
