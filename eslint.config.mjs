import nextConfig from 'eslint-config-next';

export default [
  ...nextConfig,
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', 'build/**', 'Admin/**'],
  },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/exhaustive-deps': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-html-link-for-pages': 'off',
      'import/no-anonymous-default-export': 'off',
    },
  },
];