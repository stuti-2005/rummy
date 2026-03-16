let playerName = "";   //things that can chnage can be let 
const opponentName = "Computer";
let opponentScore = 0;
let playerScore = 0;
let selectedPlayerCardIndex = null;
let drawnCard = null;
let hasDrawn = false;
let isDrawPileFaceUp = false;

let deck = [];
let playerHand = [];
let computerHand = [];
let discardPile = [];

// const objs = {};
// function CreateCards(){
//     objs.deck = [];
//     objs.playerHand = [];a
//     objs.computerHand = [];
//     objs.discardPile = [];
// }

const suits = ['H','D', 'C', 'S'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
// map ranks to vallues 
const rankValues = {'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
                    '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13};

// DOM elements
const playerHandDiv = document.querySelector("#player-hand");
const computerHandDiv = document.querySelector("#computer-hand");
const drawPileDiv = document.querySelector("#draw-pile");
const discardPileDiv = document.querySelector("#discard-pile");


function getCardImagePath(card) {
    return `cards/cards/${card.suit}${card.rank}.png`;
}

// shuffles deck
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// creating deck of cards
function createDeck() {
    deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({suit, rank});
        });
    });
    deck = shuffle(deck);
}


// deal cards to both player and computer
function dealCards() {
    playerHand = deck.splice(0, 13);
    computerHand = deck.splice(0,13);
}

// asks player for name 
function askPlayerName() {
    playerName = prompt("Enter your name:");
    if (!playerName || playerName.trim() === "") {
        playerName = "Player";
    }

    const playerNameElement = document.querySelector("#player-name");
    if (playerNameElement) {
        playerNameElement.textContent = playerName;
    }
}


function startGame() {
    askPlayerName();
    createDeck();
    dealCards();
    selectedPlayerCardIndex = null;
    isDrawPileFaceUp = false;
    discardPile.push(deck.shift());
    renderHands();
    renderDrawPile();
    renderDiscardPile();
}

// checking for sets 
function checkSets(hand) {
    const rankMap = {};

    hand.forEach(card => {
        if (!rankMap[card.rank]) {
            rankMap[card.rank] = [];
        }
        rankMap[card.rank].push(card);
    });
    return Object.values(rankMap).filter(group => group.length >= 3);
}

// checking for runs 
function checkRuns(hand) {
    const suitMap = {};

    hand.forEach(card => {
        if (!suitMap[card.suit]) {
            suitMap[card.suit] = [];
        }
        suitMap[card.suit].push(card);
    });

    let sequences = [];

    for (const suit in suitMap) {
        const cards = suitMap[suit];

        const sorted = cards.sort(
            (a, b) => rankValues[a.rank] - rankValues[b.rank]
        );

        let temp = [sorted[0]];

        for (let i = 1; i < sorted.length; i++) {
            const currentRank = rankValues[sorted[i].rank];
            const prevRank = rankValues[sorted[i - 1].rank];

            if (currentRank === prevRank + 1) {
                temp.push(sorted[i]);
            } else {
                if (temp.length >= 3) sequences.push(temp);
                temp = [sorted[i]];
            }
        }

        if (temp.length >= 3) sequences.push(temp);
    }

    return sequences;
}

// checking for win condition
function checkWin(hand) {
    const sets = checkSets(hand);
    const runs = checkRuns(hand);
    let totalCards = sets.flat().length + runs.flat().length;
    return totalCards >= 7;
}  

function renderHands() {
    playerHandDiv.innerHTML = "";
    computerHandDiv.innerHTML = "";
 
    playerHand.forEach((card, index) => {
        const img = document.createElement("img");
        img.src = getCardImagePath(card);
        img.dataset.index = index;
        if (index === selectedPlayerCardIndex) img.classList.add("selected");
        img.addEventListener("click", () => {
            selectedPlayerCardIndex = index;
            renderHands();
        });
        playerHandDiv.append(img);
    });
 
    computerHand.forEach(() => {
        const img = document.createElement("img");
        img.src = "cards/cards/back.png";
        computerHandDiv.append(img);
    });
}

function renderDrawPile() {
    drawPileDiv.innerHTML = "";
    if (deck.length > 0) {
        const img = document.createElement("img");
        img.src = isDrawPileFaceUp && drawnCard ? getCardImagePath(drawnCard) : "cards/cards/back.png";
        drawPileDiv.append(img);
    }
}

function renderDiscardPile() {
    discardPileDiv.innerHTML = "";
    if (discardPile.length > 0) {
        const img = document.createElement("img");
        img.src = "cards/cards/back.png";
        discardPileDiv.append(img);
    }
}

// event listeners for draw and discard buttons
// draws card from deck
document.querySelector("#draw-card").addEventListener("click", () => {

    if (hasDrawn) {
        alert("You must discard first!");
        return;
    }

    if (deck.length === 0) {
        alert("Deck is empty!");
        return;
    }

    drawnCard = deck.shift();
    playerHand.push(drawnCard);
    selectedPlayerCardIndex = playerHand.length - 1;
    hasDrawn = true;
    isDrawPileFaceUp = true;

    renderHands();
    renderDrawPile();
});


document.querySelector("#discard-card").addEventListener("click", () => {
    if (!hasdrawn) {
        alert("Please draw a card first!");
        return;
    }
    const selected = document.querySelector("#player-hand img.selected");
    if (!selected) {
        alert("Please select a card to discard!");
        return;
    }

    const cardIndex = parseInt(selected.dataset.index);
    const discardedCard = playerHand.splice(cardIndex, 1)[0];
    discardPile.push(discardedCard);
    selectedPlayerCardIndex = null;
    hasDrawn = false;
    isDrawPileFaceUp = false;
    renderHands();
    renderDrawPile();
    renderDiscardPile();
});





startGame();
