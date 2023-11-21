/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  overrides: [
    {
      files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
      extends: ['plugin:cypress/recommended']
    }
  ],
  end: {
    node: true
  },
  rules: {
    'vue/multi-word-component-names': 'off' //this locks eslint not to show an error if i don't put two names into an app name
  },
  parserOptions: {
    ecmaVersion: 'latest'
  }
}
