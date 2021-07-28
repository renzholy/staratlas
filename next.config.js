const withTM = require('next-transpile-modules')(['read-bigint'])

module.exports = withTM({
  webpack(config) {
    return {
      ...config,
      experiments: {
        topLevelAwait: true,
      },
    }
  },
})
