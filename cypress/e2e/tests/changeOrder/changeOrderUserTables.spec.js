import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { Navigation } from "../../pages/navigation";
import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { FakerHelpers } from "../../helpers/fakerHelper";
import constData from "../../helpers/pageConstants";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { UsersApi } from "../../api/userApi";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const changeOrders = new ChangeOrders();
const nav = new Navigation();
const authApi = new AuthApi();
const signin = new SignIn();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const userApi = new UsersApi();
const compSettings = new CompanySettingsApi();

let email, companyId, authorName, orgId;

describe('ChangeOrder Approver List Table Module', {tags: ["ChangeOrder", "ChangeOrder_User_Tables", "Users"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id});
    authorName = user.fullName;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('User with Administrator role can be added to a CO Approvers Table', () => {
    // Create an user with role ADMIN
    const user = userApi.createUserUsingApi('ADMINISTRATOR');

    // Navigate to Change Order tab
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify ADMIN can be added as Approver to CO
    changeOrders.clickApproverList();
    changeOrders.addApproverToTemplate(`${user.firstName} ${user.lastName}`);
    changeOrders.verifyUserPresentInApproverTable(`${user.firstName} ${user.lastName}`);

    // Create the Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('Desc related to CO');
    changeOrders.clickSaveDraft();
  })

  it('User with Approver role can be added to a CO Approvers Table', () => {
    // Create an user with role APPROVER
    const user = userApi.createUserUsingApi('APPROVER');

    // Navigate to Change Order tab
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify APPROVER can be added as Approver to CO
    changeOrders.clickApproverList();
    changeOrders.addApproverToTemplate(`${user.firstName} ${user.lastName}`);
    changeOrders.verifyUserPresentInApproverTable(`${user.firstName} ${user.lastName}`);

    // Create the Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('Desc related to CO');
    changeOrders.clickSaveDraft();
  })

  it('User with User role can be added to a CO Approvers Table', () => {
    // Create an user with role USER
    const user = userApi.createUserUsingApi('USER');

    // Navigate to Change Order tab
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify USER can be added as Approver to CO
    changeOrders.clickApproverList();
    changeOrders.addApproverToTemplate(`${user.firstName} ${user.lastName}`);
    changeOrders.verifyUserPresentInApproverTable(`${user.firstName} ${user.lastName}`);

    // Create the Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('Desc related to CO');
    changeOrders.clickSaveDraft();
  })

  it('User with Reviewer role can not be added to a CO Approvers Table', () => {
    // Create an user with role REVIEWER
    const user = userApi.createUserUsingApi('REVIEWER');


    // Navigate to Change Order tab
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify REVIEWER cannot be added as Approver to CO
    changeOrders.clickApproverList();
    changeOrders.verifyCheckBoxDisabled(`${user.firstName} ${user.lastName}`);
    changeOrders.verifyUserNotPresentInApproverTable(`${user.firstName} ${user.lastName}`);
  })

  it('Author of CO should automatically add in approver-list correctly', () => {
    // Invite an Approver
    const approver = userApi.createUserUsingApi();
    const approverEmail = approver.email;
    const approverName = approver.fullName;
    const ecoName = fakerHelper.generateEcoName();

    // Navigate to CO & add approver
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.clickApproverList();
    changeOrders.addApproverToTemplate(approverName);

    // Create a Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(ecoName);
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.clickSaveDraft();

    // Signin with approvers account
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(approverEmail);
    authApi.signin(approverEmail);
    navHelper.navigateToSearch();

    // Verify Author added as Approver
    nav.openChangeOrdersTab();
    tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
    changeOrders.clickEditIcon();
    changeOrders.clickApproverList();
    changeOrders.verifyUserPresentInApproverTable(authorName);
  })

  it('Author of CO should not be able to be removed from approver list', () => {
    // Invite an Approver
    const approver = userApi.createUserUsingApi();
    const approverEmail = approver.email;
    const approverName = approver.fullName;
    const ecoName = fakerHelper.generateEcoName();

    // Navigate to CO & add approver
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.clickApproverList();
    changeOrders.addApproverToTemplate(approverName);

    // Create a Change Order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(ecoName);
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.clickSaveDraft();

    // Signin with approvers account
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(approverEmail);
    authApi.signin(approverEmail);
    navHelper.navigateToSearch();

    // Verify Author cannot be removed as Approver
    nav.openChangeOrdersTab();
    tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
    changeOrders.clickEditIcon();
    changeOrders.clickApproverList();
    changeOrders.verifyUserPresentInApproverTable(authorName);
    changeOrders.assertApproverRemoveIconNotPresent(authorName);
  })
})

describe('Change Order Notification List Table Module', {tags: ["ChangeOrder", "ChangeOrder_User_Tables", "Users"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id});
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should add the external user in notification list successfully', () => {
    const extEmail1 = fakerHelper.generateMailosaurEmail();
    const extEmail2 = fakerHelper.generateMailosaurEmail();
    const ecoName = fakerHelper.generateEcoName();

    // Navigate to Change Order tab
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Enter Notifier Emails of External users
    changeOrders.clickNotificationListTab();
    changeOrders.enterEmailInNotificationList(`${extEmail1},${extEmail2}`);
    changeOrders.clickAddEmailBtn();

    // Create Change Order
    changeOrders.clickEcoIcon()
    changeOrders.enterNameInEcoModal(ecoName);
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.clickSaveDraft();

    // Verify Notifiers added
    nav.openChangeOrdersTab();
    tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
    changeOrders.clickNotificationListTab();
    tableHelper.assertRowPresentInTable(constData.changeOrderTableHeaders.emails, extEmail1);
    tableHelper.assertRowPresentInTable(constData.changeOrderTableHeaders.emails, extEmail2);
  })

  it('Should add the internal company user in notification list successfully', () => {
    // Create Internal Company Users
    const user1FullName = userApi.createUserUsingApi().fullName;
    const user2FullName = userApi.createUserUsingApi().fullName;
    const ecoName = fakerHelper.generateEcoName();

    // Navigate to Change Order tab
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();

    // Add Notifiers to CO
    changeOrders.clickNotificationListTab();
    changeOrders.addNotifiersToTemplate(user1FullName);
    changeOrders.addNotifiersToTemplate(user2FullName);

    // Create Change Order
    changeOrders.clickEcoIcon()
    changeOrders.enterNameInEcoModal(ecoName);
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.clickSaveDraft();

    // Verify Notifiers added
    nav.openChangeOrdersTab();
    tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);
    changeOrders.clickNotificationListTab();
    tableHelper.assertRowPresentInTable(constData.changeOrderTableHeaders.users, user1FullName);
    tableHelper.assertRowPresentInTable(constData.changeOrderTableHeaders.users, user2FullName);
  })
})
