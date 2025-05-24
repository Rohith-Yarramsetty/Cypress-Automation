import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Headers } from "../../pages/headers";
import { TableHelpers } from "../../helpers/tableHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { FeatureHelpers } from "../../helpers/featureHelper";

const signin = new SignIn();
const nav = new Navigation();
const changeOrders = new ChangeOrders();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const compApi = new ComponentApi();
const headers = new Headers();
const tableHelper = new TableHelpers();
const components = new Components();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const importFromFile = new ImportFromFile();
const featureHelper = new FeatureHelpers();

describe("ChangeOrder workflow testcases", {tags: ["ChangeOrder", "ChangeOrder_Workflow"]}, () => {

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

  context("ChangeOrder edit path workflow Module", () => {
    it('should allow edit -> save -> delete path', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        ecoName: fakerHelper.generateEcoName(),
      }

      // Create component using API
      compApi.createComponent(componentData);

      // Navigate to ChangeOrder, click and enter the details in ECO
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(componentData.ecoName);
      changeOrders.enterDescInEcoModal('ecoDesc');

      // Add the created component to CO and save as draft
      changeOrders.searchAndCheckComponentInNewChangeOrder(componentData.name);
      changeOrders.clickSaveDraft();

      // Edit CO, change ECO to MCO and save as draft
      changeOrders.clickOnEditInViewChangeOrder();
      changeOrders.clickMcoIcon();
      changeOrders.clickSaveDraft();

      // Delete the change order and verify CO is not present in the table
      changeOrders.clickOnDeleteInViewChangeOrder()
      changeOrders.confirmDelete();
      headers.enterSearchTerm(componentData.ecoName);
      tableHelper.assertRowNotPresentInTable(constData.changeOrders.name, componentData.ecoName );
    })

    it('should allow edit -> save -> edit -> save path', ()=>{  
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        ecoName: fakerHelper.generateEcoName(),
      }

      // Create component using API
      compApi.createComponent(componentData);

      // Navigate to ChangeOrder, click and enter the details in ECO
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(componentData.ecoName);
      changeOrders.enterDescInEcoModal('ecoDesc');

      // Add the created component to CO and save as draft
      changeOrders.searchAndCheckComponentInNewChangeOrder(componentData.name);
      changeOrders.clickSaveDraft();

      // Edit CO, change ECO to MCO and save as draft
      changeOrders.clickOnEditInViewChangeOrder();
      changeOrders.clickMcoIcon();
      changeOrders.clickSaveDraft();

      // Verify the Draft status
      changeOrders.assertDraftStatus();
    })
  })

  context("ChangeOrder reject path workflow Module", () => {
    beforeEach(function () {
      const componentData = {
        category: "Capacitor",
        name: fakerHelper.generateProductName(),
        status: constData.status.prototype,
        ecoName: fakerHelper.generateEcoName(),
      }

      // Create component using API
      compApi.createComponent(componentData);
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, componentData.name)
      components.clickOnChangeOrderIconInViewComponent();

      // Navigate to ChangeOrder, click and enter the details in ECO
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal(componentData.ecoName);
      changeOrders.enterDescInEcoModal('ecoDesc');

      // Click on submit and then reject
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickRejectBtn();
      changeOrders.confirmRejection();
      changeOrders.assertOpenStatus();
      changeOrders.assertRejectedChangeOrder();
    })

    it('should allow reject -> close path', ()=>{  
      changeOrders.clickOnClose();
      changeOrders.confirmClosedStatus();
      changeOrders.verifyClosedStatusOptnwithRejection();
    })

    it('should allow reject -> edit -> close path', ()=>{ 
      changeOrders.clickEditIcon();
      changeOrders.clickMcoIcon();
      changeOrders.clickOnSubmitForApproval();
      changeOrders.assertOpenStatus();
      changeOrders.clickOnClose();
      changeOrders.confirmCloseOnModal();
      changeOrders.assertNoneBtn();
    })

    it('should allow reject -> edit -> approve path', ()=>{  
      changeOrders.clickEditIcon();
      changeOrders.clickOnSubmitForApproval();
      changeOrders.assertOpenStatus();
      changeOrders.clickApproveBtn();
      changeOrders.confirmAprroval();
      changeOrders.verifyClosedStatusOptnwithApproval();
    })

    it('should allow reject -> edit -> reject path', ()=>{  
      changeOrders.clickEditIcon();
      changeOrders.clickMcoIcon();
      changeOrders.clickOnSubmitForApproval();
      changeOrders.clickRejectBtn();
      changeOrders.confirmRejection();
      changeOrders.verifyRejectedBtnAndBadge();
    })
  })

  context("ChangeOrder complex path workflow Module", () => {
    it('should allow to close after single approve for Unanimous', ()=>{  
      // Navigate to Componets tab
      nav.openComponentsTab();

      // Import Component from file
      importFromFile.clickOnImportFromFile();
      importFromFile.uploadFile('15a.new_component-for-co.xlsx');
      importFromFile.clickOnContinue();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();
      importFromFile.verifyImportStatusSucceed(4);

      // Navigate to ChangeOrder, click and enter the details in ECO
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      changeOrders.clickEcoIcon();
      changeOrders.enterNameInEcoModal("eco");
      changeOrders.enterDescInEcoModal('ecoDesc');

      // Add the created component to CO and submit for approval
      changeOrders.searchAndCheckComponentInNewChangeOrder("cap one");
      changeOrders.searchAndCheckComponentInNewChangeOrder("cap two");
      changeOrders.searchAndCheckComponentInNewChangeOrder("cap three");
      changeOrders.clickApproverList();
      changeOrders.checkApproverTypeCheckBx('Unanimous');
      changeOrders.verifyApproverTypeCheckBxChecked('Unanimous');
      changeOrders.clickOnSubmitForApproval();
      featureHelper.waitForLoadingIconToDisappear();

      // Verify the open status
      changeOrders.assertOpenStatus();

      // Close the CO and Verify the None button
      changeOrders.clickOnClose();
      changeOrders.confirmClose();
      changeOrders.assertNoneBtn();
    })
  })
})
