import { useState, useEffect, useMemo } from "react";

const SAMPLE_BIRTHDAYS = [
  { id: 1, name: "Mom", date: "1965-03-15", emoji: "👩", note: "Get flowers!" },
  { id: 2, name: "Raj", date: "1990-03-18", emoji: "🎂", note: "He loves chocolate cake" },
  { id: 3, name: "Priya", date: "1995-07-04", emoji: "🎉", note: "" },
  { id: 4, name: "Arjun", date: "1988-12-25", emoji: "🎁", note: "Christmas birthday!" },
];

const EMOJIS = ["🎂","🎉","🎁","👑","🌟","💫","🦋","🌺","🎈","🥳","🌈","💖","🦄","🍰","✨"];

function daysUntilBirthday(dateStr) {
  const today = new Date();
  const bday = new Date(dateStr);
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
  if (next < today) next.setFullYear(today.getFullYear() + 1);
  const diff = Math.round((next - today) / (1000 * 60 * 60 * 24));
  return diff;
}

function getAge(dateStr) {
  const today = new Date();
  const bday = new Date(dateStr);
  let age = today.getFullYear() - bday.getFullYear();
  const m = today.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--;
  return age;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long" });
}

function getBadge(days) {
  if (days === 0) return { label: "TODAY! 🎉", color: "#ff6b6b" };
  if (days === 1) return { label: "TOMORROW", color: "#ffa94d" };
  if (days <= 7) return { label: `${days} days`, color: "#74c0fc" };
  if (days <= 30) return { label: `${days} days`, color: "#a9e34b" };
  return { label: `${days} days`, color: "#868e96" };
}

export default function BirthdayReminder() {
  const [birthdays, setBirthdays] = useState(SAMPLE_BIRTHDAYS);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", date: "", emoji: "🎂", note: "" });
  const [tab, setTab] = useState("upcoming");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const sorted = useMemo(() => {
    return [...birthdays]
      .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => daysUntilBirthday(a.date) - daysUntilBirthday(b.date));
  }, [birthdays, search]);

  const upcoming = sorted.filter(b => daysUntilBirthday(b.date) <= 30);
  const all = sorted;

  const openAdd = () => {
    setEditId(null);
    setForm({ name: "", date: "", emoji: "🎂", note: "" });
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditId(b.id);
    setForm({ name: b.name, date: b.date, emoji: b.emoji, note: b.note });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.date) return;
    if (editId) {
      setBirthdays(prev => prev.map(b => b.id === editId ? { ...b, ...form } : b));
      showToast("Birthday updated!");
    } else {
      setBirthdays(prev => [...prev, { ...form, id: Date.now() }]);
      showToast("Birthday added! 🎉");
    }
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setBirthdays(prev => prev.filter(b => b.id !== id));
    showToast("Removed.", "info");
  };

  const displayList = tab === "upcoming" ? upcoming : all;
  const todayBirthdays = birthdays.filter(b => daysUntilBirthday(b.date) === 0);

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :root { color-scheme: dark; }
        body { background: #0a0a0f; }
        ::placeholder { color: #555; }
        input, textarea { outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        .card { transition: transform 0.2s, box-shadow 0.2s; }
        .card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
        .btn-primary { transition: all 0.2s; }
        .btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); }
        .tab-btn { transition: all 0.2s; }
        .badge-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        @keyframes slideIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes toastIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
        .card { animation: slideIn 0.35s ease both; }
        .overlay { animation: fadeIn 0.2s ease; }
        .toast { animation: toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1); }
        input:focus, textarea:focus { border-color: #c084fc !important; box-shadow: 0 0 0 3px rgba(192,132,252,0.15); }
        @media (max-width: 480px) {
          .desktop-hide { display: none !important; }
          .mobile-full { width: 100% !important; }
        }
      `}</style>

      {/* Today's Banner */}
      {todayBirthdays.length > 0 && (
        <div style={styles.todayBanner}>
          <span style={{ fontSize: 22 }}>🎂</span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
            Today: {todayBirthdays.map(b => b.name).join(", ")}'s Birthday!
          </span>
          <span style={{ fontSize: 22 }}>🎉</span>
        </div>
      )}

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Birthday<br />Reminders</h1>
          <p style={styles.subtitle}>{birthdays.length} people · never forget again</p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={styles.addBtn}>
          <span style={{ fontSize: 22 }}>+</span>
          <span className="desktop-hide" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>Add Birthday</span>
        </button>
      </header>

      {/* Search + Tabs */}
      <div style={styles.controls}>
        <div style={styles.searchWrap}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#666" }}>🔍</span>
          <input
            style={styles.search}
            placeholder="Search birthdays..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.tabs}>
          {["upcoming", "all"].map(t => (
            <button
              key={t}
              className="tab-btn"
              onClick={() => setTab(t)}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            >
              {t === "upcoming" ? `🔜 Upcoming (${upcoming.length})` : `📋 All (${all.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <main style={styles.list}>
        {displayList.length === 0 && (
          <div style={styles.empty}>
            <div style={{ fontSize: 52 }}>🎈</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#555", marginTop: 12 }}>
              {tab === "upcoming" ? "No birthdays in the next 30 days!" : "No birthdays found."}
            </p>
            <button className="btn-primary" onClick={openAdd} style={{ ...styles.addBtn, marginTop: 20, fontSize: 14 }}>
              + Add Birthday
            </button>
          </div>
        )}
        {displayList.map((b, i) => {
          const days = daysUntilBirthday(b.date);
          const badge = getBadge(days);
          const age = getAge(b.date) + 1;
          return (
            <div key={b.id} className="card" style={{ ...styles.card, animationDelay: `${i * 0.05}s` }}>
              <div style={styles.cardLeft}>
                <div style={{ ...styles.emojiCircle, background: days === 0 ? "rgba(255,107,107,0.15)" : "rgba(192,132,252,0.1)" }}>
                  <span style={{ fontSize: 28 }}>{b.emoji}</span>
                </div>
                <div>
                  <div style={styles.cardName}>{b.name}</div>
                  <div style={styles.cardDate}>{formatDate(b.date)} · turning {age}</div>
                  {b.note && <div style={styles.cardNote}>📝 {b.note}</div>}
                </div>
              </div>
              <div style={styles.cardRight}>
                <div style={{ ...styles.badge, background: badge.color + "22", color: badge.color, ...(days === 0 ? { animation: "pulse 1.5s infinite" } : {}) }}>
                  {badge.label}
                </div>
                <div style={styles.cardActions}>
                  <button onClick={() => openEdit(b)} style={styles.iconBtn} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(b.id)} style={styles.iconBtn} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Modal */}
      {showForm && (
        <div className="overlay" style={styles.overlay} onClick={() => setShowForm(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{editId ? "Edit Birthday" : "Add Birthday"}</h2>

            <label style={styles.label}>Name</label>
            <input
              style={styles.input}
              placeholder="Person's name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />

            <label style={styles.label}>Birthday</label>
            <input
              type="date"
              style={styles.input}
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            />

            <label style={styles.label}>Pick an Emoji</label>
            <div style={styles.emojiGrid}>
              {EMOJIS.map(em => (
                <button
                  key={em}
                  onClick={() => setForm(f => ({ ...f, emoji: em }))}
                  style={{ ...styles.emojiOpt, ...(form.emoji === em ? styles.emojiOptSelected : {}) }}
                >
                  {em}
                </button>
              ))}
            </div>

            <label style={styles.label}>Note <span style={{ color: "#555", fontWeight: 400 }}>(optional)</span></label>
            <textarea
              style={{ ...styles.input, height: 72, resize: "none" }}
              placeholder="Gift ideas, reminders..."
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />

            <div style={styles.modalActions}>
              <button onClick={() => setShowForm(false)} style={styles.cancelBtn}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} style={styles.saveBtn}>
                {editId ? "Save Changes" : "Add Birthday 🎉"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ ...styles.toast, background: toast.type === "info" ? "#333" : "#c084fc" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #12001a 50%, #0a0a0f 100%)",
    color: "#e8e0f0",
    fontFamily: "'DM Sans', sans-serif",
    paddingBottom: 40,
  },
  todayBanner: {
    background: "linear-gradient(90deg, #ff6b6b, #ffa94d)",
    padding: "12px 24px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    justifyContent: "center",
    fontSize: 15,
    color: "#fff",
    letterSpacing: 0.3,
  },
  header: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "40px 20px 20px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(36px, 8vw, 56px)",
    fontWeight: 900,
    lineHeight: 1.05,
    background: "linear-gradient(135deg, #e9d5ff, #c084fc, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    color: "#7c6f8e",
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  addBtn: {
    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
    border: "none",
    color: "#fff",
    borderRadius: 14,
    padding: "12px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    flexShrink: 0,
    boxShadow: "0 4px 20px rgba(168,85,247,0.35)",
  },
  controls: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "0 20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  searchWrap: {
    position: "relative",
  },
  search: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "12px 16px 12px 40px",
    color: "#e8e0f0",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s",
  },
  tabs: {
    display: "flex",
    gap: 8,
  },
  tab: {
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "8px 16px",
    color: "#7c6f8e",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
  },
  tabActive: {
    background: "rgba(168,85,247,0.15)",
    borderColor: "rgba(168,85,247,0.4)",
    color: "#c084fc",
  },
  list: {
    maxWidth: 700,
    margin: "0 auto",
    padding: "0 20px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1.5px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    backdropFilter: "blur(8px)",
  },
  cardLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flex: 1,
    minWidth: 0,
  },
  emojiCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardName: {
    fontWeight: 600,
    fontSize: 16,
    color: "#e8e0f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardDate: {
    fontSize: 13,
    color: "#7c6f8e",
    marginTop: 2,
  },
  cardNote: {
    fontSize: 12,
    color: "#5a4f6a",
    marginTop: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: 200,
  },
  cardRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
    flexShrink: 0,
  },
  badge: {
    borderRadius: 8,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  cardActions: {
    display: "flex",
    gap: 4,
  },
  iconBtn: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    padding: "5px 8px",
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.15s",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(4px)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    background: "#13001f",
    border: "1.5px solid rgba(168,85,247,0.2)",
    borderRadius: 24,
    padding: "28px 24px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 700,
    color: "#e9d5ff",
    marginBottom: 20,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#9b87b0",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "11px 14px",
    color: "#e8e0f0",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    transition: "border-color 0.2s, box-shadow 0.2s",
    colorScheme: "dark",
  },
  emojiGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  emojiOpt: {
    background: "rgba(255,255,255,0.04)",
    border: "1.5px solid rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "7px 9px",
    cursor: "pointer",
    fontSize: 20,
    transition: "all 0.15s",
  },
  emojiOptSelected: {
    background: "rgba(168,85,247,0.2)",
    borderColor: "#a855f7",
    transform: "scale(1.1)",
  },
  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 22,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    background: "transparent",
    border: "1.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "11px 20px",
    color: "#7c6f8e",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #a855f7, #7c3aed)",
    border: "none",
    borderRadius: 12,
    padding: "11px 22px",
    color: "#fff",
    cursor: "pointer",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    boxShadow: "0 4px 16px rgba(168,85,247,0.4)",
  },
  toast: {
    position: "fixed",
    bottom: 24,
    right: 24,
    borderRadius: 12,
    padding: "12px 20px",
    color: "#fff",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 600,
    fontSize: 14,
    zIndex: 999,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
};
