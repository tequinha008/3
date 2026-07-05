lucide.createIcons();

const welcomeTitle = document.getElementById("welcomeTitle");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatar = document.getElementById("avatar");

const metricHotels = document.getElementById("metricHotels");
const metricFinance = document.getElementById("metricFinance");
const metricRefunds = document.getElementById("metricRefunds");

const logoutButton = document.getElementById("logoutButton");

async function checkAuth() {
    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        window.location.href = "index.html";
        return null;
    }

    return data.session.user;
}

async function getUserProfile(userId) {
    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) {
        return null;
    }

    return data;
}

function applyUserProfile(profile, user) {
    const name = profile?.nome || user.email.split("@")[0];
    const role = profile?.perfil || "usuario";

    welcomeTitle.textContent = `Bem-vindo(a), ${name.split(" ")[0]}.`;
    userName.textContent = name;
    userRole.textContent = role.toUpperCase();
    avatar.textContent = name.charAt(0).toUpperCase();

    if (role === "admin" || role === "master") {
        document.querySelectorAll(".admin-link").forEach(function (item) {
            item.classList.remove("hidden");
        });
    }
}

async function countPending(tableName) {
    const { count, error } = await supabaseClient
        .from(tableName)
        .select("*", {
            count: "exact",
            head: true
        })
        .eq("status", "PENDENTE");

    if (error) {
        return 0;
    }

    return count || 0;
}

async function loadMetrics() {
    metricHotels.textContent = await countPending("solicitacoes_hotel");
    metricFinance.textContent = await countPending("lancamentos");
    metricRefunds.textContent = await countPending("reembolsos");
}

logoutButton.addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
});

async function startDashboard() {
    const user = await checkAuth();

    if (!user) {
        return;
    }

    const profile = await getUserProfile(user.id);

    applyUserProfile(profile, user);

    await loadMetrics();

    lucide.createIcons();
}

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");

    const icon = sidebar.classList.contains("collapsed")
        ? "panel-left-open"
        : "panel-left-close";

    sidebarToggle.innerHTML = `<i data-lucide="${icon}"></i>`;
    lucide.createIcons();
});

startDashboard();