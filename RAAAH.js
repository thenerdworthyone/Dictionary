// RAAAH.js
//BLAME VIMEAN IF THIS CODE DOESNT WORK
// but put credit to me if it DOES work


const DictAPI = document.querySelector(".DictAPI");
const WordInput = document.querySelector(".WordInput");
const Card = document.querySelector(".Card");
const MultiplierGUI = document.querySelector(".MultiplierGUI");
const ResetMultipliersBtn = document.querySelector(".ResetMultipliers");
const HistoryToggle = document.querySelector(".HistoryToggle");
const HistoryList = document.querySelector(".HistoryList");
const ForceWordBtn = document.querySelector(".ForceWordBtn");

//multiplier terms
let currentWord = "";
let letterMultipliers = {}; 
let wordMultiplier = 1;
let currentLetterMultiplier = 0;
let currentWordMode = "normal";
let historyEntries = [];
let lastSubmittedWord = "";
let shouldRevealSecretVideo = false;


if (HistoryToggle && HistoryList) {
    HistoryToggle.addEventListener("click", () => {
        const isExpanded = HistoryToggle.getAttribute("aria-expanded") === "true";
        HistoryToggle.setAttribute("aria-expanded", String(!isExpanded));
        HistoryList.hidden = isExpanded;
        HistoryToggle.classList.toggle("active", !isExpanded);
    });
}

if (!DictAPI || !WordInput || !Card) {
    console.error("Missing DOM elements:", { DictAPI, WordInput, Card });
} 
else {
    DictAPI.addEventListener("submit", async event => {
        event.preventDefault();

        const word = WordInput.value.trim();

        if (word) {
             try{
                 const normalizedWord = word.toLowerCase();
                 shouldRevealSecretVideo = normalizedWord === "neighbour" && lastSubmittedWord === "hello";
                 lastSubmittedWord = normalizedWord;

                 const wordData = await getWord(word);
                 displayWord(wordData); 
             }
  
              catch (error){
                  console.error(error);
                 displayError(error.message || error, word);
              }
 
        } 
        else {
          displayError("Please input a word");
        }

    });
}

if (ForceWordBtn) {
    ForceWordBtn.addEventListener("click", () => {
        const word = WordInput.value.trim();
        if (!word) {
            displayError("Please input a word");
            return;
        }

        const normalizedWord = word.toLowerCase();
        shouldRevealSecretVideo = normalizedWord === "neighbour" && lastSubmittedWord === "hello";
        lastSubmittedWord = normalizedWord;
        displayFallbackWord(word);
    });
}

//multiplier GUI thingy
if (MultiplierGUI && ResetMultipliersBtn) {

    //letter multiplier BOOT-Tons
    document.querySelectorAll('input[name="letterMultiplier"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            currentLetterMultiplier = e.target.value === "blank" ? 0 : parseInt(e.target.value, 10);
            const wordDisplay = document.querySelector(".WordDisplay");
            if (wordDisplay) {
                if (currentLetterMultiplier !== null) {
                    wordDisplay.classList.add("interactive");
                } else {
                    wordDisplay.classList.remove("interactive");
                }
            }
            updateLetterValue();
        });
    });

    //Word multiplier BOOT-Tons
    document.querySelectorAll('input[name="wordMultiplier"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            wordMultiplier = e.target.value === "none" ? 1 : parseInt(e.target.value);
            updateLetterValue();
        });
    });

    //Reset multipliers button
    ResetMultipliersBtn.addEventListener("click", () => {
        letterMultipliers = {};
        wordMultiplier = 1;
        currentLetterMultiplier = 0;

        // reset radio (aka for the interactives) buttons
        document.querySelectorAll('input[name="letterMultiplier"]').forEach(radio => {
            radio.checked = radio.value === "blank";
        });
        document.querySelectorAll('input[name="wordMultiplier"]').forEach(radio => {
            radio.checked = radio.value === "none";
        });

        const wordDisplay = document.querySelector(".WordDisplay");
        if (wordDisplay) {
            wordDisplay.classList.remove("interactive");
        }
        
        updateLetterValue();
    });
        //letter clicking thingy functionality (yes name is getting longer and longer)
        Card.addEventListener("click", (e) => {
        
        const letterSpan = e.target.closest(".letter");
        if (!letterSpan) return;
        
        const letterIndex = parseInt(letterSpan.getAttribute("data-index"));
        if (isNaN(letterIndex)) return;

        if (letterMultipliers[letterIndex] === currentLetterMultiplier) {
            delete letterMultipliers[letterIndex];
            letterSpan.classList.remove("multiplied");
            letterSpan.removeAttribute("data-multiplier");
        } else {
            letterMultipliers[letterIndex] = currentLetterMultiplier;
            letterSpan.classList.add("multiplied");
            letterSpan.setAttribute("data-multiplier", `${currentLetterMultiplier}x`);
        }
        
        updateLetterValue();
    });
    
    // Display letter value (exclusively mobile users)
    Card.addEventListener("touchstart", (e) => {
        const letterSpan = e.target.closest(".letter");
        if (!letterSpan) return;
        
        const tooltipText = letterSpan.title;
        if (!tooltipText) return;
        
        const tooltip = document.createElement("div");
        tooltip.className = "letter-tooltip";
        tooltip.textContent = tooltipText;
        
        // Position tooltip near the letter
        const rect = letterSpan.getBoundingClientRect();
        tooltip.style.position = "fixed";
        tooltip.style.left = (rect.left + rect.width / 2) + "px";
        tooltip.style.top = (rect.top - 40) + "px";
        
        document.body.appendChild(tooltip);
        letterSpan._tooltip = tooltip;
    }, true);

    Card.addEventListener("touchend", (e) => {
        const letterSpan = e.target.closest(".letter");
        if (!letterSpan || !letterSpan._tooltip) return;
        
        letterSpan._tooltip.remove();
        delete letterSpan._tooltip;
    }, true);
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

function renderHistory() {
    if (!HistoryList) return;

    HistoryList.innerHTML = "";

    if (!historyEntries.length) {
        const emptyState = document.createElement("p");
        emptyState.className = "HistoryEmpty";
        emptyState.textContent = "No recent words yet.";
        HistoryList.appendChild(emptyState);
        return;
    }

    historyEntries.forEach(entry => {
        const historyItem = document.createElement("button");
        historyItem.type = "button";
        historyItem.className = "HistoryItem";
        if (entry.fallback) {
            historyItem.classList.add("HistoryItemFallback");
            historyItem.textContent = `${entry.word} (manual)`;
        } else {
            historyItem.textContent = entry.word;
        }
        historyItem.addEventListener("click", () => {
            if (entry.fallback) {
                displayFallbackWord(entry.word);
            } else {
                displayWord(entry.data);
            }
        });
        HistoryList.appendChild(historyItem);
    });
}

function addToHistory(data, fallback = false) {
    if (!data) return;

    const word = capitalize(data?.[0]?.word || data?.word || "");
    if (!word) return;

    const existingIndex = historyEntries.findIndex(entry => entry.word.toLowerCase() === word.toLowerCase());

    if (existingIndex >= 0) {
        historyEntries.splice(existingIndex, 1);
    }

    historyEntries.unshift({ word, data, fallback });
    historyEntries = historyEntries.slice(0, 8);
    renderHistory();
}

//Display data and stuff idk
function displayFallbackWord(word) {
    const normalizedWord = (word || "").trim();
    if (!normalizedWord) {
        displayError("Please input a word");
        return;
    }

    currentWord = normalizedWord;
    letterMultipliers = {};
    wordMultiplier = 1;
    currentLetterMultiplier = 0;
    currentWordMode = "fallback";

    if (MultiplierGUI) {
        document.querySelectorAll('input[name="letterMultiplier"]').forEach(radio => {
            radio.checked = radio.value === "blank";
        });
        document.querySelectorAll('input[name="wordMultiplier"]').forEach(radio => {
            radio.checked = radio.value === "none";
        });
    }

    Card.textContent = "";
    Card.style.display = "flex";
    addToHistory({ word: normalizedWord }, true);

    const wordDisplay = document.createElement("h1");
    wordDisplay.className = "WordDisplay";
    wordDisplay.textContent = capitalize(normalizedWord);
    Card.appendChild(wordDisplay);

    const fallbackNote = document.createElement("p");
    fallbackNote.className = "Section";
    fallbackNote.textContent = "Definition unavailable — score calculated from letters only.";
    Card.appendChild(fallbackNote);

    const letterValueSection = document.createElement("p");
    letterValueSection.className = "Section";
    letterValueSection.textContent = "Letter Value:";
    Card.appendChild(letterValueSection);

    const letterValueDisplay = document.createElement("p");
    letterValueDisplay.className = "LetterValue";
    letterValueDisplay.id = "LetterValueDisplay";
    Card.appendChild(letterValueDisplay);

    if (MultiplierGUI) {
        MultiplierGUI.style.display = "flex";
    }

    updateLetterValue();
}

function displayWord(data){
    console.log(data);
    const { word, phonetic, meanings, phonetics } = data[0];

  //reset value when new word introduced
    currentWord = word;
    letterMultipliers = {};
    wordMultiplier = 1;
    currentLetterMultiplier = 0;
    currentWordMode = "normal";

  // multiplier GUI reset aswell
    if (MultiplierGUI) {
        document.querySelectorAll('input[name="letterMultiplier"]').forEach(radio => {
            radio.checked = radio.value === "blank";
        });
        document.querySelectorAll('input[name="wordMultiplier"]').forEach(radio => {
            radio.checked = radio.value === "none";
        });
    }

    const phoneticText = phonetic || phonetics?.find(item => item.text)?.text || "N/A";

    meanings.forEach(meaning => {
         console.log("Part of Speech:", meaning.partOfSpeech);

         meaning.definitions.forEach((definitionObj, index) => {
             console.log(`${index + 1}. ${definitionObj.definition}`);
             });
        });

    Card.textContent = "";
    Card.style.display='flex';
    addToHistory(data);

    if (shouldRevealSecretVideo) {
        showSecretVideo();
    } else {
        hideSecretVideo();
    }
    shouldRevealSecretVideo = false;

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
    const audioSection = document.createElement("p");
    audioSection.className = "Section";
    audioSection.textContent = "Audio:";
    Card.appendChild(audioSection);

    const audioUrl = phonetics?.find(item => item.audio)?.audio || "";
    const audioDisplay = document.createElement("audio");
    audioDisplay.className = "AudioDisplay";
    audioDisplay.controls = true;

    if (audioUrl) {
        const source = document.createElement("source");
        source.src = audioUrl;
        source.type = "audio/mpeg";
        audioDisplay.appendChild(source);
    } else {
        const noAudio = document.createElement("p");
        noAudio.className = "NoAudioDisplay";
        noAudio.textContent = "No audio available.";
        Card.appendChild(noAudio);
    }
    Card.appendChild(audioDisplay);

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

   const letterValueDisplay = document.createElement("p");
   letterValueDisplay.className = "LetterValue";
   letterValueDisplay.id = "LetterValueDisplay";
   Card.appendChild(letterValueDisplay);

   //make GUI visible
    if (MultiplierGUI) {
         MultiplierGUI.style.display = "flex";
    }
    updateLetterValue();
}

function showSecretVideo() {
    if (!Card) return;

    hideSecretVideo();

    const container = document.createElement("div");
    container.className = "SecretVideoContainer";

    const heading = document.createElement("p");
    heading.className = "Section";
    heading.textContent = "Secret Video:";
    container.appendChild(heading);

    const video = document.createElement("video");
    video.className = "SecretVideo";
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.preload = "metadata";

    const source = document.createElement("source");
    source.src = "Hello_neighbour_secret.mp4";
    source.type = "video/mp4";
    video.appendChild(source);

    container.appendChild(video);
    Card.appendChild(container);
}

function hideSecretVideo() {
    if (!Card) return;

    const existing = Card.querySelector(".SecretVideoContainer");
    if (existing) {
        existing.remove();
    }
}

// FUCK, ITS MATH, VIMEAN I NEED YOU.
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
    return baseValue * multiplier;
}

//UPDATE value
function updateLetterValue() {
    const display = document.getElementById("LetterValueDisplay");
    if (!display) return;

    let totalValue = 0;

    for (let i = 0; i < currentWord.length; i++) {
        const char = currentWord[i];
        const hasLetterMultiplier = Object.prototype.hasOwnProperty.call(letterMultipliers, i);
        const letterMultiplier = hasLetterMultiplier ? letterMultipliers[i] : 1;
        totalValue += getLetterValue(char, letterMultiplier);
    }

    const finalValue = totalValue * wordMultiplier;
    //Display what the score is being multiplied by
    let displayText = `${finalValue} points`;
    if (Object.keys(letterMultipliers).length > 0 || wordMultiplier > 1) {
        displayText += ` (${totalValue} × ${wordMultiplier})`;
    }
    display.textContent = displayText;

    //Split them words apart like Moses did to the sea.
    const wordDisplay = document.querySelector(".WordDisplay");
    if (wordDisplay) {
         wordDisplay.innerHTML = "";
         for (let i = 0; i < currentWord.length; i++) {
             const char = currentWord[i];
             const letterSpan = document.createElement("span");
             letterSpan.className = "letter";
             letterSpan.setAttribute("data-index", i);
             letterSpan.textContent = capitalize(char);

            const baseValue = getLetterValue(char, 1);
            const hasLetterMultiplier = Object.prototype.hasOwnProperty.call(letterMultipliers, i);
            const letterMultiplier = hasLetterMultiplier ? letterMultipliers[i] : 1;
            const letterValue = getLetterValue(char, letterMultiplier);
            const multiplierText = letterMultiplier > 1 ? ` × ${letterMultiplier}` : letterMultiplier === 0 ? " × 0" : "";
            letterSpan.title = `${capitalize(char)}: ${letterValue} point${letterValue === 1 ? "" : "s"}${multiplierText}${letterMultiplier > 1 ? ` (base ${baseValue} point${baseValue === 1 ? "" : "s"})` : ""}`;

            if (hasLetterMultiplier) {
                letterSpan.classList.add("multiplied");
                letterSpan.setAttribute("data-multiplier", `${letterMultiplier}x`);
            }

            if (currentWordMode === "fallback") {
                letterSpan.classList.add("fallbackLetter");
            }
                wordDisplay.appendChild(letterSpan);
        }
    }
}

        


 
function displayError(message, fallbackWord = ""){
    const errorDisplay = document.createElement("p");
    errorDisplay.textContent = message;
    errorDisplay.classList.add("ErrorDisplay");

    Card.textContent = "";
    Card.style.display = "flex";
    Card.appendChild(errorDisplay);

    if (fallbackWord) {
        const fallbackButton = document.createElement("button");
        fallbackButton.type = "button";
        fallbackButton.className = "ForceWordBtn";
        fallbackButton.textContent = "Use Word Anyway";
        fallbackButton.addEventListener("click", () => displayFallbackWord(fallbackWord));
        Card.appendChild(fallbackButton);
    }
}

             