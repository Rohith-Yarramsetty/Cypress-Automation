import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Assembly } from "../../pages/components/assembly";
import { UsersApi } from "../../api/userApi";
import { ComponentApi } from "../../api/componentApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { Products } from "../../pages/products/products";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const fakerHelper = new FakerHelpers();
const assembly = new Assembly();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const changeOrders = new ChangeOrders();
const products = new Products();

let email, companyId, orgId;

describe("Compare revisions test cases for products", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    });
  });

  beforeEach(() => {
    authApi.signin(email)
    navHelper.navigateToSearch();
  });

  afterEach(() => {
    compSettings.resetCompany(companyId);
  });

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  });

  it("Should show correct data in compare revisions for updated and released product with nested children", () => {
    const prodName = 'Parent Product'
    const cmpData1 = {name: 'Child1', category: 'EBOM', status: constData.status.design}
    const cmpData2 = {name: 'Child2', category: 'EBOM', status: constData.status.design}
    const cmpData3 = {name: 'Grand Child1', category: 'EBOM', status: constData.status.design}
    const cmpData4 = {name: 'Grand Child2', category: 'EBOM', status: constData.status.design}

    // Create Product and child Components
    products.createAndSaveBasicProduct(prodName);
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    compApi.createComponent(cmpData3);
    compApi.createComponent(cmpData4);

    const child1AssemblyData = {CPN: '910-00001', Quantity: 1}
    const child2AssemblyData = {CPN: '910-00002', Quantity: 1}
    const grandChild1AssemblyData = {CPN: '910-00003', Quantity: 1}
    const grandChild2AssemblyData = {CPN: '910-00004', Quantity: 1}

    // Add child1 and child2 to the parent
    products.navigateToProductViewPage(prodName, false);
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(child1AssemblyData);
    assembly.addComponentsToAssemblyTable(child2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child1 to the child1
    assembly.clickOnAssemblyChildCmp(cmpData1.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    components.clickEditIcon();
    assembly.addComponentsToAssemblyTable(grandChild1AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child2 to the child2
    components.navigateToComponentEditPage(cmpData2.name, false);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(grandChild2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to Parent product and update the status to prototype by including child
    products.navigateToProductViewPage(prodName, false);
    products.clickEditIcon();
    products.selectStatusInEditView(constData.status.prototype);
    components.verifyChangeStatusHeader();
    components.verifyBulkStatusNotPresent();
    products.checkIncludeChildComponents();
    components.verifyBulkStatusPresent();
    components.selectBulkStatus();
    components.clickApply();
    products.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData1.name);
    products.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData2.name);
    products.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData3.name);
    products.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData4.name);
    products.clickOnContinue();
    featureHelper.waitForLoadingIconToDisappear();
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    cy.reload();  // To avoid cypress run delay

    // Add Parent product to CO and Include children
    products.clickOnChangeOrderIconInViewProduct();
    products.clickAddToChangeOrderInViewProduct();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.checkIncludeChildrenComponents();
    changeOrders.waitforUpdateLoadingIconTodisapper();

    // Verify Parent and child components in CO table
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData1.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData2.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData3.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData4.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(prodName);
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(5);

    // Submit and approve the change order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to nested children1 and update the component
    components.navigateToComponentEditPage(cmpData3.name, false);
    components.clickOnDocumentsTab();
    components.uploadDocumentInEditView('1a.new_component-no_cpn-bare_minimum.xlsx');
    components.clickSaveButtonInEditComponent();

    // Navigate to parent product and add to change order then submit and approve
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder(prodName);
    changeOrders.clickEcoIcon()
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    cy.reload();  // To avoid cypress run delay

    // Navigate to nested children2 and update the component
    components.navigateToComponentEditPage(cmpData4.name, false);
    components.clickOnDocumentsTab();
    components.uploadDocumentInEditView('1a.new_component-no_cpn-bare_minimum.xlsx');
    components.clickSaveButtonInEditComponent();

    // Navigate to parent component and add to change order then submit and approve
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder(prodName);
    changeOrders.clickEcoIcon()
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to product and compare revisions
    products.navigateToProductViewPage(prodName, false);
    products.clickOnHistoryIcon();
    products.clickOnCompareRevision();
    featureHelper.waitForLoadingIconToDisappear();

    // Revision changes
    const revisionChanges = {
    parentOldRevision : 2,
    parentNewRevision : 3,
    assemblyChangesCountInSummaryOfChanges : 1,
    nestedChildModificationCountForChild2: 1,
    oldRevisionForGrandChild2: 1,
    newRevisionForGrandChild2: 1,
    }

    // Verify data in Summary of changes panel
    products.verifyOldRevisionInSummaryOfChanges(revisionChanges.parentOldRevision);
    products.verifyNewRevisionInSummaryOfChanges(revisionChanges.parentNewRevision);
    products.verifyAssemblyModifiedLabelPresentInSummaryOfChanges();
    products.verifyAssemblyModifiedCountInSummaryOfChanges(revisionChanges.assemblyChangesCountInSummaryOfChanges);

    // Verify modified data in assembly table
    products.verifyModifiedCountInAssemblyTable(cmpData2.name, revisionChanges.nestedChildModificationCountForChild2);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData1.name);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData2.name);
    products.verifyOldRevisionInAssemblyTable(cmpData4.name, revisionChanges.oldRevisionForGrandChild2);
    products.verifyNewRevisionInAssemblyTable(cmpData4.name, revisionChanges.newRevisionForGrandChild2)

    // Verify background colour for modified and non-modified rows
    products.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData1.name);
    products.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData2.name);
    products.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData3.name);
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData4.name);
  });

  it("Should show correct data in compare revisions for updated product with nested children", () => {
    const prodName = 'Parent Product'
    const cmpData1 = {name: 'Child1', category: 'EBOM', status: constData.status.design}
    const cmpData2 = {name: 'Child2', category: 'EBOM', status: constData.status.design}
    const cmpData3 = {name: 'Grand Child1', category: 'EBOM', status: constData.status.design}
    const cmpData4 = {name: 'Grand Child2', category: 'EBOM', status: constData.status.design}

    // Create child Components
    products.createAndSaveBasicProduct(prodName);
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    compApi.createComponent(cmpData3);
    compApi.createComponent(cmpData4);

    const child1AssemblyData = {CPN: '910-00001', Quantity: 1}
    const child2AssemblyData = {CPN: '910-00002', Quantity: 1}
    const grandChild1AssemblyData = {CPN: '910-00003', Quantity: 1}
    const grandChild2AssemblyData = {CPN: '910-00004', Quantity: 1}

    // Add child1 and child2 to the parent
    products.navigateToProductViewPage(prodName, false);
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(child1AssemblyData);
    assembly.addComponentsToAssemblyTable(child2AssemblyData);
    products.clickSaveButtonInEditProduct();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child1 to the child1
    assembly.clickOnAssemblyChildCmp(cmpData1.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    components.clickEditIcon();
    assembly.addComponentsToAssemblyTable(grandChild1AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child2 to the child2
    components.navigateToComponentEditPage(cmpData2.name, false);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(grandChild2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent product edit page
    // click Save as revision by include all child components
    products.navigateToProductViewPage(prodName, false);
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.verifyChildCmpTableDisabledInSetNewRevisionModal();
    products.checkIncludeChildComponents();
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent product edit page
    // click Save as revision by include first child
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.verifyChildCmpTableDisabledInSetNewRevisionModal();
    products.checkIncludeChildComponents();
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.uncheckAllRowsChildCheckBoxInSetNewRevisionModal();
    products.checkChildRowInSetNewRevisionModal(1);
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent product edit page
    // click Save as revision by include first and second child
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.verifyChildCmpTableDisabledInSetNewRevisionModal();
    products.checkIncludeChildComponents();
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.uncheckAllRowsChildCheckBoxInSetNewRevisionModal();
    products.checkChildRowInSetNewRevisionModal(1);
    products.checkChildRowInSetNewRevisionModal(2);
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent product edit page
    // click Save as revision by include three childs
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.verifyChildCmpTableDisabledInSetNewRevisionModal();
    products.checkIncludeChildComponents();
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.uncheckAllRowsChildCheckBoxInSetNewRevisionModal();
    products.checkChildRowInSetNewRevisionModal(1);
    products.checkChildRowInSetNewRevisionModal(2);
    products.checkChildRowInSetNewRevisionModal(3);
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent product edit page
    // click Save as revision by include all child components
    products.clickEditIcon();
    products.clickSaveAsRevisionBtn();
    products.verifyChildCmpTableDisabledInSetNewRevisionModal();
    products.checkIncludeChildComponents();
    products.verifyChildCmpTableEnabledInSetNewRevisionModal();
    products.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Compare 1st row and 2nd row revisions
    products.clickOnHistoryIcon();
    products.clickOnCompareRevision();
    featureHelper.waitForLoadingIconToDisappear();

    // Revision changes
    const revisionChanges1 ={
    parentOldRevision : 5,
    parentNewRevision : 6,
    assemblyChangesCountInSummaryOfChanges : 4,
    nestedChildModificationCountForChild1: 1,
    nestedChildModificationCountForChild2: 1,
    oldRevisionForChild1: 4,
    newRevisionForChild1: 5,
    oldRevisionForChild2: 3,
    newRevisionForChild2: 4,
    oldRevisionForGrandChild1: 2,
    newRevisionForGrandChild1: 3,
    oldRevisionForGrandChild2: 1,
    newRevisionForGrandChild2: 2,
    }

    // Verify data in Summary of changes panel
    products.verifyOldRevisionInSummaryOfChanges(revisionChanges1.parentOldRevision);
    products.verifyNewRevisionInSummaryOfChanges(revisionChanges1.parentNewRevision);
    products.verifyAssemblyModifiedLabelPresentInSummaryOfChanges();
    products.verifyAssemblyModifiedCountInSummaryOfChanges(revisionChanges1.assemblyChangesCountInSummaryOfChanges);

    // Verify modified count in assembly table
    products.verifyModifiedCountInAssemblyTable(cmpData1.name, revisionChanges1.nestedChildModificationCountForChild1);
    products.verifyModifiedCountInAssemblyTable(cmpData2.name, revisionChanges1.nestedChildModificationCountForChild2);

    // Expand child components
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData1.name);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData2.name);

    // Verify Background colour for modified rows
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData1.name);
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData2.name);
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData3.name);
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData4.name);

    // Verify Old and New revisions for childs and nested childs
    products.verifyOldRevisionInAssemblyTable(cmpData1.name, revisionChanges1.oldRevisionForChild1);
    products.verifyNewRevisionInAssemblyTable(cmpData1.name, revisionChanges1.newRevisionForChild1);
    products.verifyOldRevisionInAssemblyTable(cmpData2.name, revisionChanges1.oldRevisionForChild2);
    products.verifyNewRevisionInAssemblyTable(cmpData2.name, revisionChanges1.newRevisionForChild2);
    products.verifyOldRevisionInAssemblyTable(cmpData3.name, revisionChanges1.oldRevisionForGrandChild1);
    products.verifyNewRevisionInAssemblyTable(cmpData3.name, revisionChanges1.newRevisionForGrandChild1);
    products.verifyOldRevisionInAssemblyTable(cmpData4.name, revisionChanges1.oldRevisionForGrandChild2);
    products.verifyNewRevisionInAssemblyTable(cmpData4.name, revisionChanges1.newRevisionForGrandChild2);

    // Compare 2nd row and 4th row revisions
    products.clickOnHistoryIconInCompareRevisionPage();
    products.clickOnPreviousRevision(4);
    featureHelper.waitForLoadingIconToDisappear();
    products.clickOnHistoryIcon();
    products.selectRevisionInHistoryTable(2);
    products.clickOnCompareRevision();
    featureHelper.waitForLoadingIconToDisappear();

    // Revision changes
    const revisionChanges2 ={
    parentOldRevision : 3,
    parentNewRevision : 5,
    assemblyChangesCountInSummaryOfChanges : 3,
    nestedChildModificationCountForChild1: 1,
    oldRevisionForChild1: 2,
    newRevisionForChild1: 4,
    oldRevisionForChild2: 1,
    newRevisionForChild2: 3,
    oldRevisionForGrandChild1: 1,
    newRevisionForGrandChild1: 2,
    revisionForGrandChild: 1
    }

    // Verify data in Summary of changes panel
    products.verifyOldRevisionInSummaryOfChanges(revisionChanges2.parentOldRevision);
    products.verifyNewRevisionInSummaryOfChanges(revisionChanges2.parentNewRevision);
    products.verifyAssemblyModifiedLabelPresentInSummaryOfChanges();
    products.verifyAssemblyModifiedCountInSummaryOfChanges(revisionChanges2.assemblyChangesCountInSummaryOfChanges);

    // Verify modified count in assembly table
    products.verifyModifiedCountInAssemblyTable(cmpData1.name, revisionChanges2.nestedChildModificationCountForChild1);

    // Expand child components
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData1.name);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData2.name);

    // Verify Background colour for modified rows and non modified row
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData1.name);
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData2.name);
    products.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData3.name);
    products.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData4.name);

    // Verify Old and New revisions for childs and nested childs
    products.verifyOldRevisionInAssemblyTable(cmpData1.name, revisionChanges2.oldRevisionForChild1);
    products.verifyNewRevisionInAssemblyTable(cmpData1.name, revisionChanges2.newRevisionForChild1);
    products.verifyOldRevisionInAssemblyTable(cmpData2.name, revisionChanges2.oldRevisionForChild2);
    products.verifyNewRevisionInAssemblyTable(cmpData2.name, revisionChanges2.newRevisionForChild2);
    products.verifyOldRevisionInAssemblyTable(cmpData3.name, revisionChanges2.oldRevisionForGrandChild1);
    products.verifyNewRevisionInAssemblyTable(cmpData3.name, revisionChanges2.newRevisionForGrandChild1);
  });
});
