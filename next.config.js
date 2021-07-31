const withTM = require('next-transpile-modules')(['read-bigint'])
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(
  withTM({
    webpack(config) {
      return {
        ...config,
        experiments: {
          topLevelAwait: true,
        },
      }
    },
  }),
  { silent: true },
)
