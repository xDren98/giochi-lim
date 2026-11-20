/**
 * ============================================================================
 * Educational Speech Engine for Primary School (LIM & Touchscreens) - v3.0
 * ============================================================================
 * 1. Audio Nativo Diretto da Endpoint Netlify (/api/tts):
 *    Audio HD reale in British English (Oxford/Cambridge) senza blocchi CORS o Referer.
 * 
 * 2. Normalizzazione Anti-Acronimi:
 *    Trasforma parole in TUTTO MAIUSCOLO (ARMS -> arms, TOUCH -> touch, FEET -> feet)
 *    in minuscolo, evitando che vengano scandite lettera per lettera.
 * 
 * 3. Protezione Assoluta contro Voci Italiane:
 *    Se e solo se l'audio MP3 non è disponibile, la Web Speech API è rigorosamente
 *    vincolata a voci native inglesi. Se nel sistema sono presenti solo voci
 *    italiane, il sistema BLOCCA la voce italiana per non insegnare una pronuncia
 *    sbagliata ai bambini!
 * ============================================================================
 */

(function(window) {
    let currentAudio = null;
    let cachedEnVoice = null;
    let isSpeechEnabled = true;

    // Normalizzatore didattico
    function normalizeForSpeech(text) {
        if (!text) return '';
        let s = String(text);

        // 1. Rimuovi tag HTML
        s = s.replace(/<[^>]*>/g, ' ');

        // 2. Rimuovi traduzioni o istruzioni in italiano tra parentesi (es. "(Braccia)", "(i piedi)")
        s = s.replace(/\([^)]*\)/g, ' ');

        // 3. Rimuovi emoji e simboli speciali
        s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, ' ');

        // 4. Sigle scolastiche reali
        const realAcronyms = new Set(['PE', 'P.E.', 'ICT', 'I.C.T.', 'TV', 'T.V.', 'OK', 'UK', 'U.K.', 'USA', 'U.S.A.', 'DNA', 'RNA']);

        // 5. Trasforma ALL-CAPS in minuscolo per evitare pronuncia lettera per lettera
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

        // 6. Pulizia spazi
        s = s.replace(/\s+/g, ' ').trim();
        return s;
    }

    // Ricerca rigorosa di voci esclusivamente INGLESI
    function getEnglishVoice() {
        if (!('speechSynthesis' in window)) return null;
        try {
            const voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) return null;

            // 1. Voci Natural/Online British (Sonia, Ryan, Google UK English)
            const natGb = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en-gb') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')));
            if (natGb) return natGb;

            // 2. Voci British generiche (en-GB)
            const gb = voices.find(v => v.lang && (v.lang.toLowerCase() === 'en-gb' || v.lang.toLowerCase().startsWith('en-gb')));
            if (gb) return gb;

            // 3. Voci Natural/Online English generiche (Jenny, Guy, Samantha)
            const natEn = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')));
            if (natEn) return natEn;

            // 4. Voci desktop inglesi note (Zira, David, George, Hazel)
            const desktopEn = voices.find(v => (v.name.includes('Zira') || v.name.includes('David') || v.name.includes('George') || v.name.includes('Hazel')) && !v.name.toLowerCase().includes('italian'));
            if (desktopEn) return desktopEn;

            // 5. Qualsiasi voce che sia 'en' e NON contenga 'italian', 'elsa', 'cosimo'
            const anyEn = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en') && !v.name.toLowerCase().includes('italian') && !v.name.toLowerCase().includes('elsa') && !v.name.toLowerCase().includes('cosimo'));
            if (anyEn) return anyEn;

            return null; // NESSUNA VOCE INGLESE TROVATA!
        } catch (e) {
            return null;
        }
    }

    function initVoices() {
        cachedEnVoice = getEnglishVoice();
    }

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = initVoices;
        initVoices();
    }

    // Fallback locale Web Speech: BLOCCA CATEGORICAMENTE le voci italiane
    function fallbackWebSpeech(cleanText, onEnd) {
        if (!('speechSynthesis' in window)) {
            if (onEnd) onEnd();
            return;
        }

        const enVoice = cachedEnVoice || getEnglishVoice();
        
        // SE NON C'È UNA VOCE INGLESE: NON PARLARE!
        // Evita categoricamente che Microsoft Elsa o voci italiane leggano parole inglesi!
        if (!enVoice) {
            console.warn('[EducationalSpeech] Nessuna voce nativa inglese disponibile. Voce italiana bloccata per sicurezza didattica.');
            if (onEnd) onEnd();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.voice = enVoice;
            utterance.lang = enVoice.lang || 'en-GB';
            utterance.rate = 0.88;
            utterance.pitch = 1.0;

            if (onEnd) {
                utterance.onend = onEnd;
                utterance.onerror = onEnd;
            }

            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn('[EducationalSpeech] Errore Web Speech fallback:', err);
            if (onEnd) onEnd();
        }
    }

    /**
     * Funzione principale di pronuncia
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

        // Normalizza: "TOUCH THE FEET" -> "touch the feet"
        const clean = normalizeForSpeech(text);
        if (!clean) {
            if (onEnd) onEnd();
            return;
        }

        let finished = false;
        const handleFinish = () => {
            if (!finished) {
                finished = true;
                currentAudio = null;
                if (onEnd) onEnd();
            }
        };

        // 1. Prova l'endpoint dedicato Netlify (/api/tts)
        // Questo endpoint è sullo stesso dominio del sito, senza blocchi CORS o Referer!
        const primaryUrl = `/api/tts?q=${encodeURIComponent(clean)}`;
        const audio = new Audio();
        currentAudio = audio;

        audio.onended = handleFinish;

        // Se l'endpoint locale o la rete dovesse fallire, tenta Google TTS diretto con no-referrer
        audio.onerror = () => {
            tryDirectGoogleTTS(clean, handleFinish);
        };

        audio.src = primaryUrl;
        audio.play().catch(() => {
            tryDirectGoogleTTS(clean, handleFinish);
        });
    }

    function tryDirectGoogleTTS(clean, onEnd) {
        try {
            const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=${encodeURIComponent(clean)}`;
            const audio2 = new Audio();
            currentAudio = audio2;

            audio2.onended = onEnd;
            audio2.onerror = () => fallbackWebSpeech(clean, onEnd);
            audio2.src = fallbackUrl;
            audio2.play().catch(() => fallbackWebSpeech(clean, onEnd));
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
