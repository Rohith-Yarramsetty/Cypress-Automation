// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
import "cypress-file-upload";
import "cypress-mailosaur";
require('cypress-downloadfile/lib/downloadFileCommand');

const LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add('saveLocalStorage', () => {
    Object.keys(localStorage).forEach(key => {
      LOCAL_STORAGE_MEMORY[key] = localStorage[key];
    });
    cy.wait(200);
  });

Cypress.Commands.add('restoreLocalStorage', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

Cypress.Commands.add("parseXlsx", (inputFile) => {
  return cy.task('parseXlsx', { filepath: inputFile})
});

Cypress.Commands.add("uploadFileApi", (fileName, fileType, endpoint, access_token) => {
  const baseUrl = Cypress.config().baseUrl;
  const apiUrl = baseUrl.includes('test') ? baseUrl.replace("//test", "//api") : baseUrl.replace("//", "//api.");
  const url = apiUrl + endpoint
  cy.fixture(fileName, "binary")
  .then((binary) => Cypress.Blob.binaryStringToBlob(binary, fileType))
  .then((blob) => {
  const formData = new FormData();
  formData.append('file', blob, fileName);
  return fetch(url, {
      method: 'POST',
      body: formData,
      headers: { authorization: `Bearer ${access_token}` },
    }).then(response => {
        return response.json()
    }).then((res) => {
      return res.data;
    })
  })
})

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
