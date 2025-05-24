import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Headers } from "../../pages/headers";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Users } from "../../pages/accountSettings/users";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";

const user = new Users();
const signin = new SignIn();
const nav = new Navigation();
const header = new Headers();
const authApi = new AuthApi();
const userApi = new UsersApi();
const faker = require('faker');
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const tableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();
const featureHelpers = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

describe("Account settings - users testcases", () => {

  let email, companyId, orgId;

  beforeEach(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    email = user.email;
    user.orgData.then(res => {orgId = res.body.org_id})
    signin.signin(email);
    userApi.getCurrentUser().then(res => {companyId = res.body.data.company})
    navHelper.navigateToUsers();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context('New user module', () => {
    it('Add a new user', () =>{
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = fakerHelper.generateMailosaurEmail(firstName, lastName);
      const jobTitle = "Test Engineer";
      const role = "User";
      const groupName = "QA";

      // Create user
      user.clickOnNew();
      user.enterFirstName(firstName);
      user.enterLastName(lastName);
      user.enterEmail(email);
      user.enterJobTitle(jobTitle);
      user.selectTheRole(role);
      user.checkTheGroup(groupName);
      user.clickOnSave();

      // Verify created user
      user.verifyUsersTable(firstName+' '+lastName, email.toLowerCase(), role.toUpperCase(), jobTitle, groupName, "Invited...");
    })

    it('Add a new user and delete the user', () =>{
      const firstName = faker.name.firstName();
      const lastName = faker.name.lastName();
      const email = fakerHelper.generateMailosaurEmail(firstName, lastName);
      const jobTitle = "Test Engineer";
      const role = "User";
      const groupName = "QA";

      // Create user and verify
      user.createUser(firstName, lastName, email, jobTitle, role, groupName);
      user.verifyUsersTable(firstName+' '+lastName, email.toLowerCase(), role.toUpperCase(), jobTitle, groupName, "Invited...");

      // Delete user and verify
      user.deleteTheUserFromTable(email.toLowerCase());
      user.verifyUserNotPresent(email.toLowerCase());
    })

    it('Inviting an existing user should not be allowed at new user modal', () => {
      // Navigate to users page
      navHelper.navigateToUsers();
      featureHelpers.waitForLoadingIconToDisappear();
      user.clickOnNew();
      user.enterFirstName(faker.name.firstName());
      user.enterLastName(faker.name.lastName());

      // Enter invalid email
      user.enterEmail("Rohith_Yarramsetty");
      user.verifyEmailTooltipPresent('Value should be of type Email');
      user.verifySaveBtnDisabled();

      // Enter existing user email
      user.enterEmail(email);
      user.verifyEmailTooltipPresent('User already exists');
      user.verifySaveBtnDisabled();

      // Enter new user email
      user.enterEmail(fakerHelper.generateMailosaurEmail());
      user.clickOnSave();
    })
  })

  it("user can add multiple users in succession", () => {
    let max_users = 4;

    for (let i=0; i<max_users; i++)
    {
      let firstName = faker.name.firstName();
      let lastName = faker.name.lastName();
      let email = fakerHelper.generateMailosaurEmail(firstName, lastName);
      let jobTitle = "Test Engineer";
      let role = "User";
      let groupName = "QA";

      user.createUser(firstName, lastName, email, jobTitle, role, groupName)
    }
    user.verifyNoOfRowsPresentInUsersTable(max_users);
  })

  it('User title longer than 40 characters should not be permitted to create new user', () =>{
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = fakerHelper.generateMailosaurEmail(firstName, lastName);

    // Create user
    user.clickOnNew();
    user.enterFirstName(firstName);
    user.enterLastName(lastName);
    user.enterEmail(email);
    user.enterJobTitle(fakerHelper.getRandomStringOfCharacters(41));
    user.verifyTitleTooltipPresent('Should be less than 41 characters')
    user.verifySaveBtnDisabled();
  })

  it('Invalid emails should not be permitted to create new user', () =>{
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();

    // Create user
    user.clickOnNew();
    user.enterFirstName(firstName);
    user.enterLastName(lastName);
    user.enterEmail(fakerHelper.getRandomStringOfCharacters(10));
    user.enterJobTitle('Test Engineer');
    user.verifyEmailTooltipPresent('Value should be of type Email')
    user.verifySaveBtnDisabled();
  })

  it('Invalid user first name should not be permitted to create new user', () =>{
    const firstName = faker.name.lastName();
    const lastName = faker.name.lastName();
    const email = fakerHelper.generateMailosaurEmail(firstName, lastName);

    // Create user
    user.clickOnNew();
    user.enterLastName(lastName);
    user.enterEmail(email);
    user.enterJobTitle("Test Engineer");
    user.enterFirstName(fakerHelper.getRandomStringOfCharacters(21));
    user.verifyFirstNameTooltipPresent('Should be less than 21 characters')
    user.verifySaveBtnDisabled();
  })

  it('Invalid user last name should not be permitted to create new user', () =>{
    const firstName = faker.name.lastName();
    const lastName = faker.name.lastName();
    const email = fakerHelper.generateMailosaurEmail(firstName, lastName);

    // Create user
    user.clickOnNew();
    user.enterFirstName(firstName);
    user.enterEmail(email);
    user.enterJobTitle("Test Engineer");
    user.enterLastName(fakerHelper.getRandomStringOfCharacters(21));
    user.verifyLastNameTooltipPresent('Should be less than 21 characters')
    user.verifySaveBtnDisabled();
  })

  context("Component allowed actions with respect to USER role.", () => {
    beforeEach(function () {
      const UserData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "User",
        groupName : "QA"
      }

      const cmpData = {
        category: "Charger",
        name: "Cmp-1",
        status: constData.status.production,
        revision: 'A'
      }

      let UserEmail = fakerHelper.generateMailosaurEmail(UserData.firstName, UserData.lastName);

      // Go to users settings
      navHelper.navigateToUsers();

      // Create user and sign out from site admin credentials
      user.createUser(UserData.firstName, UserData.lastName, UserEmail, UserData.jobTitle, UserData.role, UserData.groupName)

      // Navigate to Component tab & Create component
      nav.openComponentsTab();
      compApi.createComponent(cmpData);
      authApi.signOut();

      // Sign in with User credentials
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(UserEmail);
      authApi.signin(UserEmail);
      navHelper.navigateToSearch();
    })

    it("User is allowed to see all the action icons", () =>{
      // Go to components tab and click on created component
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, "213-00001");

      // Verify User is allowed to see all the action icons
      components.getEditIcon().should('exist');
      components.getDeleteIcon().should('exist');
      components.getWhereUsedIcon().should('exist');
      components.getDuplicateIcon().should('exist');
      components.getHistoryIcon().should('exist');
      components.getExportIcon().should('exist');
    })

    it("User is allowed to navigate all component's route", () =>{
      let searchUrl = '/search/'
      let viewComponentPage = '/component/view/'
      let editComponentPage = '/component/edit/'

      // Verify User is  allowed to navigate component's route
      navHelper.verifySpecifiedPathIsAccessIble(searchUrl);
      navHelper.verifySpecifiedPathIsAccessIble(viewComponentPage);
      navHelper.verifySpecifiedPathIsAccessIble(editComponentPage);
    })
  })

  context("Component allowed actions with respect to Adminstrator role.", () => {
    beforeEach(function () {
      const adminstratorData = {
        firstName : faker.name.firstName(),
        lastName : faker.name.lastName(),
        jobTitle : "Test Engineer",
        role : "Administrator",
        groupName : "QA"
      }

      const cmpData = {
        category: "Charger",
        name: "Cmp-1",
        status: constData.status.production,
        revision: 'A'
      }

      let adminstratorEmail = fakerHelper.generateMailosaurEmail(adminstratorData.firstName, adminstratorData.lastName);

      // Go to users settings
      navHelper.navigateToUsers();

      // Create user and sign out from site admin credentials
      user.createUser(adminstratorData.firstName, adminstratorData.lastName, adminstratorEmail, adminstratorData.jobTitle, adminstratorData.role, adminstratorData.groupName)

      // Navigate to Component tab & Create component
      nav.openComponentsTab();
      compApi.createComponent(cmpData);
      authApi.signOut();

      // Sign in with User credentials
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(adminstratorEmail);
      authApi.signin(adminstratorEmail);
      navHelper.navigateToSearch();
    })

    it("Administrator is allowed to see all the action icons", () =>{
      // Go to components tab and click on created component
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, "213-00001");

      // Verify Administrator is allowed to see all the action icons
      components.getEditIcon().should('exist');
      components.getDeleteIcon().should('exist');
      components.getWhereUsedIcon().should('exist');
      components.getDuplicateIcon().should('exist');
      components.getHistoryIcon().should('exist');
      components.getExportIcon().should('exist');
    })

    it("Administrator is allowed to navigate all component's route", () =>{
      let searchUrl = '/search/'
      let viewComponentPage = '/component/view/'
      let editComponentPage = '/component/edit/'

      // Verify Administrator is  allowed to navigate component's route
      navHelper.verifySpecifiedPathIsAccessIble(searchUrl);
      navHelper.verifySpecifiedPathIsAccessIble(viewComponentPage);
      navHelper.verifySpecifiedPathIsAccessIble(editComponentPage);
    })
  })

  context("Disabled User Settings Module", () => {
    it("administrator should add and disable the user successfully", () => {
      // Create user and sign out from the account
      const user1 = userApi.createUserUsingApi();
      const userEmail = user1.email;
      const userName = user1.fullName;
      authApi.signOut();

      // Sign in with created user
      Cypress.session.clearAllSavedSessions();
      userApi.acceptInvitation(userEmail);
      authApi.signin(userEmail);

      // Verify created user and sign out
      navHelper.navigateToUsers();
      tableHelper.assertTextInCell(constData.usersTableHeaders.EMAIL, userEmail, userEmail);
      tableHelper.assertTextInCell(constData.usersTableHeaders.fullName, userName, userName);
      authApi.signOut();

      // Sign in again with the Site admin credentials
      signin.signin(email);
      navHelper.navigateToUsers();

      // Disable the created user and sign out
      user.clickOnUserActionDots(userName);
      user.disableUserFromTable(userEmail);
      navHelper.navigateToUsers();
      tableHelper.assertTextInCell('created', userName, 'Reactivate...');
      authApi.signOut();
      Cypress.session.clearAllSavedSessions();

      // Sign in with disabled user and verify error
      cy.visit('');
      signin.enterEmail(userEmail);
      signin.enterPassword(Cypress.env("password"));
      signin.clickSignIn();
      signin.verifyErrorMessage('Your account has been disabled');
    })
  })
})
