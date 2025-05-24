import selectors from "../selectors/headers"

export class Headers {
  signout() {
    this.clickOnAvatarIcon();
    this.clickOnSignOutBtn();
  }

  clickOnAvatarIcon() {
    cy.get(selectors.userIconBtn).click({force: true});
  }

  clickOnSignOutBtn() {
    cy.get(selectors.signoutBtn).click();
  }

  clickOnAccountSettings() {
    cy.get(selectors.accountSettingsBtn).click();
  }

  clickOnCompanyName() {
    cy.get(selectors.companyName)
      .should('not.be.disabled')
      .click();
  }

  assertSignOutOptionInDropDownIsShown() {
    cy.get(selectors.signoutBtn)
      .contains('Sign out');
  }

  closeTheAvatarDropdown() {
    cy.get(selectors.closeAvatarDropdown).click(); 
  }

  enterSearchTerm(searchText) {
    cy.get(selectors.searchField).clear().type(searchText);
    cy.get(selectors.searchField).type('{enter}');
  }

  clickOnMixedSearchIcon() {
    cy.get(selectors.mixedSearch)
      .click({force:true})
  }

  verifyEmailInAvatarModal(email) {
    cy.get(selectors.avatarModalEmail).should('have.text', email)
  }

  clickOnAvatarModalEmail() {
    cy.get(selectors.avatarModalEmail).click();
  }

  clickOnHelpAndDocumentation() {
    cy.get(selectors.help_And_Documentation).invoke('removeAttr', 'target').click();
  }

  clickOnSubmitTicket() {
    cy.get(selectors.submit_A_Ticket).invoke('removeAttr', 'target').click();
  }

  clickOnPolicy() {
    cy.get(selectors.policy).click();
  }
}
