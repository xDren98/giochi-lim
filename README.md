# 🌟 Piattaforma Giochi LIM - Scuola Gesù Eucaristico

Piattaforma didattica per la Lavagna Interattiva Multimediale (LIM), touchscreen, tablet e PC.
Tutti i giochi sono progettati per lezioni coinvolgenti nella scuola primaria, con pronuncia audio inglese, controlli touch e interfaccia ad alto contrasto.

---

## 📁 Struttura del Progetto (8 Giochi Interattivi)

```text
giochi-lim/
├── index.html                           # Portale principale con menu per classi, ricerca e fullscreen
├── README.md                            # Guida del portale
└── games/                               # Cartella contenente i singoli giochi HTML
    ├── gioco_LIM_forme_geometriche.html # Classe 1ª: Magic Shapes (Geometria & Inglese)
    ├── gioco_LIM_body_parts.html        # Classe 2ª: My Body Parts (Abbinamento Parola-Immagine)
    ├── gioco_LIM_body_adventure.html    # Classe 2ª: The Body Adventure (Simon Says, Monster Lab, Memory)
    ├── word_image_match.html            # Classe 2ª: Word & Picture Match! (Days, Body, Animals, Food)
    ├── days_of_the_week.html            # Classe 3ª: Days of the Week (Flashcards, Quiz, Ordinamento)
    ├── ninja_cat_prepositions.html      # Classe 4ª: Ninja Cat Prepositions (Team Scoreboard & Luoghi)
    ├── biology_quiz_lim.html            # Classe 4ª: The Great Micro-Quiz (Scienze CLIL: Cellule, Virus, Batteri)
    └── gioco_LIM_school_subjects.html   # Classe 5ª: School Subjects Challenge (Quiz, Glossario & Badges)
```

---

## 🚀 Come aggiungere un nuovo gioco

1. **Inserisci il file HTML** dentro la cartella `games/`, es. `games/mio_nuovo_gioco.html`.
2. Aggiungi il pulsante Home nel tuo gioco:
   ```html
   <a href="../index.html" class="btn-ctrl">🏠 Menu Giochi</a>
   ```
3. Registra il nuovo gioco nell'array `GIOCHI` all'interno di `index.html`.
4. Salva il file: la card comparirà automaticamente nel portale con i rispettivi filtri per classe!
