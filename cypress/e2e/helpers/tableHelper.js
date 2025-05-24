/// <reference types="cypress" />

import selectors from "../selectors/products/products"

export class TableHelpers {
  checkTableRow(searchRowByText, tableRowSelector = selectors.tableRow, tableIndexesSelector = selectors.tableIndexes) {
    cy.xpath(tableRowSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableIndexesSelector.replace('indexValue', columnIndex))
          .scrollIntoView()
          .trigger('mouseover')
          .check()
          .should('have.attr', 'class', 'checked_input')
          .should('be.checked')
      })
  }

  unCheckTableRow(searchRowByText, tableRowSelector = selectors.tableRow, tableIndexesSelector = selectors.tableIndexes) {
    cy.xpath(tableRowSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableIndexesSelector.replace('indexValue', columnIndex))
          .scrollIntoView()
          .trigger('mouseover')
          .uncheck()
          .should('be.unchecked')
      })
  }

  clickOnCell(columnName, searchRowByText, tableHeaderSelector = selectors.tableHeader, tableCellSelector = selectors.tableCell) {
    cy.get(tableHeaderSelector.replace('cpn', columnName))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
          .scrollIntoView()
          .trigger('mouseover')
          .should('be.visible')
          .click()
      })
  }

  assertTextInCell(columnName, searchRowByText, assertText, tableHeaderSelector = selectors.tableHeader, tableCellSelector = selectors.tableCell) {
    cy.get(tableHeaderSelector.replace('cpn', columnName))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
          .scrollIntoView()
          .trigger('mouseover')
          .should('be.visible')
          .invoke('text')
          .should('be.eq', assertText.toString())
      })
  }

  assertRowNotPresentInTable(columnName, searchRowByText, tableHeaderSelector = selectors.tableHeader, tableCellSelector = selectors.tableCell) {
    if(tableHeaderSelector.startsWith('//')) {
      cy.xpath(tableHeaderSelector.replace('cpn', columnName))
        .scrollIntoView()
        .should('be.visible')
        .invoke('index').then((columnIndex) => {
          cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
            .should('not.exist')
        })
    }
    else{
      cy.get(tableHeaderSelector.replace('cpn', columnName))
        .scrollIntoView()
        .should('be.visible')
        .invoke('index').then((columnIndex) => {
          cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
            .should('not.exist')
        })
    }
  }

  assertCheckBoxUncheckedInTable(searchRowByText, tableRowSelector = selectors.tableRow, tableIndexesSelector = selectors.tableIndexes) {
    cy.xpath(tableRowSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableIndexesSelector.replace('indexValue', columnIndex))
          .scrollIntoView()
          .trigger('mouseover')
          .should('not.have.attr', 'class', 'checked_input')
      })
  }

  assertCheckBoxCheckedInTable(searchRowByText, tableRowSelector = selectors.tableRow, tableIndexesSelector = selectors.tableIndexes) {
    cy.xpath(tableRowSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableIndexesSelector.replace('indexValue', columnIndex))
          .scrollIntoView()
          .trigger('mouseover')
          .should('be.checked')
        });
  }

  assertValueInCell(columnName, searchRowByText, assertValue, tableHeaderSelector = selectors.tableHeader, tableCellSelector = selectors.tableCell) {
    cy.get(tableHeaderSelector.replace('cpn', columnName))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
          .scrollIntoView()
          .trigger('mouseover')
          .should('be.visible')
          .should('have.value', assertValue)
        })
  }

  assertRevisionTextInTable(searchRowByText, assertText, tableCellSelector = selectors.revisionValue) { 
    cy.xpath(tableCellSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('text')
      .should('be.eq', assertText.toString())
  }

  assertRowPresentInTable(columnName, searchRowByText, tableHeaderSelector = selectors.tableHeader, tableCellSelector = selectors.tableCell) {
    if(tableHeaderSelector.startsWith('//')) {
      cy.xpath(tableHeaderSelector.replace('cpn', columnName))
        .scrollIntoView()
        .should('be.visible')
        .invoke('index').then((columnIndex) => {
          cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
            .should('exist')
        })
    }
    else{
      cy.get(tableHeaderSelector.replace('cpn', columnName))
        .scrollIntoView()
        .should('be.visible')
        .invoke('index').then((columnIndex) => {
          cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
            .should('exist')
        })
    }
  }
}
