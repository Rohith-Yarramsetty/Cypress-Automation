const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://opensource-demo.orangehrmlive.com",
    specPattern: 'cypress/e2e/**/*.cy.js',
  },
  screenshotOnRunFailure: true,
  failOnStatusCode: false,
  defaultCommandTimeout: 10000,
  watchForFileChanges: false,
});
