import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { Oxide } from "../../pages/components/oxide";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Export } from "../../pages/export";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { ImportFromFile } from "../../pages/components/importFromFile";
import oxideCustomCategories from "../../helpers/dataHelpers/customCategories/oxideCustomCategories";
import compSettingsPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import { AuthApi } from "../../api/auth";

const signin = new SignIn();
const nav = new Navigation();
const faker = require('faker');
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const importFromFile = new ImportFromFile();
const authApi = new AuthApi();

let email, companyId, orgId, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  companyName = user.companyName;
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company;
    compSettings.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
    compSettings.uploadCustomCategories(companyId, oxideCustomCategories.OxideCategories);
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

after(() => {
  compSettings.resetCompany(companyId);
})

describe("Check category names and prefixes", () => {
  it('should support custom categories for Oxide', () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("16f.all-categories-oxide.xlsx");
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(5);

    let componentCpns = [];
    let componentNames = [];

    compApi.getAllComponents().then((res) => {
      const results = res.body.data.results;
      for (let i = 0; i < results.length; i++) {
        componentCpns.push(results[i].cpn.substring(0,3)); 
        componentNames.push(results[i].name)
        expect(componentNames[i]).to.eq(componentCpns[i]);
      }
    })
  });
})
