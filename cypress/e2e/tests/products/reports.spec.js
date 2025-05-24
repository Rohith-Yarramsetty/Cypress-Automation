import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Sourcing } from "../../pages/components/sourcing";
import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Assembly } from "../../pages/components/assembly";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const sourcing = new Sourcing();
const compSettings = new CompanySettingsApi();
const products = new Products();
const fakerHelper = new FakerHelpers();
const assembly = new Assembly();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Reports Module", () => {
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

  it("Should show correct value in reports table", () => {
    const data = {
      componentType: constData.componentType.electrical,
      category: constData.electricalComponents.capacitor,
      mpn: 'GRM32ER60J107ME20L',
    }

    // Navigate to Component tab
    nav.openComponentsTab();

    // Import component from Vendor and set first row as primary
    components.importFromVendor(data);
    sourcing.navigateToSourcingTab();
    sourcing.checkRowSourcingViewTableCheckBox(1);
    sourcing.clickOnSetPrimary();
    featureHelper.waitForLoadingIconToDisappear();

    // Create a product
    const prodName = fakerHelper.generateProductName();
    nav.openProductTab();
    products.clickNewButton();
    products.checkCategoryItem('Firmware');
    products.enterProductName(prodName);
    products.clickCreateButton();
    featureHelper.waitForLoadingIconToDisappear();
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Add imported component as assembly to the product
    const childCmpData = {
      CPN: '212-00001',
      Quantity: 1,
    }
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(childCmpData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify data in Reports table
    const reportsData = {
      cpn: '212-00001',
      name: 'Multilayer Ceramic Capacitor, 100 uF, 6.3 V, ± 20%, X5R, 1210 [3225 Metric]',
      mpn: 'GRM32ER60J107ME20L'
    }
    products.clickOnReportsTab();
    products.verifyAllDataInReportsTable(reportsData);
  })
})
