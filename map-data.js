// Project content shared by the engineering map controller.
window.portfolioMapData = {
  "entries": {
    "gripper": {
      "title": "Smart Gripper Design and Robot Cell Simulation",
      "description": "A simulated robot cell picks, transfers, and places a cylindrical part.",
      "video": "mcd/assets/gripper-square-v2.mp4",
      "context": "DFI 4.0 \u00b7 TU Clausthal",
      "detail": "Developed a motor-driven, three-jaw scroll gripper concept for cylindrical parts, taking it from concept evaluation and CAD assembly through virtual commissioning and process analytics. The scroll and radial guides synchronize the jaws to centre the workpiece. In Siemens NX MCD, built an ABB GoFa pick-and-place cell with part detection, conveyor stop logic and condition-based gripping, transfer and placement. Developed models using a supplied 12,212-cycle dataset to analyse energy use, cycle time and faults, and compared their performance under random and chronological validation. The project brought mechanism design, automation logic and data analysis together in one engineering workflow.",
      "tags": [
        "Mechanical design",
        "Virtual commissioning",
        "Process analytics"
      ],
      "mechanismVideo": "mcd/assets/gripper-mechanism-clean.mp4"
    },
    "cam": {
      "title": "CAM Process Planning for a Gearbox Housing",
      "description": "Four orientations and simulated three-axis milling operations for a gearbox housing component.",
      "image": "mcd/assets/cam-simulation.png",
      "context": "CAM \u00b7 TU Clausthal",
      "detail": "Developed and simulated milling toolpaths for a gearbox housing component on a three-axis vertical milling machine. I planned four workpiece orientations to access different faces of the part, using operations including adaptive milling and floor facing. The CAM plan brought the setups and machining operations together into a practical process sequence.",
      "tags": [
        "CAM",
        "Fixturing",
        "Machining planning"
      ],
      "video": "mcd/assets/cam-square-v2.mp4"
    },
    "ifs": {
      "title": "Robotic Bending with FEM Springback Correction",
      "description": "Python automation connects FEM simulation with springback correction.",
      "context": "IFS \u00b7 TU Clausthal",
      "detail": "Built a Python-based tool to plan robotic sheet-metal bending with springback correction. The tool runs LS-DYNA simulations remotely, extracts the deformed sheet-edge geometry and measures its deviation from the target position. Models trained on simulation results predict a Z-axis correction, which is then checked in a new FEM run and can be refined further. A graphical interface brings case selection, simulation, correction and result review into one workflow.",
      "tags": [
        "Python",
        "LS-DYNA",
        "Regression"
      ]
    },
    "elmex": {
      "title": "Automated Visual Inspection of Terminal Links",
      "description": "Camera-based checks for terminal-link components and visible defects.",
      "context": "Elmex Controls \u00b7 B.Tech project",
      "detail": "Implemented a multi-camera inspection process for electrical terminal links in an assembly environment. I configured reference images and feature-specific checks across different views to identify issues such as missing or misoriented components, bent current bars and molding defects. Setting acceptance ranges and reviewing repeated inspection runs helped distinguish actual defects from normal variation between parts. The configured system classified links as OK or NOT OK for separation on the line.",
      "tags": [
        "Machine vision",
        "Terminal links",
        "Inspection"
      ]
    },
    "assembly": {
      "title": "Automated Spring Insertion Prototype",
      "description": "A spring feeder and roller-press concept for terminal blocks.",
      "image": "elmex/roller-prototype.jpg",
      "video": "elmex/spring-assembly-focus.mp4",
      "context": "Elmex Controls \u00b7 B.Tech project",
      "detail": "Designed and refined mechanisms to automate spring insertion in terminal links, progressing from a punch-and-die approach to a guided roller-press design. The final prototype concept combines a spring feeder, pneumatic movement and guide rails to present the spring and position the terminal link. The link then travels beneath a roller that presses the spring into place. Developing the sequence as connected mechanisms made spring orientation, part alignment and controlled movement central to the design.",
      "tags": [
        "Prototype design",
        "Pneumatics",
        "Spring insertion"
      ]
    },
    "irp": {
      "title": "Copper Alloy Notch Support Modelling",
      "description": "An FKM-compatible notch support-factor model for lightweight fatigue design.",
      "context": "Research project \u00b7 TU Clausthal",
      "detail": "Developed an FKM-compatible model to estimate how much notch support copper alloys provide under cyclic loading. We evaluated fatigue-test results from smooth and notched specimens using the DIN 50100 staircase method, calculated fatigue notch factors and checked the stress-concentration estimates with finite-element analysis. The model relates notch support to material tensile strength and the stress gradient at the notch. We then turned the calibrated relationship into a design chart and spreadsheet that estimate the support factor from the alloy strength and component geometry.",
      "tags": [
        "Fatigue",
        "Model fitting",
        "Copper alloys"
      ]
    },
    "iep": {
      "title": "Real-Time Fatigue Damage Assessment",
      "description": "Online rainflow counting and damage assessment from incoming strain data.",
      "context": "Engineering project \u00b7 TU Clausthal",
      "detail": "Developed an Arduino-based device to assess fatigue damage as strain data arrives, allowing the analysis to run during a test rather than after data collection. The processing sequence filters small signal fluctuations, identifies turning points and applies rainflow counting to extract load cycles. Because the device has limited memory, the cycle-counting method uses a bounded stack instead of storing the entire signal. The counted cycles are used with an S\u2013N relationship and Miner\u2019s rule to estimate accumulated damage. The device saves cycle data and a concise status report to an SD card, and we compared its cycle counts with a Python reference to check the results.",
      "tags": [
        "Sensing",
        "Embedded processing",
        "Rainflow counting"
      ]
    }
  },
  "groups": {
    "mechanical": [
      "gripper",
      "cam"
    ],
    "robotics": [
      "gripper",
      "assembly"
    ],
    "coding": [
      "ifs",
      "elmex"
    ],
    "data": [
      "gripper",
      "irp"
    ],
    "electronics": [
      "iep",
      "elmex"
    ],
    "systems": [
      "ifs",
      "iep"
    ]
  },
  "scopes": {
    "mechanical": {
      "gripper": "Designed the three-jaw scroll-disc mechanism and adjustable jaws for cylindrical parts.",
      "cam": "Planned four orientations for three-axis milling, including adaptive milling and floor facing."
    },
    "robotics": {
      "gripper": "Built the NX MCD pick-and-place sequence, including part detection and conveyor-stop logic.",
      "assembly": "Designed a sequence that feeds the spring, positions the terminal link, moves its carrier along guide rails and seats the spring beneath a roller press."
    },
    "coding": {
      "ifs": "Built a Python prototype to run remote LS-DYNA simulations through a web API and process springback results.",
      "elmex": "Implemented machine-vision inspection logic for current-bar presence, pin condition and visible plastic-body defects in terminal links."
    },
    "data": {
      "gripper": "Trained and evaluated XGBoost models for energy use, cycle time and faults using random and time-based splits.",
      "irp": "Fitted a copper-alloy notch support-factor model to fatigue data for FKM-compatible assessment."
    },
    "electronics": {
      "iep": "Processed incoming strain data with embedded rainflow counting and fatigue-damage estimation.",
      "elmex": "Configured camera-based checks for current-bar presence, pin condition and visible housing defects."
    },
    "systems": {
      "ifs": "Connected FEM results, springback correction and robot path planning in a Python-based prototype.",
      "iep": "Connected incoming strain data, rainflow cycle counting and online fatigue-damage estimation in the embedded workflow."
    }
  }
};
