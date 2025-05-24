import { AuthApi } from "../../api/auth";
import { Export } from "../../pages/export";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Dashboard } from "../../pages/dashboard";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { TableHelpers } from "../../helpers/tableHelper";
import { Assembly } from "../../pages/components/assembly";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import prodSelectors from "../../selectors/products/products";
import compSelectors from "../../selectors/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import coSelectors from "../../selectors/changeOrders/changeOrder";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { ImportFromFile } from "../../pages/components/importFromFile";
import CPN_rules from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries } from "../../helpers/dataHelpers/customCpn/CPN_libraries";

const signin = new SignIn();
const exports = new Export();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const assembly = new Assembly();
const dashboard = new Dashboard();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const changeOrder = new ChangeOrders();
const tableHelper  = new TableHelpers();
const featureHelper = new FeatureHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const cpnLibraries = new CpnLibraries();

let email, companyId, orgId, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  companyName = user.companyName;
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company;
    compSettings.updateAferoCompanySettings(companyId);
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  // Reset company
  cpnLibraries.set_CPN_rules(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);
  authApi.reSignin();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Check CPN duplicates and variants', {tags: ["Afero", "CPN"], retries: 2}, () => {
  beforeEach(() => {
    // Enter component data
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Adhesive');
    components.enterComponentName('cmp');
    components.clickOnCreate();
  })

  it('should display variant value in view mode for 00', () => {
    // Save the component
    components.clickSaveButtonInEditComponent();

    // Verify CPN in view component
    components.verifyCpnInViewPage('M-ADH-00001-00');
  })

  it('should display variant value in view mode for greater than 00', () => {
    // Enter EID & Save the component
    components.enterDescriptionInEditComponent('Desc');
    components.enterCpnVariantInEditComponent("01");
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.clickSaveButtonInEditComponent();

    // Verify the CPN in view component
    components.verifyCpnInViewPage('M-ADH-00001-01');
  })

  it('should display variant value in all tables in view mode for 00 value', () => {
    components.clickSaveButtonInEditComponent();

    // Verify CPN in library
    nav.openComponentsTab();
    tableHelper.assertTextInCell('cpn', 'cmp', 'M-ADH-00001-00');

    // Verify CPN in search table
    nav.openDashboard();
    dashboard.enterSearchTerm('type: cmp M-ADH-000');
    dashboard.getSearchRowContent('name').then(name => expect(name).to.eq('cmp'));
    dashboard.getSearchRowContent('cpn').then(cpn => expect(cpn).to.eq('M-ADH-00001-00'));

    // Create an assembly component
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Sub-Assembly');
    components.enterComponentName('Cmp-Assembly');
    components.selectStatus(constData.status.prototype);
    components.clickOnCreate();

    // Verify the CPN in assembly library
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable()
    assembly.clickAddFromLibrary();
    assembly.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('M-ADH-00001-00'));

    // Save the component & Add to changeOrder
    components.clickSaveButtonInEditComponent();
    components.clickOnChangeOrderIconInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify CPN in changeOrder assembly table
    changeOrder.enterNameInEcoModal('TEST ECO');
    tableHelper.assertTextInCell('cpn', 'Cmp-Assembly', "A-SUB-00001-00", prodSelectors.tableHeader, coSelectors.changeOrderTable.cpn);
    changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('M-ADH-00001-00'));
    changeOrder.clickSaveDraft();

    // Verify CPN in export table in export page
    components.navigateToComponentViewPage('M-ADH-00001-00', false, 'cpn');
    components.clickExportIconInViewComponent();
    tableHelper.assertTextInCell('cpn', 'cmp', 'M-ADH-00001-00');
  })

  it('should display variant value in all tables in view mode for greater than 00 value', () => {
    // Create the component with 01 variant
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.clickSaveButtonInEditComponent();

    // Verify CPN in library
    nav.openComponentsTab();
    tableHelper.assertTextInCell('cpn', 'cmp', 'M-ADH-00001-01');

    // Verify CPN in search table
    components.enterSearchTerm('type:cmp M-ADH-000');
    tableHelper.assertTextInCell('cpn', 'cmp', 'M-ADH-00001-01');

    // Create an assembly component
    components.clickonCreateManually();
    components.chooseCategory('Sub-Assembly');
    components.enterComponentName('Cmp-Assembly');
    components.selectStatus(constData.status.prototype);
    components.clickOnCreate();

    // Verify the CPN in assembly library
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable()
    assembly.clickAddFromLibrary();
    assembly.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('M-ADH-00001-01'));

    // Save component with EID
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.enterEidInComponentEditPage('cmp-two-eid-value');
    components.clickSaveButtonInEditComponent();

    // Add component to changeOrder
    components.clickOnChangeOrderIconInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify CPN in changeOrder assembly table
    changeOrder.enterNameInEcoModal('TEST ECO');
    tableHelper.assertTextInCell('cpn', 'Cmp-Assembly', "A-SUB-00001-01", prodSelectors.tableHeader, coSelectors.changeOrderTable.cpn);
    changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('M-ADH-00001-01'));
    changeOrder.clickSaveDraft();

    // Verify CPN in export table in export page
    components.navigateToComponentViewPage('M-ADH-00001-01', false, 'cpn');
    components.clickExportIconInViewComponent();
    tableHelper.assertTextInCell('cpn', 'cmp', 'M-ADH-00001-01');
  })

  it('should display variant value in export package directory and specifications for 00 value', () => {
    components.clickSaveButtonInEditComponent();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();

    // Verify the exported data
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-M-ADH-00001-00-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ "1", "0", "M-ADH-00001-00", "Adhesive", "cmp", "", "", "", "DESIGN", "", "", "TYPE: , THICKNESS: , COLOR: , USAGE: , MATERIAL: ",
                                                                                              "", "EACH", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    })
  })

  it('should display variant value in export package directory and specifications for greater than 00 value', () => {
    // Save component with EID
    components.enterDescriptionInEditComponent("Desc");
    components.enterCpnVariantInEditComponent("01");
    components.enterEidInComponentEditPage('cmp-two-eid-value');
    components.clickSaveButtonInEditComponent();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();

    // Verify the exported data
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-M-ADH-00001-01-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ "1", "0", "M-ADH-00001-01", "Adhesive", "cmp", "", "cmp-two-eid-value", "", "DESIGN", "Desc", "", "TYPE: , THICKNESS: , COLOR: , USAGE: , MATERIAL: ",
                                                                                              "", "EACH", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    })
  })
})

describe('Check category names and prefixes', () => {
  it('should support all categories', () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("16b.all-categories-afero.xlsx");
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(49);

    let componentCpns = [];
    let componentNames = [];

    compApi.getAllComponents().then((res) => {
      const results = res.body.data.results;
      for (let i = 0; i < results.length; i++) {
        componentCpns.push(results[i].cpn.substring(0,5)); 
        componentNames.push(results[i].name)
        expect(componentCpns[i]).to.eq(componentNames[i]);
      }
    })
  })
})
