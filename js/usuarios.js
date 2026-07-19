lucide.createIcons();

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const SIDEBAR_STORAGE_KEY = "tresSidebarCollapsed";
const SIDEBAR_INITIAL_CLASS = "sidebar-collapsed-initial";

function syncSidebarInitialClass(collapsed) {
    document.documentElement.classList.toggle(SIDEBAR_INITIAL_CLASS, collapsed);
}

function updateSidebarToggleIcon() {
    if (!sidebar || !sidebarToggle) return;

    const icon = sidebar.classList.contains("collapsed")
        ? "panel-left-open"
        : "panel-left-close";

    sidebarToggle.innerHTML = `<i data-lucide="${icon}"></i>`;

    if (window.lucide) {
        lucide.createIcons();
    }
}

function applyStoredSidebarState() {
    if (!sidebar) return;

    const collapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    sidebar.classList.toggle("collapsed", collapsed);
    syncSidebarInitialClass(collapsed);
    updateSidebarToggleIcon();
}

function toggleSidebarState() {
    if (!sidebar) return;

    sidebar.classList.toggle("collapsed");
    const collapsed = sidebar.classList.contains("collapsed");
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    syncSidebarInitialClass(collapsed);
    updateSidebarToggleIcon();
}

function initSidebarPersistence() {
    applyStoredSidebarState();

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", toggleSidebarState);
    }
}
const avatar = document.getElementById("avatar");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const logoutButton = document.getElementById("logoutButton");
const toast = document.getElementById("toast");

const summaryUsers = document.getElementById("summaryUsers");
const summaryActive = document.getElementById("summaryActive");
const summaryManagers = document.getElementById("summaryManagers");

const createUserForm = document.getElementById("createUserForm");
const newUserName = document.getElementById("newUserName");
const newUserEmail = document.getElementById("newUserEmail");
const newUserRole = document.getElementById("newUserRole");
const newUserPassword = document.getElementById("newUserPassword");
const createUserButton = document.getElementById("createUserButton");
const clearUserForm = document.getElementById("clearUserForm");

const refreshUsersButton = document.getElementById("refreshUsersButton");
const userSearch = document.getElementById("userSearch");
const userRoleFilter = document.getElementById("userRoleFilter");
const userStatusFilter = document.getElementById("userStatusFilter");
const usersTableBody = document.getElementById("usersTableBody");
const usersPaginationInfo = document.getElementById("usersPaginationInfo");
const usersPageSize = document.getElementById("usersPageSize");
const usersPrevPage = document.getElementById("usersPrevPage");
const usersNextPage = document.getElementById("usersNextPage");
const usersPageIndicator = document.getElementById("usersPageIndicator");

const editUserModal = document.getElementById("editUserModal");
const editUserForm = document.getElementById("editUserForm");
const editUserId = document.getElementById("editUserId");
const editUserName = document.getElementById("editUserName");
const editUserEmail = document.getElementById("editUserEmail");
const editUserRole = document.getElementById("editUserRole");
const editUserActive = document.getElementById("editUserActive");
const saveEditUser = document.getElementById("saveEditUser");
const closeEditUser = document.getElementById("closeEditUser");
const cancelEditUser = document.getElementById("cancelEditUser");

const passwordModal = document.getElementById("passwordModal");
const passwordForm = document.getElementById("passwordForm");
const passwordUserId = document.getElementById("passwordUserId");
const passwordUserDescription = document.getElementById("passwordUserDescription");
const temporaryPassword = document.getElementById("temporaryPassword");
const saveTemporaryPassword = document.getElementById("saveTemporaryPassword");
const closePasswordModal = document.getElementById("closePasswordModal");
const cancelPasswordModal = document.getElementById("cancelPasswordModal");

let currentUser = null;
let currentProfile = null;
let users = [];
let toastTimer = null;
let usersCurrentPage = 1;

function normalizeText(value) {
    return String(value || "").trim().toUpperCase();
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove("hidden");
    toastTimer = window.setTimeout(function () {
        toast.classList.add("hidden");
    }, 4000);
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

    return error ? null : data;
}

function applyUserProfile(profile, user) {
    const name = profile?.nome || user.email.split("@")[0];
    userName.textContent = name;
    userRole.textContent = String(profile?.perfil || "usuario").toUpperCase();
    avatar.textContent = name.charAt(0).toUpperCase();
}

function roleLabel(role) {
    if (role === "master") return "MASTER";
    if (role === "admin") return "ADMINISTRADOR";
    return "USU\u00c1RIO";
}

function roleBadge(role) {
    return `<span class="profile-badge profile-${escapeHtml(role)}">${roleLabel(role)}</span>`;
}

function statusBadge(active) {
    return active
        ? `<span class="user-status-badge user-status-active">ATIVO</span>`
        : `<span class="user-status-badge user-status-inactive">INATIVO</span>`;
}

function getFilteredUsers() {
    const search = normalizeText(userSearch.value);
    const role = userRoleFilter.value;
    const status = userStatusFilter.value;

    return users.filter(function (user) {
        const matchesSearch = !search ||
            normalizeText(user.nome).includes(search) ||
            normalizeText(user.email).includes(search);
        const matchesRole = !role || user.perfil === role;
        const matchesStatus = !status ||
            (status === "ativo" && user.ativo) ||
            (status === "inativo" && !user.ativo);
        return matchesSearch && matchesRole && matchesStatus;
    });
}

function resetUsersPagination() {
    usersCurrentPage = 1;
    renderUsers();
}

function getUsersPageSize() {
    return Number(usersPageSize?.value || 10);
}

function updateUsersPagination(totalItems) {
    const pageSize = getUsersPageSize();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (usersCurrentPage > totalPages) {
        usersCurrentPage = totalPages;
    }

    const start = totalItems === 0 ? 0 : ((usersCurrentPage - 1) * pageSize) + 1;
    const end = Math.min(totalItems, usersCurrentPage * pageSize);

    if (usersPaginationInfo) {
        usersPaginationInfo.textContent = `Mostrando ${start}-${end} de ${totalItems}`;
    }

    if (usersPageIndicator) {
        usersPageIndicator.textContent = `P\u00e1gina ${usersCurrentPage} de ${totalPages}`;
    }

    if (usersPrevPage) {
        usersPrevPage.disabled = usersCurrentPage <= 1;
    }

    if (usersNextPage) {
        usersNextPage.disabled = usersCurrentPage >= totalPages;
    }
}

function updateSummary() {
    summaryUsers.textContent = users.length;
    summaryActive.textContent = users.filter(function (user) { return user.ativo; }).length;
    summaryManagers.textContent = users.filter(function (user) {
        return user.perfil === "admin" || user.perfil === "master";
    }).length;
}

function renderUsers() {
    const filtered = getFilteredUsers();
    const pageSize = getUsersPageSize();

    updateSummary();
    updateUsersPagination(filtered.length);

    if (filtered.length === 0) {
        usersTableBody.innerHTML = `
            <tr><td colspan="6" class="empty-table-message">Nenhum usu\u00e1rio encontrado.</td></tr>
        `;
        return;
    }

    const visible = filtered.slice(
        (usersCurrentPage - 1) * pageSize,
        usersCurrentPage * pageSize
    );

    usersTableBody.innerHTML = visible.map(function (user) {
        return `
            <tr>
                <td><strong>${escapeHtml(user.nome || "-")}</strong></td>
                <td>${escapeHtml(user.email || "-")}</td>
                <td>${roleBadge(user.perfil)}</td>
                <td>${statusBadge(user.ativo)}</td>
                <td class="${user.primeiro_acesso ? "users-first-access" : ""}">
                    ${user.primeiro_acesso ? "PENDENTE" : "CONCLU\u00cdDO"}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-button" data-action="edit" data-id="${user.id}" title="Editar usu\u00e1rio">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="icon-button" data-action="password" data-id="${user.id}" title="Redefinir senha">
                            <i data-lucide="key-round"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    lucide.createIcons();
}

async function loadUsers() {
    usersTableBody.innerHTML = `<tr><td colspan="6" class="empty-table-message">Carregando usu\u00e1rios...</td></tr>`;

    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("id, nome, email, perfil, primeiro_acesso, ativo, created_at")
        .order("nome", { ascending: true });

    if (error) {
        console.error(error);
        showToast("Erro ao carregar usu\u00e1rios.");
        return;
    }

    users = data || [];
    renderUsers();
}

async function invokeAdminUsers(body) {
    const { data, error } = await supabaseClient.functions.invoke("rapid-api", { body: body });

    if (error) {
        let message = error.message || "Erro ao acessar o servi\u00e7o de usu\u00e1rios.";
        try {
            const responseData = await error.context.json();
            message = responseData.error || message;
        } catch (_error) {
            // Mant\u00e9m a mensagem original quando a resposta n\u00e3o cont\u00e9m JSON.
        }
        throw new Error(message);
    }

    if (!data?.success) {
        throw new Error(data?.error || "Opera\u00e7\u00e3o n\u00e3o conclu\u00edda.");
    }

    return data;
}

async function createUser(event) {
    event.preventDefault();
    createUserButton.disabled = true;
    createUserButton.textContent = "Criando...";

    try {
        await invokeAdminUsers({
            action: "create",
            nome: newUserName.value.trim(),
            email: newUserEmail.value.trim().toLowerCase(),
            perfil: newUserRole.value,
            password: newUserPassword.value
        });

        showToast("Usu\u00e1rio criado com sucesso.");
        createUserForm.reset();
        newUserRole.value = "usuario";
        await loadUsers();
    } catch (error) {
        console.error(error);
        showToast(error.message);
    } finally {
        createUserButton.disabled = false;
        createUserButton.textContent = "Criar acesso";
    }
}

function setModalOpen(modal, open) {
    modal.classList.toggle("hidden", !open);
    modal.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.classList.toggle(
        "users-modal-open",
        open || !editUserModal.classList.contains("hidden") || !passwordModal.classList.contains("hidden")
    );
}

function openEditModal(id) {
    const user = users.find(function (item) { return String(item.id) === String(id); });
    if (!user) return;

    editUserId.value = user.id;
    editUserName.value = user.nome || "";
    editUserEmail.value = user.email || "";
    editUserRole.value = user.perfil || "usuario";
    editUserActive.checked = Boolean(user.ativo);
    setModalOpen(editUserModal, true);
    editUserName.focus();
}

async function updateUser(event) {
    event.preventDefault();
    saveEditUser.disabled = true;
    saveEditUser.textContent = "Salvando...";

    try {
        await invokeAdminUsers({
            action: "update",
            id: editUserId.value,
            nome: editUserName.value.trim(),
            perfil: editUserRole.value,
            ativo: editUserActive.checked
        });
        setModalOpen(editUserModal, false);
        showToast("Usu\u00e1rio atualizado.");
        await loadUsers();
    } catch (error) {
        console.error(error);
        showToast(error.message);
    } finally {
        saveEditUser.disabled = false;
        saveEditUser.textContent = "Salvar altera\u00e7\u00f5es";
    }
}

function openPasswordReset(id) {
    const user = users.find(function (item) { return String(item.id) === String(id); });
    if (!user) return;

    passwordUserId.value = user.id;
    passwordUserDescription.textContent = `Defina uma senha tempor\u00e1ria para ${user.nome}. A troca ser\u00e1 exigida no pr\u00f3ximo acesso.`;
    temporaryPassword.value = "";
    setModalOpen(passwordModal, true);
    temporaryPassword.focus();
}

async function resetPassword(event) {
    event.preventDefault();
    saveTemporaryPassword.disabled = true;
    saveTemporaryPassword.textContent = "Redefinindo...";

    try {
        await invokeAdminUsers({
            action: "reset_password",
            id: passwordUserId.value,
            password: temporaryPassword.value
        });
        setModalOpen(passwordModal, false);
        showToast("Senha tempor\u00e1ria definida.");
        await loadUsers();
    } catch (error) {
        console.error(error);
        showToast(error.message);
    } finally {
        saveTemporaryPassword.disabled = false;
        saveTemporaryPassword.textContent = "Redefinir senha";
    }
}

createUserForm.addEventListener("submit", createUser);
clearUserForm.addEventListener("click", function () {
    createUserForm.reset();
    newUserRole.value = "usuario";
});
refreshUsersButton.addEventListener("click", loadUsers);
userSearch.addEventListener("input", resetUsersPagination);
userRoleFilter.addEventListener("change", resetUsersPagination);
userStatusFilter.addEventListener("change", resetUsersPagination);

if (usersPageSize) {
    usersPageSize.addEventListener("change", resetUsersPagination);
}

if (usersPrevPage) {
    usersPrevPage.addEventListener("click", function () {
        if (usersCurrentPage > 1) {
            usersCurrentPage -= 1;
            renderUsers();
        }
    });
}

if (usersNextPage) {
    usersNextPage.addEventListener("click", function () {
        usersCurrentPage += 1;
        renderUsers();
    });
}

usersTableBody.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    if (button.dataset.action === "edit") openEditModal(button.dataset.id);
    if (button.dataset.action === "password") openPasswordReset(button.dataset.id);
});

editUserForm.addEventListener("submit", updateUser);
passwordForm.addEventListener("submit", resetPassword);
closeEditUser.addEventListener("click", function () { setModalOpen(editUserModal, false); });
cancelEditUser.addEventListener("click", function () { setModalOpen(editUserModal, false); });
closePasswordModal.addEventListener("click", function () { setModalOpen(passwordModal, false); });
cancelPasswordModal.addEventListener("click", function () { setModalOpen(passwordModal, false); });

[editUserModal, passwordModal].forEach(function (modal) {
    modal.addEventListener("click", function (event) {
        if (event.target === modal) setModalOpen(modal, false);
    });
});

document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (!editUserModal.classList.contains("hidden")) setModalOpen(editUserModal, false);
    if (!passwordModal.classList.contains("hidden")) setModalOpen(passwordModal, false);
});

logoutButton.addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
});

initSidebarPersistence();

async function startUsersModule() {
    currentUser = await checkAuth();
    if (!currentUser) return;

    currentProfile = await getUserProfile(currentUser.id);
    if (currentProfile?.primeiro_acesso) {
        window.location.href = "conta.html";
        return;
    }

    if (!currentProfile || currentProfile.perfil !== "master" || !currentProfile.ativo) {
        window.location.href = "dashboard.html";
        return;
    }

    applyUserProfile(currentProfile, currentUser);
    await loadUsers();
    lucide.createIcons();
}

startUsersModule();



