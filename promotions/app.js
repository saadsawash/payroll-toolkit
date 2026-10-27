const form = document.getElementById("promotion-form");
const result = document.getElementById("result");
const resultContent = document.getElementById("result-content");
const STORAGE_KEY = "tools-promotions-v1";
const DAYS_PER_MONTH = 30;

const fieldIds = [
  "employee-name",
  "salary-list-order",
  "order-number",
  "order-date",
  "old-salary",
  "new-salary",
  "from-date",
  "to-date",
];

const fields = [
  {
    id: "employee-name",
    validate: (value) => value.trim().length > 0,
  },
  {
    id: "salary-list-order",
    validate: (value) => {
      const number = Number(value);
      return Number.isInteger(number) && number >= 1 && number <= 5000;
    },
  },
  {
    id: "order-number",
    validate: (value) => Number(value) >= 1,
  },
  {
    id: "order-date",
    validate: (value) => Boolean(parseDateInput(value)),
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
  },
  {
    id: "to-date",
    validate: (value) => {
      const date = parseDateInput(value);
      return Boolean(date) && date.day === DAYS_PER_MONTH;
    },
  },
];

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

function eqTerm(value, label, { strong = false } = {}) {
  const numberHtml = strong
    ? `<strong>${formatNumber(value)}</strong>`
    : formatNumber(value);
  const termClass = strong ? "eq-term eq-term--highlight" : "eq-term";

  return `
    <span class="${termClass}">
      ${numberHtml}
      <span class="eq-label">${label}</span>
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

function monthSpan(start, end) {
  return (end.year - start.year) * 12 + (end.month - start.month);
}

/**
 * Promotion arrears:
 * - Month is always 30 days.
 * - Partial days in the start month: 30 - start.day (e.g. 15→30 = 15 days).
 * - Same month: only the day difference amount.
 * - Later end month: newSalary × monthSpan + partial day amount.
 */
function calculatePromotion({ oldSalary, newSalary, fromDate, toDate }) {
  const start = parseDateInput(fromDate);
  const end = parseDateInput(toDate);
  const salaryDifference = newSalary - oldSalary;
  const partialDays = DAYS_PER_MONTH - start.day;
  const partialAmount = Math.round((salaryDifference * partialDays) / DAYS_PER_MONTH);
  const span = monthSpan(start, end);
  const newSalaryTotal = newSalary * span;
  const grandTotal = newSalaryTotal + partialAmount;

  return {
    oldSalary,
    newSalary,
    salaryDifference,
    start,
    end,
    partialDays,
    partialAmount,
    monthSpan: span,
    newSalaryTotal,
    grandTotal,
  };
}

function setFieldError(id, hasError, message) {
  const input = document.getElementById(id);
  const error = document.getElementById(`${id}-error`);
  const field = input?.closest(".field");

  if (field) field.classList.toggle("has-error", hasError);
  if (error) {
    if (message) error.textContent = message;
    error.hidden = !hasError;
  }
}

function validateForm() {
  let firstInvalid = null;
  let isValid = true;

  for (const field of fields) {
    const input = document.getElementById(field.id);
    const ok = field.validate(input.value);
    let message;

    if (field.id === "to-date" && input.value && !ok) {
      message = "يجب أن يكون يوم النهاية ٣٠ (شهر ٣٠ يوماً).";
    } else if (field.id === "from-date" && input.value && !ok) {
      message = "يوم البداية يجب أن يكون بين ١ و ٣٠.";
    }

    setFieldError(field.id, !ok, message);

    if (!ok) {
      isValid = false;
      if (!firstInvalid) firstInvalid = input;
    }
  }

  const oldSalary = Number(document.getElementById("old-salary").value);
  const newSalary = Number(document.getElementById("new-salary").value);
  const newInput = document.getElementById("new-salary");

  if (
    document.getElementById("old-salary").value !== "" &&
    document.getElementById("new-salary").value !== "" &&
    newSalary < oldSalary
  ) {
    setFieldError(
      "new-salary",
      true,
      "الراتب بعد الترفيع يجب أن يكون أكبر من أو يساوي الراتب قبله.",
    );
    isValid = false;
    if (!firstInvalid) firstInvalid = newInput;
  }

  const start = parseDateInput(document.getElementById("from-date").value);
  const end = parseDateInput(document.getElementById("to-date").value);
  const toInput = document.getElementById("to-date");

  if (start && end) {
    const span = monthSpan(start, end);
    if (
      end.year < start.year ||
      (end.year === start.year && end.month < start.month) ||
      (span === 0 && end.day < start.day)
    ) {
      setFieldError(
        "to-date",
        true,
        "تاريخ النهاية يجب أن يكون في شهر البداية أو بعده.",
      );
      isValid = false;
      if (!firstInvalid) firstInvalid = toInput;
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

function renderResult(data, info) {
  const sameMonth = data.monthSpan === 0;

  const salarySteps = `
    <li>
      <span class="step-badge"><span class="step-num">${toEasternDigitString(1)}</span>احتساب مقدار الترفيع</span>
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
      <span class="step-badge"><span class="step-num">${toEasternDigitString(2)}</span>احتساب فرق أيام شهر البداية</span>
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
  `;

  const monthRangeNote =
    data.start.year === data.end.year
      ? `من <strong>${monthNames[data.start.month - 1]}</strong> إلى <strong>${monthNames[data.end.month - 1]} ${toEasternDigitString(data.end.year)}</strong>`
      : `من <strong>${monthLabel(data.start.year, data.start.month)}</strong> إلى <strong>${monthLabel(data.end.year, data.end.month)}</strong>`;

  const monthSteps = sameMonth
    ? `
    <li>
      <span class="step-badge"><span class="step-num">${toEasternDigitString(3)}</span>المبلغ النهائي</span>
      <div class="step-body">
        <div class="equation">
          ${eqTerm(data.partialAmount, "فرق الأيام", { strong: true })}
        </div>
        <p class="step-note">نفس الشهر — يُحتسب فرق الأيام فقط.</p>
      </div>
    </li>
  `
    : `
    <li>
      <span class="step-badge"><span class="step-num">${toEasternDigitString(3)}</span>احتساب الرواتب الاسمية للأشهر اللاحقة</span>
      <div class="step-body">
        <div class="equation">
          ${eqTerm(data.newSalary, "الراتب بعد الترفيع")}
          <span class="eq-op">×</span>
          ${eqTerm(data.monthSpan, "عدد الأشهر")}
          <span class="eq-op">=</span>
          ${eqTerm(data.newSalaryTotal, "مجموع الرواتب", { strong: true })}
        </div>
        <p class="step-note">
          ${monthRangeNote}
          = <strong>${formatNumber(data.monthSpan)}</strong> راتب اسمي جديد
        </p>
      </div>
    </li>
    <li>
      <span class="step-badge"><span class="step-num">${toEasternDigitString(4)}</span>المبلغ النهائي</span>
      <div class="step-body">
        <div class="equation">
          ${eqTerm(data.newSalaryTotal, "مجموع الرواتب")}
          <span class="eq-op">+</span>
          ${eqTerm(data.partialAmount, "فرق الأيام")}
          <span class="eq-op">=</span>
          ${eqTerm(data.grandTotal, "المبلغ النهائي", { strong: true })}
        </div>
      </div>
    </li>
  `;

  resultContent.innerHTML = `
    <div class="sheet-header">
      <div class="sheet-header-main">
        <h2 class="sheet-title">احتساب فروقات الترفيع</h2>
      </div>
      <div class="sheet-header-meta">
        <p class="sheet-org">مديرية تقاعد كركوك</p>
        <p class="sheet-date">تاريخ التنظيم: ${formatNumericDate(todayDate())}</p>
      </div>
    </div>

    <section class="sheet-summary">
      <div class="summary-identity">
        <div class="summary-name-row">
          <h3 class="summary-name">${escapeHtml(info.employeeName)}</h3>
          ${summaryChip(info.salaryListOrder)}
        </div>
        <p class="summary-facts summary-doc">
          <span>أمر إداري رقم ${formatPlainNumber(info.orderNumber)}</span>
          <span class="summary-dot" aria-hidden="true">·</span>
          <span>${formatNumericDate(info.orderDate)}</span>
        </p>
      </div>

      <div class="summary-periods" aria-label="فترة الاستحقاق">
        <div class="period-row">
          <p class="period-range">
            <span class="period-k">تاريخ الاستحقاق</span>
            <span class="period-v">
              ${formatNumericDate(data.start)}
              <span class="period-sep">إلى</span>
              ${formatNumericDate(data.end)}
            </span>
          </p>
          <p class="period-grades">
            <span class="period-k">الدرجة والمرحلة</span>
            <span class="period-v">
              ${formatGradeAndLevel(data.oldSalary)}
              <span class="period-sep">إلى</span>
              ${formatGradeAndLevel(data.newSalary)}
            </span>
          </p>
        </div>
      </div>
    </section>

    <div class="result-calculations">
      <ol class="steps">
        ${salarySteps}
        ${monthSteps}
      </ol>
    </div>

    <div class="total">
      <span>الراتب الاسمي مع الفروقات</span>
      <strong>${formatNumber(data.grandTotal)} دينار</strong>
    </div>
  `;
}

function readFormData() {
  const data = {};
  for (const id of fieldIds) {
    data[id] = document.getElementById(id).value;
  }
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
    for (const id of fieldIds) {
      if (data[id] !== undefined && data[id] !== null) {
        const el = document.getElementById(id);
        if (el) el.value = data[id];
      }
    }
    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

function clearSavedFormData() {
  localStorage.removeItem(STORAGE_KEY);
}

function clearFormErrors() {
  for (const field of fields) {
    setFieldError(field.id, false);
  }
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

/** Normalize end date day to 30 when year/month are valid. */
function normalizeEndDateDay() {
  const input = document.getElementById("to-date");
  const date = parseDateInput(input.value);
  if (!date) return;
  if (date.day === DAYS_PER_MONTH) return;
  input.value = `${date.year}-${String(date.month).padStart(2, "0")}-${DAYS_PER_MONTH}`;
  saveFormData();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  normalizeEndDateDay();

  if (!validateForm()) {
    result.hidden = true;
    return;
  }

  const oldSalary = Number(document.getElementById("old-salary").value);
  const newSalary = Number(document.getElementById("new-salary").value);

  if (newSalary < oldSalary) {
    showToast("الراتب بعد الترفيع أقل من الراتب قبله. يرجى المراجعة.");
    result.hidden = true;
    return;
  }

  const data = calculatePromotion({
    oldSalary,
    newSalary,
    fromDate: document.getElementById("from-date").value,
    toDate: document.getElementById("to-date").value,
  });

  saveFormData();

  const info = {
    employeeName: document.getElementById("employee-name").value.trim(),
    salaryListOrder: document.getElementById("salary-list-order").value.trim(),
    orderNumber: document.getElementById("order-number").value,
    orderDate: parseDateInput(document.getElementById("order-date").value),
  };

  renderResult(data, info);
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
  clearSavedFormData();
  result.hidden = true;
  resultContent.innerHTML = "";

  window.requestAnimationFrame(() => {
    clearFormErrors();
    document.getElementById("employee-name").focus();
  });
});

fields.forEach(({ id }) => {
  const input = document.getElementById(id);
  const persist = () => {
    setFieldError(id, false);
    if (id === "to-date") normalizeEndDateDay();
    saveFormData();
  };
  input.addEventListener("input", persist);
  input.addEventListener("change", persist);
});

loadFormData();
