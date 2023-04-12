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
back_btn = document.querySelector('.search a')

filters = document.querySelectorAll('.filters')

anime_template = `
<div class='ep-info'>
    <span class='ep-idx'>Episode {index}</span>
    <span class='ep-dur'>{time} min</span>
    
    <svg width="40" height="40">
        <circle cx="20" cy="20" r="19" fill="#000" opacity="0.5"/>
        <line x1="10" y1="20" x2="30" y2="20" stroke="#fff" stroke-width="2"/>
        <line x1="20" y1="10" x2="20" y2="30" stroke="#fff" stroke-width="2"/>
    </svg>
</div>
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

    all = results.querySelectorAll('.ep-info')
    all.forEach(el => {select(el)})
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
    }, 800)
}

function on_hover_ep(el) {
    info = el.querySelector('.ep-info')
    info.classList.add('hovered')
}

function off_hover_ep(el) {
    info = el.querySelector('.ep-info')
    info.classList.remove('hovered')
}

function get_selection(bkp) {

    SELECTED = []

    nodes = results.querySelectorAll('div')

    for (let node of nodes) {
        if (node.dataset.selected) {
            SELECTED.push(node.dataset.url)
            bkp(node)
        }
    }

    return SELECTED
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
    }, 200)
    
    popup_dls.querySelectorAll('li').forEach(el => {
        el.remove()
    })
    
    getSelection(() => {
        li = document.createElement('li')
        li.innerHTML = node.dataset.name
        popup_dls.appendChild(li)
    })

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

    // Show or hide the download button
    if (get_selection(() => {}).length) {
        download.classList.remove('hidden')
        idownload.classList.remove('hidden')
    } else {
        download.classList.add('hidden')
        idownload.classList.add('hidden')
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

                // Void previous episodes
                results.querySelectorAll('div').forEach((e) => {e.remove()})
            
                // Load elements to document
                for (let episode of response) {
                    
                    el = document.createElement('div')
                    el.setAttribute('data-url', episode.url)
                    el.setAttribute('data-name', episode.name)

                    // Create using the anime template
                    el.innerHTML = anime_template
                                   .replace('{index}', episode.index)
                                   .replace('{time}', episode.time)

                    // Element bindings
                    el.addEventListener('click', select.bind(this, el))
                    el.addEventListener('mouseover', on_hover_ep.bind(this, el))
                    el.addEventListener('mouseleave', off_hover_ep.bind(this, el))

                    // Set the background image
                    el.style.backgroundImage = `url(${episode.image})`

                    results.appendChild(el)
                }
            
            // Error protection
            } catch (err) {alert('Invalid URL'); throw err}

            // Show all hidden elements
            hi = [
                back_btn
            ]

            hi.forEach((el) => {el.classList.remove('hidden')})

            // Show filters
            filters.forEach((e) => {e.classList.remove('hidden')})

            // Change bacground image position
            document.querySelector('.band').classList.add('upper')
        }
    }

    xhr.send()
})