document.querySelector("#search").addEventListener("click", getPokemon);

function getPokemon(e)
{
    const name = document.querySelector("#pokemonName").value;

    fetch('https://pokeapi.co/api/v2/pokemon/' + name)
    .then((response) => response.json())
    .then((data) => {
        document.querySelector(".info").innerHTML = `
        <div class="pokemonImage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1008.png">
        </div>
        <div class="pokemonImage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1008.png">
        </div>
        <div class="pokemonImage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png">
        </div>
        <div class="pokemonImage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png">
        </div>
        <div class="pokemonImage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png">
        </div>
        <div class="pokemonImage">
            <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png">
        `;
    })
    .catch((err) => {
        console.log("Pokemon not found", err);
    });

    e.preventDefault();

}

var ctx = document.getElementById("myChart").getContext("2d");
var myChart = new Chart(ctx, {
  type: 'radar',
  data: {
    labels: ['HP','Attack', 'Defense', 'S-Attack', 'S-Defense'],
    datasets: [{
      label: 'Dataset 1',
      data: [126, 131, 95, 131, 98],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }]
  },
  options: {
    scale: {
      ticks: {
        beginAtZero: true
      }
    }
  }
});

