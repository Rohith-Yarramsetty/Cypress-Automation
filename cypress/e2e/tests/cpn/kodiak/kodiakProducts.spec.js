import { SignIn } from "../../../pages/signin";
import { Navigation } from "../../../pages/navigation";
import constData from "../../../helpers/pageConstants";
import { NavHelpers } from "../../../helpers/navigationHelper";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { Products } from "../../../pages/products/products";
import { TableHelpers } from "../../../helpers/tableHelper";
import { FeatureHelpers } from "../../../helpers/featureHelper";
import { ChangeOrders } from "../../../pages/changeOrders/changeOrder";
import { UsersApi } from "../../../api/userApi";
import { CompanySettingsApi } from "../../../api/companySettingsApi";
import { AuthApi } from "../../../api/auth";
import prodSelectors from "../../../selectors/products/products";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const products = new Products();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const tableHelpers = new TableHelpers();
const changeOrders = new ChangeOrders();
const featureHelpers = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

describe("Kodiak tests - Products", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateKodiakUserSettings(companyId);
    })
  })

  beforeEach(function () {
    authApi.signin(email)
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("Product status and revision modules", () => {
    beforeEach(function () {
      // Navigate to Product tab
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(fakerHelper.generateProductName());
      products.checkCategoryItem("Electrical");
    })
    it('Product: Should not allow Q, I, O values as revision for all statuses', () => {
      // Design Status: Assert revision with different values
      products.selectLifeCycleStatus(constData.status.design);
      products.enterRevision('Q');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('I');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('O');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();

      // Prototype Status: Assert revision with Q, I, O
      products.selectLifeCycleStatus(constData.status.prototype);
      products.enterRevision('Q');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('I');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('O');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();

      // Production Status: Assert revision with Q, I, O
      products.selectLifeCycleStatus(constData.status.production);
      products.enterRevision('Q');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('I');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('O');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();

      // Obselete Status: Assert revision with Q, I, O
      products.selectLifeCycleStatus(constData.status.obsolete);
      products.enterRevision('Q');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('I');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
      products.enterRevision('O');
      products.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      products.verifyCreateBtnDisabled();
    })
  })

  context("Update revisions of products in change order", () => {
    it('Update the Minor Revision in CO for a Product with status Prototype', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.prototype)
      products.enterRevision('1');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '1A');

      // Change revision by using minor revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMinorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.prototype);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '1A');
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '1A');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct('1A');
    })

    it('Update the Major Revision in CO for a Product with status Prototype', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.prototype)
      products.enterRevision('1');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '1A');

      // Change revision by using major revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMajorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.prototype);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 2);
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 2);
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct(2);
    })

    it('Update the Custom Revision in CO for a Product with status Prototype', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.prototype)
      products.enterRevision('1');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '1A');

      // Change revision by using minor revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkCustomRevisionType();
      changeOrders.enterCustomRevision('99Z')
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.prototype);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '99Z');
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '99Z');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct('99Z');
    })

    it('Update the Minor Revision in CO for a Product with status Production', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.production)
      products.enterRevision('2A');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '2B');

      // Change revision by using major revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMinorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.production);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '2B');
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '2B');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct('2B');
    })

    it('Update the Major Revision in CO for a Product with status Production', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.production)
      products.enterRevision('2A');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '2B');

      // Change revision by using major revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMajorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.production);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 3);
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 3);
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct(3);
    })

    it('Update the Custom Revision in CO for a Product with status Production', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.production)
      products.enterRevision('5V');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '5W');

      // Change revision by using minor revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkCustomRevisionType();
      changeOrders.enterCustomRevision(99)
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.production);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 99);
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 99);
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct(99);
    })

    it('Update the Minor Revision in CO for a Product with status Obsolete', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.obsolete)
      products.enterRevision('A');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 'B');

      // Change revision by using major revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMinorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.obsolete);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 'B');
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 'B');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct('B');
    })

    it('Update the Major Revision in CO for a Product with status Obsolete', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.obsolete)
      products.enterRevision('A');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 'B');

      // Change revision by using major revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMajorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.obsolete);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 1);
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 1);
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct(1);
    })

    it('Update the Custom Revision in CO for a Product with status Obsolete', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.obsolete)
      products.enterRevision('A');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();

      // Add Product to CO
      products.clickOnChangeOrderIconInViewProduct();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 'B');

      // Change revision by using minor revision and verify
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkCustomRevisionType();
      changeOrders.enterCustomRevision('Z')
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.obsolete);
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 'Z');
      changeOrders.approveNewChangeOrder();

      // Verify changed revision in product view
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, 'Z');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, productName);
      featureHelpers.waitForLoadingIconToDisappear();
      products.verifyRevisionInViewProduct('Z');
    })

    it('Update the Revision in CO for a Product with status Design and Assert the error', () => {

      const productName = fakerHelper.generateProductName();
      // Navigate to products page
      nav.openProductTab()

      // Create new product
      products.clickNewButton();
      products.enterProductName(productName);
      products.checkCategoryItem("Electrical");
      products.selectLifeCycleStatus(constData.status.design)
      products.enterRevision('1A');
      products.clickCreateButton();
      products.clickSaveButtonInEditProduct();
      featureHelpers.waitForLoadingIconToDisappear();

      // Add Product to change order
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.searchAndCheckComponentInNewChangeOrder(productName);
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
  
      // Verify Revision & Status and Error
      changeOrders.verifyNextRevisionInChangeOrderTable(productName, '1A');
      changeOrders.verifyStatusInChangeOrderTable(productName, constData.status.design);
      changeOrders.verifyErrorIconInChangeOrderTable(productName);
    })
  })

  context('Check category names and prefixes', () => {
    it('should creating new product with expected cpn', () => {
      // Create a product
      products.createAndSaveBasicProduct('Prod-1');

      // Verify the CPN in product view
      products.navigateToProductViewPage('Prod-1');
      featureHelpers.assertText(prodSelectors.viewProduct.cpnValue, '110001');
    })
  })
})
