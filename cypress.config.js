const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://opensource-demo.orangehrmlive.com",
    specPattern: 'cypress/e2e/**/*.sampath.js',
  },
  screenshotOnRunFailure: true,
  failOnStatusCode: false,
});
