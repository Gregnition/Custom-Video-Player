# Custom HTML5 Video Player

This is a customizable video player built with **HTML, CSS, and JavaScript**.  
It currently includes features such as chapters, loop controls, playback speed adjustment, fullscreen, and theming.

## 🎥 How to Use
1. Add your own video file (`.mp4`) to the project root.  
2. In `index.html`, replace `sample.mp4` with your filename if different:
   ```html
   <video class="player__video viewer" src="yourvideo.mp4"></video>
   ```

## 🔧 Features
- Play/Pause, skip forward/backward
- Adjustable volume with mute toggle (Muting will remember your last volume settings when unmuting)
- Loop controls (set start/end and repeat)
- Chapter markers with navigation (Icon indication of the active chapter)
- Playback speed adjustment (slider + presets)
- Thumbnail preview area (optional sprite support)
- Light/Dark theme toggle
- Fullscreen mode

## 📌 Notes
- This project does **not** include a video file by default. You must provide your own `.mp4`.  
- Thumbnail preview (`.thumbnail-preview`) is set up but requires a sprite sheet.  
  - To enable previews, update `css/style.css` with your own sprite sheet path.  
  - Or leave it blank if you don’t need thumbnail previews.

## 🚀 Getting Started
1. Open `index.html` in your browser.  
2. Load your video to test the controls.  
3. Customize `style.css` or `main.js` to expand functionality.

---
Made for learning and demonstration purposes.
