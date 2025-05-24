export default {
  DEFAULT_WITH_EXTRA_TWO_DIGIT_VARIANT: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"-",
            counterLength:5,
            counterStart:"00001",
            forceVariant:true,
            hideVariantStart:false,
            prefixDelimiter:"-",
            prefixLength:3,
            useCategoryPrefix:true,
            variantLength:2,
            variantStart:"00",
          },
          product: {
            prefix:"999",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  CUSTOM_CODE_WITH_9_DIGIT: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"-",
            counterLength:4,
            counterStart:"0001",
            hideVariantStart:true, 
            forceVariant:true,
            prefixDelimiter:"-",
            prefixLength:3,
            useCategoryPrefix:true,
            variantLength:2,
            variantStart:"00",
          },
          product: {
            prefix:"999",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  CUSTOM_CODE_WITH_10_DIGIT: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"-",
            counterLength:5,
            counterStart:"00001",
            forceVariant:true,
            hideVariantStart:false,
            prefixDelimiter:"-",
            prefixLength:3,
            useCategoryPrefix:true,
            variantLength:2,
            variantStart:"00",
          },
          product: {
            prefix:"999",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  CUSTOM_CODE_WITH_11_DIGIT: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"-",
            counterLength:5,
            counterStart:"00001",
            forceVariant:true,
            hideVariantStart:false,
            prefixDelimiter:"-",
            prefixLength:5,
            useCategoryPrefix:true,
            variantLength:2,
            variantStart:"00",
          },
          product: {
            prefix:"A-FGS",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  WITH_7_DIGIT_COUNTER: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"",
            counterLength:7,
            counterStart:"0000001",
            forceVariant:false,
            hideVariantStart:false,
            prefixDelimiter:"-",
            prefixLength:3,
            useCategoryPrefix:true,
            variantLength:0,
            variantStart:"",
          },
          product: {
            prefix:"999",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  WITH_6_DIGIT_PREFIX_AND_COUNTER: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"-",
            counterLength:4,
            counterStart:"0001",
            forceVariant:true,
            hideVariantStart:false,
            prefixDelimiter:"",
            prefixLength:2,
            useCategoryPrefix:true,
            variantLength:2,
            variantStart:"01",
          },
          product: {
            prefix:"15",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  FREE_FORM: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"",
            counterLength:40,
            counterPassThru:true,
            counterStart:"",
            prefixDelimiter:"-",
            prefixLength:0,
            tempCounterLength:5,
            tempPrefix:"TMP",
            useCategoryPrefix:false,
            variantLength:0,
            variantStart:"",
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  PROD_WITH_PREFIX_900: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"",
            counterLength:5,
            counterStart:"00001",
            prefixDelimiter:"-",
            prefixLength:3,
            useCategoryPrefix:true,
            variantLength:0,
            variantStart:"",
          },
          product: {
            prefix:"900",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  WITH_1_OR_3_DIGIT_PREFIX_AND_6_DIGIT_COUNTER: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"",
            counterLength:6,
            counterStart:"000001",
            prefixDelimiter:"-",
            prefixLength:3,
            useCategoryPrefix:true,
            variantLength:0,
            variantStart:"",
          },
          product: {
            prefix:"999",
            prefixLength:3,
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  CONDITIONAL_01_VARIANT: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"-",
            counterLength:5,
            counterStart:"00001",
            forceVariant:true,
            hideVariantStart:true,
            prefixDelimiter:"-",
            prefixLength:3,
            useCategoryPrefix:true,
            variantLength:2,
            variantStart:"01",
          },
          product: {
            prefix:"999",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  ONE_DIGIT_PREFIX_AND_5_DIGIT_COUNTER: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"",
            counterLength:5,
            counterStart:"00001",
            prefixDelimiter:"",
            prefixLength:1,
            useCategoryPrefix:true,
            variantLength:0,
            variantStart:"",
          },
          product: {
            prefix:"999",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  HYBRID_WITH_6_DIGIT_CPN: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"-",
            counterLength:5,
            counterStart:"10001",
            prefixDelimiter:"",
            prefixLength:1,
            useCategoryPrefix:true,
            variantLength:0,
            variantStart:"",
          },
          product: {
            prefix:"1",
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  NON_INTELLIGENT_CPN_WITHOUT_VARIANT: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter:"",
            counterLength:5,
            counterStart:"10000",
            forceVariant:false,
            prefixDelimiter:"",
            prefixLength:0,
            useCategoryPrefix:false,
            variantLength:0,
            variantStart:"00",
          },
          product: {
            prefix:"",
            prefixLength:0,
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  NON_INTELLIGENT_CPN_WITH_VARIANT: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: { 
            counterDelimiter: "-",
            counterLength: 5,
            counterStart: "10000",
            prefixDelimiter: "",
            prefixLength: 0,
            useCategoryPrefix: false,
            variantLength: 2,
            variantStart: "00",
            forceVariant: true
          },
          product: {
            prefix:"",
            prefixLength:0,
            useCategoryPrefix:false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  },

  FORM_ATHLETICA: {
    query:`mutation {
      createLibrary(input: {
        name: "My Library"
        cpnRules: {
          base: {
            counterDelimiter: "",
            counterLength: 5,
            counterStart: "00001",
            prefix: "",
            prefixDelimiter: "-",
            prefixLength: 3,
            useCategoryPrefix: true,
            variantLength: 0,
            variantStart: ""
          },
          product: {
            prefix: "999",
            useCategoryPrefix: false
          }
        }
        description:"Company general lib"
        type:GENERAL
        setAsActive: true
      })
      { id name }
    }`
  }
}
