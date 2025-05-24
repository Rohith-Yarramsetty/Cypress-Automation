import selectors from "../../selectors/components/component";
import constData from "../../helpers/pageConstants";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Navigation } from "../navigation";
import { Assembly } from "../components/assembly";
import { NavHelpers } from "../../helpers/navigationHelper";
import { IntegrationsApi } from "../../api/integrationsApi";
import { ChangeOrders } from "../changeOrders/changeOrder";

const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const nav = new Navigation();
const assembly = new Assembly();
const integrationsApi = new IntegrationsApi();
const changeOrders = new ChangeOrders();
const faker = require('faker');

export class Components {
  
  clickComponentIcon() {
    cy.get(selectors.componentLibBtn)
      .should('be.visible')
      .click();
  }

  clickonCreateManually() {
    cy.get(selectors.createManually)
      .should('be.visible')
      .click();
  }

  chooseType(type = 'electrical') {
    cy.get(selectors.electicalIcon.replace('electrical', type))
      .should('be.visible')
      .click();
  }

  chooseElectricalType() {
    cy.get(selectors.electicalIcon)
      .should('be.visible')
      .click();
  }

  chooseMechanicalType() {
    cy.get(selectors.mechanicalIcon)
      .should('be.visible')
      .click();
  }

  chooseCategory(value = "(213) Charger") {
    cy.get(selectors.chooseCategory)
      .select(value)
  }

  chooseCategoryInImportVendorPage(value = "(212) Capacitor") {
    cy.get(selectors.vendorPage.chooseCategoryInImportVendorModal)
      .select(value)
  }

  enterChargerType(chargertType) {
    cy.xpath(selectors.charger.typeTxtBx)
      .type(chargertType)
  }

  enterMaxVolt(maxVolt) {
    cy.xpath(selectors.charger.voltageInTxtBx)
      .type(maxVolt)
  }

  enterMinVolt(minVolt) {
    cy.xpath(selectors.charger.voltageOutTxtBx)
      .type(minVolt)
  }

  enterCurrent(ampere) {
    cy.xpath(selectors.charger.chargerCurrentTxtBx)
      .type(ampere)
  }

  enterComponentName(name) {
    cy.get(selectors.nameTxtBx)
      .clear({force:true})
      .should('have.text', '')
      .type(name)
  }

  clickOnCreate() {
    cy.get(selectors.addAnotherCheckbox).invoke('is', ':checked').then((checked) => {
      cy.get(selectors.createBtn)
        .should('not.have.class', 'disabled')
        .click()
        .wait(7000)
      if(!checked) {
        cy.get('body').then((body) => {
          body.find(selectors.createBtn).length > 0 ?
          cy.xpath('//*[text()="CREATE"]', { failOnStatusCode: false }).click({force: true}) : null
        })
      }
    })
  }

  clickSaveButtonInEditComponent({ timeout } = { timeout: Cypress.config('defaultCommandTimeout') }) {
    cy.get(selectors.saveBtn, { timeout })
      .scrollIntoView({ timeout })
      .wait(2500)
      .should('not.be.disabled')
      .should('be.visible')
      .click({ timeout }, {force: true})
  }

  clickCancelButtonInEditComponent() {
    cy.xpath(selectors.cancelBtn)
      .scrollIntoView()
      .should('be.visible')
      .click()
  }

  selectStatus(value = "PROTOTYPE") {
    cy.get(selectors.status)
      .select(value)
      .should('have.value', value)
  }

  enterEid(eid) {
    cy.get(selectors.eidTxtBx)
      .clear()
      .type(eid)
      .should('have.value', eid)
  }

  enterComponentDescription(compDesc) {
    cy.get(selectors.descriptionTxtBx)
      .clear()
      .type(compDesc).should('have.value', compDesc);
  }

  uploadThumbnail(fileName) {
    featureHelpers.uploadFile(selectors.uploadThumbnails, fileName)
    this.waitForFileUpload()
  }

  uploadDocuments(fileName) {
    featureHelpers.uploadFile(selectors.uploadDocuments, fileName)
    this.waitForFileUpload()
  }

  waitForFileUpload() {
    cy.get(selectors.fileUploadProgress, {timeout: 50000}).should('not.exist')
  }

  createChargerComponentManually(data) {
    this.clickComponentIcon();
    this.clickonCreateManually();
    this.chooseType(data.componentType);
    this.chooseCategory(data.category);
    this.enterChargerType(data.chargertType);
    this.enterMaxVolt(data.maxVolt);
    this.enterMinVolt(data.minVolt);
    this.enterCurrent(data.ampere);
    this.selectStatus(constData.status.design);
    this.enterEid(data.eid);
    this.enterComponentDescription(data.compDesc);
    this.uploadThumbnail('drone.jpg');
    this.uploadDocuments('sample_document.doc');
    this.clickOnCreate();
  }

  verifyDataInEditmode(data) {
    cy.get(selectors.editComponent.eidValue).should('have.value', data.eid.toString());
    cy.get(selectors.editComponent.compDesc).should('have.text', data.compDesc);
    cy.get(selectors.editComponent.voltageOut).should('have.value', data.minVolt);
    cy.get(selectors.editComponent.voltageIn).should('have.value', data.maxVolt);
    cy.get(selectors.editComponent.chargerCurrent).should('have.value', data.ampere);
  }

  verifyDataOnComponentCreation(data) {
    cy.get(selectors.viewComponent.eidValue).should('have.text', data.eid.toString());
    cy.get(selectors.viewComponent.compDesc).should('have.text', data.compDesc);
    cy.get(selectors.viewComponent.voltOut).should('have.text', data.minVolt.toString());
    cy.get(selectors.viewComponent.voltIn).should('have.text', data.maxVolt.toString());
    cy.get(selectors.viewComponent.chargeCurrent).should('have.text', data.ampere.toString());
  }

  verifyComponentNameAndDesignOnComponentCreation(name, status) {
    cy.get(selectors.viewComponent.componentName).should('have.text', name);
    cy.get(selectors.viewComponent.status).should('have.text', status);
  }

  verifyComponentDataInTable(data, componetFullName) {
    tableHelper.assertTextInCell(constData.componentTableHeaders.name, data.eid, componetFullName)
    tableHelper.assertTextInCell(constData.componentTableHeaders.category, data.eid, 'Charger')
    tableHelper.assertTextInCell(constData.componentTableHeaders.eid, data.eid, data.eid.toString())
    tableHelper.assertTextInCell(constData.componentTableHeaders.revision, data.eid, '—')
    tableHelper.assertTextInCell(constData.componentTableHeaders.status, data.eid, constData.status.design)
    tableHelper.assertTextInCell(constData.componentTableHeaders.description, data.eid, data.compDesc)
  }

  getChargerComponentFullName(compName, chargertType, minVolt, maxVolt) {
    return compName + ' ' + chargertType + ' ' + minVolt + ' ' + maxVolt
  }

  getCopiedComponentFullname(componetFullName){
    return 'COPY - ' + componetFullName
  }

  clickDeleteComponentIconFromDetailsPage() {
    cy.get(selectors.viewComponent.deleteIcon)
      .scrollIntoView()
      .should('be.visible')
      .click()
  }

  clickDeleteComponentIconFromTable() {
    cy.xpath(selectors.tableDeleteIcon)
      .scrollIntoView()
      .should('be.visible')
      .click()
  }

  waitForDeleteComponentModal() {
    cy.get(selectors.viewComponent.deleteComponentModal)
      .should('exist')
  }

  clickDeleteButtonInDeleteComponentModal() {
    cy.get(selectors.viewComponent.duplicateIcon)
    .should('be.visible')
    .click()
  }

  deleteComponentFromTable() {
    this.clickDeleteComponentIconFromTable()
    this.waitForDeleteComponentModal()
    this.clickDeleteButtonInDeleteComponentModal()
  }

  deleteComponentFromDetailsPage() {
    this.clickDeleteComponentIconFromDetailsPage()
    this.waitForDeleteComponentModal()
    this.clickDeleteButtonInDeleteComponentModal()
  }

  assertComponentDeleted(columnName, searchRowByText) {
    cy.xpath(selectors.tableRow.replace('name', searchRowByText))
      .should('not.exist')
    tableHelper.assertRowNotPresentInTable(columnName, searchRowByText)
  }

  copyComponent() {
    cy.get(selectors.viewComponent.copyIcon)
      .scrollIntoView()
      .click();
  }

  verifyCopiedComponentDataInTable(duplicateComponent, data) {
    tableHelper.assertTextInCell(constData.componentTableHeaders.eid, duplicateComponent, 'COPY - '+ data.eid)
  }

  clickOnUpdateStatus() {
    cy.get(selectors.updateStatusIcon)
      .scrollIntoView()
      .should('not.be.disabled')
      .click({force:true});
  }

  selectBulkStatus(value = "PROTOTYPE") {
    cy.get(selectors.changeStatus.bulkStatus).should('have.value', 'Choose Status')
    cy.get(selectors.changeStatus.bulkStatus)
      .select(value)
      .should('have.value', value);
  }

  waitForUpdateStatusModalTable() {
    cy.get(selectors.changeStatus.confirmStatusChangeTable).should('be.visible');
  }

  clickApply() {
    cy.xpath(selectors.changeStatus.applyBtn)
      .should('not.be.disabled')
      .click({force:true});
  }

  verifyApplyButtonDisabledInChangeStatusModal() {
    cy.xpath(selectors.changeStatus.applyBtn)
      .should('be.disabled');
  }

  clickOnContinue() {
    cy.xpath(selectors.changeStatus.continueBtn)
      .should('be.visible')
      .click({force:true});
    featureHelpers.waitForLoadingIconToDisappear();
  }

  clickReset() {
    cy.xpath(selectors.changeStatus.resetBtn)
      .should('not.be.disabled')
      .click();
  }

  updateBulkStatusAndApply(status) {
    this.waitForUpdateStatusModalTable();
    this.verifyApplyButtonDisabledInChangeStatusModal();
    this.selectBulkStatus(status);
    this.clickApply();
  }

  updateAndResetStatus(status) {
    this.clickOnUpdateStatus();
    this.waitForUpdateStatusModalTable();
    this.verifyApplyButtonDisabledInChangeStatusModal();
    this.selectBulkStatus(status);
    this.clickApply();
    this.clickReset();
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

  assertProductDeleted(columnName, searchRowByText) {
    cy.xpath(selectors.tableRow.replace('name', searchRowByText))
      .should('not.exist');
    tableHelper.assertRowNotPresentInTable(columnName, searchRowByText);
  }

  duplicateComponentFromDetailsPage(){
    cy.get(selectors.detailPage.duplicateIcon)
      .should('be.visible')
      .click();
  }

  saveBtnDetailsPage() {
    cy.get(selectors.saveBtn)
      .should('be.visible')
      .click()
  }

  copyComponentFromDetailsPage() {
    this.duplicateComponentFromDetailsPage()
    featureHelpers.waitForLoadingIconToDisappear()
    this.saveBtnDetailsPage()
  }

  verifyCheckboxUncheckedInStatusChangeModal(searchRowByText) {
    tableHelper.assertCheckBoxUncheckedInTable(searchRowByText, selectors.changeStatus.tableRow, selectors.changeStatus.tableIndexes);
  }

  clickOnImportFromVendor() {
    cy.xpath(selectors.importFromVendor)
      .should('be.visible')
      .click()
  }

  enterMpn(mpn) {
    cy.get(selectors.vendorPage.mpnTextField)
      .type(mpn)
      .should('have.value', mpn)
  }

  searchForMpnOrDpn(value) {
    cy.get(selectors.vendorPage.searchMpnOrDpn)
      .type(value)
      .should('have.value', value)
  }

  clickEditIcon() {
    cy.xpath(selectors.viewComponent.editIcon)
      .scrollIntoView()
      .should('not.be.disabled')
      .click();
  }

  clickAdd(){
    cy.xpath(selectors.vendorPage.addBtn)
      .scrollIntoView()
      .should('be.visible')
      .click()
  }

  importFromVendor(data) {
    this.clickOnImportFromVendor()
    this.chooseType(data.componentType)
    this.chooseCategoryInImportVendorPage(data.category)
    this.enterMpn(data.mpn)
    this.clickOnCreate();
    cy.wait(3000);
    cy.get('body').then((body) => {
      if(body.find(selectors.changesWillBeLostModal).length>0) this.clickCancelInUnsavedChangesModal();
    })
    this.verifyCategoryInEditComponent(data.category);
    this.clickSaveButtonInEditComponent()
    featureHelpers.waitForLoadingIconToDisappear()
  }

  clickOnImportFromValispace() {
    cy.xpath(selectors.importFromValispace)
      .should('be.visible')
      .click()
  }

  chooseValispaceWorkspace(workspaceName) {
    cy.get(selectors.valispaceModal.workspacesTable).should('be.visible')
      .find(selectors.valispaceModal.radioInput(workspaceName))
      .scrollIntoView()
      .check();
  }

  chooseValispaceProject(projectName) {
    cy.get(selectors.valispaceModal.projectsTable).should('be.visible')
      .find(selectors.valispaceModal.radioInput(projectName))
      .scrollIntoView()
      .check();
  }

  assignCategoriesToValispaceComponents(categories = []) {
    cy.wait('@getExistingComponents', {
      timeout: 120000
    });
    cy.get(selectors.valispaceModal.reviewTable).should('be.visible')
    cy.wrap(categories).each((category, idx) => 
      cy.get(selectors.valispaceModal.nthRowCategorySelect(idx + 1)).select(category)
    );
  }

  clickOnValispaceModalContinueBtn() {
    cy.get(selectors.valispaceModal.continueBtn)
      .should('not.have.class', 'disabled')
      .click();
  }

  completeValispaceImport() {
    this.clickOnValispaceModalContinueBtn();
    // Review function if error after importing from valispace is fixed
    cy.intercept('**/v1/search/components').as('componentsRoute');
    cy.contains('Components imported successfully').should('be.visible');
    cy.contains('OK').click();
    cy.wait('@componentsRoute', {
      timeout: 120000
    })
  }

  importAllComponentsFromValispaceProject(data) {
    const {
      workspaceName,
      projectName,
      categories
    } = data;
    navHelper.navigateToSearch();
    this.clickOnImportFromValispace();
    this.chooseValispaceWorkspace(workspaceName);
    this.clickOnValispaceModalContinueBtn();
    this.chooseValispaceProject(projectName);
    this.clickOnValispaceModalContinueBtn();
    // Select All components
    cy.get(selectors.valispaceModal.allComponentsCheckBox).should('exist')
    .check();
    cy.intercept('**/v1/valispace/getExistingComponents').as('getExistingComponents');
    this.clickOnValispaceModalContinueBtn();
    this.assignCategoriesToValispaceComponents(categories)
    this.completeValispaceImport();
    navHelper.navigateToSearch();
  }

  assertValispaceMass(valiComponentId, expectedMass, massValiPostion = 2) {
    cy.wait(5000)
    integrationsApi.getValispaceComponentData(valiComponentId).then(valiComponent => {
      const massValiId = valiComponent.valis[massValiPostion];
      integrationsApi.getValispaceValiData(massValiId).then(valiData => {
        expect(valiData.shortname).to.contain('Mass');
        expect(valiData.value).to.eq(expectedMass);
      })
    })
  }

  verifyElementPresentInTable(columnName, searchRowByText) {
    cy.get(selectors.tableHeader.replace('cpn', columnName))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(selectors.tableCell.replace('name', searchRowByText).replace('index', columnIndex + 1))
          .its('length').should('be.gte', 1)
        })
      }

  enterRevision(revision) {
    cy.get(selectors.revisionTxtBx)
      .clear()
      .type(revision)
  }

  verifyRevisionTooltipNotPresent(text = "") {
    cy.get(selectors.revisionTxtBx)
      .should('have.attr', 'class', 'form-control valid')
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(245, 74, 79)');
    cy.get(selectors.revisionTooltip)
      .should('have.text', text);
  }

  verifyRevisionTooltipPresent(text = "") {
    cy.get(selectors.revisionTxtBx)
      .should('have.attr', 'class', 'form-control invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.revisionTooltip)
      .should('have.text', text);
  }

  verifyCreateBtnEnabled() {
    cy.get(selectors.createBtn)
      .should('not.be.disabled');
  }

  verifyCreateBtnDisabled() {
    cy.get(selectors.createBtn)
      .should('be.disabled');
  }

  createComponentManually(data) {
    this.clickComponentIcon()
    this.clickonCreateManually()
    if (data.categoryType !== undefined) this.chooseType(data.componentType);
    this.chooseCategory(data.category)
    this.enterComponentName(data.componentName)
    this.selectStatus(data.status)
    if (data.revision !== undefined) this.enterRevision(data.revision);
    if (data.compDesc !== undefined) this.enterComponentDescription(data.compDesc); 
    this.clickOnCreate()
    this.clickSaveButtonInEditComponent()
    featureHelpers.waitForLoadingIconToDisappear()
  }

  getHeaderIndex(columnName) {
    return cy.get(selectors.tableHeader.replace('cpn', columnName)).invoke('index')
  }

  enterSearchTerm(searchText) {
    cy.get(selectors.searchField).clear().type(searchText, {delay: 0});
  }

  checkSelectAllIndexesCheckbox() {
    cy.get(selectors.selectAllIndexCheckbox).check();
  }

  deleteAllComponents(searchText) {
    this.enterSearchTerm(searchText);
    featureHelpers.waitForLoadingIconToDisappear();
    cy.get('#index-table tbody')
      .then(($tbody) => {
        if($tbody.find('tr').length) {
          this.checkSelectAllIndexesCheckbox();
          this.deleteComponentFromTable();
          featureHelpers.waitForLoadingIconToDisappear();
        }
      })
  }

  enterCompDescInDetailsPanel(compDesc) {
    cy.get(selectors.editComponent.compDesc)
      .should('be.visible')
      .type(compDesc).should('have.value', compDesc);
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

  verifyNameTooltip(text) {
    cy.get(selectors.nameTxtBx)
      .should('have.attr', 'class', 'form-control invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.nameTooltip)
      .should('contain', text)
  }

  verifyEidTooltipPresent(text = "") {
    cy.get(selectors.eidTxtBx)
      .should('have.attr', 'class', 'form-control invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.eidTooltip)
      .should('contain', text)
  }

  verifyDescTooltip(text) {
    cy.get(selectors.descriptionTxtBx)
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.descTooltip)
      .should('contain', text)
  }

  fileSizeError(text, selector = selectors.sizeError) {
    cy.get(selector)
      .should('have.text', text)
  }

  clickCancelBtnInCreateComponent() {
    cy.xpath(selectors.cancelBtnInCreateComponent)
      .click()
  }

  removeFailedFile() {
    cy.xpath(selectors.deleteIconForFailedFile)
      .click({force:true})
  }

  uploadAndCancelThumbnail(fileName) {
    featureHelpers.uploadFile(selectors.uploadThumbnails, fileName)
    cy.get(selectors.cancelFileUpload)
      .click()
  }

  uploadAndCancelDocument(fileName) {
    featureHelpers.uploadFile(selectors.uploadDocuments, fileName)
    cy.get(selectors.cancelFileUpload)
      .click()
  }

  waitForUpload() {
    cy.get(selectors.fileUploading, {timeout: 60000}).should('be.visible')
    cy.get(selectors.fileUploading, {timeout: 60000}).should('not.exist')
  }

  uploadDocumentAndVerifyUploadToComplete(fileName) {
    featureHelpers.uploadFile(selectors.uploadDocuments, fileName)
    this.waitForUpload()
  }

  uploadDocumentsAndAssertLoadingInEditPage(fileName) {
    this.uploadDocumentInEditView(fileName);
    cy.get(selectors.editComponent.fileUploadProgress, {timeout: 60000}).should('exist')
    cy.get(selectors.editComponent.fileUploadProgress, {timeout: 60000}).should('not.exist')
  }

  uploadDocumentInEditView(fileName) {
    featureHelpers.uploadFile(selectors.editComponent.uploadDocument, fileName)
    this.waitForFileUpload()
  }

  cancelDocumentUploadInEditView() {
    cy.get(selectors.editComponent.cancelFileUpload)
      .click({force: true})
  }

  fileSizeErrorInEditView(text) {
    this.fileSizeError(text, selectors.editComponent.uploadDocumentError)
  }

  verifyLengthOfDocument(count) { 
    cy.get(selectors.editComponent.productDocumentTableRows).should('have.length', count)
  }

  verifyProcurementValueInView() {
    cy.get(selectors.viewComponent.procurementValue)
      .should('be.empty')
  }

  checkAddAnotherOptn() {
    cy.get(selectors.addAnotherCheckbox)
      .check()
      .should('be.checked');
  }

  verifyCreateComponentModelVisible() {
    cy.get(selectors.createComponentManuallyModal)
      .should('exist');
    cy.xpath(selectors.createcomponentLabel)
      .should('have.text', 'Create Component')
  }

  clickExportIconInViewComponent() {
    cy.get(selectors.viewComponent.exportIconInViewPage)
      .click({force: true});
  }

  clickSaveAsRevisionBtn() {
    cy.get(selectors.editComponent.saveAsRevisionBtn)
      .should('be.visible')
      .click();
  }

  enterRevisionInSaveAsRevisionModal(value) {
    cy.get(selectors.editComponent.revisionInSaveAsRevisionModal)
      .clear()
      .type(value);
  }

  enterCommentInSaveAsRevisionModal(text) {
    cy.get(selectors.editComponent.commentInSaveAsRevisionModal)
      .clear()
      .type(text);
  }

  clickContinueBtnInSaveAsRevisionModal() {
    cy.get(selectors.editComponent.continueBtnInSaveAsRevisionModal)
      .should('be.visible')
      .click();
  }

  selectStatusInEditView(status) {
    cy.get(selectors.editComponent.status)
      .select(status, {force:true})
  }

  verifyChangeStatusHeader() {
    cy.get(selectors.changeStatus.changeStatusPageHeader)
      .should('have.text', 'Confirm status change')
      .should('be.visible')
  }

  checkIncludeChildComponents() {
    cy.get(selectors.changeStatus.includeChildComponents)
      .check()
      .should('be.checked')
  }

  clickOnRevisionExpandIcon() {
    cy.get(selectors.viewComponent.revisionHistoryIcon)
      .scrollIntoView()
      .click({force: true});
  }

  clearComponentNameInEditView() {
    cy.get(selectors.editComponent.componentName)
      .clear()
  }

  verifySaveBtnEnabledInEditView() {
    cy.get(selectors.editComponent.saveBtn)
      .should('not.have.class', 'disabled')
  }

  verifySaveBtnDisabledInEditView() {
    cy.get(selectors.editComponent.saveBtn).then(($btn) => {
      expect($btn).to.have.class('disabled');
    })
  }

  verifyErrorIconPresentInEditView() {
    cy.get(selectors.editComponent.errorIcon)
      .should('exist')
  }

  verifyErrorIconNotPresentInEditView() {
    cy.get(selectors.editComponent.errorIcon)
      .should('not.exist')
  }

  enterComponentNameInEditView(text) {
    cy.get(selectors.editComponent.componentName)
      .clear()
      .type(text)
  }

  verifyNoOfRevisions(numberOfRevision) {
    cy.get(selectors.viewComponent.revisionHistoryTable)
      .should('have.length', numberOfRevision)
  }

  verifyNoOfSubRevisions(numberOfRevision) {
    cy.get(selectors.viewComponent.subRevisionHistory)
      .its('length').then((rev) => {
        this.clickOnRevisionExpandIcon();
        cy.get(selectors.viewComponent.subRevisionLazyLoading).should('not.exist');
        cy.get(selectors.viewComponent.subRevisionHistory)
          .its('length').then((totalRev) => {
            expect(totalRev-rev).to.eq(numberOfRevision);
          })
      })
  }

  verifyUpdateStatusModal() {
    cy.get(selectors.editComponent.updateStatusModal)
      .should('be.visible')
    cy.get(selectors.editComponent.childTableInupdateStatusModal)
      .should('exist')
  }

  verifyBulkStatusNotPresent() {
    cy.get(selectors.changeStatus.bulkStatus)
      .should('have.class', 'disabled')
  }

  verifyBulkStatusPresent() {
    cy.get(selectors.changeStatus.bulkStatus)
      .should('not.have.class', 'disabled')
  }

  clickWhereUsedIconInViewComponent() {
    cy.get(selectors.viewComponent.whereUsedIcon)
      .scrollIntoView()
      .click({force:true});
  }

  verifyWhereUsedText(text) {
    cy.get(selectors.viewComponent.whereUsedText)
      .should('have.text', text);
  }

  clickOnHistoryIcon() {
    cy.get(selectors.viewComponent.historyIcon)
      .scrollIntoView()
      .should('be.visible')
      .click({force: true});
  }

  clicksecondItemInHistoryTable() {
    cy.xpath(selectors.viewComponent.secondItemInHistoryTable)
      .click({force: true});
  }

  verifyDataInWhereUsedTable(productCpnValue, assembly1CpnValue, assembly2CpnValue) {
    tableHelper.assertTextInCell(constData.componentTableHeaders.cpn, productCpnValue, productCpnValue);
    tableHelper.assertTextInCell(constData.componentTableHeaders.cpn, assembly1CpnValue, assembly1CpnValue);
    tableHelper.assertTextInCell(constData.componentTableHeaders.cpn, assembly2CpnValue, assembly2CpnValue);
  }

  verifySaveAsRevisionBtnPresent() {
    cy.get(selectors.editComponent.editModeBannerBlock)
      .should('contain.text', 'SAVE AS REVISION')
  }

  verifySaveAsRevisionBtnNotPresent() {
    cy.get(selectors.editComponent.editModeBannerBlock)
      .should('not.contain.text', 'SAVE AS REVISION')
  }

  clickCancelInEditCmpAfterSavingCmp(){
    cy.xpath(selectors.editComponent.cancelBtnInEditComponent)
      .click()
  }

  clickContinueBtnInSetNewRevisionsModal() {
    cy.get(selectors.editComponent.continueBtnInSetNewRevisionsModal)
      .should('be.visible')
      .click();
  }

  chooseOfftheShelftype() {
    cy.get(selectors.offTheShelfIcon)
      .click()
  }

  clickOnChangeOrderIconInViewComponent() {
    cy.get(selectors.viewComponent.changeOrderIcon)
      .click({force:true})
  }

  verifyRevisionInViewComponent(revision = "") {
    cy.get(selectors.viewComponent.revisionValue)
      .should('contain', revision)
  }

  verifyNoOfRevisionsForCmpInCmpLibrary(componentName, noOfRevisions) {
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentName);
    featureHelpers.waitForLoadingIconToDisappear();
    this.clickOnHistoryIcon();
    this.verifyNoOfRevisions(noOfRevisions);
  }

  verifySaveAsRevisionNotPresentForCmpInCmpLibrary(tableHeader, componentName) {
    nav.openComponentsTab();
    tableHelper.clickOnCell(tableHeader, componentName);
    this.clickEditIcon();
    this.verifySaveAsRevisionBtnNotPresent();
    this.clickCancelInEditCmpAfterSavingCmp();
  }

  verifySaveAsRevisionPresentForCmpInCmpLibrary(tableHeader, componentName) {
    nav.openComponentsTab();
    tableHelper.clickOnCell(tableHeader, componentName);
    this.clickEditIcon();
    this.verifySaveAsRevisionBtnPresent();
    this.clickCancelInEditCmpAfterSavingCmp();
  }

  selectErpTypeInEditMode(erpType) {
    cy.get(selectors.editComponent.erpType)
      .select(erpType)
  }

  enterErpStartDate(date) {
    cy.xpath(selectors.editComponent.erpStartDate)
      .clear({force: true})
      .type(date)
      .should('have.value', date)
  }

  enterErpEndDate(date) {
    cy.xpath(selectors.editComponent.erpEndDate)
      .clear({force: true})
      .type(date)
      .should('have.value', date)
  }

  verifyErpToolTipPresent(assertText) {
    cy.xpath(selectors.editComponent.erpToolTip.replace('assertText',assertText))
     .should('exist')
  }

  verifyErpType(erpType) {
    cy.xpath(selectors.viewComponent.erpType)
      .should('have.text', erpType)
  }

  clickOnHighlightedArrowRow(revisionValue) {
    cy.xpath(selectors.viewComponent.highlightedArrowRow.replace('RevisionValue', revisionValue))
      .click();
  }

  verifyErpTilePresent() {
    cy.xpath(selectors.viewComponent.erpTile)
      .should('exist')
  }

  changeCategoryInEditComponent(value) {
    cy.get(selectors.editComponent.chooseCategory)
      .select(value)
  }

  verifyCategoryChangeModal() {
    cy.get(selectors.editComponent.categoryChangeModal)
      .should('contain', 'Category change may result in loss of data.')
  }

  clickContinueInChangeCategoryModal() {
    cy.get(selectors.editComponent.continueBtnInCategoryChangeModal)
      .click({force:true})
  }

  verifyCategoryInViewComponent(category = "") {
    cy.get(selectors.viewComponent.category)
      .should('have.text', category)
  }

  enterErpStartDate(date) {
    cy.xpath(selectors.editComponent.erpStartDate)
      .clear({force: true})
      .type(date)
  }

  enterErpEndDate(date) {
    cy.xpath(selectors.editComponent.erpEndDate)
      .clear({force: true})
      .type(date)
  }

  clickOnHighlightedArrowRow(revisionValue) {
    cy.xpath(selectors.viewComponent.highlightedArrowRow.replace('RevisionValue', revisionValue))
      .click();
  }

  clickOnCompareRevision() {
    cy.xpath(selectors.viewComponent.compareRevision)
      .should('be.visible')
      .click();
  }

  verifyErpStartDate(startDate) {
    const format1 = featureHelpers.changeDateFormat(startDate, 'MMM d, yyyy');
    const format2 = featureHelpers.changeDateFormat(startDate, 'MMM dd, yyyy');
    cy.xpath(selectors.viewComponent.erpStartDate)
      .invoke('text').then((date) => {
        expect([format1, format2]).to.contain(date)
      })
  }

  verifyErpEndDate(endDate) {
    const format1 = featureHelpers.changeDateFormat(endDate, 'MMM d, yyyy');
    const format2 = featureHelpers.changeDateFormat(endDate, 'MMM dd, yyyy');
    cy.xpath(selectors.viewComponent.erpEndDate)
      .invoke('text').then((date) => {
        expect([format1, format2]).to.contain(date)
      })
  }

  verifyContinueBtnVisibleInSaveAsRevisionModal() {
    cy.get(selectors.editComponent.continueBtnInSaveAsRevisionModal)
      .should('be.visible')
  }

  enterDescriptionInEditComponent(cmpDesc) {
    cy.get(selectors.editComponent.compDesc)
      .clear()
      .type(cmpDesc)
  }

  clickChangeOrderIconAfterModifyingCmpInViewCmp() {
    cy.get(selectors.viewComponent.changeOrderIconAfterModifyingCmp)
      .click()
  }

  clickAddToChangeOrderInViewComponent() {
    cy.xpath(selectors.viewComponent.addToChangeOrder)
      .click()
  }

  verifyStatusInViewComponent(status) {
    cy.get(selectors.viewComponent.statusLabel)
      .should('have.text', status)
  }

  verifyTotalNoOfRevisions(noOfRevisions) {
    cy.get(selectors.viewComponent.totalRevisions)
      .its('length').should('eq', noOfRevisions)
  }

  clickOnViewLatestRelease() {
    cy.xpath(selectors.viewComponent.viewLatestRelease)
      .click()
  }

  verifyEditIconInViewComponentNotPresent() {
    cy.xpath(selectors.viewComponent.editIcon)
      .should('not.exist')
  }

  verifyCategoryPresentInDropdown(categoryName) {
    cy.get(selectors.chooseCategory)
      .should('contain.text', categoryName)
  }

  getEditIcon() {
    return cy.xpath( selectors.viewComponent.editIcon)
  }

  getHistoryIcon() {
    return cy.get(selectors.viewComponent.historyIcon)
  }

  getExportIcon() {
    return cy.get(selectors.viewComponent.exportIconInViewPage)
  }

  getDeleteIcon() {
    return cy.get(selectors.viewComponent.deleteIcon)
  }

  getDuplicateIcon() {
    return cy.get(selectors.detailPage.duplicateIcon)
  }

  getFavoriteIcon() {
    return cy.get(selectors.viewComponent.favoriteIcon)
  }

  getWhereUsedIcon() {
    return cy.get(selectors.viewComponent.whereUsedIcon)
  }

  VerifyEditIconNotPresent() {
    cy.xpath(selectors.viewComponent.editIcon)
      .should('not.exist')
  }

  VerifyDuplicateIconNotPresent(){
    cy.get(selectors.detailPage.deleteBtn)
      .should('not.exist')
  }

  verifyDeleteIconNotPresent() {
    cy.get(selectors.viewComponent.deleteIcon)
      .should('not.exist')
  }

  verifyExportIconNotPresent() {
    cy.get(selectors.viewComponent.exportIconInViewPage)
      .should('not.exist')
  }

  verifyFavoriteIconPresent() {
    cy.get(selectors.viewComponent.favoriteIcon)
      .should('exist')
  }

  verifyWhereUsedIconPresent() {
    cy.get(selectors.viewComponent.whereUsedIcon)
      .should('exist')
  }

  verifyHistoryIconPresent() {
    cy.get(selectors.viewComponent.historyIcon)
    .should('exist')
  }

  verifyErrorToolTipPresentInEditView(assertText) {
    cy.xpath(selectors.editComponent.errorToolTip.replace('assertText',assertText))
    .should('exist')
  }

  verifyErrorToolTipNotPresentInEditView(assertText) {
    cy.xpath(selectors.editComponent.errorToolTip.replace('assertText',assertText))
      .should('not.exist')
  }

  verifyCmpLibraryPageVisible() {
    cy.get(selectors.cmpLibraryPage, {timeout:60000})
      .should('be.visible')
  }

  clickExportInCmpLibrary() {
    cy.get(selectors.exportInCmpLibrary)
      .click()
  }

  verifyImportFromVendorModalHeading() {
    cy.get(selectors.vendorPage.importFromVendorModalHeading)
      .should('have.text', 'Import Component from vendor')
  }

  clickOnVariantIcon() {
    cy.xpath(selectors.viewComponent.variantIcon)
      .click()
  }

  clickOnNewVariantIcon() {
    cy.xpath(selectors.viewComponent.newVariantOptn)
      .click()
  }

  verifyComponentNameInViewComponent(name) {
    cy.get(selectors.viewComponent.componentName).should('have.text', name);
  }

  clickOnExportIconInVendorLogin() {
    cy.get(selectors.vendorLogin.exportIcon)
      .click()
  }

  verifyRevisionInSaveAsRevisionModal(rev = "") {
    cy.get(selectors.editComponent.revisionInSaveAsRevisionModal)
      .should('have.attr', 'data-input-value', rev)
  }

  verifyTheNextRevison(expectedRev = "") {
    this.clickEditIcon();
    this.clickSaveAsRevisionBtn();
    this.verifyRevisionInSaveAsRevisionModal(expectedRev);
  }

  navigateToComponentViewPage(componentName = "", compSearch = true, columnName = constData.componentTableHeaders.name) {
    nav.openComponentsTab();
    if(compSearch) this.enterSearchTerm(componentName);
    tableHelper.clickOnCell(columnName, componentName);
    featureHelpers.waitForLoadingIconToDisappear();
  }

  navigateToComponentEditPage(componentName = "", compSearch = true, columnName = constData.componentTableHeaders.name) {
   this.navigateToComponentViewPage(componentName, compSearch, columnName);
   this.clickEditIcon();
  }

  verifyNextChangeOrderRevision(componentName = "", rev = "") {
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelpers.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentName);
    changeOrders.verifyNextRevisionInChangeOrderTable(componentName, rev);
  }

  verifySwitchToRevisionControlModalTitle() {
    cy.get(selectors.switchToRevisionControlModal.title)
      .should('include.text', 'Switch to Revision Control')
  }

  clickOnContinueInRevisionControl() {
    cy.xpath(selectors.switchToRevisionControlModal.continueBtn)
      .click()
      .should('not.exist')
  }

  verifyContinueBtnEnabledInRevisionControlModal() {
    cy.xpath(selectors.switchToRevisionControlModal.continueBtn)
      .should('not.have.attr', 'class', 'disabled')
  }

  verifyContinueBtnDisabledInRevisionControlModal() {
    cy.xpath(selectors.switchToRevisionControlModal.continueBtn)
      .should('have.attr', 'class', 'disabled')
  }

  enterRevisionInRevisionControlModal(rev = "") {
    cy.get(selectors.switchToRevisionControlModal.revisionField)
      .clear()
      .type(rev)
  }

  verifyRevisionTooltipInRevisionControlModal(tooltip = "") {
    cy.get(selectors.switchToRevisionControlModal.revisionField).then(($attr) => {
      if($attr.hasClass('invalid')) {
        cy.get($attr)
          .should('have.attr', 'data-tip', tooltip)
      } else {
        cy.get($attr)
          .should('have.attr', 'data-tip', tooltip)
      }
    })
  }

  verifyMassUnitLabelInViewComponent(label = "") {
    cy.get(selectors.viewComponent.massUnitLabel)
      .should('have.text', label)
  }

  verifyMassValueInViewComponent(value = "") {
    cy.get(selectors.viewComponent.massValue)
      .should('include.text', value)
  }

  enterMassValueInEditComponent(value = "") {
    cy.get(selectors.editComponent.mass)
      .clear().type(value)
  }

  verifyMassFeildTooltip(tooltip = "") {
    cy.get(selectors.editComponent.mass)
      .should('have.attr', 'data-tip', tooltip)
  }

  assertTextInHistoryTable(columnName, rowIndex, assertText) {
    cy.xpath(selectors.revisionHistoryInViewCmp.revisionHistoryTableHeader.replace('TYPE', columnName))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(selectors.revisionHistoryInViewCmp.revisionHistoryTableRow.replace('rowIndex', rowIndex).replace('columnIndex', columnIndex+1))
          .scrollIntoView()
          .trigger('mouseover')
          .should('be.visible')
          .invoke('text')
          .should('be.eq', assertText.toString())
      })
  }

  selectDocTypesInEditView(docName, docType) {
    cy.xpath(selectors.editComponent.docTypesDropdown.replace('docName', docName))
      .select(docType, {force: true})
  }

  uploadAndSelectDocTypeInEditView(document, docType) {
    this.uploadDocumentInEditView(document)
    this.selectDocTypesInEditView(document, docType)
  }

  clickOnAddFromLibraryInVariantTable() {
    cy.get(selectors.viewComponent.addFromLibraryInVariantTable)
      .click()
  }

  verifyAddFromLibraryVariantPrefix(category) {
    cy.get(selectors.viewComponent.addFromLibraryInVariantPrefix)
      .should('have.text', ` cat:${category} `)
  }

  assertVariantsPresentInAddFromLibraryTable(searchRowByText, tableHeaderName="CPN / Name") {
    tableHelper.assertRowPresentInTable(tableHeaderName, searchRowByText, selectors.viewComponent.variantsAddfromLibraryTableHeader)
  }

  assertVariantsNotPresentInAddFromLibraryTable(searchRowByText, tableHeaderName="CPN / Name") {
    tableHelper.assertRowNotPresentInTable(tableHeaderName, searchRowByText, selectors.viewComponent.variantsAddfromLibraryTableHeader)
  }

  verifyExistingVariantInAddFromLibraryTable(cmpName) {
    cy.xpath(selectors.viewComponent.existingVariantInAddFromLibraryTable.replace('name', cmpName))
      .should('have.attr', 'class', ' existing-variants')
  }

  searchVariantsInAddFromLibrarySearchBox(cmpName) {
    cy.xpath(selectors.viewComponent.searchForVariantsAddFromLibrary)
      .clear()
      .type(cmpName)
  }

  verifyErpDetailsInViewComponent(startDate, endDate, itemType) {
    this.verifyErpStartDate(startDate);
    this.verifyErpEndDate(endDate);
    this.verifyErpType(itemType);
  }

  verifyEffectivityNotPresent() {
    cy.xpath(selectors.viewComponent.erpStartDate).should('not.exist');
    cy.xpath(selectors.viewComponent.erpEndDate).should('not.exist');
  }

  verifyItemTypeNotPresent() {
    cy.xpath(selectors.viewComponent.erpType).should('not.exist');
  }

  verifyErpOptionsNotPresent() {
    this.verifyItemTypeNotPresent();
    this.verifyEffectivityNotPresent();
    cy.xpath(selectors.viewComponent.erpTile).should('not.exist');
  }

  verifyErpMessageInViewComponent(message = "*Change Order required to set ERP options") {
    cy.get(selectors.viewComponent.erpMessage)
      .scrollIntoView()
      .should('have.text', message)
  }

  verifyErpMessageInEditComponent(message = "*Change Order required to set ERP options") {
    cy.get(selectors.editComponent.erpMessage)
      .scrollIntoView()
      .should('have.text', message)
  }

  clickOnRevisionInHistoryTable(rev = "", authorName = "") {
    cy.xpath(selectors.viewComponent.selectRevision(rev, authorName))
      .click();
  }

  verifyHistoryTableLoadingIconPresent() {
    cy.get(selectors.viewComponent.historyTableLoadingIcon)
      .should('exist')
  }

  verifyHistoryTableLoadingIconNotPresent() {
    cy.get(selectors.viewComponent.historyTableLoadingIcon)
      .should('not.exist')
  }

  verifySubRevisionLazyLoadingPresent() {
    cy.get(selectors.viewComponent.subRevisionLazyLoading)
      .should('exist')
  }

  verifySubRevisionLazyLoadingNotPresent() {
    cy.get(selectors.viewComponent.subRevisionLazyLoading)
      .should('not.exist')
  }

  clickOnPreviousRevision(index) {
    cy.xpath(selectors.viewComponent.previousRevision.replace('index', index))
      .should('be.visible').wait(3000)
    cy.xpath(selectors.viewComponent.previousRevision.replace('index', index))
      .click({force:true})
  }

  clickOnHistoryIconInCompareRevisionPage() {
    cy.get(selectors.viewComponent.historyIconInCompareRevisionPage)
      .click({force: true})
  }

  verifySubRevisionsNotFetched() {
    cy.get(selectors.viewComponent.revisionHistoryIcon)
      .should('not.have.attr', 'class', 'ui-icon sub-rev-icon open')
  }

  verifySubRevisionsFetched() {
    cy.get(selectors.viewComponent.revisionHistoryIcon)
      .should('have.attr', 'class', 'ui-icon sub-rev-icon open')
  }

  clickOnRevisionInHistoryTable(authorName = "", attr = "", type = "rev") {                     // "attr" represents STATUS or REVISION
    if(type == "rev") cy.xpath(selectors.viewComponent.selectRevision(attr, authorName)).click()
    else cy.xpath(selectors.viewComponent.selectStatus(attr, authorName)).click()
  }

  createComponentsWithTreeStructure(isDesignStatus=false, maxLevel=4) {
    for(let i = 1; i < (maxLevel + 1); i++) {
      const cmpName = `cmp-${i}`;
      let statusValue = "DESIGN";
      let revisionValue = i === 2 ? "1" : "A";
      if(!isDesignStatus && i === 2) statusValue = "PROTOTYPE"
      if(!isDesignStatus && i === 3) statusValue = "PRODUCTION"
      if(!isDesignStatus && i === 4) statusValue = "OBSOLETE"

      nav.openComponentsTab();
      this.clickonCreateManually();
      this.chooseCategory('EBOM');
      this.enterComponentName(cmpName);
      this.selectStatus(statusValue);
      this.enterRevision(revisionValue);
      this.clickOnCreate();
      if(i > 1)
      {
        assembly.clickOnAssemblyTab();
        assembly.clickAddIconInAssemblyTable();
        assembly.verifyAddCmpOptionsModalInAssemblyTable();
        assembly.clickAddFromLibrary();
        assembly.checkComponentFromLibraryThroughIndex();
        assembly.clickAddInAddComponents();
        assembly.closeTheAddComponents();
        featureHelpers.getCpnValueFromTable(`cmp-${i-1}`, 1).then((cpn) => {
          assembly.enterDetailsInAssemblyTable('quantity', i, cpn)
        })
      }
      this.clickSaveButtonInEditComponent();
    }
  }

  removeNameInCreateComponentModal() {
    cy.get(selectors.nameTxtBx)
      .clear()
      .should('have.text', '')
  }

  entercommentInBulkUpdateSaveAsRevisionModal(text) {
    cy.get(selectors.editComponent.commentInBulkUpdateSaveAsRevisionModal)
      .clear()
      .type(text);
  }

  getCpnValueFromEditViewPage() {
    return cy.get(selectors.viewComponent.cpnValue)
      .invoke('text')
  }

  renameComponentNameInEditPage(newName = faker.random.number({min:10, max:999})) {
    featureHelpers.renameTheField(selectors.editComponent.name, newName);
    return cy.get(selectors.editComponent.name).invoke('attr', 'value')
  }

  verifyNewStatusInChangeStatusModel(compData = "", status = "") {
    cy.xpath(selectors.changeStatus.changedStatus(compData, status))
      .should('be.selected')
  }

  verifyCategoryInEditComponent(category = "") {
    cy.xpath(selectors.editComponent.category(category))
      .should('be.selected')
  }

  enterRevisionInDocumentsTab(docName = "", revision = "") {
    cy.xpath(selectors.documentsTab.revision(docName)).clear().type(revision);
  }

  verifyRevisionInDocumentsTab(docName = "", revision = "") {
    cy.xpath(selectors.documentsTab.revision(docName)).should('have.attr', 'value', revision);
  }

  selectStatusInDocumentsTab(docName = "", status = "") {
    cy.xpath(selectors.documentsTab.status(docName)).select(status);
  }

  verifyRevisionTooltipInDocumentsTab(docName = "", tooltip = "") {
    cy.xpath(selectors.documentsTab.revision(docName))
      .should('have.class', 'invalid')
      .should('have.attr', 'data-tip', tooltip)
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)')
  }

  enterEidInComponentEditPage(eid) {
    cy.get(selectors.editComponent.eidValue).clear().type(eid);
  }

  verifyComponentRevisionModifiedIconPresent() {
    cy.get(selectors.viewComponent.revisionValue + " div.modified")
      .should('exist')
  }

  verifyComponentRevisionModifiedIconNotPresent() {
    cy.get(selectors.viewComponent.revisionValue + " div.modified")
      .should('not.exist')
  }

  verifyRevisionInRevisionControlModal(revision = "") {
    cy.get(selectors.switchToRevisionControlModal.revisionField).should('have.attr', 'value', revision);
  }

  verifyDescInCmpViewPage(compDesc) {
    cy.get(selectors.viewComponent.compDesc)
      .should('have.text', compDesc);
  }

  clickOnRevertBackInCmpViewPage() {
    cy.xpath(selectors.viewComponent.revertBack)
      .click()
  }

  clickYesBtnInConfirmRevertChanges() {
    cy.get(selectors.viewComponent.yesBtnInConfirmRevertChanges)
      .click()
  }

  verifyRevisionManagedCheckBoxEnabled(value) {
    cy.get(selectors.editComponent.revisionManagedCheckBox).should('have.attr', 'value', `${value}`);
  }

  verifyEidInViewPage(eid) {
    cy.get(selectors.viewComponent.eidValue).should('have.text', eid);
  }

  verifyMpnAlreadyExistErrorPresent(errorMsg, cpnValue) {
    cy.get(selectors.vendorPage.mpnAlreadyExistError)
      .should('have.text', errorMsg)
    cy.get(selectors.vendorPage.mpnTextField)
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.get(selectors.vendorPage.mpnAlreadyExistCpnValue).invoke('text').then((cpn) => {
      const errorCpn = cpn.split(" ")[0]
      expect(errorCpn).to.eq(cpnValue);
    })
  }
  
  clickExportIconInCmpRevisionPage() {
    cy.get(selectors.viewComponent.exportIconInCmpRevisionPage)
      .click()
  }

  verifyMpnAlreadyExistErrorNotPresent() {
    cy.get(selectors.vendorPage.mpnAlreadyExistError)
      .should('not.exist')
    cy.get(selectors.vendorPage.mpnTextField)
      .should('have.css', 'background-color')
      .and('not.contain', 'rgb(245, 74, 79)');
  }

  clickImportCmpFromVendorToAutoPopulateSKUorMPNinput() {
    cy.get(selectors.vendorPage.importFromVendorModalHeading)
      .click()
  }

  verifyCpnInViewPage(cpn) {
    cy.get(selectors.viewComponent.cpnValue).should('have.text', cpn);
  }

  enterValueInCpnField(cpnValue) {
    featureHelpers.enterText(selectors.editComponent.cpnInputField, cpnValue)
  }

  verifyCpnErrorTooltipInEditCmpPage(assertText) {
    cy.get(selectors.editComponent.cpnErrorToolTip(assertText))
      .invoke('attr', 'data-tip')
      .should('contain', assertText)
  }

  getExtendedCost(text)  {
    cy.get(selectors.viewComponent.extendedCost).should('have.text', text);
  }

  setVariantFieldValue(value) {
    cy.get(selectors.editComponent.variantField).clear({force: true})
    .type(value, {force: true});
  }

  getVariantFieldValue() {
    cy.get(selectors.editComponent.variantField).should('be.visible');
    let variantValue = cy.get(selectors.editComponent.variantField).invoke('attr', ('data-input-value'))
    return variantValue
  }

  verifyUnitOfMeasure(unit) {
    cy.get(selectors.viewComponent.unitOfMeasure)
      .should('include.text', unit);
  }

  verifyDocumentName(rowNo, name) {
    cy.xpath(selectors.documentsTab.name.replace('rowNo', rowNo+1).replace('searchRowByText', name))
      .should('have.text', name)
  }

  clickOnDocumentsTab() {
    cy.get(selectors.documentsTabForCmp)
      .click()
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
    cy.xpath(selectors.viewComponent.selectRevisionRadioBtn.replace('index', index))
      .check({force:true})
  }

  enterCpnVariantInEditComponent(variant) {
    cy.get(selectors.editComponent.cpnVarinatField).clear().type(variant, {force: true, delay: 0})
  }

  verifyCpnVariantInEditComponent(variant) {
    cy.get(selectors.editComponent.cpnVarinatField).should('have.attr', 'value', variant);
  }

  verifyCpnVariantFieldNotExists() {
    cy.get(selectors.editComponent.cpnVarinatField).should('not.exist')
  }

  verifyCpnVariantTooltip(tooltip = "CPN already exists in library.") {
    cy.get(selectors.editComponent.cpnVarinatField).should('have.attr', 'data-tip', tooltip);
  }

  verifyValue(expectedValue) {
    cy.xpath(selectors.editComponent.cpnAndVariantValue)
    .then((actualValue) => {
      expect(actualValue).to.contain(expectedValue);
    });
  }

  verifyEditableCpnTooltip(tooltip = "Value should be of type Cpn") {
    cy.get(selectors.editComponent.editableCpn).should('have.attr', 'data-tip', tooltip);
  }
}
