/// <reference types="cypress" />

import selectors from "../../selectors/components/cana";

export class Cana {
  verifyUnitInViewComponent(label = "") {
    cy.xpath(selectors.unitInViewComponent.replace('unitName', label))
      .should('exist')
  }

  selectUnitInEditComponent(value = "mg/L") {
    cy.xpath(selectors.unitInEditComponent.replace('unitName', value))
      .select(value)
      .should('have.value', value)
  }
}