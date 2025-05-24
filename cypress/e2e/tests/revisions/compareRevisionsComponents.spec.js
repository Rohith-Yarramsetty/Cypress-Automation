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

let email, companyId, orgId;

describe("Compare revisions test cases for components", () => {
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

  it("Should show correct data in compare revisions for updated and released component with nested children", () => {
    const cmpData1 = {name: 'Parent Cmp', category: 'EBOM', status: constData.status.design}
    const cmpData2 = {name: 'Child1', category: 'EBOM', status: constData.status.design}
    const cmpData3 = {name: 'Child2', category: 'EBOM', status: constData.status.design}
    const cmpData4 = {name: 'Grand Child1', category: 'EBOM', status: constData.status.design}
    const cmpData5 = {name: 'Grand Child2', category: 'EBOM', status: constData.status.design}

    // Create Components
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    compApi.createComponent(cmpData3);
    compApi.createComponent(cmpData4);
    compApi.createComponent(cmpData5);

    const child1AssemblyData = {CPN: '910-00002', Quantity: 1}
    const child2AssemblyData = {CPN: '910-00003', Quantity: 1}
    const grandChild1AssemblyData = {CPN: '910-00004', Quantity: 1}
    const grandChild2AssemblyData = {CPN: '910-00005', Quantity: 1}

    // Add child1 and child2 to the parent
    components.navigateToComponentEditPage(cmpData1.name, false);
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(child1AssemblyData);
    assembly.addComponentsToAssemblyTable(child2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child1 to the child1
    assembly.clickOnAssemblyChildCmp(cmpData2.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    components.clickEditIcon();
    assembly.addComponentsToAssemblyTable(grandChild1AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child2 to the child2
    components.navigateToComponentEditPage(cmpData3.name, false);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(grandChild2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to Parent component and update the status to prototype by including child
    components.navigateToComponentEditPage(cmpData1.name, false);
    components.selectStatusInEditView(constData.status.prototype);
    components.verifyChangeStatusHeader();
    components.verifyBulkStatusNotPresent();
    components.checkIncludeChildComponents();
    components.verifyBulkStatusPresent();
    components.selectBulkStatus();
    components.clickApply();
    components.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData2.name);
    components.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData3.name);
    components.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData4.name);
    components.verifyUpdatedStatusInStatusColumnFromChangeStatusModal(cmpData5.name);
    components.clickOnContinue();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    cy.reload();  // To avoid cypress run delay

    // Add Parent component to CO and Include children
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickAddToChangeOrderInViewComponent();
    featureHelper.waitForLoadingIconToDisappear();
    changeOrders.checkIncludeChildrenComponents();
    changeOrders.waitforUpdateLoadingIconTodisapper();

    // Verify Parent and child components in CO table
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData2.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData3.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData4.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData5.name);
    changeOrders.verifyCmpOrProductPresentInCoTable(cmpData1.name);
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(5);

    // Submit and approve the change order
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to nested children1 and update the component
    components.navigateToComponentEditPage(cmpData4.name, false);
    components.clickOnDocumentsTab();
    components.uploadDocumentInEditView('1a.new_component-no_cpn-bare_minimum.xlsx');
    components.clickSaveButtonInEditComponent();

    // Navigate to parent component and add to change order then submit and approve
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
    changeOrders.clickEcoIcon()
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    cy.reload();  // To avoid cypress run delay

    // Navigate to nested children2 and update the component
    components.navigateToComponentEditPage(cmpData5.name, false);
    components.clickOnDocumentsTab();
    components.uploadDocumentInEditView('1a.new_component-no_cpn-bare_minimum.xlsx');
    components.clickSaveButtonInEditComponent();

    // Navigate to parent component and add to change order then submit and approve
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData1.name);
    changeOrders.clickEcoIcon()
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.approveNewChangeOrder();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent component and compare the revisions
    components.navigateToComponentViewPage(cmpData1.name, false);
    components.clickOnHistoryIcon();
    components.clickOnCompareRevision();
    featureHelper.waitForLoadingIconToDisappear();

    // Revision changes
    const revisionChanges ={
      parentOldRevision : 2,
      parentNewRevision : 3,
      assemblyChangesCountInSummaryOfChanges : 1,
      nestedChildModificationCountForChild2: 1,
      oldRevisionForGrandChild2: 1,
      newRevisionForGrandChild2: 1,
    }

    // Verify data in Summary of changes panel
    components.verifyOldRevisionInSummaryOfChanges(revisionChanges.parentOldRevision);
    components.verifyNewRevisionInSummaryOfChanges(revisionChanges.parentNewRevision);
    components.verifyAssemblyModifiedLabelPresentInSummaryOfChanges();
    components.verifyAssemblyModifiedCountInSummaryOfChanges(revisionChanges.assemblyChangesCountInSummaryOfChanges);

    // Verify modified data in assembly table
    components.verifyModifiedCountInAssemblyTable(cmpData3.name, revisionChanges.nestedChildModificationCountForChild2);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData2.name);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData3.name);
    components.verifyOldRevisionInAssemblyTable(cmpData5.name, revisionChanges.oldRevisionForGrandChild2);
    components.verifyNewRevisionInAssemblyTable(cmpData5.name, revisionChanges.newRevisionForGrandChild2);

    // Verify background colour for modified and non-modified rows
    components.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData2.name);
    components.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData3.name);
    components.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData4.name);
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData5.name);
  });

  it("Should show correct data in compare revisions for updated component with nested children", () => {
    const cmpData1 = {name: 'Parent Cmp', category: 'EBOM', status: constData.status.design}
    const cmpData2 = {name: 'Child1', category: 'EBOM', status: constData.status.design}
    const cmpData3 = {name: 'Child2', category: 'EBOM', status: constData.status.design}
    const cmpData4 = {name: 'Grand Child1', category: 'EBOM', status: constData.status.design}
    const cmpData5 = {name: 'Grand Child2', category: 'EBOM', status: constData.status.design}

    // Create Components
    compApi.createComponent(cmpData1);
    compApi.createComponent(cmpData2);
    compApi.createComponent(cmpData3);
    compApi.createComponent(cmpData4);
    compApi.createComponent(cmpData5);

    const child1AssemblyData = {CPN: '910-00002', Quantity: 1}
    const child2AssemblyData = {CPN: '910-00003', Quantity: 1}
    const grandChild1AssemblyData = {CPN: '910-00004', Quantity: 1}
    const grandChild2AssemblyData = {CPN: '910-00005', Quantity: 1}

    // Add child1 and child2 to the parent
    components.navigateToComponentEditPage(cmpData1.name, false);
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(child1AssemblyData);
    assembly.addComponentsToAssemblyTable(child2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child1 to the child1
    assembly.clickOnAssemblyChildCmp(cmpData2.name);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    components.clickEditIcon();
    assembly.addComponentsToAssemblyTable(grandChild1AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Add grand child2 to the child2
    components.navigateToComponentEditPage(cmpData3.name, false);
    featureHelper.waitForLoadingIconToDisappear();
    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(grandChild2AssemblyData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent component edit page
    // click Save as revision by include all child components
    components.navigateToComponentEditPage(cmpData1.name, false);
    components.clickSaveAsRevisionBtn();
    components.verifyChildCmpTableDisabledInSetNewRevisionModal();
    components.checkIncludeChildComponents();
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent component edit page 
    // click Save as revision by include first child
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.verifyChildCmpTableDisabledInSetNewRevisionModal();
    components.checkIncludeChildComponents();
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.uncheckAllRowsChildCheckBoxInSetNewRevisionModal();
    components.checkChildRowInSetNewRevisionModal(1);
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent component edit page 
    // click Save as revision by include first and second child
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.verifyChildCmpTableDisabledInSetNewRevisionModal();
    components.checkIncludeChildComponents();
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.uncheckAllRowsChildCheckBoxInSetNewRevisionModal();
    components.checkChildRowInSetNewRevisionModal(1);
    components.checkChildRowInSetNewRevisionModal(2);
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent component edit page 
    // click Save as revision by include three childs
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.verifyChildCmpTableDisabledInSetNewRevisionModal();
    components.checkIncludeChildComponents();
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.uncheckAllRowsChildCheckBoxInSetNewRevisionModal();
    components.checkChildRowInSetNewRevisionModal(1);
    components.checkChildRowInSetNewRevisionModal(2);
    components.checkChildRowInSetNewRevisionModal(3);
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Navigate to parent component edit page
    // click Save as revision by include all child components
    components.clickEditIcon();
    components.clickSaveAsRevisionBtn();
    components.verifyChildCmpTableDisabledInSetNewRevisionModal();
    components.checkIncludeChildComponents();
    components.verifyChildCmpTableEnabledInSetNewRevisionModal();
    components.clickContinueBtnInSetNewRevisionsModal();
    featureHelper.waitForLoadingIconToDisappear();

    // Compare 1st row and 2nd row revisions
    components.clickOnHistoryIcon();
    components.clickOnCompareRevision();
    featureHelper.waitForLoadingIconToDisappear();

    // Revision changes
    const revisionChanges1 ={
      parentOldRevision : 4,
      parentNewRevision : 5,
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
    components.verifyOldRevisionInSummaryOfChanges(revisionChanges1.parentOldRevision);
    components.verifyNewRevisionInSummaryOfChanges(revisionChanges1.parentNewRevision);
    components.verifyAssemblyModifiedLabelPresentInSummaryOfChanges();
    components.verifyAssemblyModifiedCountInSummaryOfChanges(revisionChanges1.assemblyChangesCountInSummaryOfChanges);

    // Verify modified count in assembly table
    components.verifyModifiedCountInAssemblyTable(cmpData2.name, revisionChanges1.nestedChildModificationCountForChild1);
    components.verifyModifiedCountInAssemblyTable(cmpData3.name, revisionChanges1.nestedChildModificationCountForChild2);

    // Expand child components
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData2.name);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData3.name);

    // Verify Background colour for modified rows
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData2.name);
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData3.name);
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData4.name);
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData5.name);

    // Verify Old and New revisions for childs and nested childs
    components.verifyOldRevisionInAssemblyTable(cmpData2.name, revisionChanges1.oldRevisionForChild1);
    components.verifyNewRevisionInAssemblyTable(cmpData2.name, revisionChanges1.newRevisionForChild1);
    components.verifyOldRevisionInAssemblyTable(cmpData3.name, revisionChanges1.oldRevisionForChild2);
    components.verifyNewRevisionInAssemblyTable(cmpData3.name, revisionChanges1.newRevisionForChild2);
    components.verifyOldRevisionInAssemblyTable(cmpData4.name, revisionChanges1.oldRevisionForGrandChild1);
    components.verifyNewRevisionInAssemblyTable(cmpData4.name, revisionChanges1.newRevisionForGrandChild1);
    components.verifyOldRevisionInAssemblyTable(cmpData5.name, revisionChanges1.oldRevisionForGrandChild2);
    components.verifyNewRevisionInAssemblyTable(cmpData5.name, revisionChanges1.newRevisionForGrandChild2);

    // Compare 2nd row and 4th row revisions
    components.clickOnHistoryIconInCompareRevisionPage();
    components.clickOnPreviousRevision(4);
    featureHelper.waitForLoadingIconToDisappear();
    components.clickOnHistoryIcon();
    components.selectRevisionInHistoryTable(2);
    components.clickOnCompareRevision();
    featureHelper.waitForLoadingIconToDisappear();

    // Revision changes
    const revisionChanges2 ={
      parentOldRevision : 2,
      parentNewRevision : 4,
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
    components.verifyOldRevisionInSummaryOfChanges(revisionChanges2.parentOldRevision);
    components.verifyNewRevisionInSummaryOfChanges(revisionChanges2.parentNewRevision);
    components.verifyAssemblyModifiedLabelPresentInSummaryOfChanges();
    components.verifyAssemblyModifiedCountInSummaryOfChanges(revisionChanges2.assemblyChangesCountInSummaryOfChanges);

    // Verify modified count in assembly table
    components.verifyModifiedCountInAssemblyTable(cmpData2.name, revisionChanges2.nestedChildModificationCountForChild1);

    // Expand child components
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData2.name);
    assembly.clickOnExpandTriangleIconInCompareRevisionPage(cmpData3.name);

    // Verify Background colour for modified rows and non modified row
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData2.name);
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData3.name);
    components.verifyBackgroundColourForModifiedRowInCompareRevPage(cmpData4.name);
    components.verifyBackgroundColourForNonModifiedRowInCompareRevPage(cmpData5.name);

    // Verify Old and New revisions for childs and nested childs
    components.verifyOldRevisionInAssemblyTable(cmpData2.name, revisionChanges2.oldRevisionForChild1);
    components.verifyNewRevisionInAssemblyTable(cmpData2.name, revisionChanges2.newRevisionForChild1);
    components.verifyOldRevisionInAssemblyTable(cmpData3.name, revisionChanges2.oldRevisionForChild2);
    components.verifyNewRevisionInAssemblyTable(cmpData3.name, revisionChanges2.newRevisionForChild2);
    components.verifyOldRevisionInAssemblyTable(cmpData4.name, revisionChanges2.oldRevisionForGrandChild1);
    components.verifyNewRevisionInAssemblyTable(cmpData4.name, revisionChanges2.newRevisionForGrandChild1);
  });
});
