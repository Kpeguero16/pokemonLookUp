const fetchPokemon = () => {
  const name = document.querySelector("#pokemonName").value;
  document.querySelector("#pokemonName").value = '';
  if(name != "")
  {
  const url = `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`
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
      type: data.types.map((type) => type.type.name)
    };
    console.log(pokemon)
    display(pokemon);
  })
  }
  else
  {
    notFound();
  }
}


const display = (pokemon) => {
  document.getElementById("defaultSprite").src = pokemon.defaultSprite;
  if(pokemon.shinySprite != null)
    {document.getElementById("shinySprite").src = pokemon.shinySprite;}
    else document.getElementById("shinySprite").src = "";
  document.getElementById("name_en").textContent = capitalize(pokemon.name);
  document.getElementById("name_jp").textContent = pokemon.id;
}

document.querySelector("#search").addEventListener("click", fetchPokemon);

const IVs =[];
//Initializes the radar chart 
var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['HP','Attack', 'Defense', 'S-Attack', 'S-Defense', 'Speed'],
      datasets: [{
        label: 'Dataset 1',
        data: IVs,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scale: {
        r: {
          angleLines: {
              display: false
          },
          suggestedMin: 50,
          suggestedMax: 110,
          stepSize: 10
      }
      }
    }
  });

function notFound() 
{
  document.getElementById("name_en").textContent = "Not found";
  document.getElementById("name_jp").textContent = "Text box might be empty :)";
  document.getElementById("defaultSprite").src = "not_found.png";
  document.getElementById("shinySprite").src = "not_found.png";
}

function capitalize(a) 
{
  return a.substring(0,1).toUpperCase() + a.substring(1);
}
