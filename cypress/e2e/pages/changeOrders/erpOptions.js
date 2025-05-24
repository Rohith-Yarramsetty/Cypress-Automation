import selectors from "../../selectors/changeOrders/erpOptions";

export class ErpOptions{
  verifyErpTitlePresent() {
    cy.get(selectors.erpTitle).should('be.visible');
  }

  expandErpOptions() {
    cy.get(selectors.expandArrow).click();
  }

  checkEffectivity() {
    cy.get(selectors.effectivityCheckbox).check().should('be.checked');
  }

  checkItemType() {
    cy.get(selectors.itemTypeCheckbox).check().should('be.checked');
  }

  checkOverrideEffectivity() {
    cy.get(selectors.overrideEffectivity).check().should('be.checked');
  }

  checkOverrideItemType() {
    cy.get(selectors.overrideItemType).check().should('be.checked');
  }

  uncheckEffectivity() {
    cy.get(selectors.effectivityCheckbox).uncheck().should('not.be.checked');
  }

  uncheckItemType() {
    cy.get(selectors.itemTypeCheckbox).uncheck().should('not.be.checked');
  }

  uncheckOverrideEffectivity() {
    cy.get(selectors.overrideEffectivity).uncheck().should('not.be.checked');
  }

  uncheckOverrideItemType() {
    cy.get(selectors.overrideItemType).uncheck().should('not.be.checked');
  }

  enterErpStartDate(startDate) {
    cy.get(selectors.erpStartDate).clear().type(startDate, {delay: 0})
  }

  enterErpEndDate(endDate) {
    cy.get(selectors.erpEnddate).clear().type(endDate, {delay: 0});
  }

  selectErpItemType(itemType) {
    cy.get(selectors.erpItemType).select(itemType);
  }

  verifyErpStartDateTooltip(tooltip = "") {
    cy.get(selectors.erpStartDate).then((attr) => {
      if(attr.hasClass('invalid')) {
        cy.get(attr)
          .should('have.attr', 'data-tip', tooltip)
          .should('have.css', 'background-color')
          .and('contain', 'rgb(245, 74, 79)')
      } else {
        cy.get(attr)
          .should('have.attr', 'data-tip', tooltip)
          .should('have.css', 'background-color')
          .and('not.contain', 'rgb(245, 74, 79)')
      }
    })
  }

  verifyErpEndDateTooltip(tooltip = "") {
    cy.get(selectors.erpEnddate).then((attr) => {
      if(attr.hasClass('invalid')) {
        cy.get(attr)
          .should('have.attr', 'data-tip', tooltip)
          .should('have.css', 'background-color')
          .and('contain', 'rgb(245, 74, 79)')
      } else {
        cy.get(attr)
          .should('have.attr', 'data-tip', tooltip)
          .should('have.css', 'background-color')
          .and('not.contain', 'rgb(245, 74, 79)')
      }
    })
  }

  verifyErpOptionsPresent() {
    cy.get(selectors.effectivityCheckbox).should('exist');
    cy.get(selectors.itemTypeCheckbox).should('exist');
    cy.get(selectors.erpStartDate).should('exist');
    cy.get(selectors.erpEnddate).should('exist');
    cy.get(selectors.erpItemType).should('exist');
    cy.get(selectors.overrideEffectivity).should('exist');
    cy.get(selectors.overrideItemType).should('exist');
  }

  verifyDisabledErpOptions() {
    cy.get(selectors.erpStartDate).should('have.class', 'disabled');
    cy.get(selectors.erpEnddate).should('have.class', 'disabled');
    cy.get(selectors.erpItemType).should('have.class', 'disabled');
    cy.get(selectors.overrideEffectivity).should('have.class', 'disabled');
    cy.get(selectors.overrideItemType).should('have.class', 'disabled');
  }

  verifyEffectivityEnabled() {
    cy.get(selectors.erpStartDate).should('have.class', 'enabled');
    cy.get(selectors.erpEnddate).should('have.class', 'enabled');
    cy.get(selectors.overrideEffectivity).should('have.class', 'enabled');
  }

  verifyItemTypeEnabled() {
    cy.get(selectors.erpItemType).should('have.class', 'enabled');
    cy.get(selectors.overrideItemType).should('have.class', 'enabled');
  }

  verifyItemTypeDisabled() {
    cy.get(selectors.erpItemType).should('not.have.class', 'enabled');
    cy.get(selectors.overrideItemType).should('not.have.class', 'enabled');
  }

  verifyItemTypeDisabilityTooltip() {
    cy.get(selectors.itemTypeCheckbox).trigger('mouseover', {force: true})
    cy.get('body').contains('Contact sales@durolabs.co').should('be.visible');
    cy.get(selectors.erpItemType).trigger('mouseover', {force: true})
    cy.get('body').contains('Contact sales@durolabs.co').should('be.visible');
    cy.get(selectors.overrideItemType).trigger('mouseover', {force: true})
    cy.get('body').contains('Contact sales@durolabs.co').should('be.visible');
  }

  setEffectivity(startDate, endDate) {
    this.checkEffectivity();
    this.enterErpStartDate(startDate);
    this.enterErpEndDate(endDate);
  }

  setErpItemType(type) {
  this.checkItemType();
  this.selectErpItemType(type);
  }

  closeWarningModal() {
    cy.get(selectors.warningModalCloseIcon).click().should('not.exist');
  }

  clickOnContinue() {
    cy.xpath(selectors.continueBtn).click().should('not.exist');
  }

  clickOnCancel() {
    cy.xpath(selectors.cancelBtn).click()
  }

  verifyDefaultEffectivityOverrideWarningModal() {
    cy.get('.modal')
      .should('be.visible')
      .should('include.text', 'Effectivity has been set with no start and end dates. This will reset effectivity to none. If this was done in error, cancel and set new start and end dates.');
    cy.wait(3000);
    this.clickOnCancel();
  }

  verifyDefaultItemTypeOverrideWarningModal() {
    cy.get('.modal')
      .should('be.visible')
      .should('include.text', 'Item type has been set to default. This will reset item type to none. If this was done in error, cancel and set item type from the menu options.');
    cy.wait(3000);
    this.clickOnCancel();
  }

  verifyDefaultErpOptionsOverrideWarningModal() {
    cy.get('.modal')
      .should('be.visible')
      .should('include.text', 'Effectivity and Item Type has been set to Default. This will reset the erp options to none. If this was done in error, cancel and set new effectivity and item type.');
    cy.wait(3000);
    this.clickOnCancel();
  }
}
