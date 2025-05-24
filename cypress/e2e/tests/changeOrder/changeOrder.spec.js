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
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";

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

describe("Test Change Order", {tags: ["ChangeOrder"]}, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id})
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

  context("ChangeOrder minimum path workflow", () => {
    let data;
    beforeEach(() => {
      data = {
        ecoName: fakerHelper.generateEcoName(),
        ecoDesc: 'ecoDesc'
      }
      const componentData1 = {
        componentType: constData.componentType.electrical,
        componentName: fakerHelper.generateProductName(),
        compDesc: "Description for cap one",
        category: constData.electricalComponents.capacitor,
        revision: 'A',
        status: constData.status.production,
      }
      const  componentData2 = {
        componentType: constData.componentType.electrical,
        componentName: fakerHelper.generateProductName(),
        compDesc: "Description for cap two",
        category: constData.electricalComponents.capacitor,
        revision: '2',
        status: constData.status.prototype
      }
      const  componentData3 = {
        componentType: constData.componentType.electrical,
        componentName: fakerHelper.generateProductName(),
        compDesc: "Description for cap three",
        category: constData.electricalComponents.capacitor,
        revision: 'Y',
        status: constData.status.obsolete
      }

      // Navigate to Component tab
      nav.openComponentsTab();

      // Create three capacitor Components
      components.createComponentManually(componentData1);
      components.createComponentManually(componentData2);
      components.createComponentManually(componentData3);

      // Navigate to Change order
      changeOrders.clickOnChangeOrder();
      featureHelper.waitForLoadingIconToDisappear();

      // Create new Change order and check the created component
      changeOrders.clickNewBtn();
      changeOrders.searchAndCheckComponentInNewChangeOrder(componentData1.componentName);
      changeOrders.searchAndCheckComponentInNewChangeOrder(componentData2.componentName);

      // Open Eco modal and enter the details
      changeOrders.clickEcoIcon()
      changeOrders.enterNameInEcoModal(data.ecoName);
      changeOrders.enterDescInEcoModal(data.ecoDesc);
    })

    it('Should follow a minimum path for approval', ()=>{ 
      // Approve Change Order
      changeOrders.approveNewChangeOrder();

      // Verify Change Order
      changeOrders.assertChangeOrder();
    })

    it('Should follow a minimum path for rejection', ()=>{
      // Reject Change Order
      changeOrders.rejectNewChangeOrder();

      // Verify rejected Change Order and closed status
      changeOrders.assertRejectedChangeOrder();
      changeOrders.assertClosedStatus();
    }) 

    it('Should follow a minimum path for deletion', ()=>{
      // Save CO as DRAFT
      changeOrders.clickSaveDraft();

      // Delete Change order
      changeOrders.clickOnDelete();
      changeOrders.confirmDelete();

      // Assert that current page is the CO’s search route
      changeOrders.assertChangeOrderText();
      changeOrders.assertSearchRoute();

      // Assert using earlier stored name that CO is not listed
      changeOrders.assertChangeOrderNotListed(constData.changeOrders.name, data.ecoName);
    })

    it('Should follow a minimum path for close', ()=>{
      // Approve Change Order
      changeOrders.clickOnSubmitForApproval();

      // Close Change Order
      changeOrders.clickOnClose();
      changeOrders.confirmClose();

      // Assert that Change Order is in CLOSED state and resolution = NONE
      changeOrders.assertNoneBtn();
    })
  })

  it('Change Order: Should follow a minimum path for cancel', ()=>{
    const ecoName = fakerHelper.generateEcoName();
    const ecoDesc = 'eco desc for cancel'
    // Navigate to Change order
    changeOrders.clickOnChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Click new button
    changeOrders.clickNewBtn();

    // Open Eco modal and enter the details
    changeOrders.clickEcoIcon()
    changeOrders.enterNameInEcoModal(ecoName);
    changeOrders.enterDescInEcoModal(ecoDesc);

    // Click cancel button
    changeOrders.clickOnCancel();

    // Assert that current page is the CO’s search route
    changeOrders.assertChangeOrderText();
    changeOrders.assertSearchRoute();

    // Assert using earlier stored name that CO is not listed
    changeOrders.assertChangeOrderNotListed(constData.changeOrders.name, ecoName);
  })

  it('Child Status should not change when clicked on DCO icon', ()=>{
    const data = {
      category: "Datasheet",
      name: "cmp-1",
      status: "production",
    }
    compApi.createComponent(data);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, data.name)
    components.clickEditIcon();
    components.selectStatusInEditView(constData.status.obsolete);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.clickSaveButtonInEditComponent();

    // Navigate to Change order
    changeOrders.clickOnChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Click new button
    changeOrders.clickNewBtn();

    // Open Eco modal and enter the details
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

    // Select the component created in step-2 and click Add button
    changeOrders.searchAndCheckComponentInNewChangeOrder(data.name);

    // Verify the table details along with the status Obsolete - > Obsolete
    changeOrders.verifyStatusInChangeOrderTable("cmp-1", constData.status.obsolete);
    changeOrders.verifySelectedStatusInChangeOrderTable("cmp-1", constData.status.obsolete, "OBSOLETE");

    // Click DCO Icon and Verify the Status PRODUCTION → PRODUCTION
    changeOrders.clickDcoIcon();
    changeOrders.clickOkBtn();
    changeOrders.verifyStatusInChangeOrderTable("cmp-1", constData.status.production);
    changeOrders.verifySelectedStatusInChangeOrderTable("cmp-1", constData.status.production, "PRODUCTION");
  })
})
