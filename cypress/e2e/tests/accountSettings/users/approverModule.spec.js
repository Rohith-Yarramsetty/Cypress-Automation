import { AuthApi } from "../../../api/auth";
import { SignIn } from "../../../pages/signin";
import { UsersApi } from "../../../api/userApi";
import { Headers } from "../../../pages/headers";
import constData from "../../../helpers/pageConstants";
import { Navigation } from "../../../pages/navigation";
import { ComponentApi } from "../../../api/componentApi";
import { FakerHelpers } from "../../../helpers/fakerHelper";
import { TableHelpers } from "../../../helpers/tableHelper";
import { Users } from "../../../pages/accountSettings/users";
import { NavHelpers } from "../../../helpers/navigationHelper";
import { Components } from "../../../pages/components/component";
import { CompanySettingsApi } from "../../../api/companySettingsApi";

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
const compSettings = new CompanySettingsApi();

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

afterEach(() => {
  compSettings.deleteCompany(companyId, orgId);
})

context("Approver Settings Module", () => {
	beforeEach(function () {
		const approverData = {
			firstName : faker.name.firstName(),
			lastName : faker.name.lastName(),
			jobTitle : "Test Engineer",
			role : "Approver",
			groupName : "QA"
		}

		const cmpData = {
			category: "Charger",
			name: "Cmp-1",
			status: constData.status.production,
			revision: 'A'
		}

		let approverEmail = fakerHelper.generateMailosaurEmail(approverData.firstName, approverData.lastName);

		// Go to users settings
		navHelper.navigateToUsers();

		// Create user and sign out from site admin credentials
		user.createUser(approverData.firstName, approverData.lastName, approverEmail, approverData.jobTitle, approverData.role, approverData.groupName)
		compApi.createComponent(cmpData);
		authApi.signOut();

		// Sign in with approver credentials
		Cypress.session.clearAllSavedSessions();
		userApi.acceptInvitation(approverEmail);
		authApi.signin(approverEmail);
	})

	it('user having role type Approver should not be able to add user', () =>{
		// Navigate to Users page and verify add user button enabled
		navHelper.navigateToUsers();
		user.VerifyNewBtnNotPresentInUsersPage();
	})

	it('user having role type Approver should not be able to add user in groups', () =>{
		// Navigate to Groups page and verify add user button enabled
		navHelper.navigateToGroups();
		user.verifyAddUserNotPresentInGroups();
	})

	it('user having role type Approver should not be able to edit the company profile', () =>{
		// Go to company profile
		navHelper.navigateToCompanyProfile();

		// Verify All the fields are editable
		user.verifyCompanyNameInCompanyProfileIsNotEditable();
		user.verifyCompanyWebsiteInCompanyProfileIsNotEditable();
		user.verifyAddressStreetInCompanyProfileIsNotEditable();
		user.verifyAddressSuiteInCompanyProfileIsNotEditable();
		user.verifyCityInCompanyProfileIsNotEditable();
		user.verifyStateInCompanyProfileIsNotEditable();
		user.verifyZipCodeInCompanyProfileIsNotEditable();
	})

	it('user having role type approver should not be able to switch in sandbox mode', () =>{
		navHelper.navigateToSearch();

		// Click on Avatar Icon
		header.clickOnAvatarIcon();

		// Verify SandBox Option not present
		user.verifySandBoxOptionNotPresentInSettings();
	})

	it("Approver is not allowed to see the un-authorized action icons", () =>{
		// Go to components tab and click on created component
		navHelper.navigateToSearch();
		nav.openComponentsTab();
		tableHelper.clickOnCell(constData.componentTableHeaders.name, "213-00001");

		// Verify Approver is not allowed to see the un-authorized action icons
		components.VerifyEditIconNotPresent();
		components.VerifyDuplicateIconNotPresent();
		components.verifyDeleteIconNotPresent();
		components.verifyFavoriteIconPresent();
		components.verifyWhereUsedIconPresent();
		components.verifyHistoryIconPresent();
	})

	it("Approver is not allowed to navigate component's un-authorized route", () =>{
		let editPageUrl = '/component/edit/'
		let newComponentFileUrl = '/component/new/file'
		let newComponentWebUrl = '/component/new/web'
		let newComponentManualUrl = '/component/new/manual'

		// Verify Approver is not allowed to navigate component's un-authorized route
		navHelper.verifySpecifiedPathNotAccessIble(editPageUrl);
		navHelper.verifySpecifiedPathNotAccessIble(newComponentFileUrl);
		navHelper.verifySpecifiedPathNotAccessIble(newComponentWebUrl);
		navHelper.verifySpecifiedPathNotAccessIble(newComponentManualUrl);
	})
})
