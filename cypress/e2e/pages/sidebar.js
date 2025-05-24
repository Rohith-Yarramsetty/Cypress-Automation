import selectors from "../selectors/sidebar"

export class SideBar {
  verifyProductsDropdownText(dropDownText) {
    cy.get(selectors.productDropDownText).should('have.text', dropDownText)
  }

  clickOnProductsDropdown() {
    cy.get(selectors.productDropDownText).click();
  }

  selectProdOrCmpFromDropdown(prodName) {
    cy.xpath(selectors.productOrCmpInDropdown.replace('prodName', prodName))
      .scrollIntoView()
      .click()
  }

  goToListItem(cmpNameOrCpn) {
    cy.get(selectors.listItem).contains(cmpNameOrCpn)
      .click();
  }

  clickExpandChildIcon(nameOrCpn) {
    cy.xpath(selectors.expandChildIcon.replace('name/cpn', nameOrCpn))
      .click()
  }

  clickOnChildAssemblyForAssembly(childName) {
    cy.xpath(selectors.assemblyListItem).contains(childName).click()
  }

  verifyAssemblyCount(rowLength) {
    cy.get(selectors.assemblyCount).find("li").then((row) => {
      expect(row.length).to.be.equal(rowLength)
    });
  }
}
