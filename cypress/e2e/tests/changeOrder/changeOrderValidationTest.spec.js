import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { ChangeOrderApi } from "../../api/changeOrderApi";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { TableHelpers } from "../../helpers/tableHelper";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Assembly } from "../../pages/components/assembly";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const changeOrderApi = new ChangeOrderApi();
const featureHelpers = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const tableHelper = new TableHelpers();
const importFromFile = new ImportFromFile();
const assembly = new Assembly();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id});
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

describe("ChangeOrder error validation Module", {tags: ["ChangeOrder", "ChangeOrder_Validation"]}, () => {
  it('banner buttons should not be active until minimum new CO fields entered', ()=>{  
    const componentData = {
      category: "Capacitor",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype
    }

    // Create component using API
    compApi.createComponent(componentData);

    // Navigate to ChangeOrder and verify Banner button
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.verifySaveDraftIsDisabled();
    changeOrders.verifySubmitForApprovalIsDisabled();
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(0);

    // Set the Eco Name and and verify Banner buttons, Component not present in the CO Table
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.verifySaveDraftIsEnabled();
    changeOrders.verifySubmitForApprovalIsDisabled();
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(0);

    // Set the Eco description and verify Banner buttons, Component not present in the CO Table
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.verifySaveDraftIsEnabled();
    changeOrders.verifySubmitForApprovalIsDisabled();
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(0);

    // Add the created component to CO and verify Banner button, Component present in the CO Table
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentData.name);
    changeOrders.waitforUpdateLoadingIconTodisapper();
    changeOrders.verifySaveDraftIsEnabled();
    changeOrders.verifySubmitForApprovalIsEnabled();
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(1);
  })
})

describe('ChangeOrder Components in multiple COs Module', {tags: ["ChangeOrder", "ChangeOrder_Validation"]}, () => {
  it('component in multiple COs should show error message and clicking on validation button should update components in multiple COs', () => {
    // Create a component
    let compName = fakerHelper.generateComponentName(), tooltipMsg;
    compApi.createComponent({name: compName, category: 'MBOM', status: 'PRODUCTION'});

    // Add component to changeOrder
    components.navigateToComponentViewPage(name, false);
    components.clickOnChangeOrderIconInViewComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    // Create a changeOrder
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.clickSaveDraft();
    featureHelpers.waitForLoadingIconToDisappear();
    cy.url().then((changeOrderUrl1) => { 

      // Open new changeOrder tab
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.searchAndCheckComponentInNewChangeOrder(compName);

      // verify the error message along with CO creation allowance
      tooltipMsg = 'This Component is included in one ore more existing open Change Orders. They must be resolved before submitting this new Change Order for approval.'
      changeOrders.verifyErrorMsgInChangeOrderTable(compName, tooltipMsg);
      changeOrders.verifySaveDraftBtnDisabled();
      changeOrders.verifySubmitForApprovalIsDisabled();

      // Delete existing changeOrder
      changeOrderUrl1 = changeOrderUrl1.split('view/')
      changeOrderApi.deleteDraftChangeOrder(changeOrderUrl1[1]);

      // Verify the CO creation allowance
      changeOrders.clickRecheckForComponent(compName);
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.verifySaveDraftBtnEnabled();
      changeOrders.verifySubmitForApprovalIsEnabled();
    })
  })
})

describe('Component error validation in COs Module', {tags: ["ChangeOrder", "ChangeOrder_Validation"]}, () => {
  beforeEach(() => {
    const compData = {
      name      :  "TEST COMPONENT",
      status    :  constData.status.prototype,
    }

    // Create a component
    compApi.createComponent(compData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, compData.name);
    components.clickOnChangeOrderIconInViewComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    changeOrders.enterNameInEcoModal('New Change Order');
    changeOrders.enterDescInEcoModal('Desc related to CO');
  })

  it('Should verify error "component is in open changeorder" present  for the components associated with a CO in open status', () => {
    changeOrders.clickOnSubmitForApproval();
    featureHelpers.waitForLoadingIconToDisappear();

    nav.openComponentsTab();
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseType('assembly');
    components.chooseCategory(constData.assemblyComponents.cableAssembly);
    components.enterComponentName('CMP_1');
    components.selectStatus();
    components.clickOnCreate();
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.checkUpdateFromExistingLibrary();
    assembly.uploadFile('swx-696.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyErrorTooltipforCellInReviewPage(1, 'cpn', 'Component is in an open change order');
  })

  it('Should edit/add components associated with a CO in draft status and verify no error present', () => {
    changeOrders.clickSaveDraft();
    featureHelpers.waitForLoadingIconToDisappear();

    nav.openComponentsTab();
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseType('assembly');
    components.chooseCategory(constData.assemblyComponents.cableAssembly);
    components.enterComponentName('CMP_1');
    components.selectStatus();
    components.clickOnCreate();
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.checkUpdateFromExistingLibrary();
    assembly.uploadFile('swx-696.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
  })

  it('Should edit/Add components associated with a CO in closed status and verify no error present', () => {
    changeOrders.clickOnSubmitForApproval();
    featureHelpers.waitForLoadingIconToDisappear();
    changeOrders.clickOnClose();
    changeOrders.confirmClose();
    featureHelpers.waitForLoadingIconToDisappear();

    nav.openComponentsTab();
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseType('assembly');
    components.chooseCategory(constData.assemblyComponents.cableAssembly);
    components.enterComponentName('CMP_1');
    components.selectStatus();
    components.clickOnCreate();
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.checkUpdateFromExistingLibrary();
    assembly.uploadFile('swx-696.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
  })
})