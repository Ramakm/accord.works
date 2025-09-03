/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude problematic dependencies from server-side bundling
      config.externals = config.externals || []
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        'mammoth': 'commonjs mammoth',
        'canvas': 'canvas'
      })
    }
    return config
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth']
  }
}

module.exports = nextConfig
