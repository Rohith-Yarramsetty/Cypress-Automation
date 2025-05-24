/// <reference types="cypress" />

import selectors from "../../selectors/components/variants";

export class Variants {

  navigateToVariantsTab() {
    cy.get(selectors.variantTab).click()
  }

  verifyLengthOfVariantsAssemblyTable(length = "") {
    cy.get(selectors.variantsAssemblyTable)
      .should('have.length', length+1)  // -1 represents table header
  }

  verifyQuantityOfComponent(cmpName, varient, assertText) {
    cy.xpath(selectors.cellSelector.replace('compData', cmpName))
      .invoke('index').then((rowIndex) => {
        cy.xpath(selectors.columnSelector.replace('colName', varient))
          .invoke('index').then((columnIndex) => {
            cy.get(selectors.assertText.replace('rowIndex', rowIndex+1).replace('colIndex', columnIndex+1))
              .should('be.visible')
              .should('have.text', assertText)
          })
      })
  }

  verifyNoOfAssemblyVariants(noOfVariants) {
    cy.get(selectors.assemblyTable.noOfVariants)
      .should('have.length', 2+noOfVariants)
  }

  verifyAssemblyVariantsExists(noOfVariants, expectedVariants = []) {
    this.verifyNoOfAssemblyVariants(noOfVariants);
    cy.get(selectors.assemblyTable.tableHeader).then(($els) => {

      const actualVariants = Array.from($els, el => el.innerText);

      cy.wrap(expectedVariants).each((item) => {
        expect(actualVariants[0].includes(item)).to.eq(true)
      })
    })
  }

  verifyAssemblyVariantsNotExists(expectedVariants = []) {
    cy.get(selectors.assemblyTable.tableHeader).then(($els) => {

      const actualVariants = Array.from($els, el => el.innerText);

      cy.wrap(expectedVariants).each((item) => {
        expect(actualVariants[0].includes(item)).to.eq(false)
      })
    })
  }

  verifyVariantExistsWithCpn(cpn) {
    cy.get(selectors.assemblyTable.variantCpn(cpn)).should('exist');
  }
}
