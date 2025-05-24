import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import constData from "../../helpers/pageConstants";
import { Navigation } from "../../pages/navigation";
import { ComponentApi } from "../../api/componentApi";
import { Products } from "../../pages/products/products";
import { TableHelpers } from "../../helpers/tableHelper";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Assembly } from "../../pages/components/assembly";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { ImportFromFile } from "../../pages/components/importFromFile";

const nav = new Navigation();
const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const products = new Products();
const assembly = new Assembly();
const compApi = new ComponentApi();
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelper = new TableHelpers();
const importFromFile = new ImportFromFile();
const featureHelpers = new FeatureHelpers();
const compSettings = new CompanySettingsApi();

let email, companyId, orgId;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  email = user.email;
  user.orgData.then(res => {orgId = res.body.org_id})
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
    compSettings.updateMerlinlabsSettings(companyId);
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

describe('Roll-Revisions Module', { defaultCommandTimeout: 90000 }, () => {
  it('Verify the next changeOrder revision of the component with status Production', () => {
    let compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'AA',
    }

    // Create a Component
    compApi.createComponent(compData);


    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'AB');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'AB',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'AC');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'AY',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'BA');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'BY',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'CA');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'YY',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'AA');

    compData = {
      name     : fakerHelper.generateComponentName(),
      status   : constData.status.production,
      revision : 'HN',
    }

    // Create a Component
    compApi.createComponent(compData);

    // Verify the next CO revision
    components.verifyNextChangeOrderRevision(compData.name, 'HP');
  })

  it('Verify the next changeOrder revision of the product with status Production', () => {
    let prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'AA',
    };

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'AB');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'AB',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'AC');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'AY',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'BA');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'BY',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'CA');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'YY',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'AA');

    prodData = {
      name     : fakerHelper.generateProductName(),
      status   : constData.status.production,
      revision : 'HN',
    }

    // Create a Product
    products.createAndSaveBasicProduct(prodData.name, prodData.status, prodData.revision);

    // Verify the next CO revision
    products.verifyNextChangeOrderRevision(prodData.name, 'HP');
  })
})

describe('Custom revision Module', () => {
  it('Should not allow the revision as null when component/product is created in design state', () => {
    const assemblyCmpName = fakerHelper.generateComponentName();
    const prodData = {
      name   : fakerHelper.generateProductName(),
      status : constData.status.design,
    };
    const compData = {
      name   : fakerHelper.generateComponentName(),
      status : constData.status.design,
    }

    // Create a Product
    nav.openProductTab();
    products.clickNewButton();
    products.enterProductName(prodData.name);
    products.selectLifeCycleStatus(prodData.status);
    products.clickCreateButton();
    products.clickSaveButtonInEditProduct();

    // Verify the Revision
    products.verifyRevisionInViewMode(1);

    // Create a Component
    compApi.createComponent(compData);

    // Verify the Revision
    components.navigateToComponentViewPage(compData.name, false);
    components.verifyRevisionInViewComponent(1);

    // Import components from File
    importFromFile.importComponentsFromFile('merlinBasicComp.xlsx');
    featureHelpers.waitForLoadingIconToDisappear();
    importFromFile.verifyImportStatusSucceed(5);

    // Verify the revision of imported components
    for(let i=1; i<=5; i++) {
      tableHelper.assertTextInCell(constData.componentTableHeaders.revision, `Comp ${i}A`, 1);
    }

    // Create an assembly component
    products.navigateToProductViewPage(prodData.name, false);
    products.clickEditIcon();
    assembly.clickOnAssemblyTab();
    assembly.clickonCreateManually();
    components.chooseCategory('EBOM')
    components.enterComponentName(assemblyCmpName);
    components.selectStatus(constData.status.design);
    components.clickOnCreate();

    // Enter Assembly data
    assembly.enterDetailsInAssemblyTable('quantity', 2, assemblyCmpName);
    products.clickSaveButtonInEditProduct();

    // Verify the revision in edit view
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, assemblyCmpName);
    featureHelpers.waitForLoadingIconToDisappear();
    components.verifyRevisionInViewComponent(1);
  })
})
