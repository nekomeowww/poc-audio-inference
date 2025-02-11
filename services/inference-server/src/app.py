from flask import Flask, request, Response, stream_with_context
import logging
from flask_cors import CORS
import io
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

mock_model_loaded = False

@app.route('/api/v1/voice-change/model', methods=['POST'])
def preload_voice_change_model():
  global mock_model_loaded

  if mock_model_loaded != False:
    return {'message': 'Ok'}, 200
  else:
    # TODO: mocking purpose, sleep 10s to simulate model load into vRAM
    time.sleep(10)
    mock_model_loaded = True
    return {'message': 'Ok'}, 200

@app.route('/api/v1/voice-change', methods=['POST'])
def process_voice_change():
    try:
        # Get audio file from request
        if 'audio' not in request.files:
            logger.error("No audio file in request")
            return {'error': 'No audio file provided'}, 400

        audio_file = request.files['audio']
        audio_data = audio_file.read()

        # TODO: mocking purpose, returning the same audio data
        def generate():
            chunk_size = 4096
            audio_io = io.BytesIO(audio_data)

            while True:
                chunk = audio_io.read(chunk_size)
                if not chunk:
                    break
                yield chunk

        return Response(
            stream_with_context(generate()),
            mimetype='audio/wav'
        )

    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        return {'error': str(e)}, 500

@app.route('/health', methods=['GET'])
def health_check():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    logger.info("Starting inference server on port 8082")
    app.run(host='0.0.0.0', port=8082, debug=True)
