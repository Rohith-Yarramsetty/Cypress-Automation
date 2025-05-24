import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Export } from "../../pages/export";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { TableHelpers } from "../../helpers/tableHelper";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Sourcing } from "../../pages/components/sourcing";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";

const signin = new SignIn();
const nav = new Navigation();
const exports = new Export();
const authApi = new AuthApi();
const faker = require('faker');
const userApi = new UsersApi();
const sourcing = new Sourcing();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const components = new Components();
const tableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyName, companyId, orgId, authorName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  companyName = user.companyName;
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  authorName = user.fullName;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Component view should be restricted for Vendor", () => {
  it('Vendor should be able to see latest released revision page on clicking Most-Recent-Icon', () => {
    const cmpData = {
      categoryType: "Assembly",
      category: "Battery Pack",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype,
      revision: 2,
    }

    // Create Component & add to CO
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    components.clickOnChangeOrderIconInViewComponent();

    // Create Change Order & approve
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal('CO--for-Cmp');
    changeOrders.enterDescInEcoModal('Desc related to CO');
    changeOrders.approveNewChangeOrder();

    // Invite an user as role vendor & login with vendor credentials 
    const vendor = userApi.createUserUsingApi('VENDOR');
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(vendor.email);
    authApi.signin(vendor.email);
    navHelper.navigateToSearch();

    // Navigate to components tab
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    components.verifyRevisionInViewComponent(3);

    // Select Major revision
    components.clickOnHistoryIcon();
    components.clickOnRevisionInHistoryTable(authorName, cmpData.revision, 'rev');
    components.clickOnViewLatestRelease();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the URL
    cy.url().should('include', 'component/revision');
  })

  it.skip('Vendor should only see released revisions in history table', () => {
    const cmpData = {
      categoryType: "Assembly",
      category: "Battery Pack",
      name: fakerHelper.generateProductName(),
      status: constData.status.design,
    }

    // Create Component
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);

    // Update the status of component
    components.clickEditIcon();
    components.selectStatusInEditView(constData.status.prototype);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.clickSaveButtonInEditComponent();

    // Add component to Change Order
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData.name);
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal('CO-for-cmp');
    changeOrders.enterDescInEcoModal('Desc realted to CO');
    changeOrders.approveNewChangeOrder();

    // Add Description in edit component
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    components.clickEditIcon();
    components.enterDescriptionInEditComponent("Desc related to Comp");
    components.clickSaveButtonInEditComponent();

    // Verify the revisions
    components.clickOnHistoryIcon();
    components.verifyTotalNoOfRevisions(3);

    // Invite an user as role vendor & login with vendor credentials
    const vendor = userApi.createUserUsingApi('VENDOR');
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(vendor.email);
    authApi.signin(vendor.email);
    navHelper.navigateToSearch();

    // Verify the revisions
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    components.clickOnHistoryIcon();
    components.verifyTotalNoOfRevisions(2);
  })

  it('Vendor should view latest released revision page from search', () => {
    const cmpData = {
      categoryType: "Assembly",
      category: "Battery Pack",
      name: fakerHelper.generateProductName(),
      status: constData.status.design,
      revision: 1,
    }

    // Create Component & add to CO
    compApi.createComponent(cmpData);

    // Invite an user as role vendor & login with vendor credentials
    const vendor = userApi.createUserUsingApi('VENDOR');
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(vendor.email);
    authApi.signin(vendor.email);
    navHelper.navigateToSearch();

    // Verify the URL
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    cy.url().should('include', 'component/revision');
  })
})

describe("Export module with vendor role for components", () => {
  it('Sourcing tab should not be visible to Vendor', () => {
    const cmpData = {
      name: fakerHelper.generateComponentName(),
      status: constData.status.design,
      revision: 1,
    }

    // Create a Component
    compApi.createComponent(cmpData);

    // Invite a vendor & login with Vendor account
    const vendor = userApi.createUserUsingApi('VENDOR');
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(vendor.email);
    authApi.signin(vendor.email);
    navHelper.navigateToSearch();

    // Verify the Sourcing tab
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    featureHelper.waitForLoadingIconToDisappear();
    sourcing.verifySourcingTabNotPresent();
  })

  it('Sourcing info should be hidden from Vendor in Customized fields of company templates', () => {
    const cmpData = {
      name: fakerHelper.generateComponentName(),
      status: constData.status.design,
    }

    // Create a Component
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(cmpData.name, 1).as('cpn');

    // Navigate to Component export page
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    featureHelper.waitForLoadingIconToDisappear();
    components.clickExportIconInViewComponent();

    // Create a Company template
    exports.clickOnSaveTemplateIcon();
    exports.enterTemplateNameInSaveAsNewTemplate('Test company template');
    exports.checkAccessibleToAll();
    exports.clickOnSaveBtnInSaveOrUpdateTemplateModal();

    // Invite a vendor & login with Vendor account
    const vendor = userApi.createUserUsingApi('VENDOR');
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(vendor.email);
    authApi.signin(vendor.email);
    navHelper.navigateToSearch();

    // Navigate to Component export page
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    featureHelper.waitForLoadingIconToDisappear();
    components.clickOnExportIconInVendorLogin();

    // Verify Component in Export table
    cy.get('@cpn').then((CPN) => {
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.cpn, CPN);
      tableHelper.assertRowPresentInTable(constData.componentTableHeaders.name, cmpData.name);
    })

    // Select the template
    exports.clickOnDropdownIndicator();
    exports.selectTemplateFromDropdown('Test company template', constData.changeOrderTemplateType.company);

    // Verify Sourcing data in Customized fields
    exports.clickOnCustomizeFieldsIcon();
    let sourcingData = ["Primary Source Unit Price","Primary Source Extended Cost","Primary Source MPN", "Primary Source Manufacturer", "Primary Source DPN",
        "Primary Source Distributor", "Total Price", "Primary Source Lead Time", "Manufacturer", "MPN", "MPN Link", "Datasheet", "Mfr Description", "Warranty",
        "Distributor", "DPN", "DPN Link", "Dist Description", "Package", "Package Quantity", "Quantity Min", "Unit Price", "Lead Time"]

    for(let i=0; i<sourcingData.length; i++) {
      exports.verifyLabelNotPresentCustomizedFields(sourcingData[i]);
    }
    exports.clickOnCancelInCustomizeFieldModal();
  })

  it('Should export a component specifications with excluding sourcing data for Vendor', () => {
    const vendor = userApi.createUserUsingApi('VENDOR');
    const vendorEmail = vendor.email;
    const cmpData = {
      name: 'cmp-1',
      category: 'EBOM',
      revision: 1,
      status: constData.status.design,
    }

    // Create a Component
    compApi.createComponent(cmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(cmpData.name, 1).as('cpn');

    // Invite a vendor & login with Vendor account
    authApi.signOut();
    Cypress.session.clearAllSavedSessions();
    userApi.acceptInvitation(vendorEmail);
    authApi.signin(vendorEmail);
    navHelper.navigateToSearch();

    // Export the Component
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    featureHelper.waitForLoadingIconToDisappear();
    components.clickOnExportIconInVendorLogin();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.clickExportBtnInExportSettings();

    const date = new Date();

    const headers = ['Item', 'Level', 'CPN', 'Category', 'Name', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity',
              'Unit of Measure', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 'Item Type', 'Effectivity Start Date', 
              'Effectivity End Date'];

    const row1 = [ '1', '0', '910-00001', 'EBOM', 'cmp-1', '', '1', 'DESIGN', '', '', '', '', 'EACH', '', '', '', '0', '', '', '', '', '', ''];

    // Download & Verify the data in XLSX file sent to Vendor
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd');
    companyName = `${companyName.charAt(0).toUpperCase() + companyName.slice(1)}`;
    const emailSubject = `${companyName} Export: Specs-910-00001.1-${exportEmailDate}`;
    featureHelper.getExportEmailThroughSubject(date, vendorEmail, emailSubject).then(email => {
      expect(email.subject).to.include(`${emailSubject}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = email.html.links[0].text.toString();
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(headers);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(row1);
      })
    });
  })
})
