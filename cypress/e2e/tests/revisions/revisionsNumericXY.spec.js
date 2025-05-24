import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import { ComponentApi } from "../../api/componentApi";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { Products } from "../../pages/products/products"
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";

const nav = new Navigation();
const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const components = new Components();
const changeOrder = new ChangeOrders();
const compSettings = new CompanySettingsApi();
const products = new Products();
const featureHelper = new FeatureHelpers();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
    compSettings.updateCompanySettings(companyId, compPayloads.revSchemeType('NUMERIC-XY'));
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

describe("Numeric Revision Module (XY) format", () => {
  it("Should set revision correctly after approving change order for product and component.", () => {
    // Create component
    const cmpData = {
      category     : "Adhesive",
      name         : "cmp-prototype",
      status       : "PROTOTYPE",
    }
    compApi.createComponent(cmpData);

    // Create product
    const prdData = {
      name: "prd-production",
      status: "PRODUCTION",
    }
    products.createAndSaveBasicProduct(prdData.name, prdData.status);

    // Add components to changeOrder
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();
    changeOrder.searchAndCheckComponentInNewChangeOrder(cmpData.name);
    changeOrder.searchAndCheckComponentInNewChangeOrder(prdData.name);
    changeOrder.enterNameInEcoModal("CO-1");
    changeOrder.enterDescInEcoModal("CO with custom revision");

    // Veify last revision and current revision for component
    changeOrder.verifyLastReleasedRevisionInChangeOrderTable(cmpData.name, 1);
    changeOrder.verifyNextRevisionInChangeOrderTable(cmpData.name, 2);

    // Veify last revision and current revision for product
    changeOrder.verifyLastReleasedRevisionInChangeOrderTable(prdData.name, 1);
    changeOrder.verifyNextRevisionInChangeOrderTable(prdData.name, 2);

    // Submit and approve the new change order
    changeOrder.approveNewChangeOrder();

    // Verify component revision and status
    components.navigateToComponentViewPage(cmpData.name, false);
    components.verifyRevisionInViewComponent(2);
    components.verifyStatusInViewComponent(cmpData.status);

    // Verify product revision and status
    products.navigateToProductViewPage(prdData.name, false);
    products.verifyRevisionInViewProduct(2);
    products.verifyProductStatusInViewMode(prdData.status);
  });

  it("should work properly for revert functionality", () => {
    let cmpData = {
      category     : "Adhesive",
      name         : "comp-1",
      status       : constData.status.design
    }

    // Create component with design status and update the status to Obsolete
    compApi.createComponent(cmpData);
    components.navigateToComponentEditPage(cmpData.name, false);
    components.selectStatusInEditView(constData.status.obsolete);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.clickSaveButtonInEditComponent();

    // Revert back the changes
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickOnRevertBackInCmpViewPage();
    components.clickYesBtnInConfirmRevertChanges();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Status and Revision values in view component after revert back
    components.verifyStatusInViewComponent(constData.status.design);
    components.verifyRevisionInViewComponent(1);
  });
});
