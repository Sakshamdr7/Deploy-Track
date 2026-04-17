const deploymentForm = document.getElementById("deployment-form");
const deploymentList = document.getElementById("deployment-list");
const feedback = document.getElementById("feedback");
const refreshButton = document.getElementById("refresh-button");

const totalCount = document.getElementById("total-count");
const successCount = document.getElementById("success-count");
const failedCount = document.getElementById("failed-count");
const runningCount = document.getElementById("running-count");
const healthMessage = document.getElementById("health-message");
const healthMeta = document.getElementById("health-meta");

function showFeedback(message, type) {
    feedback.hidden = false;
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
}

function clearFeedback() {
    feedback.hidden = true;
    feedback.textContent = "";
    feedback.className = "feedback";
}

function formatTimestamp(value) {
    return new Date(value).toLocaleString();
}

function renderStats(stats) {
    totalCount.textContent = stats.total ?? 0;
    successCount.textContent = stats.success ?? 0;
    failedCount.textContent = stats.failed ?? 0;
    runningCount.textContent = stats.running ?? 0;
}

function renderDeployments(deployments) {
    if (!deployments.length) {
        deploymentList.innerHTML = '<div class="empty-state">No deployment records yet. Add one from the form to start the working model.</div>';
        return;
    }

    deploymentList.innerHTML = deployments
        .map((deployment) => {
            const durationText = deployment.duration ? `${deployment.duration}s` : "Not recorded";
            const logs = deployment.logs
                ? `<p class="log-text">${deployment.logs}</p>`
                : '<p class="log-text">No deployment notes were attached to this event.</p>';

            return `
                <article class="history-item">
                    <div class="item-top">
                        <span class="badge ${deployment.status}">${deployment.status}</span>
                        <span class="item-meta">${formatTimestamp(deployment.timestamp)}</span>
                    </div>
                    <div class="item-tags">
                        <span class="tag">${deployment.environment}</span>
                        <span class="tag">${deployment.branch}</span>
                        <span class="tag">${deployment.author}</span>
                        <span class="tag">${durationText}</span>
                    </div>
                    <p class="item-message">${deployment.message}</p>
                    <p class="item-meta">Commit: ${deployment.commitHash}</p>
                    ${logs}
                </article>
            `;
        })
        .join("");
}

async function loadHealth() {
    try {
        const response = await fetch("/api/health");

        if (!response.ok) {
            throw new Error("Backend is not responding.");
        }

        const data = await response.json();
        healthMessage.textContent = data.message;
        healthMeta.textContent = `${data.totalDeployments} deployment records stored in ${data.storage}`;
    } catch (error) {
        healthMessage.textContent = "Backend unavailable";
        healthMeta.textContent = error.message;
    }
}

async function loadDashboard() {
    try {
        const [statsResponse, deploymentsResponse] = await Promise.all([
            fetch("/api/stats"),
            fetch("/api/deployments"),
        ]);

        if (!statsResponse.ok || !deploymentsResponse.ok) {
            throw new Error("Unable to load dashboard data.");
        }

        const statsData = await statsResponse.json();
        const deploymentData = await deploymentsResponse.json();

        renderStats(statsData.stats || {});
        renderDeployments(deploymentData.deployments || []);
    } catch (error) {
        showFeedback(error.message, "error");
    }
}

deploymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFeedback();

    const formData = new FormData(deploymentForm);
    const payload = {
        status: formData.get("status"),
        environment: formData.get("environment"),
        branch: formData.get("branch"),
        commitHash: formData.get("commitHash"),
        author: formData.get("author"),
        duration: formData.get("duration"),
        message: formData.get("message"),
        logs: formData.get("logs"),
        source: "dashboard",
    };

    try {
        const response = await fetch("/api/deployments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to save deployment.");
        }

        deploymentForm.reset();
        deploymentForm.elements.branch.value = "main";
        showFeedback("Deployment saved successfully.", "success");

        await Promise.all([loadHealth(), loadDashboard()]);
    } catch (error) {
        showFeedback(error.message, "error");
    }
});

refreshButton.addEventListener("click", async () => {
    clearFeedback();
    await Promise.all([loadHealth(), loadDashboard()]);
});

Promise.all([loadHealth(), loadDashboard()]);
