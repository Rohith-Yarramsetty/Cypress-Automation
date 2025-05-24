import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Assembly } from "../../pages/components/assembly";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Export } from "../../pages/export";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { AuthApi } from "../../api/auth";

const signin = new SignIn();
const authApi = new AuthApi();
const nav = new Navigation();
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelpers = new TableHelpers();
const assembly = new Assembly();
const featureHelpers = new FeatureHelpers();
const exports = new Export();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId, companyName;

describe("Form custom categories", { tags: ["Form", "CPN"] }, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    companyName = user.companyName;
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company;
      compSettings.updateFormCompanySettings(companyId);
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

  context("Category Component Changes - form", () => {
    let data = {
      type: constData.componentType.electrical,
      category: '(590) PCB',
      componentFullName: fakerHelper.generateProductName(),
    }

    beforeEach(function () {

      // Navigate to Components tab
      navHelper.navigateToSearch();
      nav.openComponentsTab();

      // Create component manually
      components.clickonCreateManually();
      components.chooseType(data.type);
      components.chooseCategory(data.category);
      components.enterComponentName(data.componentFullName)
      components.verifyCreateBtnEnabled();
      components.clickOnCreate();
      components.clickSaveButtonInEditComponent();
      featureHelpers.waitForLoadingIconToDisappear();
    })

    it("Should create a new variant  for the component", () => {
      // create a new variant of a component using variant icon
      components.clickOnVariantIcon();
      components.clickOnNewVariantIcon();
      components.clickSaveButtonInEditComponent();
      featureHelpers.waitForLoadingIconToDisappear();
      nav.openComponentsTab();
      tableHelpers.assertRowPresentInTable(constData.componentTableHeaders.name, data.componentFullName);
    })

    it("Should create the duplicate of a component ", () => {
      // create a new component using duplicate icon 
      components.copyComponentFromDetailsPage();
      featureHelpers.waitForLoadingIconToDisappear();

      nav.openComponentsTab();
      tableHelpers.assertRowPresentInTable(constData.componentTableHeaders.name, data.componentFullName);
    })

    it('Should create a child component in Assembly tab', () => {
      let cpnValue, childCmpCpnValue;

      const parentCmpData = {
        category: '(830) PCBA',
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        revision: '1'
      }

      const cmpData = {
        name: fakerHelper.generateProductName(),
        type: constData.componentType.mechanical,
        category: '(100) COGS',
      }

      // Navigate to Components tab
      nav.openComponentsTab();

      // Create a assembly type component
      components.clickonCreateManually();
      components.chooseType(constData.componentType.assembly);
      components.chooseCategory(parentCmpData.category);
      components.enterComponentName(parentCmpData.name);
      components.selectStatus(parentCmpData.status);
      components.enterRevision(parentCmpData.revision);
      components.clickOnCreate();
      components.clickSaveButtonInEditComponent();
      featureHelpers.waitForLoadingIconToDisappear();

      // Create a child component using assembly tab
      nav.openComponentsTab();
      featureHelpers.getCpnValueFromTable(parentCmpData.name, 1).then((value) => {
        cpnValue = value
        tableHelpers.clickOnCell(constData.componentTableHeaders.name, cpnValue);
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.clickonCreateManually();
        components.chooseType(cmpData.type);
        components.chooseCategory(cmpData.category);
        components.enterRevision(1);
        components.selectStatus(constData.status.design);
        components.enterComponentName(cmpData.name);
        components.verifyCreateBtnEnabled();
        components.clickOnCreate();

        featureHelpers.getCpnValueFromTable(cmpData.name, 1).then((value) => {
          childCmpCpnValue = value
          assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, childCmpCpnValue);
          components.clickSaveButtonInEditComponent();
          featureHelpers.waitForLoadingIconToDisappear();

          // Verify child component present in view component page
          nav.openComponentsTab();
          // components.enterSearchTerm(cmpData.name);
          tableHelpers.clickOnCell(constData.componentTableHeaders.cpn, cmpData.name);
        })
      })
    })

    it("Should delete the created component ", () => {
      // Delete the component
      components.deleteComponentFromDetailsPage();
      featureHelpers.waitForLoadingIconToDisappear();

      nav.openComponentsTab();
      tableHelpers.assertRowNotPresentInTable(constData.componentTableHeaders.name, data.componentFullName);
    })
  })

  it('Should export the component with updated specs', () => {
    let cpnValue;

    const cmpData = {
      name: fakerHelper.generateProductName(),
      type: constData.componentType.mechanical,
      category: '(835) Battery',
    }
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Creating component manually
    components.clickonCreateManually();
    components.chooseType(cmpData.type);
    components.chooseCategory(cmpData.category);
    components.enterComponentName(cmpData.name);
    components.selectStatus(constData.status.design);
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    nav.openComponentsTab();
    components.enterSearchTerm(cmpData.name);
    featureHelpers.getCpnValueFromTable(cmpData.name, 1).then((cpn) => {
      cpnValue = cpn
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickExportIconInViewComponent();
      exports.clickOnCustomizeFieldsIcon();
      exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
      exports.clickOnSaveBtnInCustomizeFieldsModal();

      // Add cc mail and click export
      const ccEmail = fakerHelper.generateMailosaurEmail();
      exports.enterCcEmail(ccEmail);
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify the Downloaded file
      const date = new Date();
      const exportEmail = featureHelpers.getExportEmail(date, ccEmail);
      exportEmail.then(email => {
        expect(email.subject).to.include(`Export: Specs-${cpnValue}`);
        const download_file_link = email.html.links[2].href.toString();
        const fileName = email.html.links[2].text.toString();
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileForForm(fileName, cmpData.name, cpnValue, companyName)
      });
    })
  })

  it('Should import a component using import from file', () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('importComponentDataForForm.xlsx');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);
  })

  it('Should update the existing component using import', () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('importComponentDataForForm.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.waitForErrorCheckingSpinnerToDisappear();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);

    // Update the existing component
    importFromFile.clickOnImportFromFile();
    importFromFile.checkUpdateFromExistingLibrary();
    importFromFile.uploadFile('updateExistingComponentForForm.xlsx');
    importFromFile.verifyNecessaryLabelsMapped('CPN', 'cpn');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);
  })
})
