import selectors from "../../selectors/components/importFromFile";
import constData from "../../helpers/pageConstants";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Navigation } from "../navigation";

const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const nav = new Navigation();

export class ImportFromFile {

  clickOnImportFromFile() {
    cy.xpath(selectors.importFromFile)
      .should('not.be.disabled')
      .click();
  }

  uploadFile(fileName) {
    featureHelpers.uploadFile(selectors.fileUpload, fileName)
    this.waitForFileUpload();
  }

  waitForFileUpload() {
    cy.get(selectors.fileUploadProgress).should('not.exist');
  }

  clickOnContinue() {
    cy.xpath(selectors.continueBtn)
      .should('be.visible')
      .click();
  }

  verifyNecessaryLabelsMapped(ourLabel, duroLabel) {
    cy.xpath(selectors.labelName.replace('ourLabel', ourLabel).replace('duroLabel', duroLabel))
      .contains(ourLabel, {matchCase:false})
      .should('be.selected');
  }

  verifyNoErrorsAfterValidation() {
    cy.get(selectors.errorTag)
      .should('have.text', 'No errors found.');
  }

  verifyImportStatusSucceed(noOfComponents, time = Cypress.config('defaultCommandTimeout')) {
    let successQuote;
    cy.get(selectors.importProgressModal).should('not.exist', {timeout: time})
    noOfComponents>1 ? successQuote = `Success. You’ve imported ${noOfComponents} components.`
                     : successQuote = `Success. You’ve imported ${noOfComponents} component.`

    cy.get(selectors.importStatusTag)
      .should('exist')
      .should('contain.text', successQuote);
  }

  verifyRevisionAndStatusValue(componentName, revisionValue, status) {
    tableHelper.assertTextInCell(constData.componentTableHeaders.revision, componentName, revisionValue)
    tableHelper.assertTextInCell(constData.componentTableHeaders.status, componentName, status);
  }

  verifyAndEnableNecessaryFieldToggleBtn(colName = 'Desc / Value') {
    if(cy.xpath(selectors.mappingFieldToggleBtn.replace('Desc / Value', colName)).should('have.attr', 'class', 'ui-toggle-btn')){
      cy.xpath(selectors.mappingFieldToggleBtn.replace('Desc / Value', colName)).click()
    }
  }

  mapNecessaryField(colName = 'Desc / Value', mappingvalue = "name") {
    cy.xpath(selectors.mappingFieldsDropdown.replace('Desc / Value', colName))
      .select(mappingvalue)
      .should('have.value', mappingvalue);
  }

  verifyDescOrValueLabelMapped() {
    cy.xpath(selectors.nameInDescOrValue)
      .should('have.text', 'Name')
      .should('be.selected');
  }

  waitForErrorCheckingSpinnerToDisappear() {
    cy.xpath(selectors.checkingForErrorsSpinnerIcon)
      .should('have.text', 'Checking for errors...')
      .should('be.visible')
    cy.xpath(selectors.checkingForErrorsSpinnerIcon).should('not.exist')
  }

  verifyGreenIconInMpnField() {
    cy.get(selectors.GreenIconInMpnField)
      .should('be.visible');
  }

  verifySuccessMessage() {
    cy.get(selectors.successMessage)
      .should('exist');
  }

  verifyImagePresent() {
    cy.get(selectors.defaultImage).should('not.exist');
    cy.get(selectors.imageBlock)
      .children()
      .should('have.class', 'image selected');
  }

  verifyDocumentsPresent() {
    cy.get(selectors.tableIndex)
      .find("tr")
      .then((row) => {
        expect((row.length)-1).to.be.at.least(1)
      });
  }

  clickOnCell(componentName) {
    cy.xpath(selectors.tableCell.replace('name', componentName))
      .should('be.visible')
      .click();
  }

  checkUpdateFromExistingLibrary() {
    cy.get(selectors.updateFromExistingLibrary)
      .check();
  }

  verifyRevisionValue(componentName, revisionValue) {
    tableHelper.assertTextInCell(constData.componentTableHeaders.revision, componentName, revisionValue)
  }

  verifyTotalComponentsCount(noOfComponents) {
    if(noOfComponents<=150) {
      cy.get(selectors.componentsTable)
        .its('length')
        .should('eq', noOfComponents+1)          //+1 represents tableHeader
    }
    else{
      cy.get(selectors.totalComponentsCount)
        .should('have.text', `${noOfComponents} results`)
    }
  }

  verifyImportComponentErrorTooltip(cmpData, tooltip) {
    cy.get(selectors.importErrorTooltip.replace('cmpData', cmpData))
      .should('have.attr', 'data-tip', tooltip)
  }

  verifyImportFromFileModalHeading() {
    cy.get(selectors.importFromFileModalHeading)
      .should('have.text', 'Import Components from a file')
  }

  verifyTotalComponentsCount(noOfComponents) {
    if(noOfComponents<=150) {
      cy.get(selectors.componentsTable)
        .its('length')
        .should('eq', noOfComponents+1)          //+1 represents tableHeader
    }
    else{
      cy.get(selectors.totalComponentsCount)
        .should('have.text', `${noOfComponents} results`)
    }
  }

  verifyPageLoadingTime() {
    cy.get(selectors.loadingSpinner,{timeout: 120000}).should('be.visible').then(() => {
      const t0 = new Date();
    cy.get(selectors.loadingSpinner).should('not.exist')
      const t1 = new Date();
      const pageLoadTime = (t1 - t0);
      cy.log(`Page load took ${pageLoadTime} seconds.`)
    })
  }

  importComponentsFromFile(fileName, uploadType = 'New') {
    nav.openComponentsTab();
    this.clickOnImportFromFile();
    if(uploadType == 'Existing') {
      this.checkUpdateFromExistingLibrary();
    }
    this.uploadFile(fileName);
    this.clickOnContinue();
    this.verifyNoErrorsAfterValidation();
    this.clickOnContinue();
    this.verifyImportProgressModalNotExists();
  }

  errorCountInReviewPage(count) {
    cy.get(selectors.errorCountInReviewPage)
      .should('contain.text', `We found ${count} errors. Fix or remove them to proceed.`);
  }

  hoverOnErroredColumn(columnIndex, rowIndex) {
    cy.get(selectors.erroredColumn(columnIndex, rowIndex)).trigger('mouseover');
  }

  verifyWarningTipPresent(assertText) {
    cy.get(selectors.warningInReviewPage).invoke('text')
      .should('contain', assertText.toString());
  }

  verifyErrorTipPresent(assertText) {
    cy.get(selectors.errorInReviewPage).invoke('text')
      .should('contain', assertText.toString());
  }

  verifyUseExistingButtonNotPresent() {
    cy.get(selectors.useExistingButton).should('not.exist');
  }

  clickOnUseExistingButton() {
    cy.get(selectors.useExistingButton).should('be.visible').click();
  }

  verifyUnmappedLablesCount(noOflabels) {
    cy.get(selectors.unmappedLabels).should('have.length', noOflabels)
  }

  checkExistingComponentsForAssemblyImport() {
    cy.get(selectors.existingCmpRadioBtnForAssemblyImport)
      .check();
  }

  disableOrEnableAllRowsToggleBtnInReviewPage() {
    cy.xpath(selectors.reviewPage.allRowsToggleBtn)
      .click()
  }

  enableOrDisableToggleBtnInReviewPage(rowIndex) {
    cy.xpath(selectors.reviewPage.enableOrDisableRowToggleBtn(rowIndex))
      .click()
  }

  verifyErrorTooltipforCellInReviewPage(rowIndex, columnName, errorMsg) {
    cy.xpath(selectors.reviewPage.cell(rowIndex, columnName))
      .should('have.attr','data-tip', errorMsg)
  }

  verifyErrorIconforCellInReviewPage(rowIndex, columnName, errorMsg) {
    let selector = selectors.reviewPage.errorIcon(rowIndex, columnName)
      if(columnName == "mpn") cy.xpath(selector.replace('input', 'icon')).invoke('attr','custom-data-tip').should('contain', errorMsg)
      else cy.xpath(selector).invoke('attr','data-tip').should('contain', errorMsg)
  }

  enterDataInCellInReviewPage(rowIndex, columnName, data) {
    cy.xpath(selectors.reviewPage.cell(rowIndex, columnName))
      .clear()
      .type(data)
  }

  verifyContinueBtnDisabledInReviewPage() {
    cy.xpath(selectors.continueBtn)
      .should('have.class', 'disabled btn-header')
  }

  verifyContinueBtnEnabledInReviewPage() {
    cy.xpath(selectors.continueBtn)
      .should('have.class', 'active btn-header')
  }

  disableImportDataUsingMpnToggleBtn() {
    if(cy.get(selectors.importDataUsingMpnToggleBtn).should('have.attr', 'class', 'ui-toggle-btn selected')){
      cy.get(selectors.importDataUsingMpnToggleBtn).click()
    }
  }

  verifyErrorMsg(row, col, text) {
    cy.xpath(selectors.reviewPage.errorIcon(row, col)).trigger('mouseover')
    cy.get(selectors.errorInReviewPage).should('have.text', text)
  }

  verifyRequireFieldErrorMsgInMapFieldsPage(errorMsg) {
    cy.get(selectors.requireFieldErrorInMapFieldsPage)
      .should('have.text', errorMsg)
  }

  verifyErrorMsgInImportCmpFromFilePage(errorMsg) {
    cy.get(selectors.errorMsgInImportCmpFromFilePage)
      .should('have.text', errorMsg)
  }

  verifyImportProgressModalNotExists(
    time = Cypress.config('defaultCommandTimeout')) {
    cy.get(selectors.importProgressModal).should('not.exist', {timeout: time});
    }
}
