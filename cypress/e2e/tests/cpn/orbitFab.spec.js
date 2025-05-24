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
import { OrbitFab } from "../../pages/components/orbitFab";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { AuthApi } from "../../api/auth";
import CPN_rules from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries } from "../../helpers/dataHelpers/customCpn/CPN_libraries";

const orbitFab = new OrbitFab();
const signin = new SignIn();
const nav = new Navigation();
const faker = require('faker');
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelpers = new TableHelpers();
const assembly = new Assembly();
const featureHelpers = new FeatureHelpers();
const exports = new Export();
const cpnLibraries = new CpnLibraries();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const authApi = new AuthApi();

let email, companyId, orgId, authorName, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  authorName = user.fullName;
  email = user.email;
  companyName = user.companyName;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company;
    compSettings.updateOrbitFabCompanySettings(companyId);
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

describe("Category Component Changes - orbitFab", { tags: ["Orbit_Fab", "CPN"] }, () => {
  it('Should verify the Material and Finish spec fields present in Assembly category', () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Select Component category and type
    components.clickonCreateManually();
    components.chooseType(constData.componentType.assembly);
    components.chooseCategory('(ASM) Orbit Fab Assembly');
    orbitFab.selectApplicabilityFieldValues('Flight');

    // Verify Necessary specs present
    orbitFab.verifyNecessarySpecLabelPresent('Finish');
    orbitFab.verifyNecessarySpecLabelPresent('Material');
    orbitFab.verifyNecessarySpecLabelPresent('Applicability');
  })

  it('Should verify the Material and Finish spec fields present in Mechanical category', () => {
    const categoryArray = ['(410) Adhesive','(450) Bearing','(451) Belt','(452) Clamp','(453) Conduit','(454) Consumable','(455) Cylinder','(412) Damper','(456) Dowel','(413) Enclosure',
    '(414) Fabricated Carbon Fiber','(415) Fabricated Metal','(416) Fabricated Other','(417) Fabricated Plastic','(418) Fan','(411) Fastener','(458) Fitting',
    '(459) Fixture','(419) Foam','(420) Gasket','(460) Heatsink','(461) Insert','(421) Label','(462) Magnet','(446) Miscellaneous Mechanical','(422) Motor','(463) Nozzle',
    '(433) Nut','(435) O-Ring','(434) Optic','(436) Packaging','(464) Paint','(465) Pin','(466) Pulley','(467) Retaining Ring','(437) Rivet','(438) Screw','(472) Sheet Metal',
    '(468) Shim','(439) Solenoid','(440) Spacer','(441) Spring','(469) Standoff','(470) Tape','(442) Thermal Management','(443) Tool','(444) Tubing','(471) Valve',
    '(445) Washer']

    // Navigate to Components tab
    nav.openComponentsTab();

    // Select Component category and type
    components.clickonCreateManually();
    components.chooseType(constData.componentType.mechanical);

    // Verify material and finish specs present in view component page
    for(let i=0; i<categoryArray.length; i++) {
      components.chooseCategory(categoryArray[i]);
      orbitFab.verifyNecessarySpecLabelPresent('Finish');
      orbitFab.verifyNecessarySpecLabelPresent('Material');
    }
  })

  it('Should edit Material, Finish spec fields for the component', () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Create component manually
    components.clickonCreateManually();
    components.chooseType(constData.componentType.assembly);
    components.chooseCategory('(ASM) Orbit Fab Assembly');
    orbitFab.selectApplicabilityFieldValues('Flight');
    components.enterComponentName(fakerHelper.generateProductName())
    orbitFab.enterFinish('Finish');
    orbitFab.enterMaterialName('Material');
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    // click on edit and verify the edited spec field values
    components.clickEditIcon();
    orbitFab.enterFinishInCmpEditPage('editedFinish');
    orbitFab.enterMaterialInCmpEditPage('editedMaterial');
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    orbitFab.verifySpecFieldsInViewCmp('Finish','editedFinish');
    orbitFab.verifySpecFieldsInViewCmp('Material','editedMaterial');
  })

  it('Should verify the Material and Finish spec fields present in the tile of view components page', () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Enter the details and click on create 
    components.clickonCreateManually();
    components.chooseType(constData.componentType.assembly);
    components.chooseCategory('(ASM) Orbit Fab Assembly');
    orbitFab.selectApplicabilityFieldValues('Flight');
    components.enterComponentName(fakerHelper.generateProductName())
    orbitFab.enterFinish('Finish');
    orbitFab.enterMaterialName('Material');
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    // Verify material and finish specs present in view component page
    orbitFab.verifySpecFieldsInViewCmp('Finish','Finish');
    orbitFab.verifySpecFieldsInViewCmp('Material','Material');
  })

  it("Should create a new variant for the component with specified material and finish spec field values", () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Enter the details and click on create
    components.clickonCreateManually();
    components.chooseType(constData.componentType.assembly);
    components.chooseCategory('(ASM) Orbit Fab Assembly');
    orbitFab.selectApplicabilityFieldValues('Flight');
    components.enterComponentName(fakerHelper.generateProductName())
    orbitFab.enterFinish('Finish');
    orbitFab.enterMaterialName('Material');
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    // Verify material and finish specs present in view component page
    orbitFab.verifySpecFieldsInViewCmp('Finish','Finish');
    orbitFab.verifySpecFieldsInViewCmp('Material','Material');

    // create a new variant and verify the spec fields
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    orbitFab.verifySpecFieldsInViewCmp('Finish','Finish');
    orbitFab.verifySpecFieldsInViewCmp('Material','Material');
  })

  it("Should duplicate a component with specified material and finish spec field values", () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Enter the details and click on create
    components.clickonCreateManually();
    components.chooseType(constData.componentType.assembly);
    components.chooseCategory('(ASM) Orbit Fab Assembly');
    orbitFab.selectApplicabilityFieldValues('Flight');
    components.enterComponentName(fakerHelper.generateProductName());
    orbitFab.enterFinish('Finish');
    orbitFab.enterMaterialName('Material');
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    // Verify material and finish specs present in view component page
    orbitFab.verifySpecFieldsInViewCmp('Finish','Finish');
    orbitFab.verifySpecFieldsInViewCmp('Material','Material');

    // create a new component using duplicate icon and verify the spec fields
    components.copyComponentFromDetailsPage();
    featureHelpers.waitForLoadingIconToDisappear();
    orbitFab.verifySpecFieldsInViewCmp('Finish','Finish');
    orbitFab.verifySpecFieldsInViewCmp('Material','Material');
  })

  it('Should create a child component with updated specs in Assembly tab', () => {
    let cpnValue, childCmpCpnValue;

    const parentCmpData = {
      category: "(ASM) Orbit Fab Assembly",
      name: fakerHelper.generateProductName(),
      status: constData.status.prototype,
      revision: '1'
    }

    const cmpData = {
      name: fakerHelper.generateProductName(),
      type: constData.componentType.mechanical,
      category: '(410) Adhesive',
    }

    // Create a assembly type component
    components.clickonCreateManually();
    components.chooseType(constData.componentType.assembly);
    components.chooseCategory(parentCmpData.category);
    orbitFab.selectApplicabilityFieldValues('Flight');
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
      orbitFab.selectApplicabilityFieldValues('Flight');
      components.enterComponentName(cmpData.name);
      orbitFab.verifyNecessarySpecLabelPresent('Finish');
      orbitFab.enterFinish('Finish');
      orbitFab.verifyNecessarySpecLabelPresent('Material');
      orbitFab.enterMaterialName('Material');
      components.verifyCreateBtnEnabled();
      components.clickOnCreate();

      featureHelpers.getCpnValueFromTable(cmpData.name, 1).then((value) => {
        childCmpCpnValue = value
        assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, childCmpCpnValue);
        components.clickSaveButtonInEditComponent();
        featureHelpers.waitForLoadingIconToDisappear();

        // Verify material and finish specs present in view component page for child component
        nav.openComponentsTab();
        // components.enterSearchTerm(cmpData.name);
        tableHelpers.clickOnCell(constData.componentTableHeaders.cpn, cmpData.name);
        orbitFab.verifySpecFieldsInViewCmp('Finish','Finish');
        orbitFab.verifySpecFieldsInViewCmp('Material','Material');
      })
    })
  })

  it('Should export the component with updated specs', () => {
    let cpnValue;

    const cmpData = {
      name: fakerHelper.generateProductName(),
      type: constData.componentType.mechanical,
      category: '(410) Adhesive',
    }
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Creating component manually
    components.clickonCreateManually();
    components.chooseType(cmpData.type);
    components.chooseCategory(cmpData.category);
    orbitFab.selectApplicabilityFieldValues('Flight');
    components.enterComponentName(cmpData.name);
    components.selectStatus(constData.status.design);
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

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
        exports.assertExportedDownloadedFileForOrbitFabSpecs(fileName, cmpData.name, cpnValue)
      });
    })
  })

  it('Should import a component with Material, Finish spec fields using import from file', () => {
    const cmpName = 'ORBIT FAB'
    // Navigate to Components tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('importComponentDataForOrbitFab.xlsx');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(1);

    // Verify material and finish specs present in view component page for imported component
    tableHelpers.clickOnCell(constData.componentTableHeaders.name, cmpName);
    orbitFab.verifySpecFieldsInViewCmp('Finish','FINISH');
    orbitFab.verifySpecFieldsInViewCmp('Material','MATERIAL');

    // Delete the component
    components.deleteComponentFromDetailsPage();
    featureHelpers.waitForLoadingIconToDisappear();
  })
})
