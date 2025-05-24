import { SignIn } from "../../pages/signin";
import { Navigation } from "../../pages/navigation";
import constData from "../../helpers/pageConstants";
import { Oxide } from "../../pages/components/oxide";
import { NavHelpers } from "../../helpers/navigationHelper";
import { Components } from "../../pages/components/component";
import { FakerHelpers } from "../../helpers/fakerHelper";
import { TableHelpers } from "../../helpers/tableHelper";
import { ComponentApi } from "../../api/componentApi";
import { Assembly } from "../../pages/components/assembly";
import { FeatureHelpers } from "../../helpers/featureHelper";
import { Export } from "../../pages/export";
import { CompanySettingsApi } from "../../api/companySettingsApi";
import { UsersApi } from "../../api/userApi";
import { ImportFromFile } from "../../pages/components/importFromFile";

const oxide = new Oxide();
const signin = new SignIn();
const nav = new Navigation();
const faker = require('faker');
const navHelper = new NavHelpers();
const components = new Components();
const fakerHelper = new FakerHelpers();
const tableHelpers = new TableHelpers();
const compApi = new ComponentApi();
const assembly = new Assembly();
const featureHelpers = new FeatureHelpers();
const exports = new Export();
const compSettings = new CompanySettingsApi();
const userApi = new UsersApi();
const importFromFile = new ImportFromFile();

let companyId;

before(() => {
  Cypress.session.clearAllSavedSessions();
})

beforeEach(function () {
    signin.signin('jahan+oxide@durolabs.co', Cypress.env("oxidePassword"))
    userApi.getCurrentUser().then((res) => {
    companyId = res.body.data.company
  })
  navHelper.navigateToSearch();
})

after(() => {
  compSettings.resetCompany(companyId);
})

describe("Category Component Changes - Oxide", { tags: ["Oxide", "CPN"] },() => {
  it('Should verify operating temp min spec field got removed for capacitor type component', () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Select Component category to Capacitor
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.capacitor);

    // Verify Necessary specs related to Capacitor
    oxide.verifyNecessarySpecLabelPresent('Polarity');
    oxide.verifyNecessarySpecLabelPresent('Max Height');
    oxide.verifyNecessarySpecLabelPresent('Mount Style');
    oxide.verifyNecessarySpecLabelPresent('Material Class');
    oxide.verifyNecessarySpecLabelNotPresent('Operating Temp Min');
  })

  it('Should verify the newly updated spec label name for capacitor type component', () => {
    const cmpData = {
      package: '1008',
      type: 'Polymer',
      mountStyle: 'SMT',
      materialClass: 'X7R',
      polarity: 'Polarized',
      voltage: faker.random.number({min:10, max:999}),
      tolerance: faker.random.number({min:10, max:999}),
      maxHeight: faker.random.number({min:10, max:999}),
      capacitance: faker.random.number({min:10, max:999}),
      operatingTempmax: faker.random.number({min:10, max:999}),
    }

    // Navigate to Components tab
    nav.openComponentsTab();

    // Select Component category to Capacitor
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.capacitor);

    // Enter Specification data
    oxide.enterCapacitance(cmpData.capacitance);
    oxide.choosePackage(cmpData.package);
    oxide.enterVoltage(cmpData.voltage);
    oxide.enterTolerance(cmpData.tolerance);
    oxide.chooseType(cmpData.type);
    oxide.enterOperatingTemparatureMax(cmpData.operatingTempmax);
    oxide.chooseMountStyle(cmpData.mountStyle);
    oxide.chooseMaterialClass(cmpData.materialClass);
    oxide.enterMaxHeight(cmpData.maxHeight);
    oxide.choosePolarity(cmpData.polarity);

    // Expected component name
    const cmpName = `CAP ${cmpData.capacitance} ${cmpData.package} ${cmpData.voltage} ${cmpData.tolerance} ${cmpData.type} ${cmpData.operatingTempmax} ${cmpData.mountStyle} ${cmpData.materialClass} ${cmpData.maxHeight} ${cmpData.polarity}`;

    // Verify Component name
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    components.verifyComponentNameAndDesignOnComponentCreation(cmpName, constData.status.design);
  })

  it('Should verify operating temp spec field removed for resistor type component', () => {
    // Navigate to Components tab
    nav.openComponentsTab();

    // Select Component category to Resistor
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.resistor);

    // Verify Necessary specs related to Resistor
    oxide.verifyNecessarySpecLabelNotPresent('Operating Temp Min');
    oxide.verifyNecessarySpecLabelNotPresent('Operating Temp Max');
    components.clickCancelBtnInCreateComponent();
  })

  it("Should create components with new specs values using create manually modal successfully", () => {
    const cmpData1 = {
      resistance: "2.2uf",
      tolerance: "0.5",
      package: "1008",
      power: "50kw",
      mountStyle: "SMT",
      technology: "Thick Film",
      tempCoefficient: "20ppm/k",
      voltageRating: "50V.A"
    }
    const cmpData2 = {
      capacitance: "2.2uf",
      package: "1008",
      voltage: "220",
      tolerance: "0.5",
      type: "Ceramic",
      operatingTemp: "200",
      mountStyle: "SMT",
      materialClass: "X7R",
      maxHeight: "150",
      polarity: "Polarized"
    }
    const resistorCmpName = fakerHelper.generateProductName();
    const capacitorCmpName = fakerHelper.generateProductName();

    // Create a Resistor component with new specs
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.resistor);
    components.enterComponentName(resistorCmpName);

    // Verify create button disabled
    components.verifyCreateBtnDisabled();

    // enter valid spec details
    oxide.enterResistance(cmpData1.resistance);
    oxide.enterTolerance(cmpData1.tolerance);
    oxide.choosePackage(cmpData1.package);
    oxide.enterPower(cmpData1.power);
    oxide.chooseMountStyle(cmpData1.mountStyle);
    oxide.chooseTechnology(cmpData1.technology);
    oxide.enterTempCoefficient(cmpData1.tempCoefficient);
    oxide.enterVoltageRating(cmpData1.voltageRating);

    // Verify create button enabled and create component
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();

    // Create Capacitor component with new specs
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.capacitor);
    components.enterComponentName(capacitorCmpName);

    // Verify create button disabled
    components.verifyCreateBtnDisabled();

    // enter valid spec details
    oxide.enterCapacitance(cmpData2.capacitance);
    oxide.choosePackage(cmpData2.package);
    oxide.enterVoltage(cmpData2.voltage);
    oxide.enterTolerance(cmpData2.tolerance);
    oxide.chooseType(cmpData2.type);
    oxide.enterOperatingTemparatureMax(cmpData2.operatingTemp);
    oxide.chooseMountStyle(cmpData2.mountStyle);
    oxide.chooseMaterialClass(cmpData2.materialClass);
    oxide.enterMaxHeight(cmpData2.maxHeight);
    oxide.choosePolarity(cmpData2.polarity);

    // Verify create button enabled and create component
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
  });

  it("Should verify the values of the newly updated spec for Capacitor type component", () => {
    // Create a Resistor component with new specs
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.capacitor);

    // Verify create button disabled
    components.verifyCreateBtnDisabled();

    // Verify Capacitor spec fields dropdown values
    oxide.verifyCapacitorSpecFieldDropdownValues();
  })

  it("Should verify the values of the newly updated spec for Resistor type component", () => {
    // Create a Resistor component with new specs
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.resistor);

    // Verify create button disabled
    components.verifyCreateBtnDisabled();

    // Verify Resistor spec fields dropdown values
    oxide.verifyResistorSpecFieldDropdownValues();
  })

  it("Should edit the newly updated spec fields for capacitor type component", () => {
    const cmpData = {
      capacitance: "2.2uf",
      package: "1008",
      voltage: "220",
      tolerance: "0.5",
      type: "Ceramic",
      operatingTemp: "200",
      mountStyle: "SMT",
      materialClass: "X7R",
      maxHeight: "150",
      polarity: "Polarized"
    }

    const editCmpData = {
      capacitance: "2.4uf",
      package: "2010",
      voltage: "120v",
      tolerance: "1.0",
      type: "Polymer",
      operatingTemp: "250",
      mountStyle: "Through Hole",
      materialClass: "X5R",
      maxHeight: "250",
      polarity: "Non-polarized",
      mass: "150",
      procurement: "Make",
      unitOfMeasure: "FEET"
    }
    const cmpName = fakerHelper.generateProductName();

    // Create Capacitor component
    nav.openComponentsTab();
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);;
    components.chooseCategory(constData.electricalComponents.capacitor);
    components.enterComponentName(cmpName);

    // Verify create button disabled
    components.verifyCreateBtnDisabled();

    // enter valid spec details
    oxide.enterCapacitance(cmpData.capacitance);
    oxide.choosePackage(cmpData.package);
    oxide.enterVoltage(cmpData.voltage);
    oxide.enterTolerance(cmpData.tolerance);
    oxide.chooseType(cmpData.type);
    oxide.enterOperatingTemparatureMax(cmpData.operatingTemp);
    oxide.chooseMountStyle(cmpData.mountStyle);
    oxide.chooseMaterialClass(cmpData.materialClass);
    oxide.enterMaxHeight(cmpData.maxHeight);
    oxide.choosePolarity(cmpData.polarity);

    // Verify create button enabled and create component
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();

    // Edit spec fields with new data
    components.clickEditIcon();
    oxide.enterCapacitanceInCmpEditPage(editCmpData.capacitance);
    oxide.choosePackageInCmpEditPage(editCmpData.package);
    oxide.enterVoltageInCmpEditPage(editCmpData.voltage);
    oxide.enterToleranceInCmpEditPage(editCmpData.tolerance);
    oxide.chooseTypeInCmpEditPage(editCmpData.type);
    oxide.enterOperatingTemparatureMaxInCmpEditPage(editCmpData.operatingTemp);
    oxide.chooseMountStyleInCmpEditView(editCmpData.mountStyle);
    oxide.chooseMaterialClassInCmpEditView(editCmpData.materialClass);
    oxide.enterMaxHeightInCmpEditPage(editCmpData.maxHeight);
    oxide.choosePolarityInCmpEditView(editCmpData.polarity);
    components.clickSaveButtonInEditComponent();

    // Verify the updated data in spec fields
    oxide.verifySpecFieldsForCapacitorInViewCmp('Capacitance', editCmpData.capacitance);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Package', editCmpData.package);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Voltage', editCmpData.voltage);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Tolerance', editCmpData.tolerance);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Type', editCmpData.type);
    oxide.verifySpecFieldsForCapacitorInViewCmp('op temp (max)', editCmpData.operatingTemp);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Mount Style', editCmpData.mountStyle);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Material Class', editCmpData.materialClass);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Max Height', editCmpData.maxHeight);
    oxide.verifySpecFieldsForCapacitorInViewCmp('Polarity', editCmpData.polarity);
  })

  it('Should create a component with updated specs in Assembly tab', () => {
    let cpnValue, childCmpCpnValue;

    const parentCmpData = {
      category: "Battery Pack",
      name: fakerHelper.generateProductName()
    }

    const cmpData = {
      name: fakerHelper.generateProductName(),
      type: constData.componentType.electrical,
      category: constData.electricalComponents.resistor,
      resistance: '10',
      mountStyle: 'SMT',
      package:'0201',
      technology:'Thin Film',
      power:'10',
      tempCoeff:'10',
      tolerance:'10',
      voltage:'10'
    }

    // Create a assembly type component
    nav.openComponentsTab();

    // Select Component category and type
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(parentCmpData.category);
    components.enterComponentName(parentCmpData.name);
    components.enterRevision("1")
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();

    assembly.clickOnAssemblyTab();
    assembly.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    assembly.chooseCategory(constData.electricalComponents.resistor);

    // Verify the error tooltip present
    // Verify create button disabled before entering values
    oxide.verifyErrorToolTipPresent('Must enter a value for Tolerance');
    oxide.verifyErrorToolTipPresent('Must enter a value for Resistance');
    oxide.verifyErrorToolTipPresent('Must enter a value for Power');
    oxide.verifyErrorToolTipPresent('Must enter a value for Temperature Coefficient');
    components.verifyCreateBtnDisabled();

    // Verify the error tooltip not present
    // Verify create button enabled after entering values
    oxide.enterResistance(cmpData.resistance);
    oxide.chooseMountStyle(cmpData.mountStyle);
    oxide.choosePackage(cmpData.package);
    oxide.chooseTechnology(cmpData.technology);
    oxide.enterPower(cmpData.power);
    oxide.enterTempCoefficient(cmpData.tempCoeff);
    oxide.enterTolerance(cmpData.tolerance);
    oxide.enterVoltageRating(cmpData.voltage);
    components.enterRevision(1);
    components.enterComponentName(cmpData.name);
    components.selectStatus(constData.status.design);
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();

    featureHelpers.getCpnValueFromTable(cmpData.name, 1).then((value) => {
      childCmpCpnValue = value
      assembly.enterDetailsInAssemblyTable(constData.assemblyTableHeaders.quantity, 1, childCmpCpnValue);
      components.clickSaveButtonInEditComponent();
      featureHelpers.waitForLoadingIconToDisappear();
    })
  })

  it('Should verify the error tool tip in the spec field', () => {
    const cmpData = {
      name:fakerHelper.generateProductName(),
      type:constData.componentType.electrical,
      category: constData.electricalComponents.resistor,
      resistance: '10',
      mountStyle: 'SMT',
      package:'0201',
      technology:'Thin Film',
      power:'10',
      tempCoeff:'10',
      tolerance:'10',
      voltage:'10'
    }

    // Navigate to Components tab
    nav.openComponentsTab();

    // Creating component manually
    components.clickonCreateManually();
    components.chooseType(constData.componentType.electrical);
    components.chooseCategory(constData.electricalComponents.resistor);

    // Verify the error tooltip present
    // Verify create button disabled before entering values
    oxide.verifyErrorToolTipPresent('Must enter a value for Tolerance');
    oxide.verifyErrorToolTipPresent('Must enter a value for Resistance');
    oxide.verifyErrorToolTipPresent('Must enter a value for Power');
    oxide.verifyErrorToolTipPresent('Must enter a value for Temperature Coefficient');
    components.verifyCreateBtnDisabled();

    // Verify the error tooltip not present
    // Verify create button enabled after entering values
    oxide.enterResistance(cmpData.resistance);
    oxide.chooseMountStyle(cmpData.mountStyle);
    oxide.choosePackage(cmpData.package);
    oxide.chooseTechnology(cmpData.technology);
    oxide.enterPower(cmpData.power);
    oxide.enterTempCoefficient(cmpData.tempCoeff);
    oxide.enterTolerance(cmpData.tolerance);
    oxide.enterVoltageRating(cmpData.voltage);
    components.enterComponentName(cmpData.name);
    components.verifyCreateBtnEnabled();
  })

  it('Should export the component with updated specs', () => {
    let email, cpnValue;

    const cmpData = {
      name: fakerHelper.generateProductName(),
      type: constData.componentType.electrical,
      category: constData.electricalComponents.resistor,
      resistance: '10',
      mountStyle: 'SMT',
      package:'0201',
      technology:'Thin Film',
      power:'10',
      tempCoeff:'10',
      tolerance:'10',
      voltage:'10'
    }
    // Navigate to Componets tab
    nav.openComponentsTab();

    // Creating component manually
    components.clickonCreateManually();
    components.chooseType(cmpData.type);
    components.chooseCategory(cmpData.category);
    oxide.enterResistance(cmpData.resistance);
    oxide.chooseMountStyle(cmpData.mountStyle);
    oxide.choosePackage(cmpData.package);
    oxide.chooseTechnology(cmpData.technology);
    oxide.enterPower(cmpData.power);
    oxide.enterTempCoefficient(cmpData.tempCoeff);
    oxide.enterTolerance(cmpData.tolerance);
    oxide.enterVoltageRating(cmpData.voltage);
    components.removeNameInCreateComponentModal();
    components.enterComponentName(cmpData.name);
    components.selectStatus(constData.status.design);
    components.enterComponentDescription('Desc related to Comp');
    components.verifyCreateBtnEnabled();
    components.clickOnCreate();
    components.clickSaveButtonInEditComponent();
    featureHelpers.waitForLoadingIconToDisappear();

    nav.openComponentsTab();
    components.enterSearchTerm(cmpData.name);
    featureHelpers.getCpnValueFromTable(cmpData.name, 1).then((cpn) => {
      cpnValue = cpn

      tableHelpers.clickOnCell(constData.componentTableHeaders.name, cmpData.name);
      components.clickExportIconInViewComponent();
      exports.clickOnCustomizeFieldsIcon();
      exports.unCheckSpecificCustomizeFieldsCheckBoxes('Where Used');
      exports.clickOnSaveBtnInCustomizeFieldsModal();

      // Add cc mail and click export
      const ccEmail = fakerHelper.generateMailosaurEmail();
      exports.enterCcEmail(ccEmail);
      exports.clickExportBtnInExportSettings();
      exports.verifyMailSentModal();

      // Verify the Downloaded file
      const date = new Date();
      const exportEmail = featureHelpers.getExportEmail(date, ccEmail);
      exportEmail.then(email => {
        expect(email.subject).to.include(`Export: Specs-${cpnValue}`);
        const download_file_link = email.html.links[2].href.toString();
        const fileName = email.html.links[2].text.toString();
        exports.downloadExportFileInExportEmail(download_file_link, fileName);
        exports.assertExportedDownloadedFileForOxideSpecs(fileName, cmpData.name, cpnValue)
      });
    })
  })
})
 