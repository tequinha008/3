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
    const refreshRefundsButton = document.getElementById("refreshRefundsButton");
    
    const startDate = document.getElementById("startDate");
    const endDate = document.getElementById("endDate");
    const refundStatusFilter = document.getElementById("refundStatusFilter");
    const refundSearch = document.getElementById("refundSearch");
    const refundSort = document.getElementById("refundSort");
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
                        <h2 id="confirmModalTitle">Confirmar a\u00e7\u00e3o</h2>
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
            showToast("N\u00e3o foi poss\u00edvel abrir a confirma\u00e7\u00e3o.");
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
    
        const canExportRefunds = role === "admin" || role === "master";
    
        if (exportRefundsButton) {
            exportRefundsButton.classList.toggle("hidden", !canExportRefunds);
            exportRefundsButton.disabled = !canExportRefunds;
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
                ? "O valor a ser reembolsado n\u00e3o pode ser maior que o valor cobrado."
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
                    "EDI\u00c7\u00c3O"
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
                rloc,
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
                <td colspan="11" class="empty-table-message">
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
            return `<option value="${user.id}">${user.nome || user.email || "Usu\u00e1rio"}</option>`;
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
    
        const filteredRefunds = refunds.filter(function (refund) {
            const date = refund.data_solicitacao;
    
            const matchSearch =
                !search ||
                normalizeText(refund.os).includes(search) ||
                normalizeText(refund.emissor_nome).includes(search) ||
                normalizeText(refund.fornecedor).includes(search) ||
                normalizeText(refund.rloc).includes(search) ||
                normalizeText(refund.clientes?.nome).includes(search) ||
                normalizeText(refund.codigo_tres).includes(search);
    
            const matchStatus = !status || refund.status === status;
            const matchStart = !start || date >= start;
            const matchEnd = !end || date <= end;
    
            return matchSearch && matchStatus && matchStart && matchEnd;
        });
    
        const sortMode = refundSort?.value || "DATE_DESC";
        const statusOrder = {
            PENDENTE: 0,
            CONCLUIDO: 1
        };
    
        return filteredRefunds.sort(function (a, b) {
            if (sortMode === "STATUS_ASC" || sortMode === "STATUS_DESC") {
                const direction = sortMode === "STATUS_ASC" ? 1 : -1;
                const statusComparison =
                    ((statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)) * direction;
    
                if (statusComparison !== 0) {
                    return statusComparison;
                }
            }
    
            const dateComparison = String(a.data_solicitacao || "")
                .localeCompare(String(b.data_solicitacao || ""));
    
            return sortMode === "DATE_ASC" ? dateComparison : -dateComparison;
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
            refundPageIndicator.textContent = `P\u00e1gina ${refundCurrentPage} de ${totalPages}`;
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
            return `<span class="badge badge-concluido">CONCLU\u00cdDO</span>`;
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
                <td colspan="11" class="empty-table-message">
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
                <td class="refund-gross-value">${money(item.valor_total_reembolsado)}</td>
                <td>
                        ${
                            isAdminOrMaster()
                                ? `<input
                                        type="text"
                                        class="table-input refund-rloc-input"
                                        data-id="${item.id}"
                                        value="${escapeHtml(item.rloc || "")}"
                                        maxlength="30"
                                        placeholder="RLOC">`
                                : escapeHtml(item.rloc || "-")
                        }
                    </td>
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
                            title="Hist\u00f3rico">
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
    
    async function updateRefundRloc(id, value) {
        if (!isAdminOrMaster()) {
            showToast("Voc\u00ea n\u00e3o tem permiss\u00e3o para alterar o RLOC.");
            return;
        }
    
        const before = refunds.find(function (item) {
            return String(item.id) === String(id);
        });
    
        if (!before) {
            showToast("Reembolso n\u00e3o encontrado.");
            return;
        }
    
        const rloc = normalizeText(value) || null;
    
        if (String(before.rloc || "") === String(rloc || "")) {
            return;
        }
    
        const { error } = await supabaseClient
            .from("reembolsos")
            .update({
                rloc,
                updated_by: currentUser.id
            })
            .eq("id", id);
    
        if (error) {
            console.error(error);
            showToast("Erro ao salvar o RLOC.");
            return;
        }
    
        await registerHistory(
            "REEMBOLSOS",
            before,
            { ...before, rloc, updated_by: currentUser.id },
            "RLOC"
        );
    
        showToast("RLOC salvo.");
        await loadRefunds();
    }
    
    function normalizeDisplayText(value) {
        return String(value ?? "")
            .replace(/\u00c3\u00a1/g, "\u00e1")
            .replace(/\u00c3\u00a0/g, "\u00e0")
            .replace(/\u00c3 /g, "\u00e0")
            .replace(/\u00c3\u00a2/g, "\u00e2")
            .replace(/\u00c3\u00a3/g, "\u00e3")
            .replace(/\u00c3\u00a9/g, "\u00e9")
            .replace(/\u00c3\u00aa/g, "\u00ea")
            .replace(/\u00c3\u00ad/g, "\u00ed")
            .replace(/\u00c3\u00b3/g, "\u00f3")
            .replace(/\u00c3\u00b4/g, "\u00f4")
            .replace(/\u00c3\u00b5/g, "\u00f5")
            .replace(/\u00c3\u00ba/g, "\u00fa")
            .replace(/\u00c3\u00a7/g, "\u00e7")
            .replace(/\u00c3\u0081/g, "\u00c1")
            .replace(/\u00c3\u0080/g, "\u00c0")
            .replace(/\u00c3\u0082/g, "\u00c2")
            .replace(/\u00c3\u0083/g, "\u00c3")
            .replace(/\u00c3\u0089/g, "\u00c9")
            .replace(/\u00c3\u008a/g, "\u00ca")
            .replace(/\u00c3\u008d/g, "\u00cd")
            .replace(/\u00c3\u0093/g, "\u00d3")
            .replace(/\u00c3\u0094/g, "\u00d4")
            .replace(/\u00c3\u0095/g, "\u00d5")
            .replace(/\u00c3\u009a/g, "\u00da")
            .replace(/\u00c3\u0087/g, "\u00c7")
            .replace(/\u00c2\u00ba/g, "\u00ba")
            .replace(/\u00c2\u00aa/g, "\u00aa")
            .replace(/\u00c2\u00b7/g, "\u00b7")
            .replace(/\u00e2\u0080\u00a2/g, "\u2022")
            .replace(/\u00e2\u0080\u0094/g, "-")
            .replace(/\u00e2\u0080\u0093/g, "-")
            .replace(/\u00e2\u0080\u00a6/g, "...");
    }
    
    function escapeHtml(value) {
        return normalizeDisplayText(value)
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
            showToast("N\u00e3o foi poss\u00edvel abrir a edi\u00e7\u00e3o.");
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
    
        saveRefundButton.textContent = "Salvar altera\u00e7\u00f5es";
        showToast("Editando reembolso. Ao salvar, ele voltar\u00e1 para PENDENTE.");
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
                        <p class="eyebrow">Hist\u00f3rico</p>
                        <h2 id="historyTitle">Hist\u00f3rico da solicita\u00e7\u00e3o</h2>
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
            rloc: "RLOC",
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
    
        return user?.nome || id || "-";
    }
    
    function clientNameById(id) {
        const option = Array.from(cliente.options).find(function (item) {
            return String(item.value) === String(id);
        });
    
        return option?.textContent?.trim() || id || "-";
    }
    
    function formatHistoryValue(field, value) {
        if (value === null || value === undefined || value === "") return "-";
    
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
        if (!value) return "Data n\u00e3o informada";
        return new Date(value).toLocaleString("pt-BR");
    }
    
    function getCreationDate(currentItem) {
        return currentItem?.created_at || currentItem?.data_solicitacao;
    }
    
    function buildCreationEvent(currentItem) {
        if (!currentItem) return null;
    
        const creator = userNameById(currentItem.created_by || currentItem.emissor_id) || currentItem.emissor_nome || "Usu\u00e1rio";
    
        return {
            title: `Solicita\u00e7\u00e3o criada por ${creator}`,
            meta: formatTimelineDate(getCreationDate(currentItem)),
            changes: ""
        };
    }
    
    function describeHistoryEvent(item) {
        const changes = cleanHistoryChanges(item.alteracoes || {});
        const actor = item.alterado_por_nome || "Usu\u00e1rio";
        let title = `Solicita\u00e7\u00e3o editada por ${actor}`;
    
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
    
        heading.textContent = normalizeDisplayText(title || "Hist\u00f3rico da solicita\u00e7\u00e3o");
        content.innerHTML = `<div class="history-item">Carregando hist\u00f3rico...</div>`;
        modal.classList.remove("hidden");
    
        const { data, error } = await supabaseClient
            .from("solicitacoes_historico")
            .select("*")
            .eq("modulo", moduleName)
            .eq("solicitacao_id", String(id))
            .order("created_at", { ascending: true });
    
        if (error) {
            console.error(error);
            content.innerHTML = `<div class="history-item">Erro ao carregar hist\u00f3rico.</div>`;
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
            content.innerHTML = `<div class="history-item">Nenhuma edi\u00e7\u00e3o registrada ainda.</div>`;
            return;
        }
    
        content.innerHTML = renderTimeline(events);
    
        lucide.createIcons();
    }
    
    async function completeRefund(id) {
        if (!isAdminOrMaster()) {
            showToast("Voc\u00ea n\u00e3o tem permiss\u00e3o para concluir reembolsos.");
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
    
        showToast("Reembolso conclu\u00eddo.");
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
            showToast("Voc\u00ea n\u00e3o tem permiss\u00e3o para excluir reembolsos.");
            return;
        }
    
        const refund = refunds.find(function (item) {
            return String(item.id) === String(id);
        });
    
        const confirmDelete = await requestConfirmation({
            title: "Excluir reembolso",
            message: `Deseja excluir ${refund?.codigo_tres || "este reembolso"}? Esta a\u00e7\u00e3o n\u00e3o poder\u00e1 ser desfeita.`,
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
            showToast("A exclus\u00e3o foi bloqueada. Verifique a pol\u00edtica DELETE no Supabase.");
            return;
        }
    
        selectedRefunds.delete(id);
    
        showToast("Reembolso exclu\u00eddo.");
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
        showToast("Reembolsos conclu\u00eddos.");
        await loadRefunds();
    }
    
    function exportRefundsToCSV() {
        const filtered = getFilteredRefunds();
    
        if (filtered.length === 0) {
            showToast("N\u00e3o h\u00e1 dados para exportar.");
            return;
        }
    
        const headers = [
            "Codigo",
            "Data",
            "Cliente",
            "OS",
            "RLOC",
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
                item.rloc || "",
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
    
        showToast("Exporta\u00e7\u00e3o gerada.");
    }
    
    function exportRefundsToExcel() {
        if (!isAdminOrMaster()) {
            showToast("Voc\u00ea n\u00e3o tem permiss\u00e3o para exportar reembolsos.");
            return;
        }
    
        const filtered = getFilteredRefunds();
    
        if (filtered.length === 0) {
            showToast("N\u00e3o h\u00e1 dados para exportar.");
            return;
        }
    
        const totalCobrado = filtered.reduce(function (sum, item) {
            return sum + Number(item.valor_total_cobrado || 0);
        }, 0);
        const totalReembolsado = filtered.reduce(function (sum, item) {
            return sum + Number(item.valor_total_reembolsado || 0);
        }, 0);
        const totalTaxa = filtered.reduce(function (sum, item) {
            return sum + Number(item.taxa_adm || 0);
        }, 0);
        const totalFinal = filtered.reduce(function (sum, item) {
            return sum + Number(item.valor_final_reembolso || 0);
        }, 0);
    
        function formatReportDate(value) {
            if (!value) return "";
            const date = new Date(`${value}T00:00:00`);
            return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR");
        }
    
        const periodLabel = `${formatReportDate(startDate.value) || "In\u00edcio"} a ${formatReportDate(endDate.value) || "Hoje"}`;
        const generatedAt = new Date().toLocaleString("pt-BR");
    
        const rows = filtered.map(function (item) {
            return `
                <tr>
                    <td>${escapeHtml(item.codigo_tres || "")}</td>
                    <td>${escapeHtml(formatReportDate(item.data_solicitacao))}</td>
                    <td>${escapeHtml(item.emissor_nome || "")}</td>
                    <td>${escapeHtml(item.clientes?.nome || "")}</td>
                    <td>${escapeHtml(item.os || "")}</td>
                    <td>${escapeHtml(item.rloc || "")}</td>
                    <td>${escapeHtml(item.fornecedor || "")}</td>
                    <td class="money">${escapeHtml(money(item.valor_total_cobrado))}</td>
                    <td class="money">${escapeHtml(money(item.valor_total_reembolsado))}</td>
                    <td class="money">${escapeHtml(money(item.taxa_adm))}</td>
                    <td class="money">${escapeHtml(money(item.valor_final_reembolso))}</td>
                    <td>${escapeHtml(item.status || "")}</td>
                </tr>
            `;
        });
    
        const html = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; color: #0f172a; }
                        h1 { margin: 0 0 6px; color: #143d59; font-size: 22px; }
                        .meta { margin: 0 0 18px; color: #64748b; font-size: 12px; }
                        table { width: 100%; border-collapse: collapse; }
                        th {
                            background: #143d59;
                            color: #ffffff;
                            border: 1px solid #143d59;
                            padding: 9px;
                            font-size: 12px;
                            text-align: left;
                        }
                        td {
                            border: 1px solid #dbe3ef;
                            padding: 8px;
                            font-size: 12px;
                        }
                        .money { text-align: right; white-space: nowrap; }
                        .summary td {
                            background: #f8fafc;
                            font-weight: bold;
                        }
                        .summary-label { text-align: right; color: #143d59; }
                    </style>
                </head>
                <body>
                    <h1>Relat\u00f3rio de Reembolsos</h1>
                    <p class="meta">Per\u00edodo: ${escapeHtml(periodLabel)} | Gerado em: ${escapeHtml(generatedAt)}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>C\u00f3digo</th>
                                <th>Data</th>
                                <th>Emissor</th>
                                <th>Cliente</th>
                                <th>OS</th>
                                <th>RLOC</th>
                                <th>Fornecedor</th>
                                <th>Valor cobrado</th>
                                <th>Valor reembolsado</th>
                                <th>Taxa ADM</th>
                                <th>Valor final</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows.join("")}
                            <tr class="summary">
                                <td colspan="7" class="summary-label">Totais</td>
                                <td class="money">${escapeHtml(money(totalCobrado))}</td>
                                <td class="money">${escapeHtml(money(totalReembolsado))}</td>
                                <td class="money">${escapeHtml(money(totalTaxa))}</td>
                                <td class="money">${escapeHtml(money(totalFinal))}</td>
                                <td>${filtered.length} registro(s)</td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            </html>
        `;
    
        const blob = new Blob(["\ufeff" + html], {
            type: "application/vnd.ms-excel;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
    
        link.href = url;
        link.download = `reembolsos_${todayISO()}.xls`;
        link.click();
    
        URL.revokeObjectURL(url);
        showToast("Planilha de reembolsos gerada.");
    }
    
    function setupEvents() {
        refundForm.addEventListener("submit", saveRefund);
    
        clearRefundForm.addEventListener("click", function () {
            refundForm.reset();
            resetRefundForm();
        });
    
        refundSearch.addEventListener("input", resetRefundPagination);
        refundStatusFilter.addEventListener("change", resetRefundPagination);
        refundSort?.addEventListener("change", resetRefundPagination);
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
    
        if (refreshRefundsButton) {
            refreshRefundsButton.addEventListener("click", async function () {
                refreshRefundsButton.disabled = true;
    
                try {
                    await loadRefunds();
                    showToast("Reembolsos atualizados.");
                } finally {
                    refreshRefundsButton.disabled = false;
                    lucide.createIcons();
                }
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
    
        refundTableBody.addEventListener("change", async function (event) {
            const target = event.target;
    
            if (target.classList.contains("refund-rloc-input")) {
                await updateRefundRloc(target.dataset.id, target.value);
                return;
            }
    
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
                    await openHistory("REEMBOLSOS", id, `Hist\u00f3rico ${refund?.codigo_tres || ""}`, refund);
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
        exportRefundsButton.addEventListener("click", exportRefundsToExcel);
    
        logoutButton.addEventListener("click", async function () {
            await supabaseClient.auth.signOut();
            window.location.href = "index.html";
        });
    
        initSidebarPersistence();
    }
    
    async function startRefundModule() {
        currentUser = await checkAuth();
    
        if (!currentUser) {
            return;
        }
    
        currentProfile = await getUserProfile(currentUser.id);
    
        if (!currentProfile) {
            alert("Usu\u00e1rio n\u00e3o encontrado na tabela usuarios.");
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
        window.TRESDatePickers?.refresh();
    
        resetRefundForm();
    
        setupEvents();
    
        await loadRefunds();
    
        lucide.createIcons();
    }
    
    startRefundModule();
