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

const faker = require('faker');
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

describe("Configuration settings: Mandatory Approvers", { tags:["Configuration_Settings", "Configuration_Products"] }, () => {
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

  context('Product Module', () => {
    it('Should add mandatory approvers for ECO type with Prototype status', () =>{
      let userId1, userId2, userId3, currentUserId;
      const templateName = fakerHelper.generateProductName();

      // Create users and template using API
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

      // Create Product and add it to change order
      const productName = fakerHelper.generateProductName()
      nav.openProductTab();
      products.createBasicProduct(productName, constData.status.prototype)
      products.clickOnChangeOrderIconInViewProduct();

      // Verify Mandatory template modal
      changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, 'Prototype', templateName);
      changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
      changeOrders.clickEcoIcon();

      // Verify Selected template for change order
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName);

      // Verify mandatory Approvers(Should not be removable)
      changeOrders.clickApproverList();
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
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
      changeOrders.assertApproverRemoveIconPresent(userName3);
    })

    it('Should add mandatory approvers for ECO type with Production status', () =>{
      let userId1, userId2, userId3, currentUserId;
      const templateName = fakerHelper.generateProductName();

      // Create users and template using API
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

      // Add Mandatory approvers template In ECO type-Production status dropdown
      user.enableMandatoryApprovalTemplatesToggle();
      user.clickOnSetUpBtn();
      user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.eco, constData.status.production);
      user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.production, templateName);
      user.clickSaveBtn();
      user.verifyEditBtnForMandatoryTemplates();

      // Create Product and add it to change order
      const productName = fakerHelper.generateProductName()
      nav.openProductTab();
      products.createBasicProduct(productName, constData.status.production)
      products.clickOnChangeOrderIconInViewProduct();

      // Verify Mandatory template modal
      changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, 'Production', templateName);
      changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
      changeOrders.clickEcoIcon();

      // Verify Selected template for change order
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName);

      // Verify mandatory Approvers(Should not be removable)
      changeOrders.clickApproverList();
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
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
      changeOrders.assertApproverRemoveIconPresent(userName3);
    })

    it('Should add mandatory approvers for MCO type with Prototype status', () =>{
      let userId1, userId2, userId3, currentUserId;
      const templateName = fakerHelper.generateProductName();

      // Create users and template using API
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

      // Add Mandatory approvers template In MCO type-Prototype status dropdown
      user.enableMandatoryApprovalTemplatesToggle();
      user.clickOnSetUpBtn();
      user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.prototype);
      user.selectTemplateFromDropdown(constData.coTypes.mco, constData.status.prototype, templateName);
      user.clickSaveBtn();
      user.verifyEditBtnForMandatoryTemplates();

      // Create Product and add it to change order
      const productName = fakerHelper.generateProductName()
      nav.openProductTab();
      products.createBasicProduct(productName, constData.status.prototype)
      products.clickOnChangeOrderIconInViewProduct();

      // Verify Mandatory template modal
      changeOrders.clickMcoIcon();
      changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.mco, 'Prototype', templateName);
      changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();

      // Verify Selected template for change order
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName);

      // Verify mandatory Approvers(Should not be removable)
      changeOrders.clickApproverList();
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
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
      changeOrders.assertApproverRemoveIconPresent(userName3);
    })

    it('Should add mandatory approvers for MCO type with Production status', () =>{
      let userId1, userId2, userId3, currentUserId;
      const templateName = fakerHelper.generateProductName();

      // Create users and template using API
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

      // Add Mandatory approvers template In MCO type-Production status dropdown
      user.enableMandatoryApprovalTemplatesToggle();
      user.clickOnSetUpBtn();
      user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.mco, constData.status.production);
      user.selectTemplateFromDropdown(constData.coTypes.mco, constData.status.production, templateName);
      user.clickSaveBtn();
      user.verifyEditBtnForMandatoryTemplates();

      // Create Product and add it to change order
      const productName = fakerHelper.generateProductName();
      nav.openProductTab();
      products.createBasicProduct(productName, constData.status.production);
      products.clickOnChangeOrderIconInViewProduct();

      // Verify mandatory template modal
      changeOrders.clickMcoIcon();
      changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.mco,'Production', templateName);
      changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();

      // Verify mandatory Approvers(Should not be removable)
      changeOrders.clickApproverList();
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
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
      changeOrders.assertApproverRemoveIconPresent(userName3);
    })

    it('Should add mandatory approvers for DCO type with Prototype status', () =>{
      let userId1, userId2, userId3, currentUserId;
      const templateName = fakerHelper.generateProductName();

      // Create users and template using API
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

      // Add Mandatory approvers template In DCO type-Prototype status dropdown
      user.enableMandatoryApprovalTemplatesToggle();
      user.clickOnSetUpBtn();
      user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.prototype);
      user.selectTemplateFromDropdown(constData.coTypes.dco, constData.status.prototype, templateName);
      user.clickSaveBtn();
      user.verifyEditBtnForMandatoryTemplates();

      // Create Product and add it to change order
      const productName = fakerHelper.generateProductName()
      nav.openProductTab();
      products.createBasicProduct(productName, constData.status.prototype)
      products.clickOnChangeOrderIconInViewProduct();

      // Verify Mandatory template modal
      changeOrders.clickDcoIcon();
      changeOrders.clickOkBtnInDcoWarningModal();
      changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.dco, 'Prototype', templateName);
      changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();

      // Verify Selected template for change order
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName);

      // Verify mandatory Approvers(Should not be removable)
      changeOrders.clickApproverList();
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
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
      changeOrders.assertApproverRemoveIconPresent(userName3);
    })

    it('Should add mandatory approvers for DCO type with Production status', () =>{
      let userId1, userId2, userId3, currentUserId;
      const templateName = fakerHelper.generateProductName();

      // Create users and template using API
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

      // Add Mandatory approvers template In DCO type-Production status dropdown
      user.enableMandatoryApprovalTemplatesToggle();
      user.clickOnSetUpBtn();
      user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.dco, constData.status.production);
      user.selectTemplateFromDropdown(constData.coTypes.dco, constData.status.production, templateName);
      user.clickSaveBtn();
      user.verifyEditBtnForMandatoryTemplates();

      // Create Product and add it to change order
      const productName = fakerHelper.generateProductName()
      nav.openProductTab();
      products.createBasicProduct(productName, constData.status.production)
      products.clickOnChangeOrderIconInViewProduct();

      // Verify Mandatory template modal
      changeOrders.clickDcoIcon();
      changeOrders.clickOkBtnInDcoWarningModal();
      changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.dco, 'Production', templateName);
      changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();

      // Verify Selected template for change order
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName);

      // Verify mandatory Approvers(Should not be removable)
      changeOrders.clickApproverList();
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
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName3, userName3);
      changeOrders.assertApproverRemoveIconPresent(userName3);
    })

    it('Should not add mandatory approvers for Obsolete status Product', () => {
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
      })

      // Navigate to Configuration page
      navHelper.navigateToConfiguration();

      // Add Mandatory approver templates to all dropdowns
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

      // Create a product and add it to change order
      nav.openProductTab();
      const productName = fakerHelper.generateProductName()
      products.createBasicProduct(productName, constData.status.obsolete)
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.clickEcoIcon();

      // Verify Approvers remove icon
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(userName1);
      changeOrders.addApproverToTemplate(userName2);
      changeOrders.addApproverToTemplate(userName3);
      changeOrders.assertApproverRemoveIconPresent(userName1);
      changeOrders.assertApproverRemoveIconPresent(userName2);
      changeOrders.assertApproverRemoveIconPresent(userName3);
      changeOrders.assertApproverRemoveIconNotPresent(userName);
    })

    it('Should show the mandatory templates based on the product added to the change order', () => {
      // Create users and template with approvers and notifier
      let userId1, userId2, userId3, userId4, userId5, currentUserId;
      const templateName1 = fakerHelper.generateProductName();
      const templateName2 = fakerHelper.generateProductName();
      const templateName3 = fakerHelper.generateProductName();

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
      const user5 = userApi.createUserUsingApi("USER", ["SUPPLIER"])
      user5.userId.then((res) => { userId5 = res.body[0].data.createUser.id })
      const userName5 = user5.fullName
      userApi.getCurrentUser().then((res) => {
        currentUserId = res.body.data._id;
        const approversList1 = [currentUserId, userId1];
        const approversList2 = [currentUserId, userId2];
        const approversList3 = [currentUserId, userId5];
        const notifiersList1 = [userId3];
        const notifiersList2 = [userId4];

        const externalUsers = [fakerHelper.generateMailosaurEmail()];
        const isPublic = true;
        coTempApi.coTemplate(templateName1, approversList1, notifiersList1, externalUsers, isPublic);
        coTempApi.coTemplate(templateName2, approversList2, notifiersList2, externalUsers, isPublic);
        coTempApi.coTemplate(templateName3, approversList3, [], [], isPublic);
      })

      // Navigate to Configuration page
      navHelper.navigateToConfiguration();

      // Add Mandatory approvers template to ECO type-Prototype status dropdown
      user.enableMandatoryApprovalTemplatesToggle();
      user.clickOnSetUpBtn();
      user.clickOnMandatoryApproverTemplateDropdown();
      user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.prototype, templateName1);
      user.clickOnMandatoryApproverTemplateDropdown(constData.coTypes.eco, constData.status.production);
      user.selectTemplateFromDropdown(constData.coTypes.eco, constData.status.production, templateName2);
      user.clickSaveBtn();
      user.verifyEditBtnForMandatoryTemplates();

      // Create two products with Prototype and Production statuses
      nav.openProductTab();
      const productName1 = fakerHelper.generateProductName();
      const productName2 = fakerHelper.generateProductName();
      products.createBasicProduct(productName1, constData.status.prototype);
      featureHelper.waitForLoadingIconToDisappear();

      nav.openProductTab();
      products.createBasicProduct(productName2, constData.status.production);
      featureHelper.waitForLoadingIconToDisappear();
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();

      // Add Prototype Product and verify selected template
      changeOrders.searchAndCheckComponentInNewChangeOrder(productName1, true);
      changeOrders.verifyMandatoryTemplateInfoModal(constData.coTypes.eco, 'Prototype', templateName1);
      changeOrders.clickOnGotItBtnInMandatoryApproverTemplateModal();
      changeOrders.clickEcoIcon();
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName1);

      // Verify Approvers
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
      changeOrders.assertApproverRemoveIconNotPresent(userName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName1, userName1);
      changeOrders.assertApproverRemoveIconNotPresent(userName1);

      // Add Production component and verify selected template
      changeOrders.clickOnProductsAndComponentsTab();
      changeOrders.searchAndCheckComponentInNewChangeOrder(productName2, true);
      changeOrders.verifyMandatoryTemplateToast('Mandatory Approvers Updated', templateName2);
      changeOrders.clickEcoIcon();
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName2);

      // Verify Approvers
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName, userName);
      changeOrders.assertApproverRemoveIconNotPresent(userName);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName2, userName2);
      changeOrders.assertApproverRemoveIconNotPresent(userName2);

      // Add extra user as an approver and verify mandatory approver
      changeOrders.addApproverToTemplate(userName5);
      tableHelper.assertTextInCell(constData.changeOrderTableHeaders.users, userName5, userName5);
      changeOrders.assertApproverRemoveIconPresent(userName5);

      // Remove Production status component and verify Extra added approver
      changeOrders.clickOnProductsAndComponentsTab();
      changeOrders.removeProductOrComponentFromNewCo(productName2);
      changeOrders.verifyMandatoryTemplateToast('Mandatory Approvers Updated', templateName1);

      // Verify selected Template in the dropdown
      changeOrders.clickApproverList();
      changeOrders.verifySelectedTemplateForNewCo(templateName1);
    })
  })
})
