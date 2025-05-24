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
import { Assembly } from "../../pages/components/assembly";
import { Headers } from "../../pages/headers";
import constData from "../../helpers/pageConstants";
import { Dashboard } from "../../pages/dashboard";

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
const assembly = new Assembly();
const headers = new Headers();
const dashboard = new Dashboard();

let email, companyId, orgId, companyName;

describe('Search Module', { tags: ["Search", "Search_Queries"], defaultCommandTimeout: 180000 }, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    companyName = user.companyName;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })

    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('4c1.components-for-search.xlsx');
    importFromFile.disableImportDataUsingMpnToggleBtn();
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportProgressModalNotExists();
    importFromFile.verifyImportStatusSucceed(23);

    // Import assembly components
    components.navigateToComponentEditPage("EBOM Backplane PCBA");
    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.checkUpdateFromExistingLibrary();
    assembly.uploadFile('4c2.update-assembly-from-components.xlsx');
    featureHelper.waitForLoadingIconToDisappear();
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportProgressModalNotExists();
    assembly.verifyNoOfComponentsInAssemblytable(2);
    components.clickSaveButtonInEditComponent();
    authApi.signOut();
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  describe("Search Queries Module", () => {
    it("should navigate to component by clicking row from searching on global search", () => {
      // Click on mixed search and enter search term, Navigate to cmp and verify
      nav.openComponentsTab();
      headers.clickOnMixedSearchIcon();
      headers.enterSearchTerm("type:cmp 212-00006");
      tableHelper.clickOnCell(constData.componentTableHeaders.cpn, "212-00006");
      components.verifyCpnInViewPage("212-00006");
    });

    it("should navigate to component search route by pressing enter in global search with cmp query", () => {
      // Click on mixed search and enter search term and press enter then verify no.of components
      headers.clickOnMixedSearchIcon();
      headers.enterSearchTerm("type:cmp 212-000");
      cy.get("body").type("{enter}");
      importFromFile.verifyTotalComponentsCount(6);
    });

    it("should navigate to component using keys by searching on global search", () => {
      // Click on mixed search and enter search term
      nav.openDashboard();
      dashboard.enterSearchTerm("type:cmp 212-000", {release: false});
      dashboard.waitForResultsRowsToBeVisible();

      // Press keyboard keys to navigate to the component
      cy.get("body").type("{downArrow}");
      cy.get("body").type("{downArrow}");
      cy.get("body").type("{upArrow}");
      cy.get("body").type("{downArrow}");
      cy.get("body").type("{enter}");

      // Verify component CPN value
      components.verifyCpnInViewPage("212-00005");
    })
  })
})
