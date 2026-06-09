// RAAAH.js
//BLAME VIMEAN IF THIS CODE DOESNT WORK



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
          displayError("Please input a word");
        }

    });
}

async function getWord(word){
    const Dict = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await fetch(Dict);
    if (!response.ok) { 
        throw new Error("Non-existing word data/ unable to fetch");
    }
    return await response.json();
}

function capitalize(text) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function displayWord(data){
    console.log(data);
    const { word, phonetic, meanings } = data[0];

    meanings.forEach(meaning => {
         console.log("Part of Speech:", meaning.partOfSpeech);

         meaning.definitions.forEach((definitionObj, index) => {
             console.log(`${index + 1}. ${definitionObj.definition}`);
             });
        });
    Card.textContent = "";
    Card.style.display='flex';

    const wordDisplay = document.createElement("h1");
    const phoneticDisplay = document.createElement("p");
    const audioDisplay = document.createElement("audio");
    const definitionDisplay = document.createElement("ul");
    const letterValue = document.createElement("p");

    wordDisplay.className = "WordDisplay";
    phoneticDisplay.className = "PhoneticDisplay";
    audioDisplay.className = "AudioDisplay";
    definitionDisplay.className = "DefinitionDisplay";
    letterValue.className = "LetterValue";

    wordDisplay.textContent = capitalize(word);



    Card.appendChild(wordDisplay);

}

function displayError(message){
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("ErrorDisplay");

    Card.textContent = "";
    Card.style.display = "flex";
    Card.appendChild(errorDisplay);
}