let words = [];
let currentWordIndex = 0;
let timeLeft = 60;
let timerId = null;
let gameStarted = false;
let preloadedWords = [];
let correctWords = 0;
let incorrectWords = 0;
let totalWordsTyped = 0;
let typedInput = document.getElementById("type-input");

async function preloadWords() {
  try {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?number=20"
    );
    preloadedWords = await response.json();
  } catch (error) {
    console.error("Error preloading words:", error);
  }
}

async function getRandomWords() {
  words = preloadedWords.length ? preloadedWords : await fetchWords();
  currentWordIndex = 0;
  correctWords = 0;
  totalWordsTyped = 0;
  updateWordDisplay();
  preloadWords(); // Preload next set of words
  updateStats(); // Reset stats display
}

async function fetchWords() {
  try {
    const response = await fetch(
      "https://random-word-api.herokuapp.com/word?number=20"
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching words:", error);
    return [];
  }
}

function updateWordDisplay() {
  const typeContent = document.getElementById("type-content");
  typeContent.innerHTML = "";

  words.forEach((word, index) => {
    let span = document.createElement("span");
    span.textContent = word + " ";
    span.classList.add("word");
    if (index === 0) span.classList.add("highlight");
    typeContent.appendChild(span);
  });
}

function updateDisplay() {
  document.getElementById("counter").textContent = timeLeft;
}

function startTimer() {
  if (!gameStarted) {
    gameStarted = true;
    timerId = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft <= 0) {
        clearInterval(timerId);
        timerId = null;
        document.getElementById("type-input").value = ""; // set the value of the input to empty ("") after timeout
        document.getElementById("type-input").disabled = true; // disable input after timeout
        setTimeout(
          () => (document.getElementById("counter").textContent = "Done! 🎯✅"),
          100
        );
        updateStats(); // Update stats after game ends
      }
    }, 1000);
  }
}

function checkCorrectWord() {
  let textInput = document.getElementById("type-input");
  let typedWord = textInput.value.trim();

  if (typedWord.length === 0) return;

  let wordSpans = document.querySelectorAll("#type-content .word");

  if (currentWordIndex < words.length) {
    let currentSpan = wordSpans[currentWordIndex];
    totalWordsTyped++; // Increase typed words count

    if (typedWord.toLowerCase() === words[currentWordIndex]) {
      currentSpan.classList.add("correct-word");
      correctWords++; // ✅ Count correct words
    } else {
      currentSpan.classList.add("incorrect-word");
      incorrectWords++; // ❌ Count incorrect words
    }

    currentSpan.classList.remove("highlight");

    currentWordIndex++;

    if (currentWordIndex < words.length) {
      wordSpans[currentWordIndex].classList.add("highlight");
    } else {
      getRandomWords(); // Replace words when all are typed
    }

    textInput.value = "";
    updateStats(); // 🔄 Update stats after each word
  }
}

let chartInstance = null; // Store chart instance

function updateStats(final = false) {
  let timeTaken = 60 - timeLeft; // In seconds
  let timeInMinutes = timeTaken / 60 || 1; // Prevent division by zero

  let wpm = (correctWords / timeInMinutes).toFixed(2);
  let accuracy = ((correctWords / totalWordsTyped) * 100 || 0).toFixed(2);
  let errorRate = ((incorrectWords / totalWordsTyped) * 100 || 0).toFixed(2);
  let kpm = ((totalWordsTyped * 5) / timeInMinutes).toFixed(2); // Assuming avg word = 5 keystrokes

  if (final) timeTaken = 60 - timeLeft; // Adjust final time

  // Update table values
  document.getElementById("wpm").textContent = wpm;
  document.getElementById("accuracy").textContent = accuracy + "%";
  document.getElementById("error-rate").textContent = errorRate + "%";
  document.getElementById("total-words").textContent = totalWordsTyped;
  document.getElementById("time-taken").textContent = timeTaken.toFixed(2);
  document.getElementById("kpm").textContent = kpm;

  // Update the chart
  renderChart(wpm, accuracy, errorRate, totalWordsTyped, kpm);
}

function renderChart(wpm, accuracy, errorRate, totalWordsTyped, kpm) {
  let ctx = document.getElementById("statsChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy(); // Destroy previous chart instance
  }

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["WPM", "Accuracy (%)", "Error Rate (%)", "Total Words", "KPM"],
      datasets: [
        {
          label: "Typing Performance",
          data: [wpm, accuracy, errorRate, totalWordsTyped, kpm],
          backgroundColor: [
            "#4CAF50",
            "#2196F3",
            "#F44336",
            "#FFC107",
            "#9C27B0",
          ],
          borderColor: ["#388E3C", "#1976D2", "#D32F2F", "#FFA000", "#7B1FA2"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function resetGame() {
  clearInterval(timerId);
  timerId = null;
  gameStarted = false;
  timeLeft = 60;
  correctWords = 0;
  incorrectWords = 0;
  totalWordsTyped = 0;
  updateDisplay();

  document.getElementById("type-input").value = "";
  document.getElementById("type-input").disabled = false; // enable input after timeout
  document.getElementById("type-input").focus(); // Set cursor in input
  getRandomWords();
}

document.addEventListener("DOMContentLoaded", async function () {
  await preloadWords();
  getRandomWords();

  document
    .getElementById("type-input")
    .addEventListener("keydown", function (event) {
      if (!gameStarted) startTimer();
      if (event.key === " ") {
        event.preventDefault();
        checkCorrectWord();
      }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const themeToggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  // Check stored theme preference
  if (localStorage.getItem("theme") === "light") {
    body.classList.add("light-mode");
    themeToggleBtn.innerHTML = `<i class="fa-solid fa-bolt-lightning"></i>`;
  }

  themeToggleBtn.addEventListener("click", function () {
    body.classList.toggle("light-mode");

    // Change icon and store preference
    if (body.classList.contains("light-mode")) {
      themeToggleBtn.innerHTML = `<i class="fa-solid fa-bolt-lightning"></i>`;
      localStorage.setItem("theme", "light");
    } else {
      themeToggleBtn.innerHTML = `<i class="fa-solid fa-circle-half-stroke"></i>`;
      localStorage.setItem("theme", "dark");
    }
  });
});
