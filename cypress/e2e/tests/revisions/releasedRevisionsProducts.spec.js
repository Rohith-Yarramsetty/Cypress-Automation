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

describe("Products", { tags: ["Revision", "Released_Revision", "Released_Revision_Products"] }, () => {
  let email, companyId, orgId, supplierEmail;

  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
    // Add Supplier role user
    supplierEmail = userApi.createUserUsingApi('SUPPLIER').email
    userApi.acceptInvitation(supplierEmail);
  })
  
  beforeEach(function () {
    authApi.signin(supplierEmail);
    navHelper.navigateToSearch();
  })
  
  afterEach(() => {
    authApi.signOut();
  })
  
  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("Released Revision for Product", () => {
    let cmpData1, cmpData2, cmpData3, prodName;
    before(() => {
      authApi.signin(email);
      navHelper.navigateToSearch();

      // Create 3 components
      cmpData1 = {
        category     : 'EBOM',
        name         : fakerHelper.generateComponentName(),
        revision     : 1,
        status       : constData.status.prototype
      }
      cmpData2 = {
        category     : 'EBOM',
        name         : fakerHelper.generateComponentName(),
        revision     : 1,
        status       : constData.status.prototype
      }
      cmpData3 = {
        category     : 'EBOM',
        name         : fakerHelper.generateComponentName(),
        revision     : 1,
        status       : constData.status.prototype
      }
      compApi.createComponent(cmpData1);
      compApi.createComponent(cmpData2);
      compApi.createComponent(cmpData3);

      // Create a product
      prodName = fakerHelper.generateProductName();
      nav.openProductTab();
      products.clickNewButton();
      products.checkCategoryItem("Electrical");
      products.enterProductName(prodName);
      products.selectLifeCycleStatus(constData.status.prototype);
      products.enterEid("EID-01");
      products.enterRevision(1);
      products.clickCreateButton();
      featureHelper.waitForLoadingIconToDisappear();
      products.clickSaveButtonInEditProduct();

      // Add component 2 as child for product
      const cmp2AssemblyData = {
        CPN       : '910-00002' ,
        Quantity  : 1
      }
      products.clickEditIcon();
      assembly.clickOnAssemblyTab();
      assembly.addComponentsToAssemblyTable(cmp2AssemblyData);
      products.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Add component 3 as child for component 2
      const cmp3AssemblyData = {
        CPN       : '910-00003' ,
        Quantity  : 1
      }
      components.navigateToComponentEditPage(cmpData2.name);
      assembly.clickOnAssemblyTab();
      assembly.addComponentsToAssemblyTable(cmp3AssemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Add product and all its children to CO and approve it
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      products.clickOnChangeOrderIconInViewProduct();
      products.clickAddToChangeOrderInViewProduct();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData2.name);
      changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData3.name);
      changeOrders.clickMcoIcon();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
      changeOrders.approveNewChangeOrder();

      // Edit product to create modified revision after released revision
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      products.clickEditIcon();
      products.enterEidInProductEditPage('EID-02');
      products.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();
    })

    after(() => {
      compSettings.resetCompany(companyId);
    })

    it('should edit product from released revision route correctly', () => {
      // Add description to product and save
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      products.clickEditIcon();
      products.enterDescriptionInProductEditPage('desc updated');
      products.clickSaveButtonInEditProduct();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify saved description
      products.verifyDescInProductViewPage('desc updated');
    });

    it('should go to product view page from released revision route correctly', () => {
      // Go to product and click on preivious revision
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      featureHelper.waitForLoadingIconToDisappear();
      products.clickOnChangeOrderIconInViewProduct();
      products.clickOnPreviousRevision(1);
      featureHelper.waitForLoadingIconToDisappear();

      // Verify revision and modified icon
      products.verifyRevisionInViewProduct(2);
      products.verifyProductRevisionModifiedIconPresent();
    });

    it.skip('should go to the latest released revision from an old revision route correctly', () => {
      // Go to product and click on 2nd revision and verify revision and modified icon
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      featureHelper.waitForLoadingIconToDisappear();
      products.clickOnHistoryIcon();
      products.clickOnPreviousRevision(2);
      products.verifyRevisionInViewProduct(1);
      products.verifyProductRevisionModifiedIconNotPresent();

      // Click on view latest revision btn and verify revision and modified icon
      products.clickOnViewLatestReleaseBtn();
      featureHelper.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct(2);
      products.verifyProductRevisionModifiedIconNotPresent();
    });

    it('should navigate supplier to released revision route correctly', () => {
      // Go to product verify revision and modified icon
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      featureHelper.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct(2);
      products.verifyProductRevisionModifiedIconNotPresent();

      // Verify child's revision and status on releaed revision page of product
      assembly.clickOnAssemblyChildCmp(cmpData2.name);
      components.verifyRevisionInViewComponent(2);
      components.verifyStatusInViewComponent(constData.status.prototype);
    });

    it('should revert changes from modified history table correctly', () => {
      // Got to product and click on Previous revision
      nav.openProductTab();
      tableHelper.clickOnCell(constData.productTableHeaders.name, prodName);
      featureHelper.waitForLoadingIconToDisappear();
      products.clickOnChangeOrderIconInViewProduct();
      products.clickOnPreviousRevision(1);

      // Revert back the changes and verify revision and modified icon
      products.clickOnChangeOrderIconInViewProduct();
      products.clickOnRevertBack();
      products.clickYesBtnInConfirmRevertChanges();
      // featureHelper.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct(2);
      products.verifyProductRevisionModifiedIconNotPresent();
    });
  });
});