/// <reference types="cypress" />

export class IntegrationsApi {
  getValispaceAccessToken() {
    const valispaceBaseUrl = Cypress.env('valispaceUrl');
    const username = Cypress.env('valispaceUsername');
    const password = encodeURIComponent(Cypress.env('valispacePassword'));
    const url = `${valispaceBaseUrl}o/token/?client_id=ValispaceREST&username=${username}&password=${password}&grant_type=password`;
    const headers = {
      'Content-Type': 'application/json'
    }

    return cy.request({
      url,
      method: 'POST',
      headers,
      retryOnStatusCodeFailure: true,
    }).then(res => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('access_token')
      cy.wrap(res.body.access_token).as('valispaceAccessToken')
    })
  }

  makeValispaceRequest({
    path = '',
    method = 'GET',
    headers = {},
  }) {
    const valispaceBaseUrl = Cypress.env('valispaceUrl');
    const url = `${valispaceBaseUrl}rest/${path}`;
    return cy.get('@valispaceAccessToken').then(token => {
      headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers,
      }

      return cy.request({
        url,
        headers,
        method,
        retryOnStatusCodeFailure: true,
      }).then(res => {
        expect(res.status).to.eq(200);
        cy.wrap(res.body)
      });
    });
  }

  getValispaceComponentData(componentId) {
    const path = `components/${componentId}/`;
    return this.makeValispaceRequest({ path });
  }

  getValispaceValiData(valiId) {
    const path = `valis/${valiId}/`;
    return this.makeValispaceRequest({ path });
  }
}