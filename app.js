async function getRandomWords() {
  try {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?number=15"
    );
    const words = await response.json();

    // Convert words array to a sentence
    const sentence = words.join(" ");

    // Display sentence in HTML
    document.getElementById("type-content").textContent = sentence;
  } catch (error) {
    console.error("Error fetching words:", error);
    document.getElementById("sentence").textContent = "Failed to load words.";
  }
}

let timeLeft = 60; // Initial countdown time
let timerId = null;

function updateDisplay() {
  document.getElementById("counter").textContent = timeLeft;
}

function startTimer() {
  (async () => {
    await getRandomWords();
  })();
  if (!timerId) {
    // Prevent multiple intervals
    timerId = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateDisplay();
      } else {
        clearInterval(timerId);
        timerId = null;
        alert("Time's up!");
      }
    }, 1000);
  }
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetTimer() {
  stopTimer();
  timeLeft = 60; // Reset to 60 seconds
  updateDisplay();
}

updateDisplay();
