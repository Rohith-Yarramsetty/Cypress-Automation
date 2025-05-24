/// <reference types="cypress" />

import { FeatureHelpers } from "./featureHelper";

const featureHelper = new FeatureHelpers();

export class NavHelpers {
  navigateToSearch(path = '') {
    cy.visit(`/search${path}`);
    featureHelper.waitForLoadingIconToDisappear();
  }

  navigateToIntegrationsSettings() {
    cy.visit('/settings/integrations')
    featureHelper.waitForLoadingIconToDisappear();
  }

  navigateToUsers() {
    cy.visit('/settings/users')
  }

  navigateToConfiguration() {
    cy.visit('/settings/configurations')
  }

  navigateToGroups() {
    cy.visit('/settings/groups')
  }

  navigateToSearch() {
    cy.visit('/search')
  }

  navigateToCompanyProfile() {
    cy.visit('/settings/company')
  }

  verifySpecifiedPathNotAccessIble(url) {
    cy.visit(url)
    cy.url().should('not.have', url)
  }

  verifySpecifiedPathIsAccessIble(url) {
    cy.visit(url)
    cy.url().should('contain', url)
  }
}
