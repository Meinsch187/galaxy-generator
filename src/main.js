import GUI from 'lil-gui'
import { generateGalaxy } from './galaxy/logic.js'
import { createGalaxyRenderer } from './galaxy/renderer.js'

// Default parameters
const params = {
  particleCount: 8000,
  radius: 15,
  arms: 4,
  spin: 0.5,
  spread: 0.3,
  heightSpread: 0.4,
  concentration: 3,
  innerColor: [255, 77, 26],   // RGB 0-255 → {r:1, g:0.3, b:0.1}
  outerColor: [26, 77, 255],   // RGB 0-255 → {r:0.1, g:0.3, b:1}
  seed: 42
}

let renderer

function regenerate() {
  // Convert colors from 0-255 to 0-1
  const galaxy = generateGalaxy({
    ...params,
    innerColor: { r: params.innerColor[0] / 255, g: params.innerColor[1] / 255, b: params.innerColor[2] / 255 },
    outerColor: { r: params.outerColor[0] / 255, g: params.outerColor[1] / 255, b: params.outerColor[2] / 255 }
  })

  if (!renderer) {
    renderer = createGalaxyRenderer(document.body, galaxy.positions, galaxy.colors)
  } else {
    renderer.updateGeometry(galaxy.positions, galaxy.colors)
  }
}

// GUI
const gui = new GUI({ title: 'Galaxie' })

gui.add(params, 'particleCount', 100, 30000, 100).name('Partikel')
gui.add(params, 'radius', 5, 30, 0.5).name('Radius')
gui.add(params, 'arms', 1, 10, 1).name('Arme')
gui.add(params, 'spin', -3, 3, 0.1).name('Drehung')
gui.add(params, 'spread', 0, 1, 0.01).name('Streuung')
gui.add(params, 'heightSpread', 0, 2, 0.01).name('Höhe')
gui.add(params, 'concentration', 0.5, 10, 0.1).name('Dichte')
gui.addColor(params, 'innerColor').name('Farbe innen')
gui.addColor(params, 'outerColor').name('Farbe außen')
gui.add(params, 'seed').name('Seed')

// On any change, regenerate
gui.controllers.forEach(c => c.onChange(regenerate))

// Initial generation
regenerate()
