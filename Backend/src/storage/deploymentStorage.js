const fs = require("fs/promises");
const { existsSync, mkdirSync } = require("fs");

const { DATA_DIR, DATA_FILE } = require("../config/paths");

function ensureDataFolder() {
    if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
    }
}

async function ensureDataFile() {
    ensureDataFolder();

    if (!existsSync(DATA_FILE)) {
        await fs.writeFile(DATA_FILE, "[]", "utf8");
    }
}

async function readDeployments() {
    await ensureDataFile();

    const raw = await fs.readFile(DATA_FILE, "utf8");
    const data = JSON.parse(raw);

    return Array.isArray(data) ? data : [];
}

async function writeDeployments(deployments) {
    await ensureDataFile();
    await fs.writeFile(DATA_FILE, JSON.stringify(deployments, null, 2), "utf8");
}

module.exports = {
    ensureDataFile,
    readDeployments,
    writeDeployments,
};
