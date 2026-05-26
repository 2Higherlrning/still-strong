const state = {
  jointFocus: "knees",
  equipment: "weights",
  energy: "steady",
  pain: 3,
  day: 0,
  points: Number(localStorage.getItem("stillStrongPoints") || 0),
  habits: JSON.parse(localStorage.getItem("stillStrongHabits") || "{}"),
  activeIndex: Number(localStorage.getItem("stillStrongActiveIndex") || 0),
  completedSets: JSON.parse(localStorage.getItem("stillStrongCompletedSets") || "{}"),
  currentSessionSets: Number(localStorage.getItem("stillStrongCurrentSessionSets") || 0),
  sessionHistory: JSON.parse(localStorage.getItem("stillStrongSessionHistory") || "[]"),
  customExercises: JSON.parse(localStorage.getItem("stillStrongCustomExercises") || "[]"),
  removedExercises: JSON.parse(localStorage.getItem("stillStrongRemovedExercises") || "{}"),
  swappedExercises: JSON.parse(localStorage.getItem("stillStrongSwappedExercises") || "{}"),
  quickMode: localStorage.getItem("stillStrongQuickMode") || ""
};

let timerSeconds = 45;
let timerId = null;
let deferredInstallPrompt = null;

const exerciseLibrary = {
  weights: {
    knees: [
      ["Box squat to comfortable height", "Sit back to a chair or box, pause, stand tall. Shorten the range if knees complain.", "2-3 x 6-8"],
      ["Supported dumbbell Romanian deadlift", "Hold light weights, hinge at the hips, keep shins nearly vertical.", "2-3 x 8"],
      ["Seated dumbbell press", "Press from a supported chair; stop before shoulder pinch.", "2 x 8"],
      ["Chest-supported row", "Use an incline bench or brace one hand on a table.", "2-3 x 10"]
    ],
    hips: [
      ["Glute bridge", "Use bodyweight or a light dumbbell across the hips; keep the motion smooth.", "2-3 x 8"],
      ["Supported split stance hinge", "Small staggered stance, light weights, no deep lunge required.", "2 x 8 each"],
      ["Seated curl to press", "Train upper body without asking hips to stabilize hard.", "2 x 8"],
      ["Farmer carry", "Walk slowly with light dumbbells or hold in place if walking is limited.", "3 x 30 sec"]
    ],
    back: [
      ["Goblet box squat", "Stay tall, use a high box, and keep the load light.", "2 x 6"],
      ["Incline push-up", "Hands on counter or wall; ribs down, no sagging.", "2 x 8"],
      ["Supported one-arm row", "Brace firmly so the back is not doing the holding work.", "2 x 10 each"],
      ["Dead bug breathing", "Slow core work with no crunching.", "3 x 5 each"]
    ],
    shoulders: [
      ["Neutral-grip floor press", "Use light dumbbells and keep elbows near the body.", "2-3 x 8"],
      ["Chest-supported row", "Pull elbows toward back pockets.", "2-3 x 10"],
      ["Goblet box squat", "Hold the weight close, or skip the load.", "2 x 8"],
      ["Low carry", "Carry weights at sides only if shoulders stay relaxed.", "3 x 20 sec"]
    ],
    hands: [
      ["Cuff-weight march", "Use ankle or wrist cuffs instead of gripping dumbbells.", "3 x 30 sec"],
      ["Machine or band row with handles padded", "Keep grip relaxed and wrists neutral.", "2 x 10"],
      ["Box squat", "No hand load needed; add a vest only if available.", "2-3 x 8"],
      ["Forearm-supported plank at wall", "Use forearms, not hands.", "3 x 20 sec"]
    ]
  },
  bands: {
    knees: [
      ["Band pull-apart", "Stand or sit tall, open the band gently.", "2 x 10"],
      ["Seated band row", "Anchor under feet or around a sturdy post.", "2-3 x 10"],
      ["Sit-to-stand", "Use hands as needed and choose a higher chair.", "2 x 6"],
      ["Side-step at counter", "Tiny steps, light band optional.", "2 x 8 each"]
    ],
    hips: [
      ["Seated band abduction", "Press knees out gently against the band.", "2 x 10"],
      ["Band row", "Stay tall and avoid leaning back.", "2-3 x 10"],
      ["Supported hip hinge", "Hold a counter and practice the pattern.", "2 x 8"],
      ["Standing calf raise", "Hold support; move slowly.", "2 x 10"]
    ],
    back: [
      ["Wall push-up", "Keep the range comfortable.", "2 x 8"],
      ["Seated band row", "Support posture with a chair back if needed.", "2 x 10"],
      ["Pallof press", "Small range, resist rotation.", "2 x 8 each"],
      ["Heel raises", "Hold the counter, no bouncing.", "2 x 10"]
    ],
    shoulders: [
      ["Band external rotation", "Elbow tucked, towel between elbow and side.", "2 x 8 each"],
      ["Scapular wall slide", "Move only through pain-free range.", "2 x 8"],
      ["Seated band row", "Think shoulder blades, not neck.", "2 x 10"],
      ["Sit-to-stand", "Leg work without shoulder loading.", "2 x 6"]
    ],
    hands: [
      ["Loop-band leg press", "Seated, band over foot, hold ends loosely or anchor.", "2 x 8 each"],
      ["Forearm band row", "Loop band around forearms instead of gripping.", "2 x 10"],
      ["Sit-to-stand", "Hands free if possible, chair support if needed.", "2 x 6"],
      ["Standing march", "Hold counter with open palm.", "3 x 30 sec"]
    ]
  },
  chair: {
    knees: [
      ["Seated march", "Lift one knee at a time in a pain-free range.", "3 x 30 sec"],
      ["Chair push-up", "Press from armrests or seat edge if wrists allow.", "2 x 6"],
      ["Long arc quad", "Straighten the knee slowly, pause, lower.", "2 x 8 each"],
      ["Seated hinge", "Fold forward slightly, return tall.", "2 x 8"]
    ],
    hips: [
      ["Seated glute squeeze", "Squeeze, breathe, release fully.", "3 x 8"],
      ["Supported sit-to-stand", "Use armrests and a high seat.", "2 x 5"],
      ["Seated row isometric", "Pull towel ends gently without shoulder shrug.", "2 x 15 sec"],
      ["Ankle pumps", "Keep blood moving between sets.", "2 x 15"]
    ],
    back: [
      ["Seated pelvic tilt", "Small motion, no forcing.", "2 x 8"],
      ["Seated heel dig", "Dig heels into floor and lightly brace.", "2 x 8"],
      ["Wall push-up", "Stand close enough to stay comfortable.", "2 x 8"],
      ["Seated shoulder blade squeeze", "Pull shoulder blades back and down.", "2 x 10"]
    ],
    shoulders: [
      ["Table slide", "Slide hands forward on a table within easy range.", "2 x 8"],
      ["Seated march", "Cardio without arm loading.", "3 x 30 sec"],
      ["Scapular squeeze", "No pinching, neck relaxed.", "2 x 10"],
      ["Sit-to-stand", "Use armrests only as needed.", "2 x 5"]
    ],
    hands: [
      ["Seated march", "No gripping needed.", "3 x 30 sec"],
      ["Forearm wall plank", "Use forearms and keep wrists neutral.", "3 x 15 sec"],
      ["Seated knee extension", "Slow and controlled.", "2 x 8 each"],
      ["Breathing reset", "Long exhales to downshift pain stress.", "3 x 5 breaths"]
    ]
  },
  water: {
    knees: [
      ["Water walk", "Forward and backward at chest depth if available.", "8-12 min"],
      ["Pool wall push-up", "Hands on wall, easy range.", "2 x 8"],
      ["Side step in water", "Use small steps and relaxed hips.", "2 x 10 each"],
      ["Gentle flutter kick", "Hold wall, stop if knees ache.", "2 x 20 sec"]
    ],
    hips: [
      ["Water march", "Lift only as high as comfortable.", "3 x 45 sec"],
      ["Pool wall squat", "Shallow range, slow tempo.", "2 x 6"],
      ["Water row with paddles or hands", "Pull water toward ribs.", "2 x 10"],
      ["Side leg sweep", "Small range, controlled.", "2 x 8 each"]
    ],
    back: [
      ["Water walk", "Tall posture, relaxed shoulders.", "8-10 min"],
      ["Pool wall press", "Light push-up pattern.", "2 x 8"],
      ["Standing water brace", "Exhale and gently brace.", "3 x 5 breaths"],
      ["Heel-toe walk", "Slow balance work near support.", "3 min"]
    ],
    shoulders: [
      ["Water walk", "Arms relaxed or small range.", "8-10 min"],
      ["Underwater row", "Keep elbows low and neck soft.", "2 x 10"],
      ["Pool wall squat", "Leg work without shoulder load.", "2 x 6"],
      ["Pendulum in water", "Gentle supported arm circles.", "2 x 20 sec"]
    ],
    hands: [
      ["Water walk", "No grip required.", "8-12 min"],
      ["Open-hand water press", "Press water with relaxed fingers.", "2 x 8"],
      ["Side step", "Use wall support with open palm.", "2 x 10 each"],
      ["Calf raise", "Hold wall lightly.", "2 x 10"]
    ]
  }
};

const swaps = {
  knees: [
    ["Instead of deep squats", "Use box squats, leg extensions, water walking, or a higher chair sit-to-stand."],
    ["Instead of lunges", "Use supported split-stance hinges, step taps, or glute bridges."],
    ["Pain rule", "If joint pain is worse two hours later, reduce range, load, or total sets next time."]
  ],
  hips: [
    ["Instead of deep lunges", "Use bridges, shallow box squats, water marches, or supported hinges."],
    ["Instead of long walks on flare days", "Use short bouts: 5 minutes, rest, repeat if pain settles."],
    ["Pain rule", "Keep motion smooth; pinching means shorten the range or switch positions."]
  ],
  back: [
    ["Instead of heavy barbell lifts", "Use supported rows, wall push-ups, goblet box squats, and dead bugs."],
    ["Instead of crunches", "Use breathing braces, Pallof presses, or seated core holds."],
    ["Pain rule", "Skip movements that send symptoms down the leg or create sharp pain."]
  ],
  shoulders: [
    ["Instead of overhead pressing", "Use neutral-grip floor press, wall push-ups, rows, and table slides."],
    ["Instead of upright rows", "Use band external rotation or chest-supported rows."],
    ["Pain rule", "Keep elbows lower than shoulders when irritated."]
  ],
  hands: [
    ["Instead of heavy gripping", "Use cuffs, straps, machines, forearm supports, or open-hand pressure."],
    ["Instead of floor planks on hands", "Use wall or counter planks on forearms."],
    ["Pain rule", "Keep wrists neutral and stop before swelling or hot joint pain builds."]
  ]
};

const meals = [
  [
    ["Breakfast", "Greek yogurt or cottage cheese, berries, chopped nuts, and oats."],
    ["Lunch", "Chicken, tuna, tofu, or beans over greens with rice or potatoes and olive-oil dressing."],
    ["Dinner", "Salmon, turkey, lentils, or eggs with roasted vegetables and a fist-size carb."],
    ["Rescue snack", "Protein shake, boiled eggs, hummus with vegetables, or a turkey wrap."]
  ],
  [
    ["Breakfast", "Egg scramble with spinach, toast, and fruit."],
    ["Lunch", "Leftover protein bowl: lean protein, vegetables, avocado, and quinoa or rice."],
    ["Dinner", "Slow-cooker chili with beans, lean meat or lentils, and a side salad."],
    ["Rescue snack", "Apple with peanut butter, jerky, edamame, or yogurt."]
  ],
  [
    ["Breakfast", "Protein smoothie with milk, protein powder or yogurt, banana, and spinach."],
    ["Lunch", "Soup and sandwich: vegetable soup plus turkey, egg, tuna, or chickpea salad."],
    ["Dinner", "Sheet-pan protein with colorful vegetables and sweet potato."],
    ["Rescue snack", "Cheese stick, nuts, fruit, or ready-made protein option."]
  ]
];

const coachMessages = [
  "The goal is not to win Monday. The goal is to make Tuesday possible. Keep one promise today, even a small one.",
  "A modified workout is not a failed workout. It is you staying in the game with better information.",
  "Pain data is not a character judgment. It is a dashboard light. Adjust the plan and keep your dignity intact.",
  "Missed meals and missed workouts do not erase you. Restart at the next plate, the next walk, the next set."
];

const week = [
  ["Mon", "Strength A"],
  ["Tue", "Gentle cardio"],
  ["Wed", "Strength B"],
  ["Thu", "Mobility"],
  ["Fri", "Strength C"],
  ["Sat", "Flexible fuel"],
  ["Sun", "Reset and prep"]
];

const $ = (selector) => document.querySelector(selector);

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatTimer(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function exerciseKey(exercise) {
  return `${state.equipment}:${state.jointFocus}:${exercise[0]}`;
}

function baseExercises() {
  const source = exerciseLibrary[state.equipment][state.jointFocus];
  if (state.energy === "low") return source.slice(0, 3);
  if (state.energy === "strong") return [...source, ["Optional easy finisher", "Bike, water walk, or slow walk. Stop before joint pain climbs.", "6-10 min"]];
  return source;
}

function currentExercises() {
  const custom = state.customExercises.filter((exercise) => {
    return exercise.jointFocus === state.jointFocus && exercise.equipment === state.equipment;
  }).map((exercise) => [exercise.name, exercise.cue, exercise.dose]);

  return [...baseExercises(), ...custom].reduce((list, exercise) => {
    const key = exerciseKey(exercise);
    if (state.removedExercises[key]) return list;
    list.push(state.swappedExercises[key] || exercise);
    return list;
  }, []);
}

function originalVisibleExercises() {
  const custom = state.customExercises.filter((exercise) => {
    return exercise.jointFocus === state.jointFocus && exercise.equipment === state.equipment;
  }).map((exercise) => [exercise.name, exercise.cue, exercise.dose]);

  return [...baseExercises(), ...custom].filter((exercise) => !state.removedExercises[exerciseKey(exercise)]);
}

function gentleEquipment() {
  if (state.equipment === "water") return "water";
  if (state.pain >= 7) return "chair";
  if (state.equipment === "weights") return "bands";
  return "chair";
}

function gentleMove() {
  const equipment = gentleEquipment();
  const moves = exerciseLibrary[equipment][state.jointFocus] || exerciseLibrary.chair[state.jointFocus];
  return { equipment, move: moves[Math.min(state.activeIndex, moves.length - 1)] };
}

function setQuickStatus(text) {
  $("#quickStartStatus").textContent = text;
}

function renderWorkout() {
  $("#workoutList").innerHTML = currentExercises().map(([name, cue, dose], index) => `
    <div class="exercise" data-exercise-index="${index}">
      <div>
        <h3>${name}</h3>
        <p>${cue}</p>
      </div>
      <div class="dose">${dose}</div>
      <div class="exercise-actions">
        <button class="mini-button" data-action="switch" data-index="${index}" type="button">Switch</button>
        <button class="mini-button remove" data-action="remove" data-index="${index}" type="button">Remove</button>
      </div>
    </div>
  `).join("");
}

function renderSession() {
  const exercises = currentExercises();
  if (state.activeIndex >= exercises.length) state.activeIndex = 0;
  const [name, cue] = exercises[state.activeIndex];
  $("#activeExercise").textContent = name;
  $("#activeCue").textContent = cue;
  const { equipment, move } = gentleMove();
  $("#sessionSwap").textContent = `If this is too much today: try ${move[0]} using ${equipment}. ${move[1]}`;
  $("#timerValue").textContent = formatTimer(timerSeconds);
  $("#sessionProgress").innerHTML = exercises.map(([exerciseName, , dose], index) => {
    const key = sessionKey(index);
    const sets = state.completedSets[key] || 0;
    const className = [
      "progress-step",
      index === state.activeIndex ? "active" : "",
      sets > 0 ? "done" : ""
    ].filter(Boolean).join(" ");
    return `
      <div class="${className}">
        <strong>${index + 1}</strong>
        <span>${exerciseName}</span>
        <small>${sets} sets | ${dose}</small>
      </div>
    `;
  }).join("");
  localStorage.setItem("stillStrongActiveIndex", String(state.activeIndex));
}

function sessionKey(index) {
  return `${state.equipment}:${state.jointFocus}:${state.energy}:${index}`;
}

function renderLibrary() {
  const query = ($("#exerciseSearch")?.value || "").trim().toLowerCase();
  const items = [];
  Object.entries(exerciseLibrary).forEach(([equipment, jointMap]) => {
    Object.entries(jointMap).forEach(([joint, exercises]) => {
      exercises.forEach(([name, cue, dose]) => {
        const haystack = `${equipment} ${joint} ${name} ${cue} ${dose}`.toLowerCase();
        if (!query || haystack.includes(query)) {
          items.push({ equipment, joint, name, cue, dose });
        }
      });
    });
  });
  state.customExercises.forEach((exercise) => {
    const haystack = `${exercise.equipment} ${exercise.jointFocus} ${exercise.name} ${exercise.cue} ${exercise.dose}`.toLowerCase();
    if (!query || haystack.includes(query)) {
      items.push({
        equipment: exercise.equipment,
        joint: exercise.jointFocus,
        name: exercise.name,
        cue: exercise.cue,
        dose: exercise.dose
      });
    }
  });

  $("#libraryList").innerHTML = items.slice(0, 18).map((item) => `
    <div class="library-item">
      <div>
        <h3>${item.name}</h3>
        <p>${item.cue}</p>
      </div>
      <div class="library-tags">
        <span>${item.equipment}</span>
        <span>${item.joint}</span>
        <span>${item.dose}</span>
      </div>
    </div>
  `).join("");
}

function renderSwaps() {
  $("#swapList").innerHTML = swaps[state.jointFocus].map(([title, text]) => `
    <div class="swap">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `).join("");
}

function renderMeals() {
  $("#mealPlan").innerHTML = meals[state.day].map(([title, text]) => `
    <div class="meal">
      <h3>${title}</h3>
      <p>${text}</p>
    </div>
  `).join("");
  document.querySelectorAll(".meal-tab").forEach((tab) => {
    tab.classList.toggle("active", Number(tab.dataset.day) === state.day);
  });
}

function renderPain() {
  const pain = state.pain;
  $("#painValue").textContent = pain;
  $("#painRing").style.borderColor = pain >= 7 ? "rgba(182, 83, 98, 0.85)" : pain >= 4 ? "rgba(197, 138, 44, 0.85)" : "rgba(255, 255, 255, 0.45)";
  let advice = `Pain ${pain}/10: warm up slowly and keep the first set easy.`;
  if (pain >= 4) advice = "Choose the gentler swap, reduce range, and keep effort around 5 out of 10.";
  if (pain >= 7) advice = "Make today a mobility, water, or recovery day. Sharp or unusual pain deserves medical guidance.";
  $("#painAdvice").textContent = advice;
}

function renderCoach() {
  const index = (new Date().getDate() + state.points) % coachMessages.length;
  $("#coachMessage").innerHTML = `<p>${coachMessages[index]}</p>`;
}

function renderWeek() {
  $("#weekTrack").innerHTML = week.map(([day, label]) => `
    <div class="day-chip">
      <strong>${day}</strong>
      <span>${label}</span>
    </div>
  `).join("");
}

function renderPoints() {
  $("#weekScore").textContent = state.points;
}

function renderProgress() {
  const totalSets = state.sessionHistory.reduce((sum, session) => sum + session.sets, state.currentSessionSets);
  const habitCount = Object.values(state.habits).filter(Boolean).length;
  $("#sessionCount").textContent = state.sessionHistory.length;
  $("#setCount").textContent = totalSets;
  $("#mobilityCount").textContent = habitCount;

  if (!state.sessionHistory.length) {
    $("#sessionLog").innerHTML = `<div class="log-empty">No finished workouts yet. Start small and log the first one.</div>`;
    return;
  }

  $("#sessionLog").innerHTML = state.sessionHistory.slice(0, 5).map((session) => `
    <div class="log-item">
      <h3>${session.title}</h3>
      <p>${formatDate(session.date)} | ${session.sets} sets | pain ${session.pain}/10</p>
    </div>
  `).join("");
}

function persist() {
  localStorage.setItem("stillStrongPoints", String(state.points));
  localStorage.setItem("stillStrongHabits", JSON.stringify(state.habits));
  localStorage.setItem("stillStrongCompletedSets", JSON.stringify(state.completedSets));
  localStorage.setItem("stillStrongCurrentSessionSets", String(state.currentSessionSets));
  localStorage.setItem("stillStrongSessionHistory", JSON.stringify(state.sessionHistory));
  localStorage.setItem("stillStrongCustomExercises", JSON.stringify(state.customExercises));
  localStorage.setItem("stillStrongRemovedExercises", JSON.stringify(state.removedExercises));
  localStorage.setItem("stillStrongSwappedExercises", JSON.stringify(state.swappedExercises));
  localStorage.setItem("stillStrongQuickMode", state.quickMode);
}

function addPoint(amount = 1) {
  state.points += amount;
  persist();
  renderPoints();
  renderCoach();
}

function syncControls() {
  $("#jointFocus").value = state.jointFocus;
  $("#equipment").value = state.equipment;
  $("#energy").value = state.energy;
  $("#painSlider").value = state.pain;
}

function renderAll() {
  syncControls();
  renderWorkout();
  renderSession();
  renderSwaps();
  renderMeals();
  renderPain();
  renderCoach();
  renderWeek();
  renderPoints();
  renderLibrary();
  renderProgress();
  document.querySelectorAll(".habit").forEach((button) => {
    button.classList.toggle("done", Boolean(state.habits[button.dataset.habit]));
  });
  document.querySelectorAll(".choice-card").forEach((button) => {
    button.classList.toggle("active", button.dataset.quick === state.quickMode);
  });
}

["jointFocus", "equipment", "energy"].forEach((id) => {
  $(`#${id}`).addEventListener("change", (event) => {
    state[id] = event.target.value;
    renderAll();
  });
});

$("#painSlider").addEventListener("input", (event) => {
  state.pain = Number(event.target.value);
  renderPain();
});

$("#refreshPlan").addEventListener("click", () => {
  state.activeIndex = 0;
  renderWorkout();
  renderSession();
  renderSwaps();
  renderCoach();
});

$("#addExercise").addEventListener("click", () => {
  const name = $("#customExerciseName").value.trim();
  const cue = $("#customExerciseCue").value.trim() || "Use a comfortable range and stop if joint pain climbs.";
  const dose = $("#customExerciseDose").value.trim() || "2 x easy";
  if (!name) return;

  state.customExercises.push({
    name,
    cue,
    dose,
    jointFocus: state.jointFocus,
    equipment: state.equipment
  });
  $("#customExerciseName").value = "";
  $("#customExerciseCue").value = "";
  $("#customExerciseDose").value = "";
  persist();
  renderWorkout();
  renderSession();
  renderLibrary();
});

$("#workoutList").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const index = Number(button.dataset.index);
  const original = originalVisibleExercises()[index];
  if (!original) return;
  const key = exerciseKey(original);

  if (button.dataset.action === "remove") {
    state.removedExercises[key] = true;
    delete state.swappedExercises[key];
  }

  if (button.dataset.action === "switch") {
    const equipment = gentleEquipment();
    const options = exerciseLibrary[equipment][state.jointFocus] || exerciseLibrary.chair[state.jointFocus];
    state.swappedExercises[key] = options[Math.min(index, options.length - 1)];
    setQuickStatus("Switched that exercise to a joint-friendlier option. You can keep going.");
  }

  state.activeIndex = Math.min(state.activeIndex, Math.max(0, currentExercises().length - 1));
  persist();
  renderWorkout();
  renderSession();
  renderProgress();
});

document.querySelectorAll(".choice-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.quickMode = button.dataset.quick;
    if (state.quickMode === "workout") {
      state.energy = state.pain >= 5 ? "low" : "steady";
      state.activeIndex = 0;
      setQuickStatus("Workout mode is ready. You can press Start Workout and go one move at a time.");
      renderAll();
      document.querySelector(".workout-panel").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (state.quickMode === "pain") {
      state.energy = "low";
      state.equipment = gentleEquipment();
      state.activeIndex = 0;
      setQuickStatus("Pain-friendly mode is on. The plan now favors smaller ranges and gentler equipment.");
      renderAll();
      document.querySelector("#session").scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setQuickStatus("Track mode is open. Pick one food or habit win and let that count.");
    renderAll();
    document.querySelector("#meals").scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

$("#startWorkout").addEventListener("click", () => {
  state.activeIndex = 0;
  state.completedSets = {};
  state.currentSessionSets = 0;
  persist();
  renderSession();
  renderProgress();
  document.querySelector("#session").scrollIntoView({ behavior: "smooth", block: "start" });
});

$("#completeWorkout").addEventListener("click", () => {
  state.sessionHistory.unshift({
    date: new Date().toISOString(),
    title: `${state.equipment} for ${state.jointFocus}`,
    sets: state.currentSessionSets,
    pain: state.pain
  });
  state.sessionHistory = state.sessionHistory.slice(0, 10);
  state.completedSets = {};
  state.currentSessionSets = 0;
  addPoint(3);
  persist();
  renderSession();
  renderProgress();
});
$("#completeMeals").addEventListener("click", () => addPoint(2));

$("#prevExercise").addEventListener("click", () => {
  const total = currentExercises().length;
  state.activeIndex = (state.activeIndex - 1 + total) % total;
  renderSession();
});

$("#nextExercise").addEventListener("click", () => {
  state.activeIndex = (state.activeIndex + 1) % currentExercises().length;
  renderSession();
});

$("#setDone").addEventListener("click", () => {
  const key = sessionKey(state.activeIndex);
  state.completedSets[key] = (state.completedSets[key] || 0) + 1;
  state.currentSessionSets += 1;
  timerSeconds = 45;
  persist();
  renderSession();
  renderProgress();
});

$("#tooHard").addEventListener("click", () => {
  state.energy = "low";
  state.equipment = gentleEquipment();
  state.activeIndex = Math.min(state.activeIndex, currentExercises().length - 1);
  timerSeconds = 45;
  setQuickStatus("Good call. The app switched you to a gentler version. Modifying counts.");
  persist();
  renderAll();
});

$("#swapMove").addEventListener("click", () => {
  const nextEquipment = state.equipment === "weights" ? "bands" : state.equipment === "bands" ? "chair" : state.equipment === "chair" ? "water" : "weights";
  state.equipment = nextEquipment;
  state.activeIndex = Math.min(state.activeIndex, currentExercises().length - 1);
  setQuickStatus(`Swapped equipment to ${nextEquipment}. Use the option that feels best today.`);
  persist();
  renderAll();
});

$("#timerToggle").addEventListener("click", () => {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    $("#timerToggle").textContent = "Start Timer";
    return;
  }
  $("#timerToggle").textContent = "Pause Timer";
  timerId = setInterval(() => {
    timerSeconds = Math.max(0, timerSeconds - 1);
    $("#timerValue").textContent = formatTimer(timerSeconds);
    if (timerSeconds === 0) {
      clearInterval(timerId);
      timerId = null;
      $("#timerToggle").textContent = "Start Timer";
    }
  }, 1000);
});

$("#timerReset").addEventListener("click", () => {
  timerSeconds = 45;
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  $("#timerToggle").textContent = "Start Timer";
  renderSession();
});

$("#exerciseSearch").addEventListener("input", renderLibrary);

document.querySelectorAll(".meal-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.day = Number(tab.dataset.day);
    renderMeals();
  });
});

document.querySelectorAll(".habit").forEach((button) => {
  button.addEventListener("click", () => {
    const habit = button.dataset.habit;
    state.habits[habit] = !state.habits[habit];
    addPoint(state.habits[habit] ? 1 : -1);
    button.classList.toggle("done", state.habits[habit]);
  });
});

$("#saveNote").addEventListener("click", () => {
  const value = $("#noteBox").value.trim();
  if (!value) return;
  localStorage.setItem("stillStrongLastNote", value);
  $("#noteBox").value = "";
  $("#coachMessage").innerHTML = "<p>Saved. That note is useful data, not homework. Tomorrow gets to be built from what you learned today.</p>";
});

$("#noteBox").value = localStorage.getItem("stillStrongLastNote") || "";
renderAll();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      setQuickStatus("The app still works online. Offline install support was blocked by this browser.");
    });
  });
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  $("#installApp").hidden = false;
});

$("#installApp").addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    setQuickStatus("Use your browser menu and choose Add to Home Screen to install this app.");
    return;
  }

  deferredInstallPrompt.prompt();
  const result = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  $("#installApp").hidden = true;
  if (result.outcome === "accepted") {
    setQuickStatus("Installed. Still Strong is now available from your device home screen.");
  } else {
    setQuickStatus("No problem. You can install later from the browser menu.");
  }
});
