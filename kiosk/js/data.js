/* ==========================================================
   data.js - catalog data shared by every page
   ========================================================== */

const categoryColors = {
  "Superhero": "#2f4b6e",
  "Manga": "#7a3b3b",
  "Graphic Novel": "#3f5f4a",
  "Sci-Fi & Fantasy": "#4f4577",
  "Indie": "#6b5a3a"
};

/* isbn is used to load the cover from Open Library (needs internet).
   If a cover is missing, the card shows a plain title block instead. */
const books = [
  { id: 1, isbn: "9780930289232",  title: "Watchmen",                       author: "Alan Moore",          category: "Superhero",        price: 1299 },
  { id: 2, isbn: "9781563893421",  title: "The Dark Knight Returns",        author: "Frank Miller",        category: "Superhero",        price: 1099 },
  { id: 3, isbn: "9780785110712",  title: "Spider-Man: Blue",               author: "Jeph Loeb",           category: "Superhero",        price: 899  },
  { id: 4, isbn: "9780930289331",  title: "Batman: Year One",               author: "Frank Miller",        category: "Superhero",        price: 799  },
  { id: 5, isbn: "9781569319000",  title: "Naruto, Vol. 1",                 author: "Masashi Kishimoto",   category: "Manga",            price: 499  },
  { id: 6, isbn: "9781569319017",  title: "One Piece, Vol. 1",              author: "Eiichiro Oda",        category: "Manga",            price: 499  },
  { id: 7, isbn: "9781421501680",  title: "Death Note, Vol. 1",             author: "Tsugumi Ohba",        category: "Manga",            price: 549  },
  { id: 8, isbn: "9781612620244",  title: "Attack on Titan, Vol. 1",        author: "Hajime Isayama",      category: "Manga",            price: 549  },
  { id: 9, isbn: "9780394747231",  title: "Maus",                           author: "Art Spiegelman",      category: "Graphic Novel",    price: 1199 },
  { id: 10, isbn: "9780375714832", title: "Persepolis",                     author: "Marjane Satrapi",     category: "Graphic Novel",    price: 999  },
  { id: 11, isbn: "9780618871711", title: "Fun Home",                       author: "Alison Bechdel",      category: "Graphic Novel",    price: 949  },
  { id: 12, isbn: "9781891830433", title: "Blankets",                       author: "Craig Thompson",      category: "Graphic Novel",    price: 1099 },
  { id: 13, isbn: "9781607066019", title: "Saga, Vol. 1",                   author: "Brian K. Vaughan",    category: "Sci-Fi & Fantasy", price: 899  },
  { id: 14, isbn: "9781401284770", title: "The Sandman: Preludes & Nocturnes", author: "Neil Gaiman",      category: "Sci-Fi & Fantasy", price: 1049 },
  { id: 15, isbn: "9780439706407", title: "Bone: Out from Boneville",       author: "Jeff Smith",          category: "Indie",            price: 699  },
  { id: 16, isbn: "9781932664089", title: "Scott Pilgrim, Vol. 1",          author: "Bryan Lee O'Malley",  category: "Indie",            price: 749  }
];

/* Description, publisher and original publication year for each book */
const bookInfo = {
  1:  { year: 1986, publisher: "DC Comics", desc: "In an alternate 1985 where costumed heroes are outlawed, the murder of a former hero pulls a group of retired vigilantes back together. Alan Moore and Dave Gibbons turn the superhero story inside out in a tightly plotted, layered classic." },
  2:  { year: 1986, publisher: "DC Comics", desc: "An aging Bruce Wayne returns as Batman after ten years in retirement, in a Gotham that has grown darker. Frank Miller's gritty, influential story reshaped how the character is written." },
  3:  { year: 2002, publisher: "Marvel Comics", desc: "Peter Parker looks back on his early days as Spider-Man and his first love, Gwen Stacy, in this warm and reflective story from Jeph Loeb and Tim Sale." },
  4:  { year: 1987, publisher: "DC Comics", desc: "Bruce Wayne returns to Gotham and begins his fight against crime, while Lieutenant James Gordon joins a corrupt police force. Frank Miller and David Mazzucchelli tell Batman's origin in a grounded, noir style." },
  5:  { year: 1999, publisher: "Shueisha", desc: "Naruto Uzumaki, a young outcast ninja, dreams of becoming his village's leader, the Hokage. Volume 1 introduces him, his team and the first missions that test them." },
  6:  { year: 1997, publisher: "Shueisha", desc: "Monkey D. Luffy sets sail to find the legendary treasure One Piece and become King of the Pirates. Volume 1 starts the adventure and begins to gather his crew." },
  7:  { year: 2003, publisher: "Shueisha", desc: "Student Light Yagami finds a notebook that kills anyone whose name is written in it. A genius detective known as L begins to hunt him in a tense game of wits." },
  8:  { year: 2009, publisher: "Kodansha", desc: "Humanity lives behind enormous walls to hide from man-eating giants. When a colossal Titan breaks through, young Eren Yeager vows to destroy them all." },
  9:  { year: 1986, publisher: "Pantheon Books", desc: "Art Spiegelman tells the story of his father, a Polish Jewish survivor of the Holocaust, with Jews drawn as mice and Nazis as cats. It is both a history and a son's attempt to understand his father, and it won a special Pulitzer Prize in 1992." },
  10: { year: 2000, publisher: "L'Association", desc: "Marjane Satrapi recounts her childhood and youth in Tehran during and after the Islamic Revolution. Told in simple black-and-white drawings, it is funny, personal and moving." },
  11: { year: 2006, publisher: "Houghton Mifflin", desc: "Alison Bechdel looks back on her childhood and her complicated relationship with her father, a funeral director and English teacher. A memoir about family, secrets and growing up." },
  12: { year: 2003, publisher: "Top Shelf Productions", desc: "Craig Thompson's autobiographical story of growing up in a strict religious family and falling in love for the first time at a winter church camp. A long, quiet and beautifully drawn read." },
  13: { year: 2012, publisher: "Image Comics", desc: "Two soldiers from warring worlds fall in love and run away with their newborn daughter. Brian K. Vaughan and Fiona Staples mix space opera, fantasy and family drama." },
  14: { year: 1989, publisher: "DC Comics (Vertigo)", desc: "Morpheus, the Lord of Dreams, escapes decades of captivity and sets out to reclaim his stolen tools. The first volume of Neil Gaiman's dark, literary fantasy series." },
  15: { year: 1991, publisher: "Cartoon Books", desc: "Three cousins are run out of Boneville and get lost in a valley full of strange creatures, dragons and a mysterious girl. Jeff Smith blends humour, adventure and epic fantasy." },
  16: { year: 2004, publisher: "Oni Press", desc: "Twenty-three-year-old Scott Pilgrim falls for Ramona Flowers and learns he must defeat her seven evil exes. Bryan Lee O'Malley mixes video-game humour, indie music and slacker romance." }
};

books.forEach(function (book) {
  Object.assign(book, bookInfo[book.id]);
});


/* ==========================================================
   Collector data (sample data for this demo project)
   Formats, CGC-style grades and the upcoming release schedule
   ========================================================== */

const FORMATS = ["Manga Volume", "Trade Paperback"];
const RELEASE_FORMATS = ["Single Issue", "Variant Cover", "Manga Volume", "Trade Paperback"];

const FORMAT_INFO = {
  "Manga Volume": "Collected manga volumes, ready to shelf.",
  "Trade Paperback": "Collected editions and graphic novels."
};

books.forEach(function (book) {
  book.format = book.category === "Manga" ? "Manga Volume" : "Trade Paperback";
});

/* CGC-style 10-point scale. book.price is the price at grade 9.8. */
const GRADES = [
  { grade: "9.8", name: "Near Mint/Mint", mult: 1,    desc: "Nearly flawless. Sharp corners, a flat cover and only the tiniest printing flaws." },
  { grade: "9.4", name: "Near Mint",      mult: 0.9,  desc: "Very small signs of handling, such as a tiny corner bump or a minor spine tick. Looks new at a glance." },
  { grade: "8.0", name: "Very Fine",      mult: 0.75, desc: "A clean, attractive copy with light wear. A popular choice for building a collection." },
  { grade: "6.0", name: "Fine",           mult: 0.55, desc: "Read but cared for. Moderate wear, minor creases and some soft edges." },
  { grade: "4.0", name: "Very Good",      mult: 0.35, desc: "Visible wear throughout, with creases and possible small tears or stains. Complete and readable." }
];
const DEFAULT_GRADE = "9.8";

/* Upcoming releases (made-up series, shown as a sample release schedule) */
const releases = [
  { id: "r1",  date: "2026-12-02", title: "Midnight Courier #1",                    format: "Single Issue",    publisher: "Lantern Press",    price: 399,  note: "A new crime-noir series about a night-shift messenger." },
  { id: "r2",  date: "2026-12-02", title: "Midnight Courier #1 (Cover B Variant)",  format: "Variant Cover",   publisher: "Lantern Press",    price: 799,  note: "Alternate cover by a guest artist." },
  { id: "r3",  date: "2026-12-09", title: "Rustbelt Rangers, Vol. 3",               format: "Trade Paperback", publisher: "Halftone Comics",  price: 1099, note: "Collects the third story arc." },
  { id: "r4",  date: "2026-12-16", title: "Kitsune Circuit, Vol. 1",                format: "Manga Volume",    publisher: "Paper Moon Books", price: 549,  note: "Series debut: a courier races through a neon city." },
  { id: "r5",  date: "2026-12-23", title: "Midnight Courier #2",                    format: "Single Issue",    publisher: "Lantern Press",    price: 399,  note: "The mystery deepens." },
  { id: "r6",  date: "2027-01-06", title: "Starlight Syndicate #1",                 format: "Single Issue",    publisher: "Halftone Comics",  price: 449,  note: "A space-heist team assembles." },
  { id: "r7",  date: "2027-01-06", title: "Starlight Syndicate #1 (Foil Variant)",  format: "Variant Cover",   publisher: "Halftone Comics",  price: 899,  note: "Foil-stamped variant cover." },
  { id: "r8",  date: "2027-01-13", title: "Kitsune Circuit, Vol. 2",                format: "Manga Volume",    publisher: "Paper Moon Books", price: 549,  note: "The race gets dangerous." },
  { id: "r9",  date: "2027-01-27", title: "Rustbelt Rangers #25",                   format: "Single Issue",    publisher: "Halftone Comics",  price: 349,  note: "Milestone issue." },
  { id: "r10", date: "2027-02-03", title: "Paper Moon Anthology, Vol. 1",           format: "Trade Paperback", publisher: "Paper Moon Books", price: 999,  note: "Short stories from new creators." },
  { id: "r11", date: "2027-02-10", title: "Kitsune Circuit, Vol. 3",                format: "Manga Volume",    publisher: "Paper Moon Books", price: 549,  note: "Mid-series cliffhanger." },
  { id: "r12", date: "2027-03-03", title: "Starlight Syndicate #2",                 format: "Single Issue",    publisher: "Halftone Comics",  price: 449,  note: "The first heist begins." }
];
