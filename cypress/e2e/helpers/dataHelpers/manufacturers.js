export class ManufacturesData {
  manufacturesData(data) {
    let options = {
      manufacturer: '',
      mpn: '',
      datasheet: '',
      distributor: '',
      dpn: '',
      package: '',
      packageQuantity: '',
      minQuantity: '',
      unitPrice: '',
      quoteLeadTime: 0,
      quoteLeadTimeUnit: 'DAYS'
    }

    for (let property in data) { 
      options[property] = data[property];
    }

    if(options.quoteLeadTimeUnit == '') {
      options.quoteLeadTimeUnit = 'DAYS'
    }

    if(options.quoteLeadTime == '') {
      options.quoteLeadTime = 0
    }

    return [
      {
      "expanded": true,
      "name": options.manufacturer,
      "description": "",
      "leadTime": {},
      "mpn": {
        "value": "",
        "src": "",
        "key": options.mpn
      },
      "datasheet": {
        "src": options.datasheet
      },
      "distributors": [
        {
          "expanded": true,
          "name": options.distributor,
          "description": "",
          "dpn": {
            "key": options.dpn,
            "src": ""
          },
          "package": {
            "type": options.package,
            "quantity": options.packageQuantity
          },
          "quotes": [
            {
              "expanded": true,
              "minQuantity": options.minQuantity,
              "unitPrice": options.unitPrice,
              "leadTime": {
                "value": options.quoteLeadTime,
                "units": options.quoteLeadTimeUnit,
                "valueInDays": options.quoteLeadTime,
              },
              "isPrimary": false,
              "isNewlyCreated": true,
              "uniqueId": "",
              "inputs": {
                "minQuantity": {
                  "value": options.minQuantity,
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "unitPrice": {
                  "value": options.unitPrice,
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "leadTime": {
                  "value": options.quoteLeadTime,
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "leadTimeUnit": {
                  "value": options.quoteLeadTimeUnit,
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "lastUpdated": {
                  "value": "",
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "isPrimary": {
                  "value": false,
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "isChecked": {
                  "value": false,
                  "message": "",
                  "class": "",
                  "valid": true
                }
              },
              "modified": true
            }
          ],
          "class": "expanded",
          "inputs": {
            "name": {
              "value": options.distributor,
              "message": "",
              "class": "",
              "valid": true
            },
            "dpn": {
              "key": {
                "value": options.dpn,
                "message": "",
                "class": "",
                "valid": true
              },
              "src": {
                "value": "",
                "message": "",
                "class": "",
                "valid": true,
                "active_class": "empty"
              }
            },
            "package": {
              "type": {
                "value": options.package,
                "message": "",
                "class": "",
                "valid": true
              },
              "quantity": {
                "value": options.packageQuantity,
                "message": "",
                "class": "",
                "valid": true
              }
            },
            "description": {
              "value": "",
              "message": "",
              "class": "",
              "valid": true
            },
            "quotes": {
              "value": [
                {
                  "expanded": true,
                  "minQuantity": options.minQuantity,
                  "unitPrice": options.unitPrice,
                  "leadTime": {
                    "value": options.quoteLeadTime,
                    "units": options.quoteLeadTimeUnit,
                    "valueInDays": options.quoteLeadTime
                  },
                  "isPrimary": false,
                  "isNewlyCreated": true,
                  "uniqueId": "",
                  "inputs": {
                    "minQuantity": {
                      "value": options.minQuantity,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "unitPrice": {
                      "value": options.unitPrice,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "leadTime": {
                      "value": options.quoteLeadTime,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "leadTimeUnit": {
                      "value": options.quoteLeadTimeUnit,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "lastUpdated": {
                      "value": "",
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "isPrimary": {
                      "value": false,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "isChecked": {
                      "value": false,
                      "message": "",
                      "class": "",
                      "valid": true
                    }
                  },
                  "modified": true
                }
              ],
              "valid": true
            }
          }
        }
      ],
      "class": "expanded ",
      "inputs": {
        "name": {
          "value": "Yageo",
          "message": "",
          "class": "",
          "valid": true
        },
        "mpn": {
          "key": {
            "value": options.mpn,
            "message": "",
            "class": "",
            "valid": true,
            "alreadyUsedMpn": false,
            "alreadyUsedMpnData": null
          },
          "src": {
            "value": "",
            "message": "",
            "class": "",
            "active_class": "empty",
            "valid": true
          }
        },
        "description": {
          "value": "",
          "message": "",
          "class": "",
          "valid": true
        },
        "datasheet": {
          "src": {
            "value": options.datasheet,
            "message": "",
            "class": "",
            "valid": true,
            "active_class": ""
          }
        },
        "distributors": {
          "value": [
            {
              "expanded": true,
              "name": options.distributor,
              "description": "",
              "dpn": {
                "key": options.dpn,
                "src": ""
              },
              "package": {
                "type": options.package,
                "quantity": options.packageQuantity
              },
              "quotes": [
                {
                  "expanded": true,
                  "minQuantity": options.minQuantity,
                  "unitPrice": options.unitPrice,
                  "leadTime": {
                    "value": options.quoteLeadTime,
                    "units": options.quoteLeadTimeUnit,
                    "valueInDays": options.quoteLeadTime
                  },
                  "isPrimary": false,
                  "isNewlyCreated": true,
                  "uniqueId": "",
                  "inputs": {
                    "minQuantity": {
                      "value": options.minQuantity,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "unitPrice": {
                      "value": options.unitPrice,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "leadTime": {
                      "value": options.quoteLeadTime,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "leadTimeUnit": {
                      "value": options.quoteLeadTimeUnit,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "lastUpdated": {
                      "value": "",
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "isPrimary": {
                      "value": false,
                      "message": "",
                      "class": "",
                      "valid": true
                    },
                    "isChecked": {
                      "value": false,
                      "message": "",
                      "class": "",
                      "valid": true
                    }
                  },
                  "modified": true
                }
              ],
              "class": "expanded",
              "inputs": {
                "name": {
                  "value": options.distributor,
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "dpn": {
                  "key": {
                    "value": options.dpn,
                    "message": "",
                    "class": "",
                    "valid": true
                  },
                  "src": {
                    "value": "",
                    "message": "",
                    "class": "",
                    "valid": true,
                    "active_class": "empty"
                  }
                },
                "package": {
                  "type": {
                    "value": options.package,
                    "message": "",
                    "class": "",
                    "valid": true
                  },
                  "quantity": {
                    "value": options.packageQuantity,
                    "message": "",
                    "class": "",
                    "valid": true
                  }
                },
                "description": {
                  "value": "",
                  "message": "",
                  "class": "",
                  "valid": true
                },
                "quotes": {
                  "value": [
                    {
                      "expanded": true,
                      "minQuantity": options.minQuantity,
                      "unitPrice": options.unitPrice,
                      "leadTime": {
                        "value": options.quoteLeadTime,
                        "units": options.quoteLeadTimeUnit,
                        "valueInDays": options.quoteLeadTime
                      },
                      "isPrimary": false,
                      "isNewlyCreated": true,
                      "uniqueId": "",
                      "inputs": {
                        "minQuantity": {
                          "value": options.minQuantity,
                          "message": "",
                          "class": "",
                          "valid": true
                        },
                        "unitPrice": {
                          "value": options.unitPrice,
                          "message": "",
                          "class": "",
                          "valid": true
                        },
                        "leadTime": {
                          "value": options.quoteLeadTime,
                          "message": "",
                          "class": "",
                          "valid": true
                        },
                        "leadTimeUnit": {
                          "value": options.quoteLeadTimeUnit,
                          "message": "",
                          "class": "",
                          "valid": true
                        },
                        "lastUpdated": {
                          "value": "",
                          "message": "",
                          "class": "",
                          "valid": true
                        },
                        "isPrimary": {
                          "value": false,
                          "message": "",
                          "class": "",
                          "valid": true
                        },
                        "isChecked": {
                          "value": false,
                          "message": "",
                          "class": "",
                          "valid": true
                        }
                      },
                      "modified": true
                    }
                  ],
                  "valid": true
                }
              }
            }
          ],
          "valid": true
        }
      }
      }
    ]
  }
}
