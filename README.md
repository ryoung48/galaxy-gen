# Galaxy Generator

Galaxy Generator is an application that procedurally creates a populated spiral galaxy, renders it on an interactive map, and surfaces deep lore about every generated polity, system, star, and orbit. The project pairs a rich simulation core with an interactive interface, allowing you to explore nations, trade routes, orbital ecologies, and statistical breakdowns of the newly created universe.

Generation is entirely deterministic: a single seed drives every subsystem, so the same seed will always recreate the same galaxy.

## Core Concepts

### The Galaxy
The simulation begins by scattering thousands of candidate stars across a ring-shaped region surrounding an empty galactic core. Their positions are smoothed through several rounds of Voronoi relaxation (Lloyd's algorithm) until a natural-looking distribution emerges, and systems that fall outside the habitable band are flagged as edge systems and excluded from gameplay.

Systems are then connected by hyperlanes that form a minimum spanning tree across the galaxy. These lanes are the only routes of interstellar travel, creating natural chokepoints, borders, and corridors. Systems on the galactic edge remain disconnected from the network.

### Nations and Geopolitics
Star systems are clustered into distinct nations using a distribution algorithm. Nations come in a wide range of sizes — from single-system polities all the way to sprawling empires of 200+ systems — with the vast majority being small. Each national territory is seeded outward from a homeworld capital selected at the geographic centroid of the group.

Every nation receives:
- **A unique language** — a procedurally generated conlang used to name everything within its borders.
- **A flag palette and style** — coloring styles include *dawn*, *dusk*, *dark chromatic*, and *light chromatic*.
- **A government type** — drawn from a weighted distribution including fragmented, confederation, oligarchy, republic, autocracy, theocracy, and hivemind.
- **Wars** — after all borders are established, the simulation examines border lengths between neighboring nations and probabilistically declares limited wars. Nations with longer shared borders are more likely to be at war, and each nation can only be involved in one conflict at a time.

### Language and Culture
Each nation's conlang is built from the ground up by randomizing a phoneme inventory:
- **Consonants and vowels** are selected from a pool and categorized by position (start, middle, end).
- **Diphthongs and digraphs** are derived to give the language complex sounds.
- **Stop characters** — spaces, apostrophes, or hyphens — separate syllables, each with language-specific frequency.
- **Predefined words** for articles ("the") and titles are generated from the same phonetic rules for consistency.
- **Word clusters** group related names (e.g., all star names, all system names) using shared phoneme weights, so names within the same category sound cohesive.

All names across the galaxy are guaranteed unique via a global registry.

### Stars
Stars are generated with realistic astrophysical properties derived from spectral and luminosity classifications:
- **Spectral classes** span O, B, A, F, G, K, M (main sequence), L, T, Y (brown dwarfs), D (white dwarfs), NS (neutron stars), and BH (black holes).
- **Luminosity classes** range from Ia/Ib supergiants through II bright giants, III giants, IV subgiants, V main-sequence dwarfs, and VI subdwarfs.
- **Physical properties** — mass, temperature, diameter, luminosity, and age — are interpolated from lookup tables based on spectral class and subtype.
- **Habitable zone** — each star's habitable zone center is computed from its luminosity.
- **Companions** — stars can spawn hierarchical companion systems at epistellar, inner, outer, or distant orbits. Hotter, larger stars are more likely to have companions; brown dwarfs, neutron stars, and black holes rarely or never do.
- **Proto and primordial stars** — very young stars (< 10 Myr or < 100 Myr) restrict which kinds of planets can form around them.

### Planetary Classification
Orbits are organized into five major groups — **asteroid belt**, **dwarf**, **terrestrial**, **helian**, and **jovian** — each with their own size and density calculations. Within those groups, each body receives a specific classification:

#### Dwarfs
- **Rockball** — dormant, airless worlds with surfaces unchanged since formation.
- **Snowball** — ice-and-rock worlds with potential subsurface oceans and cryovolcanism.
- **Meltball** — molten or semi-molten surfaces from extreme tidal flexing or stellar proximity.
- **Hebean** — highly active worlds with tidal flexing but regions of stability.
- **Geo-tidal** — worlds whose geological cycle is driven by tidal flexing, supporting liquid and atmosphere (subtypes: promethean, burian, atlan).
- **Geo-cyclic** — worlds that cycle slowly through a buildup, a wet clement period, and a long decline (subtypes: arean, utgardian, titanian).
- **Stygian** — melted and blasted remnants left after a star leaves the main sequence.

#### Terrestrials
- **Tectonic** — worlds with active plate tectonics and stable atmospheres; the most habitable type (subtypes: gaian, thio-gaian, chloritic-gaian, amunian, tartarian).
- **Oceanic** — worlds with deep continuous oceans from greenhouse warmth or tectonics (subtypes: pelagic, nunnic, teathic).
- **Arid** — worlds with limited surface liquid kept in equilibrium by their biosphere (subtypes: darwinian, saganian, asimovian).
- **Telluric** — worlds with runaway greenhouse atmospheres and no water at all (subtypes: phosphorian, cytherean).
- **Vesperian** — tide-locked worlds at a distance that still permits surface liquid and life.
- **Jani-lithic** — tide-locked rocky worlds that are dry and geologically active.
- **Acheronian** — dead planets scorched by their star's post-main-sequence expansion.

#### Helians & Jovians
- **Helian** —  "subgiant" worlds large enough to retain helium atmospheres, potentially with liquid surfaces.
- **Panthalassic** — massive aborted gas giants largely composed of water and hydrogen.
- **Asphodelian** — helians stripped of their atmosphere by a post-main-sequence star.
- **Jovian** — huge worlds with helium-hydrogen envelopes and compressed cores (subtypes: osirian, brammian, khonsonian, neptunian, junic, jovic, super-junic, super-jovic).
- **Chthonian** — gas giants whose atmospheres have been stripped away.

### Atmospheres
Each world's atmosphere is determined by its size, orbital zone, and type. Atmospheric codes range from vacuum (0) through breathable (thin, standard, dense) to exotic, corrosive, insidious, and gaseous helium or hydrogen envelopes. Atmospheric pressure is tracked in bars, from near-vacuum trace (< 0.001 bar) to crushing gas giant pressures (> 1000 bar).

Breathable atmospheres can be tainted by hazards including low oxygen, high oxygen, radioactivity, biological agents, sulphur compounds, particulates, and toxic gas mixes. Each hazard type dictates the survival gear inhabitants need, from simple respirators and filters to full vacc suits.

### Hydrospheres and Chemistry
Surface liquid coverage is modeled on a scale from 0 (completely dry) to 11+ (world-ocean or gas giant core). The solvent chemistry is not limited to water — planets around cooler stars or in outer orbits may have **ammonia**, **methane**, **sulfur**, or **chlorine**-based hydrospheres instead, fundamentally altering the character of any life or industry that evolves there.

### Biospheres
Life is modeled across multiple dimensions:
- **Biosphere code** (0–10) — from *sterile* through *prebiotic chemistry*, *simple microbes*, *complex microbes*, *multicellular beginnings*, *macroscopic life*, *complex ecosystems*, *social species*, *proto-sapience*, to *full sapience*. A code of 11 denotes *bio-engineered life*.
- **Biomass rating** — the sheer quantity of living matter, influenced by atmosphere, hydrosphere, temperature, and system age.
- **Biocomplexity** — how intricate and interdependent the ecosystem is.
- **Biodiversity** — the number of distinct ecological niches.
- **Compatibility** — how compatible native life is with human biochemistry, labeled as *miscible* (edible), *hybrid* (partially compatible), or *immiscible* (alien). Rare worlds have *remnant* biospheres or fully *engineered* ecosystems.

Young star systems (< 1 Gyr), hostile atmospheres, extreme temperatures, and desert conditions all suppress biological development, while temperate climates, dense atmospheres, and ocean-dominated surfaces promote it.

### Physical Properties
Every orbiting body has a detailed physical simulation:
- **Size and dimensions** — diameter in Earth-relative units, from 600 km bodies to 24,800 km super-earths, plus gas giants measured in Jupiter diameters.
- **Density and composition** — categorized from exotic ice through mostly ice, mostly rock, rock and metal, mostly metal, to compressed metal. Gas giants use separate mass/density models.
- **Gravity** — surface gravity derived from density and diameter.
- **Rotation and calendar** — day length, year length, tidal locking (to star, planet, or moon), and prograde/retrograde rotation.
- **Eccentricity and tilt** — orbital eccentricity and axial tilt, influencing seasonal temperature swings.
- **Temperature** — mean, high, and low surface temperatures derived from stellar luminosity, orbital distance, greenhouse effects, albedo, eccentricity, axial tilt, rotation speed, and geographic factors.
- **Tides** — tidal effects from the parent star, host planet, or nearby moons calculated from mass and distance relationships.
- **Seismology** — geological activity from residual formation heat, tidal stress, and tidal heating. Extreme seismic activity can reclassify a world (e.g., turning a rockball into a meltball or a hebean).
- **Moons** — satellites ranging from captured asteroids to terrestrial-class bodies and even small gas giants orbiting larger ones. Moons have their own full physical simulation including atmospheres, temperatures, biospheres, and habitability.
- **Rings** — jovian worlds (and rarely others) can have minor or complex ring systems.

### Visibility and the Night Sky
The simulation computes what the night sky looks like from the surface of any inhabited world. For every celestial body in the system — stars, planets, and moons — it calculates:
- **Angular size** in arcminutes (compared to Sol/Luna from Terra at ~30 arcminutes).
- **Apparent magnitude** using real astrophysics: absolute magnitude from luminosity for stars, reflected-light magnitude from albedo for planets.
- **Brightness descriptions** — from "overwhelming, surface-melting brilliance" to "invisible to the naked eye."
- **Size descriptions** — from "a point of light" to "fills the sky."

### Society and Progress
Inhabited worlds undergo a detailed societal simulation:
- **Population** — from uninhabited (code 0) to tens of billions (code 10), with actual population sizes randomized within each order of magnitude. World size imposes hard caps on maximum population.
- **Government** — 16 distinct types from family/clan/tribal structures, through company-run worlds, participatory and representative democracies, feudal technocracies, bureaucracies, to charismatic and non-charismatic dictatorships, religious authorities, and totalitarian oligarchies. Government type is influenced by population.
- **Law level** — from no restrictions, through light regulation of heavy weapons, to extreme surveillance states with curtailed free speech. Generated from government type.
- **Starports** — graded A through X. Class A starports have full repair and construction facilities; class X means no starport at all. Capital worlds receive large bonuses, while isolated outposts are penalized.
- **Technology level** (1–15) — influenced by starport class, world size, atmosphere, hydrosphere, population, and government type. Capital worlds inherit the maximum tech level of their nation. Worlds whose tech level falls below the minimum needed to sustain their hostile environment can suffer colony collapse — losing all population.
- **Terraforming** — advanced (TL 12+) colonies can incrementally improve a world's habitability score. Some worlds show signs of ancient terraforming even at lower tech levels.
- **Population concentration** — how geographically spread out the population is, from dispersed homesteaders to a single mega-settlement.
- **Urbanization** — what percentage of the population lives in cities, influenced by technology, government, and world conditions.
- **Cities** — major population centers are individually generated. Cities on hostile worlds can take unusual forms: sealed arcologies, floating grav-cities, subterranean settlements, mobile rail-cities, deep-ocean habitats, and orbital spin-stations.

### Economy
Each inhabited world has a fully modeled economy:
- **Importance** — how significant the world is on the galactic stage, derived from starport, population, and tech level.
- **Resources** — the raw natural wealth available for exploitation.
- **Infrastructure** — the built capacity to utilize those resources, scaled by population and importance.
- **Labor** — the available workforce (population minus one).
- **Efficiency** — how effectively the economy converts inputs to outputs, influenced by government, law level, and population concentration.
- **Resource Units (RU)** — the product of resources × infrastructure × labor × efficiency, representing total economic output.
- **GWP per capita** — gross world product per person, factoring in tech level, starport class, government type, and efficiency.
- **World Trade Number (WTN)** — a measure of the world's participation in interstellar commerce, based on population, tech level, and starport quality.
- **Inequality** — a Gini-like coefficient modeling wealth disparity, influenced by government type, law level, population concentration, and infrastructure.

### Trade and Commerce
Interstellar economics are modeled by establishing major trade corridors:
- **Route Selection** — only large nations (25+ systems) participate. Their capitals are triangulated using a Delaunay triangulation, then pruned to an Urquhart graph to keep only well-spaced connections.
- **Pathfinding** — each trade route follows the actual hyperlane network using A* pathfinding between national capitals, ensuring routes respect the galaxy's physical geography.
- **Strategic Impact** — every system along a trade route is flagged, influencing its importance, economy, and geopolitical significance.

## Exploration and Interaction

- **Interactive Cartography** — The map renders the entire galaxy on a zoomable canvas. At the macro level it displays political borders, hyperlane networks, and trade routes using the Voronoi diagram. Zooming past a threshold transitions seamlessly into a local solar-system view showing the host star, all orbiting bodies, companion stars, moons, and their orbital paths. A seeded starfield provides the background. Systems, stars, and individual orbits are all clickable.

- **The Codex** — An encyclopedic sidebar that provides a deep dive into the lore of any selected entity. Selecting a nation reveals its government, language, flag palette, systems, and any ongoing wars. Selecting a system shows its stars and orbits. Selecting a star details its spectral/luminosity classification, physical properties, companions, and orbiting bodies. Selecting an orbit reveals its full planetary profile — classification, atmosphere, hydrosphere, biosphere, temperature, rotation, moons, population, government, starport, tech level, economy, habitability, and night-sky visibility. All entities are cross-linked, so clicking a reference navigates instantly.

- **Galactic Statistics** — Chart panels summarize the galaxy across dozens of dimensions: star spectral distributions, orbit type breakdowns, biosphere levels, atmospheric compositions, population tiers, government types, technology levels, and more. The charts read directly from the generated galaxy data and can be toggled between different views.
