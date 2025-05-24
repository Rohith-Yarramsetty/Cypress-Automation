import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { Components } from "../../pages/components/component";
import constData from "../../helpers/pageConstants";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { ComponentApi } from "../../api/componentApi";

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
const compApi = new ComponentApi();

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

describe("Import File New Components Sourcing From Web", () => {
  beforeEach(function () {
    // Navigate to Import review page and disable all rows
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('2a.new_component-manufacturer-updated.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.disableOrEnableAllRowsToggleBtnInReviewPage();
  })

  it("missing MPN field should not prevent from importing if Manufacturer is missing", () => {
    // Enable row 6 and verify error tooltip for MPN column
    importFromFile.enableOrDisableToggleBtnInReviewPage(6);
    importFromFile.verifyErrorTooltipforCellInReviewPage(6, 'mpn', 'Must contain at least 1 character');
    importFromFile.verifyContinueBtnDisabledInReviewPage();

    // Enter space in MPN column and verify continue button enabled
    importFromFile.enterDataInCellInReviewPage(6, 'mpn', ' ');
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyContinueBtnEnabledInReviewPage();
  })

  it("should require MPN and Manufacturer fields if Mfr Description is present",() => {
    // Enable row 7 and verify errors for MPN and Manufacturer columns and verify continue button disabled
    importFromFile.enableOrDisableToggleBtnInReviewPage(7);
    importFromFile.verifyErrorTooltipforCellInReviewPage(7, 'mpn', 'Must contain at least 1 character');
    importFromFile.verifyErrorTooltipforCellInReviewPage(7, 'manufacturer', 'Must contain at least 1 character');
    importFromFile.verifyContinueBtnDisabledInReviewPage();
  })
})

describe("Import MPNs with Errors", () => {
  it("should validate that duplicate MPNs generate errors",() => {
    const data = {
      componentType : constData.componentType.electrical,
      category      : constData.electricalComponents.capacitor,
      mpn           : 'GRM188R61C105KA93D',
    }

    nav.openComponentsTab();
    components.clickOnImportFromVendor();
    components.chooseType(data.componentType);
    components.chooseCategoryInImportVendorPage(data.category);
    components.enterMpn(data.mpn);
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();

    nav.openComponentsTab();
    importFromFile.verifyTotalComponentsCount(1);

    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('14b-validate-duplicate-mpns.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyErrorIconforCellInReviewPage(1, 'mpn', 'Duplicate MPN found in file');
    importFromFile.verifyErrorIconforCellInReviewPage(2, 'mpn', 'Duplicate MPN found in file');
    importFromFile.verifyErrorIconforCellInReviewPage(3, 'mpn', 'Duplicate MPN found in file');
    importFromFile.verifyErrorIconforCellInReviewPage(4, 'mpn', "MPN already exists in library. 212-00001 \"Cap Ceramic 1uF...\"");
  })
})

describe("Import MPNs Module", () => {
  it("Should create document with decoded characters in name correctly", () => {
    // Import components
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('component-with-category-and-mpn.xlsx');
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportProgressModalNotExists();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the count of imported components
    importFromFile.verifyTotalComponentsCount(1);

    // Verify document names
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'test')
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyDocumentName(1, "B8B-PH-SM4-TB(LF)(SN)-JST-datasheet-10411123.pdf");
    components.verifyDocumentName(2, "B8B-PH-SM4-TB(LF)(SN)-JST-datasheet-15068535.pdf");
    components.verifyDocumentName(3, "B8B-PH-SM4-TB(LF)(SN)-JST-datasheet-8324864.pdf");
  })

  it("should get all sourcing from vendor on import using mpn", () => {
    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("5m.large-number-10-with-mpns.xlsx");
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportProgressModalNotExists();
    featureHelper.waitForLoadingIconToDisappear();
    importFromFile.verifyImportStatusSucceed(10);

    // Verify the component details
    for (let i = 0; i < 10; i++) {
      components.navigateToComponentViewPage(`CAP ${i+1}`, false)
      cy.url().then((currentUrl) => {
        const componentId = currentUrl.split('view/')[1]

        compApi.getComponentData(componentId).then((res) => {
          expect(res.body.data.documents[0]).not.to.be.null;
          expect(res.body.data.manufacturers[0]).not.to.be.null;
          expect(res.body.data.manufacturers[0].distributors[0]).not.to.be.null;
          expect(res.body.data.manufacturers[0].distributors[0].quotes[0]).not.to.be.null;
        })
      })
    }
  });
});
