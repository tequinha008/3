lucide.createIcons();

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const logoutButton = document.getElementById("logoutButton");
const toast = document.getElementById("toast");

const avatar = document.getElementById("avatar");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const profileAvatar = document.getElementById("profileAvatar");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileRole = document.getElementById("profileRole");
const profileStatus = document.getElementById("profileStatus");
const profileAccessStatus = document.getElementById("profileAccessStatus");
const firstAccessBanner = document.getElementById("firstAccessBanner");
const regularAccountHeader = document.getElementById("regularAccountHeader");

const passwordChangeForm = document.getElementById("passwordChangeForm");
const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const changePasswordButton = document.getElementById("changePasswordButton");
const clearPasswordForm = document.getElementById("clearPasswordForm");

const rules = {
    length: document.getElementById("ruleLength"),
    upper: document.getElementById("ruleUpper"),
    lower: document.getElementById("ruleLower"),
    number: document.getElementById("ruleNumber"),
    symbol: document.getElementById("ruleSymbol")
};

let currentUser = null;
let currentProfile = null;
let toastTimer = null;

function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove("hidden");
    toastTimer = window.setTimeout(function () {
        toast.classList.add("hidden");
    }, 4000);
}

function roleLabel(role) {
    if (role === "master") return "MASTER";
    if (role === "admin") return "ADMINISTRADOR";
    return "USUÁRIO";
}

function passwordChecks(password) {
    return {
        length: password.length >= 8,
        upper: /[A-Z]/.test(password),
        lower: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password)
    };
}

function updatePasswordRules() {
    const checks = passwordChecks(newPassword.value);

    Object.keys(checks).forEach(function (rule) {
        const valid = checks[rule];
        rules[rule].classList.toggle("valid", valid);
        rules[rule].innerHTML = valid
            ? `<i data-lucide="circle-check"></i>${rules[rule].textContent.trim()}`
            : `<i data-lucide="circle"></i>${rules[rule].textContent.trim()}`;
    });

    lucide.createIcons();
    return Object.values(checks).every(Boolean);
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
        .select("id, nome, email, perfil, primeiro_acesso, ativo")
        .eq("id", userId)
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    return data;
}

function applyProfile(profile, user) {
    const name = profile.nome || user.email.split("@")[0];
    const initial = name.charAt(0).toUpperCase();
    const role = roleLabel(profile.perfil);

    avatar.textContent = initial;
    profileAvatar.textContent = initial;
    userName.textContent = name;
    userRole.textContent = role;
    profileName.textContent = name;
    profileEmail.textContent = profile.email || user.email;
    profileRole.textContent = role;
    profileStatus.textContent = profile.ativo ? "ATIVO" : "INATIVO";
    profileAccessStatus.textContent = profile.primeiro_acesso
        ? "Troca de senha pendente"
        : "Senha definitiva cadastrada";

    if (profile.perfil === "master") {
        document.querySelectorAll(".admin-link").forEach(function (link) {
            link.classList.remove("hidden");
        });
    }

    if (profile.primeiro_acesso) {
        firstAccessBanner.classList.remove("hidden");
        regularAccountHeader.classList.add("hidden");
        document.body.classList.add("first-access-required");
        changePasswordButton.textContent = "Criar senha definitiva";
    }
}

async function changePassword(event) {
    event.preventDefault();

    if (!updatePasswordRules()) {
        showToast("A nova senha ainda não atende a todos os requisitos.");
        return;
    }

    if (newPassword.value !== confirmPassword.value) {
        showToast("A confirmação não corresponde à nova senha.");
        return;
    }

    if (currentPassword.value === newPassword.value) {
        showToast("A nova senha precisa ser diferente da senha atual.");
        return;
    }

    changePasswordButton.disabled = true;
    changePasswordButton.textContent = "Salvando...";

    try {
        const { error: validationError } = await supabaseClient.auth.signInWithPassword({
            email: currentUser.email,
            password: currentPassword.value
        });

        if (validationError) {
            showToast("A senha atual está incorreta.");
            return;
        }

        const { error: passwordError } = await supabaseClient.auth.updateUser({
            password: newPassword.value
        });

        if (passwordError) {
            throw passwordError;
        }

        const { error: profileError } = await supabaseClient.rpc("concluir_primeiro_acesso");
        if (profileError) {
            throw new Error("A senha foi alterada, mas não foi possível concluir o primeiro acesso.");
        }

        const wasFirstAccess = currentProfile.primeiro_acesso;
        currentProfile.primeiro_acesso = false;
        passwordChangeForm.reset();
        updatePasswordRules();
        showToast("Senha alterada com sucesso.");

        if (wasFirstAccess) {
            window.setTimeout(function () {
                window.location.href = "dashboard.html";
            }, 1200);
        } else {
            profileAccessStatus.textContent = "Senha definitiva cadastrada";
        }
    } catch (error) {
        console.error(error);
        showToast(error.message || "Não foi possível alterar a senha.");
    } finally {
        changePasswordButton.disabled = false;
        changePasswordButton.textContent = currentProfile?.primeiro_acesso
            ? "Criar senha definitiva"
            : "Salvar nova senha";
    }
}

document.querySelectorAll(".password-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
        const input = document.getElementById(button.dataset.target);
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        button.innerHTML = `<i data-lucide="${show ? "eye-off" : "eye"}"></i>`;
        button.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
        lucide.createIcons();
    });
});

newPassword.addEventListener("input", updatePasswordRules);
passwordChangeForm.addEventListener("submit", changePassword);
clearPasswordForm.addEventListener("click", function () {
    passwordChangeForm.reset();
    updatePasswordRules();
});

logoutButton.addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
});

sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    const icon = sidebar.classList.contains("collapsed") ? "panel-left-open" : "panel-left-close";
    sidebarToggle.innerHTML = `<i data-lucide="${icon}"></i>`;
    lucide.createIcons();
});

async function startAccountModule() {
    currentUser = await checkAuth();
    if (!currentUser) return;

    currentProfile = await getUserProfile(currentUser.id);
    if (!currentProfile) {
        showToast("Perfil não encontrado.");
        return;
    }

    applyProfile(currentProfile, currentUser);
    updatePasswordRules();
    lucide.createIcons();
}

startAccountModule();
