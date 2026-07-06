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
const toast = document.getElementById("toast");
const hotelDetailModal = document.getElementById("hotelDetailModal");
const hotelDetailTitle = document.getElementById("hotelDetailTitle");
const hotelDetailContent = document.getElementById("hotelDetailContent");
const hotelDetailClose = document.getElementById("hotelDetailClose");
const hotelDetailDone = document.getElementById("hotelDetailDone");

const hotelDeleteModal = document.getElementById("hotelDeleteModal");
const hotelDeleteText = document.getElementById("hotelDeleteText");
const cancelDeleteHotel = document.getElementById("cancelDeleteHotel");
const confirmDeleteHotel = document.getElementById("confirmDeleteHotel");

let hotelToDelete = null;
let currentUser = null;
let currentProfile = null;
let hotels = [];
let selectedHotels = new Set();

function todayISO() {
    return new Date().toISOString().split("T")[0];
}

function onlyNumbers(value) {
    return String(value || "").replace(/\D/g, "");
}

function normalizeText(value) {
    return String(value || "").trim().toUpperCase();
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

async function loadHotels() {
    const { data, error } = await supabaseClient
        .from("solicitacoes_hotel")
        .select(`
            id,
            codigo_tres,
            data_solicitacao,
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
            created_at,
            usuarios:emissor_id (nome)
        `)
        .order("created_at", {
            ascending: false
        });

    if (error) {
        hotelTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table-message">
                    Erro ao carregar solicitações.
                </td>
            </tr>
        `;

        console.error(error);
        return;
    }

    hotels = data || [];
    renderHotels();
}
function getFilteredHotels() {

    const search = normalizeText(hotelSearch.value);
    const status = statusFilter.value;
    const tipo = tipoFilter.value;

    return hotels.filter(function (hotel) {

        const matchSearch =
            !search ||
            normalizeText(hotel.nome_hotel).includes(search) ||
            normalizeText(hotel.cidade_estado).includes(search) ||
            onlyNumbers(hotel.cnpj).includes(onlyNumbers(search));

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
        <div class="details-item ${className}">
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

    const emissor = hotel.emissor_nome || hotel.usuarios?.nome;
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

function renderHotels() {

    const filteredHotels = getFilteredHotels();

    if (filteredHotels.length === 0) {

        hotelTableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table-message">
                    Nenhuma solicitação encontrada.
                </td>
            </tr>
        `;

        return;

    }

    hotelTableBody.innerHTML = filteredHotels.map(function (hotel) {

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

                    ${
                    isAdminOrMaster()
                        ? `
                            <button
                                class="icon-button danger"
                                data-action="delete"
                                data-id="${hotel.id}"
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
        selectedHotels.size === 0 || !isAdminOrMaster()
    );

    lucide.createIcons();

}

async function updateHotelStatus(id, status) {

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

hotelForm.addEventListener("submit", saveHotel);

tipoHotel.addEventListener("change", handleTipoChange);

clearHotelForm.addEventListener("click", function () {

    hotelForm.reset();

    dataSolicitacao.value = todayISO();
    emissorNome.value = currentProfile.nome;
    pais.value = "Brasil";
    tipoHotel.value = "NACIONAL";

    handleTipoChange();

});

cnpj.addEventListener("input", function () {

    cnpj.value = formatCNPJ(cnpj.value);

});

hotelSearch.addEventListener("input", renderHotels);
statusFilter.addEventListener("change", renderHotels);
tipoFilter.addEventListener("change", renderHotels);

logoutButton.addEventListener("click", async function () {

    await supabaseClient.auth.signOut();

    window.location.href = "index.html";

});

cancelDeleteHotel.addEventListener("click", closeDeleteHotelModal);
confirmDeleteHotel.addEventListener("click", deleteHotelConfirmed);

hotelDeleteModal.addEventListener("click", function (event) {
    if (event.target === hotelDeleteModal) {
        closeDeleteHotelModal();
    }
});

function openDeleteHotelModal(id) {
    const hotel = hotels.find(item => item.id === id);

    hotelToDelete = id;

    hotelDeleteText.textContent = `Deseja excluir ${hotel?.codigo_tres || "esta solicitação"}? Esta ação não poderá ser desfeita.`;

    hotelDeleteModal.classList.remove("hidden");
    lucide.createIcons();
}

function closeDeleteHotelModal() {
    hotelToDelete = null;
    hotelDeleteModal.classList.add("hidden");
}

async function deleteHotelConfirmed() {
    if (!hotelToDelete) return;

    const { error } = await supabaseClient
        .from("solicitacoes_hotel")
        .delete()
        .eq("id", hotelToDelete);

    if (error) {
        console.error(error);
        showToast("Erro ao excluir solicitação.");
        return;
    }

    selectedHotels.delete(hotelToDelete);
    closeDeleteHotelModal();

    showToast("Solicitação excluída.");
    await loadHotels();
}

hotelTableBody.addEventListener("click", async function (event) {

    const button = event.target.closest("button");

    ...
});

hotelTableBody.addEventListener("click", async function (event) {

    const button =
        event.target.closest("button");

    if (!button) return;

    const id = button.dataset.id;

    switch (button.dataset.action) {

        case "delete":
        
        openDeleteHotelModal(id);
    
        break;

        case "details":

            openHotelDetails(id);

            break;

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

    handleTipoChange();

    setupTabs();

    await loadHotels();

    lucide.createIcons();

}

start();
