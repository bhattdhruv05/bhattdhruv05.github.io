// Map-specific metadata; full-resolution media remain in the project case studies.
window.portfolioMapData = {
  "entries": {
    "gripper": {
      "title": "Smart Gripper Design and Robot Cell Simulation",
      "video": "mcd/assets/gripper-map.mp4",
      "mechanismVideo": "mcd/assets/mechanism-map.mp4"
    },
    "cam": {
      "title": "CAM Process Planning for a Gearbox Housing",
      "image": "mcd/assets/cam-simulation.png",
      "video": "mcd/assets/cam-map.mp4"
    },
    "ifs": {
      "title": "Robotic Bending with FEM Springback Correction"
    },
    "elmex": {
      "title": "Automated Visual Inspection of Terminal Links"
    },
    "assembly": {
      "title": "Automated Spring Insertion Prototype",
      "image": "elmex/roller-prototype.jpg",
      "video": "mcd/assets/assembly-map.mp4"
    },
    "irp": {
      "title": "Copper Alloy Notch Support Modelling"
    },
    "iep": {
      "title": "Real-Time Fatigue Damage Assessment"
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
