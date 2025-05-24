import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { Products } from "../../pages/products/products";
import { Assembly } from "../../pages/components/assembly";
import { Variants } from "../../pages/components/variants";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const products = new Products();
const variants = new Variants();
const assembly = new Assembly();
const navHelper = new NavHelpers();
const components = new Components();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

beforeEach(function () {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Product variant Module", { tags: ["Variants", "Product_Variants"] }, () => {
  it('Should be able to create multiple variants for a duplicated one', () => {
    products.createAndSaveBasicProduct();
    products.getCpnValueFromEditViewPage().then((cpn1) => {

      // Duplicate the product
      products.clickDuplicateIconInViewPage();
      products.clickSaveButtonInEditProduct();
      products.getCpnValueFromEditViewPage().then((cpn2) => {

        // Create a variant
        products.clickVariantIconInViewPage();
        products.clickCreateNewVariantBtn();
        products.clickSaveButtonInEditProduct();
        products.getCpnValueFromEditViewPage().then((cpn3) => {

          // Verify the variants
          variants.navigateToVariantsTab();
          variants.verifyAssemblyVariantsExists(1, [cpn2, cpn3]);
          variants.verifyAssemblyVariantsNotExists([cpn1]);

          // Create another variant
          products.clickVariantIconInViewPage();
          products.clickCreateNewVariantBtn();
          products.renameProductNameInEditPage();
          products.clickSaveButtonInEditProduct();
          products.getCpnValueFromEditViewPage().then((cpn4) => {

            // Verify the variants
            variants.navigateToVariantsTab();
            variants.verifyAssemblyVariantsExists(2, [cpn2, cpn3, cpn4]);
            variants.verifyAssemblyVariantsNotExists([cpn1]);
          })
        })
      })
    })
  })

  it('should display flattened BOM correctly in variant tab', {defaultCommandTimeout: 120000}, () => {
    // Create few components in tree structure
    components.createComponentsWithTreeStructure();

    // Get CPN values of components
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable('cmp-1', 1).then((cpn1) => 
    featureHelper.getCpnValueFromTable('cmp-2', 1).then((cpn2) => 
    featureHelper.getCpnValueFromTable('cmp-3', 1).then((cpn3) =>
    featureHelper.getCpnValueFromTable('cmp-4', 1).then((cpn4) => {

      // Create a product
      nav.openProductTab();
      products.clickNewButton();
      products.checkCategoryItem(constData.productType.firmware);
      products.enterProductName('New_Prod');
      products.selectLifeCycleStatus(constData.status.prototype);
      products.clickCreateButton();
      assembly.clickOnAssemblyTab();

      let srcData, cpnValues = [cpn1, cpn2, cpn3, cpn4];
      for(let i=1; i<4+1; i++) {
        srcData = {
          CPN      : cpnValues[i-1],
          Quantity : i,
        }

        // Add components as product assemblies
        assembly.addComponentsToAssemblyTable(srcData);
      }

      // Enter sourcing data
      products.clickSaveButtonInEditProduct();
      products.clickVariantIconInViewPage();
      products.clickCreateNewVariantBtn();
      products.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the components
      variants.navigateToVariantsTab();
      variants.verifyLengthOfVariantsAssemblyTable(4);

      // Verify the variant data
      variants.verifyQuantityOfComponent('cmp-1', '999-00001', '119');
      variants.verifyQuantityOfComponent('cmp-2', '999-00001', '59');
      variants.verifyQuantityOfComponent('cmp-3', '999-00001', '19');
      variants.verifyQuantityOfComponent('cmp-4', '999-00001', '4');

      // Verify the variant data
      variants.verifyQuantityOfComponent('cmp-1', '999-00002', '119');
      variants.verifyQuantityOfComponent('cmp-2', '999-00002', '59');
      variants.verifyQuantityOfComponent('cmp-3', '999-00002', '19');
      variants.verifyQuantityOfComponent('cmp-4', '999-00002', '4');
    }))))
  })
})
