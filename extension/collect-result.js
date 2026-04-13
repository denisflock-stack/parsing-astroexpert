const COLLECT_RESULT_KEY = 'collectAllResult';

const copy = {
  en: {
    title: 'Collected data',
    subtitle: 'Review the result and copy it into the AI chat.',
    copy: 'Copy result',
    copied: 'Copied.',
    missing: 'No collected result found.'
  },
  ru: {
    title: 'Собранные данные',
    subtitle: 'Проверьте результат и вставьте его в чат нейросети.',
    copy: 'Скопировать итог',
    copied: 'Скопировано.',
    missing: 'Собранный результат не найден.'
  }
};

const elements = {
  title: document.getElementById('title'),
  subtitle: document.getElementById('subtitle'),
  copyBtn: document.getElementById('copyBtn'),
  status: document.getElementById('status'),
  resultText: document.getElementById('resultText')
};

function localize(language) {
  const table = copy[language] || copy.en;
  elements.title.textContent = table.title;
  elements.subtitle.textContent = table.subtitle;
  elements.copyBtn.textContent = table.copy;
  return table;
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
    navigator.clipboard.writeText(elements.resultText.value || '')
      .then(() => {
        elements.status.textContent = table.copied;
      })
      .catch((error) => {
        elements.status.textContent = error?.message || String(error);
      });
  });
}

init();
