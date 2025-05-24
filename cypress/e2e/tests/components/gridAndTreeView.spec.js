import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { ComponentApi } from "../../api/componentApi";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { Components } from "../../pages/components/component";
import { TableHelpers } from "../../helpers/tableHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Assembly } from "../../pages/components/assembly";
import { UsersApi } from "../../api/userApi";
import { SignIn } from "../../pages/signin";
import { Products } from "../../pages/products/products";
import { ImportFromFile } from "../../pages/components/importFromFile";

const navHelper = new NavHelpers();
const authApi = new AuthApi();
const compApi = new ComponentApi();
const nav = new Navigation();
const components = new Components();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const assembly = new Assembly();
const userApi = new UsersApi();
const signin = new SignIn();
const products = new Products();
const importFromFile = new ImportFromFile();

let companyId, orgId, email;


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

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Tree View and Grid View Module", { tags: ["grid_and_tree_view"] }, () => {
  afterEach(() => {
    compSettings.resetCompany(companyId, orgId);
  })

  it('Tree view should display the updated assembly correctly', () => {
    const cmpData = {
    category: "Adhesive",
    name: "childCmp",
    status: "DESIGN"
    }
    const assemblyData = {
    category: "MBOM",
    name: "assemblyCmp",
    status: "DESIGN"
    }

    // Create Component and Assemblies
    compApi.createComponent(cmpData);
    compApi.createComponent(assemblyData);
    nav.openComponentsTab();

    let componentCpnValue, assemblyCpnValue;

    featureHelper.getCpnValueFromTable(cmpData.name, 1).then((value) => componentCpnValue = value)
    featureHelper.getCpnValueFromTable(assemblyData.name, 1).then((value) => {
      assemblyCpnValue = value

      const childCompData = {
        CPN: componentCpnValue,
        Quantity: 1,
      }

      // Add Adhesive component to Assembly component
      tableHelper.clickOnCell(constData.componentTableHeaders.name, assemblyCpnValue);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childCompData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Change the status of Adhesive component status
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentCpnValue);
      components.clickEditIcon();
      components.selectStatusInEditView(constData.status.prototype);
      components.clickContinueBtnInSaveAsRevisionModal();
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to Assembly component and verify child component status
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, assemblyCpnValue);
      assembly.verifyStatusInAssemblyTable(cmpData.name, constData.status.prototype)
    })
  })

  it("Grid view and Tree view should display correctly", () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('1a.new_component-no_cpn-bare_minimum.xlsx');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();

    // Create product and add child components and save
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName('Prd-Assembly');
    products.clickCreateButton();
    const cmpData1 = {
      CPN       : '232-00001',
      Quantity  : 1,
      ItemNumber: 2
    }
    const cmpData2 = {
      CPN       : '212-00003',
      Quantity  : 1,
      ItemNumber: 1
    }
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(cmpData1);
    assembly.addComponentsToAssemblyTable(cmpData2);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify Tree view is visible
    assembly.verifyTreeViewVisible();

    // Click on Grid view icon and verify grid view is visible
    assembly.clickOnGridView();
    assembly.verifyGridViewVisible();

    // Go back and forward and verify Grid view is visible
    cy.go('back');
    featureHelper.waitForLoadingIconToDisappear();
    cy.go('forward');
    components.clickOkBtnInUnsavedChangesModal();
    featureHelper.waitForLoadingIconToDisappear();
    assembly.verifyGridViewVisible();

    // Click on Tree view icon and verify Tree view is visible
    assembly.clickOnTreeView();
    assembly.verifyTreeViewVisible();

    // Go back and forward and verify Tree view is visible
    cy.go('back');
    featureHelper.waitForLoadingIconToDisappear();
    cy.go('forward');
    components.clickOkBtnInUnsavedChangesModal();
    featureHelper.waitForLoadingIconToDisappear();
    assembly.verifyTreeViewVisible();
  })

  it("Variant Icon should show in grid and tree view", () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('1a.new_component-no_cpn-bare_minimum.xlsx');
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();

    // Create product and add child component and save
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName('Prd-Assembly');
    products.clickCreateButton();

    const cmpData1 = {
      CPN       : '232-00001',
      Quantity  : 1,
      ItemNumber: 2
    }
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(cmpData1);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Go to child component and create a new variant
    assembly.clickOnGridView();
    assembly.clickOnAssemblyChildCmp('RES one');
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    featureHelper.waitForLoadingIconToDisappear();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to Product and verify Variant icon present in grid view
    products.navigateToProductViewPage('Prd-Assembly', false);
    assembly.clickOnGridView();
    assembly.verifyVariantIconPresentInAssemblyTable('RES one');

    // Click on tree view and verify Variant icon present in tree view
    assembly.clickOnTreeView();
    assembly.verifyVariantIconPresentInAssemblyTable('RES one');
  })

  it('Tree view should open and close the assembly tree correctly', () => {
    // Create components with tree structure
    components.createComponentsWithTreeStructure();

    // Create a product and add cmp-4 as child
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName("prd-tree");
    products.selectLifeCycleStatus(constData.status.production);
    products.enterRevision('A');
    products.clickCreateButton();

    const cmpData = {
      CPN       : '910-00004',
      Quantity  : 1,
    }

    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(cmpData);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();
    assembly.verifyTreeViewVisible();
    assembly.verifyAssemblyChildCount(1);
    assembly.clickExpand();
    assembly.verifyAssemblyChildCount(2);
    assembly.clickExpand();
    assembly.verifyAssemblyChildCount(3);
    assembly.clickExpand();
    assembly.verifyAssemblyChildCount(4);

    cy.go('back')
    cy.go('forward')

    assembly.verifyTreeViewVisible();
    assembly.verifyAssemblyChildCount(4);
    assembly.clickOnGridView();
    assembly.verifyGridViewVisible();

    assembly.clickOnTreeView();
    assembly.verifyTreeViewVisible();
    assembly.verifyAssemblyChildCount(4);
    assembly.clickOnGridView();
    assembly.verifyGridViewVisible();

    cy.go('back')
    cy.go('forward')

    assembly.verifyGridViewVisible();
    assembly.clickOnTreeView();
    assembly.verifyTreeViewVisible();
    assembly.verifyAssemblyChildCount(4);
    assembly.clickCollapseIconInAssemblyTable();
    assembly.verifyAssemblyChildCount(1);
  })

  it('Tree view should display correct revision with nested assemblies, also both view should display correct rolled-up modified icon', () => {
    // Create components with tree structure
    components.createComponentsWithTreeStructure(true);

    // Create product and add child components and save
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName('Prd-tree');
    products.clickCreateButton();

    const cmpData1 = {
      CPN       : '910-00004',
      Quantity  : 1,
      ItemNumber: 1
    }
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(cmpData1);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    cy.reload();

    // Verify Rolled up cost icon not present in tree and grid view
    assembly.verifyRolledUpModifiedIconIsNotPresent();
    assembly.clickOnGridView();
    assembly.verifyRolledUpModifiedIconIsNotPresent();
    assembly.clickOnTreeView();

    // Go to child component and verify Rolled up cost icon not present in tree and grid view
    assembly.clickOnAssemblyChildCmp('cmp-4');
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnGridView();
    assembly.verifyRolledUpModifiedIconIsNotPresent();
    assembly.clickOnTreeView();
    assembly.verifyRolledUpModifiedIconIsNotPresent();

    // Go to component 1 and change the status and save
    components.navigateToComponentEditPage('cmp-1', false);
    components.selectStatusInEditView(constData.status.production);
    components.clickContinueBtnInSaveAsRevisionModal();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Go to component 4 and verify Rolled up cost icon present in tree and grid view
    components.navigateToComponentViewPage('cmp-4', false);
    assembly.clickOnGridView();
    assembly.verifyRolledUpModifiedIconIsPresent();
    assembly.clickOnTreeView();
    assembly.verifyRolledUpModifiedIconIsPresent();

    // Go to Product and verify Rolled up cost icon present in tree and grid view
    products.navigateToProductViewPage('Prd-tree', false);
    assembly.clickOnGridView();
    assembly.verifyRolledUpModifiedIconIsPresent();
    assembly.clickOnTreeView();
    assembly.verifyRolledUpModifiedIconIsPresent();

    // Verify tree view is visible and no of rows and revision value
    assembly.verifyTreeViewVisible();
    assembly.verifyNoOfRowsPresentInAssemblyTable(1);
    assembly.verifyDataInAssemblyTable('910-00004', 'revision-value', 'A');

    // Click expand icon and verify no of rows and revision value
    assembly.clickExpandIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(2);
    assembly.verifyDataInAssemblyTable('910-00003', 'revision-value', 'A');

    // Click expand icon and verify no of rows and revision value
    assembly.clickExpandIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(3);
    assembly.verifyDataInAssemblyTable('910-00002', 'revision-value', 1);

    // Click expand icon and verify no of rows and revision value
    assembly.clickExpandIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(4);
    assembly.verifyDataInAssemblyTable('910-00001', 'revision-value', 'A');

    // Click edit icon and save as revision
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.entercommentInBulkUpdateSaveAsRevisionModal('Assembly Rev Notes');
    products.checkIncludeChildComponents();
    products.clickContinueBtnInSetNewRevisionsModal();

    // Verify tree view is visible and no of rows and revision value
    assembly.verifyTreeViewVisible();
    assembly.verifyNoOfRowsPresentInAssemblyTable(1);
    assembly.verifyDataInAssemblyTable('910-00004', 'revision-value', 'B');

    // Click expand icon and verify no of rows and revision value
    assembly.clickExpandIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(2);
    assembly.verifyDataInAssemblyTable('910-00003', 'revision-value', 'B');

    // Click expand icon and verify no of rows and revision value
    assembly.clickExpandIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(3);
    assembly.verifyDataInAssemblyTable('910-00002', 'revision-value', 2);

    // Click expand icon and verify no of rows and revision value
    assembly.clickExpandIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(4);
    assembly.verifyDataInAssemblyTable('910-00001', 'revision-value', 'A');

    // Click on history icon and navigate to 2nd revision
    products.clickOnHistoryIconInViewPage();
    products.clickOnPreviousRevision(2);
    featureHelper.waitForLoadingIconToDisappear();

    // Verify tree view is visible and no of rows and revision value
    assembly.verifyTreeViewVisible();
    assembly.verifyNoOfRowsPresentInAssemblyTable(1);
    assembly.verifyDataInAssemblyTable('910-00004', 'revision-value', 'A');

    // Click expand icon and verify no of rows and revision value
    assembly.clickOnExpandTriangleIcon('cmp-4');
    assembly.verifyNoOfRowsPresentInAssemblyTable(2);
    assembly.verifyDataInAssemblyTable('910-00003', 'revision-value', 'A');

    // Click expand icon and verify no of rows and revision value
    assembly.clickOnExpandTriangleIcon('cmp-3');
    assembly.verifyNoOfRowsPresentInAssemblyTable(3);
    assembly.verifyDataInAssemblyTable('910-00002', 'revision-value', 1);

    // Click expand icon and verify no of rows and revision value
    assembly.clickOnExpandTriangleIcon('cmp-2');
    assembly.verifyNoOfRowsPresentInAssemblyTable(4);
    assembly.verifyDataInAssemblyTable('910-00001', 'revision-value', 'A');
  });
});

describe("Collapse & Expand Icon in tree view", { tags: ["grid_and_tree_view"] }, () => {
  before(() => {
    authApi.signin(email);
    nav.openDashboard();
    // Create components with tree structure
    const drillLevel = 6;
    components.createComponentsWithTreeStructure(false, drillLevel);

    // Create a product and add cmp-6 as child
    const childData = {
      CPN: '910-00006',
      Quantity: 1,
      ItemNumber: 1
    }

    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName("Prd-tree");
    products.clickCreateButton();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(childData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
  })

  beforeEach(() => {
    products.navigateToProductViewPage("Prd-tree", false);

    // Verify tree view is visible and no of rows in assembly table
    assembly.verifyTreeViewVisible();
    assembly.verifyNoOfRowsPresentInAssemblyTable(1);
  })

  it('Single Click of Expand icon should drill into assembly tree level by level', () => {
    let drillLevel = 6;
    // Single click on expand icon and verify the number of rows upto drill level
    for(let i = 1; i < drillLevel; i++){
      assembly.clickExpandIconInAssemblyTable();
      cy.get("body").should("include.text", `cmp-${drillLevel-i}`);
      assembly.verifyNoOfRowsPresentInAssemblyTable(i+1);
    }

    // Click collapse icon and verify no of rows
    assembly.clickCollapseIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(1);
  });

  it('Double Click of Expand icon should expand assembly tree completely', {defaultCommandTimeout: 120000}, () => {
    let drillLevel = 6;
    cy.get("body").contains("Collapse").click();
    // Double click on expand icon and verify the number of rows upto drill level
    assembly.clickExpandIconInAssemblyTable(true);
    cy.get("body").should("include.text", "cmp-1");
    assembly.verifyNoOfRowsPresentInAssemblyTable(drillLevel);

    // Click collapse icon and verify no of rows
    assembly.clickCollapseIconInAssemblyTable();
    assembly.verifyNoOfRowsPresentInAssemblyTable(1);
  });
});
