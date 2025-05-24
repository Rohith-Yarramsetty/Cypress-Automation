import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Assembly } from "../../pages/components/assembly";
import { UsersApi } from "../../api/userApi";
import { ComponentApi } from "../../api/componentApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import faker from "faker";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const products = new Products();
const fakerHelper = new FakerHelpers();
const assembly = new Assembly();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const changeOrders = new ChangeOrders();

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

describe("Revision Assemblies Module", () => {
  let childCmpName
  beforeEach(function () {
    // Create child component
    childCmpName = fakerHelper.generateProductName()
    const componentData = {
      category: "EBOM",
      name: childCmpName,
      status: constData.status.prototype,
      revision: 1
    }
    compApi.createComponent(componentData);
    nav.openComponentsTab();
  })

  it("Should create the revision history correctly if CO is rejected", () => {
    let childCmpCpnValue
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(childCmpName, 1).then((cpnValue) => {
      childCmpCpnValue = cpnValue;

      // Add eid to the child component and save
      tableHelper.clickOnCell(constData.componentTableHeaders.name, childCmpName);
      components.clickEditIcon();
      components.enterEidInComponentEditPage(faker.random.number({min:1000000, max:9999999}))
      components.clickSaveButtonInEditComponent();

      // Create a Firmware type Product
      const prodName = fakerHelper.generateProductName()
      nav.openProductTab();
      products.clickNewButton();
      products.enterProductName(prodName);
      products.checkCategoryItem("Firmware");
      products.selectLifeCycleStatus(constData.status.prototype);
      products.enterRevision(1);
      products.clickCreateButton();
      featureHelper.waitForLoadingIconToDisappear();

      // Add child component to the Product
      const childData = {
        CPN:childCmpCpnValue,
        Quantity: 1
      }
      assembly.clickOnAssemblyTab();
      assembly.addComponentsToAssemblyTable(childData);
      products.clickSaveButtonInEditProduct();

      // Click on edit and add eid to the product
      products.clickEditIcon();
      products.enterEidInProductEditPage(faker.random.number({min:1000000, max:9999999}));
      products.clickSaveButtonInEditProduct();

      // Add Parent product and child component to the change order
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.searchAndCheckComponentInNewChangeOrder(childCmpName);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodName);

      // Select MCO type and enter name
      changeOrders.clickMcoIcon()
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Click on Submit for approval and Reject and Close the change order
      changeOrders.clickOnSubmitForApproval();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.clickRejectBtn();
      changeOrders.confirmRejection();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.clickOnClose();
      changeOrders.confirmClose();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to Parent product
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);

      // Click on History icon and click on second revision
      products.clickOnHistoryIcon();
      products.clickOnPreviousRevision(2);
      featureHelper.waitForLoadingIconToDisappear();

      // Verify revision and status for Product
      products.verifyRevisionInViewProduct(1);
      products.verifyProductStatusInViewMode(constData.status.prototype);

      // Go to child component and Verify revision and status
      assembly.clickOnAssemblyTab();
      assembly.clickOnAssemblyChildCmp(childCmpName);
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyRevisionInViewComponent(1);
      components.verifyStatusInViewComponent(constData.status.prototype);
    })
  })

  it("Should display the non-modified version of child/assemblies in revision history correctly", () => {
    let childCmpCpnValue
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(childCmpName, 1).then((cpnValue) => {
      childCmpCpnValue = cpnValue;

      // Add eid to the child component and save
      tableHelper.clickOnCell(constData.componentTableHeaders.name, childCmpName);
      components.clickEditIcon();
      components.enterEidInComponentEditPage(faker.random.number({min:1000000, max:9999999}))
      components.clickSaveButtonInEditComponent();

      // Create a Firmware type Product
      const prodName = fakerHelper.generateProductName()
      nav.openProductTab();
      products.clickNewButton();
      products.enterProductName(prodName);
      products.checkCategoryItem("Firmware");
      products.selectLifeCycleStatus(constData.status.prototype);
      products.enterRevision(1);
      products.clickCreateButton();
      featureHelper.waitForLoadingIconToDisappear();

      // Add child component to the Product
      const childData = {
        CPN:childCmpCpnValue,
        Quantity: 1
      }
      assembly.clickOnAssemblyTab();
      assembly.addComponentsToAssemblyTable(childData);
      products.clickSaveButtonInEditProduct();

      // Click on edit and add eid to the product
      products.clickEditIcon();
      products.enterEidInProductEditPage(faker.random.number({min:1000000, max:9999999}));
      products.clickSaveButtonInEditProduct();

      // Add Parent product and child component to the change order
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.searchAndCheckComponentInNewChangeOrder(childCmpName);
      changeOrders.searchAndCheckComponentInNewChangeOrder(prodName);

      // Select MCO type and enter name
      changeOrders.clickMcoIcon()
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Click on Submit for approval and approve the change order
      changeOrders.approveNewChangeOrder();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to Parent product
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);

      // Click on edit and add eid to the product
      products.clickEditIcon();
      featureHelper.waitForLoadingIconToDisappear();
      products.enterEidInProductEditPage(faker.random.number({min:1000000, max:9999999}));
      products.clickSaveButtonInEditProduct();

      // Click on History icon and click on second revision
      products.clickOnHistoryIcon();
      products.clickOnPreviousRevision(2);

      // Verify revision and status for Product
      products.verifyRevisionInViewProduct(2);
      products.verifyProductStatusInViewMode(constData.status.prototype);
      products.verifyProductRevisionModifiedIconNotPresent();

      // Go to child component and Verify revision and status
      assembly.clickOnAssemblyTab();
      assembly.clickOnAssemblyChildCmp(childCmpName);
      featureHelper.waitForLoadingIconToDisappear();
      components.verifyRevisionInViewComponent(2);
      components.verifyStatusInViewComponent(constData.status.prototype);
      components.verifyComponentRevisionModifiedIconNotPresent();
    })
  })
})
