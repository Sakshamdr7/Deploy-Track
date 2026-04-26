const { randomUUID } = require("crypto");

const {
    readDeployments,
    writeDeployments,
} = require("../storage/deploymentStorage");

const VALID_STATUSES = new Set(["success", "failed", "running"]);
const VALID_SORT_ORDERS = new Set(["latest", "oldest"]);

function buildStats(deployments) {
    const latestFailure = deployments.find((deployment) => deployment.status === "failed") || null;
    const stats = {
        total: deployments.length,
        success: 0,
        failed: 0,
        running: 0,
        latestDeployment: deployments[0] || null,
        latestFailure,
        failureRate: 0,
        projectCount: new Set(deployments.map((deployment) => deployment.project).filter(Boolean)).size,
    };

    for (const deployment of deployments) {
        if (stats[deployment.status] !== undefined) {
            stats[deployment.status] += 1;
        }
    }

    if (stats.total > 0) {
        stats.failureRate = Number(((stats.failed / stats.total) * 100).toFixed(1));
    }

    return stats;
}

function normalizeDeploymentPayload(body) {
    const status = String(body.status || "").trim().toLowerCase();
    const message = String(body.message || "").trim();
    const project = String(body.project || "").trim();

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

    if (!project) {
        return {
            error: "Project name is required.",
        };
    }

    return {
        project,
        status,
        message,
        environment: String(body.environment || "development").trim() || "development",
        branch: String(body.branch || "main").trim() || "main",
        commitHash: String(body.commitHash || "").trim() || "manual-entry",
        author: String(body.author || "Local User").trim() || "Local User",
        duration: Number(body.duration) > 0 ? Number(body.duration) : null,
        logs: String(body.logs || "").trim(),
        source: String(body.source || "dashboard").trim() || "dashboard",
        pipelineRunId: String(body.pipelineRunId || "").trim() || null,
        workflowName: String(body.workflowName || "").trim() || null,
        jobName: String(body.jobName || "").trim() || null,
        pipelineRunUrl: String(body.pipelineRunUrl || "").trim() || null,
    };
}

async function getDeployments() {
    return readDeployments();
}

async function getDeploymentById(id) {
    const deploymentId = String(id || "").trim();

    if (!deploymentId) {
        const error = new Error("Deployment id is required.");
        error.statusCode = 400;
        throw error;
    }

    const deployments = await readDeployments();
    const deployment = deployments.find((item) => item.id === deploymentId);

    if (!deployment) {
        const error = new Error("Deployment not found.");
        error.statusCode = 404;
        throw error;
    }

    return deployment;
}

function normalizeDeploymentQuery(query = {}) {
    const project = String(query.project || "").trim().toLowerCase();
    const status = String(query.status || "").trim().toLowerCase();
    const environment = String(query.environment || "").trim().toLowerCase();
    const branch = String(query.branch || "").trim().toLowerCase();
    const source = String(query.source || "").trim().toLowerCase();
    const search = String(query.search || "").trim().toLowerCase();
    const sort = String(query.sort || "latest").trim().toLowerCase();

    return {
        project,
        status: VALID_STATUSES.has(status) ? status : "",
        environment,
        branch,
        source,
        search,
        sort: VALID_SORT_ORDERS.has(sort) ? sort : "latest",
    };
}

function applyDeploymentFilters(deployments, query = {}) {
    const normalizedQuery = normalizeDeploymentQuery(query);

    const filteredDeployments = deployments.filter((deployment) => {
        const projectMatch = !normalizedQuery.project
            || String(deployment.project || "").toLowerCase() === normalizedQuery.project;
        const statusMatch = !normalizedQuery.status || deployment.status === normalizedQuery.status;
        const environmentMatch = !normalizedQuery.environment
            || String(deployment.environment || "").toLowerCase() === normalizedQuery.environment;
        const branchMatch = !normalizedQuery.branch
            || String(deployment.branch || "").toLowerCase().includes(normalizedQuery.branch);
        const sourceMatch = !normalizedQuery.source
            || String(deployment.source || "").toLowerCase() === normalizedQuery.source;
        const searchTarget = [
            deployment.message,
            deployment.commitHash,
            deployment.author,
            deployment.logs,
            deployment.pipelineRunId,
            deployment.workflowName,
            deployment.jobName,
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
        const searchMatch = !normalizedQuery.search || searchTarget.includes(normalizedQuery.search);

        return projectMatch && statusMatch && environmentMatch && branchMatch && sourceMatch && searchMatch;
    });

    filteredDeployments.sort((a, b) => {
        const left = new Date(a.timestamp).getTime();
        const right = new Date(b.timestamp).getTime();

        return normalizedQuery.sort === "oldest" ? left - right : right - left;
    });

    return {
        filters: normalizedQuery,
        deployments: filteredDeployments,
    };
}

async function queryDeployments(query = {}) {
    const deployments = await readDeployments();

    return applyDeploymentFilters(deployments, query);
}

async function getDeploymentStats() {
    const deployments = await readDeployments();

    return buildStats(deployments);
}

async function getProjectSummaries() {
    const deployments = await readDeployments();
    const summaryMap = new Map();

    for (const deployment of deployments) {
        const projectName = deployment.project || "Unassigned";

        if (!summaryMap.has(projectName)) {
            summaryMap.set(projectName, {
                project: projectName,
                total: 0,
                success: 0,
                failed: 0,
                running: 0,
                latestDeployment: null,
            });
        }

        const projectSummary = summaryMap.get(projectName);
        projectSummary.total += 1;

        if (projectSummary[deployment.status] !== undefined) {
            projectSummary[deployment.status] += 1;
        }

        if (!projectSummary.latestDeployment) {
            projectSummary.latestDeployment = deployment;
        }
    }

    return [...summaryMap.values()].sort((left, right) => right.total - left.total);
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
    applyDeploymentFilters,
    buildStats,
    normalizeDeploymentQuery,
    normalizeDeploymentPayload,
    getDeployments,
    getDeploymentById,
    getDeploymentStats,
    getProjectSummaries,
    createDeployment,
    queryDeployments,
};
