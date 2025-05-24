/// <reference types="cypress" />
import { FeatureHelpers } from "../../helpers/featureHelper";
import selectors from "../../selectors/accountSettings/users";

const featureHelpers = new FeatureHelpers();
const testData = require("../../../fixtures/table_index.json");

export class Users {
  enterFirstName(firstName) {
    cy.get(selectors.firstNameTxtBx).type(firstName).should('have.value', firstName);
  }

  enterLastName(lastName) {
    cy.get(selectors.lastNameTxtBx).type(lastName).should('have.value', lastName);
  }

  enterEmail(email){
    cy.get(selectors.emailTxtBx).clear().type(email, {delay: 0}).should('have.value', email);
  }

  enterJobTitle(jobTitle){
    cy.get(selectors.jobTitleTxtBx).type(jobTitle).should('have.value', jobTitle);
  }

  selectTheRole(role){
    cy.get(selectors.roleDrpDwn).select(role);
  }

  checkTheGroup(groupName){
    cy.get(selectors.groupCheckbox.replace("groupName", groupName)).check().should('be.checked');
  }

  clickOnSave(){
    cy.get(selectors.saveBtn).click();
  }

  clickOnNew(){
    cy.get(selectors.newBtn).click();
  }

  verifyUsersTable(fullName, email, role, jobTitle, groupName, lastSession){
    cy.xpath(selectors.tableCell.replace('email', email).replace('index', testData["users"]["full name"]))
      .should('have.text', fullName);
    cy.xpath(selectors.tableCell.replace('email', email).replace('index', testData["users"]["email"]))
      .should('have.text', email);
    cy.xpath(selectors.tableCell.replace('email', email).replace('index', testData["users"]["role"]))
      .should('have.text', role);
    cy.xpath(selectors.tableCell.replace('email', email).replace('index', testData["users"]["groups"]))
      .should('have.text', groupName);
    cy.xpath(selectors.tableCell.replace('email', email).replace('index', testData["users"]["job title"]))
      .should('have.text', jobTitle);
    cy.xpath(selectors.tableCell.replace('email', email).replace('index', testData["users"]["last session"]))
      .should('have.text', lastSession);    
  }

  deleteTheUserFromTable(email){
    this.clickOnDeleteUser(email);
    this.verifyDeleteModalContent(email);
    this.clickOnYes();
  }

  clickOnDeleteUser(email){
    cy.xpath(selectors.tableCell.replace('email', email)
    .replace('index', testData["users"]["last session"])+'//div[contains(@class,"action-popover-trigger")]').then(($button) =>{
      const className = $button.attr('class');
      cy.xpath(selectors.deleteUser.replace("itemId", className.split(' ')[1])).click({force: true});
    })
  }

  verifyDeleteModalContent(email){
    cy.get(selectors.modalTitle).should('have.text', 'Delete this user?');
    cy.get(selectors.modalContent).should('have.text', email);
  }

  clickOnYes(){
    cy.get(selectors.yesBtn).click();
  }

  verifyUserNotPresent(email){
    cy.xpath(selectors.tableCell.replace('email', email)
      .replace('index', testData["users"]["email"])).should('not.exist')
  }

  createUser(firstName, lastName, email, jobTitle, role, groupName){
    this.clickOnNew();
    this.enterFirstName(firstName);
    this.enterLastName(lastName);
    this.enterJobTitle(jobTitle);
    this.enterEmail(email);
    this.selectTheRole(role);
    this.checkTheGroup(groupName);
    this.clickOnSave();
  }

  verifyFirstNameIsReadOnly() {
    cy.get(selectors.firstNameTxtBx)
      .should('have.class', 'disabled')
  }

  verifyLastNameIsReadOnly() {
    cy.get(selectors.lastNameTxtBx)
      .should('have.class', 'disabled')
  }

  verifyEmailIsReadOnly() {
    cy.get(selectors.emailTxtBx)
      .should('have.class', 'disabled')
  }

  verifyRoleIsReadOnly() {
    cy.get(selectors.roleDrpDwn)
      .should('have.class', 'disabled')
  }

  verifyJobTitleIsReadOnly() {
    cy.get(selectors.jobTitleTxtBx)
      .should('have.class', 'disabled')
  }

  verifyGroupReadOnly(groupName) {
    cy.get(selectors.groupCheckbox.replace('groupName', groupName))
      .should('have.class', 'disabled')
  }

  navigateToGroups() {
    cy.xpath(selectors.groupsTab)
      .click()
  }

  verifyAddUserForQaEnabledInGroups() {
    cy.xpath(selectors.groups.addUserOptionForQa)
      .should('be.visible')
  }

  verifyCompanyNameReadOnlyInCompanyProfile() {
    cy.get(selectors.companyProfile.companyName)
      .should('have.attr', 'readonly')
  }

  verifyCompanyWebsiteReadOnlyInCompanyProfile() {
    cy.get(selectors.companyProfile.companyWebsite)
      .should('have.attr', 'readonly')
  }

  verifyAddressStreetReadOnlyInCompanyProfile() {
    cy.get(selectors.companyProfile.addressStreet)
      .should('have.attr', 'readonly')
  }

  verifyAddressSuiteReadOnlyInCompanyProfile() {
    cy.get(selectors.companyProfile.addressSuite)
      .should('have.attr', 'readonly')
  }

  verifyCityReadOnlyInCompanyProfile() {
    cy.get(selectors.companyProfile.city)
      .should('have.attr', 'readonly')
  }

  verifyStateDisabledInCompanyProfile() {
    cy.get(selectors.companyProfile.state)
      .should('have.attr', 'class', ' disabled')
  }

  verifyZipCodeReadOnlyInCompanyProfile() {
    cy.get(selectors.companyProfile.zipCode)
      .should('have.attr', 'readonly')
  }

  verifyCountryReadOnlyInCompanyProfile() {
    cy.xpath(selectors.companyProfile.country)
      .should('have.attr', 'readonly')
  }

  verifyCancelBtnDisabledInCompanyProfile() {
    cy.get(selectors.companyProfile.cancelBtn)
      .should('have.attr', 'class', 'cancel-btn disabled')
  }

  verifySaveBtnDisabledInCompanyProfile() {
    cy.get(selectors.companyProfile.saveBtn)
      .should('have.attr', 'class', 'submit-btn disabled')
  }

  clickAddUserForQaInGroups() {
    cy.xpath(selectors.groups.addUserOptionForQa)
      .click();
  }

  enterFirstNameInAddUserTxtBx(enterFirstName) {
    cy.xpath(selectors.addUserTxtBx)
      .type(enterFirstName)
      .click();
  }

  checkAddUserCheckBx() {
    cy.xpath(selectors.checkBx)
      .check()
      .should('be.checked')
  }

  clickAddUsersBtnInModal() {
    cy.xpath(selectors.addUsersBtnInModal)
      .click()
  }

  verifySaveBtnDisabled() {
    cy.get(selectors.saveBtn)
      .should('have.attr', 'class', 'disabled')
  }

  verifyNoOfRowsPresentInUsersTable(rowLength) {
    cy.get(selectors.noOfRowsInUsersTable)
      .find("tr")
      .then((row) => {
        expect((row.length)-1).to.be.equal(rowLength)
      });
  }

  clickOnRemoveUser() {
    cy.get(selectors.removeUsers).first()
      .click();
  }

  verifyCompanyNameInCompanyProfileIsEditable() {
    cy.get(selectors.companyProfile.companyName)
      .should('not.have.attr', 'readonly')
  }

  verifyCompanyWebsiteInCompanyProfileIsEditable() {
    cy.get(selectors.companyProfile.companyWebsite)
      .should('not.have.attr', 'readonly')
  }

  verifyAddressStreetInCompanyProfileIsEditable() {
    cy.get(selectors.companyProfile.addressStreet)
      .should('not.have.attr', 'readonly')
  }

  verifyAddressSuiteInCompanyProfileIsEditable() {
    cy.get(selectors.companyProfile.addressSuite)
      .should('not.have.attr', 'readonly')
  }

  verifyCityInCompanyProfileIsEditable() {
    cy.get(selectors.companyProfile.city)
      .should('not.have.attr', 'readonly')
  }

  verifyStateInCompanyProfileIsEditable() {
    cy.get(selectors.companyProfile.state)
      .should('not.have.attr', 'class', ' disabled')
  }

  verifyZipCodeInCompanyProfileIsEditable() {
    cy.get(selectors.companyProfile.zipCode)
      .should('not.have.attr', 'readonly')
  }

  verifyAddUserNotPresentInGroups() {
    cy.xpath(selectors.groups.addUserOptionForQa)
      .should('not.exist')
  }

  VerifyNewBtnNotPresentInUsersPage(){
    cy.get(selectors.newBtn)
      .should('not.exist');
  }

  verifyFieldErrorTooltipPresent(tooltip, selector) {
    cy.get(selector)
      .trigger('mouseover')
      .should('have.attr', 'class', 'invalid')
      .should('have.css', 'background-color')
      .and('contain', 'rgb(245, 74, 79)');
    cy.xpath(selectors.titleTooltip.replace('errorTip', tooltip))
      .should('have.text', tooltip)
  }

  verifyTitleTooltipPresent(tooltip = "") {
    this.verifyFieldErrorTooltipPresent(tooltip, selectors.jobTitleTxtBx)
  }

  clickOnConfiguration() {
    cy.xpath(selectors.configurationIcon)
      .click()
  }

  verifyMandatoryCommentsToggleBtnPresent() {
    cy.get(selectors.mandatoryCommentsToggleBtn)
      .should('exist')
  }

  enableMandatoryCommentsToggleBtn() {
    cy.get(selectors.mandatoryCommentsToggleBtn).then(($selector) => {
      if($selector.hasClass('selected')) {
      } else {
        cy.get(selectors.mandatoryCommentsToggleBtn)
          .click()
          .should('have.class', 'selected')
      }
    })
  }

  disableMandatoryCommentsToggleBtn() {
    cy.get(selectors.mandatoryCommentsToggleBtn).then(($selector) => {
      if($selector.hasClass('selected')) {
        cy.get(selectors.mandatoryCommentsToggleBtn)
          .click()
          .should('not.have.class', 'selected')
      }
    })
  }

  enableMandatoryApprovalTemplatesToggle() {
    cy.get(selectors.configuration.mandatoryApprovalTemplatesToggle, {timeout:50000})
      .click()
  }

  clickOnSetUpBtn() {
    cy.get(selectors.configuration.setUpBtn)
      .click()
  }

  verifyEditBtnForMandatoryTemplates() {
    cy.get(selectors.configuration.mandatoryTemplatesEditBtn)
      .should('have.text', 'EDIT')
  }

  clickOnMandatoryApproverTemplateDropdown(coType="ECO", status="PROTOTYPE") {
    cy.xpath(selectors.configuration.templateDropdown.replace('type', coType).replace('status', status))
      .click()
  }

  selectTemplateFromDropdown(coType, status, templateName) {
    cy.xpath(selectors.configuration.templateFromDropdown.replace('type', coType).replace('status', status).replace('name', templateName))
      .click({force:true})
  }

  clickOnApproverViewIcon(selector) {
    cy.xpath(selector)
      .should('be.visible')
      .click()
  }

  clickOnMandatoryApproversPreviewIcon(type="ECO", status="PROTOTYPE") {
    this.clickOnApproverViewIcon(selectors.configuration.approversViewIcon.replace('type', type).replace('status', status))
  }

  verifyNamePresentInPreviewTemplate(name) {
    cy.xpath(selectors.configuration.nameInPreviewTemplateModal.replace('name', name))
      .should('be.visible')
  }

  verifyNameNotPresentInPreviewTemplate(name) {
    cy.xpath(selectors.configuration.nameInPreviewTemplateModal.replace('name', name))
      .should('not.exist')
  }

  clickSaveBtn() {
    cy.xpath(selectors.configuration.clickSaveBtn)
      .click()
  }

  verifyMandatoryApprovalTemplatesToggleDisabled() {
    cy.get(selectors.configuration.mandatoryApprovalTemplatesToggle)
      .should('have.attr', 'class', 'ui-toggle-btn disabled')
  }

  verifyPrivateTemplateNotExistInMandatoryTemplatesDropdown(templateName) {
    cy.xpath(selectors.configuration.templateFromDropdown.replace('name', templateName))
      .should('not.exist')
  }

  clickOnCreateNewTemplateInDropdown() {
    cy.window().then(win => {
      cy.stub(win, 'open').callsFake((url, target) => {
        return win.open.wrappedMethod.call(win, url, '_self')
      }).as('open')
    })
    cy.get(selectors.configuration.createNewTemplateInMandatoryApproversDropdown)
      .click()
  }

  verifyCountryInCompanyProfileIsNotEditable() {
    cy.xpath(selectors.companyProfile.country)
      .should('have.attr', 'readonly')
  }

  verifyCompanyNameInCompanyProfileIsNotEditable() {
    cy.get(selectors.companyProfile.companyName)
      .should('have.attr', 'readonly')
  }

  verifyCompanyWebsiteInCompanyProfileIsNotEditable() {
    cy.get(selectors.companyProfile.companyWebsite)
      .should('have.attr', 'readonly')
  }

  verifyAddressStreetInCompanyProfileIsNotEditable() {
    cy.get(selectors.companyProfile.addressStreet)
      .should('have.attr', 'readonly')
  }

  verifyAddressSuiteInCompanyProfileIsNotEditable() {
    cy.get(selectors.companyProfile.addressSuite)
      .should('have.attr', 'readonly')
  }

  verifyCityInCompanyProfileIsNotEditable() {
    cy.get(selectors.companyProfile.city)
      .should('have.attr', 'readonly')
  }

  verifyStateInCompanyProfileIsNotEditable() {
    cy.get(selectors.companyProfile.state)
      .should('have.attr', 'class', ' disabled')
  }

  verifyZipCodeInCompanyProfileIsNotEditable() {
    cy.get(selectors.companyProfile.zipCode)
      .should('have.attr', 'readonly')
  }

  verifySandBoxOptionNotPresentInSettings() {
    cy.get(selectors.sandboxOptn)
        .should('not.exist')
  }

  verifyGroupsPageNotPresent() {
    cy.xpath(selectors.groupsPageTitle)
      .should('not.exist')
  }

  verifyUsersPageNotPresent() {
    cy.xpath(selectors.usersPageTitle)
      .should('not.exist')
  }

  verifyEmailTooltipPresent(tooltip = "") {
    this.verifyFieldErrorTooltipPresent(tooltip, selectors.emailTxtBx)
  }

  verifyFirstNameTooltipPresent(tooltip = "") {
    this.verifyFieldErrorTooltipPresent(tooltip, selectors.firstNameTxtBx)
  }

  verifyLastNameTooltipPresent(tooltip = "") {
    this.verifyFieldErrorTooltipPresent(tooltip, selectors.lastNameTxtBx)
  }

  clickOnUserActionDots(userName) {
    cy.xpath(selectors.userActionDots.replace('name', userName))
      .click()
  }

  verifyDisableModalContent(email){
    cy.get(selectors.modalTitle).should('have.text', 'Disable user?');
    cy.get(selectors.modalContent).should('have.text', email);
  }

  disableUserFromTable(email) {
    cy.xpath(selectors.disableUser)
      .click()
    this.verifyDisableModalContent(email);
    this.clickOnYes();
    featureHelpers.waitForLoadingIconToDisappear();
  }

  verifyGroupNamePresentInNewOrEditUserModal(groupName) {
    cy.xpath(selectors.groupNameInNewOrEditUserModal.replace('groupName', groupName))
      .should('be.visible')
  }

  clickCancelBtnInNewOrEditUserModal() {
    cy.get(selectors.cancelBtnInNewOrEditUserModal)
      .click()
  }
}
