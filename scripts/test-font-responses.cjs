// Test-only fallback when Google Fonts is blocked. Do not configure in production.
module.exports = new Proxy({}, {
  get: (_, url) => `@font-face { font-family: '${url.includes('Figtree') ? 'Figtree' : 'Saira Condensed'}'; src: local('Arial'); font-style: normal; font-weight: 100 900; }`,
});
