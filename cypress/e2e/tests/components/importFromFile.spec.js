import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const assembly = new Assembly();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Import New Components From File", () => {
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

  it('Update the REVISION of children components using update through import and Verify that only a single revision is created in the parent after updating children', () =>{
    const parentCmpData = {
      categoryType: "Assembly",
      category: "Battery Pack",
      name: "Parent-cmp-1",
      status: "DESIGN"
    }
    const childCmpData1 = {
      categoryType: "Assembly",
      category: "EBOM",
      name: "Child-cmp-1",
      status: "DESIGN"
    }
    const childCmpData2 = {
      categoryType: "Assembly",
      category: "MBOM",
      name: "Child-cmp-2",
      status: "DESIGN"
    }

    // Create two children components
    compApi.createComponent(childCmpData1)
    compApi.createComponent(childCmpData2)
    nav.openComponentsTab();

    let childCmp1CpnValue, childCmp2CpnValue, parentCmpCpnValue;

    featureHelper.getCpnValueFromTable(childCmpData1.name, 1).then((value) => childCmp1CpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData2.name, 1).then((value) => {
      childCmp2CpnValue = value

      // Data to add children components
      const child1Data = {
        CPN:childCmp1CpnValue,
        Quantity: 2,
      }
      const child2Data = {
        CPN:childCmp2CpnValue,
        Quantity: 2,
      }

      // Create Parent1 component with 2 childrens
      nav.openComponentsTab();
      components.clickonCreateManually();
      components.chooseType(constData.componentType.assembly);
      components.chooseCategory(parentCmpData.category);
      components.enterComponentName(parentCmpData.name);
      components.enterEid("123");
      components.selectStatus(constData.status.design);
      components.clickOnCreate();
      assembly.addComponentsToAssemblyTable(child1Data);
      assembly.addComponentsToAssemblyTable(child2Data);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Navigate to components tab
      nav.openComponentsTab();
      featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value)  => {
        parentCmpCpnValue = value

        // Import Components from file
        importFromFile.clickOnImportFromFile();
        importFromFile.checkUpdateFromExistingLibrary();
        importFromFile.uploadFile('importComponentData.xlsx');

        // Verify Mapped Labels
        importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
        importFromFile.verifyNecessaryLabelsMapped('CPN', 'cpn');
        importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
        importFromFile.clickOnContinue();

        // Verify Errors after Validation run
        importFromFile.waitForErrorCheckingSpinnerToDisappear();
        importFromFile.verifyNoErrorsAfterValidation();
        importFromFile.clickOnContinue();
        importFromFile.verifyImportStatusSucceed(2);

        // Verify the revision values of parent component after updating child component status
        tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpCpnValue);
        components.clickOnHistoryIcon();
        components.verifyNoOfRevisions(1);

        assembly.clickOnAssemblyTab();
        tableHelper.assertRevisionTextInTable("Child-cmp-1", 2)
        tableHelper.assertRevisionTextInTable("Child-cmp-2", 2)
      })
    })
  })

  it('missing revision but has status values should get assigned defaults', () => {
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('importComponentData1.xlsx');

    // Verify Mapped Labels
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(6);

    // Verify Revision and Status for Components
    importFromFile.verifyRevisionAndStatusValue('1uF, 25V, X7R, 10%', '—', 'DESIGN');
    importFromFile.verifyRevisionAndStatusValue('CONN_01X02, Pwr', '—', 'DESIGN');
    importFromFile.verifyRevisionAndStatusValue('5.62K, 1% Resistor', '—', 'DESIGN');
  })

  it("should create specs, documents and images in component and component's first revision using mpn successfully", () => {
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('importComponentData2.xlsx');

    // Verify Mapped Labels
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Description', 'description');
    importFromFile.verifyNecessaryLabelsMapped('mpn', 'mpn');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.verifyGreenIconInMpnField();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(2);

    //verify Image present and verify documents based on new rows added to the table 
    importFromFile.clickOnCell('cmp1')
    importFromFile.verifyImagePresent();
    importFromFile.verifyDocumentsPresent();
    nav.openComponentsTab();
    importFromFile.clickOnCell('cmp2')
    importFromFile.verifyImagePresent();
    importFromFile.verifyDocumentsPresent();
  })

  it('Update the REVISION of children components using update through import and Verify revisions(add the child components after saving the parent)', () =>{
    const parentCmpData = {
      category: "Battery Pack",
      name: "Parent-cmp-1",
    }
    const childCmpData1 = {
      category: "EBOM",
      name: "Child-cmp-1",
    }
    const childCmpData2 = {
      category: "MBOM",
      name: "Child-cmp-2",
    }

    compApi.createComponent(parentCmpData)
    compApi.createComponent(childCmpData1)
    compApi.createComponent(childCmpData2)
    nav.openComponentsTab();

    let parentCmpCpnValue, assembly1CpnValue, assembly2CpnValue;

    featureHelper.getCpnValueFromTable("Parent-cmp-1", 1).then((value) => parentCmpCpnValue = value)
    featureHelper.getCpnValueFromTable("Child-cmp-1", 1).then((value) => assembly1CpnValue = value)
    featureHelper.getCpnValueFromTable("Child-cmp-2", 1).then((value) => {
      assembly2CpnValue = value
      const data1 = {
        CPN:assembly1CpnValue ,
        Quantity: 2,
        ItemNumber: 1,
      }

      const data2 = {
        CPN:assembly2CpnValue ,
        Quantity: 2,
        ItemNumber: 2,
      }

      // Go to the parent component by clicking CPN value in table
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpCpnValue);

      // Navigate to assemly tab and Add Child components to Parent
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(data1);
      assembly.addComponentsToAssemblyTable(data2);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Import Components from file
      nav.openComponentsTab();
      importFromFile.clickOnImportFromFile();
      importFromFile.checkUpdateFromExistingLibrary();
      importFromFile.uploadFile('importComponentData.xlsx');

      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
      importFromFile.verifyNecessaryLabelsMapped('CPN', 'cpn');
      importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();
      importFromFile.verifyImportStatusSucceed(2);

      // Verify the revision values of parent component after updating child component status
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpCpnValue);
      components.clickOnHistoryIcon();
      components.verifyNoOfSubRevisions(2);

      assembly.clickOnAssemblyTab();
      tableHelper.assertRevisionTextInTable("Child-cmp-1", 2)
      tableHelper.assertRevisionTextInTable("Child-cmp-2", 2)
    })
  })

  it('Add description to child components and verify description in history(Add child After saving Parent)', () => {
    const parentCmpData = {
      categoryType: "Assembly",
      category: "Battery Pack",
      name: "Parent-cmp",
      status: "DESIGN",
      revision: 1
    }

    const childCmp1Data = {
      categoryType: "Assembly",
      category: "MBOM",
      name: "Child-cmp-1",
      status: "DESIGN",
      revision: 1
    }
    const childCmp2Data = {
      categoryType: "Assembly",
      category: "EBOM",
      name: "Child-cmp-2",
      status: "DESIGN",
      revision: 1
    }

    // Create parent and two children components
    nav.openComponentsTab();
    compApi.createComponent(parentCmpData);
    compApi.createComponent(childCmp1Data);
    compApi.createComponent(childCmp2Data);
    nav.openComponentsTab();

    let parentCmpCpnValue, childCmp1CpnValue, childCmp2CpnValue;

    featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value) => parentCmpCpnValue = value)
    featureHelper.getCpnValueFromTable(childCmp1Data.name, 1).then((value) => childCmp1CpnValue = value)
    featureHelper.getCpnValueFromTable(childCmp2Data.name, 1).then((value) => {
      childCmp2CpnValue = value

      // Data to add children components
      const child1Data = {
        CPN:childCmp1CpnValue,
        Quantity: 2,
      }
      const child2Data = {
        CPN:childCmp2CpnValue,
        Quantity: 2,
      }

      // Create Parent1 component with 2 childrens
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(child1Data);
      assembly.addComponentsToAssemblyTable(child2Data);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the Parent component revisions before Updating the children
      components.clickOnHistoryIcon();
      components.verifyNoOfRevisions(1);
      components.verifyNoOfSubRevisions(1);

      // Update the child components through import module
      nav.openComponentsTab();
      importFromFile.clickOnImportFromFile();
      importFromFile.checkUpdateFromExistingLibrary();
      importFromFile.uploadFile('descModifiedFile.xlsx');
      importFromFile.verifyNecessaryLabelsMapped('CPN', 'cpn');
      importFromFile.verifyNecessaryLabelsMapped('Description', 'description');
      importFromFile.clickOnContinue();
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();
      importFromFile.waitForFileUpload();
      importFromFile.verifyImportStatusSucceed(2);

      // Verify the description of child components
      const descForChild1 = 'This description is related to Child component 1'
      const descForChild2 = 'This description is related to Child component 2'
      tableHelper.clickOnCell(constData.componentTableHeaders.name, childCmp1CpnValue);
      components.clickWhereUsedIconInViewComponent();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpCpnValue);
      assembly.clickOnAssemblyTab();
      tableHelper.assertTextInCell(constData.componentTableHeaders.description, childCmp1CpnValue, descForChild1);
      tableHelper.assertTextInCell(constData.componentTableHeaders.description, childCmp2CpnValue, descForChild2);

      // Verify the Parent component revisions After Updating the children
      components.clickOnHistoryIcon();
      components.verifyNoOfRevisions(1);
      components.verifyNoOfSubRevisions(1);
    })
  })

  it('Add description to child components and verify description in history', () => {
    const parentCmpData = {
      categoryType: "Assembly",
      category: "Battery Pack",
      name: "Parent-cmp",
      status: "DESIGN",
      revision: 1
    }

    const childCmp1Data = {
      categoryType: "Assembly",
      category: "MBOM",
      name: "Child-cmp-1",
      status: "DESIGN",
      revision: 1
    }
    const childCmp2Data = {
      categoryType: "Assembly",
      category: "EBOM",
      name: "Child-cmp-2",
      status: "DESIGN",
      revision: 1
    }

    nav.openComponentsTab();
    // Create two children components
    compApi.createComponent(childCmp1Data);
    compApi.createComponent(childCmp2Data);
    nav.openComponentsTab();

    let childCmp1CpnValue, childCmp2CpnValue;

    featureHelper.getCpnValueFromTable(childCmp1Data.name, 1).then((value) => childCmp1CpnValue = value)
    featureHelper.getCpnValueFromTable(childCmp2Data.name, 1).then((value) => {
      childCmp2CpnValue = value

      // Data to add children components
      const child1Data = {
        CPN:childCmp1CpnValue,
        Quantity: 2,
      }
      const child2Data = {
        CPN:childCmp2CpnValue,
        Quantity: 2,
      }

      // Create Parent1 component with 2 childrens
      nav.openComponentsTab();
      components.clickonCreateManually();
      components.chooseType(constData.componentType.assembly);
      components.chooseCategory(parentCmpData.category);
      components.enterComponentName(parentCmpData.name);
      components.selectStatus(constData.status.design);
      components.enterRevision(1);
      components.clickOnCreate();
      assembly.addComponentsToAssemblyTable(child1Data);
      assembly.addComponentsToAssemblyTable(child2Data);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the Parent component revisions before Updating the children
      components.clickOnHistoryIcon();
      components.verifyNoOfRevisions(1);

      // Update the child components through import module
      nav.openComponentsTab();
      importFromFile.clickOnImportFromFile();
      importFromFile.checkUpdateFromExistingLibrary();
      importFromFile.uploadFile('descModifiedFile.xlsx');
      importFromFile.verifyNecessaryLabelsMapped('CPN', 'cpn');
      importFromFile.verifyNecessaryLabelsMapped('Description', 'description');
      importFromFile.clickOnContinue();
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();
      importFromFile.waitForFileUpload();
      importFromFile.verifyImportStatusSucceed(2);

      // Verify the description of child components
      const descForChild1 = 'This description is related to Child component 1'
      const descForChild2 = 'This description is related to Child component 2'
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData.name);
      assembly.clickOnAssemblyTab();
      tableHelper.assertTextInCell(constData.componentTableHeaders.description, childCmp1CpnValue, descForChild1);
      tableHelper.assertTextInCell(constData.componentTableHeaders.description, childCmp2CpnValue, descForChild2);

      // Verify the Parent component revisions After Updating the children
      components.clickOnHistoryIcon();
      components.verifyNoOfRevisions(1);
    })
  })

  it('Missing revision and status values should get assigned defaults', () => {
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Import Components from file
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('importComponentData03.xlsx');

    // Mapped necessary labels
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');

    // Map Desc/Value with name and verify
    importFromFile.verifyAndEnableNecessaryFieldToggleBtn();
    importFromFile.mapNecessaryField();
    importFromFile.verifyDescOrValueLabelMapped();
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(7);

    // Verify Revision and Status for Components
    importFromFile.verifyRevisionAndStatusValue('CONN_01X02, Pwr', '—', 'DESIGN');
    importFromFile.verifyRevisionAndStatusValue('2 Pin Fan Power Conn', '—', 'DESIGN');
    importFromFile.verifyRevisionAndStatusValue('5.62K,1% Resistor', '—', 'DESIGN');
  })

  it('Should be able to import components though the column label is not correct', () => {
    // Navigate to components tab & upload the file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('cmpsWithInvalidLabelNames.xlsx');

    // Verify the labels mapped
    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Description', 'description');


    importFromFile.verifyUnmappedLablesCount(3);
    importFromFile.clickOnContinue();

    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();

    importFromFile.verifyImportStatusSucceed(15);

    components.deleteAllComponents('status: design');

    compApi.createComponent({name: 'CMP-1', category: 'MBOM'});
    components.navigateToComponentEditPage('CMP-1', false);

    assembly.clickOnAssemblyTab();
    assembly.clickOnImportFromFile();
    assembly.uploadFile('cmpsWithInvalidLabelNames.xlsx');

    importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
    importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
    importFromFile.verifyNecessaryLabelsMapped('Quantity', 'quantity');
    importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
    importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
    importFromFile.verifyNecessaryLabelsMapped('Item Number', 'item number');
    importFromFile.verifyNecessaryLabelsMapped('Description', 'description');

    importFromFile.verifyUnmappedLablesCount(1);
    importFromFile.clickOnContinue();

    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();

    assembly.verifyNoOfComponentsInAssemblytable('15');
  })
})
