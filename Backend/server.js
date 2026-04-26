const { app, ensureAppData } = require("./src/app");

const PORT = Number(process.env.PORT) || 1945;

if (require.main === module) {
    ensureAppData()
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
};
