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
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");
const financeForm = document.getElementById("financeForm");
const dataLancamento = document.getElementById("dataLancamento");
const emissorNome = document.getElementById("emissorNome");
const tipoLancamento = document.getElementById("tipoLancamento");
const os = document.getElementById("os");
const cliente = document.getElementById("cliente");
const servico = document.getElementById("servico");
const outroServicoField = document.getElementById("outroServicoField");
const outroServico = document.getElementById("outroServico");
const aereoSubtypeField = document.getElementById("aereoSubtypeField");
const choiceButtons = document.querySelectorAll(".choice-button");
const consolidadorField = document.getElementById("consolidadorField");
const consolidador = document.getElementById("consolidador");
const localizadorField = document.getElementById("localizadorField");
const localizador = document.getElementById("localizador");
const bilheteField = document.getElementById("bilheteField");
const bilhete = document.getElementById("bilhete");
const fornecedorField = document.getElementById("fornecedorField");
const fornecedor = document.getElementById("fornecedor");
const hotelDiretoField = document.getElementById("hotelDiretoField");
const hotelDireto = document.getElementById("hotelDireto");
const tarifaField = document.getElementById("tarifaField");
const tarifa = document.getElementById("tarifa");
const taxaEmbarqueField = document.getElementById("taxaEmbarqueField");
const taxaEmbarque = document.getElementById("taxaEmbarque");
const rcField = document.getElementById("rcField");
const rc = document.getElementById("rc");
const overField = document.getElementById("overField");
const overPercent = document.getElementById("overPercent");
const cambioField = document.getElementById("cambioField");
const cambio = document.getElementById("cambio");
const diariaField = document.getElementById("diariaField");
const diaria = document.getElementById("diaria");
const valorPeriodoField = document.getElementById("valorPeriodoField");
const valorPeriodo = document.getElementById("valorPeriodo");
const taxasTipoField = document.getElementById("taxasTipoField");
const taxasTipo = document.getElementById("taxasTipo");
const taxasValorField = document.getElementById("taxasValorField");
const taxasValor = document.getElementById("taxasValor");
const comissaoField = document.getElementById("comissaoField");
const comissaoPercent = document.getElementById("comissaoPercent");
const tarifaNetField = document.getElementById("tarifaNetField");
const tarifaNet = document.getElementById("tarifaNet");
const comissaoOptionsRow = document.getElementById("comissaoOptionsRow");
const checkinField = document.getElementById("checkinField");
const checkin = document.getElementById("checkin");
const checkoutField = document.getElementById("checkoutField");
const checkout = document.getElementById("checkout");
const totalPreview = document.getElementById("totalPreview");
const moedaPreview = document.getElementById("moedaPreview");
const clearFinanceForm = document.getElementById("clearFinanceForm");
const saveFinanceButton = document.getElementById("saveFinanceButton");
const financeSearch = document.getElementById("financeSearch");
const financeStartDate = document.getElementById("financeStartDate");
const financeEndDate = document.getElementById("financeEndDate");
const financeStatusFilter = document.getElementById("financeStatusFilter");
const financeClientFilter = document.getElementById("financeClientFilter");
const financeServiceFilter = document.getElementById("financeServiceFilter");
const financeSort = document.getElementById("financeSort");
const financeTableBody = document.getElementById("financeTableBody");
const selectAllFinance = document.getElementById("selectAllFinance");
const completeSelectedButton = document.getElementById("completeSelectedButton");
const refreshFinanceButton = document.getElementById("refreshFinanceButton");
const financePaginationInfo = document.getElementById("financePaginationInfo");
const financePageSize = document.getElementById("financePageSize");
const financePrevPage = document.getElementById("financePrevPage");
const financeNextPage = document.getElementById("financeNextPage");
const financePageIndicator = document.getElementById("financePageIndicator");
const financeDetailModal = document.getElementById("financeDetailModal");
const financeDetailTitle = document.getElementById("financeDetailTitle");
const financeDetailContent = document.getElementById("financeDetailContent");
const financeDetailClose = document.getElementById("financeDetailClose");
const financeDetailDone = document.getElementById("financeDetailDone");
const financeItemContext = document.getElementById("financeItemContext");
const financeItemContextTitle = document.getElementById("financeItemContextTitle");
const cancelLinkedItemButton = document.getElementById("cancelLinkedItemButton");
const toast = document.getElementById("toast");
let currentUser = null;
let currentProfile = null;
let selectedSubtype = "AEREO";
let lancamentos = [];
let selectedLancamentos = new Set();
let financeCurrentPage = 1;
let editingFinanceId = null;
let editingFinanceOriginal = null;
let linkedFinanceGroup = null;
let allUsers = [];
function todayISO() {
    return new Date().toISOString().split("T")[0];
}
function firstDayOfMonthISO() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
}
function money(value, currency = "BRL") {
    const number = Number(value || 0);
    return number.toLocaleString("pt-BR", {
        style: "currency",
        currency: currency === "USD" ? "USD" : "BRL"
    });
}
function getFinanceGroupKey(item) {
    return String(item?.solicitacao_id || item?.id || "");
}
function getFinanceGroupCode(item) {
    return item?.solicitacao_codigo || item?.codigo_tres || "-";
}
function getFinanceGroups() {
    const groups = new Map();
    lancamentos.forEach(function (item) {
        const key = getFinanceGroupKey(item);
        if (!groups.has(key)) {
            groups.set(key, {
                id: key,
                codigo_tres: getFinanceGroupCode(item),
                data_lancamento: item.data_lancamento,
                emissor_id: item.emissor_id,
                emissor_nome: item.emissor_nome,
                tipo: item.tipo,
                os: item.os,
                cliente_id: item.cliente_id,
                clientes: item.clientes,
                status: item.status,
                created_by: item.created_by,
                created_at: item.created_at,
                itens: [],
                item_count: 0
            });
        }
        groups.get(key).itens.push(item);
    });
    return Array.from(groups.values()).map(function (group) {
        group.itens.sort(function (a, b) {
            return Number(a.item_ordem || 1) - Number(b.item_ordem || 1);
        });
        group.item_count = group.itens.length;
        group.status = group.itens.some(function (item) {
            return item.status !== "CONCLUIDO";
        }) ? "PENDENTE" : "CONCLUIDO";
        return group;
    }).sort(function (a, b) {
        return new Date(b.created_at || b.data_lancamento || 0) - new Date(a.created_at || a.data_lancamento || 0);
    });
}
function formatGroupTotal(group) {
    const totalsByCurrency = new Map();
    group.itens.forEach(function (item) {
        const currency = item.moeda || "BRL";
        totalsByCurrency.set(
            currency,
            Number(totalsByCurrency.get(currency) || 0) + Number(item.total_final || item.total || 0)
        );
    });
    return Array.from(totalsByCurrency.entries())
        .map(function ([currency, total]) {
            return money(total, currency);
        })
        .join(" + ");
}
function summarizeGroupServices(group) {
    return Array.from(new Set(group.itens.map(function (item) {
        return item.servico;
    }).filter(Boolean))).join(", ") || "-";
}
function summarizeGroupSuppliers(group) {
    return Array.from(new Set(group.itens.map(function (item) {
        return item.fornecedor;
    }).filter(Boolean))).join(", ") || "-";
}
function findFinanceGroup(id) {
    return getFinanceGroups().find(function (group) {
        return String(group.id) === String(id);
    });
}
function normalizeText(value) {
    return String(value || "").trim().toUpperCase();
}
function syncFinanceCustomSelect(select) {
    if (!select) {
        return;
    }
    const selectedOption = select.selectedOptions?.[0];
    const wrapper = select.closest(".tres-select") ||
        (select.nextElementSibling?.classList.contains("tres-select") ? select.nextElementSibling : null) ||
        select.parentElement?.querySelector(".tres-select");
    if (wrapper && selectedOption) {
        const label = wrapper.querySelector(".tres-select-label");
        if (label) {
            label.textContent = selectedOption.textContent.trim();
        }
        wrapper.querySelectorAll(".tres-select-option").forEach(function (option) {
            option.classList.toggle("active", String(option.dataset.value || "") === String(select.value));
        });
    }
    select.dispatchEvent(new Event("change", { bubbles: true }));
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
function setupMoneyMasks() {
    [tarifa, taxaEmbarque, rc, overPercent, diaria, valorPeriodo, taxasValor, comissaoPercent].forEach(function (field) {
        field.addEventListener("input", function () {
            applyMoneyMask(field);
            updateTotalPreview();
        });
        field.addEventListener("blur", function () {
            applyMoneyMask(field);
        });
    });
}
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");
    setTimeout(function () {
        toast.classList.add("hidden");
    }, 3000);
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
    const selectedClientId = cliente.value;
    const selectedFilterId = financeClientFilter?.value || "";

    const { data, error } = await supabaseClient
        .from("clientes")
        .select("id, nome")
        .order("nome");

    if (error) {
        console.error("Erro ao carregar clientes:", error);
        showToast("Erro ao carregar os clientes.");
        return;
    }

    cliente.innerHTML = `<option value="">Selecione</option>`;

    if (financeClientFilter) {
        financeClientFilter.innerHTML = `<option value="">Todos os clientes</option>`;
    }

    const clientesDisponiveis = (data || []).filter(function (item) {
        return normalizeText(item.nome) !== "HAOC";
    });

    clientesDisponiveis.forEach(function (item) {
        const formOption = document.createElement("option");
        formOption.value = item.id;
        formOption.textContent = item.nome;
        cliente.appendChild(formOption);

        if (financeClientFilter) {
            const filterOption = document.createElement("option");
            filterOption.value = item.id;
            filterOption.textContent = item.nome;
            financeClientFilter.appendChild(filterOption);
        }
    });

    if (selectedClientId && Array.from(cliente.options).some(function (option) {
        return String(option.value) === String(selectedClientId);
    })) {
        cliente.value = selectedClientId;
    }

    if (financeClientFilter && selectedFilterId && Array.from(financeClientFilter.options).some(function (option) {
        return String(option.value) === String(selectedFilterId);
    })) {
        financeClientFilter.value = selectedFilterId;
    }

    rebuildFinanceClientCustomSelect(cliente);
    rebuildFinanceClientCustomSelect(financeClientFilter);

    requestAnimationFrame(function () {
        rebuildFinanceClientCustomSelect(cliente);
        rebuildFinanceClientCustomSelect(financeClientFilter);
        lucide.createIcons();
    });
}
function rebuildFinanceClientCustomSelect(select) {
    if (!select) {
        return;
    }
    const wrapper = select.closest(".tres-select") ||
        (select.nextElementSibling?.classList.contains("tres-select") ? select.nextElementSibling : null) ||
        select.parentElement?.querySelector(".tres-select");
    if (!wrapper) {
        return;
    }
    const menu = wrapper.querySelector(".tres-select-menu");
    const label = wrapper.querySelector(".tres-select-label");
    if (!menu) {
        return;
    }
    menu.innerHTML = Array.from(select.options).map(function (option) {
        const active = String(option.value) === String(select.value) ? "active" : "";
        return `
            <button
                type="button"
                class="tres-select-option ${active}"
                data-value="${escapeHtml(option.value)}">
                <i data-lucide="circle"></i>
                <span>${escapeHtml(option.textContent.trim())}</span>
            </button>
        `;
    }).join("");
    if (label) {
        label.textContent = select.selectedOptions?.[0]?.textContent?.trim() || "Selecione";
    }
    menu.querySelectorAll(".tres-select-option").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            select.value = button.dataset.value || "";
            menu.querySelectorAll(".tres-select-option").forEach(function (item) {
                item.classList.toggle("active", item === button);
            });
            if (label) {
                label.textContent = select.selectedOptions?.[0]?.textContent?.trim() || "Selecione";
            }
            wrapper.classList.remove("open");
            select.dispatchEvent(new Event("change", { bubbles: true }));
        });
    });
    lucide.createIcons();
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
function hideAllDynamicFields() {
    [
        outroServicoField,
        aereoSubtypeField,
        consolidadorField,
        fornecedorField,
        hotelDiretoField,
        tarifaField,
        taxaEmbarqueField,
        rcField,
        overField,
        cambioField,
        diariaField,
        valorPeriodoField,
        taxasTipoField,
        taxasValorField,
        checkinField,
        checkoutField,
        localizadorField,
        bilheteField,
        comissaoField,
        tarifaNetField,
        bilheteField,
        comissaoOptionsRow,
    ].forEach(function (field) {
        field.classList.add("hidden");
    });
}
function showField(field) {
    field.classList.remove("hidden");
}
function handleServiceChange() {
    hideAllDynamicFields();
    fornecedorField.classList.add("span-2");
    const selectedService = servico.value;
    const isAirService = selectedService === "AEREO";
    if (selectedService !== "HOTEL") {
        hotelDireto.checked = false;
    }
    [diaria, checkin, checkout, valorPeriodo, outroServico].forEach(function (field) {
        field.required = false;
    });
    if (comissaoPercent) {
        comissaoPercent.disabled = Boolean(tarifaNet?.checked) || isAirService || !selectedService;
        if (comissaoPercent.disabled) {
            comissaoPercent.value = "";
        }
    }
    if (!selectedService) {
        updateTotalPreview();
        return;
    }
    if (selectedService === "AEREO") {
        showField(aereoSubtypeField);
        showField(consolidadorField);
        showField(fornecedorField);
        handleAereoFields();
    }
    if (selectedService === "HOTEL") {
        diaria.required = true;
        checkin.required = true;
        checkout.required = true;
        showField(fornecedorField);
        fornecedorField.classList.remove("span-2");
        showField(hotelDiretoField);
        showField(diariaField);
        showField(taxasTipoField);
        showField(taxasValorField);
        showField(comissaoField);
        showField(tarifaNetField);
        showField(taxasTipoField);
        showField(taxasValorField);
        showField(comissaoOptionsRow);
        showField(checkinField);
        showField(checkoutField);
    }
    if (
        selectedService === "SEGURO VIAGEM" ||
        selectedService === "LOCACAO" ||
        selectedService === "TRANSFER" ||
        selectedService === "OUTROS"
    ) {
        valorPeriodo.required = true;
        showField(fornecedorField);
        showField(valorPeriodoField);
        showField(taxasTipoField);
        showField(taxasValorField);
        showField(comissaoField);
        showField(tarifaNetField);
        showField(taxasTipoField);
        showField(taxasValorField);
        showField(comissaoOptionsRow);
    }
    if (selectedService === "OUTROS") {
        outroServico.required = true;
        showField(outroServicoField);
    }
    updateTotalPreview();
}
function handleAereoFields() {
    showField(fornecedorField);
    showField(localizadorField);
    showField(bilheteField);
    if (selectedSubtype === "ASSENTO" || selectedSubtype === "BAGAGEM EXTRA") {
        showField(tarifaField);
        moedaPreview.value = "BRL";
        updateTotalPreview();
        return;
    }
    showField(tarifaField);
    showField(taxaEmbarqueField);
    if (consolidador.value === "CHANTECLAIR") {
        showField(overField);
        showField(cambioField);
        moedaPreview.value = "USD";
    } else {
        showField(rcField);
        moedaPreview.value = "BRL";
    }
    updateTotalPreview();
}
function getQuantidadeDiarias() {
    if (!checkin.value || !checkout.value) {
        return 0;
    }
    const start = new Date(checkin.value);
    const end = new Date(checkout.value);
    const diff = end - start;
    if (diff <= 0) {
        return 0;
    }
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
function calculateTotal() {
    const selectedService = servico.value;
    if (selectedService === "AEREO") {
        if (selectedSubtype === "ASSENTO" || selectedSubtype === "BAGAGEM EXTRA") {
            return numberValue(tarifa);
        }
        if (consolidador.value === "CHANTECLAIR") {
            return numberValue(tarifa) + numberValue(taxaEmbarque);
        }
        return numberValue(tarifa) + numberValue(taxaEmbarque) + numberValue(rc);
    }
    const valorTaxa = numberValue(taxasValor);
    if (selectedService === "HOTEL") {
        const qtdDiarias = getQuantidadeDiarias();
        const valorDiaria = numberValue(diaria);
        if (!qtdDiarias) {
            return 0;
        }
        if (taxasTipo.value === "%") {
            const taxaCalculada = valorDiaria * (valorTaxa / 100);
            const subtotal = (valorDiaria + taxaCalculada) * qtdDiarias;
            return subtotal;
        }
        const subtotal = (valorDiaria + valorTaxa) * qtdDiarias;
        return subtotal;
    }
    const totalPeriodo = numberValue(valorPeriodo);
    if (taxasTipo.value === "%") {
        const subtotal = totalPeriodo + (totalPeriodo * (valorTaxa / 100));
        return subtotal;
    }
    const subtotal = totalPeriodo + valorTaxa;
    return subtotal;
}
function updateTotalPreview() {
    const selectedService = servico.value;
    const currency = selectedService === "AEREO" && consolidador.value === "CHANTECLAIR"
        ? "USD"
        : "BRL";
    totalPreview.value = money(calculateTotal(), currency);
}
async function saveFinance(event) {
    event.preventDefault();
    saveFinanceButton.disabled = true;
    saveFinanceButton.textContent = "Salvando...";
    const selectedService = servico.value;
    const isAirService = selectedService === "AEREO";
    const isHotelService = selectedService === "HOTEL";
    const finalService =
        isAirService
            ? selectedSubtype
            : selectedService;
const payload = {
    data_lancamento: dataLancamento.value,
    emissor_id: currentUser.id,
    tipo: tipoLancamento.value,
    os: normalizeText(os.value),
    cliente_id: cliente.value,
    servico: finalService,
    subtipo: isAirService ? selectedSubtype : null,
    outro_servico: selectedService === "OUTROS"
        ? normalizeText(outroServico.value)
        : null,
    consolidador: isAirService ? consolidador.value || null : null,
    fornecedor: normalizeText(fornecedor.value),
    hotel_direto: isHotelService ? Boolean(hotelDireto.checked) : false,
    localizador: isAirService ? normalizeText(localizador.value) || null : null,
    bilhete: isAirService ? normalizeText(bilhete.value) || null : null,
    moeda: isAirService ? moedaPreview.value : "BRL",
    tarifa: isAirService ? numberValue(tarifa) || null : null,
    taxa_embarque: isAirService ? numberValue(taxaEmbarque) || null : null,
    rc: isAirService ? numberValue(rc) || null : null,
    over_percent: isAirService ? numberValue(overPercent) || null : null,
    cambio: null,
    diaria: isHotelService
        ? numberValue(diaria) || null
        : null,
    valor_periodo: !isAirService && !isHotelService
        ? numberValue(valorPeriodo) || null
        : null,
    taxas_tipo: !isAirService ? taxasTipo.value || null : null,
    taxas_valor: !isAirService ? numberValue(taxasValor) || null : null,
    checkin: isHotelService ? checkin.value || null : null,
    checkout: isHotelService ? checkout.value || null : null,
    quantidade_diarias: isHotelService
        ? getQuantidadeDiarias() || null
        : null,
    total: calculateTotal(),
    total_final: calculateTotal(),
    status: "PENDENTE",
    created_by: currentUser.id,
    updated_by: currentUser.id
};
    const { error } = await supabaseClient
        .from("lancamentos")
        .insert(payload)
        .select("id")
        .single();
    if (error) {
        console.error(error);
        showToast(`Erro ao salvar: ${error.message}`);
    } else {
        showToast("Lan\u00e7amento salvo com sucesso.");
        financeForm.reset();
        resetFinanceForm();
        await loadLancamentos();
    }
    saveFinanceButton.disabled = false;
    saveFinanceButton.textContent = "Salvar lan\u00e7amento";
}
let financeEmitterSelect = null;
function setupFinanceEmitterSelect() {
    if (financeEmitterSelect || !emissorNome?.parentElement) {
        return;
    }
    financeEmitterSelect = document.createElement("select");
    financeEmitterSelect.id = "financeEmitterSelect";
    financeEmitterSelect.className = "hidden";
    emissorNome.parentElement.appendChild(financeEmitterSelect);
}
function fillFinanceEmitterSelect(selectedId) {
    if (!financeEmitterSelect) return;
    financeEmitterSelect.innerHTML = allUsers.map(function (user) {
        return `<option value="${user.id}">${escapeHtml(user.nome || user.email || "Usu\u00e1rio")}</option>`;
    }).join("");
    financeEmitterSelect.value = selectedId || currentUser.id;
    financeEmitterSelect.classList.toggle("hidden", currentProfile?.perfil !== "master" || !editingFinanceId);
    emissorNome.classList.toggle("hidden", currentProfile?.perfil === "master" && Boolean(editingFinanceId));
}
function getSelectedFinanceEmitter() {
    if (!editingFinanceId && linkedFinanceGroup?.emissor_id) {
        return {
            id: linkedFinanceGroup.emissor_id,
            nome: linkedFinanceGroup.emissor_nome || currentProfile.nome
        };
    }
    if (currentProfile?.perfil === "master" && editingFinanceId && financeEmitterSelect?.value) {
        return {
            id: financeEmitterSelect.value,
            nome: financeEmitterSelect.selectedOptions?.[0]?.textContent?.trim() || currentProfile.nome
        };
    }
    return {
        id: currentUser.id,
        nome: currentProfile.nome
    };
}
function buildFinancePayload() {
    const selectedService = servico.value;
    const isAirService = selectedService === "AEREO";
    const isHotelService = selectedService === "HOTEL";
    const finalService = isAirService ? selectedSubtype : selectedService;
    const emitter = getSelectedFinanceEmitter();
    return {
        data_lancamento: dataLancamento.value,
        emissor_id: emitter.id,
        tipo: tipoLancamento.value,
        os: normalizeText(os.value),
        cliente_id: cliente.value,
        solicitacao_id: linkedFinanceGroup?.id || editingFinanceOriginal?.solicitacao_id || null,
        solicitacao_codigo: linkedFinanceGroup?.codigo_tres || editingFinanceOriginal?.solicitacao_codigo || editingFinanceOriginal?.codigo_tres || null,
        item_ordem: linkedFinanceGroup ? linkedFinanceGroup.item_count + 1 : editingFinanceOriginal?.item_ordem || 1,
        servico: finalService,
        subtipo: isAirService ? selectedSubtype : null,
        outro_servico: selectedService === "OUTROS" ? normalizeText(outroServico.value) : null,
        consolidador: isAirService ? consolidador.value || null : null,
        fornecedor: normalizeText(fornecedor.value),
        hotel_direto: isHotelService ? Boolean(hotelDireto.checked) : false,
        localizador: isAirService ? normalizeText(localizador.value) || null : null,
        bilhete: isAirService ? normalizeText(bilhete.value) || null : null,
        moeda: isAirService ? moedaPreview.value : "BRL",
        tarifa: isAirService ? numberValue(tarifa) || null : null,
        taxa_embarque: isAirService ? numberValue(taxaEmbarque) || null : null,
        rc: isAirService ? numberValue(rc) || null : null,
        over_percent: isAirService ? numberValue(overPercent) || null : null,
        cambio: null,
        diaria: isHotelService ? numberValue(diaria) || null : null,
        valor_periodo: !isAirService && !isHotelService ? numberValue(valorPeriodo) || null : null,
        taxas_tipo: !isAirService ? taxasTipo.value || null : null,
        taxas_valor: !isAirService ? numberValue(taxasValor) || null : null,
        comissao_percent: !isAirService && !tarifaNet.checked ? numberValue(comissaoPercent) || null : null,
        tarifa_net: !isAirService ? Boolean(tarifaNet.checked) : false,
        checkin: isHotelService ? checkin.value || null : null,
        checkout: isHotelService ? checkout.value || null : null,
        quantidade_diarias: isHotelService ? getQuantidadeDiarias() || null : null,
        total: calculateTotal(),
        total_final: calculateTotal(),
        status: "PENDENTE",
        updated_by: currentUser.id
    };
}
function shouldIgnoreHistoryField(key) {
    return ["updated_by", "created_by", "concluido_por", "concluido_em"].includes(key);
}
function isNumericHistoryField(key) {
    return [
        "tarifa",
        "taxa_embarque",
        "rc",
        "over_percent",
        "cambio",
        "diaria",
        "valor_periodo",
        "taxas_valor",
        "comissao_percent",
        "quantidade_diarias",
        "total",
        "total_final"
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
            solicitacao_id: String(before?.solicitacao_id || after?.solicitacao_id || before?.id || after?.id || ""),
            codigo_tres: before?.solicitacao_codigo || after?.solicitacao_codigo || before?.codigo_tres || after?.codigo_tres || null,
            acao: action,
            alterado_por: currentUser.id,
            alterado_por_nome: currentProfile.nome,
            alteracoes: getObjectChanges(before, after),
            antes: before || {},
            depois: after || {}
        });
}
function confirmFinanceAction({ title, message, confirmText = "Excluir" }) {
    return new Promise(function (resolve) {
        const backdrop = document.createElement("div");
        backdrop.className = "finance-confirm-backdrop";
        backdrop.innerHTML = `
            <div class="finance-confirm-modal">
                <div class="finance-confirm-icon">
                    <i data-lucide="triangle-alert"></i>
                </div>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(message)}</p>
                <div class="finance-confirm-actions">
                    <button type="button" class="btn btn-soft" data-confirm="cancel">Cancelar</button>
                    <button type="button" class="btn btn-finance danger-button" data-confirm="ok">${escapeHtml(confirmText)}</button>
                </div>
            </div>
        `;
        function close(result) {
            backdrop.remove();
            resolve(result);
        }
        backdrop.addEventListener("click", function (event) {
            if (event.target === backdrop || event.target.closest("[data-confirm='cancel']")) {
                close(false);
            }
            if (event.target.closest("[data-confirm='ok']")) {
                close(true);
            }
        });
        document.body.appendChild(backdrop);
        lucide.createIcons();
    });
}
async function saveFinance(event) {
    event.preventDefault();
    saveFinanceButton.disabled = true;
    saveFinanceButton.textContent = "Salvando...";
    const payload = buildFinancePayload();
    let error = null;
    if (editingFinanceId) {
        payload.status = "PENDENTE";
        payload.concluido_por = null;
        payload.concluido_em = null;
        const result = await supabaseClient
            .from("lancamentos")
            .update(payload)
            .eq("id", editingFinanceId);
        error = result.error;
        if (!error) {
            const editedGroupKey = getFinanceGroupKey(editingFinanceOriginal);
            const groupItemIds = lancamentos
                .filter(function (item) {
                    return getFinanceGroupKey(item) === editedGroupKey;
                })
                .map(function (item) {
                    return item.id;
                });
            if (groupItemIds.length > 0) {
                const groupStatusResult = await supabaseClient
                    .from("lancamentos")
                    .update({
                        status: "PENDENTE",
                        concluido_por: null,
                        concluido_em: null,
                        updated_by: currentUser.id
                    })
                    .in("id", groupItemIds);
                error = groupStatusResult.error;
            }
        }
        if (!error) {
            await registerHistory(
                "VALORES_A_PAGAR",
                editingFinanceOriginal,
                { ...editingFinanceOriginal, ...payload },
                "EDI\u00c7\u00c3O"
            );
        }
    } else {
        payload.created_by = currentUser.id;
        const result = await supabaseClient
            .from("lancamentos")
            .insert(payload)
            .select("id, codigo_tres")
            .single();
        error = result.error;
        if (!error && result.data && !linkedFinanceGroup) {
            const groupUpdate = await supabaseClient
                .from("lancamentos")
                .update({
                    solicitacao_id: result.data.id,
                    solicitacao_codigo: result.data.codigo_tres,
                    item_ordem: 1
                })
                .eq("id", result.data.id);
            error = groupUpdate.error;
        }
        if (!error && result.data && linkedFinanceGroup) {
            await registerHistory(
                "VALORES_A_PAGAR",
                {
                    id: linkedFinanceGroup.id,
                    codigo_tres: linkedFinanceGroup.codigo_tres,
                    item_count: linkedFinanceGroup.item_count
                },
                {
                    id: linkedFinanceGroup.id,
                    codigo_tres: linkedFinanceGroup.codigo_tres,
                    item_count: linkedFinanceGroup.item_count + 1,
                    servico: payload.servico,
                    fornecedor: payload.fornecedor,
                    total: payload.total,
                    moeda: payload.moeda
                },
                "ITEM_ADICIONADO"
            );
        }
    }
    if (error) {
        console.error(error);
        showToast(`Erro ao salvar: ${error.message}`);
    } else {
        showToast(editingFinanceId ? "Lan\u00e7amento atualizado e voltou para pendente." : "Lan\u00e7amento salvo com sucesso.");
        financeForm.reset();
        resetFinanceForm();
        await loadLancamentos();
    }
    saveFinanceButton.disabled = false;
    saveFinanceButton.textContent = "Salvar lan\u00e7amento";
}
function resetFinanceForm() {
    editingFinanceId = null;
    editingFinanceOriginal = null;
    linkedFinanceGroup = null;
    dataLancamento.value = todayISO();
    emissorNome.value = currentProfile.nome;
    tipoLancamento.value = "NACIONAL";
    hotelDireto.checked = false;
    selectedSubtype = "AEREO";
    [diaria, checkin, checkout, valorPeriodo, outroServico].forEach(function (field) {
        field.required = false;
    });
    choiceButtons.forEach(function (button) {
        button.classList.toggle("active", button.dataset.subtipo === "AEREO");
    });
    hideAllDynamicFields();
    totalPreview.value = "R$ 0,00";
    moedaPreview.value = "BRL";
    saveFinanceButton.textContent = "Salvar lan\u00e7amento";
    fillFinanceEmitterSelect(currentUser.id);
    updateLinkedFinanceContext();
}
function updateLinkedFinanceContext() {
    if (!financeItemContext) return;
    const active = Boolean(linkedFinanceGroup);
    financeItemContext.classList.toggle("hidden", !active);
    if (active) {
        financeItemContextTitle.textContent = `${linkedFinanceGroup.codigo_tres || "-"} \u00b7 OS ${linkedFinanceGroup.os || "-"}`;
    }
}
function addItemToFinanceGroup(id) {
    const group = findFinanceGroup(id);
    if (!group) {
        showToast("N\u00e3o foi poss\u00edvel localizar a solicita\u00e7\u00e3o.");
        return;
    }
    financeForm.reset();
    editingFinanceId = null;
    editingFinanceOriginal = null;
    linkedFinanceGroup = group;
    dataLancamento.value = todayISO();
    tipoLancamento.value = group.tipo || "NACIONAL";
    os.value = group.os || "";
    cliente.value = group.cliente_id || "";
    emissorNome.value = group.emissor_nome || currentProfile.nome;
    tipoLancamento.dispatchEvent(new Event("change", { bubbles: true }));
    cliente.dispatchEvent(new Event("change", { bubbles: true }));
    updateLinkedFinanceContext();
    hideAllDynamicFields();
    updateTotalPreview();
    saveFinanceButton.textContent = "Adicionar item";
    tabButtons.forEach(function (button) {
        if (button.dataset.tab === "newFinance") {
            button.click();
        }
    });
    showToast("Preencha o novo item desta OS.");
}
async function loadLancamentos() {
    financeTableBody.innerHTML = `
        <tr>
            <td colspan="11" class="empty-table-message">
                <div class="table-loading-state">
                    <span class="table-loading-spinner" aria-hidden="true"></span>
                    Carregando lan\u00e7amentos...
                </div>
            </td>
        </tr>
    `;
    const { data, error } = await supabaseClient
        .from("lancamentos")
        .select(`
            id,
            codigo_tres,
            solicitacao_id,
            solicitacao_codigo,
            item_ordem,
            data_lancamento,
            emissor_id,
            tipo,
            os,
            cliente_id,
            servico,
            subtipo,
            outro_servico,
            consolidador,
            fornecedor,
            hotel_direto,
            localizador,
            bilhete,
            tarifa,
            taxa_embarque,
            rc,
            over_percent,
            cambio,
            diaria,
            valor_periodo,
            taxas_tipo,
            taxas_valor,
            comissao_percent,
            tarifa_net,
            checkin,
            checkout,
            quantidade_diarias,
            total,
            total_final,
            moeda,
            status,
            created_by,
            created_at,
            clientes:cliente_id (nome)
        `)
        .order("created_at", {
            ascending: false
        });
    if (error) {
        console.error(error);
        financeTableBody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-table-message">
                    Erro ao carregar lan\u00e7amentos.
                </td>
            </tr>
        `;
        return;
    }
    lancamentos = await attachEmitterNames(data || []);
    renderLancamentos();
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
function getFilteredLancamentos() {
    const search = normalizeText(financeSearch.value);
    const start = financeStartDate?.value || "";
    const end = financeEndDate?.value || "";
    const status = financeStatusFilter.value;
    const client = financeClientFilter?.value || "";
    const service = financeServiceFilter.value;
    const filteredLancamentos = getFinanceGroups().filter(function (item) {
        const date = item.data_lancamento || "";
        const matchSearch =
            !search ||
            normalizeText(item.codigo_tres).includes(search) ||
            normalizeText(item.os).includes(search) ||
            normalizeText(item.emissor_nome).includes(search) ||
            normalizeText(item.clientes?.nome).includes(search) ||
            item.itens.some(function (subitem) {
                return normalizeText(subitem.fornecedor).includes(search) ||
                    normalizeText(subitem.servico).includes(search) ||
                    normalizeText(subitem.localizador).includes(search);
            });
        const matchStatus = !status || item.status === status;
        const matchClient = !client || String(item.cliente_id) === String(client);
        const matchService = !service || item.itens.some(function (subitem) {
            return subitem.servico === service;
        });
        const matchStart = !start || date >= start;
        const matchEnd = !end || date <= end;
        return matchSearch && matchStatus && matchClient && matchService && matchStart && matchEnd;
    });
    const sortMode = financeSort?.value || "DATE_DESC";
    const statusOrder = {
        PENDENTE: 0,
        CONCLUIDO: 1
    };
    return filteredLancamentos.sort(function (a, b) {
        if (sortMode === "STATUS_ASC" || sortMode === "STATUS_DESC") {
            const direction = sortMode === "STATUS_ASC" ? 1 : -1;
            const statusComparison =
                ((statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)) * direction;
            if (statusComparison !== 0) {
                return statusComparison;
            }
        }
        const dateComparison = String(a.data_lancamento || "")
            .localeCompare(String(b.data_lancamento || ""));
        return sortMode === "DATE_ASC" ? dateComparison : -dateComparison;
    });
}
function statusBadge(status) {
    if (status === "CONCLUIDO") {
        return `<span class="badge badge-concluido">CONCLU\u00cdDO</span>`;
    }
    return `<span class="badge badge-pendente">PENDENTE</span>`;
}
function resetFinancePagination() {
    financeCurrentPage = 1;
    renderLancamentos();
}
function getFinancePageSize() {
    return Number(financePageSize?.value || 10);
}
function updateFinancePagination(totalItems) {
    const pageSize = getFinancePageSize();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (financeCurrentPage > totalPages) {
        financeCurrentPage = totalPages;
    }
    const start = totalItems === 0 ? 0 : ((financeCurrentPage - 1) * pageSize) + 1;
    const end = Math.min(totalItems, financeCurrentPage * pageSize);
    if (financePaginationInfo) {
        financePaginationInfo.textContent = `Mostrando ${start}-${end} de ${totalItems}`;
    }
    if (financePageIndicator) {
        financePageIndicator.textContent = `P\u00e1gina ${financeCurrentPage} de ${totalPages}`;
    }
    if (financePrevPage) {
        financePrevPage.disabled = financeCurrentPage <= 1;
    }
    if (financeNextPage) {
        financeNextPage.disabled = financeCurrentPage >= totalPages;
    }
}
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function detailValue(value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }
    return escapeHtml(value);
}
function detailMoney(value, currency) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }
    return money(value, currency);
}
function detailDate(value) {
    if (!value) {
        return "-";
    }
    const parts = String(value).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
}
function financeDateTimeLabel(dateValue, timeValue) {
    const date = detailDate(dateValue);
    if (!timeValue) {
        return date;
    }
    const parsed = new Date(timeValue);
    if (Number.isNaN(parsed.getTime())) {
        return date;
    }
    return `${date} às ${parsed.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    })}`;
}
function financeCreatedAtLabel(dateValue, timeValue) {
    return `Solicitação criada em ${financeDateTimeLabel(dateValue, timeValue)}`;
}
function detailItem(label, value, className = "") {
    return `
        <div class="finance-detail-item ${className}">
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
        </div>
    `;
}
function closeFinanceDetails() {
    financeDetailModal.classList.add("hidden");
    financeDetailModal.setAttribute("aria-hidden", "true");
    financeDetailContent.classList.remove("finance-detail-content-group");
    document.body.classList.remove("finance-detail-open");
}
function openFinanceDetails(id) {
    const item = lancamentos.find(function (lancamento) {
        return String(lancamento.id) === String(id);
    });
    if (!item) {
        showToast("N\u00e3o foi poss\u00edvel carregar os detalhes.");
        return;
    }
    const isAir = ["AEREO", "ASSENTO", "BAGAGEM EXTRA"].includes(item.servico);
    const currency = item.moeda || "BRL";
    const details = [
        detailItem("C\u00f3digo", detailValue(item.codigo_tres)),
        detailItem("Data", detailDate(item.data_lancamento)),
        detailItem("Status", detailValue(item.status)),
        detailItem("Cliente", detailValue(item.clientes?.nome), "wide"),
        detailItem("OS", detailValue(item.os)),
        detailItem("Tipo", detailValue(item.tipo)),
        detailItem("Servi\u00e7o", detailValue(item.servico)),
        detailItem("Fornecedor", detailValue(item.fornecedor), "wide")
    ];
    if (isAir) {
        details.push(
            detailItem("Classifica\u00e7\u00e3o", detailValue(item.subtipo)),
            detailItem("Consolidador", detailValue(item.consolidador)),
            detailItem("Moeda", detailValue(currency)),
            detailItem("Localizador", detailValue(item.localizador)),
            detailItem("Bilhete", detailValue(item.bilhete), "wide"),
            detailItem("Tarifa", detailMoney(item.tarifa, currency)),
            detailItem("Taxa de embarque", detailMoney(item.taxa_embarque, currency)),
            detailItem("RC", detailMoney(item.rc, currency)),
            detailItem(
                "Over",
                item.over_percent === null || item.over_percent === undefined
                    ? "-"
                    : `${Number(item.over_percent).toLocaleString("pt-BR")} %`
            ),
            detailItem(
                "C\u00e2mbio",
                item.cambio === null || item.cambio === undefined
                    ? "-"
                    : Number(item.cambio).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                    })
            )
        );
    } else if (item.servico === "HOTEL") {
        details.push(
            detailItem("Hotel direto", item.hotel_direto ? "Sim" : "Não"),
            detailItem("Di\u00e1ria", detailMoney(item.diaria, "BRL")),
            detailItem("Tipo da taxa", detailValue(item.taxas_tipo)),
            detailItem(
                "Taxas / impostos",
                item.taxas_tipo === "%"
                    ? `${Number(item.taxas_valor || 0).toLocaleString("pt-BR")} %`
                    : detailMoney(item.taxas_valor, "BRL")
            ),
            detailItem("Check-in", detailDate(item.checkin)),
            detailItem("Check-out", detailDate(item.checkout)),
            detailItem("Quantidade de di\u00e1rias", detailValue(item.quantidade_diarias))
        );
    } else {
        if (item.servico === "OUTROS") {
            details.push(
                detailItem("Descri\u00e7\u00e3o do servi\u00e7o", detailValue(item.outro_servico), "wide")
            );
        }
        details.push(
            detailItem("Valor total do per\u00edodo", detailMoney(item.valor_periodo, "BRL")),
            detailItem("Tipo da taxa", detailValue(item.taxas_tipo)),
            detailItem(
                "Taxas / impostos",
                item.taxas_tipo === "%"
                    ? `${Number(item.taxas_valor || 0).toLocaleString("pt-BR")} %`
                    : detailMoney(item.taxas_valor, "BRL")
            )
        );
    }
    details.push(
        detailItem("Total", detailMoney(item.total, currency), "total"),
        detailItem("Total final", detailMoney(item.total_final, currency), "total")
    );
    financeDetailTitle.textContent = `${item.codigo_tres || "Lan\u00e7amento"} \u00b7 ${item.servico || "Detalhes"}`;
    financeDetailContent.innerHTML = details.join("");
    financeDetailModal.classList.remove("hidden");
    financeDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("finance-detail-open");
    financeDetailClose.focus();
}
function renderFinanceItemDetails(item, index) {
    const isAir = ["AEREO", "ASSENTO", "BAGAGEM EXTRA"].includes(item.servico);
    const currency = item.moeda || "BRL";
    const details = [
        detailItem("Fornecedor", detailValue(item.fornecedor), "wide")
    ];
    if (isAir) {
        details.push(
            detailItem("Classifica\u00e7\u00e3o", detailValue(item.subtipo)),
            detailItem("Consolidador", detailValue(item.consolidador)),
            detailItem("Moeda", detailValue(currency)),
            detailItem("Localizador", detailValue(item.localizador)),
            detailItem("Bilhete", detailValue(item.bilhete), "wide"),
            detailItem("Tarifa", detailMoney(item.tarifa, currency)),
            detailItem("Taxa de embarque", detailMoney(item.taxa_embarque, currency)),
            detailItem("RC", detailMoney(item.rc, currency)),
            detailItem(
                "Over",
                item.over_percent === null || item.over_percent === undefined
                    ? "-"
                    : `${Number(item.over_percent).toLocaleString("pt-BR")} %`
            )
        );
    } else if (item.servico === "HOTEL") {
        details.push(
            detailItem("Hotel direto", item.hotel_direto ? "Sim" : "Não"),
            detailItem("Di\u00e1ria", detailMoney(item.diaria, "BRL")),
            detailItem("Tipo da taxa", detailValue(item.taxas_tipo)),
            detailItem(
                "Taxas / impostos",
                item.taxas_tipo === "%"
                    ? `${Number(item.taxas_valor || 0).toLocaleString("pt-BR")} %`
                    : detailMoney(item.taxas_valor, "BRL")
            ),
            detailItem("Comiss\u00e3o", item.tarifa_net ? "Tarifa NET" : `${Number(item.comissao_percent || 0).toLocaleString("pt-BR")} %`),
            detailItem("Check-in", detailDate(item.checkin)),
            detailItem("Check-out", detailDate(item.checkout)),
            detailItem("Quantidade de di\u00e1rias", detailValue(item.quantidade_diarias))
        );
    } else {
        if (item.servico === "OUTROS") {
            details.push(detailItem("Descri\u00e7\u00e3o do servi\u00e7o", detailValue(item.outro_servico), "wide"));
        }
        details.push(
            detailItem("Valor total do per\u00edodo", detailMoney(item.valor_periodo, "BRL")),
            detailItem("Tipo da taxa", detailValue(item.taxas_tipo)),
            detailItem(
                "Taxas / impostos",
                item.taxas_tipo === "%"
                    ? `${Number(item.taxas_valor || 0).toLocaleString("pt-BR")} %`
                    : detailMoney(item.taxas_valor, "BRL")
            ),
            detailItem("Comiss\u00e3o", item.tarifa_net ? "Tarifa NET" : `${Number(item.comissao_percent || 0).toLocaleString("pt-BR")} %`)
        );
    }
    details.push(
        detailItem("Total", detailMoney(item.total, currency), "total"),
        detailItem("Total final", detailMoney(item.total_final, currency), "total")
    );
    return `
        <section class="finance-item-detail-card">
            <header>
                <div>
                    <span>Item ${index + 1}</span>
                    <strong>${escapeHtml(item.servico || "Servi\u00e7o")}</strong>
                </div>
                <button type="button" class="icon-button" data-action="edit-detail-item" data-id="${item.id}" title="Editar item">
                    <i data-lucide="pencil"></i>
                </button>
            </header>
            <div class="finance-detail-grid">${details.join("")}</div>
        </section>
    `;
}
function openFinanceDetails(id) {
    const group = findFinanceGroup(id);
    if (!group) {
        showToast("N\u00e3o foi poss\u00edvel carregar os detalhes.");
        return;
    }
    const summary = [
        detailItem("C\u00f3digo", detailValue(group.codigo_tres)),
        detailItem("Data", detailDate(group.data_lancamento)),
        detailItem("Status", detailValue(group.status)),
        detailItem("Cliente", detailValue(group.clientes?.nome), "wide"),
        detailItem("OS", detailValue(group.os)),
        detailItem("Emissor", detailValue(group.emissor_nome)),
        detailItem("Total geral", escapeHtml(formatGroupTotal(group)), "total")
    ];
    financeDetailTitle.textContent = `${group.codigo_tres || "Solicita\u00e7\u00e3o"} \u00b7 OS ${group.os || "-"}`;
    financeDetailContent.classList.add("finance-detail-content-group");
    financeDetailContent.innerHTML = `
        <div class="finance-detail-grid finance-group-summary">${summary.join("")}</div>
        <div class="finance-detail-items">
            ${group.itens.map(renderFinanceItemDetails).join("")}
        </div>
    `;
    financeDetailModal.classList.remove("hidden");
    financeDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("finance-detail-open");
    financeDetailClose.focus();
    lucide.createIcons();
}
function financeCompactDetail(label, value, className = "") {
    return `
        <div class="finance-compact-detail ${className}">
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
        </div>
    `;
}
function financeItemTotalRow(item, currency) {
    return `
        <footer class="finance-clean-item-footer">
            <span>Total do item</span>
            <strong>${detailMoney(item.total_final || item.total, currency)}</strong>
        </footer>
    `;
}
function renderFinanceItemDetails(item, index) {
    const isAir = ["AEREO", "ASSENTO", "BAGAGEM EXTRA"].includes(item.servico);
    const currency = item.moeda || "BRL";
    const details = [
        financeCompactDetail("Fornecedor", detailValue(item.fornecedor))
    ];
    if (isAir) {
        details.push(
            financeCompactDetail("Classifica\u00e7\u00e3o", detailValue(item.subtipo)),
            financeCompactDetail("Consolidador", detailValue(item.consolidador)),
            financeCompactDetail("Moeda", detailValue(currency)),
            financeCompactDetail("Localizador", detailValue(item.localizador)),
            financeCompactDetail("Bilhete", detailValue(item.bilhete)),
            financeCompactDetail("Tarifa", detailMoney(item.tarifa, currency)),
            financeCompactDetail("Taxa de embarque", detailMoney(item.taxa_embarque, currency)),
            financeCompactDetail("RC", detailMoney(item.rc, currency)),
            financeCompactDetail(
                "Over",
                item.over_percent === null || item.over_percent === undefined
                    ? "-"
                    : `${Number(item.over_percent).toLocaleString("pt-BR")} %`
            )
        );
    } else if (item.servico === "HOTEL") {
        details.push(
            financeCompactDetail("Hotel direto", item.hotel_direto ? "Sim" : "Não"),
            financeCompactDetail("Di\u00e1ria", detailMoney(item.diaria, "BRL")),
            financeCompactDetail("Taxas / impostos", item.taxas_tipo === "%" ? `${Number(item.taxas_valor || 0).toLocaleString("pt-BR")} %` : detailMoney(item.taxas_valor, "BRL")),
            financeCompactDetail("Comiss\u00e3o", item.tarifa_net ? "Tarifa NET" : `${Number(item.comissao_percent || 0).toLocaleString("pt-BR")} %`),
            financeCompactDetail("Check-in", detailDate(item.checkin)),
            financeCompactDetail("Check-out", detailDate(item.checkout)),
            financeCompactDetail("Di\u00e1rias", detailValue(item.quantidade_diarias))
        );
    } else {
        if (item.servico === "OUTROS") {
            details.push(financeCompactDetail("Descri\u00e7\u00e3o", detailValue(item.outro_servico)));
        }
        details.push(
            financeCompactDetail("Valor do per\u00edodo", detailMoney(item.valor_periodo, "BRL")),
            financeCompactDetail("Taxas / impostos", item.taxas_tipo === "%" ? `${Number(item.taxas_valor || 0).toLocaleString("pt-BR")} %` : detailMoney(item.taxas_valor, "BRL")),
            financeCompactDetail("Comiss\u00e3o", item.tarifa_net ? "Tarifa NET" : `${Number(item.comissao_percent || 0).toLocaleString("pt-BR")} %`)
        );
    }
    return `
        <section class="finance-clean-item">
            <header class="finance-clean-item-header">
                <div>
                    <span>Item ${index + 1}</span>
                    <strong>${escapeHtml(item.servico || "Servi\u00e7o")}</strong>
                </div>
                <div class="finance-clean-item-actions">
                    <button type="button" class="icon-button" data-action="edit-detail-item" data-id="${item.id}" title="Editar item">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button type="button" class="icon-button" data-action="duplicate-detail-item" data-id="${item.id}" title="Duplicar para outra OS ou cliente">
                        <i data-lucide="copy"></i>
                    </button>
                    ${
                        isAdminOrMaster()
                            ? `
                                <button type="button" class="icon-button danger-icon" data-action="delete-detail-item" data-id="${item.id}" title="Excluir item">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            `
                            : ""
                    }
                </div>
            </header>
            <div class="finance-compact-grid">${details.join("")}</div>
            ${financeItemTotalRow(item, currency)}
        </section>
    `;
}
function openFinanceDetails(id) {
    const group = findFinanceGroup(id);
    if (!group) {
        showToast("N\u00e3o foi poss\u00edvel carregar os detalhes.");
        return;
    }
    const summary = [
        financeCompactDetail("C\u00f3digo", detailValue(group.codigo_tres)),
        financeCompactDetail("OS", detailValue(group.os)),
        financeCompactDetail("Cliente", detailValue(group.clientes?.nome)),
        financeCompactDetail("Emissor", detailValue(group.emissor_nome)),
        financeCompactDetail("Criação", financeCreatedAtLabel(group.data_lancamento, group.created_at), "wide"),
        financeCompactDetail("Status", detailValue(group.status)),
        financeCompactDetail("Total geral", escapeHtml(formatGroupTotal(group)))
    ];
    financeDetailTitle.textContent = `${group.codigo_tres || "Solicita\u00e7\u00e3o"} \u00b7 OS ${group.os || "-"}`;
    financeDetailContent.classList.add("finance-detail-content-group");
    financeDetailContent.innerHTML = `
        <section class="finance-clean-summary">
            ${summary.join("")}
        </section>
        <div class="finance-clean-items">
            ${group.itens.map(renderFinanceItemDetails).join("")}
        </div>
    `;
    financeDetailModal.classList.remove("hidden");
    financeDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("finance-detail-open");
    financeDetailClose.focus();
    lucide.createIcons();
}
function setMoneyField(input, value) {
    input.value = value === null || value === undefined ? "" : formatMoneyInput(value);
}
function editFinance(id) {
    const item = lancamentos.find(function (lancamento) {
        return String(lancamento.id) === String(id);
    });
    if (!item) {
        showToast("N\u00e3o foi poss\u00edvel abrir a edi\u00e7\u00e3o.");
        return;
    }
    editingFinanceId = item.id;
    editingFinanceOriginal = { ...item };
    dataLancamento.value = item.data_lancamento || todayISO();
    tipoLancamento.value = item.tipo || "NACIONAL";
    os.value = item.os || "";
    cliente.value = item.cliente_id || "";
    if (["AEREO", "ASSENTO", "BAGAGEM EXTRA"].includes(item.servico)) {
        servico.value = "AEREO";
        selectedSubtype = item.servico || item.subtipo || "AEREO";
    } else {
        servico.value = item.servico || "";
        selectedSubtype = "AEREO";
    }
    choiceButtons.forEach(function (button) {
        button.classList.toggle("active", button.dataset.subtipo === selectedSubtype);
    });
    handleServiceChange();
    outroServico.value = item.outro_servico || "";
    consolidador.value = item.consolidador || "";
    fornecedor.value = item.fornecedor || "";
    localizador.value = item.localizador || "";
    bilhete.value = item.bilhete || "";
    setMoneyField(tarifa, item.tarifa);
    setMoneyField(taxaEmbarque, item.taxa_embarque);
    setMoneyField(rc, item.rc);
    setMoneyField(overPercent, item.over_percent);
    setMoneyField(diaria, item.diaria);
    setMoneyField(valorPeriodo, item.valor_periodo);
    taxasTipo.value = item.taxas_tipo || "R$";
    setMoneyField(taxasValor, item.taxas_valor);
    setMoneyField(comissaoPercent, item.comissao_percent);
    tarifaNet.checked = Boolean(item.tarifa_net);
    hotelDireto.checked = Boolean(item.hotel_direto);
    checkin.value = item.checkin || "";
    checkout.value = item.checkout || "";
    handleServiceChange();
    updateTotalPreview();
    fillFinanceEmitterSelect(item.emissor_id);
    [tipoLancamento, cliente, servico, consolidador, taxasTipo].forEach(syncFinanceCustomSelect);
    tabButtons.forEach(function (button) {
        if (button.dataset.tab === "newFinance") {
            button.click();
        }
    });
    saveFinanceButton.textContent = "Salvar altera\u00e7\u00f5es";
    showToast("Editando lan\u00e7amento. Ao salvar, ele voltar\u00e1 para PENDENTE.");
}
function duplicateFinance(id) {
    const item = lancamentos.find(function (lancamento) {
        return String(lancamento.id) === String(id);
    });
    if (!item) {
        showToast("N\u00e3o foi poss\u00edvel localizar o lan\u00e7amento para duplicar.");
        return;
    }
    financeForm.reset();
    editingFinanceId = null;
    editingFinanceOriginal = null;
    linkedFinanceGroup = null;
    dataLancamento.value = todayISO();
    emissorNome.value = currentProfile.nome;
    tipoLancamento.value = item.tipo || "NACIONAL";
    os.value = item.os || "";
    cliente.value = item.cliente_id || "";
    if (["AEREO", "ASSENTO", "BAGAGEM EXTRA"].includes(item.servico)) {
        servico.value = "AEREO";
        selectedSubtype = item.servico || item.subtipo || "AEREO";
    } else {
        servico.value = item.servico || "";
        selectedSubtype = "AEREO";
    }
    choiceButtons.forEach(function (button) {
        button.classList.toggle("active", button.dataset.subtipo === selectedSubtype);
    });
    handleServiceChange();
    outroServico.value = item.outro_servico || "";
    consolidador.value = item.consolidador || "";
    fornecedor.value = item.fornecedor || "";
    localizador.value = item.localizador || "";
    bilhete.value = item.bilhete || "";
    setMoneyField(tarifa, item.tarifa);
    setMoneyField(taxaEmbarque, item.taxa_embarque);
    setMoneyField(rc, item.rc);
    setMoneyField(overPercent, item.over_percent);
    setMoneyField(diaria, item.diaria);
    setMoneyField(valorPeriodo, item.valor_periodo);
    taxasTipo.value = item.taxas_tipo || "R$";
    setMoneyField(taxasValor, item.taxas_valor);
    setMoneyField(comissaoPercent, item.comissao_percent);
    tarifaNet.checked = Boolean(item.tarifa_net);
    hotelDireto.checked = Boolean(item.hotel_direto);
    checkin.value = item.checkin || "";
    checkout.value = item.checkout || "";
    handleServiceChange();
    updateTotalPreview();
    updateLinkedFinanceContext();
    fillFinanceEmitterSelect(currentUser.id);
    [tipoLancamento, cliente, servico, consolidador, taxasTipo].forEach(syncFinanceCustomSelect);
    window.TRESDatePickers?.refresh();
    tabButtons.forEach(function (button) {
        if (button.dataset.tab === "newFinance") {
            button.click();
        }
    });
    saveFinanceButton.textContent = "Salvar duplicado";
    showToast("Lan\u00e7amento copiado. Altere a OS e o cliente antes de salvar.");
}
function ensureFinanceGroupDuplicateModal() {
    let modal = document.getElementById("financeGroupDuplicateModal");
    if (modal) {
        return modal;
    }
    modal = document.createElement("div");
    modal.id = "financeGroupDuplicateModal";
    modal.className = "finance-duplicate-backdrop hidden";
    modal.innerHTML = `
        <div class="finance-duplicate-modal" role="dialog" aria-modal="true" aria-labelledby="financeDuplicateTitle">
            <header class="finance-duplicate-header">
                <div>
                    <p class="eyebrow">Duplicar processo</p>
                    <h2 id="financeDuplicateTitle">Copiar todos os itens</h2>
                    <p id="financeDuplicateDescription"></p>
                </div>
                <button type="button" class="icon-button" data-duplicate-close aria-label="Fechar">
                    <i data-lucide="x"></i>
                </button>
            </header>
            <form id="financeGroupDuplicateForm">
                <div class="finance-duplicate-grid">
                    <label>
                        <span>Nova OS</span>
                        <input type="text" id="financeDuplicateOs" required>
                    </label>
                    <label>
                        <span>Cliente</span>
                        <select id="financeDuplicateClient" required></select>
                    </label>
                </div>
                <footer class="finance-duplicate-actions">
                    <button type="button" class="btn btn-soft" data-duplicate-close>Cancelar</button>
                    <button type="submit" class="btn btn-finance" id="financeDuplicateConfirm">
                        <i data-lucide="copy"></i>
                        Duplicar processo
                    </button>
                </footer>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", function (event) {
        if (event.target === modal || event.target.closest("[data-duplicate-close]")) {
            closeFinanceGroupDuplicateModal();
        }
    });
    modal.querySelector("#financeGroupDuplicateForm").addEventListener("submit", async function (event) {
        event.preventDefault();
        const groupId = modal.dataset.groupId;
        const newOs = normalizeText(modal.querySelector("#financeDuplicateOs").value);
        const newClientId = modal.querySelector("#financeDuplicateClient").value;
        const confirmButton = modal.querySelector("#financeDuplicateConfirm");
        if (!newOs || !newClientId) {
            showToast("Informe a nova OS e o cliente.");
            return;
        }
        confirmButton.disabled = true;
        confirmButton.textContent = "Duplicando...";
        const duplicated = await duplicateFinanceGroup(groupId, newOs, newClientId);
        confirmButton.disabled = false;
        confirmButton.innerHTML = `<i data-lucide="copy"></i> Duplicar processo`;
        if (duplicated) {
            closeFinanceGroupDuplicateModal();
        }
        lucide.createIcons();
    });
    return modal;
}
function openFinanceGroupDuplicateModal(id) {
    const group = findFinanceGroup(id);
    if (!group) {
        showToast("N\u00e3o foi poss\u00edvel localizar o processo.");
        return;
    }
    const modal = ensureFinanceGroupDuplicateModal();
    const clientSelect = modal.querySelector("#financeDuplicateClient");
    modal.dataset.groupId = group.id;
    modal.querySelector("#financeDuplicateDescription").textContent =
        `${group.codigo_tres || "Processo"} possui ${group.item_count} ${group.item_count === 1 ? "item" : "itens"}.`;
    modal.querySelector("#financeDuplicateOs").value = group.os || "";
    clientSelect.innerHTML = Array.from(cliente.options).map(function (option) {
        return `<option value="${escapeHtml(option.value)}">${escapeHtml(option.textContent.trim())}</option>`;
    }).join("");
    clientSelect.value = group.cliente_id || "";
    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
    modal.querySelector("#financeDuplicateOs").focus();
    modal.querySelector("#financeDuplicateOs").select();
    lucide.createIcons();
}
function closeFinanceGroupDuplicateModal() {
    const modal = document.getElementById("financeGroupDuplicateModal");
    if (!modal) {
        return;
    }
    modal.classList.add("hidden");
    modal.removeAttribute("data-group-id");
    document.body.classList.remove("modal-open");
}
function buildDuplicatedFinanceItem(item, newOs, newClientId, itemOrder) {
    return {
        data_lancamento: todayISO(),
        emissor_id: currentUser.id,
        tipo: item.tipo,
        os: newOs,
        cliente_id: newClientId,
        item_ordem: itemOrder,
        servico: item.servico,
        subtipo: item.subtipo,
        outro_servico: item.outro_servico,
        consolidador: item.consolidador,
        fornecedor: item.fornecedor,
        hotel_direto: Boolean(item.hotel_direto),
        localizador: item.localizador,
        bilhete: item.bilhete,
        moeda: item.moeda,
        tarifa: item.tarifa,
        taxa_embarque: item.taxa_embarque,
        rc: item.rc,
        over_percent: item.over_percent,
        cambio: item.cambio,
        diaria: item.diaria,
        valor_periodo: item.valor_periodo,
        taxas_tipo: item.taxas_tipo,
        taxas_valor: item.taxas_valor,
        comissao_percent: item.comissao_percent,
        tarifa_net: Boolean(item.tarifa_net),
        checkin: item.checkin,
        checkout: item.checkout,
        quantidade_diarias: item.quantidade_diarias,
        total: item.total,
        total_final: item.total_final,
        status: "PENDENTE",
        concluido_por: null,
        concluido_em: null,
        created_by: currentUser.id,
        updated_by: currentUser.id
    };
}
async function duplicateFinanceGroup(id, newOs, newClientId) {
    const group = findFinanceGroup(id);
    if (!group || group.itens.length === 0) {
        showToast("N\u00e3o foi poss\u00edvel localizar os itens do processo.");
        return false;
    }
    const orderedItems = [...group.itens].sort(function (a, b) {
        return Number(a.item_ordem || 1) - Number(b.item_ordem || 1);
    });
    const firstPayload = buildDuplicatedFinanceItem(orderedItems[0], newOs, newClientId, 1);
    firstPayload.solicitacao_id = null;
    firstPayload.solicitacao_codigo = null;
    const firstResult = await supabaseClient
        .from("lancamentos")
        .insert(firstPayload)
        .select("id, codigo_tres")
        .single();
    if (firstResult.error || !firstResult.data) {
        console.error(firstResult.error);
        showToast("Erro ao iniciar a duplica\u00e7\u00e3o do processo.");
        return false;
    }
    const newGroupId = firstResult.data.id;
    const newGroupCode = firstResult.data.codigo_tres;
    const firstUpdate = await supabaseClient
        .from("lancamentos")
        .update({
            solicitacao_id: newGroupId,
            solicitacao_codigo: newGroupCode,
            item_ordem: 1
        })
        .eq("id", newGroupId);
    if (firstUpdate.error) {
        console.error(firstUpdate.error);
        await supabaseClient.from("lancamentos").delete().eq("id", newGroupId);
        showToast("Erro ao criar o novo processo.");
        return false;
    }
    if (orderedItems.length > 1) {
        const remainingPayloads = orderedItems.slice(1).map(function (item, index) {
            return {
                ...buildDuplicatedFinanceItem(item, newOs, newClientId, index + 2),
                solicitacao_id: newGroupId,
                solicitacao_codigo: newGroupCode
            };
        });
        const remainingResult = await supabaseClient
            .from("lancamentos")
            .insert(remainingPayloads);
        if (remainingResult.error) {
            console.error(remainingResult.error);
            await supabaseClient.from("lancamentos").delete().eq("solicitacao_id", newGroupId);
            showToast("Erro ao copiar todos os itens. Nenhuma c\u00f3pia foi mantida.");
            return false;
        }
    }
    await registerHistory(
        "VALORES_A_PAGAR",
        {
            id: newGroupId,
            codigo_tres: newGroupCode,
            item_count: 0
        },
        {
            solicitacao_id: newGroupId,
            solicitacao_codigo: newGroupCode,
            item_count: orderedItems.length,
            os: newOs,
            cliente_id: newClientId,
            processo_origem: group.codigo_tres
        },
        "PROCESSO_DUPLICADO"
    );
    showToast(
        orderedItems.length === 1
            ? "Processo duplicado com 1 item."
            : `Processo duplicado com ${orderedItems.length} itens.`
    );
    await loadLancamentos();
    return true;
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
        data_lancamento: "Data",
        os: "OS",
        servico: "Servi\u00e7o",
        subtipo: "Classifica\u00e7\u00e3o",
        fornecedor: "Fornecedor",
        hotel_direto: "Hotel direto",
        localizador: "Localizador",
        bilhete: "Bilhete",
        tarifa: "Tarifa",
        taxa_embarque: "Taxa de embarque",
        rc: "RC",
        over_percent: "Over",
        diaria: "Di\u00e1ria",
        valor_periodo: "Valor do per\u00edodo",
        taxas_tipo: "Tipo da taxa",
        taxas_valor: "Taxa",
        comissao_percent: "Comiss\u00e3o",
        tarifa_net: "Tarifa NET",
        checkin: "Check-in",
        checkout: "Check-out",
        quantidade_diarias: "Di\u00e1rias",
        total: "Total",
        total_final: "Total final",
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
    if ([
        "tarifa",
        "taxa_embarque",
        "rc",
        "diaria",
        "valor_periodo",
        "taxas_valor",
        "comissao_percent",
        "total",
        "total_final"
    ].includes(field)) {
        return money(Number(value || 0));
    }
    if (field === "over_percent") {
        return `${Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
    }
    if (field === "tarifa_net" || field === "hotel_direto") {
        return value ? "Sim" : "N\u00e3o";
    }
    return String(value);
}
function formatHistoryChanges(changes) {
    const hiddenFields = new Set([
        "updated_by",
        "created_by",
        "concluido_por",
        "concluido_em",
        "concluido_por_nome",
        "cambio"
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
    return currentItem?.created_at || currentItem?.data_lancamento;
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
    if (item.acao === "ITEM_ADICIONADO" || item.acao === "ITEM_EXCLUIDO") {
        const actorName = item.alterado_por_nome || "Usu\u00e1rio";
        const after = item.depois || {};
        const service = after.servico || "item";
        const total = after.total ? money(after.total, after.moeda || "BRL") : "";
        const verb = item.acao === "ITEM_ADICIONADO" ? "adicionou" : "excluiu";
        return {
            title: `${actorName} ${verb} item ${service}${total ? ` no valor ${total}` : ""}`,
            meta: formatTimelineDate(item.created_at),
            changes: ""
        };
    }
    const changes = cleanHistoryChanges(item.alteracoes || {});
    const actor = item.alterado_por_nome || "Usu\u00e1rio";
    let title = `Solicita\u00e7\u00e3o editada por ${actor}`;
    if (changes.status) {
        title = `Status atualizado para ${formatHistoryValue("status", changes.status.depois)} por ${actor}`;
    } else if (changes.emissor_id) {
        title = `Emissor alterado para ${formatHistoryValue("emissor_id", changes.emissor_id.depois)} por ${actor}`;
    } else if (item.acao === "ITEM_ADICIONADO") {
        title = `Item adicionado por ${actor}`;
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
    heading.textContent = title || "Hist\u00f3rico da solicita\u00e7\u00e3o";
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
function renderLancamentosQuietly() {
    const wrapper = financeTableBody.closest(".table-wrapper");
    wrapper?.classList.add("table-update-silent");
    renderLancamentos();
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            wrapper?.classList.remove("table-update-silent");
        });
    });
}
function renderLancamentos() {
    const filtered = getFilteredLancamentos();
    const pageSize = getFinancePageSize();
    updateFinancePagination(filtered.length);
    if (filtered.length === 0) {
        financeTableBody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-table-message">
                    Nenhum lan\u00e7amento encontrado.
                </td>
            </tr>
        `;
        completeSelectedButton.classList.add("hidden");
        return;
    }
    const visible = filtered.slice(
        (financeCurrentPage - 1) * pageSize,
        financeCurrentPage * pageSize
    );
    financeTableBody.innerHTML = visible.map(function (item) {
        const checked = selectedLancamentos.has(item.id) ? "checked" : "";
        const services = summarizeGroupServices(item);
        const suppliers = summarizeGroupSuppliers(item);
        return `
            <tr>
                <td>
                    <input
                        type="checkbox"
                        class="finance-checkbox"
                        data-id="${item.id}"
                        ${checked}>
                </td>
                <td>${item.codigo_tres || "-"}</td>
                <td>${item.data_lancamento || "-"}</td>
                <td>${item.emissor_nome || "-"}</td>
                <td>${item.os || "-"}</td>
                <td>${item.clientes?.nome || "-"}</td>
                <td>
                    <span class="finance-items-count">
                        ${item.item_count} ${item.item_count === 1 ? "item" : "itens"}
                    </span>
                </td>
                <td>
                    <div class="finance-service-summary">
                        <strong>${escapeHtml(services)}</strong>
                        <span>${escapeHtml(suppliers)}</span>
                    </div>
                </td>
                <td>${formatGroupTotal(item)}</td>
                <td>${statusBadge(item.status)}</td>
                <td>
                    <div class="action-buttons">
                        <button
                            class="icon-button"
                            data-action="details"
                            data-id="${item.id}"
                            title="Abrir detalhes">
                            <i data-lucide="eye"></i>
                        </button>
                        <button
                            class="icon-button"
                            data-action="add-item"
                            data-id="${item.id}"
                            title="Adicionar item nesta OS">
                            <i data-lucide="plus"></i>
                        </button>
                        <button
                            class="icon-button"
                            data-action="duplicate-group"
                            data-id="${item.id}"
                            title="Duplicar processo completo">
                            <i data-lucide="copy"></i>
                        </button>
                        <button
                            class="icon-button"
                            data-action="history"
                            data-id="${item.id}"
                            title="Hist\u00f3rico">
                            <i data-lucide="history"></i>
                        </button>
                        <button
                            class="icon-button"
                            data-action="complete"
                            data-id="${item.id}"
                            title="Concluir">
                            <i data-lucide="check"></i>
                        </button>
                        ${
                            isAdminOrMaster()
                                ? `
                                    <button
                                        class="icon-button danger-icon"
                                        data-action="delete-group"
                                        data-id="${item.id}"
                                        title="Excluir solicitação inteira">
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
        selectedLancamentos.size === 0
    );
    completeSelectedButton.innerHTML = `
        <i data-lucide="list-checks"></i>
        Alterar status (${selectedLancamentos.size})
    `;
    lucide.createIcons();
}
async function completeLancamento(id) {
    const group = findFinanceGroup(id);
    const itemIds = group?.itens.map(function (item) {
        return item.id;
    }) || [id];
    const before = group || lancamentos.find(function (item) {
        return String(item.id) === String(id);
    });
    const { error } = await supabaseClient
        .from("lancamentos")
        .update({
            status: "CONCLUIDO",
            concluido_por: currentUser.id,
            concluido_em: new Date().toISOString(),
            updated_by: currentUser.id
        })
        .in("id", itemIds);
    if (error) {
        console.error(error);
        showToast("Erro ao concluir lan\u00e7amento.");
        return;
    }
    showToast("Lan\u00e7amento conclu\u00eddo.");
    if (before) {
        await registerHistory(
            "VALORES_A_PAGAR",
            before,
            { ...before, status: "CONCLUIDO" },
            "STATUS"
        );
    }
    const updatedGroup = findFinanceGroup(id);
    updatedGroup?.itens.forEach(function (item) {
        item.status = "CONCLUIDO";
    });
    renderLancamentosQuietly();
}
async function deleteFinanceGroup(id, skipConfirm = false) {
    if (!isAdminOrMaster()) {
        showToast("Você não tem permissão para excluir lançamentos.");
        return;
    }
    const group = findFinanceGroup(id);
    if (!group) {
        showToast("N\u00e3o foi poss\u00edvel localizar a solicita\u00e7\u00e3o.");
        return;
    }
    const ok = skipConfirm || await confirmFinanceAction({
        title: "Excluir solicita\u00e7\u00e3o",
        message: `Deseja excluir ${group.codigo_tres || "esta solicita\u00e7\u00e3o"} e todos os ${group.item_count} item(ns)? Esta a\u00e7\u00e3o n\u00e3o poder\u00e1 ser desfeita.`
    });
    if (!ok) return;
    const itemIds = group.itens.map(function (item) {
        return item.id;
    });
    const { error } = await supabaseClient
        .from("lancamentos")
        .delete()
        .in("id", itemIds);
    if (error) {
        console.error(error);
        showToast("Erro ao excluir solicita\u00e7\u00e3o.");
        return;
    }
    selectedLancamentos.delete(group.id);
    showToast("Solicita\u00e7\u00e3o exclu\u00edda.");
    await loadLancamentos();
}
async function deleteFinanceItem(id) {
    if (!isAdminOrMaster()) {
        showToast("Você não tem permissão para excluir lançamentos.");
        return;
    }
    const item = lancamentos.find(function (lancamento) {
        return String(lancamento.id) === String(id);
    });
    if (!item) {
        showToast("N\u00e3o foi poss\u00edvel localizar o item.");
        return;
    }
    const group = findFinanceGroup(getFinanceGroupKey(item));
    if (group && group.item_count <= 1) {
        const okGroup = await confirmFinanceAction({
            title: "Excluir solicita\u00e7\u00e3o",
            message: "Esta solicita\u00e7\u00e3o possui apenas 1 item. Ao excluir o item, a solicita\u00e7\u00e3o inteira ser\u00e1 exclu\u00edda. Deseja continuar?"
        });
        if (!okGroup) return;
        await deleteFinanceGroup(group.id, true);
        return;
    }
    const ok = await confirmFinanceAction({
        title: "Excluir item",
        message: `Deseja excluir o item ${item.servico || ""} desta OS? Esta a\u00e7\u00e3o n\u00e3o poder\u00e1 ser desfeita.`
    });
    if (!ok) return;
    const { error } = await supabaseClient
        .from("lancamentos")
        .delete()
        .eq("id", id);
    if (error) {
        console.error(error);
        showToast("Erro ao excluir item.");
        return;
    }
    if (group) {
        await registerHistory(
            "VALORES_A_PAGAR",
            group,
            {
                ...group,
                item_count: Math.max(0, group.item_count - 1),
                servico: item.servico,
                fornecedor: item.fornecedor,
                total: item.total,
                moeda: item.moeda
            },
            "ITEM_EXCLUIDO"
        );
    }
    showToast("Item exclu\u00eddo.");
    closeFinanceDetails();
    await loadLancamentos();
}
function requestFinanceStatusSelection(count) {
    return new Promise(function (resolve) {
        const backdrop = document.createElement("div");
        backdrop.style.cssText = "position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.48);backdrop-filter:blur(2px)";
        backdrop.innerHTML = `
            <div role="dialog" aria-modal="true" style="width:min(360px,100%);border:1px solid #fecaca;border-radius:18px;padding:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.28)">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px">
                    <div>
                        <small style="color:#64748b;font-weight:700;text-transform:uppercase">Alterar status</small>
                        <strong style="display:block;margin-top:4px;color:#172033;font-size:16px">${count} solicitação(ões) selecionada(s)</strong>
                    </div>
                    <button type="button" data-close-status style="width:30px;height:30px;border:1px solid #dbe4ea;border-radius:9px;background:#fff;cursor:pointer">&times;</button>
                </div>
                <div style="display:grid;gap:7px">
                    <button type="button" data-status-choice="PENDENTE" style="min-height:40px;border:1px solid #fde68a;border-radius:11px;color:#92400e;background:#fffbeb;font:inherit;font-weight:600;cursor:pointer">Pendente</button>
                    <button type="button" data-status-choice="CONCLUIDO" style="min-height:40px;border:1px solid #bbf7d0;border-radius:11px;color:#166534;background:#f0fdf4;font:inherit;font-weight:600;cursor:pointer">Concluído</button>
                </div>
            </div>
        `;
        function finish(value) {
            document.removeEventListener("keydown", handleEscape);
            backdrop.remove();
            resolve(value);
        }
        function handleEscape(event) {
            if (event.key === "Escape") finish(null);
        }
        backdrop.addEventListener("click", function (event) {
            const option = event.target.closest("[data-status-choice]");
            if (option) return finish(option.dataset.statusChoice);
            if (event.target === backdrop || event.target.closest("[data-close-status]")) finish(null);
        });
        document.addEventListener("keydown", handleEscape);
        document.body.appendChild(backdrop);
    });
}
async function updateSelectedLancamentosStatus(status) {
    if (selectedLancamentos.size === 0) {
        return;
    }
    const selectedGroups = Array.from(selectedLancamentos)
        .map(findFinanceGroup)
        .filter(Boolean);
    const ids = selectedGroups.flatMap(function (group) {
        return group.itens.map(function (item) {
            return item.id;
        });
    });
    const beforeItems = selectedGroups;
    const payload = {
        status,
        updated_by: currentUser.id
    };
    if (status === "CONCLUIDO") {
        payload.concluido_por = currentUser.id;
        payload.concluido_em = new Date().toISOString();
    } else {
        payload.concluido_por = null;
        payload.concluido_em = null;
    }
    const { error } = await supabaseClient
        .from("lancamentos")
        .update(payload)
        .in("id", ids);
    if (error) {
        console.error(error);
        showToast("Erro ao alterar os status selecionados.");
        return;
    }
    for (const before of beforeItems) {
        await registerHistory(
            "VALORES_A_PAGAR",
            before,
            { ...before, ...payload },
            "STATUS"
        );
        before.itens.forEach(function (item) {
            Object.assign(item, payload);
        });
    }
    selectedLancamentos.clear();
    selectAllFinance.checked = false;
    showToast("Status dos lançamentos atualizado.");
    renderLancamentosQuietly();
}
tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const targetTab = button.dataset.tab;
        tabButtons.forEach(function (item) {
            item.classList.remove("active");
        });
        tabContents.forEach(function (content) {
            content.classList.remove("active");
        });
        button.classList.add("active");
        document.getElementById(targetTab).classList.add("active");
        if (targetTab === "allFinance") {
            loadLancamentos();
        }
    });
});
choiceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        selectedSubtype = button.dataset.subtipo;
        choiceButtons.forEach(function (item) {
            item.classList.remove("active");
        });
        button.classList.add("active");
        handleAereoFields();
    });
});
[
    servico,
    consolidador,
    tarifa,
    taxaEmbarque,
    rc,
    overPercent,
    diaria,
    valorPeriodo,
    taxasTipo,
    taxasValor,
    comissaoPercent,
    tarifaNet,
    checkin,
    checkout
].forEach(function (field) {
    field.addEventListener("input", function () {
        handleServiceChange();
        updateTotalPreview();
    });
    field.addEventListener("change", function () {
        handleServiceChange();
        updateTotalPreview();
    });
});
financeForm.addEventListener("submit", saveFinance);
clearFinanceForm.addEventListener("click", function () {
    financeForm.reset();
    resetFinanceForm();
});
if (cancelLinkedItemButton) {
    cancelLinkedItemButton.addEventListener("click", function () {
        financeForm.reset();
        resetFinanceForm();
        showToast("V\u00ednculo cancelado.");
    });
}
financeSearch.addEventListener("input", resetFinancePagination);
financeStartDate?.addEventListener("change", resetFinancePagination);
financeEndDate?.addEventListener("change", resetFinancePagination);
financeStatusFilter.addEventListener("change", resetFinancePagination);
if (financeClientFilter) {
    financeClientFilter.addEventListener("change", resetFinancePagination);
}
financeServiceFilter.addEventListener("change", resetFinancePagination);
financeSort?.addEventListener("change", resetFinancePagination);
if (financePageSize) {
    financePageSize.addEventListener("change", resetFinancePagination);
}
if (financePrevPage) {
    financePrevPage.addEventListener("click", function () {
        if (financeCurrentPage > 1) {
            financeCurrentPage -= 1;
            renderLancamentos();
        }
    });
}
if (financeNextPage) {
    financeNextPage.addEventListener("click", function () {
        financeCurrentPage += 1;
        renderLancamentos();
    });
}
if (refreshFinanceButton) {
    refreshFinanceButton.addEventListener("click", async function () {
        refreshFinanceButton.disabled = true;
        try {
            await loadLancamentos();
            showToast("Lan\u00e7amentos atualizados.");
        } finally {
            refreshFinanceButton.disabled = false;
            lucide.createIcons();
        }
    });
}
selectAllFinance.addEventListener("change", function () {
    selectedLancamentos.clear();
    if (selectAllFinance.checked) {
        getFilteredLancamentos().forEach(function (item) {
            selectedLancamentos.add(item.id);
        });
    }
    renderLancamentos();
});
financeTableBody.addEventListener("change", function (event) {
    const target = event.target;
    if (target.classList.contains("finance-checkbox")) {
        const id = target.dataset.id;
        if (target.checked) {
            selectedLancamentos.add(id);
        } else {
            selectedLancamentos.delete(id);
        }
        renderLancamentos();
    }
});
financeTableBody.addEventListener("click", async function (event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }
    if (button.dataset.action === "details") {
        openFinanceDetails(button.dataset.id);
    }
    if (button.dataset.action === "add-item") {
        addItemToFinanceGroup(button.dataset.id);
    }
    if (button.dataset.action === "duplicate-group") {
        openFinanceGroupDuplicateModal(button.dataset.id);
    }
    if (button.dataset.action === "history") {
        const group = findFinanceGroup(button.dataset.id);
        if (group) {
            await openHistory("VALORES_A_PAGAR", button.dataset.id, `Hist\u00f3rico ${group.codigo_tres || ""}`, group);
            return;
        }
        const item = lancamentos.find(function (lancamento) {
            return String(lancamento.id) === String(button.dataset.id);
        });
        await openHistory("VALORES_A_PAGAR", button.dataset.id, `Hist\u00f3rico ${item?.codigo_tres || ""}`, item);
    }
    if (button.dataset.action === "complete") {
        await completeLancamento(button.dataset.id);
    }
    if (button.dataset.action === "delete-group") {
        await deleteFinanceGroup(button.dataset.id);
    }
});
financeDetailClose.addEventListener("click", closeFinanceDetails);
financeDetailDone.addEventListener("click", closeFinanceDetails);
financeDetailContent.addEventListener("click", async function (event) {
    const button = event.target.closest("button");
    if (!button) {
        return;
    }
    if (button.dataset.action === "edit-detail-item") {
        closeFinanceDetails();
        editFinance(button.dataset.id);
    }
    if (button.dataset.action === "duplicate-detail-item") {
        closeFinanceDetails();
        duplicateFinance(button.dataset.id);
    }
    if (button.dataset.action === "delete-detail-item") {
        await deleteFinanceItem(button.dataset.id);
    }
});
financeDetailModal.addEventListener("click", function (event) {
    if (event.target === financeDetailModal) {
        closeFinanceDetails();
    }
});
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !financeDetailModal.classList.contains("hidden")) {
        closeFinanceDetails();
    }
});
completeSelectedButton.addEventListener("click", async function () {
    const status = await requestFinanceStatusSelection(selectedLancamentos.size);
    if (status) await updateSelectedLancamentosStatus(status);
});
logoutButton.addEventListener("click", async function () {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
});
initSidebarPersistence();
async function startFinanceModule() {
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
    if (financeStartDate) financeStartDate.value = firstDayOfMonthISO();
    if (financeEndDate) financeEndDate.value = todayISO();
    window.TRESDatePickers?.refresh();
    setupFinanceEmitterSelect();
    setupMoneyMasks();
    await loadUsersList();
    await loadClientes();
    resetFinanceForm();
    await loadLancamentos();
    lucide.createIcons();
}
startFinanceModule();
