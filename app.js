
const suits = ['H','D', 'C', 'S'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let computerHand = [];
let discardPile = [];

// map ranks to vallues 
const rankValues = {'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13};

// creatinf deck of cards
function createDeck() {
    deck = [];
    suits.forEach(suit => {
        ranks.forEach(rank => {
            deck.push({suit, rank});
        });
    });
    deck = shuffle(deck);
}

// shuffle the deck of cards
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// deal cards to player and computer
function dealCards() {
    playerHand = deck.splice(0, 7);
    computerHand = deck.splice(0,7);
}

// draw  a card from the deck
function drawCard(hand) {
    if (deck.length === 0) return null;
        const card = deck.shift();
        hand.push(card);
        return card;
}

// checking for sets and runs 
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


const playerHandDiv = document.getElementById("player-hand");
const computerHandDiv = document.getElementById("computer-hand");
const drawPileDiv = document.getElementById("draw-pile");
const discardPileDiv = document.getElementById("discard-pile");

function renderHands() {
    playerHandDiv.innerHTML = "";
    computerHandDiv.innerHTML = "";

    playerHand.forEach(card => {
        const img = document.createElement("img");
        img.src = `cards/${card.suit}${card.rank}.png`;
        playerHandDiv.appendChild(img);
    });

    computerHand.forEach(() => {
        const img = document.createElement("img");
        img.src = "cards/back.png";
        computerHandDiv.appendChild(img);
    });
}

function startGame() {
    createDeck();
    dealCards();
    discardPile.push(deck.shift());
    renderHands();
}

startGame();

