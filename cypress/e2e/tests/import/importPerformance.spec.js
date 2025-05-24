import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { Utils } from '../../helpers/utils';

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();

let email, companyId, orgId;
const timer = {}
describe("Import Large Number of Components Module", { defaultCommandTimeout: 1200000, tags: ['perf', 'perf-import'] }, () => {
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

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  context('Import Large Number of Components with MPN and Datasheet Module', () => {
    const module = 'Import Large Number of Components with MPN and Datasheet Module'
    it('Should import 10 components with MPN and Datasheet', () => {
      const test = `${module}:Should import 10 components with MPN and Datasheet`
      // Navigate to components tab
      nav.openComponentsTab();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      Utils.startTimer(timer)
      importFromFile.uploadFile('tenCmpWithMpnsAndDatasheet.xlsx');
      Utils.endTimer({ test, timer })
      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.verifyNecessaryLabelsMapped('MPN', 'mpn');
      importFromFile.verifyNecessaryLabelsMapped('Manufacturer', 'manufacturer');
      importFromFile.verifyNecessaryLabelsMapped('Datasheet', 'datasheet');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();

      // Verify imported components count
      importFromFile.verifyImportStatusSucceed(10);
      importFromFile.verifyTotalComponentsCount(10);
    })

    it('Should import 100 components with MPN and Datasheet', () => {
      const test = `${module}:Should import 100 components with MPN and Datasheet`
      // Navigate to components tab
      nav.openComponentsTab();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      Utils.startTimer(timer)
      importFromFile.uploadFile('hundredCmpWithMpnsAndDatasheet.xlsx');
      Utils.endTimer({ test, timer })
      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.verifyNecessaryLabelsMapped('MPN', 'mpn');
      importFromFile.verifyNecessaryLabelsMapped('Manufacturer', 'manufacturer');
      importFromFile.verifyNecessaryLabelsMapped('Datasheet', 'datasheet');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();

      // Verify imported components count
      importFromFile.verifyImportStatusSucceed(100);
      importFromFile.verifyTotalComponentsCount(100);
    })
  })

  context('Import Large Number of Components Module', () => {
    const module = 'Import Large Number of Components Module'

    it('Should import 25 components', () => {
      const test = `${module}:Should import 25 components`
      // Navigate to components tab
      nav.openComponentsTab();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      Utils.startTimer(timer)
      importFromFile.uploadFile('5ka.large-number-of-components-25.xlsx');
      Utils.endTimer({ test, timer })
      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();

      // Verify imported components count
      importFromFile.verifyImportStatusSucceed(25);
      importFromFile.verifyTotalComponentsCount(25);
    })

    it('Should import 100 components', () => {
      const test = `${module}:Should import 100 components`
      // Navigate to components tab
      nav.openComponentsTab();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      Utils.startTimer(timer)
      importFromFile.uploadFile('importHundredComponents.xlsx');
      Utils.endTimer({ test, timer })
      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();

      // Verify imported components count
      importFromFile.verifyImportStatusSucceed(100);
      importFromFile.verifyTotalComponentsCount(100);
    })

    it('Should import 200 components', () => {
      const test = `${module}:Should import 200 components`
      // Navigate to components tab
      nav.openComponentsTab();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      Utils.startTimer(timer)
      importFromFile.uploadFile('importTwoHundredComponents.xlsx');
      Utils.endTimer({ test, timer })
      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.verifyNecessaryLabelsMapped('Status', 'status');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();

      // Verify imported components count
      importFromFile.verifyImportStatusSucceed(200);
      importFromFile.verifyTotalComponentsCount(200);
    })

    it('Should verify that the Components page should load immediately following import completion', () => {
      const test = `${module}:Should verify that the Components page should load immediately following import completion`
      // Navigate to components tab
      nav.openComponentsTab();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      Utils.startTimer(timer)
      importFromFile.uploadFile('hundredCmpWithMpnsAndDatasheet.xlsx');
      Utils.endTimer({ test, timer })
      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.verifyNecessaryLabelsMapped('MPN', 'mpn');
      importFromFile.verifyNecessaryLabelsMapped('Manufacturer', 'manufacturer');
      importFromFile.verifyNecessaryLabelsMapped('Datasheet', 'datasheet');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run and page loading time
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();
      importFromFile.verifyImportStatusSucceed(100, 250000);
      importFromFile.verifyPageLoadingTime();

      // Verify imported components count
      importFromFile.verifyTotalComponentsCount(100);
    })
  })

  context('Import Large Number of Components Module With Different Categories', () => {
    it('Should import 200 components with different categories', () => {
      const test = `${module}:Should import 200 components`
      // Navigate to components tab
      nav.openComponentsTab();

      // Import Components from file
      importFromFile.clickOnImportFromFile();
      Utils.startTimer(timer)
      importFromFile.uploadFile('5kf.large-number-of-components-200-with-diff-categories.xlsx');
      Utils.endTimer({ test, timer })
      // Verify Mapped Labels
      importFromFile.verifyNecessaryLabelsMapped('Name', 'name');
      importFromFile.verifyNecessaryLabelsMapped('Category', 'category');
      importFromFile.clickOnContinue();

      // Verify Errors after Validation run
      importFromFile.waitForErrorCheckingSpinnerToDisappear();
      importFromFile.verifyNoErrorsAfterValidation();
      importFromFile.clickOnContinue();

      // Verify imported components count
      importFromFile.verifyImportStatusSucceed(200);
      importFromFile.verifyTotalComponentsCount(200);
    })
  })
})
