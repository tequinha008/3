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
const nomeHotelMessage = document.getElementById("nomeHotelMessage");
const ruaNumero = document.getElementById("ruaNumero");
const bairro = document.getElementById("bairro");
const cidadeEstado = document.getElementById("cidadeEstado");
const pais = document.getElementById("pais");
const telefone = document.getElementById("telefone");
const tipoHotel = document.getElementById("tipoHotel");
const hotelDireto = document.getElementById("hotelDireto");
const cnpj = document.getElementById("cnpj");
const cnpjMessage = document.getElementById("cnpjMessage");
const clearHotelForm = document.getElementById("clearHotelForm");
const saveHotelButton = document.getElementById("saveHotelButton");

const hotelSearch = document.getElementById("hotelSearch");
const hotelStartDate = document.getElementById("hotelStartDate");
const hotelEndDate = document.getElementById("hotelEndDate");
const statusFilter = document.getElementById("statusFilter");
const tipoFilter = document.getElementById("tipoFilter");
const hotelSort = document.getElementById("hotelSort");
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

function firstDayOfMonthISO() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split("T")[0];
}

function onlyNumbers(value) {
    return String(value || "").replace(/\D/g, "");
}

function normalizeText(value) {
    return String(value || "").trim().toUpperCase();
}

function normalizeHotelName(value) {
    return normalizeText(value).replace(/\s+/g, " ");
}

function validateHotelName(showBrowserMessage = false) {
    const value = normalizeHotelName(nomeHotel.value);
    const hasForbiddenCharacters = value !== "" && !/^[A-Z0-9Ç ]+$/.test(value);
    const message = hasForbiddenCharacters
        ? "Não use acentos, hífen, barra ou símbolos. São permitidos letras, números, espaços e Ç."
        : "";

    nomeHotel.value = value;
    nomeHotel.setCustomValidity(message);
    nomeHotel.classList.toggle("field-invalid", hasForbiddenCharacters);

    if (nomeHotelMessage) {
        nomeHotelMessage.textContent = message;
    }

    if (hasForbiddenCharacters && showBrowserMessage) {
        nomeHotel.reportValidity();
        showToast("Corrija o nome do hotel antes de salvar.");
    }

    return value !== "" && !hasForbiddenCharacters;
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

function formatTelefone(value) {
    const numbers = onlyNumbers(value).slice(0, 11);

    if (numbers.length <= 2) return numbers;

    if (numbers.length <= 6) {
        return numbers.replace(/^(\d{2})(\d+)/, "($1) $2");
    }

    if (numbers.length <= 10) {
        return numbers.replace(/^(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
    }

    return numbers.replace(/^(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
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
        showError("CNPJ \u00e9 obrigat\u00f3rio para hot\u00e9is nacionais.");
        return false;
    }

    if (cnpjNumbers.length !== 14) {
        showError("Informe um CNPJ v\u00e1lido com 14 n\u00fameros.");
        return false;
    }

    const duplicate = await checkDuplicateCNPJ(cnpjNumbers);

    if (duplicate) {
        if (editingHotelId && String(duplicate.id) === String(editingHotelId)) {
            return true;
        }

        showError(
            `Este CNPJ j\u00e1 existe no sistema: ${duplicate.codigo_tres || "sem c\u00f3digo"} - ${duplicate.nome_hotel}.`
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
        cnpj.placeholder = "N\u00e3o obrigat\u00f3rio para internacional";
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

    if (!validateHotelName(true)) {
        return;
    }

    saveHotelButton.disabled = true;
    saveHotelButton.textContent = "Salvando...";

    const validCNPJ = await validateCNPJBeforeSave();

    if (!validCNPJ) {
        saveHotelButton.disabled = false;
        saveHotelButton.textContent = "Salvar solicita\u00e7\u00e3o";
        return;
    }

    const codigoTres = await generateHotelCode();

    const payload = {
        codigo_tres: codigoTres,
        data_solicitacao: dataSolicitacao.value,
        emissor_id: currentUser.id,
        emissor_nome: currentProfile.nome,
        nome_hotel: normalizeHotelName(nomeHotel.value),
        rua_numero: normalizeText(ruaNumero.value),
        bairro: normalizeText(bairro.value),
        cidade_estado: normalizeText(cidadeEstado.value),
        pais: normalizeText(pais.value),
        telefone: onlyNumbers(telefone.value) || null,
        tipo: tipoHotel.value,
        hotel_direto: Boolean(hotelDireto.checked),
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
        showToast("Erro ao salvar solicita\u00e7\u00e3o.");
    } else {
        showToast("Solicita\u00e7\u00e3o cadastrada com sucesso.");

        hotelForm.reset();

        dataSolicitacao.value = todayISO();
        emissorNome.value = currentProfile.nome;
        pais.value = "Brasil";
        tipoHotel.value = "NACIONAL";

        handleTipoChange();
        await loadHotels();
    }

    saveHotelButton.disabled = false;
    saveHotelButton.textContent = "Salvar solicita\u00e7\u00e3o";
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
        return `<option value="${user.id}">${escapeHtml(user.nome || user.email || "Usu\u00e1rio")}</option>`;
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
        nome_hotel: normalizeHotelName(nomeHotel.value),
        rua_numero: normalizeText(ruaNumero.value),
        bairro: normalizeText(bairro.value),
        cidade_estado: normalizeText(cidadeEstado.value),
        pais: normalizeText(pais.value),
        telefone: onlyNumbers(telefone.value) || null,
        tipo: tipoHotel.value,
        hotel_direto: Boolean(hotelDireto.checked),
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

    if (!validateHotelName(true)) {
        return;
    }

    saveHotelButton.disabled = true;
    saveHotelButton.textContent = "Salvando...";

    const validCNPJ = await validateCNPJBeforeSave();

    if (!validCNPJ) {
        saveHotelButton.disabled = false;
        saveHotelButton.textContent = editingHotelId ? "Salvar altera\u00e7\u00f5es" : "Salvar solicita\u00e7\u00e3o";
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
                "EDI\u00c7\u00c3O"
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
        showToast("Erro ao salvar solicita\u00e7\u00e3o.");
    } else {
        showToast(editingHotelId ? "Solicita\u00e7\u00e3o atualizada e voltou para pendente." : "Solicita\u00e7\u00e3o cadastrada com sucesso.");
        hotelForm.reset();
        resetHotelForm();
        await loadHotels();
    }

    saveHotelButton.disabled = false;
    saveHotelButton.textContent = "Salvar solicita\u00e7\u00e3o";
}

async function loadHotels() {
    hotelTableBody.innerHTML = `
        <tr>
            <td colspan="11" class="empty-table-message">
                <div class="table-loading-state">
                    <span class="table-loading-spinner" aria-hidden="true"></span>
                    Carregando hot\u00e9is...
                </div>
            </td>
        </tr>
    `;

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
            telefone,
            tipo,
            hotel_direto,
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
                <td colspan="11" class="empty-table-message">
                    Erro ao carregar solicita\u00e7\u00f5es.
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
    const start = hotelStartDate?.value || "";
    const end = hotelEndDate?.value || "";
    const status = statusFilter.value;
    const tipo = tipoFilter.value;

    const filteredHotels = hotels.filter(function (hotel) {
        const date = hotel.data_solicitacao || "";

        const searchableText = [
            hotel.codigo_tres,
            hotel.emissor_nome,
            hotel.nome_hotel,
            hotel.rua_numero,
            hotel.bairro,
            hotel.cidade_estado,
            hotel.pais,
            hotel.telefone,
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

        const matchTelefone =
            searchNumbers &&
            onlyNumbers(hotel.telefone).includes(searchNumbers);

        const matchSearch =
            !search ||
            matchText ||
            matchCnpj ||
            matchTelefone;

        const matchStatus =
            !status ||
            hotel.status === status ||
            (status === "CADASTRADO_BENNER" && hotel.status === "JA_CADASTRADO");

        const matchTipo =
            !tipo || hotel.tipo === tipo;

        const matchStart = !start || date >= start;
        const matchEnd = !end || date <= end;

        return matchSearch && matchStatus && matchTipo && matchStart && matchEnd;

    });

    const statusOrder = {
        PENDENTE: 0,
        AGUARDANDO_BENNER: 1,
        CADASTRADO_BENNER: 2,
        JA_CADASTRADO: 2,
        CONCLUIDO: 3
    };
    const sortMode = hotelSort?.value || "DATE_DESC";

    return filteredHotels.sort(function (a, b) {
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

const HOTEL_STATUS_OPTIONS = [
    { value: "PENDENTE", label: "Pendente", icon: "clock-3" },
    { value: "AGUARDANDO_BENNER", label: "Aguardando Benner", icon: "hourglass" },
    { value: "CADASTRADO_BENNER", label: "Cadastrado Benner", icon: "badge-check" },
    { value: "CONCLUIDO", label: "Conclu\u00eddo", icon: "check-circle-2" }
];

function hotelStatusLabel(status) {
    const option = HOTEL_STATUS_OPTIONS.find(function (item) {
        return item.value === status;
    });

    if (option) return option.label;
    if (status === "JA_CADASTRADO") return "Cadastrado Benner";
    return "Pendente";
}

function statusBadge(status) {

    switch (status) {

        case "CADASTRADO_BENNER":
            return `<span class="badge badge-ja-cadastrado">CADASTRADO BENNER</span>`;

        case "AGUARDANDO_BENNER":
            return `<span class="badge hotel-badge-benner-waiting">AGUARDANDO BENNER</span>`;

        case "CONCLUIDO":
            return `<span class="badge badge-concluido">CONCLU\u00cdDO</span>`;

        case "JA_CADASTRADO":
            return `<span class="badge badge-ja-cadastrado">J\u00c1 CADASTRADO</span>`;

        default:
            return `<span class="badge badge-pendente">PENDENTE</span>`;

    }

}

function resetHotelPagination() {
    hotelCurrentPage = 1;
    renderHotels();
}

function renderHotelStatusMenu(hotel) {
    if (!isAdminOrMaster()) {
        return "";
    }

    return `
        <div class="hotel-status-menu">
            <button
                type="button"
                class="icon-button hotel-status-trigger"
                data-action="toggle-status-menu"
                data-id="${hotel.id}"
                title="Alterar status">
                <i data-lucide="list-checks"></i>
            </button>
        </div>
    `;
}

let activeHotelStatusId = null;
let activeHotelStatusIds = [];

function ensureHotelStatusDialog() {
    let dialog = document.getElementById("hotelStatusDialog");

    if (dialog) return dialog;

    dialog = document.createElement("div");
    dialog.id = "hotelStatusDialog";
    dialog.setAttribute("role", "presentation");
    dialog.style.cssText = [
        "position:fixed",
        "inset:0",
        "z-index:9999",
        "display:none",
        "place-items:center",
        "padding:20px",
        "background:rgba(15,23,42,.48)",
        "backdrop-filter:blur(2px)"
    ].join(";");

    dialog.innerHTML = `
        <div role="dialog" aria-modal="true" aria-labelledby="hotelStatusDialogTitle"
            style="width:min(360px,100%);border:1px solid #dbe4ea;border-radius:18px;padding:18px;background:#fff;box-shadow:0 24px 70px rgba(15,23,42,.28)">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:14px">
                <div>
                    <div style="color:#64748b;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Alterar status</div>
                    <strong id="hotelStatusDialogTitle" style="display:block;margin-top:4px;color:#172033;font-size:16px;font-weight:600">Selecione o novo status</strong>
                </div>
                <button type="button" data-close-hotel-status title="Fechar"
                    style="display:grid;width:30px;height:30px;flex:0 0 auto;place-items:center;border:1px solid #dbe4ea;border-radius:9px;color:#64748b;background:#fff;cursor:pointer">&times;</button>
            </div>
            <div style="display:grid;gap:6px">
                ${HOTEL_STATUS_OPTIONS.map(function (option) {
                    return `
                        <button type="button" data-dialog-hotel-status="${option.value}"
                            style="display:flex;width:100%;min-height:38px;align-items:center;justify-content:space-between;border:1px solid #dbe4ea;border-radius:11px;padding:8px 11px;color:#172033;background:#fff;font:inherit;font-size:12px;font-weight:500;text-align:left;cursor:pointer">
                            <span>${option.label}</span>
                            <span data-status-check style="color:#0f766e;font-weight:700"></span>
                        </button>
                    `;
                }).join("")}
            </div>
        </div>
    `;

    dialog.addEventListener("click", async function (event) {
        if (event.target === dialog || event.target.closest("[data-close-hotel-status]")) {
            closeHotelStatusMenus();
            return;
        }

        const optionButton = event.target.closest("[data-dialog-hotel-status]");
        if (!optionButton || (!activeHotelStatusId && activeHotelStatusIds.length === 0)) return;

        const hotelId = activeHotelStatusId;
        const hotelIds = [...activeHotelStatusIds];
        const status = optionButton.dataset.dialogHotelStatus;
        closeHotelStatusMenus();

        if (hotelIds.length > 0) {
            await updateSelectedHotelsStatus(hotelIds, status);
        } else {
            await updateHotelStatus(hotelId, status);
        }
    });

    document.body.appendChild(dialog);
    return dialog;
}

function openHotelStatusDialog(id) {
    const hotel = hotels.find(function (item) {
        return String(item.id) === String(id);
    });
    const dialog = ensureHotelStatusDialog();
    const currentStatus = hotel?.status === "JA_CADASTRADO"
        ? "CADASTRADO_BENNER"
        : hotel?.status;

    activeHotelStatusId = String(id);
    activeHotelStatusIds = [];
    dialog.querySelector("#hotelStatusDialogTitle").textContent = "Selecione o novo status";

    dialog.querySelectorAll("[data-dialog-hotel-status]").forEach(function (button) {
        const isActive = button.dataset.dialogHotelStatus === currentStatus;
        button.style.borderColor = isActive ? "#5eead4" : "#dbe4ea";
        button.style.color = isActive ? "#0f766e" : "#172033";
        button.style.background = isActive ? "#ecfdf8" : "#ffffff";
        button.querySelector("[data-status-check]").textContent = isActive ? "✓" : "";
    });

    dialog.style.display = "grid";
}

function openSelectedHotelStatusDialog() {
    const selectedItems = hotels.filter(function (hotel) {
        return selectedHotels.has(hotel.id);
    });

    if (!isAdminOrMaster() || selectedItems.length === 0) {
        showToast("Selecione pelo menos uma solicitação.");
        return;
    }

    const dialog = ensureHotelStatusDialog();
    const normalizedStatuses = selectedItems.map(function (hotel) {
        return hotel.status === "JA_CADASTRADO"
            ? "CADASTRADO_BENNER"
            : hotel.status;
    });
    const currentStatus = normalizedStatuses.every(function (status) {
        return status === normalizedStatuses[0];
    }) ? normalizedStatuses[0] : null;

    activeHotelStatusId = null;
    activeHotelStatusIds = selectedItems.map(function (hotel) {
        return hotel.id;
    });
    dialog.querySelector("#hotelStatusDialogTitle").textContent =
        `Escolha o status para ${selectedItems.length} solicitação(ões)`;

    dialog.querySelectorAll("[data-dialog-hotel-status]").forEach(function (button) {
        const isActive = Boolean(currentStatus) && button.dataset.dialogHotelStatus === currentStatus;
        button.style.borderColor = isActive ? "#5eead4" : "#dbe4ea";
        button.style.color = isActive ? "#0f766e" : "#172033";
        button.style.background = isActive ? "#ecfdf8" : "#ffffff";
        button.querySelector("[data-status-check]").textContent = isActive ? "✓" : "";
    });

    dialog.style.display = "grid";
}

function closeHotelStatusMenus() {
    document.querySelectorAll(".hotel-status-dropdown").forEach(function (menu) {
        menu.classList.add("hidden");
        menu.style.removeProperty("top");
        menu.style.removeProperty("left");
        menu.style.removeProperty("visibility");
    });

    document.querySelectorAll(".hotel-status-trigger").forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
    });

    const dialog = document.getElementById("hotelStatusDialog");
    if (dialog) dialog.style.display = "none";
    activeHotelStatusId = null;
    activeHotelStatusIds = [];
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
        hotelPageIndicator.textContent = `P\u00e1gina ${hotelCurrentPage} de ${totalPages}`;
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
        ? "-"
        : escapeHtml(value);
}

function detailDate(value, includeTime = false) {
    if (!value) return "-";

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

function hotelSummaryItem(label, value, className = "") {
    return `
        <div class="hotel-summary-item ${className}">
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
        </div>
    `;
}

function hotelInfoRow(label, value, className = "") {
    return `
        <div class="hotel-info-row ${className}">
            <span>${escapeHtml(label)}</span>
            <strong>${value}</strong>
        </div>
    `;
}

function requestDateTimeLabel(hotel) {
    const date = detailDate(hotel.data_solicitacao);

    if (!hotel.created_at) {
        return date;
    }

    const createdAt = new Date(hotel.created_at);

    if (Number.isNaN(createdAt.getTime())) {
        return date;
    }

    return `${date} \u00e0s ${createdAt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    })}`;
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
    const summary = [
        hotelSummaryItem("Código", detailValue(hotel.codigo_tres)),
        hotelSummaryItem("Tipo", detailValue(hotel.tipo)),
        hotelSummaryItem("Status", detailValue(hotel.status)),
        hotelSummaryItem("Data / hora", requestDateTimeLabel(hotel)),
        hotelSummaryItem("Emissor", detailValue(emissor)),
        hotelSummaryItem("Código integração", detailValue(hotel.codigo_integracao), "accent")
    ];
    const hotelRows = [
        hotelInfoRow("Nome do hotel", detailValue(hotel.nome_hotel), "wide"),
        hotelInfoRow("Rua e número", detailValue(hotel.rua_numero)),
        hotelInfoRow("Bairro", detailValue(hotel.bairro)),
        hotelInfoRow("Cidade / Estado", detailValue(hotel.cidade_estado)),
        hotelInfoRow("País", detailValue(hotel.pais)),
        hotelInfoRow("Hotel direto", hotel.hotel_direto ? "Sim" : "Não"),
        hotelInfoRow(
            "Telefone",
            hotel.telefone ? escapeHtml(formatTelefone(hotel.telefone)) : "-"
        ),
        hotelInfoRow("CNPJ", hotel.cnpj ? escapeHtml(formatCNPJ(hotel.cnpj)) : "Não se aplica"),
        hotelInfoRow("Criado em", detailDate(hotel.created_at, true)),
        hotelInfoRow("Concluído por", detailValue(hotel.concluido_por_nome)),
        hotelInfoRow("Concluído em", detailDate(hotel.concluido_em, true))
    ];

    hotelDetailTitle.textContent = hotel.codigo_tres
        ? `${hotel.codigo_tres} · ${hotel.nome_hotel}`
        : hotel.nome_hotel;
    hotelDetailContent.innerHTML = `
        <section class="hotel-detail-summary">
            ${summary.join("")}
        </section>

        <section class="hotel-detail-card">
            <header class="hotel-detail-card-header">
                <div>
                    <span>Dados do hotel</span>
                </div>
            </header>

            <div class="hotel-info-grid">
                ${hotelRows.join("")}
            </div>
        </section>
    `;
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
        showToast("N\u00e3o foi poss\u00edvel abrir a edi\u00e7\u00e3o.");
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
    telefone.value = hotel.telefone ? formatTelefone(hotel.telefone) : "";
    tipoHotel.value = hotel.tipo || "NACIONAL";
    hotelDireto.checked = Boolean(hotel.hotel_direto);
    cnpj.value = hotel.cnpj ? formatCNPJ(hotel.cnpj) : "";
    fillHotelEmitterSelect(hotel.emissor_id);
    handleTipoChange();

    tabButtons.forEach(function (button) {
        if (button.dataset.tab === "newHotel") {
            button.click();
        }
    });

    saveHotelButton.textContent = "Salvar altera\u00e7\u00f5es";
    showToast("Editando hotel. Ao salvar, ele voltar\u00e1 para PENDENTE.");
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
        emissor_nome: "Nome do emissor",
        data_solicitacao: "Data",
        nome_hotel: "Nome do hotel",
        rua_numero: "Rua e n\u00famero",
        bairro: "Bairro",
        cidade_estado: "Cidade / Estado",
        pais: "Pa\u00eds",
        telefone: "Telefone",
        tipo: "Tipo",
        hotel_direto: "Hotel direto",
        cnpj: "CNPJ",
        codigo_integracao: "C\u00f3d. integra\u00e7\u00e3o",
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

function formatHistoryValue(field, value) {
    if (value === null || value === undefined || value === "") return "-";

    if (field === "emissor_id" || field === "updated_by" || field === "created_by" || field === "concluido_por") {
        return userNameById(value);
    }

    if (field === "cnpj") {
        return formatCNPJ(value);
    }

    if (field === "status") {
        return hotelStatusLabel(value);
    }

    if (field === "hotel_direto") {
        return value ? "Sim" : "Não";
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
    if (!value) return "Data n\u00e3o informada";
    return new Date(value).toLocaleString("pt-BR");
}

function getCreationDate(currentItem) {
    return currentItem?.created_at || currentItem?.data_solicitacao;
}

function buildCreationEvent(currentItem) {
    if (!currentItem) return null;

    const creator = currentItem.emissor_nome || userNameById(currentItem.created_by || currentItem.emissor_id) || "Usu\u00e1rio";

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
    } else if (changes.codigo_integracao) {
        title = `C\u00f3digo de integra\u00e7\u00e3o salvo por ${actor}`;
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

function renderHotelsQuietly() {
    const wrapper = hotelTableBody.closest(".table-wrapper");
    wrapper?.classList.add("table-update-silent");
    renderHotels();

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            wrapper?.classList.remove("table-update-silent");
        });
    });
}

function renderHotels() {

    const filteredHotels = getFilteredHotels();
    const pageSize = getHotelPageSize();

    updateHotelPagination(filteredHotels.length);

    if (filteredHotels.length === 0) {

        hotelTableBody.innerHTML = `
            <tr>
                <td colspan="11" class="empty-table-message">
                    Nenhuma solicita\u00e7\u00e3o encontrada.
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
                    ${!isAdminOrMaster() ? "disabled" : ""}
                    ${checked}>

            </td>

            <td>${hotel.codigo_tres}</td>

            <td>${hotel.emissor_nome || "-"}</td>

            <td>${hotel.nome_hotel}</td>

            <td>${hotel.cidade_estado}</td>

            <td>${hotel.telefone ? formatTelefone(hotel.telefone) : "-"}</td>

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
                                placeholder="C\u00f3digo">`

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
                        title="Editar solicita\u00e7\u00e3o">

                        <i data-lucide="pencil"></i>

                    </button>

                    <button
                        class="icon-button"
                        data-action="history"
                        data-id="${hotel.id}"
                        title="Hist\u00f3rico">

                        <i data-lucide="history"></i>

                    </button>

                    ${renderHotelStatusMenu(hotel)}

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
                                title="J\u00e1 cadastrado">

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

                    ${
                        isAdminOrMaster()
                            ? `
                            <button
                                class="icon-button danger"
                                data-action="delete"
                                data-id="${hotel.id}"
                                title="Excluir solicita\u00e7\u00e3o">

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

    syncHotelSelectionControls(filteredHotels);

    lucide.createIcons();

}

function openHotelStatusMenu(button, menu) {
    const viewportGap = 8;
    const menuGap = 6;

    menu.style.visibility = "hidden";
    menu.classList.remove("hidden");

    const buttonRect = button.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - buttonRect.right - viewportGap;
    const spaceOnLeft = buttonRect.left - viewportGap;
    let left;

    if (spaceOnRight >= menuRect.width + menuGap) {
        left = buttonRect.right + menuGap;
    } else if (spaceOnLeft >= menuRect.width + menuGap) {
        left = buttonRect.left - menuRect.width - menuGap;
    } else {
        left = Math.max(
            viewportGap,
            Math.min(
                buttonRect.left + (buttonRect.width - menuRect.width) / 2,
                window.innerWidth - menuRect.width - viewportGap
            )
        );
    }
    const canOpenAbove =
        buttonRect.top - menuRect.height - menuGap >= viewportGap;
    const wouldOverflowBelow =
        buttonRect.bottom + menuGap + menuRect.height >
        window.innerHeight - viewportGap;
    const top = wouldOverflowBelow && canOpenAbove
        ? buttonRect.top - menuRect.height - menuGap
        : buttonRect.bottom + menuGap;

    menu.style.left = `${left}px`;
    menu.style.top = `${Math.max(viewportGap, top)}px`;
    menu.style.visibility = "visible";
    button.setAttribute("aria-expanded", "true");
}

function syncHotelSelectionControls(filteredHotels = getFilteredHotels()) {
    const selectableHotels = filteredHotels;

    const selectedInFilter = selectableHotels.filter(function (hotel) {
        return selectedHotels.has(hotel.id);
    });

    const selectedCount = hotels.filter(function (hotel) {
        return selectedHotels.has(hotel.id);
    }).length;

    selectAllHotels.disabled = !isAdminOrMaster() || selectableHotels.length === 0;
    selectAllHotels.checked =
        selectableHotels.length > 0 &&
        selectedInFilter.length === selectableHotels.length;
    selectAllHotels.indeterminate =
        selectedInFilter.length > 0 &&
        selectedInFilter.length < selectableHotels.length;

    completeSelectedButton.classList.toggle(
        "hidden",
        selectedCount === 0 || !isAdminOrMaster()
    );

    completeSelectedButton.innerHTML = `
        <i data-lucide="list-checks"></i>
        Alterar status (${selectedCount})
    `;

    lucide.createIcons();
}

async function updateHotelStatus(id, status) {
    const before = hotels.find(function (item) {
        return String(item.id) === String(id);
    });

    const payload = {
        status,
        updated_by: currentUser.id
    };

    if (status === "CONCLUIDO") {
        payload.concluido_por = currentUser.id;
        payload.concluido_por_nome = currentProfile.nome;
        payload.concluido_em = new Date().toISOString();
    } else {
        payload.concluido_por = null;
        payload.concluido_por_nome = null;
        payload.concluido_em = null;
    }

    const { error } = await supabaseClient
        .from("solicitacoes_hotel")
        .update(payload)
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
            { ...before, ...payload },
            "STATUS"
        );
    }

    showToast("Status atualizado.");

    if (before) {
        Object.assign(before, payload);
    }

    renderHotelsQuietly();

}

async function updateSelectedHotelsStatus(ids, status) {
    if (!isAdminOrMaster()) {
        showToast("Você não tem permissão para alterar solicitações.");
        return;
    }

    const selectedItems = hotels.filter(function (hotel) {
        return ids.map(String).includes(String(hotel.id));
    });

    if (selectedItems.length === 0) {
        showToast("Selecione pelo menos uma solicitação.");
        return;
    }

    const payload = {
        status,
        updated_by: currentUser.id
    };

    if (status === "CONCLUIDO") {
        payload.concluido_por = currentUser.id;
        payload.concluido_por_nome = currentProfile.nome;
        payload.concluido_em = new Date().toISOString();
    } else {
        payload.concluido_por = null;
        payload.concluido_por_nome = null;
        payload.concluido_em = null;
    }

    completeSelectedButton.disabled = true;

    const { error } = await supabaseClient
        .from("solicitacoes_hotel")
        .update(payload)
        .in("id", ids);

    if (error) {
        console.error(error);
        showToast("Erro ao alterar as solicitações selecionadas.");
        completeSelectedButton.disabled = false;
        return;
    }

    for (const before of selectedItems) {
        await registerHistory(
            "HOTEIS",
            before,
            { ...before, ...payload },
            "STATUS"
        );
        selectedHotels.delete(before.id);
        Object.assign(before, payload);
    }

    selectAllHotels.checked = false;
    selectAllHotels.indeterminate = false;
    completeSelectedButton.disabled = false;
    showToast("Status das solicitações atualizado.");
    renderHotelsQuietly();
}

async function deleteHotel(id) {
    if (!isAdminOrMaster()) {
        showToast("Voc\u00ea n\u00e3o tem permiss\u00e3o para excluir solicita\u00e7\u00f5es.");
        return;
    }

    const hotel = hotels.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!hotel) {
        showToast("Solicita\u00e7\u00e3o n\u00e3o encontrada.");
        return;
    }

    const confirmed = window.confirm(
        `Deseja excluir ${hotel.codigo_tres || hotel.nome_hotel}? Esta a\u00e7\u00e3o n\u00e3o poder\u00e1 ser desfeita.`
    );

    if (!confirmed) {
        return;
    }

    const { error } = await supabaseClient
        .from("solicitacoes_hotel")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("Erro ao excluir solicita\u00e7\u00e3o.");
        return;
    }

    selectedHotels.delete(hotel.id);
    showToast("Solicita\u00e7\u00e3o exclu\u00edda.");
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
    telefone.value = hotel.telefone ? formatTelefone(hotel.telefone) : "";
    tipoHotel.value = hotel.tipo;
    hotelDireto.checked = Boolean(hotel.hotel_direto);

    cnpj.value = "";

    handleTipoChange();

    tabButtons[0].click();

    showToast("Dados copiados. Informe um novo CNPJ.");

}

async function updateHotelIntegrationCode(id, value) {
    const before = hotels.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!before) {
        return;
    }

    const codigoIntegracao = normalizeText(value) || null;
    const oldCode = before.codigo_integracao || null;
    const nextStatus =
        codigoIntegracao && before.status !== "CONCLUIDO"
            ? "CADASTRADO_BENNER"
            : before.status;

    if (
        String(oldCode || "") === String(codigoIntegracao || "") &&
        before.status === nextStatus
    ) {
        return;
    }

    const { error } = await supabaseClient
        .from("solicitacoes_hotel")
        .update({
            codigo_integracao: codigoIntegracao,
            status: nextStatus,
            updated_by: currentUser.id
        })
        .eq("id", id);

    if (error) {
        console.error(error);
        showToast("Erro ao salvar c\u00f3digo de integra\u00e7\u00e3o.");
        return;
    }

    await registerHistory(
        "HOTEIS",
        before,
        {
            ...before,
            codigo_integracao: codigoIntegracao,
            status: nextStatus,
            updated_by: currentUser.id
        },
        "CODIGO_INTEGRACAO"
    );

    showToast(
        codigoIntegracao && nextStatus === "CADASTRADO_BENNER"
            ? "C\u00f3digo salvo e status atualizado para Cadastrado Benner."
            : "C\u00f3digo de integra\u00e7\u00e3o salvo."
    );
    await loadHotels();
}

function resetHotelForm() {
    editingHotelId = null;
    editingHotelOriginal = null;
    hotelForm.reset();
    dataSolicitacao.value = todayISO();
    emissorNome.value = currentProfile.nome;
    pais.value = "Brasil";
    tipoHotel.value = "NACIONAL";
    hotelDireto.checked = false;
    nomeHotel.setCustomValidity("");
    nomeHotel.classList.remove("field-invalid");
    if (nomeHotelMessage) nomeHotelMessage.textContent = "";
    saveHotelButton.textContent = "Salvar solicita\u00e7\u00e3o";
    fillHotelEmitterSelect(currentUser.id);
    handleTipoChange();
}

hotelForm.addEventListener("submit", saveHotel);

nomeHotel.addEventListener("input", function () {
    validateHotelName(false);
});

tipoHotel.addEventListener("change", handleTipoChange);

clearHotelForm.addEventListener("click", function () {
    resetHotelForm();

});

cnpj.addEventListener("input", function () {

    cnpj.value = formatCNPJ(cnpj.value);

});

telefone.addEventListener("input", function () {
    telefone.value = formatTelefone(telefone.value);
});

hotelSearch.addEventListener("input", resetHotelPagination);
hotelStartDate?.addEventListener("change", resetHotelPagination);
hotelEndDate?.addEventListener("change", resetHotelPagination);
statusFilter.addEventListener("change", resetHotelPagination);
tipoFilter.addEventListener("change", resetHotelPagination);
hotelSort?.addEventListener("change", resetHotelPagination);

if (hotelPageSize) {
    hotelPageSize.addEventListener("change", function () {
        hotelCurrentPage = 1;

        window.setTimeout(function () {
            renderHotels();
        }, 0);
    });
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
            showToast("Hot\u00e9is atualizados.");
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

        case "toggle-status-menu": {
            const dialog = document.getElementById("hotelStatusDialog");
            const isOpen =
                dialog?.style.display === "grid" &&
                String(activeHotelStatusId) === String(id);

            closeHotelStatusMenus();

            if (!isOpen) {
                openHotelStatusDialog(id);
                button.setAttribute("aria-expanded", "true");
            }

            break;
        }

        case "set-status":

            closeHotelStatusMenus();
            await updateHotelStatus(id, button.dataset.status);

            break;

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

            await openHistory("HOTEIS", id, `Hist\u00f3rico ${hotel?.codigo_tres || ""}`, hotel);

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

        case "delete":

            await deleteHotel(id);

            break;

    }

});

hotelTableBody.addEventListener("change", async function (event) {
    const input = event.target;

    if (input.classList.contains("hotel-checkbox")) {
        const hotel = hotels.find(function (item) {
            return String(item.id) === String(input.dataset.id);
        });

        if (!hotel || !isAdminOrMaster()) {
            input.checked = false;
            return;
        }

        if (input.checked) {
            selectedHotels.add(hotel.id);
        } else {
            selectedHotels.delete(hotel.id);
        }

        syncHotelSelectionControls();
        return;
    }

    if (input.classList.contains("table-input")) {
        await updateHotelIntegrationCode(input.dataset.id, input.value);
    }
});

selectAllHotels.addEventListener("change", function () {
    if (!isAdminOrMaster()) {
        selectAllHotels.checked = false;
        return;
    }

    getFilteredHotels().forEach(function (hotel) {
        if (selectAllHotels.checked) {
            selectedHotels.add(hotel.id);
        } else {
            selectedHotels.delete(hotel.id);
        }
    });

    renderHotels();
});

completeSelectedButton.addEventListener("click", openSelectedHotelStatusDialog);

document.addEventListener("click", function (event) {
    if (
        !event.target.closest(".hotel-status-menu") &&
        !event.target.closest("#completeSelectedButton") &&
        !event.target.closest("#hotelStatusDialog")
    ) {
        closeHotelStatusMenus();
    }
});

window.addEventListener("resize", closeHotelStatusMenus);
window.addEventListener("scroll", closeHotelStatusMenus, true);

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

initSidebarPersistence();

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
    if (hotelStartDate) hotelStartDate.value = firstDayOfMonthISO();
    if (hotelEndDate) hotelEndDate.value = todayISO();
    window.TRESDatePickers?.refresh();

    setupHotelEmitterSelect();
    await loadUsersList();
    handleTipoChange();

    setupTabs();

    await loadHotels();

    lucide.createIcons();

}

start();
