import { AuthApi } from "../../api/auth";
import { SignIn } from "../../pages/signin";
import { UsersApi } from "../../api/userApi";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { ComponentApi } from "../../api/componentApi";
import { Products } from "../../pages/products/products";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { Variants } from "../../pages/components/variants";
import { Assembly } from "../../pages/components/assembly";
import { NavHelpers } from "../../helpers/navigationHelper";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Components } from "../../pages/components/component";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import variantSelectors from "../../selectors/components/variants";
import { ImportFromFile } from "../../pages/components/importFromFile";
import { Export } from "../../pages/export";
import CPN_rules from "../../helpers/dataHelpers/customCpn/CPN_rules";
import { CpnLibraries } from "../../helpers/dataHelpers/customCpn/CPN_libraries";

const signin = new SignIn();
const nav = new Navigation();
const authApi = new AuthApi();
const products = new Products();
const userApi = new UsersApi();
const assembly = new Assembly();
const variants = new Variants();
const navHelper = new NavHelpers();
const compApi = new ComponentApi();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelper = new TableHelpers();
const featureHelper = new FeatureHelpers();
const importFromFile = new ImportFromFile();
const compSettings = new CompanySettingsApi();
const exports = new Export();
const cpnLibraries = new CpnLibraries();

let email, companyId, orgId, authorName, companyName;

before(() => {
  Cypress.session.clearAllSavedSessions();
  const user = authApi.signUp();
  user.orgData.then(res => {orgId = res.body.org_id});
  authorName = user.fullName;
  email = user.email;
  companyName = user.companyName;
  signin.signin(email);
  userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company;
    compSettings.updateRoomCompanySettings(companyId);
  })
})

beforeEach(function () {
  authApi.signin(email);
  navHelper.navigateToSearch();
})

afterEach(() => {
  // Reset company
  cpnLibraries.set_CPN_rules(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);
  compSettings.resetCompany(companyId);
  authApi.reSignin();
})

after(() => {
  compSettings.deleteCompany(companyId, orgId);
})

describe('Check CPN Variant Value', { tags: ["CPN", "Room"], retries: 2 }, () => {
  it('should render cpn variant value correctly if user add assembly through file Import', () => {
    const fileName = 'room-components-to-add-in-assembly-using-import.xlsx',
    compData = {
      name     : 'Parent Assembly',
      status   : 'DESIGN',
      category : 'Kit',
    };

    // Create a component
    compApi.createComponent(compData);

    // Update the status
    components.navigateToComponentEditPage(compData.name, false);
    components.selectStatusInEditView('PRODUCTION');
    components.clickOnContinueInRevisionControl();

    // Import assembly components from file
    assembly.clickOnAssemblyTab();
    assembly.addAssemblyComponentsFromFile(fileName);

    // Verify the CPN for imported assembly
    featureHelper.getCpnValueFromTable('cmp1', 1).then((cpn) => {
      expect(cpn).to.eq('860001-01');
    })

    // Verify the CPN for 1st revision
    components.clickSaveButtonInEditComponent();
    components.clickOnHistoryIcon();
    components.clickOnRevisionInHistoryTable(authorName, 'DESIGN', 'status');
    components.getCpnValueFromEditViewPage().then((cpn) => {
      expect(cpn).to.eq('130001-01');
    })
  })
})

describe('Check duplicate and Variant Functionality', () => {
  it('should not impact Product duplicate or variant actions', () => {
    // Create a product & Verify the CPN
    products.createAndSaveBasicProduct();
    products.getCpnValueFromEditViewPage().then((cpn) => {
      expect(cpn).to.eq('150001-01');
    })

    // Create a variant & Verify the CPN
    products.clickVariantIconInViewPage();
    products.verifyNoOfVariants();
    products.clickCreateNewVariantBtn();
    products.clickSaveButtonInEditProduct();
    products.getCpnValueFromEditViewPage().then((cpn) => {
      expect(cpn).to.eq('150001-02');
    })

    // Create a duplicate & Verify the CPN
    products.clickDuplicateIconInViewPage();
    products.clickSaveButtonInEditProduct();
    products.getCpnValueFromEditViewPage().then((cpn) => {
      expect(cpn).to.eq('150002-01');
    })
  })

  it('should have equal no. of variants in variant modal and variant tab', () => {
    // Create a product
    products.createAndSaveBasicProduct(fakerHelper.generateProductName(), 'PROTOTYPE');

    // Create a variant
    products.clickVariantIconInViewPage();
    products.verifyNoOfVariants();
    products.clickCreateNewVariantBtn();
    products.clickSaveButtonInEditProduct();

    // Verify no.of variants in variant view
    products.clickVariantIconInViewPage();
    products.verifyNoOfVariants(2);

    // Verify no.of variants in variant tab
    variants.navigateToVariantsTab();
    variants.verifyNoOfAssemblyVariants(1);
  })
})

describe('Check WhereUsed Modal data', () => {
  it('where used should give the correct results', () => {
    const compData = [
      {
          category     : "Electrical Assembly",
          status       : "DESIGN",
          name         : "cmp-1",
      },
      {
          category     : "Kit",
          name         : "cmp-2",
          status       : "DESIGN",
      }
    ], tableHeader = variantSelectors.variantTableHeader();

    // Create the components
    compApi.createComponent(compData[0]);
    compApi.createComponent(compData[1]);

    // Add child to assembly component
    nav.openComponentsTab();
    featureHelper.getCpnValueFromTable(compData[0].name, 1).as('ChildCPN');
    components.navigateToComponentEditPage(compData[1].name, false);
    assembly.clickOnAssemblyTab();
    cy.get('@ChildCPN').then((cpn) => assembly.addComponentsToAssemblyTable({CPN: cpn, Quantity: 2}));
    components.clickSaveButtonInEditComponent();

    // Create a variant component
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    components.clickSaveButtonInEditComponent();

    // Verify the where used data of component
    components.navigateToComponentViewPage(compData[0].name, false);
    components.clickWhereUsedIconInViewComponent();
    tableHelper.assertRowPresentInTable('cpn', '130001-01', tableHeader);
    tableHelper.assertRowPresentInTable('cpn', '130001-02', tableHeader);
    components.verifyWhereUsedText('0 Products, 2 Assemblies');
  })
})

describe('Check duplicate validation rules with 2-digit variant', () => {
  it('should run the eid and name validation rules correctly', () => {
    const compData = {
      category : 'Wire',
      name     : 'cmp-1',
      eid      : '12345-67',
    }

    // Create a component
    compApi.createComponent(compData);

    // Submit new component form
    components.clickonCreateManually();
    components.enterEid('12345');
    components.chooseCategory('Kit');
    components.enterComponentName('cmp-2');
    components.clickOnCreate();

    // Verify the assembly columns
    assembly.verifyColumnNotPresentInAssemblyTable('refDes');
    assembly.verifyColumnPresentInAssemblyTable('itemNumber');
    components.clickSaveButtonInEditComponent();

    // Import an existing component data
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.checkUpdateFromExistingLibrary();
    importFromFile.uploadFile('test-kit.xlsx');
    importFromFile.clickOnContinue();

    // Verify EID tooltip & change it
    importFromFile.verifyErrorIconforCellInReviewPage(1, 'eid', 'EID already exists in library.');
    importFromFile.enterDataInCellInReviewPage(1, 'eid', '12345');

    // Verify name tooltip & change it
    importFromFile.verifyErrorIconforCellInReviewPage(1, 'name', 'Duplicate name from library');
    importFromFile.enterDataInCellInReviewPage(1, 'name', 'cmp-2');
    importFromFile.verifyNoErrorsAfterValidation();
  })
})

describe('Check CPN In the variant sheet for TWO-DIGIT-VARIANT cpn-scheme', () => {
  it('cpn value should be correct in the variant sheet', () => {
    let cmpOneData = {
      category     : "Kit",
      name         : "Kit cpm-1",
      status       : "DESIGN",
    }

    let cmpTwoData = {
      category     : "Wire",
      name         : "Wire cmp-1",
      status       : "DESIGN",
    }

    // Create components
    compApi.createComponent(cmpOneData);
    compApi.createComponent(cmpTwoData);

    // Create variant for wire component
    nav.openComponentsTab();
    tableHelper.clickOnCell(constData.componentTableHeaders.name, cmpTwoData.name)
    components.clickOnVariantIcon();
    components.clickOnNewVariantIcon();
    components.clickSaveButtonInEditComponent();

    // Add variant cmp to assembly component
    const childData = {
      CPN     :'210001-02',
      Quantity: 1
    }
    components.navigateToComponentEditPage(cmpOneData.name, false);
    assembly.addComponentsToAssemblyTable(childData);
    components.clickSaveButtonInEditComponent();
    featureHelper.waitForLoadingIconToDisappear();

    // Click on export icon
    components.clickExportIconInViewComponent();

    // Uncheck where used field from customized fileds
    exports.clickOnCustomizeFieldsIcon();
    exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
    exports.clickOnSaveBtnInCustomizeFieldsModal();

    // Click export button and verify the exported file
    exports.clickExportBtnInExportSettings();
    exports.verifyMailSentModal();
    const date = new Date();
    const exportEmail = featureHelper.getExportEmail(date, email);
    const exportEmailDate = featureHelper.changeDateFormat(date, 'yyyyMMdd-')
    exportEmail.then(email => {
      expect(email.subject).to.include(`${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Export: Specs-130001-01-${exportEmailDate}`);
      const download_file_link = email.html.links[0].href.toString();
      const fileName = `${download_file_link.split('?')[0].split('com/')[1]}`;
      exports.downloadExportFileInExportEmail(download_file_link, fileName);
      cy.task('readXlsx', { file: `cypress/downloads/${fileName}`, sheet: "export" }).then((rows) => {
        expect(featureHelper.convertArrayValuesToString(Object.keys(rows[0]))).to.deep.eq(["Item","Level","CPN","Category","Name","EID","Revision","Status","Description","Value","Specs","Quantity","Unit of Measure","Primary Source Unit Price","Primary Source MPN","Primary Source Manufacturer","Primary Source DPN","Primary Source Distributor","Total Price","Primary Source Lead Time","Ref Des","Item Number","Notes","Mass (g)","Last Updated","Workflow State","Procurement","Manufacturer","MPN","MPN Link","Datasheet","Mfr Description","Distributor","DPN","DPN Link","Dist Description","Package","Package Quantity","Quantity Min","Unit Price","Lead Time","Item Type","Effectivity Start Date","Effectivity End Date"]);
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[0]))).to.deep.eq(["1","0","130001-01","Kit","Kit cpm-1","","","DESIGN","","","","","EACH","$0.00000","130001-01",`${companyName}`,"130001-01",`${companyName}`,"","0 DAYS","","","","0","","","","","","","","","","","","","","","","","","","",""])
        expect(featureHelper.convertArrayValuesToString(Object.values(rows[1]))).to.deep.eq(["2","1","210001-02","Wire","VAR-Wire cmp-1","","","DESIGN","","","LENGTH: , GAUGE: , STRANDS: , COLOR: , CURRENT: , VOLTAGE: , INSULATION: , FINISH: , FOOTPRINT PATH: , PACKAGE LABEL: , SYMBOL PATH: , SYMBOL LABEL: ","1","EACH","","","","","","","","","","","","","","","","","","","","","","","","","","",""]);
      })
    });
  });
})

describe('Check category names and prefixes', () => {
  it('should support all categories for room', () => {
    // Import Components from file
    nav.openComponentsTab();
    importFromFile.clickOnImportFromFile();
    importFromFile.uploadFile("16e.all-categories-room.xlsx");
    importFromFile.clickOnContinue();

    // Verify Errors after Validation run
    importFromFile.waitForErrorCheckingSpinnerToDisappear();
    importFromFile.verifyNoErrorsAfterValidation();
    importFromFile.clickOnContinue();
    importFromFile.verifyImportStatusSucceed(35);

    let componentCpns = [];
    let cpnVariants = [];
    let componentEids = [];

    compApi.getAllComponents().then((res) => {
      const results = res.body.data.results;
      for (let i = 0; i < results.length; i++) {
        componentCpns.push(results[i].cpn); 
        cpnVariants.push(results[i].cpnVariant);
        componentEids.push(results[i].eid);
        expect(`${componentCpns[i]}-${cpnVariants[i]}`).to.contain(componentEids[i]);
      }
    })
  })
})

