
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

let history = [];
let lastNumber = null;
let currentNumber = null;
let lastGeneratedMinute = null;

function istNow() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 19800000); // IST
}

function getPeriod(roundIndex) {
  const d = istNow();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const da = String(d.getDate()).padStart(2,'0');
  return `${y}${m}${da}100010000${roundIndex}`;
}

function generateNumber() {
  let n;
  do {
    n = Math.floor(Math.random() * 10);
  } while (n === lastNumber);
  lastNumber = n;
  return n;
}

setInterval(() => {
  const now = istNow();
  const sec = now.getSeconds();
  const minKey = now.getHours() + ":" + now.getMinutes();

  if (sec === 40 && lastGeneratedMinute !== minKey) {
    currentNumber = generateNumber();
    lastGeneratedMinute = minKey;
  }

  if (sec === 0 && currentNumber !== null) {
    history.unshift({
      period: getPeriod(history.length + 1),
      number: currentNumber
    });
    history = history.slice(0, 20);
    currentNumber = null;
  }
}, 1000);

app.get("/api/state", (req, res) => {
  const now = istNow();
  res.json({
    time: now.toLocaleTimeString("en-GB"),
    seconds: now.getSeconds(),
    currentNumber,
    history
  });
});

app.listen(PORT, () => console.log("Server running on", PORT));
