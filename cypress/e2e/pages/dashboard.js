import selectors from "../selectors/dashboard"

export class Dashboard {

  clickOnCreateProduct() {
    cy.xpath(selectors.createProductBtn).click();
  }

  enterNewProductDetails() {
    this.selectComponentCategory();
    this.enterProductName();
    this.enterLifeStyleStatus();
    this.enterRevision();
  }

  selectComponentCategory(componentCategory = "Electrical") {
    cy.get('[value="' + componentCategory + '"]').check()
  }

  enterProductName() {
    cy.get(selectors.productNameTxtBx).type('BIKE')
  }

  enterRevision() {
    cy.get(selectors.revisionTxtBx).type("1")
  }

  enterLifeStyleStatus(status = "PROTOTYPE") {
    cy.get(selectors.lifeStyle).select(status)
  }

  clickOnCreate() {
    cy.get(selectors.createBtn).click();
  }

  verifyDashBoardPageAndUrl() {
    cy.get(selectors.dashBoardPage)
      .should('exist');
    cy.url().should('include', '/dashboard');
  }

  verifyDashboardPageUrl() {
    cy.url().should('include', '/dashboard');
  }

  enterSearchTerm(searchText) {
    cy.get(selectors.searchField).clear().type(searchText, {delay: 0});
  }

  getSearchRowContent(data) {
    return data.includes('cpn')   ? cy.get(`${selectors.resultRow} td:nth-child(2)>span`).invoke('text') :
           data.includes('eid')   ? cy.get(`${selectors.resultRow} td:nth-child(4) p`).invoke('text')    :
           data.includes('name')  ? cy.get(`${selectors.resultRow} td:nth-child(2)>div`).invoke('text')  :
           data.includes('desc')  ? cy.get(`${selectors.resultRow} td:nth-child(4) p`).invoke('text')    :
           data.includes('type')  ? cy.get(`${selectors.resultRow} td:nth-child(1)>div`).invoke('text')  :
           data.includes('status')? cy.get(`${selectors.resultRow} td:nth-child(5)`).invoke('text')      : 0
  }

  waitForResultsRowsToBeVisible() {
    cy.get(selectors.searchBar).should('be.visible')
    cy.get(`${selectors.resultRow}:not(.footer-row)`).should('be.visible')
  }
}
