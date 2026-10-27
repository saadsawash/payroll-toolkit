const EASTERN_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const WESTERN_FROM_EASTERN = Object.fromEntries(
  [...EASTERN_DIGITS].map((digit, index) => [digit, String(index)]),
);

function toEasternDigitString(value) {
  return Math.trunc(Number(value))
    .toString()
    .replace(/\d/g, (digit) => EASTERN_DIGITS[digit]);
}

function formatFullSalary(value) {
  return Math.trunc(Number(value))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const input = document.getElementById("salary-thousands");
const gradeValue = document.getElementById("grade-value");
const levelValue = document.getElementById("level-value");
const lookupStatus = document.getElementById("lookup-status");
const lookupResult = document.getElementById("lookup-result");

/** Digits the user typed as thousands (e.g. "380"). */
let thousandsDigits = "";

function resetResult() {
  gradeValue.textContent = "—";
  levelValue.textContent = "—";
  lookupStatus.hidden = true;
  lookupStatus.textContent = "";
  lookupResult.classList.remove("lookup-result--matched", "lookup-result--miss");
}

function updateResult(fullSalary) {
  if (!thousandsDigits) {
    resetResult();
    return;
  }

  const match = findGradeAndLevel(fullSalary);

  if (!match) {
    gradeValue.textContent = "—";
    levelValue.textContent = "—";
    lookupStatus.hidden = false;
    lookupStatus.textContent = "لا توجد درجة ومرحلة مطابقة لهذا الراتب.";
    lookupResult.classList.remove("lookup-result--matched");
    lookupResult.classList.add("lookup-result--miss");
    return;
  }

  gradeValue.innerHTML = `<bdi class="numeral">${toEasternDigitString(match.grade)}</bdi>`;
  levelValue.innerHTML = `<bdi class="numeral">${toEasternDigitString(match.level)}</bdi>`;
  lookupStatus.hidden = true;
  lookupStatus.textContent = "";
  lookupResult.classList.add("lookup-result--matched");
  lookupResult.classList.remove("lookup-result--miss");
}

function renderField() {
  if (!thousandsDigits) {
    input.value = "";
    resetResult();
    return;
  }

  const fullSalary = Number(thousandsDigits) * 1000;
  input.value = formatFullSalary(fullSalary);
  updateResult(fullSalary);
}

function normalizeDigitChar(char) {
  if (/\d/.test(char)) return char;
  return WESTERN_FROM_EASTERN[char] ?? null;
}

input.addEventListener("beforeinput", (event) => {
  const type = event.inputType;

  if (type === "insertText" || type === "insertCompositionText") {
    event.preventDefault();
    const digits = [...(event.data || "")]
      .map(normalizeDigitChar)
      .filter(Boolean)
      .join("");
    if (!digits) return;
    thousandsDigits = `${thousandsDigits}${digits}`.replace(/^0+/, "") || "";
    if (thousandsDigits.length > 5) {
      thousandsDigits = thousandsDigits.slice(0, 5);
    }
    renderField();
    return;
  }

  if (type === "insertFromPaste") {
    event.preventDefault();
    const digits = [...(event.data || "")]
      .map(normalizeDigitChar)
      .filter(Boolean)
      .join("")
      .replace(/^0+/, "");
    thousandsDigits = digits.slice(0, 5);
    renderField();
    return;
  }

  if (
    type === "deleteContentBackward" ||
    type === "deleteContentForward" ||
    type === "deleteByCut" ||
    type === "deleteByDrag"
  ) {
    event.preventDefault();
    thousandsDigits = thousandsDigits.slice(0, -1);
    renderField();
  }
});

input.addEventListener("keydown", (event) => {
  if (event.key !== "Backspace" && event.key !== "Delete") return;
  // Some browsers skip beforeinput for these; keep state in sync.
  if (event.defaultPrevented) return;
});
