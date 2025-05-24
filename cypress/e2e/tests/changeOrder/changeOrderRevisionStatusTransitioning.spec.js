import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { FakerHelpers } from "../../helpers/fakerHelper";
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
const fakerHelper = new FakerHelpers();
const components = new Components();
const compApi = new ComponentApi();
const tableHelper = new TableHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Test Change Order", {tags: ["ChangeOrder", "ChangeOrder_Revisions"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    });
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

  context("ChangeOrder Default Revision values with NO Status Change Module", () => {
    it('Should auto-populate To revision correctly if initial status is PRODUCTION', () =>{
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.production,
        revision: 'D',
      }

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to Change order and Reject
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.verifyRevisionInViewComponent(componentData.revision);
      components.verifyStatusInViewComponent(constData.status.production)

      // Add to change order
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify status, Previous revision and next revision in change order table
      changeOrders.verifyStatusInChangeOrderTable(componentData.name, constData.status.production)
      changeOrders.verifyPreviousRevisionInChangeOrderTable(componentData.name, 'D');
      changeOrders.verifyNextRevisionInChangeOrderTable(componentData.name, 'E');
    });

    it("should auto-populate To revision correctly if initial status is DESIGN", () => {
      const cmpData1 = {
        category  : "Capacitor",
        name      : "cmp-1",
        status    : constData.status.design,
        revision  : 3,
      }
      const cmpData2 = {
        category  : "Capacitor",
        name      : "cmp-2",
        status    : constData.status.design,
        revision  : "E",
      }

      // Create components
      compApi.createComponent(cmpData1);
      compApi.createComponent(cmpData2);

      // Open new change order and add components
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);

      // Verify previous and next revisions of component 1
      changeOrders.verifyPreviousRevisionInChangeOrderTable(cmpData1.name, "3");
      changeOrders.verifyNextRevisionInChangeOrderTable(cmpData1.name, "3");

      // Verify previous and next revisions of component 2
      changeOrders.verifyPreviousRevisionInChangeOrderTable(cmpData2.name, "E");
      changeOrders.verifyNextRevisionInChangeOrderTable(cmpData2.name, "E");
    });
  });
});