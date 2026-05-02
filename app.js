let playerName = "";
const opponentName = "Computer";

let selectedPlayerCardIndex = null;
let drawnCard = null;
let hasDrawn = false;
let isDrawPileFaceUp = false;

let deck = [];
let playerHand = [];
let computerHand = [];
let discardPile = [];

const suits = ['H','D','C','S'];
const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

const rankValues = {
    'A':1,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,
    '8':8,'9':9,'10':10,'J':11,'Q':12,'K':13
};

const playerHandDiv = document.querySelector("#player-hand");
const computerHandDiv = document.querySelector("#computer-hand");
const drawPileDiv = document.querySelector("#draw-pile");
const discardPileDiv = document.querySelector("#discard-pile");
const setsBox = document.querySelector("#sets");
const runsBox = document.querySelector("#runs");

function getCardImagePath(card){
    return `cards/cards/${card.suit}${card.rank}.png`;
}

function shuffle(array){
    return array.sort(()=>Math.random()-0.5);
}

function createDeck(){
    deck = [];
    suits.forEach(s=>{
        ranks.forEach(r=>{
            deck.push({suit:s, rank:r});
        });
    });
    deck = shuffle(deck);
}

function dealCards(){
    playerHand = deck.splice(0,13);
    computerHand = deck.splice(0,13);
}

function askPlayerName(){
    playerName = prompt("Enter your name:") || "Player";
    document.querySelector("#player-name").textContent = playerName;
}

function startGame(){
    askPlayerName();
    createDeck();
    dealCards();
    discardPile.push(deck.shift());
    renderHands();
    renderDrawPile();
    renderDiscardPile();
}

function checkSets(hand){
    const map = {};
    hand.forEach(c=>{
        if(!map[c.rank]) map[c.rank]=[];
        map[c.rank].push(c);
    });
    return Object.values(map).filter(g=>g.length>=3);
}

function checkRuns(hand){
    const suitMap = {};
    hand.forEach(c=>{
        if(!suitMap[c.suit]) suitMap[c.suit]=[];
        suitMap[c.suit].push(c);
    });

    let sequences = [];

    for(const suit in suitMap){
        const sorted = [...suitMap[suit]].sort(
            (a,b)=>rankValues[a.rank]-rankValues[b.rank]
        );

        let temp=[sorted[0]];

        for(let i=1;i<sorted.length;i++){
            const curr = rankValues[sorted[i].rank];
            const prev = rankValues[sorted[i-1].rank];

            if(curr===prev+1){
                temp.push(sorted[i]);
            } else {
                if(temp.length>=3) sequences.push(temp);
                temp=[sorted[i]];
            }
        }

        if(temp.length>=3) sequences.push(temp);
    }

    return sequences;
}

function renderHands(){
    playerHandDiv.innerHTML="";
    computerHandDiv.innerHTML="";

    playerHand.forEach((card,index)=>{
        const img=document.createElement("img");
        img.src=getCardImagePath(card);
        img.dataset.index=index;
        img.draggable=true;

        img.addEventListener("dragstart",(e)=>{
            e.dataTransfer.setData("cardIndex", index);
        });

        img.addEventListener("click",()=>{
            selectedPlayerCardIndex=index;
            renderHands();
        });

        if(index===selectedPlayerCardIndex){
            img.classList.add("selected");
        }

        playerHandDiv.append(img);
    });

    computerHand.forEach(()=>{
        const img=document.createElement("img");
        img.src="cards/cards/back.png";
        computerHandDiv.append(img);
    });
}

function moveCardToZone(zone,index){
    const card = playerHand.splice(index,1)[0];

    const img=document.createElement("img");
    img.src=getCardImagePath(card);
    img.dataset.rank=card.rank;
    img.dataset.suit=card.suit;
    img.draggable=true;

    img.addEventListener("dragstart",(e)=>{
        e.dataTransfer.setData("fromZone","zone");
        e.dataTransfer.setData("rank",card.rank);
        e.dataTransfer.setData("suit",card.suit);
    });

    zone.appendChild(img);
    renderHands();
}

function sortRunZone(zone){
    const cards = getCardsFromZone(zone);

    const sorted=[...cards].sort(
        (a,b)=>rankValues[a.rank]-rankValues[b.rank]
    );

    zone.innerHTML="";

    sorted.forEach(card=>{
        const img=document.createElement("img");
        img.src=getCardImagePath(card);
        img.dataset.rank=card.rank;
        img.dataset.suit=card.suit;
        img.draggable=true;

        img.addEventListener("dragstart",(e)=>{
            e.dataTransfer.setData("fromZone","zone");
            e.dataTransfer.setData("rank",card.rank);
            e.dataTransfer.setData("suit",card.suit);
        });

        zone.appendChild(img);
    });
}

function validateZone(zone){
    const cards=getCardsFromZone(zone);
    zone.classList.remove("valid","invalid");

    if(cards.length<3){
        zone.classList.add("invalid");
        return;
    }

    let result = zone.id==="sets"
        ? checkSets(cards)
        : checkRuns(cards);

    const total=result.flat().length;

    if(result.length>0 && total===cards.length){
        zone.classList.add("valid");
    } else {
        zone.classList.add("invalid");
    }
}

function setupDropZone(zone){
    zone.addEventListener("dragover",(e)=>e.preventDefault());

    zone.addEventListener("drop",(e)=>{
        e.preventDefault();

        const index=parseInt(e.dataTransfer.getData("cardIndex"));

        const count=zone.querySelectorAll("img").length;

        if(zone.id==="sets" && count>=4){
            alert("Max 4 cards in a set");
            return;
        }

        moveCardToZone(zone,index);

        if(zone.id==="runs"){
            sortRunZone(zone);
        }

        validateZone(zone);
    });
}

function setupHandDrop(){
    playerHandDiv.addEventListener("dragover",(e)=>e.preventDefault());

    playerHandDiv.addEventListener("drop",(e)=>{
        e.preventDefault();

        const fromZone=e.dataTransfer.getData("fromZone");

        if(fromZone==="zone"){
            const rank=e.dataTransfer.getData("rank");
            const suit=e.dataTransfer.getData("suit");

            const el=[...document.querySelectorAll(".drop-zone img")]
                .find(img=>img.dataset.rank===rank && img.dataset.suit===suit);

            if(el) el.remove();

            playerHand.push({rank,suit});
            renderHands();

            sortRunZone(runsBox);
            validateZone(runsBox);
            validateZone(setsBox);
        }
    });
}

function getCardsFromZone(zone){
    return [...zone.querySelectorAll("img")].map(img=>({
        rank:img.dataset.rank,
        suit:img.dataset.suit
    }));
}

document.querySelector("#draw-card").addEventListener("click",()=>{
    if(hasDrawn) return alert("Discard first!");
    if(deck.length===0) return alert("Deck empty!");

    drawnCard=deck.shift();
    playerHand.push(drawnCard);
    hasDrawn=true;

    renderHands();
});

document.querySelector("#discard-card").addEventListener("click",()=>{
    if(!hasDrawn) return alert("Draw first!");

    const selected=document.querySelector(".selected");
    if(!selected) return alert("Select a card!");

    const i=parseInt(selected.dataset.index);
    discardPile.push(playerHand.splice(i,1)[0]);

    hasDrawn=false;
    selectedPlayerCardIndex=null;

    renderHands();
});

setupDropZone(setsBox);
setupDropZone(runsBox);
setupHandDrop();

function computerTurn(){

    if (gameOver) return;

    // Deciding whether discard pile helps
    let topDiscard = discardPile[discardPile.length - 1];

    function isUseful(card, hand){
        let sameRank = hand.filter(c => c.rank === card.rank).length;
        let sameSuit = hand.filter(c => c.suit === card.suit);

        let closeRun = sameSuit.some(c => 
            Math.abs(rankValues[c.rank] - rankValues[card.rank]) === 1
        );

        return sameRank >= 2 || closeRun;
    }

    let drawn;

    if (topDiscard && isUseful(topDiscard, computerHand)) {
        drawn = discardPile.pop();
    } else {
        drawn = deck.shift();
    }

    computerHand.push(drawn);

    // Choose worst card to discard
    let worstIndex = 0;
    let worstScore = Infinity;

    computerHand.forEach((card, i) => {

        let sameRank = computerHand.filter(c => c.rank === card.rank).length;
        let sameSuit = computerHand.filter(c => c.suit === card.suit);

        let runPotential = sameSuit.filter(c =>
            Math.abs(rankValues[c.rank] - rankValues[card.rank]) <= 2
        ).length;

        let score = sameRank + runPotential;

        if (score < worstScore) {
            worstScore = score;
            worstIndex = i;
        }
    });

    const discarded = computerHand.splice(worstIndex, 1)[0];
    discardPile.push(discarded);

    renderDiscardPile();

    //  checking win
    if (isValidHand(computerHand)) {
        endRound("computer");
        return;
    }

    currentTurn = "player";
}

function isValidHand(hand){

    // try all combinations of sets/runs
    function canFormMelds(cards){

        if (cards.length === 0) return true;

        // try set
        for (let i = 0; i < cards.length; i++){
            let sameRank = cards.filter(c => c.rank === cards[i].rank);

            if (sameRank.length >= 3){
                let remaining = cards.filter(c => c.rank !== cards[i].rank);
                if (canFormMelds(remaining)) return true;
            }
        }

        // try run
        for (let suit of suits){

            let suitCards = cards
                .filter(c => c.suit === suit)
                .sort((a,b)=>rankValues[a.rank]-rankValues[b.rank]);

            for (let i = 0; i < suitCards.length - 2; i++){

                let run = [suitCards[i]];

                for (let j = i+1; j < suitCards.length; j++){

                    let last = run[run.length - 1];
                    let current = suitCards[j];

                    if (rankValues[current.rank] === rankValues[last.rank] + 1){
                        run.push(current);

                        if (run.length >= 3){

                            let remaining = cards.filter(c => !run.includes(c));
                            if (canFormMelds(remaining)) return true;
                        }
                    } else if (rankValues[current.rank] > rankValues[last.rank] + 1){
                        break;
                    }
                }
            }
        }

        return false;
    }

    return canFormMelds(hand);
}

startGame();
