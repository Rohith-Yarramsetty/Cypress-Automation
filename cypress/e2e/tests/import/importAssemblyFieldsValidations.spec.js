import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { TableHelpers } from "../../helpers/tableHelper";
import constData from "../../helpers/pageConstants";
import { Components } from "../../pages/components/component";
import { UsersApi } from "../../api/userApi";
import { ImportFromFile } from "../../pages/components/importFromFile";

const signin = new SignIn();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const assembly = new Assembly();
const compSettings = new CompanySettingsApi();
const tableHelper = new TableHelpers();
const components = new Components();
const userApi = new UsersApi();
const importFromFile = new ImportFromFile();

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

beforeEach(() => {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Import Quantity, Ref Des, Notes Validations Module", () => {
  it("Duplicate Ref Des error should show after quantity related errors are cleared", () => {
    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('1a.new_component-no_cpn-bare_minimum.xlsx');
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    featureHelper.waitForLoadingIconToDisappear();

    const cmpData = {
      category     : "EBOM",
      name         : "cmp-1",
      status       : "DESIGN",
      revision     : "1"
    }

    // Create an assembly type component and add children
    compApi.createComponent(cmpData);
    components.navigateToComponentEditPage(cmpData.name, false);
    assembly.clickOnAssemblyTab();
    assembly.clickAddIconInAssemblyTable();
    assembly.verifyAddCmpOptionsModalInAssemblyTable();
    assembly.clickAddFromLibrary();
    assembly.checkComponentCheckboxInAddComponents('RES one');
    assembly.checkComponentCheckboxInAddComponents('cap three');
    assembly.checkComponentCheckboxInAddComponents('cap two');
    assembly.clickAddInAddComponents();
    assembly.closeTheAddComponents();

    // Verify quantity cell error
    assembly.verifyErrorInAssemblyTable('RES one', constData.assemblyTableHeaders.quantity, 'Value should be of type Number');

    // Set Quantity and Ref Des values
    const cmpNamesInAssemblyTable = ['cap two', 'cap three', 'RES one']
    for(let i = 1; i < 4; i++) {
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, `${i}`, cmpNamesInAssemblyTable[i-1]);
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.refDes, 'C1', cmpNamesInAssemblyTable[i-1]);
    }

    // Wait for validation run
    cy.wait(3000);

    // Verify the error messages
    for(let i = 1; i < 4; i++) {
      let quantityErrorMsg
      i===1 ? quantityErrorMsg = "" : quantityErrorMsg = "Quantity and number of Ref Des should be the same"
      assembly.verifyErrorInAssemblyTable(cmpNamesInAssemblyTable[i-1], constData.assemblyTableHeaders.quantity, quantityErrorMsg);
      assembly.verifyErrorInAssemblyTable(cmpNamesInAssemblyTable[i-1], constData.assemblyTableHeaders.refDes, "Duplicate Ref Des value: C1");
    }

    // Set the quantity values
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, cmpNamesInAssemblyTable[1]);
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, cmpNamesInAssemblyTable[2]);

    // Wait for validation run
    cy.wait(3000);

    // Verify the error messages
    for(let i = 1; i < 4; i++) {
      assembly.verifyErrorInAssemblyTable(cmpNamesInAssemblyTable[i-1], constData.assemblyTableHeaders.quantity, "");
      assembly.verifyErrorInAssemblyTable(cmpNamesInAssemblyTable[i-1], constData.assemblyTableHeaders.refDes, "Duplicate Ref Des value: C1");
    }
  });

  it("Quantity, Ref Des, and Notes values should be retained for assemblies", () => {
    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('5e1.new_components-for-assembly.xlsx');
    importFromFile.disableImportDataUsingMpnToggleBtn();
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    featureHelper.waitForLoadingIconToDisappear();
    importFromFile.verifyImportStatusSucceed(5);

    // Add assembly components through import
    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'EBOM RF Module');
    components.clickEditIcon();
    assembly.clickOnImportFromFile();
    importFromFile.checkExistingComponentsForAssemblyImport();
    importFromFile.uploadFile('5e4.create-assembly-zero-qty.xlsx');
    importFromFile.clickOnContinue();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    assembly.verifyNoOfComponentsInAssemblytable(3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Check Initial Values from Import in Component View
    assembly.clickOnAssemblyTab();
    assembly.clickOnGridView();
    assembly.verifyDataInAssemblyTable("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.quantity, 0);
    assembly.verifyDataInAssemblyTable("5.62K,1% Resistor", constData.assemblyTableHeaders.quantity, 3);
    assembly.verifyDataInAssemblyTable("10k, 5%", constData.assemblyTableHeaders.quantity, 0);

    assembly.verifyDataInAssemblyTable("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.refDes, "Y1,Y2");
    assembly.verifyDataInAssemblyTable("5.62K,1% Resistor", constData.assemblyTableHeaders.refDes, "R1, R2, R3");
    assembly.verifyDataInAssemblyTable("10k, 5%", constData.assemblyTableHeaders.refDes, "R4");

    assembly.verifyDataInAssemblyTable("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.notes, "BOM Note 1");
    assembly.verifyDataInAssemblyTable("5.62K,1% Resistor", constData.assemblyTableHeaders.notes, "BOM Note 2");
    assembly.verifyDataInAssemblyTable("10k, 5%", constData.assemblyTableHeaders.notes, "BOM Note 3");

    // Edit the quantity values
    components.clickEditIcon();
    featureHelper.waitForLoadingIconToDisappear();
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 0, "16MHz CRYSTAL_SMD");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 0, "5.62K,1% Resistor");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 0, "10k, 5%");
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Check New Values after editing in Component View
    assembly.verifyDataInAssemblyTable("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.quantity, 0);
    assembly.verifyDataInAssemblyTable("5.62K,1% Resistor", constData.assemblyTableHeaders.quantity, 0);
    assembly.verifyDataInAssemblyTable("10k, 5%", constData.assemblyTableHeaders.quantity, 0);

    // Confirm values didn't change: Component Edit
    components.clickEditIcon();
    featureHelper.waitForLoadingIconToDisappear();
    assembly.verifyDataInAssemblyTableFromEditPage("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.quantity, 0);
    assembly.verifyDataInAssemblyTableFromEditPage("5.62K,1% Resistor", constData.assemblyTableHeaders.quantity, 0);
    assembly.verifyDataInAssemblyTableFromEditPage("10k, 5%", constData.assemblyTableHeaders.quantity, 0);

    assembly.verifyDataInAssemblyTableFromEditPage("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.refDes, "Y1,Y2");
    assembly.verifyDataInAssemblyTableFromEditPage("5.62K,1% Resistor", constData.assemblyTableHeaders.refDes, "R1, R2, R3");
    assembly.verifyDataInAssemblyTableFromEditPage("10k, 5%", constData.assemblyTableHeaders.refDes, "R4");

    assembly.verifyDataInAssemblyTableFromEditPage("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.notes, "BOM Note 1");
    assembly.verifyDataInAssemblyTableFromEditPage("5.62K,1% Resistor", constData.assemblyTableHeaders.notes, "BOM Note 2");
    assembly.verifyDataInAssemblyTableFromEditPage("10k, 5%", constData.assemblyTableHeaders.notes, "BOM Note 3");

    // Set new values in Component edit and save
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 2, "16MHz CRYSTAL_SMD");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 3, "5.62K,1% Resistor");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, "10k, 5%");

    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.refDes, "Y3,Y4", "16MHz CRYSTAL_SMD");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.refDes, "R4,R5,R6", "5.62K,1% Resistor");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.refDes, "R7", "10k, 5%");

    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.notes, "Note A", "16MHz CRYSTAL_SMD");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.notes, "Note B", "5.62K,1% Resistor");
    assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.notes, "Note C", "10k, 5%");
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify values are correct in Component View
    assembly.verifyDataInAssemblyTable("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.quantity, 2);
    assembly.verifyDataInAssemblyTable("5.62K,1% Resistor", constData.assemblyTableHeaders.quantity, 3);
    assembly.verifyDataInAssemblyTable("10k, 5%", constData.assemblyTableHeaders.quantity, 1);

    assembly.verifyDataInAssemblyTable("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.refDes, "Y3,Y4");
    assembly.verifyDataInAssemblyTable("5.62K,1% Resistor", constData.assemblyTableHeaders.refDes, "R4,R5,R6");
    assembly.verifyDataInAssemblyTable("10k, 5%", constData.assemblyTableHeaders.refDes, "R7");

    assembly.verifyDataInAssemblyTable("16MHz CRYSTAL_SMD", constData.assemblyTableHeaders.notes, "Note A");
    assembly.verifyDataInAssemblyTable("5.62K,1% Resistor", constData.assemblyTableHeaders.notes, "Note B");
    assembly.verifyDataInAssemblyTable("10k, 5%", constData.assemblyTableHeaders.notes, "Note C");
  });
});
