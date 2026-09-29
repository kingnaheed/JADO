const profiles = [
  {
    name: "Maya Chen", age: 27, location: "2 miles away · Greenpoint",
    bio: "Currently collecting little joys: Sunday markets, terrible puns, and recipes that take all afternoon.",
    interests: ["Film photography", "Food", "Slow mornings"], mutual: true,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1100&q=85"
  },
  {
    name: "Theo James", age: 29, location: "4 miles away · Williamsburg",
    bio: "Architect by day, amateur pasta maker by night. Looking for a plus-one for bookstore wandering.",
    interests: ["Architecture", "Cooking", "Books"], mutual: false,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1100&q=85"
  },
  {
    name: "Nina Patel", age: 26, location: "3 miles away · Fort Greene",
    bio: "I make playlists for people I like and over-order when we share small plates. Your turn to pick the music.",
    interests: ["Live music", "Cooking", "Dogs"], mutual: true,
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1100&q=85"
  },
  {
    name: "Eli Brooks", age: 30, location: "5 miles away · Bed-Stuy",
    bio: "Weekend cyclist, weekday designer. Always up for a long walk that accidentally ends at a good bakery.",
    interests: ["Cycling", "Design", "Coffee"], mutual: true,
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1100&q=85"
  },
  {
    name: "Amara Okafor", age: 28, location: "1 mile away · Clinton Hill",
    bio: "Writer, plant parent, and very committed to finding the city’s best bowl of noodles.",
    interests: ["Writing", "Plants", "Travel"], mutual: false,
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1100&q=85"
  },
  {
    name: "Leo Martin", age: 31, location: "6 miles away · Park Slope",
    bio: "Jazz records, big breakfasts, and plans that leave room for a little spontaneity.",
    interests: ["Jazz", "Brunch", "Museums"], mutual: true,
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1100&q=85"
  }
];

const rooms = [
  { name: "Soft launch Sunday", host: "with Jules", viewers: "128", topic: "LATE NIGHT CHATS", color: "rose", category: "after work", near: true, image: "photo-1534528741775-53994a69daeb" },
  { name: "Make me a playlist", host: "with Kai", viewers: "84", topic: "MUSIC & MOODS", color: "lime", category: "music", near: false, image: "photo-1500648767791-00dcc994a43e" },
  { name: "A table for everyone", host: "with Priya", viewers: "216", topic: "FOOD PEOPLE", color: "blue", category: "near you", near: true, image: "photo-1524504388940-b1c1722653e1" },
  { name: "Unpopular opinions", host: "with Sam", viewers: "67", topic: "JUST FOR FUN", color: "yellow", category: "after work", near: false, image: "photo-1506794778202-cad84cf45f1d" },
  { name: "Little wins club", host: "with Noa", viewers: "53", topic: "GOOD ENERGY", color: "blue", category: "near you", near: true, image: "photo-1529139574466-a303027c1d8b" },
  { name: "Ask me anything-ish", host: "with Drew", viewers: "102", topic: "OPEN CONVERSATION", color: "rose", category: "after work", near: false, image: "photo-1517841905240-472988babdf9" }
];

const storageKeys = { matches: "jado.matches", saved: "jado.saved" };
const profilesByName = new Map(profiles.map((profile) => [profile.name, profile]));

function loadProfiles(key) {
  try {
    const names = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(names) ? names.map((name) => profilesByName.get(name)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function saveProfiles(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items.map((profile) => profile.name)));
    return true;
  } catch {
    return false;
  }
}

const state = { profileIndex: 0, matches: loadProfiles(storageKeys.matches), saved: loadProfiles(storageKeys.saved), toastTimer: null, cameraStream: null, profileObserver: null };
const elements = {
  profileFeed: document.querySelector("#profile-feed"), suggestionList: document.querySelector("#suggestion-list"),
  matchCount: document.querySelector(".match-count"), matchesTotal: document.querySelector("#matches-total"),
  matchesList: document.querySelector("#matches-list"), emptyMatches: document.querySelector("#empty-matches"),
  toast: document.querySelector("#toast"), roomGrid: document.querySelector("#room-grid"),
  cameraDialog: document.querySelector("#camera-dialog"), cameraVideo: document.querySelector("#camera-video"),
  cameraPlaceholder: document.querySelector("#camera-placeholder"), cameraToggle: document.querySelector("#camera-toggle"),
  cameraEnd: document.querySelector("#camera-end")
};

function renderProfile() {
  elements.profileFeed.replaceChildren(...profiles.map((profile, index) => {
    const card = document.createElement("article");
    card.className = "profile-card";
    card.dataset.profileIndex = index;
    card.setAttribute("aria-label", `${profile.name}, ${profile.age}`);
    const isSaved = state.saved.includes(profile);
    card.innerHTML = `<div class="profile-photo-wrap"><img class="profile-photo" src="${profile.image}" alt="${profile.name}, ${profile.age}" /><div class="photo-topline"><span class="verified">✓ Verified</span><span class="photo-number">${String(index + 1).padStart(2, "0")} / ${String(profiles.length).padStart(2, "0")}</span></div><div class="photo-caption"><span class="photo-online"></span> Recently active</div><div class="photo-gradient"></div><div class="profile-name-block"><h2>${profile.name}</h2><span>${profile.age}</span><p>${profile.location}</p></div><div class="profile-details"><p class="profile-bio">${profile.bio}</p><div class="interest-list">${profile.interests.map((interest) => `<span class="interest-tag">${interest}</span>`).join("")}</div></div><div class="profile-cta"><button class="keep-button ${isSaved ? "is-kept" : ""}" data-action="keep" aria-label="Keep ${profile.name}" title="Keep">${isSaved ? "KEPT" : "KEEP"}</button></div><div class="profile-actions"><button class="action-button pass-button" data-action="dislike" aria-label="Dislike ${profile.name}" title="Dislike">×</button><button class="action-button like-button" data-action="like" aria-label="Like ${profile.name}" title="Like">♥</button><button class="action-button profile-message-button" data-action="message" aria-label="Message ${profile.name}" title="Message">↗</button></div></div>`;
    return card;
  }));

  state.profileObserver?.disconnect();
  state.profileObserver = new IntersectionObserver((entries) => {
    const activeEntry = entries.filter((entry) => entry.isIntersecting).sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
    if (!activeEntry) return;
    const activeIndex = Number(activeEntry.target.dataset.profileIndex);
    if (activeIndex !== state.profileIndex) {
      state.profileIndex = activeIndex;
      renderSuggestions();
    }
  }, { root: elements.profileFeed, threshold: [0.6, 0.8, 1] });
  elements.profileFeed.querySelectorAll(".profile-card").forEach((card) => state.profileObserver.observe(card));
}

function renderSuggestions() {
  const suggestions = profiles.filter((_, index) => index !== state.profileIndex).slice(0, 3);
  elements.suggestionList.replaceChildren(...suggestions.map((profile) => {
    const row = document.createElement("button");
    row.className = "suggestion-row";
    row.innerHTML = `<img src="${profile.image}" alt="" /><span class="suggestion-info"><strong>${profile.name}, ${profile.age}</strong><span>${profile.interests[0]} · nearby</span></span><span class="suggestion-heart">♡</span>`;
    row.addEventListener("click", () => {
      goToProfile(profiles.indexOf(profile));
      renderSuggestions();
    });
    return row;
  }));
}

function renderMatches() {
  elements.matchCount.textContent = state.matches.length;
  elements.matchesTotal.textContent = state.matches.length;
  elements.emptyMatches.hidden = state.matches.length > 0;
  elements.matchesList.replaceChildren(...state.matches.map((profile) => {
    const row = document.createElement("article");
    row.className = "match-row";
    row.innerHTML = `<img src="${profile.image}" alt="" /><div class="match-person"><strong>${profile.name}, ${profile.age}</strong><span>You both said yes. Say hello?</span></div><button class="message-button">Say hello <span>↗</span></button>`;
    row.querySelector(".message-button").addEventListener("click", () => showToast(`A message to ${profile.name} is coming soon.`));
    return row;
  }));
}

function renderRooms() {
  const selectedFilter = document.querySelector(".live-filter.is-selected")?.textContent.toLowerCase();
  const visibleRooms = rooms.filter((room) => selectedFilter === "for you"
    || (selectedFilter === "near you" && room.near)
    || room.category === selectedFilter);
  elements.roomGrid.replaceChildren(...visibleRooms.map((room, index) => {
    const card = document.createElement("article");
    card.className = `room-card room-${room.color}`;
    card.innerHTML = `<div class="room-cover" style="--room-image:url('https://images.unsplash.com/${room.image}?auto=format&fit=crop&w=760&q=80')"><span class="room-live"><i></i> LIVE</span><span class="room-viewers">◉ ${room.viewers}</span><span class="room-stamp">✳</span></div><div class="room-info"><span class="eyebrow">${room.topic}</span><h2>${room.name}</h2><p>${room.host}</p><button class="join-room" data-room="${index}">Join room <span>↗</span></button></div>`;
    card.querySelector(".join-room").addEventListener("click", () => openCamera(room.name));
    return card;
  }));
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2600);
}

function advanceProfile() {
  goToProfile(Math.min(state.profileIndex + 1, profiles.length - 1));
}

function goToProfile(index) {
  const target = elements.profileFeed.querySelector(`[data-profile-index="${index}"]`);
  if (!target) return;
  state.profileIndex = index;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  renderSuggestions();
}

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    document.querySelectorAll(".view-panel").forEach((panel) => {
      const visible = panel.id === `${view}-view`;
      panel.hidden = !visible;
      panel.classList.toggle("is-visible", visible);
    });
    document.querySelectorAll(".nav-item").forEach((item) => {
      const active = item.dataset.view === view;
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });
  });
});

elements.profileFeed.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const profile = profiles[Number(actionButton.closest(".profile-card").dataset.profileIndex)];

  if (actionButton.dataset.action === "message") {
    showToast(`A message to ${profile.name} is coming soon.`);
    return;
  }

  if (actionButton.dataset.action === "keep") {
    if (state.saved.includes(profile)) {
      showToast(`${profile.name} is already in your keeps.`);
      return;
    }

    state.saved.push(profile);
    if (!saveProfiles(storageKeys.saved, state.saved)) {
      state.saved.pop();
      showToast("Could not save this profile in your browser.");
      return;
    }
    actionButton.textContent = "KEPT";
    actionButton.classList.add("is-kept");
    showToast(`${profile.name} saved to your keeps.`);
    return;
  }

  if (actionButton.dataset.action === "like") {
    if (profile.mutual && !state.matches.includes(profile)) {
      state.matches.unshift(profile);
      saveProfiles(storageKeys.matches, state.matches);
      renderMatches();
      showToast(`It’s mutual! You and ${profile.name} like each other.`);
    } else {
      showToast(`Like sent to ${profile.name}.`);
    }
  } else {
    showToast(`You passed on ${profile.name}.`);
  }
  goToProfile(Math.min(Number(actionButton.closest(".profile-card").dataset.profileIndex) + 1, profiles.length - 1));
});

document.querySelector("#filter-button").addEventListener("click", () => showToast("Your filters: within 10 miles · ages 25–32"));
document.querySelector("#prompt-button").addEventListener("click", () => showToast("Opener copied: “What’s a small thing that always makes your day better?”"));
document.querySelectorAll(".live-filter").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".live-filter").forEach((filter) => filter.classList.toggle("is-selected", filter === button));
  renderRooms();
}));

async function openCamera(roomName = "") {
  document.querySelector("#camera-title").textContent = roomName ? `Join ${roomName}.` : "Go live.";
  elements.cameraDialog.showModal();
}

async function startCamera() {
  if (!navigator.mediaDevices?.getUserMedia) {
    showToast("Camera access needs a supported browser on localhost or HTTPS.");
    return;
  }
  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    elements.cameraVideo.srcObject = state.cameraStream;
    elements.cameraVideo.hidden = false;
    elements.cameraPlaceholder.hidden = true;
    elements.cameraToggle.disabled = true;
    elements.cameraToggle.textContent = "Camera on";
    elements.cameraEnd.disabled = false;
  } catch (error) {
    const message = error.name === "NotAllowedError" ? "Camera permission was denied. Allow access in your browser settings to preview." : "Could not open your camera. Check that it is connected and not in use by another app.";
    document.querySelector("#camera-message").textContent = message;
  }
}

function stopCamera() {
  state.cameraStream?.getTracks().forEach((track) => track.stop());
  state.cameraStream = null;
  elements.cameraVideo.srcObject = null;
  elements.cameraVideo.hidden = true;
  elements.cameraPlaceholder.hidden = false;
  elements.cameraToggle.disabled = false;
  elements.cameraToggle.textContent = "Turn on camera";
  elements.cameraEnd.disabled = true;
}

document.querySelector("#go-live-button").addEventListener("click", () => openCamera());
elements.cameraToggle.addEventListener("click", startCamera);
elements.cameraEnd.addEventListener("click", stopCamera);
elements.cameraDialog.addEventListener("close", stopCamera);

renderProfile();
renderSuggestions();
renderMatches();
renderRooms();