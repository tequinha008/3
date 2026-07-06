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
const financeServiceFilter = document.getElementById("financeServiceFilter");
const financeTableBody = document.getElementById("financeTableBody");
const selectAllFinance = document.getElementById("selectAllFinance");
const completeSelectedButton = document.getElementById("completeSelectedButton");
const financeDetailModal = document.getElementById("financeDetailModal");
const financeDetailTitle = document.getElementById("financeDetailTitle");
const financeDetailContent = document.getElementById("financeDetailContent");
const financeDetailClose = document.getElementById("financeDetailClose");
const financeDetailDone = document.getElementById("financeDetailDone");

const toast = document.getElementById("toast");

const financeDeleteModal = document.getElementById("financeDeleteModal");
const financeDeleteText = document.getElementById("financeDeleteText");
const cancelDeleteFinance = document.getElementById("cancelDeleteFinance");
const confirmDeleteFinance = document.getElementById("confirmDeleteFinance");
const rowsPerPage = 10;

let financeToDelete = null;
let currentUser = null;
let currentProfile = null;
let selectedSubtype = "AEREO";
let lancamentos = [];
let selectedLancamentos = new Set();
let currentPage = 1;


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
    return Number(input.value || 0);
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

    data.forEach(function (item) {
        cliente.innerHTML += `
            <option value="${item.id}">
                ${item.nome}
            </option>
        `;
    });
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

function resetFinanceForm() {
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
}

async function loadLancamentos() {
    const { data, error } = await supabaseClient
        .from("lancamentos")
        .select(`
            id,
            codigo_tres,
            usuarios:emissor_id (nome),
            data_lancamento,
            tipo,
            os,
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
            clientes:cliente_id (nome)
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);
        financeTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-table-message">
                    Erro ao carregar lançamentos.
                </td>
            </tr>
        `;
        return;
    }

    lancamentos = data || [];
    renderLancamentos();
}

function getFilteredLancamentos() {
    const search = normalizeText(financeSearch.value);
    const status = financeStatusFilter.value;
    const service = financeServiceFilter.value;

    return lancamentos.filter(function (item) {
        const matchSearch =
            !search ||
            normalizeText(item.os).includes(search) ||
            normalizeText(item.fornecedor).includes(search) ||
            normalizeText(item.servico).includes(search);

        const matchStatus = !status || item.status === status;
        const matchService = !service || item.servico === service;

        return matchSearch && matchStatus && matchService;
    });
}

function statusBadge(status) {
    if (status === "CONCLUIDO") {
        return `<span class="badge badge-concluido">CONCLUÍDO</span>`;
    }

    return `<span class="badge badge-pendente">PENDENTE</span>`;
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

function renderLancamentos() {
    const filtered = getFilteredLancamentos();

    if (filtered.length === 0) {
        financeTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-table-message">
                    Nenhum lançamento encontrado.
                </td>
            </tr>
        `;
        return;
    }

    financeTableBody.innerHTML = filtered.map(function (item) {
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
                <td>${item.usuarios?.nome || "-"}</td>
                <td>${item.data_lancamento || "-"}</td>
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
                            data-action="complete"
                            data-id="${item.id}"
                            title="Concluir">
                            <i data-lucide="check"></i>
                        </button>
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
        selectedLancamentos.size === 0
    );

    lucide.createIcons();
}

async function completeLancamento(id) {
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

financeSearch.addEventListener("input", renderLancamentos);
financeStatusFilter.addEventListener("change", renderLancamentos);
financeServiceFilter.addEventListener("change", renderLancamentos);

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

function openDeleteFinanceModal(id) {
    const item = lancamentos.find(lancamento => lancamento.id === id);

    financeToDelete = id;

    financeDeleteText.textContent = `Deseja excluir ${item?.codigo_tres || "este lançamento"}? Esta ação não poderá ser desfeita.`;

    financeDeleteModal.classList.remove("hidden");
    lucide.createIcons();
}

function closeDeleteFinanceModal() {
    financeToDelete = null;
    financeDeleteModal.classList.add("hidden");
}

async function deleteFinanceConfirmed() {
    if (!financeToDelete) return;

    const { error } = await supabaseClient
        .from("lancamentos")
        .delete()
        .eq("id", financeToDelete);

    if (error) {
        console.error(error);
        showToast("Erro ao excluir lançamento.");
        return;
    }

    selectedLancamentos.delete(financeToDelete);
    closeDeleteFinanceModal();

    showToast("Lançamento excluído.");
    await loadLancamentos();
}

financeTableBody.addEventListener("click", async function (event) {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.action === "details") {
        openFinanceDetails(button.dataset.id);
    }

    if (button.dataset.action === "complete") {
        await completeLancamento(button.dataset.id);
    }
    if (button.dataset.action === "delete") {
    openDeleteFinanceModal(button.dataset.id);
    }
});

cancelDeleteFinance.addEventListener("click", closeDeleteFinanceModal);
confirmDeleteFinance.addEventListener("click", deleteFinanceConfirmed);

financeDeleteModal.addEventListener("click", function (event) {
    if (event.target === financeDeleteModal) {
        closeDeleteFinanceModal();
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

    await loadClientes();

    resetFinanceForm();

    await loadLancamentos();

    lucide.createIcons();
}

startFinanceModule();
