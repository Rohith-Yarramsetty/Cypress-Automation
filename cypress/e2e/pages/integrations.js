/// <reference types="cypress" />
import { NavHelpers } from "../helpers/navigationHelper";
import selectors from "../selectors/integrations";

const navHelper = new NavHelpers();

export class Integrations {
  clickActionLink(row, col) {
    return cy.get(selectors.nthActionLink(row, col))
      .click();
  }

  getTableCell(row, col) {
    return cy.get(selectors.nthTableCell(row, col));
  }
  connectValispace() {
    navHelper.navigateToIntegrationsSettings();
    // First check if Valispace is Connected
    this.getTableCell(3, 4).invoke('text').then($text => {
      if($text === "Connected") return;
      cy.xpath(selectors.connectIntegration('Valispace')).should('exist');
      this.clickActionLink(3, 5);
      cy.get(selectors.formBlock).should('be.visible');
      cy.get(selectors.urlInput).clear().type(Cypress.env('valispaceUrl'));
      cy.get(selectors.usernameInput).type(Cypress.env('valispaceUsername'));
      cy.get(selectors.passwordInput).type(Cypress.env('valispacePassword'));
      cy.get(selectors.connectBtn).should('not.have.class', 'disable')
        .click();
      cy.contains('Connection Succeeded').should('be.visible');
    })
  }

  clickOnHelpIconForPlugin(pluginName) {
    cy.xpath(selectors.helpIconForPlugin.replace('name', pluginName))
      .invoke('removeAttr', 'target')
      .click()
  }
}
