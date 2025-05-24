import { SignIn } from "../../pages/signin";
import { NavHelpers } from "../../helpers/navigationHelper";
import { AuthApi } from "../../api/auth";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { Integrations } from "../../pages/integrations";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const navHelper = new NavHelpers();
const authApi = new AuthApi();
const compSettings = new CompanySettingsApi();
const integrations = new Integrations();
const featureHelpers = new FeatureHelpers();
const userApi = new UsersApi();

describe("Integrations settings module", () => {

  let email, companyId, orgId;

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
    navHelper.navigateToUsers();
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it("Should go to Integrations routes from Integrations table correctly", () =>{
    const onshapeUrl = "www.durolabs.co/integration/onshape/"
    const solidWorksUrl = "www.durolabs.co/integration/solidworks/"
    const valispaceUrl = "www.durolabs.co/integration/valispace/"
    const netsuitUrl = "www.vdr.com/nexus/duro"
    const firstResonanceUrl = "www.durolabs.co"
    const ssoUrl = "www.durolabs.co/products/plm-enterprise/"

    // Click Onshape help icon and verify url
    navHelper.navigateToIntegrationsSettings();
    integrations.clickOnHelpIconForPlugin('Onshape');
    featureHelpers.verifyUrl(onshapeUrl);

    // Click Solidworks help icon and verify url
    navHelper.navigateToIntegrationsSettings();
    integrations.clickOnHelpIconForPlugin('Solidworks');
    featureHelpers.verifyUrl(solidWorksUrl);

    // Click Valisapace help icon and verify url
    navHelper.navigateToIntegrationsSettings();
    integrations.clickOnHelpIconForPlugin('Valispace');
    featureHelpers.verifyUrl(valispaceUrl);

    // Click Netsuite help icon and verify url
    navHelper.navigateToIntegrationsSettings();
    integrations.clickOnHelpIconForPlugin('Netsuite');
    featureHelpers.verifyUrl(netsuitUrl);

    // Click FirstResonance help icon and verify url
    navHelper.navigateToIntegrationsSettings();
    integrations.clickOnHelpIconForPlugin('First Resonance');
    featureHelpers.verifyUrl(firstResonanceUrl);
  })
})
