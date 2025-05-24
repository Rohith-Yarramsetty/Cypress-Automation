/// <reference types="cypress" />

import selectors from "../../selectors/components/oxide";
import { FeatureHelpers } from "../../helpers/featureHelper";

const featureHelper = new FeatureHelpers();

export class Oxide {
  verifyNecessarySpecLabelPresent(label = "") {
    cy.xpath(selectors.capacitor.specLabel.replace('labelName', label))
      .should('exist')
  }

  verifyNecessarySpecLabelNotPresent(label = "") {
    cy.xpath(selectors.capacitor.specLabel.replace('labelName', label))
      .should('not.exist')
  }

  enterCapacitance(value = "") {
    cy.xpath(selectors.capacitor.capacitance)
      .clear()
      .type(value)
  }

  enterMaxHeight(height = "") {
    cy.xpath(selectors.capacitor.maxHeight)
      .clear()
      .type(height)
  }

  enterVoltage(volt = "") {
    cy.xpath(selectors.capacitor.voltage)
      .clear()
      .type(volt)
  }

  enterTolerance(tolerance = "") {
    cy.xpath(selectors.capacitor.tolerance)
      .clear()
      .type(tolerance)
  }

  enterOperatingTemparatureMax(temparature = "") {
    cy.xpath(selectors.capacitor.operatingTemparatureMax)
      .clear()
      .type(temparature)
  }

  choosePackage(cmpPackage = "") {
    cy.xpath(selectors.capacitor.package)
      .select(cmpPackage)
  }

  chooseType(type = "") {
    cy.xpath(selectors.capacitor.type)
      .select(type)
  }

  chooseMountStyle(style = "") {
    cy.xpath(selectors.capacitor.mountStyle)
      .select(style)
  }

  chooseMaterialClass(materialClass = "") {
    cy.xpath(selectors.capacitor.materialClass)
      .select(materialClass)
  }

  choosePolarity(polarity = "") {
    cy.xpath(selectors.capacitor.polarity)
      .select(polarity)
  }

  enterResistance(resistance = "") {
    cy.xpath(selectors.resistor.resistance)
      .clear()
      .type(resistance)
  }

  enterPower(power = "") {
    cy.xpath(selectors.resistor.power)
      .clear()
      .type(power)
  }

  chooseTechnology(technologyType = "") {
    cy.xpath(selectors.resistor.technology)
      .select(technologyType)
  }

  enterTempCoefficient(temp = "") {
    cy.xpath(selectors.resistor.tempCoefficient)
      .clear()
      .type(temp)
  }

  enterVoltageRating(voltage = "") {
    cy.xpath(selectors.resistor.voltageRating)
      .clear()
      .type(voltage)
  }

  verifyCapacitorSpecFieldDropdownValues() {
    const packageValuesArray = ['Select Value', '008004', '009005', '01005', '0201', '0402', '0603', '0805', '1008', '1206', '1806', '1812', '2010', '2512'];
    const typeValuesArray = ['Select Value', 'Ceramic', 'Aluminum Polymer', 'Tantalum Polymer', 'Tantalum', 'Aluminum Electrolytic', 'Polymer', 'Other'];
    const mountStyleValuesArray = ['Select Value', 'SMT', 'Through Hole', 'Other'];
    const materialClassValuesArray = ['Select Value', 'X7R', 'C0G (NP0)', 'X5R', 'X6S', 'X7S', 'Other'];
    const polarityValuesArray = ['Select Value', 'Polarized', 'Non-polarized'];

    // Verify Package, Type, Mount style, Material class and Polarity Dropdown values
    featureHelper.verifyDropdownValues(selectors.capacitor.packageDropdownValues, packageValuesArray);
    featureHelper.verifyDropdownValues(selectors.capacitor.typeDropdownValues, typeValuesArray);
    featureHelper.verifyDropdownValues(selectors.capacitor.mountStyleDropdownValues, mountStyleValuesArray);
    featureHelper.verifyDropdownValues(selectors.capacitor.materialClassDropdownValues, materialClassValuesArray);
    featureHelper.verifyDropdownValues(selectors.capacitor.polarityDropdownValues, polarityValuesArray);
  }

  verifyResistorSpecFieldDropdownValues() {
    const packageValuesArray = ['Select Value', '008004', '009005', '01005', '0201', '0402', '0603', '0805', '1008', '1206', '1806', '1812', '2010', '2512'];
    const mountStyleValuesArray = ['Select Value', 'SMT', 'Through Hole', 'MELF', 'Other'];
    const technologyValuesArray = ['Select Value', 'Thick Film', 'Thin Film', 'Metal Film', 'Silicon Film', 'Other'];

    // Verify Package, Mount style and Technology Dropdown values
    featureHelper.verifyDropdownValues(selectors.resistor.packageDropdownValues, packageValuesArray);
    featureHelper.verifyDropdownValues(selectors.resistor.mountStyleDropdownValues, mountStyleValuesArray);
    featureHelper.verifyDropdownValues(selectors.resistor.technologyDropdownValues, technologyValuesArray);
  }

  enterCapacitanceInCmpEditPage(capacitance = "") {
    cy.xpath(selectors.capacitor.capacitanceInCmpEditPage)
      .clear()
      .type(capacitance)
  }

  choosePackageInCmpEditPage(packageType = "") {
    cy.xpath(selectors.capacitor.packageInCmpEditPage)
      .select(packageType)
  }

  enterVoltageInCmpEditPage(volt = "") {
    cy.xpath(selectors.capacitor.voltageInCmpEditPage)
      .clear()
      .type(volt)
  }

  enterToleranceInCmpEditPage(tolerance = "") {
    cy.xpath(selectors.capacitor.toleranceInCmpEditPage)
      .clear()
      .type(tolerance)
  }

  chooseTypeInCmpEditPage(type = "") {
    cy.xpath(selectors.capacitor.typeInCmpEditPage)
      .select(type)
  }

  enterOperatingTemparatureMaxInCmpEditPage(temparature = "") {
    cy.xpath(selectors.capacitor.opTempMaxInCmpEditPage)
      .clear()
      .type(temparature)
  }

  chooseMountStyleInCmpEditView(style = "") {
    cy.xpath(selectors.capacitor.mountStyleInCmpEditPage)
      .select(style)
  }

  chooseMaterialClassInCmpEditView(materialClass = "") {
    cy.xpath(selectors.capacitor.materialClassInCmpEditPage)
      .select(materialClass)
  }

  choosePolarityInCmpEditView(polarity = "") {
    cy.xpath(selectors.capacitor.polarityInCmpEditPage)
      .select(polarity)
  }

  enterMaxHeightInCmpEditPage(height = "") {
    cy.xpath(selectors.capacitor.maxHeightInCmpEditPage)
      .clear()
      .type(height)
  }

  verifySpecFieldsForCapacitorInViewCmp(specField, value) {
    cy.xpath(selectors.capacitor.specFieldsInViewCmpPage.replace('name', specField))
      .should('have.text', value)
  }

  verifyErrorToolTipPresent(ErrorMsg) {
    cy.xpath(selectors.errorToolTip.replace('ErrorMsg',ErrorMsg))
      .scrollIntoView()
      .should('exist')
  }
}
