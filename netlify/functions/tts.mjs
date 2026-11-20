export default async (req, context) => {
    const url = new URL(req.url);
    const q = url.searchParams.get("q");
    if (!q) {
        return new Response("Missing query parameter 'q'", { status: 400 });
    }

    const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q=${encodeURIComponent(q)}`;
    
    try {
        const upstream = await fetch(googleUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        });

        if (!upstream.ok) {
            return new Response(`TTS upstream error: ${upstream.status}`, { status: upstream.status });
        }

        const audioBuffer = await upstream.arrayBuffer();

        return new Response(audioBuffer, {
            headers: {
                "Content-Type": "audio/mpeg",
                "Cache-Control": "public, max-age=604800, immutable",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (err) {
        return new Response(`Internal error: ${err.message}`, { status: 500 });
    }
};

export const config = {
    path: "/api/tts"
};
