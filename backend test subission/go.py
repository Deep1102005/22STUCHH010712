from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
import string, random, time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

url_store = {}

def generate_shortcode(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@app.route('/shorten', methods=['POST'])
def shorten_url():
    data = request.json
    url = data.get('url')
    shortcode = data.get('shortcode')
    expiry_minutes = int(data.get('expiry', 30))

    if not url or not shortcode:
        return jsonify({'error': 'URL and shortcode are required'}), 400

    if shortcode in url_store:
        return jsonify({'error': 'Shortcode already exists'}), 400

    expiry_time = datetime.utcnow() + timedelta(minutes=expiry_minutes)
    url_store[shortcode] = {
        'original_url': url,
        'expiry': expiry_time
    }

    short_url = request.host_url + shortcode
    return jsonify({
        'short_url': short_url,
        'expiry': expiry_time.isoformat()
    })

@app.route('/<shortcode>')
def redirect_to_original(shortcode):
    data = url_store.get(shortcode)
    if not data:
        return jsonify({'error': 'Shortcode not found'}), 404

    if datetime.utcnow() > data['expiry']:
        return jsonify({'error': 'Shortcode expired'}), 410

    return redirect(data['original_url'])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
