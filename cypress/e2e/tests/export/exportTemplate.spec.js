import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { Export } from "../../pages/export";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FeatureHelpers } from "../../helpers/featureHelper";

const signin = new SignIn();
const exports = new Export();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Export Templates Module', () => {
  it("Should change template and apply saved settings", () => {
    // Navigate to Export tab
    nav.openExportPage();

    // Check necessary labels in customize fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.uncheckCustomizeFieldsCheckBoxes();
    exports.checkCustomizeFieldsCheckBoxes('Level');
    exports.checkCustomizeFieldsCheckBoxes('CPN');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Check necessary labels in select document types
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.uncheckSelectDocumentTypesCheckBoxes();
    exports.checkSelectDocumentTypesCheckBoxes('THUMBNAIL IMAGES');
    exports.checkSelectDocumentTypesCheckBoxes('GENERIC');
    exports.clickOnSaveBtnInSelectDocumentModal();

    // Enter CC Email
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co,dev@durolabs.co');

    // Save the template
    exports.clickOnSaveTemplateIcon();
    exports.enterTemplateNameInSaveAsNewTemplate('My template');
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Set Default template
    exports.clickOnDropdownIndicator();
    exports.clickOnDefaultSettings();

    // Verify No.of labels checked in Customize fields
    exports.clickOnCustomizeFieldsIcon();
    exports.verifyCountOfCheckBxsCheckedInCustomizedField(44);
    exports.clickOnCancelInCustomizeFieldModal();

    // Verify No.of labels checked in Select Document Type fields
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.verifyCountOfCheckBxsCheckedInSelectDocumentTypes(23);
    exports.clickOnCancelInSelectDocumentTypeModal();

    // Veriy CC Email
    exports.verifyTextInCcEmail("");

    // Select previously created template
    exports.clickOnDropdownIndicator();
    exports.selectTemplateFromDropdown('My template');

    // Verify No.of labels checked in Customize fields
    exports.clickOnCustomizeFieldsIcon();
    exports.verifyCountOfCheckBxsCheckedInCustomizedField(2);
    exports.clickOnCancelInCustomizeFieldModal();

    // Verify No.of labels checked in Select Document Type fields
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.verifyCountOfCheckBxsCheckedInSelectDocumentTypes(2);
    exports.clickOnCancelInSelectDocumentTypeModal();

    // Veriy CC Email
    exports.verifyTextInCcEmail("test@durolabs.co,dev@durolabs.co,dev@durolabs.co");
  })

  it("Should create company template with access to all company users", () => {
    // Navigate to Export tab
    nav.openExportPage();

    // Check necessary labels in customize fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.uncheckCustomizeFieldsCheckBoxes();
    exports.checkCustomizeFieldsCheckBoxes('Specs');
    exports.checkCustomizeFieldsCheckBoxes('Quantity');
    exports.checkCustomizeFieldsCheckBoxes('Total Price');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Check necessary labels in select document types
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.uncheckSelectDocumentTypesCheckBoxes();
    exports.checkSelectDocumentTypesCheckBoxes('BOARD FILE');
    exports.checkSelectDocumentTypesCheckBoxes('FAB DRAWING');
    exports.checkSelectDocumentTypesCheckBoxes('CAD');
    exports.clickOnSaveBtnInSelectDocumentModal();   

    // Enter CC Email
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co,dev@durolabs.co');

    // Save the Template
    exports.clickOnSaveTemplateIcon();
    exports.enterTemplateNameInSaveAsNewTemplate('Company template');
    exports.checkAccessibleToAll();
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Verify Template in Dropdown
    exports.clickOnDropdownIndicator();
    exports.verifyTemplatePresentInDropdown('Company template', 'COMPANY');
  })

  it('Should update template settings', () => {
    const templateName = fakerHelper.generateProductName();
    // Navigate to Export tab
    nav.openExportPage();

    // Create a Template
    exports.clickOnCustomizeFieldsIcon();
    exports.uncheckCustomizeFieldsCheckBoxes();
    exports.checkCustomizeFieldsCheckBoxes('Level');
    exports.checkCustomizeFieldsCheckBoxes('CPN');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.uncheckSelectDocumentTypesCheckBoxes();
    exports.checkSelectDocumentTypesCheckBoxes('THUMBNAIL IMAGES');
    exports.checkSelectDocumentTypesCheckBoxes('GENERIC');
    exports.clickOnSaveBtnInSelectDocumentModal();
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co');
    exports.clickOnSaveTemplateIcon();
    exports.enterTemplateNameInSaveAsNewTemplate(templateName);
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Select previously created template
    exports.clickOnDropdownIndicator();
    exports.selectTemplateFromDropdown(templateName);

    // Verify the Template Specs
    exports.clickOnCustomizeFieldsIcon();
    exports.verifyCountOfCheckBxsCheckedInCustomizedField(2);
    exports.clickOnCancelInCustomizeFieldModal();
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.verifyCountOfCheckBxsCheckedInSelectDocumentTypes(2);
    exports.clickOnCancelInSelectDocumentTypeModal();
    exports.verifyTextInCcEmail('test@durolabs.co,dev@durolabs.co');

    // Select previously created template
    exports.clickOnDropdownIndicator();
    exports.selectTemplateFromDropdown(templateName);

    // Update the Template
    exports.clickOnCustomizeFieldsIcon();
    exports.uncheckCustomizeFieldsCheckBoxes();
    exports.checkCustomizeFieldsCheckBoxes('Name');
    exports.checkCustomizeFieldsCheckBoxes('EID');
    exports.checkCustomizeFieldsCheckBoxes('Revision');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.uncheckSelectDocumentTypesCheckBoxes();
    exports.checkSelectDocumentTypesCheckBoxes('DATASHEET');
    exports.checkSelectDocumentTypesCheckBoxes('PRODUCT LITERATURE');
    exports.clickOnSaveBtnInSelectDocumentModal();
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co');
    exports.clickOnSaveTemplateIcon();
    exports.clickOnDropdownIndicatorInSaveOrUpdateModal();
    exports.selectTemplateFromDropdown(templateName);
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Verify the Template Specs after Updation
    exports.clickOnCustomizeFieldsIcon();
    exports.verifyCountOfCheckBxsCheckedInCustomizedField(5);
    exports.clickOnCancelInCustomizeFieldModal();
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.verifyCountOfCheckBxsCheckedInSelectDocumentTypes(4);
    exports.clickOnCancelInSelectDocumentTypeModal();
    exports.verifyTextInCcEmail('test@durolabs.co,dev@durolabs.co');
  })

  it('Should only have COMPANY TEMPLATE in dropdown options - New company user', () => {
    // Create a Private Template
    // Navigate to Export tab
    nav.openExportPage();

    // Check necessary labels in customize fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.uncheckCustomizeFieldsCheckBoxes();
    exports.checkCustomizeFieldsCheckBoxes('Level');
    exports.checkCustomizeFieldsCheckBoxes('CPN');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Check necessary labels in select document types
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.uncheckSelectDocumentTypesCheckBoxes();
    exports.checkSelectDocumentTypesCheckBoxes('THUMBNAIL IMAGES');
    exports.checkSelectDocumentTypesCheckBoxes('GENERIC');
    exports.clickOnSaveBtnInSelectDocumentModal();

    // Enter CC Email
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co,dev@durolabs.co');

    // Save the template
    exports.clickOnSaveTemplateIcon();
    exports.enterTemplateNameInSaveAsNewTemplate('Admin Private template');
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Create a Company Template
    // Navigate to Export tab
    nav.openExportPage();

    // Check necessary labels in customize fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.uncheckCustomizeFieldsCheckBoxes();
    exports.checkCustomizeFieldsCheckBoxes('Specs');
    exports.checkCustomizeFieldsCheckBoxes('Quantity');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Check necessary labels in select document types
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.uncheckSelectDocumentTypesCheckBoxes();
    exports.checkSelectDocumentTypesCheckBoxes('BOARD FILE');
    exports.checkSelectDocumentTypesCheckBoxes('FAB DRAWING');
    exports.clickOnSaveBtnInSelectDocumentModal();

    // Enter CC Email
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co,dev@durolabs.co');

    // Save the template
    exports.clickOnSaveTemplateIcon();
    exports.checkAccessibleToAll();
    exports.enterTemplateNameInSaveAsNewTemplate('Admin Company template');
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    const user = userApi.createUserUsingApi();
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(user.email);
    authApi.signin(user.email);
    navHelper.navigateToSearch();

    // Navigate to Export tab
    nav.openExportPage();

    // Check necessary labels in customize fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.uncheckCustomizeFieldsCheckBoxes();
    exports.checkCustomizeFieldsCheckBoxes('Level');
    exports.checkCustomizeFieldsCheckBoxes('CPN');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Check necessary labels in select document types
    exports.checkIncludeDocumentsCheckbox();
    exports.clickOnSelectDocumentTypesIcon();
    exports.uncheckSelectDocumentTypesCheckBoxes();
    exports.checkSelectDocumentTypesCheckBoxes('THUMBNAIL IMAGES');
    exports.checkSelectDocumentTypesCheckBoxes('GENERIC');
    exports.clickOnSaveBtnInSelectDocumentModal();

    // Enter CC Email
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co,dev@durolabs.co');

    // Save the template
    exports.clickOnSaveTemplateIcon();
    exports.enterTemplateNameInSaveAsNewTemplate('New user private template');
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Verify the Company Templates
    exports.clickOnDropdownIndicator();
    exports.verifyTemplatePresentInDropdown('New user private template');
    exports.verifyTemplatePresentInDropdown('Company template', constData.changeOrderTemplateType.company);
    exports.verifyTemplateNotPresentInDropdown('Private template');
  })
})

describe('Export Templates accessbility from various users', () => {
  it("Company template should remain accessible by user even if it gets updated by creator", () => {
    // Invite a new User
    const user = userApi.createUserUsingApi();
    const templateName = fakerHelper.generateProductName();

    // Create a Company template
    nav.openExportPage();
    featureHelper.waitForLoadingIconToDisappear();
    exports.clickOnDropdownIndicator();
    exports.clickOnSaveTemplateIcon();
    exports.checkAccessibleToAll();
    exports.enterTemplateNameInSaveAsNewTemplate(templateName);
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Update as Private template
    nav.openExportPage();
    featureHelper.waitForLoadingIconToDisappear();
    exports.clickOnDropdownIndicator();
    exports.clickOnSaveTemplateIcon();
    exports.clickOnDropdownIndicatorInSaveOrUpdateModal();
    exports.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Logout & login with new users account
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(user.email);
    authApi.signin(user.email);

    // Verify the template should accessible
    nav.openExportPage();
    exports.clickOnDropdownIndicator();
    exports.verifyTemplatePresentInDropdown(templateName, constData.changeOrderTemplateType.company);
  })
})
