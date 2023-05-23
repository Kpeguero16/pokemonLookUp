// Initialize the radar chart

IVs = [0,0,0,0,0,0];
var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['HP','Attack', 'Defense', 'Speed', 'S-Defense', 'S-Attack'],
      datasets: [{
        label: 'Dataset 1',
        data: IVs,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false, // Set display to false to hide the legend
        },
      },
      scale: {
        r: {
          angleLines: {
              display: false
          },
          suggestedMin: 0,
          suggestedMax: largestValue(IVs),
          stepSize: 10
      }
      }
    }
  });

// Searches for the pokemon the user inputted 
const fetchPokemon = () => {
  const name = document.querySelector("#pokemonName").value;
  document.querySelector("#pokemonName").value = '';
  if(name != "")
  {
    apiCall(name);
  }
  else
  {
    notFound();
  }
}

// Searches for the pokemon right before the current pokemon in the pokedex
const fetchLast = () => {
  
  const name = document.getElementById("dex_number").textContent - 1;
  if(name != NaN && name != "NaN")
  {
    apiCall(name);
  }
  else
  {
    notFound();
  }
}

// Searches for the pokemon right after the current pokemon in the pokedex
const fetchNext = () => {
  const name = document.getElementById("dex_number").textContent - 1 + 2;
  if(name != NaN && name != "NaN")
  {
    apiCall(name);
  }
  else
  {
    notFound();
  }
}

// Generates a random pokemon
const randomize = () => {
  apiCall(Math.floor(Math.random() * 1010)) + 1;
}

// Updates the pokemon information in the screen
const display = (pokemon) => {
  document.getElementById("defaultSprite").src = pokemon.defaultSprite;
  if(pokemon.shinySprite != null)
    {document.getElementById("shinySprite").src = pokemon.shinySprite;}
    else document.getElementById("shinySprite").src = "";
  document.getElementById("name_en").textContent = capitalize(pokemon.name);
  document.getElementById("dex_number").textContent = pokemon.id;
  const IVs = pokemon.stats;
  switchValues(IVs, 3,5);
  myChart.data.datasets[0].data = IVs;
  myChart.update();
}

// Makes a call to the pokeapi and generates a 'pokemon' object with all the desired attributes
function apiCall(name)
{
  const url = `https://pokeapi.co/api/v2/pokemon/${name}`
  fetch(url)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    console.log(data)

    const pokemon = {
      name: data.name,
      id: data.id, 
      defaultSprite: data.sprites['front_default'],
      shinySprite: data.sprites['front_shiny'],
      type: data.types.map((type) => type.type.name),
      stats: data.stats.map((stat) => stat['base_stat'])
    };
    console.log(pokemon)
    display(pokemon);
  })
  }

// Displays when the user accidentally presses search without writing anything in the textbox
function notFound() 
{
  document.getElementById("name_en").textContent = "Not found";
  document.getElementById("dex_number").textContent = "Text box might be empty :)";
  document.getElementById("defaultSprite").src = "not_found.png";
  document.getElementById("shinySprite").src = "not_found.png";
}


// Capitalizes the first letter of the pokemon names 
function capitalize(a) 
{
  return a.substring(0,1).toUpperCase() + a.substring(1);
}

// Returns the largest value in an array. Used to generate better looking radar charts
function largestValue(arr) {
  if (arr.length === 0) {
    // Handle empty array case
    return null;
  }
  
  return Math.max(...arr);
}

function switchValues(arr, index1, index2) {
  if (index1 < 0 || index1 >= arr.length || index2 < 0 || index2 >= arr.length) {
    console.error("Invalid indexes provided.");
    return;
  }

  // Switch values using a temporary variable
  var temp = arr[index1];
  arr[index1] = arr[index2];
  arr[index2] = temp;
}

document.querySelector("#search").addEventListener("click", fetchPokemon);
document.querySelector("#randomize").addEventListener("click", randomize);
document.querySelector("#backwards").addEventListener("click", fetchLast);
document.querySelector("#forwards").addEventListener("click", fetchNext);