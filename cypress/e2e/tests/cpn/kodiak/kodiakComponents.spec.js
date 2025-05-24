import { SignIn } from "../../../pages/signin";
import { AuthApi } from "../../../api/auth";
import { Components } from "../../../pages/components/component";
import { Navigation } from "../../../pages/navigation";
import constData from "../../../helpers/pageConstants";
import { NavHelpers } from "../../../helpers/navigationHelper";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { ImportFromFile } from "../../../pages/components/importFromFile";
import { TableHelpers } from "../../../helpers/tableHelper";
import { ChangeOrders } from "../../../pages/changeOrders/changeOrder";
import { ComponentApi } from "../../../api/componentApi";
import { UsersApi } from "../../../api/userApi";
import { CompanySettingsApi } from "../../../api/companySettingsApi";
import { FeatureHelpers } from "../../../helpers/featureHelper";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelpers = new TableHelpers();
const changeOrders = new ChangeOrders();
const featureHelper = new FeatureHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

describe("Kodiak tests - Components", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateKodiakUserSettings(companyId);
    })
  })

  beforeEach(function () {
    authApi.signin(email)
    navHelper.navigateToSearch();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context("Component status and revision modules", () => {
    beforeEach(function () {
      // Navigate to Componets tab
      nav.openComponentsTab();

      // Creating component manually
      components.clickonCreateManually();
      components.chooseType('off the shelf');
      components.chooseCategory('Capacitor');
      components.enterComponentName(fakerHelper.generateProductName())
    })

    it('Component: Should not allow Q, I, O values as revision for all statuses', () => {
      // Design Status: Assert revision with Q, I, O
      components.selectStatus(constData.status.design);
      components.enterRevision('Q');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('I');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('O');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();

      // Prototype Status: Assert revision with Q, I, O
      components.selectStatus(constData.status.prototype);
      components.enterRevision('Q');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('I');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('O');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();

      // Production Status: Assert revision with Q, I, O
      components.selectStatus(constData.status.production);
      components.enterRevision('Q');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('I');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('O');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();

      // Obselete Status: Assert revision with Q, I, O
      components.selectStatus(constData.status.obsolete);
      components.enterRevision('Q');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('I');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
      components.enterRevision('O');
      components.verifyRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      components.verifyCreateBtnDisabled();
    })
  })

  context("Import from file", () => {
    it("Import file containing components having revisions: 1 , A, 99A, 10Z", () => {
      // Navigate to Componets tab
      nav.openComponentsTab();

      // Delete the import components if exists in component library
      components.deleteAllComponents('Cmp1');
      components.deleteAllComponents('Cmp2');
      components.deleteAllComponents('Cmp3');
      components.deleteAllComponents('Cmp4');
      nav.openComponentsTab();
      components.verifyCmpLibraryPageVisible();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      importFromFile.uploadFile('customCmpFile.xlsx');

      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.verifyNecessaryLabelsMapped('Revision', 'revision');
      importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();
      importFromFile.verifyImportStatusSucceed(4);
      components.verifyCmpLibraryPageVisible();

      // Verify revision values in table
      tableHelpers.assertTextInCell(constData.componentTableHeaders.revision, 'Cmp1', 'A');
      tableHelpers.assertTextInCell(constData.componentTableHeaders.revision, 'Cmp2', '99A');
      tableHelpers.assertTextInCell(constData.componentTableHeaders.revision, 'Cmp3', '10Y');
      tableHelpers.assertTextInCell(constData.componentTableHeaders.revision, 'Cmp4', 1);
    })
  })

  context("Update revisions of Components in change order", () => {
    it('Update the Minor Revision in CO for a component with status Production', () => {
      const compData = {
        category: "Fabricated 3D Printed",
        name: fakerHelper.generateProductName(),
        revision: "1A",
        status: constData.status.production
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1B');

      // Change Revision with Minor change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMinorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1B');

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1B');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent('1B');
    })

    it('Update the Major Revision in CO for a component with status Production', () => {
      const compData = {
        category: "Battery Pack",
        name: fakerHelper.generateProductName(),
        revision: "1A",
        status: constData.status.production
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1B');

      // Change Revision with Major change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMajorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 2);

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 2);
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent(2);
    })

    it('Update the Custom Revision in CO for a component with status Production', () => {
      const compData = {
        category: "Fabricated Molded Plastic",
        name: fakerHelper.generateProductName(),
        revision: "1A",
        status: constData.status.production
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1B');

      // Change Revision with Custom Change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkCustomRevisionType();
      changeOrders.enterCustomRevision('3B');
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '3B');

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '3B');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent('3B');
    })

    it('Update the Minor Revision in CO for a component with status Prototype', () => {
      const compData = {
        category: "Fabricated 3D Printed",
        name: fakerHelper.generateProductName(),
        revision: "1",
        status: constData.status.prototype
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1A');
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);

      // Change Revision with Minor change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMinorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1A');

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1A');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent('1A');
    })

    it('Update the Major Revision in CO for a component with status Prototype', () => {
      const compData = {
        category: "Battery Pack",
        name: fakerHelper.generateProductName(),
        revision: "1",
        status: constData.status.prototype
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1A');

      // Change Revision with Major change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMajorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 2);

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 2);
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent(2);
    })

    it('Update the Custom Revision in CO for a component with status Prototype', () => {
      const compData = {
        category: "Fabricated Molded Plastic",
        name: fakerHelper.generateProductName(),
        revision: "1",
        status: constData.status.prototype
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1A');

      // Change Revision with Custom Change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkCustomRevisionType();
      changeOrders.enterCustomRevision('3B');
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '3B');

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '3B');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent('3B');
    })

    it('Update the Minor Revision in CO for a component with status Obsolete', () => {
      const compData = {
        category: "Fabricated 3D Printed",
        name: fakerHelper.generateProductName(),
        revision: "A",
        status: constData.status.obsolete
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 'B');

      // Change Revision with Minor change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMinorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 'B');

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 'B');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent('B');
    })

    it('Update the Major Revision in CO for a component with status Obsolete', () => {
      const compData = {
        category: "Battery Pack",
        name: fakerHelper.generateProductName(),
        revision: "A",
        status: constData.status.obsolete
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 'B');

      // Change Revision with Major change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkMajorRevisionType();
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 1);

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 1);
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent(1);
    })

    it('Update the Custom Revision in CO for a component with status Obsolete', () => {
      const compData = {
        category: "Fabricated Molded Plastic",
        name: fakerHelper.generateProductName(),
        revision: "A",
        status: constData.status.obsolete
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, 'B');

      // Change Revision with Custom Change
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkCustomRevisionType();
      changeOrders.enterCustomRevision('99Z');
      changeOrders.clickApplyBtnInChangeRevisionModal();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '99Z');

      // Approve the CO & verify Revision
      changeOrders.approveNewChangeOrder();
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '99Z');
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.verifyRevisionInViewComponent('99Z');
    })

    it('Update the Revision in CO for a component with status Design and Assert the error', () => {
      const compData = {
        category: "Fabricated 3D Printed",
        name: fakerHelper.generateProductName(),
        revision: "1A",
        status: constData.status.design
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to change order
      nav.openChangeOrdersTab();
      changeOrders.clickNewBtn();
      featureHelper.waitForLoadingIconToDisappear();
      changeOrders.searchAndCheckComponentInNewChangeOrder(compData.name);
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify Revision & Status and Error
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1A');
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
      changeOrders.verifyErrorIconInChangeOrderTable(compData.name);
    })

    it('Verify Custom revision tooltip for component in change order', () => {
      const compData = {
        category: "Fabricated Molded Plastic",
        name: fakerHelper.generateProductName(),
        revision: "1",
        status: constData.status.prototype
      }

      // Create a Component
      compApi.createComponent(compData);

      // Add Component to CO
      nav.openComponentsTab();
      tableHelpers.clickOnCell(constData.componentTableHeaders.name, compData.name);
      components.clickOnChangeOrderIconInViewComponent();
      changeOrders.enterNameInEcoModal(fakerHelper.generateEcoName());

      // Verify next Revision
      changeOrders.verifyNextRevisionInChangeOrderTable(compData.name, '1A');

      // Change Revision with Custom Change & verify Tooltip
      changeOrders.clickOnRevisionActionIcon();
      changeOrders.checkCustomRevisionType();
      changeOrders.clearCustomRevision();
      changeOrders.verifyCustomRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      changeOrders.verifyApplyBtnDisabled();
      changeOrders.enterCustomRevision('Q');
      changeOrders.verifyCustomRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      changeOrders.verifyApplyBtnDisabled();
      changeOrders.enterCustomRevision('I');
      changeOrders.verifyCustomRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      changeOrders.verifyApplyBtnDisabled();
      changeOrders.enterCustomRevision('O');
      changeOrders.verifyCustomRevisionTooltipPresent("Revision should be between (1..99) or (0A..99Z)");
      changeOrders.verifyApplyBtnDisabled();
      changeOrders.verifyStatusInChangeOrderTable(compData.name, compData.status);
    })
  })
})
