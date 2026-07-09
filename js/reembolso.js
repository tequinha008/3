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
const refundPaginationInfo = document.getElementById("refundPaginationInfo");
const refundPageSize = document.getElementById("refundPageSize");
const refundPrevPage = document.getElementById("refundPrevPage");
const refundNextPage = document.getElementById("refundNextPage");
const refundPageIndicator = document.getElementById("refundPageIndicator");

const toast = document.getElementById("toast");

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
let refundCurrentPage = 1;
let confirmationResolver = null;
let editingRefundId = null;
let editingRefundOriginal = null;
let allUsers = [];
let refundEmitterSelect = null;
let refundValueMessage = null;

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
    return parseMoneyValue(input.value);
}

function parseMoneyValue(value) {
    const numbers = String(value || "").replace(/\D/g, "");
    return numbers ? Number(numbers) / 100 : 0;
}

function formatMoneyInput(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function applyMoneyMask(input) {
    input.value = formatMoneyInput(parseMoneyValue(input.value));
}

function setMoneyField(input, value) {
    input.value = value === null || value === undefined ? "" : formatMoneyInput(value);
}

function setupMoneyMasks() {
    [valorCobrado, valorReembolsado].forEach(function (field) {
        field.addEventListener("input", function () {
            applyMoneyMask(field);
            updateRefundPreview();
        });

        field.addEventListener("blur", function () {
            applyMoneyMask(field);
        });
    });
}

function setupRefundValueValidation() {
    if (refundValueMessage || !valorReembolsado?.parentElement) {
        return;
    }

    refundValueMessage = document.createElement("small");
    refundValueMessage.className = "field-message";
    refundValueMessage.id = "refundValueMessage";
    valorReembolsado.parentElement.appendChild(refundValueMessage);
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
    validateRefundValues(false);
}

function validateRefundValues(showMessage = true) {
    const charged = numberValue(valorCobrado);
    const reimbursed = numberValue(valorReembolsado);
    const invalid = reimbursed > charged;

    if (refundValueMessage) {
        refundValueMessage.textContent = invalid
            ? "O valor a ser reembolsado não pode ser maior que o valor cobrado."
            : "";
    }

    valorReembolsado.classList.toggle("field-invalid", invalid);

    if (invalid && showMessage) {
        showToast("O valor a ser reembolsado deve ser igual ou menor que o valor cobrado.");
    }

    return !invalid;
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

function getSelectedRefundEmitter() {
    if (currentProfile?.perfil === "master" && editingRefundId && refundEmitterSelect?.value) {
        return {
            id: refundEmitterSelect.value,
            nome: refundEmitterSelect.selectedOptions?.[0]?.textContent?.trim() || currentProfile.nome
        };
    }

    return {
        id: currentUser.id,
        nome: currentProfile.nome
    };
}

function buildRefundPayload() {
    const emitter = getSelectedRefundEmitter();

    return {
        data_solicitacao: dataSolicitacao.value,
        emissor_id: editingRefundId ? emitter.id : currentUser.id,
        cliente_id: cliente.value,
        os: normalizeText(os.value),
        fornecedor: normalizeText(fornecedor.value),
        valor_total_cobrado: numberValue(valorCobrado),
        valor_total_reembolsado: numberValue(valorReembolsado),
        status: "PENDENTE",
        updated_by: currentUser.id
    };
}

function shouldIgnoreHistoryField(key) {
    return ["updated_by", "created_by", "concluido_por", "concluido_em"].includes(key);
}

function isNumericHistoryField(key) {
    return [
        "valor_total_cobrado",
        "valor_total_reembolsado",
        "taxa_adm",
        "valor_final_reembolso"
    ].includes(key);
}

function normalizedHistoryValue(key, value) {
    if (value === undefined || value === "") return null;

    if (isNumericHistoryField(key)) {
        return Number(Number(value || 0).toFixed(2));
    }

    return value;
}

function getObjectChanges(before, after) {
    const changes = {};

    Object.keys(after).forEach(function (key) {
        if (shouldIgnoreHistoryField(key)) return;

        const oldValue = normalizedHistoryValue(key, before?.[key] ?? null);
        const newValue = normalizedHistoryValue(key, after?.[key] ?? null);

        if (String(oldValue ?? "") !== String(newValue ?? "")) {
            changes[key] = {
                antes: oldValue,
                depois: newValue
            };
        }
    });

    if (changes.status?.depois === "PENDENTE" && Object.keys(changes).length > 1) {
        delete changes.status;
    }

    return changes;
}

async function registerHistory(moduleName, before, after, action) {
    await supabaseClient
        .from("solicitacoes_historico")
        .insert({
            modulo: moduleName,
            solicitacao_id: String(before?.id || after?.id || ""),
            codigo_tres: before?.codigo_tres || after?.codigo_tres || null,
            acao: action,
            alterado_por: currentUser.id,
            alterado_por_nome: currentProfile.nome,
            alteracoes: getObjectChanges(before, after),
            antes: before || {},
            depois: after || {}
        });
}

async function saveRefund(event) {
    event.preventDefault();

    if (!validateRefundValues(true)) {
        return;
    }

    saveRefundButton.disabled = true;
    saveRefundButton.textContent = "Salvando...";

    const payload = buildRefundPayload();
    let error = null;

    if (editingRefundId) {
        payload.concluido_por = null;
        payload.concluido_em = null;

        const result = await supabaseClient
            .from("reembolsos")
            .update(payload)
            .eq("id", editingRefundId);

        error = result.error;

        if (!error) {
            await registerHistory(
                "REEMBOLSOS",
                editingRefundOriginal,
                { ...editingRefundOriginal, ...payload },
                "EDIÇÃO"
            );
        }
    } else {
        payload.created_by = currentUser.id;

        const result = await supabaseClient
            .from("reembolsos")
            .insert(payload);

        error = result.error;
    }

    if (error) {
        console.error(error);
        showToast(`Erro ao salvar: ${error.message}`);
    } else {
        showToast(editingRefundId ? "Reembolso atualizado e voltou para pendente." : "Reembolso salvo com sucesso.");
        refundForm.reset();
        resetRefundForm();
        await loadRefunds();
    }

    saveRefundButton.disabled = false;
    saveRefundButton.textContent = "Salvar reembolso";
}

function resetRefundForm() {
    editingRefundId = null;
    editingRefundOriginal = null;
    dataSolicitacao.value = todayISO();
    emissorNome.value = currentProfile.nome;
    taxaAdmPreview.value = money(0);
    valorFinalPreview.value = money(0);
    if (refundValueMessage) {
        refundValueMessage.textContent = "";
    }
    valorReembolsado.classList.remove("field-invalid");
    saveRefundButton.textContent = "Salvar reembolso";
    fillRefundEmitterSelect(currentUser.id);
}

async function loadRefunds() {
    const { data, error } = await supabaseClient
        .from("reembolsos")
        .select(`
            id,
            codigo_tres,
            data_solicitacao,
            emissor_id,
            os,
            fornecedor,
            valor_total_cobrado,
            valor_total_reembolsado,
            taxa_adm,
            valor_final_reembolso,
            status,
            cliente_id,
            created_by,
            created_at,
            clientes:cliente_id (id, nome)
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);
        refundTableBody.innerHTML = `
            <tr>
                <td colspan="13" class="empty-table-message">
                    Erro ao carregar reembolsos.
                </td>
            </tr>
        `;
        return;
    }

    refunds = await attachEmitterNames(data || []);
    renderRefunds();
}

async function attachEmitterNames(items) {
    const emitterIds = Array.from(new Set(
        items
            .map(function (item) { return item.emissor_id; })
            .filter(Boolean)
    ));

    if (emitterIds.length === 0) {
        return items;
    }

    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("id, nome")
        .in("id", emitterIds);

    if (error) {
        console.error(error);
        return items;
    }

    const namesById = new Map(
        (data || []).map(function (user) {
            return [user.id, user.nome];
        })
    );

    return items.map(function (item) {
        return {
            ...item,
            emissor_nome: namesById.get(item.emissor_id) || null
        };
    });
}

async function loadUsersList() {
    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("id, nome, email")
        .eq("ativo", true)
        .order("nome");

    if (error) {
        console.error(error);
        allUsers = [];
        return;
    }

    allUsers = data || [];
}

function setupRefundEmitterSelect() {
    if (refundEmitterSelect || !emissorNome?.parentElement) {
        return;
    }

    refundEmitterSelect = document.createElement("select");
    refundEmitterSelect.id = "refundEmitterSelect";
    refundEmitterSelect.className = "hidden";
    emissorNome.parentElement.appendChild(refundEmitterSelect);
}

function fillRefundEmitterSelect(selectedId) {
    if (!refundEmitterSelect) return;

    refundEmitterSelect.innerHTML = allUsers.map(function (user) {
        return `<option value="${user.id}">${user.nome || user.email || "Usuário"}</option>`;
    }).join("");

    refundEmitterSelect.value = selectedId || currentUser.id;
    refundEmitterSelect.classList.toggle("hidden", currentProfile?.perfil !== "master" || !editingRefundId);
    emissorNome.classList.toggle("hidden", currentProfile?.perfil === "master" && Boolean(editingRefundId));
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

function resetRefundPagination() {
    refundCurrentPage = 1;
    renderRefunds();
}

function getRefundPageSize() {
    return Number(refundPageSize?.value || 10);
}

function updateRefundPagination(totalItems) {
    const pageSize = getRefundPageSize();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (refundCurrentPage > totalPages) {
        refundCurrentPage = totalPages;
    }

    const start = totalItems === 0 ? 0 : ((refundCurrentPage - 1) * pageSize) + 1;
    const end = Math.min(totalItems, refundCurrentPage * pageSize);

    if (refundPaginationInfo) {
        refundPaginationInfo.textContent = `Mostrando ${start}-${end} de ${totalItems}`;
    }

    if (refundPageIndicator) {
        refundPageIndicator.textContent = `Página ${refundCurrentPage} de ${totalPages}`;
    }

    if (refundPrevPage) {
        refundPrevPage.disabled = refundCurrentPage <= 1;
    }

    if (refundNextPage) {
        refundNextPage.disabled = refundCurrentPage >= totalPages;
    }
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
    const pageSize = getRefundPageSize();

    updateSummary(filtered);
    updateRefundPagination(filtered.length);

    if (filtered.length === 0) {
        refundTableBody.innerHTML = `
            <tr>
                <td colspan="13" class="empty-table-message">
                    Nenhum reembolso encontrado.
                </td>
            </tr>
        `;

        completeSelectedButton.classList.add("hidden");
        return;
    }

    const visible = filtered.slice(
        (refundCurrentPage - 1) * pageSize,
        refundCurrentPage * pageSize
    );

    refundTableBody.innerHTML = visible.map(function (item) {
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
                <td>${item.data_solicitacao || "-"}</td>
                <td>${item.emissor_nome || "-"}</td>
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

                    <button
                        class="icon-button"
                        data-action="edit"
                        data-id="${item.id}"
                        title="Editar reembolso">
                        <i data-lucide="pencil"></i>
                    </button>

                    <button
                        class="icon-button"
                        data-action="history"
                        data-id="${item.id}"
                        title="Histórico">
                        <i data-lucide="history"></i>
                    </button>

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

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function editRefund(id) {
    const item = refunds.find(function (refund) {
        return String(refund.id) === String(id);
    });

    if (!item) {
        showToast("Não foi possível abrir a edição.");
        return;
    }

    editingRefundId = item.id;
    editingRefundOriginal = { ...item };

    dataSolicitacao.value = item.data_solicitacao || todayISO();
    cliente.value = item.cliente_id || "";
    os.value = item.os || "";
    fornecedor.value = item.fornecedor || "";
    setMoneyField(valorCobrado, item.valor_total_cobrado);
    setMoneyField(valorReembolsado, item.valor_total_reembolsado);
    updateRefundPreview();
    fillRefundEmitterSelect(item.emissor_id);

    saveRefundButton.textContent = "Salvar alterações";
    showToast("Editando reembolso. Ao salvar, ele voltará para PENDENTE.");
}

function ensureHistoryModal() {
    let modal = document.getElementById("historyModal");

    if (modal) {
        return modal;
    }

    modal = document.createElement("div");
    modal.id = "historyModal";
    modal.className = "history-backdrop hidden";
    modal.innerHTML = `
        <div class="history-modal">
            <header class="history-header">
                <div>
                    <p class="eyebrow">Histórico</p>
                    <h2 id="historyTitle">Histórico da solicitação</h2>
                </div>
                <button type="button" class="icon-button" id="historyClose" aria-label="Fechar">
                    <i data-lucide="x"></i>
                </button>
            </header>
            <div class="history-list" id="historyContent"></div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener("click", function (event) {
        if (event.target === modal || event.target.closest("#historyClose")) {
            modal.classList.add("hidden");
        }
    });

    return modal;
}

function friendlyHistoryField(field) {
    const labels = {
        emissor_id: "Emissor",
        cliente_id: "Cliente",
        data_solicitacao: "Data",
        os: "OS",
        fornecedor: "Fornecedor",
        valor_total_cobrado: "Valor cobrado",
        valor_total_reembolsado: "Valor reembolsado",
        status: "Status"
    };

    return labels[field] || field;
}

function userNameById(id) {
    const user = allUsers.find(function (item) {
        return String(item.id) === String(id);
    });

    return user?.nome || id || "—";
}

function clientNameById(id) {
    const option = Array.from(cliente.options).find(function (item) {
        return String(item.value) === String(id);
    });

    return option?.textContent?.trim() || id || "—";
}

function formatHistoryValue(field, value) {
    if (value === null || value === undefined || value === "") return "—";

    if (field === "emissor_id" || field === "updated_by" || field === "created_by" || field === "concluido_por") {
        return userNameById(value);
    }

    if (field === "cliente_id") {
        return clientNameById(value);
    }

    if (["valor_total_cobrado", "valor_total_reembolsado", "taxa_adm", "valor_final_reembolso"].includes(field)) {
        return money(Number(value || 0));
    }

    return String(value);
}

function formatHistoryChanges(changes) {
    const hiddenFields = new Set([
        "updated_by",
        "created_by",
        "concluido_por",
        "concluido_em"
    ]);
    const entries = Object.entries(changes || {}).filter(function ([field]) {
        return !hiddenFields.has(field);
    });

    if (entries.length === 0) {
        return `<div class="history-value">Sem campos alterados relevantes.</div>`;
    }

    return entries.map(function ([field, change]) {
        return `
            <div class="history-change">
                <div class="history-field">${escapeHtml(friendlyHistoryField(field))}</div>
                <div class="history-value"><strong>Antes</strong>${escapeHtml(formatHistoryValue(field, change.antes))}</div>
                <div class="history-value after"><strong>Depois</strong>${escapeHtml(formatHistoryValue(field, change.depois))}</div>
            </div>
        `;
    }).join("");
}

function cleanHistoryChanges(changes) {
    const cleaned = {};

    Object.entries(changes || {}).forEach(function ([field, change]) {
        if (shouldIgnoreHistoryField(field)) return;

        const oldValue = normalizedHistoryValue(field, change?.antes ?? null);
        const newValue = normalizedHistoryValue(field, change?.depois ?? null);

        if (String(oldValue ?? "") !== String(newValue ?? "")) {
            cleaned[field] = {
                antes: oldValue,
                depois: newValue
            };
        }
    });

    if (cleaned.status?.depois === "PENDENTE" && Object.keys(cleaned).length > 1) {
        delete cleaned.status;
    }

    return cleaned;
}

function formatTimelineDate(value) {
    if (!value) return "Data não informada";
    return new Date(value).toLocaleString("pt-BR");
}

function getCreationDate(currentItem) {
    return currentItem?.created_at || currentItem?.data_solicitacao;
}

function buildCreationEvent(currentItem) {
    if (!currentItem) return null;

    const creator = userNameById(currentItem.created_by || currentItem.emissor_id) || currentItem.emissor_nome || "Usuário";

    return {
        title: `Solicitação criada por ${creator}`,
        meta: formatTimelineDate(getCreationDate(currentItem)),
        changes: ""
    };
}

function describeHistoryEvent(item) {
    const changes = cleanHistoryChanges(item.alteracoes || {});
    const actor = item.alterado_por_nome || "Usuário";
    let title = `Solicitação editada por ${actor}`;

    if (changes.status) {
        title = `Status atualizado para ${formatHistoryValue("status", changes.status.depois)} por ${actor}`;
    } else if (changes.emissor_id) {
        title = `Emissor alterado para ${formatHistoryValue("emissor_id", changes.emissor_id.depois)} por ${actor}`;
    }

    return {
        title,
        meta: formatTimelineDate(item.created_at),
        changes: formatHistoryChanges(changes)
    };
}

function renderTimeline(events) {
    return events.map(function (event) {
        return `
            <article class="history-item">
                <span class="history-dot"></span>
                <div class="history-card">
                    <span class="history-item-title">${escapeHtml(event.title)}</span>
                    <span class="history-item-meta">${escapeHtml(event.meta)}</span>
                    ${event.changes ? `<div class="history-changes">${event.changes}</div>` : ""}
                </div>
            </article>
        `;
    }).join("");
}

async function openHistory(moduleName, id, title, currentItem = null) {
    const modal = ensureHistoryModal();
    const content = document.getElementById("historyContent");
    const heading = document.getElementById("historyTitle");

    heading.textContent = title || "Histórico da solicitação";
    content.innerHTML = `<div class="history-item">Carregando histórico...</div>`;
    modal.classList.remove("hidden");

    const { data, error } = await supabaseClient
        .from("solicitacoes_historico")
        .select("*")
        .eq("modulo", moduleName)
        .eq("solicitacao_id", String(id))
        .order("created_at", { ascending: true });

    if (error) {
        console.error(error);
        content.innerHTML = `<div class="history-item">Erro ao carregar histórico.</div>`;
        return;
    }

    const events = [];
    const creationEvent = buildCreationEvent(currentItem);

    if (creationEvent) {
        events.push(creationEvent);
    }

    (data || []).forEach(function (item) {
        events.push(describeHistoryEvent(item));
    });

    if (events.length === 0) {
        content.innerHTML = `<div class="history-item">Nenhuma edição registrada ainda.</div>`;
        return;
    }

    content.innerHTML = renderTimeline(events);

    lucide.createIcons();
}

async function completeRefund(id) {
    if (!isAdminOrMaster()) {
        showToast("Você não tem permissão para concluir reembolsos.");
        return;
    }

    const before = refunds.find(function (item) {
        return String(item.id) === String(id);
    });

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
    if (before) {
        await registerHistory(
            "REEMBOLSOS",
            before,
            { ...before, status: "CONCLUIDO" },
            "STATUS"
        );
    }

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
    const beforeItems = refunds.filter(function (item) {
        return ids.map(String).includes(String(item.id));
    });

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

    for (const before of beforeItems) {
        await registerHistory(
            "REEMBOLSOS",
            before,
            { ...before, status: "CONCLUIDO" },
            "STATUS"
        );
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

    refundSearch.addEventListener("input", resetRefundPagination);
    refundStatusFilter.addEventListener("change", resetRefundPagination);
    startDate.addEventListener("change", resetRefundPagination);
    endDate.addEventListener("change", resetRefundPagination);

    if (refundPageSize) {
        refundPageSize.addEventListener("change", resetRefundPagination);
    }

    if (refundPrevPage) {
        refundPrevPage.addEventListener("click", function () {
            if (refundCurrentPage > 1) {
                refundCurrentPage -= 1;
                renderRefunds();
            }
        });
    }

    if (refundNextPage) {
        refundNextPage.addEventListener("click", function () {
            refundCurrentPage += 1;
            renderRefunds();
        });
    }

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
            case "edit":
                editRefund(id);
                break;
            case "history": {
                const refund = refunds.find(function (item) {
                    return String(item.id) === String(id);
                });
                await openHistory("REEMBOLSOS", id, `Histórico ${refund?.codigo_tres || ""}`, refund);
                break;
            }
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

    setupRefundEmitterSelect();
    setupRefundValueValidation();
    setupMoneyMasks();
    await loadUsersList();
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
