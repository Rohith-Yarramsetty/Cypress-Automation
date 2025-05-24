import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { Components } from "../../pages/components/component";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Export } from "../../pages/export";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const components = new Components();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const exports = new Export();

let email, companyId, orgId, companyName;

describe('Search Actions', { tags: ["Search", "Search_Actions"], defaultCommandTimeout: 120000 }, () => {
  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    companyName = user.companyName;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then(res => {companyId = res.body.data.company})
    nav.openDashboard();
    nav.verifyNavigationMenuItems();

    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('1c.new_component-library-bare_minimum.xlsx');

    // Map Desc/Value with name and verify
    importFromFile.verifyRequireFieldErrorMsgInMapFieldsPage('Name column is required');
    importFromFile.verifyContinueBtnDisabledInReviewPage();
    importFromFile.verifyAndEnableNecessaryFieldToggleBtn();
    importFromFile.mapNecessaryField();
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportProgressModalNotExists();
    featureHelper.waitForLoadingIconToDisappear();
    importFromFile.verifyImportStatusSucceed(24);
  })

  afterEach(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  describe("Search actions should work fine", () => {
    it("Should export multiple components by selecting from the search page with shift key", () => {
      // Navigate to components and enter search term
      nav.openComponentsTab();
      components.enterSearchTerm("cpn: 21");
      featureHelper.waitForLoadingIconToDisappear();

      // Check first 6 rows using shift key
      tableHelper.checkTableRow('212-00001');
      cy.get("body").type("{shift}", {release: false});    // Holds the shift key
      tableHelper.checkTableRow('215-00003');
      cy.get("body").type("{shift}", {release: true});    // Release the shift key

      // Click export from library
      components.clickExportInCmpLibrary();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify the exported sheet
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-Duro-Export-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
          expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(['Item', 'Level', 'CPN', 'Category', 'Name', 'Where Used', 'EID', 'Revision', 'Status', 'Description', 'Value', 'Specs', 'Quantity', 'Unit of Measure', 'Primary Source Unit Price', 'Primary Source MPN', 'Primary Source Manufacturer', 'Primary Source DPN', 'Primary Source Distributor', 'Total Price', 'Primary Source Lead Time', 'Ref Des', 'Item Number', 'Notes', 'Mass (g)', 'Last Updated', 'Workflow State', 'Procurement', 'Manufacturer', 'MPN', 'MPN Link', 'Datasheet', 'Mfr Description', 'Distributor', 'DPN', 'DPN Link', 'Dist Description', 'Package', 'Package Quantity', 'Quantity Min', 'Unit Price', 'Lead Time', 'Item Type', 'Effectivity Start Date', 'Effectivity End Date' ]);
          expect(Object.keys(rows).length).to.deep.eq(6);
        });
      });
    });
  })
})
