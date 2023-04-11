url_entry = document.querySelector('#url')
download = document.querySelector('#download')
idownload = document.querySelector('#download img')
strart_dl = document.querySelector('#confirm')
select_all_btn = document.querySelector('#all')
quals_select_btn = document.querySelector('#qual')
m3u_btn = document.querySelector('#m3u')
h3 = document.querySelector('h3')

popup = document.querySelector('.info')
form = document.querySelector('.search')
results = document.querySelector('.results')
popup_dls = document.querySelector('.info ul')

background = document.querySelector('.bg')

selected = `
<svg width="20" height="20">
  <circle cx="10" cy="10" r="10" fill="rgba(0, 0, 0, 0.5)" />
  <path d="M3 9 L8 16 L16 3" stroke="green" stroke-width="3" fill="none" />
</svg>
`

SELECTED = []
M3U_MODE = false

function toggle_m3u() {
    // Toggle M3U mode

    m3u_btn.classList.toggle('toggled')

    M3U_MODE = !M3U_MODE
    console.log('toggling m3u', M3U_MODE)
}

function toggle_qual() {
    // Toggle quality menu

    // document.querySelectorAll('.qclose').classList.toggle('hidden')
    document.querySelector('.quals').classList.toggle('hidden')

    quals_select_btn.classList.toggle('opened')

}

function init_dl() {
    // Initialise the download of all selected files

    quality = '?q=' + document.querySelector('.quals').value

    if (M3U_MODE) {

        if (!confirm('Your browser is most likely to block the m3u files. Continue?')) {
            return
        }

        for (let ep_url of SELECTED) {
            window.open(window.location.href + 'frag?url=' + ep_url + quality, '_blank').focus()
        }
    }

    for (let ep_url of SELECTED) {
        window.open(window.location.href + 'get?url=' + ep_url + quality, '_blank').focus()
    }
}

function select_all() {
    // Select all elements

    results.querySelectorAll('div').forEach(el => {select(el)})
}

function cancel_dl() {
    // Remove animations

    popup.classList.add('hidden')

    background.classList.remove('animate')
    background.classList.add('deanimate')

    setTimeout(() => {
        background.classList.remove('deanimate')
        document.body.style.overflowX = 'unset'
        document.body.style.overflowY = 'unset'
    }, 1050)
}

function confirm_dl() {
    // Confirmation popup

    document.body.style.overflowX = 'hidden'
    document.body.style.overflowY = 'hidden'

    // Animate
    background.classList.add('animate')
    popup.classList.remove('hidden')

    setTimeout(() => {
        popup.style.opacity = 1
    }, 800)

    nodes = results.querySelectorAll('div')

    SELECTED = []

    popup_dls.querySelectorAll('li').forEach(el => {
        el.remove()
    })

    for (let node of nodes) {
        if (node.dataset.selected) {
            SELECTED.push(node.dataset.url)

            li = document.createElement('li')
            li.innerHTML = node.dataset.name
            popup_dls.appendChild(li)
        }
    }

    console.log('confirming', SELECTED)

    h3.innerHTML = `About to Download ${SELECTED.length} episodes`

    if (!SELECTED.length) {
        li = document.createElement('li')
        li.innerHTML = 'You haven\'t selected anything yet.'
        popup_dls.appendChild(li)
    }
}

function select(el) {
    // Triggered when one episode is clicked

    svg = el.querySelector('svg').classList

    svg.toggle('selected')
    el.removeAttribute('data-selected')

    if (svg.contains('selected')) {
        el.setAttribute('data-selected', true)
    }
}

form.addEventListener('submit', (e) => {
    // Called on form submit

    e.preventDefault()

    url = url_entry.value
    rel = url.split('/').slice(-1)[0]

    // Send the request
    xhr = new XMLHttpRequest()
    xhr.open('GET', '/eps?rel=' + rel)
    xhr.setRequestHeader('Content-Type', 'text/html')

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            // On receive response

            try {
                response = JSON.parse(xhr.response)
            
                // Load elements to document
                for (let episode of response) {
                    
                    el = document.createElement('div')
                    el.setAttribute('data-url', episode.url)
                    el.setAttribute('data-name', episode.name)

                    el.innerHTML = `<span class='ep-idx'>Episode ${episode.index}</span><span class='ep-dur'>${episode.time} min</span>`
                    el.innerHTML += selected // Add the SVG icon

                    el.addEventListener('click', select.bind(this, el))

                    // Set the background image
                    el.style.backgroundImage = `url(${episode.image})`

                    results.appendChild(el)
                }
            
            // Error protection
            } catch (err) {alert('Invalid URL'); throw err}

            // Move the search bar
            // TODO

            // Show download and select buttons
            select_all_btn.classList.remove('hidden')
            m3u_btn.classList.remove('hidden')
            quals_select_btn.classList.remove('hidden')
            download.classList.remove('hidden')
            idownload.classList.remove('hidden')
        }
    }

    xhr.send()
})

