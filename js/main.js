
// globally accessible data

let p1Value = '' // setting variable for value of card obtained from player 1 deck when drawn to use in comparison
let p2Value = '' // as above
let resultOfCardComparison = '' //setting variable for the result of comparing the values of cards to determine who won, populated from the compare values function which is in turn populated from fetching cards from each hand. used in other functions. 


const roundDescription = document.getElementById('roundDescription')
const p1Played = document.getElementById('p1Played')
const p2Played = document.getElementById('p2Played')
const roundOutcome = document.getElementById('roundOutcome')
const p1TotalOutput = document.getElementById('p1TotalOutput')
const p2TotalOutput = document.getElementById('p2TotalOutput')
const gameOutCome = document.getElementById('gameOutCome')


// //inital mode

const hiddenElements = document.querySelectorAll('.initStateHide')
hiddenElements.forEach((element) => element.classList.add('hidden'))
const decks = document.querySelectorAll('img.deck')
decks.forEach((img) => img.src = 'https://www.deckofcardsapi.com/static/img/back.png') // back of card image for p1 and p2 decks


function startGame() {

  fetch(`https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
    .then(res => res.json()) // parse response as JSON
    .then(data => {
      console.log(data)
      const deckId = data.deck_id;
      localStorage.setItem('deckId', data.deck_id)

      return fetch(`https://www.deckofcardsapi.com/api/deck/${deckId}/draw/?count=52`)
    })
    .then(res => res.json())
    .then(data => {
      console.log(data.cards);
      let shuffledDrawnCards = shuffle(data.cards)
      console.log(shuffledDrawnCards)

      let p1CardArray = shuffledDrawnCards.filter((item,index) => index <= 25).map(item => item.code)
      let p2CardArray = shuffledDrawnCards.filter((item,index) => index >= 26).map(item => item.code)    

      console.log(p1CardArray)
      console.log(p2CardArray)


      let p1CardString = p1CardArray.join(',')
      let p2CardString = p2CardArray.join(',')

      console.log(p1CardString)
      console.log(p2CardString)

      let p1URL = `https://www.deckofcardsapi.com/api/deck/${data.deck_id}/pile/p1Deck/add/?cards=${p1CardString}`;
      let p2URL = `https://www.deckofcardsapi.com/api/deck/${data.deck_id}/pile/p2Deck/add/?cards=${p2CardString}`

      // Fetch request to add cards to player 1's deck
      fetch(p1URL)
        .then(res => res.json())
        .then(data => {
          console.log('Player 1 data:', data);
          document.getElementById('p1TotalOutput').innerText = data.piles.p1Deck.remaining
          document.getElementById('p1Total').classList.toggle('hidden')
        })
        .catch(err => {
          console.log(`Error fetching player 1 data: ${err}`);
        });

      // Fetch request to add cards to player 2's deck
      fetch(p2URL)
        .then(res => res.json())
        .then(data => {
          console.log('Player 2 data:', data);
          document.getElementById('p2TotalOutput').innerText = data.piles.p2Deck.remaining
          document.getElementById('p2Total').classList.toggle('hidden')
        })
        .catch(err => {
          console.log(`Error fetching player 2 data: ${err}`);
        });
  
    })
    .catch(err => {
      console.log(`error ${err}`)
    });

  document.getElementById('play').classList.add('hidden')
  document.getElementById('draw').classList.toggle('hidden') // accessing play state functionality? able to click on draw button

}

function drawCard() {

  const getPilesURL = `https://www.deckofcardsapi.com/api/deck/${localStorage.getItem('deckId')}/pile/p1Deck/list/`

  fetch(getPilesURL)
  .then(res => res.json())
  .then(data => {

 
      const p1HandDrawURL =   `https://www.deckofcardsapi.com/api/deck/${localStorage.getItem('deckId')}/pile/p1Deck/draw/bottom/?count=1`
  const p2HandDrawURL = `https://www.deckofcardsapi.com/api/deck/${localStorage.getItem('deckId')}/pile/p2Deck/draw/bottom/?count=1`

  let p1value, p2value
  let p1CardName,p2CardName
  let p1CardCode,p2CardCode

  fetch(p1HandDrawURL)
    .then(res => res.json())
    .then(data => {
      console.log(data)
      p1Value = Number(cardValue(data.cards[0].value))
      p1CardName = `${data.cards[0].value} OF ${data.cards[0].suit}`
      p1CardCode = data.cards[0].code
      console.log(p1CardName)
      document.getElementById('p1Table').src = data.cards[0].image
      document.getElementById('p1Table').classList.remove('hidden')
      console.log(p1Value)
      return fetch(p2HandDrawURL)
    })
    .then(res => res.json())
    .then(data => {
      p2Value = Number(cardValue(data.cards[0].value))
      p2CardName = `${data.cards[0].value} OF ${data.cards[0].suit}`
      p2CardCode = data.cards[0].code
      document.getElementById('p2Table').src = data.cards[0].image
      document.getElementById('p2Table').classList.remove('hidden')

      resultOfCardComparison = compareValues(p1Value, p2Value)
      console.log(resultOfCardComparison)

      populatePageWithResultsOfComparisonOutCome(resultOfCardComparison, p1CardName, p2CardName)

      let URLforAddingPiles = movingCardsToWinnerPile(resultOfCardComparison, p1CardCode, p2CardCode)

      return fetch(URLforAddingPiles)
    })
    .then(res => res.json())
    .then(data => {
      console.log(data)
      let p1Remaining = data.piles.p1Deck.remaining
      let p2Remaining = data.piles.p2Deck.remaining
      console.log(p1Remaining)
      p1TotalOutput.innerText = data.piles.p1Deck.remaining
      p2TotalOutput.innerText = data.piles.p2Deck.remaining
      console.log(p1Remaining)
      console.log(p2Remaining)
      if (p1Remaining === 0 || p2Remaining === 0) {
        revealOutcome(p1Remaining,p2Remaining)
      }
    })
    .catch(err => {
      console.log(`error ${err}`)
    });


  })
  .catch(err => {
    console.log(`error ${err}`)
  });

  
  
}

// // event listeners for buttons

document.getElementById('play').addEventListener('click', startGame)
document.getElementById('draw').addEventListener('click', drawCard)
document.getElementById('playAgain').addEventListener('click', playAgain)




// //setting up piles functionality

////////////////////
// helper functions//
/////////////////////


//shuffle function

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

//convert name card to value

function cardValue(val) {
  if (val === "ACE") {
    return 14
  } else if (val === "KING") {
    return 13
  } else if (val === "QUEEN") {
    return 12
  } else if (val === "JACK") {
    return 11
  } else {
    return val
  }
}

//comparison function

function compareValues(p1, p2) {
  if (p1 > p2) {
    return 'PLAYER 1 WINS';
  } else if (p2 > p1) {
    return 'PLAYER 2 WINS';
  } else {
    return 'DRAW';
  }
}

// outcome of comparison function i.e. populating the page 

function populatePageWithResultsOfComparisonOutCome(result, p1Description, p2Description) {

  roundDescription.classList.remove('hidden')
  p1Played.innerText = `PLAYER 1 PLAYS ${p1Description}`
  p2Played.innerText = `PLAYER 2 PLAYS ${p2Description}`
  roundOutcome.innerText = result
}

function revealOutcome(p1remaining,p2remaining) {
  winnerDescription.classList.remove('hidden')
  document.getElementById('draw').classList.add('hidden')
  document.getElementById('playAgain').classList.remove('hidden')
  if (p1remaining === 0) {
    winnerDescription.innerText = 'PLAYER 2 WINS THE GAME!!!'
    document.getElementById('p1Deck').classList.add('hidden')
  } else if (p2remaining === 0) {
    winnerDescription.innerText = 'PLAYER 1 WINS THE GAME!!!'
    document.getElementById('p2Deck').classList.add('hidden')
  }
}

// conditional function for who wins - which pile gets added to

function movingCardsToWinnerPile(outcome,p1CardCode,p2CardCode) {
  let URL = ''
  
  if (outcome === 'PLAYER 1 WINS') {
    URL = `https://www.deckofcardsapi.com/api/deck/${localStorage.getItem('deckId')}/pile/p1Deck/add/?cards=${p1CardCode},${p2CardCode}`
  } else if (outcome === 'PLAYER 2 WINS') {
    URL = `https://www.deckofcardsapi.com/api/deck/${localStorage.getItem('deckId')}/pile/p2Deck/add/?cards=${p1CardCode},${p2CardCode}`
  } else if (outcome === 'DRAW') {
     ///???? trickyyy, figure out. may need to actually create the table piles at this point.
  }
  
  return URL
}

//play again - reset

function playAgain() {
  const hiddenElements = document.querySelectorAll('.initStateHide')
hiddenElements.forEach((element) => element.classList.add('hidden'))
localStorage.clear()
document.getElementById('play').classList.remove('hidden')
}





// /////////////
// //api calls//
// ////////////




// //first land

// //check for local storage deckId

// let deckId = ''

// if (!localStorage.getItem('deckId')) {
//     fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1') //getting deck and assigning local storage
//     .then(res => res.json()) // parse response as JSON
//     .then(data => {
//       console.log(data)
//       deckId = data.deck_id
//       localStorage.setItem('deckId', data.deck_id)
//     })
//     .catch(err => {
//         console.log(`error ${err}`)
//     });
// } 



// //play state - start


// //play state - draw


// //end state


// //play again functionality 



