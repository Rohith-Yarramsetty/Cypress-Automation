/// <reference types="cypress" />

import { FeatureHelpers } from "../../helpers/featureHelper";
import selectors from "../../selectors/products/products";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { ChangeOrders } from "../changeOrders/changeOrder";
import { Navigation } from "../navigation";

const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const changeOrders = new ChangeOrders();
const faker = require('faker');
const nav = new Navigation();

export class Products {

  clickNewButton() {
    cy.get(selectors.newBtn).should('be.visible').click()
  }

  checkCategoryItem(categoryName) {
    cy.get(selectors.newProduct.categoryItem.replace('Electrical', categoryName))
      .check()
  }

  enterProductName(productName) {
    cy.get(selectors.newProduct.productName)
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Enter product name')
      .clear()
      .type(productName).should('have.value', productName);
  }

  selectLifeCycleStatus(value = "PROTOTYPE") {
    cy.get(selectors.newProduct.lifeCycleStatus)
      .select(value)
      .should('have.value', value)
  }

  enterEid(eid) {
    cy.get(selectors.newProduct.eid)
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', 'External ID')
      .clear()
      .type(eid).should('have.value', eid);
  }

  enterProductDescription(prodDesc) {
    cy.get(selectors.newProduct.productDescription)
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Enter product description')
      .clear()
      .type(prodDesc, {delay:0}).should('have.value', prodDesc);
  }

  enterProductTeamEmail(title = 'QA', email) {
    cy.xpath(selectors.newProduct.productTeamEmail.replace('QA', title))
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Enter Email')
      .clear()
      .type(email).should('have.value', email)
  }

  enterProductManagerTeamEmail(email) {
    this.enterProductTeamEmail(constData.productTeamTitle.productManager, email)
  }

  enterEngineeringTeamEmail(email) {
    this.enterProductTeamEmail(constData.productTeamTitle.engineering, email)
  }

  enterQaTeamEmail(email) {
    this.enterProductTeamEmail(constData.productTeamTitle.qa, email)
  }

  enterProcurementTeamEmail(email) {
    this.enterProductTeamEmail(constData.productTeamTitle.procurement, email)
  }

  enterManufacturingTeamEmail(email) {
    this.enterProductTeamEmail(constData.productTeamTitle.manufacturing, email)
  }

  enterScheduleForeCastTargetDate(production, date) {
    cy.xpath(selectors.newProduct.preProductionTragetDate.replace('Pre-Production', production))
      .should('be.visible')
      .type(date).should('have.value', date)
  }

  enterPreProductionTargetDate(date) {
    this.enterScheduleForeCastTargetDate(constData.productionSchedule.preProduction, date)
  }

  enterMassProductionLaunchTargetDate(date) {
    this.enterScheduleForeCastTargetDate(constData.productionSchedule.massProductionLaunch, date)
  }

  enterScheduleForeCastVolume(production, date) {
    cy.xpath(selectors.newProduct.preProductionVolume.replace('Pre-Production', production))
      .should('be.visible')
      .should('have.attr', 'placeholder', 'Volume')
      .type(date).should('have.value', date);
  }

  enterPreProductionVolume(value) {
    this.enterScheduleForeCastVolume(constData.productionSchedule.preProduction, value)
  }

  enterMassProductionLaunchVolume(value) {
    this.enterScheduleForeCastVolume(constData.productionSchedule.massProductionLaunch, value)
  }

  clickAddNewForecastInNewProductCreationModal() {
    cy.get(selectors.newProduct.addNewForecast)
      .should('not.be.disabled')
      .click()
  }

  uploadThumbnail(fileName) {
    featureHelpers.uploadFile(selectors.newProduct.uploadThumbnails, fileName)
    this.waitForFileUpload()
  }

  uploadDocuments(fileName) {
    featureHelpers.uploadFile(selectors.newProduct.uploadDocuments, fileName)
    this.waitForFileUpload()
  }

  waitForFileUpload() {
    cy.get(selectors.newProduct.fileUploadProgress, {timeout: 80000}).should('not.exist')
    //   .should('have.text', 'Waiting to upload...')
    //  .should('have.text', 'Finalizing...')
  }

  clickCreateButton() {
    cy.get(selectors.newProduct.createBtn)
      .scrollIntoView()
      .should('be.visible')
      .should('have.attr', 'value', 'create')
      .click()
  }

  createNewProduct(data) {
    this.clickNewButton();
    this.checkCategoryItem("Electrical")
    this.enterProductName(data.prodName)
    this.selectLifeCycleStatus(constData.status.design)
    this.enterEid(data.eid)
    this.enterProductDescription(data.prodDesc)
    this.enterProductManagerTeamEmail(data.prodManagEmail)
    this.enterEngineeringTeamEmail(data.engEmail)
    this.enterQaTeamEmail(data.qaEmail)
    this.enterProcurementTeamEmail(data.procurementEmail)
    this.enterManufacturingTeamEmail( data.manufacturEmail)
    this.enterPreProductionTargetDate(data.preProductionLaunch)
    this.enterPreProductionVolume(data.preProductionValue)
    this.enterMassProductionLaunchTargetDate(data.massProductionLaunch)
    this.enterMassProductionLaunchVolume(data.massProductionValue)
    this.uploadThumbnail('drone.jpg');
    this.uploadDocuments('sample_document.doc');
    this.clickCreateButton()
  }

  verifyDataInEditMode(data) {
    cy.get(selectors.editProd.productName).should('have.value', data.prodName)
    cy.get(selectors.editProd.eid).should('have.value', data.eid)
    cy.get(selectors.editProd.productDescription)
      .should('have.text', data.prodDesc)
    cy.xpath(selectors.editProd.teamField.replace("Engineering", constData.productTeamTitle.productManager))
      .scrollIntoView().should('have.value', data.prodManagEmail)
    cy.xpath(selectors.editProd.teamField.replace("Engineering", constData.productTeamTitle.engineering))
      .scrollIntoView().should('have.value', data.engEmail)
    cy.xpath(selectors.editProd.teamField.replace("Engineering", constData.productTeamTitle.qualityAssurance))
      .scrollIntoView().should('have.value', data.qaEmail)
    cy.xpath(selectors.editProd.teamField.replace("Engineering", constData.productTeamTitle.procurement))
      .scrollIntoView().should('have.value', data.procurementEmail)
    cy.xpath(selectors.editProd.teamField.replace("Engineering", constData.productTeamTitle.manufacturing))
      .scrollIntoView().should('have.value', data.manufacturEmail)
    cy.xpath(selectors.editProd.preProductionTragetDate)
      .scrollIntoView().should('have.value', featureHelpers.changeDateFormat(data.preProductionLaunch))
    cy.xpath(selectors.editProd.preProductionVolume)
      .scrollIntoView().should('have.value', data.preProductionValue.toString())
    cy.xpath(selectors.editProd.massProductionTragetDate)
      .scrollIntoView().should('have.value', featureHelpers.changeDateFormat(data.massProductionLaunch))
    cy.xpath(selectors.editProd.massProductionVolume)
      .scrollIntoView().should('have.value', data.massProductionValue.toString())
  }

  verifyDataOnProductCreation(data) {
    cy.get(selectors.viewProduct.prodName).should('have.text', data.prodName)
    cy.get(selectors.viewProduct.eidValue).should('have.text', data.eid)
    cy.get(selectors.viewProduct.prodDesc)
      .should('have.text', data.prodDesc)
    cy.xpath(selectors.viewProduct.productManagerTeamEmail)
      .scrollIntoView().should('have.text', data.prodManagEmail)
    cy.xpath(selectors.viewProduct.engineeringTeamEmail)
      .scrollIntoView().should('have.text', data.engEmail)
    cy.xpath(selectors.viewProduct.qaTeamEmail)
      .scrollIntoView().should('have.text', data.qaEmail)
    cy.xpath(selectors.viewProduct.procurementTeamEmail)
      .scrollIntoView().should('have.text', data.procurementEmail)
    cy.xpath(selectors.viewProduct.manufacturingTeamEmail)
      .scrollIntoView().should('have.text', data.manufacturEmail)
    cy.get(selectors.viewProduct.preProductionDate)
      .scrollIntoView().should('have.text', featureHelpers.changeDateFormat(data.preProductionLaunch, 'MMM dd, yyyy'))
    cy.get(selectors.viewProduct.preProductionVolume)
      .scrollIntoView().should('have.text', data.preProductionValue.toString())
    cy.get(selectors.viewProduct.massProductionDate)
      .scrollIntoView().should('have.text', featureHelpers.changeDateFormat(data.massProductionLaunch, 'MMM dd, yyyy'))
    cy.get(selectors.viewProduct.massProductionVolume)
      .scrollIntoView().should('have.text', data.massProductionValue.toString())
  }

  clickSaveButtonInEditProduct({ timeout } = { timeout: Cypress.config('defaultCommandTimeout') }) {
    cy.get(selectors.editProd.saveBtn, { timeout })
      .scrollIntoView({ timeout })
      .wait(2500)
      .should('not.have', 'class', 'disabled')
      .should('be.visible')
      .click({ timeout })
  }

  assertProductTableData(data) {
    tableHelper.assertTextInCell(constData.productTableHeaders.name, data.prodName, data.prodName)
    tableHelper.assertTextInCell(constData.productTableHeaders.description, data.prodName, data.prodDesc)
    tableHelper.assertTextInCell(constData.productTableHeaders.eid, data.prodName, data.eid.toString())
    tableHelper.assertTextInCell(constData.productTableHeaders.revision, data.prodName, '—')
    tableHelper.assertTextInCell(constData.productTableHeaders.status, data.prodName, constData.status.design)
  }

  assertProductTablePostUpdation(prodName, prodDesc, eid, status) {
    tableHelper.assertTextInCell(constData.productTableHeaders.name, prodName, prodName)
    tableHelper.assertTextInCell(constData.productTableHeaders.description, prodName, prodDesc)
    tableHelper.assertTextInCell(constData.productTableHeaders.eid, prodName, eid)
    tableHelper.assertTextInCell(constData.productTableHeaders.status, prodName, status)
  }

  clickEditIcon() {
    cy.get(selectors.editProductIcon)
      .should('be.visible')
      .click({force: true})
  }

  clickOnTableRow(name) {
    cy.xpath(selectors.tableRow.replace('name', name)).click()
  }

  waitForLoadingIconToDisappear() {
    cy.get(selectors.loadingSpinner).should('be.visible')
    cy.get(selectors.loadingSpinner).should('not.exist')
  }

  expandSettingsDropdown() {
    cy.get(selectors.settingsDropdown)
      .scrollIntoView()
      .should('be.visible')
      .click()
  }

  checkOptionsInSettingsDropdown(name) {
    featureHelpers.checkCheckbox(selectors.settingsDropDownOption.replace("CPN", name))
  }

  unCheckOptionsInSettingsDropdown(name) {
    featureHelpers.unCheckCheckbox(selectors.settingsDropDownOption.replace("CPN", name))
  }

  assertSettingsDropdownOptionDisabled(name) {
    featureHelpers.assertElementDisabled(selectors.settingsDropDownOption.replace("CPN", name))
  }

  assertSettingsDropdownOptionNotDisabled(name) {
    featureHelpers.assertElementNotDisabled(selectors.settingsDropDownOption.replace("CPN", name))
  }

  clickDeleteProductIcon() {
    cy.get(selectors.viewProduct.deleteIcon)
      .scrollIntoView()
      .should('not.be.disabled')
      .click({force: true})
  }

  waitForDeleteProductModal() {
    cy.get(selectors.viewProduct.deleteProductModal)
      .should('be.visible')
  }

  clickDeleteButtonInDeleteProductModal() {
    cy.get(selectors.viewProduct.deleteBtn)
    .should('be.visible')
    .click()
  }

  deleteProduct() {
    this.clickDeleteProductIcon()
    this.waitForDeleteProductModal()
    this.clickDeleteButtonInDeleteProductModal()
  }

  deleteProductFromTable() {
    cy.get(selectors.deleteBtnFromTable)
      .scrollIntoView()
      .trigger('mouseover')
      .click()
    this.waitForDeleteProductModal()
    this.clickDeleteButtonInDeleteProductModal()
  }

  assertProductDeleted(columnName, searchRowByText) {
    cy.xpath(selectors.tableRow.replace('name', searchRowByText))
      .should('not.exist')
    tableHelper.assertRowNotPresentInTable(columnName, searchRowByText)
  }

  clickRevertIcon() {
    cy.xpath(selectors.revertIcon)
      .scrollIntoView()
      .should('not.be.disabled')
      .should('be.visible')
      .click();
  }

  clickOnUpdateStatus() {
    cy.xpath(selectors.updateStatusIcon)
      .scrollIntoView()
      .should('not.be.disabled')
      .should('be.visible')
      .click()
  }

  waitForUpdateStatusModalTable() {
    cy.get(selectors.changeStatus.changeStatus)
      .should('be.visible');
  }

  changeStatus(value = "PROTOTYPE") {
    cy.get(selectors.changeStatus.bulkActionStatusChange)
      .select(value, {force: true})
      .should('have.value', value);
  }

  clickApplyButton() {
    cy.xpath(selectors.changeStatus.applyBtn)
      .should('not.be.disabled')
      .click({force: true})
      .should('not.have.class', 'disabled')
    cy.wait(3000);
  }

  clickOnContinue() {
    cy.xpath(selectors.changeStatus.continueIcon)
      .should('not.have.class', 'disabled')
      .click()
  }

  updateStatus(status) {
    this.clickOnUpdateStatus()
    this.waitForUpdateStatusModalTable();
    this.changeStatus(status)
    this.clickApplyButton()
    this.clickOnContinue()
    this.waitForLoadingIconToDisappear()
  }

  confirmYes() {
    cy.xpath(selectors.revertPopup.yesBtn)
      .should('not.be.disabled')
      .click()
  }

  revertStatus(){
    this.updateStatus()
    this.clickRevertIcon() 
    this.confirmYes()
    this.confirmYes()
  }

  updateAndResetStatus(status) {
    this.clickOnUpdateStatus();
    this.waitForUpdateStatusModalTable();
    this.changeStatus(status);
    this.clickApplyButton();
    this.clickReset();
  }

  updateBulkStatusAndApply(status) {
    this.clickOnUpdateStatus();
    this.waitForUpdateStatusModalTable();
    this.changeStatus(status);
    this.clickApplyButton();
  }

  changeStatusInRowFromChangeStatusModal(searchRowByText, value = "PROTOTYPE") {
    cy.xpath(selectors.changeStatus.statusDropdown.replace('name', searchRowByText))
      .scrollIntoView()
      .select(value)
      .should('have.value', value);
  }

  verifyUpdatedStatusInStatusColumnFromChangeStatusModal(searchRowByText, value = "PROTOTYPE") {
    cy.xpath(selectors.changeStatus.statusDropdown.replace('name', searchRowByText))
      .should('have.value', value);
  }

  clickReset() {
    cy.xpath(selectors.resetStatusBtn)
      .should('not.be.disabled')
      .click();
  }

  clickOnDeleteBtnInTable() {
    cy.get(selectors.deleteBtnFromTable)
      .should('be.visible') 
      .click();
  }

  clickOnDuplicateInTable() {
    cy.get(selectors.duplicateIconFromTable)
      .should('not.be.disabled') 
      .click({force:true});
  } 

  duplicateProductFromTable() {
    this.clickOnDuplicateInTable();
    this.waitForLoadingIconToDisappear();
  }

  getCopiedProductName(prodName){
    return 'COPY - ' + prodName
  }

  verifyCopiedProductDataInTable(duplicateComponent, data) {
    tableHelper.assertTextInCell(constData.productTableHeaders.eid, duplicateComponent, 'COPY - '+ data.eid)
  }

  checkRowInStatusChangeModal(searchRowByText) {
    tableHelper.checkTableRow(searchRowByText, selectors.changeStatus.tableRow, selectors.changeStatus.tableIndexes);
  }

  unCheckRowInStatusChangeModal(searchRowByText) {
    tableHelper.unCheckTableRow(searchRowByText, selectors.changeStatus.tableRow, selectors.changeStatus.tableIndexes);
  }

  verifyCheckboxUncheckedInStatusChangeModal(searchRowByText) {
    tableHelper.assertCheckBoxUncheckedInTable(searchRowByText, selectors.changeStatus.tableRow, selectors.changeStatus.tableIndexes);
  }

  verifyRevisionTooltipNotPresent(text = "") {
    cy.get(selectors.newProduct.revision)
      .should('have.attr', 'class', 'valid')
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.revisionTooltip)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyRevisionTooltipPresent(text = "") {
    cy.get(selectors.newProduct.revision)
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.revisionTooltip)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyForecastLengthInNewProductCreationModal(length){
    cy.get(selectors.newProduct.productForecast)
      .should('have.length', length)
  }

  verifyForecastLengthInBuildScheduleEditMode(length) {
    cy.get(selectors.editProd.productForecastInBuildSchedule)
      .should('have.length', length)
  }

  clickOnAddNewForecastInBuildScheduleEditMode() {
    cy.get(selectors.editProd.addForecastInBuildSchedule)
      .should('not.be.disabled')
      .click()
  }

  verifyForecastLengthInBuildScheduleViewMode(length) {
    cy.get(selectors.viewProduct.productForecast)
      .should('have.length', length)
  }

  clickFavoriteIcon() {
    cy.get(selectors.favoriteIcon)
      .should('not.be.disabled')
      .click();
  }

  assertProductAddedToFavorite() {
    cy.get(selectors.favoriteIcon)
      .should('have.class','faved');
  }

  assertChangesWillBeLostModalNotPresent() {
    cy.get(selectors.changesWillBeLostModal)
      .should('not.exist');
  }

  assertChangesWillBeLostModalIsPresent() {
    cy.get(selectors.changesWillBeLostModal)
      .should('exist');
  }

  clickCancelInUnsavedChangesModal() {
    cy.get(selectors.cancelBtnInUnsavedChanges)
      .should('not.be.disabled')
      .click();
  }

  clickOkBtnInUnsavedChangesModal() {
    cy.get(selectors.okBtnInUnsavedChanges)
      .should('not.be.disabled')
      .click();
  }

  fillNewProductForm(data) {
    this.clickNewButton();
    this.checkCategoryItem("Electrical")
    this.enterProductName(data.prodName)
    this.selectLifeCycleStatus(constData.status.design)
    this.enterEid(data.eid)
    this.enterProductDescription(data.prodDesc)
    this.enterProductManagerTeamEmail(data.prodManagEmail)
    this.enterEngineeringTeamEmail(data.engEmail)
    this.enterQaTeamEmail(data.qaEmail)
    this.enterProcurementTeamEmail(data.procurementEmail)
    this.enterManufacturingTeamEmail( data.manufacturEmail)
    this.enterPreProductionTargetDate(data.preProductionLaunch)
    this.enterPreProductionVolume(data.preProductionValue)
    this.enterMassProductionLaunchTargetDate(data.massProductionLaunch)
    this.enterMassProductionLaunchVolume(data.massProductionValue)
  }

  verifyCreateBtnEnabled() {
    cy.get(selectors.newProduct.createBtn)
      .should('have.attr', 'value', 'create')
      .should('not.have.attr', 'class', 'disabled')
  }

  verifyCreateBtnDisabled() {
    cy.get(selectors.newProduct.createBtn)
      .should('have.attr', 'value', 'create')
      .should('have.attr', 'class', 'disabled')
  }

  enterRevision(text = " ") {
    cy.get(selectors.newProduct.revision)
      .clear({force:true})
      .wait(1000)
      .clear()
      .wait(2000)
      .type(text)
      .should('have.attr', 'data-input-value', text)
  }

  verifyProductStatusInViewMode(text = 'DESIGN') {
    cy.get(selectors.viewProduct.statusLabel)
      .should('have.text', text)
      .should('be.visible')
  }

  verifyRevisionInViewMode(text = "—") {
    cy.get(selectors.viewProduct.revisionValue)
      .should('have.text', text)
      .should('be.visible')
  }

  clickCancelBtn() {
    cy.get(selectors.editProd.cancelBtn)
      .should('be.visible')
      .click()
  }

  verifyCancelledProductInTable(productName) {
    tableHelper.assertRowNotPresentInTable(constData.productTableHeaders.name, productName)
  }

  verifyNewButtonVisibleInProductPage(){
    cy.get(selectors.newBtn)
      .should('exist')
      .should('be.visible')
  }

  verifyNameTooltipNotPresent(text = "") {
    cy.get(selectors.newProduct.productName)
      .should('have.attr', 'class', 'valid')
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.productName)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyNameTooltipPresent(text = "") {
    cy.get(selectors.newProduct.productName)
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.productName)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyEidTooltipPresent(text = "") {
    cy.get(selectors.newProduct.eid)
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.eid)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyEidTooltipNotPresent(text = "") {
    cy.get(selectors.newProduct.eid)
      .should('have.attr', 'class', 'valid')
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.eid)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyDescTooltipPresent(text = "") {
    cy.get(selectors.newProduct.productDescription)
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.productDescription)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  verifyDescTooltipNotPresent(text = "") {
    cy.get(selectors.newProduct.productDescription)
      .should('have.attr', 'class', 'valid')
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(245, 74, 79)');
    cy.get(selectors.newProduct.productDescription)
      .invoke('attr', 'data-tip')
      .should('eq', text);
  }

  uploadThumbnailAndVerifyUploadingStatus(fileName) {
    featureHelpers.uploadFile(selectors.newProduct.uploadThumbnails, fileName)
    cy.get(selectors.newProduct.fileUploadProgress)
      .should('exist')
    cy.get(selectors.newProduct.fileUploadProgress, {timeout: 90000})
      .should('not.exist')
  }

  uploadDocumentAndVerifyUploadingStatus(fileName) {
    featureHelpers.uploadFile(selectors.newProduct.uploadDocuments, fileName)
    cy.get(selectors.newProduct.fileUploadProgress)
      .should('exist')
    cy.get(selectors.newProduct.fileUploadProgress, {timeout: 90000})
      .should('not.exist')
  }

  verifyErrorMessage(selector = selectors.newProduct.fileUploadError) {
    cy.get(selector)
      .should('have.text','File exceeds 25mb limit')
  }

  removeFailedFile() {
    cy.xpath(selectors.newProduct.deleteIconForFailedFile)
      .click()
  }

  uploadThumbnailAndCancelFileUpload(fileName) {
    featureHelpers.uploadFile(selectors.newProduct.uploadThumbnails, fileName)
    cy.get(selectors.newProduct.cancelFileUpload)
      .click()
  }

  uploadDocumentAndCancelFileUpload(fileName) {
    featureHelpers.uploadFile(selectors.newProduct.uploadDocuments, fileName)
    cy.get(selectors.newProduct.cancelFileUpload)
      .click()
  }

  uploadDocumentInEditView(fileName) {
    featureHelpers.uploadFile(selectors.editProd.uploadDocuments, fileName)
  }

  uploadDocumentAndVerifyUploadingStatusInEditView(fileName) {
    this.navigateToDocuments()
    this.uploadDocumentInEditView(fileName)
    cy.get(selectors.editProd.fileUploadProgress)
      .should('exist')
    cy.get(selectors.editProd.fileUploadProgress, {timeout: 90000})
      .should('not.exist')
  }

  navigateToDocuments() {
    cy.get(selectors.editProd.documentsTab)
      .click()
  }

  verifyProductNameAndStatusInProductView(name, status) {
    cy.get(selectors.viewProduct.prodName)
      .should('have.text', name)
    cy.get(selectors.viewProduct.statusLabel)
      .should('have.text', status)
  }

  verifyLengthOfTable(length) {
    cy.get(selectors.viewProduct.productsTableRows).should('have.length', length)
  }

  verifyErrorMessageInEditView() {
    this.verifyErrorMessage(selectors.editProd.fileUploadError)
  }

  uploadDocumentAndCancelFileUploadInEditView(fileName) {
    featureHelpers.uploadFile(selectors.editProd.uploadDocuments, fileName)
    cy.get(selectors.editProd.cancelFileUpload)
      .click()
  }

  verifyProcurementValue() {
    cy.get(selectors.viewProduct.procurementDropdown)
      .should('not.exist')
    cy.get(selectors.viewProduct.procurementValue)
      .should('be.empty')
  }

  createBasicProduct(prodName, status = constData.status.design, eid = faker.random.number({min:1000000, max:9999999})) {
    this.clickNewButton();
    this.checkCategoryItem("Electrical");
    this.enterProductName(prodName);
    this.selectLifeCycleStatus(status);
    this.enterEid(eid);
    this.clickCreateButton();
    featureHelpers.waitForLoadingIconToDisappear();
    this.clickSaveButtonInEditProduct();
  }

  clickOnDocumentsTab() {
    cy.get(selectors.editProd.documentsTab)
      .should('exist')
      .click()
  }

  verifySaveBtnEnabledInEditView() {
    cy.get(selectors.editProd.saveBtn)
      .should('have.class', '')
    cy.get(selectors.editProd.errorIcon)
      .should('not.exist')
  }

  verifySaveBtnDisabledInEditView() {
    cy.get(selectors.editProd.saveBtn)
      .should('have.class', 'disabled')
    cy.get(selectors.editProd.errorIcon)
      .should('exist')
  }

  enterRevisionInDocumentsTable(text) {
    cy.get(selectors.documentsInEditView.revision)
      .clear()
      .type(text)
      .should('have.value', text)
  }

  enterRevisionInDocumentsTableAsEmpty() {
    cy.get(selectors.documentsInEditView.revision)
      .clear()
      .should('have.value', '')
  }

  setStatusInDocuments(value) {
    cy.get(selectors.documentsInEditView.statusDropdown)
      .select(value)
  }

  verifyRevisionTooltipPresentInDocuments(text = "") {
    cy.get(selectors.documentsInEditView.revision)
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.documentsInEditView.revision)
      .invoke('attr', 'data-tip')
      .should('eq', text)
  }

  verifyRevisionTooltipNotPresentInDocuments(text = "") {
    cy.get(selectors.documentsInEditView.revision)
      .should('have.attr', 'class', 'valid')
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(245, 74, 79)');
    cy.get(selectors.documentsInEditView.revision)
      .invoke('attr', 'data-tip')
      .should('eq', text)
  }

  clickOnSaveAsRevisionBtn() {
    cy.xpath(selectors.editProd.saveAsRevisionBtn)
      .click()
  }

  verifySaveAsRevisionBtnPresent() {
    cy.get(selectors.editProd.editModeBannerBlock)
      .should('contain.text', 'SAVE AS REVISION')
  }

  verifySaveAsRevisionBtnNotPresent() {
    cy.get(selectors.editProd.editModeBannerBlock)
      .should('not.contain.text', 'SAVE AS REVISION')
  }

  clickOnHistoryIconInViewPage() {
    cy.xpath(selectors.viewProduct.historyIcon)
      .scrollIntoView()
      .click({force: true});
  }

  verifyNoOfRevisionsInViewPage(numberOfRevision) {
    cy.get(selectors.viewProduct.revisionHistoryTable)
      .should('have.length', numberOfRevision)
  }

  clickCancelInEditPage() {
    cy.xpath(selectors.editProd.cancelBtnInEditProduct)
      .click()
  }

  checkIncludeChildComponents() {
    cy.get(selectors.changeStatus.includeChildComponents)
      .check()
      .should('be.checked')
  }

  verifyApplyButtonDisabledInChangeStatusModal() {
    cy.xpath(selectors.changeStatus.applyBtn)
      .should('be.disabled');
  }

  clickOnChangeOrderIconInViewProduct() {
    cy.xpath(selectors.viewProduct.changeOrderIcon)
      .click({force:true})
  }

  verifyRevisionInViewProduct(revision) {
    cy.get(selectors.viewProduct.revisionValue)
      .should('have.text', revision)
  }

  enterErpStartDate(date) {
    cy.xpath(selectors.editProd.erpStartDate)
      .clear({force: true})
      .type(date)
      .should('have.value', date)
  }

  enterErpEndDate(date) {
    cy.xpath(selectors.editProd.erpEndDate)
      .clear({force: true})
      .type(date)
      .should('have.value', date)
  }

  verifyToolTipPresent(assertText) {
    cy.xpath(selectors.editProd.erpToolTip.replace('assertText',assertText))
      .should('exist')
  }

  verifyErpTilePresent() {
    cy.xpath(selectors.viewProduct.erpTile)
      .should('exist')
  }

  verifyErpType(erpType) {
    cy.xpath(selectors.viewProduct.erpType)
      .should('have.text', erpType)
  }

  verifyErpStartDate(startDate) {
    const format1 = featureHelpers.changeDateFormat(startDate, 'MMM d, yyyy');
    const format2 = featureHelpers.changeDateFormat(startDate, 'MMM dd, yyyy');
    cy.xpath(selectors.viewProduct.erpStartDate)
      .invoke('text').then((date) => {
        expect([format1, format2]).to.contain(date)
      })
  }

  verifyErpEndDate(endDate) {
    const format1 = featureHelpers.changeDateFormat(endDate, 'MMM d, yyyy');
    const format2 = featureHelpers.changeDateFormat(endDate, 'MMM dd, yyyy');
    cy.xpath(selectors.viewProduct.erpEndDate)
      .invoke('text').then((date) => {
        expect([format1, format2]).to.contain(date)
      })
  }

  clickSaveAsRevisionBtn() {
    cy.xpath(selectors.editProd.saveAsRevisionBtn)
      .should('be.visible')
      .click();
  }

  enterRevisionInSaveAsRevisionModal(value) {
    cy.get(selectors.editProd.revisionInSaveAsRevisionModal)
      .clear()
      .type(value);
  }

  clickContinueBtnInSaveAsRevisionModal() {
    cy.get(selectors.editProd.continueBtnInSaveAsRevisionModal)
      .should('be.visible')
      .click();
  }

  verifyContinueBtnEnabledInSaveAsRevisionModal() {
    cy.get(selectors.editProd.continueBtnInSaveAsRevisionModal)
      .should('be.visible')
  }

  clickOnReportsTab() {
    cy.get(selectors.viewProduct.reportsTab)
      .click()
  }

  verifyEditIconNotPresent() {
    cy.get(selectors.editProductIcon)
      .should('not.exist')
  }

  verifyChangeOrderIconNotPresent() {
    cy.xpath(selectors.viewProduct.changeOrderIcon)
      .should('not.exist')
  }

  verifyFavoriteIconNotPresent() {
    cy.get(selectors.favoriteIcon)
      .should('not.exist')
  }

  verifyHistoryIconPresent() {
    cy.xpath(selectors.viewProduct.historyIcon)
      .should('exist')
  }

  verifyExportIconPresent() {
    cy.get(selectors.viewProduct.exportIcon)
      .should('exist')
  }

  enterBulkRevision(revision = "") {
    cy.get(selectors.changeStatus.bulkRevision)
      .type(revision)
  }

  enterSearchTerm(searchText) {
    cy.get(selectors.searchField).clear().type(searchText);
  }

  createAndSaveBasicProduct(name = "TestProduct", status = "DESIGN", revision = "1") {
    nav.openProductTab();
    this.clickNewButton();
    this.enterProductName(name);
    this.selectLifeCycleStatus(status);
    this.enterRevision(revision);
    this.clickCreateButton();
    this.clickSaveButtonInEditProduct();
    featureHelpers.waitForLoadingIconToDisappear();
  }

  enterSearchTerm(searchTerm) {
    cy.get(selectors.searchField)
      .clear()
      .type(searchTerm)
  }

  navigateToProductViewPage(productName = "", prodSearch = true) {
    nav.openProductTab();
    if(prodSearch) this.enterSearchTerm(productName);
    tableHelper.clickOnCell(constData.productTableHeaders.name, productName);
  }

  verifyNextChangeOrderRevision(productName = "", rev = "") {
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelpers.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(productName);
    changeOrders.verifyNextRevisionInChangeOrderTable(productName, rev);
  }

  verifyRevisionInSaveAsRevisionModal(rev = "") {
    cy.get(selectors.editProd.revisionInSaveAsRevisionModal)
      .should('have.attr', 'data-input-value', rev)
  }

  verifyTheNextRevison(expectedRev = "") {
    this.clickEditIcon();
    this.clickSaveAsRevisionBtn();
    this.verifyRevisionInSaveAsRevisionModal(expectedRev);
  }

  enterRevisionInChangeStatusModal(rev = "") {
    cy.get(selectors.changeStatus.revisionField)
      .clear()
      .type(rev)
  }

  verifyRevisionTooltipInChangeStatusModal(tooltip = "") {
    cy.get(selectors.changeStatus.revisionField).then(($attr) => {
      if($attr.hasClass('invalid revision-input custom-rev-scheme')) {
        cy.get($attr)
          .should('have.attr', 'data-tip', tooltip)
      } else {
        cy.get($attr)
          .should('have.attr', 'data-tip', tooltip)
      }
    })
  }

  verifyContinueBtnDisabledInChangeStatusModal() {
    cy.xpath(selectors.changeStatus.continueIcon)
      .should('have.attr', 'class', 'spinner-btn  btn-header disabled')
  }

  verifyContinueBtnEnabledInChangeStatusModal() {
    cy.xpath(selectors.changeStatus.continueIcon)
      .should('not.have.attr', 'class', 'spinner-btn  btn-header disabled')
  }

  selectStatusInEditView(status = "") {
    cy.get(selectors.newProduct.lifeCycleStatus)
      .select(status)
  }

  verifyMassUnitLabelInViewProduct(massLabel = "") {
    cy.get(selectors.viewProduct.massUnitLabel)
      .should('have.text', massLabel)
  }

  verifyMassValueInViewProduct(massValue) {
    cy.get(selectors.viewProduct.massValue)
      .should('include.text', massValue)
  }

  enterMassInEditProduct(mass = "") {
    cy.get(selectors.editProd.massField)
      .scrollIntoView()
      .clear()
      .type(mass)
  }

  verifyMassFeildTooltip(tooltip = "") {
    cy.get(selectors.editProd.massField)
      .should('have.attr', 'data-tip', tooltip)
  }

  clickExportIconInViewProduct() {
    cy.get(selectors.viewProduct.exportIcon)
      .click({force:true});
  }

  verifyExportIconPresentForVendorLogin() {
    cy.get(selectors.vendorLogin.exportIcon)
      .should('exist')
  }

  verifyErpDetailsInViewProduct(startDate, endDate) {
    this.verifyErpStartDate(startDate);
    this.verifyErpEndDate(endDate);
  }

  verifyEffectivityNotPresent() {
    cy.xpath(selectors.editProd.erpStartDate).should('not.exist');
    cy.xpath(selectors.editProd.erpEndDate).should('not.exist');
  }

  verifyErpMessageInViewProduct(message = "*Change Order required to set ERP options") {
    cy.get(selectors.viewProduct.erpMessage).should('have.text', message)
  }

  verifyErpMessageInEditProduct(message = "*Change Order required to set ERP options") {
    cy.get(selectors.editProd.erpMessage).should('have.text', message)
  }

  verifyHistoryTableLoadingIconPresent() {
    cy.get(selectors.viewProduct.historyTableLoadingIcon)
      .should('exist')
  }

  verifyHistoryTableLoadingIconNotPresent() {
    cy.get(selectors.viewProduct.historyTableLoadingIcon)
      .should('not.exist')
  }

  verifySubRevisionLazyLoadingPresent() {
    cy.get(selectors.viewProduct.subRevisionLazyLoading)
      .should('exist')
  }

  verifySubRevisionLazyLoadingNotPresent() {
    cy.get(selectors.viewProduct.subRevisionLazyLoading)
      .should('not.exist')
  }

  clickOnPreviousRevision(index) {
    cy.xpath(selectors.viewProduct.previousRevision.replace('index', index))
      .click({force:true})
  }

  clickOnHistoryIconInCompareRevisionPage() {
    cy.get(selectors.viewProduct.historyIconInCompareRevisionPage)
      .click({force: true})
  }

  verifySubRevisionsNotFetched() {
    cy.get(selectors.viewProduct.revisionHistoryIcon)
      .should('not.have.attr', 'class', 'ui-icon sub-rev-icon open')
  }

  verifySubRevisionsFetched() {
    cy.get(selectors.viewProduct.revisionHistoryIcon)
      .should('have.attr', 'class', 'ui-icon sub-rev-icon open')
  }

  clickOnHistoryIcon() {
    cy.xpath(selectors.viewProduct.historyIcon)
      .scrollIntoView()
      .click({force:true});
  }

  clickOnRevisionExpandIcon() {
    cy.get(selectors.viewProduct.revisionHistoryIcon)
      .scrollIntoView()
      .click({force: true});
  }

  clickOnCompareRevision() {
    cy.xpath(selectors.viewProduct.compareRevision)
      .should('be.visible')
      .click();
  }

  entercommentInBulkUpdateSaveAsRevisionModal(text) {
    cy.get(selectors.editProd.commentInBulkUpdateSaveAsRevisionModal)
      .clear()
      .type(text);
  }

  clickContinueBtnInSetNewRevisionsModal() {
    cy.get(selectors.editProd.continueBtnInSetNewRevisionsModal)
      .should('be.visible')
      .click();
  }

  getHeaderIndex(columnName) {
    return cy.get(selectors.tableHeader.replace('cpn', columnName)).invoke('index')
  }

  verifyAllDataInReportsTable(reportsData) {
    this.getHeaderIndex('cpn').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text')
        .should('be.eq', reportsData.cpn)
    })

    this.getHeaderIndex('name').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text')
        .should('be.eq', reportsData.name)
    })

    this.getHeaderIndex('quantity').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text')
        .then(parseFloat).should('be.gte', 1)
    })

    this.getHeaderIndex('mfrMpn').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text')
        .should('be.eq', reportsData.mpn)
    })

    this.getHeaderIndex('mfrName').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text').then($text => {
        expect($text).to.be.oneOf(['Murata', 'Digi-Key', 'Avnet', 'Verical', 'CoreStaff', 'Chip One Stop Japan', 'Future Electronics', 'Arrow Electronics', 'Mouser', 'TTI',])
      })
    })

    this.getHeaderIndex('mfrDescription').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text')
        .should('be.eq', reportsData.name)
    })

    this.getHeaderIndex('distDpn').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).find('a')
        .should('have.attr', 'href').and('contain', 'https://octopart.com/')
    })

    this.getHeaderIndex('distName').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text').then($text => {
        expect($text).to.be.oneOf(['Digi-Key', 'Avnet', 'Verical', 'CoreStaff', 'Chip One Stop Japan', 'Future Electronics', 'Arrow Electronics', 'Mouser', 'TTI'])
      })
    })

    this.getHeaderIndex('distDescription').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text')
        .should('be.eq', 'Multilayer Ceramic Capacitor, 100 uF, 6.3 V, ± 20%, X5R, 1210 [3225 Metric]')
    })

    this.getHeaderIndex('quoteMinQuantity').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text')
        .then(parseFloat).should('be.gte', 0)
    })

    this.getHeaderIndex('quoteUnitPrice').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).invoke('text').as('unitPrice')
      cy.get('@unitPrice').then((value) => {
        const extractedUnitPrice = parseFloat(value.split('$')[1])
        expect(typeof(extractedUnitPrice)).to.eq('number');
        expect(extractedUnitPrice).to.gte(0.0);
        const splittedUnitPrice = value.split('');
        expect(splittedUnitPrice).to.contain('.');
      })
    })

    this.getHeaderIndex('quoteLeadTime').then((columnIndex) => {
      cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).find('.lead-time span').first().invoke('text').as('leadTime')
      cy.get('@leadTime').then((value) => {
        let leadTimeValue = parseInt(value), leadTimeUnit;
        expect(leadTimeValue).to.gte(0)
        leadTimeValue == 1 ? leadTimeUnit = "Day" : leadTimeUnit = "DAYS";
        cy.xpath(selectors.tableCell.replace('index', columnIndex+1).replace('name', reportsData.cpn)).find('.lead-time span').last().invoke('text').should('be.eq', leadTimeUnit)
      })
    })
  }

  clickVariantIconInViewPage() {
    cy.xpath(selectors.viewProduct.variantsIcon)
      .should('be.visible')
    cy.wait(3000);
    cy.xpath(selectors.viewProduct.variantsIcon)
      .click({force: true})
  }

  clickCreateNewVariantBtn() {
    cy.get(selectors.viewProduct.newVariantBtn)
      .click()
  }

  getCpnValueFromEditViewPage() {
    return cy.get(selectors.viewProduct.cpnValue)
      .invoke('text')
  }

  clickDuplicateIconInViewPage() {
    cy.get(selectors.viewProduct.duplicateIcon)
      .click({force: true})
  }

  renameProductNameInEditPage(newName = faker.random.number({min:10, max:999})) {
    featureHelpers.renameTheField(selectors.editProd.name, newName);
    return cy.get(selectors.editProd.name).invoke('attr', 'value')
  }

  enterEidInProductEditPage(eid) {
    cy.get(selectors.editProd.eid)
      .clear()
      .type(eid, {delay: 0})
  }

  verifyProductRevisionModifiedIconPresent() {
    cy.get(selectors.viewProduct.revisionValue + " div.modified")
      .should('exist')
  }

  verifyProductRevisionModifiedIconNotPresent() {
    cy.get(selectors.viewProduct.revisionValue + " div.modified")
      .should('not.exist')
  }

  verifyNoOfVariants(noOfVariants = 1) {
    cy.get(selectors.viewProduct.noOfVariants).its('length').should('eq', noOfVariants)
  }

  verifyUnitPriceInViewPage(price = "") {
    cy.get(selectors.viewProduct.unitPrice)
      .should('have.text', price)
  }

  verifyleadTimeInViewPage(time = "") {
    cy.get(selectors.viewProduct.leadTime)
      .should('have.text', time)
  }

  verifyMinQuantityInViewPage(quantity = "") {
    cy.get(selectors.viewProduct.minQty)
      .should('have.text', quantity)
  }

  verifyUnitPriceInEditPage(price = "") {
    cy.get(selectors.editProd.unitPrice)
      .should('have.text', price)
  }

  verifyleadTimeInEditPage(time = "") {
    cy.get(selectors.editProd.leadtime)
      .should('have.text', time)
  }

  verifyMinQuantityInEditPage(quantity = "") {
    cy.get(selectors.editProd.minQty)
      .should('have.text', quantity)
  }

  clickAddToChangeOrderInViewProduct() {
    cy.xpath(selectors.viewProduct.addToChangeOrder)
      .click()
  }

  enterDescriptionInProductEditPage(desc) {
    cy.get(selectors.editProd.productDescription)
      .clear()
      .type(desc, {delay:0})
  }

  verifyDescInProductViewPage(prodDesc) {
    cy.get(selectors.viewProduct.prodDesc)
      .should('have.text', prodDesc)
  }

  clickOnViewLatestReleaseBtn() {
    cy.xpath(selectors.viewProduct.viewLatestReleaseBtn)
      .click()
  }

  clickOnRevertBack() {
    cy.xpath(selectors.viewProduct.revertBack)
      .click()
  }

  clickYesBtnInConfirmRevertChanges() {
    cy.get(selectors.viewProduct.yesBtnInConfirmRevertChanges)
      .click()
  }

  clickExportIconInProductRevisionPage() {
    cy.get(selectors.viewProduct.exportIconInProductRevisionPage)
      .click()
  }

  verifyNoOfRowsPresentInDocumentsTable(rowLength) {
    cy.get(selectors.documentsInViewPage.documentsTable).find("tr").then((row) => {
      expect((row.length)-1).to.be.equal(rowLength)
    });
  }

  verifyDocumentLink(fileName = "apple.jpg", link = "") {
    Cypress.config().baseUrl.startsWith('https://staging') ?
      link = 'https://storage.googleapis.com/plm-assets-v2-staging' :
      link = 'https://storage.googleapis.com/plm-assets-v1-qa'
    cy.xpath(selectors.documentsInViewPage.documentLink(fileName))
      .should('have.attr', 'href')
      .and('include', link)
  }

  verifyOldRevisionInSummaryOfChanges(revision) {
    cy.get(selectors.compareRevisionsPage.summaryOfChangesPanel.oldRevision)
      .should('contain.text', revision)
  }

  verifyNewRevisionInSummaryOfChanges(revision) {
    cy.get(selectors.compareRevisionsPage.summaryOfChangesPanel.newRevision)
      .should('contain.text', revision)
  }

  verifyAssemblyModifiedLabelPresentInSummaryOfChanges() {
    cy.xpath(selectors.compareRevisionsPage.summaryOfChangesPanel.assemblyModifiedlabel)
      .should('be.visible')
  }

  verifyAssemblyModifiedCountInSummaryOfChanges(modifiedCount) {
    cy.xpath(selectors.compareRevisionsPage.summaryOfChangesPanel.assemblyModifiedContent)
      .should('have.text', modifiedCount)
  }

  verifyBackgroundColourForModifiedRowInCompareRevPage(cmpName) {
    cy.xpath(selectors.compareRevisionsPage.assemblyTable.modifiedRow.replace('cmpName', cmpName))
      .should('have.css', 'background-color')
      .and('contain', 'rgb(212, 232, 252)');
  }

  verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpName) {
    cy.xpath(selectors.compareRevisionsPage.assemblyTable.nonModifiedRow.replace('cmpName', cmpName))
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(212, 232, 252)');
  }

  verifyModifiedCountInAssemblyTable(cmpName, modifiedCount) {
    cy.xpath(selectors.compareRevisionsPage.assemblyTable.modifiedCount.replace('cmpName', cmpName))
      .should('have.text', modifiedCount)
  }

  verifyOldRevisionInAssemblyTable(cmpName, oldRevision) {
    cy.xpath(selectors.compareRevisionsPage.assemblyTable.oldRevision.replace('cmpName', cmpName))
      .invoke('text')
      .should('contain', oldRevision.toString())
  }

  verifyNewRevisionInAssemblyTable(cmpName, newRevision) {
    cy.xpath(selectors.compareRevisionsPage.assemblyTable.newRevision.replace('cmpName', cmpName))
      .invoke('text')
      .should('contain', newRevision.toString())
  }

  verifyChildCmpTableDisabledInSetNewRevisionModal() {
    cy.get(selectors.setNewRevisionsModal.childComponentsTable)
      .should('contain.class', 'disabled-child')
  }

  verifyChildCmpTableEnabledInSetNewRevisionModal() {
    cy.get(selectors.setNewRevisionsModal.childComponentsTable)
      .should('contain.class', 'enabled-child')
  }

  uncheckAllRowsChildCheckBoxInSetNewRevisionModal() {
    cy.get(selectors.setNewRevisionsModal.allChildCheckBox)
      .uncheck()
  }

  checkChildRowInSetNewRevisionModal(index) {
    cy.xpath(selectors.setNewRevisionsModal.childRowCheckBox.replace('Index', index+1))
      .check({force:true})
  }

  selectRevisionInHistoryTable(index) {
    cy.xpath(selectors.viewProduct.selectRevisionRadioBtn.replace('index', index))
      .check({force:true})
  }

  verifyCpnInViewPage(cpn) {
    cy.get(selectors.viewProduct.cpnValue).should('have.text', cpn);
  }

  verifyNoOfProductsFromProductsLibrary(noOfProducts) {
    if(noOfProducts<=150) {
      cy.get(selectors.productsTable)
        .its('length')
        .should('eq', noOfProducts+1)          //+1 represents tableHeader
    }
    else{
      cy.get(selectors.totalProductsCount)
        .should('have.text', `${noOfProducts} results`)
    }
  }

  verifyProductNameInViewMode(name) {
    cy.get(selectors.viewProduct.prodName)
      .should('have.text', name)
  }
}
