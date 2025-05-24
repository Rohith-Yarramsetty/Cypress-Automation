import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { FeatureHelpers } from "../../helpers/featureHelper";

const signin = new SignIn();
const nav = new Navigation();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const featureHelper = new FeatureHelpers();

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

describe("Import File With Headers", () => {
  it("should ignore header content and hidden rows and columns", () => {
    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('12b2.new_components-header.xlsx');
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the count of imported components
    importFromFile.verifyTotalComponentsCount(7);

    // Verify imported component names
    const componentNames = ["Gaszen Final Level Product Assembly","Gaszen Box","Ac/Dc Wall Mount Adapter 5V 3W", "Installation Screws #6 - 32 X 1/4- 5/16 Unc", "Quick Guide","Box ID Label","Phantom Blank Polypropylene Printed Custom Label"]
    for (let i=0; i<componentNames.length; i++) {
      tableHelper.assertTextInCell(constData.componentTableHeaders.name, componentNames[i], componentNames[i])
    }
  })
})

describe("Import File With Error Headers", () => {
  it("should present error dialog when no headers are found - PLM-1557", () => {
    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('12d.blank-spreadsheet.xlsx');

    // Verify the Error modal and message
    featureHelper.verifyWeFoundTheFollwingErrorModalPresent();
    importFromFile.verifyErrorMsgInImportCmpFromFilePage("Unable to find header row in the file.");
  })
})
