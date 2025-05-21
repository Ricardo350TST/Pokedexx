// Base URL de la API de Pokemon
const POKE_URL = 'https://pokeapi.co/api/v2/pokemon';

// Número de Pokémon por página
const limit = 20;

// Manipulación del DOM
// Seleccionamos los elementos del DOM
// Referencias a los elementos del DOM: el contenedor y los botones.
const container = document.getElementById('characters-container');

// Agregamos la variable para llevar el control de la paginación
let currentPage = 1; // Nos deja en la página actual.
let totalPages = 1; // Es el total de las páginas.

// Necesito una función asíncrona que haga una petición a la API de Rick and Morty 
// y me devuelve los personajes usando fetch Y async / await 

async function getPokemons() {
    try {
        // Calculamos desde que Pokemón comenzar a cargar los datos en una página específica.
        const offset = (currentPage - 1) * limit;

        // Solicitar los datos de la API, usando el número de la página.
        const response = await fetch (`${POKE_URL}?offset=${offset}&limit=${limit}`);

        // Lanzamos un error si la respuesta no fue satisfactoria
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        // Extraer los datos de la respuesta y almacenarlo en una variable.
        // Parsear o convertir la respuesta JSON a un objeto JavaScript
        const data = await response.json();

        // Actualizar el total de páginas disponibles
        totalPages = Math.ceil(data.count / limit); // Math.ceil (asegura tener una página extra para los Pokémon faltantes)

        // Obtener detalles individuales de cada Pokémon
        const pokemonDetalles = await Promise.all(
            // Iteramos sobre cada Pokémon para un fetch individual a su URL.
            data.results.map(async (pokemon) => {
                const res = await fetch(pokemon.url);
                return res.json()
            })
        );

        // Renderizar los Pokémon en el contenedor
         renderPokemon(pokemonDetalles);

        // Renderizar los botones de la pagina y la paginación
        renderPagination(currentPage, totalPages);

    } catch (error) {
        // En caso de un error, se muestra un mensaje en el contenedor de los Pokémon.
        container.innerHTML = ` <p> ❌ Error al obtener los Pokémon: ${error.message}</p>`;
    }
}

// Crear una función es renderizar el array de Pokémon en el contenedor HTML 
// Crear tarjetas visuales para cada Pokémon con su información en el contenedor.

function renderPokemon(pokemons) {
    // Limpiar el contenedor antes de insertar los nuevos Pokémon.
    container.innerHTML = '';

    // Agregamos el contenedor Fragment para mejorar el rendimiento del DOM
    const fragment = document.createDocumentFragment();

    // Iterar sobre cada Pokémon en el array de Pokémon.
    pokemons.forEach(pokemon => {
        // Crear un div con una clase llamada "card" para representar cada Pokémon.
        const card = document.createElement('div');   
        card.className = 'card' // Añadir la clase "card" al div

        // Guardamos en variables el recorrido de los datos a obtener.
            // Tipos
        const types = pokemon.types.map(t => t.type.name).join(', ');
            // Habilidades
        const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
            // Estadísticas básicas
        const hp = pokemon.stats.find(s => s.stat.name === 'hp')?.base_stat;
        const attack = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat;
        const defense = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat;

        // Define el contenido HTML de la tarjeta con los datos del Pokémon
        card.innerHTML = `
        <img class="character-image" src="${pokemon.sprites.front_default}" alt="${pokemon.name}"/>
        <h2>${pokemon.name}</h2>
        <p>🆔 ID: ${pokemon.id}</p>
        <p>🔥 Tipo(s): ${types}</p>
        <p>🎯 Habilidades: ${abilities}</p>
        <p>📊 Estadísticas: HP: ${hp}, Ataque: ${attack}, Defensa: ${defense}</p>
        `;

        // Agregamos la tarjeta al contenedor de los Pokémon
        fragment.appendChild(card);
    });

    // Solo un cambio real en el DOM
    container.appendChild(fragment);
}


// Función que habilita o deshabilita los botones de la paginación
function renderPagination(currentPage, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Limpiar la paginación anterior.

    // Botón anterior
    const prev = document.createElement('button');
    prev.textContent = 'Anterior';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click',() => {
        if (currentPage > 1 ) {
            loadPage(currentPage - 1);
        }
    });
    paginationContainer.appendChild(prev);

    // Mostrar números de páginas
    const maxPages = 9; 
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Ajustar si estamos al final
    if (endPage - startPage < maxPages - 1) {
        startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++){
        const pageButton = document.createElement('button');
        pageButton.textContent = i;

        // Agregar clase 'active' si es la página actual
        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            loadPage(i);
        });
        
        paginationContainer.appendChild(pageButton);
    }

    // Botón siguiente.
    const next = document.createElement('button');
    next.textContent = 'Siguiente';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadPage(currentPage + 1)
        }
    });
    paginationContainer.appendChild(next);
}

// Función para centralizar el cambio de página
function loadPage(page) {
    currentPage = page;
    getPokemons();
}

// Llamada inicial para mostrar la primera página de personajes al cargar la app
getPokemons();