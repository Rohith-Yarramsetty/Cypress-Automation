import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Assembly } from "../../pages/components/assembly";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { UsersApi } from "../../api/userApi";
import { SignIn } from "../../pages/signin";

const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const assembly = new Assembly();
const compApi = new ComponentApi();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();
const changeOrders = new ChangeOrders();
const userApi = new UsersApi();
const signin = new SignIn();

let companyId;

describe("DCO type ChangeOrder", {tags: ["ChangeOrder", "ChangeOrder_DCO", "DCO"]}, () => {
  let email, userName, orgId;

  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id});
    userName = user.firstName + ' ' + user.lastName
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateCompanySettings(companyId, compPayloads.is_DCO_enabled(true));
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

  context("validation", () => {
    it('parent component with status value higher than child component should not show error message for DCO type Change Order', () => {
      let screwCmpCpnValue;

      const cmpData1 = {
        category: "Screw",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        revision: 1
      }
      const cmpData2 = {
        category: "MBOM",
        name: fakerHelper.generateProductName(),
        status: constData.status.production,
        revision: "A"
      }

      // Create components
      compApi.createComponent(cmpData1);
      compApi.createComponent(cmpData2);
      nav.openComponentsTab();
      featureHelper.getCpnValueFromTable(cmpData1.name, 1).then((cpnValue) => {
        screwCmpCpnValue = cpnValue;

        // Data to add children component
        const childData = {
          CPN:screwCmpCpnValue,
          Quantity: 1
        }

        // Add Screw component as a child component for Assembly type component
        tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData2.name);
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(childData);
        components.clickSaveButtonInEditComponent();
        featureHelper.waitForLoadingIconToDisappear();

        // Add components to the change order
        nav.openChangeOrdersTab();
        changeOrders.clickNewBtn();
        changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
        changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);
        changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
        changeOrders.enterDescInEcoModal("New Co");

        // Verify the error messages from the change order table 
        // Should Show error messages for ECO type Change Order
        const errorMsgForCmp1 = "Nested child Components must be at an equal or greater Status value than their parent assembly. This Component's parent has Status: PRODUCTION";
        const errorMsgForCmp2 = "Nested child Components must be at an equal or greater Status value than their parent assembly.Add child Components and update their Status to resolve this issue.";
        changeOrders.verifyErrorMsgInChangeOrderTable(cmpData1.name, errorMsgForCmp1);
        changeOrders.verifyErrorMsgInChangeOrderTable(cmpData2.name, errorMsgForCmp2);
        changeOrders.verifySubmitForApprovalBtnDisabled();

        // Do not show error messages for DCO type Change Order
        changeOrders.clickDcoIcon();
        changeOrders.clickOkBtnInDcoWarningModal();
        changeOrders.verifySubmitForApprovalIsEnabled();
      })
    })

    it('component with original Design Status should show error message for DCO type Change Order', () => {
      const cmpData1 = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.design,
        revision: 1
      }
      const cmpData2 = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        revision: 2
      }

      // Create components
      compApi.createComponent(cmpData1);
      compApi.createComponent(cmpData2);

      // Select DCO type in CO and add components
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickDcoIcon();
      changeOrders.clickOkBtnInDcoWarningModal();
      changeOrders.enterNameInEcoModal("CO with Design Status");
      changeOrders.enterDescInEcoModal("CO with a component which has Design Status");
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);

      // Verify Submit for approval and Error for design component
      changeOrders.verifySubmitForApprovalBtnDisabled();
      const errorMsg = "Component must have a Status of Prototype or Production to submit in a Change Order for approval.";
      changeOrders.verifyErrorMsgInChangeOrderTable(cmpData1.name, errorMsg);
    })

    it('should not allow creating DCO type change order if one of child components is in open CO mode', () => {
      const cmpData1 = {
        category: "Screw",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        revision: 1
      }
      const cmpData2 = {
        category: "MBOM",
        name: fakerHelper.generateProductName(),
        status: constData.status.production,
        revision: "A"
      }

      // Create components
      compApi.createComponent(cmpData1);
      compApi.createComponent(cmpData2);

      // Select DCO type in CO and add one component
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickDcoIcon();
      changeOrders.clickOkBtnInDcoWarningModal();
      changeOrders.enterNameInEcoModal("CO with single component");
      changeOrders.enterDescInEcoModal("CO with single component");
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
      changeOrders.clickOnSubmitForApproval();

      // Verify children count in Open change order
      changeOrders.verifyChildrenCountInViewCo(1);

      // Go to new change order page and add both components
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickDcoIcon();
      changeOrders.clickOkBtnInDcoWarningModal();
      changeOrders.enterNameInEcoModal("Component which is already added in CO");
      changeOrders.enterDescInEcoModal("CO with a component which is already added in CO");
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);

      // Verify the error for child component which already in a open CO
      changeOrders.verifySubmitForApprovalBtnDisabled();
      const errorMsg = "This Component is included in one ore more existing open Change Orders. They must be resolved before submitting this new Change Order for approval.";
      changeOrders.verifyErrorMsgInChangeOrderTable(cmpData1.name, errorMsg);
    })
  })
})
