/// <reference types="cypress" />

import { PropelAuthApi } from "../api/propelAuthApi";
import { FeatureHelpers } from "./featureHelper";

const featureHelper = new FeatureHelpers();
const propelApi = new PropelAuthApi();

const baseUrl = Cypress.config().baseUrl;
const apiUrl = baseUrl.includes('test') ? baseUrl.replace("//test", "//api") : baseUrl.replace("//", "//api.");

let access_token;

export class ApiHelpers {
  postrequest(path, headers, body) {
    return this.getAccessToken().then((response) => {
      access_token = response.body.access_token;
      return cy.request({
        method: 'POST',
        url: apiUrl + path,
        headers: { authorization: `Bearer ${access_token}` },
        body: body,
        retryOnStatusCodeFailure: true
      })
    })
  }

   getRequest(path) {
    return this.getAccessToken().then((response) => {
      access_token = response.body.access_token;
      return cy.request({
        url: apiUrl + path,
        headers: { authorization: `Bearer ${access_token}` }
      })
    })
  }

  patchrequest(path, headers, body) {
    return this.getAccessToken().then((response) => {
      access_token = response.body.access_token;
      return cy.request({
        method: 'PATCH',
        url: apiUrl + path,
        headers: { authorization: `Bearer ${access_token}` },
        body: body,
        retryOnStatusCodeFailure: true
      })
    })
  }

  deleteRequest(path, headers) {
    return this.getAccessToken().then((response) => {
      access_token = response.body.access_token;
      return cy.request({
        method: 'DELETE',
        url: apiUrl + path,
        headers: headers,
        retryOnStatusCodeFailure: true
      })
    })
  }

  getAccessToken() {
    let propEnv = featureHelper.propelAuthUrl();

    const headers = {
      'Content-Type': 'application/json',
    };

    return cy.request({
      url: `${propEnv}/api/v1/refresh_token`,
      headers: headers,
      retryOnStatusCodeFailure: true
    })
  }

  getApiToken() {
    const path = apiUrl.replace("api", "core-api");

    let api_token;
    return this.getAccessToken().then(res => {
      const access_token = res.body.access_token;
      return cy.request({
        method: 'POST',
        url: path + "/graphql",
        headers: {
          'Content-Type': 'application/json',
          'Authorization' : `Bearer ${access_token}`,
          'origin': Cypress.config().baseUrl,
          'referer': `${Cypress.config().baseUrl}/`,
        },
        body: JSON.stringify({
          query: `
            query {
              apiToken {
                token
                __typename
              }
            }
          `
        })
      })
    })
  }
}
