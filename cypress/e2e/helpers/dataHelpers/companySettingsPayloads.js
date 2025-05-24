export default {
  enableErpItemTypeOptions: {"property": "erpItemTypeOptions", "value": ["STANDARD", "SERIALIZED", "LOT_TRACKED", "NON_INVENTORY"]},
 
  cana: {
    cpnType               : {"property": "cpnType", "value": "CONDITIONAL-01-VARIANT"},
    intelligentCpnScheme  : {"property": "isIntelligentCpnScheme", "value": true},
    cpnScheme             : {"property": "cpnScheme", "subProperty": "activeScheme", "value": "EXTRA-TWO-DIGIT-VARIANT" },
    revSchemeType         : {"property": "revSchemeType", "value": "DEFAULT"},
    ecoAcceptOpen         : {"property": "ecoAcceptOpen", "value": true},
    SSODisabled           : {"property": "isSSOEnabled", "value": false},
  },

  kodiak: {
    cpnType               : {"property": "cpnType", "value": "HYBRID-WITH-6-DIGIT-CPN"},
    intelligentCpnScheme  : {"property": "isIntelligentCpnScheme", "value": false},
    cpnScheme             : {"property": "cpnScheme", "subProperty": "activeScheme", "value": "DEFAULT"},
    revSchemeType         : {"property": "revSchemeType", "value": "NUMERIC-ALPHA-XY"},
    ecoAcceptOpen         : {"property": "ecoAcceptOpen", "value": false},
    SSOEnabled            : {"property": "isSSOEnabled", "value": true},
  },

  enableCustomCategory    : {"property": "isEnabledCustomCategory", "value": true},
  enableRefDesInAssembly  : {"property": "displayRefDesAndItemNumber", "value": true},
  enableValispace         : {"property": "isValispaceEnabled", value: true},
  disableValispace        : {"property": "isValispaceEnabled", value: false},

  massPrecisionValue            : (precesion) => `{"property": "massPrecisionValue", "value": "${precesion}"}`,
  defaultCurrency               : (currency) => `{"property": "defaultCurrency", "value": "${currency}"}`,
  cpnType                       : (type) => `{"property": "cpnType", "value": "${type}"}`,
  docTypes                      : (types) => `{"property": "allowedDocTypes", "value": "${types}"}`,
  revSchemeType                 : (schemeType) => `{"property": "revSchemeType", "value": "${schemeType}"}`,
  defaultBlacklistedRevisions   : (revisions) => `{"property": "defaultBlacklistedRevisions", "value": ${revisions}}`,
  cpnScheme                     : (schemeType, value) => `{"property": "cpnScheme", "subProperty": "${schemeType}", "value": "${value}"}`,
  isNotRevisionManagedEnabled   : (value) => `{"property": "isNotRevisionManagedEnabled", "value": "${value}"}`,
  documentMaxSize               : (fileSize) => `{"property": "maxFileSize", "value": "${fileSize}"}`,
  ecoDefaultApproval            : (approvalType) => `{"property": "ecoDefaultApproval", "value": "${approvalType}"}`,
  unitPricePrecision            : (value) => `{"property": "unitPricePrecision", "value": "${value}"}`,
  shouldAutoSelectRolledUpCost  : (value) => `{"property": "shouldAutoSelectRolledUpCost",  "value": "${value}"}`,
  isIntelligentCpnScheme        : (value) => `{"property": "isIntelligentCpnScheme", "value": ${value}}`,
  nonIntelligentCpn             : (property, value) => `{"property": "nonIntelligent", "subProperty": "${property}", "value": "${value}"}`,
  customUomLabels               : (units) => `{"property": "customUomLabels", "value": ${JSON.stringify(units)}}`,
  customFields                  : (value) => `{"property": "customFields", "value": ${JSON.stringify(value)}}`,
  buildScheduleScheme           : (value) => `{"property": "buildScheduleScheme", "value": "${value}"}`,
  is_DCO_enabled                : (value) => `{"property": "isDcoEnabled", "value": ${value}}`,
  isSpecValidationEnabled       : (value) => `{"property": "isSpecValidationEnabled", "value": ${value}}`,
  isConfigurationsEnabled       : (value) => `{"property": "configurations", "subProperty": "isConfigurationsEnabled", "value": ${value}}`,
  coCommentMandatoryEnabled     : (value) => `{"property": "configurations", "subProperty": "coCommentMandatoryEnabled", "value": ${value}}`,

  massUnit: {
    kiloGrams: {"property": "massUnit", "value": "KILOGRAMS"},
    grams: {"property": "massUnit", "value": "GRAMS"},
  },
}
