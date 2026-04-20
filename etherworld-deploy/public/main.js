const state = {
  rooms: [],
  avatars: [],
  items: [],
  furnitures: [],
  currentRoom: null,
  currentAvatar: null
};

const els = {
  roomList: document.getElementById("room-list"),
  avatarList: document.getElementById("avatar-list"),
  furnitureList: document.getElementById("furniture-list"),
  roomImage: document.getElementById("room-image"),
  roomTitle: document.getElementById("room-title"),
  roomMeta: document.getElementById("room-meta"),
  avatarPreview: document.getElementById("avatar-preview"),
  avatarSprite: document.getElementById("avatar-sprite"),
  furnitureLayer: document.getElementById("furniture-layer"),
  shopDialog: document.getElementById("shop-dialog"),
  shopAvatars: document.getElementById("shop-avatars"),
  shopItems: document.getElementById("shop-items"),
  openShop: document.getElementById("open-shop"),
  closeShop: document.getElementById("close-shop")
};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

function createCard({ title, subtitle, image, onClick }) {
  const wrapper = document.createElement("article");
  wrapper.className = "data-card";

  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = title;
    wrapper.appendChild(img);
  }

  const strong = document.createElement("strong");
  strong.textContent = title;
  wrapper.appendChild(strong);

  if (subtitle) {
    const small = document.createElement("div");
    small.className = "price-tag";
    small.textContent = subtitle;
    wrapper.appendChild(small);
  }

  const button = document.createElement("button");
  button.className = "ghost-btn";
  button.textContent = "Select";
  button.addEventListener("click", onClick);
  wrapper.appendChild(button);

  return wrapper;
}

function renderRooms() {
  els.roomList.innerHTML = "";
  state.rooms.forEach((room) => {
    els.roomList.appendChild(
      createCard({
        title: room.name,
        subtitle: `${room.size.cols}x${room.size.rows}`,
        image: room.spritePath,
        onClick: () => selectRoom(room.id)
      })
    );
  });
}

function renderAvatars() {
  els.avatarList.innerHTML = "";
  state.avatars.forEach((avatar) => {
    els.avatarList.appendChild(
      createCard({
        title: avatar.name,
        subtitle: avatar.category,
        image: avatar.spritePath,
        onClick: () => selectAvatar(avatar.id)
      })
    );
  });
}

function renderFurnitureCatalog() {
  els.furnitureList.innerHTML = "";
  state.furnitures.forEach((furni) => {
    const card = document.createElement("article");
    card.className = "furniture-card";
    card.innerHTML = `
      <img src="${furni.spritePath}" alt="${furni.name}" />
      <strong>${furni.name}</strong>
      <div class="price-tag">${furni.category}</div>
    `;
    els.furnitureList.appendChild(card);
  });
}

function renderShop() {
  const shopAvatars = state.avatars.filter((avatar) => avatar.category === "botanica-shop");
  const shopItems = state.items.filter((item) => item.category === "cosmetic-shop");

  els.shopAvatars.innerHTML = "";
  shopAvatars.forEach((avatar) => {
    const card = document.createElement("article");
    card.className = "shop-card";
    card.innerHTML = `
      <img src="${avatar.spritePath}" alt="${avatar.name}" />
      <strong>${avatar.name}</strong>
      <div class="price-tag">${avatar.category}</div>
      <button class="primary-btn">Preview</button>
    `;
    card.querySelector("button").addEventListener("click", () => selectAvatar(avatar.id));
    els.shopAvatars.appendChild(card);
  });

  els.shopItems.innerHTML = "";
  shopItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "shop-card";
    card.innerHTML = `
      <img src="${item.spritePath}" alt="${item.name}" />
      <strong>${item.name}</strong>
      <div class="price-tag">${item.price} credits · ${item.rarity}</div>
      <button class="ghost-btn">Equip later</button>
    `;
    els.shopItems.appendChild(card);
  });
}

function selectRoom(roomId) {
  state.currentRoom = state.rooms.find((room) => room.id === roomId) || state.rooms[0];
  if (!state.currentRoom) return;

  els.roomTitle.textContent = state.currentRoom.name;
  els.roomMeta.textContent = `${state.currentRoom.model} · spawn ${state.currentRoom.spawn.x},${state.currentRoom.spawn.y}`;
  els.roomImage.src = state.currentRoom.spritePath;
  renderFurnitureInstances();
}

function selectAvatar(avatarId) {
  state.currentAvatar = state.avatars.find((avatar) => avatar.id === avatarId) || state.avatars[0];
  if (!state.currentAvatar) return;

  els.avatarPreview.src = state.currentAvatar.spritePath;
  els.avatarSprite.src = state.currentAvatar.spritePath;
}

function renderFurnitureInstances() {
  els.furnitureLayer.innerHTML = "";
  if (!state.currentRoom) return;

  const catalog = new Map(state.furnitures.map((f) => [f.id, f]));
  state.currentRoom.defaultFurniture.forEach((placed, index) => {
    const furni = catalog.get(placed.furnitureId);
    if (!furni) return;

    const img = document.createElement("img");
    img.src = furni.spritePath;
    img.alt = furni.name;
    img.className = "furniture-instance";
    img.style.width = `${placed.furnitureId.includes("desk") ? 120 : 92}px`;
    img.style.left = `${18 + placed.x * 6.4}%`;
    img.style.top = `${15 + placed.y * 6}%`;
    img.style.zIndex = String(50 + index);
    els.furnitureLayer.appendChild(img);
  });
}

async function boot() {
  const [rooms, avatars, items, furnitures] = await Promise.all([
    loadJson("../data/rooms.json"),
    loadJson("../data/avatars.json"),
    loadJson("../data/items.json"),
    loadJson("../data/furnitures.json")
  ]);

  state.rooms = rooms;
  state.avatars = avatars;
  state.items = items;
  state.furnitures = furnitures;

  renderRooms();
  renderAvatars();
  renderFurnitureCatalog();
  renderShop();

  selectRoom(rooms[0]?.id);
  selectAvatar(avatars[0]?.id);
}

els.openShop.addEventListener("click", () => els.shopDialog.showModal());
els.closeShop.addEventListener("click", () => els.shopDialog.close());

boot().catch((error) => {
  console.error(error);
  els.roomTitle.textContent = "Failed to load data";
  els.roomMeta.textContent = error.message;
});
