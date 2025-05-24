import selectors from "../../selectors/changeOrders/changeOrder";
import constData from "../../helpers/pageConstants";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";

const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();

export class ChangeOrders {
  clickOnChangeOrder() {
    cy.get(selectors.changeOrderIcon)
      .should('not.be.disabled')
      .click()
  }

  clickNewBtn() {
    cy.get(selectors.newChangeOrder.newBtn)
      .should('be.visible')
      .click()
  }

  checkComponentCheckBX(componentName){
  //  cy.scrollTo('right')
    cy.xpath(selectors.newChangeOrder.componentCheckBx.replace('componentName', componentName))
      .check();
    cy.xpath(selectors.newChangeOrder.componentCheckBx.replace('componentName', componentName)).then(($ele) => {
      if ($ele.is(':checked')) cy.wrap($ele).should('be.checked');
      else cy.wrap($ele).check().should('be.checked');
    })
   }

   searchCreatedComponent(componentName) {
     cy.get(selectors.newChangeOrder.searchBx)
       .clear()
       .type(componentName, {delay: 0})
   }

  clickEcoIcon() {
    cy.get(selectors.newChangeOrder.ecoIcon)
      .should('not.be.disabled')
      .click({force: true})
  }

  clickAddBtn() {
    cy.get(selectors.newChangeOrder.addBtn)
      .should('not.be.disabled')
      .click()
  }

  enterNameInEcoModal(ecoName) {
    cy.get(selectors.newChangeOrder.nameTxtBx)
      .scrollIntoView()
      .should('be.visible')
      .clear()
      .type(ecoName).should('have.value', ecoName)
  }

  enterDescInEcoModal(ecoDesc) {
    cy.get(selectors.newChangeOrder.descTxtBx)
      .should('be.visible')
      .clear()
      .type(ecoDesc, {delay: 0}).should('have.value', ecoDesc)
  }

  clickOnSubmitForApproval() {
    cy.get(selectors.newChangeOrder.submitForApproval)
      .should('not.be.disabled')
      .click()
  }

  clickApproveBtn() {
    cy.get(selectors.newChangeOrder.approveBtn, {timeout: 120000})
      .should('not.be.disabled')
      .click()
  }

  confirmAprroval() {
    cy.xpath(selectors.newChangeOrder.approvalConfirmationBtn)
      .should('not.be.disabled')
      .click()
  }

  approveNewChangeOrder() {
    this.clickOnSubmitForApproval()
    this.clickApproveBtn()
    this.confirmAprroval()
  }

  assertChangeOrder() {
    cy.get(selectors.newChangeOrder.closedStatusOptnwithApproval)
      .should('be.visible')
    cy.get(selectors.newChangeOrder.approvedStatusOptn)
      .should('be.visible')
    cy.get(selectors.newChangeOrder.approvedDecisionBadge)
      .should('exist')
  }

  waitforUpdateLoadingIconTodisapper() {
    cy.get(selectors.newChangeOrder.updateLoaderHeading).should('have.text','Please wait a moment...')
    cy.wait(3000);
  }

  verifyTextInNewChangeTable(columnName, searchRowByText) {
    const tableHeaderSelector = selectors.newChangeOrder.tableHeader;
    const tableCellSelector = selectors.newChangeOrder.tableCell;
    cy.get(tableHeaderSelector.replace('cpn', columnName))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('index', columnIndex+1))
          .its('length').should('be.gte', 1)
      })
  }

  waitUntilSearchLoadingToDisappear() {
    cy.get(selectors.newChangeOrder.loadingSpinnerOnSearch).should('be.visible')
    cy.get(selectors.newChangeOrder.loadingSpinnerOnSearch).should('not.exist')
  }

  verifyCmpPresentInCoSearchListAfterSearch(cmpName) {
    cy.xpath(selectors.newChangeOrder.cmpOrProductNameInCoSearchList.replace('cmpName', cmpName))
      .should('be.visible')
  }

  searchAndCheckComponentInNewChangeOrder(componentName, searchForComponentsOrProducts = false) {
    cy.get(selectors.newChangeOrder.tableIndex).find('tr').its('length').then(rowLength => {
      if(searchForComponentsOrProducts) {
        this.searchCreatedComponent(componentName)
        this.waitUntilSearchLoadingToDisappear()
      }
      this.verifyCmpPresentInCoSearchListAfterSearch(componentName)
      cy.wait(3000);
      this.checkComponentCheckBX(componentName)
      cy.wait(3000);
      this.clickAddBtn()
      cy.wait(3000);
      cy.get(selectors.newChangeOrder.componentValidationSpinner).should('not.be.visible');
      cy.xpath(`//td//div[text()="${componentName}"]`, { timeout: 80000 }).then(($el) => {
        if ($el.text().includes(componentName)) {
          console.log('New row found with text: ' + componentName)
        } else {
          this.searchAndCheckComponentInNewChangeOrder(componentName)
          cy.get(selectors.newChangeOrder.tableIndex).find('tr').should('have.length', rowLength+1);
        }
      })
      
    })
  }

  clickRejectBtn() {
    cy.get(selectors.newChangeOrder.rejectBtn)
      .should('not.be.disabled')
      .click()
  }

  confirmRejection() {
    cy.xpath(selectors.newChangeOrder.rejectionConfirmationBtn)
      .should('not.be.disabled')
      .click()
  }

  rejectNewChangeOrder() {
    this.clickOnSubmitForApproval()
    this.clickRejectBtn()
    this.confirmRejection()
    featureHelpers.waitForLoadingIconToDisappear()
  }

  assertRejectedChangeOrder() {
    cy.get(selectors.newChangeOrder.openStatusOptn)
      .should('be.visible')
    cy.get(selectors.newChangeOrder.rejectedStatusOptn)  
      .should('be.visible')
    cy.get(selectors.newChangeOrder.rejectedDecisionBadge)
      .should('exist')
  }

  clickOnClose() {
    cy.get(selectors.newChangeOrder.closeBtn)
      .should('not.be.disabled')
      .click()
  }

  confirmClosedStatus() {
    cy.xpath(selectors.newChangeOrder.closeConfirmationBtn)
      .should('not.be.disabled')
      .click()
    cy.get(selectors.newChangeOrder.closedStatusWithRejection)
      .should('be.visible')
  }

  confirmCloseOnModal() {
    cy.xpath(selectors.newChangeOrder.closeConfirmationBtn)
      .should('not.be.disabled')
      .click()
  }

  verifyRejectedBtnAndBadge() {
    cy.get(selectors.newChangeOrder.rejectedStatusOptn)  
      .should('be.visible')
    cy.get(selectors.newChangeOrder.rejectedDecisionBadge)
      .should('exist')
  }

  assertClosedStatus() {
    this.clickOnClose()
    this.confirmClosedStatus()
  }

  clickSaveDraft(){
    cy.get(selectors.newChangeOrder.saveDraftBtn)
      .should('not.be.disabled')
      .click()
  }

  clickOnDelete() {
    cy.get(selectors.newChangeOrder.deleteBtn)
      .should('be.visible')
      .click()
  }

  confirmDelete() {
    cy.xpath(selectors.newChangeOrder.confirmDeleteBtn)
      .should('not.be.disabled')
      .click()
  }

  assertSearchRoute() {
    cy.location().should((loc) => {
       expect(loc.pathname).to.eq('/search')
    })
  }

  assertChangeOrderText() {
    cy.xpath(selectors.newChangeOrder.changeOrderText)
      .should('have.text', 'Change Orders')
  }

  assertChangeOrderNotListed(columnName, searchRowByText) {
    tableHelper.assertRowNotPresentInTable(columnName, searchRowByText)
  }

  clickOnCancel(){
    cy.xpath(selectors.newChangeOrder.cancelBtn)
    .should('not.be.disabled')
    .click()
  }

  clickOnClose() {
    cy.get(selectors.newChangeOrder.closeBtn)
      .should('not.be.disabled')
      .click()
  }

  confirmClose(){
    cy.xpath(selectors.newChangeOrder.closeConfirmationBtn)
      .should('not.be.disabled')
      .click()
  }

  assertNoneBtn(){
    cy.get(selectors.newChangeOrder.noneBtn)
    .should('contain','NONE')
  }

  clickOnShowMoreDescriptionInViewMode() {
    cy.xpath(selectors.newChangeOrder.showMoreBtn)
      .should('be.visible')
      .click()
  }

  verifyShowMoreDescriptionPresent() {
    cy.xpath(selectors.newChangeOrder.showMoreBtn)
    .should('be.visible')
    .should('exist')
  }

  clickOnShowLessDescriptionInViewMode() {
    cy.xpath(selectors.newChangeOrder.showLessBtn)
      .should('be.visible')
      .click()
  }

  removeEcoName() {
    cy.get(selectors.newChangeOrder.nameTxtBx)
      .clear()
      .should('have.text', '')
  }

  verifyNameTooltip(text = '') {
    cy.get(selectors.newChangeOrder.nameTxtBx).then(($attr) => {
      if($attr.hasClass('invalid')) {
        cy.get(selectors.newChangeOrder.nameTxtBx)
          .should('have.css', 'background-color')
          .and('contain', 'rgb(245, 74, 79)');
        cy.get(selectors.newChangeOrder.nameTxtBx)
          .invoke('attr', 'data-tip')
          .should('eq', text)
      } else {
        cy.get(selectors.newChangeOrder.nameTxtBx)
          .should('not.contain', 'rgb(245, 74, 79)')
        cy.get(selectors.newChangeOrder.nameTxtBx)
          .invoke('attr', 'data-tip')
          .should('eq', text)
      }
    })
  }

  verifySaveDraftBtnEnabled() {
    cy.get(selectors.newChangeOrder.saveDraftBtn)
      .should('not.have.class', 'disabled')
  }

  verifySaveDraftBtnDisabled() {
    cy.get(selectors.newChangeOrder.saveDraftBtn)
      .should('have.class', 'disabled')
  }

  verifyDescriptionTooltip(text = '') {
    cy.get(selectors.newChangeOrder.descTxtBx).then(($attr) => {
      if($attr.hasClass('invalid')) {
        cy.get(selectors.newChangeOrder.descTxtBx)
          .should('have.css', 'background-color')
          .and('contain', 'rgb(245, 74, 79)');
        cy.get(selectors.newChangeOrder.descTxtBx)
          .invoke('attr', 'data-tip')
          .should('eq', text)
      } else {
        cy.get(selectors.newChangeOrder.descTxtBx)
          .should('not.contain', 'rgb(245, 74, 79)')
        cy.get(selectors.newChangeOrder.descTxtBx)
          .invoke('attr', 'data-tip')
          .should('eq', text)
      }
    })
  }

  verifyDescriptionInViewMode(desc) {
    cy.get(selectors.newChangeOrder.descriptionBlockInViewMode)
      .should('have.text', desc)
  }

  verifyNameInViewMode(name = '') {
    cy.get(selectors.newChangeOrder.nameInViewMode)
      .should('have.text', name)
  }

  clickEditIcon() {
    cy.get(selectors.newChangeOrder.editIcon)
      .click()
  }

  clickApproverList() {
    cy.xpath(selectors.newChangeOrder.approverListTab)
      .click()
  }

  checkApproverTypeCheckBx(text = "") {
    cy.get(selectors.newChangeOrder.approverType.replace('approverType', text))
      .check()
      .should('be.checked')
  }

  verifyApproverTypeCheckBxChecked(text = "") {
    cy.get(selectors.newChangeOrder.approverType.replace('approverType', text))
      .should('be.checked')
  }

  searchCreatedUser(userName) {
    cy.xpath(selectors.newChangeOrder.searchForApprover)
      .clear({force: true})
      .type(userName)
  }

  clickAddBtnInApprovers() {
    cy.get(selectors.newChangeOrder.addBtnInApprovers)
      .click();
  }

  selectTemplateFromDropdown(templateName, category = constData.changeOrderTemplateType.private) {
    this.enterTemplateNameToSearchInDropdown(templateName)
    cy.xpath(selectors.newChangeOrder.templateDropdown.replace('templateName', templateName).replace('category', category))
      .click({force: true})
  }

  verifyApproverPresentInList(approverName = '') {
    cy.get(selectors.newChangeOrder.approversList)
      .should('contain.text', approverName)
  }

  enterEmailInNotificationList(email = '') {
    cy.get(selectors.newChangeOrder.emailInNotificationList)
      .clear()
      .type(email)
  }

  clickAddEmailBtn() {
    cy.get(selectors.newChangeOrder.addEmailBtn)
      .click()
  }

  checkApproverCheckBX(componentName){
    // cy.scrollTo('right')
    cy.xpath(selectors.newChangeOrder.componentCheckBx.replace('componentName', componentName))
      .check().should('be.checked');
  }

  clickAddBtnFromApproverList() {
    cy.get(selectors.newChangeOrder.addBtnFromApproverList)
      .click()
  }

  searchAndCheckUserInAddApproversToChangeOrder(approverName, email) {
    this.searchCreatedUser(approverName)
    this.checkApproverCheckBX(approverName)
    this.clickAddBtnFromApproverList()
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, approverName, email);
  }

  clickOnSaveTemplateIcon() {
    cy.get(selectors.newChangeOrder.saveTemplateIcon)
      .click({force: true})
    this.verifySaveOrUpdateTemplate()
  }

  verifySaveOrUpdateTemplate() {
    cy.get(selectors.newChangeOrder.saveOrUpdateTemplate)
      .should('be.visible')
  }

  enterTemplateNameInSaveAsNewTemplate(templateName) {
    cy.get(selectors.newChangeOrder.TemplateNameInSaveAsNewTemplate)
      .clear()
      .type(templateName)
  }

  clickOnSaveBtnInSaveOrUpdateTemplateModal() {
    cy.get(selectors.newChangeOrder.saveBtnInSaveOrUpdateTemplateModal)
      .click()
    cy.get(selectors.newChangeOrder.saveBtnInSaveOrUpdateTemplateModal)
      .should('not.exist')
  }

  clickOnTemplateSettingsIcon() {
    cy.get(selectors.newChangeOrder.templateSettings)
      .click({force: true})
    this.verifyManageTemplateModalTitle()
  }

  verifyPrivateTemplateExistInManageTemplateModal(templateName, selector = selectors.newChangeOrder.privateTemplate) {
    cy.xpath(selector.replace('templateName',templateName))
      .scrollIntoView()
      .should('exist')
  }

  verifyTemplatePresentInDropdown(templateName) {
    this.enterTemplateNameToSearchInDropdown(templateName)
    cy.xpath(selectors.newChangeOrder.dropdownTemplate.replace('one user template', templateName))
      .should('contain', templateName)
  }

  verifyTemplateNotPresentInDropdown(templateName) {
    this.enterTemplateNameToSearchInDropdown(templateName)
    cy.xpath(selectors.newChangeOrder.dropdownTemplate.replace('one user template', templateName))
      .should('not.exist', templateName)
  }

  clickOnRemoveInManageTemplatesModal(templateName) {
    cy.xpath(selectors.newChangeOrder.removeInManageTemplatesModal.replace('templateName', templateName))
      .click()
  }

  clickOnDeleteTemplateBtn() {
    cy.get(selectors.newChangeOrder.deleteTemplateBtn)
      .click()
  }

  verifyPrivateTemplateNotExistInManageTemplateModal(templateName, selector = selectors.newChangeOrder.privateTemplate) {
    cy.xpath(selector.replace('templateName',templateName ))
      .should('not.exist')
  }

  clickOnSaveBtnInManageTemplates() {
    cy.xpath(selectors.newChangeOrder.saveBtnInManageTemplates)
      .click()
  }

  clickOnCancelBtnInManageTemplates() {
    cy.get(selectors.newChangeOrder.cancelBtnInManageTemplates)
      .click()
  }

  clickOnDropdownIndicator() {
    //cy.wait(5000);
    cy.get(selectors.newChangeOrder.dropdownIndicator)
      .click({force:true})
  }

  verifyDeleteTemplateModalVisible() {
    cy.get(selectors.newChangeOrder.deleteTemplateModal)
      .should('have.text', 'Delete Template?')
  }

  clickCancelBtnInDeleteTemplateModal() {
    cy.xpath(selectors.newChangeOrder.cancelBtnInDeleteTemplateModal)
      .click()
  }

  checkSelectAllCheckBx() {
    // cy.scrollTo('right') 
    cy.get(selectors.newChangeOrder.selectAllCheckBx)
    .check()
    .should('be.checked')
  }

  verifySaveBtnInSaveOrUpdateTemplateModal() {
    cy.get(selectors.newChangeOrder.saveBtnInSaveOrUpdateTemplateModal)
      .should("have.attr", "class")
      .and("match", /disabled/);
  }

  clearTemplateNameFieldInSaveAsNewTemplate() {
    cy.get(selectors.newChangeOrder.TemplateNameInSaveAsNewTemplate)
      .clear()
  }

  clickOnCancelBtnInEditMode() {
    cy.get(selectors.newChangeOrder.cancelBtnInEditMode)
      .click()
  }

  selectCreatedTemplate(templateName) {
    cy.xpath(selectors.newChangeOrder.dropdownTemplate.replace('one user template', templateName)).first()
      .click();
  }

  navigateToNotificationListTab() {
    cy.xpath(selectors.newChangeOrder.notificationListTab)
      .click();
  }

  searchAndCheckApproverName(approverName) {
    this.searchCreatedUser(approverName)
    this.checkApproverCheckBX(approverName)
    this.clickAddBtnFromApproverList()
  }

  waitForModalToAppear() {
    cy.get(selectors.newChangeOrder.modal)
      .should('exist')
  }

  clickOnDropdownIndicatorInModal() {
    cy.xpath(selectors.newChangeOrder.dropdownIndicatorInModal)
      .click();
  }

  checkAccessibleToAll() {
    cy.get(selectors.newChangeOrder.accessibleToAllCheckBx)
      .check()
      .should('be.checked')
  }

  checkAllApprovers() {
    cy.get(selectors.newChangeOrder.selectAllApprovers)
      .check()
      .should('be.checked')
  }

  selectCreatedTemplate(templateName) {
    cy.xpath(selectors.newChangeOrder.dropdownTemplate.replace('one user template', templateName)).first()
      .click();
  }

  verifyToolTipPresent(assertText) {
    cy.get(selectors.newChangeOrder.TemplateNameInSaveAsNewTemplate).click()
    cy.xpath(selectors.newChangeOrder.toolTip.replace('assertText',assertText))
      .should('exist')
  }

  unCheckAccessibleToAll() {
    cy.get(selectors.newChangeOrder.accessibleToAllCheckBx)
      .uncheck()
      .should('not.be.checked')
  }

  verifyCompanyTemplateExistInManageTemplateModal(templateName, selector = selectors.newChangeOrder.companyTemplate) {
    this.verifyPrivateTemplateExistInManageTemplateModal(templateName, selector)
  }

  verifyCompanyTemplateNotExistInManageTemplateModal(templateName, selector = selectors.newChangeOrder.companyTemplate) {
    this.verifyPrivateTemplateNotExistInManageTemplateModal(templateName, selector)
  }

  addApproverToTemplate(approverName = '') {
    this.searchCreatedUser(approverName);
    this.checkApproverCheckBX(approverName);
    this.clickAddBtnInApprovers();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName)
  }

  clickNotificationListTab() {
    cy.xpath(selectors.newChangeOrder.notificationListTab)
      .click()
  }

  assertOpenStatus() {
    cy.get(selectors.newChangeOrder.openStatusOptn)
      .should('be.visible')
      .should('have.css', 'color')
      .and('contain', 'rgb(154, 204, 255)');
  }

  verifyClosedStatusOptnwithApproval(){
    cy.get(selectors.newChangeOrder.closedStatusOptnwithApproval)
      .should('not.be.disabled')
      .should('have.css', 'color')
      .and('contain', 'rgb(122, 225, 115)');
  }

  verifyClosedStatusOptnwithRejection(){
    cy.get(selectors.newChangeOrder.closedStatusWithRejection)
      .should('not.be.disabled')
      .should('have.css', 'color')
      .and('contain', 'rgb(245, 74, 79)');
  }

  verifyNextRevisionInChangeOrderTable(searchRowByText, assertText, tableCellSelector = selectors.newChangeOrder.nextRevision) {
    cy.xpath(tableCellSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('text')
      .should('be.eq', assertText.toString())
  }

  verifyStatusInChangeOrderTable(searchRowByText, assertText, tableCellSelector = selectors.newChangeOrder.statusValueInChangeOrderTable) { 
    cy.xpath(tableCellSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .should('be.visible')
      .invoke('text')
      .should('be.eq', assertText.toString())
  }

  selectStatusInChangeOrderTable(name, statusVal) { 
    cy.xpath(selectors.viewChangeOrder.statusValue(name).replace('statusName', statusVal))
      .parents('tr')
      .find('select[name="status"]')
      .select(statusVal);
  }
  
  clickOnRevisionActionIcon() {
    cy.get(selectors.newChangeOrder.revisionActionIcon)
      .click({force:true})
  }

  checkMajorRevisionType() {
    cy.get(selectors.newChangeOrder.majorRevisionType)
      .check({force: true})
      .should('be.checked')
  }

  checkMinorRevisionType() {
    cy.get(selectors.newChangeOrder.minorRevisionType)
      .check({force: true})
      .should('be.checked')
  }

  checkCustomRevisionType() {
    cy.get(selectors.newChangeOrder.customRevisionType)
      .check({force: true})
      .should('be.checked')
  }

  clickApplyBtnInChangeRevisionModal() {
    cy.xpath(selectors.newChangeOrder.applyBtnInChangeRevisionModal)
      .click({force: true})
      .should('not.exist')
  }

  enterCustomRevision(revision) {
    cy.get(selectors.newChangeOrder.customRevision)
      .scrollIntoView()
      .clear({force: true})
      .type(revision)
  }

  verifyErrorIconInChangeOrderTable(searchRowByText, tableRowSelector = selectors.newChangeOrder.changeOrderTableRow, tableIndexesSelector = selectors.newChangeOrder.changeOrderTableIndexes) {
    cy.xpath(tableRowSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(tableIndexesSelector.replace('indexValue', columnIndex))
          .scrollIntoView()
          .should('have.attr', 'class', 'ui-icon error-alert-icon')
      })
  }

  clearCustomRevision() {
    cy.get(selectors.newChangeOrder.customRevision)
      .clear({force: true})
  }

  verifyCustomRevisionTooltipPresent(tooltip = "") {
    cy.get(selectors.newChangeOrder.customRevisionTooltipInCoTable)
      .should('have.text', tooltip)
    cy.get(selectors.newChangeOrder.customRevision)
      .should('have.attr', 'class', 'custom-rev-input invalid ')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
  }

  verifyApplyBtnDisabled() {
    cy.xpath(selectors.newChangeOrder.applyBtnInChangeRevisionModal)
      .should('have.class', 'apply-btn fill disabled')
  }

  enterTemplateNameToSearchInDropdown(templateName) {
    cy.get(selectors.newChangeOrder.searchTemplate)
      .clear({force: true})
      .type(templateName)
  }

  verifyManageTemplateModalTitle() {
    cy.get(selectors.newChangeOrder.manageTemplateModalTitle)
      .should('have.text', 'MANAGE TEMPLATES')
  }

  verifyTemplatePresentInDropdownInSaveOrUpdateModal(templateName) {
    cy.xpath(selectors.newChangeOrder.dropdownTemplate.replace('one user template', templateName))
      .should('contain', templateName)
  }

  addCommentInConfirmDecisionCoModal(comment) {
    cy.get(selectors.newChangeOrder.commentInConfirmDecisionCoModal)
      .clear()
      .type(comment, {delay: 0})
  }

  verifyRejectBtnDisabledInConfirmRejectionModal() {
    cy.xpath(selectors.newChangeOrder.rejectionConfirmationBtn)
      .should('have.attr', 'class', 'danger action-button-disabled')
  }

  verifyApproveBtnDisabledInConfirmApprovalModal() {
    cy.xpath(selectors.newChangeOrder.approvalConfirmationBtn)
      .should('have.attr', 'class', 'filled action-button-disabled')
  }

  verifyCloseBtnDisabledInConfirmCloseModal() {
    cy.xpath(selectors.newChangeOrder.closeConfirmationBtn)
      .should('have.attr', 'class', 'filled action-button-disabled')
  }

  verifyRejectBtnEnabledInConfirmRejectionModal() {
    cy.xpath(selectors.newChangeOrder.rejectionConfirmationBtn)
      .should('have.attr', 'class', 'danger ')
      .should('not.have.attr', 'class', 'danger action-button-disabled')
  }

  verifyApproveBtnEnabledInConfirmApprovalModal() {
    cy.xpath(selectors.newChangeOrder.approvalConfirmationBtn)
      .should('have.attr', 'class', 'filled ')
      .should('not.have.attr', 'class', 'filled action-button-disabled')
  }

  verifyCloseBtnEnabledInConfirmCloseModal() {
    cy.xpath(selectors.newChangeOrder.closeConfirmationBtn)
      .should('have.attr', 'class', 'filled ')
      .should('not.have.attr', 'class', 'filled action-button-disabled')
  }

  clickOnResendChangeOrderIcon() {
    cy.get(selectors.viewChangeOrder.resendChangeOrderIcon)
      .click()
  }

  checkApproverCheckBoxInResendCoModal() {
    cy.get(selectors.resendChangeOrderModal.approverCheckBox)
      .check()
  }

  checkNotifierCheckBoxInResendCoModal() {
    cy.get(selectors.resendChangeOrderModal.notifierCheckBox)
      .check()
  }

  enterCcEmailInResendChangeOrderModal(email = "") {
    cy.xpath(selectors.resendChangeOrderModal.ccMailTxtBx)
      .clear()
      .type(email)
  }

  clickOnAddBtnForCcMailInResendCoModal() {
    cy.get(selectors.resendChangeOrderModal.addBtnForCcMail)
      .click()
  }

  clickOnResendBtnInChangeOrderModal() {
    cy.xpath(selectors.resendChangeOrderModal.resendBtn)
      .click()
  }

  clickCrossBtnInPrepareCOMailModal() {
    cy.get(selectors.resendChangeOrderModal.crossBtnInPrepareCOMailModal)
      .click()
  }

  addNotifiersToTemplate(approverName = '') {
    this.searchCreatedUser(approverName);
    this.checkApproverCheckBX(approverName);
    this.clickAddBtnInApprovers();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName)
  }

  verifyCcEmailInResendChangeOrderModal(email) {
    cy.xpath(selectors.resendChangeOrderModal.verifyCcEmail.replace('email', email))
      .should('exist')
  }

  verifyMailSentModalInResendCo() {
    cy.get(selectors.resendChangeOrderModal.mailSentModal)
      .should('be.visible')
  }

  getChangeOrderNameAfterResendCo() {
    return cy.xpath(selectors.viewChangeOrder.changeOrderName)
      .invoke('text')
  }

  clickOnHistoryTabInViewChangeOrder() {
    cy.xpath(selectors.viewChangeOrder.history)
      .should('be.visible')
      .click()
  }

  verifyApproverListPagePresent() {
    cy.xpath(selectors.newChangeOrder.approverListPage)
      .scrollIntoView()
      .should('be.visible')
  }

  verifyNotificationListPagePresent() {
    cy.xpath(selectors.newChangeOrder.notificationListPage)
      .scrollIntoView()
      .should('be.visible')
  }

  verifySaveOrUpdateTemplateModalNotPresent() {
    cy.get(selectors.newChangeOrder.saveOrUpdateTemplate)
      .should('not.exist')
  }

  clickOnRemoveIconInResendChangeOrderModal() {
    cy.xpath(selectors.resendChangeOrderModal.removeIconInResendEcoModal).first()
    .click()
  }

  verifyResendChangeOrderModalTitle() {
    cy.get(selectors.resendChangeOrderModal.resendChangeOrderModalTitle)
      .should('have.text', 'Resend Change Order?').and('be.visible')
  }

  verifyAnonymousEmailInResendChangeOrderModal(email) {
    cy.xpath(selectors.resendChangeOrderModal.verifyCcEmail.replace('email', email))
      .should('exist')
  }

  verifyTextInCcEmailInResendChangeOrderModal(email) {
    cy.xpath(selectors.resendChangeOrderModal.ccMailTxtBx)
      .should('have.text', email)
  }

  clickOnCancelBtnInResendChangeOrderModal() {
    cy.xpath(selectors.resendChangeOrderModal.cancelBtn)
      .click()
  }

  verifyUserPresentInResendChangeOrderModal(userName) {
    cy.xpath(selectors.resendChangeOrderModal.user.replace('userName', userName))
      .should('exist')
  }

  clickOnAddBtnForCcMailInResendCoModal() {
    cy.get(selectors.resendChangeOrderModal.addBtnForCcMail)
      .click()
  }

  clickOnEditInViewChangeOrder() {
    cy.get(selectors.viewChangeOrder.editBtn)
      .click()
  }

  clickOnDeleteInViewChangeOrder() {
    cy.get(selectors.viewChangeOrder.deleteBtn)
      .click()
  }

  verifyNoOfRowsPresentInChangeOrderTable(rowLength) {
    cy.get(selectors.newChangeOrder.tableIndex)
      .find("tr")
      .then((row) => {
        expect((row.length)-1).to.be.equal(rowLength)
      });
  }

  verifySaveDraftIsDisabled(){
    cy.get(selectors.newChangeOrder.saveDraftBtn)
      .should('have.class', 'disabled')
  }

  verifySaveDraftIsEnabled(){
    cy.get(selectors.newChangeOrder.saveDraftBtn)
      .should('not.be.disabled')
  }

  verifySubmitForApprovalIsDisabled() {
    cy.get(selectors.newChangeOrder.submitForApproval)
      .should('have.class', 'disabled')
  }

  verifySubmitForApprovalIsEnabled() {
    cy.get(selectors.newChangeOrder.submitForApproval)
      .should('not.be.disabled')
  }

  verifyEditBtnInViewChangeOrder() {
    cy.get(selectors.viewChangeOrder.editBtn)
      .should('be.visible')
  }

  verifyDeleteBtnInViewChangeOrder() {
    cy.get(selectors.newChangeOrder.deleteBtn)
      .should('be.visible')
  }

  verifyPreviousRevisionInChangeOrderTable(searchRowByText, assertText, tableCellSelector = selectors.newChangeOrder.previousRevision) {
    cy.xpath(tableCellSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('text')
      .should('be.eq', assertText.toString())
  }

  verifySelectedStatusInChangeOrderTable(searchRowByText, assertText, statusName, tableCellSelector = selectors.selectedStatusValueInChangeOrderTable) { 
    cy.xpath(tableCellSelector.replace('name', searchRowByText).replace('statusName', statusName))
      .scrollIntoView()
      .invoke('text')
      .should('be.eq', assertText.toString())
  }

  clickOkBtn() {
    cy.get(selectors.newChangeOrder.okBtnInModal)
      .click();
  }

  assertApproverRemoveIconPresent(searchRowByText) {
    cy.get(selectors.approverList.approverTableRemoveIconHeader)
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(selectors.approverList.approverRemoveIcon.replace('name', searchRowByText).replace('index', columnIndex + 1))
          .should('exist')
      })
  }

  assertApproverRemoveIconNotPresent(searchRowByText) {
    cy.get(selectors.approverList.approverTableRemoveIconHeader)
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(selectors.approverList.approverRemoveIcon.replace('name', searchRowByText).replace('index', columnIndex + 1))
          .should('not.exist')
      })
  }

  assertNotifierRemoveIconPresent(searchRowByText) {
    cy.get(selectors.notifierList.notifierTableRemoveIconHeader)
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(selectors.notifierList.notifierRemoveIcon.replace('name', searchRowByText).replace('index', columnIndex + 1))
          .should('exist')
      })
  }

  assertNotifierRemoveIconNotPresent(searchRowByText) {
    cy.get(selectors.notifierList.notifierTableRemoveIconHeader)
      .scrollIntoView()
      .trigger('mouseover')
      .should('be.visible')
      .invoke('index').then((columnIndex) => {
        cy.xpath(selectors.notifierList.notifierRemoveIcon.replace('name', searchRowByText).replace('index', columnIndex + 1))
          .should('not.exist')
      })
  }

  clickMcoIcon() {
    cy.get(selectors.newChangeOrder.mcoIcon)
      .should('not.be.disabled')
      .click({force: true})
  }

  clickDcoIcon() {
    cy.get(selectors.newChangeOrder.dcoIcon)
      .should('not.be.disabled')
      .click({force: true})
  }

  clickOkBtnInDcoWarningModal() {
    cy.get(selectors.newChangeOrder.okBtnInDcoWarningModal)
      .click()
  }

  verifySelectedTemplateForNewCo(templateName) {
    cy.get(selectors.newChangeOrder.selectedTemplate)
      .should('have.text', templateName)
  }

  clickOnProductsAndComponentsTab() {
    cy.get(selectors.newChangeOrder.productsAndComponentsTab)
      .click()
  }

  removeProductOrComponentFromNewCo(searchRowByText, tableCellSelector = selectors.newChangeOrder.removeIconInNewCoForProdOrCmp) { 
    cy.xpath(tableCellSelector.replace('name', searchRowByText))
      .scrollIntoView()
      .should('be.visible')
      .click({force:true})
  }

  assertDraftStatus() {
    cy.get(selectors.newChangeOrder.draftStatusOptn)
      .should('be.visible')
      .should('have.css', 'color')
      .and('contain', 'rgb(255, 253, 145)'); 
  }

  verifyMandatoryTemplateInfoModal(coType, status, template) {
    cy.get(selectors.newChangeOrder.mandatoryTemplateModalHeading)
      .should('contain', 'Mandatory Approver Template Added')
    cy.get(selectors.newChangeOrder.mandatoryTemplateModalContent)
      .find('li')
      .contains(coType)
      .invoke('text').then((text)=>{
        expect(text).to.equal(` Change Order Type: ${coType}`);
      })
    cy.get(selectors.newChangeOrder.mandatoryTemplateModalContent)
      .find('li')
      .contains(status)
      .invoke('text').then((text)=>{
        expect(text).to.equal(` Status: ${status} `);
      })
    cy.get(selectors.newChangeOrder.mandatoryTemplateModalContent)
      .find('li')
      .contains(template)
      .invoke('text').then((text)=>{
        expect(text).to.equal(` Approver Template: ${template} `);
      })
  }

  clickOnGotItBtnInMandatoryApproverTemplateModal() {
    cy.get(selectors.newChangeOrder.gotItBtnInmandatoryTemplateModal)
      .click()
  }

  verifyApproversAndRemoveIcon(userName) {
    this.clickApproverList();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    this.assertApproverRemoveIconPresent(userName);
  }

  verifyMandatoryTemplateToast(heading, templateName) {
    cy.get(selectors.newChangeOrder.mandatoryTemplateToastHeading)
      .should('have.text', heading);
    cy.get(selectors.newChangeOrder.mandatoryTemplateToastTemplateName)
      .find('div')
      .contains(templateName)
      .invoke('text').then((text)=>{
        const toastText = text;
        expect(toastText).to.equal(templateName);
      })
  }

  verifyMandatoryTemplateRemoveIconDisabledAndDataTip(templateName) {
    const dataTip = 'This template cannot be deleted. It is being used as a Mandatory Approver Template.'
    cy.xpath(selectors.newChangeOrder.removeIconForTemplate.replace('name', templateName))
      .should('have.attr', 'class', 'ui-icon remove-template disabled')
    cy.xpath(selectors.newChangeOrder.removeIconForTemplate.replace('name', templateName))
      .should('have.attr', 'data-tip', dataTip)
  }

  verifyTemplateRemoveIconEnbled(templateName) {
    cy.xpath(selectors.newChangeOrder.removeIconForTemplate.replace('name', templateName))
      .should('have.attr', 'class', 'ui-icon remove-template ')
  }

  verifyConfirmApproveBtnTooltip(tooltip, selector = selectors.newChangeOrder.approvalConfirmationBtn) {
    cy.xpath(selector)
      .should('have.attr', 'data-tip', tooltip)
  }

  verifyConfirmRejectBtnTooltip(tooltip) {
    this.verifyConfirmApproveBtnTooltip(tooltip, selectors.newChangeOrder.rejectionConfirmationBtn)
  }

  verifyConfirmCloseBtnTooltip(tooltip) {
    this.verifyConfirmApproveBtnTooltip(tooltip, selectors.newChangeOrder.closeConfirmationBtn)
  }

  verifyApproveButtonNotPresent() {
    cy.get(selectors.newChangeOrder.approveBtn)
      .should('not.exist')
  }

  verifyRejectButtonNotPresent() {
    cy.get(selectors.newChangeOrder.rejectBtn)
      .should('not.exist')
  }

  verifyCloseButtonPresent() {
    cy.get(selectors.newChangeOrder.closeBtn)
      .should('exist')
  }

  verifyUserPresentInApproverTable(userName) {
    tableHelper.assertRowPresentInTable(constData.changeOrderTableHeaders.users, userName);
  }

  verifyUserNotPresentInApproverTable(userName) {
    tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, userName);
  }

  verifyCheckBoxDisabled(userName) {
    cy.xpath(selectors.newChangeOrder.componentCheckBx.replace('componentName', userName))
      .should('be.disabled')
  }

  verifySubmitForApprovalBtnDisabled() {
    cy.get(selectors.newChangeOrder.submitForApproval)
      .should('have.class', 'disabled')
  }

  verifyProductOrComponentPresentInList(name = "") {
    cy.get(selectors.newChangeOrder.productsAndComponentsList)
      .should('contain.text', name)
  }

  verifyProductOrComponentNotPresentInList(name = "") {
    cy.get(selectors.newChangeOrder.productsAndComponentsList)
      .should('not.contain.text', name)
  }

  verifyConfirmDecisionModalSubHeading(subHeading) {
    cy.get(selectors.newChangeOrder.modalSubHeading)
      .should('have.text', subHeading)
  }

  clickCancelBtnInConfirmDecisionModal() {
    cy.xpath(selectors.newChangeOrder.cancelBtnInConfirmDescisionModal)
      .click()
  }

  clickOnUpdateStatusIcon() {
    cy.get(selectors.newChangeOrder.updateStatusIcon)
      .click()
  }

  selectBulkStatusInChangeStatusModal(status = "") {
    cy.get(selectors.changeStatus.bulkStatus)
      .select(status)
  }

  enterBulkRevisionInChangeStatusModal(rev = "") {
    cy.get(selectors.changeStatus.bulkRevision)
      .clear()
      .type(rev)
  }

  clickApplyBtnInChangeStatusModal() {
    cy.xpath(selectors.changeStatus.applyBtn)
      .click()
  }

  clickContinueBtnInChangeStatusModal() {
    cy.xpath(selectors.changeStatus.continueBtn)
      .click()
  }

  verifyCurrentStatusInChangeStatusModal(cmpName = "", status = "") {
    cy.xpath(selectors.changeStatus.currentStatus.replace('cmpName', cmpName).replace('STATUS', status))
      .should('exist')
  }

  verifyNewStatusInChangeStatusModal(cmpName = "", status = "") {
    cy.xpath(selectors.changeStatus.newStatus.replace('cmpName', cmpName).replace('STATUS', status))
      .should('exist')
  }

  verifyCurrentRevisionInChangeStatusModal(cmpName = "", rev = "") {
    cy.xpath(selectors.changeStatus.currentRevision.replace('cmpName', cmpName))
      .should('have.text', rev)
  }

  verifyNewRevisionInChangeStatusModal(cmpName = "", rev = "") {
    cy.xpath(selectors.changeStatus.newRevision.replace('cmpName', cmpName))
      .should('have.attr','data-input-value', rev)
  }

  verifyLastReleasedRevisionInChangeOrderTable(cmpName = "", rev = "") {
    cy.xpath(selectors.changeOrderTable.lastReleaseRevision.replace('cmpName', cmpName))
      .should('have.text', rev)
  }

  verifyNewRevisionInChangeOrderTable(cmpName = "", rev = "") {
    cy.xpath(selectors.changeOrderTable.newRevision.replace('cmpName', cmpName).replace('REV', rev))
      .should('exist')
  }

  verifyLastReleasedStatusInChangeOrderTable(cmpName = "", status = "") {
    cy.xpath(selectors.changeOrderTable.lastReleaseStatus.replace('cmpName', cmpName))
      .should('have.text', status)
  }

  verifyNewStatusInChangeOrderTable(cmpName = "", status = "") {
    cy.xpath(selectors.changeOrderTable.newStatus.replace('cmpName', cmpName).replace('STATUS', status))
      .should('exist')
  }

  checkComponentsInChangeOrderTable(cmpName = "") {
    cy.xpath(selectors.newChangeOrder.changeOrderTableRow.replace('name', cmpName))
      .invoke('index').then((cmpIndex) => {
        cy.xpath(selectors.newChangeOrder.changeOrderTableIndex.replace('1', cmpIndex))
          .find('input')
          .check({force: true})
      })
  }

  verifyErrorMsgInChangeOrderTable(cmpName, errorMsg) {
    cy.xpath(selectors.newChangeOrder.changeOrderTableRow.replace('name', cmpName))
      .invoke('index').then((cmpIndex) => {
        cy.xpath(selectors.newChangeOrder.changeOrderTableIndex.replace('1', cmpIndex))
          .find('div')
          .should('have.attr', 'data-tip', errorMsg)
      })
  }

  verifyChildrenCountInViewCo(length) {
    cy.get(selectors.viewChangeOrder.noOfChildren)
      .should('have.length', length)
  }

  verifyApproveButtonPresent() {
    cy.get(selectors.newChangeOrder.approveBtn)
      .should('exist')
  }

  verifyRejectButtonPresent() {
    cy.get(selectors.newChangeOrder.rejectBtn)
      .should('exist')
  }

  verifyCloseButtonNotPresent() {
    cy.get(selectors.newChangeOrder.closeBtn)
      .should('not.exist')
  }

  verifyNewRevisionInChangeStatusModalBeforeUpdate(cmpName = "", rev = "") {
    cy.xpath(selectors.changeStatus.newRevisionBeforeUpdate(cmpName))
      .should('have.text', rev)
  }

  checkSelectAllCheckboxInAssemblyTable() {
    cy.get(selectors.newChangeOrder.selectAllCheckBxInAssemblyTable)
      .check().should('be.checked');
  }

  clickResetBtnInChangeStatusModal() {
    cy.xpath(selectors.newChangeOrder.resetBtn).click();
  }

  clickRecheckForComponent(cmpName) {
    cy.xpath(selectors.newChangeOrder.changeOrderTableRow.replace('name', cmpName))
      .invoke('index').then((cmpIndex) => {
        cy.xpath(selectors.newChangeOrder.changeOrderTableIndex.replace('1', cmpIndex))
          .trigger('mouseover')
        cy.contains('Recheck').click()
      })
  }

  getCpnValueFromAssemblyLibrary(index = 1) {
    return cy.get(selectors.newChangeOrder.assemblyLibraryCpn).eq(index-1).invoke('text')
  }

  getLastReleaseStatusFromCoTable(cmpName) {
    return cy.xpath(selectors.changeOrderTable.lastReleaseStatus.replace('cmpName', cmpName)).invoke('text')
  }

  getLastReleaseRevisionFromCoTable(cmpName) {
    return cy.xpath(selectors.changeOrderTable.lastReleaseRevision.replace('cmpName', cmpName)).invoke('text')
  }

  checkIncludeChildrenComponents() {
    cy.get(selectors.newChangeOrder.includeChildrenComponentsCheckBox)
      .check()
      .should('be.checked')
  }

  verifyCmpOrProductPresentInCoTable(searchRowByText) { 
    this.verifyStatusInChangeOrderTable(searchRowByText, searchRowByText, selectors.newChangeOrder.cmpOrProductNameInCoTable);
  }

  verifyCpnInViewChangeOrder(compOrProdName, CPN) {
    if(CPN) cy.xpath(selectors.viewChangeOrder.table_CPN(compOrProdName)).should('have.text', CPN);
    else return cy.xpath(selectors.viewChangeOrder.table_CPN(compOrProdName)).invoke('text');
  }
}
