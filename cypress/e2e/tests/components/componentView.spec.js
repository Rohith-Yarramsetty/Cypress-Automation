import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import { TableHelpers } from "../../helpers/tableHelper";
import { Products } from "../../pages/products/products";
import { Assembly } from "../../pages/components/assembly";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const products = new Products();
const assembly = new Assembly();
const navHelper = new NavHelpers();
const components = new Components();
const tableHelper = new TableHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
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

describe('Component fields should be present in view', () => {
  it('where used should give the correct results', () => {
    // Create a product
    products.createAndSaveBasicProduct('Product_Test', 'PRODUCTION', 'A');

    // Import components as assemblies
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.addAssemblyComponentsFromFile('10a.new_componens_for_left_nav_tree.xlsx');
    products.clickSaveButtonInEditProduct();
    assembly.verifyAssemblyChildCount(6);

    // Update the imported components through import
    components.navigateToComponentEditPage('EBOM cmp');
    assembly.clickOnAssemblyTab();
    assembly.addAssemblyComponentsFromFile('10b.add_components_to_assembly.xlsx', 'Existing');
    components.clickSaveButtonInEditComponent();

    // Import components as assemblies
    components.navigateToComponentEditPage('MBOM cmp', false);
    assembly.clickOnAssemblyTab();
    assembly.addAssemblyComponentsFromFile('10c.add_new_component.xlsx');
    components.clickSaveButtonInEditComponent();

    // Navigate to the where used component view
    components.navigateToComponentViewPage('where used cmp', false);
    components.clickWhereUsedIconInViewComponent();

    // Verify the where used assemblies quantity
    components.clickWhereUsedIconInViewComponent();
    tableHelper.assertTextInCell('quantity', 'Product_Test', 4);
    tableHelper.assertTextInCell('quantity', 'MBOM cmp', 2);

    // Verify the where used data
    components.verifyWhereUsedText('1 Product, 1 Assembly');
  })
})
