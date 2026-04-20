import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");

const requiredEnv = [
  "NEXT_PUBLIC_POCKETBASE_URL",
  "POCKETBASE_ADMIN_EMAIL",
  "POCKETBASE_ADMIN_PASSWORD"
];

function parseEnvFile(content) {
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const eqIndex = line.indexOf("=");

      if (eqIndex === -1) {
        return acc;
      }

      acc[line.slice(0, eqIndex).trim()] = line.slice(eqIndex + 1).trim();
      return acc;
    }, {});
}

async function loadLocalEnv() {
  try {
    const content = await fs.readFile(envPath, "utf8");
    const parsed = parseEnvFile(content);

    for (const [key, value] of Object.entries(parsed)) {
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Variables can already be present in the shell.
  }
}

function ensureEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Variables manquantes: ${missing.join(", ")}`);
  }
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  return body;
}

function field(name, type, extra = {}) {
  return {
    system: false,
    name,
    type,
    required: false,
    presentable: false,
    unique: false,
    options: {},
    ...extra
  };
}

async function authAdmin(baseUrl, email, password) {
  const result = await request(`${baseUrl}/api/admins/auth-with-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      identity: email,
      password
    })
  });

  return result.token;
}

async function listCollections(baseUrl, token) {
  const payload = await request(`${baseUrl}/api/collections?perPage=200`, {
    headers: {
      Authorization: token
    }
  });

  return payload.items ?? [];
}

async function upsertCollection(baseUrl, token, existingCollections, payload) {
  const current = existingCollections.find((item) => item.name === payload.name);
  const method = current ? "PATCH" : "POST";
  const url = current
    ? `${baseUrl}/api/collections/${current.id}`
    : `${baseUrl}/api/collections`;

  const body = {
    name: payload.name,
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: "",
    updateRule: "",
    deleteRule: "",
    schema: payload.schema
  };

  const result = await request(url, {
    method,
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const index = existingCollections.findIndex((item) => item.name === payload.name);

  if (index >= 0) {
    existingCollections[index] = result;
  } else {
    existingCollections.push(result);
  }

  return result;
}

async function findFirst(baseUrl, token, collection, filter) {
  const payload = await request(
    `${baseUrl}/api/collections/${collection}/records?perPage=1&filter=${encodeURIComponent(filter)}`,
    {
      headers: {
        Authorization: token
      }
    }
  );

  return payload.items?.[0] ?? null;
}

async function upsertRecord(baseUrl, token, collection, filter, data) {
  const current = await findFirst(baseUrl, token, collection, filter);
  const method = current ? "PATCH" : "POST";
  const url = current
    ? `${baseUrl}/api/collections/${collection}/records/${current.id}`
    : `${baseUrl}/api/collections/${collection}/records`;

  return request(url, {
    method,
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
}

async function ensureDemoUser(baseUrl, token) {
  const current = await findFirst(baseUrl, token, "users", 'email="ether@demo.local"');

  if (current) {
    return current;
  }

  return request(`${baseUrl}/api/collections/users/records`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "ether@demo.local",
      password: "etherworld123",
      passwordConfirm: "etherworld123",
      name: "Ether Demo"
    })
  });
}

async function resetRoomFurnitures(baseUrl, token, roomId, ownerId) {
  const payload = await request(
    `${baseUrl}/api/collections/furnitures/records?perPage=200&filter=${encodeURIComponent(`room="${roomId}"`)}`,
    {
      headers: {
        Authorization: token
      }
    }
  );

  for (const item of payload.items ?? []) {
    await request(`${baseUrl}/api/collections/furnitures/records/${item.id}`, {
      method: "DELETE",
      headers: {
        Authorization: token
      }
    });
  }

  const furnitures = [
    { type: "crystal", x: 3, y: 2, z: 0, rotation: 0 },
    { type: "bed", x: 8, y: 3, z: 0, rotation: 1 },
    { type: "neon", x: 2, y: 8, z: 0, rotation: 0 }
  ];

  for (const item of furnitures) {
    await request(`${baseUrl}/api/collections/furnitures/records`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...item,
        room: roomId,
        owner: ownerId
      })
    });
  }
}

async function main() {
  await loadLocalEnv();
  ensureEnv();

  const baseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL.replace(/\/$/, "");
  const token = await authAdmin(
    baseUrl,
    process.env.POCKETBASE_ADMIN_EMAIL,
    process.env.POCKETBASE_ADMIN_PASSWORD
  );

  const collections = await listCollections(baseUrl, token);
  const usersCollection = collections.find((item) => item.name === "users");

  if (!usersCollection) {
    throw new Error("La collection users est introuvable.");
  }

  const roomsCollection = await upsertCollection(baseUrl, token, collections, {
    name: "rooms",
    schema: [
      field("owner", "relation", {
        options: {
          collectionId: usersCollection.id,
          cascadeDelete: false,
          minSelect: 0,
          maxSelect: 1
        }
      }),
      field("name", "text", {
        required: true,
        options: {
          min: null,
          max: null,
          pattern: ""
        }
      }),
      field("settings", "json", {
        options: {
          maxSize: 200000
        }
      })
    ]
  });

  await upsertCollection(baseUrl, token, collections, {
    name: "furnitures",
    schema: [
      field("type", "select", {
        required: true,
        options: {
          maxSelect: 1,
          values: ["chair", "table", "bed", "lamp", "crystal", "neon"]
        }
      }),
      field("x", "number", { required: true, options: { min: null, max: null, noDecimal: true } }),
      field("y", "number", { required: true, options: { min: null, max: null, noDecimal: true } }),
      field("z", "number", { required: false, options: { min: null, max: null, noDecimal: true } }),
      field("rotation", "number", { required: false, options: { min: null, max: null, noDecimal: true } }),
      field("room", "relation", {
        options: {
          collectionId: roomsCollection.id,
          cascadeDelete: true,
          minSelect: 0,
          maxSelect: 1
        }
      }),
      field("owner", "relation", {
        options: {
          collectionId: usersCollection.id,
          cascadeDelete: false,
          minSelect: 0,
          maxSelect: 1
        }
      })
    ]
  });

  await upsertCollection(baseUrl, token, collections, {
    name: "inventory",
    schema: [
      field("user", "relation", {
        options: {
          collectionId: usersCollection.id,
          cascadeDelete: true,
          minSelect: 0,
          maxSelect: 1
        }
      }),
      field("item", "select", {
        required: true,
        options: {
          maxSelect: 1,
          values: ["chair", "table", "bed", "lamp", "crystal", "neon"]
        }
      }),
      field("quantity", "number", { required: true, options: { min: 0, max: null, noDecimal: true } })
    ]
  });

  await upsertCollection(baseUrl, token, collections, {
    name: "avatar",
    schema: [
      field("user", "relation", {
        options: {
          collectionId: usersCollection.id,
          cascadeDelete: true,
          minSelect: 0,
          maxSelect: 1
        }
      }),
      field("x", "number", { required: true, options: { min: null, max: null, noDecimal: true } }),
      field("y", "number", { required: true, options: { min: null, max: null, noDecimal: true } }),
      field("direction", "select", {
        options: {
          maxSelect: 1,
          values: ["north", "east", "south", "west"]
        }
      }),
      field("skin", "select", {
        options: {
          maxSelect: 1,
          values: ["ether", "crystal", "shadow"]
        }
      })
    ]
  });

  const demoUser = await ensureDemoUser(baseUrl, token);

  const room = await upsertRecord(baseUrl, token, "rooms", 'name="Ether Suite Premium"', {
    owner: demoUser.id,
    name: "Ether Suite Premium",
    settings: {
      theme: "ethercristal",
      allowGuests: true,
      ambience: 78
    }
  });

  const inventoryItems = [
    ["chair", 2],
    ["table", 1],
    ["bed", 1],
    ["lamp", 2],
    ["crystal", 2],
    ["neon", 2]
  ];

  for (const [item, quantity] of inventoryItems) {
    await upsertRecord(baseUrl, token, "inventory", `user="${demoUser.id}" && item="${item}"`, {
      user: demoUser.id,
      item,
      quantity
    });
  }

  await upsertRecord(baseUrl, token, "avatar", `user="${demoUser.id}"`, {
    user: demoUser.id,
    x: 5,
    y: 8,
    direction: "north",
    skin: "ether"
  });

  await resetRoomFurnitures(baseUrl, token, room.id, demoUser.id);

  console.log("Seed PocketBase legacy termine.");
  console.log(`Instance: ${baseUrl}`);
  console.log("Utilisateur demo: ether@demo.local / etherworld123");
}

main().catch((error) => {
  console.error("Echec du seed PocketBase legacy.");
  console.error(error.message);
  process.exit(1);
});
