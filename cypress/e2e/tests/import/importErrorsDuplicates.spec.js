import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { UsersApi } from "../../api/userApi";
import { Components } from "../../pages/components/component";
import { Assembly } from "../../pages/components/assembly";
import { FeatureHelpers } from "../../helpers/featureHelper";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const importFromFile = new ImportFromFile();
const userApi = new UsersApi();
const components = new Components();
const assembly = new Assembly();
const featureHelper = new FeatureHelpers();

let email, companyId, orgId;

describe("Import Error Duplicates Module", () => {
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

  it('Already taken EIDs are not permitted', () => {
    // Import components using Import From File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('newCmpForAlreadyTakenEid.xlsx');

    // Verify necessary fields mapped
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.verifyNecessaryLabelsMapped('Description', 'description');
    importFromFile.verifyNecessaryLabelsMapped('EID', 'eid');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(3);

    // Import same components with same Eid and verify Errors
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('newCmpForAlreadyTakenEid.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyImportComponentErrorTooltip('2.2uF, 10V, 10%, X7R', 'This component name already exists in your library.');
    importFromFile.verifyImportComponentErrorTooltip('5.62K,1% Resistor', 'This component name already exists in your library.');
    importFromFile.verifyImportComponentErrorTooltip('16MHz CRYSTAL_SMD', 'This component name already exists in your library.');
    importFromFile.verifyImportComponentErrorTooltip('123-321', 'Component EID already exists in library.');
    importFromFile.verifyImportComponentErrorTooltip('xxxx-xxxx', 'Component EID already exists in library.');
  })

  it('Duplicate ref des are not allowed', () => {
    // Navigate to Componets tab
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseType("assembly");
    components.chooseCategory("Sub-Assembly");
    components.enterComponentName("my test component");
    components.clickOnCreate();

    // Import components & verify Errors
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    importFromFile.uploadFile("5e5.1.create-assembly-duplicate-refdes.xlsx");
    importFromFile.clickOnContinue();

    // Verify import errors
    importFromFile.errorCountInReviewPage(2);
    importFromFile.verifyContinueBtnDisabledInReviewPage();
  })
})
