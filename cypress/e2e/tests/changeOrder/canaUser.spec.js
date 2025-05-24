import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const components = new Components();
const nav = new Navigation();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const changeOrders = new ChangeOrders();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

describe("Test Components", {tags: ["ChangeOrder", "Cana"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id})
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateCanaUserSettings(companyId);
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Change order states for rejection', () =>{
    const compData = {
      category: "Fan",
      name: fakerHelper.generateProductName(),
      revision: "A",
      status: constData.status.prototype
    }

    // Create a Component
    compApi.createComponent(compData);

    // Add Component to CO
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, compData.name);
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

    // Reject Change Order
    changeOrders.clickOnSubmitForApproval()
    changeOrders.clickRejectBtn()
    changeOrders.confirmRejection()

    // Verify rejected Change Order and open status
    changeOrders.assertOpenStatus();
    changeOrders.assertRejectedChangeOrder();

    // Click on close and verify closed status
    changeOrders.clickOnClose()
    changeOrders.confirmClose();
    changeOrders.verifyClosedStatusOptnwithRejection();
  })

  it('Change order states for closing with none', () =>{
    const compData = {
      category: "Fan",
      name: fakerHelper.generateProductName(),
      status: constData.status.production
    }

    // Create a Component
    compApi.createComponent(compData);

    // Add Component to CO
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, compData.name);
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.clickOnSubmitForApproval();

    // Close Change Order
    changeOrders.clickOnClose();
    changeOrders.confirmClose();

    // Assert that Change Order is in CLOSED state and resolution = NONE
    changeOrders.assertNoneBtn();
  })

  it('Change order states for Approval', () =>{
    const compData = {
      category: "Fan",
      name: fakerHelper.generateProductName(),
      status: constData.status.obsolete
    }

    // Create a Component
    compApi.createComponent(compData);

    // Add Component to CO
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, compData.name);
    components.clickOnChangeOrderIconInViewComponent();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

    // Approve Change Order and verify open button
    changeOrders.clickOnSubmitForApproval();
    changeOrders.clickApproveBtn();
    changeOrders.confirmAprroval();
    changeOrders.assertOpenStatus();

    // click on Close and Verify Approved Change Order
    changeOrders.clickOnClose()
    changeOrders.confirmClose();
    changeOrders.verifyClosedStatusOptnwithApproval();
    changeOrders.assertChangeOrder();
  })
})
