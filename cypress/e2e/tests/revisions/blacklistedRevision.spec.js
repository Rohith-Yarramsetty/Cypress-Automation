import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { ComponentApi } from "../../api/componentApi";
import { Products } from "../../pages/products/products";
import { TableHelpers } from "../../helpers/tableHelper";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Assembly } from "../../pages/components/assembly";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const products = new Products();
const assembly = new Assembly();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, orgId, companyId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
    compSettings.updateMerlinlabsSettings(companyId);
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.resetCompany(companyId)
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Blacklist Revisions Module', {defaultCommandTimeout: 90000}, () => {
  it('Verify the next revision of the component with status design', () => {
    const compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.design,
      revision : 'H',
    }

    // Create a Component
    compApi.createComponent(compData);
    nav.openComponentsTab();
    components.enterSearchTerm(compData.name);

    // Verify the next revision
    tableHelper.clickOnCell(constData.componentTableHeaders.name, compData.name);
    components.verifyTheNextRevison('J');

    // Enter the revision & Verify the next revision
    components.enterRevisionInSaveAsRevisionModal('N');
    components.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyTheNextRevison('P');

    // Enter the revision & Verify the next revision
    components.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyTheNextRevison('R');

    // Enter the revision & Verify the next revision
    components.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyTheNextRevison('T');

    // Enter the revision & Verify the next revision
    components.enterRevisionInSaveAsRevisionModal('W');
    components.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyTheNextRevison('Y');

    // Enter the revision & Verify the next revision
    components.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    components.verifyTheNextRevison('1');
  })

  it('Verify the next revision of the product with status design', () => {
    const prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.design,
      revision : 'H',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next revision
    products.verifyTheNextRevison('J');

    // Enter the revision & Verify the next revision
    products.enterRevisionInSaveAsRevisionModal('N');
    products.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    products.verifyTheNextRevison('P');

    // Enter the revision & Verify the next revision
    products.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    products.verifyTheNextRevison('R');

    // Enter the revision & Verify the next revision
    products.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    products.verifyTheNextRevison('T');

    // Enter the revision & Verify the next revision
    products.enterRevisionInSaveAsRevisionModal('W');
    products.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    products.verifyTheNextRevison('Y');

    // Enter the revision & Verify the next revision
    products.clickContinueBtnInSaveAsRevisionModal();
    featureHelper.waitForLoadingIconToDisappear();
    products.verifyTheNextRevison('1');
  })

  it('Verify the next changeOrder revision of the component with status Production', () => {
    let compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'H',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'J');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'N',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'P');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'P',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'R');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'R',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'T');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'W',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'Y');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'Y',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'AA');
  })

  it('Verify the next changeOrder revision of the product with status Production', () => {
    let prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'H',
    };

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'J');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'N',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'P');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'P',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'R');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'R',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'T');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'W',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'Y');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'Y',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'AA');
  })

  it('Verify the skipped revisions acceptence in revision control modal for components', () => {
    const compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.design,
      revision : 'A',
    }

    // Create the Component
    compApi.createComponent(compData);
    components.navigateToComponentViewPage(compData.name, false);

    // Update the status
    components.clickEditIcon();
    components.selectStatusInEditView(constData.status.production);
    components.verifySwitchToRevisionControlModalTitle();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('I');
    components.verifyRevisionTooltipInRevisionControlModal('Revision should be between (A..Y) or (AA..YY)');
    components.verifyContinueBtnDisabledInRevisionControlModal();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('O');
    components.verifyRevisionTooltipInRevisionControlModal('Revision should be between (A..Y) or (AA..YY)');
    components.verifyContinueBtnDisabledInRevisionControlModal();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('Q');
    components.verifyRevisionTooltipInRevisionControlModal('Revision should be between (A..Y) or (AA..YY)');
    components.verifyContinueBtnDisabledInRevisionControlModal();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('S');
    components.verifyRevisionTooltipInRevisionControlModal('Revision should be between (A..Y) or (AA..YY)');
    components.verifyContinueBtnDisabledInRevisionControlModal();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('X');
    components.verifyRevisionTooltipInRevisionControlModal('Revision should be between (A..Y) or (AA..YY)');
    components.verifyContinueBtnDisabledInRevisionControlModal();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('Z');
    components.verifyRevisionTooltipInRevisionControlModal('Revision should be between (A..Y) or (AA..YY)');
    components.verifyContinueBtnDisabledInRevisionControlModal();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('A');
    components.verifyRevisionTooltipInRevisionControlModal();
    components.verifyContinueBtnEnabledInRevisionControlModal();

    // Verify the revision acceptence criteria
    components.enterRevisionInRevisionControlModal('Y');
    components.verifyRevisionTooltipInRevisionControlModal();
    components.verifyContinueBtnEnabledInRevisionControlModal();
  })

  it('Verify the skipped revisions acceptence in bulk status modal for products', () => {
    let compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.prototype,
      revision : 'A',
    }

    // Create a component & get cpn value
    compApi.createComponent(compData);
    nav.openComponentsTab();
    components.enterSearchTerm(compData.name);
    featureHelper.getCpnValueFromTable(compData.name, 1).as('cpn1');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'A',
    }

    // Create a component & get cpn value
    compApi.createComponent(compData);
    nav.openComponentsTab();
    components.enterSearchTerm(compData.name);
    featureHelper.getCpnValueFromTable(compData.name, 1).as('cpn2');

    // Create a product
    const prodname = fakerHelper.generateProductName();
    products.createAndSaveBasicProduct(prodname);

    // Add assembly components
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();

    cy.get('@cpn1').then((cpnValue) => {
      compData = {
        CPN: cpnValue,
        Quantity: 2,
      }
      assembly.addComponentsToAssemblyTable(compData);
    })

    cy.get('@cpn2').then((cpnValue) => {
      compData = {
        CPN: cpnValue,
        Quantity: 3,
      }
      assembly.addComponentsToAssemblyTable(compData);
    })

    products.clickSaveButtonInEditProduct();

    // Update the status
    products.clickEditIcon();
    products.selectStatusInEditView(constData.status.production);

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('I');
    products.verifyRevisionTooltipInChangeStatusModal('Revision should be between (A..Y) or (AA..YY)');
    products.verifyContinueBtnDisabledInChangeStatusModal();

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('O');
    products.verifyRevisionTooltipInChangeStatusModal('Revision should be between (A..Y) or (AA..YY)');
    products.verifyContinueBtnDisabledInChangeStatusModal();

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('Q');
    products.verifyRevisionTooltipInChangeStatusModal('Revision should be between (A..Y) or (AA..YY)');
    products.verifyContinueBtnDisabledInChangeStatusModal();

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('S');
    products.verifyRevisionTooltipInChangeStatusModal('Revision should be between (A..Y) or (AA..YY)');
    products.verifyContinueBtnDisabledInChangeStatusModal();

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('X');
    products.verifyRevisionTooltipInChangeStatusModal('Revision should be between (A..Y) or (AA..YY)');
    products.verifyContinueBtnDisabledInChangeStatusModal();

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('Z');
    products.verifyRevisionTooltipInChangeStatusModal('Revision should be between (A..Y) or (AA..YY)');
    products.verifyContinueBtnDisabledInChangeStatusModal();

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('A');
    products.verifyRevisionTooltipInChangeStatusModal('');
    products.verifyContinueBtnEnabledInChangeStatusModal();

    // Verify the revision acceptence criteria
    products.enterRevisionInChangeStatusModal('Y');
    products.verifyRevisionTooltipInChangeStatusModal('');
    products.verifyContinueBtnEnabledInChangeStatusModal();
  })
})
