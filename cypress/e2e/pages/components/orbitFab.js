/// <reference types="cypress" />

import selectors from "../../selectors/components/orbitFab";

export class OrbitFab {
  verifyNecessarySpecLabelPresent(label = "") {
    cy.xpath(selectors.orbitFabAssembly.specLabel.replace('labelName', label))
      .should('exist')
  }

  verifyNecessarySpecLabelNotPresent(label = "") {
    cy.xpath(selectors.orbitFabAssembly.specLabel.replace('labelName', label))
      .should('not.exist')
  }

  selectApplicabilityFieldValues(value) {
    cy.get(selectors.orbitFabAssembly.applicablityFields).first()
      .select(value)
  }

  enterFinish(value = "") {
    cy.xpath(selectors.orbitFabAssembly.finish)
      .clear()
      .type(value)
  }

  enterMaterialName(name = "") {
    cy.xpath(selectors.orbitFabAssembly.material)
      .clear()
      .type(name)
  }

  enterFinishInCmpEditPage(value = "") {
    cy.xpath(selectors.orbitFabAssembly.finishInCmpEditPage)
      .clear()
      .type(value)
  }

  enterMaterialInCmpEditPage(value = "") {
    cy.xpath(selectors.orbitFabAssembly.materialInCmpEditPage)
    .clear()
    .type(value)
  }

  verifySpecFieldsInViewCmp(specField, value) {
    cy.xpath(selectors.orbitFabAssembly.specFieldsInViewCmpPage.replace('name', specField))
      .should('have.text', value)
  }
}
