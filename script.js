const API_BASE = "https://pokeapi.co/api/v2/";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const pokemonGrid = document.getElementById("pokemonGrid");
const pokemonCount = document.getElementById("pokemonCount");
const message = document.getElementById("message");

const pokemonDetails = document.getElementById("pokemonDetails");
const pokemonDetailsContent = document.getElementById("pokemonDetailsContent");
const backButton = document.getElementById("backButton");

console.log("PokéMoon JavaScript is working!");

async function getPokemonList() {
    try {
        message.textContent = "Loading Pokémon...";

        const response = await fetch(
            `${API_BASE}pokemon?limit=20&offset=0`
        );

        if (!response.ok) {
            throw new Error("Could not load Pokémon list.");
        }

        const data = await response.json();

        const pokemonDetailsList = await Promise.all(
            data.results.map(pokemon => getPokemon(pokemon.name))
        );

        displayPokemon(pokemonDetailsList);

        pokemonCount.textContent =
            `${pokemonDetailsList.length} Pokémon loaded`;

        message.textContent = "";

    } catch (error) {
        console.error("Error loading Pokémon:", error);

        message.textContent =
            "Something went wrong while loading Pokémon.";
    }
}

async function getPokemon(name) {
    const response = await fetch(
        `${API_BASE}pokemon/${name}`
    );

    if (!response.ok) {
        throw new Error(`Could not find Pokémon: ${name}`);
    }

    return await response.json();
}

async function getPokemonSpecies(name) {
    const response = await fetch(
        `${API_BASE}pokemon-species/${name}`
    );

    if (!response.ok) {
        throw new Error(`Could not load species data for ${name}`);
    }

    return await response.json();
}

function displayPokemon(pokemonList) {
    pokemonGrid.innerHTML = "";

    pokemonList.forEach(pokemon => {

        const card = document.createElement("article");

        card.className = "pokemon-card";

        card.innerHTML = `
            <div class="pokemon-image">

                <img
                    src="${pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}"
                    alt="${pokemon.name}"
                >

            </div>

            <div class="pokemon-info">

                <p class="pokemon-number">
                    #${String(pokemon.id).padStart(3, "0")}
                </p>

                <h3 class="pokemon-name">
                    ${pokemon.name}
                </h3>

                <div class="pokemon-types">

                    ${pokemon.types.map(type => `
                        <span class="type-badge">
                            ${type.type.name}
                        </span>
                    `).join("")}

                </div>

            </div>
        `;

        pokemonGrid.appendChild(card);

        card.addEventListener("click", () => {
            showPokemonDetails(pokemon);
        });
    });
}

async function showPokemonDetails(pokemon) {

    try {

        pokemonGrid.style.display = "none";

        pokemonDetails.style.display = "block";

        pokemonCount.textContent = "";

        message.textContent = "Loading Pokémon details...";

        const species = await getPokemonSpecies(pokemon.name);

        const descriptionEntry =
            species.flavor_text_entries.find(entry => {
                return entry.language.name === "en";
            });

        const description = descriptionEntry
            ? descriptionEntry.flavor_text
                .replace(/\f/g, " ")
                .replace(/\n/g, " ")
            : "No description available.";

        const generation = species.generation
            ? species.generation.name
                .replace("generation-", "Generation ")
                .toUpperCase()
            : "Unknown";

        const abilities = pokemon.abilities
            .map(ability => {
                return ability.ability.name;
            })
            .join(", ");

        const types = pokemon.types
            .map(type => {
                return type.type.name;
            })
            .join(", ");

        const stats = pokemon.stats
            .map(stat => {
                return `
                    <div class="detail-stat">

                        <span>
                            ${stat.stat.name}
                        </span>

                        <strong>
                            ${stat.base_stat}
                        </strong>

                    </div>
                `;
            })
            .join("");

        pokemonDetailsContent.innerHTML = `
            <div class="detail-image">

                <img
                    src="${pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default}"
                    alt="${pokemon.name}"
                >

            </div>

            <div class="detail-info">

                <p class="detail-number">
                    #${String(pokemon.id).padStart(3, "0")}
                </p>

                <h2 class="detail-name">
                    ${pokemon.name}
                </h2>

                <div class="detail-types">

                    ${pokemon.types.map(type => `
                        <span class="type-badge">
                            ${type.type.name}
                        </span>
                    `).join("")}

                </div>

                <div class="detail-section">

                    <h3>
                        Description
                    </h3>

                    <p>
                        ${description}
                    </p>

                </div>

                <div class="detail-section">

                    <h3>
                        Information
                    </h3>

                    <p>
                        <strong>Type:</strong>
                        ${types}
                    </p>

                    <p>
                        <strong>Abilities:</strong>
                        ${abilities}
                    </p>

                    <p>
                        <strong>Generation:</strong>
                        ${generation}
                    </p>

                    <p>
                        <strong>Height:</strong>
                        ${pokemon.height / 10} m
                    </p>

                    <p>
                        <strong>Weight:</strong>
                        ${pokemon.weight / 10} kg
                    </p>

                </div>

                <div class="detail-section">

                    <h3>
                        Base Stats
                    </h3>

                    <div class="detail-stats">

                        ${stats}

                    </div>

                </div>

            </div>
        `;

        message.textContent = "";

        pokemonDetails.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Error loading Pokémon details:",
            error
        );

        message.textContent =
            "Could not load Pokémon details.";
    }
}

async function searchPokemon() {

    const searchValue =
        searchInput.value.trim().toLowerCase();

    if (searchValue === "") {

        message.textContent =
            "Please enter a Pokémon name.";

        return;
    }

    try {

        message.textContent = "Searching...";

        pokemonGrid.innerHTML = "";

        pokemonDetails.style.display = "none";

        pokemonGrid.style.display = "grid";

        const pokemon =
            await getPokemon(searchValue);

        displayPokemon([pokemon]);

        pokemonCount.textContent =
            "1 Pokémon found";

        message.textContent = "";

    } catch (error) {

        console.error("Search error:", error);

        pokemonGrid.innerHTML = "";

        pokemonCount.textContent = "";

        message.textContent =
            "Pokémon not found. Please check the name and try again.";
    }
}

searchButton.addEventListener(
    "click",
    searchPokemon
);

searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            searchPokemon();
        }

    }
);

backButton.addEventListener(
    "click",
    () => {

        pokemonDetails.style.display = "none";

        pokemonGrid.style.display = "grid";

        pokemonCount.textContent =
            "Explore the collection";

        message.textContent = "";

        document
            .getElementById("pokemon")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);

getPokemonList();