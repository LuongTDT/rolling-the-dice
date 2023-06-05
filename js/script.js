"use strict";

const defaultDiceImagePath = "images/dice-5.png";
const defaultScore = 0;
const maxRollingTimes = 3;
let activePlayer, destinationScore, isTheGameCompleted, rollingTimes, nameOfPlayer1, nameOfPlayer2;
const modal = document.querySelector(".modal");
const overlay = document.querySelector(".overlay");
const newButtonEl = document.querySelector(".btn--new");
const rollButtonEl = document.querySelector(".btn--roll");
const holdButtonEl = document.querySelector(".btn--hold");
const CloseModelButtonEl = document.querySelector(".close-modal");
const openModalButtonEl = document.querySelector(".show-modal");
const players = [
    {
        id: 0,
        name: "Cocarius",
        currentScore: defaultScore,
        score: defaultScore,
        displayScores: function () {
            document.querySelector(`#score--${this.id}`).textContent = this.score;
            document.querySelector(`#current--${this.id}`).textContent = this.currentScore;
        },
    },
    {
        id: 1,
        name: "Miasisme",
        currentScore: defaultScore,
        score: defaultScore,
        displayScores: function () {
            document.querySelector(`#score--${this.id}`).textContent = this.score;
            document.querySelector(`#current--${this.id}`).textContent = this.currentScore;
        },
    },
];
const displayMessage = function (message) {
    if (message) {
        document.querySelector(".message").textContent = message;
    }
};
const changeDiceImage = function (imageSrc) {
    document.querySelector(".dice").setAttribute("src", imageSrc);
};
const displayScores = function () {
    players.forEach(player => {
        player.displayScores();
    });
};
const getActivePlayer = function (player) {
    activePlayer = player;
    const activeClassName = "player--active";
    document.querySelectorAll(".player").forEach(el => {
        if (el.classList.contains(activeClassName)) {
            el.classList.remove(activeClassName);
        }
    });
    document.querySelector(`.player--${activePlayer.id}`).classList.add(activeClassName);
    displayMessage(`${activePlayer.name}'s turn...`);
};

const getDestinationScore = function () {
    return Number(document.querySelector("#destination").value);
};
const openModal = function () {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
};

const getInformationPlayersFromModal = function () {
    let message, newPlayer1, newPlayer2;
    const contentModalEl = document.querySelector(".content-modal");
    const newDestinationScrore = getDestinationScore();
    newPlayer1 = document.querySelector("input[name = 'first']").value;
    newPlayer2 = document.querySelector("input[name = 'second']").value;
    const validPlayerNames = newPlayer1 !== "" && newPlayer2 !== "";
    // console.log("validPlayerNames", validPlayerNames);
    const isPlayerChanged = newPlayer1 != nameOfPlayer1 || newPlayer2 != nameOfPlayer2;
    const isDestinationScoreChanged = destinationScore != newDestinationScrore;

    if (!newDestinationScrore || !validPlayerNames) {
        message = "Please Enter all valid information before close the Modal!";
    } else if (isDestinationScoreChanged || isPlayerChanged) {
        destinationScore = newDestinationScrore;
        nameOfPlayer1 = newPlayer1;
        nameOfPlayer2 = newPlayer2;
        init();
    }
    // inform the update failed messsage to modal.
    if (message) {
        contentModalEl.textContent = message;
        contentModalEl.setAttribute("style", "color: red;");
        return false;
    }

    return true;
};

const closeModal = function () {
    if (!getInformationPlayersFromModal()) {
        return false;
    }
    const contentModalEl = document.querySelector(".content-modal");
    contentModalEl.removeAttribute("style");
    contentModalEl.textContent = "Hope you have a greate day! Thank you.";
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
};
const init = function () {
    //get destination score from modal.
    if (!getDestinationScore()) {
        openModal();
    }
    destinationScore = getDestinationScore();
    activePlayer = players[0];
    isTheGameCompleted = false;
    rollingTimes = 0;
    players[0].name = nameOfPlayer1 ? nameOfPlayer1 : players[0].name;
    players[1].name = nameOfPlayer2 ? nameOfPlayer2 : players[1].name;
    //set destination score
    document.querySelector(".destination-score").textContent = destinationScore;
    //reset all score data to default
    players.forEach(player => {
        player.score = defaultScore;
        player.currentScore = defaultScore;
    });
    //remove old players html if any
    document.querySelectorAll(".player").forEach(el => {
        el.remove();
    });
    //genegrating html el form players array
    const mainElement = document.querySelector("main");
    for (let index = players.length - 1; index >= 0; index--) {
        const player = players[index];
        const sectionElement = document.createElement("section");
        const classForSection =
            player.id === activePlayer.id
                ? `player player--${player.id} player--active`
                : `player player--${player.id}`;
        sectionElement.setAttribute("class", classForSection);
        const playerNameElement = document.createElement("h2");
        playerNameElement.setAttribute("class", "name");
        playerNameElement.setAttribute("id", `name--${player.id}`);
        playerNameElement.textContent = player.name;
        const scoreElement = document.createElement("p");
        scoreElement.setAttribute("class", "score");
        scoreElement.setAttribute("id", `score--${player.id}`);
        scoreElement.textContent = player.score;
        const currentScoreWrapper = document.createElement("div");
        currentScoreWrapper.setAttribute("class", "current");
        const currentScoreLabel = document.createElement("p");
        currentScoreLabel.setAttribute("class", "current-label");
        currentScoreLabel.textContent = "Current";
        const currentScoreElement = document.createElement("p");
        currentScoreElement.setAttribute("class", "current-score");
        currentScoreElement.setAttribute("id", `current--${player.id}`);
        currentScoreElement.textContent = player.currentScore;
        //
        sectionElement.append(playerNameElement);
        sectionElement.append(scoreElement);
        currentScoreWrapper.append(currentScoreLabel);
        currentScoreWrapper.append(currentScoreElement);
        sectionElement.append(currentScoreWrapper);
        mainElement.prepend(sectionElement);
    }
    displayMessage(`${activePlayer.name}'s turn...`);
    changeDiceImage(defaultDiceImagePath);
};

init();

const switchPlayer = function () {
    const numberOfPlayers = players.length;
    for (let index = 0; index < numberOfPlayers; index++) {
        if (players[index].name === activePlayer.name) {
            index = index === numberOfPlayers - 1 ? 0 : index + 1;
            getActivePlayer(players[index]);
            break;
        }
    }
};

const canRoll = function () {
    let canRoll = true;
    //check does anyone win yet?
    if (hasWinner()) {
        canRoll = false;
    } else if (rollingTimes++ >= maxRollingTimes) {
        //check how many time was player roll the dice?
        holdCurrentScore();
        canRoll = false;
    }
    return canRoll;
};

const rollRandomdice = function () {
    if (canRoll()) {
        //return random number 1 to 6
        const diceNumber = Math.trunc(Math.random() * 6) + 1;
        //generate the dice image base on 1 to 6
        const diceImagePath = `images/dice-${diceNumber}.png`;
        changeDiceImage(diceImagePath);
        activePlayer.currentScore = diceNumber;
        displayScores();
        displayMessage(`${activePlayer.name} Rolled ${rollingTimes} times.`);
    }
};

const hasWinner = function () {
    const reachedDestinationScore = activePlayer.score >= destinationScore;
    let message = isTheGameCompleted
        ? "The game was completed. Please press NEW GAME button to play again!"
        : "";
    if (!message && reachedDestinationScore) {
        document.querySelector(`.player--${activePlayer.id}`).classList.add("player--winner");
        activePlayer.score = destinationScore;
        displayScores();
        message = `Congratulations ! 🏆, ${activePlayer.name}`;
        isTheGameCompleted = true;
    }
    displayMessage(message);
    return reachedDestinationScore;
};
const holdCurrentScore = function () {
    //checck does anyone win yet?
    if (hasWinner()) return;
    if (!activePlayer.currentScore) {
        return displayMessage("Please ROLL the dice before click HOLD!");
    }
    activePlayer.score += activePlayer.currentScore;
    if (hasWinner()) return;
    displayScores();
    activePlayer.currentScore = defaultScore;
    rollingTimes = 0;
    switchPlayer();
};

newButtonEl.addEventListener("click", init);
rollButtonEl.addEventListener("click", rollRandomdice);
holdButtonEl.addEventListener("click", holdCurrentScore);
openModalButtonEl.addEventListener("click", openModal);
CloseModelButtonEl.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
    }
    if (e.key === "Enter") {
        console.log("you have just pressed enter key!");
    }
});

// window.addEventListener("pageshow", e => {
//     console.log(e);
//     let r = confirm("You pressed a Back button! Are you sure?!");
//     // alert("do you want reset the GAME?");
// });
