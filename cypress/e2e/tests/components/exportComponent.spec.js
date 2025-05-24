import { Components } from "../../pages/components/component";
import { Navigation } from "../../pages/navigation";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { AuthApi } from "../../api/auth";
import { NavHelpers } from "../../helpers/navigationHelper";
import { ComponentApi } from "../../api/componentApi";
import { Export } from "../../pages/export";
import { Assembly } from "../../pages/components/assembly";
import constData from "../../helpers/pageConstants";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { SignIn } from "../../pages/signin";

const components = new Components();
const nav = new Navigation();
const featureHelper = new FeatureHelpers();
const tableHelper = new TableHelpers();
const authApi = new AuthApi();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const exports = new Export();
const assembly = new Assembly();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const signin = new SignIn();

let email, companyName, companyId, orgId;

describe("Export Components", () => {
  before( () => {
    Cypress.session.clearAllSavedSessions();
    const user = authApi.signUp();
    user.orgData.then(res => {orgId = res.body.org_id});
    email = user.email;
    companyName = user.companyName;
    signin.signin(email);
    userApi.getCurrentUser().then((res) => {
      companyId = res.body.data.company
    })
  })

  beforeEach(function () {
    authApi.signin(email);
    navHelper.navigateToSearch();

    cy.fixture('createComponent.json').then((component) => {
      compApi.createComponent(component[0])
      compApi.createComponent(component[1])
      compApi.createComponent(component[2])
      compApi.createComponent(component[3])
      compApi.createComponent(component[4]).then(res => {
        cy.visit(`/component/view/${res.body.data}`)
      })
    })
  })

  afterEach(() => {
    compSettings.resetCompany(companyId);
  })

  after(() => {
    compSettings.deleteCompany(companyId, orgId);
  })

  it('Should export a single component specifications with deep depth to local spreadsheet', () =>{
    nav.openComponentsTab();
    components.enterSearchTerm('910-00001');
    tableHelper.clickOnCell(constData.componentTableHeaders.name, '910-00001');
  
    const data1 = {
      CPN: "212-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    const data2 = {
      CPN: "232-00001",
      Quantity: 3,
      RefDes: "R1, R2, R3",
      ItemNumber: 2,
    }

    const data3 = {
      CPN: "216-00001",
      Quantity: 2,
      RefDes: "Y1, Y2",
      ItemNumber: 3,
    }

    // Add assembly to the component
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(data1);
    assembly.addComponentsToAssemblyTable(data2);
    assembly.addComponentsToAssemblyTable(data3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00001.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedExcelFile(`cypress/downloads/${fileName}`);
    });
  })

  it('Should export a single component specifications with shallow depth to local spreadsheet', () =>{
    nav.openComponentsTab();
    components.enterSearchTerm('910-00001');
    tableHelper.clickOnCell(constData.componentTableHeaders.name, '910-00001');

    const data1 = {
      CPN: "212-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    const data2 = {
      CPN: "232-00001",
      Quantity: 3,
      RefDes: "R1, R2, R3",
      ItemNumber: 2,
    }

    const data3 = {
      CPN: "216-00001",
      Quantity: 2,
      RefDes: "Y1, Y2",
      ItemNumber: 3,
    }
    // Add assembly to the component
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(data1);
    assembly.addComponentsToAssemblyTable(data2);
    assembly.addComponentsToAssemblyTable(data3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkFirstLevelCheckbox();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00001.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedExcelFile(`cypress/downloads/${fileName}`);
    });
  })

  it('Should export a single component documents with shallow depth to local zip file', () =>{
    nav.openComponentsTab();
    components.enterSearchTerm('910-00001');
    tableHelper.clickOnCell(constData.componentTableHeaders.name, '910-00001');
  
    const data1 = {
      CPN: "212-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    const data2 = {
      CPN: "232-00001",
      Quantity: 3,
      RefDes: "R1, R2, R3",
      ItemNumber: 2,
    }

    const data3 = {
      CPN: "216-00001",
      Quantity: 2,
      RefDes: "Y1, Y2",
      ItemNumber: 3,
    }
  
    // Add assembly to the component
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(data1);
    assembly.addComponentsToAssemblyTable(data2);
    assembly.addComponentsToAssemblyTable(data3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkIncludeDocumentsCheckbox();
    exports.checkFirstLevelCheckbox();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    // const date = new Date();
    // const exportEmail = featureHelper.getExportEmail(date, email);
    // const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    // exportEmail.then(email => {
    //   expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: 910-00001.1-${exportEmailDate}`);
    //   const download_file_link = email.html.links[0].href.toString();
    //   const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
    //   exports.downloadExportFileInExportEmail(download_file_link, fileName);
    //   let path = "cypress/downloads/";
    //   let file = fileName;
    //   cy.task('unzipping', { path, file })

    //   let folder = fileName.replace('.zip', '');
    //   let folderPath = `cypress/downloads/unzip/${folder}/910-00001.1`;
    //   cy.task("convetFolderSrtuctureToJson", folderPath).then((res) => {
    //     cy.fixture('exportedZipFolderStructure.json').then((jsonData) => {
    //       expect(JSON.stringify(res)).to.equals(JSON.stringify(jsonData))
    //     })
    //   })
    //   exports.assertExportedDownloadedExcelFile(`cypress/downloads/unzip/${folder}/${folder}.xlsx`);
    // });
  })

  it('Should export a single component documents with deep depth to local zip file', () =>{
    nav.openComponentsTab();
    components.enterSearchTerm('910-00001');
    tableHelper.clickOnCell(constData.componentTableHeaders.name, '910-00001');

    const data1 = {
      CPN: "212-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    const data2 = {
      CPN: "232-00001",
      Quantity: 3,
      RefDes: "R1, R2, R3",
      ItemNumber: 2,
    }

    const data3 = {
      CPN: "216-00001",
      Quantity: 2,
      RefDes: "Y1, Y2",
      ItemNumber: 3,
    }

    // Add assembly to the component
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(data1);
    assembly.addComponentsToAssemblyTable(data2);
    assembly.addComponentsToAssemblyTable(data3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.checkIncludeDocumentsCheckbox();
    exports.checkAllLevelsIndentedRadioBtn();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    // const date = new Date();
    // const exportEmail = featureHelper.getExportEmail(date, email);
    // const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    // exportEmail.then(email => {
    //   expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: 910-00001.1-${exportEmailDate}`);
    //   const download_file_link = email.html.links[0].href.toString();
    //   const fileName = `${download_file_link.split('?')[0].split('com/')[1].split('/')[1]}`;
    //   exports.downloadExportFileInExportEmail(download_file_link, fileName);
    //   let path = "cypress/downloads/";
    //   let file = fileName;
    //   cy.task('unzipping', { path, file })

    //   let folder = fileName.replace('.zip', '');
    //   let folderPath = `cypress/downloads/unzip/${folder}/910-00001.1`;
    //   cy.task("convetFolderSrtuctureToJson", folderPath).then((res) => {
    //     cy.fixture('exportedZipFolderStructure.json').then((jsonData) => {
    //       expect(JSON.stringify(res)).to.equals(JSON.stringify(jsonData))
    //     })
    //   })
    //   exports.assertExportedDownloadedExcelFile(`cypress/downloads/unzip/${folder}/${folder}.xlsx`);
    // });
  })

  it('Should export a single component specifications with manufacturers and distributors headings only', () =>{
    nav.openComponentsTab();
    components.enterSearchTerm('910-00001');
    tableHelper.clickOnCell(constData.componentTableHeaders.name, '910-00001');

    const data1 = {
      CPN: "212-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    const data2 = {
      CPN: "232-00001",
      Quantity: 3,
      RefDes: "R1, R2, R3",
      ItemNumber: 2,
    }

    const data3 = {
      CPN: "216-00001",
      Quantity: 2,
      RefDes: "Y1,Y2",
      ItemNumber: 3,
    }

    // Add assembly to the component
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(data1);
    assembly.addComponentsToAssemblyTable(data2);
    assembly.addComponentsToAssemblyTable(data3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.uncheckSourcingCheckboxes();
    exports.checkSourcingCheckBox('Include Primary Sources');
    exports.checkSourcingCheckBox('Include Manufacturers');
    exports.checkSourcingCheckBox('Include Distributors');
    exports.checkFirstLevelCheckbox();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00001.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertFileShouldContainManufacturersAndDistributorsHeadingsOnly(`cypress/downloads/${fileName}`);
    });
  })

  it('should export a single component specifications with manufacturer headings only', () => {
    nav.openComponentsTab();
    components.enterSearchTerm('910-00001');
    tableHelper.clickOnCell(constData.componentTableHeaders.name, '910-00001');

    const data1 = {
      CPN: "212-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    const data2 = {
      CPN: "232-00001",
      Quantity: 3,
      RefDes: "R1, R2, R3",
      ItemNumber: 2,
    }

    const data3 = {
      CPN: "216-00001",
      Quantity: 2,
      RefDes: "Y1, Y2",
      ItemNumber: 3,
    }

    // Add assembly to the component
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(data1);
    assembly.addComponentsToAssemblyTable(data2);
    assembly.addComponentsToAssemblyTable(data3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Export the componet
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.uncheckSourcingCheckboxes();
    exports.checkSourcingCheckBox('Include Primary Sources');
    exports.checkSourcingCheckBox('Include Manufacturers');
    exports.checkFirstLevelCheckbox();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00001.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedFileWhenManufacturersAndPrimarySourcesChecked(fileName);
    });
  })

  it('Should export a single component specifications with manufacturers and distributors and quotes headings only', () =>{      
    nav.openComponentsTab();
    components.enterSearchTerm('910-00001');
    tableHelper.clickOnCell(constData.componentTableHeaders.name, '910-00001');

    const data1 = {
      CPN: "212-00001",
      Quantity: 1,
      RefDes: "C1",
      ItemNumber: 1,
    }

    const data2 = {
      CPN: "232-00001",
      Quantity: 3,
      RefDes: "R1, R2, R3",
      ItemNumber: 2,
    }

    const data3 = {
      CPN: "216-00001",
      Quantity: 2,
      RefDes: "Y1, Y2",
      ItemNumber: 3,
    }

    // Add assembly to the component
    assembly.clickOnAssemblyTab();
    assembly.clickEditIconInTable();
    assembly.addComponentsToAssemblyTable(data1);
    assembly.addComponentsToAssemblyTable(data2);
    assembly.addComponentsToAssemblyTable(data3);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Export the component
    components.clickExportIconInViewComponent();
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();
    exports.uncheckSourcingCheckboxes();
    exports.checkSourcingCheckBox('Include Primary Sources');
    exports.checkSourcingCheckBox('Include Manufacturers');
    exports.checkSourcingCheckBox('Include Distributors');
    exports.checkSourcingCheckBox('Include Quotes');
    exports.checkFirstLevelCheckbox();
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();

    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-910-00001.1-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      exports.assertExportedDownloadedExcelFile(`cypress/downloads/${fileName}`)
    });
  })
})
