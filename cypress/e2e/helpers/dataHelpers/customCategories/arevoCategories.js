export default {
// ===========================================================
// ===================== ASSEMBLY ============================
// ===========================================================
  categories: [
    {
      name        : "Build Kit",
      shortName   : "BUILD KIT",
      code        : "060",
      specs       :
      {
        names:
        [
          "Kit Name",
        ],
        options:
        {
          required: []
        }
      },
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Cable Assembly",
      shortName   : "CABLE",
      code        : "020",
      specs       :
      {
        names:
        [
          "Length",
          "Conductors",
          "Connectors"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "EBOM",
      shortName   : "EBOM",
      code        : "003",
      specs       :  {},
      tags        : ["MCAD"],
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Inseparable Assembly",
      shortName   : "INS ASSEMBLY",
      code        : "002",
      specs       : {},
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "MBOM",
      shortName   : "MBOM",
      code        : "004",
      specs       :  {},
      tags        : ["MCAD"],
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Packaging Assembly",
      shortName   : "APKG",
      code        : "030",
      specs       :
      {
        names:
        [
          "Material",
          "Width",
          "Length",
          "Height"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "PCBA",
      shortName   : "PCBA",
      code        : "010",
      specs       : {},
      tags        : ["MCAD"],
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Service Bundle",
      shortName   : "SERVICE BUNDLE",
      code        : "080",
      specs       : {},
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Service/Support",
      shortName   : "SERVICE",
      code        : "081",
      specs       : {},
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Spare Kit",
      shortName   : "SPARE KIT",
      code        : "050",
      specs       : {},
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Sub Assembly",
      shortName   : "SUBASSEMBLY",
      code        : "001",
      specs       :
      {},
      tags        : ["MCAD"],
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "System Assembly",
      shortName   : "SYS ASSEMBLY",
      code        : "091",
      specs       :
      {},
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Test System",
      shortName   : "TEST SYS",
      code        : "070",
      specs       : {},
      tags        : ["MCAD"],
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Tool Kit",
      shortName   : "TOOL KIT",
      code        : "040",
      specs       : {},
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Top Level Assembly",
      shortName   : "TLA",
      code        : "090",
      specs       :
      {},
      type: "ASSEMBLY",
      unitOfMeasure: "EACH"
    },
// ===========================================================
// ===================== Electrical ==========================
// ===========================================================
    {
      name        : "Audio",
      shortName   : "AUDIO",
      code        : "210",
      specs       :
      {
        names:
        [
          "Input Type",
          "Voltage",
          "Technology"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Battery",
      shortName   : "BATT",
      code        : "211",
      specs       :
      {
        names:
        [
          "Chemistry",
          "Voltage",
          "Capacity",
          "Peak Current",
          "Size",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Cable Management",
      shortName   : "CABLE MGMT",
      code        : "212",
      specs       :
      {
        names:
        [
          "Type",
          "Dimensions"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Capacitor",
      shortName   : "CAP",
      code        : "213",
      specs       :
      {
        names:
        [
          "Capacitance",
          "Package",
          "Voltage",
          "Tolerance",
          "Type",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Charger",
      shortName   : "CHGR",
      code        : "214",
      specs       :
      {
        names:
        [
          "Type",
          "Voltage Out",
          "Voltage In",
          "Charger Current"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Circuit Breaker",
      shortName   : "CRCT BRK",
      code        : "215",
      specs       :
      {
        names:
        [
          "Voltage",
          "Frequency",
          "Break-Through Current",
          "Reset Style",
          "Number of Poles",
          "Mounting Type",
          "Dimensions"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Choke",
      shortName   : "CHOKE",
      code        : "216",
      specs       :
      {
        names:
        [
          "Inductance",
          "Type",
          "Voltage Rating",
          "Current Rating"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Computer/PLC",
      shortName   : "PLC",
      code        : "217",
      specs       :
      {
        names:
        [
          "Brand",
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Computer Peripheral",
      shortName   : "COMP PERIPH",
      code        : "218",
      specs       : {},
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Connector",
      shortName   : "CONN",
      code        : "219",
      specs       :
      {
        names:
        [
          "Conductors",
          "Pitch",
          "Contact Type",
          "Mount"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Custom Semiconductor",
      shortName   : "CUST SEMI",
      code        : "220",
      specs       : {},
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Crystal",
      shortName   : "XTAL",
      code        : "221",
      specs       :
      {
        names:
        [
          "Frequency",
          "Stability",
          "Tolerance",
          "Capacitance",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Diode",
      shortName   : "DIODE",
      code        : "222",
      specs       :
      {
        names:
        [
          "Type",
          "Voltage Reverse",
          "Voltage Forward",
          "Package",
          "Current",
          "TRR"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Filter",
      shortName   : "FILTER",
      code        : "223",
      specs       :
      {
        names:
        [
          "Frequency",
          "Bandwidth",
          "Type"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Fuse",
      shortName   : "FUSE",
      code        : "224",
      specs       :
      {
        names:
        [
          "Current Rating",
          "Voltage",
          "Response Time",
          "Package",
          "Breaking Capacity"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "IC",
      shortName   : "IC",
      code        : "225",
      specs       :
      {
        names:
        [
          "Type",
          "Pins",
          "Package",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Inductor",
      shortName   : "INDUCTOR",
      code        : "226",
      specs       :
      {
        names:
        [
          "Type",
          "Material Core",
          "Inductance",
          "Tolerance",
          "Current Rating",
          "Package"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Isolator",
      shortName   : "ISOLATOR",
      code        : "227",
      specs       :
      {
        names:
        [
          "Type",
          "Number of Channels",
          "Voltage Isolation",
          "Data Rate"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Jumper",
      shortName   : "JUMPER",
      code        : "228",
      specs       :
      {
        names:
        [
          "Type",
          "Gender",
          "Pins",
          "Package"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "LED",
      shortName   : "LED",
      code        : "229",
      specs       :
      {
        names:
        [
          "Type",
          "Color",
          "Current",
          "Forward Voltage",
          "Package"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Memory",
      shortName   : "MEMORY",
      code        : "230",
      specs       :
      {
        names:
        [
          "Format",
          "Type",
          "Size",
          "Interface",
          "Pins",
          "Package",
          "Speed",
          "Voltage Supply Min",
          "Voltage Supply Max",
          "Operating Temperature Min.",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Miscellaneous Electrical",
      shortName   : "MISC ELEC",
      code        : "231",
      specs       : {},
      tags        : ["MCAD"],
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Op Amp",
      shortName   : "OPAMP",
      code        : "232",
      specs       :
      {
        names:
        [
          "Type",
          "Number of Circuits",
          "Pins",
          "Package",
          "Current Supply",
          "Current Output Per Channel",
          "Voltage Supply",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Oscillator",
      shortName   : "OSC",
      code        : "233",
      specs       :
      {
        names:
        [
          "Frequency",
          "Voltage",
          "Pins",
          "Package",
          "Stability",
          "Temperature",
          "Current",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "PCB",
      shortName   : "PCB",
      code        : "234",
      specs       :
      {
        names:
        [
          "Width",
          "Length",
          "Height",
          "Layers",
          "Material",
          "Flammability"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Potentiometer",
      shortName   : "POT",
      code        : "235",
      specs       :
      {
        names:
        [
          "Type",
          "Resistance",
          "Package",
          "Tolerance",
          "Power"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Power Supply",
      shortName   : "POW",
      code        : "236",
      specs       :
      {
        names:
        [
          "Type",
          "Number of Outputs",
          "Voltage Input",
          "Voltage Output",
          "Current Output",
          "Power",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Relay",
      shortName   : "RELAY",
      code        : "237",
      specs       :
      {
        names:
        [
          "Type",
          "Package",
          "Coil Type",
          "Coil Current",
          "Coil Voltage",
          "Contact Form",
          "Contact Rating",
          "Switching Voltage",
          "Turn On Voltage"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Resistor",
      shortName   : "RES",
      code        : "238",
      specs       :
      {
        names:
        [
          "Resistance",
          "Tolerance",
          "Package",
          "Power",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "RF",
      shortName   : "RF",
      code        : "239",
      specs       :
      {
        names:
        [
          "Type",
          "Package"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Sensor",
      shortName   : "SENSOR",
      code        : "240",
      specs       :
      {
        names:
        [
          "Type",
          "Package"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Speaker",
      shortName   : "SPEAKER",
      code        : "241",
      specs       :
      {
        names:
        [
          "Type",
          "Wattage",
          "Size",
          "Impedance"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Surge Suppression",
      shortName   : "SURGESURP",
      code        : "242",
      specs       :
      {
        names:
        [
          "type",
          "Voltage Clamping",
          "Package"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Switch",
      shortName   : "SWITCH",
      code        : "243",
      specs       :
      {
        names:
        [
          "Circuit",
          "Function",
          "Current",
          "Voltage AC",
          "Voltage DC",
          "Mounting Type"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Terminal Block",
      shortName   : "TRML BLK",
      code        : "244",
      specs       :
      {
        names:
        [
          "Mounting Type",
          "Number of Circuits",
          "Current per Circuit",
          "For Wire Gauge",
          "Voltage"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Transducer",
      shortName   : "TRANSDUCER",
      code        : "245",
      specs       :
      {
        names:
        [
          "Type",
          "Output",
          "Voltage",
          "Package",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Transformer",
      shortName   : "XFMR",
      code        : "246",
      specs       :
      {
        names:
        [
          "Voltage Primary",
          "Voltage Secondary",
          "Current",
          "Package",
          "Winding Primary",
          "Winding Secondary",
          "Power",
          "Voltage Isolation"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Transistor",
      shortName   : "TRANSISTOR",
      code        : "247",
      specs       :
      {
        names:
        [
          "Type",
          "Current",
          "Package",
          "voltage"
        ],
        options:
        {
          required: []
        }
      },
      type: "ELECTRICAL",
      unitOfMeasure: "EACH"
    },
    { 
      name        : "Wire",
      shortName   : "WIRE",
      code        : "248",
      specs       :
      {
        names:
        [
          "Length",
          "Gauge",
          "Strands",
          "Color",
          "Current",
          "Voltage",
          "Insulation"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "ELECTRICAL",
      unitOfMeasure: "INCHES"
    },
// ===========================================================
// ===================== MECHANICAL ==========================
// ===========================================================
    {
      name        : "Arevo CFRP Part",
      shortName   : "Arevo CFRP",
      code        : "105",
      specs       :
      {
        names:
        [
          "Material",
          "Construction",
          "Finish"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Ball Bearing",
      shortName   : "BEARING",
      code        : "102",
      specs       :
      {
        names:
        [
          "Type",
          "Trade Number",
          "For Shaft Dia",
          "For Housing ID",
          "Width",
          "Ring Material"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Belt",
      shortName   : "BELT",
      code        : "103",
      specs       :
      {
        names:
        [
          "Trade Number",
          "Length",
          "Material",
          "Width",
          "Pitch",
          "Number of Teeth",
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Bolt",
      shortName   : "BOLT",
      code        : "106",
      specs       :
      {
        names:
        [
          "Thread Size",
          "Length",
          "Material",
          "Head Type",
          "Drive Style",
          "Thread Direction"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Clamp",
      shortName   : "CLAMP",
      code        : "107",
      specs       :
      {
        names:
        [
          "Material",
          "For Use With",
          "SAE No.",
          "Clamp ID Range",
          "Max. Torque",
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Conduit",
      shortName   : "CONDUIT",
      code        : "108",
      specs       :
      {
        names:
        [
          "Type",
          "Material",
          "Conduit Trade Size",
          "Flexibility",
          "ID",
          "OD",
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "INCHES"
    },
    {
      name        : "Cylinder",
      shortName   : "CYLINDER",
      code        : "109",
      specs       :
      {
        names:
        [
          "Style",
          "Bore Diameter",
          "Max. Push/Pull Force",
          "Retracted Length",
          "Extended Length",
          "Width",
          "Height"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Damper",
      shortName   : "DAMPER",
      code        : "110",
      specs       :
      {
        names:
        [
          "Material",
          "Texture",
          "Thickness",
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Dowel",
      shortName   : "DOWEL",
      code        : "111",
      specs       :
      {
        names:
        [
          "Material",
          "OD",
          "Length",
          "Breaking Tolerance"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "FEET"
    },
    {
      name        : "Enclosure",
      shortName   : "ENCLOSURE",
      code        : "112",
      specs       :
      {
        names:
        [
          "Material",
          "Height",
          "Width",
          "Length"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Fabricated Metal",
      shortName   : "FAB METAL",
      code        : "101",
      specs       :
      {
        names:
        [
          "Material",
          "Construction",
          "Finish"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Fabricated Other",
      shortName   : "FAB OTHER",
      code        : "113",
      specs       :
      {
        names:
        [
          "Material",
          "Construction",
          "Finish"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Fabricated Plastic",
      shortName   : "FAB PLASTIC",
      code        : "104",
      specs       :
      {
        names:
        [
          "Material",
          "Construction",
          "Finish"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Fan",
      shortName   : "FAN",
      code        : "114",
      specs       :
      {
        names:
        [
          "Type",
          "Height",
          "Width",
          "Blade Material",
          "Voltage",
          "Current",
          "Power"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Fitting",
      shortName   : "FITTING",
      code        : "115",
      specs       :
      {
        names:
        [
          "Shape",
          "Connection Type",
          "Connection Style",
          "For Tube OD",
          "Pipe Size",
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Gasket",
      shortName   : "GASKET",
      code        : "116",
      specs       :
      {
        names:
        [
          "Shape",
          "For Pipe Size",
          "OD",
          "ID",
          "Length",
          "Width",
          "Thickness",
          "Material"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Gauge/Regulator/Filter",
      shortName   : "GAUGE",
      code        : "117",
      specs       :
      {
        names:
        [
          "Measures",
          "Display Type",
          "Measurement Scale",
          "Connection Type"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Hose/Pipe",
      shortName   : "HOSE",
      code        : "118",
      specs       :
      {
        names:
        [
          "Connection Type",
          "Thread Type",
          "ID",
          "OD",
          "Max. Pressure",
          "Bend Radius"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "FEET"
    },
    {
      name        : "Insert",
      shortName   : "INSERT",
      code        : "119",
      specs       :
      {
        names:
        [
          "Material",
          "For Max. Hole Diameter",
          "Thread Type",
          "Thread Size",
          "Installed Length"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Miscellaneous Mechanical",
      shortName   : "MISC MECH",
      code        : "120",
      specs       :
      {},
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Motor",
      shortName   : "MOTOR",
      code        : "121",
      specs       :
      {
        names:
        [
          "Type",
          "RPM",
          "Power",
          "Voltage Rating",
          "Size",
          "Operating Temperature Min",
          "Operating Temperature Max"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Nozzle",
      shortName   : "NOZZLE",
      code        : "122",
      specs       :
      {
        names:
        [
          "Type",
          "Airflow Pattern",
          "Length",
          "Inlet OD",
          "Thread",
          "Thread Direction",
          "Tip Dimensions"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Nut",
      shortName   : "NUT",
      code        : "123",
      specs       :
      {
        names:
        [
          "Thread Size",
          "Thread Type",
          "Height",
          "Thread Direction",
          "Material",
          "Width",
          "Nut Type"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Optic",
      shortName   : "OPTIC",
      code        : "124",
      specs       :
      {
        names:
        [
          "Type"
        ],
        options:
        {
          required:
          [
            "Type"
          ]
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "O-Ring",
      shortName   : "O-RING",
      code        : "125",
      specs       :
      {
        names:
        [
          "Material",
          "OD",
          "ID",
          "Width",
          "Hardness"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Pin",
      shortName   : "PIN",
      code        : "126",
      specs       :
      {
        names:
        [
          "Material",
          "OD",
          "Length",
          "Breaking Strength"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Pulley",
      shortName   : "PULLEY",
      code        : "127",
      specs       :
      {
        names:
        [
          "Pulley OD",
          "For Belt OD",
          "For Shaft OD",
          "Width",
          "Number of Teeth",
          "Pitch"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Retaining Ring",
      shortName   : "RING",
      code        : "128",
      specs       :
      {
        names:
        [
          "Material",
          "Grade",
          "For Groove Diameter",
          "For Groove Width",
          "OD",
          "Thickness"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Rivet",
      shortName   : "RIVET",
      code        : "129",
      specs       :
      {
        names:
        [
          "Type",
          "Material",
          "For Material Thickness",
          "For Hole Size",
          "For Drill Size",
          "Head Diameter",
          "Head Height"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Screw",
      shortName   : "SCREW",
      code        : "130",
      specs       :
      {
        names:
        [
          "Thread Size",
          "Length",
          "Drive Style",
          "Thread Direction",
          "Material"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Shim",
      shortName   : "SHIM",
      code        : "131",
      specs       :
      {
        names:
        [
          "Shape",
          "Material",
          "Thickness",
          "Length",
          "Width",
          "ID",
          "OD",
          "Taper"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Solenoid",
      shortName   : "SOLENOID",
      code        : "132",
      specs       :
      {
        names:
        [
          "Type",
          "Length Retracted",
          "Length Extended",
          "Rod Diameter",
          "Mounting Orientation",
          "Power",
          "Number of Ports",
          "Cv"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Spacer",
      shortName   : "SPACER",
      code        : "133",
      specs       :
      {
        names:
        [
          "Material",
          "OD",
          "ID",
          "Length",
          "For Screw Size"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Spring",
      shortName   : "SPRING",
      code        : "134",
      specs       :
      {
        names:
        [
          "Type",
          "Material",
          "OD",
          "Wire Diameter",
          "Length Resting",
          "Length Compressed",
          "Length Stretched"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Thermal Management",
      shortName   : "THERMAL",
      code        : "135",
      specs       :
      {
        names:
        [
          "Type",
          "Material",
          "Dimensions"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Tool",
      shortName   : "TOOL",
      code        : "136",
      specs       :
      {
        names:
        [
          "Type"
        ],
        options:
        {
          required:
          [ ]
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Tubing",
      shortName   : "TUBING",
      code        : "137",
      specs       :
      {
        names:
        [
          "Type",
          "Material",
          "OD",
          "ID",
          "Length",
          "Color"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "FEET"
    },
    {
      name        : "Valve",
      shortName   : "VALVE",
      code        : "138",
      specs       :
      {
        names:
        [
          "Type",
          "Body Material",
          "Shape",
          "Connection Type",
          "Pipe Size",
          "For Tube OD",
          "For Tube ID",
          "Max. Pressure",
          "Flow Coefficient"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Washer",
      shortName   : "WASHER",
      code        : "139",
      specs       :
      {
        names:
        [
          "Type",
          "For Screw Size",
          "OD",
          "ID",
          "Material",
          "Thickness"
        ],
        options:
        {
          required: []
        }
      },
      tags        : ["MCAD"],
      type: "MECHANICAL",
      unitOfMeasure: "EACH"
    },
// ===========================================================
// ===================== MATERIAL ============================
// ===========================================================
    {
      name        : "Adhesive",
      shortName   : "ADHESIVE",
      code        : "310",
      specs       :
      {
        names:
        [
          "Type",
          "Thickness",
          "Color",
          "Usage"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "INCHES"
    },
    {
      name        : "Chemical/Gas",
      shortName   : "CHEMICAL",
      code        : "311",
      specs       :
      {
        names:
        [
          "Chemical Type",
          "Container Type",
          "Container Capacity",
          "Gas Type"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Fiber",
      shortName   : "FIBER",
      code        : "312",
      specs       :
      {
        names:
        [
          "Name",
          "Size",
          "K#"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Filament",
      shortName   : "FILAMENT",
      code        : "313",
      specs       :
      {
        names:
        [
          "Resin/Fiber",
          "Dimensions",
          "Yield",
          "RC/FV"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Foam",
      shortName   : "FOAM",
      code        : "314",
      specs       :
      {
        names:
       [
          "Construction",
          "Material",
          "Thickness",
          "Cross-Section Shape",
          "Height",
          "Width",
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "FEET"
    },
    {
      name        : "Label",
      shortName   : "LABEL",
      code        : "315",
      specs       :
      {
        names:
        [
          "Material",
          "Height",
          "Width",
          "Color",
          "Backing Material"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Packaging",
      shortName   : "PKG",
      code        : "316",
      specs       :
      {
        names:
        [
          "Material",
          "Height",
          "Width",
          "Construction"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Processing Aid",
      shortName   : "PROC AID",
      code        : "317",
      specs       :
      {
        names:
        [
          "Specific Gravity",
          "PH Level"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Resin",
      shortName   : "RESIN",
      code        : "318",
      specs       :
      {
        names:
        [
          "Resin",
          "Type",
          "Size"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "OUNCES"
    },
    {
      name        : "Tape",
      shortName   : "TAPE",
      code        : "319",
      specs       :
      {
        names:
        [
          "Resin/Fiber",
          "FAW",
          "RC/FV",
          "Width"
        ],
        options:
        {
          required: []
        }
      },
      type: "MATERIALS",
      unitOfMeasure: "INCHES"
    },
    {
      name        : "Polycarbonate",
      shortName   : "POLYCARB",
      code        : "320",
      specs       :
      {},
      type: "MATERIALS",
      unitOfMeasure: "EACH"
    },
// ===========================================================
// ===================== DOCUMENT ============================
// ===========================================================
    {
      name        : "Artwork",
      shortName   : "ARTWORK",
      code        : "610",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Certification",
      shortName   : "CERT",
      code        : "611",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Datasheet",
      shortName   : "DATASHEET",
      code        : "612",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Form",
      shortName   : "FORM",
      code        : "613",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Instruction",
      shortName   : "INSTRUCTIONS",
      code        : "614",
      pecs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      specs       : {},
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Procedure",
      shortName   : "PROC",
      code        : "615",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Product Literature",
      shortName   : "LIT",
      code        : "616",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Schematic",
      shortName   : "SCH",
      code        : "617",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Specification",
      shortName   : "SPEC",
      code        : "618",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Test Plan",
      shortName   : "TEST PLAN",
      code        : "619",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "DOCUMENT",
      unitOfMeasure: "EACH"
    },
// ===========================================================
// ===================== SOFTWARE ============================
// ===========================================================
    {
      name        : "CAD",
      shortName   : "CAD",
      code        : "710",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    },
    {
      name        : "CAM",
      shortName   : "CAM",
      code        : "720",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Firmware",
      shortName   : "FW",
      code        : "730",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    },
    {
      name        : "G Code",
      shortName   : "G CODE",
      code        : "740",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Object Code",
      shortName   : "CODE",
      code        : "750",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Pathfinder",
      shortName   : "PATHFINDER",
      code        : "760",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Recipe",
      shortName   : "RECIPE",
      code        : "770",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    },
    {
      name        : "Scan Data",
      shortName   : "SCAN DATA",
      code        : "780",
      specs       :
      {
        names:
        [
          "Description",
          "File Format",
          "Author"
        ],
        options:
        {
          required: []
        }
      },
      type: "SOFTWARE",
      unitOfMeasure: "EACH"
    }
  ]
}
