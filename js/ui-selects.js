(function () {
    const ENHANCED_CLASS = "tres-select-enhanced";
    const NATIVE_CLASS = "tres-select-native";

    function normalize(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function iconForOption(option) {
        const value = normalize(option.value || option.textContent);
        const text = normalize(option.textContent);
        const key = `${value} ${text}`;

        if (!option.value || key.includes("todos")) return "list-filter";
        if (key.includes("pendente")) return "clock-3";
        if (key.includes("aguardando")) return "hourglass";
        if (key.includes("cadastrado") || key.includes("concluido") || key.includes("ativo")) return "circle-check";
        if (key.includes("inativo")) return "circle-x";
        if (key.includes("master") || key.includes("admin")) return "shield-check";
        if (key.includes("usuario")) return "user";
        if (key.includes("hotel")) return "building-2";
        if (key.includes("aereo") || key.includes("assento") || key.includes("bagagem")) return "plane";
        if (key.includes("seguro")) return "shield";
        if (key.includes("locacao")) return "car";
        if (key.includes("transfer")) return "route";
        if (key.includes("r$") || key.includes("%")) return "badge-percent";

        return "circle";
    }

    function labelForSelect(select) {
        const selected = select.selectedOptions && select.selectedOptions[0];
        return selected ? selected.textContent.trim() : "Selecione";
    }

    function syncButton(custom, select) {
        const label = custom.querySelector(".tres-select-label");
        const icon = custom.querySelector(".tres-select-button i");
        const selected = select.selectedOptions && select.selectedOptions[0];

        label.textContent = labelForSelect(select);

        if (icon && selected) {
            icon.setAttribute("data-lucide", iconForOption(selected));
        }
    }

    function closeAll(except = null) {
        document.querySelectorAll(".tres-select.open").forEach(function (custom) {
            if (custom !== except) {
                custom.classList.remove("open");
                custom.classList.remove("open-up");
                custom.querySelector(".tres-select-button")?.setAttribute("aria-expanded", "false");
            }
        });
    }

    function positionSelect(custom) {
        const menu = custom.querySelector(".tres-select-menu");
        if (!menu) return;

        custom.classList.remove("open-up");

        const rect = custom.getBoundingClientRect();
        const menuHeight = menu.offsetHeight || 180;
        const margin = 14;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const insidePagination = Boolean(custom.closest(".table-pagination"));
        const shouldOpenUp = insidePagination || (spaceBelow < menuHeight + margin && spaceAbove > spaceBelow);

        custom.classList.toggle("open-up", shouldOpenUp);
    }

    function repositionOpenSelects() {
        document.querySelectorAll(".tres-select.open").forEach(positionSelect);
    }

    function renderOptions(custom, select) {
        const menu = custom.querySelector(".tres-select-menu");

        menu.innerHTML = Array.from(select.options).map(function (option) {
            const active = option.value === select.value;
            return `
                <button
                    type="button"
                    class="tres-select-option ${active ? "active" : ""}"
                    data-value="${option.value.replace(/"/g, "&quot;")}"
                    ${option.disabled ? "disabled" : ""}>
                    <i data-lucide="${iconForOption(option)}"></i>
                    <span>${option.textContent.trim()}</span>
                </button>
            `;
        }).join("");

        if (window.lucide) {
            lucide.createIcons();
        }
    }

    function enhanceSelect(select) {
        if (!select || select.dataset.tresSelect === "true" || select.multiple) return;

        select.dataset.tresSelect = "true";
        select.classList.add(NATIVE_CLASS);

        const custom = document.createElement("div");
        custom.className = `${ENHANCED_CLASS} tres-select`;
        custom.innerHTML = `
            <button type="button" class="tres-select-button" aria-expanded="false">
                <i data-lucide="${iconForOption(select.selectedOptions[0] || select.options[0] || {})}"></i>
                <span class="tres-select-label">${labelForSelect(select)}</span>
                <i data-lucide="chevron-down" class="tres-select-chevron"></i>
            </button>
            <div class="tres-select-menu"></div>
        `;

        select.insertAdjacentElement("afterend", custom);
        renderOptions(custom, select);
        syncButton(custom, select);

        custom.querySelector(".tres-select-button").addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const willOpen = !custom.classList.contains("open");
            closeAll(custom);
            custom.classList.toggle("open", willOpen);
            this.setAttribute("aria-expanded", String(willOpen));

            if (willOpen) {
                positionSelect(custom);
            }
        });

        custom.querySelector(".tres-select-menu").addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const optionButton = event.target.closest(".tres-select-option");
            if (!optionButton || optionButton.disabled) return;

            select.value = optionButton.dataset.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            renderOptions(custom, select);
            syncButton(custom, select);
            closeAll();
        });

        select.addEventListener("change", function () {
            renderOptions(custom, select);
            syncButton(custom, select);
        });

        const observer = new MutationObserver(function () {
            renderOptions(custom, select);
            syncButton(custom, select);
        });

        observer.observe(select, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["selected", "disabled", "value"]
        });
    }

    function enhanceAll() {
        document.querySelectorAll("select").forEach(enhanceSelect);
    }

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".tres-select")) {
            closeAll();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAll();
        }
    });

    window.addEventListener("resize", repositionOpenSelects);
    window.addEventListener("scroll", repositionOpenSelects, true);

    document.addEventListener("DOMContentLoaded", enhanceAll);

    window.TRESCustomSelects = {
        refresh: enhanceAll
    };
})();
