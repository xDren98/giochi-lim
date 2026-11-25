---
trigger: always_on
---

# Regole Progetto: Portale Giochi LIM (Scuola Gesù Eucaristico)

Questo repository contiene il portale didattico per la LIM (`https://giochi-lim-inglese.netlify.app`), collegato con auto-deploy su Netlify tramite GitHub.

## 1. Quando aggiungi o modifichi un gioco HTML
Ogni gioco deve trovarsi in `games/` (es. `games/gioco_LIM_<nome>.html`) e rispettare **sempre** questi requisiti:

1. **Meta tag obbligatori** dentro `<head>`:
   - `<meta name="referrer" content="no-referrer">` (necessario per non bloccare l'audio TTS).
   - `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` (ottimizzazione schermi touch LIM).
2. **Motore Vocale Madrelingua Inglese**:
   - Includere `<script src="educational-speech.js?v=3.0"></script>`.
   - Usare **sempre** `speakEnglish(testo)` per leggere parole o frasi in inglese.
   - **NON usare mai** `window.speechSynthesis` direttamente nei singoli giochi (su Windows/Mac senza voce inglese installata leggerebbe l'inglese con voce italiana). `educational-speech.js` usa l'endpoint `/api/tts` (British English) e blocca le voci italiane.
3. **Pulsante di ritorno al Menu**:
   - Inserire un pulsante ben visibile (in alto a sinistra o nell'header) con link `<a href="../index.html">🏠 Menu Giochi</a>`.
4. **Usabilità LIM & Touch**:
   - Pulsanti grandi e touch-friendly, `user-select: none`, `touch-action: manipulation`.
   - Evitare elementi `absolute -bottom-*` dentro contenitori `overflow-hidden` (usare `fixed bottom-6` per i pulsanti "Next Turn" se necessario).
   - Proteggere i click rapidi con un flag di blocco durante animazioni/timeout.

## 2. Aggiornamento dell'Hub (`index.html`)
Dopo aver aggiunto un gioco in `games/`:
1. Aggiungi l'oggetto corrispondente nell'array `GIOCHI` dentro `index.html` (`id`, `classe` `"1"`-`"5"`, `classeLabel`, `classeColor`, `title`, `subtitle`, `desc`, `emoji`, `color`, `bgGradient`, `tag`, `btnText`, `file: "games/..."`).
2. Aggiorna il contatore `#totalGamesBadge` in `index.html` (es. `🎮 11 Giochi Pronti`).

## 3. Verifica e Pubblicazione (GitHub -> Netlify)
1. Verifica che non ci siano errori di sintassi JS nei tag `<script>`.
2. Prima di fare commit/push, sincronizza sempre eventuali modifiche dell'altro computer:
   ```bash
   git pull --rebase origin master
   ```
3. Poi esegui commit e push:
   ```bash
   git add -A
   git commit -m "Descrizione chiara della modifica"
   git push origin master
   ```
Netlify pubblicherà automaticamente il sito aggiornato entro ~30 secondi dal push.
