<div align="center">

<img width="512" height="512" alt="icon" src="https://raw.githubusercontent.com/s36-technology/paint-linux/refs/heads/master/logo.svg" />


# Linux Paint

**Cross-platform graphics editor inspired by Windows 11 Paint**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com)
[![Electron](https://img.shields.io/badge/Electron-40.8.0-47848F.svg?logo=electron)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)

[English](#english)

</div>

---

## <a id="english"></a>🇺🇸 About Project

**Linux Paint** is a modern open-source graphics editor inspired by the classic Paint application from Windows 11. The application is optimized for Linux and web browsers, providing users with an intuitive interface and a rich set of tools for drawing and image editing.

### ✨ Features

#### 🎨 Drawing Tools
- **Pencil** — basic drawing tool
- **Brush** — brush with adjustable size
- **Eraser** — erase elements
- **Fill** — fill area with color
- **Text** — add text elements
- **Color Picker** — pick color from canvas
- **Magnifier** — zoom in/out

#### 🖌️ Various Brushes
- Calligraphy Brush
- Fountain Pen
- Airbrush
- Oil Brush
- Crayon
- Marker
- Texture Pencil
- Watercolor Brush

#### 🔷 Shapes
- Line, Bézier Curve
- Rectangle, Rounded Rectangle
- Circle, Ellipse
- Triangle, Right Triangle
- Diamond, Pentagon, Hexagon
- Polygon (custom)
- Arrows (right, left, up, down)
- Stars (4, 5, 6 points)
- Callouts (oval, rounded, cloud)
- Heart, Lightning

#### ✂️ Selection and Editing
- Rectangular selection
- Free-form selection (Lasso)
- Move and resize selection
- Rotate selection
- Flip horizontal/vertical
- Cut, Copy, Paste
- Crop

#### 🖼️ Image Operations
- Canvas resize
- Image rotation
- Image flip
- Color inversion
- Clear canvas
- Rulers and gridlines
- Thumbnail navigation

#### 📁 File Operations
- Create new file
- Open files (PNG, JPG, GIF, WebP, BMP)
- Save and Save As
- Print
- Set as desktop wallpaper
- Share image

#### ⌨️ Keyboard Shortcuts
| Action | Shortcut |
|--------|----------|
| New File | Ctrl+N |
| Open | Ctrl+O |
| Save | Ctrl+S |
| Properties | Ctrl+E |
| Select All | Ctrl+A |
| Copy | Ctrl+C |
| Cut | Ctrl+X |
| Paste | Ctrl+V |
| Undo | Ctrl+Z |
| Redo | Ctrl+Y / Ctrl+Shift+Z |
| Exit | Ctrl+Q |
| Clear Selection | Ctrl+W |
| Crop | Ctrl+Shift+X |
| Rulers | Ctrl+R |
| Gridlines | Ctrl+G |
| Fullscreen | F11 |
| Zoom In | Ctrl++ |
| Zoom Out | Ctrl+- |

#### 🌐 Internationalization
Support for 7 languages:
- 🇬🇧 English
- 🇷🇺 Russian
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇩🇪 German
- 🇨🇳 Chinese
- 🇻🇳 Vietnamese

### ️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Motion (animations)
- **Desktop:** Electron 42, Vite 8
- **Icons:** Lucide React
- **Build:** electron-builder (AppImage, deb, snap, pacman, flatpak, tar.gz)

### 📋 Requirements

- Node.js >= 26
- npm >= 11
- Linux (recommended) or any OS with Electron support

### 🚀 Installation and Running

```bash
# 1. Clone the repository
git clone <repository-url>
cd linux-paint

# 2. Install dependencies
npm install

# 3. Run in development mode
npm run dev

# 4. Build the application
npm run build

# 5. Build distributions for Linux
npm run dist
```

### 📦 Available Packages

After running `npm run dist`, the following files will be created in `dist-electron/`:
- `.AppImage` — portable version
- `.deb` — for Debian/Ubuntu
- `.snap` — for Snap Store
- `.pacman` — for Arch Linux
- `.flatpak` — for Flatpak
- `.tar.gz` — archive

### 📁 Project Structure

```
linux-paint/
├── electron/           # Electron main process
│   ├── main.cjs       # Electron main process
│   └── preload.cjs    # Preload script
├── src/               # React source code
│   ├── components/    # React components
│   │   ├── Toolbar.tsx
│   │   └── DrawingCanvas.tsx
│   ├── App.tsx        # Main component
│   ├── i18n.ts        # Internationalization
│   ├── types.ts       # TypeScript types
│   ├── main.tsx       # Entry point
│   └── index.css      # Global styles
├── build/icons/       # Application icons
│   └── linux/
│       └── icon.png
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── vite.config.ts     # Vite configuration
└── README.md          # Documentation
```

### 🔧 npm Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run in development mode |
| `npm run build` | Build production version |
| `npm run preview` | Preview build |
| `npm run start` | Run Electron + Vite dev server |
| `npm run dist` | Build distributions |
| `npm run clean` | Clean dist folder |
| `npm run lint` | TypeScript check |

---

<div align="center">

### 📄 License

MIT License

**Linux Paint** — made with ❤️ for the Linux community

</div>
