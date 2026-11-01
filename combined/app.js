const form = document.getElementById("combined-form");
const result = document.getElementById("result");
const resultContent = document.getElementById("result-content");
const allowancesList = document.getElementById("allowances-list");
const addAllowanceBtn = document.getElementById("add-allowance");
const allowanceSection = document.getElementById("allowance-section");
const promotionSection = document.getElementById("promotion-section");
const oldSalaryInput = document.getElementById("old-salary");
const oldSalaryHint = document.getElementById("old-salary-hint");
const orgNameInput = document.getElementById("org-name");
const STORAGE_KEY = "tools-combined-v1";
const ORG_NAME_KEY = "tools-org-name-v1";
const MAX_ALLOWANCES = 10;
const DAYS_PER_MONTH = 30;
const DEFAULT_TYPE = "both";

const employeeFields = [
  {
    id: "employee-name",
    validate: (value) => value.trim().length > 0,
  },
  {
    id: "job-title",
    validate: (value) => value.trim().length > 0,
  },
  {
    id: "education-level",
    validate: (value) => value.trim().length > 0,
  },
  {
    id: "salary-list-order",
    validate: (value) => {
      if (value.trim() === "") return true;
      const number = Number(value);
      return Number.isInteger(number) && number >= 1 && number <= 5000;
    },
  },
];

const allowanceFields = [
  {
    id: "allowance-number",
    validate: (value) => Number(value) >= 1,
  },
  {
    id: "allowance-doc-date",
    validate: (value) => Boolean(parseDateInput(value)),
  },
];

const promotionFields = [
  {
    id: "order-number",
    validate: (value) => Number(value) >= 1,
  },
  {
    id: "order-date",
    validate: (value) => Boolean(parseDateInput(value)),
  },
  {
    id: "new-job-title",
    validate: (value) => value.trim().length > 0,
  },
  {
    id: "old-salary",
    validate: (value) => value !== "" && Number(value) >= 0,
  },
  {
    id: "new-salary",
    validate: (value) => value !== "" && Number(value) >= 0,
  },
  {
    id: "from-date",
    validate: (value) => {
      const date = parseDateInput(value);
      return Boolean(date) && date.day >= 1 && date.day <= DAYS_PER_MONTH;
    },
    message: "يوم البداية يجب أن يكون بين ١ و ٣٠.",
  },
  {
    id: "to-date",
    validate: (value) => {
      const date = parseDateInput(value);
      return Boolean(date) && date.day === DAYS_PER_MONTH;
    },
    message: "يجب أن يكون يوم النهاية ٣٠ (شهر ٣٠ يوماً).",
  },
];

const staticFields = [...employeeFields, ...allowanceFields, ...promotionFields];

/** @type {{ currentSalary: string, newSalary: string, fromDate: string, toDate: string }[]} */
let allowances = [emptyAllowance()];

function emptyAllowance() {
  return { currentSalary: "", newSalary: "", fromDate: "", toDate: "" };
}

const monthNames = [
  "كانون الثاني",
  "شباط",
  "آذار",
  "نيسان",
  "أيار",
  "حزيران",
  "تموز",
  "آب",
  "أيلول",
  "تشرين الأول",
  "تشرين الثاني",
  "كانون الأول",
];

const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function toEasternDigitString(value) {
  return Math.trunc(Number(value))
    .toString()
    .replace(/\d/g, (digit) => EASTERN_DIGITS[digit]);
}

function toEasternDigits(value) {
  return Math.trunc(Number(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    .replace(/\d/g, (digit) => EASTERN_DIGITS[digit]);
}

function formatNumber(value) {
  return `<bdi class="numeral">${toEasternDigits(value)}</bdi>`;
}

function formatPlainNumber(value) {
  return `<bdi class="numeral">${toEasternDigitString(value)}</bdi>`;
}

function formatGradeAndLevel(salary) {
  const match = findGradeAndLevel(salary);
  if (!match) return "—";
  return `الدرجة ${formatPlainNumber(match.grade)} · المرحلة ${formatPlainNumber(match.level)}`;
}

function escapeHtml(value) {
  const element = document.createElement("div");
  element.textContent = value;
  return element.innerHTML;
}

function eqTerm(value, label, { strong = false, meta = "" } = {}) {
  const numberHtml = strong
    ? `<strong>${formatNumber(value)}</strong>`
    : formatNumber(value);
  const metaHtml = meta ? `<span class="eq-meta">${meta}</span>` : "";
  const termClass = strong ? "eq-term eq-term--highlight" : "eq-term";

  return `
    <span class="${termClass}">
      ${numberHtml}
      <span class="eq-label">${label}</span>
      ${metaHtml}
    </span>
  `;
}

function summaryChip(order) {
  return `
    <span class="summary-chip">
      <span class="summary-chip-label">تسلسل</span>
      <bdi class="numeral summary-chip-num">${toEasternDigitString(order)}</bdi>
    </span>
  `;
}

function parseDateInput(value) {
  if (!value || typeof value !== "string") return null;

  const normalized = value
    .trim()
    .replace(/[٠-٩]/g, (digit) => String(EASTERN_DIGITS.indexOf(digit)))
    .replace(/\//g, "-");
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return { year, month, day };
}

function monthLabel(year, month) {
  return `${monthNames[month - 1]} ${toEasternDigitString(year)}`;
}

function formatNumericDate(dateInput) {
  const raw = `${dateInput.year}/${String(dateInput.month).padStart(2, "0")}/${String(dateInput.day).padStart(2, "0")}`;
  return raw.replace(/\d/g, (digit) => EASTERN_DIGITS[digit]);
}

/** Months between the start month and the end month, not counting the start month. */
function monthSpan(start, end) {
  return (end.year - start.year) * 12 + (end.month - start.month);
}

function addMonths({ year, month }, count) {
  const index = year * 12 + (month - 1) + count;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

function listMonths(start, count) {
  const months = [];
  for (let i = 0; i < count; i += 1) {
    const { year, month } = addMonths(start, i);
    months.push(monthLabel(year, month));
  }
  return months;
}

/**
 * Increment arrears: difference × months, counting from the start month up to
 * but not including the end month. Days are ignored.
 */
function calculateAllowance({ currentSalary, newSalary, fromDate, toDate }) {
  const salaryDifference = newSalary - currentSalary;
  const start = parseDateInput(fromDate);
  const end = parseDateInput(toDate);
  const differenceMonths = monthSpan(start, end);
  const monthsList = listMonths(start, differenceMonths);
  const differencesTotal = salaryDifference * differenceMonths;

  return {
    currentSalary,
    newSalary,
    salaryDifference,
    start,
    end,
    differenceMonths,
    monthsList,
    differencesTotal,
  };
}

/**
 * Promotion arrears (30-day month):
 * - Start month: difference × days from the start day to day 30, both
 *   included (e.g. 13→30 = 18 days), ÷ 30.
 * - Each later month through the end month: the full new salary, because
 *   promoted staff were not paid at all for those months.
 */
function calculatePromotion({ oldSalary, newSalary, fromDate, toDate }) {
  const start = parseDateInput(fromDate);
  const end = parseDateInput(toDate);
  const salaryDifference = newSalary - oldSalary;
  const partialDays = DAYS_PER_MONTH - start.day + 1;
  const partialAmount = Math.round((salaryDifference * partialDays) / DAYS_PER_MONTH);
  const laterMonths = monthSpan(start, end);
  const newSalaryTotal = newSalary * laterMonths;
  const promotionTotal = partialAmount + newSalaryTotal;

  return {
    oldSalary,
    newSalary,
    salaryDifference,
    start,
    end,
    partialDays,
    partialAmount,
    laterMonths,
    newSalaryTotal,
    promotionTotal,
  };
}

function setFieldError(inputOrId, hasError, message) {
  const input =
    typeof inputOrId === "string"
      ? document.getElementById(inputOrId)
      : inputOrId;
  if (!input) return;

  const error = document.getElementById(`${input.id}-error`);
  const field = input.closest(".field");

  if (field) field.classList.toggle("has-error", hasError);
  if (error) {
    if (error.dataset.defaultMessage === undefined) {
      error.dataset.defaultMessage = error.textContent.trim();
    }
    error.textContent = message || error.dataset.defaultMessage;
    error.hidden = !hasError;
  }
}

function selectedType() {
  const checked = form.querySelector('input[name="changeType"]:checked');
  return checked ? checked.value : DEFAULT_TYPE;
}

function includesAllowance(type) {
  return type === "allowance" || type === "both";
}

function includesPromotion(type) {
  return type === "promotion" || type === "both";
}

function setSelectedType(type) {
  const radio = form.querySelector(`input[name="changeType"][value="${type}"]`);
  if (radio) radio.checked = true;
}

/** Shows the sections for the selected type and links the promotion's old salary to the last increment. */
function applyType() {
  const type = selectedType();
  allowanceSection.hidden = !includesAllowance(type);
  promotionSection.hidden = !includesPromotion(type);

  const linked = type === "both";
  oldSalaryInput.readOnly = linked;
  oldSalaryHint.hidden = !linked;
  if (linked) syncLinkedOldSalary();
}

function syncLinkedOldSalary() {
  if (selectedType() !== "both") return;
  oldSalaryInput.value = allowances[allowances.length - 1]?.newSalary ?? "";
  setFieldError(oldSalaryInput, false);
}

function syncAllowancesFromDom() {
  const rows = [...allowancesList.querySelectorAll(".allowance-row")];
  allowances = rows.map((row) => ({
    currentSalary: row.querySelector('[data-field="currentSalary"]').value,
    newSalary: row.querySelector('[data-field="newSalary"]').value,
    fromDate: row.querySelector('[data-field="fromDate"]').value,
    toDate: row.querySelector('[data-field="toDate"]').value,
  }));
}

function allowanceTitle(index, count = allowances.length) {
  return count > 1 ? `العلاوة ${toEasternDigitString(index + 1)}` : "العلاوة";
}

function createAllowanceRow(index, data, { focusSalary = false } = {}) {
  const row = document.createElement("div");
  row.className = "allowance-row";
  row.dataset.index = String(index);

  const title = `العلاوة ${toEasternDigitString(index + 1)}`;
  const canRemove = index > 0;
  const removeHtml = canRemove
    ? `<button type="button" class="allowance-remove" aria-label="إزالة ${title}">إزالة</button>`
    : `<span class="allowance-remove-spacer" aria-hidden="true"></span>`;

  row.innerHTML = `
    <div class="allowance-row-head">
      <h3 class="allowance-row-title">${title}</h3>
      ${removeHtml}
    </div>
    <div class="allowance-row-fields">
      <div class="field">
        <label for="allowance-${index}-current">الراتب قبل العلاوة</label>
        <div class="input-with-suffix">
          <input
            type="number"
            id="allowance-${index}-current"
            data-field="currentSalary"
            min="0"
            step="1"
            inputmode="numeric"
            placeholder="0"
            value="${escapeHtml(data.currentSalary)}"
            required
          />
          <span class="suffix">دينار</span>
        </div>
        <p class="error" id="allowance-${index}-current-error" hidden>
          يرجى إدخال الراتب قبل العلاوة.
        </p>
      </div>
      <div class="field">
        <label for="allowance-${index}-salary">الراتب بعد العلاوة</label>
        <div class="input-with-suffix">
          <input
            type="number"
            id="allowance-${index}-salary"
            data-field="newSalary"
            min="0"
            step="1"
            inputmode="numeric"
            placeholder="0"
            value="${escapeHtml(data.newSalary)}"
            required
          />
          <span class="suffix">دينار</span>
        </div>
        <p class="error" id="allowance-${index}-salary-error" hidden>
          يرجى إدخال الراتب بعد العلاوة.
        </p>
      </div>
      <div class="field">
        <label for="allowance-${index}-from">اعتباراً من</label>
        <input
          type="text"
          id="allowance-${index}-from"
          data-field="fromDate"
          class="date-input"
          inputmode="numeric"
          placeholder="2026-05-01"
          autocomplete="off"
          dir="ltr"
          value="${escapeHtml(data.fromDate)}"
          required
        />
        <p class="error" id="allowance-${index}-from-error" hidden>
          يرجى إدخال تاريخ صحيح مثل 2026-05-01.
        </p>
      </div>
      <div class="field">
        <label for="allowance-${index}-to">لغاية</label>
        <input
          type="text"
          id="allowance-${index}-to"
          data-field="toDate"
          class="date-input"
          inputmode="numeric"
          placeholder="2026-10-30"
          autocomplete="off"
          dir="ltr"
          value="${escapeHtml(data.toDate)}"
          required
        />
        <p class="error" id="allowance-${index}-to-error" hidden>
          يرجى إدخال تاريخ صحيح مثل 2026-10-30.
        </p>
      </div>
    </div>
  `;

  row.querySelectorAll("input").forEach((input) => {
    const persist = () => {
      setFieldError(input, false);
      syncAllowancesFromDom();
      syncLinkedOldSalary();
      saveFormData();
    };
    input.addEventListener("input", persist);
    input.addEventListener("change", persist);
  });

  const removeBtn = row.querySelector(".allowance-remove");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      syncAllowancesFromDom();
      allowances.splice(index, 1);
      if (allowances.length === 0) {
        allowances = [emptyAllowance()];
      }
      renderAllowancesList();
      syncLinkedOldSalary();
      saveFormData();
    });
  }

  allowancesList.appendChild(row);

  if (focusSalary) {
    row.querySelector('[data-field="currentSalary"]').focus();
  }
}

function renderAllowancesList({ focusIndex = null } = {}) {
  allowancesList.innerHTML = "";
  allowances.forEach((item, index) => {
    createAllowanceRow(index, item, { focusSalary: focusIndex === index });
  });
  addAllowanceBtn.disabled = allowances.length >= MAX_ALLOWANCES;
}

function isBeforeMonth(a, b) {
  return a.year < b.year || (a.year === b.year && a.month < b.month);
}

function validateForm() {
  const type = selectedType();
  let firstInvalid = null;
  let isValid = true;

  const fail = (input, message) => {
    setFieldError(input, true, message);
    isValid = false;
    if (!firstInvalid) firstInvalid = input;
  };

  const validateFields = (list) => {
    for (const field of list) {
      const input = document.getElementById(field.id);
      const ok = field.validate(input.value);
      setFieldError(input, false);
      if (!ok) fail(input, input.value && field.message ? field.message : undefined);
    }
  };

  // Validate in page order so focus lands on the first invalid field.
  validateFields(employeeFields);

  const promotionStart = includesPromotion(type)
    ? parseDateInput(document.getElementById("from-date").value)
    : null;

  if (includesAllowance(type)) {
    validateFields(allowanceFields);
    syncAllowancesFromDom();
    const rows = [...allowancesList.querySelectorAll(".allowance-row")];

    rows.forEach((row) => {
      const currentInput = row.querySelector('[data-field="currentSalary"]');
      const salaryInput = row.querySelector('[data-field="newSalary"]');
      const fromInput = row.querySelector('[data-field="fromDate"]');
      const toInput = row.querySelector('[data-field="toDate"]');

      const currentOk =
        currentInput.value !== "" && Number(currentInput.value) >= 0;
      setFieldError(currentInput, !currentOk);
      if (!currentOk) fail(currentInput);

      const salaryOk = salaryInput.value !== "" && Number(salaryInput.value) >= 0;
      setFieldError(salaryInput, !salaryOk);
      if (!salaryOk) {
        fail(salaryInput);
      } else if (currentOk && Number(salaryInput.value) < Number(currentInput.value)) {
        fail(salaryInput, "الراتب بعد العلاوة يجب أن يكون أكبر من أو يساوي الراتب قبلها.");
      }

      const start = parseDateInput(fromInput.value);
      setFieldError(fromInput, !start);
      if (!start) fail(fromInput);

      const end = parseDateInput(toInput.value);
      setFieldError(toInput, !end);
      if (!end) {
        fail(toInput);
      } else if (start && !isBeforeMonth(start, end)) {
        fail(toInput, "يجب أن يكون تاريخ النهاية في شهر لاحق لشهر البداية.");
      } else if (promotionStart && isBeforeMonth(promotionStart, end)) {
        fail(toInput, "يجب ألا يتجاوز شهر نهاية العلاوة شهر بداية الترفيع.");
      }
    });
  }

  if (includesPromotion(type)) {
    validateFields(promotionFields);
    const oldValue = oldSalaryInput.value;
    const newInput = document.getElementById("new-salary");

    if (oldValue === "" && type === "both") {
      setFieldError(oldSalaryInput, true, "أدخل الراتب بعد آخر علاوة أولاً.");
      isValid = false;
    }

    if (oldValue !== "" && newInput.value !== "" && Number(newInput.value) < Number(oldValue)) {
      fail(newInput, "الراتب بعد الترفيع يجب أن يكون أكبر من أو يساوي الراتب قبله.");
    }

    const toInput = document.getElementById("to-date");
    const end = parseDateInput(toInput.value);
    if (promotionStart && end && isBeforeMonth(end, promotionStart)) {
      fail(toInput, "تاريخ النهاية يجب أن يكون في شهر البداية أو بعده.");
    }
  }

  if (firstInvalid) firstInvalid.focus();
  return isValid;
}

function todayDate() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function stepBadge(number, title) {
  return `<span class="step-badge"><span class="step-num">${toEasternDigitString(number)}</span>${title}</span>`;
}

function renderAllowanceBlock(title, data, finalStep = "") {
  const firstMonth = data.monthsList[0];
  const lastMonth = data.monthsList[data.monthsList.length - 1];

  return `
    <section class="allowance-block">
      <h3 class="allowance-block-title">${title}</h3>
      <ol class="steps">
        <li>
          ${stepBadge(1, "احتساب مقدار العلاوة")}
          <div class="step-body">
            <div class="equation">
              ${eqTerm(data.newSalary, "الراتب بعد العلاوة")}
              <span class="eq-op">−</span>
              ${eqTerm(data.currentSalary, "الراتب قبل العلاوة")}
              <span class="eq-op">=</span>
              ${eqTerm(data.salaryDifference, "مقدار العلاوة", { strong: true })}
            </div>
          </div>
        </li>
        <li>
          ${stepBadge(2, "احتساب عدد اشهر الفروقات")}
          <div class="step-body">
            <p>
              من <strong>${firstMonth}</strong>
              لغاية <strong>${lastMonth}</strong>
              = <strong>${formatNumber(data.differenceMonths)}</strong> أشهر
            </p>
            <p class="months-list">${data.monthsList.join("، ")}</p>
          </div>
        </li>
        <li>
          ${stepBadge(3, "احتساب مجموع فروقات العلاوة")}
          <div class="step-body">
            <div class="equation">
              ${eqTerm(data.salaryDifference, "مقدار العلاوة")}
              <span class="eq-op">×</span>
              ${eqTerm(data.differenceMonths, "عدد الأشهر")}
              <span class="eq-op">=</span>
              ${eqTerm(data.differencesTotal, "فروقات العلاوة", { strong: true })}
            </div>
          </div>
        </li>
        ${finalStep}
      </ol>
    </section>
  `;
}

function renderPromotionBlock(data, { isFinal = false } = {}) {
  const totalTitle = isFinal ? "المبلغ النهائي" : "احتساب مجموع فروقات الترفيع";
  const totalLabel = isFinal ? "المبلغ النهائي" : "فروقات الترفيع";
  const laterStart = addMonths(data.start, 1);
  const laterRange =
    data.laterMonths === 1
      ? `<strong>${monthLabel(data.end.year, data.end.month)}</strong>`
      : `من <strong>${monthLabel(laterStart.year, laterStart.month)}</strong>
         لغاية <strong>${monthLabel(data.end.year, data.end.month)}</strong>`;

  const laterSteps =
    data.laterMonths > 0
      ? `
      <li>
        ${stepBadge(3, "احتساب الرواتب الاسمية للأشهر اللاحقة")}
        <div class="step-body">
          <div class="equation">
            ${eqTerm(data.newSalary, "الراتب بعد الترفيع")}
            <span class="eq-op">×</span>
            ${eqTerm(data.laterMonths, "عدد الأشهر")}
            <span class="eq-op">=</span>
            ${eqTerm(data.newSalaryTotal, "مجموع الرواتب", { strong: true })}
          </div>
          <p class="step-note">
            ${laterRange}
            = <strong>${formatNumber(data.laterMonths)}</strong> راتب اسمي جديد
          </p>
        </div>
      </li>
      <li>
        ${stepBadge(4, totalTitle)}
        <div class="step-body">
          <div class="equation">
            ${eqTerm(data.partialAmount, "فرق الأيام")}
            <span class="eq-op">+</span>
            ${eqTerm(data.newSalaryTotal, "مجموع الرواتب")}
            <span class="eq-op">=</span>
            ${eqTerm(data.promotionTotal, totalLabel, { strong: true })}
          </div>
        </div>
      </li>
    `
      : "";

  return `
    <section class="allowance-block">
      <h3 class="allowance-block-title">الترفيع</h3>
      <ol class="steps">
        <li>
          ${stepBadge(1, "احتساب مقدار الترفيع")}
          <div class="step-body">
            <div class="equation">
              ${eqTerm(data.newSalary, "الراتب بعد الترفيع")}
              <span class="eq-op">−</span>
              ${eqTerm(data.oldSalary, "الراتب قبل الترفيع")}
              <span class="eq-op">=</span>
              ${eqTerm(data.salaryDifference, "مقدار الترفيع", { strong: true })}
            </div>
          </div>
        </li>
        <li>
          ${stepBadge(2, "احتساب فرق أيام شهر البداية")}
          <div class="step-body">
            <div class="equation">
              ${eqTerm(data.salaryDifference, "مقدار الترفيع")}
              <span class="eq-op">×</span>
              ${eqTerm(data.partialDays, "الأيام")}
              <span class="eq-op">÷</span>
              ${eqTerm(DAYS_PER_MONTH, "أيام الشهر")}
              <span class="eq-op">=</span>
              ${eqTerm(data.partialAmount, "فرق الأيام", { strong: true })}
            </div>
            <p class="step-note">
              من يوم <strong>${formatPlainNumber(data.start.day)}</strong>
              لغاية يوم <strong>${formatPlainNumber(DAYS_PER_MONTH)}</strong>
              من <strong>${monthLabel(data.start.year, data.start.month)}</strong>
              = <strong>${formatNumber(data.partialDays)}</strong> يوماً
            </p>
          </div>
        </li>
        ${laterSteps}
      </ol>
    </section>
  `;
}

function periodLine(key, value) {
  return `
    <p class="period-line">
      <span class="period-k">${key}</span>
      <span class="period-v">${value}</span>
    </p>
  `;
}

function documentValue(number, date) {
  return `رقم ${formatPlainNumber(number)}
    <span class="period-sep">·</span>
    ${formatNumericDate(date)}`;
}

function renderPeriodRow(label, docLine, start, end, beforeSalary, afterSalary, extraLines = "") {
  const labelHtml = label
    ? `<span class="period-label">${label}</span>`
    : "";

  return `
    <div class="period-row">
      ${labelHtml}
      ${docLine}
      <p class="period-range">
        <span class="period-k">الفترة</span>
        <span class="period-v">
          ${formatNumericDate(start)}
          <span class="period-sep">إلى</span>
          ${formatNumericDate(end)}
        </span>
      </p>
      <p class="period-grades">
        <span class="period-k">الدرجة والمرحلة</span>
        <span class="period-v">
          ${formatGradeAndLevel(beforeSalary)}
          <span class="period-sep">إلى</span>
          ${formatGradeAndLevel(afterSalary)}
        </span>
      </p>
      ${extraLines}
    </div>
  `;
}

const sheetTitles = {
  allowance: "احتساب فروقات العلاوة",
  promotion: "احتساب فروقات الترفيع",
  both: "احتساب فروقات العلاوة والترفيع",
};

/**
 * Final amount = all increment arrears + promotion arrears + the last new
 * salary once (the salary for the month after the last period).
 */
function renderResult({ type, increments, promotion }, info) {
  const count = increments.length;
  const lastEnd = promotion ? promotion.end : increments[count - 1].end;
  const finalSalary = promotion ? promotion.newSalary : increments[count - 1].newSalary;
  const paymentMonth = addMonths(lastEnd, 1);
  const parts = [
    ...increments.map((item, index) => ({
      amount: item.differencesTotal,
      label: `فروقات ${allowanceTitle(index, count)}`,
    })),
    ...(promotion ? [{ amount: promotion.promotionTotal, label: "فروقات الترفيع" }] : []),
  ];
  // Promotion only: the promotion arrears are the final amount (no salary
  // added once on top). Other types add the last new salary once.
  const promotionOnly = type === "promotion";
  // Increments only: the months run up to but not including the end month,
  // so the salary added once is the end month's own salary (step 4).
  const allowanceOnly = type === "allowance";
  const finalSalaryMonth = allowanceOnly ? lastEnd : paymentMonth;
  const grandTotal = promotionOnly
    ? promotion.promotionTotal
    : parts.reduce((sum, part) => sum + part.amount, 0) + finalSalary;
  const labelPeriods = parts.length > 1;

  const allowanceDocLine = includesAllowance(type)
    ? periodLine("كتاب العلاوة", documentValue(info.allowanceNumber, info.allowanceDocDate))
    : "";

  const periodsHtml = [
    ...increments.map((item, index) =>
      renderPeriodRow(
        labelPeriods ? allowanceTitle(index, count) : "",
        allowanceDocLine,
        item.start,
        item.end,
        item.currentSalary,
        item.newSalary,
      ),
    ),
    ...(promotion
      ? [
          renderPeriodRow(
            labelPeriods ? "الترفيع" : "",
            periodLine("الأمر الإداري", documentValue(info.orderNumber, info.orderDate)),
            promotion.start,
            promotion.end,
            promotion.oldSalary,
            promotion.newSalary,
            periodLine(
              "العنوان الوظيفي",
              `${escapeHtml(info.jobTitle)}
               <span class="period-sep">إلى</span>
               ${escapeHtml(info.newJobTitle)}`,
            ),
          ),
        ]
      : []),
  ].join("");

  const allowanceFinalStep = allowanceOnly
    ? `
      <li>
        ${stepBadge(4, "المبلغ النهائي")}
        <div class="step-body">
          <div class="equation equation--total">
            ${parts
              .map(
                (part, index) =>
                  `${index > 0 ? '<span class="eq-op">+</span>' : ""}${eqTerm(part.amount, part.label)}`,
              )
              .join("")}
            <span class="eq-op">+</span>
            ${eqTerm(finalSalary, "الراتب بعد العلاوة", { meta: `راتب ${monthLabel(finalSalaryMonth.year, finalSalaryMonth.month)}` })}
            <span class="eq-op">=</span>
            ${eqTerm(grandTotal, "المبلغ النهائي", { strong: true })}
          </div>
        </div>
      </li>
    `
    : "";

  const blocksHtml = [
    ...increments.map((item, index) =>
      renderAllowanceBlock(
        allowanceTitle(index, count),
        item,
        allowanceOnly && index === count - 1 ? allowanceFinalStep : "",
      ),
    ),
    ...(promotion ? [renderPromotionBlock(promotion, { isFinal: promotionOnly })] : []),
  ].join("");

  const sumTerms = parts
    .map(
      (part, index) =>
        `${index > 0 ? '<span class="eq-op">+</span>' : ""}${eqTerm(part.amount, part.label)}`,
    )
    .join("");

  const finalSalaryLabel = promotion ? "الراتب بعد الترفيع" : "الراتب بعد آخر علاوة";

  const totalBlockHtml = promotionOnly || allowanceOnly
    ? ""
    : `
      <section class="allowance-block allowance-block--combined">
        <h3 class="allowance-block-title">الإجمالي</h3>
        <div class="equation equation--total">
          ${sumTerms}
          <span class="eq-op">+</span>
          ${eqTerm(finalSalary, finalSalaryLabel, { meta: `راتب ${monthLabel(paymentMonth.year, paymentMonth.month)}` })}
          <span class="eq-op">=</span>
          ${eqTerm(grandTotal, "المبلغ النهائي", { strong: true })}
        </div>
      </section>
    `;

  const orgHtml = info.orgName
    ? `<p class="sheet-org">${escapeHtml(info.orgName)}</p>`
    : "";

  const sequenceHtml = info.salaryListOrder
    ? summaryChip(info.salaryListOrder)
    : "";

  resultContent.innerHTML = `
    <div class="sheet-header">
      <div class="sheet-header-main">
        <h2 class="sheet-title">${sheetTitles[type]}</h2>
      </div>
      <div class="sheet-header-meta">
        ${orgHtml}
        <p class="sheet-date">تاريخ التنظيم: ${formatNumericDate(todayDate())}</p>
      </div>
    </div>

    <section class="sheet-summary">
      <div class="summary-identity">
        <div class="summary-name-row">
          <h3 class="summary-name">${escapeHtml(info.employeeName)}</h3>
          ${sequenceHtml}
        </div>
        <p class="summary-facts">
          <span class="summary-fact">العنوان الوظيفي: <span class="summary-doc">${escapeHtml(info.jobTitle)}</span></span>
          <span class="summary-dot" aria-hidden="true">·</span>
          <span class="summary-fact">الشهادة: <span class="summary-doc">${escapeHtml(info.educationLevel)}</span></span>
        </p>
      </div>

      <div class="summary-periods" aria-label="فترات الاحتساب">
        ${periodsHtml}
      </div>
    </section>

    <div class="result-calculations">
      ${blocksHtml}
      ${totalBlockHtml}
    </div>

    <div class="total">
      <span>الراتب الاسمي مع الفروقات</span>
      <strong>${formatNumber(grandTotal)} دينار</strong>
    </div>
  `;
}

function readFormData() {
  syncAllowancesFromDom();
  const data = { type: selectedType() };
  for (const { id } of staticFields) {
    data[id] = document.getElementById(id).value;
  }
  data.allowances = allowances;
  return data;
}

function saveFormData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(readFormData()));
}

function loadFormData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const data = JSON.parse(raw);
    if (sheetTitles[data.type]) setSelectedType(data.type);

    for (const { id } of staticFields) {
      if (data[id] !== undefined && data[id] !== null) {
        document.getElementById(id).value = data[id];
      }
    }

    if (Array.isArray(data.allowances) && data.allowances.length > 0) {
      allowances = data.allowances.slice(0, MAX_ALLOWANCES).map((item) => ({
        currentSalary: item.currentSalary || "",
        newSalary: item.newSalary || "",
        fromDate: item.fromDate || "",
        toDate: item.toDate || "",
      }));
    }
    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

function loadOrgName() {
  orgNameInput.value = localStorage.getItem(ORG_NAME_KEY) || "";
}

function clearFormErrors() {
  for (const { id } of staticFields) {
    setFieldError(id, false);
  }

  allowancesList.querySelectorAll("input").forEach((input) => {
    setFieldError(input, false);
  });
}

let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.hidden = false;
  toast.classList.remove("toast-out");
  toast.classList.add("toast-in");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("toast-in");
    toast.classList.add("toast-out");
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
      toast.classList.remove("toast-out");
    }, 280);
  }, 3200);
}

/** Normalize the promotion end date day to 30 when year/month are valid. */
function normalizeEndDateDay() {
  const input = document.getElementById("to-date");
  const date = parseDateInput(input.value);
  if (!date) return;
  if (date.day === DAYS_PER_MONTH) return;
  input.value = `${date.year}-${String(date.month).padStart(2, "0")}-${DAYS_PER_MONTH}`;
  saveFormData();
}

addAllowanceBtn.addEventListener("click", () => {
  if (allowances.length >= MAX_ALLOWANCES) return;
  syncAllowancesFromDom();
  allowances.push(emptyAllowance());
  renderAllowancesList({ focusIndex: allowances.length - 1 });
  syncLinkedOldSalary();
  saveFormData();
});

form.querySelectorAll('input[name="changeType"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    applyType();
    result.hidden = true;
    saveFormData();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = selectedType();
  if (includesPromotion(type)) normalizeEndDateDay();

  if (!validateForm()) {
    result.hidden = true;
    return;
  }

  syncAllowancesFromDom();
  const increments = includesAllowance(type)
    ? allowances.map((item) =>
        calculateAllowance({
          currentSalary: Number(item.currentSalary),
          newSalary: Number(item.newSalary),
          fromDate: item.fromDate,
          toDate: item.toDate,
        }),
      )
    : [];

  const promotion = includesPromotion(type)
    ? calculatePromotion({
        oldSalary: Number(oldSalaryInput.value),
        newSalary: Number(document.getElementById("new-salary").value),
        fromDate: document.getElementById("from-date").value,
        toDate: document.getElementById("to-date").value,
      })
    : null;

  saveFormData();

  const info = {
    orgName: orgNameInput.value.trim(),
    employeeName: document.getElementById("employee-name").value.trim(),
    jobTitle: document.getElementById("job-title").value.trim(),
    educationLevel: document.getElementById("education-level").value,
    salaryListOrder: document.getElementById("salary-list-order").value.trim(),
    allowanceNumber: document.getElementById("allowance-number").value,
    allowanceDocDate: parseDateInput(document.getElementById("allowance-doc-date").value),
    orderNumber: document.getElementById("order-number").value,
    orderDate: parseDateInput(document.getElementById("order-date").value),
    newJobTitle: document.getElementById("new-job-title").value.trim(),
  };

  renderResult({ type, increments, promotion }, info);
  result.hidden = false;
  result.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.getElementById("print-btn").addEventListener("click", () => {
  updatePrintContinuationNotice();
  window.print();
});

window.addEventListener("beforeprint", updatePrintContinuationNotice);
window.addEventListener("afterprint", () => {
  const notice = document.getElementById("print-continuation");
  if (notice) notice.hidden = true;
  document.body.classList.remove("has-print-continuation");
});

function updatePrintContinuationNotice() {
  const content = document.getElementById("result-content");
  const notice = document.getElementById("print-continuation");
  if (!content || !notice || result.hidden) {
    if (notice) notice.hidden = true;
    document.body.classList.remove("has-print-continuation");
    return;
  }

  const pageContentHeightPx = ((297 - 9 - 9) / 25.4) * 96;
  const needsContinuation = content.scrollHeight > pageContentHeightPx - 12;

  notice.hidden = !needsContinuation;
  document.body.classList.toggle("has-print-continuation", needsContinuation);
}

document.querySelector(".clear-fab").addEventListener("click", (event) => {
  if (!window.confirm("هل أنت متأكد من تفريغ جميع الحقول؟")) {
    event.preventDefault();
  }
});

form.addEventListener("reset", () => {
  localStorage.removeItem(STORAGE_KEY);
  result.hidden = true;
  resultContent.innerHTML = "";
  allowances = [emptyAllowance()];

  window.requestAnimationFrame(() => {
    loadOrgName();
    renderAllowancesList();
    applyType();
    clearFormErrors();
    document.getElementById("employee-name").focus();
  });
});

staticFields.forEach(({ id }) => {
  const input = document.getElementById(id);
  const persist = () => {
    setFieldError(id, false);
    if (id === "to-date") normalizeEndDateDay();
    saveFormData();
  };
  input.addEventListener("input", persist);
  input.addEventListener("change", persist);
});

orgNameInput.addEventListener("input", () => {
  localStorage.setItem(ORG_NAME_KEY, orgNameInput.value);
});

loadOrgName();
loadFormData();
renderAllowancesList();
applyType();
