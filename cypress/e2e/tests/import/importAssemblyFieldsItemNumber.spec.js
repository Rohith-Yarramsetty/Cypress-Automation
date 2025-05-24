import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import constData from "../../helpers/pageConstants";
import { Components } from "../../pages/components/component";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const assembly = new Assembly();
const compSettings = new CompanySettingsApi();
const products = new Products();
const fakerHelper = new FakerHelpers();
const tableHelper = new TableHelpers();
const components = new Components();
const userApi = new UsersApi();

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

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Import to Assembly Item Number Module", () => {
  it('Should allow item number for product', () => {
    let cmpData = {
      category     : "MBOM",
      name         : "cmp-mbom",
      status       : "DESIGN",
      revision     : "1",
    }

    // Create a Component
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(cmpData.name, 1).as('cpn');

    // Create a Product
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName(fakerHelper.generateProductName());
    products.clickCreateButton();
    products.clickSaveButtonInEditProduct();

    // Add component to Product Assembly
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    cy.get('@cpn').then((cpnValue) => {
      const assemblyCmp = {
        CPN: cpnValue,
        Quantity: 1,
      }
      assembly.addComponentsToAssemblyTable(assemblyCmp);
    })

    // Verify necessary columns in Assembly table
    assembly.verifyColumnPresentInAssemblyTable('itemNumber');
    assembly.verifyColumnNotPresentInAssemblyTable('refDes');
  })

  it('Should allow both item number and ref des, if displayRefDesAndItemNumber is true', () => {
    const cmpData1 = {
      category     : "MBOM",
      name         : "cmp1",
      status       : "DESIGN",
      revision     : "1",
    }
    const cmpData2 = {
      category     : "EBOM",
      name         : "cmp2",
      status       : "DESIGN",
      revision     : "1",
    }

    // Set displayRefDesAndItemNumber is true
    compSettings.updateCompanySettings(companyId, compPayloads.enableRefDesInAssembly);

    // Create Components through API
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(cmpData1.name, 1).as('cpn');

    // Add component to the Assembly
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData2.name);
    components.clickEditIcon();
    assembly.clickOnAssemblyTab();
    cy.get('@cpn').then((cpnValue) => {
      const assemblyCmp = {
        CPN: cpnValue,
        Quantity: 1,
      }
      assembly.addComponentsToAssemblyTable(assemblyCmp);
    })

    // Verify necessary columns in Assembly table
    assembly.verifyColumnPresentInAssemblyTable('itemNumber');
    assembly.verifyColumnPresentInAssemblyTable('refDes');
  })
})
