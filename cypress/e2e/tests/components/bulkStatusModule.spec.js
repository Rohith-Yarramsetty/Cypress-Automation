import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
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
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Test Components", () => {
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

  it('Update the status of children components from Bulk-status-modal and Verify that only a single revision is created in the parent', () =>{
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

    // Create two children components
    compApi.createComponent(childCmpData1);
    compApi.createComponent(childCmpData2);
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

      // Create Parent component with 2 childrens
      nav.openComponentsTab();
      components.clickonCreateManually();
      components.chooseType(constData.componentType.assembly);
      components.chooseCategory(parentCmpData.category);
      components.enterComponentName(parentCmpData.name);
      components.selectStatus(constData.status.design);
      components.enterEid("123");
      components.enterRevision(1)
      components.verifyCreateBtnEnabled();
      components.clickOnCreate();
      assembly.addComponentsToAssemblyTable(child1Data);
      assembly.addComponentsToAssemblyTable(child2Data);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Navigate to components tab
      nav.openComponentsTab();
      featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value)  => {
        parentCmpCpnValue = value

        // Update the children components status from DESIGN to PROTOTYPE
        nav.openComponentsTab();
        tableHelper.checkTableRow(childCmp1CpnValue);
        tableHelper.checkTableRow(childCmp2CpnValue);
        components.clickOnUpdateStatus();
        components.updateBulkStatusAndApply('PROTOTYPE');
        components.verifyNewStatusInChangeStatusModel('912-00001', constData.status.prototype);
        components.verifyNewStatusInChangeStatusModel('910-00001', constData.status.prototype);
        components.clickOnContinue();

        // Verify the revisions for the parent component after updating the child component
        tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpCpnValue);
        components.clickOnHistoryIcon();
        components.verifyNoOfRevisions(1);

        // Verify Child components status is PROTOTYPE
        assembly.clickOnAssemblyTab();
        assembly.verifyStatusInAssemblyTable("Child-cmp-1", constData.status.prototype);
        assembly.verifyStatusInAssemblyTable("Child-cmp-2", constData.status.prototype);
      })
    })
  })

  it.skip('Update the status of children components from Bulk-status-modal and Verify the revisions (Add child components after saving the parent)', () =>{
    const compData = {
      category: "Battery Pack",
      name: "cmp-1"
    }
    const assemblyData1 = {
      category: "EBOM",
      name: "Assembly-cmp-1"
    }

    const assemblyData2 = {
      category: "MBOM",
      name: "Assembly-cmp-2"   
    }

    // Create an Assembly type Components
    compApi.createComponent(compData)
    compApi.createComponent(assemblyData1)
    compApi.createComponent(assemblyData2)
    nav.openComponentsTab();

    let componentCpnValue, assembly1CpnValue, assembly2CpnValue;

    featureHelper.getCpnValueFromTable("cmp-1", 1).then((value) => componentCpnValue = value)
    featureHelper.getCpnValueFromTable("Assembly-cmp-1", 1).then((value) => assembly1CpnValue = value)
    featureHelper.getCpnValueFromTable("Assembly-cmp-2", 1).then((value) => {
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
        tableHelper.clickOnCell(constData.componentTableHeaders.name, componentCpnValue);

        // Navigate to assemly tab and Add Child components to Parent
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(data1);
        assembly.addComponentsToAssemblyTable(data2);
        components.clickSaveButtonInEditComponent();
        featureHelper.waitForLoadingIconToDisappear();

        // Update the children components status from DESIGN to PROTOTYPE
        nav.openComponentsTab();
        tableHelper.checkTableRow(assembly1CpnValue);
        tableHelper.checkTableRow(assembly2CpnValue);
        components.clickOnUpdateStatus();
        components.updateBulkStatusAndApply('PROTOTYPE');
        components.clickOnContinue();

        // Verify the revisions for the parent component after updating the child component
        tableHelper.clickOnCell(constData.componentTableHeaders.name, componentCpnValue);
        components.clickOnHistoryIcon();
        components.verifyNoOfSubRevisions(2);

        // Verify Child components status is PROTOTYPE
        assembly.clickOnAssemblyTab();
        assembly.verifyStatusInAssemblyTable("Assembly-cmp-1", constData.status.prototype);
        assembly.verifyStatusInAssemblyTable("Assembly-cmp-2", constData.status.prototype);
    })
  })

  it.skip('Update the status of children components from Bulk-status-modal in assembly and Verify two new revisions are created(Add child components after saving the parent)', () => {
    const compData = {
      category: "Battery Pack",
      name: "cmp-1"
    }
    const assemblyData1 = {
      category: "EBOM",
      name: "Assembly-cmp-1"
    }
    const assemblyData2 = {
      category: "MBOM",
      name: "Assembly-cmp-2"
    }

    // Create Components
    compApi.createComponent(compData);
    compApi.createComponent(assemblyData1);
    compApi.createComponent(assemblyData2);

    nav.openComponentsTab();

    let componentCpnValue, assembly1CpnValue, assembly2CpnValue;

    featureHelper.getCpnValueFromTable(compData.name, 1).then((value) => componentCpnValue = value)
    featureHelper.getCpnValueFromTable(assemblyData1.name, 1).then((value) => assembly1CpnValue = value)
    featureHelper.getCpnValueFromTable(assemblyData2.name, 1).then((value) => {
      assembly2CpnValue = value 
        const data1 = {
          CPN:assembly1CpnValue ,
          Quantity: 2,
          ItemNumber: 1
        }

        const data2 = {
          CPN:assembly2CpnValue ,
          Quantity: 2,
          ItemNumber: 2
        }

        // Add child components to parent
        tableHelper.clickOnCell(constData.componentTableHeaders.name, componentCpnValue);
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(data1);
        assembly.addComponentsToAssemblyTable(data2);
        components.clickSaveButtonInEditComponent();
        featureHelper.waitForLoadingIconToDisappear();

        // update bulk status for Parent & Child
        components.clickEditIcon();
        components.selectStatusInEditView(constData.status.prototype);
        components.verifyChangeStatusHeader();
        components.verifyBulkStatusNotPresent();
        components.checkIncludeChildComponents();
        components.verifyBulkStatusPresent();
        components.selectBulkStatus();
        components.clickApply();
        components.clickOnContinue();
        components.clickSaveButtonInEditComponent();

        // Verify new Revisions
        components.clickOnHistoryIcon();
        components.verifyNoOfRevisions(2);

        // Verify new Sub-Revisions
        components.verifyNoOfSubRevisions(2);
    })
  })

  it.skip('Update the status of Parent component from Bulk-status-modal and verify (Add children after saving parent)', () =>{
    // Data to create components
    const parentCmpData1 = {
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
    const parentCmpData2 = {
      category: "Tool Kit",
      name: "Parent-cmp-2",
    }

    // Create parent and children components
    compApi.createComponent(parentCmpData1);
    compApi.createComponent(childCmpData1);
    compApi.createComponent(childCmpData2);
    compApi.createComponent(parentCmpData2);
    nav.openComponentsTab();

    let parentCmp1CpnValue, childCmp1CpnValue, childCmp2CpnValue, parentCmp2CpnValue;

    featureHelper.getCpnValueFromTable(parentCmpData1.name, 1).then((value) => parentCmp1CpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData1.name, 1).then((value) => childCmp1CpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData2.name, 1).then((value) => childCmp2CpnValue = value)
    featureHelper.getCpnValueFromTable(parentCmpData2.name, 1).then((value) => {
      parentCmp2CpnValue = value

      // Data to add children components
      const child1Data = {
        CPN:childCmp1CpnValue,
        Quantity: 2,
      }
      const child2Data = {
        CPN:childCmp2CpnValue,
        Quantity: 2,
      }
      const parent1Data = {
        CPN:parentCmp1CpnValue,
        Quantity: 2,
      }

      // Add child components to Parent component 1
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmp1CpnValue);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(child1Data);
      assembly.addComponentsToAssemblyTable(child2Data);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Add Parent component 1 as child for Parent component 2
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmp2CpnValue);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(parent1Data);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Change status from Design to Prototype using Bulk Action for Parent component 1
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmp1CpnValue);
      assembly.clickEditIconInTable();
      components.selectStatusInEditView(constData.status.prototype);
      components.verifyBulkStatusNotPresent();
      components.checkIncludeChildComponents();
      components.verifyBulkStatusPresent();
      components.updateBulkStatusAndApply(constData.status.prototype);
      components.clickOnContinue();
      components.clickSaveButtonInEditComponent();

      // Verify no of Revisions and sub revisions for Parent component 1
      components.clickOnHistoryIcon();
      components.verifyNoOfRevisions(2);
      components.verifyNoOfSubRevisions(2);

      // Verify no of Revisions and sub revisions for Parent component 2
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmp2CpnValue);
      components.clickOnHistoryIcon();
      components.verifyNoOfRevisions(1);
      components.verifyNoOfSubRevisions(3);
    })
  })

  it('Update the status of children components from Bulk-status-modal in assembly components and Verify two new revisions are created in the parent', () => {
    const compData = {
      category: "Battery Pack",
      name: "cmp-1"
    }
    const assemblyData1 = {
      category: "EBOM",
      name: "Assembly-cmp-1"
    }
    const assemblyData2 = {
      category: "MBOM",
      name: "Assembly-cmp-2"
    }

    // Create Components
    compApi.createComponent(assemblyData1);
    compApi.createComponent(assemblyData2);

    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory(constData.assemblyComponents.batteryPack);
    components.enterComponentName(compData.name);
    components.selectStatus(constData.status.design);
    components.enterRevision(1)
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    nav.openComponentsTab();

    let componentCpnValue, assembly1CpnValue, assembly2CpnValue;

    // Retrieve CPN values
    featureHelper.getCpnValueFromTable(compData.name, 1).then((value) => componentCpnValue = value)
    featureHelper.getCpnValueFromTable(assemblyData1.name, 1).then((value) => assembly1CpnValue = value)
    featureHelper.getCpnValueFromTable(assemblyData2.name, 1).then((value) => {
      assembly2CpnValue = value 
        const data1 = {
          CPN:assembly1CpnValue ,
          Quantity: 2,
          ItemNumber: 1
        }

        const data2 = {
          CPN:assembly2CpnValue ,
          Quantity: 2,
          ItemNumber: 2
        }

        // Add child components to parent
        tableHelper.clickOnCell(constData.componentTableHeaders.name, componentCpnValue);
        assembly.clickOnAssemblyTab();
        assembly.clickEditIconInTable();
        assembly.addComponentsToAssemblyTable(data1);
        assembly.addComponentsToAssemblyTable(data2);
        components.clickSaveButtonInEditComponent();
        featureHelper.waitForLoadingIconToDisappear();

        // update bulk status for Parent & Child
        components.clickEditIcon();
        components.selectStatusInEditView(constData.status.prototype);
        components.verifyChangeStatusHeader();
        components.verifyBulkStatusNotPresent();
        components.checkIncludeChildComponents();
        components.verifyBulkStatusPresent();
        components.selectBulkStatus();
        components.clickApply();
        components.clickOnContinue();
        components.clickSaveButtonInEditComponent();

        // Verify new Revision for Parent
        components.clickOnHistoryIcon();
        components.verifyNoOfRevisions(2);
    })
  })
})
