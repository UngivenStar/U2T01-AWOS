/* =============================================
   SkyView — Bluesky Explorer
   Consumes: AT Protocol (api.bsky.app)
   Public API + Authenticated API
   ============================================= */

"use strict";

// ── API CONFIG ──────────────────────────────────────
const API = "https://public.api.bsky.app/xrpc";
const AUTH_API = "https://bsky.social/xrpc";

// ── STATE ───────────────────────────────────────────
let state = {
  session: null,         // { accessJwt, did, handle }
  feedCursor: null,
  trendingCursor: null,
};

// ── DOM REFS ────────────────────────────────────────
const $ = id => document.getElementById(id);

const dom = {
  loginBtn:          $("login-btn"),
  loginStatus:       $("login-status"),
  handleInput:       $("handle"),
  passwordInput:     $("app-password"),
  searchBtn:         $("search-btn"),
  searchHandle:      $("search-handle"),
  feedContainer:     $("feed-container"),
  profileContainer:  $("profile-container"),
  trendingContainer: $("trending-container"),
  postCard:          $("post-card"),
  postText:          $("post-text"),
  postBtn:           $("post-btn"),
  postStatus:        $("post-status"),
  charCount:         $("char-count"),
  toast:             $("toast"),
  tabs:              document.querySelectorAll(".tab"),
  tabContents:       document.querySelectorAll(".tab-content"),
  refreshFeedBtn:    $("refresh-feed-btn"),
  refreshTrendingBtn:$("refresh-trending-btn"),
};

// ── INIT ────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  loadPublicFeed();
  loadTrending();
});

function bindEvents() {
  dom.loginBtn.addEventListener("click", handleLogin);
  dom.searchBtn.addEventListener("click", handleSearch);
  dom.postBtn.addEventListener("click", handlePost);
  dom.refreshFeedBtn.addEventListener("click", () => { dom.feedContainer.innerHTML = skeletonHTML(); loadPublicFeed(); });
  dom.refreshTrendingBtn.addEventListener("click", () => { dom.trendingContainer.innerHTML = skeletonHTML(2); loadTrending(); });

  dom.postText.addEventListener("input", () => {
    dom.charCount.textContent = dom.postText.value.length;
  });

  dom.tabs.forEach(tab => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Enter key on search
  dom.searchHandle.addEventListener("keydown", e => { if (e.key === "Enter") handleSearch(); });
  dom.handleInput.addEventListener("keydown", e => { if (e.key === "Enter") handleLogin(); });
}

// ── TAB SWITCHING ───────────────────────────────────
function switchTab(tabId) {
  dom.tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
  dom.tabContents.forEach(c => c.classList.toggle("active", c.id === `tab-${tabId}`));
}

// ── AUTH: LOGIN ─────────────────────────────────────
async function handleLogin() {
  const identifier = dom.handleInput.value.trim();
  const password = dom.passwordInput.value.trim();

  if (!identifier || !password) {
    setStatus(dom.loginStatus, "Completa ambos campos.", "error");
    return;
  }

  dom.loginBtn.disabled = true;
  setStatus(dom.loginStatus, "Conectando...", "loading");

  try {
    const res = await fetch(`${AUTH_API}/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Credenciales incorrectas");
    }

    const data = await res.json();
    state.session = { accessJwt: data.accessJwt, did: data.did, handle: data.handle };

    setStatus(dom.loginStatus, `✓ Bienvenido, @${data.handle}`, "success");
    dom.postCard.classList.remove("hidden");
    showToast(`Conectado como @${data.handle}`, "success");

    // Load authenticated feed
    loadAuthFeed();

  } catch (err) {
    setStatus(dom.loginStatus, `Error: ${err.message}`, "error");
  } finally {
    dom.loginBtn.disabled = false;
  }
}

// ── FEED: PUBLIC ────────────────────────────────────
async function loadPublicFeed() {
  try {
    const res = await fetch(`${API}/app.bsky.feed.getTimeline?limit=20`);

    if (!res.ok) throw new Error("No se pudo cargar el feed");
    const data = await res.json();

    if (!data.feed || data.feed.length === 0) {
      dom.feedContainer.innerHTML = emptyHTML("No hay publicaciones en este momento.");
      return;
    }

    renderPosts(dom.feedContainer, data.feed);
  } catch (err) {
    // Fallback to discover feed
    loadDiscoverFeed();
  }
}

// ── FEED: AUTHENTICATED ─────────────────────────────
async function loadAuthFeed() {
  if (!state.session) return;

  try {
    const res = await fetch(`${AUTH_API}/app.bsky.feed.getTimeline?limit=20`, {
      headers: { "Authorization": `Bearer ${state.session.accessJwt}` },
    });

    if (!res.ok) throw new Error();
    const data = await res.json();

    if (data.feed && data.feed.length > 0) {
      renderPosts(dom.feedContainer, data.feed);
      dom.feedContainer.insertAdjacentHTML("beforebegin", `
        <p style="font-size:12px;color:var(--sky-light);margin-bottom:8px;font-family:var(--font-mono)">
          ✓ Tu timeline personal
        </p>`);
    }
  } catch (_) { /* keep public feed */ }
}

// ── FEED: DISCOVER (fallback) ───────────────────────
async function loadDiscoverFeed() {
  try {
    const res = await fetch(`${API}/app.bsky.feed.getFeed?feed=at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot&limit=20`);

    if (!res.ok) throw new Error();
    const data = await res.json();

    if (data.feed && data.feed.length > 0) {
      renderPosts(dom.feedContainer, data.feed);
    } else {
      dom.feedContainer.innerHTML = emptyHTML("No se pudieron cargar publicaciones.");
    }
  } catch {
    dom.feedContainer.innerHTML = emptyHTML("No se pudo conectar con Bluesky.");
  }
}

// ── TRENDING ────────────────────────────────────────
async function loadTrending() {
  try {
    const res = await fetch(`${API}/app.bsky.feed.getFeed?feed=at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot&limit=15`);

    if (!res.ok) throw new Error();
    const data = await res.json();

    if (data.feed && data.feed.length > 0) {
      renderPosts(dom.trendingContainer, data.feed);
    } else {
      dom.trendingContainer.innerHTML = emptyHTML("No hay tendencias disponibles.");
    }
  } catch {
    // Try discover feed
    try {
      const res2 = await fetch(`${API}/app.bsky.feed.getFeed?feed=at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/hot-classic&limit=15`);
      if (!res2.ok) throw new Error();
      const data2 = await res2.json();
      renderPosts(dom.trendingContainer, data2.feed || []);
    } catch {
      dom.trendingContainer.innerHTML = emptyHTML("No se pudo cargar tendencias.");
    }
  }
}

// ── PROFILE SEARCH ──────────────────────────────────
async function handleSearch() {
  const handle = dom.searchHandle.value.trim().replace(/^@/, "");
  if (!handle) { showToast("Ingresa un handle válido", "error"); return; }

  dom.profileContainer.innerHTML = `<div class="skeleton-loader"><div class="skeleton-post" style="height:200px"></div></div>`;
  switchTab("profile");

  try {
    const res = await fetch(`${API}/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`);

    if (!res.ok) throw new Error("Perfil no encontrado");
    const profile = await res.json();

    renderProfile(profile);

    // Load user's posts
    const postsRes = await fetch(`${API}/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=10`);
    if (postsRes.ok) {
      const postsData = await postsRes.json();
      const postsEl = document.createElement("div");
      postsEl.className = "posts-list";
      postsEl.innerHTML = `<h3 style="font-size:14px;font-weight:600;color:var(--muted);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">Publicaciones recientes</h3>`;
      dom.profileContainer.appendChild(postsEl);

      if (postsData.feed && postsData.feed.length > 0) {
        renderPosts(postsEl, postsData.feed);
      } else {
        postsEl.innerHTML += emptyHTML("Sin publicaciones recientes.");
      }
    }

  } catch (err) {
    dom.profileContainer.innerHTML = `<div class="profile-empty"><span class="empty-icon">⚠</span><p>${err.message}</p></div>`;
  }
}

// ── POST: CREATE ────────────────────────────────────
async function handlePost() {
  if (!state.session) { showToast("Primero inicia sesión", "error"); return; }

  const text = dom.postText.value.trim();
  if (!text) { setStatus(dom.postStatus, "Escribe algo antes de publicar.", "error"); return; }
  if (text.length > 300) { setStatus(dom.postStatus, "Máximo 300 caracteres.", "error"); return; }

  dom.postBtn.disabled = true;
  setStatus(dom.postStatus, "Publicando...", "loading");

  try {
    const res = await fetch(`${AUTH_API}/com.atproto.repo.createRecord`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.session.accessJwt}`,
      },
      body: JSON.stringify({
        repo: state.session.did,
        collection: "app.bsky.feed.post",
        record: {
          $type: "app.bsky.feed.post",
          text,
          createdAt: new Date().toISOString(),
          langs: ["es"],
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al publicar");
    }

    dom.postText.value = "";
    dom.charCount.textContent = "0";
    setStatus(dom.postStatus, "¡Publicado exitosamente! ⬡", "success");
    showToast("Publicación enviada a Bluesky", "success");

    // Refresh feed after 1s
    setTimeout(() => { loadAuthFeed(); }, 1000);

  } catch (err) {
    setStatus(dom.postStatus, `Error: ${err.message}`, "error");
  } finally {
    dom.postBtn.disabled = false;
  }
}

// ── RENDER: POSTS ───────────────────────────────────
function renderPosts(container, feedItems) {
  container.innerHTML = "";

  feedItems.forEach(item => {
    const post = item.post;
    if (!post) return;

    const author = post.author || {};
    const record = post.record || {};
    const text = record.text || "";
    const date = record.createdAt ? formatDate(record.createdAt) : "";
    const likes = post.likeCount || 0;
    const replies = post.replyCount || 0;
    const reposts = post.repostCount || 0;
    const displayName = author.displayName || author.handle || "Usuario";
    const handle = author.handle || "";
    const avatarUrl = author.avatar || "";

    // Check for images
    let imageHTML = "";
    const embed = post.embed;
    if (embed && embed.$type === "app.bsky.embed.images#view" && embed.images) {
      embed.images.slice(0, 1).forEach(img => {
        imageHTML += `<img class="post-image" src="${escapeAttr(img.thumb || img.fullsize)}" alt="${escapeAttr(img.alt || '')}" loading="lazy" />`;
      });
    }

    const avatarHTML = avatarUrl
      ? `<img class="post-avatar" src="${escapeAttr(avatarUrl)}" alt="${escapeAttr(displayName)}" loading="lazy" onerror="this.outerHTML='<div class=&quot;post-avatar-fallback&quot;>${escapeHTML(displayName.charAt(0).toUpperCase())}</div>'" />`
      : `<div class="post-avatar-fallback">${escapeHTML(displayName.charAt(0).toUpperCase())}</div>`;

    const card = document.createElement("article");
    card.className = "post-card";
    card.innerHTML = `
      <div class="post-top">
        ${avatarHTML}
        <div class="post-author-info">
          <div class="post-display-name">${escapeHTML(displayName)}</div>
          <div class="post-handle">@${escapeHTML(handle)}</div>
        </div>
        <div class="post-time">${date}</div>
      </div>
      <div class="post-text">${escapeHTML(text)}</div>
      ${imageHTML}
      <div class="post-stats">
        <div class="post-stat"><span>💬</span> ${replies}</div>
        <div class="post-stat"><span>🔁</span> ${reposts}</div>
        <div class="post-stat"><span>♡</span> ${likes}</div>
      </div>
    `;
    container.appendChild(card);
  });
}

// ── RENDER: PROFILE ─────────────────────────────────
function renderProfile(p) {
  const bannerHTML = p.banner
    ? `<img src="${escapeAttr(p.banner)}" alt="banner" loading="lazy" />`
    : "";
  const avatarHTML = p.avatar
    ? `<img class="profile-avatar" src="${escapeAttr(p.avatar)}" alt="${escapeAttr(p.displayName || p.handle)}" loading="lazy" />`
    : `<div class="profile-avatar" style="background:linear-gradient(135deg,var(--sky-dim),var(--sky));display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#fff;">${escapeHTML((p.displayName || p.handle || "?").charAt(0).toUpperCase())}</div>`;

  dom.profileContainer.innerHTML = `
    <div class="profile-card">
      <div class="profile-banner">${bannerHTML}<div class="profile-avatar-wrap">${avatarHTML}</div></div>
      <div class="profile-body">
        <div class="profile-display-name">${escapeHTML(p.displayName || p.handle)}</div>
        <div class="profile-handle-line">@${escapeHTML(p.handle)}</div>
        ${p.description ? `<p class="profile-bio">${escapeHTML(p.description)}</p>` : ""}
        <div class="profile-stats">
          <div><div class="profile-stat-val">${(p.followersCount || 0).toLocaleString()}</div><div class="profile-stat-label">Seguidores</div></div>
          <div><div class="profile-stat-val">${(p.followsCount || 0).toLocaleString()}</div><div class="profile-stat-label">Siguiendo</div></div>
          <div><div class="profile-stat-val">${(p.postsCount || 0).toLocaleString()}</div><div class="profile-stat-label">Posts</div></div>
        </div>
      </div>
    </div>
  `;
}

// ── HELPERS ─────────────────────────────────────────
function formatDate(isoStr) {
  try {
    const d = new Date(isoStr);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60)   return `${Math.floor(diff)}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  } catch { return ""; }
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  if (!str) return "";
  return str.replace(/"/g, "&quot;");
}

function setStatus(el, msg, type) {
  el.textContent = msg;
  el.className = `status-msg ${type}`;
}

function showToast(msg, type = "default") {
  dom.toast.textContent = msg;
  dom.toast.className = `toast visible ${type}`;
  setTimeout(() => { dom.toast.className = "toast hidden"; }, 3000);
}

function skeletonHTML(count = 3) {
  return `<div class="skeleton-loader">${Array(count).fill('<div class="skeleton-post"></div>').join("")}</div>`;
}

function emptyHTML(msg) {
  return `<div class="profile-empty"><span class="empty-icon">⬡</span><p>${escapeHTML(msg)}</p></div>`;
}