import type { RawQuestion } from "./bank-types";

export const SCIENCE_QUESTIONS_EXTRA: Record<string, RawQuestion[]> = {
  "s9-exploration": [
    ["easy", "Noting that a candle flame is yellow at the top is an example of:", "An observation", ["An inference", "A hypothesis", "A law"], "It is something directly seen using the senses, with no explanation added."],
    ["medium", "In an experiment on plant growth, keeping soil type and pot size the same makes them:", "Controlled variables", ["Independent variables", "Dependent variables", "Results"], "Variables kept constant so they do not affect the outcome are controlled variables."],
    ["medium", "Repeating an experiment several times mainly helps to:", "Make the results more reliable", ["Change the hypothesis", "Avoid recording data", "Remove the need for controls"], "Repeated trials reduce the effect of random errors."],
    ["hard", "A globe is used to explain day and night. In science, the globe is best described as a:", "Model", ["Theory", "Law", "Variable"], "A model is a simplified representation used to explain or predict real phenomena."],
  ],
  "s9-cell": [
    ["easy", "Which organelle controls all activities of the cell?", "Nucleus", ["Vacuole", "Cell wall", "Ribosome"], "The nucleus contains DNA, which directs cell activities."],
    ["easy", "Protein synthesis takes place on:", "Ribosomes", ["Lysosomes", "Vacuoles", "Plastids"], "Ribosomes are the sites where amino acids are joined to make proteins."],
    ["medium", "Which organelle is known as the 'suicide bag' of the cell?", "Lysosome", ["Golgi apparatus", "Mitochondrion", "Centrosome"], "Lysosomes contain digestive enzymes that can break down the cell's own parts."],
    ["hard", "When a plant cell is placed in a strong salt solution, its cytoplasm shrinks away from the cell wall. This is called:", "Plasmolysis", ["Endosmosis", "Diffusion", "Turgidity"], "Water leaves the cell by exosmosis, making the protoplasm contract."],
  ],
  "s9-tissues": [
    ["easy", "Blood is an example of which type of tissue?", "Connective tissue", ["Epithelial tissue", "Muscular tissue", "Nervous tissue"], "Blood has cells in a liquid matrix (plasma), which is typical of connective tissue."],
    ["medium", "Which plant tissue gives flexibility to stems and leaf stalks?", "Collenchyma", ["Sclerenchyma", "Xylem", "Meristem"], "Collenchyma cells have unevenly thickened walls that provide support with flexibility."],
    ["medium", "The tissue that covers and protects body surfaces and lines organs is:", "Epithelial tissue", ["Nervous tissue", "Adipose tissue", "Cartilage"], "Epithelium forms protective coverings and linings."],
    ["hard", "Cardiac muscle is different from skeletal muscle because cardiac muscle is:", "Involuntary and does not tire easily", ["Voluntary", "Unbranched and multinucleate", "Found attached to bones"], "Heart muscle contracts rhythmically throughout life without conscious control."],
  ],
  "s9-motion": [
    ["easy", "A body covers equal distances in equal intervals of time. Its motion is:", "Uniform motion", ["Non-uniform motion", "Accelerated motion", "Circular motion only"], "Equal distances in equal times means constant speed."],
    ["medium", "The second equation of motion is:", "s = ut + ½at²", ["v = u + at", "v² = u² + 2as", "s = vt²"], "It gives displacement in terms of initial velocity, acceleration and time."],
    ["medium", "A bus slows from 20 m/s to 10 m/s in 5 s. Its acceleration is:", "−2 m/s²", ["2 m/s²", "−10 m/s²", "6 m/s²"], "a = (10 − 20)/5 = −2 m/s²; negative means it is slowing down (retardation)."],
    ["hard", "A car starting from rest accelerates at 2 m/s² for 10 s. The distance covered is:", "100 m", ["20 m", "200 m", "50 m"], "s = ut + ½at² = 0 + ½ × 2 × 10² = 100 m."],
  ],
  "s9-mixtures": [
    ["easy", "Which method is used to separate cream from milk?", "Centrifugation", ["Distillation", "Chromatography", "Sublimation"], "Spinning fast makes the lighter cream separate from the heavier liquid."],
    ["easy", "A solution in which no more solute can dissolve at a given temperature is:", "Saturated", ["Unsaturated", "Dilute", "Colloidal"], "At saturation, extra solute stays undissolved."],
    ["medium", "Which of these is a suspension?", "Chalk powder in water", ["Sugar in water", "Air", "Brass"], "Suspension particles are large, visible and settle down on standing."],
    ["hard", "Two miscible liquids with boiling points 56 °C and 100 °C are best separated by:", "Distillation", ["Separating funnel", "Filtration", "Crystallisation"], "The large difference in boiling points lets the lower-boiling liquid vaporise first."],
  ],
  "s9-forces": [
    ["easy", "The product of mass and velocity is called:", "Momentum", ["Force", "Acceleration", "Inertia"], "p = mv; its SI unit is kg·m/s."],
    ["medium", "A heavier object has more inertia because inertia depends on:", "Mass", ["Speed", "Shape", "Colour"], "Mass is the measure of inertia."],
    ["medium", "The momentum of a 5 kg ball moving at 4 m/s is:", "20 kg·m/s", ["1.25 kg·m/s", "9 kg·m/s", "80 kg·m/s"], "p = mv = 5 × 4 = 20 kg·m/s."],
    ["hard", "A cricket player pulls their hands back while catching a fast ball to:", "Increase the time of impact and reduce the force", ["Increase the force on the hands", "Increase the ball's momentum", "Stop the ball faster"], "Force = change in momentum ÷ time, so more time means less force."],
  ],
  "s9-work": [
    ["easy", "The SI unit of work is the:", "Joule", ["Watt", "Newton", "Pascal"], "1 J = 1 N × 1 m."],
    ["medium", "A force of 20 N moves a box 3 m in the direction of the force. The work done is:", "60 J", ["6.7 J", "23 J", "17 J"], "W = F × s = 20 × 3 = 60 J."],
    ["medium", "When a stretched rubber band is released, its potential energy changes into:", "Kinetic energy", ["Chemical energy", "Nuclear energy", "Light energy only"], "Stored elastic energy becomes energy of motion."],
    ["hard", "A person carries a heavy bag while walking on level ground at constant speed. The work done by the person against gravity is:", "Zero", ["Maximum", "Negative", "Equal to the weight"], "The upward force is perpendicular to the horizontal displacement, so no work is done against gravity."],
  ],
  "s9-atom": [
    ["easy", "J.J. Thomson's model of the atom is often compared to a:", "Christmas pudding / watermelon", ["Solar system", "Hollow sphere", "Cloud only"], "He imagined electrons embedded in a positive sphere."],
    ["medium", "The atomic number of an element tells us the number of:", "Protons", ["Neutrons", "Nucleons", "Shells"], "Atomic number (Z) = number of protons."],
    ["medium", "An atom has 8 protons and 8 neutrons. Its mass number is:", "16", ["8", "24", "0"], "Mass number = protons + neutrons = 16."],
    ["hard", "The electronic configuration of chlorine (atomic number 17) is:", "2, 8, 7", ["2, 7, 8", "2, 8, 8", "8, 2, 7"], "Fill K (2), L (8), then the remaining 7 in M."],
  ],
  "s9-matter": [
    ["easy", "The law of conservation of mass was given by:", "Antoine Lavoisier", ["John Dalton", "Joseph Proust", "J.J. Thomson"], "Lavoisier showed mass is neither created nor destroyed in a chemical reaction."],
    ["medium", "The formula of sodium chloride is NaCl because sodium and chlorine both have a valency of:", "1", ["2", "3", "0"], "Equal valencies of 1 combine in a 1:1 ratio."],
    ["medium", "The formula unit mass of NaCl (Na = 23 u, Cl = 35.5 u) is:", "58.5 u", ["12.5 u", "46 u", "71 u"], "23 + 35.5 = 58.5 u."],
    ["hard", "Which of these is a polyatomic ion?", "Sulphate (SO₄²⁻)", ["Chloride (Cl⁻)", "Sodium (Na⁺)", "Oxide (O²⁻)"], "A polyatomic ion is a charged group of more than one atom."],
  ],
  "s9-sound": [
    ["easy", "The loudness of sound depends on its:", "Amplitude", ["Frequency", "Wavelength", "Time period"], "Larger amplitude means a louder sound."],
    ["medium", "Bats find their way in the dark using:", "Ultrasound (echolocation)", ["Infrasound", "Light waves", "Radio waves"], "They emit ultrasound and detect the echoes from obstacles."],
    ["medium", "The time period of a wave with frequency 50 Hz is:", "0.02 s", ["50 s", "0.5 s", "2 s"], "T = 1/f = 1/50 = 0.02 s."],
    ["hard", "Sound travels fastest in:", "Solids", ["Liquids", "Gases", "Vacuum"], "Particles in solids are closely packed, so vibrations pass on quickly."],
  ],
  "s9-reproduction": [
    ["easy", "Potato plants are commonly grown from:", "Stem tubers", ["Seeds only", "Leaves", "Spores"], "The potato is a modified underground stem with buds ('eyes')."],
    ["medium", "The female part of a flower is the:", "Pistil (carpel)", ["Stamen", "Sepal", "Anther"], "The pistil has the stigma, style and ovary."],
    ["medium", "Transfer of pollen to the stigma of a different flower of the same species is:", "Cross-pollination", ["Self-pollination", "Fertilisation", "Germination"], "Cross-pollination brings in variation."],
    ["hard", "Which part of a seed grows into the root of a new plant?", "Radicle", ["Plumule", "Cotyledon", "Seed coat"], "The radicle forms the root; the plumule forms the shoot."],
  ],
  "s9-diversity": [
    ["easy", "Fungi are different from plants because fungi:", "Cannot make their own food", ["Have chlorophyll", "Always live in water", "Are prokaryotes"], "Fungi are heterotrophs; they absorb food from their surroundings."],
    ["medium", "Animals with a backbone are called:", "Vertebrates", ["Invertebrates", "Protists", "Bryophytes"], "Vertebrates have a vertebral column."],
    ["medium", "Plants without flowers or seeds that have roots, stems and leaves (like ferns) are:", "Pteridophytes", ["Bryophytes", "Gymnosperms", "Angiosperms"], "Pteridophytes have vascular tissue but reproduce by spores."],
    ["hard", "The correct way of writing the scientific name of the mango is:", "Mangifera indica", ["mangifera Indica", "Mangifera Indica", "MANGIFERA INDICA"], "Genus starts with a capital letter, species with a small letter, and the name is written in italics."],
  ],
  "s9-earth": [
    ["easy", "The part of the Earth where life exists is the:", "Biosphere", ["Lithosphere only", "Exosphere", "Core"], "The biosphere includes all living things in air, water and land."],
    ["medium", "At night, a breeze blowing from the land to the sea is a:", "Land breeze", ["Sea breeze", "Loo", "Cyclone"], "Land cools faster at night, so cooler air moves towards the warmer sea."],
    ["medium", "Which process returns water vapour to the air from leaves?", "Transpiration", ["Condensation", "Precipitation", "Infiltration"], "Plants release water vapour through stomata."],
    ["hard", "Bacteria in the root nodules of pea plants help in:", "Nitrogen fixation", ["Photosynthesis", "Ozone formation", "Carbon storage in rocks"], "Rhizobium converts atmospheric nitrogen into compounds plants can use."],
  ],

  "s10-reactions": [
    ["easy", "The balanced form of H₂ + O₂ → H₂O is:", "2H₂ + O₂ → 2H₂O", ["H₂ + O₂ → H₂O₂", "H₂ + 2O₂ → 2H₂O", "2H₂ + 2O₂ → 2H₂O"], "Balancing gives 4 H and 2 O atoms on both sides."],
    ["medium", "Na₂SO₄ + BaCl₂ → BaSO₄ + 2NaCl is a:", "Double displacement reaction", ["Combination reaction", "Decomposition reaction", "Redox reaction only"], "The ions exchange partners; white BaSO₄ precipitates."],
    ["medium", "Silver chloride turns grey in sunlight. This is a:", "Photolytic decomposition", ["Thermal decomposition", "Combination reaction", "Neutralisation"], "Light breaks AgCl into silver and chlorine."],
    ["hard", "Respiration is considered an exothermic process because:", "Energy is released when glucose is oxidised", ["Energy is absorbed from sunlight", "Oxygen is produced", "It happens only in plants"], "Glucose + oxygen → CO₂ + water + energy."],
  ],
  "s10-acids": [
    ["easy", "Which gas is released when an acid reacts with a metal like zinc?", "Hydrogen", ["Oxygen", "Carbon dioxide", "Chlorine"], "Zn + H₂SO₄ → ZnSO₄ + H₂."],
    ["medium", "An antacid used to relieve acidity in the stomach is usually a:", "Mild base", ["Strong acid", "Salt of a strong acid", "Neutral oxide"], "A mild base like milk of magnesia neutralises excess stomach acid."],
    ["medium", "A solution turns phenolphthalein pink. The solution is:", "Basic", ["Acidic", "Neutral", "Salty only"], "Phenolphthalein is colourless in acid and pink in base."],
    ["hard", "Bleaching powder is prepared by passing chlorine gas over:", "Dry slaked lime, Ca(OH)₂", ["Limestone, CaCO₃", "Quicklime in water", "Washing soda"], "Ca(OH)₂ + Cl₂ → CaOCl₂ + H₂O."],
  ],
  "s10-metals": [
    ["easy", "The property of metals to be drawn into wires is:", "Ductility", ["Malleability", "Sonority", "Lustre"], "Gold and silver are the most ductile metals."],
    ["medium", "Which non-metal is a good conductor of electricity?", "Graphite", ["Sulphur", "Iodine", "Diamond"], "Graphite has free electrons between its layers."],
    ["medium", "An alloy of copper and zinc is:", "Brass", ["Bronze", "Solder", "Steel"], "Bronze is copper and tin; solder is lead and tin."],
    ["hard", "Which metal will NOT displace hydrogen from dilute hydrochloric acid?", "Copper", ["Zinc", "Magnesium", "Iron"], "Copper is below hydrogen in the reactivity series."],
  ],
  "s10-carbon": [
    ["easy", "The IUPAC name of CH₃OH is:", "Methanol", ["Ethanol", "Methanal", "Methane"], "One carbon (meth-) with an –OH group (-ol)."],
    ["medium", "Alkenes contain at least one:", "Carbon–carbon double bond", ["Carbon–carbon triple bond", "–OH group", "Benzene ring"], "Alkenes are unsaturated hydrocarbons with C=C."],
    ["medium", "The next member after ethane (C₂H₆) in the alkane series is:", "Propane (C₃H₈)", ["Ethene (C₂H₄)", "Butane (C₄H₁₀)", "Methane (CH₄)"], "Each member adds one CH₂ unit."],
    ["hard", "Ethanoic acid reacts with sodium hydrogencarbonate to produce:", "Carbon dioxide gas", ["Hydrogen gas", "Oxygen gas", "Chlorine gas"], "Acid + hydrogencarbonate → salt + water + CO₂ (brisk effervescence)."],
  ],
  "s10-periodic": [
    ["easy", "How many groups are there in the modern periodic table?", "18", ["7", "8", "10"], "There are 18 vertical groups and 7 horizontal periods."],
    ["medium", "Going down a group, metallic character generally:", "Increases", ["Decreases", "Stays the same", "Becomes zero"], "Valence electrons are farther from the nucleus and lost more easily."],
    ["hard", "An element with electronic configuration 2, 8, 2 belongs to:", "Group 2, Period 3", ["Group 3, Period 2", "Group 2, Period 2", "Group 12, Period 3"], "2 valence electrons → group 2; 3 shells → period 3 (it is magnesium)."],
  ],
  "s10-life": [
    ["easy", "Which pigment is needed for photosynthesis?", "Chlorophyll", ["Haemoglobin", "Melanin", "Insulin"], "Chlorophyll absorbs light energy."],
    ["medium", "Bile juice helps in digestion by:", "Emulsifying fats", ["Digesting proteins", "Killing all bacteria", "Absorbing water"], "Bile breaks large fat globules into smaller ones for enzymes to act on."],
    ["medium", "The tiny pores on leaves for exchange of gases are:", "Stomata", ["Lenticels", "Xylem vessels", "Root hairs"], "Guard cells open and close the stomata."],
    ["hard", "Human heart has four chambers mainly to:", "Keep oxygenated and deoxygenated blood separate", ["Pump only deoxygenated blood", "Store food", "Produce red blood cells"], "Separation makes oxygen supply efficient for warm-blooded animals."],
  ],
  "s10-control": [
    ["easy", "The gap between two neurons is called a:", "Synapse", ["Dendrite", "Axon", "Neuromuscular plate"], "Chemical signals cross the synapse to the next neuron."],
    ["medium", "Which part of the brain controls involuntary actions like heartbeat and breathing?", "Medulla", ["Cerebrum", "Cerebellum", "Pons only"], "The medulla in the hindbrain controls many involuntary functions."],
    ["medium", "The bending of a shoot towards light is called:", "Phototropism", ["Geotropism", "Hydrotropism", "Chemotropism"], "Auxin moves to the shaded side and makes it grow faster."],
    ["hard", "Adrenaline is called the 'emergency hormone' because it:", "Prepares the body for fight or flight", ["Lowers blood sugar", "Controls growth in children", "Regulates sleep only"], "It increases heart rate and supplies more oxygen to muscles."],
  ],
  "s10-repro": [
    ["easy", "Rhizopus (bread mould) reproduces by:", "Spore formation", ["Budding", "Binary fission", "Regeneration"], "Sporangia release spores that grow into new hyphae."],
    ["medium", "Planaria can grow a complete body from a cut piece. This is:", "Regeneration", ["Fragmentation only", "Budding", "Spore formation"], "Specialised cells rebuild the missing parts."],
    ["medium", "In humans, the male gametes are produced in the:", "Testes", ["Ovaries", "Prostate gland", "Seminal vesicle"], "Testes produce sperms and testosterone."],
    ["hard", "Asexual reproduction produces offspring that are:", "Almost identical to the parent", ["Always very different from the parent", "Formed by fusion of gametes", "Never viable"], "Only one parent is involved, so variation is very small."],
  ],
  "s10-heredity": [
    ["easy", "Units of heredity that pass traits from parents to offspring are:", "Genes", ["Ribosomes", "Hormones", "Enzymes"], "Genes are sections of DNA on chromosomes."],
    ["medium", "In a cross between pure tall (TT) and pure short (tt) pea plants, the F1 plants are:", "All tall", ["All short", "Half tall, half short", "Medium height"], "All F1 plants are Tt and tallness is dominant."],
    ["medium", "Human males have the sex chromosomes:", "XY", ["XX", "YY", "XO"], "Females are XX."],
    ["hard", "In a dihybrid cross (round-yellow × wrinkled-green), the F2 phenotypic ratio is:", "9 : 3 : 3 : 1", ["3 : 1", "1 : 2 : 1", "1 : 1 : 1 : 1"], "The two traits are inherited independently."],
  ],
  "s10-light": [
    ["easy", "The angle of incidence equals the angle of reflection. This is the:", "Law of reflection", ["Snell's law", "Law of refraction", "Ohm's law"], "Both angles are measured from the normal."],
    ["medium", "A convex mirror is used as a rear-view mirror because it gives:", "An erect, diminished image with a wide field of view", ["A real, enlarged image", "An inverted image", "No image"], "It shows a larger area behind the vehicle."],
    ["medium", "A ray of light passing through the optical centre of a lens:", "Goes straight without deviation", ["Bends towards the principal axis", "Reflects back", "Passes through the focus"], "Near the optical centre the lens acts like a thin parallel glass slab."],
    ["hard", "An object 10 cm tall forms an image 5 cm tall in a mirror. The magnification is:", "0.5", ["2", "50", "15"], "m = image height ÷ object height = 5/10 = 0.5."],
  ],
  "s10-eye": [
    ["easy", "The part of the eye that controls the size of the pupil is the:", "Iris", ["Retina", "Cornea", "Lens"], "The iris adjusts the pupil to control how much light enters."],
    ["medium", "Hypermetropia (far-sightedness) is corrected using a:", "Convex lens", ["Concave lens", "Cylindrical lens", "Plane mirror"], "A converging lens helps focus nearby objects on the retina."],
    ["medium", "A rainbow is formed due to:", "Dispersion, refraction and internal reflection in water droplets", ["Scattering by dust only", "Reflection from clouds", "Absorption of light"], "Water droplets act like tiny prisms."],
    ["hard", "The least distance of distinct vision for a normal young adult is about:", "25 cm", ["2.5 cm", "1 m", "Infinity"], "This is the near point of a normal eye."],
  ],
  "s10-electricity": [
    ["easy", "The SI unit of potential difference is the:", "Volt", ["Ampere", "Ohm", "Coulomb"], "1 V = 1 J/C."],
    ["medium", "Two 4 Ω resistors are joined in series. The equivalent resistance is:", "8 Ω", ["2 Ω", "4 Ω", "16 Ω"], "Series: R = R₁ + R₂ = 4 + 4 = 8 Ω."],
    ["medium", "The power of a device using 2 A at 220 V is:", "440 W", ["110 W", "222 W", "880 W"], "P = VI = 220 × 2 = 440 W."],
    ["hard", "Household appliances are connected in parallel mainly because:", "Each gets the full voltage and can be switched independently", ["It increases total resistance", "It uses less wire only", "Current is the same in all"], "In parallel, voltage is the same across each branch."],
  ],
  "s10-magnetic": [
    ["easy", "A compass needle near a current-carrying wire deflects. This shows that a current produces a:", "Magnetic field", ["Electric charge", "Light wave", "Sound wave"], "Oersted discovered that electric current produces a magnetic field."],
    ["medium", "The direction of magnetic field around a straight current-carrying wire is given by the:", "Right-hand thumb rule", ["Fleming's left-hand rule", "Lenz's law", "Ohm's law"], "Thumb along current, curled fingers show the field direction."],
    ["medium", "The strength of the magnetic field of a solenoid increases if we:", "Increase the number of turns", ["Decrease the current", "Remove the iron core", "Use a shorter wire with fewer turns"], "More turns and more current give a stronger field."],
    ["hard", "In domestic wiring, the earth wire is usually:", "Green", ["Red", "Black", "Blue only"], "Live is red/brown, neutral is black/blue, and earth is green."],
  ],
  "s10-environment": [
    ["easy", "Organisms that break down dead plants and animals are:", "Decomposers", ["Producers", "Herbivores", "Carnivores"], "Bacteria and fungi return nutrients to the soil."],
    ["medium", "In the food chain grass → deer → lion, the lion is a:", "Secondary consumer", ["Producer", "Primary consumer", "Decomposer"], "The lion eats the herbivore (primary consumer), so it is a secondary consumer."],
    ["medium", "If producers capture 10,000 J of energy, about how much reaches the herbivores?", "1,000 J", ["100 J", "10,000 J", "5,000 J"], "By the 10% law, only about 10% passes to the next level."],
    ["hard", "Using kulhads (clay cups) instead of plastic cups is better for the environment because clay is:", "Biodegradable", ["Non-biodegradable", "A source of CFCs", "Radioactive"], "Clay breaks down naturally, unlike plastic."],
  ],
};

export const SCIENCE_CARDS_EXTRA: Record<string, [string, string][]> = {
  "s9-cell": [["Ribosome", "Site of protein synthesis"], ["Nucleus", "Control centre containing DNA"]],
  "s9-motion": [["s = ut + ½at²", "Second equation of motion"], ["v² = u² + 2as", "Third equation of motion"]],
  "s9-forces": [["Momentum", "p = mv (kg·m/s)"]],
  "s9-sound": [["Time period", "T = 1/f"]],
  "s10-light": [["Magnification", "m = h′/h = −v/u (mirror)"]],
  "s10-electricity": [["Electric power", "P = VI = I²R = V²/R"]],
  "s10-heredity": [["9 : 3 : 3 : 1", "F2 ratio of a dihybrid cross"]],
};
