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
    const { word, phonetic, meanings, phonetics } = data[0];

    const phoneticText = phonetic || phonetics?.find(item => item.text)?.text || "N/A";

    meanings.forEach(meaning => {
         console.log("Part of Speech:", meaning.partOfSpeech);

         meaning.definitions.forEach((definitionObj, index) => {
             console.log(`${index + 1}. ${definitionObj.definition}`);
             });
        });

    Card.textContent = "";
    Card.style.display='flex';

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
    phoneticDisplay.textContent = phoneticText;
    Card.appendChild(phoneticDisplay);

    //audio



    const audioDisplay = document.createElement("audio");
    audioDisplay.className = "AudioDisplay";

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

   let totalValue = 0;
   for (const char of word) {
    totalValue += getLetterValue(char);
    }

   const letterValueDisplay = document.createElement("p");
   letterValueDisplay.className = "LetterValue";
   letterValueDisplay.textContent = `${totalValue} points`;
   Card.appendChild(letterValueDisplay);

}

function getLetterValue(letter, multiplier = 1) {
    const scores = {
        a: 1, e: 1, i: 1, o: 1, u: 1, l: 1, n: 1, s: 1, t: 1, r: 1,
        d: 2, g: 2,
        b: 3, c: 3, m: 3, p: 3,
        f: 4, h: 4, v: 4, w: 4, y: 4,
        k: 5,
        j: 8, x: 8,
        q: 10, z: 10
    };

    if (!letter || typeof letter !== "string") return 0;
    const normalized = letter.toLowerCase();
    if (!/^[a-z]$/.test(normalized)) return 0;

    const baseValue = scores[normalized] || 0;
    return baseValue * multiplier;}

function displayError(message){
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("ErrorDisplay");

    Card.textContent = "";
    Card.style.display = "flex";
    Card.appendChild(errorDisplay);
}
