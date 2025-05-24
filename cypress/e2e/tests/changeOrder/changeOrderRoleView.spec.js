import { TableHelpers } from "../../helpers/tableHelper";
import { ComponentApi } from "../../api/componentApi";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { FakerHelpers } from "../../helpers/fakerHelper";
import constData from "../../helpers/pageConstants";
import { UsersApi } from "../../api/userApi"
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FeatureHelpers } from "../../helpers/featureHelper";

const tableHelper = new TableHelpers();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const changeOrders = new ChangeOrders();
const components = new Components();
const nav = new Navigation();
const authApi = new AuthApi();
const faker = require('faker');
const signin = new SignIn();
const userApi = new UsersApi();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

describe('ChangeOrder Tests', {tags: ["ChangeOrder", "ChangeOrder_Role_View", "Roles", "Users"]}, () => {
  let userEmail, approverEmail, draftUrl;
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    navHelper.navigateToSearch();
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })

    // Invite users of each role
    let emails      = userApi.createUserForEachRole();
    userEmail       = emails.usersEmail;
    approverEmail   = emails.approversEmail;
    userApi.acceptInvitation(userEmail);
    userApi.acceptInvitation(approverEmail);

    // Create a component & add to CO
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory();
    components.enterComponentName('CMP_1');
    components.selectStatus();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    components.clickOnChangeOrderIconInViewComponent();

    // Create a changeOrder
    changeOrders.enterNameInEcoModal('TEST_ECO');
    changeOrders.enterDescInEcoModal('Desc related to changeOrder');
    changeOrders.clickSaveDraft();

    // Get the draft page URL
    featureHelper.waitForLoadingIconToDisappear();
    cy.url().then(function (url) {
      draftUrl = url.split(Cypress.config('baseUrl'))[1];
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context('ChangeOrder Edit Module', () => {
    it('Author can view change order edit and delete icons', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to Change order 
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Create Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.clickSaveDraft();

      // Verify Edit & Delete icons
      changeOrders.verifyEditBtnInViewChangeOrder();
      changeOrders.verifyDeleteBtnInViewChangeOrder();
    })
  })

  context('ChangeOrder Administrator Override Module', () => {
    it('Administrator should be able to close CO if not present in approver list', () => {
      const cmpData = {
        name: fakerHelper.generateProductName(),
        category: "Capacitor",
        status: constData.status.prototype,
      }

      // Create component using API
      compApi.createComponent(cmpData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);

      // Add component to Change order
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Create Change Order
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.clickOnSubmitForApproval();
      featureHelper.waitForLoadingIconToDisappear();

      // Capture the Change Order URL
      cy.url().then(url => {
        let coUrl = url.split(Cypress.config('baseUrl'));
        return coUrl[1];
      }).as('partialUrl')

      // Create user with Administrator role
      const user = userApi.createUserUsingApi('ADMINISTRATOR');
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(user.email);
      authApi.signin(user.email);
      navHelper.navigateToSearch();

      // Navigate to the Change Order URL
      cy.get('@partialUrl').then((url) => {
        cy.visit(url);
      })
      featureHelper.waitForLoadingIconToDisappear();

      // verifyy the Buttons in View CO
      changeOrders.verifyApproveButtonNotPresent();
      changeOrders.verifyRejectButtonNotPresent();
      changeOrders.verifyCloseButtonPresent();

      // Close the CO
      changeOrders.clickOnClose();
      changeOrders.confirmClose();
      changeOrders.assertNoneBtn();
    })

    it('Administrator should be able to edit & delete CO if not present in approver list', () => {
      const cmpData = {
        name: fakerHelper.generateProductName(),
        category: "Fan",
        status: constData.status.production,
      }

      // Create component using API
      compApi.createComponent(cmpData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);

      // Add component to Change order
      components.clickOnChangeOrderIconInViewComponent();

      // Create Change Order
      changeOrders.enterNameInEcoModal('New Change Order');
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.clickSaveDraft();
      featureHelper.waitForLoadingIconToDisappear();

      // Capture the Change Order URL
      cy.url().then(url => {
        let coUrl = url.split(Cypress.config('baseUrl'));
        return coUrl[1];
      }).as('partialUrl')

      // Invite a user with role Administrator
      const user = userApi.createUserUsingApi('ADMINISTRATOR');
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(user.email);
      authApi.signin(user.email);
      navHelper.navigateToSearch();

      // Navigate to previous CO URL
      cy.get('@partialUrl').then((url) => {
        cy.visit(url);
      })
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the buttons in view CO
      changeOrders.verifyEditBtnInViewChangeOrder();
      changeOrders.verifyDeleteBtnInViewChangeOrder();

      // Edit & verify the name of CO
      changeOrders.verifyNameInViewMode('New Change Order');
      changeOrders.clickEditIcon();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.enterNameInEcoModal('Updated Change Order');
      changeOrders.enterDescInEcoModal('Desc related to CO');
      changeOrders.verifyStatusInChangeOrderTable(cmpData.name, cmpData.status);
      changeOrders.verifySaveDraftBtnEnabled();
      changeOrders.clickSaveDraft();
      changeOrders.verifyNameInViewMode('Updated Change Order');

      // Delete & verify the Change Order
      changeOrders.clickOnDelete();
      changeOrders.confirmDelete();
      tableHelper.assertRowNotPresentInTable(constData.changeOrderTableHeaders.name, 'Updated Change Order');
    })
  })

  context("Change Order View Module", () => {
    it("Administrator should be able to view change order",  () => {
      const cmpData = {
        name: fakerHelper.generateProductName(),
        status: constData.status.obsolete,
        ecodesc:'ecoDesc',
        ecoName: fakerHelper.generateEcoName()
      }

      // Create a Component
      compApi.createComponent(cmpData);

      // Add component to CO
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Create a Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(cmpData.ecoName);
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickSaveDraft();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.getChangeOrderNameAfterResendCo().as('CON');

      // Login again with same account
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      authApi.signin(email);
      navHelper.navigateToSearch();

      // Verify Change Order
      nav.openChangeOrdersTab();
      tableHelper.assertRowPresentInTable(constData.changeOrderTableHeaders.name, cmpData.ecoName);
      cy.get('@CON').then((CON) => {
        tableHelper.clickOnCell(constData.changeOrderTableHeaders.con, CON);
      })
      changeOrders.verifyNameInViewMode(cmpData.ecoName);
    })

    it('Approver added to CO can view change order', () => {
      const approver = userApi.createUserUsingApi();
      const cmpData = {
        name: fakerHelper.generateProductName(),
        status: constData.status.obsolete,
        ecodesc:'ecoDesc',
        ecoName: fakerHelper.generateEcoName()
      }

      // Create a Component
      compApi.createComponent(cmpData);

      // Add component to CO
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Approver to CO
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approver.fullName);

      // Create a Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(cmpData.ecoName);
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickSaveDraft();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.getChangeOrderNameAfterResendCo().as('CON');

      // Login with Approver account
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(approver.email);
      authApi.signin(approver.email);
      navHelper.navigateToSearch();

      // Verify Change Order
      nav.openChangeOrdersTab();
      tableHelper.assertRowPresentInTable(constData.changeOrderTableHeaders.name, cmpData.ecoName);
      cy.get('@CON').then((CON) => {
        tableHelper.clickOnCell(constData.changeOrderTableHeaders.con, CON);
      })
      changeOrders.verifyNameInViewMode(cmpData.ecoName);
    })

    it('User added to CO can view change order', () => {
      Cypress.session.clearAllSavedSessions();
      authApi.signin(userEmail);
      navHelper.navigateToSearch();

      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.con, 'TEST_ECO');
      cy.url().should('include', draftUrl);
    })

    it('User not added to CO can not view CO action icons', () => {
      // Create a component & add to CO
      compApi.createComponent({name: 'TEST_COMP_2', status: 'PROTOTYPE'});
      components.navigateToComponentViewPage('TEST_COMP_2', false);
      components.clickOnChangeOrderIconInViewComponent();

      // Submit the CO
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('Desc related to the changeOrder');
      changeOrders.clickOnSubmitForApproval();

      // Verify the actions icons present
      changeOrders.verifyApproveButtonPresent();
      changeOrders.verifyRejectButtonPresent();
      changeOrders.verifyCloseButtonPresent();
      cy.url().then(function (url) {
        url = url.split(Cypress.config('baseUrl'))[1];

        // Login with role user
        authApi.signOut();
        Cypress.session.clearAllSavedSessions();
        authApi.signin(userEmail);
        navHelper.navigateToSearch();
        cy.visit(url);

        // Verify the actions icons not present
        featureHelper.waitForLoadingIconToDisappear();
        changeOrders.verifyApproveButtonNotPresent();
        changeOrders.verifyRejectButtonNotPresent();
        changeOrders.verifyCloseButtonNotPresent();

        // Login with role approver
        authApi.signOut();
        Cypress.session.clearAllSavedSessions();
        authApi.signin(approverEmail);
        navHelper.navigateToSearch();
        cy.visit(url);

        // Verify the actions icons not present
        featureHelper.waitForLoadingIconToDisappear();
        changeOrders.verifyApproveButtonNotPresent();
        changeOrders.verifyRejectButtonNotPresent();
        changeOrders.verifyCloseButtonNotPresent();
      })
    })
  })
})
