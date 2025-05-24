import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Sourcing } from "../../pages/components/sourcing";
import { Assembly } from "../../pages/components/assembly";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const faker = require('faker');
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const sourcing = new Sourcing();
const assembly = new Assembly();
const compApi = new ComponentApi();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe("Test Components", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
  })

  beforeEach(() => {
    signin.signin(email)
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.resetCompany(companyId);
    })
  })

  after(() => {
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.deleteCompany(companyId, orgId);
    })
  })

  it('Create charger component manually', () => {
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-C",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }

    const componentFullName = components.getChargerComponentFullName(data.compName, data.chargertType, data.minVolt, data.maxVolt)

    // Navigate to Componets tab
    nav.openComponentsTab();
    components.createChargerComponentManually(data);

    // Verify data before and after saving the componenet
    components.verifyDataInEditmode(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyDataOnComponentCreation(data);

    // Verify component data in the table in Components page
    nav.openComponentsTab();   
    components.verifyComponentDataInTable(data, componentFullName);
  })

  it('Delete component from components details page', () =>{
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-C",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }

    // Navigate to Component tab
     nav.openComponentsTab();

    // Create new Component
     components.createChargerComponentManually(data);
     components.clickSaveButtonInEditComponent();
     featureHelper.waitForLoadingIconToDisappear();

     // Delete Component
     components.deleteComponentFromDetailsPage();

     // Assert Component not present in table
     components.assertComponentDeleted(constData.componentTableHeaders.name, data.compName);
  })

  it('Delete component in components table page', () =>{
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-C",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName= components.getChargerComponentFullName(data.compName, data.chargertType, data.minVolt, data.maxVolt);
    
    // Navigate to Component tab
    nav.openComponentsTab();
    
    // Create new Component
    components.createChargerComponentManually(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Select the component row
    nav.openComponentsTab();
    tableHelper.checkTableRow(componentFullName);

    // Delete Component
    components.deleteComponentFromTable();
    featureHelper.waitForLoadingIconToDisappear();

    // Assert Component not present in table
    components.assertComponentDeleted(constData.componentTableHeaders.name, data.compName);
  })
  
  it('Duplicate component from components table page ', () =>{
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-C",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName= components.getChargerComponentFullName(data.compName, data.chargertType, data.minVolt, data.maxVolt);
    const duplicateComponent= components.getCopiedComponentFullname(componentFullName);  
    
    // Navigate to Component tab
    nav.openComponentsTab();

    // Create new Component
    components.createChargerComponentManually(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Select and copy the component 
    nav.openComponentsTab();
    tableHelper.checkTableRow(componentFullName);
    components.copyComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Duplicate component created or not
    components.verifyCopiedComponentDataInTable(duplicateComponent, data);
  })

  it('Delete component in components table page', () =>{
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-C",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName = components.getChargerComponentFullName(data.compName, data.chargertType, data.minVolt, data.maxVolt);
    
    // Navigate to Component tab
    nav.openComponentsTab();
    
    // Create new Component
    components.createChargerComponentManually(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Select the component row
    nav.openComponentsTab();
    tableHelper.checkTableRow(componentFullName)

    // Delete Component
    components.deleteComponentFromTable();
    featureHelper.waitForLoadingIconToDisappear();

    // Assert Component not present in table
    components.assertComponentDeleted(constData.componentTableHeaders.name, data.compName);
  })
  
  it('Update bulk status for component from change status modal', () =>{
    const data1 = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-B",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName1 = components.getChargerComponentFullName(data1.compName, data1.chargertType, data1.minVolt, data1.maxVolt);
    
    const data2 = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-B",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName2 = components.getChargerComponentFullName(data2.compName, data2.chargertType, data2.minVolt, data2.maxVolt);
    
    // Navigate to Component tab and create component
    nav.openComponentsTab();
    components.createChargerComponentManually(data1);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to Component tab and create second component
    nav.openComponentsTab();
    components.createChargerComponentManually(data2);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    //Check Table row
    nav.openComponentsTab();
    tableHelper.checkTableRow(componentFullName1);
    tableHelper.checkTableRow(componentFullName2);

    // Update the status and apply
    components.clickOnUpdateStatus();
    components.updateBulkStatusAndApply(constData.status.prototype);

    // Verify updated status in each row from Change Status modal
    components.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(componentFullName1, constData.status.prototype)
    components.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(componentFullName2, constData.status.prototype)

    // Click Continue button in Change Status modal
    components.clickOnContinue();

    // Verify the component post updation
    tableHelper.assertTextInCell(constData.componentTableHeaders.status, componentFullName1, constData.status.prototype)
     tableHelper.assertTextInCell(constData.componentTableHeaders.status, componentFullName2, constData.status.prototype)
  })

  it('Update status for a component', () =>{
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-B",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName= components.getChargerComponentFullName(data.compName, data.chargertType, data.minVolt, data.maxVolt);
    
    // Navigate to Component tab
    nav.openComponentsTab();

    // Create new Component
    components.createChargerComponentManually(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify component data in the table in Components page
    nav.openComponentsTab();
    components.verifyComponentDataInTable(data, componentFullName);
    
    //Check Table row
    tableHelper.checkTableRow(componentFullName);

    // Update the status
    components.clickOnUpdateStatus();
    components.changeStatusInRowFromChangeStatusModal(componentFullName, constData.status.production);
    components.clickOnContinue();

    // Verify the component post updation
    tableHelper.assertTextInCell(constData.componentTableHeaders.status, componentFullName, constData.status.production);
  })

  it('Delete multiple components', () => {
    const data1 = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-B",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const data2 = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-C",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componetFullName1= components.getChargerComponentFullName(data1.compName, data1.chargertType, data1.minVolt, data1.maxVolt);
    const componetFullName2= components.getChargerComponentFullName(data2.compName, data2.chargertType, data2.minVolt, data2.maxVolt);

    // Navigate to Component tab
    nav.openComponentsTab();

    // Create new Component
    components.createChargerComponentManually(data1);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    nav.openComponentsTab();
    components.createChargerComponentManually(data2);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Select multiple components in the table in Components page
    nav.openComponentsTab();
    tableHelper.checkTableRow(componetFullName1);
    tableHelper.checkTableRow(componetFullName2);

    // Delete the components
    components.deleteComponentFromTable();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify product not present in table
    components.assertProductDeleted(constData.componentTableHeaders.eid, componetFullName1);
    components.assertProductDeleted(constData.componentTableHeaders.eid, componetFullName2);
  })

  it('Copy component in details page', () =>{
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-C",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName = components.getChargerComponentFullName(data.compName, data.chargertType, data.minVolt, data.maxVolt);
    const duplicateComponent = components.getCopiedComponentFullname(componentFullName);

    // Navigate to Component tab
    nav.openComponentsTab();
    
    // Create new Component
    components.createChargerComponentManually(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Select the component row
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, componentFullName);

    // Delete Component
    components.copyComponentFromDetailsPage();
    featureHelper.waitForLoadingIconToDisappear(); 

    // verify copied Component in table
    nav.openComponentsTab();
    components.verifyCopiedComponentDataInTable(duplicateComponent, data);
  })

  it('Reset status for an updated component', () =>{
    const data = {
      componentType: constData.componentType.electrical,
      eid: faker.random.number({min:100, max:9999}),
      compDesc: "The description related to component",
      chargertType: "USB-B",
      minVolt: faker.random.number({min:50, max:1000}),
      maxVolt: faker.random.number({min:2300, max:2400}),
      ampere: faker.random.number({min:1000, max:5000}),
      compName: 'CHGR',
    }
    const componentFullName = components.getChargerComponentFullName(data.compName, data.chargertType, data.minVolt, data.maxVolt);
    
    // Navigate to Component tab
    nav.openComponentsTab();

    // Create new Component
    components.createChargerComponentManually(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify component data in the table in Components page
    nav.openComponentsTab();
    components.verifyComponentDataInTable(data, componentFullName);
    
    // Check Table row
    tableHelper.checkTableRow(componentFullName);

    // Update and reset the status
    components.updateAndResetStatus(constData.status.production);

    // Verify status after reset in Change Status modal
    components.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(componentFullName, constData.status.design);
    components.verifyCheckboxUncheckedInStatusChangeModal(componentFullName);
  })

  it('Add MPN for Sourcing after creating new Component', () => {
    const data = {
      componentType: constData.componentType.electrical,
      category: constData.electricalComponents.capacitor,
      mpn: 'GRM32ER60J107ME20L',
      mpnOrDpn: 'RC0603JR-0710KL',
    }

    // Navigate to Component tab
    nav.openComponentsTab();

    // Import from Vendor
    components.importFromVendor(data);
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    components.searchForMpnOrDpn(data.mpnOrDpn);
    components.clickAdd();

    // Verify the new row added in edit sourcing table and Save the changes
    sourcing.verifyValueInSourcingTableWhileEditing(constData.editSourcingTableHeaders.mpn, data.mpnOrDpn)
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the mpnOrDpn text is present in the Socurcing table
    components.verifyElementPresentInTable(constData.sourcingTableHeaders.mpn, data.mpnOrDpn)
  })

  it('Should not allow save as revision for components not in design status', () => {
    const cmp1Data = {
      category: "Capacitor",
      name: "prototypeCmp",
      status: constData.status.prototype,
      revision: 1
    }

    const cmp2Data = {
      category: "Charger",
      name: "productionCmp",
      status: constData.status.production,
      revision: 'A'
    }

    const cmp3Data = {
      category: "Capacitor",
      name: "obsoleteCmp",
      status: constData.status.obsolete,
      revision: 'Y'
    }

    const cmp4Data = {
      category: "Charger",
      name: "designCmp",
      status: constData.status.design
    }

    const assemblyCmp = {
      category: "EBOM",
      name: "assemblyCmp",
      status: constData.status.design
    }

    // Create Components
    compApi.createComponent(cmp1Data);
    compApi.createComponent(cmp2Data);
    compApi.createComponent(cmp3Data);
    compApi.createComponent(cmp4Data);
    compApi.createComponent(assemblyCmp);

    // Verify save as revision not exist for Non-design components
    components.verifySaveAsRevisionNotPresentForCmpInCmpLibrary(constData.componentTableHeaders.name, cmp1Data.name);
    components.verifySaveAsRevisionNotPresentForCmpInCmpLibrary(constData.componentTableHeaders.name, cmp2Data.name);
    components.verifySaveAsRevisionNotPresentForCmpInCmpLibrary(constData.componentTableHeaders.name, cmp3Data.name);

    // Verify save as revision exist for design components
    components.verifySaveAsRevisionPresentForCmpInCmpLibrary(constData.componentTableHeaders.name, cmp4Data.name);
    components.verifySaveAsRevisionPresentForCmpInCmpLibrary(constData.componentTableHeaders.name, assemblyCmp.name);

    // Get CPN values for components
    nav.openComponentsTab();

    let cmp1CpnValue, cmp2CpnValue, cmp3CpnValue, cmp4CpnValue;

    featureHelper.getCpnValueFromTable(cmp1Data.name, 1).then((value) => cmp1CpnValue = value)
    featureHelper.getCpnValueFromTable(cmp2Data.name, 1).then((value) => cmp2CpnValue = value)
    featureHelper.getCpnValueFromTable(cmp3Data.name, 1).then((value) => cmp3CpnValue = value)
    featureHelper.getCpnValueFromTable(cmp4Data.name, 1).then((value) => {
      cmp4CpnValue = value

      // Add components to Assembly component
      tableHelper.clickOnCell(constData.componentTableHeaders.name, assemblyCmp.name);
      components.clickEditIcon();
      assembly.clickAddIconInAssemblyTable();
      assembly.clickAddFromLibrary();
      assembly.checkComponentCheckboxInAddComponents(cmp1Data.name);
      assembly.checkComponentCheckboxInAddComponents(cmp2Data.name);
      assembly.checkComponentCheckboxInAddComponents(cmp3Data.name);
      assembly.checkComponentCheckboxInAddComponents(cmp4Data.name);
      assembly.clickAddInAddComponents();
      assembly.closeTheAddComponents();
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, cmp1CpnValue);
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, cmp2CpnValue);
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, cmp3CpnValue);
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, cmp4CpnValue);
      components.clickSaveButtonInEditComponent();

      // Click Save as revision and verify no of revisions for Assembly component
      components.clickEditIcon();
      components.clickSaveAsRevisionBtn();
      components.checkIncludeChildComponents();
      components.clickContinueBtnInSetNewRevisionsModal();
      components.clickOnHistoryIcon();
      components.verifyNoOfRevisions(2);

      // Verify no of revisions for design component
      components.verifyNoOfRevisionsForCmpInCmpLibrary(cmp4Data.name, 1);

      // Verify no of revisions for non-design components
      components.verifyNoOfRevisionsForCmpInCmpLibrary(cmp1Data.name, 1);
      components.verifyNoOfRevisionsForCmpInCmpLibrary(cmp2Data.name, 1);
      components.verifyNoOfRevisionsForCmpInCmpLibrary(cmp3Data.name, 1);
    })
  })

  it("Should be able to change the category of component when status is Design", () => {
    // Create component
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseCategory(constData.electricalComponents.capacitor);
    components.selectStatus(constData.status.design);
    components.enterComponentName(fakerHelper.generateProductName());
    components.enterRevision(1);
    components.clickOnCreate();

    // Change category in Component edit page
    components.changeCategoryInEditComponent(constData.electricalComponents.audio);
    components.verifyCategoryChangeModal();
    components.clickContinueInChangeCategoryModal();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyCategoryInViewComponent('Audio');
  })
})
