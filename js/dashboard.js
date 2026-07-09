lucide.createIcons();

const welcomeTitle = document.getElementById("welcomeTitle");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const avatar = document.getElementById("avatar");

const metricHotels = document.getElementById("metricHotels");
const metricFinance = document.getElementById("metricFinance");
const metricRefunds = document.getElementById("metricRefunds");
const recentActivities = document.getElementById("recentActivities");
const volumeChart = document.getElementById("volumeChart");

const logoutButton = document.getElementById("logoutButton");
const refreshDashboardButton = document.getElementById("refreshDashboardButton");
const toast = document.getElementById("toast");

let toastTimer = null;

function showToast(message) {
    if (!toast) {
        return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove("hidden");
    toastTimer = window.setTimeout(function () {
        toast.classList.add("hidden");
    }, 2600);
}

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

    if (role === "master") {
        document.querySelectorAll(".admin-link").forEach(function (item) {
            item.classList.remove("hidden");
        });
    }
}

async function countRows(tableName, status = null) {
    let query = supabaseClient
        .from(tableName)
        .select("*", {
            count: "exact",
            head: true
        });

    if (status) {
        query = query.eq("status", status);
    }

    const { count, error } = await query;

    if (error) {
        console.warn(`Não foi possível contar ${tableName}.`, error);
        return 0;
    }

    return count || 0;
}

async function loadMetrics() {
    metricHotels.textContent = await countRows("solicitacoes_hotel", "PENDENTE");
    metricFinance.textContent = await countRows("lancamentos", "PENDENTE");
    metricRefunds.textContent = await countRows("reembolsos", "PENDENTE");
}

function chartModules() {
    return [
        {
            label: "Hotéis",
            table: "solicitacoes_hotel",
            className: "hotel",
            icon: "building-2"
        },
        {
            label: "Valores a pagar",
            table: "lancamentos",
            className: "finance",
            icon: "wallet-cards"
        },
        {
            label: "Reembolsos",
            table: "reembolsos",
            className: "refund",
            icon: "receipt-text"
        }
    ];
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
}

function formatDateTime(value) {
    if (!value) {
        return "Data não informada";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Data não informada";
    }

    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function moduleInfo(moduleName) {
    const module = normalizeText(moduleName);

    if (module.includes("HOT")) {
        return {
            label: "Hotéis",
            singular: "hotel",
            icon: "building-2",
            className: "hotel"
        };
    }

    if (module.includes("REEMB")) {
        return {
            label: "Reembolsos",
            singular: "reembolso",
            icon: "receipt-text",
            className: "refund"
        };
    }

    return {
        label: "Valores a pagar",
        singular: "lançamento",
        icon: "wallet-cards",
        className: "finance"
    };
}

function describeHistoryActivity(item) {
    const info = moduleInfo(item.modulo);
    const actor = item.alterado_por_nome || "Usuário";
    const code = item.codigo_tres || item.depois?.codigo_tres || item.antes?.codigo_tres || "sem código";
    const action = normalizeText(item.acao);
    const status = item?.alteracoes?.status?.depois || item?.depois?.status || "";
    let title = `${actor} atualizou ${info.singular} ${code}`;

    if (action.includes("STATUS")) {
        title = status === "CONCLUIDO"
            ? `${actor} concluiu ${info.singular} ${code}`
            : `${actor} atualizou o status de ${code}`;
    } else if (item?.alteracoes?.emissor_id) {
        title = `${actor} alterou o emissor de ${info.singular} ${code}`;
    } else if (action.includes("EDI")) {
        title = `${actor} editou ${info.singular} ${code}`;
    }

    return {
        module: info,
        title,
        meta: `${info.label} • ${formatDateTime(item.created_at)}`,
        date: item.created_at
    };
}

function describeCreationActivity(item, moduleName) {
    const info = moduleInfo(moduleName);
    const actor = item.emissor_nome || "Usuário";
    const code = item.codigo_tres || "sem código";
    const subject = item.nome_hotel || item.servico || item.fornecedor || item.cliente || info.singular;

    return {
        module: info,
        title: `${actor} criou ${info.singular} ${code}`,
        meta: `${info.label} • ${subject} • ${formatDateTime(item.created_at || item.data_solicitacao)}`,
        date: item.created_at || item.data_solicitacao
    };
}

function renderActivities(items) {
    if (!recentActivities) {
        return;
    }

    const panel = recentActivities.closest(".panel");
    const eyebrow = panel?.querySelector(".eyebrow");
    const title = panel?.querySelector("h3");

    if (eyebrow) eyebrow.textContent = "Últimas atualizações";
    if (title) title.textContent = "Resumo recente";

    if (!items.length) {
        recentActivities.innerHTML = `
            <div class="empty-state">
                <i data-lucide="sparkles"></i>
                <p>As últimas atualizações aparecerão aqui quando os módulos forem utilizados.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    recentActivities.innerHTML = items.map(function (item) {
        return `
            <article class="activity-item">
                <div class="activity-icon ${item.module.className}">
                    <i data-lucide="${item.module.icon}"></i>
                </div>
                <div>
                    <p class="activity-title">${escapeHtml(item.title)}</p>
                    <p class="activity-meta">${escapeHtml(item.meta)}</p>
                </div>
            </article>
        `;
    }).join("");

    lucide.createIcons();
}

async function loadHistoryActivities() {
    const { data, error } = await supabaseClient
        .from("solicitacoes_historico")
        .select("id, modulo, solicitacao_id, codigo_tres, acao, alterado_por_nome, alteracoes, antes, depois, created_at")
        .order("created_at", { ascending: false })
        .limit(4);

    if (error) {
        console.warn("Não foi possível carregar o histórico recente.", error);
        return [];
    }

    return (data || []).map(describeHistoryActivity);
}

async function loadCreationActivities() {
    const [hotelsResult, financeResult, refundsResult] = await Promise.all([
        supabaseClient
            .from("solicitacoes_hotel")
            .select("id, codigo_tres, nome_hotel, emissor_nome, created_at, data_solicitacao")
            .order("created_at", { ascending: false })
            .limit(4),
        supabaseClient
            .from("lancamentos")
            .select("id, codigo_tres, servico, fornecedor, cliente, emissor_nome, created_at")
            .order("created_at", { ascending: false })
            .limit(4),
        supabaseClient
            .from("reembolsos")
            .select("id, codigo_tres, fornecedor, cliente, emissor_nome, created_at, data_solicitacao")
            .order("created_at", { ascending: false })
            .limit(4)
    ]);

    return [
        ...((hotelsResult.data || []).map(function (item) {
            return describeCreationActivity(item, "HOTEIS");
        })),
        ...((financeResult.data || []).map(function (item) {
            return describeCreationActivity(item, "VALORES_A_PAGAR");
        })),
        ...((refundsResult.data || []).map(function (item) {
            return describeCreationActivity(item, "REEMBOLSOS");
        }))
    ].sort(function (a, b) {
        return new Date(b.date || 0) - new Date(a.date || 0);
    }).slice(0, 4);
}

async function loadRecentActivities() {
    const historyActivities = await loadHistoryActivities();
    const creationActivities = await loadCreationActivities();

    renderActivities([...historyActivities, ...creationActivities]
        .sort(function (a, b) {
            return new Date(b.date || 0) - new Date(a.date || 0);
        })
        .slice(0, 4));
}

async function loadVolumeData() {
    const modules = chartModules();

    return Promise.all(modules.map(async function (module) {
        const [total, pending, done] = await Promise.all([
            countRows(module.table),
            countRows(module.table, "PENDENTE"),
            countRows(module.table, "CONCLUIDO")
        ]);

        return {
            ...module,
            total,
            pending,
            done
        };
    }));
}

function chartScaleMax(value) {
    if (value <= 10) {
        return 10;
    }

    if (value <= 100) {
        return Math.ceil(value / 10) * 10;
    }

    if (value <= 1000) {
        return Math.ceil(value / 100) * 100;
    }

    const magnitude = 10 ** (String(Math.floor(value)).length - 1);
    return Math.ceil(value / magnitude) * magnitude;
}

function renderVolumeChart(items) {
    if (!volumeChart) {
        return;
    }

    const eyebrow = volumeChart.closest(".panel")?.querySelector(".eyebrow");

    if (eyebrow) {
        eyebrow.textContent = "Indicadores";
    }

    const maxTotal = Math.max(...items.map(function (item) {
        return item.total;
    }), 0);
    const scaleMax = chartScaleMax(maxTotal);

    if (maxTotal === 0) {
        volumeChart.innerHTML = `
            <div class="empty-state">
                <i data-lucide="bar-chart-3"></i>
                <p>Os volumes aparecerão aqui quando os módulos forem utilizados.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    volumeChart.innerHTML = items.map(function (item) {
        const width = Math.max(6, Math.round((item.total / scaleMax) * 100));

        return `
            <article class="volume-row">
                <div class="volume-row-header">
                    <span class="volume-label ${item.className}">
                        <i data-lucide="${item.icon}"></i>
                        ${item.label}
                    </span>
                    <strong>${item.total}</strong>
                </div>

                <div class="volume-track">
                    <span class="volume-fill ${item.className}" style="width: ${width}%"></span>
                </div>

                <div class="volume-meta">
                    <span>${item.pending} pendente(s)</span>
                    <span>${item.done} concluído(s)</span>
                </div>
            </article>
        `;
    }).join("");

    lucide.createIcons();
}

async function loadVolumeChart() {
    const data = await loadVolumeData();
    renderVolumeChart(data);
}

async function refreshDashboard() {
    await loadMetrics();
    await loadRecentActivities();
    await loadVolumeChart();
}

if (refreshDashboardButton) {
    refreshDashboardButton.addEventListener("click", async function () {
        refreshDashboardButton.disabled = true;

        try {
            await refreshDashboard();
            showToast("Painel atualizado.");
        } finally {
            refreshDashboardButton.disabled = false;
            lucide.createIcons();
        }
    });
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

    if (profile?.primeiro_acesso) {
        window.location.href = "conta.html";
        return;
    }

    applyUserProfile(profile, user);

    await refreshDashboard();

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
