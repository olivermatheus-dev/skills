# Transcrição local com tempo por palavra (faster-whisper, grátis, offline depois do 1º download do modelo).
# Uso: python tools/video-kit/scripts/asr.py <audio> <saida.json> [modelo=medium]   → [{"w","s","e"}]
# Instalar uma vez: python -m pip install faster-whisper
import json, sys
from faster_whisper import WhisperModel
audio, out = sys.argv[1], sys.argv[2]
model = sys.argv[3] if len(sys.argv) > 3 else "medium"
m = WhisperModel(model, device="cpu", compute_type="int8")
segs, _ = m.transcribe(audio, language="pt", word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
words = [{"w": w.word.strip(), "s": round(w.start, 3), "e": round(w.end, 3)} for s in segs for w in s.words]
json.dump(words, open(out, "w", encoding="utf8"), ensure_ascii=False)
print(len(words))
