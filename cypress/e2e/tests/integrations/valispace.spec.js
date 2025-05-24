import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { FeatureHelpers } from "../../helpers/featureHelper";
import constData from "../../helpers/pageConstants";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Integrations } from "../../pages/integrations";
import componentSelectors from "../../selectors/components/component";
import { IntegrationsApi } from "../../api/integrationsApi";
import selectors from "../../selectors/components/component";
import { FakerHelpers } from "../../helpers/fakerHelper";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const components = new Components();
const featureHelpers = new FeatureHelpers();
const tableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const integrations = new Integrations();
const integrationsApi = new IntegrationsApi();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe.skip("Valispace Integration tests", () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
      compSettings.updateCompanySettings(companyId, compPayloads.enableValispace);
    })
    integrations.connectValispace();
    components.importAllComponentsFromValispaceProject({
      workspaceName: 'Training Workspace',
      projectName: 'E2Es',
      categories: ['Bolt', 'MBOM', 'Bolt', 'Bolt'],
    });
  });

  beforeEach(() => {
    authApi.signin(email);
    integrationsApi.getValispaceAccessToken();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it("Edited Mass of component should reflect in valispace", () => {
    navHelper.navigateToSearch();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, "Vali_cmp_1");
    featureHelpers.waitForLoadingIconToDisappear();
    components.clickEditIcon();
    featureHelpers.waitForLoadingIconToDisappear();
    const expectedMass = fakerHelper.generateRandomMassValue();
    cy.get(componentSelectors.editComponent.mass).clear().type(expectedMass);
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    cy.get(selectors.viewComponent.eidValue)
      .invoke('text').then($eid => {
        components.assertValispaceMass($eid, expectedMass);
      });
  });

  it('Sum of edited mass of assembly children should reflect correctly in valispace', () => {
    let expectedTotalMass = 0;
    // For first child component
    const expectedMass = fakerHelper.generateRandomMassValue();
    expectedTotalMass = expectedMass;
    navHelper.navigateToSearch();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, "Vali_cmp_2");
    featureHelpers.waitForLoadingIconToDisappear();
    components.clickEditIcon();
    featureHelpers.waitForLoadingIconToDisappear();
    cy.get(componentSelectors.editComponent.mass).clear().type(expectedMass);
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    cy.get(selectors.viewComponent.eidValue)
      .invoke('text').then($eid => {
        components.assertValispaceMass($eid, expectedMass);
      });

    // For second child component
    const expectedMass2 = fakerHelper.generateRandomMassValue();
    expectedTotalMass += expectedMass2;
    navHelper.navigateToSearch();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, "Vali_cmp_3");
    featureHelpers.waitForLoadingIconToDisappear();
    components.clickEditIcon();
    featureHelpers.waitForLoadingIconToDisappear();
    cy.get(componentSelectors.editComponent.mass).clear().type(expectedMass2);
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    cy.get(selectors.viewComponent.eidValue)
      .invoke('text').then($eid => {
        components.assertValispaceMass($eid, expectedMass2);
      });

    // For Assembly
    navHelper.navigateToSearch();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, "Vali_asm_1");
    featureHelpers.waitForLoadingIconToDisappear();
    cy.get(selectors.viewComponent.massValue).invoke('text').should($mass => {
      expect(parseInt($mass)).to.eq(parseInt(expectedTotalMass));
    });
    cy.get(selectors.viewComponent.eidValue)
      .invoke('text').then($eid => {
        components.assertValispaceMass($eid, expectedTotalMass, 1);
      });
  })
});
