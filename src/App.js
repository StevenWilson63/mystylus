import { useState } from "react";

const BACKEND_URL = "https://spiffy-paletas-26dcf1.netlify.app/.netlify/functions/commentary";

const PERSONAS = {
  curator: {
    label: "🎓 The Curator",
    desc: "Calm, intelligent, documentary style",
    prompt: "You are The Curator — a calm, intelligent music commentator in the style of a late-night BBC Radio 4 documentary narrator. Warm but measured. No hype. No exclamation marks. Speak thoughtfully about the story behind the song."
  },
  friend: {
    label: "😎 The Cool Friend",
    desc: "Relaxed, conversational, dry humour",
    prompt: "You are The Cool Friend — relaxed, conversational, warm. Like a mate who knows everything about music but never lectures. Casual tone, occasional dry humour. Feels like a chat not a performance."
  },
  rockjock: {
    label: "🎸 The Rock Jock",
    desc: "Energetic, punchy, loves the drama",
    prompt: "You are The Rock Jock — energetic, punchy, passionate. Short punchy sentences. You love the drama and the legendary stories. You get genuinely excited about great music."
  },
  latenight: {
    label: "🌙 Late Night Spinner",
    desc: "Smooth, atmospheric, almost poetic",
    prompt: "You are The Late Night Spinner — smooth, unhurried, almost poetic. Pure late-night radio energy. Atmospheric. You speak like the city outside is quiet and the listener has a drink in hand."
  }
};

const GENRES = [
  "Rock", "Metal", "Hip-Hop", "Jazz",
  "Classical", "Pop", "Soul/R&B", "Country",
  "Electronic", "Reggae", "Punk"
];

const FOCUSES = [
  "the inspiration or story behind why this song was written",
  "an interesting fact about the recording process or studio sessions",
  "the artist's biography and what was happening in their life or career at this time",
  "the cultural impact, chart history, or legacy of this song"
];

const EXAMPLE_TRACKS = [
  { artist: "UFO", track: "Doctor Doctor" },
  { artist: "Led Zeppelin", track: "Whole Lotta Love" },
  { artist: "Deep Purple", track: "Smoke on the Water" },
  { artist: "Black Sabbath", track: "Paranoid" },
  { artist: "The Eagles", track: "Hotel California" }
];

const C = {
  bg: "#000000",
  card: "#111111",
  border: "#222222",
  violet: "#6c3fc5",
  lavender: "#b47fff",
  gold: "#e8b84b",
  white: "#ffffff",
  grey: "#888888",
  dimgrey: "#444444",
  error: "#ff6666"
};

export default function MyStylus() {
  const [keyInput, setKeyInput] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [activated, setActivated] = useState(false);
  const [persona, setPersona] = useState("rockjock");
  const [genre, setGenre] = useState("Rock");
  const [playlist, setPlaylist] = useState([]);
  const [artistIn, setArtistIn] = useState("");
  const [trackIn, setTrackIn] = useState("");
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [djOn, setDjOn] = useState(true);
  const [commentary, setCommentary] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("info");

  const showStatus = (msg, type = "info") => {
    setStatusMsg(msg);
    setStatusType(type);
    if (type !== "error") setTimeout(() => setStatusMsg(""), 5000);
  };

  const activate = () => {
    const k = keyInput.trim();
    if (!k.startsWith("sk-ant-")) {
      showStatus("Key should start with sk-ant- — please check and try again.", "error");
      return;
    }
    setApiKey(k);
    setActivated(true);
    showStatus("Activated! Build your playlist and press Start.", "success");
  };

  const addTrack = () => {
    if (!artistIn.trim() || !trackIn.trim()) {
      showStatus("Please enter both artist and song title.", "error");
      return;
    }
    setPlaylist(p => [...p, { artist: artistIn.trim(), track: trackIn.trim() }]);
    setArtistIn("");
    setTrackIn("");
    setStatusMsg("");
  };

  const removeTrack = i => setPlaylist(p => p.filter((_, idx) => idx !== i));

  const loadExamples = () => {
    setPlaylist(EXAMPLE_TRACKS);
    showStatus("5 classic rock tracks loaded — press Start!", "success");
  };

  const generate = async (artist, track, p, g) => {
    setLoading(true);
    setCommentary("");

    const focus = FOCUSES[Math.floor(Math.random() * FOCUSES.length)];
    const lengths = [
      "2-3 sentences — short and punchy.",
      "3-4 sentences — a solid paragraph.",
      "4-5 sentences with a bit more depth."
    ];
    const length = lengths[Math.floor(Math.random() * lengths.length)];

    const prompt = `${PERSONAS[p].prompt}

Give commentary about "${track}" by ${artist}. Genre: ${g}.

Focus on: ${focus}
Length: ${length}

Rules:
- Only state facts you are confident about. Use "reportedly" if unsure.
- Do not start with the song title or artist name as the very first words.
- Sound like you are talking to one person.
- Do not mention being an AI.
- Give only the commentary — no labels, no preamble.`;

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt, apiKey })
      });

      const rawText = await response.text();
      let json;
      try { json = JSON.parse(rawText); }
      catch (e) { throw new Error("Could not parse response from server."); }

      if (json?.error) {
        throw new Error(json.error.message || json.error);
      }

      const text = json?.content?.[0]?.text;
      if (!text) throw new Error("No commentary returned — please try again.");
      setCommentary(text);

    } catch (err) {
      showStatus(`${err.message}`, "error");
    }

    setLoading(false);
  };

  const startSession = () => {
    if (!playlist.length) { showStatus("Add at least one track first.", "error"); return; }
    setStarted(true);
    setCurrentIdx(0);
    if (djOn) generate(playlist[0].artist, playlist[0].track, persona, genre);
  };

  const nextTrack = () => {
    if (!playlist.length) return;
    const idx = (currentIdx + 1) % playlist.length;
    setCurrentIdx(idx);
    setCommentary("");
    if (djOn) generate(playlist[idx].artist, playlist[idx].track, persona, genre);
  };

  const currentTrack = playlist[currentIdx];

  const input = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "12px 14px",
    color: C.white,
    fontSize: 14,
    fontFamily: "system-ui, sans-serif",
    outline: "none",
    width: "100%"
  };

  const cardStyle = {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14
  };

  const sectionLabel = {
    fontSize: 10,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: C.dimgrey,
    marginBottom: 14,
    fontWeight: 500
  };

  return (
    <div style={{ background: C.bg, color: C.white, fontFamily: "system-ui, sans-serif", minHeight: "100vh", padding: "24px 16px 60px", maxWidth: 600, margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "Space Grotesk, system-ui, sans-serif", fontWeight: 300, fontSize: 32, letterSpacing: "-0.02em", lineHeight: 1 }}>
              <span style={{ color: C.lavender }}>my</span>
              <span style={{ color: C.white }}>stylus</span>
              <span style={{ color: C.gold }}>.</span>
            </div>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.dimgrey, marginTop: 4 }}>
              It's all about the music
            </div>
          </div>
          {started && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.dimgrey }}>
              <span>{djOn ? "DJ On" : "DJ Off"}</span>
              <div onClick={() => setDjOn(d => !d)} style={{ width: 38, height: 22, background: djOn ? C.violet : C.border, borderRadius: 11, position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 4, left: djOn ? 20 : 4, width: 14, height: 14, borderRadius: "50%", background: C.white, transition: "left 0.2s" }}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STATUS */}
      {statusMsg && (
        <div style={{ padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 13, lineHeight: 1.5, background: statusType === "error" ? "#1a0000" : "#1a1500", color: statusType === "error" ? C.error : C.gold, border: `1px solid ${statusType === "error" ? "#330000" : "#332200"}` }}>
          {statusMsg}
        </div>
      )}

      {/* API KEY */}
      {!activated && (
        <div style={{ background: C.card, border: `2px solid ${C.gold}`, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.gold, marginBottom: 8 }}>🔑 Enter your Claude API Key</div>
          <div style={{ fontSize: 12, color: C.grey, marginBottom: 16, lineHeight: 1.6 }}>
            Your key is sent securely to your own mystylus backend server — never stored anywhere.
          </div>
          <input type="password" placeholder="sk-ant-..." value={keyInput} onChange={e => setKeyInput(e.target.value)} onKeyDown={e => e.key === "Enter" && activate()} style={{ ...input, marginBottom: 12 }}/>
          <button onClick={activate} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" }}>
            Activate mystylus.
          </button>
        </div>
      )}

      {/* PERSONA */}
      <div style={cardStyle}>
        <div style={sectionLabel}>Your DJ Style</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {Object.entries(PERSONAS).map(([key, p]) => (
            <div key={key} onClick={() => setPersona(key)} style={{ background: persona === key ? "#1a1400" : C.bg, border: `2px solid ${persona === key ? C.gold : C.border}`, borderRadius: 12, padding: "12px 10px", cursor: "pointer" }}>
              <div style={{ fontSize: 20, marginBottom: 5 }}>{p.label.split(" ")[0]}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: persona === key ? C.gold : C.white, marginBottom: 2 }}>
                {p.label.split(" ").slice(1).join(" ")}
              </div>
              <div style={{ fontSize: 10, color: C.dimgrey, lineHeight: 1.4 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* GENRE */}
      <div style={cardStyle}>
        <div style={sectionLabel}>Genre</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {GENRES.map(g => (
            <div key={g} onClick={() => setGenre(g)} style={{ background: genre === g ? "#1a1400" : C.bg, border: `1px solid ${genre === g ? C.gold : C.border}`, borderRadius: 20, padding: "7px 14px", fontSize: 12, color: genre === g ? C.gold : C.grey, cursor: "pointer" }}>
              {g}
            </div>
          ))}
        </div>
      </div>

      {/* PLAYLIST */}
      <div style={cardStyle}>
        <div style={sectionLabel}>Your Playlist</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          <input type="text" placeholder="Artist name" value={artistIn} onChange={e => setArtistIn(e.target.value)} onKeyDown={e => e.key === "Enter" && document.getElementById("trackIn").focus()} style={input}/>
          <input id="trackIn" type="text" placeholder="Song title" value={trackIn} onChange={e => setTrackIn(e.target.value)} onKeyDown={e => e.key === "Enter" && addTrack()} style={input}/>
          <button onClick={addTrack} style={{ background: C.violet, color: C.white, border: "none", borderRadius: 10, padding: "12px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Add Track
          </button>
        </div>

        {playlist.length === 0 ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ color: C.dimgrey, fontSize: 13, marginBottom: 14 }}>No tracks yet — add some above</div>
            <button onClick={loadExamples} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 18px", color: C.grey, fontSize: 12, cursor: "pointer" }}>
              Load 5 Classic Rock Tracks
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto" }}>
            {playlist.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: i === currentIdx ? "#1a1400" : C.bg, border: `1px solid ${i === currentIdx ? C.gold : C.border}`, borderRadius: 10, padding: "11px 12px", opacity: started && i < currentIdx ? 0.4 : 1 }}>
                <div style={{ fontSize: 11, color: i === currentIdx ? C.gold : C.dimgrey, width: 18, textAlign: "center", flexShrink: 0 }}>
                  {i === currentIdx ? "♪" : i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: i === currentIdx ? C.gold : C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.track}</div>
                  <div style={{ fontSize: 11, color: C.lavender }}>{t.artist}</div>
                </div>
                <button onClick={() => removeTrack(i)} style={{ background: "none", border: "none", color: C.dimgrey, cursor: "pointer", fontSize: 20, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* START */}
      {activated && !started && playlist.length > 0 && (
        <button onClick={startSession} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 14, padding: "17px", fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 14, letterSpacing: "0.03em" }}>
          ▶  Start Listening with mystylus.
        </button>
      )}

      {/* NOW PLAYING */}
      {started && currentTrack && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: C.dimgrey, marginBottom: 10 }}>Now Playing</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 4, lineHeight: 1.2 }}>{currentTrack.track}</div>
          <div style={{ fontSize: 14, color: C.lavender, marginBottom: 18 }}>{currentTrack.artist}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={nextTrack} style={{ background: C.gold, color: C.bg, border: "none", borderRadius: 10, padding: "11px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              ▶ Next Track
            </button>
            <button onClick={() => { setCommentary(""); setLoading(false); }} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 16px", fontSize: 12, color: C.grey, cursor: "pointer" }}>
              Skip
            </button>
            <button onClick={() => generate(currentTrack.artist, currentTrack.track, persona, genre)} style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 16px", fontSize: 12, color: C.grey, cursor: "pointer" }}>
              ↺ New Commentary
            </button>
          </div>
        </div>
      )}

      {/* COMMENTARY */}
      {started && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.gold}`, borderRadius: 16, padding: 18, minHeight: 90 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: C.gold, fontWeight: 600 }}>
              {PERSONAS[persona].label}
            </div>
            <div style={{ fontSize: 10, color: C.dimgrey }}>{genre}</div>
          </div>
          {loading && (
            <div style={{ color: C.grey, fontSize: 13, fontStyle: "italic" }}>
              Generating commentary...
            </div>
          )}
          {!loading && commentary && (
            <div style={{ fontSize: 15, lineHeight: 1.85, color: C.white }}>
              {commentary}
            </div>
          )}
          {!loading && !commentary && (
            <div style={{ color: C.dimgrey, fontSize: 13, fontStyle: "italic", textAlign: "center", paddingTop: 10 }}>
              Press Next Track to hear your DJ
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: "center", fontSize: 11, color: "#222", marginTop: 24 }}>
        <span style={{ color: C.gold }}>mystylus.</span> · mystylus.fm · Prototype v1.0
      </div>

    </div>
  );
}
