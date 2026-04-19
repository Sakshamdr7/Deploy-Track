const { randomUUID } = require("crypto");

const {
    readDeployments,
    writeDeployments,
} = require("../storage/deploymentStorage");

const VALID_STATUSES = new Set(["success", "failed", "running"]);

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

async function getDeployments() {
    return readDeployments();
}

async function getDeploymentStats() {
    const deployments = await readDeployments();

    return buildStats(deployments);
}

async function createDeployment(payload) {
    const normalized = normalizeDeploymentPayload(payload);

    if (normalized.error) {
        const error = new Error(normalized.error);
        error.statusCode = 400;
        throw error;
    }

    const deployments = await readDeployments();
    const deployment = {
        id: randomUUID(),
        ...normalized,
        timestamp: new Date().toISOString(),
    };

    await writeDeployments([deployment, ...deployments]);

    return deployment;
}

module.exports = {
    buildStats,
    normalizeDeploymentPayload,
    getDeployments,
    getDeploymentStats,
    createDeployment,
};
