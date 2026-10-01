export type SchoolClass = 9 | 10;
export type SchoolSubject = "science" | "maths";

export type SchoolChapter = {
  id: string;
  classLevel: SchoolClass;
  subject: SchoolSubject;
  number: number;
  name: string;
  unit: string;
  book: string;
  keyTopics: string[];
  /** Taught in school but not asked in the CBSE year-end exam for this session. */
  internalOnly?: boolean;
};

export const SYLLABUS_SESSION = "CBSE 2026–27";

export const SYLLABUS_BOOKS: Record<`${SchoolClass}-${SchoolSubject}`, string> = {
  "9-science": "NCERT Exploration (Class 9 Science, 2026 edition)",
  "10-science": "NCERT Science Class 10 (rationalised)",
  "9-maths": "NCERT Ganita Manjari (Class 9 Maths, 2026 edition)",
  "10-maths": "NCERT Mathematics Class 10",
};

function chapter(
  classLevel: SchoolClass,
  subject: SchoolSubject,
  number: number,
  id: string,
  name: string,
  unit: string,
  keyTopics: string[],
  internalOnly = false
): SchoolChapter {
  return {
    id,
    classLevel,
    subject,
    number,
    name,
    unit,
    book: SYLLABUS_BOOKS[`${classLevel}-${subject}`],
    keyTopics,
    internalOnly,
  };
}

export const SCHOOL_SYLLABUS: SchoolChapter[] = [
  chapter(9, "science", 1, "s9-exploration", "Exploration: Entering the World of Secondary Science", "Nature of Science", [
    "Scientific method and inquiry",
    "Hypothesis, variables and fair tests",
    "Observation vs inference",
    "Models and predictions",
    "Science, technology and society",
  ]),
  chapter(9, "science", 2, "s9-cell", "Cell: The Building Block of Life", "World of Living", [
    "Discovery of the cell",
    "Plant and animal cells",
    "Prokaryotic and eukaryotic cells",
    "Cell organelles and their functions",
    "Diffusion and osmosis",
    "Cell division: mitosis and meiosis",
  ]),
  chapter(9, "science", 3, "s9-tissues", "Tissues in Action", "World of Living", [
    "Levels of organisation",
    "Meristematic and permanent plant tissues",
    "Xylem and phloem",
    "Epithelial, connective, muscular and nervous tissue",
    "Musculoskeletal system and joints",
    "Care of muscles and posture",
  ]),
  chapter(9, "science", 4, "s9-motion", "Describing Motion Around Us", "Motion, Force, Work and Sound", [
    "Distance and displacement",
    "Speed, velocity and acceleration",
    "Position-time and velocity-time graphs",
    "Equations of motion (graphical method)",
    "Uniform circular motion",
  ]),
  chapter(9, "science", 5, "s9-mixtures", "Exploring Mixtures and Their Separation", "Matter: Its Nature and Behaviour", [
    "Homogeneous and heterogeneous mixtures",
    "Solutions, suspensions and colloids",
    "Concentration of solutions",
    "Crystallisation, distillation and chromatography",
    "Sublimation, centrifugation and coagulation",
  ]),
  chapter(9, "science", 6, "s9-forces", "How Forces Affect Motion", "Motion, Force, Work and Sound", [
    "Balanced and unbalanced forces",
    "Friction",
    "Newton's first law and inertia",
    "Newton's second law (F = ma)",
    "Newton's third law",
  ]),
  chapter(9, "science", 7, "s9-work", "Work, Energy and Simple Machines", "Motion, Force, Work and Sound", [
    "Work done by a constant force",
    "Kinetic and potential energy",
    "Conservation of energy",
    "Power",
    "Simple machines and mechanical advantage",
  ]),
  chapter(9, "science", 8, "s9-atom", "Journey Inside the Atom", "Matter: Its Nature and Behaviour", [
    "Subatomic particles",
    "Thomson, Rutherford and Bohr models",
    "Electron distribution in shells (K, L, M)",
    "Valency",
    "Atomic number, mass number, isotopes and isobars",
  ]),
  chapter(9, "science", 9, "s9-matter", "Atomic Foundations of Matter", "Matter: Its Nature and Behaviour", [
    "Law of conservation of mass",
    "Law of constant proportions",
    "Dalton's atomic theory",
    "Molecules and ions",
    "Writing chemical formulae",
    "Molecular mass and formula unit mass",
  ]),
  chapter(9, "science", 10, "s9-sound", "Sound Waves: Characteristics and Applications", "Motion, Force, Work and Sound", [
    "Production of sound by vibration",
    "Longitudinal waves need a medium",
    "Wavelength, frequency, amplitude and speed",
    "Pitch, loudness and audible range",
    "Echo, reverberation and echolocation",
  ]),
  chapter(9, "science", 11, "s9-reproduction", "Reproduction: How Life Continues", "World of Living", [
    "Asexual and sexual reproduction",
    "Parts of a flower",
    "Pollination, fertilisation and seed dispersal",
    "Human reproductive systems",
    "Reproductive health and hygiene",
  ]),
  chapter(9, "science", 12, "s9-diversity", "Patterns in Life: Diversity and Classification", "World of Living", [
    "Why we classify",
    "Five kingdom classification",
    "Major plant and animal groups",
    "Binomial nomenclature",
    "Viruses as acellular entities",
  ]),
  chapter(9, "science", 13, "s9-earth", "Earth as a System: Energy, Matter and Life", "Earth as a System", [
    "Spheres of the Earth",
    "Solar radiation and the electromagnetic spectrum",
    "Differential heating and winds",
    "Land and sea breezes",
    "Water, carbon, nitrogen and oxygen cycles",
    "Human impact on Earth's systems",
  ]),

  chapter(10, "science", 1, "s10-reactions", "Chemical Reactions and Equations", "Chemical Substances", [
    "Balancing chemical equations",
    "Combination and decomposition reactions",
    "Displacement and double displacement",
    "Exothermic and endothermic reactions",
    "Oxidation and reduction",
    "Corrosion and rancidity",
  ]),
  chapter(10, "science", 2, "s10-acids", "Acids, Bases and Salts", "Chemical Substances", [
    "Indicators",
    "Reactions of acids and bases",
    "Neutralisation",
    "pH scale and its importance",
    "NaOH, bleaching powder, baking soda, washing soda, Plaster of Paris",
  ]),
  chapter(10, "science", 3, "s10-metals", "Metals and Non-metals", "Chemical Substances", [
    "Physical properties of metals and non-metals",
    "Reactivity series",
    "Ionic compounds",
    "Basic metallurgy",
    "Corrosion and its prevention",
  ]),
  chapter(10, "science", 4, "s10-carbon", "Carbon and its Compounds", "Chemical Substances", [
    "Covalent bonding",
    "Versatile nature of carbon",
    "Homologous series and functional groups",
    "Nomenclature",
    "Combustion, oxidation, addition and substitution",
    "Ethanol, ethanoic acid, soaps and detergents",
  ]),
  chapter(10, "science", 14, "s10-periodic", "Periodic Classification of Elements", "Chemical Substances", [
    "Döbereiner's triads",
    "Newlands' law of octaves",
    "Mendeléev's periodic table",
    "Modern periodic table and trends",
  ], true),
  chapter(10, "science", 5, "s10-life", "Life Processes", "World of Living", [
    "Nutrition in plants and animals",
    "Respiration",
    "Transportation",
    "Excretion",
  ]),
  chapter(10, "science", 6, "s10-control", "Control and Coordination", "World of Living", [
    "Nervous system and neurons",
    "Reflex action",
    "Human brain",
    "Plant movements and hormones",
    "Animal hormones",
  ]),
  chapter(10, "science", 7, "s10-repro", "How do Organisms Reproduce?", "World of Living", [
    "Modes of asexual reproduction",
    "Sexual reproduction in flowering plants",
    "Human reproduction",
    "Reproductive health and family planning",
  ]),
  chapter(10, "science", 8, "s10-heredity", "Heredity", "World of Living", [
    "Variation",
    "Mendel's experiments",
    "Dominant and recessive traits",
    "Sex determination in humans",
  ]),
  chapter(10, "science", 9, "s10-light", "Light: Reflection and Refraction", "Natural Phenomena", [
    "Spherical mirrors and image formation",
    "Mirror formula and magnification",
    "Laws of refraction and refractive index",
    "Spherical lenses and lens formula",
    "Power of a lens",
  ]),
  chapter(10, "science", 10, "s10-eye", "The Human Eye and the Colourful World", "Natural Phenomena", [
    "Structure of the eye and accommodation",
    "Defects of vision and correction",
    "Refraction through a prism",
    "Dispersion of light",
    "Scattering of light",
  ]),
  chapter(10, "science", 11, "s10-electricity", "Electricity", "Effects of Current", [
    "Current and potential difference",
    "Ohm's law",
    "Resistance and resistivity",
    "Series and parallel resistors",
    "Heating effect and electric power",
  ]),
  chapter(10, "science", 12, "s10-magnetic", "Magnetic Effects of Electric Current", "Effects of Current", [
    "Magnetic field and field lines",
    "Field due to a straight wire and solenoid",
    "Force on a current-carrying conductor",
    "Fleming's left-hand rule",
    "AC vs DC and domestic circuits",
  ]),
  chapter(10, "science", 13, "s10-environment", "Our Environment", "Natural Resources", [
    "Ecosystem and food chains",
    "Trophic levels and the 10% law",
    "Biological magnification",
    "Ozone depletion",
    "Biodegradable and non-biodegradable waste",
  ]),

  chapter(9, "maths", 1, "m9-coordinates", "Orienting Yourself: The Use of Coordinates", "Coordinate Geometry", [
    "Cartesian plane and axes",
    "Quadrants and signs",
    "Plotting points",
    "Distance along axes",
  ]),
  chapter(9, "maths", 2, "m9-linear-poly", "Introduction to Linear Polynomials", "Algebra", [
    "Linear expressions and polynomials",
    "Degree of a polynomial",
    "Value and zero of a linear polynomial",
    "Graph of a linear relation",
  ]),
  chapter(9, "maths", 3, "m9-numbers", "The World of Numbers", "Number System", [
    "Rational and irrational numbers",
    "Decimal expansions",
    "Number line",
    "Laws of exponents and surds",
  ]),
  chapter(9, "maths", 4, "m9-identities", "Exploring Algebraic Identities", "Algebra", [
    "(a + b)², (a − b)² and a² − b²",
    "(a + b + c)²",
    "Cubic identities",
    "Factorisation using identities",
  ]),
  chapter(9, "maths", 5, "m9-circles", "I'm Up and Down, and Round and Round", "Geometry", [
    "Circle terms: centre, radius, chord, arc",
    "Angles subtended by chords and arcs",
    "Perpendicular from centre to a chord",
    "Cyclic points",
  ]),
  chapter(9, "maths", 6, "m9-area", "Measuring Space: Perimeter and Area", "Mensuration", [
    "Perimeter of plane figures",
    "Circumference and π",
    "Length of an arc",
    "Area of triangles and Heron's formula",
  ]),
  chapter(9, "maths", 7, "m9-probability", "The Mathematics of Maybe: Introduction to Probability", "Statistics and Probability", [
    "Experiments and outcomes",
    "Experimental probability",
    "Probability between 0 and 1",
  ]),
  chapter(9, "maths", 8, "m9-sequences", "Predicting What Comes Next: Sequences and Progressions", "Algebra", [
    "Number patterns",
    "Arithmetic sequences",
    "General term",
  ]),

  chapter(10, "maths", 1, "m10-real", "Real Numbers", "Number Systems", [
    "Fundamental Theorem of Arithmetic",
    "HCF and LCM by prime factorisation",
    "Irrationality proofs",
  ]),
  chapter(10, "maths", 2, "m10-poly", "Polynomials", "Algebra", [
    "Zeros of a polynomial",
    "Relation between zeros and coefficients",
  ]),
  chapter(10, "maths", 3, "m10-linear", "Pair of Linear Equations in Two Variables", "Algebra", [
    "Graphical method",
    "Consistency conditions",
    "Substitution and elimination",
  ]),
  chapter(10, "maths", 4, "m10-quadratic", "Quadratic Equations", "Algebra", [
    "Standard form",
    "Factorisation",
    "Quadratic formula",
    "Discriminant and nature of roots",
  ]),
  chapter(10, "maths", 5, "m10-ap", "Arithmetic Progressions", "Algebra", [
    "Common difference",
    "nth term",
    "Sum of first n terms",
  ]),
  chapter(10, "maths", 6, "m10-coord", "Coordinate Geometry", "Coordinate Geometry", [
    "Distance formula",
    "Section formula",
    "Midpoint",
  ]),
  chapter(10, "maths", 7, "m10-triangles", "Triangles", "Geometry", [
    "Similar triangles",
    "Basic Proportionality Theorem",
    "Similarity criteria",
  ]),
  chapter(10, "maths", 8, "m10-circles", "Circles", "Geometry", [
    "Tangent to a circle",
    "Tangent ⟂ radius",
    "Lengths of tangents from an external point",
  ]),
  chapter(10, "maths", 9, "m10-trig", "Introduction to Trigonometry", "Trigonometry", [
    "Trigonometric ratios",
    "Ratios of standard angles",
    "Trigonometric identities",
  ]),
  chapter(10, "maths", 10, "m10-heights", "Some Applications of Trigonometry", "Trigonometry", [
    "Angle of elevation",
    "Angle of depression",
    "Heights and distances problems",
  ]),
  chapter(10, "maths", 11, "m10-areas", "Areas Related to Circles", "Mensuration", [
    "Area of a sector",
    "Length of an arc",
    "Area of a segment",
  ]),
  chapter(10, "maths", 12, "m10-surface", "Surface Areas and Volumes", "Mensuration", [
    "Combination of solids",
    "Surface area of combined solids",
    "Volume of combined solids",
  ]),
  chapter(10, "maths", 13, "m10-stats", "Statistics", "Statistics and Probability", [
    "Mean of grouped data",
    "Mode of grouped data",
    "Median of grouped data",
  ]),
  chapter(10, "maths", 14, "m10-prob", "Probability", "Statistics and Probability", [
    "Classical probability",
    "Complementary events",
    "Simple problems",
  ]),
];

/** Parts of a chapter that CBSE has excluded or made internal-assessment only for this session. */
export const EXCLUDED_TOPICS: Record<string, string[]> = {
  "s10-magnetic": ["Electric motor", "Electromagnetic induction", "Electric generator"],
  "s10-heredity": ["Evolution"],
  "s10-eye": ["Colour of the Sun at sunrise and sunset"],
};

export function chaptersFor(classLevel: SchoolClass, subject: SchoolSubject): SchoolChapter[] {
  return SCHOOL_SYLLABUS.filter((c) => c.classLevel === classLevel && c.subject === subject);
}

export function schoolChapterById(id: string): SchoolChapter | undefined {
  return SCHOOL_SYLLABUS.find((c) => c.id === id);
}

export function subjectLabel(subject: SchoolSubject): string {
  return subject === "science" ? "Science" : "Maths";
}

export function subjectFromAnswers(answers?: Record<string, string>): SchoolSubject {
  const hard = (answers?.hard_subject ?? "").toLowerCase();
  return hard.includes("math") ? "maths" : "science";
}

export function classFromAnswers(answers?: Record<string, string>): SchoolClass {
  return answers?.grade === "9" ? 9 : 10;
}
