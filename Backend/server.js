const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");
const { existsSync, mkdirSync } = require("fs");
const { randomUUID } = require("crypto");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const FRONTEND_DIR = path.join(__dirname, "..", "Frontend");
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "deployments.json");
const VALID_STATUSES = new Set(["success", "failed", "running"]);

app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_DIR));

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

function buildStats(deployments) {
    const stats = {
        total: deployments.length,
        success: 0,
        failed: 0,
        running: 0,
        latestDeployment: deployments[0] || null,
    };

    for (const deployment of deployments) {
        if (stats[deployment.status] !== undefined) {
            stats[deployment.status] += 1;
        }
    }

    return stats;
}

function normalizeDeploymentPayload(body) {
    const status = String(body.status || "").trim().toLowerCase();
    const message = String(body.message || "").trim();

    if (!VALID_STATUSES.has(status)) {
        return {
            error: "Status must be success, failed, or running.",
        };
    }

    if (!message) {
        return {
            error: "Deployment message is required.",
        };
    }

    return {
        status,
        message,
        environment: String(body.environment || "development").trim() || "development",
        branch: String(body.branch || "main").trim() || "main",
        commitHash: String(body.commitHash || "").trim() || "manual-entry",
        author: String(body.author || "Local User").trim() || "Local User",
        duration: Number(body.duration) > 0 ? Number(body.duration) : null,
        logs: String(body.logs || "").trim(),
        source: String(body.source || "dashboard").trim() || "dashboard",
    };
}

app.get("/api/health", async (req, res) => {
    const deployments = await readDeployments();

    return res.json({
        message: "Deploy Track Backend Running",
        storage: "json-file",
        totalDeployments: deployments.length,
    });
});

app.get("/api/deployments", async (req, res) => {
    try {
        const deployments = await readDeployments();

        return res.json({
            count: deployments.length,
            deployments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Unable to load deployments.",
        });
    }
});

app.get("/api/stats", async (req, res) => {
    try {
        const deployments = await readDeployments();

        return res.json({
            success: true,
            stats: buildStats(deployments),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Unable to load dashboard stats.",
        });
    }
});

app.post("/api/deployments", async (req, res) => {
    const normalized = normalizeDeploymentPayload(req.body);

    if (normalized.error) {
        return res.status(400).json({
            success: false,
            error: normalized.error,
        });
    }

    try {
        const deployments = await readDeployments();
        const deployment = {
            id: randomUUID(),
            ...normalized,
            timestamp: new Date().toISOString(),
        };

        const updatedDeployments = [deployment, ...deployments];
        await writeDeployments(updatedDeployments);

        return res.status(201).json({
            success: true,
            deployment,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Unable to save deployment.",
        });
    }
});

app.get("/", (req, res) => {
    return res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

if (require.main === module) {
    ensureDataFile()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => {
            console.error("Failed to prepare data storage", error);
            process.exit(1);
        });
}

module.exports = {
    app,
    buildStats,
    normalizeDeploymentPayload,
};
