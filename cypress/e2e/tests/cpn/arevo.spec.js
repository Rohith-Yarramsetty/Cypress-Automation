import { AuthApi } from "../../api/auth";
import { Export } from "../../pages/export";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Dashboard } from "../../pages/dashboard";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { Assembly } from "../../pages/components/assembly";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import prodSelectors from "../../selectors/products/products";
import compSelectors from "../../selectors/components/component";
import coSelectors from "../../selectors/changeOrders/changeOrder";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { ComponentApi } from "../../api/componentApi";
import { ImportFromFile } from "../../pages/components/importFromFile";
import CPN_rules from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries } from "../../helpers/dataHelpers/customCpn/CPN_libraries";

const signin = new SignIn();
const nav = new Navigation();
const exports = new Export();
const authApi = new AuthApi();
const userApi = new UsersApi();
const assembly = new Assembly();
const dashboard = new Dashboard();
const navHelper = new NavHelpers();
const components = new Components();
const changeOrder = new ChangeOrders();
const tableHelper  = new TableHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const importFromFile = new ImportFromFile();
const compApi = new ComponentApi();
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
    compSettings.updateArevoCompanySettings(companyId);
  })
})

afterEach(() => {
  // Reset company
  cpnLibraries.set_CPN_rules(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);
  authApi.reSignin();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Check CPN duplicates and variants', {tags: ["Arevo", "CPN"], retries: 3}, () => {
  beforeEach(() => {
    authApi.signin(email);
    navHelper.navigateToSearch();

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

    // Verify the CPN in view component
    components.verifyCpnInViewPage('310-00001-00');
  })

  it('should display variant value in view mode for greater than 00', () => {
    // Enter EID & Save the component
    // featureHelper.waitForLoadingIconToDisappear();
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.enterCpnVariantInEditComponent("01");
    components.clickSaveButtonInEditComponent();

    // Verify the CPN in view component
    components.verifyCpnInViewPage('310-00001-01');
  })

  it('should increment counter value when component duplicated with 00 variant value', () => {
    // Save the component
    components.clickSaveButtonInEditComponent();

    // Duplicate the component
    components.duplicateComponentFromDetailsPage();
    components.clickSaveButtonInEditComponent();

    // Verify the CPN in view component
    components.verifyCpnInViewPage('310-00002-00');
  })

  it('should increment counter value when component duplicated with greater than 00 variant value', () => {
    // Enter EID, CPN variant & Save the component
    components.verifyCategoryInEditComponent("(310) Adhesive");
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.enterCpnVariantInEditComponent("01");
    components.clickSaveButtonInEditComponent();

    components.duplicateComponentFromDetailsPage();
    components.clickSaveButtonInEditComponent();
  })

  it('should display variant value in all tables in view mode for 00 value', () => {
    components.clickSaveButtonInEditComponent();

    // Verify CPN in library
    nav.openComponentsTab();
    tableHelper.assertTextInCell('cpn', 'cmp', '310-00001-00');

    // Verify CPN in search table
    nav.openDashboard();
    dashboard.enterSearchTerm('type:cmp 310-000');
    dashboard.getSearchRowContent('name').then(name => expect(name).to.eq('cmp'));
    dashboard.getSearchRowContent('cpn').then(cpn => expect(cpn).to.eq('310-00001-00'));

    // Create an assembly component
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Sub Assembly');
    components.enterComponentName('Cmp-Assembly');
    components.selectStatus(constData.status.prototype);
    components.clickOnCreate();

    // Verify the CPN in assembly library
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable()
    assembly.clickAddFromLibrary();
    assembly.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('310-00001-00'));

    // Save component & Add component to changeOrder
    components.clickSaveButtonInEditComponent();
    components.clickOnChangeOrderIconInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify CPN in changeOrder assembly table
    changeOrder.enterNameInEcoModal('TEST ECO');
    tableHelper.assertTextInCell('cpn', 'Cmp-Assembly', "001-00001-00", prodSelectors.tableHeader, coSelectors.changeOrderTable.cpn);
    changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('310-00001-00'));
    changeOrder.clickSaveDraft();

    // Verify CPN in export table in export page
    components.navigateToComponentViewPage('310-00001-00', false, 'cpn');
    components.clickExportIconInViewComponent();
    tableHelper.assertTextInCell('cpn', 'cmp', '310-00001-00');
  })

  it('should display variant value in all tables in view mode for greater than 00 value', () => {
    // Create the component with 01 variant
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.clickSaveButtonInEditComponent();

    // Verify CPN in library
    nav.openComponentsTab();
    tableHelper.assertTextInCell('cpn', 'cmp', '310-00001-01');

    // Verify CPN in search table
    components.enterSearchTerm('type:cmp 310-000');
    tableHelper.assertTextInCell('cpn', 'cmp', '310-00001-01');

    // Create an assembly component
    components.clickonCreateManually();
    components.chooseCategory('Sub Assembly');
    components.enterComponentName('Cmp-Assembly');
    components.selectStatus(constData.status.prototype);
    components.clickOnCreate();

    // Verify the CPN in assembly library
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable()
    assembly.clickAddFromLibrary();
    assembly.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('310-00001-01'));

    // Save component with EID
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.enterEidInComponentEditPage('cmp-two-eid-value');
    components.clickSaveButtonInEditComponent();

    // Add component to changeOrder
    components.clickOnChangeOrderIconInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify CPN in changeOrder assembly table
    changeOrder.enterNameInEcoModal('TEST ECO');
    tableHelper.assertTextInCell('cpn', 'Cmp-Assembly', "001-00001-01", prodSelectors.tableHeader, coSelectors.changeOrderTable.cpn);
    changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('310-00001-01'));
    changeOrder.clickSaveDraft();

    // Verify CPN in export table in export page
    components.navigateToComponentViewPage('310-00001-01', false, 'cpn');
    components.clickExportIconInViewComponent();
    tableHelper.assertTextInCell('cpn', 'cmp', '310-00001-01');
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
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-310-00001-00-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ "1", "0", "310-00001-00", "Adhesive", "cmp", "", "", "", "DESIGN", "", "", "TYPE: , THICKNESS: , COLOR: , USAGE: ",
                                                                                              "", "INCHES", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    })
  })

  it('should display variant value in export package directory and specifications for greater than 00 value', () => {
    // Save component with EID
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
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
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-310-00001-01-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ "1", "0", "310-00001-01", "Adhesive", "cmp", "", "cmp-two-eid-value", "", "DESIGN", "", "", "TYPE: , THICKNESS: , COLOR: , USAGE: ",
                                                                                              "", "INCHES", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" ]);
      })
    })
  })
})

describe('Check category names and prefixes', () => {

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  it('should support all categories for arevo', {defaultCommandTimeout: 140000}, () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("16a.all-categories-arevo.xlsx");
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue(); //TODO: Assert ME
    importFromFile.verifyImportProgressModalNotExists();
    importFromFile.verifyImportStatusSucceed(122);

    let componentCpns = [];
    let componentNames = [];

    compApi.getAllComponents().then((res) => {
      const results = res.body.data.results;
      for (let i = 0; i < results.length; i++) {
        componentCpns.push(results[i].cpn.substring(0,3)); 
        componentNames.push(results[i].name)
        expect(componentNames[i]).to.eq(componentCpns[i]);
      }
    })
  })
})