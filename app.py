import flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

import nekosama
from nekosama.consts import root


client = nekosama.Client()

app = flask.Flask(__name__, static_folder = 'client/')
lim = Limiter(get_remote_address,
              app = app,
              storage_uri="memory://")

@app.route('/')
def home():
    # Handle home redirect
    
    return flask.send_file('client/index.html', mimetype = 'text/html')

@app.route('/eps')
# @lim.limit('30/hour')
def handle_episodes():
    # Handle fetching animes
    
    rel = flask.request.args.get('rel')
    
    # Error protection
    if rel is None: return flask.jsonify({'error': 'invalid'})
    
    # Fetch the anime
    url = root + '/anime/info/' + rel
    try: anime = client.get_anime(url)
    except Exception as err:
        return flask.jsonify({'error': str(err)})
    
    try:
        episodes = anime.episodes
    
    except ConnectionError:
        return flask.jsonify({'error': 'invalid url'})
    
    # Get the episodes
    data = [{
        'url': ep.url,
        'index': ep.index,
        'time': ep.time,
        'image': ep.image_url,
        'name': ep.name
    } for ep in episodes]
    
    return flask.jsonify(data)

@app.route('/frag')
# lim.limit('50/hour')
def handle_fetch():
    # Handle giving m3u to client

    url = flask.request.args.get('url')
    quality = flask.request.args.get('q') or 'best'

    # Error protection
    if url is None: return flask.jsonify({'error': 'invalid url'})

    # Fetch the anime
    try:
        source = nekosama.Episode(url)

    except Exception as err:
        print('error while geting m3u', err)
        return flask.jsonify({'error': str(err)})

    # Get the m3u
    m3u = source.get_fragments(quality = quality)

    fragments = [l for l in m3u.split() if l[0] != '#']

    return flask.jsonify(fragments)

@app.route('/get')
# @lim.limit('30/hour')
def handle_download():
    # Handle downloading animes
    
    url = flask.request.args.get('url')
    quality = flask.request.args.get('q') or 'best'
    
    # Error protection
    if url is None: return flask.jsonify({'error': 'invalid'})
    
    # Fetch the anime
    try: source = nekosama.Episode(url)
    except Exception as err:
        print('error in /get:', err)
        return 'error:' + str(err)
    
    def stream():
        # Stream the source output
        
        chunks = source.get_fragments(quality = quality)
        chunks = [c for c in chunks.split() if not c[0] == '#']
        
        for url in chunks:
            print(url)
            yield source.get(url).content
    
    filename = source.name + '.mp4'
    
    print('streaming source to frontend')
    
    return flask.Response(
        flask.stream_with_context(stream()),
        headers = {
            'Content-Disposition': f'attachment; filename={filename}',
            'Content-Type': 'application/octet-stream'
        }
    )

if __name__ == '__main__':
    app.run(debug = True)

# EOF
