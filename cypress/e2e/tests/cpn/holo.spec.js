import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { TableHelpers } from "../../helpers/tableHelper";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import compSettingsPayloads from "../../helpers/dataHelpers/companySettingsPayloads";
import holoInc from "../../helpers/dataHelpers/customCategories/holoInc";
import { ComponentApi } from "../../api/componentApi";
import { Sourcing } from "../../pages/components/sourcing";
import constData from "../../helpers/pageConstants";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Navigation } from "../../pages/navigation";

const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const navHelper = new NavHelpers();
const compSettings = new CompanySettingsApi();
const compApi = new ComponentApi();
const components = new Components();
const sourcing = new Sourcing();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
const importFromFile = new ImportFromFile();
const nav = new Navigation();

let email, companyId, orgId, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  companyName = user.companyName;
  email = user.email;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company;
    compSettings.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
    compSettings.uploadCustomCategories(companyId, holoInc.categories);
    compSettings.updateCompanySettings(companyId, compSettingsPayloads.unitPricePrecision("2"));
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Check unit price precision', () => {
  it("Unit price precision must be equal to 2", () => {
    let compOneData = {
        categoryType : "Mechanical",
        category     : "Adhesive/Fluid/Grease",
        name         : "Cpm",
        status       : "DESIGN"
      }

    compApi.createComponent(compOneData);
    tableHelper.clickOnCell(constData.componentTableHeaders.name, compOneData.name);
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickOnAddNewManufacturer();
    sourcing.clickExpand();

    let manufacturerData = {
      mpn: "mpn1",
      manufacturer: "man1",
      description: "desc1",
    },
    distributorData = {
      dpn: "dpn1",
      distributor: "dist1",
      description: "desc1",
    },
    quoteData = {
      leadTime: "2",
      minQuantity: "1",
      unitPrice: "0.25000",
    };

    sourcing.navigateToSourcingTab();
    sourcing.enterManufacturerData(1, manufacturerData);
    sourcing.enterDistributorData(1, 1, distributorData);
    sourcing.enterQuoteData(1, 1, 1, quoteData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();
    components.clickEditIcon();
    sourcing.navigateToSourcingTab();
    sourcing.clickExpand();

    // Note: Need to assert the error for more than 4 decimal digits
    const inputPrices = ['0.02', '0.341', '1.2345', '0.02356', '1.1', '1']
    const expectedPrices = ['0.02', '0.34', '1.23', '0.02', '1.10', '1.00']

    for (let i = 0; i < inputPrices.length; i++)
    {
      sourcing.enterUnitPrice(1, 1, 1, inputPrices[i]);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();
      components.clickEditIcon();
      sourcing.navigateToSourcingTab();
      sourcing.clickExpand();
      sourcing.verifyUnitPrice(1, 1, 1, expectedPrices[i]);
    }
  })
})

describe('Check category names and prefixes', () => {
  it('should support all categories for holo', () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("16d.all-categories-holo-inc.xlsx");
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(53);

    let componentCpns = [];
    let componentNames = [];

    compApi.getAllComponents().then((res) => {
      const results = res.body.data.results;
      for (let i = 0; i < results.length; i++) {
        // Verifying Cpn starts with name
        componentCpns.push(results[i].cpn.substring(0,3)); 
        componentNames.push(results[i].name.substring(0,3));
        expect(componentCpns[i]).to.contain(componentNames[i]);
      }
    })
  })
})
