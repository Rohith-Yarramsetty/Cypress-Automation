import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import constData from "../../helpers/pageConstants";
import { Components } from "../../pages/components/component";
import { UsersApi } from "../../api/userApi";
import { ImportFromFile } from "../../pages/components/importFromFile";

const signin = new SignIn();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const components = new Components();
const userApi = new UsersApi();
const importFromFile = new ImportFromFile();

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

beforeEach(() => {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe("Import File Update Components Module", () => {
  it("components revision, status, and description are updated using CPN as key", () => {
    importFromFile.importComponentsFromFile("import/3a1.new_components-to-be-updated.xlsx", "New");
    importFromFile.verifyImportStatusSucceed(3);
    importFromFile.verifyTotalComponentsCount(3);

    let componentsData = [{"cpn": "212-00001", "name":"2.2uF, 10V, 10%, X7R", "rev":"1",  "status":"DESIGN",       "desc":"This is a capacitor of value 2.2uf"},
                            {"cpn": "232-00001", "name":"5.62K,1% Resistor",    "rev":"A",  "status":"PRODUCTION",   "desc":"This is a resistor with 1% tolerance"},
                            {"cpn": "216-00001", "name":"16MHz CRYSTAL_SMD",    "rev":"B",  "status":"OBSOLETE",     "desc":"My crystal meth"}]

    for (let i=0; i<componentsData.length; i++) {
      components.navigateToComponentViewPage(componentsData[i]["cpn"], false, constData.componentTableHeaders.cpn);
      components.verifyCpnInViewPage(componentsData[i]["cpn"]);
      components.verifyRevisionInViewComponent(componentsData[i]["rev"]);
      components.verifyStatusInViewComponent(componentsData[i]["status"]);
      components.verifyDescInCmpViewPage(componentsData[i]["desc"]);
    };

    importFromFile.importComponentsFromFile("import/3a2.update_components-using-cpn.xlsx", "Existing");
    importFromFile.verifyImportStatusSucceed(3);
    importFromFile.verifyTotalComponentsCount(3);

    componentsData = [  {"cpn": "212-00001", "name":"2.2uF, 10V, 10%, X7R", "rev":"A",  "status":"PRODUCTION",  "desc":"UPDATED: This is a capacitor of value 2.2uf",   "unitOfMeasure": "PACKAGE"},
                        {"cpn": "232-00001", "name":"5.62K,1% Resistor",    "rev":"B",  "status":"PRODUCTION",  "desc":"UPDATED: This is a resistor with 1% tolerance", "unitOfMeasure": "EACH"},
                        {"cpn": "216-00001", "name":"16MHz CRYSTAL_SMD",    "rev":"B",  "status":"OBSOLETE",    "desc":"UPDATED: My crystal meth",                      "unitOfMeasure": "OUNCES"}]

    for (let i=0; i<componentsData.length; i++) {
      components.navigateToComponentViewPage(componentsData[i]["cpn"], false, constData.componentTableHeaders.cpn);
      components.verifyCpnInViewPage(componentsData[i]["cpn"]);
      components.verifyRevisionInViewComponent(componentsData[i]["rev"]);
      components.verifyStatusInViewComponent(componentsData[i]["status"]);
      components.verifyDescInCmpViewPage(componentsData[i]["desc"]);
    };
  })

  it("components revision, status, and description are updated using CPN as key and name is included", () => {
    // Import components from File
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile('3a1.new_components-to-be-updated.xlsx');
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    featureHelper.waitForLoadingIconToDisappear();
    importFromFile.verifyImportStatusSucceed(3);

    // Verify components data
    let componentsData = [  {"cpn": "212-00001", "rev":"1", "status":"DESIGN",     "desc":"This is a capacitor of value 2.2uf"},
                            {"cpn": "232-00001", "rev":"A", "status":"PRODUCTION", "desc":"This is a resistor with 1% tolerance"},
                            {"cpn": "216-00001", "rev":"B", "status":"OBSOLETE",   "desc":"My crystal meth"}]

    for (let i=0; i<componentsData.length; i++) {
      components.navigateToComponentViewPage(componentsData[i]["cpn"], false, constData.componentTableHeaders.cpn);
      components.verifyCpnInViewPage(componentsData[i]["cpn"]);
      components.verifyRevisionInViewComponent(componentsData[i]["rev"]);
      components.verifyStatusInViewComponent(componentsData[i]["status"]);
      components.verifyDescInCmpViewPage(componentsData[i]["desc"]);
    };

    // Update the existing components throgh import from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.checkUpdateFromExistingLibrary();
    importFromFile.uploadFile('3a3.update_components-using-cpn-w-name.xlsx');
    importFromFile.clickOnContinue();

    // Verify Import errors
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    featureHelper.waitForLoadingIconToDisappear();
    importFromFile.verifyImportStatusSucceed(3);

    // Verify components data
    componentsData = [  {"cpn": "212-00001", "rev":"A", "status":"PRODUCTION", "desc":"UPDATED: This is a capacitor of value 2.2uf"},
                        {"cpn": "232-00001", "rev":"B", "status":"PRODUCTION", "desc":"UPDATED: This is a resistor with 1% tolerance"},
                        {"cpn": "216-00001", "rev":"B", "status":"OBSOLETE",   "desc":"UPDATED: My crystal meth"}]

    for (let i=0; i<componentsData.length; i++) {
      components.navigateToComponentViewPage(componentsData[i]["cpn"], false, constData.componentTableHeaders.cpn);
      components.verifyCpnInViewPage(componentsData[i]["cpn"]);
      components.verifyRevisionInViewComponent(componentsData[i]["rev"]);
      components.verifyStatusInViewComponent(componentsData[i]["status"]);
      components.verifyDescInCmpViewPage(componentsData[i]["desc"]);
    };
  });
});
