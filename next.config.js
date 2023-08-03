const commitHash = require('child_process')
    .execSync('git rev-parse --short HEAD')
    .toString()
    .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'www',
  env: {
    COMMIT_HASH: commitHash,
  },
}

module.exports = nextConfig
