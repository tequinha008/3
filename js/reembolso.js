lucide.createIcons();

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

const avatar = document.getElementById("avatar");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const logoutButton = document.getElementById("logoutButton");

const refundForm = document.getElementById("refundForm");
const dataSolicitacao = document.getElementById("dataSolicitacao");
const emissorNome = document.getElementById("emissorNome");
const cliente = document.getElementById("cliente");
const os = document.getElementById("os");
const fornecedor = document.getElementById("fornecedor");
const valorCobrado = document.getElementById("valorCobrado");
const valorReembolsado = document.getElementById("valorReembolsado");
const taxaAdmPreview = document.getElementById("taxaAdmPreview");
const valorFinalPreview = document.getElementById("valorFinalPreview");
const clearRefundForm = document.getElementById("clearRefundForm");
const saveRefundButton = document.getElementById("saveRefundButton");

const summaryRequested = document.getElementById("summaryRequested");
const summaryTax = document.getElementById("summaryTax");
const summaryFinal = document.getElementById("summaryFinal");

const completeSelectedButton = document.getElementById("completeSelectedButton");
const exportRefundsButton = document.getElementById("exportRefundsButton");

const startDate = document.getElementById("startDate");
const endDate = document.getElementById("endDate");
const refundStatusFilter = document.getElementById("refundStatusFilter");
const refundSearch = document.getElementById("refundSearch");
const refundTableBody = document.getElementById("refundTableBody");
const selectAllRefunds = document.getElementById("selectAllRefunds");

const toast = document.getElementById("toast");
let currentPage = 1;
const rowsPerPage = 10;

function ensureConfirmationModal() {
    if (!document.getElementById("confirmModalStyles")) {
        const styles = document.createElement("style");
        styles.id = "confirmModalStyles";
        styles.textContent = `
            body.modal-open { overflow: hidden; }
            .tres-modal-backdrop {
                position: fixed;
                inset: 0;
                z-index: 120;
                display: grid;
                place-items: center;
                padding: 20px;
                background: rgba(15, 23, 42, 0.62);
                backdrop-filter: blur(3px);
            }
            .tres-modal-backdrop.hidden { display: none; }
            .tres-modal-card {
                width: min(100%, 440px);
                border: 1px solid #e2e8f0;
                border-radius: 24px;
                padding: 26px;
                background: #ffffff;
                box-shadow: 0 24px 70px rgba(15, 23, 42, 0.28);
            }
            .tres-modal-icon {
                display: grid;
                width: 46px;
                height: 46px;
                place-items: center;
                margin-bottom: 18px;
                border-radius: 14px;
                color: #b45309;
                background: #fef3c7;
            }
            .tres-modal-icon svg { width: 22px; height: 22px; }
            .tres-modal-content h2 {
                margin: 0;
                color: #0f172a;
                font-size: 21px;
            }
            .tres-modal-content p {
                margin: 10px 0 0;
                color: #64748b;
                line-height: 1.55;
            }
            .tres-modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 24px;
            }
            .tres-modal-danger {
                border: 1px solid #dc2626;
                color: #ffffff;
                background: #dc2626;
            }
            .tres-modal-danger:hover {
                border-color: #b91c1c;
                background: #b91c1c;
            }
            @media (max-width: 520px) {
                .tres-modal-actions { flex-direction: column-reverse; }
                .tres-modal-actions .btn { width: 100%; }
            }
        `;
        document.head.appendChild(styles);
    }

    if (!document.getElementById("confirmModal")) {
        const modal = document.createElement("div");
        modal.id = "confirmModal";
        modal.className = "tres-modal-backdrop hidden";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-hidden", "true");
        modal.setAttribute("aria-labelledby", "confirmModalTitle");
        modal.innerHTML = `
            <div class="tres-modal-card">
                <div class="tres-modal-icon" aria-hidden="true">
                    <i data-lucide="triangle-alert"></i>
                </div>
                <div class="tres-modal-content">
                    <h2 id="confirmModalTitle">Confirmar ação</h2>
                    <p id="confirmModalMessage"></p>
                </div>
                <div class="tres-modal-actions">
                    <button type="button" class="btn btn-soft" id="confirmModalCancel">
                        Cancelar
                    </button>
                    <button type="button" class="btn tres-modal-danger" id="confirmModalAction">
                        Confirmar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
}

ensureConfirmationModal();

const confirmModal = document.getElementById("confirmModal");
const confirmModalTitle = document.getElementById("confirmModalTitle");
const confirmModalMessage = document.getElementById("confirmModalMessage");
const confirmModalCancel = document.getElementById("confirmModalCancel");
const confirmModalAction = document.getElementById("confirmModalAction");

let currentUser = null;
let currentProfile = null;
let refunds = [];
let selectedRefunds = new Set();
let confirmationResolver = null;

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function firstDayOfMonthISO() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
}

function money(value) {
    const number = Number(value || 0);

    return number.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function numberValue(input) {
    return Number(input.value || 0);
}

function normalizeText(value) {
    return String(value || "").trim().toUpperCase();
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");

    setTimeout(function () {
        toast.classList.add("hidden");
    }, 3000);
}

function closeConfirmation(confirmed) {
    if (!confirmationResolver) {
        return;
    }

    confirmModal.classList.add("hidden");
    confirmModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    const resolve = confirmationResolver;
    confirmationResolver = null;
    resolve(confirmed);
}

function requestConfirmation(options) {
    if (
        !confirmModal ||
        !confirmModalTitle ||
        !confirmModalMessage ||
        !confirmModalCancel ||
        !confirmModalAction
    ) {
        showToast("Não foi possível abrir a confirmação.");
        return Promise.resolve(false);
    }

    confirmModalTitle.textContent = options.title;
    confirmModalMessage.textContent = options.message;
    confirmModalAction.textContent = options.confirmLabel || "Confirmar";
    confirmModalAction.classList.toggle("btn-danger", Boolean(options.danger));
    confirmModalAction.classList.toggle("btn-primary", !options.danger);

    confirmModal.classList.remove("hidden");
    confirmModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    window.requestAnimationFrame(function () {
        confirmModalAction.focus();
    });

    return new Promise(function (resolve) {
        confirmationResolver = resolve;
    });
}

function isAdminOrMaster() {
    return currentProfile &&
        (currentProfile.perfil === "admin" || currentProfile.perfil === "master");
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

    if (error || !data) {
        return null;
    }

    return data;
}

function applyUserProfile(profile, user) {
    const name = profile?.nome || user.email.split("@")[0];
    const role = profile?.perfil || "usuario";

    userName.textContent = name;
    userRole.textContent = role.toUpperCase();
    avatar.textContent = name.charAt(0).toUpperCase();
    emissorNome.value = name;

    if (role === "master") {
        document.querySelectorAll(".admin-link").forEach(function (item) {
            item.classList.remove("hidden");
        });
    }
}

async function loadClientes() {
    const { data, error } = await supabaseClient
        .from("clientes")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

    if (error) {
        console.error(error);
        showToast("Erro ao carregar clientes.");
        return;
    }

    cliente.innerHTML = `<option value="">Selecione</option>`;

    data.forEach(function (item) {
        cliente.innerHTML += `
            <option value="${item.id}">
                ${item.nome}
            </option>
        `;
    });
}

function calculateTax() {
    return numberValue(valorReembolsado) * 0.035;
}

function calculateFinalRefund() {
    return numberValue(valorReembolsado) - calculateTax();
}

function updateRefundPreview() {
    taxaAdmPreview.value = money(calculateTax());
    valorFinalPreview.value = money(calculateFinalRefund());
}

async function saveRefund(event) {
    event.preventDefault();

    saveRefundButton.disabled = true;
    saveRefundButton.textContent = "Salvando...";

    const payload = {
        data_solicitacao: dataSolicitacao.value,
        emissor_id: currentUser.id,
        cliente_id: cliente.value,
        os: normalizeText(os.value),
        fornecedor: normalizeText(fornecedor.value),
        valor_total_cobrado: numberValue(valorCobrado),
        valor_total_reembolsado: numberValue(valorReembolsado),
        status: "PENDENTE",
        created_by: currentUser.id,
        updated_by: currentUser.id
    };

    const { error } = await supabaseClient
        .from("reembolsos")
        .insert(payload);

    if (error) {
        console.error(error);
        showToast(`Erro ao salvar: ${error.message}`);
    } else {
        showToast("Reembolso salvo com sucesso.");
        refundForm.reset();
        resetRefundForm();
        await loadRefunds();
    }

    saveRefundButton.disabled = false;
    saveRefundButton.textContent = "Salvar reembolso";
}

function resetRefundForm() {
    dataSolicitacao.value = todayISO();
    emissorNome.value = currentProfile.nome;
    taxaAdmPreview.value = money(0);
    valorFinalPreview.value = money(0);
}

async function loadRefunds() {
    const { data, error } = await supabaseClient
        .from("reembolsos")
        .select(`
            id,
            codigo_tres,
            usuarios:emissor_id (nome),
            data_solicitacao,
            os,
            fornecedor,
            valor_total_cobrado,
            valor_total_reembolsado,
            taxa_adm,
            valor_final_reembolso,
            status,
            cliente_id,
            clientes:cliente_id (id, nome)
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);
        refundTableBody.innerHTML = `
            <tr>
                <td colspan="12" class="empty-table-message">
                    Erro ao carregar reembolsos.
                </td>
            </tr>
        `;
        return;
    }

    refunds = data || [];
    renderRefunds();
}

function getFilteredRefunds() {
    const search = normalizeText(refundSearch.value);
    const status = refundStatusFilter.value;
    const start = startDate.value;
    const end = endDate.value;

    return refunds.filter(function (refund) {
        const date = refund.data_solicitacao;

        const matchSearch =
            !search ||
            normalizeText(refund.os).includes(search) ||
            normalizeText(refund.fornecedor).includes(search) ||
            normalizeText(refund.clientes?.nome).includes(search) ||
            normalizeText(refund.codigo_tres).includes(search);

        const matchStatus = !status || refund.status === status;
        const matchStart = !start || date >= start;
        const matchEnd = !end || date <= end;

        return matchSearch && matchStatus && matchStart && matchEnd;
    });
}

function statusBadge(status) {
    if (status === "CONCLUIDO") {
        return `<span class="badge badge-concluido">CONCLUÍDO</span>`;
    }

    return `<span class="badge badge-pendente">PENDENTE</span>`;
}

function updateSummary(filteredRefunds) {
    const requestedTotal = filteredRefunds.reduce(function (sum, item) {
        return sum + Number(item.valor_total_reembolsado || 0);
    }, 0);

    const taxTotal = filteredRefunds.reduce(function (sum, item) {
        return sum + Number(item.taxa_adm || 0);
    }, 0);

    const finalTotal = filteredRefunds.reduce(function (sum, item) {
        return sum + Number(item.valor_final_reembolso || 0);
    }, 0);

    summaryRequested.textContent = money(requestedTotal);
    summaryTax.textContent = money(taxTotal);
    summaryFinal.textContent = money(finalTotal);
}

function renderRefunds() {
    const filtered = getFilteredRefunds();

    updateSummary(filtered);

    if (filtered.length === 0) {
        refundTableBody.innerHTML = `
            <tr>
                <td colspan="12" class="empty-table-message">
                    Nenhum reembolso encontrado.
                </td>
            </tr>
        `;

        completeSelectedButton.classList.add("hidden");
        return;
    }

    refundTableBody.innerHTML = filtered.map(function (item) {
        const checked = selectedRefunds.has(item.id) ? "checked" : "";

        return `
            <tr>
                <td>
                    ${
                        isAdminOrMaster()
                            ? `
                                <input
                                    type="checkbox"
                                    class="refund-checkbox"
                                    data-id="${item.id}"
                                    ${checked}>
                            `
                            : "-"
                    }
                </td>

                <td>${item.codigo_tres || "-"}</td>
                <td>${item.usuarios?.nome || "-"}</td>
                <td>${item.data_solicitacao || "-"}</td>
                <td>${item.clientes?.nome || "-"}</td>
                <td>${item.os || "-"}</td>
                <td>${item.fornecedor || "-"}</td>
                <td>${money(item.valor_total_cobrado)}</td>
                <td>${money(item.valor_total_reembolsado)}</td>
                <td>${money(item.taxa_adm)}</td>
                <td>${money(item.valor_final_reembolso)}</td>
                <td>${statusBadge(item.status)}</td>

                <td>
                <div class="action-buttons">

    ${
        isAdminOrMaster() && item.status !== "CONCLUIDO"
            ? `
                <button
                    class="icon-button"
                    data-action="complete"
                    data-id="${item.id}"
                    title="Concluir">
                    <i data-lucide="check"></i>
                </button>
            `
            : ""
    }

                    ${
                        isAdminOrMaster()
                            ? `
                                <button
                                    class="icon-button danger"
                                    data-action="delete"
                                    data-id="${item.id}"
                                    title="Excluir">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            `
                            : ""
                    }

                    </div>
                </td>
            </tr>
        `;
    }).join("");

    completeSelectedButton.classList.toggle(
        "hidden",
        selectedRefunds.size === 0 || !isAdminOrMaster()
    );

    lucide.createIcons();
}

async function completeRefund(id) {
    if (!isAdminOrMaster()) {
        showToast("Você não tem permissão para concluir reembolsos.");
        return;
    }

    const { error } = await supabaseClient
        .from("reembolsos")
        .update({
            status: "CONCLUIDO",
            concluido_por: currentUser.id,
            concluido_em: new Date().toISOString(),
            updated_by: currentUser.id
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("Erro ao concluir reembolso.");
        return;
    }

    showToast("Reembolso concluído.");
    await loadRefunds();
}

async function deleteRefund(id) {
    if (!isAdminOrMaster()) {
        showToast("Você não tem permissão para excluir reembolsos.");
        return;
    }

    const refund = refunds.find(function (item) {
        return String(item.id) === String(id);
    });

    const confirmDelete = await requestConfirmation({
        title: "Excluir reembolso",
        message: `Deseja excluir ${refund?.codigo_tres || "este reembolso"}? Esta ação não poderá ser desfeita.`,
        confirmLabel: "Excluir",
        danger: true
    });

    if (!confirmDelete) {
        return;
    }

    const { data: deletedRows, error } = await supabaseClient
        .from("reembolsos")
        .delete()
        .eq("id", id)
        .select("id");

    if (error) {
        console.error(error);
        showToast("Erro ao excluir reembolso.");
        return;
    }

    if (!deletedRows || deletedRows.length === 0) {
        showToast("A exclusão foi bloqueada. Verifique a política DELETE no Supabase.");
        return;
    }

    selectedRefunds.delete(id);

    showToast("Reembolso excluído.");
    await loadRefunds();
}

async function completeSelectedRefunds() {
    if (!isAdminOrMaster() || selectedRefunds.size === 0) {
        return;
    }

    const confirmAction = await requestConfirmation({
        title: "Concluir reembolsos",
        message: `Deseja concluir ${selectedRefunds.size} reembolso(s) selecionado(s)?`,
        confirmLabel: "Concluir"
    });

    if (!confirmAction) {
        return;
    }

    const ids = Array.from(selectedRefunds);

    const { error } = await supabaseClient
        .from("reembolsos")
        .update({
            status: "CONCLUIDO",
            concluido_por: currentUser.id,
            concluido_em: new Date().toISOString(),
            updated_by: currentUser.id
        })
        .in("id", ids);

    if (error) {
        console.error(error);
        showToast("Erro ao concluir selecionados.");
        return;
    }

    selectedRefunds.clear();
    selectAllRefunds.checked = false;
    showToast("Reembolsos concluídos.");
    await loadRefunds();
}

function exportRefundsToCSV() {
    const filtered = getFilteredRefunds();

    if (filtered.length === 0) {
        showToast("Não há dados para exportar.");
        return;
    }

    const headers = [
        "Codigo",
        "Data",
        "Cliente",
        "OS",
        "Fornecedor",
        "Valor cobrado",
        "Valor reembolsado",
        "Taxa ADM",
        "Valor final",
        "Status"
    ];

    const rows = filtered.map(function (item) {
        return [
            item.codigo_tres || "",
            item.data_solicitacao || "",
            item.clientes?.nome || "",
            item.os || "",
            item.fornecedor || "",
            Number(item.valor_total_cobrado || 0).toFixed(2).replace(".", ","),
            Number(item.valor_total_reembolsado || 0).toFixed(2).replace(".", ","),
            Number(item.taxa_adm || 0).toFixed(2).replace(".", ","),
            Number(item.valor_final_reembolso || 0).toFixed(2).replace(".", ","),
            item.status || ""
        ];
    });

    const csvContent = [
        headers.join(";"),
        ...rows.map(function (row) {
            return row.map(function (cell) {
                return `"${String(cell).replace(/"/g, '""')}"`;
            }).join(";");
        })
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `reembolsos_${todayISO()}.csv`;
    link.click();

    URL.revokeObjectURL(url);

    showToast("Exportação gerada.");
}

function setupEvents() {
    refundForm.addEventListener("submit", saveRefund);

    clearRefundForm.addEventListener("click", function () {
        refundForm.reset();
        resetRefundForm();
    });

    valorCobrado.addEventListener("input", updateRefundPreview);
    valorReembolsado.addEventListener("input", updateRefundPreview);

    refundSearch.addEventListener("input", renderRefunds);
    refundStatusFilter.addEventListener("change", renderRefunds);
    startDate.addEventListener("change", renderRefunds);
    endDate.addEventListener("change", renderRefunds);

    selectAllRefunds.addEventListener("change", function () {
        if (!isAdminOrMaster()) {
            selectAllRefunds.checked = false;
            return;
        }

        selectedRefunds.clear();

        if (selectAllRefunds.checked) {
            getFilteredRefunds().forEach(function (item) {
                selectedRefunds.add(item.id);
            });
        }

        renderRefunds();
    });

    refundTableBody.addEventListener("change", function (event) {
        const target = event.target;

        if (target.classList.contains("refund-checkbox")) {
            const id = target.dataset.id;

            if (target.checked) {
                selectedRefunds.add(id);
            } else {
                selectedRefunds.delete(id);
            }

            renderRefunds();
        }
    });

    refundTableBody.addEventListener("click", async function (event) {
        const button = event.target.closest("button");

        if (!button) {
            return;
        }

        const action = button.dataset.action;
        const id = button.dataset.id;

        switch (action) {
            case "complete":
                await completeRefund(id);
                break;
            case "delete":
                await deleteRefund(id);
                break;
        }
    });

    if (confirmModal && confirmModalCancel && confirmModalAction) {
        confirmModalCancel.addEventListener("click", function () {
            closeConfirmation(false);
        });

        confirmModalAction.addEventListener("click", function () {
            closeConfirmation(true);
        });

        confirmModal.addEventListener("click", function (event) {
            if (event.target === confirmModal) {
                closeConfirmation(false);
            }
        });
    }

    document.addEventListener("keydown", function (event) {
        if (
            confirmModal &&
            event.key === "Escape" &&
            !confirmModal.classList.contains("hidden")
        ) {
            closeConfirmation(false);
        }
    });

    completeSelectedButton.addEventListener("click", completeSelectedRefunds);
    exportRefundsButton.addEventListener("click", exportRefundsToCSV);

    logoutButton.addEventListener("click", async function () {
        await supabaseClient.auth.signOut();
        window.location.href = "index.html";
    });

    if (sidebarToggle) {
        sidebarToggle.addEventListener("click", function () {
            sidebar.classList.toggle("collapsed");

            const icon = sidebar.classList.contains("collapsed")
                ? "panel-left-open"
                : "panel-left-close";

            sidebarToggle.innerHTML = `<i data-lucide="${icon}"></i>`;
            lucide.createIcons();
        });
    }
}

async function startRefundModule() {
    currentUser = await checkAuth();

    if (!currentUser) {
        return;
    }

    currentProfile = await getUserProfile(currentUser.id);

    if (!currentProfile) {
        alert("Usuário não encontrado na tabela usuarios.");
        return;
    }

    if (currentProfile.primeiro_acesso) {
        window.location.href = "conta.html";
        return;
    }

    applyUserProfile(currentProfile, currentUser);

    await loadClientes();

    dataSolicitacao.value = todayISO();
    startDate.value = firstDayOfMonthISO();
    endDate.value = todayISO();

    resetRefundForm();

    setupEvents();

    await loadRefunds();

    lucide.createIcons();
}

startRefundModule();
