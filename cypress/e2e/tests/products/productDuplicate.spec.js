import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants"
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { Headers } from "../../pages/headers";
import { Components } from "../../pages/components/component";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const nav = new Navigation();
const products = new Products();
const fakerhelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const compSettings = new CompanySettingsApi();
const compApi = new ComponentApi();
const assembly = new Assembly();
const headers = new Headers();
const components = new Components();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Products duplicate", () => {
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

  it("should duplicate product with revision H with status PRODUCTION including one child successfully from search page", () => {
    let cmpCpnValue;
    const prodName = fakerhelper.generateProductName();

    // Create a product with production status
    nav.openProductTab();
    products.clickNewButton();
    products.checkCategoryItem("Electrical");
    products.enterProductName(prodName);
    products.selectLifeCycleStatus(constData.status.production);
    products.enterRevision('H')
    products.clickCreateButton();
    products.waitForLoadingIconToDisappear();
    products.clickSaveButtonInEditProduct();

    // Create an assembly component with Prototype status
    const cmpData = {
      category: 'EBOM',
      name: fakerhelper.generateProductName(),
      revision: 1,
      status: constData.status.prototype
    };

    compApi.createComponent(cmpData);
    nav.openComponentsTab();

    featureHelper.getCpnValueFromTable(cmpData.name, 1).then((value) => {
      cmpCpnValue = value

      const childCmpData = {
        CPN: cmpCpnValue,
        Quantity: 1
      }

      // Add Assembly components as a child for Product
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childCmpData);
      products.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Click on mixed search icon and Duplicate product and component
      headers.clickOnMixedSearchIcon();
      tableHelper.checkTableRow(prodName);
      tableHelper.checkTableRow(cmpData.name);
      components.copyComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify copied Product and component status from library
      tableHelper.assertTextInCell(constData.componentTableHeaders.status, `COPY - ${prodName}`, constData.status.design);
      tableHelper.assertTextInCell(constData.componentTableHeaders.status, `COPY - ${cmpData.name}`, constData.status.design);

      // Verify status and revision values for Duplicated product in Product view
      tableHelper.clickOnCell(constData.componentTableHeaders.name, `COPY - ${prodName}`);
      products.verifyProductStatusInViewMode(constData.status.design);
      products.verifyRevisionInViewProduct("—");

      // Verify status and revision values for Duplicated component in component view
      headers.clickOnMixedSearchIcon();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, `COPY - ${cmpData.name}`);
      components.verifyStatusInViewComponent(constData.status.design);
      components.verifyRevisionInViewComponent("—");
    })
  })
});
