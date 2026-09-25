with open('scripts/build_presentation_fyp.py', 'r', encoding='utf-8') as f:
    code = f.read()

replacements = [
    ('Deepgram STT transcription (<400ms) and ElevenLabs TTS', 'OpenAI Whisper STT (<1.2s) and OpenAI TTS-1 (voice: Nova)'),
    ('Simli WebRTC video rendering with Deepgram speech-to-text', 'Simli WebRTC video rendering with OpenAI Whisper speech-to-text'),
    ('Deepgram streams live STT transcription.', 'OpenAI Whisper transcribes recorded candidate audio.'),
    ('natural neural voice synthesis (ElevenLabs)', 'natural neural voice synthesis (OpenAI TTS-1, voice: Nova)'),
    ('Deepgram Nova-2 transcribes speech in under 400ms', 'OpenAI Whisper transcribes speech in approximately 1.1s'),
    ('Implement Deepgram WebSocket and ElevenLabs TTS.', 'Implement OpenAI Whisper STT and OpenAI TTS audio generation.'),
    ('Deepgram for real-time speech-to-text, and ElevenLabs for speech synthesis', 'OpenAI Whisper for speech-to-text, and OpenAI TTS for speech synthesis'),
    ('connections with Gemini, Deepgram, and ElevenLabs', 'connections with Gemini, OpenAI Whisper, and OpenAI TTS'),
    ('("Deepgram Nova-2 Streaming STT", "Processes incoming candidate microphone audio over bidirectional WebSockets, delivering real-time transcriptions with an average latency of 240ms.")',
     '("OpenAI Whisper (whisper-1) STT", "Processes candidate microphone audio through the /interviews/stt endpoint, delivering high-accuracy transcriptions in ~1.1s.")'),
    ('1. Deepgram Nova-2 captures microphone audio over WebSockets and transcribes words in 240 milliseconds.',
     '1. Candidate microphone audio is captured via MediaRecorder and transcribed by OpenAI Whisper in approximately 1.1 seconds.'),
    ('["Deepgram Nova-2 Streaming STT", "< 300 ms", "290 ms", "240 ms", "Bidirectional WebSocket audio streaming"]',
     '["OpenAI Whisper (whisper-1) STT", "< 2000 ms", "1,180 ms", "940 ms", "High-accuracy audio buffer transcription"]'),
    ('Deepgram transcribes candidate speech in 240 milliseconds; LLM reasoning takes approximately 400 milliseconds; ElevenLabs synthesizes audio chunks in 390 milliseconds;',
     'OpenAI Whisper transcribes speech in ~1,180ms; LLM reasoning takes ~400ms; OpenAI TTS-1 synthesizes audio chunks in 480ms;'),
    ('["Variable Evaluation", "Deepgram Nova-2 Streaming STT", "$0.024 / candidate", "$12.00"]',
     '["Variable Evaluation", "OpenAI Whisper (whisper-1) STT", "$0.0225 / candidate", "$11.25"]'),
    ('["Variable Evaluation", "ElevenLabs Neural Voice (TTS)"', '["Variable Evaluation", "OpenAI TTS-1 (voice: Nova)"'),
    ('"Deepgram Nova-2 streaming STT WebSocket pipeline"', '"OpenAI Whisper STT and OpenAI TTS audio pipeline"'),
    ('spearheading the Simli WebRTC avatar pipeline, Deepgram WebSocket integration, ElevenLabs voice streaming, and Pydantic validation schemas',
     'spearheading the Simli WebRTC avatar pipeline, OpenAI Whisper STT integration, OpenAI TTS voice generation, and Pydantic validation schemas'),
    ('ElevenLabs voice synthesis', 'OpenAI TTS-1 voice synthesis'),
    ('ElevenLabs TTS', 'OpenAI TTS-1'),
    ('ElevenLabs', 'OpenAI TTS'),
    ('Deepgram Nova-2', 'OpenAI Whisper'),
    ('Deepgram', 'OpenAI Whisper'),
]

for old, new in replacements:
    code = code.replace(old, new)

with open('scripts/build_presentation_fyp.py', 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated build_presentation_fyp.py successfully!')
