const setupForm = document.querySelector("#setup-form");
const sentencesForm = document.querySelector("#sentences-form");
const questionCountInput = document.querySelector("#question-count");
const sentenceFields = document.querySelector("#sentence-fields");
const output = document.querySelector("#output");
const copyButton = document.querySelector("#copy-button");
const worksheetButton = document.querySelector("#worksheet-button");
const printWorksheetButton = document.querySelector("#print-worksheet-button");
const worksheetSection = document.querySelector("#worksheet-section");
const worksheetList = document.querySelector("#worksheet-list");
const clearButton = document.querySelector("#clear-button");
const sampleButton = document.querySelector("#sample-button");

const sampleSentences = [
  "The weather is nice today.",
  "I want to learn English every day.",
  "She usually drinks coffee in the morning.",
  "My brother plays basketball after school.",
  "We are going to visit the museum tomorrow.",
  "This book is very interesting.",
  "Please open the window before class starts.",
  "They cooked dinner together last night.",
  "The little cat sleeps under the table.",
  "He finished his homework before dinner.",
];

let lastPlainText = "";
let lastResults = [];

function createSentenceFields(count) {
  const existingValues = Array.from(sentenceFields.querySelectorAll("textarea")).map(
    (textarea) => textarea.value,
  );

  sentenceFields.innerHTML = "";

  for (let index = 0; index < count; index += 1) {
    const wrapper = document.createElement("div");
    wrapper.className = "sentence-field";

    const label = document.createElement("label");
    label.className = "field-label";
    label.setAttribute("for", `sentence-${index + 1}`);
    label.textContent = `第 ${index + 1} 題`;

    const textarea = document.createElement("textarea");
    textarea.className = "sentence-input";
    textarea.id = `sentence-${index + 1}`;
    textarea.name = `sentence-${index + 1}`;
    textarea.placeholder = "請輸入英文句子";
    textarea.value = existingValues[index] || "";

    wrapper.append(label, textarea);
    sentenceFields.append(wrapper);
  }
}

function tokenize(sentence) {
  return sentence.trim().split(/\s+/).filter(Boolean);
}

function shuffleWords(words) {
  const shuffled = [...words];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  if (words.length > 1 && shuffled.join(" ") === words.join(" ")) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }

  return shuffled;
}

function buildQuestion(sentence, questionNumber) {
  const words = tokenize(sentence);
  const clueIndex = words.length > 1 ? 1 : 0;
  const wordsToScramble = words.filter((_, index) => index !== clueIndex);
  const scrambledWords = shuffleWords(wordsToScramble);
  const blanks = words.map((word, index) => (index === clueIndex ? word : "_____"));

  return {
    questionNumber,
    scrambled: scrambledWords.join(" / "),
    blankQuestion: blanks.join("  "),
  };
}

function resetGeneratedResults(message = "請先輸入句子並按下「產生打亂題目」。") {
  output.className = "output empty-state";
  output.textContent = message;
  copyButton.disabled = true;
  worksheetButton.disabled = true;
  worksheetSection.hidden = true;
  worksheetList.innerHTML = "";
  lastPlainText = "";
  lastResults = [];
}

function renderResults(results) {
  output.classList.remove("empty-state");
  output.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const plainTextRows = [];

  results.forEach((result) => {
    const article = document.createElement("article");
    article.className = "result-item";

    const title = document.createElement("h3");
    title.textContent = `第 ${result.questionNumber} 題`;

    const scrambled = document.createElement("p");
    scrambled.className = "scrambled";
    scrambled.textContent = result.scrambled;

    const question = document.createElement("p");
    question.className = "blank-line";
    question.textContent = `題目：${result.blankQuestion}`;

    article.append(title, scrambled, question);
    fragment.append(article);

    plainTextRows.push(`第 ${result.questionNumber} 題\n${result.scrambled}\n題目：${result.blankQuestion}`);
  });

  output.append(fragment);
  lastPlainText = plainTextRows.join("\n\n");
  lastResults = results;
  copyButton.disabled = results.length === 0;
  worksheetButton.disabled = results.length === 0;
  worksheetSection.hidden = true;
  worksheetList.innerHTML = "";
}

function renderWorksheet(results) {
  worksheetList.innerHTML = "";

  const fragment = document.createDocumentFragment();

  results.forEach((result) => {
    const listItem = document.createElement("li");
    listItem.className = "worksheet-item";

    const wordBank = document.createElement("p");
    wordBank.className = "worksheet-word-bank";
    wordBank.textContent = result.scrambled;

    const blankQuestion = document.createElement("p");
    blankQuestion.className = "worksheet-blank-line";
    blankQuestion.textContent = result.blankQuestion;

    listItem.append(wordBank, blankQuestion);
    fragment.append(listItem);
  });

  worksheetList.append(fragment);
  worksheetSection.hidden = false;
  worksheetSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const count = Number.parseInt(questionCountInput.value, 10);

  if (!Number.isInteger(count) || count < 1) {
    questionCountInput.value = "1";
    createSentenceFields(1);
    resetGeneratedResults();
    return;
  }

  createSentenceFields(Math.min(count, 100));
  resetGeneratedResults();
});

sentencesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const sentences = Array.from(sentenceFields.querySelectorAll("textarea"))
    .map((textarea) => textarea.value.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    resetGeneratedResults("請至少輸入一個英文句子。");
    return;
  }

  renderResults(sentences.map((sentence, index) => buildQuestion(sentence, index + 1)));
});

clearButton.addEventListener("click", () => {
  sentenceFields.querySelectorAll("textarea").forEach((textarea) => {
    textarea.value = "";
  });
  resetGeneratedResults();
});

sampleButton.addEventListener("click", () => {
  questionCountInput.value = sampleSentences.length;
  createSentenceFields(sampleSentences.length);
  sentenceFields.querySelectorAll("textarea").forEach((textarea, index) => {
    textarea.value = sampleSentences[index];
  });
  resetGeneratedResults();
});

worksheetButton.addEventListener("click", () => {
  if (lastResults.length === 0) return;
  renderWorksheet(lastResults);
});

printWorksheetButton.addEventListener("click", () => {
  window.print();
});

copyButton.addEventListener("click", async () => {
  if (!lastPlainText) return;

  await navigator.clipboard.writeText(lastPlainText);
  copyButton.textContent = "已複製";
  window.setTimeout(() => {
    copyButton.textContent = "複製結果";
  }, 1600);
});

createSentenceFields(Number.parseInt(questionCountInput.value, 10));