import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelper = new TableHelpers();
const changeOrders = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
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

describe('Change order input field validations module', {tags: ["ChangeOrder", "Input_Field_Validation"]}, () => {
  it('ECO name field validation', () => {
    // Navigateto Change Order
    nav.openChangeOrdersTab();

    // Verify Name in New Change Order
    changeOrders.clickNewBtn();
    changeOrders.enterNameInEcoModal('New Change Order');
    changeOrders.verifyNameTooltip("");
    changeOrders.verifySaveDraftBtnEnabled();

    // Verify Name tooltip with 0 chars
    changeOrders.removeEcoName();
    changeOrders.verifyNameTooltip('Must contain at least 1 character');
    changeOrders.verifySaveDraftBtnDisabled();

    // Verify Name tooltip with 101 chars
    changeOrders.enterNameInEcoModal(fakerHelper.getRandomStringOfCharacters(101));
    changeOrders.verifyNameTooltip('Should be less than 101 characters');
    changeOrders.verifySaveDraftBtnDisabled();

    // Verify Name tooltip with 41 chars
    const name = fakerHelper.getRandomStringOfCharacters(41);
    changeOrders.enterNameInEcoModal(name);
    changeOrders.verifyNameTooltip("");
    changeOrders.verifySaveDraftBtnEnabled();

    // Verify Name in View mode
    changeOrders.clickSaveDraft();
    changeOrders.verifyNameInViewMode(name);
    changeOrders.clickEditIcon();

    // Verify Name tooltip with 0 chars in Edit view
    changeOrders.removeEcoName();
    changeOrders.verifyNameTooltip('Must contain at least 1 character');
    changeOrders.verifySaveDraftBtnDisabled();

    // Verify Name tooltip with 101 chars in Edit view
    changeOrders.enterNameInEcoModal(fakerHelper.getRandomStringOfCharacters(101));
    changeOrders.verifyNameTooltip('Should be less than 101 characters');
    changeOrders.verifySaveDraftBtnDisabled();
  })

  it('Validate Description field', () => {
    // Navigateto Change Order
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();

    // Enter ECO Name
    changeOrders.enterNameInEcoModal('New Change Order');
    changeOrders.verifySaveDraftBtnEnabled();

    // Enter description of 2001 chars and verify tooltip
    changeOrders.enterDescInEcoModal(fakerHelper.getRandomStringOfCharacters(2001));
    changeOrders.verifyDescriptionTooltip('Should be less than 2001 characters');
    changeOrders.verifySaveDraftBtnDisabled();

    // Enter description of 2000 chars and verify tooltip
    const desc = fakerHelper.getRandomStringOfCharacters(2000);
    changeOrders.enterDescInEcoModal(desc);
    changeOrders.clickSaveDraft();

    // Verify description in View Mode
    changeOrders.verifyDescriptionInViewMode(desc);
  })

  it('ECO description truncated: Should display Show More button when description length is more than 420 characters', () => {
    const desc = fakerHelper.getRandomStringOfCharacters(421);

    // Navigate to Change order
    changeOrders.clickOnChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Show more description with 421 chars
    changeOrders.clickNewBtn();
    changeOrders.enterDescInEcoModal(desc);
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.clickSaveDraft();
    changeOrders.verifyShowMoreDescriptionPresent();
    changeOrders.clickOnShowMoreDescriptionInViewMode();
    changeOrders.verifyDescriptionInViewMode(desc);
    changeOrders.clickOnShowLessDescriptionInViewMode();
    changeOrders.verifyShowMoreDescriptionPresent();
  })

  it('Should show error tooltip for Approve comment when it exceeds limit while rejecting CO', ()=>{  
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }

    // Create component using API
    compApi.createComponent(componentData);

    // Add component to Change order and Reject
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.clickOnSubmitForApproval();
    changeOrders.clickRejectBtn();

    // Add comment with more than 1000 characters and assert the error
    changeOrders.addCommentInConfirmDecisionCoModal(fakerHelper.getRandomStringOfCharacters(1001));
    changeOrders.verifyConfirmRejectBtnTooltip('Should be less than 1001 characters')
    changeOrders.verifyRejectBtnDisabledInConfirmRejectionModal();

    // Add comment with limited characters and verify
    changeOrders.addCommentInConfirmDecisionCoModal('Rejecting the Change Order');
    changeOrders.verifyConfirmRejectBtnTooltip('');
    changeOrders.verifyRejectBtnEnabledInConfirmRejectionModal();
  })

  it('Should show error tooltip for Approve comment when it exceeds limit while approving CO', ()=>{  
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }

    // Create component using API
    compApi.createComponent(componentData);

    // Add component to Change order and Reject
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.clickOnSubmitForApproval();
    changeOrders.clickApproveBtn();

    // Add comment with more than 1000 characters and assert the error
    changeOrders.addCommentInConfirmDecisionCoModal(fakerHelper.getRandomStringOfCharacters(1001));
    changeOrders.verifyConfirmApproveBtnTooltip('Should be less than 1001 characters');
    changeOrders.verifyApproveBtnDisabledInConfirmApprovalModal();

    // Add comment with limited characters and verify
    changeOrders.addCommentInConfirmDecisionCoModal('Approving the Change Order');
    changeOrders.verifyConfirmApproveBtnTooltip('');
    changeOrders.verifyApproveBtnEnabledInConfirmApprovalModal();
  })

  it('Should show error tooltip for Approve comment when it exceeds limit while closing CO', ()=>{  
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }

    // Create component using API
    compApi.createComponent(componentData);

    // Add component to Change order and Reject
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.clickOnSubmitForApproval();
    changeOrders.clickOnClose();

    // Add comment with more than 1000 characters and assert the error
    changeOrders.addCommentInConfirmDecisionCoModal(fakerHelper.getRandomStringOfCharacters(1001));
    changeOrders.verifyConfirmCloseBtnTooltip('Should be less than 1001 characters');
    changeOrders.verifyCloseBtnDisabledInConfirmCloseModal();

    // Add comment with limited characters and verify
    changeOrders.addCommentInConfirmDecisionCoModal('Closing the Change Order');
    changeOrders.verifyConfirmCloseBtnTooltip('');
    changeOrders.verifyCloseBtnEnabledInConfirmCloseModal();
  })
})
