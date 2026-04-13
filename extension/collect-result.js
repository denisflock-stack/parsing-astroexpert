const COLLECT_RESULT_KEY = 'collectAllResult';

const copy = {
  en: {
    title: 'Collected data',
    subtitle: 'Review the result and copy it into the AI chat.',
    copy: 'Copy all',
    copied: 'Copied.',
    missing: 'No collected result found.',
    requestLabel: 'User request',
    requestHint: 'Here you can write your request to AI. "Copy all" will copy the data and your request together.',
    requestPlaceholder: 'Write your question here:',
    requestClipboardTitle: 'USER QUERY'
  },
  ru: {
    title: 'Собранные данные',
    subtitle: 'Проверьте результат и вставьте его в чат нейросети.',
    copy: 'Скопировать всё',
    copied: 'Скопировано.',
    missing: 'Собранный результат не найден.',
    requestLabel: 'Запрос пользователя',
    requestHint: 'Здесь вы можете написать свой запрос к ИИ. Кнопка «Скопировать всё» скопирует данные и вопрос вместе.',
    requestPlaceholder: 'Напишите свой вопрос здесь:',
    requestClipboardTitle: 'USER QUERY'
  }
};

let activeCopy = copy.en;

const elements = {
  title: document.getElementById('title'),
  subtitle: document.getElementById('subtitle'),
  copyBtn: document.getElementById('copyBtn'),
  status: document.getElementById('status'),
  resultText: document.getElementById('resultText'),
  requestLabel: document.getElementById('requestLabel'),
  requestHint: document.getElementById('requestHint'),
  userRequest: document.getElementById('userRequest')
};

function localize(language) {
  const table = copy[language] || copy.en;
  activeCopy = table;
  elements.title.textContent = table.title;
  elements.subtitle.textContent = table.subtitle;
  elements.copyBtn.textContent = table.copy;
  elements.requestLabel.textContent = table.requestLabel;
  elements.requestHint.textContent = table.requestHint;
  elements.userRequest.placeholder = table.requestPlaceholder;
  return table;
}

function buildClipboardText() {
  const resultText = (elements.resultText.value || '').trimEnd();
  const requestText = (elements.userRequest.value || '').trim();
  const requestBlock = requestText
    ? `### ${activeCopy.requestClipboardTitle}\n\n${requestText}`
    : `### ${activeCopy.requestClipboardTitle}`;
  return `${resultText}\n\n---\n\n${requestBlock}\n`;
}

async function init() {
  const stored = await chrome.storage.local.get({ [COLLECT_RESULT_KEY]: null });
  const result = stored[COLLECT_RESULT_KEY] || {};
  const table = localize(result.language === 'ru' ? 'ru' : 'en');
  elements.resultText.value = result.text || '';
  if (!result.text) {
    elements.status.textContent = table.missing;
  }

  elements.copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(buildClipboardText())
      .then(() => {
        elements.status.textContent = table.copied;
      })
      .catch((error) => {
        elements.status.textContent = error?.message || String(error);
      });
  });
}

init();
