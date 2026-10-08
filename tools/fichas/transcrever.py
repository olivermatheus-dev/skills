# Transcrição local (faster-whisper, grátis, offline depois do 1º download do modelo) com segmentos e tempo.
# Uso: python tools/fichas/transcrever.py <audio.wav> <saida.json> [modelo=small]
# Instalar uma vez: python -m pip install faster-whisper   (o modelo "small" baixa ~460 MB na 1ª vez)
import json, sys
from faster_whisper import WhisperModel

audio, out = sys.argv[1], sys.argv[2]
modelo = sys.argv[3] if len(sys.argv) > 3 else "small"
m = WhisperModel(modelo, device="cpu", compute_type="int8")
segs, info = m.transcribe(audio, language="pt", vad_filter=True, condition_on_previous_text=False, beam_size=1)
saida = []
for s in segs:
    # descarta o que o modelo inventa sobre música/silêncio
    if s.no_speech_prob > 0.7 and s.avg_logprob < -0.8:
        continue
    t = s.text.strip()
    if t:
        saida.append({"ini": round(s.start, 2), "fim": round(s.end, 2), "texto": t})
json.dump({"idioma": info.language, "duracao": round(info.duration, 2), "modelo": modelo, "segmentos": saida}, open(out, "w", encoding="utf8"), ensure_ascii=False)
print(len(saida))
