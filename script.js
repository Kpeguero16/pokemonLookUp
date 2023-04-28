document.querySelector("#search").addEventListener("click", getPokemon);

function getPokemon(e)
{
    const name = document.querySelector("#pokemonName").value;

    fetch('https://pokeapi.co/api/v2/pokemon/' + name)
    .then((response) => response.json())
    .then((data) => {
        document.querySelector(".info").innerHTML =
        '';




        
    })
    .catch((err) => {
        console.log("Pokemon not found", err);
    });

    e.preventDefault();

}


