import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Assembly } from "../../pages/components/assembly";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const assembly = new Assembly();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
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

describe("Import to Assembly Module", () => {
  it('Should add new components to assembly without error', () => {
    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('6.baseline-assembly-component.xlsx');

    // Verify the Labels mapped
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the count of imported components
    importFromFile.verifyTotalComponentsCount(1);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'EBOM Assembly Parent');

    // Import Assembly Components
    components.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.uploadFile('6a.new_component-bare_minimum.xlsx');
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the labels Mapped
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Description', 'description');
    importFromFile.verifyNecessaryLabelsMapped('Quantity', 'quantity');
    importFromFile.verifyNecessaryLabelsMapped('Ref Des', 'ref des');
    importFromFile.verifyNecessaryLabelsMapped('Item Number', 'item number');
    importFromFile.clickOnContinue();

    // Verify import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    components.clickSaveButtonInEditComponent();
    nav.openComponentsTab();

    // Verify the count of imported components
    importFromFile.verifyTotalComponentsCount(5);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'EBOM Assembly Parent');
    featureHelper.waitForLoadingIconToDisappear();

    let expectedChildAssembly = [{cpn: "232-00001", qty: 2, refdes: "R1, R2"},
                                 {cpn: "212-00001", qty: 1, refdes: "C1"},
                                 {cpn: "212-00002", qty: 1, refdes: "C2"},
                                 {cpn: "212-00003", qty: 3, refdes: "C3, C4,C5"}];

    // Verify the data of Assembly Components
    for(let i=0; i<expectedChildAssembly.length; i++) {
      assembly.verifyQuantityInAssemblyTable(expectedChildAssembly[i].cpn, expectedChildAssembly[i].qty);
      assembly.verifyRefDesInAssemblyTable(expectedChildAssembly[i].cpn, expectedChildAssembly[i].refdes);
    }
  })

  it('Should not allow self-reference in update component assembly', () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('7a1.create-self-reference-component.xlsx');

    // Verify the labels Mapped
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.verifyNecessaryLabelsMapped('Description', 'description');

    // Verify the Import errors
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();

    // Verify Import status & Navigate to Assembly
    importFromFile.verifyImportStatusSucceed(1);
    importFromFile.verifyTotalComponentsCount(1);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'EBOM self reference');
    featureHelper.waitForLoadingIconToDisappear();

    // Import Assembly components
    components.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.checkUpdateFromExistingLibrary();
    assembly.uploadFile('7a2.update-assembly-with-self-reference-component.xlsx');

    // Verify the labels Mapped
    importFromFile.verifyNecessaryLabelsMapped('cpn', 'cpn');
    importFromFile.verifyNecessaryLabelsMapped('quantity', 'quantity');
    importFromFile.verifyNecessaryLabelsMapped('ref des', 'ref des');

    // Verify the Tooltip
    importFromFile.clickOnContinue();
    importFromFile.verifyImportComponentErrorTooltip('910-00001', 'Cannot add parent component as child assembly (Self reference not allowed)');
  })
})
