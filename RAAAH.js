// RAAAH.js
//BLAME VIMEAN IF THIS CODE DOESNT WORK
// but put credit to me if it DOES work


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

//fetch
async function getWord(word){
    const Dict = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
    const response = await fetch(Dict);
    if (!response.ok) { 
        throw new Error("Non-existing word data/ unable to fetch");
    }
    return await response.json();
}

//capitalise text
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

   
    
    const audioDisplay = document.createElement("audio");

    const letterValue = document.createElement("p");

    audioDisplay.className = "AudioDisplay";
    
    letterValue.className = "LetterValue";

    //word
    const wordDisplay = document.createElement("h1");
    wordDisplay.className = "WordDisplay";
    wordDisplay.textContent = capitalize(word);
    Card.appendChild(wordDisplay);

    //phonetic
    const phoneticSection = document.createElement("p");
    phoneticSection.className = "Section";
    phoneticSection.textContent = "Phonetic Spelling:";
    Card.appendChild(phoneticSection);

    const phoneticDisplay = document.createElement("p");
    phoneticDisplay.className = "PhoneticDisplay";
    phoneticDisplay.textContent = phonetic;
    Card.appendChild(phoneticDisplay);

    //audio




    //definitions
    const definitionSection = document.createElement("p");
    definitionSection.className = "Section";
    definitionSection.textContent= "Definitions:";
    Card.appendChild(definitionSection)


    const definitionDisplay = document.createElement("ul");
    definitionDisplay.className = "DefinitionDisplay";
    meanings.forEach(meaning => {
        meaning.definitions.forEach(definitionObj => {
            const listItem = document.createElement("li");
            listItem.textContent = `${capitalize(meaning.partOfSpeech)}: ${definitionObj.definition}`;
            definitionDisplay.appendChild(listItem);
        });

    }
    );
    Card.appendChild(definitionDisplay);


    //letter value
    const letterValueSection = document.createElement("p");
    letterValueSection.className = "Section";
    letterValueSection.textContent = "Letter Value:";
    Card.appendChild(letterValueSection);
    

}


function displayError(message){
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("ErrorDisplay");

    Card.textContent = "";
    Card.style.display = "flex";
    Card.appendChild(errorDisplay);
}
