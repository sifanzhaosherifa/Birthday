const partyButton = document.querySelector("#partyButton");
const voiceButton = document.querySelector("#voiceButton");
const statusMessage = document.querySelector("#statusMessage");
const stageCaption = document.querySelector("#stageCaption");
const confettiLayer = document.querySelector("#confettiLayer");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const PARTY_DURATION = 20000;
const MATCHED_COMMAND = "文学生日快乐";

let recognition;
let isListening = false;
let celebrationTimer;
let confettiTimer;
let audioContext;
let mutationIndex = 0;
const activeAudioSources = new Set();
const portraitMutations = [
  "mutation-base",
  "mutation-cyan",
  "mutation-mirror",
  "mutation-acid",
  "mutation-void",
];

function setStatus(message) {
  statusMessage.textContent = message;
}

function normalizeSpeech(text) {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s,，。.!！?？、;；:："'“”‘’()（）\[\]{}<>《》—_-]/g, "");
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function rememberSource(source) {
  activeAudioSources.add(source);
  source.addEventListener("ended", () => activeAudioSources.delete(source), { once: true });
}

function stopActiveAudio() {
  activeAudioSources.forEach((source) => {
    try {
      source.stop();
    } catch {
      // A source can have ended before the celebration timer fires.
    }
  });
  activeAudioSources.clear();
}

function playTone(frequency, startTime, duration, options = {}) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  oscillator.type = options.type || "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(options.volume || 0.09, startTime + 0.018);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(gainNode).connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
  rememberSource(oscillator);
}

function playBirthdayMusic() {
  const context = getAudioContext();
  if (!context) {
    setStatus("此浏览器不能播放合成音效，但派对照样开始！");
    return;
  }

  const notes = {
    G4: 392.0,
    A4: 440.0,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    F5: 698.46,
    G5: 783.99,
  };
  const phrase = [
    ["G4", 0.28], ["G4", 0.28], ["A4", 0.55], ["G4", 0.55], ["C5", 0.55], ["B4", 0.9],
    ["G4", 0.28], ["G4", 0.28], ["A4", 0.55], ["G4", 0.55], ["D5", 0.55], ["C5", 0.9],
    ["G4", 0.28], ["G4", 0.28], ["G5", 0.55], ["E5", 0.55], ["C5", 0.55], ["B4", 0.55], ["A4", 0.9],
    ["F5", 0.28], ["F5", 0.28], ["E5", 0.55], ["C5", 0.55], ["D5", 0.55], ["C5", 1.0],
  ];

  const phraseLength = phrase.reduce((total, note) => total + note[1], 0) + 0.35;
  const startingPoint = context.currentTime + 0.06;
  let loopStart = startingPoint;

  while (loopStart - startingPoint < PARTY_DURATION / 1000) {
    let cursor = loopStart;
    phrase.forEach(([name, length]) => {
      playTone(notes[name], cursor, length * 0.93, { type: "triangle", volume: 0.075 });
      playTone(notes[name] / 2, cursor, Math.min(length * 0.74, 0.34), {
        type: "sine",
        volume: 0.024,
      });
      cursor += length;
    });
    loopStart += phraseLength;
  }
}

function createNoiseBurst(startTime, duration, volume) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
  }

  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gainNode = context.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(1350, startTime);
  filter.Q.setValueAtTime(0.75, startTime);
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  source.connect(filter).connect(gainNode).connect(context.destination);
  source.start(startTime);
  source.stop(startTime + duration + 0.03);
  rememberSource(source);
}

function playCheer() {
  const context = getAudioContext();
  if (!context) {
    setStatus("收到！虽然没有音效，也送文学一阵热烈掌声！");
    return;
  }

  const start = context.currentTime + 0.03;
  for (let index = 0; index < 18; index += 1) {
    const time = start + index * 0.065 + Math.random() * 0.035;
    createNoiseBurst(time, 0.075 + Math.random() * 0.04, 0.038 + Math.random() * 0.022);
  }

  [0.17, 0.44, 0.72].forEach((offset, index) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(610 + index * 95, start + offset);
    oscillator.frequency.exponentialRampToValueAtTime(840 + index * 95, start + offset + 0.22);
    gainNode.gain.setValueAtTime(0.0001, start + offset);
    gainNode.gain.exponentialRampToValueAtTime(0.045, start + offset + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.24);
    oscillator.connect(gainNode).connect(context.destination);
    oscillator.start(start + offset);
    oscillator.stop(start + offset + 0.27);
    rememberSource(oscillator);
  });
}

function throwConfetti() {
  confettiLayer.replaceChildren();
  const colors = ["#f7ff37", "#00efff", "#ff1c9e", "#9b4dff", "#ffffff", "#3aff9f"];

  for (let index = 0; index < 100; index += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.style.setProperty("--left", Math.round(Math.random() * 100) + "%");
    piece.style.setProperty("--size", 6 + Math.round(Math.random() * 8) + "px");
    piece.style.setProperty("--color", colors[index % colors.length]);
    piece.style.setProperty("--delay", (Math.random() * 0.85).toFixed(2) + "s");
    piece.style.setProperty("--duration", (2.9 + Math.random() * 2.1).toFixed(2) + "s");
    piece.style.setProperty("--drift", Math.round(-120 + Math.random() * 240) + "px");
    piece.style.setProperty("--spin", Math.round(360 + Math.random() * 1080) + "deg");
    confettiLayer.append(piece);
  }

  window.clearTimeout(confettiTimer);
  confettiTimer = window.setTimeout(() => confettiLayer.replaceChildren(), 6500);
}

function hashSpeech(text) {
  return [...text].reduce((hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0), 17);
}

function mutatePortrait(transcript, normalized) {
  const personWrap = document.querySelector("#personWrap");
  const wordHash = hashSpeech(normalized);
  mutationIndex = (mutationIndex + 1 + (wordHash % (portraitMutations.length - 1))) % portraitMutations.length;
  if (mutationIndex === 0) {
    mutationIndex = 1;
  }

  personWrap.classList.remove(...portraitMutations);
  personWrap.classList.add(portraitMutations[mutationIndex]);
  document.body.classList.add("is-mutating");
  stageCaption.textContent = "VOICE MUTATION_" + String(mutationIndex).padStart(2, "0") + " · 文学形态已刷新";
  throwConfetti();
}

function resetPortrait() {
  const personWrap = document.querySelector("#personWrap");
  personWrap.classList.remove(...portraitMutations);
  personWrap.classList.add("mutation-base");
  document.body.classList.remove("is-mutating");
}

function finishCelebration() {
  document.body.classList.remove("is-celebrating");
  resetPortrait();
  stageCaption.textContent = "NEON STANDBY · 说句话，加载文学的新形态";
  setStatus("生日协议执行完毕。再说点不同的话，让文学继续变异！");
  stopActiveAudio();
}

function startCelebration() {
  window.clearTimeout(celebrationTimer);
  stopActiveAudio();
  resetPortrait();
  document.body.classList.add("is-celebrating");
  stageCaption.textContent = "BIRTHDAY OVERDRIVE · 文学正在高频跳舞！";
  setStatus("生日口令确认。舞台超频，文学开始鬼畜起舞！");
  throwConfetti();
  playBirthdayMusic();
  celebrationTimer = window.setTimeout(finishCelebration, PARTY_DURATION);
}

function handleSpeech(transcript) {
  const normalized = normalizeSpeech(transcript);
  if (!normalized) {
    setStatus("刚刚没有听清，再说一次吧。");
    return;
  }

  if (normalized === MATCHED_COMMAND) {
    startCelebration();
    return;
  }

  mutatePortrait(transcript, normalized);
  playCheer();
  setStatus("“" + transcript + "” → 文学已载入新形态！喝彩声波同步发射。");
}

function setListening(active) {
  isListening = active;
  document.body.classList.toggle("is-listening", active);
  voiceButton.setAttribute("aria-pressed", String(active));
  voiceButton.innerHTML = active
    ? '<span aria-hidden="true">■</span> 停止声波'
    : '<span aria-hidden="true">🎙</span> 启动声波';
}

function createRecognition() {
  if (!SpeechRecognition) {
    voiceButton.disabled = true;
    voiceButton.title = "当前浏览器不支持语音识别";
    setStatus("当前浏览器不支持语音识别，请点击“点我庆祝”开启派对。");
    return null;
  }

  const instance = new SpeechRecognition();
  instance.lang = "zh-CN";
  instance.continuous = true;
  instance.interimResults = false;
  instance.maxAlternatives = 1;

  instance.onstart = () => {
    setListening(true);
    setStatus("声波已接入。说“文学，生日快乐！”开趴，其他话触发照片变异。");
  };

  instance.onresult = (event) => {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      if (event.results[index].isFinal) {
        handleSpeech(event.results[index][0].transcript);
      }
    }
  };

  instance.onerror = (event) => {
    const errors = {
      "not-allowed": "麦克风权限未开启。你仍可点击“点我庆祝”送上祝福。",
      "service-not-allowed": "语音服务当前不可用。请点击“点我庆祝”。",
      "no-speech": "没有听到声音，再试一次吧。",
      "audio-capture": "没有找到可用麦克风，请使用“点我庆祝”。",
      network: "语音服务连接失败，请检查网络后重试。",
    };
    setStatus(errors[event.error] || "语音识别没有成功，请再试一次或点击“点我庆祝”。");
  };

  instance.onend = () => setListening(false);
  return instance;
}

voiceButton.addEventListener("click", () => {
  getAudioContext();
  if (!recognition) {
    recognition = createRecognition();
  }
  if (!recognition) {
    return;
  }

  if (isListening) {
    recognition.stop();
    setStatus("声波已关闭。点击“启动声波”可以继续变异。");
    return;
  }

  try {
    recognition.start();
  } catch {
    setStatus("语音识别正在准备中，请稍后再试。");
  }
});

partyButton.addEventListener("click", () => {
  getAudioContext();
  startCelebration();
});

if (!SpeechRecognition) {
  createRecognition();
}
