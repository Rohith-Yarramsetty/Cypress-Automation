import { SignIn } from "../../pages/signin";
import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { AuthApi } from "../../api/auth";
import { UsersApi } from "../../api/userApi";
import { Utils } from "../../helpers/utils";

const signin = new SignIn();
const components = new Components();
const nav = new Navigation();
const navHelper = new NavHelpers();
const fakerHelper = new FakerHelpers();
const featureHelpers = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const authApi = new AuthApi();
const userApi = new UsersApi();

// The below limit needs to be updated
const PAGE_LOAD_EMPTY_TABLE_MS = 2000;
let email, companyId, orgId;
const timer = {}
describe("Render Empty Table Pages Tests", { tags: ['perf', 'perf-rendering'] }, () => {
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

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should render empty new component page', () => {
    const test = `${module}:Should render empty new component page`
    const cmpData = {
      type: constData.componentType.electrical,
      category: constData.electricalComponents.capacitor,
      status: constData.status.design,
      revision: "1",
      desc: "component description"
    }
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Creating component manually
    components.clickonCreateManually();
    components.chooseType(cmpData.type);
    components.chooseCategory(cmpData.category);
    components.selectStatus(cmpData.status);
    components.enterRevision(cmpData.revision);
    components.enterComponentName(fakerHelper.generateProductName());
    components.enterComponentDescription(cmpData.desc)
    components.verifyCreateBtnEnabled();

    Utils.startTimer(timer)
    components.clickOnCreate();
    let msg = 'component/edit'
    Utils.endTimer({ test, msg, timer }).then(diff => {
      // will turn on assertion when we get updated limits
      // cy.wrap(diff).should('be.lte', PAGE_LOAD_EMPTY_TABLE_MS); 
    })

    Utils.startTimer(timer)
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();
    msg = 'component/view'
    Utils.endTimer({ test, msg, timer }).then(diff => {
      // will turn on assertion when we get updated limits
      // cy.wrap(diff).should('be.lte', PAGE_LOAD_EMPTY_TABLE_MS); 
    })
  })
})
