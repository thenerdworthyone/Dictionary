// I blame Dutch Van Der Linde for everything if it doesn't work
//Because he let a rat in his bandit camp, A rat named Macah Bell



const DictAPI = document.querySelector(".DictAPI");
const WordInput = document.querySelector(".WordInput");
const Card = document.querySelector(".Card");

if (!DictAPI || !WordInput || !Card) {
    console.error("Missing DOM elements:", { DictAPI, WordInput, Card });
} 
else {
    DictAPI.addEventListener("submit", async event => {
        event.preventDefault();

        const word = WordInput.value.trim();

        if (word) {
             try{
                 const wordData = await getWord(word);
                 displayWord(wordData); 
             }
  
              catch (error){
                  console.error(error);
                 displayError(error);
              }
 
        } 
        else {
          displayError("Word doesn't exist / Not in database");
        }

    });
}

async function getWord(word){
    const Dict = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await fetch(Dict);
    if (!response.ok) { 
        throw new Error("Failed to fetch word data");
    }
    return await response.json();
}

function displayWord(data){
    console.log(data);
        const { word, phonetic, meanings } = data[0];

}

function displayError(message){
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("ErrorDisplay");

    Card.textContent = "";
    Card.style.display = "flex";
    Card.appendChild(errorDisplay);
}