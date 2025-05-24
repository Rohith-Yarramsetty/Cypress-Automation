import selectors from "../../selectors/components/sourcing";
import constData from "../../helpers/pageConstants";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";

const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();

export class Sourcing {
  navigateToSourcingTab() {
    cy.get(selectors.sourcingTab)
      .scrollIntoView()
      //.should('have.text',"Sourcing")
      .click({force: true});
    cy.wait(1000);
  }

  verifyValueInSourcingTableWhileEditing(columnName, assertValue ) {
    cy.xpath(selectors.tableCellValue.replace('key', columnName).replace('value1', assertValue))
      .scrollIntoView()
      .should('have.value', assertValue);
  }

  verifyElementPresentInTable(columnName, searchRowByText) {
    cy.get(selectors.tableHeader.replace('cpn', columnName))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(selectors.tableCell.replace('name', searchRowByText).replace('index', columnIndex + 1))
          .its('length').should('be.gte', 1)
        });
  }

  checkSelectAll() {
    cy.get(selectors.selectAlloptn)
      .check()
      .should('be.checked')
  }

  clickExpand() {
    cy.xpath(selectors.expandOptn)
      .scrollIntoView()
      .should('not.be.disabled')
      .click();
  }

  selectFirstRow() {
    cy.get(selectors.selectFirstRow)
      .should('not.be.disabled')
      .click()
  }

  clickUpdate() {
    cy.get(selectors.updateOptn)
      .should('not.be.disabled')
      .click()
  }

  waitforUpdateLoadingIconTodisapper() {
    cy.get(selectors.updateLoaderHeading).should('have.text','Please wait a moment...')
    cy.get(selectors.updateLoaderHeading).should('not.exist')
  }

  getHeaderIndex(columnName) {
    return cy.get(selectors.tableHeader.replace('cpn', columnName)).invoke('index')
  }

  verifyAllDataInSourcingTable(mpn) {
    cy.get(selectors.tableRows).its('length').then(($length) => {
      Cypress._.times($length-1, (rowIndex) => {
        this.getHeaderIndex(constData.sourcingTableHeaders.mpn).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).invoke('text')
            .should('be.eq', mpn)
        })

        this.getHeaderIndex(constData.sourcingTableHeaders.manufacturer).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).invoke('text')
            .should('be.eq', "Murata")
        })

        this.getHeaderIndex(constData.sourcingTableHeaders.dpn).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).find('a')
            .should('have.attr', 'href').and('contain', 'https://octopart.com/')
        })

        this.getHeaderIndex(constData.sourcingTableHeaders.distributor).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).invoke('text').then($text => {
            expect($text).to.be.oneOf(['Digi-Key', 'Avnet', 'Verical', 'CoreStaff', 'Chip One Stop Japan', 'Future Electronics', 'Arrow Electronics', 'Mouser', 'TTI'])
          })
        })

        this.getHeaderIndex(constData.sourcingTableHeaders.packageQuantity).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).invoke('text')
           .then(parseFloat).should('be.gte', 0)
        })

        this.getHeaderIndex(constData.sourcingTableHeaders.minQty).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).invoke('text')
           .then(parseFloat).should('be.gte', 0)
        })

        this.getHeaderIndex(constData.sourcingTableHeaders.unitPrice).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).invoke('text')
            .should('contain', '$')
        })

        this.getHeaderIndex(constData.sourcingTableHeaders.quoteLeadTime).then((columnIndex) => {
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).find('.lead-time span').first().invoke('text')
            .then(parseFloat).should('be.gte', 0)
          cy.get(selectors.tableCell.replace('rowIndex', rowIndex+2).replace('headerIndex', columnIndex + 1)).find('.lead-time span').last().invoke('text')
             .should('be.eq', 'DAYS')
        })
      })
    })
  }

  verifyUnitPriceGreenCheckMarkIconInFirstRow() {
    cy.get(selectors.unitPriceGreenIcon).first() 
      .should('not.be.disabled').should('have.attr', 'stroke', '#3CD1B5')
  }

  verifyLeadTimeGreenCheckMarkIconInFirstRow() {
    cy.get(selectors.leadTimeGreenIcon).first() 
      .should('not.be.disabled').should('have.attr', 'stroke', '#3CD1B5')
  }
  
  checkAllQuoteCheckBoxes() {
    cy.get(selectors.selectAllQuotes)
     .check({force: true})
     .should('be.checked')
  }

  verifyMpnDpnRowChecked() {
    cy.get(selectors.selectAllDistributors).should('be.checked')
    cy.get(selectors.selectAlloptn).should('be.checked')
  }  

  unCheckAllQuotesCheckBoxes() {
    cy.get(selectors.selectAllQuotes)
      .as('checkboxes')
      .uncheck({force: true})
      .should('not.be.checked')
  }

  verifyMpnDpnRowUnChecked() {
    cy.get(selectors.selectAllDistributors)
      .should('not.be.checked')
    cy.get(selectors.selectAlloptn)
      .should('not.be.checked')
  }

  verifyMiddleMfrAndDistributorCheckBxs() {
    cy.get(selectors.middleMfrCheckBx)
      .should('exist')
    cy.get(selectors.middleDistributorCheckBx)
      .should('exist')  
  }  

  checkQuoteCheckboxInDistributors(distributorIndex = 1, quoteIndex = 1) {
    cy.get(selectors.quoteCheckboxInDistributor.replace("quote-1", `quote-${quoteIndex}`).replace("dist-1", `dist-${distributorIndex}`))
      .check()
      .should('be.checked')
  }

  verifyUpdateOptionNotActive() {
    cy.get(selectors.updateOptn)
      .should('have.class', 'disable-pointer-event')
      .should('not.have.class', 'active')
  }

  verifyUpdateOptionActive() {
    cy.get(selectors.updateOptn)
      .should('not.be.disabled')
      .should('have.class', 'active')
      .should('not.have.class', 'disable-pointer-event')
  }

  uncheckQuoteCheckboxInDistributors(distributorIndex = 1, quoteIndex = 1) {
    cy.get(selectors.quoteCheckboxInDistributor.replace("quote-1", `quote-${quoteIndex}`).replace("dist-1", `dist-${distributorIndex}`))
      .uncheck()
      .should('not.be.checked')
  }

  clickOnSetPrimary() {
    cy.xpath(selectors.setPrimaryOptn)
      .click()
  }

  clickOnPrimarySourceQuoteCheckboxInDistributors(distributorIndex = 1, quoteIndex = 1) {
    cy.get(selectors.primarySourceQuoteCheckbox.replace("quote-1", `quote-${quoteIndex}`).replace("dist-1", `dist-${distributorIndex}`))
      .click()
  }

  getUnitPriceValue() {
    return cy.get(selectors.unitPriceField).first()
     .invoke('val')
  }

  getLeadTimeValue() {
    return cy.get(selectors.leadTimeField).first()
     .invoke('val')
  }

  verifyUnitPriceRedUpArrowIconInFirstRow() {
    cy.get(selectors.unitPriceRedUpIcon).first().as('unitPriceSelector')
    cy.get('@unitPriceSelector').should('have.attr', 'stroke', '#F54A4F');
  }

  verifyLeadTimeRedUpArrowIconInFirstRow() {
    cy.get(selectors.leadTimeRedUpIcon).first()
      .should('not.be.disabled').should('have.attr', 'stroke', '#F54A4F');
  }

  verifyUnitPriceGreenDownArrowIconInFirstRow() {
    cy.get(selectors.unitPriceGreenDownIcon).first()
      .should('not.be.disabled').should('have.attr', 'stroke', '#60BC59');
  }

  verifyLeadTimeGreenDownArrowIconInFirstRow() {
    cy.get(selectors.leadTimeGreenDownIcon).first()
      .should('not.be.disabled').should('have.attr', 'stroke', '#60BC59');
  }

  setLeadTimeInFirstRow(value) {
    cy.get(selectors.leadTimeField).first()
      .clear()
      .type(value);
    cy.wait(1000); // waiting to round figure the value
    cy.xpath(selectors.expandOptn).click();
  }

  setUnitPriceInFirstRow(value) {
    cy.get(selectors.unitPriceField).first()
      .clear()
      .type(value);
    cy.wait(1000); // waiting to round figure the value
    cy.xpath(selectors.expandOptn).click();
  }

  verifyLeadTimeFirstRowValueInEditSourcing(newValue) {
    cy.get(selectors.leadTimeField).first()
      .invoke('val')
      .then((value) => {
          expect(value).to.include(newValue);
    })
  }

  verifyUnitPriceFirstRowValueInEditSourcing(newValue) {
    cy.get(selectors.unitPriceField).first()
      .invoke('val')
      .then((value) => {
          expect(value).to.include(newValue.toFixed(4));
    })
  }

  verifyUnitPriceGreenIcon(distributorIndex = 1, quoteIndex = 1) {
    cy.get(selectors.unitPriceGreenCheckMark.replace("quote-1", `quote-${quoteIndex}`).replace("dist-1", `dist-${distributorIndex}`))
      .should('exist')
      .should('have.attr','stroke', '#3CD1B5');
  } 

  verifyLeadTimeGreenIcon(distributorIndex = 1, quoteIndex = 1) {
    cy.get(selectors.leadTimeGreenCheckMark.replace("quote-1", `quote-${quoteIndex}`).replace("dist-1", `dist-${distributorIndex}`))
      .should('exist')
      .should('have.attr','stroke', '#3CD1B5');
  }

  unitPriceIconNotPresent(distributorIndex, quoteIndex) {
    cy.get(selectors.unitPriceIcon.replace("quote-1", `quote-${quoteIndex}`).replace("dist-1", `dist-${distributorIndex}`))
      .should('not.exist');
  }
    
  leadTimeIconNotPresent(distributorIndex, quoteIndex) {
    cy.get(selectors.leadTimeIcon.replace("quote-1", `quote-${quoteIndex}`).replace("dist-1", `dist-${distributorIndex}`))
      .should('not.exist');
  }
    
  verifyLeadTimeAndUnitPriceIconsNotPresentInRow(distributorIndex, quoteIndex) {
    this.unitPriceIconNotPresent(distributorIndex, quoteIndex);
    this.leadTimeIconNotPresent(distributorIndex, quoteIndex);
  }

  unCheckAllCheckBxs(){
    cy.get(selectors.viewSourcing.commonCheckBx)
      .uncheck()
      .should('not.be.checked');
  }

  verifyLeadTimeAndUnitPriceIconInViewSourcing(rowIndex, columnName, selector) {
    cy.get(selectors.viewSourcing.tableHeader.replace('distName', columnName))
      .scrollIntoView()
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.get(selector.replace('rowIndex', rowIndex + 1).replace('headerIndex', columnIndex + 1))
          .should('exist')
      });
  }

  verifyGreenCheckMarkInViewSourcing(rowIndex, columnName) {
    this.verifyLeadTimeAndUnitPriceIconInViewSourcing(rowIndex, columnName, selectors.viewSourcing.greenCheckMark);
  }

  verifyGreenDownArrowInViewSourcing(rowIndex, columnName) {
    this.verifyLeadTimeAndUnitPriceIconInViewSourcing(rowIndex, columnName, selectors.viewSourcing.greenDownArrow);
  }

  verifyRedUpArrowInViewSourcing(rowIndex, columnName) {
    this.verifyLeadTimeAndUnitPriceIconInViewSourcing(rowIndex, columnName, selectors.viewSourcing.redUpArrow);
  }

  sortByDistributor() {
    cy.get(selectors.viewSourcing.tableHeader).then(($body) => {
        if ($body.hasClass('descending')) {
          cy.get($body).click();
        }
    });
  }

  verifyLeadTimeOrUnitPriceValuesInViewSourcing(originalValue, rowIndex, columnName) {
    cy.get(selectors.viewSourcing.tableHeader.replace('distName', columnName))
      .scrollIntoView()
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.get(selectors.viewSourcing.tableCellValue.replace('rowIndex', rowIndex + 1).replace('headerIndex', columnIndex + 1)).first()
          .invoke('text')
          .then((currentValue) => {
              expect(currentValue).to.include(originalValue);
          });
        })
  }

  deselectPrimaryComponent() {
    cy.get(selectors.viewSourcing.primarySourceCheckbox)
      .click();
    featureHelpers.waitForLoadingIconToDisappear();  
  }

  checkRowSourcingViewTableCheckBox(rowIndex) {
    cy.xpath(selectors.viewSourcing.checkBox.replace('rowIndex', rowIndex))
      .check({force: true})
      .should('be.checked');
  }

  verifyCheckMarkOrArrowNotPresentInViewSourcing(rowIndex, columnName) {
    cy.get(selectors.viewSourcing.tableHeader.replace('distName', columnName))
      .scrollIntoView()
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.get(selectors.viewSourcing.checkMarkAndArrowIcon.replace('rowIndex', rowIndex + 1).replace('headerIndex', columnIndex + 1))
          .should('not.exist')
      })
  }

  verifySourcingTabNotPresent() {
    cy.get(selectors.sourcingTab)
      .should('not.exist')
  }

  uncheckRolledUpCostCheckBox(index = 1) {
    cy.xpath(selectors.viewSourcing.rolledUpCostCheckbox(index))
      .click()
  }

  checkRolledUpCostCheckBox(index = 1) {
    cy.xpath(selectors.viewSourcing.rolledUpCostCheckbox(index))
      .find('input')
      .check()
  }

  clickOnAddNewManufacturer() {
    cy.get(selectors.editSourcing.addManufacturer)
      .scrollIntoView()
      .click({force: true})
  }

  clickManufacturerRemoveIcon(name = "") {
    cy.xpath(selectors.editSourcing.removeIcon(name)).first()
      .click()
  }

  clickDistributorRemoveIcon(name = "") {
    cy.xpath(selectors.editSourcing.removeIcon(name)).last()
      .click()
  }

  clickQuoteRemoveIcon(man, dist, quote) {
    cy.get(selectors.editSourcing.quoteRemoveIcon(man, dist, quote))
      .click()
  }

  enterManufacturerData(manufacturerIndex, data) {
    this.enterMpn(manufacturerIndex, data.mpn);
    this.enterManufacturerName(manufacturerIndex, data.manufacturer);
    this.enterManufacturerDes(manufacturerIndex, data.description);
    if(data.warranty)
      this.enterManufacturerWarranty(manufacturerIndex, data.warranty);
  }

  enterDistributorData(manufacturerIndex, distributorIndex, data) {
    this.enterDpn(manufacturerIndex, distributorIndex, data.dpn);
    this.enterDistributorName(manufacturerIndex, distributorIndex, data.distributor);
    this.enterDistributorDes(manufacturerIndex, distributorIndex, data.description);
  }

  enterQuoteData(manufacturerIndex, distributorIndex, quoteIndex, data) {
    this.enterMinimumQuantity(manufacturerIndex, distributorIndex, quoteIndex, data.minQuantity);
    this.enterUnitPrice(manufacturerIndex, distributorIndex, quoteIndex, data.unitPrice);
    this.enterLeadTime(manufacturerIndex, distributorIndex, quoteIndex, data.leadTime);

    if(data.leadTimeUnit) this.checkQuoteLeadTimeUnit(manufacturerIndex, distributorIndex, quoteIndex, data.leadTimeUnit);
  }

  enterMpn(man = 1, MPN) {
    cy.get(selectors.editSourcing.manufacturerData.MPN(man))
      .clear().type(MPN)
    cy.wait(1000);
  }

  enterManufacturerName(man = 1, name) {
    cy.get(selectors.editSourcing.manufacturerData.manufacturerName(man))
      .clear().type(name)
    cy.wait(1500);
  }

  enterManufacturerDes(man= 1, des) {
    cy.get(selectors.editSourcing.manufacturerData.manufacturerDes(man))
      .clear().type(des)
    cy.wait(1500);
  }

  enterManufacturerWarranty(man= 1, warranty) {
    cy.get(selectors.editSourcing.manufacturerData.manufacturerWarranty(man))
      .clear().type(warranty)
    cy.wait(1500);
  }

  enterDpn(man = 1, dist = 1, DPN) {
    cy.get(selectors.editSourcing.distributorData.DPN(man, dist))
      .clear().type(DPN)
    cy.wait(1500);
  }

  enterDistributorName(man = 1, dist = 1, name) {
    cy.get(selectors.editSourcing.distributorData.distributorName(man, dist))
      .clear().type(name)
    cy.wait(1500);
  }

  enterDistributorDes(man = 1, dist = 1, des) {
    cy.get(selectors.editSourcing.distributorData.distributorDes(man, dist))
      .clear().type(des)
    cy.wait(1500);
  }

  enterMinimumQuantity(man = 1, dist = 1, quote = 1, quantity) {
    cy.get(selectors.editSourcing.quoteData.minQuantity(man, dist, quote))
      .clear().type(quantity)
    cy.wait(1500);
  }

  enterUnitPrice(man = 1, dist = 1, quote = 1, unitPrice) {
    cy.get(selectors.editSourcing.quoteData.unitPrice(man, dist, quote))
      .clear().type(unitPrice, {delay: 0})
    cy.wait(1500);
  }

  enterLeadTime(man = 1, dist = 1, quote = 1, leadTime) {
    cy.get(selectors.editSourcing.quoteData.leadTime(man, dist, quote))
      .clear().type(leadTime)
    cy.wait(1500);
  }

  checkQuoteLeadTimeUnit(man = 1, dist = 1, quote = 1, unit) {
    cy.get(selectors.editSourcing.quoteData.leadTimeUnit(man, dist, quote, unit)).check();
    cy.wait(1500);
  }

  verifyDpnErrorToolTip(man = 1, dist = 1, text) {
    cy.get(selectors.editSourcing.distributorData.DPN(man, dist)).trigger('mouseover')
    cy.xpath(selectors.editSourcing.ErrorToolTip(text))
      .should('exist')
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
  }

  verifyUnitPrice(man = 1, dist = 1, quote = 1, unitPrice) {
    cy.get(selectors.editSourcing.quoteData.unitPrice(man, dist, quote))
      .should('have.value', unitPrice)
    cy.wait(1500);
  }

  verifyLeadTime(man = 1, dist = 1, quote = 1, leadTime) {
    cy.get(selectors.editSourcing.quoteData.leadTime(man, dist, quote))
      .should('have.value', leadTime)
  }

  verifyRolledUpCostIsAssignedAsPrimary() {
  let selector = `${selectors.editSourcing.rolledUpCostTable} tr:nth-child(2)`
    cy.get(selector).should('be.visible').should('have.class', 'success')
  }

  verifyRolledUpCostIsNotAssignedAsPrimary() {
    let selector = `${selectors.editSourcing.rolledUpCostTable} tr:nth-child(2)`
      cy.get(selector)
        .should('be.visible')
        .and('not.have.class', 'success')
  }

  verifyCustomQuoteSetAsPrimary(row) {
    cy.get(selectors.editSourcing.customQuote(row))
      .should('be.visible')
      .and('have.class', 'center-state checkbox active')
  }

  verifyErrorCountInSourcingTab(errorCount) {
    cy.get(selectors.editSourcing.errorCount).should('have.text', errorCount)
  }

  verifySourcingTabErrorNotExists() {
    cy.get(selectors.editSourcing.errorCount).should('not.exist')
  }
}
