let inboxThreads = [];
let activeThread = null;
let activeMessages = [];
let activeTransaction = null;

document.addEventListener('DOMContentLoaded', () => {
  protectPage();
  loadInbox();

  const messageForm = document.getElementById('message-form');
  if (messageForm) {
    messageForm.addEventListener('submit', handleSendMessage);
  }

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('productId');
  const buyerId = params.get('buyerId');
  if (productId) {
    loadThread(productId, buyerId);
  }

  const inboxList = document.getElementById('inbox-list');
  if (inboxList) {
    inboxList.addEventListener('click', handleInboxClick);
  }
});

async function loadInbox() {
  const loading = document.getElementById('inbox-loading');

  try {
    const data = await apiRequest('/messages/inbox');

    if (loading) {
      loading.style.display = 'none';
    }

    if (data.success) {
      inboxThreads = data.threads;
      renderInbox();
    }
  } catch (error) {
    if (loading) {
      loading.textContent = 'Error loading conversations.';
      loading.style.color = 'red';
    }
  }
}

function renderInbox() {
  const inboxList = document.getElementById('inbox-list');
  if (!inboxList) return;

  inboxList.innerHTML = '';

  if (inboxThreads.length === 0) {
    inboxList.innerHTML = '<div class="empty-state compact"><p>No conversations yet.</p></div>';
    return;
  }

  inboxThreads.forEach(thread => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `inbox-item${activeThread && activeThread.threadKey === thread.threadKey ? ' active' : ''}`;
    item.dataset.threadKey = thread.threadKey;
    item.dataset.productId = thread.product._id;
    item.dataset.buyerId = thread.buyer._id;
    item.dataset.sellerId = thread.seller._id;

    const currentUser = getUser();
    const partnerName = currentUser && String(currentUser.id) === String(thread.buyer._id) ? thread.seller.name : thread.buyer.name;
    const preview = thread.latestMessage.text.length > 80 ? `${thread.latestMessage.text.slice(0, 80)}...` : thread.latestMessage.text;

    item.innerHTML = `
      <div class="inbox-item-top">
        <strong>${thread.product.title}</strong>
        ${thread.unreadCount > 0 ? `<span class="unread-badge">${thread.unreadCount}</span>` : ''}
      </div>
      <p class="inbox-item-partner">${partnerName}</p>
      <p class="inbox-item-preview">${preview}</p>
    `;

    inboxList.appendChild(item);
  });
}

function handleInboxClick(event) {
  const threadButton = event.target.closest('.inbox-item');
  if (!threadButton) return;

  loadThread(threadButton.dataset.productId, threadButton.dataset.buyerId);
}

async function loadThread(productId, buyerId) {
  const conversationEmpty = document.getElementById('conversation-empty');
  const conversationBody = document.getElementById('conversation-body');
  const conversationTitle = document.getElementById('conversation-title');
  const conversationSubtitle = document.getElementById('conversation-subtitle');
  const threadMeta = document.getElementById('thread-meta');
  const statusEl = document.getElementById('conversation-status');
  const transactionCard = document.getElementById('transaction-card');

  try {
    const query = buyerId ? `?productId=${encodeURIComponent(productId)}&buyerId=${encodeURIComponent(buyerId)}` : `?productId=${encodeURIComponent(productId)}`;
    const data = await apiRequest(`/messages/thread${query}`);

    if (!data.success) {
      return;
    }

    activeThread = data.thread;
    activeMessages = data.messages;
    activeTransaction = data.transaction;

    if (conversationEmpty) conversationEmpty.style.display = 'none';
    if (conversationBody) conversationBody.style.display = 'block';

    if (conversationTitle) {
      conversationTitle.textContent = data.thread.product.title;
    }

    if (conversationSubtitle) {
      conversationSubtitle.textContent = `${data.thread.product.sellerName || 'Seller'} · ${formatPrice(data.thread.product.price)}`;
    }

    if (threadMeta) {
      threadMeta.style.display = 'block';
      threadMeta.innerHTML = `
        <div><strong>Product</strong><span>${data.thread.product.title}</span></div>
        <div><strong>Price</strong><span>${formatPrice(data.thread.product.price)}</span></div>
        <div><strong>Status</strong><span class="status-pill status-${data.thread.product.status}">${data.thread.product.status}</span></div>
      `;
    }

    if (statusEl && activeTransaction) {
      statusEl.style.display = 'inline-flex';
      statusEl.textContent = activeTransaction.status;
      statusEl.className = `status-pill status-${activeTransaction.status}`;
    } else if (statusEl) {
      statusEl.style.display = 'none';
    }

    renderMessages();
    renderTransactionCard();
    highlightThreadInInbox();
  } catch (error) {
    showMessage('messages-alert', error.message, 'error');
  }
}

function renderMessages() {
  const messageList = document.getElementById('message-list');
  if (!messageList) return;

  messageList.innerHTML = '';

  if (!activeMessages.length) {
    messageList.innerHTML = '<div class="empty-state compact"><p>No messages yet. Start the conversation below.</p></div>';
    return;
  }

  const currentUser = getUser();

  activeMessages.forEach(message => {
    const bubble = document.createElement('div');
    const isMine = currentUser && message.sender && String(currentUser.id) === String(message.sender._id);

    bubble.className = `message-bubble ${isMine ? 'mine' : 'theirs'}`;
    bubble.innerHTML = `
      <div class="message-bubble-meta">
        <strong>${message.sender.name}</strong>
        <span>${new Date(message.createdAt).toLocaleString()}</span>
      </div>
      <p>${message.text}</p>
    `;

    messageList.appendChild(bubble);
  });
}

function renderTransactionCard() {
  const transactionCard = document.getElementById('transaction-card');
  if (!transactionCard) return;

  if (!activeTransaction) {
    transactionCard.style.display = 'none';
    transactionCard.innerHTML = '';
    return;
  }

  const currentUser = getUser();
  const isSeller = currentUser && activeTransaction.seller && String(currentUser.id) === String(activeTransaction.seller._id);

  transactionCard.style.display = 'block';
  transactionCard.className = 'transaction-card transaction-card-inline';
  transactionCard.innerHTML = `
    <div class="transaction-card-header">
      <div>
        <h3>Transaction</h3>
        <p>${formatPrice(activeTransaction.amount)}</p>
      </div>
      <span class="status-pill status-${activeTransaction.status}">${activeTransaction.status}</span>
    </div>
    <div class="transaction-card-body">
      <p><strong>Buyer:</strong> ${activeTransaction.buyer.name}</p>
      <p><strong>Seller:</strong> ${activeTransaction.seller.name}</p>
      ${activeTransaction.note ? `<p><strong>Note:</strong> ${activeTransaction.note}</p>` : ''}
    </div>
    <div class="transaction-card-actions">
      ${isSeller ? `
        <button class="btn btn-secondary btn-small" onclick="updateConversationTransaction('${activeTransaction._id}', 'reserved')">Reserve</button>
        <button class="btn btn-primary btn-small" onclick="updateConversationTransaction('${activeTransaction._id}', 'sold')">Mark Sold</button>
        <button class="btn btn-danger btn-small" onclick="updateConversationTransaction('${activeTransaction._id}', 'cancelled')">Cancel</button>
      ` : ''}
      ${!isSeller && (activeTransaction.status === 'pending' || activeTransaction.status === 'reserved') ? `
        <button class="btn btn-danger btn-small" onclick="updateConversationTransaction('${activeTransaction._id}', 'cancelled')">Cancel Request</button>
      ` : ''}
    </div>
  `;
}

async function handleSendMessage(event) {
  event.preventDefault();

  if (!activeThread) {
    showMessage('messages-alert', 'Select a conversation first.', 'error');
    return;
  }

  const messageInput = document.getElementById('message-input');
  const text = messageInput.value.trim();

  if (!text) {
    showMessage('messages-alert', 'Please write a message.', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-send-message');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    const body = {
      productId: activeThread.product._id,
      text
    };

    const currentUser = getUser();
    if (currentUser && String(currentUser.id) === String(activeThread.sellerId)) {
      body.buyerId = activeThread.buyerId;
    }

    await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(body)
    });

    messageInput.value = '';
    await loadThread(activeThread.product._id, activeThread.buyerId);
    await loadInbox();
  } catch (error) {
    showMessage('messages-alert', error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
  }
}

async function updateConversationTransaction(transactionId, status) {
  try {
    await apiRequest(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    await loadThread(activeThread.product._id, activeThread.buyerId);
    await loadInbox();
  } catch (error) {
    showMessage('messages-alert', error.message, 'error');
  }
}

function highlightThreadInInbox() {
  document.querySelectorAll('.inbox-item').forEach(item => {
    item.classList.toggle('active', item.dataset.threadKey === activeThread.threadKey);
  });
}

window.updateConversationTransaction = updateConversationTransaction;