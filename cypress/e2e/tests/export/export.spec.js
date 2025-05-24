import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { Export } from "../../pages/export";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";

const signin = new SignIn();
const nav = new Navigation();
const exports = new Export();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const tableHelper = new TableHelpers();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;

describe('Export settings Module', () => {
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

  it('Should pass component from component view to export page', () => {
    const cmpData = {
      name: fakerHelper.generateComponentName(),
      status: constData.status.prototype,
      revision: 1
    }

    // Create Component & get CPN value
    compApi.createComponent(cmpData)
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(cmpData.name, 1).then((cpnValue) => {
      tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickExportIconInViewComponent();

      // verify Export Table
      tableHelper.assertTextInCell(constData.componentTableHeaders.name, cpnValue, cmpData.name);
      tableHelper.assertTextInCell(constData.componentTableHeaders.status, cpnValue, cmpData.status);
      tableHelper.assertTextInCell(constData.componentTableHeaders.revision, cpnValue, cmpData.revision);
      exports.verifyLengthofExportTable(1);
    })
  })

  it('Should validate emails in CC BOX correctly', () => {
    const cmpData = {
      name: fakerHelper.generateProductName(),
      status: constData.status.production,
      revision: 'A'
    }

    // Create Component & get CPN value
    compApi.createComponent(cmpData)
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    components.clickExportIconInViewComponent();

    // Enter Email & verify Tooltip
    exports.enterCcEmail('test@durolabs.co, dev@');
    exports.verifyCcEmailTooltipPresent('Please enter a valid email address');
    exports.enterCcEmail('test@durolabs.co,dev@durolabs.co');
    exports.verifyCcEmailTooltipNotPresent();
  })

  it('Should disable the export button if invalid email exist in CC BOX', () => {
    const cmpData = {
      name: fakerHelper.generateProductName(),
      status: constData.status.obsolete,
      revision: 'A'
    }

    // Create Component & get CPN value
    compApi.createComponent(cmpData)
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    components.clickExportIconInViewComponent();

    // Enter Email & verify Create Btn
    exports.enterCcEmail('test@durolabs.co, dev@');
    exports.verifyExportBtnDisabled();
    exports.enterCcEmail('test@durolabs.co, dev@durolabs.co');
    exports.verifyExportBtnEnabled();
  })
})