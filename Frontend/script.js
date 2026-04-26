const deploymentForm = document.getElementById("deployment-form");
const deploymentFilterForm = document.getElementById("deployment-filter-form");
const deploymentList = document.getElementById("deployment-list");
const recentActivity = document.getElementById("recent-activity");
const latestDeploymentPanel = document.getElementById("latest-deployment");
const statusLogPanel = document.getElementById("status-log-panel");
const projectSummaryList = document.getElementById("project-summary-list");
const feedback = document.getElementById("feedback");
const refreshButton = document.getElementById("refresh-button");

const totalCount = document.getElementById("total-count");
const successCount = document.getElementById("success-count");
const failedCount = document.getElementById("failed-count");
const runningCount = document.getElementById("running-count");
const healthMessage = document.getElementById("health-message");
const healthMeta = document.getElementById("health-meta");
const pageTitle = document.getElementById("page-title");
const pageDescription = document.getElementById("page-description");
const statusHealthText = document.getElementById("status-health-text");
const statusStorageText = document.getElementById("status-storage-text");
const statusFailedText = document.getElementById("status-failed-text");
const statusFailedMeta = document.getElementById("status-failed-meta");
const statusTotalText = document.getElementById("status-total-text");
const statusSourceText = document.getElementById("status-source-text");
const statusSourceMeta = document.getElementById("status-source-meta");
const statusFailurePanel = document.getElementById("status-failure-panel");
const projectFilter = document.getElementById("project-filter");
const openNavButton = document.getElementById("open-nav");
const closeNavButton = document.getElementById("close-nav");
const navOverlay = document.getElementById("nav-overlay");
const themeToggle = document.getElementById("theme-toggle");
const deploymentDetailPanel = document.getElementById("deployment-detail-panel");
const logoutButton = document.getElementById("logout-button");
const sessionUser = document.getElementById("session-user");
const authScreen = document.getElementById("auth-screen");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const authFeedback = document.getElementById("auth-feedback");

const navButtons = document.querySelectorAll("[data-view-target]");
const viewSections = document.querySelectorAll(".view-section");
const THEME_STORAGE_KEY = "deploy-track-theme";
const AUTH_USERS_STORAGE_KEY = "deploy-track-users";
const AUTH_SESSION_STORAGE_KEY = "deploy-track-session";

const viewMeta = {
    "dashboard-view": {
        title: "Dashboard",
        description: "Monitor deployment health, recent activity, and current release progress from one place.",
    },
    "deployments-view": {
        title: "Deployments",
        description: "Browse the full deployment history and release records for the working model.",
    },
    "add-deployment-view": {
        title: "Add Deployment",
        description: "Create a new deployment event to simulate CI/CD or manual release activity.",
    },
    "projects-view": {
        title: "Projects",
        description: "Track multiple websites or products under one deployment monitoring dashboard.",
    },
    "system-status-view": {
        title: "System Status",
        description: "Check backend health, storage status, and the latest deployment notes.",
    },
    "about-view": {
        title: "About Project",
        description: "Review the goal, workflow, and technical direction of Deploy-Track.",
    },
};

let latestHealthData = null;
let latestStatsData = null;
let latestDeployments = [];
let latestProjects = [];

function applyTheme(theme) {
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", normalizedTheme);
    themeToggle.textContent = normalizedTheme === "dark" ? "Light Mode" : "Dark Mode";
    themeToggle.setAttribute("aria-label", `Switch to ${normalizedTheme === "dark" ? "light" : "dark"} mode`);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(savedTheme || "light");
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
}

function getStoredUsers() {
    try {
        const users = JSON.parse(localStorage.getItem(AUTH_USERS_STORAGE_KEY) || "[]");
        return Array.isArray(users) ? users : [];
    } catch (error) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
}

function getSession() {
    try {
        return JSON.parse(localStorage.getItem(AUTH_SESSION_STORAGE_KEY) || "null");
    } catch (error) {
        return null;
    }
}

function setSession(session) {
    localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
    localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

function showAuthFeedback(message, type) {
    authFeedback.hidden = false;
    authFeedback.textContent = message;
    authFeedback.className = `feedback ${type}`;
}

function clearAuthFeedback() {
    authFeedback.hidden = true;
    authFeedback.textContent = "";
    authFeedback.className = "feedback";
}

function switchAuthMode(mode) {
    const isLogin = mode === "login";

    loginTab.classList.toggle("active", isLogin);
    signupTab.classList.toggle("active", !isLogin);
    loginTab.setAttribute("aria-selected", String(isLogin));
    signupTab.setAttribute("aria-selected", String(!isLogin));
    loginForm.hidden = !isLogin;
    signupForm.hidden = isLogin;
    clearAuthFeedback();
}

function setAuthenticatedUi(session) {
    const isAuthenticated = Boolean(session?.email);

    authScreen.hidden = isAuthenticated;
    document.body.classList.toggle("authenticated", isAuthenticated);

    if (isAuthenticated) {
        const name = session.name || session.email;
        sessionUser.textContent = `Signed in: ${name}`;
    } else {
        sessionUser.textContent = "";
        setNavOpen(false);
        switchAuthMode("login");
    }
}

function ensureDemoUser() {
    const users = getStoredUsers();
    const hasDemo = users.some((user) => user.email === "demo@deploytrack.com");

    if (!hasDemo) {
        users.push({
            name: "Demo User",
            email: "demo@deploytrack.com",
            password: "demo1234",
        });
        saveUsers(users);
    }
}

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

function renderDeploymentDetail(deployment) {
    if (!deployment) {
        deploymentDetailPanel.innerHTML = `
            <p class="section-kicker">Deployment Detail</p>
            <h3>Select a deployment</h3>
            <p class="panel-copy">Choose any row in Deployment History to inspect full metadata and notes.</p>
        `;
        return;
    }

    const durationText = deployment.duration ? `${deployment.duration}s` : "Not recorded";
    deploymentDetailPanel.innerHTML = `
        <p class="section-kicker">Deployment Detail</p>
        <div class="item-top">
            <span class="badge ${deployment.status}">${deployment.status}</span>
            <span class="item-meta">${formatTimestamp(deployment.timestamp)}</span>
        </div>
        <p class="item-message">${deployment.message}</p>
        <div class="item-tags">
            <span class="tag">${deployment.project}</span>
            <span class="tag">${deployment.environment}</span>
            <span class="tag">${deployment.branch}</span>
            <span class="tag">${deployment.author}</span>
            <span class="tag">${durationText}</span>
            <span class="tag">${deployment.source}</span>
        </div>
        <p class="item-meta">Commit: ${deployment.commitHash}</p>
        <p class="log-text">${deployment.logs || "No deployment notes were attached to this event."}</p>
    `;
}

function renderFailureTriage(deployments) {
    const failures = deployments.filter((deployment) => deployment.status === "failed").slice(0, 3);

    statusFailurePanel.innerHTML = failures.length
        ? failures.map((deployment) => createDeploymentCard(deployment)).join("")
        : '<div class="empty-state">No failed deployments in the current history.</div>';
}

function createDeploymentCard(deployment, options = {}) {
    const showDetailsButton = Boolean(options.showDetailsButton);
    const durationText = deployment.duration ? `${deployment.duration}s` : "Not recorded";
    const logs = deployment.logs
        ? `<p class="log-text">${deployment.logs}</p>`
        : '<p class="log-text">No deployment notes were attached to this event.</p>';
    const detailsAction = showDetailsButton
        ? `<button class="detail-trigger" type="button" data-deployment-id="${deployment.id}">View Details</button>`
        : "";

    return `
        <article class="history-item" data-deployment-id="${deployment.id}">
            <div class="item-top">
                <span class="badge ${deployment.status}">${deployment.status}</span>
                <span class="item-meta">${formatTimestamp(deployment.timestamp)}</span>
            </div>
            <div class="item-tags">
                <span class="tag">${deployment.project}</span>
                <span class="tag">${deployment.environment}</span>
                <span class="tag">${deployment.branch}</span>
                <span class="tag">${deployment.author}</span>
                <span class="tag">${durationText}</span>
            </div>
            <p class="item-message">${deployment.message}</p>
            <p class="item-meta">Commit: ${deployment.commitHash}</p>
            ${logs}
            ${detailsAction}
        </article>
    `;
}

function renderDeploymentHistory(deployments) {
    if (!deployments.length) {
        deploymentList.innerHTML = '<div class="empty-state">No deployment records yet. Add one from the Add Deployment page to start the working model.</div>';
        recentActivity.innerHTML = '<div class="empty-state">No recent activity yet.</div>';
        latestDeploymentPanel.innerHTML = '<div class="empty-state">No latest deployment available yet.</div>';
        statusLogPanel.innerHTML = '<div class="empty-state">No deployment logs are available yet.</div>';
        renderDeploymentDetail(null);
        renderFailureTriage([]);
        return;
    }

    deploymentList.innerHTML = deployments.map((deployment) => createDeploymentCard(deployment, {
        showDetailsButton: true,
    })).join("");
    recentActivity.innerHTML = deployments.slice(0, 3).map(createDeploymentCard).join("");

    const latestDeployment = deployments[0];
    latestDeploymentPanel.innerHTML = `
        <article class="latest-card">
            <div class="item-top">
                <span class="badge ${latestDeployment.status}">${latestDeployment.status}</span>
                <span class="item-meta">${formatTimestamp(latestDeployment.timestamp)}</span>
            </div>
            <p class="item-message">${latestDeployment.message}</p>
            <div class="item-tags">
                <span class="tag">${latestDeployment.project}</span>
                <span class="tag">${latestDeployment.environment}</span>
                <span class="tag">${latestDeployment.branch}</span>
                <span class="tag">${latestDeployment.author}</span>
                <span class="tag">${latestDeployment.source}</span>
            </div>
            <p class="log-text">${latestDeployment.logs || "No deployment notes were attached to this event."}</p>
        </article>
    `;

    statusLogPanel.innerHTML = `
        <article class="latest-card">
            <p class="item-meta">Latest deployment for ${latestDeployment.project} from ${latestDeployment.source} at ${formatTimestamp(latestDeployment.timestamp)}</p>
            <p class="item-message">${latestDeployment.message}</p>
            <p class="log-text">${latestDeployment.logs || "No deployment notes were attached to this event."}</p>
        </article>
    `;

    renderDeploymentDetail(deployments[0]);
    renderFailureTriage(deployments);
}

function renderStatusPanel() {
    if (!latestHealthData || !latestStatsData) {
        return;
    }

    const latestDeployment = latestStatsData.latestDeployment;
    const latestFailure = latestStatsData.latestFailure;

    statusHealthText.textContent = latestHealthData.message;
    statusStorageText.textContent = `${latestHealthData.totalDeployments} records stored in ${latestHealthData.storage}`;
    statusFailedText.textContent = latestStatsData.failed ?? 0;
    statusFailedMeta.textContent = latestFailure
        ? `Latest failure in ${latestFailure.environment} on ${latestFailure.branch} (${latestStatsData.failureRate}% failure rate)`
        : "No failures detected in current records.";
    statusFailedText.closest(".panel")?.classList.toggle("status-alert", Boolean(latestStatsData.failed));
    statusTotalText.textContent = latestStatsData.total ?? 0;
    statusSourceText.textContent = latestDeployment ? latestDeployment.status : "Unknown";
    statusSourceMeta.textContent = latestDeployment
        ? `${latestDeployment.environment} deployment from ${latestDeployment.source} on branch ${latestDeployment.branch}`
        : "No recent deployment available yet.";
}

function renderProjectOptions(projects) {
    const projectOptions = ['<option value="">All Projects</option>']
        .concat(projects.map((project) => `<option value="${project.project}">${project.project}</option>`));

    projectFilter.innerHTML = projectOptions.join("");
}

function renderProjectSummaries(projects) {
    if (!projects.length) {
        projectSummaryList.innerHTML = '<div class="empty-state">No projects have deployment records yet.</div>';
        return;
    }

    projectSummaryList.innerHTML = projects
        .map((project) => `
            <article class="project-card">
                <div class="project-top">
                    <div>
                        <p class="section-kicker">Project</p>
                        <h3 class="project-name">${project.project}</h3>
                    </div>
                    <span class="badge ${project.latestDeployment?.status || "success"}">${project.latestDeployment?.status || "tracked"}</span>
                </div>
                <div class="project-stats">
                    <div class="project-stat">
                        <span>Total Deployments</span>
                        <strong>${project.total}</strong>
                    </div>
                    <div class="project-stat">
                        <span>Successful</span>
                        <strong>${project.success}</strong>
                    </div>
                    <div class="project-stat">
                        <span>Failed</span>
                        <strong>${project.failed}</strong>
                    </div>
                    <div class="project-stat">
                        <span>Running</span>
                        <strong>${project.running}</strong>
                    </div>
                </div>
                <p class="item-meta">
                    Latest: ${project.latestDeployment ? project.latestDeployment.message : "No recent deployment"}
                </p>
            </article>
        `)
        .join("");
}

function activateView(viewId) {
    navButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.viewTarget === viewId);
    });

    viewSections.forEach((section) => {
        section.classList.toggle("active", section.id === viewId);
    });

    pageTitle.textContent = viewMeta[viewId].title;
    pageDescription.textContent = viewMeta[viewId].description;
}

function setNavOpen(isOpen) {
    document.body.classList.toggle("nav-open", isOpen);
}

async function loadHealth() {
    try {
        const response = await fetch("/api/health");

        if (!response.ok) {
            throw new Error("Backend is not responding.");
        }

        const data = await response.json();
        latestHealthData = data;
        healthMessage.textContent = data.message;
        healthMeta.textContent = `${data.totalDeployments} deployment records stored in ${data.storage}`;
    } catch (error) {
        healthMessage.textContent = "Backend unavailable";
        healthMeta.textContent = error.message;
    }
}

async function loadDashboardData() {
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

        latestStatsData = statsData.stats || {};
        latestDeployments = deploymentData.deployments || [];

        renderStats(latestStatsData);
        renderDeploymentHistory(latestDeployments);
        renderStatusPanel();
    } catch (error) {
        showFeedback(error.message, "error");
    }
}

function buildDeploymentQueryString() {
    const formData = new FormData(deploymentFilterForm);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
        if (String(value).trim()) {
            params.set(key, String(value).trim());
        }
    }

    const queryString = params.toString();

    return queryString ? `?${queryString}` : "";
}

async function loadFilteredDeployments() {
    try {
        const response = await fetch(`/api/deployments${buildDeploymentQueryString()}`);

        if (!response.ok) {
            throw new Error("Unable to load filtered deployments.");
        }

        const data = await response.json();
        deploymentList.innerHTML = data.deployments.length
            ? data.deployments.map((deployment) => createDeploymentCard(deployment, {
                showDetailsButton: true,
            })).join("")
            : '<div class="empty-state">No deployments matched the selected filters.</div>';

        renderDeploymentDetail(data.deployments[0] || null);
    } catch (error) {
        showFeedback(error.message, "error");
    }
}

async function loadDeploymentDetailById(id) {
    const deploymentId = String(id || "").trim();

    if (!deploymentId) {
        return;
    }

    try {
        const response = await fetch(`/api/deployments/${encodeURIComponent(deploymentId)}`);

        if (!response.ok) {
            throw new Error("Unable to load deployment details.");
        }

        const data = await response.json();
        renderDeploymentDetail(data.deployment || null);
    } catch (error) {
        showFeedback(error.message, "error");
    }
}

async function loadProjects() {
    try {
        const response = await fetch("/api/projects");

        if (!response.ok) {
            throw new Error("Unable to load project summaries.");
        }

        const data = await response.json();
        latestProjects = data.projects || [];
        renderProjectOptions(latestProjects);
        renderProjectSummaries(latestProjects);
    } catch (error) {
        showFeedback(error.message, "error");
    }
}

async function refreshAllData() {
    clearFeedback();
    await Promise.all([loadHealth(), loadDashboardData(), loadProjects()]);
    await loadFilteredDeployments();
}

function handleLoginSubmit(event) {
    event.preventDefault();
    clearAuthFeedback();

    const formData = new FormData(loginForm);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const users = getStoredUsers();
    const matchedUser = users.find((user) => user.email === email && user.password === password);

    if (!matchedUser) {
        showAuthFeedback("Invalid email or password. Try demo@deploytrack.com / demo1234", "error");
        return;
    }

    setSession({
        name: matchedUser.name,
        email: matchedUser.email,
        loginAt: new Date().toISOString(),
    });

    setAuthenticatedUi(getSession());
    refreshAllData();
}

function handleSignupSubmit(event) {
    event.preventDefault();
    clearAuthFeedback();

    const formData = new FormData(signupForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();

    if (password.length < 6) {
        showAuthFeedback("Password should be at least 6 characters for demo signup.", "error");
        return;
    }

    const users = getStoredUsers();
    const exists = users.some((user) => user.email === email);

    if (exists) {
        showAuthFeedback("Account already exists. Use login instead.", "error");
        return;
    }

    users.push({ name, email, password });
    saveUsers(users);

    setSession({
        name,
        email,
        loginAt: new Date().toISOString(),
    });

    showAuthFeedback("Account created. Redirecting to dashboard...", "success");
    setAuthenticatedUi(getSession());
    refreshAllData();
}

function handleLogout() {
    clearSession();
    setAuthenticatedUi(null);
    showAuthFeedback("You have been logged out.", "success");
}

function initializeAuth() {
    ensureDemoUser();

    loginTab.addEventListener("click", () => switchAuthMode("login"));
    signupTab.addEventListener("click", () => switchAuthMode("signup"));
    loginForm.addEventListener("submit", handleLoginSubmit);
    signupForm.addEventListener("submit", handleSignupSubmit);
    logoutButton.addEventListener("click", handleLogout);

    const session = getSession();
    setAuthenticatedUi(session);

    return Boolean(session?.email);
}

navButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activateView(button.dataset.viewTarget);
        setNavOpen(false);
    });
});

openNavButton.addEventListener("click", () => {
    setNavOpen(true);
});

closeNavButton.addEventListener("click", () => {
    setNavOpen(false);
});

navOverlay.addEventListener("click", () => {
    setNavOpen(false);
});

themeToggle.addEventListener("click", toggleTheme);

deploymentList.addEventListener("click", (event) => {
    const target = event.target.closest(".detail-trigger");

    if (!target) {
        return;
    }

    loadDeploymentDetailById(target.dataset.deploymentId);
});

deploymentFilterForm.addEventListener("input", loadFilteredDeployments);
deploymentFilterForm.addEventListener("change", loadFilteredDeployments);

deploymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFeedback();

    const formData = new FormData(deploymentForm);
    const payload = {
        project: formData.get("project"),
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
        deploymentForm.elements.project.value = "Deploy Track";
        deploymentForm.elements.branch.value = "main";
        showFeedback("Deployment saved successfully.", "success");

        await refreshAllData();
        activateView("deployments-view");
    } catch (error) {
        showFeedback(error.message, "error");
    }
});

refreshButton.addEventListener("click", refreshAllData);

loadSavedTheme();
activateView("dashboard-view");
if (initializeAuth()) {
    refreshAllData();
}
