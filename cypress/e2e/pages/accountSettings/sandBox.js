/// <reference types="cypress" />
import selectors from "../../selectors/accountSettings/sandBox"

export class SandBox {
  clickOnSandBoxOption() {
    cy.xpath(selectors.sandboxOptn).click();
  }

  verifySandBoxLogoPresent() {
    cy.get(selectors.sandBoxLogo).should('exist');
  }

  verifySandBoxMsg(assertText) {
    cy.get(selectors.sandBoxMsg).invoke('text').should('contain', assertText.toString())
  }

  clickOnExitSandBox() {
    cy.get(selectors.exitSandBox).click({force: true});
  }

  verifyPrivateSandBoxPopOverPresent() {
    cy.get(selectors.privateSandBoxPopOver).should('exist');
  }

  verifyCompanyAccPopOverPresent() {
    cy.get(selectors.companyAccPopOver).should('exist');
  }

  clickOngotItBtnInPopOver() {
    cy.get(selectors.gotItBtnInPopOver).click();
  }

  clickOnProductTab() {
    cy.xpath(selectors.productLink).click();
  }
}