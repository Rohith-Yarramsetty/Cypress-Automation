import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const fakerHelper = new FakerHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, compData, approverEmail, reviewerEmail, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })

  compData = {
    name      : fakerHelper.generateComponentName(),
    status    : constData.status.production,
    revision  : 'A',
  }

  // Create a Component
  authApi.signin(email);
  navHelper.navigateToSearch();
  compApi.createComponent(compData);

  // Invite users for each role
  const emails = userApi.createUserForEachRole();
  approverEmail = emails.approversEmail;
  reviewerEmail = emails.reviewersEmail;
  userApi.acceptInvitation(approverEmail.toString());
  userApi.acceptInvitation(reviewerEmail.toString());
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Component allowed actions with respect to APPROVER role", () => {
  beforeEach(function () {
    authApi.signin(approverEmail);
    navHelper.navigateToSearch();
  })

  it('Approver is allowed to access components previous revisions', () => {
    // Go to component's view
    components.navigateToComponentViewPage(compData.name, false);

    // Verify revisions accessibility
    components.verifyHistoryIconPresent();
    components.verifyRevisionInViewComponent(compData.revision);
    cy.url().should('include', '/component/view/');
  })
})

describe("Component allowed actions with respect to REVIEWER role.", () => {
  beforeEach(function () {
    authApi.signin(reviewerEmail);
    navHelper.navigateToSearch();
  })

  it("Reviewer is allowed to navigate component's revision route", () => {
    // Go to component's view
    components.navigateToComponentViewPage(compData.name, false);

    // Verify revisions accessibility
    components.verifyHistoryIconPresent();
    components.verifyRevisionInViewComponent(compData.revision);
    cy.url().should('include', '/component/view/');
  })
})
