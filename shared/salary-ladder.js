/**
 * Iraqi civil-service nominal salary ladder (full dinars).
 * Outer index = grade (الدرجة, 1-based), inner = stage (المرحلة, 1-based).
 */
const SALARY_LADDER = [
  [910000, 930000, 950000, 970000, 990000, 1010000, 1030000, 1050000, 1070000, 1090000, 1110000],
  [723000, 740000, 757000, 774000, 791000, 808000, 825000, 842000, 859000, 876000, 893000],
  [600000, 610000, 620000, 630000, 640000, 650000, 660000, 670000, 680000, 690000, 700000],
  [509000, 517000, 525000, 533000, 541000, 549000, 557000, 565000, 573000, 581000, 589000],
  [429000, 435000, 441000, 447000, 453000, 459000, 465000, 471000, 477000, 483000, 489000],
  [362000, 368000, 374000, 380000, 386000, 392000, 398000, 404000, 410000, 416000, 422000],
  [296000, 302000, 308000, 314000, 320000, 326000, 332000, 338000, 344000, 350000, 356000],
  [260000, 263000, 266000, 269000, 272000, 275000, 278000, 281000, 284000, 287000, 290000],
  [210000, 213000, 216000, 219000, 222000, 225000, 228000, 231000, 234000, 237000, 240000],
  [170000, 173000, 176000, 179000, 182000, 185000, 188000, 191000, 194000, 197000, 200000],
];

const SALARY_LADDER_LOOKUP = new Map();

for (let gradeIndex = 0; gradeIndex < SALARY_LADDER.length; gradeIndex += 1) {
  for (let levelIndex = 0; levelIndex < SALARY_LADDER[gradeIndex].length; levelIndex += 1) {
    SALARY_LADDER_LOOKUP.set(SALARY_LADDER[gradeIndex][levelIndex], {
      grade: gradeIndex + 1,
      level: levelIndex + 1,
    });
  }
}

function findGradeAndLevel(salary) {
  if (!Number.isFinite(salary) || salary <= 0) {
    return null;
  }
  return SALARY_LADDER_LOOKUP.get(Math.trunc(salary)) ?? null;
}
