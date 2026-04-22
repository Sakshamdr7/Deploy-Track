const assert = require("node:assert/strict");

const {
    applyDeploymentFilters,
    normalizeDeploymentQuery,
} = require("./deploymentService");

const sampleDeployments = [
    {
        project: "Deploy Track",
        status: "success",
        environment: "production",
        branch: "main",
        source: "github-actions",
        message: "Production deployment completed",
        commitHash: "prod123",
        author: "Saksham",
        logs: "Everything passed",
        timestamp: "2026-04-20T10:00:00.000Z",
    },
    {
        project: "Client Portal",
        status: "failed",
        environment: "staging",
        branch: "feature/filter-ui",
        source: "dashboard",
        message: "Staging deployment failed",
        commitHash: "stag456",
        author: "Codex",
        logs: "Validation error",
        timestamp: "2026-04-20T09:00:00.000Z",
    },
    {
        project: "Deploy Track",
        status: "running",
        environment: "development",
        branch: "feature/search",
        source: "dashboard",
        message: "Development verification running",
        commitHash: "dev789",
        author: "Saksham",
        logs: "Awaiting results",
        timestamp: "2026-04-20T08:00:00.000Z",
    },
];

function runTests() {
    const normalized = normalizeDeploymentQuery({
        status: "SUCCESS",
        project: " Deploy Track ",
        environment: " Production ",
        branch: " Main ",
        source: "GitHub-Actions",
        search: " Deploy ",
        sort: "oldest",
    });

    assert.deepEqual(normalized, {
        project: "deploy track",
        status: "success",
        environment: "production",
        branch: "main",
        source: "github-actions",
        search: "deploy",
        sort: "oldest",
    });

    const filteredByStatus = applyDeploymentFilters(sampleDeployments, {
        project: "client portal",
        status: "failed",
        environment: "staging",
    });

    assert.equal(filteredByStatus.deployments.length, 1);
    assert.equal(filteredByStatus.deployments[0].commitHash, "stag456");

    const filteredBySearch = applyDeploymentFilters(sampleDeployments, {
        search: "saksham",
        sort: "oldest",
    });

    assert.equal(filteredBySearch.deployments.length, 2);
    assert.equal(filteredBySearch.deployments[0].commitHash, "dev789");
    assert.equal(filteredBySearch.deployments[1].commitHash, "prod123");

    console.log("deploymentService tests passed");
}

runTests();
