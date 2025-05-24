import { SignIn } from "../../pages/signin";
import { Users } from "../../pages/accountSettings/users";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { UsersApi } from "../../api/userApi";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { TableHelpers } from "../../helpers/tableHelper";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { Components } from "../../pages/components/component";
import { ComponentApi } from "../../api/componentApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";

const faker = require('faker');
const signin = new SignIn();
const user = new Users();
const fakerHelper = new FakerHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const userApi = new UsersApi();
const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const compSettings = new CompanySettingsApi();
const nav = new Navigation();
const components = new Components();
const compApi = new ComponentApi();
const changeOrders = new ChangeOrders();

describe("Role group test cases", {tags: ["ChangeOrder", "ChangeOrder_Role_Groups", "Roles", "Users"]}, () => {
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
  });

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  });

  afterEach(() => {
    compSettings.resetCompany(companyId);
  });

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  });

  it('Should show Reviewer and Manufacturer groups in new user and edit user modals', () => {
    // Navigate to users page
    navHelper.navigateToUsers();
    user.clickOnNew();

    // Verify Reviewer and Manufacturer groups in new user modal
    user.verifyGroupNamePresentInNewOrEditUserModal('Reviewer');
    user.verifyGroupNamePresentInNewOrEditUserModal('Manufacturer');
    user.clickCancelBtnInNewOrEditUserModal();

    // Verify Reviewer and Manufacturer groups in edit user modal
    tableHelper.clickOnCell('email', email);
    user.verifyGroupNamePresentInNewOrEditUserModal('Reviewer');
    user.verifyGroupNamePresentInNewOrEditUserModal('Manufacturer');
  });

  context('Reviewer group', () => {
    it('Should be able to add user under Reviewer group and able to approve the change order', () => {
      const userData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "User",
        groupName : "Reviewer"
      }
      const userName = userData.firstName + ' ' + userData.lastName
      const userEmail = fakerHelper.generateMailosaurEmail(userData.firstName, userData.lastName);

      // Create user in Reviewer group
      navHelper.navigateToUsers();
      user.createUser(userData.firstName, userData.lastName, userEmail, userData.jobTitle, userData.role, userData.groupName)
      featureHelpers.waitForLoadingIconToDisappear();

      // Create a component and add it to the change order
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Reviewer group user as an approver
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(userName);

      // Add CO name and click on submit for approval
      const ecoName = fakerHelper.generateEcoName()
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(ecoName);
      changeOrders.clickOnSubmitForApproval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out as admin and login with created user
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Go to open change order and Approve change order
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickApproveBtn();
      changeOrders.confirmAprroval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out and sign in with admin email
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      authApi.signin(email);

      // Go to change orders and verify the change order approved by Reviewer group user
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('user','APPROVED', userName);
    });

    it('Should be able to add user under Reviewer group and able to reject the change order', () => {
      const userData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "User",
        groupName : "Reviewer"
      }
      const userName = userData.firstName + ' ' + userData.lastName
      const userEmail = fakerHelper.generateMailosaurEmail(userData.firstName, userData.lastName);

      // Create user in Reviewer group
      navHelper.navigateToUsers();
      user.createUser(userData.firstName, userData.lastName, userEmail, userData.jobTitle, userData.role, userData.groupName)
      featureHelpers.waitForLoadingIconToDisappear();

      // Create a component and add it to the change order
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Reviewer group user as an approver
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(userName);

      // Add CO name and click on submit for approval
      const ecoName = fakerHelper.generateEcoName()
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(ecoName);
      changeOrders.clickOnSubmitForApproval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out as admin and login with created user
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Go to open change order and Reject change order
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickRejectBtn();
      changeOrders.confirmRejection();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out and sign in with admin email
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      authApi.signin(email);

      // Go to change orders and verify the change order rejected by Reviewer group user
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('user','REJECTED', userName);
    });

    it('Should be able to add user under Reviewer group and able to close the change order', () => {
      const userData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "User",
        groupName : "Reviewer"
      }
      const userName = userData.firstName + ' ' + userData.lastName
      const userEmail = fakerHelper.generateMailosaurEmail(userData.firstName, userData.lastName);

      // Create user in Reviewer group
      navHelper.navigateToUsers();
      user.createUser(userData.firstName, userData.lastName, userEmail, userData.jobTitle, userData.role, userData.groupName)
      featureHelpers.waitForLoadingIconToDisappear();

      // Create a component and add it to the change order
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Reviewer group user as an approver
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(userName);

      // Add CO name and click on submit for approval
      const ecoName = fakerHelper.generateEcoName()
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(ecoName);
      changeOrders.clickOnSubmitForApproval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out as admin and login with created user
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Go to open change order and close change order
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnClose();
      changeOrders.confirmClose();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out and sign in with admin email
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      authApi.signin(email);

      // Go to change orders and verify the change order closed by Reviewer group user
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('user','CLOSED', userName);
    });
  });

  context('Manufacturer group', () => {
    it('Should be able to add user under Manufacturer group and able to approve the change order', () => {
      const userData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "User",
        groupName : "Manufacturer"
      }
      const userName = userData.firstName + ' ' + userData.lastName
      const userEmail = fakerHelper.generateMailosaurEmail(userData.firstName, userData.lastName);

      // Create user in Manufacturer group
      navHelper.navigateToUsers();
      user.createUser(userData.firstName, userData.lastName, userEmail, userData.jobTitle, userData.role, userData.groupName)
      featureHelpers.waitForLoadingIconToDisappear();

      // Create a component and add it to the change order
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Manufacturer group user as an approver
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(userName);

      // Add CO name and click on submit for approval
      const ecoName = fakerHelper.generateEcoName()
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(ecoName);
      changeOrders.clickOnSubmitForApproval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out as admin and login with created user
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Go to open change order and Approve change order
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickApproveBtn();
      changeOrders.confirmAprroval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out and sign in with admin email
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      authApi.signin(email);

      // Go to change orders and verify the change order approved by Manufacturer group user
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('user','APPROVED', userName);
    });

    it('Should be able to add user under Manufacturer group and able to reject the change order', () => {
      const userData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "User",
        groupName : "Manufacturer"
      }
      const userName = userData.firstName + ' ' + userData.lastName
      const userEmail = fakerHelper.generateMailosaurEmail(userData.firstName, userData.lastName);

      // Create user in Manufacturer group
      navHelper.navigateToUsers();
      user.createUser(userData.firstName, userData.lastName, userEmail, userData.jobTitle, userData.role, userData.groupName)
      featureHelpers.waitForLoadingIconToDisappear();

      // Create a component and add it to the change order
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Manufacturer group user as an approver
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(userName);

      // Add CO name and click on submit for approval
      const ecoName = fakerHelper.generateEcoName()
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(ecoName);
      changeOrders.clickOnSubmitForApproval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out as admin and login with created user
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Go to open change order and Reject change order
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickRejectBtn();
      changeOrders.confirmRejection();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out and sign in with admin email
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      authApi.signin(email);

      // Go to change orders and verify the change order rejected by Manufacturer group user
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('user','REJECTED', userName);
    });

    it('Should be able to add user under Manufacturer group and able to close the change order', () => {
      const userData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "User",
        groupName : "Manufacturer"
      }
      const userName = userData.firstName + ' ' + userData.lastName
      const userEmail = fakerHelper.generateMailosaurEmail(userData.firstName, userData.lastName);

      // Create user in Manufacturer group
      navHelper.navigateToUsers();
      user.createUser(userData.firstName, userData.lastName, userEmail, userData.jobTitle, userData.role, userData.groupName)
      featureHelpers.waitForLoadingIconToDisappear();

      // Create a component and add it to the change order
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Manufacturer group user as an approver
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(userName);

      // Add CO name and click on submit for approval
      const ecoName = fakerHelper.generateEcoName()
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(ecoName);
      changeOrders.clickOnSubmitForApproval();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out as admin and login with created user
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Go to open change order and close change order
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnClose();
      changeOrders.confirmClose();
      featureHelpers.waitForLoadingIconToDisappear();

      // Sign out and sign in with admin email
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      authApi.signin(email);

      // Go to change orders and verify the change order closed by Manufacturer group user
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('user','CLOSED', userName);
    });
  });
});
