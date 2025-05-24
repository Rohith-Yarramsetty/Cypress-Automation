import { Users } from "../../pages/accountSettings/users";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { ComponentApi } from "../../api/componentApi";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { Components } from "../../pages/components/component";
import { TableHelpers } from "../../helpers/tableHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { UsersApi } from "../../api/userApi";
import { CreateTemplate } from "../../api/changeOrderTemplateApi";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Products } from "../../pages/products/products";
import { SignIn } from "../../pages/signin";

const user = new Users();
const fakerHelper = new FakerHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const changeOrders = new ChangeOrders();
const compApi = new ComponentApi();
const nav = new Navigation();
const components = new Components();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
const userApi = new UsersApi();
const coTempApi = new CreateTemplate();
const compSettings = new CompanySettingsApi();
const products = new Products();
const signin = new SignIn();

let companyId;

describe("Configuration settings: Mandatory Approvers", { tags:["Configuration_Settings", "Configuration_Non_Admin"] }, () => {
  let email, userName, orgId;

  before(() => {
    Cypress.session.clearAllSavedSessions();
  })

  beforeEach(function () {
    const user = authApi.signUp();
    email = user.email;
    userName = user.firstName + ' ' + user.lastName
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    navHelper.navigateToSearch();
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateCompanySettings(companyId, compPayloads.is_DCO_enabled(true));
      compSettings.updateCompanySettings(companyId, compPayloads.isConfigurationsEnabled(true));
    })
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context('Non-Admin module', () => {
    it('Should not be able to enable mandatory approvers for User role', () => {
      // Create users and template with approvers and notifier
      let userId1, userId2, currentUserId;
      const templateName = fakerHelper.generateProductName();

      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList1 = [currentUserId, userId1];
        const notifiersList = [userId2];

        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = true;
        coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
      })

      // Create user with user role
      const userEmail = userApi.createUserUsingApi().email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created user
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Navigate to Configuration page
      navHelper.navigateToConfiguration();

      // Verify Mandatory Approvers toggle button
      user.verifyMandatoryApprovalTemplatesToggleDisabled()
    })

    it('Should not be able to enable mandatory approvers for Approver role', () => {
      // Create users and template with approvers and notifier
      let userId1, userId2, currentUserId;
      const templateName = fakerHelper.generateProductName();

      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList1 = [currentUserId, userId1];
        const notifiersList = [userId2];

        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = true;
        coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
      })

      // Create user with Approver role
      const approverEmail = userApi.createUserUsingApi("APPROVER").email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created Approver
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(approverEmail);
      authApi.signin(approverEmail);
  
      // Navigate to Configuration page
      navHelper.navigateToConfiguration();
  
      // Verify Mandatory Approvers toggle button
      user.verifyMandatoryApprovalTemplatesToggleDisabled()
    })

    it('Should not be able to enable mandatory approvers for Reviewer role', () => {
      // Create users and template with approvers and notifier
      let userId1, userId2, currentUserId;
      const templateName = fakerHelper.generateProductName();
  
      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList1 = [currentUserId, userId1];
        const notifiersList = [userId2];
  
        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = true;
        coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
      })

      // Create a user with Reviewer role
      const reviewerEmail = userApi.createUserUsingApi("REVIEWER").email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created reviewer
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(reviewerEmail);
      authApi.signin(reviewerEmail);
  
      // Navigate to Configuration page
      navHelper.navigateToConfiguration();
  
      // Verify Mandatory Approvers toggle button
      user.verifyMandatoryApprovalTemplatesToggleDisabled()
    })

    it('Should not be able to enable mandatory approvers for Supplier role', () => {
      // Create users and template with approvers and notifier
      let userId1, userId2, currentUserId;
      const templateName = fakerHelper.generateProductName();
  
      userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
      userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList1 = [currentUserId, userId1];
        const notifiersList = [userId2];
  
        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = true;
        coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
      })

      // Create supplier
      const supplierEmail = userApi.createUserUsingApi("SUPPLIER").email
      navHelper.navigateToUsers();
      authApi.signOut();

      // login with created supplier
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(supplierEmail);
      authApi.signin(supplierEmail);
  
      // Navigate to Configuration page
      navHelper.navigateToConfiguration();
  
      // Verify Mandatory Approvers toggle button
      user.verifyMandatoryApprovalTemplatesToggleDisabled()
    })
  })

  it('Should be able to add same template to multiple dropdowns', () => {
    // Create users and template using API
    let userId1, userId2, userId3, currentUserId;
    const templateName = fakerHelper.generateProductName();

    userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList = [userId2];
      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
    })

    // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add same template to all dropdowns
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName);

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.eco, constData.status.production);
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.production, templateName);

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.prototype);
    user.selectTemplateFromDropdown(constData.coTypes.mco, constData.status.prototype, templateName);

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.production);
    user.selectTemplateFromDropdown(constData.coTypes.mco, constData.status.production, templateName);

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.prototype);
    user.selectTemplateFromDropdown(constData.coTypes.dco, constData.status.prototype, templateName);

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.production);
    user.selectTemplateFromDropdown(constData.coTypes.dco, constData.status.production, templateName);

    user.clickSaveBtn();
    user.verifyEditBtnForMandatoryTemplates();
  })

  it('Should show approvers and notifiers list in Mandatory template preview', () =>{
    // Create users and templates with approvers
    let userId1, userId2, userId3, currentUserId;
    const templateName = fakerHelper.generateProductName();

    const user1 = userApi.createUserUsingApi()
    user1.userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    const userName1 = user1.fullName
    const user2 = userApi.createUserUsingApi()
    user2.userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    const userName2 = user2.fullName
    const user3 = userApi.createUserUsingApi()
    user3.userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    const userName3 = user3.fullName
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList = [userId2];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
    });

    // Navigate to Users page
    navHelper.navigateToConfiguration();
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();

    // Add template to Eco type-Prototype status dropdown
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName);

    // Verify Mandatory approvers in Template preview
    user.clickOnMandatoryApproversPreviewIcon();
    user.verifyNamePresentInPreviewTemplate(userName);
    user.verifyNamePresentInPreviewTemplate(userName1);
    user.verifyNamePresentInPreviewTemplate(userName2);
    user.verifyNameNotPresentInPreviewTemplate(userName3);
  })

  it('Should not show Private templates in mandatory templates dropdown', () => {
    // Create users and Private template using API
    let userId1, userId2, userId3, currentUserId;
    const templateName = fakerHelper.generateProductName();

    userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList = [userId2];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = false;
      coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
    })

    // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Verify Private template in all dropdowns 
    // (Should not show Private template in mandatory template dropdowns)
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();

    user.clickOnMandatoryApproverTemplateDropdown();
    user.verifyPrivateTemplateNotExistInMandatoryTemplatesDropdown(templateName);
    user.clickOnMandatoryApproverTemplateDropdown();  // To close the dropdown
  
    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.eco, constData.status.production);
    user.verifyPrivateTemplateNotExistInMandatoryTemplatesDropdown(templateName);
    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.eco, constData.status.production);  // To close the dropdown

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.prototype);
    user.verifyPrivateTemplateNotExistInMandatoryTemplatesDropdown(templateName);
    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.prototype);  // To close the dropdown

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.production);
    user.verifyPrivateTemplateNotExistInMandatoryTemplatesDropdown(templateName);
    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.production);  // To close the dropdown

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.prototype);
    user.verifyPrivateTemplateNotExistInMandatoryTemplatesDropdown(templateName);
    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.prototype);  // To close the dropdown

    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.production);
    user.verifyPrivateTemplateNotExistInMandatoryTemplatesDropdown(templateName);
    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.production);  // To close the dropdown
  })

  it('Should create new template from mandatory approvers template dropdown', () => {
    const templateName = fakerHelper.generateProductName();
    const approverName = userApi.createUserUsingApi().fullName;

    // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add Mandatory approvers template to ECO type-Prototype status dropdown
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.clickOnCreateNewTemplateInDropdown();
    featureHelper.waitForLoadingIconToDisappear();

    // Create company Template
    changeOrders.clickApproverList();
    changeOrders.checkApproverTypeCheckBx('Unanimous');
    changeOrders.addApproverToTemplate(approverName);
    changeOrders.clickOnSaveTemplateIcon();
    changeOrders.enterTemplateNameInSaveAsNewTemplate(templateName);
    changeOrders.checkAccessibleToAll();
    changeOrders.clickOnSaveBtnInSaveOrUpdateTemplateModal();
    changeOrders.verifySaveOrUpdateTemplateModalNotPresent();

    // Verify all the Approver in approver list
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, approverName, approverName);

    // Verify template present in dropdown
    changeOrders.clickOnDropdownIndicator();
    changeOrders.verifyTemplatePresentInDropdown(templateName);

    // Verify Template exist in template settings and click cancel in Manage template modal 
    changeOrders.clickOnTemplateSettingsIcon();
    changeOrders.verifyCompanyTemplateExistInManageTemplateModal(templateName);
  })

  it('Should show the approver names according to the selected templates', () => {
    // Create users and template with approvers and notifier
    let userId1, userId2, userId3, userId4, currentUserId;
    const templateName1 = fakerHelper.generateProductName();
    const templateName2 = fakerHelper.generateProductName();

    const user1 = userApi.createUserUsingApi()
    user1.userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    const userName1 = user1.fullName
    const user2 = userApi.createUserUsingApi()
    user2.userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    const userName2 = user2.fullName
    const user3 = userApi.createUserUsingApi()
    user3.userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    const user4 = userApi.createUserUsingApi()
    user4.userId.then((res) => { userId4 = res.body[0].data.createUser.id })
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [userId1];
      const approversList2 = [userId2];
      const notifiersList = [currentUserId];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName1, approversList1, notifiersList, externalUsers, isPublic);
      coTempApi.coTemplate(templateName2, approversList2, notifiersList, externalUsers, isPublic);
    })

    // Navigate to Configuration page
    navHelper.navigateToSearch();

    // Create component using API and add it to change order
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }
    compApi.createComponent(componentData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.clickEcoIcon();
    changeOrders.clickApproverList();

    // Verify Approvers for template1
    changeOrders.selectTemplateFromDropdown(templateName1, constData.changeOrderTemplateType.company);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    changeOrders.assertApproverRemoveIconNotPresent(userName);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
    changeOrders.assertApproverRemoveIconPresent(userName1);

    // Verify Approvers for template2
    changeOrders.selectTemplateFromDropdown(templateName2, constData.changeOrderTemplateType.company);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    changeOrders.assertApproverRemoveIconNotPresent(userName);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
    changeOrders.assertApproverRemoveIconPresent(userName2);
  })

  it('Should add mandatory notifier as a removable approver in approver list', () => {
    // Create users and template with approvers and notifier
    let userId1, userId2, userId3, currentUserId;
    const templateName = fakerHelper.generateProductName();

    const user1 = userApi.createUserUsingApi()
    user1.userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    const userName1 = user1.fullName
    const user2 = userApi.createUserUsingApi()
    user2.userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    const userName2 = user2.fullName
    const user3 = userApi.createUserUsingApi()
    user3.userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList = [userId2];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
    })

    // // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add Mandatory approvers template to ECO type-Prototype status dropdown
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName);
    user.clickSaveBtn();
    user.verifyEditBtnForMandatoryTemplates();

    // Create component using API and add it to change order
    nav.openComponentsTab();
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }
    compApi.createComponent(componentData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();

    // Verify Mandatory template modal
    changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, "Prototype", templateName);
    changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
    changeOrders.clickEcoIcon();

    // Verify mandatory approver(Should not be removable)
    changeOrders.clickApproverList();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    changeOrders.assertApproverRemoveIconNotPresent(userName);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
    changeOrders.assertApproverRemoveIconNotPresent(userName1);

    // Add mandatory notifier as a approver and verify(Should be removable)
    changeOrders.addApproverToTemplate(userName2);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
    changeOrders.assertApproverRemoveIconPresent(userName2);
  })

  it('Should add mandatory Approver as a removable Notifier in approver list', () => {
    // Create users and template with approvers and notifier
    let userId1, userId2, userId3, currentUserId;
    const templateName = fakerHelper.generateProductName();

    const user1 = userApi.createUserUsingApi()
    user1.userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    const userName1 = user1.fullName
    const user2 = userApi.createUserUsingApi()
    user2.userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    const userName2 = user2.fullName
    const user3 = userApi.createUserUsingApi()
    user3.userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList = [userId2];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
    })

    // // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add Mandatory approvers template to ECO type-Prototype status dropdown
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName);
    user.clickSaveBtn();
    user.verifyEditBtnForMandatoryTemplates();

    // Create component using API and add it to change order
    nav.openComponentsTab();
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }
    compApi.createComponent(componentData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();

    // Verify mandatory template modal
    changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, "Prototype", templateName);
    changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
    changeOrders.clickEcoIcon();

    // Verify mandatory notifier
    changeOrders.clickNotificationListTab();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
    changeOrders.assertNotifierRemoveIconNotPresent(userName1);

    // Add mandatory approver as a notifier and verfify(Should be removable)
    changeOrders.addNotifiersToTemplate(userName1);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
    changeOrders.assertNotifierRemoveIconPresent(userName1);
  })

  it('Should show modals and toasts correctly based on the mandatory templates selected', () => {
    // Create users and template with approvers and notifier
    let userId1, userId2, userId3, userId4, currentUserId;
    const templateName1 = fakerHelper.generateProductName();
    const templateName2 = fakerHelper.generateProductName();

    userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId4 = res.body[0].data.createUser.id })
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [userId1];
      const approversList2 = [userId2];
      const notifiersList1 = [userId3];
      const notifiersList2 = [userId4];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName1, approversList1, notifiersList1, externalUsers, isPublic);
      coTempApi.coTemplate(templateName2, approversList2, notifiersList2, externalUsers, isPublic);
    })

    // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add Mandatory approvers template to ECO-Prototype and ECO-Production status dropdowns
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName1);
    user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.eco, constData.status.production);
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.production, templateName2);
    user.clickSaveBtn();
    user.verifyEditBtnForMandatoryTemplates();

    // Create components using API and add to change order
    const componentData1 = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }
    const componentData2 = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.production
    }
    compApi.createComponent(componentData1);
    compApi.createComponent(componentData2);
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();

    // Add Prototype component and verify Mandatory approver modal
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentData1.name, true);
    changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, 'Prototype', templateName1);
    changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
    changeOrders.clickApproverList();
    changeOrders.verifySelectedTemplateForNewCo(templateName1);

    // Add Production component and verify notification toast
    changeOrders.clickOnProductsAndComponentsTab();
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentData2.name, true);
    changeOrders.verifyMandatoryTemplateToast('Mandatory Approvers Updated', templateName2);
    changeOrders.clickApproverList();
    changeOrders.verifySelectedTemplateForNewCo(templateName2);

    // Remove Production status component and verify notification toast
    changeOrders.clickOnProductsAndComponentsTab();
    changeOrders.removeProductOrComponentFromNewCo(componentData2.name);
    changeOrders.verifyMandatoryTemplateToast('Mandatory Approvers Updated', templateName1);
    changeOrders.clickApproverList();
    changeOrders.verifySelectedTemplateForNewCo(templateName1);

    // Remove Prototype status component and verify notification toast
    changeOrders.clickOnProductsAndComponentsTab();
    changeOrders.removeProductOrComponentFromNewCo(componentData1.name);
    changeOrders.verifyMandatoryTemplateToast('Mandatory Approvers Removed', templateName1);

    // Verify Default template selected
    changeOrders.clickApproverList();
    changeOrders.verifySelectedTemplateForNewCo('Default Template');

    // Add Production status component and verify notification toast
    changeOrders.clickOnProductsAndComponentsTab();
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentData2.name, true);
    changeOrders.verifyMandatoryTemplateToast('Mandatory Approvers Added', templateName2);
  })

  it('Should not delete Mandatory templates', () => {
    let userId1, userId2, userId3, userId4, currentUserId;
    const templateName1 = fakerHelper.generateProductName();
    const templateName2 = fakerHelper.generateProductName();

    // Create users using API
    userApi.createUserUsingApi().userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    userApi.createUserUsingApi().userId.then((res) => { userId4 = res.body[0].data.createUser.id })
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList1 = [userId2];
      const approversList2 = [currentUserId, userId3];
      const notifiersList2 = [userId4];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName1, approversList1, notifiersList1, externalUsers, isPublic);
      coTempApi.coTemplate(templateName2, approversList2, notifiersList2, externalUsers, isPublic);
    })

    // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add Mandatory approvers template In ECO type-Prototype status dropdown
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName1);
    user.clickSaveBtn();
    user.verifyEditBtnForMandatoryTemplates();

    // Navigate to change order
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();

    // Verify Selected template for change order
    changeOrders.clickApproverList();
    changeOrders.verifySelectedTemplateForNewCo('Default Template');

    // Verify mandatory template not deletable
    changeOrders.clickOnTemplateSettingsIcon();
    changeOrders.verifyMandatoryTemplateRemoveIconDisabledAndDataTip(templateName1);
    changeOrders.verifyTemplateRemoveIconEnbled(templateName2);
  })

  it('Should show mandatory approvers in drafted change order', () => {
    let userId1, userId2, userId3, currentUserId;
    const templateName = fakerHelper.generateProductName();

    // Create users using API
    const user1 = userApi.createUserUsingApi()
    user1.userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    const userName1 = user1.fullName
    const user2 = userApi.createUserUsingApi()
    user2.userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    const userName2 = user2.fullName
    const user3 = userApi.createUserUsingApi()
    user3.userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    const userName3 = user3.fullName
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList = [userId2];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
    })

    // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add Mandatory approvers template In ECO type-Prototype status dropdown
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName);
    user.clickSaveBtn();
    user.verifyEditBtnForMandatoryTemplates();

    // Create component using API and add it to change order
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }
    compApi.createComponent(componentData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();

    // Verify Mandatory template modal
    changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, 'Prototype', templateName);
    changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
    changeOrders.clickEcoIcon();

    // Verify Selected template for change order
    changeOrders.clickApproverList();
    changeOrders.verifySelectedTemplateForNewCo(templateName);

    // Verify mandatory Approvers(Should not be removable)
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    changeOrders.assertApproverRemoveIconNotPresent(userName);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
    changeOrders.assertApproverRemoveIconNotPresent(userName1);

    // Verify mandatory Notifier(Should not be removable)
    changeOrders.clickNotificationListTab();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
    changeOrders.assertNotifierRemoveIconNotPresent(userName2);

    // Add New Approver and Verify(Should be removable)
    changeOrders.clickApproverList();
    changeOrders.addApproverToTemplate(userName3);
    changeOrders.verifyApproversAndRemoveIcon(userName3);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
    changeOrders.assertApproverRemoveIconPresent(userName3);

    // Enter ECO name and add change order to draft
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.clickSaveDraft();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Approver list in drafted CO
    changeOrders.clickApproverList();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);

    // Verify mandatory Notifier
    changeOrders.clickNotificationListTab();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
  })

  it('Should show Mandatory approvers after clicking on submit for approval', () => {
    let userId1, userId2, userId3, currentUserId;
    const templateName = fakerHelper.generateProductName();

    // Create users using API
    const user1 = userApi.createUserUsingApi()
    user1.userId.then((res) => { userId1 = res.body[0].data.createUser.id })
    const userName1 = user1.fullName
    const user2 = userApi.createUserUsingApi()
    user2.userId.then((res) => { userId2 = res.body[0].data.createUser.id })
    const userName2 = user2.fullName
    const user3 = userApi.createUserUsingApi()
    user3.userId.then((res) => { userId3 = res.body[0].data.createUser.id })
    const userName3 = user3.fullName
    userApi.getCurrentUser().then((res) => {
      currentUserId = res.body.data._id;
      const approversList1 = [currentUserId, userId1];
      const notifiersList = [userId2];

      const externalUsers = [fakerHelper.generateMailosaurEmail()];
      const isPublic = true;
      coTempApi.coTemplate(templateName, approversList1, notifiersList, externalUsers, isPublic);
    })

    // Navigate to Configuration page
    navHelper.navigateToConfiguration();

    // Add Mandatory approvers template In ECO type-Prototype status dropdown
    user.enableMandatoryApprovalTemplatesToggle();
    user.clickOnSetUpBtn();
    user.clickOnMandatoryApproverTemplateDropdown();
    user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName);
    user.clickSaveBtn();
    user.verifyEditBtnForMandatoryTemplates();

    // Create component using API and add it to change order
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }
    compApi.createComponent(componentData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();

    // Verify Mandatory template modal
    changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, 'Prototype', templateName);
    changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
    changeOrders.clickEcoIcon();

    // Verify Selected template for change order
    changeOrders.clickApproverList();
    changeOrders.verifySelectedTemplateForNewCo(templateName);

    // Verify mandatory Approvers(Should not be removable)
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    changeOrders.assertApproverRemoveIconNotPresent(userName);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
    changeOrders.assertApproverRemoveIconNotPresent(userName1);

    // Verify mandatory Notifier(Should not be removable)
    changeOrders.clickNotificationListTab();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
    changeOrders.assertNotifierRemoveIconNotPresent(userName2);

    // Add New Approver and Verify(Should be removable)
    changeOrders.clickApproverList();
    changeOrders.addApproverToTemplate(userName3);
    changeOrders.verifyApproversAndRemoveIcon(userName3);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
    changeOrders.assertApproverRemoveIconPresent(userName3);

    // Enter ECO name and add click submit for approval
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.clickOnSubmitForApproval();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Approver list in View CO
    changeOrders.clickApproverList();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);

    // Verify mandatory Notifier
    changeOrders.clickNotificationListTab();
    tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
  })
})
