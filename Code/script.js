const partyButton = document.querySelector("#partyButton");
const voiceButton = document.querySelector("#voiceButton");
const statusMessage = document.querySelector("#statusMessage");
const stageCaption = document.querySelector("#stageCaption");
const confettiLayer = document.querySelector("#confettiLayer");
const reactionLayer = document.querySelector("#reactionLayer");
const reactionStamp = document.querySelector("#reactionStamp");
const voiceFeedback = document.querySelector("#voiceFeedback");
const voiceMeter = document.querySelector("#voiceMeter");
const voiceBars = [...voiceMeter.querySelectorAll("span")];
const voiceFeedbackText = document.querySelector("#voiceFeedbackText");
const voiceLevelText = document.querySelector("#voiceLevelText");
const personWrap = document.querySelector("#personWrap");
const birthdayPerson = document.querySelector("#birthdayPerson");
const quizButton = document.querySelector("#quizButton");
const quizModal = document.querySelector("#quizModal");
const quizClose = document.querySelector("#quizClose");
const quizRound = document.querySelector("#quizRound");
const quizScore = document.querySelector("#quizScore");
const quizTitle = document.querySelector("#quizTitle");
const quizSubtitle = document.querySelector("#quizSubtitle");
const quizOptions = document.querySelector("#quizOptions");
const quizFeedback = document.querySelector("#quizFeedback");
const quizReward = document.querySelector("#quizReward");
const quizNext = document.querySelector("#quizNext");
const gameButton = document.querySelector("#gameButton");
const mazeModal = document.querySelector("#mazeModal");
const mazeClose = document.querySelector("#mazeClose");
const mazeRunner = document.querySelector("#mazeRunner");
const mazeGoal = document.querySelector("#mazeGoal");
const mazeGrid = document.querySelector("#mazeGrid");
const mazeEntitiesLayer = document.querySelector("#mazeEntities");
const mazeEvent = document.querySelector("#mazeEvent");
const mazeHealth = document.querySelector("#mazeHealth");
const mazeScore = document.querySelector("#mazeScore");
const mazeDistance = document.querySelector("#mazeDistance");
const mazePitch = document.querySelector("#mazePitch");
const mazeDirection = document.querySelector("#mazeDirection");
const mazeMeter = document.querySelector("#mazeMeter");
const mazeMeterBars = [...mazeMeter.querySelectorAll("span")];
const mazeStatus = document.querySelector("#mazeStatus");
const mazeStartButton = document.querySelector("#mazeStartButton");
const mazeRestartButton = document.querySelector("#mazeRestartButton");
const mazeReward = document.querySelector("#mazeReward");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const PARTY_DURATION = 20000;
const MATCHED_COMMAND = "文学生日快乐";

let recognition;
let isListening = false;
let celebrationTimer;
let confettiTimer;
let dancePortraitTimer;
let reactionTimer;
let audioContext;
let microphoneStream;
let microphoneSource;
let microphoneAnalyser;
let microphoneData;
let microphoneFrame;
let microphoneRequest;
let voiceSessionRequested = false;
let voiceWasDetected = false;
let lastVoiceFeedbackAt = 0;
let mazeStream;
let mazeSource;
let mazeAnalyser;
let mazeData;
let mazeFrame;
let mazeRequest;
let mazeRunning = false;
let mazeComplete = false;
let mazeWasMoving = false;
let lastMazeStatusAt = 0;
let mazeHealthPoints = 100;
let mazeScorePoints = 0;
let mazeTriggeredEntities = new Set();
let mazeEventTimer;
let mazePlayer;
let mazeLastFrameAt = 0;
let mazeSmoothedLevel = 0;
let mazeSmoothedPitch = 0;
let mazeCalibrationSamples = [];
let mazeCalibrationStartedAt = 0;
let mazeCalibrationComplete = false;
let mazeCalibrationUsedFallback = false;
let mazePitchLow = 175;
let mazePitchHigh = 260;
let mazeDirectionState = "idle";
let mazeWallFeedbackAt = 0;
let mazeCommandRecognition;
let mazeCommandRequested = false;
let mazeRetreatQueued = false;
let mutationIndex = 0;
let portraitIndex = 0;
let dancePortraitIndex = 0;
let lastReactionIndex = -1;
let quizIndex = 0;
let quizPoints = 0;
let quizAnswered = false;
let quizComplete = false;
const activeAudioSources = new Set();
const portraitMutations = [
  "mutation-base",
  "mutation-cyan",
  "mutation-mirror",
  "mutation-acid",
  "mutation-void",
];
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const MAZE_COLS = 10;
const MAZE_ROWS = 6;
const MAZE_START = { x: 0.5, y: 4.5 };
const MAZE_GOAL = { x: 9.5, y: 1.5 };
const MAZE_PLAYER_RADIUS = 0.22;
const mazeLayout = [
  "########..",
  "#####.....",
  "###...#...",
  ".....#....",
  "......####",
  "..########",
];
const mazeEntities = [
  {
    id: "scream-slime",
    type: "monster",
    icon: "👾",
    label: "尖叫史莱姆",
    x: 2,
    y: 4,
    damage: 12,
    knockback: 0.42,
  },
  {
    id: "cake-kit",
    type: "heal",
    icon: "🍰",
    label: "回血蛋糕",
    x: 1,
    y: 5,
    heal: 28,
    score: 50,
  },
  {
    id: "quiet-bomb",
    type: "obstacle",
    icon: "💣",
    label: "沉默地雷",
    x: 4,
    y: 4,
    damage: 22,
    knockback: 0.42,
  },
  {
    id: "duck-guard",
    type: "monster",
    icon: "🦆",
    label: "蛋糕鸭守卫",
    x: 7,
    y: 2,
    damage: 18,
    knockback: 0.38,
  },
  {
    id: "battery-bubble",
    type: "heal",
    icon: "🔋",
    label: "赛博补血电池",
    x: 4,
    y: 2,
    heal: 24,
    score: 70,
  },
  {
    id: "gold-star",
    type: "score",
    icon: "⭐",
    label: "礼物加分星",
    x: 8,
    y: 2,
    score: 300,
  },
];
const portraitDeck = [
  {
    id: "cake-smile",
    src: "assets/portraits/cake-smile.png",
    alt: "手捧生日蛋糕、微笑的文学",
    caption: "CAKE CARRIER · 蛋糕模块已就位",
  },
  {
    id: "cake-calm",
    src: "assets/portraits/cake-calm.png",
    alt: "认真端着生日蛋糕的文学",
    caption: "BIRTHDAY GUARD · 蛋糕安全护送中",
  },
  {
    id: "point",
    src: "assets/portraits/point.png",
    alt: "向上指向的文学",
    caption: "SKY POINTER · 请看上方的离谱指数",
  },
  {
    id: "heart",
    src: "assets/portraits/heart.png",
    alt: "双手比出爱心的文学",
    caption: "HEART TRANSMISSION · 爱心信号已发射",
  },
  {
    id: "clasp",
    src: "assets/portraits/clasp.png",
    alt: "双手合十的文学",
    caption: "WISH ENGINE · 文学正在许愿",
  },
  {
    id: "flex",
    src: "assets/portraits/flex.png",
    alt: "展示力量的文学",
    caption: "POWER PACK · 生日能量已拉满",
  },
  {
    id: "surprise",
    src: "assets/portraits/surprise.png",
    alt: "抱着礼物惊喜张嘴的文学",
    caption: "GIFT OVERLOAD · 惊喜值突破阈值",
  },
  {
    id: "crown",
    src: "assets/portraits/crown.png",
    alt: "戴着生日皇冠的文学",
    caption: "CROWN MODE · 文学皇帝正在上线",
  },
  {
    id: "fullbody",
    src: "assets/portraits/fullbody.png",
    alt: "全身出镜的文学",
    caption: "FULL BODY PATCH · 文学小人加载完成",
  },
];
const dancePortraitIds = ["fullbody", "flex", "surprise", "cake-calm", "heart"];
const dancePortraits = dancePortraitIds.map((id) => portraitDeck.find((portrait) => portrait.id === id));
const reactionModes = [
  {
    id: "laser",
    stamp: "镭射文学指挥部",
    caption: "LASER COMMAND · 文学正在指挥所有霓虹灯",
    status: "触发镭射指挥：舞台开始对空气下命令！",
    sound: "laser",
    symbols: ["⚡", "╱", "╲", "▰"],
    confetti: false,
  },
  {
    id: "disco",
    stamp: "迪斯科加载中",
    caption: "DISCO PATCH · 文学开启全场彩灯模式",
    status: "触发迪斯科补丁：每一盏灯都开始摇头。",
    sound: "disco",
    symbols: ["✦", "♪", "✧", "◈"],
    confetti: true,
  },
  {
    id: "boss",
    stamp: "文学 BOSS 战",
    caption: "BOSS PHASE · 文学力量条已超出屏幕",
    status: "触发 BOSS 战：文学获得了不必要的力量。",
    sound: "bass",
    symbols: ["💪", "!", "▣", "⚠"],
    confetti: false,
  },
  {
    id: "cake",
    stamp: "蛋糕引擎点火",
    caption: "CAKE ENGINE · 甜品能量开始起飞",
    status: "触发蛋糕引擎：热量已经突破大气层。",
    sound: "sparkle",
    symbols: ["✦", "◌", "▴", "*"],
    confetti: true,
  },
  {
    id: "alert",
    stamp: "离谱警报",
    caption: "ALERT MODE · 文学检测到一句过于离谱的话",
    status: "触发离谱警报：请保持镇定，文学正在过载。",
    sound: "alarm",
    symbols: ["!", "⚠", "▰", "!"],
    confetti: false,
  },
  {
    id: "orbit",
    stamp: "文学开始公转",
    caption: "ORBIT MODE · 气球已围绕文学建立轨道",
    status: "触发公转模式：文学暂时拥有了自己的小行星带。",
    sound: "boing",
    symbols: ["○", "◌", "·", "✧"],
    confetti: false,
  },
  {
    id: "glitch",
    stamp: "故障文学 2.0",
    caption: "GLITCH FEVER · 文学正在错误地正确运行",
    status: "触发故障模式：文学的像素开始各自打工。",
    sound: "glitch",
    symbols: ["▤", "▒", "╳", "?"],
    confetti: false,
  },
  {
    id: "rocket",
    stamp: "火箭文学",
    caption: "ROCKET MODE · 请抓紧，文学即将原地发射",
    status: "触发火箭模式：文学已申请离开地球表面。",
    sound: "rocket",
    symbols: ["✦", "▲", "⚡", "·"],
    confetti: true,
  },
];
const quizQuestions = [
  {
    question: "文学有几根眉毛？",
    subtitle: "眉毛统计单位：根。请谨慎作答。",
    options: ["没有", "有一根", "有800根", "有1吨"],
    answer: 2,
    reward: "800 根眉毛观察员证书",
  },
  {
    question: "文学身高多高？",
    subtitle: "本题高度不受地心引力约束。",
    options: ["18cm", "168cm", "888m", "珠穆朗玛峰"],
    answer: 3,
    reward: "珠峰同款仰望许可证",
  },
  {
    question: "文学一次能吃几碗饭？",
    subtitle: "请从胃口与宇宙膨胀两个维度判断。",
    options: ["半碗，主打氛围", "三碗，正常发挥", "一座自助餐厅", "按心情发电，不吃饭"],
    answer: 2,
    reward: "自助餐厅荣誉股东徽章",
  },
  {
    question: "文学的隐藏超能力是？",
    subtitle: "以下答案都已通过不严谨认证。",
    options: ["一秒切换表情", "把 Wi-Fi 信号喊满", "原地召唤蛋糕", "以上都太保守"],
    answer: 3,
    reward: "超能力保密协议（其实不保密）",
  },
  {
    question: "文学说“我马上到”的真实含义？",
    subtitle: "时间在文学面前会变得很有弹性。",
    options: ["已经按了电梯", "还在找袜子", "正在空间折叠", "时间是相对的"],
    answer: 3,
    reward: "文学时间管理学荣誉学位",
  },
  {
    question: "文学的生日愿望是什么？",
    subtitle: "终极谜题，请跟随内心的离谱指数。",
    options: ["世界和平", "再来一口蛋糕", "成为霓虹皇帝", "以上同步加载"],
    answer: 3,
    reward: "文学宇宙 VIP 永久绿卡",
  },
  {
    question: "文学打游戏时最常用的姿势？",
    subtitle: "姿势会影响胜率，量子物理已经证实了。",
    options: ["正襟危坐", "战术性躺平", "手速快过闪电", "先研究菜单两小时"],
    answer: 1,
    reward: "战术躺平认证枕头一只（虚拟）",
  },
  {
    question: "文学的专属出场音效应该是？",
    subtitle: "请选择最接近文学宇宙频率的那一项。",
    options: ["叮——普通人路过", "蛋糕警报响三次", "一万只电子鸭子鼓掌", "系统提示：主角已加载"],
    answer: 3,
    reward: "主角出场权限 × 1 天",
  },
];

function setStatus(message) {
  statusMessage.textContent = message;
}

function setVoiceFeedback(message, levelLabel) {
  voiceFeedbackText.textContent = message;
  if (levelLabel) {
    voiceLevelText.textContent = levelLabel;
  }
}

function renderVoiceLevel(level) {
  const safeLevel = Math.max(0, Math.min(1, level));
  const moment = performance.now() / 135;
  document.body.style.setProperty("--voice-energy", safeLevel.toFixed(3));
  document.body.style.setProperty("--voice-glow", `${24 + safeLevel * 42}px`);
  document.body.style.setProperty("--voice-scale", (1 + safeLevel * 0.14).toFixed(3));

  voiceBars.forEach((bar, index) => {
    const wave = 0.32 + Math.abs(Math.sin(moment + index * 0.93)) * 0.68;
    const levelForBar = Math.max(0.08, Math.min(1, 0.08 + safeLevel * wave));
    bar.style.setProperty("--bar-level", levelForBar.toFixed(3));
  });
}

function stopMicrophoneVisualizer() {
  window.cancelAnimationFrame(microphoneFrame);
  microphoneFrame = undefined;

  if (microphoneSource) {
    microphoneSource.disconnect();
    microphoneSource = undefined;
  }

  if (microphoneStream) {
    microphoneStream.getTracks().forEach((track) => track.stop());
    microphoneStream = undefined;
  }

  microphoneAnalyser = undefined;
  microphoneData = undefined;
  voiceWasDetected = false;
  renderVoiceLevel(0);
}

function updateMicrophoneVisualizer() {
  if (!isListening || !microphoneAnalyser || !microphoneData) {
    return;
  }

  microphoneAnalyser.getByteTimeDomainData(microphoneData);
  const energy = microphoneData.reduce((total, sample) => {
    const deviation = (sample - 128) / 128;
    return total + deviation * deviation;
  }, 0);
  const level = Math.min(1, Math.sqrt(energy / microphoneData.length) * 9);
  renderVoiceLevel(level);

  const now = performance.now();
  if (level > 0.12 && (!voiceWasDetected || now - lastVoiceFeedbackAt > 2100)) {
    voiceWasDetected = true;
    lastVoiceFeedbackAt = now;
    setVoiceFeedback("收到你的声音 · 正在把声波送进文学主机", `声波强度 ${Math.round(level * 100)}%`);
  } else if (!voiceWasDetected && now - lastVoiceFeedbackAt > 1200) {
    setVoiceFeedback("正在等你发声… 说话时波形会跳起来。", "声波待命");
    lastVoiceFeedbackAt = now;
  } else if (voiceWasDetected) {
    voiceLevelText.textContent = `声波强度 ${Math.round(level * 100)}%`;
  }

  microphoneFrame = window.requestAnimationFrame(updateMicrophoneVisualizer);
}

async function startMicrophoneVisualizer() {
  voiceFeedback.hidden = false;
  renderVoiceLevel(0);

  if (microphoneStream || microphoneRequest || !navigator.mediaDevices?.getUserMedia) {
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceFeedback("语音识别仍可使用；当前浏览器无法显示实时音量。", "视觉模拟");
    }
    return microphoneRequest;
  }

  try {
    microphoneRequest = navigator.mediaDevices.getUserMedia({
      audio: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });
    const stream = await microphoneRequest;

    if (!voiceSessionRequested) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    const context = getAudioContext();
    if (!context) {
      stream.getTracks().forEach((track) => track.stop());
      setVoiceFeedback("语音已开启，但浏览器无法显示实时音量。", "声波在线");
      return;
    }

    microphoneStream = stream;
    microphoneSource = context.createMediaStreamSource(stream);
    microphoneAnalyser = context.createAnalyser();
    microphoneAnalyser.fftSize = 256;
    microphoneAnalyser.smoothingTimeConstant = 0.72;
    microphoneData = new Uint8Array(microphoneAnalyser.fftSize);
    microphoneSource.connect(microphoneAnalyser);
    setVoiceFeedback("声波雷达已接入，随便说一句试试。", "正在监听");
    if (isListening) {
      updateMicrophoneVisualizer();
    }
  } catch {
    setVoiceFeedback("语音指令仍在监听；没有取到实时音量也不影响开趴。", "声波在线");
  } finally {
    microphoneRequest = undefined;
  }
}

function setStagePortrait(portrait, shouldAnimate = true) {
  if (!portrait) {
    return;
  }

  personWrap.dataset.portrait = portrait.id;
  personWrap.style.setProperty("--portrait-image", 'url("' + portrait.src + '")');
  birthdayPerson.src = portrait.src;
  birthdayPerson.alt = portrait.alt;

  if (shouldAnimate && !prefersReducedMotion.matches) {
    birthdayPerson.classList.remove("is-swapping");
    window.requestAnimationFrame(() => birthdayPerson.classList.add("is-swapping"));
  }
}

function preloadPortraits() {
  portraitDeck.forEach((portrait) => {
    const asset = new Image();
    asset.src = portrait.src;
  });
}

function changeToNextDancePortrait() {
  const portrait = dancePortraits[dancePortraitIndex % dancePortraits.length];
  dancePortraitIndex += 1;
  setStagePortrait(portrait);
}

function startDancePortraits() {
  window.clearInterval(dancePortraitTimer);
  dancePortraitIndex = 0;
  changeToNextDancePortrait();

  if (!prefersReducedMotion.matches) {
    dancePortraitTimer = window.setInterval(changeToNextDancePortrait, 680);
  }
}

function stopDancePortraits() {
  window.clearInterval(dancePortraitTimer);
  dancePortraitTimer = undefined;
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

function playReactionSound(sound) {
  const context = getAudioContext();
  if (!context) {
    return;
  }

  const start = context.currentTime + 0.025;

  if (sound === "laser") {
    [0, 0.1, 0.2, 0.31].forEach((offset, index) => {
      playTone(260 + index * 190, start + offset, 0.13, { type: "sawtooth", volume: 0.065 });
    });
    return;
  }

  if (sound === "disco") {
    [523.25, 659.25, 783.99, 1046.5, 783.99].forEach((note, index) => {
      playTone(note, start + index * 0.09, 0.17, { type: "square", volume: 0.05 });
    });
    return;
  }

  if (sound === "bass") {
    playTone(72, start, 0.48, { type: "sawtooth", volume: 0.1 });
    playTone(54, start + 0.16, 0.44, { type: "square", volume: 0.07 });
    createNoiseBurst(start + 0.02, 0.11, 0.055);
    return;
  }

  if (sound === "sparkle") {
    [659.25, 783.99, 987.77, 1318.51].forEach((note, index) => {
      playTone(note, start + index * 0.075, 0.32, { type: "sine", volume: 0.055 });
    });
    return;
  }

  if (sound === "alarm") {
    [420, 660, 420, 660, 420].forEach((note, index) => {
      playTone(note, start + index * 0.095, 0.105, { type: "square", volume: 0.06 });
    });
    return;
  }

  if (sound === "boing") {
    [150, 230, 360].forEach((note, index) => {
      playTone(note, start + index * 0.11, 0.28, { type: "sine", volume: 0.09 });
    });
    return;
  }

  if (sound === "glitch") {
    createNoiseBurst(start, 0.16, 0.06);
    createNoiseBurst(start + 0.18, 0.13, 0.045);
    [82, 610, 118, 940].forEach((note, index) => {
      playTone(note, start + index * 0.075, 0.12, { type: "square", volume: 0.055 });
    });
    return;
  }

  if (sound === "rocket") {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(130, start);
    oscillator.frequency.exponentialRampToValueAtTime(1260, start + 0.7);
    gainNode.gain.setValueAtTime(0.0001, start);
    gainNode.gain.exponentialRampToValueAtTime(0.07, start + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + 0.74);
    oscillator.connect(gainNode).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.78);
    rememberSource(oscillator);
    return;
  }

  playCheer();
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

function clearReactionEffect() {
  window.clearTimeout(reactionTimer);
  document.body.classList.remove("is-reacting");
  document.body.removeAttribute("data-reaction");
  reactionLayer.replaceChildren();
  reactionStamp.textContent = "";
}

function chooseReaction(normalized) {
  let index = (hashSpeech(normalized) + portraitIndex + mutationIndex) % reactionModes.length;
  if (index === lastReactionIndex) {
    index = (index + 1) % reactionModes.length;
  }
  lastReactionIndex = index;
  return reactionModes[index];
}

function scatterReaction(reaction) {
  reactionLayer.replaceChildren();
  for (let index = 0; index < 28; index += 1) {
    const particle = document.createElement("span");
    particle.className = "reaction-particle";
    particle.textContent = reaction.symbols[index % reaction.symbols.length];
    particle.style.setProperty("--x", Math.round(-48 + Math.random() * 96) + "vw");
    particle.style.setProperty("--y", Math.round(-40 + Math.random() * 72) + "vh");
    particle.style.setProperty("--size", 0.75 + Math.random() * 1.35 + "rem");
    particle.style.setProperty("--delay", (Math.random() * 0.16).toFixed(2) + "s");
    particle.style.setProperty("--spin", Math.round(-420 + Math.random() * 840) + "deg");
    reactionLayer.append(particle);
  }
}

function triggerReaction(normalized) {
  const reaction = chooseReaction(normalized);
  clearReactionEffect();
  document.body.dataset.reaction = reaction.id;
  document.body.classList.add("is-reacting");
  reactionStamp.textContent = reaction.stamp;
  scatterReaction(reaction);
  if (reaction.confetti) {
    throwConfetti();
  }
  playReactionSound(reaction.sound);
  reactionTimer = window.setTimeout(clearReactionEffect, 2600);
  return reaction;
}

function setQuizScore() {
  quizScore.textContent = "MYSTERY POINTS: " + String(quizPoints).padStart(3, "0");
}

function makeQuizOption(label, index) {
  const option = document.createElement("button");
  option.className = "quiz-option";
  option.type = "button";
  option.dataset.index = String(index);

  const marker = document.createElement("span");
  marker.className = "quiz-option-marker";
  marker.textContent = String.fromCharCode(65 + index);

  const text = document.createElement("span");
  text.textContent = label;

  option.append(marker, text);
  option.addEventListener("click", () => chooseQuizAnswer(index));
  return option;
}

function renderQuizQuestion() {
  const currentQuestion = quizQuestions[quizIndex];
  quizAnswered = false;
  quizRound.textContent = "ROUND " + String(quizIndex + 1).padStart(2, "0") + " / " + String(quizQuestions.length).padStart(2, "0");
  setQuizScore();
  quizTitle.textContent = currentQuestion.question;
  quizSubtitle.textContent = currentQuestion.subtitle;
  quizOptions.replaceChildren(...currentQuestion.options.map(makeQuizOption));
  quizFeedback.textContent = "请选择一个看起来最不像答案的选项。";
  quizReward.textContent = "本题奖品等待掉落。";
  quizReward.classList.remove("is-visible");
  quizNext.textContent = "锁定答案";
  quizNext.disabled = true;
}

function renderQuizSummary() {
  const totalQuestions = String(quizQuestions.length).padStart(2, "0");
  quizRound.textContent = "QUIZ COMPLETE // " + totalQuestions + " / " + totalQuestions;
  setQuizScore();
  quizTitle.textContent = "文学竞猜宇宙认证完成！";
  quizSubtitle.textContent = "你以 " + quizPoints + " 分的离谱水平，成功理解了文学的部分真相。";
  quizOptions.replaceChildren();
  quizFeedback.textContent = "终极奖品已掉落：文学宇宙 VIP 永久绿卡。拿好，别让文学发现。";
  quizReward.textContent = "附赠：赛博蛋糕尝鲜权 × 1（仅限想象中使用）";
  quizReward.classList.add("is-visible");
  quizNext.textContent = "再玩一轮";
  quizNext.disabled = false;
  throwConfetti();
  playCheer();
}

function chooseQuizAnswer(answerIndex) {
  if (quizAnswered || quizComplete) {
    return;
  }

  quizAnswered = true;
  const currentQuestion = quizQuestions[quizIndex];
  const isCorrect = answerIndex === currentQuestion.answer;
  const options = [...quizOptions.querySelectorAll(".quiz-option")];

  options.forEach((option, index) => {
    option.disabled = true;
    if (index === currentQuestion.answer) {
      option.classList.add("is-correct");
    }
    if (index === answerIndex && !isCorrect) {
      option.classList.add("is-wrong");
    }
  });

  if (isCorrect) {
    quizPoints += 100;
    quizFeedback.textContent = "离谱得非常精准！文学本人请求把你加入宇宙观察名单。";
    quizReward.textContent = "奖品已掉落：" + currentQuestion.reward;
    throwConfetti();
  } else {
    quizPoints += 40;
    quizFeedback.textContent = "这个答案也很有道理，但宇宙标准答案更离谱一点。";
    quizReward.textContent = "安慰奖已掉落：反向脑洞奖 + " + currentQuestion.reward;
  }

  quizReward.classList.add("is-visible");
  setQuizScore();
  playCheer();
  quizNext.textContent = quizIndex === quizQuestions.length - 1 ? "领取终极奖品" : "下一题 // 继续离谱";
  quizNext.disabled = false;
}

function resetQuiz() {
  quizIndex = 0;
  quizPoints = 0;
  quizAnswered = false;
  quizComplete = false;
  renderQuizQuestion();
}

function openQuiz() {
  getAudioContext();
  resetQuiz();
  quizModal.hidden = false;
  document.body.classList.add("quiz-open");
  quizClose.focus();
}

function closeQuiz() {
  quizModal.hidden = true;
  document.body.classList.remove("quiz-open");
  quizButton.focus();
}

function setMazeStatus(message) {
  mazeStatus.textContent = message;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function median(values) {
  if (!values.length) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function setMazeHud() {
  mazeHealth.textContent = `体力 ${String(mazeHealthPoints).padStart(3, "0")}`;
  mazeHealth.dataset.state = mazeHealthPoints <= 35 ? "danger" : mazeHealthPoints <= 65 ? "low" : "healthy";
  mazeScore.textContent = `礼物积分 ${String(mazeScorePoints).padStart(3, "0")}`;

  const column = clamp(Math.floor(mazePlayer.x), 0, MAZE_COLS - 1) + 1;
  const row = clamp(Math.floor(mazePlayer.y), 0, MAZE_ROWS - 1) + 1;
  mazeDistance.textContent = `位置 X${column} · Y${row}`;

  if (!mazeCalibrationComplete) {
    mazePitch.textContent = "音高 校准中";
    mazeDirection.textContent = "方向 等待";
    return;
  }

  mazePitch.textContent = mazeSmoothedPitch
    ? `音高 ${Math.round(mazeSmoothedPitch)}Hz`
    : "音高 未锁定";
  const directionLabels = {
    up: "方向 ↑ 上行",
    down: "方向 ↓ 下行",
    right: "方向 → 前进",
    back: "方向 ← 后退",
    idle: "方向 · 停住",
  };
  mazeDirection.textContent = directionLabels[mazeDirectionState];
}

function showMazeEvent(message, type) {
  window.clearTimeout(mazeEventTimer);
  mazeEvent.textContent = message;
  mazeEvent.dataset.type = type;
  mazeEvent.classList.add("is-visible");
  mazeEventTimer = window.setTimeout(() => {
    mazeEvent.classList.remove("is-visible");
  }, 1150);
}

function renderMazeGrid() {
  mazeGrid.replaceChildren(
    ...mazeLayout.flatMap((row, y) =>
      [...row].map((cell, x) => {
        const node = document.createElement("span");
        node.className = `maze-cell ${cell === "#" ? "is-wall" : "is-floor"}`;
        node.dataset.x = String(x);
        node.dataset.y = String(y);
        return node;
      })
    )
  );
}

function renderMazeLandmarks() {
  const start = document.querySelector(".maze-start");
  const goalX = (MAZE_GOAL.x / MAZE_COLS) * 100;
  const goalY = (MAZE_GOAL.y / MAZE_ROWS) * 100;
  const startX = (MAZE_START.x / MAZE_COLS) * 100;
  const startY = (MAZE_START.y / MAZE_ROWS) * 100;
  mazeGoal.style.setProperty("--maze-landmark-x", `${goalX}%`);
  mazeGoal.style.setProperty("--maze-landmark-y", `${goalY}%`);
  start?.style.setProperty("--maze-landmark-x", `${startX}%`);
  start?.style.setProperty("--maze-landmark-y", `${startY}%`);
}

function renderMazeEntities() {
  mazeEntitiesLayer.replaceChildren(
    ...mazeEntities.map((entity) => {
      const node = document.createElement("div");
      node.className = `maze-entity maze-entity-${entity.type}`;
      node.dataset.entityId = entity.id;
      node.style.setProperty("--entity-x", `${((entity.x + 0.5) / MAZE_COLS) * 100}%`);
      node.style.setProperty("--entity-y", `${((entity.y + 0.5) / MAZE_ROWS) * 100}%`);
      node.setAttribute("aria-label", entity.label);

      const icon = document.createElement("span");
      icon.className = "maze-entity-icon";
      icon.textContent = entity.icon;

      const label = document.createElement("span");
      label.className = "maze-entity-label";
      label.textContent = entity.label;

      node.append(icon, label);
      return node;
    })
  );
}

function renderMazeMeter(level) {
  const safeLevel = clamp(level, 0, 1);
  const moment = performance.now() / 105;
  mazeMeterBars.forEach((bar, index) => {
    const wave = 0.32 + Math.abs(Math.sin(moment + index * 0.81)) * 0.68;
    const height = clamp(0.08 + safeLevel * wave, 0.08, 1);
    bar.style.setProperty("--maze-bar-level", height.toFixed(3));
  });
}

function renderMazeRunner() {
  mazeRunner.style.setProperty("--runner-x", `${(mazePlayer.x / MAZE_COLS) * 100}%`);
  mazeRunner.style.setProperty("--runner-y", `${(mazePlayer.y / MAZE_ROWS) * 100}%`);
  setMazeHud();
}

function isMazeFloor(x, y) {
  return y >= 0 && y < MAZE_ROWS && x >= 0 && x < MAZE_COLS && mazeLayout[y][x] === ".";
}

function canOccupyMaze(x, y) {
  const minX = Math.floor(x - MAZE_PLAYER_RADIUS);
  const maxX = Math.floor(x + MAZE_PLAYER_RADIUS);
  const minY = Math.floor(y - MAZE_PLAYER_RADIUS);
  const maxY = Math.floor(y + MAZE_PLAYER_RADIUS);

  for (let row = minY; row <= maxY; row += 1) {
    for (let column = minX; column <= maxX; column += 1) {
      if (!isMazeFloor(column, row)) {
        return false;
      }
    }
  }
  return true;
}

function playMazeBump() {
  const context = getAudioContext();
  if (!context) {
    return;
  }
  const start = context.currentTime + 0.01;
  playTone(118, start, 0.075, { type: "square", volume: 0.055 });
  playTone(76, start + 0.075, 0.09, { type: "sawtooth", volume: 0.045 });
}

function signalMazeWall() {
  const now = performance.now();
  mazeRunner.classList.remove("is-bumped");
  window.requestAnimationFrame(() => mazeRunner.classList.add("is-bumped"));
  if (now - mazeWallFeedbackAt > 420) {
    mazeWallFeedbackAt = now;
    setMazeStatus("撞墙了！换个高低音，带文学绕过去。 ");
    showMazeEvent("墙体阻挡 · 需要绕路", "damage");
    playMazeBump();
  }
}

function retreatMazeForBirthday() {
  if (!mazeRunning) {
    return;
  }
  if (!mazeCalibrationComplete) {
    mazeRetreatQueued = true;
    setMazeStatus("已听见“文学生日快乐”！校准结束后，文学会执行一次后退。 ");
    return;
  }

  let travelled = 0;
  const step = 0.025;
  while (travelled < 0.82 && canOccupyMaze(mazePlayer.x - step, mazePlayer.y)) {
    mazePlayer.x -= step;
    travelled += step;
  }

  if (travelled < step) {
    signalMazeWall();
    return;
  }

  mazeDirectionState = "back";
  document.body.classList.add("maze-moving");
  renderMazeRunner();
  setMazeStatus("生日口令认证成功！文学正在战术后退，重新选择路线。 ");
  showMazeEvent("文学生日快乐 · ← 后退一格", "score");
  playReactionSound("sparkle");
  window.setTimeout(() => document.body.classList.remove("maze-moving"), 320);
  checkMazeEntities();
}

function startMazeCommandRecognition() {
  if (!SpeechRecognition) {
    setMazeStatus("高低音迷宫已可玩；生日口令后退需要 Chrome 或 Edge 的语音识别。 ");
    return;
  }

  if (!mazeCommandRecognition) {
    mazeCommandRecognition = new SpeechRecognition();
    mazeCommandRecognition.lang = "zh-CN";
    mazeCommandRecognition.continuous = true;
    mazeCommandRecognition.interimResults = false;
    mazeCommandRecognition.maxAlternatives = 1;
    mazeCommandRecognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        if (result.isFinal && normalizeSpeech(result[0].transcript) === MATCHED_COMMAND) {
          retreatMazeForBirthday();
        }
      }
    };
    mazeCommandRecognition.onerror = (event) => {
      if (mazeRunning && !["no-speech", "aborted"].includes(event.error)) {
        setMazeStatus("高低音控制继续可用；生日口令后退暂时未连接。 ");
      }
    };
    mazeCommandRecognition.onend = () => {
      if (mazeCommandRequested && mazeRunning) {
        window.setTimeout(() => {
          try {
            mazeCommandRecognition.start();
          } catch {
            // The browser can keep a continuous recognition session alive briefly.
          }
        }, 260);
      }
    };
  }

  mazeCommandRequested = true;
  try {
    mazeCommandRecognition.start();
  } catch {
    // A continuous recognition session may already be active.
  }
}

function tryMoveMaze(dx, dy) {
  let moved = false;
  let blocked = false;

  if (dx && canOccupyMaze(mazePlayer.x + dx, mazePlayer.y)) {
    mazePlayer.x += dx;
    moved = true;
  } else if (dx) {
    blocked = true;
  }

  if (dy && canOccupyMaze(mazePlayer.x, mazePlayer.y + dy)) {
    mazePlayer.y += dy;
    moved = true;
  } else if (dy) {
    blocked = true;
  }

  if (blocked) {
    signalMazeWall();
  }
  return moved;
}

function estimateMazePitch(data, sampleRate) {
  let mean = 0;
  for (let index = 0; index < data.length; index += 1) {
    mean += data[index];
  }
  mean /= data.length;

  let energy = 0;
  for (let index = 0; index < data.length; index += 1) {
    const value = (data[index] - mean) / 128;
    energy += value * value;
  }
  if (Math.sqrt(energy / data.length) < 0.012) {
    return 0;
  }

  const minLag = Math.floor(sampleRate / 390);
  const maxLag = Math.min(Math.ceil(sampleRate / 80), Math.floor(data.length / 2));
  let bestLag = 0;
  let bestCorrelation = 0;

  for (let lag = minLag; lag <= maxLag; lag += 1) {
    let correlation = 0;
    let leftEnergy = 0;
    let rightEnergy = 0;
    for (let index = 0; index < data.length - lag; index += 1) {
      const left = (data[index] - mean) / 128;
      const right = (data[index + lag] - mean) / 128;
      correlation += left * right;
      leftEnergy += left * left;
      rightEnergy += right * right;
    }
    const normalized = correlation / Math.sqrt(leftEnergy * rightEnergy || 1);
    if (normalized > bestCorrelation) {
      bestCorrelation = normalized;
      bestLag = lag;
    }
  }

  if (bestCorrelation < 0.62 || !bestLag) {
    return 0;
  }
  return sampleRate / bestLag;
}

function updateMazeCalibration(pitch, level, now) {
  const elapsed = now - mazeCalibrationStartedAt;
  if (!mazeCalibrationComplete && pitch >= 80 && pitch <= 390 && level > 0.08) {
    mazeCalibrationSamples.push(pitch);
  }

  if (!mazeCalibrationComplete && elapsed >= 2000) {
    const baseline = median(mazeCalibrationSamples);
    mazeCalibrationUsedFallback = mazeCalibrationSamples.length < 8;
    if (mazeCalibrationUsedFallback) {
      mazePitchLow = 135;
      mazePitchHigh = 205;
      setMazeStatus("音高不够稳定，已启用固定阈值：拉高声音上行，压低声音下行。 ");
    } else {
      mazePitchLow = clamp(baseline * 0.78, 90, 175);
      mazePitchHigh = clamp(baseline * 1.28, 160, 310);
      setMazeStatus("校准完成！高音 ↑ 上行，低音 ↓ 下行，音量 → 推进。 ");
    }
    mazeCalibrationComplete = true;
    mazeDirectionState = "idle";
    showMazeEvent(mazeCalibrationUsedFallback ? "固定音高校准已启用" : "音高校准完成", "score");
    playReactionSound("sparkle");
    if (mazeRetreatQueued) {
      mazeRetreatQueued = false;
      window.setTimeout(retreatMazeForBirthday, 120);
    }
  }
}

function resolveMazeEntity(entity) {
  mazeTriggeredEntities.add(entity.id);
  const entityNode = mazeEntitiesLayer.querySelector(`[data-entity-id="${entity.id}"]`);
  const now = performance.now();

  if (entity.type === "heal") {
    mazeHealthPoints = Math.min(100, mazeHealthPoints + entity.heal);
    mazeScorePoints += entity.score;
    entityNode?.classList.add("is-resolved", "is-heal");
    setMazeStatus(`吃到${entity.label}！体力 +${entity.heal}，礼物积分 +${entity.score}。`);
    showMazeEvent(`+${entity.heal} 体力 · +${entity.score} 积分`, "heal");
    playReactionSound("sparkle");
  } else if (entity.type === "score") {
    mazeScorePoints += entity.score;
    entityNode?.classList.add("is-resolved", "is-score");
    setMazeStatus(`捡到${entity.label}！礼物积分 +${entity.score}。`);
    showMazeEvent(`礼物积分 +${entity.score}`, "score");
    playReactionSound("disco");
  } else {
    mazeHealthPoints = Math.max(0, mazeHealthPoints - entity.damage);
    const pushedBack = Math.max(MAZE_START.x, mazePlayer.x - entity.knockback);
    if (canOccupyMaze(pushedBack, mazePlayer.y)) {
      mazePlayer.x = pushedBack;
    }
    entityNode?.classList.add("is-resolved", "is-hit");
    const isMonster = entity.type === "monster";
    setMazeStatus(`撞到${entity.label}！体力 -${entity.damage}，文学被震退。`);
    showMazeEvent(`${isMonster ? "小怪兽袭击" : "障碍爆炸"} · -${entity.damage} 体力`, "damage");
    playReactionSound(isMonster ? "glitch" : "alert");
  }

  lastMazeStatusAt = now;
  renderMazeRunner();

  if (mazeHealthPoints <= 0) {
    failMaze();
    return false;
  }
  return true;
}

function checkMazeEntities() {
  const encountered = mazeEntities.find(
    (entity) =>
      !mazeTriggeredEntities.has(entity.id) &&
      Math.hypot(mazePlayer.x - (entity.x + 0.5), mazePlayer.y - (entity.y + 0.5)) < 0.43
  );
  return encountered ? resolveMazeEntity(encountered) : true;
}

function stopMazeMicrophone() {
  window.cancelAnimationFrame(mazeFrame);
  mazeFrame = undefined;
  mazeCommandRequested = false;
  try {
    mazeCommandRecognition?.stop();
  } catch {
    // Recognition may already have stopped.
  }

  if (mazeSource) {
    mazeSource.disconnect();
    mazeSource = undefined;
  }
  if (mazeStream) {
    mazeStream.getTracks().forEach((track) => track.stop());
    mazeStream = undefined;
  }
  mazeAnalyser = undefined;
  mazeData = undefined;
  mazeWasMoving = false;
  renderMazeMeter(0);
}

function failMaze() {
  mazeRunning = false;
  stopMazeMicrophone();
  document.body.classList.remove("maze-running", "maze-moving");
  document.body.classList.add("maze-failed");
  mazeStartButton.hidden = true;
  mazeRestartButton.hidden = false;
  setMazeStatus("文学体力归零，被小怪兽请去吃蛋糕了。点击“再跑一遍”复活！");
  showMazeEvent("体力耗尽！文学选择战略性撤退", "fail");
  playReactionSound("alert");
}

function completeMaze() {
  mazePlayer = { ...MAZE_GOAL };
  mazeRunning = false;
  mazeComplete = true;
  mazeDirectionState = "idle";
  renderMazeRunner();
  stopMazeMicrophone();
  document.body.classList.remove("maze-running");
  document.body.classList.add("maze-complete");
  mazeGoal.classList.add("is-reached");
  mazeStartButton.hidden = true;
  mazeRestartButton.hidden = false;
  mazeReward.hidden = false;
  mazeScorePoints += 500;
  setMazeHud();
  setMazeStatus("通关！文学凭借高低音，成功绕进了生日礼物区。🎁");
  showMazeEvent("礼物终点到达 · +500 通关积分", "goal");
  setStagePortrait(portraitDeck.find((portrait) => portrait.id === "crown"));
  stageCaption.textContent = "MAZE CLEAR · 文学勇者已领取生日大礼包！";
  setStatus("声控迷宫已通关，文学获得了勇者礼物！");
  throwConfetti();
  playReactionSound("sparkle");
}

function readMazeInput() {
  if (!mazeRunning || !mazeAnalyser || !mazeData) {
    return;
  }

  mazeAnalyser.getByteTimeDomainData(mazeData);
  let energy = 0;
  for (let index = 0; index < mazeData.length; index += 1) {
    const deviation = (mazeData[index] - 128) / 128;
    energy += deviation * deviation;
  }
  const rawLevel = clamp(Math.sqrt(energy / mazeData.length) * 9, 0, 1);
  mazeSmoothedLevel += (rawLevel - mazeSmoothedLevel) * 0.22;
  const pitch = estimateMazePitch(mazeData, getAudioContext()?.sampleRate || 44100);
  if (pitch) {
    mazeSmoothedPitch = mazeSmoothedPitch ? mazeSmoothedPitch * 0.76 + pitch * 0.24 : pitch;
  } else {
    mazeSmoothedPitch *= 0.94;
  }

  const now = performance.now();
  const deltaSeconds = Math.min(0.05, Math.max(0.008, (now - mazeLastFrameAt) / 1000 || 0.016));
  mazeLastFrameAt = now;
  renderMazeMeter(mazeSmoothedLevel);
  updateMazeCalibration(mazeSmoothedPitch, mazeSmoothedLevel, now);

  if (!mazeCalibrationComplete) {
    setMazeStatus(`正在校准音高… ${Math.min(100, Math.round(((now - mazeCalibrationStartedAt) / 2000) * 100))}% · 自然说一句就好。`);
    renderMazeRunner();
    mazeFrame = window.requestAnimationFrame(readMazeInput);
    return;
  }

  const throttle = clamp((mazeSmoothedLevel - 0.08) / 0.5, 0, 1);
  const voiced = mazeSmoothedLevel > 0.09 && mazeSmoothedPitch >= 80;
  if (!voiced) {
    mazeDirectionState = "idle";
  } else if (mazeSmoothedPitch > mazePitchHigh) {
    mazeDirectionState = "up";
  } else if (mazeSmoothedPitch < mazePitchLow) {
    mazeDirectionState = "down";
  } else {
    mazeDirectionState = "right";
  }

  const horizontalDistance = throttle * 0.78 * deltaSeconds;
  const verticalDistance = voiced && mazeDirectionState !== "right"
    ? Math.max(throttle, 0.3) * 0.82 * deltaSeconds * (mazeDirectionState === "up" ? -1 : 1)
    : 0;
  const moved = tryMoveMaze(horizontalDistance, verticalDistance);

  if (moved) {
    document.body.classList.add("maze-moving");
    if (!mazeWasMoving || now - lastMazeStatusAt > 1350) {
      const movement = mazeDirectionState === "up" ? "高音上行" : mazeDirectionState === "down" ? "低音下行" : "音量推进";
      setMazeStatus(`${movement} · 声波推进器 ${Math.round(throttle * 100)}%`);
      lastMazeStatusAt = now;
    }
    mazeWasMoving = true;
  } else {
    document.body.classList.remove("maze-moving");
    if (now - mazeWallFeedbackAt < 260) {
      // The collision message is more useful than the generic quiet-state message.
    } else if (mazeWasMoving || now - lastMazeStatusAt > 1850) {
      setMazeStatus("安静时文学会停住；发出声音后，用高低音选路。 ");
      lastMazeStatusAt = now;
    }
    mazeWasMoving = false;
  }

  renderMazeRunner();
  if (!checkMazeEntities()) {
    return;
  }
  if (Math.hypot(mazePlayer.x - MAZE_GOAL.x, mazePlayer.y - MAZE_GOAL.y) < 0.38) {
    completeMaze();
    return;
  }
  mazeFrame = window.requestAnimationFrame(readMazeInput);
}

async function startMazeMicrophone() {
  if (mazeRequest || mazeStream) {
    return mazeRequest;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    mazeRunning = false;
    mazeStartButton.disabled = false;
    setMazeStatus("当前浏览器无法读取声音，请用支持麦克风的 Chrome 或 Edge 再试。 ");
    return undefined;
  }

  try {
    mazeRequest = navigator.mediaDevices.getUserMedia({
      audio: { autoGainControl: true, echoCancellation: true, noiseSuppression: true },
    });
    const stream = await mazeRequest;
    if (!mazeRunning) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    const context = getAudioContext();
    if (!context) {
      stream.getTracks().forEach((track) => track.stop());
      mazeRunning = false;
      mazeStartButton.disabled = false;
      setMazeStatus("声音引擎未加载成功，请刷新页面再试。 ");
      return;
    }

    mazeStream = stream;
    mazeSource = context.createMediaStreamSource(stream);
    mazeAnalyser = context.createAnalyser();
    mazeAnalyser.fftSize = 2048;
    mazeAnalyser.smoothingTimeConstant = 0.62;
    mazeData = new Uint8Array(mazeAnalyser.fftSize);
    mazeSource.connect(mazeAnalyser);
    mazeCalibrationStartedAt = performance.now();
    mazeLastFrameAt = mazeCalibrationStartedAt;
    mazeStartButton.hidden = true;
    setMazeStatus("声控已启动：先自然说一句，文学正在校准你的高低音。 ");
    startMazeCommandRecognition();
    readMazeInput();
  } catch {
    mazeRunning = false;
    mazeStartButton.disabled = false;
    setMazeStatus("没有取得麦克风权限，文学暂时不知道该往哪跑。 ");
  } finally {
    mazeRequest = undefined;
  }
}

function resetMazeGame() {
  stopMazeMicrophone();
  mazePlayer = { ...MAZE_START };
  mazeRunning = false;
  mazeComplete = false;
  mazeWasMoving = false;
  lastMazeStatusAt = 0;
  mazeHealthPoints = 100;
  mazeScorePoints = 0;
  mazeTriggeredEntities = new Set();
  mazeSmoothedLevel = 0;
  mazeSmoothedPitch = 0;
  mazeCalibrationSamples = [];
  mazeCalibrationComplete = false;
  mazeCalibrationUsedFallback = false;
  mazePitchLow = 135;
  mazePitchHigh = 205;
  mazeDirectionState = "idle";
  mazeWallFeedbackAt = 0;
  mazeCommandRequested = false;
  mazeRetreatQueued = false;
  window.clearTimeout(mazeEventTimer);
  mazeEvent.classList.remove("is-visible");
  document.body.classList.remove("maze-running", "maze-moving", "maze-complete", "maze-failed");
  mazeGoal.classList.remove("is-reached");
  mazeStartButton.hidden = false;
  mazeStartButton.disabled = false;
  mazeRestartButton.hidden = true;
  mazeReward.hidden = true;
  renderMazeGrid();
  renderMazeLandmarks();
  renderMazeEntities();
  renderMazeRunner();
  setMazeStatus("点击下方按钮，先自然说一句让系统校准音高。 ");
}

function startMazeGame() {
  if (mazeComplete || mazeHealthPoints <= 0) {
    resetMazeGame();
  }
  getAudioContext();
  mazeRunning = true;
  mazeStartButton.disabled = true;
  document.body.classList.add("maze-running");
  setMazeStatus("正在打开麦克风并准备音高校准…");
  startMazeMicrophone();
}

function openMazeGame() {
  getAudioContext();
  if (isListening) {
    voiceSessionRequested = false;
    recognition?.stop();
    setListening(false);
  }
  resetMazeGame();
  mazeModal.hidden = false;
  document.body.classList.add("maze-open");
  mazeClose.focus();
}

function closeMazeGame() {
  stopMazeMicrophone();
  mazeRunning = false;
  document.body.classList.remove("maze-open", "maze-running", "maze-moving");
  mazeModal.hidden = true;
  gameButton.focus();
}

function hashSpeech(text) {
  return [...text].reduce((hash, character) => ((hash * 31 + character.charCodeAt(0)) >>> 0), 17);
}

function mutatePortrait(transcript, normalized) {
  const wordHash = hashSpeech(normalized);
  mutationIndex = (mutationIndex + 1 + (wordHash % (portraitMutations.length - 1))) % portraitMutations.length;
  if (mutationIndex === 0) {
    mutationIndex = 1;
  }

  personWrap.classList.remove(...portraitMutations);
  personWrap.classList.add(portraitMutations[mutationIndex]);
  portraitIndex = (portraitIndex + 1 + (wordHash % (portraitDeck.length - 1))) % portraitDeck.length;
  setStagePortrait(portraitDeck[portraitIndex]);
  const reaction = triggerReaction(normalized);
  document.body.classList.add("is-mutating");
  stageCaption.textContent = "VOICE MUTATION_" + String(mutationIndex).padStart(2, "0") + " · " + reaction.caption;
  return reaction;
}

function resetPortrait() {
  personWrap.classList.remove(...portraitMutations);
  personWrap.classList.add("mutation-base");
  document.body.classList.remove("is-mutating");
}

function finishCelebration() {
  document.body.classList.remove("is-celebrating");
  clearReactionEffect();
  stopDancePortraits();
  resetPortrait();
  setStagePortrait(portraitDeck[0], false);
  stageCaption.textContent = "NEON STANDBY · 说句话，加载文学的新形态";
  setStatus("生日协议执行完毕。再说点不同的话，让文学继续变异！");
  stopActiveAudio();
}

function startCelebration() {
  window.clearTimeout(celebrationTimer);
  stopActiveAudio();
  clearReactionEffect();
  resetPortrait();
  startDancePortraits();
  document.body.classList.add("is-celebrating");
  stageCaption.textContent = "BIRTHDAY OVERDRIVE · 文学机甲小人正在鬼畜换动作！";
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

  const reaction = mutatePortrait(transcript, normalized);
  setStatus("“" + transcript + "” → " + reaction.status);
}

function setListening(active) {
  isListening = active;
  document.body.classList.toggle("is-listening", active);
  voiceButton.setAttribute("aria-pressed", String(active));
  voiceButton.innerHTML = active
    ? '<span aria-hidden="true">■</span> 停止声波'
    : '<span aria-hidden="true">🎙</span> 启动声波';

  if (active) {
    voiceFeedback.hidden = false;
    setVoiceFeedback("声波已接入，正在听你说话…", "正在监听");
    if (microphoneAnalyser) {
      updateMicrophoneVisualizer();
    }
    return;
  }

  voiceFeedback.hidden = true;
  stopMicrophoneVisualizer();
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
  instance.interimResults = true;
  instance.maxAlternatives = 1;

  instance.onstart = () => {
    setListening(true);
    startMicrophoneVisualizer();
    setStatus("声波已接入。说“文学，生日快乐！”开趴，其他话触发照片变异。");
  };

  instance.onresult = (event) => {
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0].transcript.trim();
      if (result.isFinal) {
        setVoiceFeedback(`已听见：“${transcript}” · 正在加载文学反应`, "指令已捕获");
        handleSpeech(transcript);
      } else if (transcript) {
        setVoiceFeedback(`正在听你说：“${transcript}”`, "声波解析中");
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

  instance.onend = () => {
    voiceSessionRequested = false;
    setListening(false);
  };
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
    voiceSessionRequested = false;
    recognition.stop();
    setListening(false);
    setStatus("声波已关闭。点击“启动声波”可以继续变异。");
    return;
  }

  try {
    voiceSessionRequested = true;
    startMicrophoneVisualizer();
    recognition.start();
  } catch {
    voiceSessionRequested = false;
    stopMicrophoneVisualizer();
    setStatus("语音识别正在准备中，请稍后再试。");
  }
});

partyButton.addEventListener("click", () => {
  getAudioContext();
  startCelebration();
});

preloadPortraits();
setStagePortrait(portraitDeck[0], false);

quizButton.addEventListener("click", openQuiz);
quizClose.addEventListener("click", closeQuiz);
gameButton.addEventListener("click", openMazeGame);
mazeClose.addEventListener("click", closeMazeGame);
mazeStartButton.addEventListener("click", startMazeGame);
mazeRestartButton.addEventListener("click", startMazeGame);

quizNext.addEventListener("click", () => {
  if (quizComplete) {
    resetQuiz();
    return;
  }
  if (!quizAnswered) {
    return;
  }

  quizIndex += 1;
  if (quizIndex >= quizQuestions.length) {
    quizComplete = true;
    renderQuizSummary();
    return;
  }
  renderQuizQuestion();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !quizModal.hidden) {
    closeQuiz();
  }
  if (event.key === "Escape" && !mazeModal.hidden) {
    closeMazeGame();
  }
});

if (!SpeechRecognition) {
  createRecognition();
}
