import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Assembly } from "../../pages/components/assembly";
import { UsersApi } from "../../api/userApi";
import { ComponentApi } from "../../api/componentApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { Products } from "../../pages/products/products";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const fakerHelper = new FakerHelpers();
const assembly = new Assembly();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const changeOrders = new ChangeOrders();
const products = new Products();

let email, companyId, orgId;

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

beforeEach(() => {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Revision Module", { tags: ["Index"] }, () => {
  it('Should create revision history for product with multiple-level deep assemblies having different statuses correctly', () => {
    // Create 4 components with diff status
    const cmpData1 = {
      category     : 'EBOM',
      name         : 'child-1',
      revision     : 'A',
      status       : constData.status.design
    }
    const cmpData2 = {
      category     : 'EBOM',
      name         : 'child-2',
      revision     : '1',
      status       : constData.status.prototype
    }
    const cmpData3 = {
      category     : 'EBOM',
      name         : 'child-3',
      revision     : 'A',
      status       : constData.status.production
    }
    const cmpData4 = {
      category     : 'EBOM',
      name         : 'child-4',
      revision     : 'A',
      status       : constData.status.obsolete
    }
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    compApi.createComponent(cmpData3);
    compApi.createComponent(cmpData4);

    // Create product and add child 2
    const prodName = 'Prd-with-Deep-assemblies'
    const cmp2AssemblyData = {
      CPN       : '910-00002' ,
      Quantity  : 1
    }
    nav.openProductTab();
    products.clickNewButton();
    products.checkCategoryItem('Firmware');
    products.enterProductName(prodName)
    products.selectLifeCycleStatus(constData.status.prototype);
    products.enterRevision(1);
    products.clickCreateButton();
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(cmp2AssemblyData);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Add eid to product
    products.clickEditIcon();
    products.enterEidInProductEditPage('EID-01');
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Add component 3 as child for component 2
    const cmp3AssemblyData = {
      CPN       : '910-00003' ,
      Quantity  : 1
    }
    assembly.clickOnAssemblyTab();
    assembly.clickOnAssemblyChildCmp(cmpData2.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(cmp3AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add component 4 as child for component 3
    const cmp4AssemblyData = {
      CPN       : '910-00004' ,
      Quantity  : 1
    }
    assembly.clickOnAssemblyTab();
    assembly.clickOnAssemblyChildCmp(cmpData3.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(cmp4AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add Product and remaining components (Except cmp1) to change order and approve
    nav.openProductTab();
    tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
    products.clickOnChangeOrderIconInViewProduct();
    products.clickAddToChangeOrderInViewProduct();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData3.name);
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData4.name);
    changeOrders.clickMcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.approveNewChangeOrder();

    // Change eid value
    nav.openProductTab();
    tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
    products.clickEditIcon();
    products.enterEidInProductEditPage('EID-02');
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to 2nd revision and verify revision and status
    products.clickOnHistoryIcon();
    products.clickOnPreviousRevision(2);
    products.verifyRevisionInViewProduct(2);
    products.verifyProductStatusInViewMode(constData.status.prototype)

    // Verify revision and status for cmp2
    assembly.clickOnAssemblyChildCmp(cmpData2.name);
    components.verifyRevisionInViewComponent(2);
    components.verifyStatusInViewComponent(constData.status.prototype);

    // Verify revision and status for cmp3
    assembly.clickOnAssemblyChildCmp(cmpData3.name);
    components.verifyRevisionInViewComponent('B');
    components.verifyStatusInViewComponent(constData.status.production);

    // Verify revision and status for cmp4
    assembly.clickOnAssemblyChildCmp(cmpData4.name);
    components.verifyRevisionInViewComponent('Z');
    components.verifyStatusInViewComponent(constData.status.obsolete);
  })

  it('Should create revision history for component with multiple-level deep assemblies having different statuses correctly', () => {
    // Create 4 components
    const cmpData1 = {
      category     : 'EBOM',
      name         : 'cmp-1',
      revision     : 'A',
      status       : constData.status.obsolete
    }
    const cmpData2 = {
      category     : 'EBOM',
      name         : 'cmp-2',
      revision     : 'A',
      status       : constData.status.production
    }
    const cmpData3 = {
      category     : 'EBOM',
      name         : 'cmp-3',
      revision     : 1,
      status       : constData.status.prototype
    }
    const cmpData4 = {
      category     : 'EBOM',
      name         : 'cmp-4',
      revision     : 1,
      status       : constData.status.prototype
    }
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    compApi.createComponent(cmpData3);
    compApi.createComponent(cmpData4);

    // Add component 3 as child for component 4
    const cmp3AssemblyData = {
      CPN       : '910-00003' ,
      Quantity  : 1
    }
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData4.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(cmp3AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add component 2 as child for component 3
    const cmp2AssemblyData = {
      CPN       : '910-00002' ,
      Quantity  : 1
    }
    assembly.clickOnAssemblyChildCmp(cmpData3.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(cmp2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add component 1 as child for component 2
    const cmp1AssemblyData = {
      CPN       : '910-00001' ,
      Quantity  : 1
    }
    assembly.clickOnAssemblyChildCmp(cmpData2.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(cmp1AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Go to component 4 and add eid value
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData4.name);
    featureHelper.waitForLoadingIconToDisappear();
    components.clickEditIcon();
    components.enterEidInComponentEditPage('EID-01');
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add component 4 and and remaining components to change order and approve
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickAddToChangeOrderInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData3.name);
    changeOrders.clickMcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.approveNewChangeOrder();

    // Go to component 4 and change eid value
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData4.name);
    featureHelper.waitForLoadingIconToDisappear();
    components.clickEditIcon();
    components.enterEidInComponentEditPage('EID-02');
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate 2nd revision in history table
    components.clickOnHistoryIcon();
    components.clickOnPreviousRevision(2);
    featureHelper.waitForLoadingIconToDisappear();

    // Verify revision and status for cmp4
    components.verifyRevisionInViewComponent(2);
    components.verifyStatusInViewComponent(constData.status.prototype);

    // Verify revision and status for cmp3
    assembly.clickOnAssemblyChildCmp(cmpData3.name);
    components.verifyRevisionInViewComponent(2);
    components.verifyStatusInViewComponent(constData.status.prototype);

    // Verify revision and status for cmp2
    assembly.clickOnAssemblyChildCmp(cmpData2.name);
    components.verifyRevisionInViewComponent('B');
    components.verifyStatusInViewComponent(constData.status.production);

    // Verify revision and status for cmp2
    assembly.clickOnAssemblyChildCmp(cmpData1.name);
    components.verifyRevisionInViewComponent('Z');
    components.verifyStatusInViewComponent(constData.status.obsolete);
  })
})
