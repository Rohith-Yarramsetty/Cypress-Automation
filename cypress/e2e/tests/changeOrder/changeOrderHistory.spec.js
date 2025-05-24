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

describe("Test Change Order", {tags: ["ChangeOrder", "ChangeOrder_History"]}, () => {
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
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("ChangeOrder history Module", () => {
    it('Should link to original revision after CO is closed: rejected for component', () =>{
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        revision: 1,
      }

      // Create component using API
      compApi.createComponent(componentData);

      // Add component to Change order and Reject
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.verifyRevisionInViewComponent(componentData.revision);
      components.verifyStatusInViewComponent(constData.status.prototype)

      // Add to change order, Reject and close change order 
      components.clickOnChangeOrderIconInViewComponent();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.verifyPreviousRevisionInChangeOrderTable(componentData.name, 1);
      changeOrders.verifyNextRevisionInChangeOrderTable(componentData.name, 2);
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.rejectNewChangeOrder();
      changeOrders.clickOnClose();
      changeOrders.confirmClose();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify component revision value and status after rejecting to change order
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyRevisionInViewComponent(1);
      components.verifyStatusInViewComponent(constData.status.prototype);
    })
  })
})