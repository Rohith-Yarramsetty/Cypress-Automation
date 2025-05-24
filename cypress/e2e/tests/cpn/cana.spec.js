import { AuthApi }             from "../../api/auth";
import { SignIn }              from "../../pages/signin";
import { Export }              from "../../pages/export";
import { UsersApi }            from "../../api/userApi";
import { Cana }                from "../../pages/components/cana";
import { Navigation }          from "../../pages/navigation";
import   constData             from "../../helpers/pageConstants";
import { FakerHelpers }        from "../../helpers/fakerHelper";
import { TableHelpers }        from "../../helpers/tableHelper";
import { FeatureHelpers }      from "../../helpers/featureHelper";
import { NavHelpers }          from "../../helpers/navigationHelper";
import { Components }          from "../../pages/components/component";
import { CompanySettingsApi }  from "../../api/companySettingsApi";
import { ImportFromFile }      from "../../pages/components/importFromFile";
import   compPayloads          from "../../helpers/dataHelpers/companySettingsPayloads";
import   CanaCategories        from "../../helpers/dataHelpers/customCategories/canaCategories";

const cana            = new Cana();
const signin          = new SignIn();
const exports         = new Export();
const nav             = new Navigation();
const authApi         = new AuthApi();
const userApi         = new UsersApi();
const navHelper       = new NavHelpers();
const components      = new Components();
const fakerHelper     = new FakerHelpers();
const tableHelpers    = new TableHelpers();
const featureHelpers  = new FeatureHelpers();
const importFromFile  = new ImportFromFile();
const compSettings    = new CompanySettingsApi();

let companyId, email, orgId;

describe("Test cana unit of measure", { tags: ['Cana'] }, () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id})
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateCanaUserSettings(companyId);
      compSettings.updateCompanySettings(companyId, compPayloads.customUomLabels(["mg/L"]));
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("Cana unit of measure - mg/L test cases", () => {
    beforeEach(function () {
      nav.openComponentsTab();

      // Select Component category and type
      components.clickonCreateManually();
      components.chooseType(constData.componentType.electrical);
      components.chooseCategory("Cartridge Map");
      components.enterComponentName(fakerHelper.generateProductName());
      components.enterRevision("1")
      components.verifyCreateBtnEnabled();
      components.clickOnCreate();
      cana.selectUnitInEditComponent("mg/L");
      components.clickSaveButtonInEditComponent();
      featureHelpers.waitForLoadingIconToDisappear();
    })

    it('Should edit the updated unit value in edit component page', () => {
      // click on edit and verify the edited unit values
      components.clickEditIcon();
      cana.selectUnitInEditComponent('EACH');
    })

    it('Should verify the updated unit value present view components page', () => {
      // Verify the updated unit value present view component page
      cana.verifyUnitInViewComponent('mg/L');
    })

    it("Should create a new variant  for the component with updated unit value", () => {
      // Verify updated unit value in view component page for parent component
      cana.verifyUnitInViewComponent('mg/L');

      // create a new variant and verify the updated unit value
      components.clickOnVariantIcon();
      components.clickOnNewVariantIcon();
      components.clickSaveButtonInEditComponent();
      featureHelpers.waitForLoadingIconToDisappear();
      cana.verifyUnitInViewComponent('mg/L');
    })

    it("should create a copy of the component with updated unit value", () => {
      // Verify updated unit value in view component page for parent component
      cana.verifyUnitInViewComponent('mg/L');

      // create a new component using duplicate icon and verify updated unit value
      components.copyComponentFromDetailsPage();
      featureHelpers.waitForLoadingIconToDisappear();
      cana.verifyUnitInViewComponent('mg/L');
    })
  })

  it('Should import a component with the updated unit value using import from file', () => {
    const cmpName = 'Cable - Bulk Wire Name'
    // Navigate to Components tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('importcomponentDataCana.xlsx');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);

    // Verify updated unit value present in view component page for imported component
    components.enterSearchTerm(cmpName);
    tableHelpers.clickOnCell(constData.componentTableHeaders.name, cmpName);
    cana.verifyUnitInViewComponent('mg/L');
  })

  it('Should update existing component with the updated unit value using import from file', () => {
    const cmpName = 'EBOM NAME'

    nav.openComponentsTab();

    // Create the component
    components.clickonCreateManually();
    components.chooseType(constData.componentType.assembly);
    components.chooseCategory("Cartridge Map");
    components.enterComponentName(cmpName);
    components.enterRevision("1")
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    // Navigate to Components tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.checkUpdateFromExistingLibrary();
    importFromFile.uploadFile('importcomponentDataCana2.xlsx');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);

    // Verify updated unit value in view component page for imported component
    components.enterSearchTerm(cmpName);
    tableHelpers.clickOnCell(constData.componentTableHeaders.name, cmpName);
    cana.verifyUnitInViewComponent('mg/L');
  })

  it('Should export the component with updated unit value', () => {
    let cpnValue;

    const cmpData = {
      name: fakerHelper.generateProductName(),
      category: 'Fluid Tank',
    }

    // Navigate to Components tab
    nav.openComponentsTab();

    // Select Component category and type
    components.clickonCreateManually();
    components.chooseCategory(cmpData.category);
    components.enterComponentName(cmpData.name);
    components.enterRevision("1")
    components.selectStatus(constData.status.design)
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    cana.selectUnitInEditComponent();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    cana.verifyUnitInViewComponent('mg/L');

    nav.openComponentsTab();
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
        exports.assertExportedDownloadedFileForCanaSpecs(fileName, cmpData.name, `${cpnValue}`)
      });
    })
  })
})
