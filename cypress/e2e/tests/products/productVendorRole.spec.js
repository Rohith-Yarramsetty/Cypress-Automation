import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants"
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { Components } from "../../pages/components/component";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { UsersApi } from "../../api/userApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder"
import { CompanySettingsApi } from "../../api/companySettingsApi"
import { Export } from "../../pages/export";

const signin = new SignIn();
const nav = new Navigation();
const products = new Products();
const fakerhelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();
const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const components = new Components();
const compApi = new ComponentApi();
const assembly = new Assembly();
const userApi = new UsersApi();
const changeOrder = new ChangeOrders();
const exports = new Export();

let email, companyId, orgId, vendorEmail, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  companyName = user.companyName;
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })

  // Invite a Vendor & signin with Vendor account
  vendorEmail = userApi.createUserUsingApi('VENDOR').email;
  userApi.acceptInvitation(vendorEmail);
  Cypress.session.clearAllSavedSessions();
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.resetCompany(companyId)
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Product view should be restricted for Vendor', () => {
  it('Product view is readOnly for the vendor', () => {
    const productName = fakerhelper.generateProductName();

    // Create a Product
    nav.openProductTab();
    products.createBasicProduct(productName);
    nav.openProductTab();
    tableHelper.assertRowPresentInTable(constData.productTableHeaders.name, productName);

    // Signout & signin with Vendor account
    authApi.signOut();
    signin.signin(vendorEmail);
    navHelper.navigateToSearch();

    // Navigate to product view
    nav.openProductTab();
    tableHelper.assertRowPresentInTable(constData.productTableHeaders.name, productName);
    tableHelper.clickOnCell(constData.productTableHeaders.name, productName);

    // Verify Product view page
    products.verifyEditIconNotPresent();
    products.verifyChangeOrderIconNotPresent();
    products.verifyFavoriteIconNotPresent();
    products.verifyHistoryIconPresent();
    products.verifyExportIconPresentForVendorLogin();
  })

  it('Vendor should be able to see latest released revision of product with child components', () => {
    const childCmp = {
      category: 'Capacitor',
      name: "Child-Cmp",
      status: constData.status.design,
      revision: 1,
      ecoName: fakerhelper.generateEcoName(),
    }
    let cpnValue;

    // Create Child Component
    compApi.createComponent(childCmp)
    nav.openComponentsTab();
    featureHelpers.getCpnValueFromTable('Child-Cmp', 1).then((value) => {
      cpnValue = value

      const childCmpData = {
        CPN: cpnValue,
        Quantity: 1
      }

      // Create Product
      nav.openProductTab();
      products.clickNewButton();
      products.enterProductName('Product');
      products.selectLifeCycleStatus(constData.status.design);
      products.clickCreateButton();
      featureHelpers.waitForLoadingIconToDisappear();
      products.clickSaveButtonInEditProduct();

      // Add child Component
      products.clickEditIcon();
      assembly.clickOnAssemblyTab();
      assembly.addComponentsToAssemblyTable(childCmpData);
      products.clickSaveButtonInEditProduct();

      // Update Status & Revision of Product & Component
      products.clickEditIcon();
      components.selectStatusInEditView(constData.status.prototype);
      products.verifyApplyButtonDisabledInChangeStatusModal();
      products.checkIncludeChildComponents();
      products.changeStatus(constData.status.prototype);
      products.enterBulkRevision(1);
      products.clickApplyButton();
      components.verifyChangeStatusHeader();
      products.clickOnContinue();
      featureHelpers.waitForLoadingIconToDisappear();
      products.clickSaveButtonInEditProduct();

      // Add to change order
      nav.openChangeOrdersTab();
      changeOrder.clickNewBtn();
      featureHelpers.waitForLoadingIconToDisappear();
      changeOrder.searchAndCheckComponentInNewChangeOrder('Product');
      changeOrder.searchAndCheckComponentInNewChangeOrder(childCmp.name);
      changeOrder.clickEcoIcon();
      changeOrder.enterNameInEcoModal(childCmp.ecoName);
      changeOrder.enterDescInEcoModal("Desc related to product");
      changeOrder.approveNewChangeOrder();

      // Signout & signin with Vendor account
      authApi.signOut();
      signin.signin(vendorEmail);
      navHelper.navigateToSearch();

      // Verify Product's status & revision
      nav.openProductTab();
      products.enterSearchTerm('Product');
      tableHelper.assertRowPresentInTable(constData.productTableHeaders.name, 'Product');
      tableHelper.clickOnCell(constData.productTableHeaders.name, 'Product');
      products.verifyProductStatusInViewMode(constData.status.prototype);
      products.verifyRevisionInViewMode(1);

      // Verify Component's status & revision
      assembly.clickOnAssemblyTab();
      tableHelper.assertRowPresentInTable(constData.assemblyTableHeaders.cpn, childCmp.name);
      tableHelper.clickOnCell(constData.productTableHeaders.cpn, childCmp.name);
      products.verifyProductStatusInViewMode(constData.status.prototype);
      products.verifyRevisionInViewMode(1);
    })
  })
})

describe("Export module with vendor role for products", () =>{
  it('should export a product specifications with excluding sourcing data for Vendor', () => {
    // Create a Product
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName('Prd-1');
    products.enterEid('11-11-11');
    products.enterProductDescription('my test description');
    products.selectLifeCycleStatus(constData.status.production);
    products.clickCreateButton();
    products.clickSaveButtonInEditProduct();

    // Signout & signin with Vendor account
    authApi.signOut();
    signin.signin(vendorEmail);
    navHelper.navigateToSearch();

    products.navigateToProductViewPage('Prd-1', false);
    products.clickExportIconInProductRevisionPage();

    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    const date = new Date();
    const exportEmail = featureHelpers.getExportEmail(date, vendorEmail);
    const exportEmailDate = featureHelpers.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-999-00001.A-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelpers.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 'Unit of Measure', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date']);
        expect(featureHelpers.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ '1', '0', '999-00001', '', 'Prd-1', '11-11-11', 'A', 'PRODUCTION', 'my test description', '', '', '', '', '', '', '', '0', '', '', '', '', '', ''])
      });
    });
  });
});
