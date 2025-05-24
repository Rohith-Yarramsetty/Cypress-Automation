import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { Products } from "../../pages/products/products";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import compPayloads from "../../helpers/dataHelpers/companySettingsPayloads";

const signin = new SignIn();
const authApi = new AuthApi();
const userApi = new UsersApi();
const product = new Products();
const compApi = new ComponentApi;
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const featureHelper = new FeatureHelpers();
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
})

afterEach(() => {
  compSettings.resetCompany(companyId);
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Component Edit VIEW Module', () => {
  it('Should display error alert icon if there is an error', () => {
    components.clickComponentIcon();
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.capacitor);
    components.enterComponentName('Cmp-1')
    components.selectStatus(constData.status.design);
    components.enterRevision("1");
    components.clickOnCreate();
    components.clearComponentNameInEditView();
    components.verifyErrorToolTipPresentInEditView("Must contain at least 1 character");
    components.enterComponentNameInEditView('Cmp-1');
    components.verifyErrorToolTipNotPresentInEditView("Must contain at least 1 character");
  })

  it('Should display Mass Unit correctly and allow float or integer value in mass based on flags in company settings', () => {
    // Update the Company settings
    compSettings.updateCompanySettings(companyId, compPayloads.massUnit.kiloGrams);
    compSettings.updateCompanySettings(companyId, compPayloads.massPrecisionValue(0));
    cy.reload();

    const compData = {
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
      category  : 'EBOM',
    }

    // Create a Component
    compApi.createComponent(compData);
    components.navigateToComponentViewPage(compData.name);

    // Verify the unit of mass & precision value
    components.verifyMassUnitLabelInViewComponent('MASS (kg)');
    components.verifyMassValueInViewComponent(0);

    // Verify entering mass as decimal value
    components.clickEditIcon();
    components.enterMassValueInEditComponent('12.36');
    components.verifyMassFeildTooltip('Value should be of type Integer');
    components.verifySaveBtnDisabledInEditView();

    // Enter mass value as integer
    components.enterMassValueInEditComponent('56');
    components.verifyMassFeildTooltip('');
    components.verifySaveBtnEnabledInEditView();

    // Verify the mass value & unit
    components.clickSaveButtonInEditComponent();
    components.verifyMassValueInViewComponent('56');
    components.verifyMassUnitLabelInViewComponent('MASS (kg)');

    const prodData = {
      name      : fakerHelper.generateProductName(),
      status    : constData.status.design,
    }

    // Create a Product
    product.createAndSaveBasicProduct(prodData.name, prodData.status);
    product.navigateToProductViewPage(prodData.name);

    // Verify the unit of mass & precision value
    product.verifyMassUnitLabelInViewProduct('MASS (kg)');
    product.verifyMassValueInViewProduct(0);

    // Verify entering mass as decimal value
    product.clickEditIcon();
    product.enterMassInEditProduct('23.5');
    product.verifyMassFeildTooltip('Value should be of type Integer');
    product.verifySaveBtnDisabledInEditView();

    // Enter mass value as integer
    product.enterMassInEditProduct('98');
    product.verifyMassFeildTooltip('');
    product.verifySaveBtnEnabledInEditView();

    // Verify the mass value & unit
    product.clickSaveButtonInEditProduct();
    product.verifyMassValueInViewProduct('98');
    product.verifyMassUnitLabelInViewProduct('MASS (kg)');

    // Update the Company settings
    compSettings.updateCompanySettings(companyId, compPayloads.massUnit.grams);
    compSettings.updateCompanySettings(companyId, compPayloads.massPrecisionValue(2));
    cy.reload();

    // For component
    // Verify the unit of mass & precision value
    components.navigateToComponentViewPage(compData.name);
    components.verifyMassUnitLabelInViewComponent('MASS (g)');
    components.verifyMassValueInViewComponent('56');

    // Update the Mass value
    components.clickEditIcon();
    components.enterMassValueInEditComponent('4.7');
    components.clickSaveButtonInEditComponent();

    // Verify the updated unit of mass & value
    components.verifyMassUnitLabelInViewComponent('MASS (g)');
    components.verifyMassValueInViewComponent('4.70');

    // For product
    // Verify the unit of mass & precision value
    product.navigateToProductViewPage(prodData.name);
    product.verifyMassUnitLabelInViewProduct('MASS (g)');
    product.verifyMassValueInViewProduct('98');

    // Update the Mass value
    product.clickEditIcon();
    product.enterMassInEditProduct('4.1');
    product.clickSaveButtonInEditProduct();

    // Verify the updated unit of mass & value
    product.verifyMassUnitLabelInViewProduct('MASS (g)');
    product.verifyMassValueInViewProduct('4.10');
  })
})

describe("Revision managed feature on component's edit page", () => {
  let compName = fakerHelper.generateComponentName();
  beforeEach(() => {
    // Update the company flag
    compSettings.updateCompanySettings(companyId, compPayloads.isNotRevisionManagedEnabled(true));
    cy.reload();

    // Create a component
    compApi.createComponent({name: compName, status: 'DESIGN', category: 'Adhesive'});
  })

  it('should display the Revision Managed checkbox', () => {
    // Verify the revision managed checkbox
    components.navigateToComponentEditPage(compName, false);
    components.verifyRevisionManagedCheckBoxEnabled(true);
  })
})
