const path = require("path");

const BACKEND_ROOT = path.join(__dirname, "..", "..");
const DATA_DIR = path.join(BACKEND_ROOT, "data");
const DATA_FILE = path.join(DATA_DIR, "deployments.json");

module.exports = {
    DATA_DIR,
    DATA_FILE,
};
