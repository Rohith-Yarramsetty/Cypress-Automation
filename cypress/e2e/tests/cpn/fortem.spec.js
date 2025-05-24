import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Export } from "../../pages/export";
import { Dashboard } from "../../pages/dashboard";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
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
import { Utils } from "../../helpers/utils";
import selectors from "../../selectors/components/component";
import compSettingsPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { ComponentApi } from "../../api/componentApi";
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
const components = new Components();
const tableHelper = new TableHelpers();
const changeOrder = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const utils = new Utils();
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
    compSettings.updateFortemCompanySettings(companyId);
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  // Reset company
  cpnLibraries.set_CPN_rules(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);
  authApi.reSignin();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Check CPN duplicates and variants', () => {
  beforeEach(() => {
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('(825) Adhesive');
    components.enterComponentName('cmp');
    components.clickOnCreate();
  })

  it('should increment variant value when new variant created with 00 variant value', () => {
    components.clickSaveButtonInEditComponent();

    // Create a variant
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    components.clickSaveButtonInEditComponent();

    // Verify the CPN in view component
    components.verifyCpnInViewPage('825-0001-01');
  })

  it('should increment variant value when new variant created with greater than 00 variant value', () => {
    // Enter EID, CPN variant & Save the component
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.verifySaveBtnEnabledInEditView();
    components.clickSaveButtonInEditComponent();

    // Create a variant
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    components.clickSaveButtonInEditComponent();

    // Verify the CPN in view component
    components.verifyCpnInViewPage('825-0001-02');
  })

  it('should not display variant value in view mode for 00', () => {
    components.clickSaveButtonInEditComponent();

    // Verify the CPN of component
    components.verifyCpnInViewPage('825-0001');
  })

  it('should display variant value in view mode for greater than 00', () => {
    // Enter EID, CPN variant & Save the component
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.clickSaveButtonInEditComponent();

    // Verify the CPN in view component
    components.verifyCpnInViewPage('825-0001-01');
  })

  it('should increment counter value when component duplicated with 00 variant value', () => {
    // Save the component
    components.clickSaveButtonInEditComponent();

    // Duplicate the component
    components.duplicateComponentFromDetailsPage();
    components.clickSaveButtonInEditComponent();

    // Verify the CPN in view component
    components.verifyCpnInViewPage('825-0002');
  })

  it('should increment counter value when component duplicated with greater than 00 variant value', () => {
    // Enter EID, CPN variant & Save the component
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.enterEidInComponentEditPage('cmp-eid-value');
    components.clickSaveButtonInEditComponent();

    components.duplicateComponentFromDetailsPage();
    components.clickSaveButtonInEditComponent();
  })

  it('should allow updating component using cpn even if cpn variant is not present', () => {
    // Save the component
    components.clickSaveButtonInEditComponent();

    // Update the component through import & verify
    importFromFile.importComponentsFromFile('fortrem.update_components-using-cpn.xlsx', 'Existing');
    importFromFile.verifyImportStatusSucceed(1);
    tableHelper.assertTextInCell('status', 'cmp', 'PRODUCTION');
    tableHelper.assertTextInCell('revision', 'cmp', 'B');
  })

  it('should not display variant value in all tables in view mode for 00 value', () => {
    components.clickSaveButtonInEditComponent();

    // Verify CPN in library
    nav.openComponentsTab();
    tableHelper.assertTextInCell('cpn', 'cmp', '825-0001');

    // Verify CPN in search table
    nav.openDashboard();
    dashboard.enterSearchTerm('type:cmp 825-00');
    dashboard.getSearchRowContent('name').then(name => expect(name).to.eq('cmp'));
    dashboard.getSearchRowContent('cpn').then(cpn => expect(cpn).to.eq('825-0001'));

    // Create an assembly component
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Cable Sub-Assembly');
    components.enterComponentName('Cmp-Assembly');
    components.selectStatus(constData.status.prototype);
    components.clickOnCreate();

    // Verify the CPN in assembly library
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable()
    assembly.clickAddFromLibrary();
    assembly.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('825-0001'));

    // Save component & Add component to changeOrder
    components.clickSaveButtonInEditComponent();
    components.clickOnChangeOrderIconInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify CPN in changeOrder assembly table
    changeOrder.enterNameInEcoModal('TEST ECO');
    tableHelper.assertTextInCell('cpn', 'Cmp-Assembly', "220-0001", prodSelectors.tableHeader, coSelectors.changeOrderTable.cpn);
    changeOrder.getCpnValueFromAssemblyLibrary(1).then((cpn) => expect(cpn).to.eq('825-0001'));
    changeOrder.clickSaveDraft();

    // Verify CPN in export table in export page
    components.navigateToComponentViewPage('825-0001', false, 'cpn');
    components.clickExportIconInViewComponent();
    tableHelper.assertTextInCell('cpn', 'cmp', '825-0001');
  })

  it('should display variant value in export package directory and specifications for greater than 00 value', () => {
    // Enter EID & variant for the component
    components.clickSaveButtonInEditComponent();
    components.clickEditIcon();
    components.enterEidInComponentEditPage('cmp-two-eid-value');
    featureHelper.enterText(compSelectors.editComponent.cpnVarinatField, "01");
    components.verifySaveBtnEnabledInEditView();
    components.clickSaveButtonInEditComponent();

    // Export the component
    components.verifyEidInViewPage('cmp-two-eid-value');
    components.clickExportIconInViewComponent();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();

    // Verify the exported data
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-825-0001-01-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ "1", "0", "825-0001-01", "Adhesive", "cmp", "", "cmp-two-eid-value", "", "DESIGN", "", "", "TYPE: , THICKNESS: , COLOR: , USAGE: , MATERIAL: ",
                                                                                              "", "INCHES", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    })
  })

  it('should not display variant value in export package directory and specifications for 00 value', () => {
    components.clickSaveButtonInEditComponent();

    // Export the component data
    components.clickExportIconInViewComponent();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();

    // Verify the exported data
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-825-0001-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq([ "1", "0", "825-0001", "Adhesive", "cmp", "", "", "", "DESIGN", "", "", "TYPE: , THICKNESS: , COLOR: , USAGE: , MATERIAL: ", "", "INCHES",
                                                                                              "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
      })
    })
  })

  it('should only allow 2-digit positive integers for variant value', () => {
    components.setVariantFieldValue("-1")
    Utils.getErrorMsgFromDataTip(selectors.editComponent.variantField).then((errMsg) => {
      expect(errMsg).to.eq("Variant should be between [00..99]");
    })
    components.setVariantFieldValue("01");
    cy.wait(1000);
    components.getVariantFieldValue().then((val) => {
      expect(val).to.eq("01");
    })
  })
})

describe('Default Approver type', () => {
  it("should select default Approval type according to company settings", () => {
    let approvalTypes = ["First-In", "Majority", "Unanimous"];
    for(let approvalType of approvalTypes)
    {
      compSettings.updateCompanySettings(companyId, compSettingsPayloads.ecoDefaultApproval(approvalType));
      changeOrder.clickOnChangeOrder();
      changeOrder.clickNewBtn();
      changeOrder.clickApproverList()
      changeOrder.verifyApproverTypeCheckBxChecked(approvalType);
    }
  })
})

describe('Check category names and prefixes', () => {
  it('should support all categories for fortem', () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("16c.all-categories-fortem.xlsx");
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(46);

    let componentCpns = [];
    let componentNames = [];

    compApi.getAllComponents().then((res) => {
      const results = res.body.data.results;
      for (let i = 0; i < results.length; i++) {
        // Verifying Cpn starts with name
        componentCpns.push(results[i].cpn.substring(0,3)); 
        componentNames.push(results[i].name.substring(0,3));
        expect(componentCpns[i]).to.contain(componentNames[i]);
      }
    })
  })
})
