import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { ComponentApi } from "../../api/componentApi";
import { Sourcing } from "../../pages/components/sourcing";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const sourcing = new Sourcing();
const compApi = new ComponentApi;
const navHelper = new NavHelpers();
const components = new Components();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId, authorName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id});
  authorName = user.fullName;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
  compApi.createComponent({ name     : 'Child',
                            status   : 'DESIGN',
                            category : 'Screw',
                            revision : '1' });
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

context('Component Edit SOURCING Module', () => {
  it.skip('Should display errors on sourcing tab when component status is PROTOTYPE', () => {
    components.navigateToComponentEditPage('438-00001', false);
    components.selectStatusInEditView('PROTOTYPE');
    components.clickOnContinueInRevisionControl();

    // Verify the errors without manufacturer data
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.verifyErrorCountInSourcingTab(6);

    // Verify the errors only with manufacturer data
    sourcing.enterManufacturerData(1, { mpn          : 'mpn1',
                                        description  : 'desc1',
                                        manufacturer : 'man1' });
    sourcing.verifyErrorCountInSourcingTab(4);

    // Verify the errors without quote data
    sourcing.enterDistributorData(1, 1, { dpn         : 'dpn1',
                                          distributor : 'dist1',
                                          description : 'desc1' });
    sourcing.verifyErrorCountInSourcingTab(2);

    // Verify the errors not exists
    sourcing.enterQuoteData(1, 1, 1, { leadTime    : '2',
                                       unitPrice   : '0.2500',
                                       minQuantity : '1'});
    sourcing.verifySourcingTabErrorNotExists();
  })
})
