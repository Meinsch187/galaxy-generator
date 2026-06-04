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
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200)
  camera.position.set(0, -8, 16)
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

  // Animation loop
  let animationId

  function animate() {
    animationId = requestAnimationFrame(animate)
    points.rotation.y += 0.0003
    points.rotation.x += 0.00005
    renderer.render(scene, camera)
  }
  animate()

  return {
    dispose() {
      cancelAnimationFrame(animationId)
      geometry.dispose()
      material.dispose()
      if (material.map) material.map.dispose()
      renderer.domElement.remove()
      renderer.dispose()
      window.removeEventListener('resize', onResize)
    }
  }
}
