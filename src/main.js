import * as THREE from 'three'
import { generateGalaxy } from './galaxy/logic.js'
import { createGalaxyRenderer } from './galaxy/renderer.js'

const galaxy = generateGalaxy({ particleCount: 8000 })
const renderer = createGalaxyRenderer(document.body, galaxy.positions, galaxy.colors)

// Keep a reference to prevent GC
window.__galaxy = renderer
