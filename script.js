const DEFAULT_SENTENCES = ["The weather is nice today."];

const setupForm = document.querySelector("#setup-form");
const sentenceForm = document.querySelector("#sentence-form");
const questionCountInput = document.querySelector("#question-count");
const sentenceFields = document.querySelector("#sentence-fields");
const results = document.querySelector("#results");
const clearResultsButton = document.querySelector("#clear-results");

function splitSentence(sentence) {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

function shuffleWords(words) {
  const shuffled = [...words];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  if (shuffled.length > 1 && shuffled.every((word, index) => word === words[index])) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function getHintIndex(words) {
  if (words.length === 0) {
    return -1;
  }

  const index = words.findIndex((word) => word.toLowerCase().replace(/[^a-z]/g, "") === "weather");
  return index >= 0 ? index : Math.floor(words.length / 2);
}

function createBlankQuestion(words) {
  const hintIndex = getHintIndex(words);

  return words
    .map((word, index) => (index === hintIndex ? word : "_____"))
    .join("  ");
}

function renderSentenceFields(count) {
  sentenceFields.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const field = document.createElement("div");
    field.className = "field";

    const label = document.createElement("label");
    label.setAttribute("for", `sentence-${index}`);
    label.textContent = `第 ${index + 1} 題英文句子`;

    const textarea = document.createElement("textarea");
    textarea.id = `sentence-${index}`;
    textarea.name = "sentence";
    textarea.placeholder = "例如：The weather is nice today.";
    textarea.required = true;
    textarea.value = DEFAULT_SENTENCES[index] ?? "";

    field.append(label, textarea);
    sentenceFields.append(field);
  }
}

function renderEmptyResults(message = "尚未產生結果。請先輸入句子並按下「產生打亂題目」。") {
  results.className = "results empty-state";
  results.textContent = message;
}

function renderResults(sentences) {
  results.className = "results";
  results.innerHTML = "";

  sentences.forEach((sentence, index) => {
    const words = splitSentence(sentence);
    const shuffledWords = shuffleWords(words);
    const card = document.createElement("article");
    card.className = "result-card";

    const header = document.createElement("header");
    header.innerHTML = `<h3>第 ${index + 1} 題</h3><p class="original">原句：${escapeHtml(sentence)}</p>`;

    const body = document.createElement("div");
    body.className = "result-body";
    body.innerHTML = `
      <p class="output-line"><strong>打亂排序：</strong>${escapeHtml(shuffledWords.join(" / "))}</p>
      <p class="output-line"><strong>題目：</strong>${escapeHtml(createBlankQuestion(words))}</p>
    `;

    card.append(header, body);
    results.append(card);
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const count = Number.parseInt(questionCountInput.value, 10);

  if (!Number.isInteger(count) || count < 1 || count > 50) {
    renderEmptyResults("請輸入 1 到 50 之間的題數。");
    return;
  }

  renderSentenceFields(count);
  renderEmptyResults();
});

sentenceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const sentences = [...sentenceForm.querySelectorAll('textarea[name="sentence"]')]
    .map((textarea) => textarea.value.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    renderEmptyResults("請至少輸入一個英文句子。");
    return;
  }

  renderResults(sentences);
});

clearResultsButton.addEventListener("click", () => {
  renderEmptyResults();
});

renderSentenceFields(Number.parseInt(questionCountInput.value, 10));
