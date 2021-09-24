const checkBlankInput = (value) => value === '';
const whoWonText = document.createElement('p');
whoWonText.id = '#whoWon';
// global value that holds info about the current hand.
let currentGame = null;

const recreateDivs = () => {
  document.body.innerHTML = '';
  const firstDiv = document.createElement('div');
  firstDiv.classList.add('firstDiv');
  const gameContainer = document.createElement('div');
  gameContainer.id = 'game-container';
  const buttonContainer = document.createElement('div');
  buttonContainer.id = 'button-div';
  document.body.appendChild(firstDiv);
  document.body.appendChild(gameContainer);
  document.body.appendChild(buttonContainer);
};
// DOM manipulation function that displays the player's current hand.
const runGame = function ({
  playerHand, player2Hand, player1Score, player2Score, whichPlayerWon, gameEnded,
}) {
  // manipulate DOM
  const gameContainer = document.querySelector('#game-container');
  if (whichPlayerWon !== undefined) {
    if (whichPlayerWon === 'neither') {
      whoWonText.innerHTML = 'Its a draw';
    }
    else {
      whoWonText.innerHTML = `Player ${whichPlayerWon} has won this round.`; }
  }
  const playerScoreText = document.createElement('p');
  if (player1Score !== undefined) {
    playerScoreText.innerHTML = `    Player 1 Score: ${player1Score}
    Player 2 Score: ${player2Score}`;
  }

  gameContainer.innerText = `
    Your Hand:
    ====
    ${playerHand[0].name}
    of
    ${playerHand[0].suit}
    ====
    ${playerHand[1].name}
    of
    ${playerHand[1].suit}

    Player 2 Hand:
    ====
    ${player2Hand[0].name}
    of
    ${player2Hand[0].suit}
    ====
    ${player2Hand[1].name}
    of
    ${player2Hand[1].suit}
  `;
  gameContainer.appendChild(playerScoreText);
  gameContainer.appendChild(whoWonText);
  if (gameEnded) {
    whoWonText.innerHTML += `Player ${whichPlayerWon} has won the game!`;
    const buttonContainer = document.querySelector('#button-div');
    buttonContainer.innerHTML = '';
    const restartButton = document.createElement('button');
    restartButton.innerHTML = 'Restart?';
    restartButton.addEventListener('click', renderGame);
    buttonContainer.appendChild(restartButton);
  }
};

// make a request to the server
// to change the deck. set 2 new cards into the player hand.
const dealCards = function () {
  axios.put(`/games/${currentGame.id}/deal`)
    .then((response) => {
      // get the updated hand value
      currentGame = response.data;
      // display it to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const createGame = function () {
  // Make a request to create a new game
  axios.post('/games')
    .then((response) => {
      // set the global value to the new game.
      currentGame = response.data;

      console.log(currentGame);
      // for this current game, create a button that will allow the user to
      // manipulate the deck that is on the DB.
      // Create a button for it.
      const dealBtn = document.createElement('button');
      dealBtn.id = 'dealButton';
      dealBtn.addEventListener('click', dealCards);

      // display the button
      dealBtn.innerText = 'Deal';
      const buttonContainer = document.querySelector('#button-div');
      buttonContainer.appendChild(dealBtn);
      // display it out to the user
      runGame(currentGame);
    })
    .catch((error) => {
      // handle error
      console.log(error);
    });
};

const renderGame = () => {
  recreateDivs();
  const createGameBtn = document.createElement('button');
  createGameBtn.addEventListener('click', createGame);
  createGameBtn.innerText = 'Create Game';
  const buttonContainer = document.querySelector('#button-div');
  buttonContainer.appendChild(createGameBtn);
};
const loadLogin = () => {
  recreateDivs();
  // registration
  const registrationDiv = document.createElement('div');
  const registrationLabel = document.createElement('h1');
  registrationLabel.innerHTML = 'Registration';
  const registrationEmailLabel = document.createElement('h2');
  registrationEmailLabel.innerHTML = 'Email';
  const registrationEmail = document.createElement('input');
  const registrationPassword = document.createElement('input');
  registrationEmail.classList.add('registration');
  registrationPassword.classList.add('registration');
  const registrationPasswordLabel = document.createElement('h2');
  registrationPasswordLabel.innerHTML = 'Password';
  const registrationButton = document.createElement('button');
  registrationButton.innerHTML = 'Submit';
  registrationDiv.appendChild(registrationLabel);
  registrationDiv.appendChild(registrationEmailLabel);
  registrationDiv.appendChild(registrationEmail);
  registrationDiv.appendChild(registrationPasswordLabel);
  registrationDiv.appendChild(registrationPassword);
  registrationDiv.appendChild(registrationButton);
  document.querySelector('.firstDiv').appendChild(registrationDiv);
  // login
  const loginDiv = document.createElement('div');
  const loginLabel = document.createElement('h1');
  loginLabel.innerHTML = 'Login';
  const loginEmailLabel = document.createElement('h2');
  loginEmailLabel.innerHTML = 'Email';
  const loginEmail = document.createElement('input');
  const loginPassword = document.createElement('input');
  loginEmail.classList.add('login');
  loginPassword.classList.add('login');
  const loginPasswordLabel = document.createElement('h2');
  loginPasswordLabel.innerHTML = 'Password';
  const loginButton = document.createElement('button');
  loginButton.innerHTML = 'Submit';
  loginDiv.appendChild(loginLabel);
  loginDiv.appendChild(loginEmailLabel);
  loginDiv.appendChild(loginEmail);
  loginDiv.appendChild(loginPasswordLabel);
  loginDiv.appendChild(loginPassword);
  loginDiv.appendChild(loginButton);
  document.querySelector('.firstDiv').appendChild(loginDiv);

  registrationButton.addEventListener('click', () => {
    const getData = [...document.querySelectorAll('.registration')];
    const formData = getData.map((x) => x.value);
    if (formData.some(checkBlankInput)) {
      alert('Please fill out all fields!');
      return;
    }
    const data = {
      email: formData[0],
      password: formData[1],
    };
    axios
      .post('/register', data)
      .then((response) => {
        if (response.data === 'emailExists') {
          alert('That email already exists!');
        }
        else if (response.data === 'userCreated') {
          document.querySelector('.firstDiv').remove();
          renderGame();
        }
      });
  });
  loginButton.addEventListener('click', () => {
    const getData = [...document.querySelectorAll('.login')];
    const formData = getData.map((x) => x.value);
    if (formData.some(checkBlankInput)) {
      alert('Please fill out all fields!');
      return;
    }
    const data = {
      email: formData[0],
      password: formData[1],
    };
    axios
      .post('/login', data)
      .then((response) => {
        console.log(response);
        if (response.data === 'invalidLogin') {
          alert('Please check your details!');
        }
        else if (response.data === 'loggedIn') {
          document.querySelector('.firstDiv').remove();
          renderGame();
        }
      });
  });
};

window.onload = () => {
  axios
    .get('/checkCookies')
    .then((response) => {
      if (response.data === 'renderLogin') {
        loadLogin();
      }
      else if (response.data === 'renderGame') {
        renderGame();
      }
    });
};
