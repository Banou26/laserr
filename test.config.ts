import type { EPKConfig } from 'epk'

const config: EPKConfig = {
  configs: [
    {
      name: 'extension',
      platform: 'chromium',
      browserConfig: {
        args: ['--disable-web-security'],
        headless: false
      },
      web: {
        match: ['./tests/**/*.ts']
      },
      esbuild: {
        format: 'esm'
      }
    }
  ]
}

export default config
