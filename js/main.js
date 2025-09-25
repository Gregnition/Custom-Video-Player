// main.js - cleaned & consolidated

// DOM references
const player = document.querySelector('.player');
const video = player.querySelector('.viewer');
const progress = player.querySelector('.progress');
const progressBar = player.querySelector('.progress__filled');
const toggle = player.querySelector('.toggle');
const skipButtons = player.querySelectorAll('[data-skip]');
const ranges = player.querySelectorAll('.player__slider');
const fullscreenButton = player.querySelector('.fullscreen');
const settingsToggle = player.querySelector('.settings-toggle');
const settingsPanel = document.querySelector('.settings-panel');
const settingSliders = document.querySelectorAll('.setting-slider');
const timeDisplay = player.querySelector('.time-display');
const playbackRateDisplay = settingsPanel?.querySelector('.playback-rate-display');

const loopStartDisplay = document.getElementById('loop-start-time');
const loopEndDisplay = document.getElementById('loop-end-time');
const setLoopStartBtn = document.getElementById('set-loop-start');
const setLoopEndBtn = document.getElementById('set-loop-end');
const toggleLoopBtn = document.getElementById('toggle-loop');
const clearLoopBtn = document.getElementById('clear-loop');

const volumeToggle = document.querySelector('.volume-toggle');
const volumePanel = document.querySelector('.volume-panel');
const volumeSlider = document.querySelector('.volume-slider');

const progressThumb = player.querySelector('.progress__thumb');
const qualitySelect = settingsPanel?.querySelector('.quality-select');

const prevBtn = document.getElementById('prev-chapter');
const nextBtn = document.getElementById('next-chapter');

const openLoopBtn = document.getElementById('open-loop-panel');
const loopPanel = document.getElementById('loop-panel');
const closeLoopBtn = document.getElementById('close-loop-panel');

const chapterToggle = document.querySelector('.chapter-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const progressTrack = progress; // alias for clarity

// ---------- Utility Functions ----------
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    : `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateTimeDisplay() {
  const current = formatTime(video.currentTime);
  const duration = formatTime(video.duration);
  timeDisplay.textContent = `${current} / ${duration}`;
}

// ---------- Player Controls ----------
function togglePlay() {
  video[video.paused ? 'play' : 'pause']();
}

function updateButton() {
  toggle.textContent = video.paused ? 'play_circle' : 'pause_circle';
}

function skip() {
  video.currentTime += parseFloat(this.dataset.skip);
}

function handleRangeUpdate() {
  if (this.name) {
    video[this.name] = parseFloat(this.value);
  }
}

function handleProgress() {
  if (!isFinite(video.duration) || video.duration === 0) return;
  const percent = (video.currentTime / video.duration) * 100;
  progressBar.style.width = `${percent}%`;
  if (progressThumb) progressThumb.style.left = `${percent}%`;
}

function scrub(e) {
  const rect = progress.getBoundingClientRect();
  const offsetX = (e.offsetX !== undefined) ? e.offsetX : (e.clientX - rect.left);
  video.currentTime = (offsetX / progress.offsetWidth) * video.duration;
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    player.requestFullscreen();
  } else {
    document.exitFullscreen?.();
  }
}

// ---------- Settings Panel ----------
function toggleSettingsPanel() {
  if (!settingsPanel) return;
  settingsPanel.classList.toggle('hidden');
}

// ---------- Playback Speed Controls ----------
if (settingsPanel && playbackRateDisplay) {
  playbackRateDisplay.textContent = `${video.playbackRate.toFixed(1)}x`;
}

const playbackRatePresets = settingsPanel?.querySelectorAll('.playback-rate-presets button') || [];
const playbackSlider = settingsPanel?.querySelector('input[name="playbackRate"]');

function setPlaybackRate(rate) {
  video.playbackRate = rate;
  if (playbackSlider) playbackSlider.value = rate;
  playbackRatePresets.forEach(btn => btn.classList.toggle('active', parseFloat(btn.dataset.rate) === rate));
  if (playbackRateDisplay) playbackRateDisplay.textContent = `${rate.toFixed(1)}x`;
}

if (playbackRatePresets.length) setPlaybackRate(video.playbackRate);

playbackRatePresets.forEach(btn =>
  btn.addEventListener('click', () => setPlaybackRate(parseFloat(btn.dataset.rate)))
);

playbackSlider?.addEventListener('input', () => {
  setPlaybackRate(parseFloat(playbackSlider.value));
});

// Playback rate popup (if present)
const playbackRateOpenBtn = settingsPanel?.querySelector('.playback-rate-open-btn');
const playbackRatePopup = settingsPanel?.querySelector('.playback-rate-popup');
const playbackRatePopupSlider = playbackRatePopup?.querySelector('input[name="playbackRate"]');
const playbackRatePopupButtons = playbackRatePopup?.querySelectorAll('.playback-rate-presets button') || [];

function updatePlaybackRateUI(rate) {
  setPlaybackRate(rate);
  if (playbackRatePopupSlider) playbackRatePopupSlider.value = rate;
}

function togglePlaybackRatePopup() {
  if (!playbackRatePopup) return;
  playbackRatePopup.classList.toggle('hidden');
}

playbackRateDisplay?.addEventListener('click', togglePlaybackRatePopup);
playbackRateOpenBtn?.addEventListener('click', togglePlaybackRatePopup);

playbackRatePopupButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const rate = parseFloat(btn.dataset.rate);
    updatePlaybackRateUI(rate);
    playbackRatePopup.classList.add('hidden');
  });
});

playbackRatePopupSlider?.addEventListener('input', e => updatePlaybackRateUI(parseFloat(e.target.value)));

document.addEventListener('click', e => {
  if (!playbackRatePopup || !settingsPanel) return;
  if (
    !settingsPanel.contains(e.target) &&
    !playbackRateDisplay.contains(e.target) &&
    !playbackRateOpenBtn.contains(e.target)
  ) {
    playbackRatePopup.classList.add('hidden');
  }
});

// ---------- Progress Thumbnail Preview ----------
const thumbPreview = document.getElementById('thumbPreview');
const thumbWidth = 160;
const thumbHeight = 90;
const thumbsPerRow = 5;
const spriteTotalFrames = 20;

if (progress && thumbPreview && video) {
  progress.addEventListener('mousemove', e => {
    if (!video.duration) return;
    const rect = progress.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percent = Math.min(Math.max(0, offsetX / rect.width), 1);
    const videoTime = percent * video.duration;
    const frame = Math.floor((videoTime / video.duration) * spriteTotalFrames);
    const col = frame % thumbsPerRow;
    const row = Math.floor(frame / thumbsPerRow);

    thumbPreview.style.backgroundPosition = `-${col * thumbWidth}px -${row * thumbHeight}px`;
    thumbPreview.style.left = `${offsetX - thumbWidth / 2}px`;
    thumbPreview.style.display = 'block';
  });

  progress.addEventListener('mouseleave', () => {
    thumbPreview.style.display = 'none';
  });
}

// ---------- Chapter Markers ----------
const chapters = [
  { percent: 0, title: "Intro" },
  { percent: 10, title: "Opening Scene" },
  { percent: 40, title: "Main Event" },
  { percent: 65, title: "Climax" },
  { percent: 90, title: "Ending" }
];

let chapterMarkers = [];

function createChapterMarkers() {
  if (!progressTrack) return;
  // Clear existing markers
  chapterMarkers.forEach(m => m.remove());
  chapterMarkers = [];

  const dur = video.duration;
  if (!isFinite(dur) || dur <= 0) return;

  chapters.forEach(ch => {
    const time = (ch.percent / 100) * dur;
    const marker = document.createElement('div');
    marker.className = 'chapter-marker';
    marker.style.left = `${ch.percent}%`;
    marker.title = `${formatTime(time)} - ${ch.title}`;

    marker.addEventListener('click', e => {
      e.stopPropagation();
      video.currentTime = time;
    });

    progressTrack.appendChild(marker);
    chapterMarkers.push(marker);
  });
}

function clearChapterMarkers() {
  chapterMarkers.forEach(m => m.remove());
  chapterMarkers = [];
}

function applyChapterToggle(show) {
  show ? createChapterMarkers() : clearChapterMarkers();
}

chapterToggle?.addEventListener('change', () => {
  applyChapterToggle(chapterToggle.checked);
  localStorage.setItem('chapterToggleEnabled', chapterToggle.checked);
});

video.addEventListener('loadedmetadata', () => {
  if (chapterToggle?.checked) createChapterMarkers();
});

// ---------- Prev/Next Chapter ----------
function getCurrentChapterIndex() {
  if (!isFinite(video.duration) || video.duration <= 0) return 0;
  let idx = 0;
  chapters.forEach((ch, i) => {
    if (video.currentTime >= (ch.percent / 100) * video.duration) idx = i;
  });
  return idx;
}

prevBtn?.addEventListener('click', () => {
  const idx = getCurrentChapterIndex();
  video.currentTime = idx > 0 ? (chapters[idx - 1].percent / 100) * video.duration : 0;
});

nextBtn?.addEventListener('click', () => {
  const idx = getCurrentChapterIndex();
  video.currentTime = idx < chapters.length - 1
    ? (chapters[idx + 1].percent / 100) * video.duration
    : video.duration;
});

// ---------- Loop Controls ----------
let loopStart = 0;
let loopEnd = 0;
let isLooping = false;

function updateLoopDisplays() {
  if (loopStartDisplay) loopStartDisplay.textContent = formatTime(loopStart);
  if (loopEndDisplay) loopEndDisplay.textContent = (loopEnd >= (video.duration || Infinity)) ? '--:--' : formatTime(loopEnd);
}

function checkLoop() {
  if (isLooping && video.currentTime >= loopEnd) {
    video.currentTime = loopStart;
  }
}

setLoopStartBtn?.addEventListener('click', () => {
  loopStart = video.currentTime;
  if (loopEnd <= loopStart) loopEnd = video.duration;
  updateLoopDisplays();
});

setLoopEndBtn?.addEventListener('click', () => {
  loopEnd = video.currentTime;
  if (loopStart >= loopEnd) loopStart = 0;
  updateLoopDisplays();
});

toggleLoopBtn?.addEventListener('click', () => {
  isLooping = !isLooping;
  toggleLoopBtn.style.backgroundColor = isLooping ? 'rgba(0, 119, 255, 0.4)' : '';
});

clearLoopBtn?.addEventListener('click', () => {
  loopStart = 0;
  loopEnd = video.duration || 0;
  isLooping = false;
  updateLoopDisplays();
  if (toggleLoopBtn) toggleLoopBtn.style.backgroundColor = '';
});

openLoopBtn?.addEventListener('click', () => {
  loopPanel?.classList.toggle('hidden');
});

closeLoopBtn?.addEventListener('click', () => {
  loopPanel?.classList.add('hidden');
});

video.addEventListener('loadedmetadata', () => {
  loopEnd = video.duration || 0;
  updateLoopDisplays();
});

// ---------- Volume Controls ----------
(function setupVolumeControls() {
  if (!volumeToggle || !volumeSlider || !video) return;

  // Restore from localStorage
  let savedVolume = localStorage.getItem('videoPlayerVolume');
  let savedMuted = localStorage.getItem('videoPlayerMuted');

  if (savedVolume !== null) video.volume = parseFloat(savedVolume);
  if (savedMuted === 'true') video.muted = true;

  let lastVolume = video.volume > 0 ? video.volume : 1;

  function updateVolumeIcon() {
    if (video.muted || video.volume === 0) volumeToggle.textContent = 'volume_off';
    else if (video.volume <= 0.5) volumeToggle.textContent = 'volume_down';
    else volumeToggle.textContent = 'volume_up';
  }

  volumeSlider.value = video.volume;
  updateVolumeIcon();

  volumeToggle.addEventListener('click', () => {
    if (video.muted) {
      video.muted = false;
      video.volume = lastVolume;
    } else {
      video.muted = true;
      lastVolume = video.volume > 0 ? video.volume : lastVolume;
    }
    volumeSlider.value = video.muted ? 0 : video.volume;
    updateVolumeIcon();
    localStorage.setItem('videoPlayerMuted', video.muted);
    localStorage.setItem('videoPlayerVolume', video.volume);
    localStorage.setItem('videoPlayerLastVolume', lastVolume);
  });

  volumeSlider.addEventListener('input', e => {
    const val = parseFloat(e.target.value);
    video.volume = val;
    video.muted = val === 0;
    if (val > 0) lastVolume = val;
    updateVolumeIcon();
    localStorage.setItem('videoPlayerMuted', video.muted);
    localStorage.setItem('videoPlayerVolume', val);
    localStorage.setItem('videoPlayerLastVolume', lastVolume);
  });

  video.addEventListener('volumechange', () => {
    volumeSlider.value = video.muted ? 0 : video.volume;
    if (!video.muted && video.volume > 0) lastVolume = video.volume;
    updateVolumeIcon();
    localStorage.setItem('videoPlayerMuted', video.muted);
    localStorage.setItem('videoPlayerVolume', video.volume);
    localStorage.setItem('videoPlayerLastVolume', lastVolume);
  });
})();

// ---------- Dragging Progress Thumb ----------
let isDragging = false;

function onDragStart(e) {
  isDragging = true;
  e.preventDefault();
}

function onDragMove(e) {
  if (!isDragging) return;
  const rect = progress.getBoundingClientRect();
  const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  let newPos = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  video.currentTime = (newPos / rect.width) * video.duration;
}

function onDragEnd() {
  isDragging = false;
}

progressThumb?.addEventListener('mousedown', onDragStart);
progressThumb?.addEventListener('touchstart', onDragStart);
window.addEventListener('mousemove', onDragMove);
window.addEventListener('touchmove', onDragMove);
window.addEventListener('mouseup', onDragEnd);
window.addEventListener('touchend', onDragEnd);

// ---------- Auto-hide Controls ----------
let hideControlsTimeout;

function showControls() {
  player.classList.remove('hide-controls');
  player.querySelector('.player__controls').classList.remove('hide');
  resetHideControlsTimer();
}

function hideControls() {
  player.querySelector('.player__controls').classList.add('hide');
}

function resetHideControlsTimer() {
  clearTimeout(hideControlsTimeout);
  hideControlsTimeout = setTimeout(() => {
    if (!video.paused) hideControls();
  }, 3000);
}

player.addEventListener('mousemove', showControls);
player.addEventListener('mouseleave', hideControls);
video.addEventListener('play', resetHideControlsTimer);
video.addEventListener('pause', showControls);

// ---------- Basic Event Listeners ----------
video.addEventListener('click', togglePlay);
video.addEventListener('play', updateButton);
video.addEventListener('pause', updateButton);
video.addEventListener('timeupdate', () => {
  handleProgress();
  updateTimeDisplay();

  // Update chapter markers active state
  if (chapterMarkers.length) {
    const currentTime = video.currentTime;
    const dur = video.duration;
    if (!isFinite(dur) || dur <= 0) return;

    let activeIndex = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (currentTime >= (chapters[i].percent / 100) * dur) activeIndex = i;
      else break;
    }
    chapterMarkers.forEach((marker, i) => marker.classList.toggle('active', i === activeIndex));
  }

  checkLoop();
});

toggle.addEventListener('click', togglePlay);
skipButtons.forEach(button => button.addEventListener('click', skip));
ranges.forEach(range => range.addEventListener('input', handleRangeUpdate));

let mousedown = false;
progress.addEventListener('click', scrub);
progress.addEventListener('mousemove', e => mousedown && scrub(e));
progress.addEventListener('mousedown', () => mousedown = true);
progress.addEventListener('mouseup', () => mousedown = false);

fullscreenButton?.addEventListener('click', toggleFullScreen);
settingsToggle?.addEventListener('click', toggleSettingsPanel);

// ---------- Quality Selector ----------
if (qualitySelect && video) {
  const sources = video.querySelectorAll('source');
  qualitySelect.addEventListener('change', () => {
    const selectedQuality = qualitySelect.value;
    const currentTime = video.currentTime;
    const isPlaying = !video.paused;
    let newSrc = '';

    sources.forEach(source => {
      if (source.dataset.quality === selectedQuality) newSrc = source.src;
    });

    if (newSrc) {
      video.src = newSrc;
      video.load();
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = currentTime;
        if (isPlaying) video.play();
      }, { once: true });
    }
  });
}

// ---------- Theme Toggle ----------
function applyLightTheme(enabled) {
  player.classList.toggle('light-theme', enabled);
}

themeToggle?.addEventListener('change', () => {
  applyLightTheme(themeToggle.checked);
  localStorage.setItem('lightThemeEnabled', themeToggle.checked);
  
});


const thumbnail = document.getElementById('thumbPreview');

progress.addEventListener('mousemove', e => {
  const rect = progress.getBoundingClientRect();
  const posX = e.clientX - rect.left;
  const percent = posX / rect.width;
  const time = percent * video.duration;

  // Position the thumbnail preview under the cursor
  thumbnail.style.left = `${posX}px`;
  thumbnail.style.display = 'block';

  // TODO: Update thumbnail image based on time here
  // Example if you have thumbnails:
  // thumbnail.style.backgroundImage = `url('thumbnails/thumb-${Math.floor(time)}.jpg')`;
});

progress.addEventListener('mouseleave', () => {
  thumbnail.style.display = 'none';
});






// ---------- Initialization on DOM Load ----------
window.addEventListener('DOMContentLoaded', () => {
  // Restore theme
  const savedLightTheme = localStorage.getItem('lightThemeEnabled') === 'true';
  if (themeToggle) {
    themeToggle.checked = savedLightTheme;
    applyLightTheme(savedLightTheme);
  }

  // Restore chapter toggle
  const savedChapterToggle = localStorage.getItem('chapterToggleEnabled');
  const chapterEnabled = savedChapterToggle === 'true';
  if (chapterToggle) {
    chapterToggle.checked = chapterEnabled;
    if (chapterEnabled) createChapterMarkers();
  }

  // Initialize loop panel hidden by default
  if (loopPanel && !loopPanel.classList.contains('hidden')) loopPanel.classList.add('hidden');

  // Set initial loop end after metadata loaded
  if (video.readyState >= 1) {
    loopEnd = video.duration || 0;
    updateLoopDisplays();
  } else {
    video.addEventListener('loadedmetadata', () => {
      loopEnd = video.duration || 0;
      updateLoopDisplays();
    });
  }

  // Initialize progress and time display
  updateTimeDisplay();
  handleProgress();
});


progress.addEventListener('mousemove', e => {
  if (!video.duration) return;
  const rect = progress.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const percent = Math.min(Math.max(0, offsetX / rect.width), 1);
  const videoTime = percent * video.duration;
  const frame = Math.floor((videoTime / video.duration) * spriteTotalFrames);
  const col = frame % thumbsPerRow;
  const row = Math.floor(frame / thumbsPerRow);

  thumbPreview.style.backgroundPosition = `-${col * thumbWidth}px -${row * thumbHeight}px`;
  thumbPreview.style.left = `${offsetX - thumbWidth / 2}px`;
  thumbPreview.style.display = 'block';
});
