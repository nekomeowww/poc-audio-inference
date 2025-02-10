import antfu from '@antfu/eslint-config'

export default await antfu(
  {
    formatters: true,
    yaml: false,
    markdown: false,
    rules: {
      'prefer-const': 'off',
    },
  },
)
