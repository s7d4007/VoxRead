const synth = window.speechSynthesis;

const textInput = document.getElementById('textInput');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const voiceSelect = document.getElementById('voiceSelect');
const languageSelect = document.getElementById('languageSelect');
const rateRange = document.getElementById('rateRange');
const rateValue = document.getElementById('rateValue');
const pitchRange = document.getElementById('pitchRange');
const pitchValue = document.getElementById('pitchValue');
const volumeRange = document.getElementById('volumeRange');
const volumeValue = document.getElementById('volumeValue');
const statusLabel = document.getElementById('statusLabel');
const progressFill = document.getElementById('progressFill');
const accessPanel = document.getElementById('accessPanel');
const accessPanelToggle = document.getElementById('accessPanelToggle');
const accessPanelClose = document.getElementById('accessPanelClose');
const body = document.body;
const quoteText = document.getElementById('quoteText');

let voices = [];
let currentQueue = [];
let currentIndex = 0;
let currentUtterance = null;
let currentHighlight = null;
let currentMode = 'idle';
let currentFontSize = 16;

const quotes = [
  '“Reading aloud turns quiet thoughts into a clear voice.”',
  '“Every page becomes easier to follow when it can be heard.”',
  '“The right voice adds warmth to every idea.”',
  '“A calm reading experience feels like a small gift.”'
];

function updateCounts() {
  const text = textInput.value.trim();
  charCount.textContent = `${text.length} characters`;
  wordCount.textContent = `${text ? text.split(/\s+/).length : 0} words`;
}

function populateVoiceOptions() {
  voices = synth.getVoices();
  const voiceOptions = voices.filter((voice) => voice.lang.startsWith('en') || voice.lang.startsWith('es') || voice.lang.startsWith('fr') || voice.lang.startsWith('de'));

  voiceSelect.innerHTML = '';
  languageSelect.innerHTML = '';

  const languages = [...new Set(voiceOptions.map((voice) => voice.lang))].sort();
  languages.forEach((lang) => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang;
    languageSelect.appendChild(option);
  });

  voiceOptions.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  const preferredLanguage = languageSelect.value || 'en-US';
  const preferredVoice = voiceSelect.value || voiceOptions.find((voice) => voice.lang === preferredLanguage)?.name || voiceOptions[0]?.name;

  if (preferredVoice) {
    voiceSelect.value = preferredVoice;
  }

  if (!languageSelect.value) {
    languageSelect.value = preferredLanguage;
  }
}

function applySpeechSettings(utterance) {
  const selectedVoice = voices.find((voice) => voice.name === voiceSelect.value);
  const selectedLanguage = languageSelect.value;
  utterance.voice = selectedVoice || null;
  utterance.lang = selectedLanguage || 'en-US';
  utterance.rate = Number(rateRange.value);
  utterance.pitch = Number(pitchRange.value);
  utterance.volume = Number(volumeRange.value);
}

function setStatus(message) {
  statusLabel.textContent = message;
}

function clearHighlight() {
  if (currentHighlight) {
    currentHighlight.classList.remove('active-read');
  }
  currentHighlight = null;
}

function highlightElement(element) {
  clearHighlight();
  if (!element) return;
  currentHighlight = element;
  element.classList.add('active-read');
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function updateProgress() {
  if (!currentQueue.length) {
    progressFill.style.width = '0%';
    return;
  }
  const progress = ((currentIndex + 1) / currentQueue.length) * 100;
  progressFill.style.width = `${Math.min(progress, 100)}%`;
}

function stopSpeech() {
  synth.cancel();
  clearHighlight();
  currentQueue = [];
  currentIndex = 0;
  currentUtterance = null;
  currentMode = 'stopped';
  updateProgress();
  setStatus('Reading stopped');
}

function speakQueue(items) {
  if (!items || !items.length) {
    setStatus('No content to read');
    return;
  }

  currentQueue = items;
  currentIndex = 0;
  currentMode = 'speaking';
  speakNext();
}

function speakNext() {
  if (!currentQueue.length || currentIndex >= currentQueue.length) {
    currentMode = 'finished';
    updateProgress();
    setStatus('Finished reading');
    return;
  }

  const item = currentQueue[currentIndex];
  highlightElement(item.element);
  const utterance = new SpeechSynthesisUtterance(item.text);
  currentUtterance = utterance;
  applySpeechSettings(utterance);

  utterance.onstart = () => {
    setStatus(`Reading ${item.label || 'content'}`);
    updateProgress();
  };

  utterance.onend = () => {
    currentIndex += 1;
    updateProgress();
    if (currentIndex < currentQueue.length) {
      speakNext();
    } else {
      currentMode = 'finished';
      setStatus('Finished reading');
      clearHighlight();
    }
  };

  utterance.onerror = () => {
    currentMode = 'error';
    setStatus('Speech could not be played');
  };

  synth.speak(utterance);
}

function readText(text, label = 'content', element = null) {
  if (!text || !text.trim()) return;
  stopSpeech();
  const items = [{ text: text.trim(), label, element }];
  speakQueue(items);
}

function readSelection() {
  const selection = window.getSelection().toString().trim();
  if (selection) {
    readText(selection, 'selected text');
  }
}

function readPage() {
  const readableSelector = 'main h1, main h2, main h3, main p, main li, main td, main blockquote, main .faq-answer, main .readable-content';
  const items = Array.from(document.querySelectorAll(readableSelector))
    .filter((element) => {
      const text = element.textContent.replace(/\s+/g, ' ').trim();
      const readableParent = element.parentElement?.closest('.readable-content');
      return text
        && !readableParent
        && !element.closest('nav')
        && !element.closest('footer')
        && !element.closest('.toolbar')
        && !element.closest('.card-actions')
        && !element.closest('.section-actions')
        && element.tagName !== 'BUTTON';
    })
    .map((element) => ({
      text: element.textContent.replace(/\s+/g, ' ').trim(),
      label: element.tagName.toLowerCase(),
      element
    }));

  if (!items.length) return;
  speakQueue(items);
}

function setTheme(theme) {
  body.setAttribute('data-theme', theme);
  localStorage.setItem('voxread-theme', theme);
}

function adjustFontSize(delta) {
  currentFontSize = Math.min(22, Math.max(14, currentFontSize + delta));
  body.style.fontSize = `${currentFontSize}px`;
  localStorage.setItem('voxread-font-size', String(currentFontSize));
}

function restorePreferences() {
  const theme = localStorage.getItem('voxread-theme') || 'light';
  const savedSize = Number(localStorage.getItem('voxread-font-size')) || 16;
  body.setAttribute('data-theme', theme);
  body.style.fontSize = `${savedSize}px`;
  currentFontSize = savedSize;
}

function bindEvents() {
  textInput.addEventListener('input', updateCounts);
  updateCounts();

  document.getElementById('speakButton').addEventListener('click', () => readText(textInput.value, 'custom text'));
  document.getElementById('pauseButton').addEventListener('click', () => {
    if (synth.paused) return;
    synth.pause();
    setStatus('Paused');
  });
  document.getElementById('resumeButton').addEventListener('click', () => {
    if (synth.paused) {
      synth.resume();
      setStatus('Resumed');
    }
  });
  document.getElementById('stopButton').addEventListener('click', stopSpeech);
  document.getElementById('clearTextButton').addEventListener('click', () => {
    textInput.value = '';
    updateCounts();
  });
  document.getElementById('voicePreviewButton').addEventListener('click', () => readText(textInput.value || 'Voice preview ready. Adjust the controls to hear a different tone.', 'voice preview'));
  document.getElementById('readPageBtn').addEventListener('click', readPage);
  document.getElementById('readFooterButton').addEventListener('click', () => readText('VoxRead is a universal text-to-speech website built with HTML, CSS, JavaScript and the Web Speech API.', 'footer'));

  document.querySelectorAll('[data-read-target]').forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-read-target');
      const target = document.getElementById(targetId);
      if (target) {
        readText(target.textContent.replace(/\s+/g, ' ').trim(), button.textContent, target);
      }
    });
  });

  document.getElementById('readQuoteButton').addEventListener('click', () => readText(quoteText.textContent, 'quote', quoteText));
  document.getElementById('newQuoteButton').addEventListener('click', () => {
    const nextQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteText.textContent = nextQuote;
  });

  document.getElementById('readStoryButton').addEventListener('click', () => readText(document.getElementById('storyText').textContent, 'story', document.getElementById('storyText')));
  document.getElementById('pauseStoryButton').addEventListener('click', () => {
    if (synth.paused) return;
    synth.pause();
    setStatus('Story paused');
  });
  document.getElementById('resumeStoryButton').addEventListener('click', () => {
    if (synth.paused) {
      synth.resume();
      setStatus('Story resumed');
    }
  });
  document.getElementById('stopStoryButton').addEventListener('click', stopSpeech);

  document.querySelectorAll('.clickable-read').forEach((element) => {
    element.addEventListener('click', () => readText(element.textContent.replace(/\s+/g, ' ').trim(), 'clicked content', element));
  });

  document.addEventListener('mouseup', () => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      readSelection();
    }
  });

  accessPanelToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    accessPanel.classList.toggle('open');
  });
  accessPanelClose.addEventListener('click', () => accessPanel.classList.remove('open'));
  document.addEventListener('click', (event) => {
    if (!accessPanel.classList.contains('open')) return;
    if (!accessPanel.contains(event.target) && event.target !== accessPanelToggle) {
      accessPanel.classList.remove('open');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && accessPanel.classList.contains('open')) {
      accessPanel.classList.remove('open');
    }
  });
  document.getElementById('fontIncrease').addEventListener('click', () => adjustFontSize(1));
  document.getElementById('fontDecrease').addEventListener('click', () => adjustFontSize(-1));
  document.getElementById('themeToggle').addEventListener('click', () => {
    const theme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(theme);
  });
  document.getElementById('panelReadPage').addEventListener('click', readPage);
  document.getElementById('panelStop').addEventListener('click', stopSpeech);

  [rateRange, pitchRange, volumeRange].forEach((input) => {
    input.addEventListener('input', () => {
      const label = input.id === 'rateRange' ? rateValue : input.id === 'pitchRange' ? pitchValue : volumeValue;
      label.textContent = `${Number(input.value).toFixed(1)}x`;
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (synth.paused) {
        synth.resume();
        setStatus('Resumed');
      } else if (synth.speaking) {
        synth.pause();
        setStatus('Paused');
      }
    }

    if (event.code === 'Escape') {
      stopSpeech();
    }
  });
}

function init() {
  if (!('speechSynthesis' in window)) {
    setStatus('Speech synthesis is not supported in this browser.');
    return;
  }

  restorePreferences();
  populateVoiceOptions();
  bindEvents();

  if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = populateVoiceOptions;
  }
  setTimeout(populateVoiceOptions, 400);
}

init();
