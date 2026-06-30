const appRoot = document.getElementById("app");
let currentUser = null;
let activeView = "feed";
let selectedTag = null;
let currentProfileId = null;

function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.text) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => el.setAttribute(key, value));
  }
  return el;
}

function formatDate(value) {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function showAlert(message, type = "error") {
  const alert = createElement("div", { className: "alert", text: message });
  appRoot.prepend(alert);
  setTimeout(() => alert.remove(), 4000);
}

async function api(path, options = {}) {
  const headers = options.headers || {};
  if (currentUser) headers["x-user-id"] = currentUser.id;
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(path, {
    ...options,
    headers,
    body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function createNavbar() {
  const navbar = createElement("div", { className: "navbar" });
  const brand = createElement("div", { className: "brand", text: "SocialBeat" });
  const links = createElement("div", { className: "nav-links" });

  if (currentUser) {
    [
      { label: "Feed", view: "feed" },
      { label: "Profile", view: "profile" },
      { label: "Notifications", view: "notifications" },
      { label: "Trending", view: "trending" }
    ].forEach(item => {
      const btn = createElement("button", { text: item.label, className: activeView === item.view ? "tab-button active" : "tab-button" });
      btn.onclick = () => {
        activeView = item.view;
        selectedTag = null;
        currentProfileId = currentUser.id;
        renderApp();
      };
      links.appendChild(btn);
    });

    const logoutBtn = createElement("button", { text: "Logout", className: "secondary" });
    logoutBtn.onclick = () => {
      currentUser = null;
      activeView = "feed";
      selectedTag = null;
      currentProfileId = null;
      renderApp();
    };
    links.appendChild(logoutBtn);
  }

  navbar.appendChild(brand);
  navbar.appendChild(links);
  return navbar;
}

function createAuthPanel() {
  const panel = createElement("div", { className: "auth-panel" });
  const title = createElement("h1", { text: "Welcome to SocialBeat" });
  const tabs = createElement("div", { className: "tabs" });
  const loginTab = createElement("button", { text: "Login", className: "tab-button active" });
  const registerTab = createElement("button", { text: "Register", className: "tab-button" });

  let activeTab = "login";

  function switchTab(tab) {
    activeTab = tab;
    loginTab.className = `tab-button ${tab === "login" ? "active" : ""}`;
    registerTab.className = `tab-button ${tab === "register" ? "active" : ""}`;
    renderForm();
  }

  const formArea = createElement("div");

  loginTab.onclick = () => switchTab("login");
  registerTab.onclick = () => switchTab("register");

  function renderForm() {
    formArea.innerHTML = "";
    const form = createElement("form");
    const usernameInput = createElement("input", { attrs: { type: "text", placeholder: "Username", name: "username", required: true } });
    const passwordInput = createElement("input", { attrs: { type: "password", placeholder: "Password", name: "password", required: true } });

    if (activeTab === "register") {
      const nameInput = createElement("input", { attrs: { type: "text", placeholder: "Name", name: "name", required: true } });
      const bioInput = createElement("textarea", { attrs: { placeholder: "Bio" , name: "bio" } });
      form.append(nameInput, bioInput);
    }

    const submitBtn = createElement("button", { text: activeTab === "login" ? "Login" : "Register" });
    form.append(usernameInput, passwordInput, submitBtn);
    form.onsubmit = async e => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        const payload = {
          username: formData.get("username"),
          password: formData.get("password")
        };
        if (activeTab === "register") {
          payload.name = formData.get("name");
          payload.bio = formData.get("bio");
        }
        const route = activeTab === "login" ? "/api/auth/login" : "/api/auth/register";
        const result = await api(route, { method: "POST", body: payload });
        currentUser = result.user;
        activeView = "feed";
        selectedTag = null;
        currentProfileId = currentUser.id;
        renderApp();
      } catch (error) {
        showAlert(error.message);
      }
    };

    formArea.appendChild(form);
  }

  renderForm();
  tabs.append(loginTab, registerTab);
  panel.append(title, tabs, formArea);
  return panel;
}

function createPostCard(post) {
  const card = createElement("div", { className: "card" });
  const header = createElement("div", { className: "post-header" });
  const avatar = createElement("img", { className: "avatar", attrs: { src: post.avatarUrl, alt: post.name } });
  const meta = createElement("div");
  const name = createElement("h2", { text: post.name });
  const postMeta = createElement("div", { className: "post-meta" });
  postMeta.innerHTML = `<span>@${post.username}</span><span>${formatDate(post.createdAt)}</span><span>${post.likeCount} likes</span><span>${post.commentCount} comments</span>`;
  meta.append(name, postMeta);
  header.append(avatar, meta);

  const body = createElement("div", { className: "post-body" });
  if (post.content) {
    const content = createElement("p", { text: post.content });
    body.appendChild(content);
  }
  if (post.mediaUrl) {
    const mediaEl = createElement(post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "img", { attrs: { src: post.mediaUrl, controls: !!post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) } });
    body.appendChild(mediaEl);
  }

  const tagBar = createElement("div");
  post.tags.forEach(tag => {
    const tagEl = createElement("span", { className: "tag-pill", text: `#${tag}` });
    tagEl.onclick = () => {
      selectedTag = tag;
      activeView = "trending";
      renderApp();
    };
    tagBar.appendChild(tagEl);
  });

  const actions = createElement("div", { className: "post-actions" });
  const likeBtn = createElement("button", { text: `${post.liked ? "Unlike" : "Like"} (${post.likeCount})` });
  const commentBtn = createElement("button", { text: `Comment (${post.commentCount})`, className: "secondary" });

  likeBtn.onclick = async () => {
    try {
      await api(`/api/posts/${post.id}/like`, { method: "POST" });
      renderApp();
    } catch (error) {
      showAlert(error.message);
    }
  };

  commentBtn.onclick = () => {
    activeView = "postDetail";
    currentProfileId = post.id;
    renderApp();
  };

  actions.append(likeBtn, commentBtn);

  card.append(header, body, tagBar, actions);
  return card;
}

function createPostComposer() {
  const card = createElement("div", { className: "card" });
  const title = createElement("h2", { text: "Share a new post" });
  const form = createElement("form");
  const content = createElement("textarea", { attrs: { name: "content", placeholder: "Write something memorable..." } });
  const mediaInput = createElement("input", { attrs: { type: "file", name: "media", accept: "image/*,video/*" } });
  const tagsInput = createElement("input", { attrs: { type: "text", name: "tags", placeholder: "Tags (comma separated)" } });
  const submit = createElement("button", { text: "Post" });

  form.append(title, content, mediaInput, tagsInput, submit);
  form.onsubmit = async e => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      const payload = new FormData();
      payload.append("content", formData.get("content"));
      payload.append("tags", formData.get("tags"));
      const file = mediaInput.files[0];
      if (file) payload.append("media", file);
      await api("/api/posts", { method: "POST", body: payload });
      content.value = "";
      tagsInput.value = "";
      mediaInput.value = "";
      renderApp();
    } catch (error) {
      showAlert(error.message);
    }
  };

  card.append(form);
  return card;
}

function createProfileView(userData, posts) {
  const card = createElement("div", { className: "card" });
  const header = createElement("div", { className: "profile-header" });
  const avatar = createElement("img", { className: "avatar", attrs: { src: userData.avatarUrl, alt: userData.name } });
  const meta = createElement("div");
  const name = createElement("h2", { text: userData.name });
  const info = createElement("div", { className: "profile-meta" });
  info.innerHTML = `<span>@${userData.username}</span><span>${userData.bio || "No bio yet."}</span><span>${userData.postsCount} posts</span><span>${userData.followersCount} followers</span><span>${userData.followingCount} following</span>`;
  meta.append(name, info);
  header.append(avatar, meta);

  const followArea = createElement("div", { className: "post-actions" });
  const followBtn = createElement("button", { text: userData.isFollowing ? "Unfollow" : "Follow" });
  followBtn.onclick = async () => {
    try {
      await api(`/api/users/${userData.id}/follow`, { method: "POST", body: { action: userData.isFollowing ? "unfollow" : "follow" } });
      renderApp();
    } catch (error) {
      showAlert(error.message);
    }
  };
  if (userData.id !== currentUser.id) followArea.appendChild(followBtn);

  const postsContainer = createElement("div");
  posts.forEach(post => postsContainer.appendChild(createPostCard(post)));
  card.append(header, followArea, postsContainer);
  return card;
}

function createNotificationsView(notifications) {
  const card = createElement("div", { className: "card notifications-panel" });
  card.appendChild(createElement("h2", { text: "Notifications" }));
  if (!notifications.length) {
    card.appendChild(createElement("p", { text: "You have no new notifications." }));
    return card;
  }

  notifications.forEach(notification => {
    const item = createElement("div", { className: "notification-item" });
    item.innerHTML = `
      <img class="avatar" src="${notification.sourceAvatar || "https://api.dicebear.com/6.x/thumbs/png?seed=anon"}" alt="${notification.sourceName}" />
      <div class="notification-body">
        <strong>${notification.sourceName || "Someone"}</strong> ${notification.message}
        <div class="post-meta">${formatDate(notification.createdAt)}</div>
      </div>
    ";
    card.appendChild(item);
  });

  return card;
}

function createTrendingPanel(tags) {
  const card = createElement("div", { className: "card" });
  card.appendChild(createElement("h2", { text: selectedTag ? `Posts tagged #${selectedTag}` : "Trending tags" }));

  if (!tags.length) {
    card.appendChild(createElement("p", { text: "No trending tags yet." }));
    return card;
  }

  const tagList = createElement("div", { className: "trend-list" });
  tags.forEach(tag => {
    const tagEl = createElement("button", { className: "trending-tag", text: `#${tag.name}` });
    tagEl.onclick = () => {
      selectedTag = tag.name;
      activeView = "trending";
      renderApp();
    };
    tagList.appendChild(tagEl);
  });

  card.appendChild(tagList);
  return card;
}

function createPostDetailView(post, comments) {
  const card = createElement("div", { className: "card" });
  const backBtn = createElement("button", { text: "Back to feed", className: "secondary" });
  backBtn.onclick = () => {
    activeView = "feed";
    renderApp();
  };
  card.appendChild(backBtn);
  card.appendChild(createPostCard(post));

  const commentSection = createElement("div", { className: "comment-thread" });
  const commentTitle = createElement("h2", { text: "Comments" });
  commentSection.appendChild(commentTitle);
  comments.forEach(comment => {
    const item = createElement("div", { className: "comment-item" });
    item.innerHTML = `
      <img class="avatar" src="${comment.avatarUrl}" alt="${comment.name}" />
      <div>
        <strong>${comment.name}</strong> <span class="post-meta">@${comment.username} · ${formatDate(comment.createdAt)}</span>
        <div class="comment-text">${comment.text}</div>
      </div>
    `;
    commentSection.appendChild(item);
  });

  const form = createElement("form", { className: "inline-comment" });
  const commentInput = createElement("textarea", { attrs: { name: "text", placeholder: "Write a comment...", required: true } });
  const submitBtn = createElement("button", { text: "Send comment" });
  form.append(commentInput, submitBtn);
  form.onsubmit = async e => {
    e.preventDefault();
    try {
      await api(`/api/posts/${post.id}/comment`, { method: "POST", body: { text: commentInput.value } });
      renderApp();
    } catch (error) {
      showAlert(error.message);
    }
  };
  commentSection.appendChild(form);
  card.appendChild(commentSection);
  return card;
}

async function fetchPosts() {
  const params = new URLSearchParams();
  if (activeView === "feed") params.set("feed", "true");
  if (activeView === "profile" && currentProfileId) params.set("userId", currentProfileId);
  if (activeView === "trending" && selectedTag) params.set("tag", selectedTag);
  return await api(`/api/posts?${params.toString()}`);
}

async function fetchProfile(userId) {
  return await api(`/api/users/${userId}`);
}

async function fetchNotifications() {
  return await api("/api/notifications");
}

async function fetchTrending() {
  return await api("/api/trending");
}

async function fetchPostDetail(postId) {
  return await api(`/api/posts/${postId}`);
}

async function renderApp() {
  appRoot.innerHTML = "";
  appRoot.appendChild(createNavbar());

  if (!currentUser) {
    appRoot.appendChild(createAuthPanel());
    return;
  }

  const mainGrid = createElement("div", { className: "main-grid" });
  const feedPanel = createElement("div", { className: "feed-panel" });
  const sidebar = createElement("div", { className: "sidebar" });

  try {
    if (activeView === "postDetail" && currentProfileId) {
      const { post, comments } = await fetchPostDetail(currentProfileId);
      feedPanel.appendChild(createPostDetailView(post, comments));
    } else {
      if (activeView === "feed") {
        feedPanel.appendChild(createPostComposer());
        const { posts } = await fetchPosts();
        if (!posts.length) {
          feedPanel.appendChild(createElement("div", { className: "card", text: "No posts yet. Share what you're thinking." }));
        }
        posts.forEach(post => feedPanel.appendChild(createPostCard(post)));
      } else if (activeView === "profile") {
        const profile = await fetchProfile(currentProfileId || currentUser.id);
        const { posts } = await fetchPosts();
        feedPanel.appendChild(createProfileView(profile, posts));
      } else if (activeView === "notifications") {
        const { notifications } = await fetchNotifications();
        feedPanel.appendChild(createNotificationsView(notifications));
      } else if (activeView === "trending") {
        const { posts } = await fetchPosts();
        const trend = await fetchTrending();
        feedPanel.appendChild(createElement("div", { className: "card" }));
        if (!posts.length) {
          feedPanel.appendChild(createElement("div", { className: "card", text: "No posts for this tag yet." }));
        }
        posts.forEach(post => feedPanel.appendChild(createPostCard(post)));
        sidebar.appendChild(createTrendingPanel(trend.tags || trend));
      }
    }

    if (!sidebar.children.length) {
      const defaultSidebar = createElement("div", { className: "card" });
      defaultSidebar.appendChild(createElement("h2", { text: "Tips" }));
      defaultSidebar.appendChild(createElement("p", { text: "Use the composer to post updates with images or videos. Follow people to personalize your feed." }));
      sidebar.appendChild(defaultSidebar);
    }
    mainGrid.append(feedPanel, sidebar);
    appRoot.appendChild(mainGrid);
  } catch (error) {
    showAlert(error.message);
  }
}

renderApp();
