(function () {
    const MONTHS = [
        "janeiro", "fevereiro", "março", "abril", "maio", "junho",
        "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
    ];
    const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function toISO(date) {
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    }

    function parseISO(value) {
        if (!value) return null;
        const parts = String(value).split("-").map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function formatDate(value) {
        const date = parseISO(value);
        if (!date) return "Selecione";
        return date.toLocaleDateString("pt-BR");
    }

    function sameDay(a, b) {
        return a && b && toISO(a) === toISO(b);
    }

    function closeAll(except = null) {
        document.querySelectorAll(".tres-date.open").forEach(function (picker) {
            if (picker !== except) picker.classList.remove("open");
        });
    }

    function getMinDate(input) {
        return parseISO(input.getAttribute("min"));
    }

    function syncButton(input, picker) {
        picker.querySelector(".tres-date-label").textContent = formatDate(input.value);
    }

    function positionCalendar(picker) {
        const menu = picker.querySelector(".tres-date-menu");
        if (!menu) return;

        picker.classList.remove("open-up");

        const pickerRect = picker.getBoundingClientRect();
        const menuHeight = menu.offsetHeight || 330;
        const margin = 16;
        const spaceBelow = window.innerHeight - pickerRect.bottom;
        const spaceAbove = pickerRect.top;
        const shouldOpenUp = spaceBelow < menuHeight + margin && spaceAbove > spaceBelow;

        picker.classList.toggle("open-up", shouldOpenUp);
    }

    function repositionOpenCalendars() {
        document.querySelectorAll(".tres-date.open").forEach(positionCalendar);
    }

    function renderCalendar(input, picker, viewDate) {
        const selected = parseISO(input.value);
        const minDate = getMinDate(input);
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const first = new Date(year, month, 1);
        const start = new Date(year, month, 1 - first.getDay());
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];
        for (let index = 0; index < 42; index += 1) {
            const day = new Date(start);
            day.setDate(start.getDate() + index);
            day.setHours(0, 0, 0, 0);

            const outside = day.getMonth() !== month;
            const disabled = minDate && day < minDate;

            days.push(`
                <button
                    type="button"
                    class="tres-date-day ${outside ? "muted" : ""} ${sameDay(day, selected) ? "selected" : ""} ${sameDay(day, today) ? "today" : ""}"
                    data-date="${toISO(day)}"
                    ${disabled ? "disabled" : ""}>
                    ${day.getDate()}
                </button>
            `);
        }

        picker.querySelector(".tres-date-menu").innerHTML = `
            <div class="tres-date-head">
                <button type="button" class="tres-date-nav" data-calendar-action="prev" aria-label="Mês anterior" title="Mês anterior">
                    <i data-lucide="chevron-left"></i>
                </button>
                <strong>${MONTHS[month]} de ${year}</strong>
                <button type="button" class="tres-date-nav" data-calendar-action="next" aria-label="Próximo mês" title="Próximo mês">
                    <i data-lucide="chevron-right"></i>
                </button>
            </div>
            <div class="tres-date-weekdays">
                ${WEEKDAYS.map(function (day) { return `<span>${day}</span>`; }).join("")}
            </div>
            <div class="tres-date-days">
                ${days.join("")}
            </div>
            <div class="tres-date-footer">
                <button type="button" data-calendar-action="clear">Limpar</button>
                <button type="button" data-calendar-action="today">Hoje</button>
            </div>
        `;

        picker.dataset.viewYear = String(year);
        picker.dataset.viewMonth = String(month);

        if (window.lucide) lucide.createIcons();
    }

    function setInputValue(input, picker, value) {
        input.value = value;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
        syncButton(input, picker);
    }

    function enhanceDate(input) {
        if (!input || input.dataset.tresDate === "true" || input.disabled) return;

        input.dataset.tresDate = "true";
        input.classList.add("tres-date-native");

        const picker = document.createElement("div");
        picker.className = "tres-date";
        picker.innerHTML = `
            <button type="button" class="tres-date-button">
                <i data-lucide="calendar-days"></i>
                <span class="tres-date-label">${formatDate(input.value)}</span>
                <i data-lucide="chevron-down" class="tres-date-chevron"></i>
            </button>
            <div class="tres-date-menu"></div>
        `;

        input.insertAdjacentElement("afterend", picker);

        let viewDate = parseISO(input.value) || new Date();
        renderCalendar(input, picker, viewDate);

        picker.querySelector(".tres-date-button").addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            viewDate = parseISO(input.value) || viewDate || getMinDate(input) || new Date();
            renderCalendar(input, picker, viewDate);
            const willOpen = !picker.classList.contains("open");
            closeAll(picker);
            picker.classList.toggle("open", willOpen);
            if (willOpen) positionCalendar(picker);
        });

        picker.querySelector(".tres-date-menu").addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const action = event.target.closest("[data-calendar-action]")?.dataset.calendarAction;
            const day = event.target.closest(".tres-date-day");

            if (action === "prev" || action === "next") {
                viewDate = new Date(Number(picker.dataset.viewYear), Number(picker.dataset.viewMonth), 1);
                viewDate.setMonth(viewDate.getMonth() + (action === "next" ? 1 : -1));
                renderCalendar(input, picker, viewDate);
                positionCalendar(picker);
                return;
            }

            if (action === "clear") {
                setInputValue(input, picker, "");
                closeAll();
                return;
            }

            if (action === "today") {
                const today = toISO(new Date());
                if (!getMinDate(input) || parseISO(today) >= getMinDate(input)) {
                    setInputValue(input, picker, today);
                }
                closeAll();
                return;
            }

            if (day && !day.disabled) {
                setInputValue(input, picker, day.dataset.date);
                closeAll();
            }
        });

        input.addEventListener("change", function () {
            syncButton(input, picker);
            renderCalendar(input, picker, parseISO(input.value) || viewDate || new Date());
            if (picker.classList.contains("open")) positionCalendar(picker);
        });
    }

    function enforceDatePair(startId, endId) {
        const start = document.getElementById(startId);
        const end = document.getElementById(endId);
        if (!start || !end) return;

        function applyRule() {
            if (start.value) {
                end.min = start.value;
            } else {
                end.removeAttribute("min");
            }

            if (start.value && end.value && end.value < start.value) {
                end.value = "";
                end.dispatchEvent(new Event("input", { bubbles: true }));
                end.dispatchEvent(new Event("change", { bubbles: true }));
            }

            window.TRESDatePickers?.refresh();
        }

        start.addEventListener("change", applyRule);
        end.addEventListener("change", function () {
            if (start.value && end.value && end.value < start.value) {
                end.value = "";
                end.dispatchEvent(new Event("input", { bubbles: true }));
                end.dispatchEvent(new Event("change", { bubbles: true }));
            }
        });

        applyRule();
    }

    function enhanceAll() {
        document.querySelectorAll("input[type='date']").forEach(enhanceDate);
        document.querySelectorAll(".tres-date").forEach(function (picker) {
            const input = picker.previousElementSibling;
            if (input) {
                syncButton(input, picker);
                if (!picker.classList.contains("open")) {
                    const date = parseISO(input.value) || getMinDate(input) || new Date();
                    picker.dataset.viewYear = String(date.getFullYear());
                    picker.dataset.viewMonth = String(date.getMonth());
                }
            }
        });
    }

    document.addEventListener("click", function (event) {
        if (!event.target.closest(".tres-date")) closeAll();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeAll();
    });

    window.addEventListener("resize", repositionOpenCalendars);
    window.addEventListener("scroll", repositionOpenCalendars, true);

    document.addEventListener("DOMContentLoaded", function () {
        enhanceAll();
        enforceDatePair("checkin", "checkout");
        enforceDatePair("startDate", "endDate");
        enforceDatePair("hotelStartDate", "hotelEndDate");
        enforceDatePair("financeStartDate", "financeEndDate");
        setTimeout(enhanceAll, 80);
        setTimeout(enhanceAll, 400);
    });

    window.TRESDatePickers = {
        refresh: enhanceAll
    };
})();
