/* ═══════════════════════════════════════════════════════
   StreamVibe — YouTube Data API v3 Integration
   ═══════════════════════════════════════════════════════ */

// ── Config ────────────────────────────────────────────
// Replace with your YouTube Data API v3 key from:
// https://console.cloud.google.com/apis/credentials
const API_KEY = 'AIzaSyBBiqDkuc8n8Iru3OJgqep0jNIEu5CCCHo';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ── State ─────────────────────────────────────────────
let currentRegion = 'MX';
let activeTab = 'trending';

// ── DOM Refs ──────────────────────────────────────────
const tabs         = document.querySelectorAll('.tab');
const panels       = document.querySelectorAll('.panel');
const trendingGrid = document.getElementById('trending-grid');
const searchResults= document.getElementById('search-results');
const searchInput  = document.getElementById('search-input');
const searchBtn    = document.getElementById('search-btn');
const regionSelect = document.getElementById('region-select');
const ytFrame      = document.getElementById('yt-frame');
const videoMeta    = document.getElementById('video-meta');
const playerEmpty  = document.getElementById('player-empty');
const playerLayout = document.getElementById('player-layout');
const relatedVids  = document.getElementById('related-videos');
const toastEl      = document.getElementById('toast');

// ── Utilities ─────────────────────────────────────────
function showToast(msg, duration = 3000) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), duration);
}

function formatViews(n) {
  n = parseInt(n, 10);
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M vistas`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K vistas`;
  return `${n} vistas`;
}

function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function bestThumb(thumbnails) {
  return (thumbnails.maxres || thumbnails.high || thumbnails.medium || thumbnails.default)?.url || '';
}

// ── API Calls ─────────────────────────────────────────
async function apiGet(endpoint, params = {}) {
  if (API_KEY === 'YOUR_YOUTUBE_API_KEY') {
    throw new Error('API_KEY_MISSING');
  }
  params.key = API_KEY;
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/${endpoint}?${qs}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'API error');
  }
  return res.json();
}

// ── DEMO DATA (used when no API key is configured) ────
function getDemoVideos(count = 9) {
  const demos = [
    { id: 'dQw4w9WgXcQ', title: 'Rick Astley – Never Gonna Give You Up', channel: 'Rick Astley', views: '1.4B', duration: '3:33' },
    { id: 'JGwWNGJdvx8', title: 'Ed Sheeran – Shape of You', channel: 'Ed Sheeran', views: '5.9B', duration: '4:24' },
    { id: 'kXYiU_JCYtU', title: 'Linkin Park – Numb', channel: 'Linkin Park', views: '1.8B', duration: '3:07' },
    { id: 'YR5ApYxkU-U', title: 'Peso Pluma – LADY GAGA', channel: 'Peso Pluma', views: '823M', duration: '3:01' },
    { id: 'RgKAFK5djSk', title: 'Wiz Khalifa – See You Again', channel: 'Wiz Khalifa', views: '6.2B', duration: '3:50' },
    { id: 'hT_nvWreIhg', title: 'OneRepublic – Counting Stars', channel: 'OneRepublic', views: '3.3B', duration: '4:17' },
    { id: 'CevxZvSJLk8', title: 'Katy Perry – Roar', channel: 'Katy Perry', views: '4.1B', duration: '3:43' },
    { id: 'lp-EO5I60KA', title: 'Shakira – Waka Waka', channel: 'Shakira', views: '3.8B', duration: '3:36' },
    { id: '09R8_2nJtjg', title: 'Maroon 5 – Sugar', channel: 'Maroon 5', views: '3.9B', duration: '3:56' },
  ];
  return demos.slice(0, count);
}

function renderDemoCard(v) {
  const thumb = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
  return `
    <div class="video-card" data-id="${v.id}" data-title="${escapeHtml(v.title)}" data-channel="${escapeHtml(v.channel)}">
      <div class="thumb-wrap">
        <img src="${thumb}" alt="${escapeHtml(v.title)}" loading="lazy" />
        <div class="play-overlay"><span>▶</span></div>
        <span class="duration-badge">${v.duration}</span>
      </div>
      <div class="card-body">
        <p class="card-title">${escapeHtml(v.title)}</p>
        <div class="card-meta">
          <span>${escapeHtml(v.channel)}</span>
          <span class="view-count">${v.views} vistas</span>
        </div>
      </div>
    </div>`;
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Render Functions ──────────────────────────────────
function renderVideoCard(video, detail = null) {
  const id       = video.id?.videoId || video.id;
  const snippet  = video.snippet;
  const thumb    = bestThumb(snippet.thumbnails);
  const title    = snippet.title;
  const channel  = snippet.channelTitle;
  const views    = detail?.statistics?.viewCount ? formatViews(detail.statistics.viewCount) : '';
  const duration = detail?.contentDetails?.duration ? formatDuration(detail.contentDetails.duration) : '';

  return `
    <div class="video-card" data-id="${id}" data-title="${escapeHtml(title)}" data-channel="${escapeHtml(channel)}">
      <div class="thumb-wrap">
        <img src="${thumb}" alt="${escapeHtml(title)}" loading="lazy" />
        <div class="play-overlay"><span>▶</span></div>
        ${duration ? `<span class="duration-badge">${duration}</span>` : ''}
      </div>
      <div class="card-body">
        <p class="card-title">${escapeHtml(title)}</p>
        <div class="card-meta">
          <span>${escapeHtml(channel)}</span>
          ${views ? `<span class="view-count">${views}</span>` : ''}
        </div>
      </div>
    </div>`;
}

// ── Trending ──────────────────────────────────────────
async function loadTrending(region = 'MX') {
  trendingGrid.innerHTML = `<div class="skeleton-grid">
    ${Array(6).fill('<div class="skeleton-card"></div>').join('')}
  </div>`;

  try {
    const data = await apiGet('videos', {
      part: 'snippet,statistics,contentDetails',
      chart: 'mostPopular',
      regionCode: region,
      maxResults: 12,
    });

    if (!data.items?.length) {
      trendingGrid.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No hay videos disponibles</p></div>';
      return;
    }

    trendingGrid.innerHTML = data.items.map(v => renderVideoCard(v, v)).join('');
    attachCardListeners(trendingGrid);
  } catch (err) {
    if (err.message === 'API_KEY_MISSING') {
      // Render demo data
      trendingGrid.innerHTML = `
        <div style="grid-column:1/-1; padding:12px 16px; background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.3); border-radius:10px; font-size:13px; color:#a78bfa; margin-bottom:4px;">
          ⚙️ <strong>Modo Demo</strong> — Configura tu <code>API_KEY</code> en <code>app.js</code> para datos reales de YouTube.
        </div>
        ${getDemoVideos(9).map(renderDemoCard).join('')}`;
      attachCardListeners(trendingGrid);
    } else {
      trendingGrid.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`;
    }
  }
}

// ── Search ────────────────────────────────────────────
async function doSearch(query) {
  if (!query.trim()) return;
  searchResults.innerHTML = `<div class="skeleton-grid">
    ${Array(6).fill('<div class="skeleton-card"></div>').join('')}
  </div>`;

  try {
    const data = await apiGet('search', {
      part: 'snippet',
      type: 'video',
      q: query,
      maxResults: 12,
    });

    if (!data.items?.length) {
      searchResults.innerHTML = '<div class="empty-state"><div class="icon">🔍</div><p>Sin resultados para "' + escapeHtml(query) + '"</p></div>';
      return;
    }

    // Get video details for duration
    const ids = data.items.map(v => v.id?.videoId).filter(Boolean).join(',');
    let detailMap = {};
    try {
      const details = await apiGet('videos', { part: 'contentDetails,statistics', id: ids });
      details.items?.forEach(v => { detailMap[v.id] = v; });
    } catch { /* details optional */ }

    searchResults.innerHTML = data.items.map(v =>
      renderVideoCard(v, detailMap[v.id?.videoId])
    ).join('');
    attachCardListeners(searchResults);
  } catch (err) {
    if (err.message === 'API_KEY_MISSING') {
      searchResults.innerHTML = `
        <div style="grid-column:1/-1; padding:12px 16px; background:rgba(124,58,237,0.12); border:1px solid rgba(124,58,237,0.3); border-radius:10px; font-size:13px; color:#a78bfa; margin-bottom:4px;">
          ⚙️ <strong>Modo Demo</strong> — Configura tu <code>API_KEY</code> en <code>app.js</code> para búsquedas reales.
        </div>
        ${getDemoVideos(6).map(renderDemoCard).join('')}`;
      attachCardListeners(searchResults);
    } else {
      searchResults.innerHTML = `<div class="empty-state"><div class="icon">⚠️</div><p>${err.message}</p></div>`;
    }
  }
}

// ── Player ────────────────────────────────────────────
async function playVideo(id, title, channel) {
  // Switch to player tab
  setActiveTab('player');

  playerEmpty.style.display  = 'none';
  playerLayout.style.display = 'grid';

  ytFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  videoMeta.innerHTML = `
    <h3>${escapeHtml(title)}</h3>
    <div class="meta-row">
      <span>📺 ${escapeHtml(channel)}</span>
      <span>🔗 <a href="https://youtube.com/watch?v=${id}" target="_blank" style="color:var(--accent2)">Ver en YouTube</a></span>
    </div>`;

  // Load related
  relatedVids.innerHTML = `<p class="sidebar-title">Relacionados</p>
    ${Array(4).fill('<div class="skeleton-card" style="height:90px;border-radius:10px;"></div>').join('')}`;

  try {
    const data = await apiGet('search', {
      part: 'snippet',
      type: 'video',
      relatedToVideoId: id,
      maxResults: 6,
    });
    if (data.items?.length) {
      const cards = data.items.map(v => `
        <div class="related-card" data-id="${v.id?.videoId}" data-title="${escapeHtml(v.snippet.title)}" data-channel="${escapeHtml(v.snippet.channelTitle)}">
          <img class="related-thumb" src="${bestThumb(v.snippet.thumbnails)}" alt="" />
          <div class="related-info">
            <p class="related-title">${escapeHtml(v.snippet.title)}</p>
            <p class="related-channel">${escapeHtml(v.snippet.channelTitle)}</p>
          </div>
        </div>`).join('');
      relatedVids.innerHTML = `<p class="sidebar-title">Relacionados</p>${cards}`;
      relatedVids.querySelectorAll('.related-card').forEach(card => {
        card.addEventListener('click', () =>
          playVideo(card.dataset.id, card.dataset.title, card.dataset.channel));
      });
    } else {
      relatedVids.innerHTML = '<p class="sidebar-title">Relacionados</p>';
    }
  } catch {
    relatedVids.innerHTML = '<p class="sidebar-title">Relacionados</p>';
  }
}

// ── Card Click Listeners ──────────────────────────────
function attachCardListeners(container) {
  container.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      playVideo(card.dataset.id, card.dataset.title, card.dataset.channel);
    });
  });
}

// ── Tab Logic ─────────────────────────────────────────
function setActiveTab(name) {
  activeTab = name;
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  panels.forEach(p => p.classList.toggle('active', p.id === `panel-${name}`));
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
});

// ── Events ────────────────────────────────────────────
regionSelect?.addEventListener('change', e => {
  currentRegion = e.target.value;
  loadTrending(currentRegion);
});

searchBtn?.addEventListener('click', () => doSearch(searchInput.value));
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doSearch(searchInput.value);
});

document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', () => {
    searchInput.value = tag.dataset.q;
    doSearch(tag.dataset.q);
  });
});

// ── Init ──────────────────────────────────────────────
loadTrending(currentRegion);