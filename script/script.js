const btnSearch = document.querySelector('.search')
const btnNewSearch = document.querySelector('.newSearch')
const text = document.querySelector('.text')
const form = document.querySelector('form')
const input = document.querySelectorAll('input')
const objects = document.querySelector('.object-wrapper')
const loader = document.querySelector('.loader')

form.addEventListener('submit', () => {
  event.preventDefault()
})

//créer regex pour avoir un format de date obligatoire DD/MM/YYYY puis faire un if (input.value === regex)

// Stockage du lapse de temps, date de début et fin de la recherche
btnSearch.addEventListener('click',() => {
  let dateArray = [input[0].value, input[1].value]
  while (objects.childElementCount > 0) {
    objects.removeChild(objects.lastChild)
  }
  btnNewSearch.style.display = "block"
  btnSearch.style.display = "none"
  return verifySearch(dateArray)
})

btnNewSearch.addEventListener('click', () => {
  btnNewSearch.style.display = "none"
  btnSearch.style.display = "block"
  input.forEach(input => input.value = "")
  text.removeChild(text.lastChild)
})

//correction des valeurs entrées dans dateArray
function verifySearch(dateArray) {
  let verifiedArray = dateArray.map(date => date.replaceAll(' ', '-'))
  console.log(verifiedArray)
  return getStartEndDates(verifiedArray)
}

//Récuperation des dates et inclusion dans l'url
function getStartEndDates(verifiedArray) {
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${verifiedArray[0]}&end_date=${verifiedArray[1]}&api_key=DEMO_KEY`
  console.log(url)
  return loadingSpinner(url)
}

// methode fetch, et convertion de la reponse.json
const getData = url => {
  return fetch(url)
    .then(response => {
      return response.json()
    })
    .then(response => {
      return data(response)
    })
    .catch(error => console.log(error))
}

async function loadingSpinner(url) {
  try {
    loader.classList.add('showFlex')
    console.log('OK')
    const fetch = await getData(url)
    return fetch
  } catch (err) {
    console.error(err)
  } finally {
    loader.classList.remove('showFlex')
    objects.style.display = "block"
  }
}

// ajout à la div.text du nombre d'éléments puis renvois un tableau d'info sur les differents near earth objects
function data(response) {
  let dataArray = response
  text.innerHTML += `<p>Nombre d'asteroides : ${dataArray.element_count}</p>`
  let nearEarthObj = Object.entries(dataArray.near_earth_objects)
  console.log(nearEarthObj)
  return arrayNearEarthObj(nearEarthObj)
}

function arrayNearEarthObj(data) {
  data.reverse()
  for (let i = 0; i < data.length; i++) {
    data[i].forEach(index => {
      if (typeof index !== "string") {
        index.forEach(datas => {
          let newDiv = document.createElement('div')
          newDiv.classList.add('object')
          newDiv.innerHTML += `<p>Identifiant : ${datas.id}</p>`
          newDiv.innerHTML += `<p>Nom : ${datas.name}</p>`
          newDiv.innerHTML += `<p>Entre ${Math.ceil(datas.estimated_diameter.meters.estimated_diameter_min)} et ${Math.ceil(datas.estimated_diameter.meters.estimated_diameter_max)} mètres de diamètre</p>`
          newDiv.innerHTML += `<p>Au plus proche de la Terre le : ${datas.close_approach_data[0].close_approach_date_full} H</p>`
          newDiv.innerHTML += `<p> À : ${Math.ceil(datas.close_approach_data[0].miss_distance.kilometers)} kilomètres de distance</p>`
          newDiv.style.padding = "20px"
          objects.appendChild(newDiv)
          document.querySelector('.form-wrapper').style.alignSelf = "flex-start"
          document.querySelector('main').style.justifyContent = "space-around"
        })
      }
    })
  }
}