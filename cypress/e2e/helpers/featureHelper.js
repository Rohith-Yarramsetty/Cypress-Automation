/// <reference types="cypress" />

import { addDays, format, addYears, addMonths, subMinutes, add } from 'date-fns'
import selectors from "../selectors/products/products"
import { Utils } from './utils'

export class FeatureHelpers {
  uploadFile(selector, fileName) {
    if(selector.startsWith("//")) {
      cy.xpath(selector)
        .attachFile(fileName, {
          force: true
      })
    } else {
      cy.get(selector)
        .attachFile(fileName, {
          force: true
      })
    }
  }

  ByDragAndDrop(selector, fileName) {
    cy.get(selector)
      .attachFile(fileName, {
        force: true,
        action: 'drag-drop'
      })
  }

  addYearsToToday(addBy = 1, formatTo = 'MM/dd/yyyy'){
    const addedYears = addYears(new Date(), addBy);
    const date = format(addedYears, formatTo);
    return date.toString();
  }

  addMonthsToToday(addBy = 1, formatTo = 'MM/dd/yyyy'){
    const addedMonths = addMonths(new Date(), addBy);
    const date = format(addedMonths, formatTo);
    return date.toString();
  }

  addDaysToToday(addBy = 1, formatTo = 'MM/dd/yyyy'){
    const addedDays = addDays(new Date(), addBy);
    const date = format(addedDays, formatTo);
    return date.toString();
  }

  changeDateFormat(date, formatTo = 'MMM d, yyyy') {
    return format(new Date(date), formatTo).toString();
  }

  addDateAndTime(date) {
    const result = add(new Date(), {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    })
  }

  checkCheckbox(selector) {
    if(selector.startsWith("//")) {
      cy.xpath(selector)
        .scrollIntoView()
        .should('not.be.disabled')
        .check()
        .should('be.checked')
    } else {
      cy.get(selector)
        .scrollIntoView()
        .should('not.be.disabled')
        .check()
        .should('be.checked')
    }
  }

  unCheckCheckbox(selector) {
    if(selector.startsWith("//")) {
      cy.xpath(selector)
        .scrollIntoView()
        .should('not.be.disabled')
        .uncheck()
        .should('not.be.checked')
    } else {
      cy.get(selector)
        .scrollIntoView()
        .should('not.be.disabled')
        .uncheck()
        .should('not.be.checked')
    }
  }

  assertElementDisabled(selector) {
    if(selector.startsWith("//")) {
      cy.xpath(selector)
        .scrollIntoView()
        .should('be.disabled')
    }
    else {
      cy.get(selector)
        .scrollIntoView()
        .should('be.disabled')
    }
  }

  assertElementNotDisabled(selector) {
    if(selector.startsWith("//")) {
      cy.xpath(selector)
        .scrollIntoView()
        .should('not.be.disabled')
    }
    else {
      cy.get(selector)
        .scrollIntoView()
        .should('not.be.disabled')
    }
  }

  assertValue(selector, value) {
    if(selector.startsWith("//")) {
      cy.xpath(selector).scrollIntoView().should('have.value', value.toString())
    } else {
      cy.get(selector).scrollIntoView().should('have.value', value.toString())
    }
  }

  assertText(selector, value) {
    if(selector.startsWith("//")) {
      cy.xpath(selector).scrollIntoView().should('have.text', value.toString())
    } else {
      cy.get(selector).scrollIntoView().should('have.text', value.toString())
    }
  }

  waitForLoadingIconToDisappear() {
    cy.get(selectors.loadingSpinner).should('be.visible')
    cy.get(selectors.loadingSpinner).should('not.exist')
  }

  getCpnValueFromTable(name, index = 1) {
    return cy.xpath(selectors.tableCell.replace('name', name).replace('index', index))
      .invoke('text')
  }

  verifyDropdownValues(selector, dropdownValuesArray) {
    cy.xpath(selector).then(options => {
      const actual = [...options].map(o => o.value)
      expect(actual).to.deep.eq(dropdownValuesArray)
    })
  }

  verifyUrl(url) {
    cy.on('url:changed', (actualUrl) => {
      expect(actualUrl).to.eq(url)
    });
  }

  convertArrayValuesToString(array) {
    return array.join('@#').split('@#');
  }

  getExportEmail(date, email, serverId = Cypress.env('serverId')) {
    cy.wait(4000);
    return cy.mailosaurGetMessage(serverId, {
      sentTo: email
    }, {
      timeout: 30000,
      receivedAfter: date,
    })
  }

  getExportEmailThroughSubject(date, email, emailSubject, serverId = Cypress.env('serverId')) {
    cy.wait(4000);
    return cy.mailosaurGetMessage(serverId, {
      sentTo: email,
      subject: emailSubject,
    }, {
      timeout: 30000,
      receivedAfter: date,
    })
  }

  propelAuthUrl() {
    const baseUrl = Cypress.config().baseUrl;
    const envIndex = Utils.getEnvIndex(baseUrl)
    return baseUrl.includes('staging')
      ? 'https://auth.staging-gcp.durolabs.xyz'
      : `https://duroqa${envIndex || ''}.propelauthtest.com`
  }

  getProjectName() {
    const baseUrl = Cypress.config().baseUrl;
    const envIndex = Utils.getEnvIndex(baseUrl)
    return baseUrl.includes('qa') ? `QA${envIndex || ''}` : 'Staging'
  }

  renameTheField(selector, newText) {
    if(selector.startsWith("//")) {
      cy.xpath(selector).invoke('attr', 'value').then((oldText) => {
        cy.xpath(selector).clear().type(oldText + newText);
      })
    } else {
      cy.get(selector).invoke('attr', 'value').then((oldText) => {
        cy.get(selector).clear().type(oldText + newText);
      })
    }
  }

  enterText(selector, text) {
    selector.startsWith("//") ? cy.xpath(selector).click().clear({force:true}).type(text) : cy.get(selector).click().clear({force:true}).type(text);
  }

  verifyWeFoundTheFollwingErrorModalPresent() {
    cy.xpath(selectors.weFoundTheFollowingErrorModal)
      .should('be.visible')
  }

  duplicateProdOrCompInSearchPage() {
    cy.xpath(selectors.duplicateProdOrCompInSearchPage).click();
    this.waitForLoadingIconToDisappear();
  }
}
