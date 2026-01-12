function createElementFromTemplate(templateSelector, data, elementsMap) {
    const template = document.querySelector(templateSelector)
    const clone = template.content.cloneNode(true)

    for (const key in elementsMap) {
        const selector = elementsMap[key]
        const el = clone.querySelector(selector)
        if (el && data[key]) {
            el.textContent = data[key]
        }
    }

    return clone
}


async function loadComments(container) {
    if (container.loading) return
    container.loading = true

    const endpoint = container.dataset.endpoint
    const template = container.dataset.template
    const target = document.querySelector(container.dataset.target)
    const elements = JSON.parse(container.dataset.elements)

    try {
        const response = await fetch(endpoint)
        const comments = await response.json()

        comments.forEach(comment => {
            const el = createElementFromTemplate(template, comment, elements)
            target.appendChild(el)
        })

      
        const url = new URL(endpoint)
        const page = Number(url.searchParams.get('_page') || 1)
        url.searchParams.set('_page', page + 1)
        container.dataset.endpoint = url.toString()

    } catch (e) {
        console.error(e)
    }

    container.loading = false
}

function initInfinitePagination() {
    const loaders = document.querySelectorAll('.js-infinite-pagination')

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadComments(entry.target)
            }
        })
    }, {
        rootMargin: '200px'
    })

    loaders.forEach(loader => observer.observe(loader))
}


function initFetchForms() {
    document.querySelectorAll('.js-form-fetch').forEach(form => {
        form.addEventListener('submit', async e => {
            e.preventDefault()

            const endpoint = form.dataset.endpoint
            const template = form.dataset.template
            const target = document.querySelector(form.dataset.target)
            const elements = JSON.parse(form.dataset.elements)

            const formData = new FormData(form)
            const data = Object.fromEntries(formData.entries())

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })

                const comment = await response.json()

                const el = createElementFromTemplate(template, comment, elements)
                target.prepend(el)

                form.reset()
                showAlert('Commentaire ajouté avec succès 👍', 'success')

            } catch (e) {
                showAlert('Erreur lors de l’envoi du commentaire ❌', 'danger')
            }
        })
    })
}


function showAlert(message, type = 'info') {
    const template = document.querySelector('#alert')
    const clone = template.content.cloneNode(true)
    const alert = clone.querySelector('.alert')

    alert.classList.add(`alert-${type}`)
    clone.querySelector('.js-text').textContent = message

    document.querySelector('article').prepend(clone)
}

document.addEventListener('DOMContentLoaded', () => {
    initInfinitePagination()
    initFetchForms()
})