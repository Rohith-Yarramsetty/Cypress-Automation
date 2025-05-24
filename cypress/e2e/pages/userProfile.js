/// <reference types="cypress" />
import { FeatureHelpers } from "../helpers/featureHelper";
import selectors from "../selectors/accountSettings/users";

const featureHelpers = new FeatureHelpers();

let verifyValue = (selector, assertText) => {
  selector.startsWith("//")
  ? cy.xpath(selector).should('have.attr', 'value', assertText)
  : cy.get(selector).should('have.attr', 'value', assertText)
}

export class UserProfile {
  enterEmail(email = "tester@qa.co") {
    cy.get(selectors.profilePage.email).clear().type(email);
  }

  enterFirstName(firstName = "Joe") {
    cy.get(selectors.profilePage.firstName).clear().type(firstName);
  }

  enterLastName(lastName = "Doe") {
    cy.get(selectors.profilePage.lastName).clear().type(lastName);
  }

  enterPhoneNumber(number = 987654321) {
    cy.get(selectors.profilePage.phoneNumber).clear().type(number);
  }

  enterJobTitle(title = "QA") {
    cy.get(selectors.profilePage.jobTitle).clear().type(title);
  }

  selectUserRole(role = "Administrator") {
    cy.get(selectors.profilePage.role).select(role);
  }

  verifyEmail(email) {
    verifyValue(selectors.profilePage.email, email);
  }

  verifyFirstName(firstName) {
    verifyValue(selectors.profilePage.firstName, firstName);
  }

  verifyLastName(lastName) {
    verifyValue(selectors.profilePage.lastName, lastName);
  }

  verifyPhoneNumber(number) {
    verifyValue(selectors.profilePage.phoneNumber, number);
  }

  verifyJobTitle(title) {
    verifyValue(selectors.profilePage.jobTitle, title);
  }

  verifyUserRole(role = "ADMINISTRATOR") {
    cy.get(selectors.profilePage.selectedRole(role)).should('be.selected');
  }

  clickSaveBtn() {
    cy.get(selectors.profilePage.saveBtn).click();
    featureHelpers.waitForLoadingIconToDisappear();
  }

  clickCancelBtn() {
    cy.xpath(selectors.profilePage.cancelBtn).click();
  }

  confirmLogout() {
    cy.xpath(selectors.profilePage.confirmLogout).click();
  }

  verifySaveBtn(state) {
    state == "Disabled"
    ? cy.get(selectors.profilePage.saveBtn)
        .should('have.class', 'disabled')
    : cy.get(selectors.profilePage.saveBtn)
        .should('not.have.class', 'disabled')
  }

  verifyCancelBtn(state) {
    state == "Disabled"
    ? cy.xpath(selectors.profilePage.cancelBtn)
        .should('have.class', 'disabled')
    : cy.xpath(selectors.profilePage.cancelBtn)
        .should('not.have.class', 'disabled')
  }

  changePasswordThroughDuro(
    new_Password, old_Password = Cypress.env('password')) {
    // Navigate to Auth page for password change
    cy.contains('Password')
      .should('be.visible')
      .click();
    if(Cypress.config().baseUrl.includes('staging')) {
      cy.contains('Update Password').click();
      cy.xpath(selectors.profilePage.oldPassword)
        .clear().type(old_Password)
        .should('have.value', old_Password);

      // Change the password
      cy.xpath(selectors.profilePage.newPassword)
        .clear().type(new_Password)
        .should('have.value', new_Password);
      cy.get('form button').contains('Update Password').click();
      cy.contains('Password updated').should('not.exist');
    } else {
      cy.origin(featureHelpers.propelAuthUrl()+'/account',
      { args: {new_Password, old_Password} }, ({old_Password, new_Password}) => {
        cy.contains('Update Password').click();
        cy.get('form').within(() => {
          cy.get('div>div>div').eq(0).type(old_Password);

          // Change the password
          cy.get('div>div>div').eq(1).clear().type(new_Password);
          cy.get('button').contains('Update Password').click();
        })
        cy.contains('Password updated').should('not.exist');
      })
    }
  }

  logOutFromAuthPage() {
    if(Cypress.config().baseUrl.includes('staging')) {
      cy.contains('Logout').click({force: true});
      this.confirmLogout();
    } else {
      cy.origin( featureHelpers.propelAuthUrl(), { args: {} }, ({}) => {
        cy.contains('Logout').click({force: true});
        cy.wait(2000).get('div>div>div>button').contains('Logout').click().should('not.exist');
      })
    }
    cy.wait(3000);
  }
}

