/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Card Deck Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

// get a random index from an array given it's size
const getRandomIndex = function (size) {
  return Math.floor(Math.random() * size);
};

// cards is an array of card objects
const shuffleCards = function (cards) {
  let currentIndex = 0;

  // loop over the entire cards array
  while (currentIndex < cards.length) {
    // select a random position from the deck
    const randomIndex = getRandomIndex(cards.length);

    // get the current card in the loop
    const currentItem = cards[currentIndex];

    // get the random card
    const randomItem = cards[randomIndex];

    // swap the current card and the random card
    cards[currentIndex] = randomItem;
    cards[randomIndex] = currentItem;

    currentIndex += 1;
  }

  // give back the shuffled deck
  return cards;
};

const makeDeck = function () {
  // create the empty deck at the beginning
  const deck = [];

  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];

  let suitIndex = 0;
  while (suitIndex < suits.length) {
    // make a variable of the current suit
    const currentSuit = suits[suitIndex];

    // loop to create all cards in this suit
    // rank 1-13
    let rankCounter = 1;
    while (rankCounter <= 13) {
      let cardName = rankCounter;

      // 1, 11, 12 ,13
      if (cardName === 1) {
        cardName = 'ace';
      } else if (cardName === 11) {
        cardName = 'jack';
      } else if (cardName === 12) {
        cardName = 'queen';
      } else if (cardName === 13) {
        cardName = 'king';
      }

      // make a single card object variable
      const card = {
        name: cardName,
        suit: currentSuit,
        rank: rankCounter,
      };

      // add the card to the deck
      deck.push(card);

      rankCounter += 1;
    }
    suitIndex += 1;
  }

  return deck;
};

/*
 * ========================================================
 * ========================================================
 * ========================================================
 * ========================================================
 *
 *                  Controller Functions
 *
 * ========================================================
 * ========================================================
 * ========================================================
 */

export default function initGamesController(db) {
  // render the main page
  const index = (request, response) => {
    response.render('games/index');
  };

  // create a new game. Insert a new row in the DB.
  const create = async (request, response) => {
    // deal out a new shuffled deck for this game.
    const cardDeck = shuffleCards(makeDeck());
    const playerHand = [cardDeck.pop(), cardDeck.pop()];
    const player2Hand = [cardDeck.pop(), cardDeck.pop()];
    const player1Score = 0;
    const player2Score = 0;
    const player1 = await db.User.findOne({
      where: {
        id: request.cookies.id,
      },
    });

    const players = await db.User.findAll();
    console.log(players);

    let randomID = 0;
    let diffPlayer = false;
    while (!diffPlayer) {
      randomID = Math.floor(Math.random() * players.length) + 1;
      if (randomID !== request.cookies.id) {
        diffPlayer = true;
      }
    }
    const player2 = await db.User.findOne({
      where: {
        id: randomID,
      },
    });

    const newGame = {
      gameState: {
        cardDeck,
        playerHand,
        player2Hand,
        player1Score,
        player2Score,
        player1,
        player2,
      },
    };

    try {
      // run the DB INSERT query
      const game = await db.Game.create(newGame);
      console.log(game);
      // send the new game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        player2Hand: game.gameState.player2Hand,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // deal two new cards from the deck.
  const deal = async (request, response) => {
    try {
      // get the game by the ID passed in the request
      const game = await db.Game.findByPk(request.params.id);
      console.log(game);
      // make changes to the object
      const playerHand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];
      const player2Hand = [game.gameState.cardDeck.pop(), game.gameState.cardDeck.pop()];

      let { player1Score } = game.gameState;
      let { player2Score } = game.gameState;
      let player1HighCard = 0;
      playerHand.forEach((card) => {
        if (card.rank > player1HighCard) {
          player1HighCard = card.rank;
        }
      });

      // make changes to the object
      let player2HighCard = 0;
      player2Hand.forEach((card) => {
        if (card.rank > player2HighCard) {
          player2HighCard = card.rank;
        }
      });
      let whichPlayerWon = '';
      if (player1HighCard > player2HighCard) {
        whichPlayerWon = '1';
        player1Score += 1;
      }
      else if (player2HighCard > player1HighCard) {
        whichPlayerWon = '2';
        player2Score += 1;
      }
      else {
        whichPlayerWon = 'neither';
      }

      let gameEnded = false;
      if (player1Score === 3) {
        gameEnded = true;
        const winnerID = game.gameState.player1.id;
        console.log(winnerID);
        await game.update({
          winner_id: winnerID,
        });
      }
      else if (player2Score === 3) {
        gameEnded = true;
        const winnerID = game.gameState.player2.id;
        console.log(winnerID);
        await game.update({
          winner_id: winnerID,
        });
      }
      else {
      // update the game with the new info
        await game.update({
          gameState: {
            cardDeck: game.gameState.cardDeck,
            playerHand,
            player2Hand,
            player1Score,
            player2Score,
            player1: game.gameState.player1,
            player2: game.gameState.player2,
          },

        });
      }

      // send the updated game back to the user.
      // dont include the deck so the user can't cheat
      response.send({
        id: game.id,
        playerHand: game.gameState.playerHand,
        player2Hand: game.gameState.player2Hand,
        player1Score,
        player2Score,
        whichPlayerWon,
        gameEnded,
      });
    } catch (error) {
      response.status(500).send(error);
    }
  };

  // return all functions we define in an object
  // refer to the routes file above to see this used
  return {
    deal,
    create,
    index,
  };
}
