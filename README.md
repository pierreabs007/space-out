# Solar System Viewer

A production-quality, interactive 3D solar system simulation built with Next.js and React Three Fiber. Experience our solar system with realistic orbital mechanics, beautiful visuals, and comprehensive controls.

![Solar System Preview](https://img.shields.io/badge/3D-Solar%20System-blue?logo=three.js)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black?logo=next.js)
![React Three Fiber](https://img.shields.io/badge/R3F-Interactive-orange?logo=react)

## 🌟 Features

### Core Solar System
- **Realistic planets**: All 8 planets (Mercury through Neptune) with accurate:
  - Orbital distances (scaled for visualization)
  - Orbital periods and revolution speeds
  - Relative sizes and colors
  - Axial tilts
- **Dynamic texturing**: Textured planets with fallback to colors
- **Orbital mechanics**: Planets follow elliptical paths with realistic timing

### Celestial Bodies
- **Sun**: Central star with emissive glow and bloom effects
- **Moons**: Major moons including Earth's Moon, Jupiter's Galilean satellites, and Saturn's moons
- **Saturn's rings**: Realistic ring system with transparency
- **Asteroid Belt**: 5,000 instanced asteroids between Mars and Jupiter

### Visual Effects
- **Background**: Dense starfield with 5,000+ stars and distant spiral galaxies
- **Postprocessing**: Bloom effects for the sun and celestial glow
- **Performance optimized**: Instanced rendering for asteroids and stars

### Interactive Controls
- **Camera**: OrbitControls with smooth zoom, pan, and rotation
- **Speed Control**: Variable animation speed from 0× (pause) to 5000× 
- **View Controls**: Adjustable tilt, zoom, and quick "Top-Down" reset
- **Feature Toggles**: Show/hide orbits, labels, moons, asteroid belt, and reference grid

## 🚀 Quick Start

### Prerequisites
- Node.js 16.8 or later
- npm or yarn package manager

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Add planet textures** (optional but recommended):
   - Place planet texture images in `/public/textures/planets/`
   - Required files: `mercury.jpg`, `venus.jpg`, `earth.jpg`, `mars.jpg`, `jupiter.jpg`, `saturn.jpg`, `uranus.jpg`, `neptune.jpg`, `moon.jpg`, `saturn_rings.png`
   - Use the included `generate-textures.html` to create simple procedural textures, or download high-quality textures from NASA/ESA sources

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The 3D scene will load automatically

### Production Build
```bash
npm run build
npm start
```

## 🎮 Controls

### Mouse/Touch Controls
- **Left Click + Drag**: Rotate camera around the solar system
- **Right Click + Drag**: Pan camera position
- **Mouse Wheel**: Zoom in/out
- **Touch**: Full mobile support with gesture controls

### UI Panel Controls
- **Animation Speed**: Adjust time scale from 0× (pause) to 5000× speed
- **System Tilt**: Rotate the entire solar system (-60° to +60°)
- **Zoom Level**: Camera distance control (250-2500 units)
- **Quick Buttons**: Instant speed presets and top-down view reset
- **Feature Toggles**:
  - Orbit paths visibility
  - Planet labels
  - Moon visibility
  - Asteroid belt
  - Reference grid

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **3D Engine**: Three.js + React Three Fiber
- **3D Utilities**: @react-three/drei for helpers and controls
- **Post-Processing**: @react-three/postprocessing for visual effects
- **Styling**: Tailwind CSS for UI components
- **Language**: TypeScript for type safety

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page with dynamic import
├── components/
│   ├── SolarSystemApp.tsx # Main client component with controls
│   ├── Scene.tsx          # 3D scene orchestrator
│   └── objects/           # Individual 3D components
│       ├── Sun.tsx
│       ├── Planet.tsx
│       ├── Moon.tsx
│       ├── SaturnRings.tsx
│       ├── AsteroidBelt.tsx
│       ├── BackdropStars.tsx
│       └── Galaxy.tsx
├── lib/
│   └── planets.ts         # Astronomical data and constants
├── public/
│   └── textures/
│       └── planets/       # Planet texture images
└── ...config files
```

### Key Design Decisions

1. **Client-Side Rendering**: The 3D scene is loaded via dynamic import with `ssr: false` to prevent WebGL server-side rendering issues

2. **Data-Driven**: Planet and moon data is centralized in `lib/planets.ts` with realistic astronomical values scaled for visualization

3. **Performance First**: 
   - Instanced rendering for asteroid belt (5,000+ objects)
   - Efficient point clouds for starfield
   - Minimal draw calls and optimized geometries

4. **Responsive Design**: Fully responsive UI that works on desktop, tablet, and mobile devices

## 🎨 Customization

### Adding New Planets/Moons
Edit `lib/planets.ts` to add new celestial bodies:

```typescript
export const planets: PlanetData[] = [
  // Add your custom planet
  {
    name: 'CustomPlanet',
    color: '#FF5733',
    radiusKm: 5000,
    distanceAu: 15.0,
    periodDays: 8000,
    hasRings: false,
    texture: 'custom_planet.jpg'
  }
]
```

### Modifying Visual Effects
Adjust postprocessing in `Scene.tsx`:
```typescript
<Bloom
  intensity={0.5}        // Glow strength
  kernelSize={KernelSize.LARGE}
  luminanceThreshold={0.4}  // What glows
/>
```

### Scaling and Units
Modify scaling constants in `lib/planets.ts`:
```typescript
export const AU_TO_UNITS = 30    // 1 AU = 30 scene units
export const SIZE_SCALE = 0.00005 // Planet size multiplier
```

## 📱 Browser Support

- **Modern browsers** with WebGL support
- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support (iOS 12+)
- **Mobile**: Optimized touch controls

## 🐛 Known Issues & Solutions

1. **Texture Loading**: If textures fail to load, planets will fallback to solid colors
2. **Performance**: On lower-end devices, reduce asteroid count in `AsteroidBelt.tsx`
3. **Mobile Performance**: Consider disabling bloom effects on mobile

## 🔧 Development

### Scripts
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build
- `npm run start` - Production server  
- `npm run lint` - Code linting

### Adding Textures
1. Use the included `generate-textures.html` for procedural textures
2. Or download high-quality textures from:
   - [NASA Planetary Fact Sheets](https://nssdc.gsfc.nasa.gov/planetary/planetfact.html)
   - [Solar System Scope Textures](https://www.solarsystemscope.com/textures/)
   - [Planet Pixel Emporium](http://planetpixelemporium.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🌌 Credits

- Astronomical data from NASA/JPL
- Built with [Three.js](https://threejs.org/) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- Inspired by real solar system simulations and educational astronomy tools

---

**Note**: This simulation uses scaled distances and sizes for visualization purposes. Actual astronomical scales would make planets invisible at realistic distances.

Enjoy exploring our solar system! 🚀🪐✨
