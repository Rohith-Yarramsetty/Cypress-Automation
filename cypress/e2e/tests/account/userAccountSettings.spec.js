import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Headers } from "../../pages/headers";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const header = new Headers();
const authApi = new AuthApi();
const userApi = new UsersApi();
const featureHelpers = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

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

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Avatar menu", () => {
  // Unable to stop redirection of tabs as target attribute doesn't exists
  // Cypress cannot handle unexpected multiple origins
  it('avatar menu links should open correct routes', () => {
    let base_url = Cypress.config().baseUrl;
    authApi.signin(email);
    nav.openDashboard();

    // Click on user & verify URL
    header.clickOnAvatarIcon();
    header.clickOnAvatarModalEmail();
    featureHelpers.verifyUrl(base_url + "/settings/user");

    // Click on account settings & verify URL
    header.clickOnAvatarIcon();
    header.clickOnAccountSettings();
    featureHelpers.verifyUrl(base_url + "/settings/users");

    // Click on help & verify URL
    header.clickOnAvatarIcon();
    header.clickOnHelpAndDocumentation();
    featureHelpers.verifyUrl('https://duro.zendesk.com/hc/en-us');

    // Click on submit ticket & verify URL
    nav.openDashboard();
    header.clickOnAvatarIcon();
    header.clickOnSubmitTicket();
    featureHelpers.verifyUrl('https://duro.zendesk.com/hc/en-us/requests/new');

    // Click on policy & verify URL
    nav.openDashboard();
    header.clickOnAvatarIcon();
    header.clickOnPolicy();
    featureHelpers.verifyUrl(base_url + "/legal/policy");
  })
})