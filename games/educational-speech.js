/**
 * ============================================================================
 * Educational Speech Engine for Primary School (LIM & Touchscreens) - v2.0
 * ============================================================================
 * Garantisce una pronuncia in inglese nativa, corretta e naturale per i bambini.
 * 
 * RISOLUZIONE CRITICA ACCRONIMI / ALL-CAPS:
 * I motori TTS (Google TTS, Web Speech API, SAPI) interpretano parole scritte
 * interamente in MAIUSCOLO (es. "ARMS", "HEAD", "LEGS", "DOG", "MONDAY") come
 * acronimi/sigle e le scandiscono lettera per lettera ("A - R - M - S").
 * Questo modulo normalizza automaticamente i vocaboli in minuscolo/lettere
 * naturali prima della sintesi vocale, garantendo la pronuncia dell'intera
 * parola fonetica ([ɑːmz] "arms", [hɛd] "head", ecc.).
 * ============================================================================
 */

(function(window) {
    let currentAudio = null;
    let cachedEnVoice = null;
    let isSpeechEnabled = true;

    // Normalizzatore didattico del testo inglese
    function normalizeForSpeech(text) {
        if (!text) return '';
        let s = String(text);

        // 1. Rimuovi tag HTML
        s = s.replace(/<[^>]*>/g, ' ');

        // 2. Rimuovi spiegazioni tra parentesi (es. "(Braccia)", "(leggi attentamente)")
        s = s.replace(/\([^)]*\)/g, ' ');

        // 3. Rimuovi emoji e caratteri speciali
        s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, ' ');

        // 4. Sigle reali da preservare come tali
        const realAcronyms = new Set(['PE', 'P.E.', 'ICT', 'I.C.T.', 'TV', 'T.V.', 'OK', 'UK', 'U.K.', 'USA', 'U.S.A.', 'DNA', 'RNA']);

        // 5. TRASFORMAZIONE CHIAVE: se una parola è scritta in TUTTO MAIUSCOLO (es. ARMS, HEAD, LEGS),
        // deve essere convertita in minuscolo, altrimenti il TTS la scandisce come A-R-M-S!
        s = s.replace(/\b[A-Za-z]+\b/g, (word) => {
            const upper = word.toUpperCase();
            if (realAcronyms.has(upper) || realAcronyms.has(word)) {
                return upper === 'PE' ? 'P.E.' : (upper === 'ICT' ? 'I.C.T.' : upper);
            }
            if (word.length >= 2 && word === word.toUpperCase()) {
                return word.toLowerCase();
            }
            return word;
        });

        // 6. Pulizia spazi e punteggiatura ridondante
        s = s.replace(/\s+/g, ' ').trim();
        return s;
    }

    // Caricamento voci inglesi per il fallback locale offline
    function loadVoices() {
        if (!('speechSynthesis' in window)) return;
        try {
            const voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) return;

            // Priorità assoluta a voci native inglesi
            cachedEnVoice = voices.find(v => v.lang.toLowerCase().startsWith('en-gb') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')))
                         || voices.find(v => v.lang.toLowerCase() === 'en-gb' || v.lang.toLowerCase().startsWith('en-gb'))
                         || voices.find(v => v.lang.toLowerCase().startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')))
                         || voices.find(v => v.lang.toLowerCase().startsWith('en') && !v.name.toLowerCase().includes('italian'))
                         || voices.find(v => v.lang.toLowerCase().startsWith('en'));
        } catch (e) {
            console.warn('Error loading speech voices:', e);
        }
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }

    // Fallback Web Speech API
    function fallbackWebSpeech(cleanText, onEnd) {
        if (!('speechSynthesis' in window)) {
            if (onEnd) onEnd();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'en-GB';
            utterance.rate = 0.88;
            utterance.pitch = 1.0;

            if (!cachedEnVoice) loadVoices();
            if (cachedEnVoice) {
                utterance.voice = cachedEnVoice;
            }

            if (onEnd) {
                utterance.onend = onEnd;
                utterance.onerror = onEnd;
            }

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn('Web Speech API fallback error:', err);
            if (onEnd) onEnd();
        }
    }

    /**
     * Funzione principale di pronuncia vocale per la scuola primaria
     */
    function speakEnglish(text, onEnd) {
        if (typeof window.soundEnabled !== 'undefined' && !window.soundEnabled) {
            if (onEnd) onEnd();
            return;
        }
        if (!isSpeechEnabled || !text) {
            if (onEnd) onEnd();
            return;
        }

        // Interrompi audio precedente
        stopSpeech();

        // Normalizza: trasforma "ARMS" in "arms", toglie parentesi ed emoji
        const clean = normalizeForSpeech(text);
        if (!clean) {
            if (onEnd) onEnd();
            return;
        }

        // 1. Motore Primario: Audio nativo madrelingua British English (Google TTS)
        try {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=${encodeURIComponent(clean)}`;
            const audio = new Audio(ttsUrl);
            currentAudio = audio;

            let finished = false;
            const handleFinish = () => {
                if (!finished) {
                    finished = true;
                    if (currentAudio === audio) currentAudio = null;
                    if (onEnd) onEnd();
                }
            };

            audio.onended = handleFinish;

            audio.onerror = () => {
                fallbackWebSpeech(clean, handleFinish);
            };

            audio.play().catch(() => {
                fallbackWebSpeech(clean, handleFinish);
            });
        } catch (e) {
            fallbackWebSpeech(clean, onEnd);
        }
    }

    function stopSpeech() {
        if (currentAudio) {
            try {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            } catch (e) {}
            currentAudio = null;
        }
        if ('speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {}
        }
    }

    function setSpeechEnabled(enabled) {
        isSpeechEnabled = enabled;
        if (!enabled) stopSpeech();
    }

    // Esponi globalmente
    window.speakEnglish = speakEnglish;
    window.stopSpeech = stopSpeech;
    window.setSpeechEnabled = setSpeechEnabled;
    window.normalizeForSpeech = normalizeForSpeech;

})(window);
