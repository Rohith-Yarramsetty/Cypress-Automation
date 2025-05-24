import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { Headers } from "../../pages/headers";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Products } from "../../pages/products/products";
import { TableHelpers } from "../../helpers/tableHelper";
import { Users } from "../../pages/accountSettings/users";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { UsersApi } from "../../api/userApi";

const users = new Users();
const signin = new SignIn();
const nav = new Navigation();
const headers = new Headers();
const authApi = new AuthApi();
const products = new Products();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const tableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Mandatory CO Comment Module", {tags: ["ChangeOrder", "Mandatory_Comments", "Configuration_Settings"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateCompanySettings(companyId, compPayloads.isConfigurationsEnabled(true))
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context('CO Comment Mandatory Disabled', () => {
    it('Verify change order comment mandatory toggle in configuration page', () => {
      navHelper.navigateToSearch();

      // Navigate to Account Settings
      headers.clickOnAvatarIcon();
      headers.clickOnAccountSettings();

      // Navigate to Configuration tab
      users.clickOnConfiguration();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify toggle present
      users.verifyMandatoryCommentsToggleBtnPresent();
    })

    it('Should verify changeOrder comment modal when a component is added and Approving the CO', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.disableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Approve the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickApproveBtn();

      // Verify Confirm btn & tooltip
      changeOrders.verifyApproveBtnEnabledInConfirmApprovalModal();
      changeOrders.verifyConfirmApproveBtnTooltip('');
    })

    it('Should verify changeOrder comment modal when a component is added and Rejecting the CO', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.disableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Reject the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickRejectBtn();

      // Verify Confirm btn & tooltip
      changeOrders.verifyRejectBtnEnabledInConfirmRejectionModal();
      changeOrders.verifyConfirmRejectBtnTooltip('');
    })

    it('Should verify changeOrder comment modal when a product is added and Closing the CO', () => {
      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.disableMandatoryCommentsToggleBtn();

      // Create a Product & add to CO
      const prodName = fakerHelper.generateProductName();
      nav.openProductTab();
      products.clickNewButton();
      products.enterProductName(prodName);
      products.selectLifeCycleStatus(constData.status.prototype);
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();
      products.clickOnChangeOrderIconInViewProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Approve the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickOnClose();

      // Verify Confirm btn & tooltip
      changeOrders.verifyCloseBtnEnabledInConfirmCloseModal();
      changeOrders.verifyConfirmCloseBtnTooltip('');
    })
  })

  context('CO Comment Mandatory Enabled', () => {
    it('Should comment on changeOrder when a product is added and Approving the CO', () => {
      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.enableMandatoryCommentsToggleBtn();

      // Create a Product & add to CO
      const prodName = fakerHelper.generateProductName();
      nav.openProductTab();
      products.clickNewButton();
      products.enterProductName(prodName);
      products.selectLifeCycleStatus(constData.status.obsolete);
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();
      products.clickOnChangeOrderIconInViewProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Approve the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();

      // Verify Confirm btn & tooltip
      changeOrders.clickApproveBtn();
      changeOrders.verifyApproveBtnDisabledInConfirmApprovalModal();
      changeOrders.verifyConfirmApproveBtnTooltip('Comments are required before submitting your decision');

      // Add the Comment
      changeOrders.addCommentInConfirmDecisionCoModal('Approving the Change Order');

      // Verify Confirm btn & tooltip
      changeOrders.verifyApproveBtnEnabledInConfirmApprovalModal();
      changeOrders.verifyConfirmApproveBtnTooltip('');
    })

    it('Should comment on changeOrder when a product is added and Rejecting the CO', () => {
      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.enableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      const prodName = fakerHelper.generateProductName();
      nav.openProductTab();
      products.clickNewButton();
      products.enterProductName(prodName);
      products.selectLifeCycleStatus(constData.status.obsolete);
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();
      products.clickOnChangeOrderIconInViewProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Reject the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();

      //// Verify Confirm btn & tooltip
      changeOrders.clickRejectBtn();
      changeOrders.verifyRejectBtnDisabledInConfirmRejectionModal();
      changeOrders.verifyConfirmRejectBtnTooltip('Comments are required before submitting your decision');

      // Add the Comment
      changeOrders.addCommentInConfirmDecisionCoModal('Rejecting the Change Order');

      // Verify Confirm btn & tooltip
      changeOrders.verifyRejectBtnEnabledInConfirmRejectionModal();
      changeOrders.verifyConfirmRejectBtnTooltip('');
    })

    it('Should comment on changeOrder when a component is added and Closing the CO', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.production
      }

      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.enableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Close the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickOnClose();

      // Verify Confirm btn & tooltip
      changeOrders.verifyCloseBtnDisabledInConfirmCloseModal();
      changeOrders.verifyConfirmCloseBtnTooltip('Comments are required before submitting your decision');

      // Enter the Comment
      changeOrders.addCommentInConfirmDecisionCoModal('Closing the Change Order');

      // Verify Confirm btn & tooltip
      changeOrders.verifyCloseBtnEnabledInConfirmCloseModal();
      changeOrders.verifyConfirmCloseBtnTooltip('');
    })

    it('Should verify the comment in history table when a component is added and Approving the CO', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.obsolete
      }

      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.enableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Approve the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickApproveBtn();

      // Verify Confirm btn & tooltip
      changeOrders.verifyApproveBtnDisabledInConfirmApprovalModal();
      changeOrders.verifyConfirmApproveBtnTooltip('Comments are required before submitting your decision');

      // Enter the Comment
      changeOrders.addCommentInConfirmDecisionCoModal('Approving the Change Order');

      // Verify Confirm btn & tooltip
      changeOrders.verifyApproveBtnEnabledInConfirmApprovalModal();
      changeOrders.verifyConfirmApproveBtnTooltip('');

      // Close the Change Order
      changeOrders.confirmAprroval();
      changeOrders.verifyClosedStatusOptnwithApproval();

      // Verify the comment in Hstory table
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('comment', 'APPROVED', 'Approving the Change Order');
    })

    it('Should verify the comment in history table when a component is added and Rejecting the CO', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.enableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Reject the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickRejectBtn();

      // Verify Confirm btn & tooltip
      changeOrders.verifyRejectBtnDisabledInConfirmRejectionModal();
      changeOrders.verifyConfirmRejectBtnTooltip('Comments are required before submitting your decision');

      // Enter the Comment
      changeOrders.addCommentInConfirmDecisionCoModal('Rejecting the Change Order');

      // Verify Confirm btn & tooltip
      changeOrders.verifyRejectBtnEnabledInConfirmRejectionModal();
      changeOrders.verifyConfirmRejectBtnTooltip('');

      // Close the Change Order
      changeOrders.confirmRejection();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.clickOnClose();
      changeOrders.addCommentInConfirmDecisionCoModal('Closing the Change Order');
      changeOrders.confirmClose();
      changeOrders.verifyClosedStatusOptnwithRejection();

      // Verify the comment in Hstory table
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('comment', 'REJECTED', 'Rejecting the Change Order');
      tableHelper.assertTextInCell('comment', 'CLOSED', 'Closing the Change Order');
    })

    it('Should verify the comment in history table when a component is added and Closing the CO', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype
      }

      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.enableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Close the Change Order
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickOnClose();

      // Verify Confirm btn & tooltip
      changeOrders.verifyCloseBtnDisabledInConfirmCloseModal();
      changeOrders.verifyConfirmCloseBtnTooltip('Comments are required before submitting your decision');

      // Enter the Comment
      changeOrders.addCommentInConfirmDecisionCoModal('Closing the Change Order');

      // Verify Confirm btn & tooltip
      changeOrders.verifyCloseBtnEnabledInConfirmCloseModal();
      changeOrders.verifyConfirmCloseBtnTooltip('');

      // Close the Change Order
      changeOrders.confirmClose();
      changeOrders.assertNoneBtn();

      // Verify the comment in Hstory table
      changeOrders.clickOnHistoryTabInViewChangeOrder();
      tableHelper.assertTextInCell('comment', 'CLOSED', 'Closing the Change Order');
    })

    it('Verify the title of changeOrder comment modal', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.obsolete,
      }

      // Disable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.disableMandatoryCommentsToggleBtn();

      // Create a Component & add to CO
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Create the Change Order
      const ecoName = fakerHelper.generateEcoName();
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(ecoName);
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.clickOnSubmitForApproval();

      // Verify sub-heading in approve CO modal
      changeOrders.clickApproveBtn();
      changeOrders.verifyConfirmDecisionModalSubHeading('Add a comment before submitting your decision.');
      changeOrders.clickCancelBtnInConfirmDecisionModal();

      // Verify sub-heading in reject CO modal
      changeOrders.clickRejectBtn();
      changeOrders.verifyConfirmDecisionModalSubHeading('Add a comment before submitting your decision.');
      changeOrders.clickCancelBtnInConfirmDecisionModal();

      // Verify sub-heading in close CO modal
      changeOrders.clickOnClose();
      changeOrders.verifyConfirmDecisionModalSubHeading('Add a comment before submitting your decision.');
      changeOrders.clickCancelBtnInConfirmDecisionModal();

      // Enable Comment Mandatory toggle
      nav.navigateToConfiguration();
      featureHelper.waitForLoadingIconToDisappear();
      users.enableMandatoryCommentsToggleBtn();
      nav.openChangeOrdersTab();
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, ecoName);

      // Verify sub-heading in approve CO modal
      changeOrders.clickApproveBtn();
      changeOrders.verifyConfirmDecisionModalSubHeading('Comments are required before submitting your decision');
      changeOrders.clickCancelBtnInConfirmDecisionModal();

      // Verify sub-heading in reject CO modal
      changeOrders.clickRejectBtn();
      changeOrders.verifyConfirmDecisionModalSubHeading('Comments are required before submitting your decision');
      changeOrders.clickCancelBtnInConfirmDecisionModal();

      // Verify sub-heading in close CO modal
      changeOrders.clickOnClose();
      changeOrders.verifyConfirmDecisionModalSubHeading('Comments are required before submitting your decision');
      changeOrders.clickCancelBtnInConfirmDecisionModal();
    })
  })
})
