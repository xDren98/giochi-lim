# 🌟 Piattaforma Giochi LIM - English Corner

Piattaforma didattica per la Lavagna Interattiva Multimediale (LIM), tablet e PC, pensata per la scuola primaria.

## 📁 Struttura del Progetto

```text
giochi-lim/
├── index.html                     # Portale principale con menu e griglia giochi
├── README.md                      # Questa guida
└── games/                         # Cartella contenente i singoli giochi HTML
    ├── gioco_LIM_body_parts.html     # Gioco 1: Abbinamento Parola - Immagine
    └── gioco_LIM_body_adventure.html # Gioco 2: Simon Says, Monster Lab & Memory
```

---

## 🚀 Come aggiungere un nuovo gioco in futuro

Aggiungere un nuovo gioco è semplicissimo e richiede solo due passaggi:

### 1. Inserisci il file HTML
Copia il nuovo file HTML nella cartella `games/`, ad esempio:
`games/gioco_LIM_animals.html`

*(Consiglio: all'interno del nuovo gioco puoi inserire un pulsante per tornare alla home aggiungendo `<a href="../index.html" class="btn-home">🏠 Menu Giochi</a>`)*

### 2. Registralo in `index.html`
Apri `index.html` con un editor (es. Blocco Note o VS Code) e trova l'elenco `const GIOCHI = [ ... ]` verso la fine del file. Aggiungi il nuovo blocco per il tuo gioco:

```javascript
{
    id: "animals",
    title: "Animal Kingdom",
    subtitle: "Riconosci gli animali in inglese",
    desc: "Ascolta il verso e tocca l'animale corretto!",
    emoji: "🦁",
    color: "#ff9800",
    bgGradient: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
    tag: "Vocabolario • Animali",
    btnText: "▶ Gioca agli Animali",
    file: "games/gioco_LIM_animals.html"
},
```

Salva il file: la card del nuovo gioco apparirà **automaticamente** sulla schermata iniziale della LIM!
