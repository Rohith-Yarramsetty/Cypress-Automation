import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { ImportFromFile } from "../../pages/components/importFromFile";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { FakerHelpers } from "../../helpers/fakerHelper";
import CPN_rules from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries } from "../../helpers/dataHelpers/customCpn/CPN_libraries";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const components = new Components();
const cpnLibraries = new CpnLibraries();
const compSettings = new CompanySettingsApi();
const featureHelper = new FeatureHelpers();
const importFromFile = new ImportFromFile();
const TableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();

let email, companyId, orgId, companyName;
let nonIntelligent = {
  counterLength: 5,
  counterStartingIndex: 10000,
  isAllowedAlphabetInVariant: false,
  variantStartingIndex: '00'
};

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  companyName = user.companyName;
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company;
    compSettings.updateSpheroCompanySettings(companyId);
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  // Reset company
  cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
})

describe('Test the Free-Form Cpn scheme', { tags: ["Sphero", "CPN"] }, () => {
  it('CPN value should be auto-generated in the specific format TMP-XXXXX', () => {
    // Enter component data
    const data = 'cmp';
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Audio');
    components.enterComponentName(data);
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    nav.openComponentsTab();
    let cpn;
    featureHelper.getCpnValueFromTable(data, 1).then((value) => {
      cpn = value
      expect(cpn).to.include('TMP-')
    })
  })

  it('Should display error message in case of duplicate cpn or invalid input in cpn field', () => {
    // Enter component data
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Electrical Assembly');
    components.enterComponentName('cmp-1');
    components.clickOnCreate();
    components.enterValueInCpnField('TMP-00001$');
    components.verifyCpnErrorTooltipInEditCmpPage('Value should be of type Cpn');
    components.verifySaveBtnDisabledInEditView();

    components.enterValueInCpnField('TMP-00001');
    components.verifySaveBtnEnabledInEditView();

    // Save the component
    components.clickSaveButtonInEditComponent();

    // Enter component data
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Audio');
    components.enterComponentName('cmp-2');
    components.clickOnCreate();

    // Verify the error tooltip present
    components.enterValueInCpnField('TMP-00001');
    components.verifyCpnErrorTooltipInEditCmpPage('CPN already exists in library.');
    components.verifySaveBtnDisabledInEditView();

    components.enterValueInCpnField('TMP-00002');
    components.verifySaveBtnEnabledInEditView();
    components.clickSaveButtonInEditComponent();

    // Verify CPN in view component
    components.verifyCpnInViewPage('TMP-00002');
  })

  it('CPN Field should be editable', () => {
    // Enter component data
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Electrical Assembly');
    components.enterComponentName('cmp-1');
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();

    // Verify the CPN field is editable
    components.clickEditIcon();
    featureHelper.waitForLoadingIconToDisappear();
    components.enterValueInCpnField('TMP-00002');
    components.verifySaveBtnEnabledInEditView();

    // Save the component
    components.clickSaveButtonInEditComponent();

    // Verify CPN in view component
    components.verifyCpnInViewPage('TMP-00002');
  })

  it('Should assign and validate Input cpn values of new components through file Import', () => {
    nav.openComponentsTab();

    // Import Component from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('new-cmp-for-sphero-with-cpn.xlsx');
    importFromFile.clickOnContinue();

    // verify the errors
    importFromFile.enterDataInCellInReviewPage(2, 'cpn', 'TMP-aaa1a');
    importFromFile.errorCountInReviewPage(2);
    importFromFile.verifyErrorIconforCellInReviewPage(1, 'cpn', 'Duplicate cpn found');
    importFromFile.verifyErrorIconforCellInReviewPage(2, 'cpn', 'Duplicate cpn found');

    importFromFile.enterDataInCellInReviewPage(2, 'cpn', 'TMP-00008$');
    importFromFile.verifyErrorIconforCellInReviewPage(2, 'cpn', 'Duplicate cpn found');

    importFromFile.enterDataInCellInReviewPage(2, 'cpn', 'TMP-abc21');
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(6);

    let expectedValues = ["TMP-aaa1a","TMP-abc21","TMP-notIn","TMP-fdefd","TMP-wwwww","TMP-kelox"];

    for (let i = 0; i < expectedValues.length; i++) {
      TableHelper.assertRowPresentInTable(constData.componentTableHeaders.cpn, expectedValues[i]);
    }
  })

  it('Should import a component with the deleted cpn value', () => {
    // Import Component from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("new-cmp-for-sphero-with-deleted-cpn.xlsx");
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);

    // Verify CPN in view component & delete it
    TableHelper.clickOnCell(constData.componentTableHeaders.name, "Comp-with-deleted-cpn");
    components.verifyCpnInViewPage('TMP-00001');
    components.deleteComponentFromDetailsPage();

    // Import Component from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("new-cmp-for-sphero-with-deleted-cpn.xlsx");
    importFromFile.clickOnContinue();
    cy.wait(3000);
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);

    // Verify CPN in view component
    nav.openComponentsTab();
    TableHelper.assertTextInCell(constData.componentTableHeaders.cpn, 'TMP-00001', 'TMP-00001');
  })

  it("Should verify that the save button is enabled when the length of the CPN is up to 40 alphanumeric characters.", () => {
    const faker = require('faker');
    const tmpString = "TMP-" + fakerHelper.getRandomStringOfCharacters(36);
    const finalString = tmpString.slice(0, 41);

    // Enter component data
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory('Electrical Assembly');
    components.enterComponentName('cmp-1');
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();

    // Verify the save btn enabled or disabled based on its length
    components.clickEditIcon();
    featureHelper.waitForLoadingIconToDisappear();
    components.enterValueInCpnField(finalString + "1");
    components.verifyEditableCpnTooltip();
    components.verifySaveBtnDisabledInEditView();

    components.enterValueInCpnField(finalString);
    components.verifySaveBtnEnabledInEditView();

    // Save the component
    components.clickSaveButtonInEditComponent();

    // Verify CPN in view component
    components.verifyCpnInViewPage(finalString);
  })
})
