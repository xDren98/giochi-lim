/**
 * ============================================================================
 * Educational Speech Engine for Primary School (LIM & Touchscreens)
 * ============================================================================
 * Garantisce una pronuncia in inglese nativa, chiara e corretta per i bambini.
 * 
 * 1. Motore Primario: Audio nativo in alta definizione (British English / Cambridge-Oxford accent)
 *    tramite Google TTS con corretta intonazione e fonetica autentica.
 * 2. Motore Fallback Offline: Web Speech API rigorosamente vincolato alle voci native
 *    inglesi (en-GB / en-US), con esclusione totale di voci sintetiche italiane.
 * ============================================================================
 */

(function(window) {
    let currentAudio = null;
    let cachedEnVoice = null;
    let isSpeechEnabled = true;

    // Cache e caricamento delle voci di sistema inglese per il fallback
    function loadVoices() {
        if (!('speechSynthesis' in window)) return;
        try {
            const voices = window.speechSynthesis.getVoices();
            if (!voices || voices.length === 0) return;

            // Priorità:
            // 1. Voci Natural/Online British (Sonia, Ryan, George, Hazel, Google UK English)
            // 2. Voci British generiche (en-GB)
            // 3. Voci Natural/Online English generiche (Google US English, Jenny, Guy, Samantha)
            // 4. Qualsiasi voce che sia rigorosamente 'en'
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

    /**
     * Fallback con Web Speech API
     */
    function fallbackWebSpeech(text, onEnd) {
        if (!('speechSynthesis' in window)) {
            if (onEnd) onEnd();
            return;
        }

        try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB';
            utterance.rate = 0.88; // Velocità didattica, calma e comprensibile
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
     * Funzione principale di pronuncia
     * @param {string} text - Testo in inglese da pronunciare
     * @param {function} onEnd - Callback opzionale al termine della riproduzione
     */
    function speakEnglish(text, onEnd) {
        // Se nel contesto del gioco il suono è disattivato (es. soundEnabled === false)
        if (typeof window.soundEnabled !== 'undefined' && !window.soundEnabled) {
            if (onEnd) onEnd();
            return;
        }
        if (!isSpeechEnabled || !text || !text.trim()) {
            if (onEnd) onEnd();
            return;
        }

        // Interrompi audio precedente
        stopSpeech();

        // Pulisci il testo da tag HTML o caratteri superflui
        const cleanText = text.replace(/<[^>]*>/g, '').trim();

        // 1. Prova con audio MP3 nativo Google TTS (British English)
        try {
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=${encodeURIComponent(cleanText)}`;
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
                // Se non c'è connessione o fallisce, passa al fallback locale
                fallbackWebSpeech(cleanText, handleFinish);
            };

            audio.play().catch(() => {
                // Policy di autoplay o errore riproduzione
                fallbackWebSpeech(cleanText, handleFinish);
            });
        } catch (e) {
            fallbackWebSpeech(cleanText, onEnd);
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

})(window);
