lucide.createIcons();

const sidebar = document.querySelector(".sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");

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

const checkinField = document.getElementById("checkinField");
const checkin = document.getElementById("checkin");

const checkoutField = document.getElementById("checkoutField");
const checkout = document.getElementById("checkout");

const totalPreview = document.getElementById("totalPreview");
const moedaPreview = document.getElementById("moedaPreview");

const clearFinanceForm = document.getElementById("clearFinanceForm");
const saveFinanceButton = document.getElementById("saveFinanceButton");

const financeSearch = document.getElementById("financeSearch");
const financeStatusFilter = document.getElementById("financeStatusFilter");
const financeClientFilter = document.getElementById("financeClientFilter");
const financeServiceFilter = document.getElementById("financeServiceFilter");
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

const toast = document.getElementById("toast");

let currentUser = null;
let currentProfile = null;
let selectedSubtype = "AEREO";
let lancamentos = [];
let selectedLancamentos = new Set();
let financeCurrentPage = 1;
let editingFinanceId = null;
let editingFinanceOriginal = null;
let allUsers = [];

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function money(value, currency = "BRL") {
    const number = Number(value || 0);

    return number.toLocaleString("pt-BR", {
        style: "currency",
        currency: currency === "USD" ? "USD" : "BRL"
    });
}

function normalizeText(value) {
    return String(value || "").trim().toUpperCase();
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
    [tarifa, taxaEmbarque, rc, overPercent, diaria, valorPeriodo, taxasValor].forEach(function (field) {
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
    const { data, error } = await supabaseClient
        .from("clientes")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome");

    if (error) {
        console.error(error);
        return;
    }

    cliente.innerHTML = `<option value="">Selecione</option>`;

    if (financeClientFilter) {
        financeClientFilter.innerHTML = `<option value="">Todos os clientes</option>`;
    }

    data.forEach(function (item) {
        cliente.innerHTML += `
            <option value="${item.id}">
                ${item.nome}
            </option>
        `;

        if (financeClientFilter) {
            financeClientFilter.innerHTML += `
                <option value="${item.id}">
                    ${item.nome}
                </option>
            `;
        }
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

function hideAllDynamicFields() {
    [
        outroServicoField,
        aereoSubtypeField,
        consolidadorField,
        fornecedorField,
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
    ].forEach(function (field) {
        field.classList.add("hidden");
    });
}

function showField(field) {
    field.classList.remove("hidden");
}

function handleServiceChange() {
    hideAllDynamicFields();

    const selectedService = servico.value;

    [diaria, checkin, checkout, valorPeriodo, outroServico].forEach(function (field) {
        field.required = false;
    });

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
        showField(diariaField);
        showField(taxasTipoField);
        showField(taxasValorField);
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
            return (valorDiaria + taxaCalculada) * qtdDiarias;
        }

        return (valorDiaria + valorTaxa) * qtdDiarias;
    }

    const totalPeriodo = numberValue(valorPeriodo);

    if (taxasTipo.value === "%") {
        return totalPeriodo + (totalPeriodo * (valorTaxa / 100));
    }

    return totalPeriodo + valorTaxa;
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
        showToast("Lançamento salvo com sucesso.");
        financeForm.reset();
        resetFinanceForm();
        await loadLancamentos();
    }

    saveFinanceButton.disabled = false;
    saveFinanceButton.textContent = "Salvar lançamento";
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
        return `<option value="${user.id}">${escapeHtml(user.nome || user.email || "Usuário")}</option>`;
    }).join("");

    financeEmitterSelect.value = selectedId || currentUser.id;
    financeEmitterSelect.classList.toggle("hidden", currentProfile?.perfil !== "master" || !editingFinanceId);
    emissorNome.classList.toggle("hidden", currentProfile?.perfil === "master" && Boolean(editingFinanceId));
}

function getSelectedFinanceEmitter() {
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
        emissor_id: editingFinanceId ? emitter.id : currentUser.id,
        tipo: tipoLancamento.value,
        os: normalizeText(os.value),
        cliente_id: cliente.value,
        servico: finalService,
        subtipo: isAirService ? selectedSubtype : null,
        outro_servico: selectedService === "OUTROS" ? normalizeText(outroServico.value) : null,
        consolidador: isAirService ? consolidador.value || null : null,
        fornecedor: normalizeText(fornecedor.value),
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

async function saveFinance(event) {
    event.preventDefault();

    saveFinanceButton.disabled = true;
    saveFinanceButton.textContent = "Salvando...";

    const payload = buildFinancePayload();
    let error = null;

    if (editingFinanceId) {
        payload.concluido_por = null;
        payload.concluido_em = null;

        const result = await supabaseClient
            .from("lancamentos")
            .update(payload)
            .eq("id", editingFinanceId);

        error = result.error;

        if (!error) {
            await registerHistory(
                "VALORES_A_PAGAR",
                editingFinanceOriginal,
                { ...editingFinanceOriginal, ...payload },
                "EDIÇÃO"
            );
        }
    } else {
        payload.created_by = currentUser.id;

        const result = await supabaseClient
            .from("lancamentos")
            .insert(payload)
            .select("id")
            .single();

        error = result.error;
    }

    if (error) {
        console.error(error);
        showToast(`Erro ao salvar: ${error.message}`);
    } else {
        showToast(editingFinanceId ? "Lançamento atualizado e voltou para pendente." : "Lançamento salvo com sucesso.");
        financeForm.reset();
        resetFinanceForm();
        await loadLancamentos();
    }

    saveFinanceButton.disabled = false;
    saveFinanceButton.textContent = "Salvar lançamento";
}

function resetFinanceForm() {
    editingFinanceId = null;
    editingFinanceOriginal = null;
    dataLancamento.value = todayISO();
    emissorNome.value = currentProfile.nome;
    tipoLancamento.value = "NACIONAL";
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
    saveFinanceButton.textContent = "Salvar lançamento";
    fillFinanceEmitterSelect(currentUser.id);
}

async function loadLancamentos() {
    const { data, error } = await supabaseClient
        .from("lancamentos")
        .select(`
            id,
            codigo_tres,
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
                    Erro ao carregar lançamentos.
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
    const status = financeStatusFilter.value;
    const client = financeClientFilter?.value || "";
    const service = financeServiceFilter.value;

    return lancamentos.filter(function (item) {
        const matchSearch =
            !search ||
            normalizeText(item.os).includes(search) ||
            normalizeText(item.fornecedor).includes(search) ||
            normalizeText(item.servico).includes(search);

        const matchStatus = !status || item.status === status;
        const matchClient = !client || String(item.cliente_id) === String(client);
        const matchService = !service || item.servico === service;

        return matchSearch && matchStatus && matchClient && matchService;
    });
}

function statusBadge(status) {
    if (status === "CONCLUIDO") {
        return `<span class="badge badge-concluido">CONCLUÍDO</span>`;
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
        financePageIndicator.textContent = `Página ${financeCurrentPage} de ${totalPages}`;
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
        return "—";
    }

    return escapeHtml(value);
}

function detailMoney(value, currency) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    return money(value, currency);
}

function detailDate(value) {
    if (!value) {
        return "—";
    }

    const parts = String(value).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
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
    document.body.classList.remove("finance-detail-open");
}

function openFinanceDetails(id) {
    const item = lancamentos.find(function (lancamento) {
        return String(lancamento.id) === String(id);
    });

    if (!item) {
        showToast("Não foi possível carregar os detalhes.");
        return;
    }

    const isAir = ["AEREO", "ASSENTO", "BAGAGEM EXTRA"].includes(item.servico);
    const currency = item.moeda || "BRL";
    const details = [
        detailItem("Código", detailValue(item.codigo_tres)),
        detailItem("Data", detailDate(item.data_lancamento)),
        detailItem("Status", detailValue(item.status)),
        detailItem("Cliente", detailValue(item.clientes?.nome), "wide"),
        detailItem("OS", detailValue(item.os)),
        detailItem("Tipo", detailValue(item.tipo)),
        detailItem("Serviço", detailValue(item.servico)),
        detailItem("Fornecedor", detailValue(item.fornecedor), "wide")
    ];

    if (isAir) {
        details.push(
            detailItem("Classificação", detailValue(item.subtipo)),
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
                    ? "—"
                    : `${Number(item.over_percent).toLocaleString("pt-BR")} %`
            ),
            detailItem(
                "Câmbio",
                item.cambio === null || item.cambio === undefined
                    ? "—"
                    : Number(item.cambio).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6
                    })
            )
        );
    } else if (item.servico === "HOTEL") {
        details.push(
            detailItem("Diária", detailMoney(item.diaria, "BRL")),
            detailItem("Tipo da taxa", detailValue(item.taxas_tipo)),
            detailItem(
                "Taxas / impostos",
                item.taxas_tipo === "%"
                    ? `${Number(item.taxas_valor || 0).toLocaleString("pt-BR")} %`
                    : detailMoney(item.taxas_valor, "BRL")
            ),
            detailItem("Check-in", detailDate(item.checkin)),
            detailItem("Check-out", detailDate(item.checkout)),
            detailItem("Quantidade de diárias", detailValue(item.quantidade_diarias))
        );
    } else {
        if (item.servico === "OUTROS") {
            details.push(
                detailItem("Descrição do serviço", detailValue(item.outro_servico), "wide")
            );
        }

        details.push(
            detailItem("Valor total do período", detailMoney(item.valor_periodo, "BRL")),
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

    financeDetailTitle.textContent = `${item.codigo_tres || "Lançamento"} · ${item.servico || "Detalhes"}`;
    financeDetailContent.innerHTML = details.join("");
    financeDetailModal.classList.remove("hidden");
    financeDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("finance-detail-open");
    financeDetailClose.focus();
}

function setMoneyField(input, value) {
    input.value = value === null || value === undefined ? "" : formatMoneyInput(value);
}

function editFinance(id) {
    const item = lancamentos.find(function (lancamento) {
        return String(lancamento.id) === String(id);
    });

    if (!item) {
        showToast("Não foi possível abrir a edição.");
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
    checkin.value = item.checkin || "";
    checkout.value = item.checkout || "";

    handleServiceChange();
    updateTotalPreview();
    fillFinanceEmitterSelect(item.emissor_id);

    tabButtons.forEach(function (button) {
        if (button.dataset.tab === "newFinance") {
            button.click();
        }
    });

    saveFinanceButton.textContent = "Salvar alterações";
    showToast("Editando lançamento. Ao salvar, ele voltará para PENDENTE.");
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
        data_lancamento: "Data",
        os: "OS",
        servico: "Serviço",
        subtipo: "Classificação",
        fornecedor: "Fornecedor",
        localizador: "Localizador",
        bilhete: "Bilhete",
        tarifa: "Tarifa",
        taxa_embarque: "Taxa de embarque",
        rc: "RC",
        over_percent: "Over",
        diaria: "Diária",
        valor_periodo: "Valor do período",
        taxas_tipo: "Tipo da taxa",
        taxas_valor: "Taxa",
        checkin: "Check-in",
        checkout: "Check-out",
        quantidade_diarias: "Diárias",
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

    if ([
        "tarifa",
        "taxa_embarque",
        "rc",
        "diaria",
        "valor_periodo",
        "taxas_valor",
        "total",
        "total_final"
    ].includes(field)) {
        return money(Number(value || 0));
    }

    if (field === "over_percent") {
        return `${Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
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
    if (!value) return "Data não informada";
    return new Date(value).toLocaleString("pt-BR");
}

function getCreationDate(currentItem) {
    return currentItem?.created_at || currentItem?.data_lancamento;
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

function renderLancamentos() {
    const filtered = getFilteredLancamentos();
    const pageSize = getFinancePageSize();

    updateFinancePagination(filtered.length);

    if (filtered.length === 0) {
        financeTableBody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-table-message">
                    Nenhum lançamento encontrado.
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
                <td>${item.servico || "-"}</td>
                <td>${item.fornecedor || "-"}</td>
                <td>${money(item.total, item.moeda)}</td>
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
                            data-action="edit"
                            data-id="${item.id}"
                            title="Editar lançamento">
                            <i data-lucide="pencil"></i>
                        </button>

                        <button
                            class="icon-button"
                            data-action="history"
                            data-id="${item.id}"
                            title="Histórico">
                            <i data-lucide="history"></i>
                        </button>

                        <button
                            class="icon-button"
                            data-action="complete"
                            data-id="${item.id}"
                            title="Concluir">
                            <i data-lucide="check"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");

    completeSelectedButton.classList.toggle(
        "hidden",
        selectedLancamentos.size === 0
    );

    lucide.createIcons();
}

async function completeLancamento(id) {
    const before = lancamentos.find(function (item) {
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
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("Erro ao concluir lançamento.");
        return;
    }

    showToast("Lançamento concluído.");
    if (before) {
        await registerHistory(
            "VALORES_A_PAGAR",
            before,
            { ...before, status: "CONCLUIDO" },
            "STATUS"
        );
    }

    await loadLancamentos();
}

async function completeSelectedLancamentos() {
    if (selectedLancamentos.size === 0) {
        return;
    }

    const confirmAction = confirm(
        `Deseja concluir ${selectedLancamentos.size} lançamento(s)?`
    );

    if (!confirmAction) {
        return;
    }

    const ids = Array.from(selectedLancamentos);
    const beforeItems = lancamentos.filter(function (item) {
        return ids.map(String).includes(String(item.id));
    });

    const { error } = await supabaseClient
        .from("lancamentos")
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
            "VALORES_A_PAGAR",
            before,
            { ...before, status: "CONCLUIDO" },
            "STATUS"
        );
    }

    selectedLancamentos.clear();
    selectAllFinance.checked = false;
    showToast("Lançamentos concluídos.");
    await loadLancamentos();
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

financeSearch.addEventListener("input", resetFinancePagination);
financeStatusFilter.addEventListener("change", resetFinancePagination);
if (financeClientFilter) {
    financeClientFilter.addEventListener("change", resetFinancePagination);
}
financeServiceFilter.addEventListener("change", resetFinancePagination);

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
            showToast("Lançamentos atualizados.");
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

    if (button.dataset.action === "edit") {
        editFinance(button.dataset.id);
    }

    if (button.dataset.action === "history") {
        const item = lancamentos.find(function (lancamento) {
            return String(lancamento.id) === String(button.dataset.id);
        });
        await openHistory("VALORES_A_PAGAR", button.dataset.id, `Histórico ${item?.codigo_tres || ""}`, item);
    }

    if (button.dataset.action === "complete") {
        await completeLancamento(button.dataset.id);
    }
});

financeDetailClose.addEventListener("click", closeFinanceDetails);
financeDetailDone.addEventListener("click", closeFinanceDetails);

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

completeSelectedButton.addEventListener("click", completeSelectedLancamentos);

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

async function startFinanceModule() {
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

    setupFinanceEmitterSelect();
    setupMoneyMasks();
    await loadUsersList();
    await loadClientes();

    resetFinanceForm();

    await loadLancamentos();

    lucide.createIcons();
}

startFinanceModule();
