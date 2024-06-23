/** @type {import("prettier").Config} */
module.exports = {
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  jsxSingleQuote: false,
  trailingComma: 'none',
  importOrder: [
    '<THIRD_PARTY_MODULES>',
    '^@lib/(.*)$',
    '^@components/(.*)$',
    '^[./]'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss'
  ]
}
