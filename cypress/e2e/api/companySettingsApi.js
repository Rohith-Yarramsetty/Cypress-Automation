/// <reference types="cypress" />

import { PropelAuthApi }        from "./propelAuthApi";
import { ApiHelpers }           from "../helpers/apiHelper";
import   CPN_rules              from "../helpers/dataHelpers/customCpn/CPN_rules";
import   compSettingsPayloads   from "../helpers/dataHelpers/companySettingsPayloads";
import { CpnLibraries }         from "../helpers/dataHelpers/customCpn/CPN_libraries";
import   formCategories         from "../helpers/dataHelpers/customCategories/formCategories";
import   canaCategories         from "../helpers/dataHelpers/customCategories/canaCategories";
import   roomCategories         from "../helpers/dataHelpers/customCategories/roomCategories";
import   arevoCategories        from "../helpers/dataHelpers/customCategories/arevoCategories";
import   aferoCategories        from "../helpers/dataHelpers/customCategories/aferoCategories";
import   fortemCategories       from "../helpers/dataHelpers/customCategories/fortemCategories";
import   pressoCategories       from "../helpers/dataHelpers/customCategories/pressoCategories";
import   kodiakCategories       from "../helpers/dataHelpers/customCategories/kodiakCategories";
import   spheroCategories       from "../helpers/dataHelpers/customCategories/spheroCategories";
import   merlinlabsCategories   from "../helpers/dataHelpers/customCategories/merlinlabsCategories";
import   orbitFabCategories     from "../helpers/dataHelpers/customCategories/orbitFabCategories";

const baseUrl = Cypress.config().baseUrl;
const apiUrl = baseUrl.includes('test') ? baseUrl.replace("//test", "//api") : baseUrl.replace("//", "//api.");


const propelAuthApi = new PropelAuthApi();
const cpnLibraries = new CpnLibraries();

let token = Cypress.env("QA_ACCESS_KEY");

export class CompanySettingsApi {
  updateCompanySettings(companyId, body) {
    const headers = {
      'Content-Type': 'application/json',
      'token': token
    }

    const path = `/v1/bertha/company/${companyId}/settings`;

    const successMsg = 'Updated company settings'
    const failureMsg = 'Failed to update the company settings'

    return cy.request({
      method: 'PATCH',
      url: apiUrl + path,
      headers: headers,
      body: body,
      retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }

  deleteCompanyFromDB(companyId) {
    const headers = {
      'token': token
    }

    const path = `/v1/bertha/company/deleteCompany/${companyId}`;

    const successMsg = `Successfully deleted the company with id ${companyId}`
    const failureMsg = `Failed to delete the company with id ${companyId}`

    return cy.request({
      method: 'DELETE',
      url: apiUrl + path,
      headers: headers,
      retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }

  enableCompany(companyId) {
    const headers = {
      'token': token
    }
    const path = `/v1/bertha/company/enableCompany/${companyId}`;
    const body = null;

    const successMsg = `Successfully enabled the company with id ${companyId}`
    const failureMsg = `Failed to enable the company with id ${companyId}`

    return cy.request({
      method: 'POST',
      url: apiUrl + path,
      headers: headers,
      body: body,
      retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })
  }

  disableCompany(companyId) {
    const headers = {
      'token': token
    }
    const path = `/v1/bertha/company/disableCompany/${companyId}`;
    const body = null;

    const successMsg = `Successfully disabled the company with id ${companyId}`
    const failureMsg = `Failed to disable the company with id ${companyId}`

    return cy.request({
      method: 'POST',
      url: apiUrl + path,
      headers: headers,
      body: body,
      retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })  
  }

  resetCompany(companyId) {
    const headers = {
      'token': token
    }
    const path = `/v1/bertha/company/resetCompany/${companyId}`;
    const body = null;

    const successMsg = `Successfully resetted the company with id ${companyId}`
    const failureMsg = `Failed to reset the company with id ${companyId}`

    return cy.request({
      method: 'PATCH',
      url: apiUrl + path,
      headers: headers,
      body: body,
      retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })   
  }

  updateAirbnbSettings(companyId) {
    this.updateCompanySettings(companyId, compSettingsPayloads.customFields({"wasteFieldEnabled": true, "warrantyFieldEnabled": true}));
    this.updateCompanySettings(companyId, compSettingsPayloads.customUomLabels(["IN²", "m²", "mm²", "FT²"]));
  }

  updateCanaUserSettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.CONDITIONAL_01_VARIANT);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, canaCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.cana.cpnType);
    this.updateCompanySettings(companyId, compSettingsPayloads.cana.intelligentCpnScheme);
    this.updateCompanySettings(companyId, compSettingsPayloads.cana.cpnScheme);
    this.updateCompanySettings(companyId, compSettingsPayloads.cana.revSchemeType);
    this.updateCompanySettings(companyId, compSettingsPayloads.cana.ecoAcceptOpen);
    this.updateCompanySettings(companyId, compSettingsPayloads.cana.SSODisabled);
    this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
  }

  updateKodiakUserSettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.HYBRID_WITH_6_DIGIT_CPN);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, kodiakCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.kodiak.cpnType);
    this.updateCompanySettings(companyId, compSettingsPayloads.kodiak.intelligentCpnScheme);
    this.updateCompanySettings(companyId, compSettingsPayloads.kodiak.cpnScheme);
    this.updateCompanySettings(companyId, compSettingsPayloads.kodiak.revSchemeType);
    this.updateCompanySettings(companyId, compSettingsPayloads.kodiak.ecoAcceptOpen);
    this.updateCompanySettings(companyId, compSettingsPayloads.kodiak.SSOEnabled);
    this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
  }

  updateMerlinlabsSettings(companyId, enableCustomCategory = true) {
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, merlinlabsCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType('DEFAULT'));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("activeScheme", "DEFAULT"));
    this.updateCompanySettings(companyId, compSettingsPayloads.revSchemeType('ALPHA-BETA-AB'));
    this.updateCompanySettings(companyId, compSettingsPayloads.isConfigurationsEnabled(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
    this.updateCompanySettings(companyId, {"property": "allowedDocTypes", "value": ["GENERIC", "DATASHEET", "PRODUCT LITERATURE", "GERBER", "BOARD FILE", "CAD", "SPECIFICATION",
                                            "CERTIFICATION", "PROCEDURE", "TEST PLAN", "QUOTE", "ARTWORK", "DRAWING", "FORM", "INSTRUCTIONS", "ASSEMBLY DRAWING", "STEP", "SCHEMATIC",
                                            "TEST REPORT", "TEMPLATE", "REQUEST FOR PROPOSAL (RFP)", "POLICY", "MEMO", "PROJECT DOCUMENT", "FILE - SOURCE", "FILE - REDLINE",
                                            "FILE - VIEW ONLY", "ACCEPTANCE DATA", "BUILD RECORD", "CHECKLIST", "IMAGE", "DIAGRAM", "SOFTWARE", "REQUIREMENTS"]});
  }

  deleteCompany(companyId, orgId) {
    propelAuthApi.deleteAllUsersInOrg(orgId);
    propelAuthApi.deleteCompany(orgId);
    this.deleteCompanyFromDB(companyId);
  }

  uploadCustomCategories(companyId, categories) {
    const headers = {
      'Content-Type': 'application/json',
      'token': token
    }

    const path = '/v1/bertha/company/categories/upload';

    const body = {"companyId": companyId, "categories": categories};

    const successMsg = 'Updated custom categories'
    const failureMsg = 'Failed to update custom categories'

    cy.wait(3000);
    return cy.request({
      method: 'POST',
      url: apiUrl + path,
      headers: headers,
      body: body,
      retryOnStatusCodeFailure: true
    }).then((res)=>{
      expect(res.status === 200 ? successMsg : failureMsg).to.eq(successMsg);
    })  
  }

  updateRoomCompanySettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_6_DIGIT_PREFIX_AND_COUNTER);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, roomCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType("WITH-6-DIGIT-PREFIX-AND-COUNTER"));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("activeScheme", "EXTRA-TWO-DIGIT-VARIANT"));
  }

  updateFortemCompanySettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.CUSTOM_CODE_WITH_9_DIGIT);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, fortemCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType("CUSTOM-CODE-WITH-9-DIGIT"));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("activeScheme", "EXTRA-TWO-DIGIT-VARIANT"));
  }

  updateAferoCompanySettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.CUSTOM_CODE_WITH_11_DIGIT);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, aferoCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType('CUSTOM-CODE-WITH-11-DIGIT'));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("activeScheme", "EXTRA-TWO-DIGIT-VARIANT"));
  }

  updateArevoCompanySettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.CUSTOM_CODE_WITH_10_DIGIT);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, arevoCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType('CUSTOM-CODE-WITH-10-DIGIT'));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("activeScheme", "EXTRA-TWO-DIGIT-VARIANT"));
  }

  updateSpheroCompanySettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.FREE_FORM);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, spheroCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType("FREE-FORM"));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("activeScheme", "DEFAULT"));
  }

  updatePressoCompanySettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, pressoCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType("WITH-1-OR-3-DIGIT-PREFIX-AND-6-DIGIT-COUNTER"));
  }

  updateNonIntelligentCompanySettings
    (companyId, data = {counterLength: "5", counterStartingIndex: "10000", isAllowedAlphabetInVariant: false, variantStartingIndex: "01"}) {
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(false));
    this.updateCompanySettings(companyId, compSettingsPayloads.nonIntelligentCpn("counterLength", data.counterLength));
    this.updateCompanySettings(companyId, compSettingsPayloads.nonIntelligentCpn("counterStartingIndex", data.counterStartingIndex));
    this.updateCompanySettings(companyId, compSettingsPayloads.nonIntelligentCpn("isAllowedAlphabetInVariant", data.isAllowedAlphabetInVariant));
    this.updateCompanySettings(companyId, compSettingsPayloads.nonIntelligentCpn("variantStartingIndex", data.variantStartingIndex));
  }

  updateOrbitFabCompanySettings(companyId, enableCustomCategory = true) {
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, orbitFabCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.isIntelligentCpnScheme(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType("DEFAULT"));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("activeScheme", "DEFAULT"));
    this.updateCompanySettings(companyId, compSettingsPayloads.is_DCO_enabled(true));
  }

  updateFormCompanySettings(companyId, enableCustomCategory = true) {
    cpnLibraries.set_CPN_rules(CPN_rules.FORM_ATHLETICA);
    if(enableCustomCategory) {
      this.updateCompanySettings(companyId, compSettingsPayloads.enableCustomCategory);
      this.uploadCustomCategories(companyId, formCategories.categories);
    }
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnType("DEFAULT"));
    this.updateCompanySettings(companyId, compSettingsPayloads.cpnScheme("isActive", false));
    this.updateCompanySettings(companyId, compSettingsPayloads.revSchemeType("NUMERIC-ALPHA-XY"));
    this.updateCompanySettings(companyId, compSettingsPayloads.buildScheduleScheme('DEFAULT'));
    this.updateCompanySettings(companyId, compSettingsPayloads.is_DCO_enabled(true));
    this.updateCompanySettings(companyId, compSettingsPayloads.isConfigurationsEnabled(false));
    this.updateCompanySettings(companyId, compSettingsPayloads.coCommentMandatoryEnabled(false));
    // this.updateCompanySettings(companyId, compSettingsPayloads.isSpecValidationEnabled(false));
    // this.updateCompanySettings(companyId, compSettingsPayloads.defaultBlacklistedRevisions("[I, O, Q, S, X, Z]"));
  }
}
