const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let deployments = [];

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Dev Tracker Backend Running",
        endpoints: {
            health: "/",
            allDeployments: "/deployments",
            createDeployment: "/deployments",
        },
    });
});

// GET all deployments
app.get("/deployments", (req, res) => {
    res.json({
        count: deployments.length,
        deployments,
    });
});

// POST new deployment
app.post("/deployments", (req, res) => {
    const { status, message } = req.body;

    if (!status || !message) {
        return res.status(400).json({
            success: false,
            error: "Both status and message are required.",
        });
    }

    const deployment = {
        id: deployments.length + 1,
        status,
        message,
        time: new Date().toISOString(),
    };

    deployments = [deployment, ...deployments];

    return res.status(201).json({
        success: true,
        deployment,
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
