import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { UsersApi } from "../../api/userApi";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { CreateTemplate } from "../../api/changeOrderTemplateApi";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const changeOrders = new ChangeOrders();
const fakerHelper = new FakerHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const tableHelper = new TableHelpers();
const userApi = new UsersApi();
const featureHelper = new FeatureHelpers();
const coTempApi = new CreateTemplate();
const compSettings = new CompanySettingsApi();

let email, companyId, admin, orgId;

describe("Change Order Template", {tags: ["ChangeOrder", "ChangeOrder_Templates"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id})
    admin = user.fullName;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
  })

  beforeEach(() => {
    authApi.signin(email)
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  describe("Creation of Change Order Template", () => {
    it('Create new Private Template with one approval', () => {
      // Add a User
      const user = userApi.createUserUsingApi();
      const approverName = user.fullName;
      const templateName = fakerHelper.generateProductName();
      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Create Template by adding a user
      changeOrders.checkApproverTypeCheckBx('Majority');
      changeOrders.addApproverToTemplate(approverName);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to New CO
      changeOrders.clickOnChangeOrder();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify previously created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectTemplateFromDropdown(templateName);
      changeOrders.verifyApproverTypeCheckBxChecked('Majority');
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);
    })

    it('Create new Company Template with one approval', () => {
      // Add a User
      const user = userApi.createUserUsingApi();
      const approverName = user.fullName;
      const templateName = fakerHelper.generateProductName();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Create Template by adding a user
      changeOrders.checkApproverTypeCheckBx('Unanimous');
      changeOrders.addApproverToTemplate(approverName);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName, constData.changeOrderTemplateType.company);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to New CO
      changeOrders.clickOnChangeOrder();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify previously created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      changeOrders.verifyApproverTypeCheckBxChecked('Unanimous');
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);
    })

    it('Create new Private Template by adding user to notification list', () => {
      // Add a User
      const user = userApi.createUserUsingApi();
      const approverName = user.fullName;
      const templateName = fakerHelper.generateProductName();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();

      // Create Template by adding a user
      changeOrders.addApproverToTemplate(approverName);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);

      // Verify Template in settings
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to New CO
      changeOrders.clickOnChangeOrder();
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify previously created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectTemplateFromDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);
    })

    it('Create new Company Template by adding user to notification list', () => {
      // Add a User
      const user = userApi.createUserUsingApi();
      const approverName = user.fullName;
      const templateName = fakerHelper.generateProductName();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order & add a user
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();
      changeOrders.addApproverToTemplate(approverName);

      // Save the Template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll()
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify the saved Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);

      // Verify Template in Settings
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to Change order
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify previously created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);
    })

    it('Create new Private Template by adding user who don’t have Duro account', () => {
      const user = userApi.createUserUsingApi();
      const templateName = fakerHelper.generateProductName();
      const email = fakerHelper.generateEmail();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();

      // Add email to Notify
      changeOrders.enterEmailInNotificationList(email);
      changeOrders.clickAddEmailBtn();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Save the Template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify saved Email in Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Verify Template in settings
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to Change order
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify previously created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);
    })

    it('Create new Company Template by adding user who don’t have Duro account', () => {
      const user = userApi.createUserUsingApi();
      const templateName = fakerHelper.generateProductName();
      const email = fakerHelper.generateEmail();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();

      // Add email to Notify
      changeOrders.enterEmailInNotificationList(email);
      changeOrders.clickAddEmailBtn();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Save the Template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      //Verify saved Email in Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Verify Template in settings
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to Change order
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify previously created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);
    })

    it('Create new Private Template with all approvals', () => {
      // Add the Users
      const user1 = userApi.createUserUsingApi();
      const user2 = userApi.createUserUsingApi();
      const user3 = userApi.createUserUsingApi();
      const approverName1 = user1.fullName;
      const approverName2 = user2.fullName;
      const approverName3 = user3.fullName;
      const templateName = fakerHelper.generateProductName();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.clickApproverList();

      // Create Template by adding a user
      changeOrders.checkApproverTypeCheckBx('First-In');

      // Add all Approvers and Save Template
      changeOrders.checkAllApprovers();
      changeOrders.clickAddBtnInApprovers();
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);

      // Verify Approver's in Approver's list table
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName1, approverName1);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName2, approverName2);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName3, approverName3);

      // Verify template in Manage templates
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to New CO
      changeOrders.clickOnChangeOrder();
      changeOrders.clickNewBtn();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify previously created Template
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectTemplateFromDropdown(templateName);
      changeOrders.verifyApproverTypeCheckBxChecked('First-In');

      // Verify Approver's in Approver's list table
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName1, approverName1);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName2, approverName2);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName3, approverName3);
    })

    it('Create new Company Template with all approvers', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user1 = userApi.createUserUsingApi();
      const user2 = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Unanimous');

      // Add all the Approvers using Select All option and create template
      changeOrders.checkSelectAllCheckBx();
      changeOrders.clickAddBtnFromApproverList();
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();

      // Verify all the Approvers in approver list
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user1.fullName, user1.fullName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user2.fullName, user2.fullName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Verify Template exist and click cancel in Manage template modal 
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      //click cancel in new CO edit mode
      changeOrders.clickOnCancel();

      // Select existing Template from dropdown and verify the approvers in table
      changeOrders.clickNewBtn();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectCreatedTemplate(templateName);
      changeOrders.verifyApproverTypeCheckBxChecked('Unanimous')
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user1.fullName, user1.fullName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user2.fullName, user2.fullName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);
    })

    it('Create new Private Template with approvals and notification list', () => {
      // Add a User
      const user1 = userApi.createUserUsingApi();
      const user2 = userApi.createUserUsingApi();
      const approverName1 = user1.fullName;
      const approverName2 = user2.fullName;
      const templateName = fakerHelper.generateProductName();
      const email = fakerHelper.generateEmail();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Add a user in Approver list
      changeOrders.checkApproverTypeCheckBx('Unanimous');
      changeOrders.addApproverToTemplate(approverName1);

      // Add a user in Notification list
      changeOrders.clickNotificationListTab();
      changeOrders.addApproverToTemplate(approverName2);

      // Add an Email in Notification list
      changeOrders.enterEmailInNotificationList(email);
      changeOrders.clickAddEmailBtn();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Save the Template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);

      // Verify Template in Notification list
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName2, approverName2);

      // Verify Template in Approver list
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName);
      changeOrders.verifyApproverTypeCheckBxChecked('Unanimous');
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName1, approverName1);

      // Verify Email in Notification list
      changeOrders.clickNotificationListTab();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Verify Template in settings
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to New CO
      changeOrders.clickOnChangeOrder();
      changeOrders.clickNewBtn();

      // Verify previously created Template in Notification list
      changeOrders.clickNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectTemplateFromDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName2, approverName2);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Verify previously created Template in Approval list
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName);
      changeOrders.verifyApproverTypeCheckBxChecked('Unanimous');
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName1, approverName1);
    })

    it('Create new Company Template with approvals and notification list', () => {
      // Add the Users
      const user1 = userApi.createUserUsingApi();
      const user2 = userApi.createUserUsingApi();
      const approverName1 = user1.fullName;
      const approverName2 = user2.fullName;
      const templateName = fakerHelper.generateProductName();
      const email = fakerHelper.generateEmail();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Add a user in Approver list
      changeOrders.checkApproverTypeCheckBx('Majority');
      changeOrders.addApproverToTemplate(approverName1);

      // Add a user in Notification list
      changeOrders.clickNotificationListTab();
      changeOrders.addApproverToTemplate(approverName2);

      // Add an Email in Notification list
      changeOrders.enterEmailInNotificationList(email);
      changeOrders.clickAddEmailBtn();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Save the Template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();

      // Verify saved Template in Notification list
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName2, approverName2);

      // Verify saved Template in Approver list
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName1, approverName1);

      // Verify Email in Notification list
      changeOrders.clickNotificationListTab();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Verify Template in settings
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();

      // Navigate to New CO
      changeOrders.clickOnChangeOrder();
      changeOrders.clickNewBtn();

      // Verify previously created Template in Notification list
      changeOrders.clickNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName2, approverName2);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.emails, email, email);

      // Verify previously created Template in Approval list
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectTemplateFromDropdown(templateName, constData.changeOrderTemplateType.company);
      changeOrders.verifyApproverTypeCheckBxChecked('Majority');
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName1, approverName1);
    })

    it.skip('Should create a private template immediate to company template creation', () => {
      const notifierName = userApi.createUserUsingApi().fullName;
      const approverName = userApi.createUserUsingApi().fullName;
      const approverName2 = userApi.createUserUsingApi().fullName;
      const companyTemplate = fakerHelper.generateProductName();
      const privateTemplate = fakerHelper.generateProductName();

      // Navigate to change orders
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Add users to template
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Create company template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(companyTemplate);
      changeOrders.checkAccessibleToAll()
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();

      // Create private template
      changeOrders.searchAndCheckApproverName(approverName2);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(privateTemplate);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();

      // Verify the templates in dropdown
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(companyTemplate);
      changeOrders.verifyTemplatePresentInDropdown(privateTemplate);

      // Verify the templates manage templates
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(companyTemplate);
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(privateTemplate);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Verify the templates manage templates
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(companyTemplate);
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(privateTemplate);      
    })
  })

  describe("Deletion of Change Order Template", () => {
    it('Delete Private template', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();
  
      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Unanimous');

      // Add Approver and create template
      changeOrders.searchAndCheckUserInAddApproversToChangeOrder(user.fullName, user.email);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);

      // Delete created Template
      changeOrders.clickOnRemoveInManageTemplatesModal(templateName);
      changeOrders.clickOnDeleteTemplateBtn();
      changeOrders.clickOnSaveBtnInManageTemplates();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template not exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplateNotPresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateNotExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Verify approver not exist in the Approver table list
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, user.fullName);

      // Verify Template not exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplateNotPresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateNotExistInManageTemplateModal(templateName);
    })

    it('Delete company template', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Unanimous');

      // Add Approver and create template
      changeOrders.searchAndCheckUserInAddApproversToChangeOrder(user.fullName, user.email);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);

      // Delete created Template
      changeOrders.clickOnRemoveInManageTemplatesModal(templateName);
      changeOrders.clickOnDeleteTemplateBtn();
      changeOrders.clickOnSaveBtnInManageTemplates();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template not exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplateNotPresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateNotExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Verify approver not exist in the Approver table list
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, user.fullName);

      // Verify Template not exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplateNotPresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateNotExistInManageTemplateModal(templateName);
    })

    it('Should not delete template on clicking Cancel in Delete Template modal', () => {
      // Add Users and template
      let userId1, userId2, currentUserId;
      const templateName = fakerHelper.generateProductName();

      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList = [currentUserId, userId1];
        const notifiersList = [userId2];
        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = false;
        coTempApi.coTemplate(templateName, approversList, notifiersList, externalUsers, isPublic);
      })

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Verify Template exist in Manage template modal
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);

      // Click on remove and then Cancel deleting
      changeOrders.clickOnRemoveInManageTemplatesModal(templateName);
      changeOrders.verifyDeleteTemplateModalVisible();
      changeOrders.clickCancelBtnInDeleteTemplateModal();

      // Verify template exist in Manage template modal
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal after clicking on cancel deleting
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
    })

    it('Delete multiple templates', () => {
      // Add Users and template
      let userId1, userId2, currentUserId;
      const template1 = fakerHelper.generateProductName();
      const template2 = fakerHelper.generateProductName();

      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList = [currentUserId, userId1];
        const notifiersList = [userId2];
        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        coTempApi.coTemplate(template1, approversList, notifiersList, externalUsers, true);
        coTempApi.coTemplate(template2, approversList, notifiersList, externalUsers, false);
      })

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(template1);
      changeOrders.verifyTemplatePresentInDropdown(template2);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(template1);
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(template2);

      // Delete template1 and verify
      changeOrders.clickOnRemoveInManageTemplatesModal(template1);
      changeOrders.verifyDeleteTemplateModalVisible();
      changeOrders.clickOnDeleteTemplateBtn();
      changeOrders.verifyCompanyTemplateNotExistInManageTemplateModal(template1);

      // Delete template2 and verify
      changeOrders.clickOnRemoveInManageTemplatesModal(template2);
      changeOrders.verifyDeleteTemplateModalVisible();
      changeOrders.clickOnDeleteTemplateBtn();
      changeOrders.verifyPrivateTemplateNotExistInManageTemplateModal(template2);
      changeOrders.clickOnSaveBtnInManageTemplates();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Templates not exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplateNotPresentInDropdown(template1);
      changeOrders.verifyTemplateNotPresentInDropdown(template2);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateNotExistInManageTemplateModal(template1);
      changeOrders.verifyPrivateTemplateNotExistInManageTemplateModal(template2);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Templates not exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplateNotPresentInDropdown(template1);
      changeOrders.verifyTemplateNotPresentInDropdown(template2);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateNotExistInManageTemplateModal(template1);
      changeOrders.verifyPrivateTemplateNotExistInManageTemplateModal(template2);
      changeOrders.clickOnCancelBtnInManageTemplates();
    })

    it('Should not delete the templates on clicking Cancel after deleting Private templates', () => {
      // Add Users and template
      let userId1, userId2, currentUserId;
      const templateName = fakerHelper.generateProductName();

      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList = [currentUserId, userId1];
        const notifiersList = [userId2];
        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = false;
        coTempApi.coTemplate(templateName, approversList, notifiersList, externalUsers, isPublic);
      })

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Verify Template exist in Manage template modal
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);

      // Click on delete template button
      changeOrders.clickOnRemoveInManageTemplatesModal(templateName);
      changeOrders.verifyDeleteTemplateModalVisible();
      changeOrders.clickOnDeleteTemplateBtn();

      // Verify template not exist in Manage template modal and click on cancel
      changeOrders.verifyPrivateTemplateNotExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal after clicking on cancel deleting
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
    })

    it('Should not delete the templates on clicking Cancel after deleting Company templates', () => {
      // Add Users and template
      let userId1, userId2, currentUserId;
      const templateName = fakerHelper.generateProductName();

      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList = [currentUserId, userId1];
        const notifiersList = [userId2];
        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = true;
        coTempApi.coTemplate(templateName, approversList, notifiersList, externalUsers, isPublic);
      })

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();

      // Verify Template exist in Manage template modal
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);

      // Click on delete template button
      changeOrders.clickOnRemoveInManageTemplatesModal(templateName);
      changeOrders.verifyDeleteTemplateModalVisible();
      changeOrders.clickOnDeleteTemplateBtn();

      // Verify template not exist in Manage template modal and click on cancel
      changeOrders.verifyCompanyTemplateNotExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal after clicking on cancel deleting
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
    })
  })

  describe("Update existing Change Order templates", () => {
    it('Update the Private template', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user1 = userApi.createUserUsingApi();
      const user2 = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Add Approver and create template
      changeOrders.searchAndCheckUserInAddApproversToChangeOrder(user1.fullName, user1.email);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);

      // Click on cancel button in Manage templates and in new CO edit mode
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancelBtnInEditMode();
      featureHelper.waitForLoadingIconToDisappear();

      // Navigate to approver list tab, select created template and verify its existence
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectCreatedTemplate(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user1.fullName, user1.fullName);

      // Navigate to notification list tab, check the approver and verify its existence
      changeOrders.navigateToNotificationListTab();
      changeOrders.searchAndCheckApproverName(user2.fullName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user2.fullName, user2.fullName);

      // Update the existing template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.waitForModalToAppear();
      changeOrders.clickOnDropdownIndicatorInModal();
      changeOrders.selectCreatedTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.clickOnCancelBtnInEditMode();

      // Navigate to notification list tab, select created template and verify its existence
      changeOrders.clickNewBtn();
      changeOrders.navigateToNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectCreatedTemplate(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user2.fullName, user2.fullName);

      // Verify template exist in dropdown and assert row present in approver list table
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user1.fullName, user1.fullName);
    })

    it('Update the Company template', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user1 = userApi.createUserUsingApi();
      const user2 = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Add Approver and create template
      changeOrders.searchAndCheckUserInAddApproversToChangeOrder(user1.fullName, user1.email);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);

      // Check accessible to all company users
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);

      // Click on cancel button in Manage templates and in new CO edit mode
      changeOrders.clickOnCancelBtnInManageTemplates();
      changeOrders.clickOnCancel();
      featureHelper.waitForLoadingIconToDisappear();

      // Navigate to approver list tab, select created template and verify its existence
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectCreatedTemplate(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user1.fullName, user1.fullName);

      // Navigate to notification list tab, check the approver and verify its existence
      changeOrders.navigateToNotificationListTab();
      changeOrders.searchAndCheckApproverName(user2.fullName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user2.fullName, user2.fullName);

      // Update the existing template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.waitForModalToAppear();
      changeOrders.clickOnDropdownIndicatorInModal();
      changeOrders.selectCreatedTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.clickOnCancel();

      // Navigate to notification list tab, select created template and verify its existence
      changeOrders.clickNewBtn();
      changeOrders.navigateToNotificationListTab();
      changeOrders.verifyNotificationListPagePresent();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.users, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectCreatedTemplate(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user2.fullName, user2.fullName);

      // Verify template exist in dropdown and assert row present in approver list table
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user1.fullName, user1.fullName);
    })

    it('Change private template to company template', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Create template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Navigate to approver list tab, select created template
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectCreatedTemplate(templateName);

      // Check the approver and save the template
      changeOrders.checkApproverTypeCheckBx('Majority');
      changeOrders.searchAndCheckApproverName(user.fullName);
      changeOrders.clickOnSaveTemplateIcon();

      // Change private template to company template
      changeOrders.waitForModalToAppear();
      changeOrders.clickOnDropdownIndicatorInModal();
      changeOrders.verifyTemplatePresentInDropdownInSaveOrUpdateModal(templateName);
      changeOrders.selectCreatedTemplate(templateName);
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();

      // Click on settings and verify company template is present in modal
      changeOrders.clickOnCancel();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
    })

    it('Change company template to private template', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Create template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);

      // Check accessible to all company users
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify company template exist in Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Navigate to approver list tab, select created template
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.selectCreatedTemplate(templateName);

      // Verify the approver type checkbox and save the template
      changeOrders.verifyApproverTypeCheckBxChecked('Majority');
      changeOrders.searchAndCheckApproverName(user.fullName);
      changeOrders.clickOnSaveTemplateIcon();

      // Change company template to private template
      changeOrders.waitForModalToAppear();
      changeOrders.clickOnDropdownIndicatorInModal();
      changeOrders.selectCreatedTemplate(templateName);
      changeOrders.unCheckAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();

      // Click Cancel on new CO edit mode
      changeOrders.clickOnCancel();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to new CO and Verify private template exist in modal
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.verifyApproverListPagePresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.selectCreatedTemplate(templateName);
      changeOrders.verifyApproverTypeCheckBxChecked('Majority');
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, user.fullName, user.fullName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
    })
  })

  describe("Template field Validations", () => {
    it('Save as new template field validations(min 1 character and max 61 char)', () => {
      // Add User
      userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Unanimous');

      // Save the template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();

      // Verify save button is in disable state when No character is entered
      changeOrders.enterTemplateNameInSaveAsNewTemplate(fakerHelper.getRandomStringOfCharacters(5));
      changeOrders.clearTemplateNameFieldInSaveAsNewTemplate();
      changeOrders.verifyToolTipPresent('Must contain at least 1 character');
      changeOrders.verifySaveBtnInSaveOrUpdateTemplateModal();

      // Verify that “Should be less than 61 characters” tool tip text is present
      changeOrders.enterTemplateNameInSaveAsNewTemplate(fakerHelper.getRandomStringOfCharacters(61));
      changeOrders.verifyToolTipPresent('Should be less than 61 characters');

      // Verify save button is in disable state when error is shown 
      changeOrders.verifySaveBtnInSaveOrUpdateTemplateModal();
    })

    it('Cannot have same name for company template', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Add Approver and create template
      changeOrders.searchAndCheckUserInAddApproversToChangeOrder(user.fullName, user.email);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Enter same name for new template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll();

      // Verify tool tip error message and save button visibility
      changeOrders.verifyToolTipPresent('Name already exists');
      changeOrders.verifySaveBtnInSaveOrUpdateTemplateModal();
    })

    it('Save company template name as private template name', () => {
      const templateName = fakerHelper.generateProductName();
      // Add User
      const user = userApi.createUserUsingApi();

      // Navigate to Change order
      nav.openChangeOrdersTab();

      // Go to new Change order
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Add Approver and create company template
      changeOrders.searchAndCheckUserInAddApproversToChangeOrder(user.fullName, user.email);
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.checkAccessibleToAll();
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
      changeOrders.clickOnCancelBtnInManageTemplates();

      // Cancel on New change orders page
      changeOrders.clickOnCancel();

      // Go to New change order Approver list
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Majority');

      // Enter same name to create private template
      changeOrders.clickOnSaveTemplateIcon();
      changeOrders.verifySaveOrUpdateTemplate();
      changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
      changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
      changeOrders.verifySaveOrUpdateTemplateModalNotPresent();
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, admin, admin);

      // Verify Template exist in dropdown and Manage template modal under company and private templates
      changeOrders.clickOnDropdownIndicator();
      changeOrders.verifyTemplatePresentInDropdown(templateName);
      changeOrders.clickOnTemplateSettingsIcon();
      changeOrders.verifyPrivateTemplateExistInManageTemplateModal(templateName);
      changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
    })
  })
})
