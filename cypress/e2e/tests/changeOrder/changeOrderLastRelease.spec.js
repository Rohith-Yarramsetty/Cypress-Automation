import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { TableHelpers } from "../../helpers/tableHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const nav = new Navigation();
const changeOrders = new ChangeOrders();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const featureHelper = new FeatureHelpers();
const components = new Components();
const compApi = new ComponentApi();
const tableHelper = new TableHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id})
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();

  const cmpData = {
    category: "Adhesive",
    name: "cmp-with-prototype",
    status: constData.status.prototype,
    revision: 1
  }

  // Create a Component
  compApi.createComponent(cmpData);
  nav.openComponentsTab();
  tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("ChangeOrder last release Module", {tags: ["ChangeOrder", "ChangeOrder_Releases"]}, () => {
  it("component last release column values should be same as component previous revision values", () => {
    // Click on change order Icon and approve the change order
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal("CO-submitted");
    changeOrders.enterDescInEcoModal("last revision after CO is approved");
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Get last release status and revision from CO table
    let lastReleaseStatusValue, lastReleaseRevisionValue;
    changeOrders.getLastReleaseStatusFromCoTable('cmp-with-prototype').then((value) => lastReleaseStatusValue = value)
    changeOrders.getLastReleaseRevisionFromCoTable('cmp-with-prototype').then((value) => {
      lastReleaseRevisionValue = value

      // Navigate to 2nd revision from history table and verify status and revision
      tableHelper.clickOnCell(constData.changeOrderTableHeaders.name, 'cmp-with-prototype');
      components.clickOnHistoryIcon();
      components.clickOnPreviousRevision(2);
      components.verifyStatusInViewComponent(lastReleaseStatusValue);
      components.verifyRevisionInViewComponent(lastReleaseRevisionValue);
    });
  });
});
