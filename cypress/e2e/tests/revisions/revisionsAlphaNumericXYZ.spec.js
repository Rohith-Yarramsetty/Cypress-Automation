import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ChangeOrders } from "../../pages/changeOrders/changeOrder";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";

const nav = new Navigation();
const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const components = new Components();
const changeOrder = new ChangeOrders();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
    compSettings.updateCompanySettings(companyId, compPayloads.revSchemeType('ALPHA-NUMERIC-XYZ'));
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

describe('ChangeOrder AlphaNumeric(XYZ) Revision values with Status Changed in Component Module', () => {
  it('should set To revision correctly if initial status is DESIGN and incremented to PRODUCTION', () => {
    const compData = [
      {
        name      :  fakerHelper.generateComponentName(),
        status    :  constData.status.design,
        revision  :  '1.0',
      },
      {
        name      :  fakerHelper.generateComponentName(),
        status    :  constData.status.design,
        revision  :  'A1.0',
      }
    ]

    // Create a component
    compApi.createComponent(compData[0]);
    components.navigateToComponentEditPage(compData[0].name, false);

    // Set revision & select the status
    components.selectStatusInEditView('PRODUCTION');
    components.verifyRevisionInRevisionControlModal('A1.0');
    components.clickOnContinueInRevisionControl();
    components.clickSaveButtonInEditComponent();

    // create a component
    compApi.createComponent(compData[1]);
    components.navigateToComponentEditPage(compData[1].name, false);

    // Set revision & select the status
    components.selectStatusInEditView('PRODUCTION');
    components.verifyRevisionInRevisionControlModal('A1.0');
    components.clickOnContinueInRevisionControl();
    components.clickSaveButtonInEditComponent();

    // Add components to changeOrder
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();
    changeOrder.searchAndCheckComponentInNewChangeOrder(compData[0].name);
    changeOrder.searchAndCheckComponentInNewChangeOrder(compData[1].name);

    // Verify the next revisions
    changeOrder.verifyNewRevisionInChangeOrderTable(compData[0].name, 'A1.0');
    changeOrder.verifyNewRevisionInChangeOrderTable(compData[1].name, 'A1.0');
  })

  it('should set To revision correctly if initial status is DESIGN and incremented to PROTOTYPE', () => {
    const compData = [
      {
        name      :  fakerHelper.generateComponentName(),
        status    :  constData.status.design,
        revision  :  '1.0',
      },
      {
        name      :  fakerHelper.generateComponentName(),
        status    :  constData.status.design,
        revision  :  'A1.0',
      }
    ]

    // Create a component
    compApi.createComponent(compData[0]);
    components.navigateToComponentEditPage(compData[0].name, false);

    // Set revision & select the status
    components.selectStatusInEditView('PROTOTYPE');
    components.verifyRevisionInRevisionControlModal('1.0');
    components.clickOnContinueInRevisionControl();
    components.clickSaveButtonInEditComponent();

    // create a component
    compApi.createComponent(compData[1]);
    components.navigateToComponentEditPage(compData[1].name, false);

    // Set revision & select the status
    components.selectStatusInEditView('PROTOTYPE');
    components.verifyRevisionInRevisionControlModal('A1.0');
    components.clickOnContinueInRevisionControl();
    components.clickSaveButtonInEditComponent();

    // Add components to changeOrder
    nav.openChangeOrdersTab();
    changeOrder.clickNewBtn();
    changeOrder.searchAndCheckComponentInNewChangeOrder(compData[0].name);
    changeOrder.searchAndCheckComponentInNewChangeOrder(compData[1].name);

    // Verify the next revisions
    changeOrder.verifyNewRevisionInChangeOrderTable(compData[0].name, '1.0')
    changeOrder.verifyNewRevisionInChangeOrderTable(compData[1].name, 'A1.0')
  })

  it('should set To revision correctly if initial status is PROTOTYPE and incremented to PRODUCTION', () => {
    const compData = {
      name      :  fakerHelper.generateComponentName(),
      status    :  constData.status.prototype,
      revision  :  '1.0',
    }

    // Create a component
    compApi.createComponent(compData);
    components.navigateToComponentEditPage(compData.name, false);

    // Set revision & select the status
    components.selectStatusInEditView('PRODUCTION');
    components.verifyRevisionInRevisionControlModal('A1.0');
    components.clickOnContinueInRevisionControl();
    components.clickSaveButtonInEditComponent();

    // Verify the next revision
    components.clickChangeOrderIconAfterModifyingCmpInViewCmp();
    components.clickAddToChangeOrderInViewComponent()
    featureHelper.waitForLoadingIconToDisappear();
    changeOrder.verifyNewRevisionInChangeOrderTable(compData.name, 'A1.0');
  })
})

describe('AlphaNumeric Revision Module with (XYZ) format', () => {
  it('document should work correctly with default revision for opentron', () => {
    // Navigate to components tab
    nav.openComponentsTab();

    const compData = {
      name       :   fakerHelper.generateComponentName(),
      status     :   constData.status.prototype,
      category   :   '(410) Adhesive',
      revision   :   '1.0',
    }

    // Create a component & open edit view
    components.clickonCreateManually();
    components.enterComponentName(compData.name);
    components.chooseCategory(compData.category);
    components.selectStatus(compData.status);
    components.enterRevision(compData.revision);
    components.clickOnCreate();

    // Upload the document and verify status & revision
    components.uploadDocumentInEditView('apple.jpg');
    components.selectStatusInDocumentsTab('apple.jpg', 'PRODUCTION');
    components.verifyRevisionInDocumentsTab('apple.jpg', 'A');

    // Verify the tooltip with PRODUCTION status
    components.enterRevisionInDocumentsTab('apple.jpg', 'AA');
    components.verifyRevisionTooltipInDocumentsTab('apple.jpg', 'Should be less than 2 characters');

    // Verify the revision with OBSOLETE status
    components.enterRevisionInDocumentsTab('apple.jpg', 'A');
    components.selectStatusInDocumentsTab('apple.jpg', 'OBSOLETE');
    components.verifyRevisionInDocumentsTab('apple.jpg', 'A');

    // Verify the tooltip with OBSOLETE status
    components.enterRevisionInDocumentsTab('apple.jpg', 'AA');
    components.verifyRevisionTooltipInDocumentsTab('apple.jpg', 'Should be less than 2 characters');

    // Verify the revision with DESIGN status
    components.selectStatusInDocumentsTab('apple.jpg', 'DESIGN');
    components.verifyRevisionInDocumentsTab('apple.jpg', '1');

    // Verify the tooltip with DESIGN status
    components.enterRevisionInDocumentsTab('apple.jpg', 'AA');
    components.verifyRevisionTooltipInDocumentsTab('apple.jpg', 'Should be less than 2 characters');
  })
})
