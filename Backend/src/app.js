const express = require("express");
const cors = require("cors");
const path = require("path");

const apiRouter = require("./routes/api");
const { ensureDataFile } = require("./storage/deploymentStorage");

const app = express();
const FRONTEND_DIR = path.join(__dirname, "..", "..", "Frontend");

app.use(cors());
app.use(express.json());
app.use(express.static(FRONTEND_DIR));

app.use("/api", apiRouter);

app.get("/", (req, res) => {
    return res.sendFile(path.join(FRONTEND_DIR, "index.html"));
});

module.exports = {
    app,
    ensureAppData: ensureDataFile,
};
