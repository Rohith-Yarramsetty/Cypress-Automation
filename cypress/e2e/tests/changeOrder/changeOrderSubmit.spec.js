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

describe("Test Change Order", {tags: ["ChangeOrder", "ChangeOrder_Submit"]}, () => {
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

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("ChangeOrder Submit Approve Module", () => {
    it('Should successfully allow submit and approve for component with Status PRODUCTION', () =>{
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.production,
        revision: 'A',
        cmpDesc: 'This is related to component'
      }
  
      // Create component using API
      compApi.createComponent(componentData);
  
      // Add component to Change order and Reject
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      components.clickEditIcon();
      components.enterDescriptionInEditComponent(componentData.cmpDesc);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
  
      // Verify component revision value and status before adding to change order
      components.verifyRevisionInViewComponent(componentData.revision);
      components.verifyStatusInViewComponent(constData.status.production)
  
      // Add to change order and accept change order
      components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
      components.clickAddToChangeOrderInViewComponent();
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal('ecoDesc');
      changeOrders.approveNewChangeOrder();
      featureHelper.waitForLoadingIconToDisappear();
  
      // Verify component revision value and status after adding to change order
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name);
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyRevisionInViewComponent('B');
      components.verifyStatusInViewComponent(constData.status.production);
    })

    it('Should not allow submit for component with Status DESIGN', () => {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.design
      }
  
      // Create component using API
      compApi.createComponent(componentData);
  
      // Add component to Change order
      nav.openComponentsTab();
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, componentData.name);
  
      // Navigate to CO
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      featureHelper.waitForLoadingIconToDisappear();
  
      // Add to CO & verify save btn disabled
      changeOrders.searchAndCheckComponentInNewChangeOrder(componentData.name);
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.enterDescInEcoModal("Desc related to CO");
      changeOrders.verifySubmitForApprovalBtnDisabled();
    })
  })
})
