const COLLECT_RESULT_KEY = 'collectAllResult';

const copy = {
  en: {
    title: 'Collected data',
    subtitle: 'Review the result and copy it into the AI chat.',
    copy: 'Copy all',
    copied: 'Copied.',
    missing: 'No collected result found.',
    requestLabel: 'User request',
    requestHint: 'Here you can write your request to AI and copy everything together.',
    requestPlaceholder: 'Write your question here...'
  },
  ru: {
    title: 'Собранные данные',
    subtitle: 'Проверьте результат и вставьте его в чат нейросети.',
    copy: 'Скопировать всё',
    copied: 'Скопировано.',
    missing: 'Собранный результат не найден.',
    requestLabel: 'Запрос пользователя',
    requestHint: 'Здесь вы можете написать свой запрос к ИИ и скопировать всё вместе.',
    requestPlaceholder: 'Напишите свой вопрос здесь...'
  }
};

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
  return requestText ? `${resultText}\n\n${requestText}\n` : `${resultText}\n`;
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
