'use strict';

const STORAGE_KEY = 'keshi-work-tracker-v1';
const SYNC_KEY = 'keshi-work-tracker-sync-v1';
const GIST_DESCRIPTION = '科室工作推进登记-数据同步';
const GIST_FILE = 'keshi-work-tracker.json';

const STATUSES = [
  { id: 'pending', label: '待启动', css: 'pending' },
  { id: 'active', label: '推进中', css: 'active' },
  { id: 'milestone', label: '阶段完成', css: 'milestone' },
  { id: 'done', label: '已完成', css: 'done' },
  { id: 'blocked', label: '受阻', css: 'blocked' },
];

const RESULTS = [
  { id: '', label: '未填写' },
  { id: 'not_achieved', label: '未达成' },
  { id: 'partial', label: '部分达成' },
  { id: 'basically', label: '基本达成' },
  { id: 'achieved', label: '完全达成' },
  { id: 'exceeded', label: '超额达成' },
];

const ACHIEVED_IDS = new Set(['basically', 'achieved', 'exceeded']);

const ICONS = {
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'calendar': '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'target': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  'clipboard-list': '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>',
  'file-text': '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12h4M10 16h4"/>',
  'database': '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>',
  'search': '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  'chevron-right': '<path d="M9 18l6-6-6-6"/>',
  'trash': '<path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
  'x': '<path d="M18 6L6 18M6 6l12 12"/>',
  'check': '<path d="M20 6L9 17l-5-5"/>',
  'clock': '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  'trend-up': '<path d="M22 7l-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>',
  'sparkles': '<path d="M12 3l1.9 5.8L19.7 10l-5.8 1.9L12 17.7l-1.9-5.8L4.3 10l5.8-1.9z"/><path d="M8 3l.7 2.1L10.8 5.8l-2.1.7L8 8.6l-.7-2.1L5.2 5.8l2.1-.7z"/>',
  'printer': '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  'copy': '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'arrow-left': '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  'edit': '<path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5z"/>',
  'flag': '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
  'cloud': '<path d="M17.5 19a4.5 4.5 0 0 0 .42-8.98 7 7 0 0 0-13.2 2.16A4.5 4.5 0 0 0 6.5 19z"/>',
  'cloud-off': '<path d="M4.9 4.9A4.7 4.7 0 0 0 4 7.5 4.5 4.5 0 0 0 6.5 19h11a4.5 4.5 0 0 0 .9-8.9"/><path d="M3 3l18 18"/>',
  'refresh': '<path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/>',
  'unlink': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'key': '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3L21 2"/><path d="M17 6l3 3"/>',
};

function icon(name) {
  const paths = ICONS[name] || ICONS['flag'];
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + paths + '</svg>';
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function uid() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

function formatDate(value) {
  if (!value) return '未填写';
  const parts = String(value).split('-');
  if (parts.length !== 3) return String(value);
  return parts[0] + '年' + Number(parts[1]) + '月' + Number(parts[2]) + '日';
}

function formatMonth(value) {
  if (!value) return '';
  const parts = String(value).split('-');
  return Number(parts[0]) + '年' + Number(parts[1]) + '月';
}

function statusLabel(id) {
  const found = STATUSES.find((s) => s.id === id);
  return found ? found.label : '未设置';
}

function resultLabel(id) {
  const found = RESULTS.find((r) => r.id === id);
  return found ? found.label : '未填写';
}

function parseOwners(value) {
  return String(value || '')
    .split(/[,，、;；\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function normalizeItem(item) {
  if (!item || typeof item.title !== 'string' || !item.title.trim()) return null;
  return {
    id: item.id || uid(),
    title: String(item.title || '').trim(),
    startDate: item.startDate || todayStr(),
    owner: Array.isArray(item.owner) ? item.owner.map((s) => String(s).trim()).filter(Boolean) : [],
    goal: String(item.goal || ''),
    status: STATUSES.some((s) => s.id === item.status) ? item.status : 'pending',
    entries: (Array.isArray(item.entries) ? item.entries : [])
      .map((e) => ({
        id: e && e.id ? e.id : uid(),
        date: e && e.date ? e.date : todayStr(),
        note: e && e.note ? String(e.note) : '',
        status: e && STATUSES.some((s) => s.id === e.status) ? e.status : 'active',
      }))
      .sort((a, b) => String(a.date).localeCompare(String(b.date))),
    resultStatus: RESULTS.some((r) => r.id === item.resultStatus) ? item.resultStatus : '',
    resultNote: String(item.resultNote || ''),
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

function loadItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.map(normalizeItem).filter(Boolean);
  } catch (err) {
    return [];
  }
}

function saveItems(skipSync) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    toast('当前浏览器无法本地保存，请及时导出数据备份');
  }
  if (!skipSync) scheduleSync();
}

function loadSyncConfig() {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data.token !== 'string' || !data.token) return null;
    return {
      token: data.token,
      gistId: typeof data.gistId === 'string' ? data.gistId : null,
      login: typeof data.login === 'string' ? data.login : '',
    };
  } catch (err) {
    return null;
  }
}

function persistSyncConfig() {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(syncConfig));
  } catch (err) {
    toast('同步配置无法保存到本地');
  }
}

function clearSyncConfig() {
  try {
    localStorage.removeItem(SYNC_KEY);
  } catch (err) {
    // ignore
  }
  syncConfig = null;
}

function syncPayload() {
  return {
    app: '科室工作推进登记',
    version: 1,
    updatedAt: new Date().toISOString(),
    items,
  };
}

function parseSyncPayload(text) {
  try {
    const data = JSON.parse(text);
    const list = Array.isArray(data) ? data : data && data.items;
    if (!Array.isArray(list)) return [];
    return list.map(normalizeItem).filter(Boolean);
  } catch (err) {
    return [];
  }
}

function mergeSyncItems(localList, remoteList) {
  const map = new Map();
  localList.forEach((item) => map.set(item.id, item));
  remoteList.forEach((item) => {
    const current = map.get(item.id);
    if (!current) {
      map.set(item.id, item);
    } else if (String(item.updatedAt || '') > String(current.updatedAt || '')) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

async function githubFetch(path, options) {
  const token = syncConfig && syncConfig.token;
  if (!token) throw new Error('no-token');
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: 'token ' + token,
    'Content-Type': 'application/json',
  };
  const res = await fetch('https://api.github.com' + path, Object.assign({
    method: 'GET',
    headers,
  }, options || {}));
  if (res.status === 401) throw new Error('unauthorized');
  if (res.status === 404) throw new Error('not-found');
  if (!res.ok) {
    let message = 'HTTP ' + res.status;
    try {
      const body = await res.json();
      if (body && body.message) message = body.message;
    } catch (err) {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

async function connectSync(token) {
  syncConfig = {
    token: String(token || '').trim(),
    gistId: null,
    login: '',
  };
  if (!syncConfig.token) throw new Error('token-empty');
  const user = await githubFetch('/user');
  syncConfig.login = user.login || '';
  let gistId = null;
  const gists = await githubFetch('/gists?per_page=100');
  const existing = gists.find((g) => !g.public && g.description === GIST_DESCRIPTION);
  if (existing) {
    gistId = existing.id;
  }
  if (!gistId) {
    const created = await githubFetch('/gists', {
      method: 'POST',
      body: JSON.stringify({
        description: GIST_DESCRIPTION,
        public: false,
        files: {
          [GIST_FILE]: {
            content: JSON.stringify(syncPayload(), null, 2),
          },
        },
      }),
    });
    gistId = created.id;
  }
  syncConfig.gistId = gistId;
  persistSyncConfig();
  await syncPush();
  return syncConfig;
}

async function syncPush() {
  if (!syncConfig || !syncConfig.token) return;
  if (!syncConfig.gistId) {
    await connectSync(syncConfig.token);
    return;
  }
  await githubFetch('/gists/' + encodeURIComponent(syncConfig.gistId), {
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [GIST_FILE]: {
          content: JSON.stringify(syncPayload(), null, 2),
        },
      },
    }),
  });
}

async function syncPull() {
  if (!syncConfig || !syncConfig.token) return;
  if (!syncConfig.gistId) {
    await connectSync(syncConfig.token);
    return;
  }
  const gist = await githubFetch('/gists/' + encodeURIComponent(syncConfig.gistId));
  const file = gist.files && gist.files[GIST_FILE];
  if (!file || typeof file.content !== 'string') return;
  const remote = parseSyncPayload(file.content);
  const merged = mergeSyncItems(items, remote);
  const changed = merged.length !== items.length || merged.some((item, index) => item.updatedAt !== items[index].updatedAt);
  if (changed) {
    items = merged;
    saveItems(true);
    render();
  }
  await syncPush();
}

async function syncNow() {
  if (syncBusy) return;
  syncBusy = true;
  setSyncBusyUI(true);
  try {
    await syncPull();
    updateSyncStatus();
    toast('同步完成');
  } catch (err) {
    updateSyncStatus(err);
    toast('同步失败：' + err.message);
  } finally {
    syncBusy = false;
    setSyncBusyUI(false);
  }
}

function scheduleSync() {
  if (!syncConfig || !syncConfig.token) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    syncPush().catch((err) => {
      if (err && err.message !== 'no-token') toast('同步失败：' + err.message);
    });
  }, 1200);
}

function updateSyncStatus(err) {
  const statusEl = $('#syncStatus');
  const textEl = $('#syncStatusText');
  const disconnectBtn = $('#syncDisconnectBtn');
  if (!statusEl || !textEl) return;
  statusEl.classList.remove('ok', 'err');
  if (err) {
    statusEl.classList.add('err');
    textEl.textContent = '同步异常：' + err.message;
  } else if (syncConfig && syncConfig.token) {
    statusEl.classList.add('ok');
    textEl.textContent = '已连接' + (syncConfig.login ? '：' + syncConfig.login : '');
  } else {
    textEl.textContent = '未连接';
  }
  if (disconnectBtn) disconnectBtn.hidden = !syncConfig;
}

function setSyncBusyUI(busy) {
  const saveBtn = $('#syncSaveBtn');
  const nowBtn = $('#syncNowBtn');
  if (saveBtn) saveBtn.disabled = busy;
  if (nowBtn) nowBtn.disabled = busy;
}

let items = loadItems();
let syncConfig = loadSyncConfig();
let syncTimer = null;
let syncBusy = false;
let filter = {
  year: String(new Date().getFullYear()),
  status: 'all',
  query: '',
};
let editingId = null;
let toastTimer = null;

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function injectIcons() {
  $$('[data-icon]').forEach((el) => {
    if (!el.dataset.icon || el.dataset.iconDone) return;
    el.innerHTML = icon(el.dataset.icon);
    el.dataset.iconDone = '1';
  });
}

function statusOptions(selected) {
  return STATUSES.map((s) => {
    const sel = s.id === selected ? ' selected' : '';
    return '<option value="' + s.id + '"' + sel + '>' + s.label + '</option>';
  }).join('');
}

function resultOptions(selected) {
  return RESULTS.map((r) => {
    const sel = r.id === selected ? ' selected' : '';
    return '<option value="' + r.id + '"' + sel + '>' + r.label + '</option>';
  }).join('');
}

function yearItems(list) {
  if (filter.year === 'all') return list.slice();
  return list.filter((item) => String(item.startDate).slice(0, 4) === filter.year);
}

function filteredItems() {
  const query = filter.query.trim().toLowerCase();
  return items
    .filter((item) => {
      if (filter.year !== 'all' && String(item.startDate).slice(0, 4) !== filter.year) return false;
      if (filter.status !== 'all' && item.status !== filter.status) return false;
      if (!query) return true;
      const haystack = [
        item.title,
        item.goal,
        item.resultNote,
        item.owner.join(' '),
        ...item.entries.map((e) => e.note),
      ].join(' ').toLowerCase();
      return haystack.indexOf(query) !== -1;
    })
    .sort((a, b) => {
      const dateDiff = String(b.startDate).localeCompare(String(a.startDate));
      if (dateDiff !== 0) return dateDiff;
      return String(b.createdAt).localeCompare(String(a.createdAt));
    });
}

function renderYearOptions() {
  const years = new Set(items.map((i) => String(i.startDate).slice(0, 4)).filter(Boolean));
  years.add(String(new Date().getFullYear()));
  const sorted = Array.from(years).sort().reverse();
  const options = ['<option value="all">全部年度</option>']
    .concat(sorted.map((y) => '<option value="' + y + '"' + (filter.year === y ? ' selected' : '') + '>' + y + '年</option>'))
    .join('');
  $('#yearSelect').innerHTML = options;
}

function renderFilters() {
  const chips = ['<button class="chip' + (filter.status === 'all' ? ' active' : '') + '" data-status="all" type="button">全部</button>']
    .concat(STATUSES.map((s) => {
      const active = filter.status === s.id ? ' active' : '';
      return '<button class="chip' + active + '" data-status="' + s.id + '" type="button"><span class="dot"></span>' + s.label + '</button>';
    }))
    .join('');
  $('#statusFilters').innerHTML = chips;
}

function renderStats() {
  const list = yearItems(items);
  const total = list.length;
  const activeCount = list.filter((i) => i.status === 'active' || i.status === 'milestone').length;
  const doneCount = list.filter((i) => i.status === 'done').length;
  const withResult = list.filter((i) => i.resultStatus);
  const achieved = withResult.filter((i) => ACHIEVED_IDS.has(i.resultStatus)).length;
  const rate = withResult.length ? Math.round((achieved / withResult.length) * 100) : 0;
  $('#statTotalLabel').textContent = filter.year === 'all' ? '全部事项' : filter.year + '年事项';
  $('#statTotal').textContent = String(total);
  $('#statActive').textContent = String(activeCount);
  $('#statDone').textContent = String(doneCount);
  $('#statRate').textContent = rate + '%';
}

function entryCard(entry) {
  return '<div class="timeline-entry ' + entry.status + '">' +
    '<div><span class="entry-date">' + formatDate(entry.date) + '</span><span class="entry-status">' + statusLabel(entry.status) + '</span></div>' +
    '<div class="entry-note">' + (entry.note ? esc(entry.note) : '（无说明）') + '</div>' +
    '</div>';
}

function itemCard(item) {
  const owners = item.owner.length
    ? item.owner.map((o) => '<span class="owner-chip">' + icon('user') + esc(o) + '</span>').join('')
    : '<span class="text-muted">未填写</span>';
  const result = item.resultStatus
    ? '<span class="result-badge">' + esc(resultLabel(item.resultStatus)) + '</span>'
    : '<span class="result-badge">达成情况未填写</span>';
  const entries = item.entries.slice(0, 3).map(entryCard).join('');
  const more = item.entries.length > 3
    ? '<div class="timeline-more">还有 ' + (item.entries.length - 3) + ' 条推进记录</div>'
    : '';
  const goal = item.goal
    ? '<div class="item-goal"><strong>目标：</strong>' + esc(item.goal) + '</div>'
    : '';
  return '<article class="item" data-id="' + esc(item.id) + '">' +
    '<div class="item-main">' +
      '<div class="item-head">' +
        '<span class="status-badge status-' + item.status + '"><span class="dot"></span>' + statusLabel(item.status) + '</span>' +
        '<h3>' + esc(item.title) + '</h3>' +
        '<button class="icon-btn edit-btn" type="button" data-id="' + esc(item.id) + '" title="编辑" aria-label="编辑">' + icon('edit') + '</button>' +
      '</div>' +
      '<div class="item-meta">' +
        '<span class="meta-line">' + icon('calendar') + '<span>' + formatDate(item.startDate) + '</span></span>' +
        '<span class="meta-line">' + icon('users') + '<span class="owner-chips">' + owners + '</span></span>' +
        result +
      '</div>' +
      goal +
    '</div>' +
    '<div class="item-timeline">' +
      '<div class="timeline-title">' + icon('clock') + '推进记录 ' + item.entries.length + '</div>' +
      '<div class="timeline">' + entries + '</div>' +
      more +
    '</div>' +
  '</article>';
}

function renderList() {
  const list = filteredItems();
  const listEl = $('#itemList');
  const emptyEl = $('#emptyState');
  if (list.length) {
    listEl.innerHTML = list.map(itemCard).join('');
    listEl.hidden = false;
    emptyEl.hidden = true;
  } else {
    listEl.innerHTML = '';
    listEl.hidden = true;
    emptyEl.hidden = false;
    const hasItems = items.length > 0;
    $('#emptyState h2').textContent = hasItems ? '没有匹配的事项' : '暂无登记事项';
    $('#emptyState p').textContent = hasItems ? '试试调整筛选条件或搜索词。' : '从第一项科室工作开始登记。';
    const addLabel = $('#emptyAddBtn .btn-label');
    if (addLabel) addLabel.textContent = hasItems ? '新增事项' : '登记第一项';
  }
}

function render() {
  renderYearOptions();
  renderFilters();
  renderStats();
  renderList();
}

function openForm(item) {
  editingId = item ? item.id : null;
  $('#modalTitle').textContent = item ? '编辑工作事项' : '登记工作事项';
  $('#deleteBtn').hidden = !item;
  $('#itemTitle').value = item ? item.title : '';
  $('#itemDate').value = item ? item.startDate : todayStr();
  $('#itemStatus').innerHTML = statusOptions(item ? item.status : 'pending');
  $('#itemOwner').value = item ? item.owner.join('、') : '';
  $('#itemGoal').value = item ? item.goal : '';
  $('#itemResultStatus').innerHTML = resultOptions(item ? item.resultStatus : '');
  $('#itemResultNote').value = item ? item.resultNote : '';

  const entryList = $('#entryList');
  entryList.innerHTML = '';
  const entries = item && item.entries.length ? item.entries : [];
  if (entries.length) {
    entries.forEach((entry) => addEntryRow(entry));
  } else {
    addEntryRow({ date: '', note: '', status: 'active' });
  }

  $('#modalBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#itemTitle').focus();
}

function closeForm() {
  $('#modalBackdrop').hidden = true;
  document.body.style.overflow = '';
  editingId = null;
}

function openSyncModal() {
  $('#syncToken').value = syncConfig ? syncConfig.token : '';
  updateSyncStatus();
  $('#syncBackdrop').hidden = false;
  document.body.style.overflow = 'hidden';
  $('#syncToken').focus();
}

function closeSyncModal() {
  $('#syncBackdrop').hidden = true;
  document.body.style.overflow = '';
}

function addEntryRow(entry) {
  const data = entry || { date: todayStr(), note: '', status: 'active' };
  const row = document.createElement('div');
  row.className = 'entry-row';
  row.innerHTML =
    '<input type="date" class="entry-date" value="' + esc(data.date) + '" aria-label="记录日期">' +
    '<select class="entry-status" aria-label="记录状态">' + statusOptions(data.status) + '</select>' +
    '<div class="entry-note-cell"><textarea class="entry-note" rows="2" placeholder="推进情况" aria-label="推进情况"></textarea></div>' +
    '<button class="entry-del" type="button" title="删除记录" aria-label="删除记录">' + icon('trash') + '</button>';
  row.querySelector('.entry-note').value = data.note || '';
  $('#entryList').appendChild(row);
}

function collectEntries() {
  return $$('#entryList .entry-row').map((row) => ({
    id: uid(),
    date: row.querySelector('.entry-date').value,
    note: row.querySelector('.entry-note').value.trim(),
    status: row.querySelector('.entry-status').value,
  })).filter((e) => e.date || e.note);
}

function collectForm() {
  return {
    title: $('#itemTitle').value.trim(),
    startDate: $('#itemDate').value,
    status: $('#itemStatus').value,
    owner: parseOwners($('#itemOwner').value),
    goal: $('#itemGoal').value.trim(),
    entries: collectEntries(),
    resultStatus: $('#itemResultStatus').value,
    resultNote: $('#itemResultNote').value.trim(),
  };
}

function saveItemFromForm() {
  const data = collectForm();
  if (!data.title || !data.startDate) return;
  const now = new Date().toISOString();
  if (editingId) {
    const idx = items.findIndex((i) => i.id === editingId);
    if (idx !== -1) {
      items[idx] = Object.assign({}, items[idx], data, { updatedAt: now });
    }
  } else {
    items.unshift(Object.assign({ id: uid(), createdAt: now, updatedAt: now }, data));
  }
  saveItems();
  closeForm();
  render();
  toast('已保存');
}

function deleteItem() {
  const item = items.find((i) => i.id === editingId);
  if (!item) return;
  if (window.confirm('确定删除「' + item.title + '」吗？')) {
    items = items.filter((i) => i.id !== editingId);
    saveItems();
    closeForm();
    render();
    toast('已删除');
  }
}

function showReport() {
  $('#mainView').hidden = true;
  $('#reportView').hidden = false;
  renderReport();
  window.scrollTo(0, 0);
}

function showMain() {
  $('#reportView').hidden = true;
  $('#mainView').hidden = false;
  render();
  window.scrollTo(0, 0);
}

function itemCompletedDate(item) {
  if (item.status !== 'done') return null;
  const dates = item.entries.map((e) => e.date).filter(Boolean);
  dates.push(item.startDate);
  dates.sort();
  return dates[dates.length - 1];
}

function monthSummary(list, month) {
  const m = String(month).padStart(2, '0');
  const started = list.filter((item) => String(item.startDate).slice(5, 7) === m).length;
  const completed = list.filter((item) => {
    const doneDate = itemCompletedDate(item);
    return doneDate && String(doneDate).slice(5, 7) === m;
  }).length;
  const cumulative = list.filter((item) => Number(String(item.startDate).slice(5, 7)) <= month).length;
  return { month, started, completed, cumulative };
}

function reportStats(list) {
  const total = list.length;
  const done = list.filter((i) => i.status === 'done').length;
  const active = list.filter((i) => i.status === 'active' || i.status === 'milestone').length;
  const pending = list.filter((i) => i.status === 'pending').length;
  const blocked = list.filter((i) => i.status === 'blocked').length;
  const withResult = list.filter((i) => i.resultStatus);
  const achieved = withResult.filter((i) => ACHIEVED_IDS.has(i.resultStatus)).length;
  const rate = withResult.length ? Math.round((achieved / withResult.length) * 100) : 0;
  return { total, done, active, pending, blocked, withResult: withResult.length, achieved, rate };
}

function reportSection(group, title, list) {
  if (!list.length) return '';
  return list.map((item) => {
    const owners = item.owner.length ? item.owner.join('、') : '未填写';
    const progress = item.entries.length
      ? '<ul class="report-progress">' + item.entries.map((e) => '<li><strong>' + formatDate(e.date) + '</strong>（' + statusLabel(e.status) + '）：' + esc(e.note || '无说明') + '</li>').join('') + '</ul>'
      : '';
    const resultNote = item.resultNote
      ? '<div class="report-result">' + esc(item.resultNote) + '</div>'
      : '';
    return '<section class="report-section ' + group + '">' +
      '<h3>' + esc(item.title) + '</h3>' +
      '<div class="report-meta">' +
        '<span>开展日期：<strong>' + formatDate(item.startDate) + '</strong></span>' +
        '<span>负责人：<strong>' + esc(owners) + '</strong></span>' +
        '<span>当前状态：<strong>' + statusLabel(item.status) + '</strong></span>' +
        '<span>目标达成：<strong>' + resultLabel(item.resultStatus) + '</strong></span>' +
      '</div>' +
      '<p><strong>工作目标：</strong>' + (item.goal ? esc(item.goal) : '未填写') + '</p>' +
      progress +
      resultNote +
    '</section>';
  }).join('');
}

function renderReport() {
  const list = yearItems(items);
  const stats = reportStats(list);
  const yearLabel = filter.year === 'all' ? '全年度' : filter.year + '年度';

  const months = Array.from({ length: 12 }, (_, i) => monthSummary(list, i + 1));

  const monthRows = months.map((m) =>
    '<tr><td>' + m.month + '月</td><td>' + m.started + '</td><td>' + m.completed + '</td><td>' + m.cumulative + '</td></tr>'
  ).join('');

  const doneItems = list.filter((i) => i.status === 'done');
  const activeItems = list.filter((i) => i.status === 'active' || i.status === 'milestone');
  const pendingItems = list.filter((i) => i.status === 'pending');
  const blockedItems = list.filter((i) => i.status === 'blocked');

  const html =
    '<h1>' + yearLabel + '科室工作推进总结</h1>' +
    '<p class="report-subtitle">填报时间：' + formatDate(todayStr()) + '</p>' +
    '<section class="report-stats">' +
      '<div class="report-stat"><span>开展事项</span><strong>' + stats.total + '</strong></div>' +
      '<div class="report-stat"><span>已完成</span><strong>' + stats.done + '</strong></div>' +
      '<div class="report-stat"><span>推进中</span><strong>' + stats.active + '</strong></div>' +
      '<div class="report-stat"><span>目标达成率</span><strong>' + stats.rate + '%</strong></div>' +
    '</section>' +
    '<h2>一、总体情况</h2>' +
    '<p>' + yearLabel + '共开展科室工作' + stats.total + '项，已完成' + stats.done + '项，推进中' + stats.active + '项，待启动' + stats.pending + '项，受阻' + stats.blocked + '项。已填写达成结论的' + stats.withResult + '项事项中，达成目标' + stats.achieved + '项，目标达成率' + stats.rate + '%。</p>' +
    '<h2>二、月度推进情况</h2>' +
    '<div class="report-table-wrap"><table><thead><tr><th>月份</th><th>新开展</th><th>本月完成</th><th>累计开展</th></tr></thead><tbody>' + monthRows + '</tbody></table></div>' +
    '<h2>三、具体事项</h2>' +
    (list.length === 0 ? '<p>暂无登记事项。</p>' : '') +
    '<h3>（一）已完成事项</h3>' + (doneItems.length ? reportSection('done', '已完成', doneItems) : '<p>无</p>') +
    '<h3>（二）推进中事项</h3>' + (activeItems.length ? reportSection('active', '推进中', activeItems) : '<p>无</p>') +
    '<h3>（三）待启动事项</h3>' + (pendingItems.length ? reportSection('pending', '待启动', pendingItems) : '<p>无</p>') +
    '<h3>（四）受阻事项</h3>' + (blockedItems.length ? reportSection('blocked', '受阻', blockedItems) : '<p>无</p>');

  $('#reportPaper').innerHTML = html;
}

function reportMarkdown() {
  const list = yearItems(items);
  const stats = reportStats(list);
  const yearLabel = filter.year === 'all' ? '全年度' : filter.year + '年度';
  const lines = [];
  lines.push('# ' + yearLabel + '科室工作推进总结');
  lines.push('');
  lines.push('- 填报时间：' + formatDate(todayStr()));
  lines.push('- 填报人：____________');
  lines.push('');
  lines.push('## 一、总体情况');
  lines.push('');
  lines.push(yearLabel + '共开展科室工作' + stats.total + '项，已完成' + stats.done + '项，推进中' + stats.active + '项，待启动' + stats.pending + '项，受阻' + stats.blocked + '项。已填写达成结论的' + stats.withResult + '项事项中，达成目标' + stats.achieved + '项，目标达成率' + stats.rate + '%。');
  lines.push('');
  lines.push('## 二、月度推进情况');
  lines.push('');
  lines.push('| 月份 | 新开展 | 本月完成 | 累计开展 |');
  lines.push('| --- | --- | --- | --- |');
  for (let m = 1; m <= 12; m += 1) {
    const item = monthSummary(list, m);
    lines.push('| ' + m + '月 | ' + item.started + ' | ' + item.completed + ' | ' + item.cumulative + ' |');
  }
  lines.push('');
  lines.push('## 三、具体事项');
  lines.push('');
  const groups = [
    ['已完成事项', list.filter((i) => i.status === 'done')],
    ['推进中事项', list.filter((i) => i.status === 'active' || i.status === 'milestone')],
    ['待启动事项', list.filter((i) => i.status === 'pending')],
    ['受阻事项', list.filter((i) => i.status === 'blocked')],
  ];
  groups.forEach(([title, groupItems]) => {
    lines.push('### ' + title);
    lines.push('');
    if (!groupItems.length) {
      lines.push('无');
      lines.push('');
      return;
    }
    groupItems.forEach((item, index) => {
      lines.push((index + 1) + '. ' + item.title);
      lines.push('');
      lines.push('   - 开展日期：' + formatDate(item.startDate));
      lines.push('   - 负责人：' + (item.owner.length ? item.owner.join('、') : '未填写'));
      lines.push('   - 当前状态：' + statusLabel(item.status));
      lines.push('   - 目标达成：' + resultLabel(item.resultStatus));
      if (item.goal) lines.push('   - 工作目标：' + item.goal.replace(/\n+/g, ' '));
      if (item.entries.length) {
        lines.push('   - 推进记录：');
        item.entries.forEach((e) => lines.push('     - ' + formatDate(e.date) + '（' + statusLabel(e.status) + '）：' + (e.note || '无说明')));
      }
      if (item.resultNote) lines.push('   - 达成说明：' + item.resultNote.replace(/\n+/g, ' '));
      lines.push('');
    });
  });
  return lines.join('\n');
}

function copyReport() {
  const text = reportMarkdown();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => toast('总结已复制'))
      .catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
    toast('总结已复制');
  } catch (err) {
    toast('复制失败，请使用导出 Markdown');
  }
  area.remove();
}

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime || 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportJson() {
  const payload = {
    app: '科室工作推进登记',
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  };
  downloadBlob(JSON.stringify(payload, null, 2), '科室工作推进登记-备份-' + todayStr() + '.json', 'application/json');
  toast('数据备份已导出');
}

function exportMarkdown() {
  const yearLabel = filter.year === 'all' ? '全年度' : filter.year + '年度';
  downloadBlob(reportMarkdown(), '科室工作推进总结-' + yearLabel + '.md', 'text/markdown;charset=utf-8');
  toast('Markdown 总结已导出');
}

function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      const imported = Array.isArray(data) ? data : data && data.items;
      if (!Array.isArray(imported)) throw new Error('invalid');
      const normalized = imported.map(normalizeItem).filter(Boolean);
      if (!normalized.length) throw new Error('empty');
      if (items.length && !window.confirm('导入后将替换当前全部登记数据，确定继续吗？')) {
        return;
      }
      items = normalized;
      saveItems();
      render();
      toast('已导入 ' + normalized.length + ' 项数据');
    } catch (err) {
      toast('导入失败，请选择正确的备份文件');
    }
  };
  reader.readAsText(file);
}

function loadSampleData() {
  if (items.length && !window.confirm('载入示例数据将替换当前全部登记数据，确定继续吗？')) {
    return;
  }
  items = [
    {
      title: '推进门诊服务流程优化',
      startDate: '2026-02-10',
      owner: ['王明', '李丽'],
      goal: '减少患者无效等待，将平均候诊时间较上年度缩短15分钟以上，并形成可复制流程。',
      status: 'milestone',
      entries: [
        { date: '2026-02-10', status: 'active', note: '完成现状摸底，梳理挂号、候诊、检查三大瓶颈环节。' },
        { date: '2026-04-08', status: 'milestone', note: '完成第一轮流程再造试点，候诊时间平均缩短11分钟。' },
        { date: '2026-06-18', status: 'milestone', note: '推广至全部诊区，制定标准化执行手册。' },
      ],
      resultStatus: 'basically',
      resultNote: '候诊时间平均缩短13分钟，接近年度目标，后续继续优化检查预约环节。',
    },
    {
      title: '建立科室质量指标月报机制',
      startDate: '2026-01-08',
      owner: ['李丽'],
      goal: '每月15日前完成上月质量指标汇总与科室通报，覆盖核心运营指标。',
      status: 'done',
      entries: [
        { date: '2026-01-08', status: 'active', note: '确定指标体系与数据来源。' },
        { date: '2026-02-12', status: 'active', note: '完成第一期月报试运行。' },
        { date: '2026-04-10', status: 'done', note: '月报机制正式运行，连续三个月按时发布。' },
      ],
      resultStatus: 'achieved',
      resultNote: '月报机制稳定运行，成为科室日常管理例会固定内容。',
    },
    {
      title: '开展青年骨干专项培训',
      startDate: '2026-04-18',
      owner: ['张伟'],
      goal: '完成两期专项培训，覆盖科室80%青年骨干，并形成考核反馈。',
      status: 'active',
      entries: [
        { date: '2026-04-18', status: 'active', note: '完成培训需求调研与课程设计。' },
        { date: '2026-06-20', status: 'active', note: '第一期培训完成，参训率92%。' },
      ],
      resultStatus: 'partial',
      resultNote: '第一期已按计划完成，第二期正在组织，预计年底前结束。',
    },
    {
      title: '推进信息化随访系统上线',
      startDate: '2026-05-06',
      owner: ['王明', '陈静'],
      goal: '完成系统开发、测试与试点运行，覆盖重点病种随访。',
      status: 'blocked',
      entries: [
        { date: '2026-05-06', status: 'active', note: '完成需求确认并进入开发。' },
        { date: '2026-07-15', status: 'blocked', note: '与信息中心接口联调受阻，涉及数据安全评审。' },
      ],
      resultStatus: '',
      resultNote: '',
    },
    {
      title: '优化科室排班与人员配置',
      startDate: '2026-07-22',
      owner: ['陈静'],
      goal: '完成全年排班规则优化，平衡高峰时段人力负荷。',
      status: 'pending',
      entries: [],
      resultStatus: '',
      resultNote: '',
    },
  ].map(normalizeItem);
  saveItems();
  render();
  toast('已载入示例数据');
}

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 2400);
}

function bindEvents() {
  $('#addBtn').addEventListener('click', () => openForm(null));
  $('#emptyAddBtn').addEventListener('click', () => openForm(null));
  $('#syncBtn').addEventListener('click', openSyncModal);
  $('#closeSyncBtn').addEventListener('click', closeSyncModal);
  $('#syncBackdrop').addEventListener('click', (e) => {
    if (e.target === $('#syncBackdrop')) closeSyncModal();
  });
  $('#syncSaveBtn').addEventListener('click', async () => {
    if (syncBusy) return;
    const token = $('#syncToken').value.trim();
    if (!token) {
      toast('请输入 GitHub Token');
      return;
    }
    syncBusy = true;
    setSyncBusyUI(true);
    try {
      await connectSync(token);
      updateSyncStatus();
      toast('已连接并同步');
    } catch (err) {
      updateSyncStatus(err);
      toast('连接失败：' + err.message);
      syncConfig = null;
      clearSyncConfig();
    } finally {
      syncBusy = false;
      setSyncBusyUI(false);
    }
  });
  $('#syncNowBtn').addEventListener('click', syncNow);
  $('#syncDisconnectBtn').addEventListener('click', () => {
    if (window.confirm('确定断开云端同步吗？本地数据会保留。')) {
      clearSyncConfig();
      updateSyncStatus();
      toast('已断开同步');
    }
  });
  $('#reportBtn').addEventListener('click', showReport);
  $('#backBtn').addEventListener('click', showMain);
  $('#closeModalBtn').addEventListener('click', closeForm);
  $('#cancelBtn').addEventListener('click', closeForm);
  $('#deleteBtn').addEventListener('click', deleteItem);
  $('#modalBackdrop').addEventListener('click', (e) => {
    if (e.target === $('#modalBackdrop')) closeForm();
  });
  $('#itemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveItemFromForm();
  });
  $('#addEntryBtn').addEventListener('click', () => addEntryRow());
  $('#entryList').addEventListener('click', (e) => {
    const btn = e.target.closest('.entry-del');
    if (!btn) return;
    const rows = $$('#entryList .entry-row');
    if (rows.length > 1) {
      btn.closest('.entry-row').remove();
    } else {
      toast('至少保留一条推进记录');
    }
  });
  $('#statusFilters').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    filter.status = btn.dataset.status;
    render();
  });
  $('#searchInput').addEventListener('input', (e) => {
    filter.query = e.target.value;
    renderList();
    renderStats();
  });
  $('#yearSelect').addEventListener('change', (e) => {
    filter.year = e.target.value;
    render();
  });
  $('#itemList').addEventListener('click', (e) => {
    const btn = e.target.closest('.edit-btn');
    if (!btn) return;
    const item = items.find((i) => i.id === btn.dataset.id);
    if (item) openForm(item);
  });

  const dataMenuBtn = $('#dataMenuBtn');
  const dataMenu = $('#dataMenu');
  dataMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dataMenu.hidden = !dataMenu.hidden;
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-wrap')) dataMenu.hidden = true;
  });
  $('#exportJsonBtn').addEventListener('click', exportJson);
  $('#importJsonBtn').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) handleImportFile(file);
    e.target.value = '';
  });
  $('#sampleBtn').addEventListener('click', loadSampleData);
  $('#clearBtn').addEventListener('click', () => {
    if (!items.length) {
      toast('当前没有可清空的数据');
      return;
    }
    if (window.confirm('确定清空全部登记数据吗？此操作不可恢复，建议先导出备份。')) {
      items = [];
      saveItems();
      render();
      toast('已清空');
    }
  });
  $('#copyReportBtn').addEventListener('click', copyReport);
  $('#printReportBtn').addEventListener('click', () => window.print());
  $('#mdReportBtn').addEventListener('click', exportMarkdown);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#modalBackdrop').hidden) closeForm();
    if (e.key === 'Escape' && !$('#syncBackdrop').hidden) closeSyncModal();
    if (e.key === 'Escape') dataMenu.hidden = true;
  });
}

function init() {
  injectIcons();
  bindEvents();
  render();
  updateSyncStatus();
  if (syncConfig && syncConfig.token) {
    syncPull().catch(() => {
      // ignore background sync errors on load
    });
  }
}

document.addEventListener('DOMContentLoaded', init);
