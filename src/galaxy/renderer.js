import * as THREE from 'three'

function createRoundTexture(size = 64) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export function createGalaxyRenderer(container, positions, colors) {
  // Fallback to document.body if container falsy
  if (!container) {
    container = document.body
  }

  const isBody = container === document.body
  const width = isBody ? window.innerWidth : container.clientWidth
  const height = isBody ? window.innerHeight : container.clientHeight

  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#0b0b1a')

  // Camera
  const BASE_CAMERA = new THREE.Vector3(0, -8, 16)
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200)
  camera.position.copy(BASE_CAMERA)
  camera.lookAt(0, 0, 0)

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // Round point texture
  const texture = createRoundTexture()

  // Points
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const material = new THREE.PointsMaterial({
    size: 0.12,
    map: texture,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  })

  const points = new THREE.Points(geometry, material)
  scene.add(points)

  // Resize handler
  const onResize = () => {
    const w = isBody ? window.innerWidth : container.clientWidth
    const h = isBody ? window.innerHeight : container.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }
  window.addEventListener('resize', onResize)

  const mouse = { x: 0, y: 0 }

  function onMouseMove(e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
  }
  window.addEventListener('mousemove', onMouseMove)

  let zoomLevel = 1.0

  const target = { x: 0, y: 0 }

  function onWheel(e) {
    zoomLevel -= e.deltaY * 0.001
    zoomLevel = Math.max(0.3, Math.min(3.0, zoomLevel))
  }
  window.addEventListener('wheel', onWheel)

  // Animation loop
  let animationId

  function animate() {
    animationId = requestAnimationFrame(animate)
    target.x += (mouse.x - target.x) * 0.02
    target.y += (mouse.y - target.y) * 0.02
    points.rotation.y += 0.0003 + target.x * 0.12
    points.rotation.x += 0.00005 + target.y * 0.06
    camera.position.copy(BASE_CAMERA).multiplyScalar(zoomLevel)
    renderer.render(scene, camera)
  }
  animate()

  function updateGeometry(newPositions, newColors) {
    geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3))
  }

  return {
    dispose() {
      cancelAnimationFrame(animationId)
      geometry.dispose()
      material.dispose()
      if (material.map) material.map.dispose()
      renderer.domElement.remove()
      renderer.dispose()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('wheel', onWheel)
    },
    updateGeometry
  }
}
