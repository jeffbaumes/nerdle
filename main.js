function isPrime(n) {
  if (n < 2) {
    return false;
  }
  if (n === 2) {
    return true;
  }
  if (n % 2 === 0) {
    return false;
  }
  const max = Math.floor(Math.sqrt(n));
  for (let i = 3; i <= max; i += 2) {
    if (n % i === 0) {
      return false;
    }
    console.log(`${n} % ${i} !== 0`);
  }
  return true;
}

function randomPrime(max) {
  let num = Math.floor(Math.random() * max);
  while (!isPrime(num)) {
    num = Math.floor(Math.random() * 100);
  }
  return num;
}

function numberToDigits(n, length) {
  let digits = `${n}`.split("");
  while (digits.length < length) {
    digits = ["0", ...digits];
  }
  return digits;
}

let bit = "01";
let digit = "0123456789";
let hex = "0123456789abcdef";
let alpha = "abcdefghijklmnopqrstuvwxyz";

let levels = [
  {
    name: "1 bit (0/1) in 3",
    allowed: bit,
    letters: 1,
    guesses: 3,
  },
  {
    name: "1 bit in 2",
    allowed: bit,
    letters: 1,
    guesses: 2,
  },
  {
    name: "1 bit in 1",
    allowed: bit,
    letters: 1,
    guesses: 1,
  },
  {
    name: "4 bits in 3",
    allowed: bit,
    letters: 4,
    guesses: 3,
  },
  {
    name: "4 bits in 2",
    allowed: bit,
    letters: 4,
    guesses: 2,
  },
  {
    name: "8 bits in 2",
    allowed: bit,
    letters: 8,
    guesses: 2,
  },
  {
    name: "16 bits in 2",
    allowed: bit,
    letters: 16,
    guesses: 2,
  },
  {
    name: "2 digit prime in 4",
    allowed: digit,
    letters: 2,
    guesses: 4,
    generate: () => {
      return numberToDigits(randomPrime(2), 2);
    },
    valid: (guess) => {
      return isPrime(Number.parseInt(guess.join("")));
    },
  },
  {
    name: "5 alphas in 8",
    allowed: alpha,
    letters: 5,
    guesses: 8,
  },
];

const grid = document.getElementById("grid");
const next = document.getElementById("next");
const restart = document.getElementById("restart");
const title = document.getElementById("title");

function startLevel() {
  next.classList.add("hidden");
  restart.classList.add("hidden");
  grid.innerHTML = "";
  if (level >= levels.length) {
    title.innerHTML = "you win!";
    return;
  }
  curLevel = levels[level];
  guesses = curLevel.guesses;
  letters = curLevel.letters;
  allowed = curLevel.allowed;
  const generate =
    curLevel.generate ??
    (() => {
      const answer = [];
      for (let i = 0; i < letters; i += 1) {
        answer.push(allowed[Math.floor(Math.random() * allowed.length)]);
      }
      return answer;
    });
  valid =
    curLevel.valid ??
    ((guess) => guess.every((letter) => allowed.includes(letter)));

  title.innerHTML = curLevel.name;

  grid.style.gridTemplateColumns = `repeat(${letters}, 50px)`;
  grid.style.gridTemplateRows = `repeat(${guesses}, 50px)`;

  for (let guess = 0; guess < guesses; guess += 1) {
    for (let letter = 0; letter < letters; letter += 1) {
      const letterDiv = document.createElement("div");
      letterDiv.style.transition = `transform 0.8s ${0.4 * letter}s`;
      const frontDiv = document.createElement("div");
      frontDiv.className = "front";
      const backDiv = document.createElement("div");
      backDiv.className = "back";
      letterDiv.appendChild(frontDiv);
      letterDiv.appendChild(backDiv);
      grid.appendChild(letterDiv);
    }
  }
  answer = generate();
  console.log(answer);
  cursor = 0;
  row = 0;
  win = false;
  lose = false;
}

let level = 0;
let cursor = 0;
let row = 0;
let win = false;
let lose = false;
let answer = [];
let allowed = "";
let guesses = 0;
let letters = 0;
let valid = () => false;

startLevel();

console.log(answer);

next.addEventListener("click", () => {
  level += 1;
  startLevel();
});

restart.addEventListener("click", () => {
  startLevel();
});

document.addEventListener("keydown", (ev) => {
  if (win || lose) {
    if (ev.key === "Enter") {
      if (win) {
        level += 1;
      }
      startLevel();
    }
    return;
  }
  if (ev.key === "Backspace") {
    cursor -= 1;
    cursor = Math.max(0, cursor);
    const cell = grid.children[row * letters + cursor];
    const front = cell.children[0];
    const back = cell.children[1];
    front.innerHTML = "";
    back.innerHTML = "";
  } else if (ev.key === "Enter") {
    const guessList = [];
    for (let i = 0; i < letters; i += 1) {
      const cell = grid.children[row * letters + i];
      const front = cell.children[0];
      guessList.push(front.innerHTML);
    }
    if (cursor === letters && valid(guessList)) {
      let correct = true;
      let remaining = answer.slice();
      for (let i = 0; i < letters; i += 1) {
        const cell = grid.children[row * letters + i];
        const front = cell.children[0];
        const back = cell.children[1];
        const guess = front.innerHTML;
        if (answer[i] === guess) {
          back.classList.add("green");
          remaining.splice(remaining.indexOf(guess), 1);
        } else {
          correct = false;
        }
      }
      for (let i = 0; i < letters; i += 1) {
        const cell = grid.children[row * letters + i];
        const front = cell.children[0];
        const back = cell.children[1];
        const guess = front.innerHTML;
        if (answer[i] !== guess && remaining.includes(guess)) {
          back.classList.add("yellow");
          remaining.splice(remaining.indexOf(guess), 1);
        } else {
          back.classList.add("gray");
        }
        cell.classList.add("flip");
      }
      if (correct) {
        win = true;
        next.classList.remove("hidden");
      } else {
        row += 1;
        cursor = 0;
        if (row === guesses) {
          lose = true;
          restart.classList.remove("hidden");
        }
      }
    }
  } else if (allowed.includes(ev.key)) {
    if (cursor < letters) {
      const cell = grid.children[row * letters + cursor];
      cell.children[0].innerHTML = ev.key;
      cell.children[1].innerHTML = ev.key;
    }
    cursor += 1;
    cursor = Math.min(letters, cursor);
  }
});
