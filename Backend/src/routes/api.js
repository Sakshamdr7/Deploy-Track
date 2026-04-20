const express = require("express");

const {
    getDeployments,
    getDeploymentStats,
    createDeployment,
    queryDeployments,
} = require("../services/deploymentService");

const router = express.Router();

router.get("/health", async (req, res) => {
    const deployments = await getDeployments();

    return res.json({
        message: "Deploy Track Backend Running",
        storage: "json-file",
        totalDeployments: deployments.length,
    });
});

router.get("/deployments", async (req, res) => {
    try {
        const result = await queryDeployments(req.query);

        return res.json({
            count: result.deployments.length,
            filters: result.filters,
            deployments: result.deployments,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Unable to load deployments.",
        });
    }
});

router.get("/stats", async (req, res) => {
    try {
        const stats = await getDeploymentStats();

        return res.json({
            success: true,
            stats,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "Unable to load dashboard stats.",
        });
    }
});

router.post("/deployments", async (req, res) => {
    try {
        const deployment = await createDeployment(req.body);

        return res.status(201).json({
            success: true,
            deployment,
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        const message = statusCode === 500
            ? "Unable to save deployment."
            : error.message;

        return res.status(statusCode).json({
            success: false,
            error: message,
        });
    }
});

module.exports = router;
