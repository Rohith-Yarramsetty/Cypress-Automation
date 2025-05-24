import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { Export } from "../../pages/export";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { Products } from "../../pages/products/products";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Assembly } from "../../pages/components/assembly";

const signin = new SignIn();
const nav = new Navigation();
const exports = new Export();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const components = new Components();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const products = new Products();
const assembly = new Assembly();
const importFromFile = new ImportFromFile();

let email, companyId, orgId, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  companyName = user.companyName;
  user.orgData.then(res => {orgId = res.body.org_id});
  email = user.email;
  signin.signin(email);
  navHelper.navigateToSearch();
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })

  // Import Components from file
  nav.openComponentsTab();
  importFromFile.clickOnImportFromFile();
  importFromFile.uploadFile('11a.new_components-for-assembly.xlsx');
  importFromFile.clickOnContinue();
  importFromFile.waitForErrorCheckingSpinnerToDisappear();
  importFromFile.verifyNoErrorsAfterValidation();
  importFromFile.clickOnContinue();
  importFromFile.verifyImportStatusSucceed(5);

  // Add components to the assembly and verify
  tableHelper.clickOnCell(constData.componentTableHeaders.cpn, '910-00001');
  assembly.clickOnAssemblyTab();
  assembly.clickEditIconInTable();
  assembly.clickOnImportFromFile();
  importFromFile.checkExistingComponentsForAssemblyImport();
  importFromFile.uploadFile('11b.create-assembly-from-components.xlsx');
  importFromFile.clickOnContinue();
  importFromFile.waitForErrorCheckingSpinnerToDisappear();
  importFromFile.verifyNoErrorsAfterValidation();
  importFromFile.clickOnContinue();
  assembly.verifyNoOfComponentsInAssemblytable(3);
  components.clickSaveButtonInEditComponent();
  featureHelper.waitForLoadingIconToDisappear();
});

beforeEach(() => {
  authApi.signin(email);
  navHelper.navigateToSearch();
});

after(() => {
  compSettings.deleteCompany(companyId, orgId);
});

describe("Export Old Revisions", { tags: ["Export", "Export_Revision"] }, () => {
  it("should export product revision specifications to a local spreadsheet", () => {
    // Create product
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName("prd-1");
    products.enterRevision(1);
    products.clickCreateButton();
    featureHelper.waitForLoadingIconToDisappear();
    products.clickSaveButtonInEditProduct();

    // Add child component to the product
    const child1Data = {
      CPN       :'910-00001',
      Quantity  : 1,
    }
    products.clickEditIcon();
    assembly.addComponentsToAssemblyTable(child1Data);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Change status from design to prototype
    products.clickEditIcon();
    products.selectStatusInEditView(constData.status.prototype);
    products.clickContinueBtnInSetNewRevisionsModal();
    products.verifySaveBtnEnabledInEditView();
    products.clickSaveButtonInEditProduct();

    // Navigate to the previous revision
    products.clickOnHistoryIcon();
    products.clickOnPreviousRevision(2);

    // Export the product from revision page
    products.clickExportIconInProductRevisionPage();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    // Verify exported data
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-999-00001.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedExcelFileForProdRevisionExport(`cypress/downloads/${fileName}`, companyName);
    });
  });

  it("should export component revision specifications to a local spreadsheet", () => {
    // Navigate to assembly parent component
    nav.openComponentsTab();
    components.navigateToComponentEditPage('EBOM Assembly Parent', false);

    // Click on save as revision and add comment
    components.clickSaveAsRevisionBtn();
    components.entercommentInBulkUpdateSaveAsRevisionModal("Assembly Rev Notes");
    components.checkIncludeChildComponents();
    components.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to previous revision
    components.clickOnHistoryIcon();
    components.clickOnPreviousRevision(2);

    // Export the component from revision page
    components.clickExportIconInCmpRevisionPage();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    // Verify exported data
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00001.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedExcelFileForCmpRevisionExport(`cypress/downloads/${fileName}`);
    });
  });
});
