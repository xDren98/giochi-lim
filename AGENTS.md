# 🌟 Portale Giochi LIM - Guida per Antigravity

Questa cartella è configurata per essere modificata sia da Windows che da Mac con **Antigravity**.
Le regole complete per l'agente si trovano in `.gemini/rules/giochi-lim.md` e vengono caricate automaticamente.

## Flusso rapido per pubblicare un nuovo gioco (dal Mac o da Windows)
1. Apri questa cartella (`giochi-lim`) con Antigravity.
2. Chiedi ad Antigravity: *"Aggiungi questo gioco alla Classe X e pubblica su GitHub"*.
3. Antigravity inserirà il file in `games/`, integrerà l'audio inglese (`educational-speech.js?v=3.0`) e il tasto `🏠 Menu Giochi`, aggiornerà `index.html`, farà `git pull --rebase` e poi `git push`.
4. **Netlify** rileverà il push su GitHub e aggiornerà automaticamente `https://giochi-lim-inglese.netlify.app`.
