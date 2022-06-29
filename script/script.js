const btnSearch = document.querySelector('.search')
const btnNewSearch = document.querySelector('.newSearch')
const text = document.querySelector('.text')
const form = document.querySelector('form')
const input = document.querySelectorAll('input')
const objects = document.querySelector('.object-wrapper')
const loader = document.querySelector('.loader')
const mainContainer = document.querySelector('main')
const formWrapper = document.querySelector('.form-wrapper')

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
  input.forEach(value => value.removeAttribute("disabled", false))
  text.removeChild(text.lastChild)
})

//correction des valeurs entrées dans dateArray
function verifySearch(dateArray) {
  let verifiedArray = dateArray.map(date => date.replaceAll(' ', '-'))
  return getStartEndDates(verifiedArray)
}

//Récuperation des dates et inclusion dans l'url
function getStartEndDates(verifiedArray) {
  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${verifiedArray[0]}&end_date=${verifiedArray[1]}&api_key=DEMO_KEY`
  return loadingSpinner(url)
}

// methode fetch, et convertion de la reponse.json
const getData = url => {
  return fetch(url)
    .then(response => {
      if (response.status >= 400) {
        alert("Le nombre de jours maximal par recherche est limité à 7, veuillez reformuler votre recherche.")
      } else {
        return response.json()
      }
    })
    .then(response => {
      return data(response)
    })
    .catch(error => console.log(error))
}

async function loadingSpinner(url) {
  try {
    formWrapper.style.display = "none"
    loader.classList.add('showFlex')
    const fetch = await getData(url)
    return fetch
  } catch (err) {
    console.error(err)
  } finally {
    loader.classList.remove('showFlex')
    objects.style.display = "block"
    formWrapper.style.display = "flex"
    input.forEach(value => value.setAttribute("disabled", true))
    watchResultsSize()
    document.querySelector('.intro').style.display = "none"
    document.querySelector('.info').style.display = "none"
  }
}

// ajout à la div.text du nombre d'éléments puis renvois un tableau d'info sur les differents near earth objects
function data(response) {
  let dataArray = response
  text.innerHTML += `<p>Nombre d'asteroides : ${dataArray.element_count}</p>`
  let nearEarthObj = Object.entries(dataArray.near_earth_objects)
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

          //Formater la date au format FR
          let date = datas.close_approach_data[0].close_approach_date_full
          let month = date.substring(5,8)
          switch (month) {
            case 'Jan':
              month = 'Janvier'
              break
            case 'Feb':
              month = 'Février'
              break
            case 'Mar':
              month = 'Mars'
              break
            case 'Apr':
              month = 'Avril'
              break
            case 'May':
              month = 'Mai'
              break
            case 'Jun':
              month = 'Juin'
              break
            case 'Jul':
              month = 'Juillet'
              break
            case 'Aug':
              month = 'Aout'
              break 
            case 'Sep':
              month = 'Septembre'
              break
            case 'Oct':
              month = 'Octobre'
              break
            case 'Nov':
              month = 'Novembre'
              break
            case 'Dec':
              month = 'Decembre'
              break
            default: console.log(month)
          }
          let dateFormat = date.substring(9,11) + "/" + month + "/" + date.substring(0,4) + " à " + date.substring(12) + " H"
          newDiv.innerHTML += `<p>Au plus proche de la Terre le : ${dateFormat}</p>`
          newDiv.innerHTML += `<p> À : ${Math.ceil(datas.close_approach_data[0].miss_distance.kilometers).toLocaleString()} kilomètres de distance</p>`
          newDiv.style.padding = "20px"
          objects.appendChild(newDiv)
          formWrapper.style.alignSelf = "flex-start"
          mainContainer.style.justifyContent = "space-around"
          if (objects.childElementCount > 0) {
          formWrapper.classList.add('positionSticky')
          }
        })
      }
    })
  }
}

function watchResultsSize() {
  if (window.innerWidth <= 1028 && objects.childElementCount > 0) {
    mainContainer.style.flexDirection = "column"
    formWrapper.style.marginTop = "20px"
    formWrapper.classList.remove('positionSticky')
    formWrapper.style.alignSelf = ''
  } else if (objects.childElementCount !== 0) {
    mainContainer.style.flexDirection = "row"
    formWrapper.classList.remove('positionRelative')
    formWrapper.classList.add('positionSticky')
    formWrapper.style.alignSelf = "flex-start"
  }
}

window.addEventListener('resize', watchResultsSize)
// appeler watchResultsSize au moment de la création des résultats