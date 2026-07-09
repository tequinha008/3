lucide.createIcons();

const avatar = document.getElementById("avatar");
const userName = document.getElementById("userName");
const userRole = document.getElementById("userRole");
const logoutButton = document.getElementById("logoutButton");

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

const hotelForm = document.getElementById("hotelForm");
const dataSolicitacao = document.getElementById("dataSolicitacao");
const emissorNome = document.getElementById("emissorNome");
const nomeHotel = document.getElementById("nomeHotel");
const ruaNumero = document.getElementById("ruaNumero");
const bairro = document.getElementById("bairro");
const cidadeEstado = document.getElementById("cidadeEstado");
const pais = document.getElementById("pais");
const tipoHotel = document.getElementById("tipoHotel");
const cnpj = document.getElementById("cnpj");
const cnpjMessage = document.getElementById("cnpjMessage");
const clearHotelForm = document.getElementById("clearHotelForm");
const saveHotelButton = document.getElementById("saveHotelButton");

const hotelSearch = document.getElementById("hotelSearch");
const statusFilter = document.getElementById("statusFilter");
const tipoFilter = document.getElementById("tipoFilter");
const hotelTableBody = document.getElementById("hotelTableBody");
const selectAllHotels = document.getElementById("selectAllHotels");
const completeSelectedButton = document.getElementById("completeSelectedButton");
const refreshHotelsButton = document.getElementById("refreshHotelsButton");
const hotelPaginationInfo = document.getElementById("hotelPaginationInfo");
const hotelPageSize = document.getElementById("hotelPageSize");
const hotelPrevPage = document.getElementById("hotelPrevPage");
const hotelNextPage = document.getElementById("hotelNextPage");
const hotelPageIndicator = document.getElementById("hotelPageIndicator");
const toast = document.getElementById("toast");
const hotelDetailModal = document.getElementById("hotelDetailModal");
const hotelDetailTitle = document.getElementById("hotelDetailTitle");
const hotelDetailContent = document.getElementById("hotelDetailContent");
const hotelDetailClose = document.getElementById("hotelDetailClose");
const hotelDetailDone = document.getElementById("hotelDetailDone");

let currentUser = null;
let currentProfile = null;
let hotels = [];
let selectedHotels = new Set();
let hotelCurrentPage = 1;
let editingHotelId = null;
let editingHotelOriginal = null;
let allUsers = [];
let hotelEmitterSelect = null;

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function onlyNumbers(value) {
    return String(value || "").replace(/\D/g, "");
}

function normalizeText(value) {
    return String(value || "").trim().toUpperCase();
}

function normalizeSearchText(value) {
    return normalizeText(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ");
}

function formatCNPJ(value) {
    const numbers = onlyNumbers(value);

    if (!numbers) {
        return "";
    }

    return numbers
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.remove("hidden");

    setTimeout(function () {
        toast.classList.add("hidden");
    }, 3000);
}

function showError(message) {
    cnpjMessage.textContent = message;
}

function clearError() {
    cnpjMessage.textContent = "";
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

function setupTabs() {
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

            if (targetTab === "allHotels") {
                loadHotels();
            }
        });
    });
}

async function generateHotelCode() {
    const { count } = await supabaseClient
        .from("solicitacoes_hotel")
        .select("*", {
            count: "exact",
            head: true
        });

    const nextNumber = (count || 0) + 1;

    return `HOT${String(nextNumber).padStart(6, "0")}`;
}

async function checkDuplicateCNPJ(cnpjNumbers) {
    if (!cnpjNumbers) {
        return null;
    }

    const { data, error } = await supabaseClient
        .from("solicitacoes_hotel")
        .select("id, codigo_tres, nome_hotel, cidade_estado, codigo_integracao")
        .eq("cnpj", cnpjNumbers)
        .maybeSingle();

    if (error) {
        return null;
    }

    return data;
}

async function validateCNPJBeforeSave() {
    clearError();

    if (tipoHotel.value === "INTERNACIONAL") {
        return true;
    }

    const cnpjNumbers = onlyNumbers(cnpj.value);

    if (!cnpjNumbers) {
        showError("CNPJ é obrigatório para hotéis nacionais.");
        return false;
    }

    if (cnpjNumbers.length !== 14) {
        showError("Informe um CNPJ válido com 14 números.");
        return false;
    }

    const duplicate = await checkDuplicateCNPJ(cnpjNumbers);

    if (duplicate) {
        if (editingHotelId && String(duplicate.id) === String(editingHotelId)) {
            return true;
        }

        showError(
            `Este CNPJ já existe no sistema: ${duplicate.codigo_tres || "sem código"} - ${duplicate.nome_hotel}.`
        );

        return false;
    }

    return true;
}

function handleTipoChange() {
    clearError();

    if (tipoHotel.value === "INTERNACIONAL") {
        cnpj.value = "";
        cnpj.disabled = true;
        cnpj.placeholder = "Não obrigatório para internacional";
        pais.value = pais.value === "Brasil" ? "" : pais.value;
    } else {
        cnpj.disabled = false;
        cnpj.placeholder = "00.000.000/0000-00";

        if (!pais.value) {
            pais.value = "Brasil";
        }
    }
}

async function saveHotel(event) {
    event.preventDefault();

    saveHotelButton.disabled = true;
    saveHotelButton.textContent = "Salvando...";

    const validCNPJ = await validateCNPJBeforeSave();

    if (!validCNPJ) {
        saveHotelButton.disabled = false;
        saveHotelButton.textContent = "Salvar solicitação";
        return;
    }

    const codigoTres = await generateHotelCode();

    const payload = {
        codigo_tres: codigoTres,
        data_solicitacao: dataSolicitacao.value,
        emissor_id: currentUser.id,
        emissor_nome: currentProfile.nome,
        nome_hotel: normalizeText(nomeHotel.value),
        rua_numero: normalizeText(ruaNumero.value),
        bairro: normalizeText(bairro.value),
        cidade_estado: normalizeText(cidadeEstado.value),
        pais: normalizeText(pais.value),
        tipo: tipoHotel.value,
        cnpj: tipoHotel.value === "NACIONAL" ? onlyNumbers(cnpj.value) : null,
        status: "PENDENTE",
        created_by: currentUser.id,
        updated_by: currentUser.id
    };

    const { error } = await supabaseClient
        .from("solicitacoes_hotel")
        .insert(payload);

    if (error) {
        console.error(error);
        showToast("Erro ao salvar solicitação.");
    } else {
        showToast("Solicitação cadastrada com sucesso.");

        hotelForm.reset();

        dataSolicitacao.value = todayISO();
        emissorNome.value = currentProfile.nome;
        pais.value = "Brasil";
        tipoHotel.value = "NACIONAL";

        handleTipoChange();
        await loadHotels();
    }

    saveHotelButton.disabled = false;
    saveHotelButton.textContent = "Salvar solicitação";
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

function setupHotelEmitterSelect() {
    if (hotelEmitterSelect || !emissorNome?.parentElement) {
        return;
    }

    hotelEmitterSelect = document.createElement("select");
    hotelEmitterSelect.id = "hotelEmitterSelect";
    hotelEmitterSelect.className = "hidden";
    emissorNome.parentElement.appendChild(hotelEmitterSelect);
}

function fillHotelEmitterSelect(selectedId) {
    if (!hotelEmitterSelect) return;

    hotelEmitterSelect.innerHTML = allUsers.map(function (user) {
        return `<option value="${user.id}">${escapeHtml(user.nome || user.email || "Usuário")}</option>`;
    }).join("");

    hotelEmitterSelect.value = selectedId || currentUser.id;
    hotelEmitterSelect.classList.toggle("hidden", currentProfile?.perfil !== "master" || !editingHotelId);
    emissorNome.classList.toggle("hidden", currentProfile?.perfil === "master" && Boolean(editingHotelId));
}

function getSelectedHotelEmitter() {
    if (currentProfile?.perfil === "master" && editingHotelId && hotelEmitterSelect?.value) {
        return {
            id: hotelEmitterSelect.value,
            nome: hotelEmitterSelect.selectedOptions?.[0]?.textContent?.trim() || currentProfile.nome
        };
    }

    return {
        id: currentUser.id,
        nome: currentProfile.nome
    };
}

function buildHotelPayload() {
    const emitter = getSelectedHotelEmitter();

    return {
        data_solicitacao: dataSolicitacao.value,
        emissor_id: editingHotelId ? emitter.id : currentUser.id,
        emissor_nome: editingHotelId ? emitter.nome : currentProfile.nome,
        nome_hotel: normalizeText(nomeHotel.value),
        rua_numero: normalizeText(ruaNumero.value),
        bairro: normalizeText(bairro.value),
        cidade_estado: normalizeText(cidadeEstado.value),
        pais: normalizeText(pais.value),
        tipo: tipoHotel.value,
        cnpj: tipoHotel.value === "NACIONAL" ? onlyNumbers(cnpj.value) : null,
        status: "PENDENTE",
        updated_by: currentUser.id
    };
}

function shouldIgnoreHistoryField(key) {
    return ["updated_by", "created_by", "concluido_por", "concluido_em", "concluido_por_nome"].includes(key);
}

function normalizedHistoryValue(key, value) {
    if (value === undefined || value === "") return null;
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

async function saveHotel(event) {
    event.preventDefault();

    saveHotelButton.disabled = true;
    saveHotelButton.textContent = "Salvando...";

    const validCNPJ = await validateCNPJBeforeSave();

    if (!validCNPJ) {
        saveHotelButton.disabled = false;
        saveHotelButton.textContent = editingHotelId ? "Salvar alterações" : "Salvar solicitação";
        return;
    }

    const payload = buildHotelPayload();
    let error = null;

    if (editingHotelId) {
        payload.concluido_por = null;
        payload.concluido_por_nome = null;
        payload.concluido_em = null;

        const result = await supabaseClient
            .from("solicitacoes_hotel")
            .update(payload)
            .eq("id", editingHotelId);

        error = result.error;

        if (!error) {
            await registerHistory(
                "HOTEIS",
                editingHotelOriginal,
                { ...editingHotelOriginal, ...payload },
                "EDIÇÃO"
            );
        }
    } else {
        payload.codigo_tres = await generateHotelCode();
        payload.created_by = currentUser.id;

        const result = await supabaseClient
            .from("solicitacoes_hotel")
            .insert(payload);

        error = result.error;
    }

    if (error) {
        console.error(error);
        showToast("Erro ao salvar solicitação.");
    } else {
        showToast(editingHotelId ? "Solicitação atualizada e voltou para pendente." : "Solicitação cadastrada com sucesso.");
        hotelForm.reset();
        resetHotelForm();
        await loadHotels();
    }

    saveHotelButton.disabled = false;
    saveHotelButton.textContent = "Salvar solicitação";
}

async function loadHotels() {
    const { data, error } = await supabaseClient
        .from("solicitacoes_hotel")
        .select(`
            id,
            codigo_tres,
            data_solicitacao,
            emissor_id,
            nome_hotel,
            rua_numero,
            bairro,
            cidade_estado,
            pais,
            tipo,
            cnpj,
            codigo_integracao,
            status,
            emissor_nome,
            concluido_por_nome,
            concluido_em,
            created_by,
            created_at
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        hotelTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-table-message">
                    Erro ao carregar solicitações.
                </td>
            </tr>
        `;

        console.error(error);
        return;
    }

    hotels = await attachHotelEmitterNames(data || []);
    renderHotels();
}

async function attachHotelEmitterNames(items) {
    const missingEmitterIds = Array.from(new Set(
        items
            .filter(function (item) { return !item.emissor_nome && item.emissor_id; })
            .map(function (item) { return item.emissor_id; })
    ));

    if (missingEmitterIds.length === 0) {
        return items;
    }

    const { data, error } = await supabaseClient
        .from("usuarios")
        .select("id, nome")
        .in("id", missingEmitterIds);

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
            emissor_nome: item.emissor_nome || namesById.get(item.emissor_id) || null
        };
    });
}
function getFilteredHotels() {

    const search = normalizeSearchText(hotelSearch.value);
    const searchNumbers = onlyNumbers(hotelSearch.value);
    const status = statusFilter.value;
    const tipo = tipoFilter.value;

    return hotels.filter(function (hotel) {

        const searchableText = [
            hotel.codigo_tres,
            hotel.emissor_nome,
            hotel.nome_hotel,
            hotel.rua_numero,
            hotel.bairro,
            hotel.cidade_estado,
            hotel.pais,
            hotel.tipo,
            hotel.codigo_integracao
        ].map(normalizeSearchText).join(" ");

        const searchTerms = search.split(" ").filter(Boolean);
        const matchText =
            !search ||
            searchableText.includes(search) ||
            searchTerms.every(function (term) {
                return searchableText.includes(term);
            });

        const matchCnpj =
            searchNumbers &&
            onlyNumbers(hotel.cnpj).includes(searchNumbers);

        const matchSearch =
            !search ||
            matchText ||
            matchCnpj;

        const matchStatus =
            !status || hotel.status === status;

        const matchTipo =
            !tipo || hotel.tipo === tipo;

        return matchSearch && matchStatus && matchTipo;

    });

}

function statusBadge(status) {

    switch (status) {

        case "CONCLUIDO":
            return `<span class="badge badge-concluido">CONCLUÍDO</span>`;

        case "JA_CADASTRADO":
            return `<span class="badge badge-ja-cadastrado">JÁ CADASTRADO</span>`;

        default:
            return `<span class="badge badge-pendente">PENDENTE</span>`;

    }

}

function resetHotelPagination() {
    hotelCurrentPage = 1;
    renderHotels();
}

function getHotelPageSize() {
    return Number(hotelPageSize?.value || 10);
}

function updateHotelPagination(totalItems) {
    const pageSize = getHotelPageSize();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    if (hotelCurrentPage > totalPages) {
        hotelCurrentPage = totalPages;
    }

    const start = totalItems === 0 ? 0 : ((hotelCurrentPage - 1) * pageSize) + 1;
    const end = Math.min(totalItems, hotelCurrentPage * pageSize);

    if (hotelPaginationInfo) {
        hotelPaginationInfo.textContent = `Mostrando ${start}-${end} de ${totalItems}`;
    }

    if (hotelPageIndicator) {
        hotelPageIndicator.textContent = `Página ${hotelCurrentPage} de ${totalPages}`;
    }

    if (hotelPrevPage) {
        hotelPrevPage.disabled = hotelCurrentPage <= 1;
    }

    if (hotelNextPage) {
        hotelNextPage.disabled = hotelCurrentPage >= totalPages;
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
    return value === null || value === undefined || value === ""
        ? "—"
        : escapeHtml(value);
}

function detailDate(value, includeTime = false) {
    if (!value) return "—";

    if (includeTime) {
        return new Date(value).toLocaleString("pt-BR");
    }

    const parts = String(value).split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : escapeHtml(value);
}

function hotelDetailItem(label, value, className = "") {
    return `
        <div class="hotel-detail-item ${className}">
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
        </div>
    `;
}

function closeHotelDetails() {
    hotelDetailModal.classList.add("hidden");
    hotelDetailModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("hotel-detail-open");
}

function openHotelDetails(id) {
    const hotel = hotels.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!hotel) {
        showToast("Não foi possível carregar os detalhes.");
        return;
    }

    const emissor = hotel.emissor_nome;
    const details = [
        hotelDetailItem("Código TRES", detailValue(hotel.codigo_tres), "highlight"),
        hotelDetailItem("Data da solicitação", detailDate(hotel.data_solicitacao)),
        hotelDetailItem("Status", detailValue(hotel.status)),
        hotelDetailItem("Emissor", detailValue(emissor), "wide"),
        hotelDetailItem("Tipo", detailValue(hotel.tipo)),
        hotelDetailItem("Nome do hotel", detailValue(hotel.nome_hotel), "full"),
        hotelDetailItem("Rua e número", detailValue(hotel.rua_numero), "wide"),
        hotelDetailItem("Bairro", detailValue(hotel.bairro)),
        hotelDetailItem("Cidade / Estado", detailValue(hotel.cidade_estado), "wide"),
        hotelDetailItem("País", detailValue(hotel.pais)),
        hotelDetailItem(
            "CNPJ",
            hotel.cnpj ? escapeHtml(formatCNPJ(hotel.cnpj)) : "Não se aplica",
            "wide"
        ),
        hotelDetailItem("Código de integração", detailValue(hotel.codigo_integracao), "highlight"),
        hotelDetailItem("Criado em", detailDate(hotel.created_at, true)),
        hotelDetailItem("Concluído por", detailValue(hotel.concluido_por_nome)),
        hotelDetailItem("Concluído em", detailDate(hotel.concluido_em, true))
    ];

    hotelDetailTitle.textContent = hotel.codigo_tres
        ? `${hotel.codigo_tres} · ${hotel.nome_hotel}`
        : hotel.nome_hotel;
    hotelDetailContent.innerHTML = details.join("");
    hotelDetailModal.classList.remove("hidden");
    hotelDetailModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("hotel-detail-open");
    hotelDetailClose.focus();
}

function editHotel(id) {
    const hotel = hotels.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!hotel) {
        showToast("Não foi possível abrir a edição.");
        return;
    }

    editingHotelId = hotel.id;
    editingHotelOriginal = { ...hotel };

    dataSolicitacao.value = hotel.data_solicitacao || todayISO();
    nomeHotel.value = hotel.nome_hotel || "";
    ruaNumero.value = hotel.rua_numero || "";
    bairro.value = hotel.bairro || "";
    cidadeEstado.value = hotel.cidade_estado || "";
    pais.value = hotel.pais || "";
    tipoHotel.value = hotel.tipo || "NACIONAL";
    cnpj.value = hotel.cnpj ? formatCNPJ(hotel.cnpj) : "";
    fillHotelEmitterSelect(hotel.emissor_id);
    handleTipoChange();

    tabButtons.forEach(function (button) {
        if (button.dataset.tab === "newHotel") {
            button.click();
        }
    });

    saveHotelButton.textContent = "Salvar alterações";
    showToast("Editando hotel. Ao salvar, ele voltará para PENDENTE.");
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
        emissor_nome: "Nome do emissor",
        data_solicitacao: "Data",
        nome_hotel: "Nome do hotel",
        rua_numero: "Rua e número",
        bairro: "Bairro",
        cidade_estado: "Cidade / Estado",
        pais: "País",
        tipo: "Tipo",
        cnpj: "CNPJ",
        codigo_integracao: "Cód. integração",
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

function formatHistoryValue(field, value) {
    if (value === null || value === undefined || value === "") return "—";

    if (field === "emissor_id" || field === "updated_by" || field === "created_by" || field === "concluido_por") {
        return userNameById(value);
    }

    if (field === "cnpj") {
        return formatCNPJ(value);
    }

    return String(value);
}

function formatHistoryChanges(changes) {
    const hiddenFields = new Set([
        "updated_by",
        "created_by",
        "concluido_por",
        "concluido_em",
        "concluido_por_nome"
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

    const creator = currentItem.emissor_nome || userNameById(currentItem.created_by || currentItem.emissor_id) || "Usuário";

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
    } else if (changes.emissor_id || changes.emissor_nome) {
        const emitterName = changes.emissor_nome?.depois || formatHistoryValue("emissor_id", changes.emissor_id?.depois);
        title = `Emissor alterado para ${emitterName} por ${actor}`;
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

function renderHotels() {

    const filteredHotels = getFilteredHotels();
    const pageSize = getHotelPageSize();

    updateHotelPagination(filteredHotels.length);

    if (filteredHotels.length === 0) {

        hotelTableBody.innerHTML = `
            <tr>
                <td colspan="10" class="empty-table-message">
                    Nenhuma solicitação encontrada.
                </td>
            </tr>
        `;

        completeSelectedButton.classList.add("hidden");
        return;

    }

    const visibleHotels = filteredHotels.slice(
        (hotelCurrentPage - 1) * pageSize,
        hotelCurrentPage * pageSize
    );

    hotelTableBody.innerHTML = visibleHotels.map(function (hotel) {

        const checked =
            selectedHotels.has(hotel.id) ? "checked" : "";

        return `

        <tr>

            <td>

                <input
                    type="checkbox"
                    class="hotel-checkbox"
                    data-id="${hotel.id}"
                    ${checked}>

            </td>

            <td>${hotel.codigo_tres}</td>

            <td>${hotel.emissor_nome || "-"}</td>

            <td>${hotel.nome_hotel}</td>

            <td>${hotel.cidade_estado}</td>

            <td>${hotel.tipo}</td>

            <td>${hotel.cnpj ? formatCNPJ(hotel.cnpj) : "-"}</td>

            <td>${statusBadge(hotel.status)}</td>

            <td>

                ${
                    isAdminOrMaster()

                        ? `<input
                                class="table-input"
                                data-id="${hotel.id}"
                                value="${hotel.codigo_integracao || ""}"
                                placeholder="Código">`

                        : (hotel.codigo_integracao || "-")

                }

            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="icon-button"
                        data-action="details"
                        data-id="${hotel.id}"
                        title="Abrir detalhes">

                        <i data-lucide="eye"></i>

                    </button>

                    <button
                        class="icon-button"
                        data-action="edit"
                        data-id="${hotel.id}"
                        title="Editar solicitação">

                        <i data-lucide="pencil"></i>

                    </button>

                    <button
                        class="icon-button"
                        data-action="history"
                        data-id="${hotel.id}"
                        title="Histórico">

                        <i data-lucide="history"></i>

                    </button>

                    ${
                        isAdminOrMaster()

                            ? `

                            <button
                                class="icon-button"
                                data-action="complete"
                                data-id="${hotel.id}"
                                title="Concluir">

                                <i data-lucide="check"></i>

                            </button>

                            <button
                                class="icon-button"
                                data-action="already"
                                data-id="${hotel.id}"
                                title="Já cadastrado">

                                <i data-lucide="badge-check"></i>

                            </button>

                            `

                            : ""

                    }

                    <button
                        class="icon-button"
                        data-action="duplicate"
                        data-id="${hotel.id}"
                        title="Duplicar">

                        <i data-lucide="copy"></i>

                    </button>

                </div>

            </td>

        </tr>

        `;

    }).join("");

    completeSelectedButton.classList.toggle(
        "hidden",
        selectedHotels.size === 0 || !isAdminOrMaster()
    );

    lucide.createIcons();

}

async function updateHotelStatus(id, status) {
    const before = hotels.find(function (item) {
        return String(item.id) === String(id);
    });

    const { error } = await supabaseClient
        .from("solicitacoes_hotel")
        .update({

            status,
            concluido_por: currentUser.id,
            concluido_por_nome: currentProfile.nome,
            concluido_em: new Date().toISOString(),
            updated_by: currentUser.id

        })
        .eq("id", id);

    if (error) {

        console.error(error);
        showToast("Erro ao atualizar.");

        return;

    }

    if (before) {
        await registerHistory(
            "HOTEIS",
            before,
            { ...before, status },
            "STATUS"
        );
    }

    showToast("Status atualizado.");

    await loadHotels();

}

async function duplicateHotel(id) {

    const hotel =
        hotels.find(h => h.id === id);

    if (!hotel) return;

    nomeHotel.value = hotel.nome_hotel;
    ruaNumero.value = hotel.rua_numero;
    bairro.value = hotel.bairro;
    cidadeEstado.value = hotel.cidade_estado;
    pais.value = hotel.pais;
    tipoHotel.value = hotel.tipo;

    cnpj.value = "";

    handleTipoChange();

    tabButtons[0].click();

    showToast("Dados copiados. Informe um novo CNPJ.");

}

function resetHotelForm() {
    editingHotelId = null;
    editingHotelOriginal = null;
    hotelForm.reset();
    dataSolicitacao.value = todayISO();
    emissorNome.value = currentProfile.nome;
    pais.value = "Brasil";
    tipoHotel.value = "NACIONAL";
    saveHotelButton.textContent = "Salvar solicitação";
    fillHotelEmitterSelect(currentUser.id);
    handleTipoChange();
}

hotelForm.addEventListener("submit", saveHotel);

tipoHotel.addEventListener("change", handleTipoChange);

clearHotelForm.addEventListener("click", function () {
    resetHotelForm();

});

cnpj.addEventListener("input", function () {

    cnpj.value = formatCNPJ(cnpj.value);

});

hotelSearch.addEventListener("input", resetHotelPagination);
statusFilter.addEventListener("change", resetHotelPagination);
tipoFilter.addEventListener("change", resetHotelPagination);

if (hotelPageSize) {
    hotelPageSize.addEventListener("change", resetHotelPagination);
}

if (hotelPrevPage) {
    hotelPrevPage.addEventListener("click", function () {
        if (hotelCurrentPage > 1) {
            hotelCurrentPage -= 1;
            renderHotels();
        }
    });
}

if (hotelNextPage) {
    hotelNextPage.addEventListener("click", function () {
        hotelCurrentPage += 1;
        renderHotels();
    });
}

if (refreshHotelsButton) {
    refreshHotelsButton.addEventListener("click", async function () {
        refreshHotelsButton.disabled = true;

        try {
            await loadHotels();
            showToast("Hotéis atualizados.");
        } finally {
            refreshHotelsButton.disabled = false;
            lucide.createIcons();
        }
    });
}

logoutButton.addEventListener("click", async function () {

    await supabaseClient.auth.signOut();

    window.location.href = "index.html";

});

hotelTableBody.addEventListener("click", async function (event) {

    const button =
        event.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;

    switch (button.dataset.action) {

        case "details":

            openHotelDetails(id);

            break;

        case "edit":

            editHotel(id);

            break;

        case "history": {

            const hotel = hotels.find(function (item) {
                return String(item.id) === String(id);
            });

            await openHistory("HOTEIS", id, `Histórico ${hotel?.codigo_tres || ""}`, hotel);

            break;
        }

        case "complete":

            await updateHotelStatus(
                id,
                "CONCLUIDO"
            );

            break;

        case "already":

            await updateHotelStatus(
                id,
                "JA_CADASTRADO"
            );

            break;

        case "duplicate":

            await duplicateHotel(id);

            break;

    }

});

hotelDetailClose.addEventListener("click", closeHotelDetails);
hotelDetailDone.addEventListener("click", closeHotelDetails);

hotelDetailModal.addEventListener("click", function (event) {
    if (event.target === hotelDetailModal) {
        closeHotelDetails();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !hotelDetailModal.classList.contains("hidden")) {
        closeHotelDetails();
    }
});

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

async function start() {

    currentUser = await checkAuth();

    if (!currentUser) return;

    currentProfile =
        await getUserProfile(currentUser.id);

    if (currentProfile?.primeiro_acesso) {
        window.location.href = "conta.html";
        return;
    }

    applyUserProfile(
        currentProfile,
        currentUser
    );

    dataSolicitacao.value = todayISO();

    setupHotelEmitterSelect();
    await loadUsersList();
    handleTipoChange();

    setupTabs();

    await loadHotels();

    lucide.createIcons();

}

start();
