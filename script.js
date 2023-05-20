document.querySelector("#search").addEventListener("click", getPokemon);



var ctx = document.getElementById("myChart").getContext("2d");
  var myChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['HP','Attack', 'Defense', 'S-Attack', 'S-Defense', 'Speed'],
      datasets: [{
        label: 'Dataset 1',
        data: [78, 85, 78, 109, 85, 100],
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

function getPokemon(e)
{
  const name = document.querySelector("#pokemonName").value;
  document.querySelector("#pokemonName").value = '';
  if(name != "")
  {
    getDefaultSprite(name.toLowerCase()).then(spriteUrl => {
      document.getElementById("defaultSprite").src = spriteUrl;
    })

    getShinySprite(name.toLowerCase()).then(spriteUrl => {
      document.getElementById("shinySprite").src = spriteUrl;
    })
  }
  else
  {
    notFound();
  }

  

  // document.querySelector(".info").innerHTML =
  // `
  // <div class="pokemonImage">
  //   <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/395.png">
  // </div>
  // <div>
  //   <canvas id="myChart"></canvas>
  // </div>
  // <div class="pokemonImage">
  //   <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/395.png">
  // </div>
  // `;
  
  

}

async function getDefaultSprite(a) {
  // const name = document.querySelector("#pokemonName").value;
  try {
    console.log("https://pokeapi.co/api/v2/pokemon/"+ a)
    const response = await fetch("https://pokeapi.co/api/v2/pokemon/"+ a);
    const data = await response.json();
    const spriteUrl = data.sprites.front_default;
    console.log(spriteUrl);
    return spriteUrl;
  } catch (error) {
    console.log('Error:', error);
    notFound();
  }
}

async function getShinySprite(a) {
  // const name = document.querySelector("#pokemonName").value;
  try {
    console.log("https://pokeapi.co/api/v2/pokemon/"+ a)
    const response = await fetch("https://pokeapi.co/api/v2/pokemon/"+ a);
    const data = await response.json();
    const spriteUrl = data.sprites.front_shiny;
    console.log(spriteUrl);
    return spriteUrl;
  } catch (error) {
    console.log('Error:', error);
    notFound();
  }
}

function notFound() 
{
  document.getElementById("name_en").textContent = "Not found";
  document.getElementById("name_jp").textContent = "Text box might be empty :)";
  document.getElementById("defaultSprite").src = "not_found.png";
  document.getElementById("shinySprite").src = "not_found.png";
}