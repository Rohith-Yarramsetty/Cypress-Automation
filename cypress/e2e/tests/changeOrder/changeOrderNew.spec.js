import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { Products } from "../../pages/products/products";
import { Components } from "../../pages/components/component";
import { Assembly } from "../../pages/components/assembly";
import { TableHelpers } from "../../helpers/tableHelper";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const changeOrders = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const products = new Products();
const components = new Components();
const assembly = new Assembly();
const tableHelper = new TableHelpers();

let email, companyId, orgId, componentsData;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
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

describe('Change Order Bulk Actions Module', {tags: ["ChangeOrder", "New_ChangeOrder"]}, () => {
  beforeEach(() => {
    componentsData = [{
      categoryType : "Mechanical",
      category     : "Adhesive",
      status       : "DESIGN",
      name         : "comp-1",
    },{
      categoryType : "Electrical",
      category     : "Audio",
      status       : "PROTOTYPE",
      name         : "comp-2",
    },{
      categoryType : "Mechanical",
      category     : "Bolt",
      status       : "PRODUCTION",
      name         : "comp-3",
    }];

    // Create the Components
    for(let i = 0; i < componentsData.length; i++) {
      compApi.createComponent(componentsData[i]);
    }

    // Add Components to changeOrder
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentsData[0].name);
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentsData[1].name);
    changeOrders.searchAndCheckComponentInNewChangeOrder(componentsData[2].name);
  })

  it('Should update the components status in bulk correctly', () => {
    // Check the Components in changeOrder
    changeOrders.checkComponentsInChangeOrderTable(componentsData[0].name);
    changeOrders.checkComponentsInChangeOrderTable(componentsData[1].name);
    changeOrders.checkComponentsInChangeOrderTable(componentsData[2].name);

    // Set the Bulk actions
    changeOrders.clickOnUpdateStatusIcon();
    changeOrders.selectBulkStatusInChangeStatusModal(constData.status.obsolete);
    changeOrders.enterBulkRevisionInChangeStatusModal('G');
    changeOrders.clickApplyBtnInChangeStatusModal();

    // Verify the Current Status & New Status in Change status Modal
    for(let i = 0; i < componentsData.length; i++) {
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[i].name, componentsData[i].status);
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[i].name, constData.status.obsolete);
    }

    // Verify the Current Revision in Change status Modal
    changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[0].name, '—');
    changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[1].name, 1);
    changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[2].name, 'A');

    // Verify the New Revision in Change status Modal
    changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[0].name, 'G');
    changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[1].name, 'G');
    changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[2].name, 'G');
    changeOrders.clickContinueBtnInChangeStatusModal();

    // Save the changeOrder to draft
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal("Desc related to CO");
    changeOrders.clickSaveDraft();
    featureHelper.waitForLoadingIconToDisappear();

    // Verify the Current Status & New Status in changeOrder table
    for(let i=0; i<componentsData.length; i++) {
      changeOrders.verifyLastReleasedStatusInChangeOrderTable(componentsData[i].name, componentsData[i].status);
      changeOrders.verifyNewStatusInChangeOrderTable(componentsData[i].name, constData.status.obsolete);
    }

    // Verify the Last Revision in changeOrder table
    changeOrders.verifyLastReleasedRevisionInChangeOrderTable(componentsData[0].name, '—');
    changeOrders.verifyLastReleasedRevisionInChangeOrderTable(componentsData[1].name, 1);
    changeOrders.verifyLastReleasedRevisionInChangeOrderTable(componentsData[2].name, 'A');

    // Verify the New Revision in changeOrder table
    changeOrders.verifyNewRevisionInChangeOrderTable(componentsData[0].name, 'G');
    changeOrders.verifyNewRevisionInChangeOrderTable(componentsData[1].name, 'G');
    changeOrders.verifyNewRevisionInChangeOrderTable(componentsData[2].name, 'G');
  })

  context('BulkStatus Update From CO Module with AlphaNumeric Revision (XY) format', () => {
    before(() => {
      compSettings.updateCompanySettings(companyId, compPayloads.revSchemeType('ALPHA-NUMERIC-XY'));
    })

    after(() => {
      compSettings.updateCompanySettings(companyId, compPayloads.revSchemeType('DEFAULT'));
    })

    it('should reset the rows in update status modal correctly', () => {
      const newStatus = 'OBSOLETE', newRevision = 'A0';

      // Choose bulk update for all components
      changeOrders.checkSelectAllCheckboxInAssemblyTable();
      changeOrders.clickOnUpdateStatusIcon();

      // Change the status & revision
      changeOrders.selectBulkStatusInChangeStatusModal(newStatus);
      changeOrders.enterBulkRevisionInChangeStatusModal(newRevision);
      changeOrders.clickApplyBtnInChangeStatusModal();

      // Verify the status & revision
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[0].name, newStatus);
      changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[0].name, newRevision);
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[0].name, 'DESIGN');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[0].name, '1');

      // Verify the status & revision
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[1].name, newStatus);
      changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[1].name, newRevision);
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[1].name, 'PROTOTYPE');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[1].name, '1');

      // Verify the status & revision
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[2].name, newStatus);
      changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[2].name, newRevision);
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[2].name, 'PRODUCTION');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[2].name, 'A0');

      // Verify the status & revision after changes reset
      changeOrders.clickResetBtnInChangeStatusModal();
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[0].name, 'DESIGN');
      changeOrders.verifyNewRevisionInChangeStatusModalBeforeUpdate(componentsData[0].name, '1');
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[0].name, 'DESIGN');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[0].name, '1');

      // Verify the status & revision after changes reset
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[1].name, 'PROTOTYPE');
      changeOrders.verifyNewRevisionInChangeStatusModalBeforeUpdate(componentsData[1].name, '2');
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[1].name, 'PROTOTYPE');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[1].name, '1');

      // Verify the status & revision after changes reset
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[2].name, 'PRODUCTION');
      changeOrders.verifyNewRevisionInChangeStatusModalBeforeUpdate(componentsData[2].name, 'A1');
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[2].name, 'PRODUCTION');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[2].name, 'A0');
    })
  })

  context('BulkStatus Update From CO Module with AlphaNumeric Revision (XYZ) format', () => {
    before(() => {
      compSettings.updateCompanySettings(companyId, compPayloads.revSchemeType('ALPHA-NUMERIC-XYZ'));
    })

    after(() => {
      compSettings.updateCompanySettings(companyId, compPayloads.revSchemeType('DEFAULT'));
    })

    it('should reset the rows in update status modal correctly', () => {
      const newStatus = 'OBSOLETE', newRevision = 'A1.0';

      // Choose bulk update for all components
      changeOrders.checkSelectAllCheckboxInAssemblyTable();
      changeOrders.clickOnUpdateStatusIcon();

      // Change the status & revision
      changeOrders.selectBulkStatusInChangeStatusModal(newStatus);
      changeOrders.enterBulkRevisionInChangeStatusModal(newRevision);
      changeOrders.clickApplyBtnInChangeStatusModal();

      // Verify the status & revision
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[0].name, newStatus);
      changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[0].name, newRevision);
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[0].name, 'DESIGN');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[0].name, '1.0');

      // Verify the status & revision
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[1].name, newStatus);
      changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[1].name, newRevision);
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[1].name, 'PROTOTYPE');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[1].name, '1.0');

      // Verify the status & revision
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[2].name, newStatus);
      changeOrders.verifyNewRevisionInChangeStatusModal(componentsData[2].name, newRevision);
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[2].name, 'PRODUCTION');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[2].name, 'A1.0');

      // Verify the status & revision after changes reset
      changeOrders.clickResetBtnInChangeStatusModal();
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[0].name, 'DESIGN');
      changeOrders.verifyNewRevisionInChangeStatusModalBeforeUpdate(componentsData[0].name, '1.0');
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[0].name, 'DESIGN');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[0].name, '1.0');

      // Verify the status & revision after changes reset
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[1].name, 'PROTOTYPE');
      changeOrders.verifyNewRevisionInChangeStatusModalBeforeUpdate(componentsData[1].name, '1.1');
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[1].name, 'PROTOTYPE');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[1].name, '1.0');

      // Verify the status & revision after changes reset
      changeOrders.verifyNewStatusInChangeStatusModal(componentsData[2].name, 'PRODUCTION');
      changeOrders.verifyNewRevisionInChangeStatusModalBeforeUpdate(componentsData[2].name, 'A1.1');
      changeOrders.verifyCurrentStatusInChangeStatusModal(componentsData[2].name, 'PRODUCTION');
      changeOrders.verifyCurrentRevisionInChangeStatusModal(componentsData[2].name, 'A1.0');
    })
  })
});

describe("ChangeOrder Component Status Module", {tags: ["ChangeOrder", "New_ChangeOrder"]}, () => {
  it("Should allow adding Products and Components in DESIGN status to CO", () => {
    // Create product with Design status
    const prodName = "prd-design";
    products.createAndSaveBasicProduct(prodName);

    // Create component with Design status
    const cmpData = {
      category     : "Adhesive",
      name         : "cmp-1",
      status       : constData.status.design,
      revision     : "1"
    };
    compApi.createComponent(cmpData);

    // Add design status Product and Component to changeOrder
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder(prodName);
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData.name);

    // Verify no of rows present in table
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(2);
  });

  it("Should allow adding Products and Components in PRODUCTION status to CO", () => {
    // Create product with Production status
    const prodName = "prd-production";
    products.createAndSaveBasicProduct(prodName, constData.status.production, 'A');

    // Create component with Production status
    const cmpData = {
      category     : "Adhesive",
      name         : "cmp-1",
      status       : constData.status.production,
      revision     : "1"
    };
    compApi.createComponent(cmpData);

    // Add design status Product and Component to changeOrder
    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder(prodName);
    changeOrders.searchAndCheckComponentInNewChangeOrder(cmpData.name);

    // Verify no of rows present in table
    changeOrders.verifyNoOfRowsPresentInChangeOrderTable(2);
  });
});

describe('Change Order revision Module', () => {
  it("Should show correct child revision in the Assembly tab on submitting for approval ", () => {
    const data = {
      CPN: "210-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    nav.openComponentsTab();
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseCategory(constData.electricalComponents.audio);
    components.enterComponentName('CMP_CHILD');
    components.selectStatus('DESIGN');
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    nav.openComponentsTab();
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseType('assembly');
    components.chooseCategory(constData.assemblyComponents.cableAssembly);
    components.enterComponentName('CMP_PARENT');
    components.selectStatus("DESIGN");
    components.clickOnCreate();

    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder('CMP_PARENT');
    changeOrders.checkIncludeChildrenComponents();
    changeOrders.waitforUpdateLoadingIconTodisapper();
    changeOrders.selectStatusInChangeOrderTable('920-00001', 'PROTOTYPE');
    changeOrders.selectStatusInChangeOrderTable('210-00001', 'PROTOTYPE');
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.clickOnSubmitForApproval();
    featureHelper.waitForLoadingIconToDisappear();

    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'CMP_PARENT')
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyRevisionInViewComponent('1');
    components.verifyStatusInViewComponent(constData.status.prototype);
    assembly.clickOnAssemblyTab();
    assembly.clickOnGridView();
    assembly.verifyStatusInAssemblyTable('CMP_CHILD', constData.status.prototype);
    assembly.verifyDataInAssemblyTable('210-00001', 'revision-value', '1');
    assembly.clickOnTreeView();
    assembly.verifyStatusInAssemblyTable('CMP_CHILD', constData.status.prototype);
    assembly.verifyDataInAssemblyTable('210-00001', 'revision-value', '1');
  })

  it("Should show correct child revision in the Assembly tab for  component's CO is in draft status ", () => {
    const data = {
      CPN: "210-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    nav.openComponentsTab();
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseCategory(constData.electricalComponents.audio);
    components.enterComponentName('CMP_CHILD');
    components.selectStatus('DESIGN');
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    nav.openComponentsTab();
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseType('assembly');
    components.chooseCategory(constData.assemblyComponents.cableAssembly);
    components.enterComponentName('CMP_PARENT');
    components.selectStatus("DESIGN");
    components.clickOnCreate();

    assembly.clickOnAssemblyTab();
    assembly.addComponentsToAssemblyTable(data);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    nav.openChangeOrdersTab();
    changeOrders.clickNewBtn();
    changeOrders.searchAndCheckComponentInNewChangeOrder('CMP_PARENT');
    changeOrders.checkIncludeChildrenComponents();
    changeOrders.waitforUpdateLoadingIconTodisapper();
    changeOrders.selectStatusInChangeOrderTable('920-00001', 'PROTOTYPE');
    changeOrders.selectStatusInChangeOrderTable('210-00001', 'PROTOTYPE');
    changeOrders.clickEcoIcon();
    changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());
    changeOrders.enterDescInEcoModal('ecoDesc');
    changeOrders.clickSaveDraft();
    featureHelper.waitForLoadingIconToDisappear();

    tableHelper.clickOnCell(constData.componentTableHeaders.name, 'CMP_PARENT')
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyRevisionInViewComponent('1');
    components.verifyStatusInViewComponent(constData.status.prototype);
    assembly.clickOnAssemblyTab();
    assembly.clickOnGridView();
    assembly.verifyStatusInAssemblyTable('CMP_CHILD', constData.status.prototype);
    assembly.verifyDataInAssemblyTable('210-00001', 'revision-value', '1');
    assembly.clickOnTreeView();
    assembly.verifyStatusInAssemblyTable('CMP_CHILD', constData.status.prototype);
    assembly.verifyDataInAssemblyTable('210-00001', 'revision-value', '1');
  })
});
