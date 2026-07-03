# VoxRead

**VoxRead** is a frontend-only Text-to-Speech website built with **HTML5**, **CSS3**, **JavaScript (ES6)**, and the browser's built-in **Web Speech API**. It is designed as an accessible portfolio or college project that demonstrates polished UI, responsive design, and rich speech interactions without any backend.

## Overview

VoxRead converts page text into natural speech and includes features such as:

- Speaking custom text input
- Pausing, resuming, stopping, and clearing speech
- Voice, language, rate, pitch, and volume controls
- Reading full page content, articles, quotes, and stories
- Highlighting the active text while reading
- Accessibility panel with theme switching and font size adjustments
- Mobile-friendly responsive layout

## Features

- **Text-to-Speech Playground** with live speech controls
- **Voice Settings** panel with voice and language selectors
- **Read This Page** support for headings, paragraphs, lists, blockquotes, and more
- **Article Reader** with section playback controls
- **Blog Cards** with read-summary and full-read actions
- **FAQ** accordion with read-answer support
- **Quote Generator** with randomized quotes and speech playback
- **Story Reader** with dedicated controls
- **Accessibility Panel** for dark mode, font resizing, and quick speech controls
- **Keyboard shortcuts**: Space to pause/resume, Esc to stop

## Getting Started

### Run locally

1. Open the project folder in your editor.
2. Start a local server in the project directory.
   - Using Python 3:
     ```bash
     python -m http.server 8000
     ```
3. Open your browser and go to:
   ```
   http://127.0.0.1:8000/
   ```

### Files

- `index.html` — main page structure and content
- `styles.css` — layout, responsive design, and theme styling
- `script.js` — speech synthesis logic, controls, and UI interactions

## Notes

- This project is fully client-side and does not require a backend or database.
- It relies on the browser's Web Speech API, so browser support may vary.

## License

This project may be used for learning, portfolio, or demo purposes.
