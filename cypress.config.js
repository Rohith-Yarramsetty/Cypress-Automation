const { defineConfig } = require('cypress')

module.exports = defineConfig({
  env: {
    username: 'ragul.sugumar@qualitlabs.com',
    password: 'Success@2022',
    debug: 'cypress:*',
    domain: 'Qualitlabs',
    valispaceUrl: 'https://durolabs.valispace.com/',
    valispaceUsername: 'michael',
    valispacePassword: 'duro&vali',
    oxideUsername: 'jahan+oxide@durolabs.co',
    oxidePassword: 'jahan@2021!',
    orbitFabUsername: 'zaeem+orbitfab@durolabs.co',
    orbitFabPassword: 'admin@123',
    propelAuthUsername: 'mezi@durolabs.co',
    propelAuthPassword: 'd@tekuam3natiA',
  },
  retries: {
    runMode: 1,
    openMode: 0,
  },
  chromeWebSecurity: true,
  video: false,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 90000,
  responseTimeout: 120000,
  viewportWidth: 1440,
  viewportHeight: 920,
  projectId: 'xoze8u',
  watchForFileChanges: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      require('./cypress/plugins/index.js')(on, config)
      require('@cypress/grep/src/plugin')(config);
      return config;
    },
    baseUrl: 'https://staging-gcp.durolabs.xyz',
    specPattern: 'cypress/e2e/**/*.spec.js',
    experimentalSessionAndOrigin: true,
  },
})
