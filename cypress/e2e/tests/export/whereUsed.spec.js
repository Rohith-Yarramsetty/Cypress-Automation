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
import { Assembly } from "../../pages/components/assembly";
import { Products } from "../../pages/products/products";
import { Headers } from "../../pages/headers";

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
const assembly = new Assembly();
const products = new Products();
const headers = new Headers();

let email, companyId, orgId, companyName;

describe('Export settings-Where Used field Module', () => {
  before(() => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    companyName = user.companyName
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

  it('Should show the parent component CPN value in exported sheet under Where used column', () => {
    let childCpnValue, parentCpnValue;
    const childCmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }

    // Create Parent and child Components & get CPN values
    compApi.createComponent(childCmpData);
    compApi.createComponent(parentCmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value) => parentCpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData.name, 1).then((cpnValue) => {
      childCpnValue = cpnValue;
      const assemblyData = {
        CPN       :childCpnValue ,
        Quantity  : 1
      }

      // Go to the parent component and add child component to Parent
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(assemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to child component and export
      assembly.clickOnAssemblyChildCmp(childCmpData.name)
      components.clickExportIconInViewComponent();
      exports.checkAllLevelsFlattenedRadioBtn();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported data(Where Used column should exist)
      const exportedData = {
        cmpName   : childCmpData.name,
        cmpCpn    : childCpnValue,
        parentCpn : parentCpnValue
      }
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-212-00001-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileForWhereUsed(`cypress/downloads/${fileName}`, exportedData);
      });
    })
  })

  it('Should not show Grand parent assemblies in the exported sheet when we are exporting grand child(Only Parent assemblies should be visible)', () => {
    let childCpnValue, parentCpnValue;
    const childCmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const grandParentparentCmpData = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }

    // Create Components & get CPN values
    compApi.createComponent(childCmpData);
    compApi.createComponent(parentCmpData);
    compApi.createComponent(grandParentparentCmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value) => parentCpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData.name, 1).then((cpnValue) => {
      childCpnValue = cpnValue;
      const childAssmblyData = {
        CPN       :childCpnValue ,
        Quantity  : 1
      }
      const parentAssemblyData = {
        CPN       : parentCpnValue ,
        Quantity  : 1
      }

      // Go to grand parent component and Add parent component as child
      tableHelper.clickOnCell(constData.componentTableHeaders.name, grandParentparentCmpData.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(parentAssemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to parent component and Add child component
      assembly.clickOnAssemblyChildCmp(parentCmpData.name)
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childAssmblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to child component and export
      assembly.clickOnAssemblyChildCmp(childCmpData.name)
      components.clickExportIconInViewComponent();
      exports.checkAllLevelsFlattenedRadioBtn();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported data(Should not export grand parent CPN in where used column)
      const exportedData = {
        cmpName   : childCmpData.name,
        cmpCpn    : childCpnValue,
        parentCpn : parentCpnValue
      }
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-212-00001-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileForWhereUsed(`cypress/downloads/${fileName}`, exportedData);
      });
    })
  })

  it('Should show multiple parents(If exported component involved in multiple assemblies as a child) separated by comma in "Where Used" field', () => {
    let childCpnValue, parent1CpnValue, parent2CpnValue;
    const childCmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData1 = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData2 = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }

    // Create Components & get CPN values
    compApi.createComponent(childCmpData);
    compApi.createComponent(parentCmpData1);
    compApi.createComponent(parentCmpData2);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(parentCmpData1.name, 1).then((value) => parent1CpnValue = value)
    featureHelper.getCpnValueFromTable(parentCmpData2.name, 1).then((value) => parent2CpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData.name, 1).then((cpnValue) => {
      childCpnValue = cpnValue;
      const childAssmblyData = {
        CPN       :childCpnValue ,
        Quantity  : 1
      }

      // Go to the parent1 component and add child component
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData1.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childAssmblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to the parent2 component and add child component
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData2.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childAssmblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to child component and export
      assembly.clickOnAssemblyChildCmp(childCmpData.name)
      components.clickExportIconInViewComponent();
      exports.checkAllLevelsFlattenedRadioBtn();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported data(Should show parent CPN's separeated by comma)
      const exportedData = {
        cmpName   : childCmpData.name,
        cmpCpn    : childCpnValue,
        parentCpn : `${parent1CpnValue}, ${parent2CpnValue}`
      }
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-212-00001-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileForWhereUsed(`cypress/downloads/${fileName}`, exportedData);
      });
    })
  })

  it('Should show the parent product and parent component when we are exporting child component', () => {
    let childCpnValue, productCpnValue, cmpCpnValue;
    const prodName = fakerHelper.generateProductName();
    const childCmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }

    // Create Components
    compApi.createComponent(childCmpData);
    compApi.createComponent(parentCmpData);

    // Create basic product
    nav.openProductTab();
    products.createBasicProduct(prodName);
    featureHelper.waitForLoadingIconToDisappear();

    // Get CPN values of product and components
    nav.openProductTab();
    featureHelper.getCpnValueFromTable(prodName, 1).then((value) => productCpnValue = value)
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value) => cmpCpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData.name, 1).then((cpnValue) => {
      childCpnValue = cpnValue;
      const childAssmblyData = {
        CPN       :childCpnValue ,
        Quantity  : 1
      }

      // Go to the product and add component as child
      nav.openProductTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, prodName);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childAssmblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to Parent component and add same child component as child
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childAssmblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to Child component and export
      assembly.clickOnAssemblyChildCmp(childCmpData.name)
      components.clickExportIconInViewComponent();
      exports.checkAllLevelsFlattenedRadioBtn();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported data(Both product and component CPN values should be there in where used column)
      const exportedData = {
        cmpName   : childCmpData.name,
        cmpCpn    : childCpnValue,
        parentCpn : `${productCpnValue}, ${cmpCpnValue}`
      }
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-212-00001-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileForWhereUsed(`cypress/downloads/${fileName}`, exportedData);
      });
    })
  })

  it('Should show "where used" field in export settings for all type of assemblies', () => {
    const cmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    // Create Component & get CPN value
    compApi.createComponent(cmpData);
    nav.openComponentsTab();

    // Go to the parent component by clicking CPN value in table
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
    components.clickExportIconInViewComponent();

    // Verify Where Used field present for "First level only" assembly type
    exports.clickOnCustomizeFieldsIcon();
    exports.verifyWhereUsedFieldPresent();
    exports.clickOnCancelInCustomizeFieldModal();

    // Verify Where Used field present for "All Levels-Indented" assembly type
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickOnCustomizeFieldsIcon();
    exports.verifyWhereUsedFieldPresent();
    exports.clickOnCancelInCustomizeFieldModal();

    // Verify Where Used field present for "All Levels-Flattened" assembly type
    exports.checkAllLevelsFlattenedRadioBtn();
    exports.clickOnCustomizeFieldsIcon();
    exports.verifyWhereUsedFieldPresent();
    exports.clickOnCancelInCustomizeFieldModal();
  })

  it('Should show parent CPN for child components when we are exporting Grand parent component', () => {
    let childCpnValue, parent1CpnValue, parent2CpnValue, grandParentCpnValue;
    const childCmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData1 = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData2 = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const grandParentparentCmpData = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }

    // Create Components & get CPN values
    compApi.createComponent(childCmpData);
    compApi.createComponent(parentCmpData1);
    compApi.createComponent(parentCmpData2);
    compApi.createComponent(grandParentparentCmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(grandParentparentCmpData.name, 1).then((value) => grandParentCpnValue = value)
    featureHelper.getCpnValueFromTable(parentCmpData1.name, 1).then((value) => parent1CpnValue = value)
    featureHelper.getCpnValueFromTable(parentCmpData2.name, 1).then((value) => parent2CpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData.name, 1).then((cpnValue) => {
      childCpnValue = cpnValue;
      const childAssmblyData = {
        CPN       :childCpnValue ,
        Quantity  : 1
      }
      const parent1AssemblyData = {
        CPN       : parent1CpnValue ,
        Quantity  : 1
      }
      const parent2AssemblyData = {
        CPN       : parent2CpnValue ,
        Quantity  : 1
      }

      // Go to grand parent component and Add parent component as child
      tableHelper.clickOnCell(constData.componentTableHeaders.name, grandParentparentCmpData.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(parent1AssemblyData);
      assembly.addComponentsToAssemblyTable(parent2AssemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to parent1 component and Add child component
      assembly.clickOnAssemblyChildCmp(parentCmpData1.name)
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childAssmblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to parent2 component and Add child component
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData2.name);
      featureHelper.waitForLoadingIconToDisappear();
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(childAssmblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to grand parent component and export
      nav.openComponentsTab();
      tableHelper.clickOnCell(constData.componentTableHeaders.name, grandParentparentCmpData.name);
      featureHelper.waitForLoadingIconToDisappear();
      components.clickExportIconInViewComponent();
      exports.checkAllLevelsFlattenedRadioBtn();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported data(Should show parent CPN values in where used)
      const exportedData = {
        companyName        : companyName,
        childCmpName       : childCmpData.name,
        parent1CmpName     : parentCmpData1.name,
        parent2CmpName     : parentCmpData2.name,
        grandParentCmpName : grandParentparentCmpData.name,
        childCmpCpn        : childCpnValue,
        parent1Cpn         : parent1CpnValue,
        parent2Cpn         : parent2CpnValue,
        grandParentCpn     : grandParentCpnValue
      }
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00003-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileForWhereUsedForGrandParentExport(`cypress/downloads/${fileName}`, exportedData);
      });
    })
  })

  it('Should not export "Where used" column if we deselect the field in customize fields section', () => {
    let childCpnValue, parentCpnValue;
    const childCmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }

    // Create Parent and child Components & get CPN values
    compApi.createComponent(childCmpData);
    compApi.createComponent(parentCmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value) => parentCpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData.name, 1).then((cpnValue) => {
      childCpnValue = cpnValue;
      const assemblyData = {
        CPN       :childCpnValue ,
        Quantity  : 1
      }

      // Go to the parent component and add child component to Parent
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(assemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Go to child component and deselect where used column and export
      assembly.clickOnAssemblyChildCmp(childCmpData.name)
      components.clickExportIconInViewComponent();
      exports.clickOnCustomizeFieldsIcon();
      exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used')
      exports.clickOnSaveBtnInCustomizeFieldsModal();
      exports.checkAllLevelsFlattenedRadioBtn();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported data(Where Used column should not exist)
      const exportedData = {
        cmpName     : childCmpData.name,
        cmpCpn      : childCpnValue,
        parentCpn   : parentCpnValue
      }
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-212-00001-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileWithOutWhereUsed(`cypress/downloads/${fileName}`, exportedData);
      });
    })
  })

  it('Should show "where used" field when we are exporting the component from search table', () => {
    let childCpnValue, parentCpnValue;
    const childCmpData = {
      category  : 'Capacitor',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }
    const parentCmpData = {
      category  : 'EBOM',
      name      : fakerHelper.generateComponentName(),
      status    : constData.status.design,
    }

    // Create Parent and child Components & get CPN values
    compApi.createComponent(childCmpData);
    compApi.createComponent(parentCmpData);
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(parentCmpData.name, 1).then((value) => parentCpnValue = value)
    featureHelper.getCpnValueFromTable(childCmpData.name, 1).then((cpnValue) => {
      childCpnValue = cpnValue;
      const assemblyData = {
        CPN       : childCpnValue ,
        Quantity  : 1
      }

      // Go to the parent component and add child component to Parent
      tableHelper.clickOnCell(constData.componentTableHeaders.name, parentCmpData.name);
      assembly.clickOnAssemblyTab();
      assembly.clickEditIconInTable();
      assembly.addComponentsToAssemblyTable(assemblyData);
      components.clickSaveButtonInEditComponent();
      featureHelper.waitForLoadingIconToDisappear();

      // Search child component and export from library
      headers.clickOnMixedSearchIcon();
      headers.enterSearchTerm(childCmpData.name);
      tableHelper.checkTableRow(childCmpData.name);
      components.clickExportInCmpLibrary();
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify exported data(Where Used column should exist)
      const exportedData = {
        cmpName     : childCmpData.name,
        cmpCpn      : childCpnValue,
        parentCpn   : parentCpnValue
      }
      const date = new Date();
      const exportEmail = featureHelper.getExportEmail(date, email);
      const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
      exportEmail.then(email => {
        expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-212-00001-${exportEmailDate}`);
        const download_file_link = email.html.links[0].href.toString();
        const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileWhenExportFromLibrary(`cypress/downloads/${fileName}`, exportedData);
      });
    })
  })
})
