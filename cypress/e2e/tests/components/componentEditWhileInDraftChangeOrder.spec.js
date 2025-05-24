import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const tableHelper = new TableHelpers();
const faker = require('faker');
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Component Edit Module while in Change Order", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
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

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('should not edit component while CO status is not DRAFT', ()=>{  
    const componentData1 = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype,
    }

    const componentData2 = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype,
    }

    const ecoName = fakerHelper.generateEcoName();

    // Create component using API
    compApi.createComponent(componentData1);
    compApi.createComponent(componentData2);

    // Navigate to ChangeOrder and Enter the details in ECO
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(ecoName);
    changeOrders.enterDescInEcoModal('ecoDesc');

    // Add the created components to CO
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentData1.name);
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentData2.name);
    changeOrders.waitforUpdateLoadingIconTodisapper();
    changeOrders.clickOnSubmitForApproval();

    // Verify the number of child components
     changeOrders.verifyNoOfRowsPresentInChangeOrderTable(2)

    // verify Edit option not present for child components
    nav.openComponentsTab();
    components.enterSearchTerm(componentData1.name);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData1.name);
    components.verifyEditIconInViewComponentNotPresent();

    nav.openComponentsTab();
    components.enterSearchTerm(componentData2.name);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData2.name);
    components.verifyEditIconInViewComponentNotPresent();
  })
})
