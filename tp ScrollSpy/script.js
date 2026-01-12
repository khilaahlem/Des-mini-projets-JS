const spies = document.querySelectorAll('[data-spy]')

const ratio = 0.4
let y = Math.round(window.innerHeight * ratio)

const callback = function (entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      activate(entry.target)
    }
  })
}

let observer = new IntersectionObserver(callback, {
  rootMargin: `-${window.innerHeight - y - 1}px 0px -${y}px 0px`
})

spies.forEach(section => observer.observe(section))

const activate = function (elem) {
  const id = elem.getAttribute('id')
  const anchor = document.querySelector(`nav a[href="#${id}"]`)

  if (!anchor) return

  document
    .querySelectorAll('nav a.active')
    .forEach(link => link.classList.remove('active'))

  anchor.classList.add('active')
}

window.addEventListener('resize', () => {
  observer.disconnect()

  y = Math.round(window.innerHeight * ratio)
  observer = new IntersectionObserver(callback, {
    rootMargin: `-${window.innerHeight - y - 1}px 0px -${y}px 0px`
  })

  spies.forEach(section => observer.observe(section))
})
