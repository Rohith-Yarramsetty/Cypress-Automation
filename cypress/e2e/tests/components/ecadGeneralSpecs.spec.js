import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Export } from "../../pages/export";
import constData from "../../helpers/pageConstants";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { SignIn } from "../../pages/signin";
import { ImportFromFile } from "../../pages/components/importFromFile";

const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const exports = new Export();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const signin = new SignIn();
const importFromFile = new ImportFromFile();

let email, companyName, companyId, orgId;

before( () => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  companyName = user.companyName;
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

describe("Components with Electrical category group", () => {
  it("should export ECAD general specs", () => {
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Import Component from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('2.new_component-with-ecad-general-specs.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);
    featureHelper.waitForLoadingIconToDisappear();

    // Go to the component and export
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'ECAD Component 1');
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    // Verify the exported data
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-');
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-211-00001-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedExcelFileForEcadGeneralSpecs(`cypress/downloads/${fileName}`);
    });
  });
});
