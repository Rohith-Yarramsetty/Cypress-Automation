import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { UsersApi } from "../../api/userApi";
import { ComponentApi } from "../../api/componentApi";
import { TableHelpers } from "../../helpers/tableHelper";
import { Export } from "../../pages/export";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Products } from "../../pages/products/products";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const changeOrders = new ChangeOrders();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const components = new Components();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const tableHelper = new TableHelpers();
const exports = new Export();
const featureHelper = new FeatureHelpers();
const product = new Products();
const compSettings = new CompanySettingsApi();

let email, companyName, companyId, orgId;

describe("ECO Resend package", {tags: ["ChangeOrder", "Resend_ChangeOrder"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    companyName = user.companyName;
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

  context("Product Module", () => {
    it("Should Resend ECO Package with Approvers, Notifiers and CC with Obsolete status", ()=>{
      const data = {
        name: fakerHelper.generateProductName(),
        status: constData.status.obsolete,
        ecodesc:'ecoDesc',
      }

      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;
      const approverEmail = approver.email;

      // Add users for Notifiers
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;
      const notifierEmail = notifier.email;

      // Navigate to Products tab
      nav.openProductTab();

      // Create new Product
      product.clickNewButton();
      product.enterProductName(data.name);
      product.selectLifeCycleStatus(data.status);
      product.clickCreateButton();
      product.clickSaveButtonInEditProduct();
      product.waitForLoadingIconToDisappear();
      product.clickOnChangeOrderIconInViewProduct();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal(data.ecodesc);
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();
        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from CC mail
        featureHelper.getExportEmailThroughSubject(date, ccMail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it("Should Resend ECO Package with Approvers, Notifiers and CC with Production status", ()=>{
      const data = {
        name: fakerHelper.generateProductName(),
        status: constData.status.production,
        ecodesc:'ecoDesc',
      }

      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;
      const approverEmail = approver.email;

      // Add users for Notifiers
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;
      const notifierEmail = notifier.email;

      // Navigate to Products tab
      nav.openProductTab();

      // Create new Product
      product.clickNewButton();
      product.enterProductName(data.name);
      product.selectLifeCycleStatus(data.status);
      product.clickCreateButton();
      product.clickSaveButtonInEditProduct();
      product.waitForLoadingIconToDisappear();
      product.clickOnChangeOrderIconInViewProduct();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal(data.ecodesc);
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();
        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from CC mail
        featureHelper.getExportEmailThroughSubject(date, ccMail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it("Should Resend ECO Package with Approvers, Notifiers and CC with Prototype status", ()=>{
      const data = {
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        ecodesc:'ecoDesc'
      }

      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;
      const approverEmail = approver.email;

      // Add users for Notifiers
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;
      const notifierEmail = notifier.email;

      // Navigate to Products tab
      nav.openProductTab();

      // Create new Product
      product.clickNewButton();
      product.enterProductName(data.name);
      product.selectLifeCycleStatus(data.status);
      product.clickCreateButton();
      product.clickSaveButtonInEditProduct();
      product.waitForLoadingIconToDisappear();
      product.clickOnChangeOrderIconInViewProduct();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal(data.ecodesc);
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();
        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from CC mail
        featureHelper.getExportEmailThroughSubject(date, ccMail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it("Should delete few Approvers from list and Resend Change Order", ()=>{
      const data = {
        name: fakerHelper.generateProductName(),
        status: constData.status.production,
        ecodesc:'ecoDesc'
      }

      // Add users for Approvers
      const approverName1 = userApi.createUserUsingApi().fullName
      const approver2 = userApi.createUserUsingApi();
      const approverName2 = approver2.fullName;
      const approverEmail = approver2.email;

      // Navigate to Products tab
      nav.openProductTab();

      // Create new Product
      product.clickNewButton();
      product.enterProductName(data.name);
      product.selectLifeCycleStatus(data.status);
      product.clickCreateButton();
      product.clickSaveButtonInEditProduct()
      product.waitForLoadingIconToDisappear()
      product.clickOnChangeOrderIconInViewProduct();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName1);
      changeOrders.addApproverToTemplate(approverName2);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal(data.ecodesc);
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Delete Approver and Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.clickOnRemoveIconInResendChangeOrderModal();
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();
        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it("Should delete few Notifiers from list and Resend Change Order", ()=>{
      const data = {
        name: fakerHelper.generateProductName(),
        status: constData.status.production,
        ecodesc:'ecoDesc'
      }

      //Add users for Notifiers
      const notifierName1 = userApi.createUserUsingApi().fullName;
      const notifier2 = userApi.createUserUsingApi();
      const notifierName2 = notifier2.fullName;
      const notifierEmail = notifier2.email;

      // Navigate to Products tab
      nav.openProductTab();

      // Create new Product
      product.clickNewButton();
      product.enterProductName(data.name);
      product.selectLifeCycleStatus(data.status);
      product.clickCreateButton();
      product.clickSaveButtonInEditProduct()
      product.waitForLoadingIconToDisappear()
      product.clickOnChangeOrderIconInViewProduct();

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName1);
      changeOrders.addNotifiersToTemplate(notifierName2);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal(data.ecodesc);
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Delete the Notifier and Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.clickOnRemoveIconInResendChangeOrderModal();
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();
        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from remaining Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })
  })

  context("Component Module", () => {
    it('Should Resend ECO Package with Approvers, Notifiers and CC with Prototype status', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;
      const approverEmail = approver.email;

      // Add users for Notifiers
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;
      const notifierEmail = notifier.email;

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();

        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from CC mail
        featureHelper.getExportEmailThroughSubject(date, ccMail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it('Should Resend ECO Package with Approvers, Notifiers and CC with Production status', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.production
      }
      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;
      const approverEmail = approver.email;

      // Add users for Notifiers
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;
      const notifierEmail = notifier.email

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();

        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from CC mail
        featureHelper.getExportEmailThroughSubject(date, ccMail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it('Should Resend ECO Package with Approvers, Notifiers and CC with Obsolete status', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.obsolete
      }
      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;
      const approverEmail = approver.email;

      // Add users for Notifiers
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;
      const notifierEmail = notifier.email;

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();

        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from CC mail
        featureHelper.getExportEmailThroughSubject(date, ccMail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it('Should Resend ECO Package only with Approvers', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Add users
      const approverName1 = userApi.createUserUsingApi().fullName;
      const approver2 = userApi.createUserUsingApi();
      const approverName2 = approver2.fullName;
      const approverEmail = approver2.email;

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName1);
      changeOrders.addApproverToTemplate(approverName2);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();

        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Approver mail
        featureHelper.getExportEmailThroughSubject(date, approverEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it('Should Resend ECO Package only with Notifiers', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Add user
      const notifierName1 = userApi.createUserUsingApi().fullName;
      const notifier2 = userApi.createUserUsingApi();
      const notifierName2 = notifier2.fullName;
      const notifierEmail = notifier2.email;

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Notifiers
      changeOrders.clickNotificationListTab();
      changeOrders.addApproverToTemplate(notifierName1);
      changeOrders.addApproverToTemplate(notifierName2);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();

        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from Notifier mail
        featureHelper.getExportEmailThroughSubject(date, notifierEmail, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it('Should Resend ECO Package only with CC', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      const ccMail1 = fakerHelper.generateMailosaurEmail();
      const ccMail2 = fakerHelper.generateMailosaurEmail();
      const ccMail3 = fakerHelper.generateMailosaurEmail();

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail1);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(`${ccMail2}, ${ccMail3}`);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail1);
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail2);
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail3);
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();

        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })

        // Verify Resend mail from CC mails
        featureHelper.getExportEmailThroughSubject(date, ccMail1, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
        featureHelper.getExportEmailThroughSubject(date, ccMail2, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
        featureHelper.getExportEmailThroughSubject(date, ccMail3, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it('Resend ECO package without adding Approvers, Notifiers and CC', () => {
      const componentData = {
        category: "EBOM",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Create Component
      compApi.createComponent(componentData);

      // Add component to change order
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Approve the Change Order
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.approveNewChangeOrder();
      featureHelper.waitForLoadingIconToDisappear();

      // Resend the Change Order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.verifyResendChangeOrderModalTitle();
      changeOrders.clickOnResendBtnInChangeOrderModal();
      changeOrders.verifyMailSentModalInResendCo();
      changeOrders.clickCrossBtnInPrepareCOMailModal();

      // Assert sent Resend change order mail
      changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
        const coName = name;
        const date = new Date();

        // Verify Resend mail from logged in user
        const mailSubject = `${coName} APPROVED from ${companyName}`
        featureHelper.getExportEmailThroughSubject(date, email, mailSubject).then((email) => {
          expect(email.subject).to.contain(mailSubject);
        })
      })

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })

    it('Validate the Approvers, Notifiers and CC email field in Resend Change Order modal', () => {
      const componentData = {
        category: "EBOM",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Add user for Approver
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;

      // Add user for Notifier
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;

      // Create Component
      compApi.createComponent(componentData);

      // Add component to change order
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add Approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add Notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve the Change Order
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.approveNewChangeOrder();
      featureHelper.waitForLoadingIconToDisappear();

      // Resend the Change Order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.verifyResendChangeOrderModalTitle();

      // Add Approvers & Notifiers
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();

      // Add CC Emails
      changeOrders.enterCcEmailInResendChangeOrderModal('test@durolabs.co, dev@durolabs.co');
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();

      // Verify Approvers, Notifiers, CC Email present in Resend CO Modal
      changeOrders.verifyUserPresentInResendChangeOrderModal(approverName);
      changeOrders.verifyUserPresentInResendChangeOrderModal(notifierName);
      changeOrders.verifyAnonymousEmailInResendChangeOrderModal('test@durolabs.co');
      changeOrders.verifyAnonymousEmailInResendChangeOrderModal('dev@durolabs.co');

      // Verify CC Email field
      changeOrders.verifyTextInCcEmailInResendChangeOrderModal("");
    })

    it('Cancel the Resend Change Order modal  with Approvers, Notifiers and CC', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approver = userApi.createUserUsingApi();
      const approverName = approver.fullName;

      // Add users for Notifiers
      const notifier = userApi.createUserUsingApi();
      const notifierName = notifier.fullName;

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();

      // Add approver list
      changeOrders.clickApproverList();
      changeOrders.addApproverToTemplate(approverName);

      // Add notifier list
      changeOrders.clickNotificationListTab();
      changeOrders.addNotifiersToTemplate(notifierName);

      // Approve Change order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      changeOrders.assertChangeOrder();

      // Resend Change order
      changeOrders.clickOnResendChangeOrderIcon();
      changeOrders.checkApproverCheckBoxInResendCoModal();
      changeOrders.checkNotifierCheckBoxInResendCoModal();
      changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnAddBtnForCcMailInResendCoModal();
      changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
      changeOrders.clickOnCancelBtnInResendChangeOrderModal();

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertRowNotPresentInTable('activity', 'RESENT');
    })

    it('Should Resend ECO Package and download export package from mail and assert', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }
      const ccMail = fakerHelper.generateMailosaurEmail();

      // Add users for Approvers
      const approverName = userApi.createUserUsingApi().fullName;

      // Add users for Notifiers
      const notifierName = userApi.createUserUsingApi().fullName;

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to change order and approve
      nav.openComponentsTab();
      featureHelper.getCpnValueFromTable(componentData.name, 1).then((value) => {
        let componentCpnValue = value
        tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
        components.clickOnChangeOrderIconInViewComponent();

        // Add approver list
        changeOrders.clickApproverList();
        changeOrders.addApproverToTemplate(approverName);

        // Add notifier list
        changeOrders.clickNotificationListTab();
        changeOrders.addNotifiersToTemplate(notifierName);

        // Approve Change order
        changeOrders.clickEcoIcon();
        changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
        changeOrders.enterDescInEcoModal('ecoDesc');
        changeOrders.approveNewChangeOrder();
        changeOrders.assertChangeOrder();

        // Resend Change order
        changeOrders.clickOnResendChangeOrderIcon();
        changeOrders.checkApproverCheckBoxInResendCoModal();
        changeOrders.checkNotifierCheckBoxInResendCoModal();
        changeOrders.enterCcEmailInResendChangeOrderModal(ccMail);
        changeOrders.clickOnAddBtnForCcMailInResendCoModal();
        changeOrders.verifyCcEmailInResendChangeOrderModal(ccMail);
        changeOrders.clickOnResendBtnInChangeOrderModal();
        changeOrders.verifyMailSentModalInResendCo();
        changeOrders.clickCrossBtnInPrepareCOMailModal();

        // Assert sent Resend change order mail
        changeOrders.getChangeOrderNameAfterResendCo().then((name) => {
          const coName = name;

          const date = new Date();
          const mailSubject = `${coName} APPROVED from ${companyName}`
          const exportEmail = featureHelper.getExportEmailThroughSubject(date, email, mailSubject);
          exportEmail.then(email => {
            expect(email.subject).to.contain(mailSubject);
            const download_file_link = email.html.links[1].href.toString();
            const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;

            // Download the exported file and unzip
            exports.downloadExportFileInExportEmail(download_file_link, fileName);
            let path = "cypress/downloads/";
            let file = fileName;
            cy.task('unzipping', { path, file });

            // Verify the data in xlsx file
            let folder = fileName.replace('.zip', '');
            exports.assertResendCoExportedDownloadedExcelFile(`cypress/downloads/unzip/${folder}/${folder}.xlsx`, componentData.name, componentCpnValue);
          });
        });
      });

      // Reload page
      cy.reload();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify Entry in history tab
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('activity', 'RESENT', 'RESENT');
    })
  })
})
