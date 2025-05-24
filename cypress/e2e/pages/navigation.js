import { FeatureHelpers } from "../helpers/featureHelper";
import selectors from "../selectors/navigation"

const featureHelper = new FeatureHelpers();

export class Navigation {

  verifyNavigationMenuItems() {
    cy.get(selectors.componentsLink).should('be.visible');
    cy.wait(5000);
    cy.get('body').then((body) => {
      if(body.find(selectors.addUsersModal).length>0) {
        this.clickSkipThisStepInAddUsersModal();
        this.clickOnCompanyAccountInStartingPage();
      }
    })
    // cy.get(selectors.changeOrdersLink).should('be.visible');
    // cy.get(selectors.releasesLink).should('be.visible');
  }

  openProductTab() {
    this.openTab(selectors.productLink);
  }

  openComponentsTab() {
    this.openTab(selectors.componentsLink);
  }

  openChangeOrdersTab() {
    this.openTab(selectors.changeOrdersLink);
  }

  openReleasesTab() {
    this.openTab(selectors.releasesLink);
  }

  openTab(selector) {
    cy.get(selector).should('be.visible').click()
      // .get(selectors.loadingSpinner).should('be.visible')
      .get(selectors.loadingSpinner).should('not.exist')
      .get(selectors.tableData).should('be.visible')
  }

  expandSelectProductDropdown() {
    cy.get(selectors.selectProductDropdownBtn).should('have.text', 'Select Product')
    cy.get(selectors.collapsedProductDropdown).should('be.visible')
    cy.get(selectors.selectProductDropdownIcon).should('be.visible').click()
    cy.get(selectors.expandedProductDropdown).should('be.visible')
    cy.get(selectors.selectProductContent).should('be.visible')
  }

  selectProduct(productName) {
    this.expandSelectProductDropdown()
    cy.contains(productName).click()
    cy.get(selectors.selectProductDropdownBtn).should('contain.text', productName)
  }

  navigateToConfiguration() {
    cy.visit('/settings/configurations')
  }

  openExportPage() {
    cy.visit('/Export')
  }

  openDashboard() {
    cy.visit('/dashboard');
    featureHelper.waitForLoadingIconToDisappear();
  }

  openProfilePage() {
    cy.visit('settings/user');
    cy.wait(3000).get('.ui-loading').should('not.exist');
  }

  clickSkipThisStepInAddUsersModal() {
    cy.get(selectors.skipThisStepInAddUsersModal).click();
  }

  clickOnCompanyAccountInStartingPage() {
    cy.xpath(selectors.companyAccount).click();
  }
}
