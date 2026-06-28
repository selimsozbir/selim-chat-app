const authScreen = document.getElementById('authScreen');
const chatScreen = document.getElementById('chatScreen');

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const authError = document.getElementById('authError');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');

const currentUsername = document.getElementById('currentUsername');
const currentStatusBubble = document.getElementById('currentStatusBubble');
const logoutButton = document.getElementById('logoutButton');
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');
const avatarLetter = document.getElementById('avatarLetter');
const removeAvatarButton = document.getElementById('removeAvatarButton');
const settingsButton = document.getElementById('settingsButton');
const sidebarFriendsButton = document.getElementById('sidebarFriendsButton');
const sidebarGalleryButton = document.getElementById('sidebarGalleryButton');
const sidebarSettingsButton = document.getElementById('sidebarSettingsButton');
const mobileTopBar = document.getElementById('mobileTopBar');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileSettingsButton = document.getElementById('mobileSettingsButton');
const mobileBackdrop = document.getElementById('mobileBackdrop');
const mobileTitle = document.getElementById('mobileTitle');
const mobileStatus = document.getElementById('mobileStatus');
const mobileBottomNav = document.getElementById('mobileBottomNav');
const mobileRoomButton = document.getElementById('mobileRoomButton');
const mobileDmButton = document.getElementById('mobileDmButton');
const mobileGroupButton = document.getElementById('mobileGroupButton');
const mobilePanelButton = document.getElementById('mobilePanelButton');
const mobileGalleryButton = document.getElementById('mobileGalleryButton');

const roomModeButton = document.getElementById('roomModeButton');
const dmModeButton = document.getElementById('dmModeButton');
const groupModeButton = document.getElementById('groupModeButton');
const roomPanel = document.getElementById('roomPanel');
const friendsPanel = document.getElementById('friendsPanel');
const groupsPanel = document.getElementById('groupsPanel');
const newGroupNameInput = document.getElementById('newGroupNameInput');
const createGroupButton = document.getElementById('createGroupButton');
const newGroupFriendsList = document.getElementById('newGroupFriendsList');
const groupsList = document.getElementById('groupsList');
const groupDetailsBox = document.getElementById('groupDetailsBox');
const activeGroupInfo = document.getElementById('activeGroupInfo');
const groupAvatarInput = document.getElementById('groupAvatarInput');
const changeGroupAvatarButton = document.getElementById('changeGroupAvatarButton');
const removeGroupAvatarButton = document.getElementById('removeGroupAvatarButton');
const leaveGroupButton = document.getElementById('leaveGroupButton');
const groupMembersList = document.getElementById('groupMembersList');
const addGroupFriendList = document.getElementById('addGroupFriendList');

const roomInput = document.getElementById('roomInput');
const joinRoomButton = document.getElementById('joinRoomButton');
const chatTitle = document.getElementById('chatTitle');
const chatHeaderAvatar = document.getElementById('chatHeaderAvatar');
const headerSearchButton = document.getElementById('headerSearchButton');
const headerGalleryButton = document.getElementById('headerGalleryButton');
const headerFriendsButton = document.getElementById('headerFriendsButton');
const headerSettingsButton = document.getElementById('headerSettingsButton');
const focusComposerButton = document.getElementById('focusComposerButton');
const jumpBottomHeaderButton = document.getElementById('jumpBottomHeaderButton');
const scrollBottomButton = document.getElementById('scrollBottomButton');
const commandPaletteModal = document.getElementById('commandPaletteModal');
const commandPaletteInput = document.getElementById('commandPaletteInput');
const commandPaletteList = document.getElementById('commandPaletteList');
const commandPaletteCloseButton = document.getElementById('commandPaletteCloseButton');

const mediaViewerModal = document.getElementById('mediaViewerModal');
const mediaViewerStage = document.getElementById('mediaViewerStage');
const mediaViewerTitle = document.getElementById('mediaViewerTitle');
const mediaViewerMeta = document.getElementById('mediaViewerMeta');
const mediaViewerOpenLink = document.getElementById('mediaViewerOpenLink');
const mediaViewerCloseButton = document.getElementById('mediaViewerCloseButton');
const mediaViewerPrevButton = document.getElementById('mediaViewerPrevButton');
const mediaViewerNextButton = document.getElementById('mediaViewerNextButton');

const composerHint = document.getElementById('composerHint');
const sendButton = document.getElementById('sendButton');
const statusText = document.getElementById('statusText');
const chatMetaText = document.getElementById('chatMetaText');

const messagesEl = document.getElementById('messages');
const usersList = document.getElementById('usersList');
const typingText = document.getElementById('typingText');

const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');
const emojiButton = document.getElementById('emojiButton');
const emojiPanel = document.getElementById('emojiPanel');
const attachButton = document.getElementById('attachButton');
const voiceButton = document.getElementById('voiceButton');
const voiceRecordHud = document.getElementById('voiceRecordHud');
const voiceRecordTimer = document.getElementById('voiceRecordTimer');
const voiceCancelButton = document.getElementById('voiceCancelButton');
const fileInput = document.getElementById('fileInput');
const replyBar = document.getElementById('replyBar');
const replyUsername = document.getElementById('replyUsername');
const replyText = document.getElementById('replyText');
const cancelReplyButton = document.getElementById('cancelReplyButton');

const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const searchResults = document.getElementById('searchResults');
const requestsList = document.getElementById('requestsList');
const friendsList = document.getElementById('friendsList');
const friendActivityList = document.getElementById('friendActivityList');
const refreshFriendActivityButton = document.getElementById('refreshFriendActivityButton');
const blockedList = document.getElementById('blockedList');

const notificationsList = document.getElementById('notificationsList');
const refreshReplayButton = document.getElementById('refreshReplayButton');
const chatReplayBox = document.getElementById('chatReplayBox');
const refreshStoryDecisionButton = document.getElementById('refreshStoryDecisionButton');
const storyDecisionBox = document.getElementById('storyDecisionBox');
const refreshCompanionButton = document.getElementById('refreshCompanionButton');
const companionBox = document.getElementById('companionBox');


const gamifyStats = document.getElementById('gamifyStats');
const polishQuickStats = document.getElementById('polishQuickStats');
const refreshGamifyButton = document.getElementById('refreshGamifyButton');
const dailyTabButton = document.getElementById('dailyTabButton');
const questsTabButton = document.getElementById('questsTabButton');
const lootboxTabButton = document.getElementById('lootboxTabButton');
const marketTabButton = document.getElementById('marketTabButton');
const leaderboardTabButton = document.getElementById('leaderboardTabButton');
const casinoTabButton = document.getElementById('casinoTabButton');
const shardsHistoryTabButton = document.getElementById('shardsHistoryTabButton');
const universeTabButton = document.getElementById('universeTabButton');
const inventoryTabButton = document.getElementById('inventoryTabButton');
const galleryTabButton = document.getElementById('galleryTabButton');
const dailyPanel = document.getElementById('dailyPanel');
const questsPanel = document.getElementById('questsPanel');
const lootboxPanel = document.getElementById('lootboxPanel');
const marketPanel = document.getElementById('marketPanel');
const leaderboardPanel = document.getElementById('leaderboardPanel');
const casinoPanel = document.getElementById('casinoPanel');
const shardsHistoryPanel = document.getElementById('shardsHistoryPanel');
const universePanel = document.getElementById('universePanel');
const inventoryPanel = document.getElementById('inventoryPanel');
const refreshInventoryButton = document.getElementById('refreshInventoryButton');
const inventoryItemsList = document.getElementById('inventoryItemsList');
const inventoryCompanionBox = document.getElementById('inventoryCompanionBox');

const socialPanel = document.getElementById('socialPanel');
const galleryPanel = document.getElementById('galleryPanel');
const galleryModal = document.getElementById('galleryModal');
const friendsCenterModal = document.getElementById('friendsCenterModal');
const friendsCenterCloseButton = document.getElementById('friendsCenterCloseButton');
const friendsCenterSearchInput = document.getElementById('friendsCenterSearchInput');
const friendsCenterSearchButton = document.getElementById('friendsCenterSearchButton');
const friendsCenterSearchResults = document.getElementById('friendsCenterSearchResults');
const friendsCenterList = document.getElementById('friendsCenterList');
const friendsCenterRequestsList = document.getElementById('friendsCenterRequestsList');
const friendsCenterBlockedList = document.getElementById('friendsCenterBlockedList');
const friendsCenterTabs = document.querySelectorAll('.friends-center-tab');
const presenceChoices = document.querySelectorAll('.presence-choice');
const socialPreviewAvatar = document.getElementById('socialPreviewAvatar');
const socialPreviewName = document.getElementById('socialPreviewName');
const socialPreviewPresence = document.getElementById('socialPreviewPresence');
const socialPreviewCustom = document.getElementById('socialPreviewCustom');
const clearCustomStatusButton = document.getElementById('clearCustomStatusButton');
const socialSaveHint = document.getElementById('socialSaveHint');
const dailyRewardText = document.getElementById('dailyRewardText');
const dailyStreakText = document.getElementById('dailyStreakText');
const dailyClaimButton = document.getElementById('dailyClaimButton');
const questsList = document.getElementById('questsList');
const lootboxCratesList = document.getElementById('lootboxCratesList');
const activeCrateIcon = document.getElementById('activeCrateIcon');
const activeCrateName = document.getElementById('activeCrateName');
const activeCrateInfo = document.getElementById('activeCrateInfo');
const openLootboxButton = document.getElementById('openLootboxButton');
const lootboxResult = document.getElementById('lootboxResult');
const lootboxAnimationStage = document.getElementById('lootboxAnimationStage');
const lootboxHistoryList = document.getElementById('lootboxHistoryList');
const marketList = document.getElementById('marketList');
const marketPreviewBox = document.getElementById('marketPreviewBox');
const shardsHistoryList = document.getElementById('shardsHistoryList');
const refreshShardsHistoryButton = document.getElementById('refreshShardsHistoryButton');
const refreshUniverseButton = document.getElementById('refreshUniverseButton');
const savePresenceButton = document.getElementById('savePresenceButton');
const presenceSelect = document.getElementById('presenceSelect');
const customStatusInput = document.getElementById('customStatusInput');
const saveStoryButton = document.getElementById('saveStoryButton');
const storyTextInput = document.getElementById('storyTextInput');
const clearStoryButton = document.getElementById('clearStoryButton');
const storiesList = document.getElementById('storiesList');
const refreshGalleryButton = document.getElementById('refreshGalleryButton');
const galleryList = document.getElementById('galleryList');
const universeStatusText = document.getElementById('universeStatusText');
const universeEnergyBar = document.getElementById('universeEnergyBar');
const universeLevelText = document.getElementById('universeLevelText');
const universeEnergyText = document.getElementById('universeEnergyText');
const universeEventText = document.getElementById('universeEventText');
const liveEventBox = document.getElementById('liveEventBox');
const inventoryList = document.getElementById('inventoryList');
const titlesList = document.getElementById('titlesList');
const profileVisitorsList = document.getElementById('profileVisitorsList');
const portalDropOverlay = document.getElementById('portalDropOverlay');
const portalDropTitle = document.getElementById('portalDropTitle');
const portalDropText = document.getElementById('portalDropText');
const claimPortalButton = document.getElementById('claimPortalButton');
const feizMoodText = document.getElementById('feizMoodText');
const feizNicknamesList = document.getElementById('feizNicknamesList');
const feizAdminControls = document.getElementById('feizAdminControls');
const feizMoodSelect = document.getElementById('feizMoodSelect');
const saveFeizMoodButton = document.getElementById('saveFeizMoodButton');
const refreshFeizButton = document.getElementById('refreshFeizButton');
const leaderboardList = document.getElementById('leaderboardList');
const slotBetInput = document.getElementById('slotBetInput');
const slotSpinButton = document.getElementById('slotSpinButton');
const slotResult = document.getElementById('slotResult');
const blackjackBetInput = document.getElementById('blackjackBetInput');
const blackjackStartButton = document.getElementById('blackjackStartButton');
const blackjackHitButton = document.getElementById('blackjackHitButton');
const blackjackStandButton = document.getElementById('blackjackStandButton');
const blackjackTable = document.getElementById('blackjackTable');
const leaderboardFilters = document.querySelectorAll('.leaderboard-filter');

const notificationBadge = document.getElementById('notificationBadge');
const enableNotificationsButton = document.getElementById('enableNotificationsButton');
const clearNotificationsButton = document.getElementById('clearNotificationsButton');

const messageSearchInput = document.getElementById('messageSearchInput');
const messageSearchButton = document.getElementById('messageSearchButton');
const messageSearchResults = document.getElementById('messageSearchResults');
const myRoleText = document.getElementById('myRoleText');
const adminMembersList = document.getElementById('adminMembersList');
const mutedMembersList = document.getElementById('mutedMembersList');

const globalAdminPanel = document.getElementById('globalAdminPanel');
const refreshAdminButton = document.getElementById('refreshAdminButton');
const adminUsersList = document.getElementById('adminUsersList');
const adminLogsList = document.getElementById('adminLogsList');
const refreshAdminLogsButton = document.getElementById('refreshAdminLogsButton');
const ipBansList = document.getElementById('ipBansList');
const ipBanInput = document.getElementById('ipBanInput');
const ipBanButton = document.getElementById('ipBanButton');

const profileModal = document.getElementById('profileModal');
const profileCloseButton = document.getElementById('profileCloseButton');
const profileAvatar = document.getElementById('profileAvatar');
const profileUsername = document.getElementById('profileUsername');
const profileStatus = document.getElementById('profileStatus');
const profileBio = document.getElementById('profileBio');
const profileBioInput = document.getElementById('profileBioInput');
const profileCover = document.getElementById('profileCover');
const profileLevel = document.getElementById('profileLevel');
const profileShards = document.getElementById('profileShards');
const profileTotalMessages = document.getElementById('profileTotalMessages');
const profileToggleAllBadgesButton = document.getElementById('profileToggleAllBadgesButton');
const profileAllBadgesPanel = document.getElementById('profileAllBadgesPanel');
const profileAllBadgesList = document.getElementById('profileAllBadgesList');
const profileSaveBadgesButton = document.getElementById('profileSaveBadgesButton');
const profileBadgeCounter = document.getElementById('profileBadgeCounter');
const profileBadgeHint = document.getElementById('profileBadgeHint');
const profileBadgeFilters = document.getElementById('profileBadgeFilters');
const profileBadgeSummary = document.getElementById('profileBadgeSummary');
const profileXpText = document.getElementById('profileXpText');
const profileNextXpText = document.getElementById('profileNextXpText');
const profileLevelFill = document.getElementById('profileLevelFill');
const profileJoinDate = document.getElementById('profileJoinDate');
const profileLastActive = document.getElementById('profileLastActive');
const profileFavoriteEgg = document.getElementById('profileFavoriteEgg');
const profileBadges = document.getElementById('profileBadges');
const profileEditPanel = document.getElementById('profileEditPanel');
const profileCoverInput = document.getElementById('profileCoverInput');
const profileCoverFileName = document.getElementById('profileCoverFileName');
const profileRoleBadge = document.getElementById('profileRoleBadge');
const profileCardV2 = document.getElementById('profileCardV2');
const profileAboutText = document.getElementById('profileAboutText');
const profileActivityGrid = document.getElementById('profileActivityGrid');
const profileActivityTotal = document.getElementById('profileActivityTotal');
const profileActivityActiveDays = document.getElementById('profileActivityActiveDays');
const profileActivityBestDay = document.getElementById('profileActivityBestDay');
const profileActivityStreak = document.getElementById('profileActivityStreak');
const profileActivityTopDays = document.getElementById('profileActivityTopDays');

const profileAboutMeta = document.getElementById('profileAboutMeta');
const profileActionButtons = document.getElementById('profileActionButtons');
const profileMessageButton = document.getElementById('profileMessageButton');
const profileFriendButton = document.getElementById('profileFriendButton');
const profileExportButton = document.getElementById('profileExportButton');
const profileSelfExportButton = document.getElementById('profileSelfExportButton');
const achievementToastContainer = document.getElementById('achievementToastContainer');
const profileColorInput = document.getElementById('profileColorInput');
const profileFavoriteEggSelect = document.getElementById('profileFavoriteEggSelect');
const profileRemoveCoverButton = document.getElementById('profileRemoveCoverButton');
const profileSaveBioButton = document.getElementById('profileSaveBioButton');

const settingsModal = document.getElementById('settingsModal');
const settingsCloseButton = document.getElementById('settingsCloseButton');
const settingsUsernameInput = document.getElementById('settingsUsernameInput');
const settingsDisplayNameInput = document.getElementById('settingsDisplayNameInput');
const settingsBioInput = document.getElementById('settingsBioInput');
const settingsSaveProfileButton = document.getElementById('settingsSaveProfileButton');
const settingsProfileStatus = document.getElementById('settingsProfileStatus');
const settingsCurrentPasswordInput = document.getElementById('settingsCurrentPasswordInput');
const settingsNewPasswordInput = document.getElementById('settingsNewPasswordInput');
const settingsNewPasswordAgainInput = document.getElementById('settingsNewPasswordAgainInput');
const settingsChangePasswordButton = document.getElementById('settingsChangePasswordButton');
const settingsPasswordStatus = document.getElementById('settingsPasswordStatus');
const settingsThemeSelect = document.getElementById('settingsThemeSelect');
const settingsCompactToggle = document.getElementById('settingsCompactToggle');
const settingsReducedMotionToggle = document.getElementById('settingsReducedMotionToggle');
const settingsSaveLocalButton = document.getElementById('settingsSaveLocalButton');
const settingsLocalStatus = document.getElementById('settingsLocalStatus');
const settingsEnableNotificationsButton = document.getElementById('settingsEnableNotificationsButton');
const settingsClearNotificationsButton = document.getElementById('settingsClearNotificationsButton');

const settingsFontSizeSelect = document.getElementById('settingsFontSizeSelect');
const settingsEnterSendToggle = document.getElementById('settingsEnterSendToggle');
const settingsShowAvatarsToggle = document.getElementById('settingsShowAvatarsToggle');
const settingsShowTimesToggle = document.getElementById('settingsShowTimesToggle');
const settingsNotifyDmToggle = document.getElementById('settingsNotifyDmToggle');
const settingsNotifyGroupToggle = document.getElementById('settingsNotifyGroupToggle');
const settingsNotifyMentionToggle = document.getElementById('settingsNotifyMentionToggle');
const settingsNotifyFriendToggle = document.getElementById('settingsNotifyFriendToggle');
const settingsNotificationSoundToggle = document.getElementById('settingsNotificationSoundToggle');
const settingsEggsToggle = document.getElementById('settingsEggsToggle');
const settingsEggIntensitySelect = document.getElementById('settingsEggIntensitySelect');
const settingsEggSoundToggle = document.getElementById('settingsEggSoundToggle');
const settingsEggOwnOnlyToggle = document.getElementById('settingsEggOwnOnlyToggle');
const settingsBotHideToggle = document.getElementById('settingsBotHideToggle');
const settingsBotHighlightToggle = document.getElementById('settingsBotHighlightToggle');
const settingsBotCompactToggle = document.getElementById('settingsBotCompactToggle');
const settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
const settingsClearLocalButton = document.getElementById('settingsClearLocalButton');
const settingsLogoutFromPanelButton = document.getElementById('settingsLogoutFromPanelButton');

const mentionPopup = document.getElementById('mentionPopup');

let mode = 'login';
let chatMode = 'room';
let activeFriend = null;
let activeGroup = null;
let friends = [];
let groups = [];
let groupMembers = [];
let selectedGroupFriendIds = new Set();
let selectedLootboxCrateId = 'serbia_rift';
let marketPreviewOriginalUser = null;
let marketPreviewTimer = null;
document.body.dataset.chatMode = chatMode;

let socket = null;
let commandPaletteItems = [];
let commandPaletteIndex = 0;
let mediaViewerItems = [];
let mediaViewerIndex = 0;
let storyVoteCache = new Map();

let token = localStorage.getItem('chat_token');
let user = null;
try {
  user = JSON.parse(localStorage.getItem('chat_user') || 'null');
} catch {
  user = null;
  localStorage.removeItem('chat_user');
}
let currentRoom = localStorage.getItem('chat_room') || 'genel';
let unreadNotifications = 0;
let typingTimer = null;
let roomReadTimer = null;
let dmTypingTimer = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let voiceRecordingStartedAt = 0;
let voiceRecordingLastDuration = 0;
let voiceRecordingTimer = null;
let voiceRecordingStream = null;
let cancelVoiceRecording = false;
let contextTarget = null;
let longPressTimer = null;
let replyingTo = null;
let roomMembers = [];
let mentionCandidates = [];
let selectedMentionIndex = 0;
let myRoomRole = null;
let roomMutedUsers = [];
let canOpenGlobalAdmin = false;
let isUploadingFile = false;
let lastRenderedSenderKey = '';
let lastRenderedMessageType = '';
let badgeCheckCooldown = 0;
let activeProfileUser = null;
let activeProfileAllBadges = [];
let activeProfileSelectedBadges = [];
let activeBadgeFilter = 'all';
let activePortalDrop = null;
let activeGalleryFilter = 'all';
let activeLiveEvent = null;

const contextMenu = document.createElement('div');
contextMenu.className = 'message-context-menu hidden';
contextMenu.innerHTML = `
  <button data-emoji="❤️">❤️</button>
  <button data-emoji="👍">👍</button>
  <button data-emoji="😂">😂</button>
  <button data-emoji="🔥">🔥</button>
  <button data-emoji="😘">😘</button>
  <button data-action="reply">Yanıtla</button>
  <button data-action="edit">Düzenle</button>
  <button data-action="delete" class="danger">Sil</button>
`;
document.body.appendChild(contextMenu);

contextMenu.addEventListener('click', (event) => {
  event.stopPropagation();
  const button = event.target.closest('button');
  if (!button || !contextTarget) return;

  if (button.dataset.emoji) {
    sendReaction(contextTarget.type, contextTarget.id, button.dataset.emoji);
    hideContextMenu();
    return;
  }

  if (button.dataset.action === 'reply') {
    startReply(contextTarget);
    hideContextMenu();
    return;
  }

  if (button.dataset.action === 'edit') {
    editMessage(contextTarget.type, contextTarget.id, contextTarget.text);
    hideContextMenu();
    return;
  }

  if (button.dataset.action === 'delete') {
    deleteMessage(contextTarget.type, contextTarget.id);
    hideContextMenu();
  }
});

document.addEventListener('click', () => hideContextMenu());
document.addEventListener('scroll', () => hideContextMenu(), true);
window.addEventListener('resize', () => hideContextMenu());

const imageModal = document.createElement('div');
imageModal.className = 'image-modal hidden';
imageModal.innerHTML = '<button class="image-modal-close" type="button">×</button><img alt="Büyük fotoğraf">';
document.body.appendChild(imageModal);

const imageModalImg = imageModal.querySelector('img');
const imageModalClose = imageModal.querySelector('.image-modal-close');

imageModalClose.addEventListener('click', closeImageModal);
imageModal.addEventListener('click', (event) => {
  if (event.target === imageModal) closeImageModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeImageModal();
});


function setMode(nextMode) {
  mode = nextMode;
  loginTab.classList.toggle('active', mode === 'login');
  registerTab.classList.toggle('active', mode === 'register');
  authButton.textContent = mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol';
  authError.textContent = '';
}

loginTab.addEventListener('click', () => setMode('login'));
registerTab.addEventListener('click', () => setMode('register'));

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  authError.textContent = '';
  authButton.disabled = true;

  try {
    const endpoint = mode === 'login' ? '/api/login' : '/api/register';
    const data = await api(endpoint, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    }, false);

    token = data.token;
    user = { ...(user || {}), ...(data.user || {}) };

    localStorage.setItem('chat_token', token);
    localStorage.setItem('chat_user', JSON.stringify(user));
    await startApp();
  } catch (error) {
    authError.textContent = error.message;
  } finally {
    authButton.disabled = false;
  }
});

function logout() {
  // Sadece hesap oturumunu kapat; tema/ayar localStorage değerleri kalsın.
  localStorage.removeItem('chat_token');
  localStorage.removeItem('chat_user');
  token = null;
  user = null;
  if (socket) socket.disconnect();
  chatScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
}

logoutButton.addEventListener('click', logout);

cancelReplyButton.addEventListener('click', clearReply);

roomModeButton.addEventListener('click', () => {
  clearReply();
  setChatMode('room');
});
dmModeButton.addEventListener('click', () => {
  clearReply();
  setChatMode('dm');
  loadFriends();
  loadFriendActivity();
  loadRequests();
  loadBlocked();
});

if (groupModeButton) {
  groupModeButton.addEventListener('click', () => {
    clearReply();
    setChatMode('group');
    loadGroups();
    renderNewGroupFriends();
  });
}

joinRoomButton.addEventListener('click', () => joinRoom(roomInput.value.trim() || 'genel'));
searchButton.addEventListener('click', searchUsers);
messageSearchButton.addEventListener('click', searchMessages);
messageSearchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchMessages();
});

profileCloseButton.addEventListener('click', closeProfile);
profileModal.addEventListener('click', (event) => {
  if (event.target === profileModal) closeProfile();
});

profileSaveBioButton.addEventListener('click', saveBio);
if (profileRemoveCoverButton) profileRemoveCoverButton.addEventListener('click', removeProfileCover);
if (profileCoverInput) profileCoverInput.addEventListener('change', refreshProfileCoverFileName);
if (profileMessageButton) profileMessageButton.addEventListener('click', openProfileDmFromCard);
if (profileFriendButton) profileFriendButton.addEventListener('click', sendFriendRequestFromCard);
if (profileCardV2) {
  profileCardV2.addEventListener('mousemove', syncProfileParallax);
  profileCardV2.addEventListener('mouseleave', resetProfileParallax);
}
if (profileExportButton) profileExportButton.addEventListener('click', exportProfilePng);
if (profileSelfExportButton) profileSelfExportButton.addEventListener('click', exportProfilePng);
if (profileToggleAllBadgesButton) profileToggleAllBadgesButton.addEventListener('click', toggleAllBadgesPanel);
if (profileSaveBadgesButton) profileSaveBadgesButton.addEventListener('click', saveProfileBadgeShowcase);
if (refreshFriendActivityButton) refreshFriendActivityButton.addEventListener('click', loadFriendActivity);



function updateMobileViewportHeight() {
  const vv = window.visualViewport;
  const height = vv?.height || window.innerHeight;
  const offsetTop = vv?.offsetTop || 0;
  const keyboardInset = Math.max(0, Math.round(window.innerHeight - height - offsetTop));

  document.documentElement.style.setProperty('--mobile-vvh', `${Math.round(height)}px`);
  document.documentElement.style.setProperty('--keyboard-inset', `${keyboardInset}px`);
  document.documentElement.style.setProperty('--mobile-bottom-inset', `${keyboardInset}px`);
  const composerShift = keyboardInset > 80 ? Math.min(190, Math.max(90, Math.round(keyboardInset * 0.42))) : 0;
  document.documentElement.style.setProperty('--composer-keyboard-shift', `${composerShift}px`);
  if (keyboardInset > 80) mobileKeyboardScrollFix?.();
}

function setMobileKeyboardOpen(open) {
  if (!isMobileLayout()) return;
  document.body.classList.toggle('keyboard-open', Boolean(open));
  document.body.classList.toggle('composer-focused', Boolean(open));
  updateMobileViewportHeight();
  if (open) {
    setTimeout(() => scrollToBottom?.(), 80);
    setTimeout(() => scrollToBottom?.(), 260);
  }
}

if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    updateMobileViewportHeight();
    if (isMobileLayout() && document.activeElement === messageInput) {
      document.body.classList.add('keyboard-open', 'composer-focused');
      setTimeout(() => scrollToBottom?.(), 90);
    }
  });
}


function forceMobileComposerPosition() {
  if (!isMobileLayout()) return;
  updateMobileViewportHeight();
  document.body.classList.toggle('keyboard-open', document.activeElement === messageInput);
  document.body.classList.toggle('composer-focused', document.activeElement === messageInput);
  if (document.activeElement === messageInput) {
    requestAnimationFrame(() => scrollToBottom?.());
  }
}

window.visualViewport?.addEventListener('scroll', forceMobileComposerPosition);
window.visualViewport?.addEventListener('resize', forceMobileComposerPosition);
window.addEventListener('orientationchange', () => setTimeout(forceMobileComposerPosition, 220));

window.addEventListener('resize', updateMobileViewportHeight);
document.addEventListener('DOMContentLoaded', updateMobileViewportHeight);

messageInput?.addEventListener('focus', () => setMobileKeyboardOpen(true));
messageInput?.addEventListener('blur', () => {
  setTimeout(() => {
    if (document.activeElement !== messageInput) setMobileKeyboardOpen(false);
  }, 180);
});

function syncRailActive(mode = chatMode) {
  document.getElementById('railRoomButton')?.classList.toggle('active', mode === 'room');
  document.getElementById('railDmButton')?.classList.toggle('active', mode === 'dm');
  document.getElementById('railGroupButton')?.classList.toggle('active', mode === 'group');
  syncMobileNav?.();
}



function isOwnerOrAdminUser() {
  const role = String(user?.global_role || user?.role || '').toLowerCase();
  return role === 'owner' || role === 'admin';
}

function syncAdminPrivacyButton() {
  const btn = document.getElementById('adminPrivacyToggleButton');
  if (!btn) return;
  const canSee = isOwnerOrAdminUser();
  btn.classList.toggle('hidden', !canSee);
  const visible = document.body.classList.contains('admin-panel-visible');
  btn.textContent = visible ? '🔓' : '🔒';
  btn.title = visible ? 'Admin panelini gizle' : 'Admin panelini göster';
}

function setAdminPanelVisible(visible) {
  if (!isOwnerOrAdminUser()) {
    document.body.classList.remove('admin-panel-visible');
    syncAdminPrivacyButton();
    return;
  }

  document.body.classList.toggle('admin-panel-visible', Boolean(visible));
  syncAdminPrivacyButton();

  if (visible) {
    loadGlobalAdminPanel?.();
    loadAdminLogs?.();
    showPolishToast?.('Admin panel açıldı', 'Yayında görünmemesi için Ctrl+Shift+A ile tekrar gizle.', 'info');
  } else {
    showPolishToast?.('Admin panel gizlendi', 'Yayın/ekran paylaşımı için güvenli mod.', 'success');
  }
}

function toggleAdminPanelPrivacy() {
  setAdminPanelVisible(!document.body.classList.contains('admin-panel-visible'));
}

document.getElementById('adminPrivacyToggleButton')?.addEventListener('click', toggleAdminPanelPrivacy);

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
    event.preventDefault();
    toggleAdminPanelPrivacy();
  }
});

function setSettingsCategory(category = 'account') {
  const target = category || 'account';
  document.querySelectorAll('.settings-nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.settingsTarget === target);
  });
  document.querySelectorAll('.settings-section[data-settings-section]').forEach((section) => {
    section.classList.toggle('settings-section-hidden', section.dataset.settingsSection !== target);
  });
  const content = document.querySelector('.settings-content-v2');
  if (content) content.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.settings-nav-item').forEach((button) => {
  button.addEventListener('click', () => setSettingsCategory(button.dataset.settingsTarget || 'account'));
});

function scrollRightPanelToHub() {
  const panel = document.querySelector('.right-panel');
  const hub = document.querySelector('.gamify-box');
  if (panel && hub) panel.scrollTo({ top: Math.max(0, hub.offsetTop - 12), behavior: 'smooth' });
}

document.getElementById('railRoomButton')?.addEventListener('click', () => {
  setChatMode('room');
  syncRailActive('room');
});

document.getElementById('railDmButton')?.addEventListener('click', () => {
  setChatMode('dm');
  loadFriends();
  loadFriendActivity?.();
  loadRequests();
  loadBlocked();
  syncRailActive('dm');
});

document.getElementById('railGroupButton')?.addEventListener('click', () => {
  setChatMode('group');
  loadGroups();
  renderNewGroupFriends();
  syncRailActive('group');
});

document.getElementById('railHubButton')?.addEventListener('click', () => {
  scrollRightPanelToHub();
  loadGamify?.();
});

document.getElementById('railSettingsButton')?.addEventListener('click', () => {
  openSettings?.();
});

if (settingsButton) settingsButton.addEventListener('click', openSettings);

bindMobileTap(mobileMenuButton, openMobileSidebar);
bindMobileTap(mobileBackdrop, closeMobilePanels);
bindMobileTap(mobileSettingsButton, () => { closeMobilePanels(); openSettings(); });

bindMobileTap(mobileRoomButton, () => {
  setChatMode('room');
  closeMobilePanels();
  messageInput?.focus();
});

bindMobileTap(mobileDmButton, () => {
  setChatMode('dm');
  loadFriends();
  loadFriendActivity();
  loadRequests();
  loadBlocked();
  openMobileSidebar();
});

bindMobileTap(mobileGroupButton, () => {
  setChatMode('group');
  loadGroups();
  renderNewGroupFriends();
  openMobileSidebar();
});

bindMobileTap(mobilePanelButton, openMobileRightPanel);
bindMobileTap(mobileGalleryButton, () => { closeMobilePanels(); openGalleryModal?.(); });
if (refreshAdminLogsButton) refreshAdminLogsButton.addEventListener('click', loadAdminLogs);
if (settingsCloseButton) settingsCloseButton.addEventListener('click', closeSettings);
if (settingsModal) settingsModal.addEventListener('click', (event) => {
  if (event.target === settingsModal) closeSettings();
});
if (settingsSaveProfileButton) settingsSaveProfileButton.addEventListener('click', saveSettingsProfile);
if (settingsChangePasswordButton) settingsChangePasswordButton.addEventListener('click', changeSettingsPassword);
if (settingsSaveLocalButton) settingsSaveLocalButton.addEventListener('click', saveLocalSettingsFromPanel);
if (settingsEnableNotificationsButton) settingsEnableNotificationsButton.addEventListener('click', requestBrowserNotificationsFromSettings);
if (settingsClearNotificationsButton) settingsClearNotificationsButton.addEventListener('click', clearNotificationsFromSettings);

if (settingsClearLocalButton) settingsClearLocalButton.addEventListener('click', resetLocalSettingsFromPanel);
if (settingsLogoutFromPanelButton) settingsLogoutFromPanelButton.addEventListener('click', logout);
if (createGroupButton) createGroupButton.addEventListener('click', createGroup);
if (changeGroupAvatarButton) changeGroupAvatarButton.addEventListener('click', () => groupAvatarInput?.click());
if (groupAvatarInput) groupAvatarInput.addEventListener('change', changeGroupAvatar);
if (removeGroupAvatarButton) removeGroupAvatarButton.addEventListener('click', removeGroupAvatar);
if (leaveGroupButton) leaveGroupButton.addEventListener('click', leaveGroup);
refreshAdminButton.addEventListener('click', loadGlobalAdminPanel);
ipBanButton.addEventListener('click', banIpFromInput);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchUsers();
});

messageInput.addEventListener('keydown', (event) => {
  if (mentionPopup.classList.contains('hidden')) return;

  if (event.key === 'Tab' || event.key === 'Enter') {
    event.preventDefault();
    applyMention(selectedMentionIndex);
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectedMentionIndex = Math.min(selectedMentionIndex + 1, mentionCandidates.length - 1);
    renderMentionPopup();
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectedMentionIndex = Math.max(selectedMentionIndex - 1, 0);
    renderMentionPopup();
  }

  if (event.key === 'Escape') {
    hideMentionPopup();
  }
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  closeEmojiPanel();

  const text = messageInput.value.trim();
  if (!text) return;
  if (!socket || !socket.connected) {
    addSystemMessage('Bağlantı hazırlanıyor, birkaç saniye sonra tekrar dene.');
    connectSocket();
    return;
  }

  const fiveEggCommand = normalizeFiveEggText(text);
  if (FIVE_EGG_COMMANDS.includes(fiveEggCommand)) {
    runFiveEgg(fiveEggCommand, user?.display_name || user?.username || '');
  }

  if (chatMode === 'dm') {
    if (!activeFriend) {
      addSystemMessage('Önce bir arkadaş seç.');
      return;
    }
    socket.emit('dm_message', { receiverId: activeFriend.id, text, type: 'text', replyToId: replyingTo?.id || null });
    clearReply();
  } else if (chatMode === 'group') {
    if (!activeGroup) {
      addSystemMessage('Önce bir grup seç.');
      return;
    }
    socket.emit('group_message', { groupId: activeGroup.id, text, type: 'text', replyToId: replyingTo?.id || null });
    clearReply();
  } else {
    socket.emit('chat_message', { text, type: 'text', replyToId: replyingTo?.id || null });
    clearReply();
  }

  messageInput.value = '';
  messageInput.focus();
  setTimeout(() => {
    if (document.getElementById('fiveEggLayer')) clearFiveEggClasses();
  }, 6500);
});

messageInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') return;
  if (event.shiftKey) return;

  // Mention seçimi açıksa Enter önce mention seçsin, mesaj göndermesin.
  if (mentionPopup && !mentionPopup.classList.contains('hidden')) return;

  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

  messageForm.requestSubmit();
});

messageInput.addEventListener('input', () => {
  updateMentionSuggestions();
  if (!socket) return;

  if (chatMode === 'dm' && activeFriend) {
    socket.emit('dm_typing', { receiverId: activeFriend.id });
  } else if (chatMode === 'room') {
    socket.emit('typing');
  }
});


const CHAT_EMOJIS = [
  '😀','😂','🤣','😍','😭','😎','😡','😈','💀','🔥','❤️','💜',
  '👍','👎','🙏','👏','🫡','🤝','😳','🤨','😴','🤯','🗿','💯',
  '✨','⚡','🌀','🔴','⚫','🧊','🏛️','🐈','🤖','👑','🎮','🎧',
  '🎵','🚀','🌌','⭐','💎','🍀','🇹🇷','🇷🇸','5️⃣','7️⃣','🍒','🔔'
];

function renderEmojiPanel() {
  if (!emojiPanel) return;
  emojiPanel.innerHTML = '';
  CHAT_EMOJIS.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-option';
    btn.textContent = emoji;
    btn.onclick = () => insertEmoji(emoji);
    emojiPanel.appendChild(btn);
  });
}

function insertEmoji(emoji) {
  const start = messageInput.selectionStart ?? messageInput.value.length;
  const end = messageInput.selectionEnd ?? messageInput.value.length;
  messageInput.value = messageInput.value.slice(0, start) + emoji + messageInput.value.slice(end);
  messageInput.focus();
  const pos = start + emoji.length;
  messageInput.setSelectionRange(pos, pos);
  closeEmojiPanel();
  updateMentionSuggestions();
}

function closeEmojiPanel() {
  if (emojiPanel) emojiPanel.classList.add('hidden');
}

function openEmojiPanel() {
  if (!emojiPanel) return;
  renderEmojiPanel();
  emojiPanel.classList.remove('hidden');
}

function toggleEmojiPanel() {
  if (!emojiPanel) return;
  if (emojiPanel.classList.contains('hidden')) openEmojiPanel();
  else closeEmojiPanel();
}

if (emojiButton) emojiButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  toggleEmojiPanel();
});

document.addEventListener('pointerdown', (event) => {
  if (!emojiPanel || emojiPanel.classList.contains('hidden')) return;
  if (emojiPanel.contains(event.target) || emojiButton?.contains(event.target)) return;
  closeEmojiPanel();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeEmojiPanel();
});


attachButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  try {
    await sendFileMessage(file);
  } catch (error) {
    addSystemMessage(error.name === 'AbortError' ? 'Yükleme zaman aşımına uğradı.' : error.message);
    console.error('Upload client error:', error);
  } finally {
    fileInput.value = '';
  }
});

voiceButton.addEventListener('click', async () => {
  if (isRecording) {
    stopVoiceRecording(false);
    return;
  }

  await startVoiceRecording();
});

voiceCancelButton?.addEventListener('click', () => {
  if (!isRecording) return;
  stopVoiceRecording(true);
});

async function sendFileMessage(file) {
  if (isUploadingFile) {
    addSystemMessage('Zaten bir dosya yükleniyor.');
    return;
  }

  if (!file) {
    throw new Error('Dosya seçilmedi.');
  }

  if (file.size > 25_000_000) {
    throw new Error('Dosya çok büyük. 25 MB altı dosya seç.');
  }

  isUploadingFile = true;
  attachButton.disabled = true;
  voiceButton.disabled = true;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 70000);

    let response;
    try {
      response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const rawText = await response.text();
    let data = {};

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      throw new Error(`Upload cevabı okunamadı. HTTP ${response.status}: ${rawText.slice(0, 120)}`);
    }

    if (!response.ok) {
      throw new Error(data.error || `Dosya yüklenemedi. HTTP ${response.status}`);
    }

    const uploaded = data.file;
    if (!uploaded || !uploaded.fileUrl || !uploaded.type) {
      throw new Error('Upload cevabı eksik geldi.');
    }

    const uploadedType = uploaded.type;
    const payload = {
      text: uploadedType === 'image' ? 'Fotoğraf' : uploadedType === 'audio' ? 'Ses dosyası' : uploaded.fileName,
      type: uploadedType,
      fileName: uploaded.fileName,
      fileMime: uploaded.fileMime,
      fileData: uploaded.fileUrl,
      filePath: uploaded.filePath,
      fileSize: uploaded.fileSize
    };

    if (chatMode === 'dm') {
      if (!activeFriend) {
        addSystemMessage('Önce bir arkadaş seç.');
        return;
      }

      socket.emit('dm_message', {
        receiverId: activeFriend.id,
        ...payload,
        replyToId: replyingTo?.id || null
      });

      clearReply();
    } else if (chatMode === 'group') {
      if (!activeGroup) {
        addSystemMessage('Önce bir grup seç.');
        return;
      }

      socket.emit('group_message', {
        groupId: activeGroup.id,
        ...payload,
        replyToId: replyingTo?.id || null
      });

      clearReply();
    } else {
      socket.emit('chat_message', {
        ...payload,
        replyToId: replyingTo?.id || null
      });

      clearReply();
    }
  } catch (error) {
    addSystemMessage(error.name === 'AbortError'
      ? 'Yükleme zaman aşımına uğradı.'
      : error.message);
    console.error('Upload client error:', error);
  } finally {
    isUploadingFile = false;
    attachButton.disabled = false;
    voiceButton.disabled = false;
    fileInput.value = '';
  }
}

async function startVoiceRecording() {
  if (!navigator.mediaDevices?.getUserMedia) {
    addSystemMessage('Tarayıcın ses kaydı desteklemiyor.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    voiceRecordingStream = stream;
    recordedChunks = [];
    cancelVoiceRecording = false;

    const supportedMimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac'
    ];
    const preferredType = supportedMimeTypes.find(type => MediaRecorder.isTypeSupported?.(type)) || '';
    mediaRecorder = preferredType
      ? new MediaRecorder(stream, { mimeType: preferredType })
      : new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      voiceRecordingStream = null;

      if (cancelVoiceRecording) {
        recordedChunks = [];
        cancelVoiceRecording = false;
        showPolishToast?.('Ses kaydı iptal edildi', '', 'info');
        return;
      }

      const duration = voiceRecordingLastDuration || (voiceRecordingStartedAt ? (Date.now() - voiceRecordingStartedAt) / 1000 : 0);
      if (duration < 0.35 || !recordedChunks.length) {
        recordedChunks = [];
        addSystemMessage('Ses kaydı çok kısa.');
        return;
      }

      const finalType = mediaRecorder?.mimeType || preferredType || 'audio/webm';
      const extension = finalType.includes('mp4') || finalType.includes('aac') ? 'm4a' : 'webm';
      const blob = new Blob(recordedChunks, { type: finalType });
      const file = new File([blob], `voice-${Date.now()}.${extension}`, { type: finalType });

      try {
        showPolishToast?.('Ses yükleniyor', `${formatVoiceTime(duration)} kayıt gönderiliyor.`, 'info');
        await sendFileMessage(file);
      } catch (error) {
        addSystemMessage(error.message);
      } finally {
        recordedChunks = [];
        voiceRecordingLastDuration = 0;
      }
    };

    mediaRecorder.start(500);
    setVoiceRecordingUi(true);
    showPolishToast?.('Ses kaydı başladı', 'Durdurmak için kırmızı butona bas.', 'info');
  } catch (error) {
    console.error('Voice recording error:', error);
    const message = error?.name === 'NotAllowedError'
      ? 'Mikrofon izni engellenmiş görünüyor. Tarayıcı site ayarlarından mikrofonu izinli yap.'
      : error?.name === 'NotFoundError'
        ? 'Mikrofon bulunamadı.'
        : error?.name === 'NotReadableError'
          ? 'Mikrofon başka bir uygulama tarafından kullanılıyor olabilir.'
          : `Ses kaydı başlatılamadı: ${error?.message || error?.name || 'Bilinmeyen hata'}`;
    addSystemMessage(message);
    showPolishToast?.('Ses kaydı başlatılamadı', message, 'error');
    setVoiceRecordingUi(false);
    voiceRecordingStream?.getTracks?.().forEach(track => track.stop());
    voiceRecordingStream = null;
  }
}

function stopVoiceRecording(cancel = false) {
  if (!mediaRecorder || !isRecording) return;

  voiceRecordingLastDuration = voiceRecordingStartedAt ? (Date.now() - voiceRecordingStartedAt) / 1000 : 0;
  cancelVoiceRecording = Boolean(cancel);
  try {
    mediaRecorder.stop();
  } catch {}

  voiceRecordingStream?.getTracks?.().forEach(track => track.stop());
  setVoiceRecordingUi(false);
}


document.addEventListener('paste', async (event) => {
  const items = Array.from(event.clipboardData?.items || []);
  const fileItem = items.find(item => item.kind === 'file');

  if (!fileItem) return;

  const file = fileItem.getAsFile();
  if (!file) return;

  event.preventDefault();

  try {
    await sendFileMessage(file);
  } catch (error) {
    addSystemMessage(error.message);
  }
});

avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files?.[0];
  if (!file) return;

  try {
    const avatarData = await resizeImage(file, 256);
    const data = await api('/api/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarData })
    });

    user = { ...(user || {}), ...(data.user || {}) };
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
    addSystemMessage('Profil fotoğrafı güncellendi.');
  } catch (error) {
    addSystemMessage(error.message);
  }
});

removeAvatarButton.addEventListener('click', async () => {
  try {
    const data = await api('/api/avatar', { method: 'DELETE' });
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
    addSystemMessage('Profil fotoğrafı kaldırıldı.');
  } catch (error) {
    addSystemMessage(error.message);
  }
});

clearNotificationsButton.addEventListener('click', async () => {
  try {
    await api('/api/notifications', { method: 'DELETE' });
    notificationsList.innerHTML = '<div class="mini-item">Bildirim yok.</div>';
    unreadNotifications = 0;
    updateBadge();
  } catch (error) {
    addSystemMessage(error.message);
  }
});

enableNotificationsButton?.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    addSystemMessage('Tarayıcın bildirim desteklemiyor.');
    return;
  }

  const permission = await Notification.requestPermission();
  addSystemMessage(permission === 'granted' ? 'Bildirimler açıldı.' : 'Bildirim izni verilmedi.');
});

if (focusComposerButton) focusComposerButton.addEventListener('click', () => messageInput.focus());
if (jumpBottomHeaderButton) jumpBottomHeaderButton.addEventListener('click', scrollToBottom);
if (scrollBottomButton) scrollBottomButton.addEventListener('click', scrollToBottom);
messagesEl.addEventListener('scroll', updateScrollBottomButton);
bindGamifyControls();


function bindGamifyControls() {
  if (refreshGamifyButton && !refreshGamifyButton.dataset.bound) {
    refreshGamifyButton.dataset.bound = '1';
    refreshGamifyButton.addEventListener('click', loadGamify);
  }

  if (dailyTabButton && !dailyTabButton.dataset.bound) {
    dailyTabButton.dataset.bound = '1';
    dailyTabButton.addEventListener('click', () => switchGamifyTab('daily'));
  }

  if (questsTabButton && !questsTabButton.dataset.bound) {
    questsTabButton.dataset.bound = '1';
    questsTabButton.addEventListener('click', () => switchGamifyTab('quests'));
  }

  if (lootboxTabButton && !lootboxTabButton.dataset.bound) {
    lootboxTabButton.dataset.bound = '1';
    lootboxTabButton.addEventListener('click', () => switchGamifyTab('lootbox'));
  }

  if (dailyClaimButton && !dailyClaimButton.dataset.bound) {
    dailyClaimButton.dataset.bound = '1';
    dailyClaimButton.addEventListener('click', claimDailyReward);
  }

  if (openLootboxButton && !openLootboxButton.dataset.bound) {
    openLootboxButton.dataset.bound = '1';
    openLootboxButton.addEventListener('click', openLootbox);
  }

  if (marketTabButton && !marketTabButton.dataset.bound) {
    marketTabButton.dataset.bound = '1';
    marketTabButton.addEventListener('click', () => switchGamifyTab('market'));
  }

  if (leaderboardTabButton && !leaderboardTabButton.dataset.bound) {
    leaderboardTabButton.dataset.bound = '1';
    leaderboardTabButton.addEventListener('click', () => switchGamifyTab('leaderboard'));
  }

  if (casinoTabButton && !casinoTabButton.dataset.bound) {
    casinoTabButton.dataset.bound = '1';
    casinoTabButton.addEventListener('click', () => switchGamifyTab('casino'));
  }

  if (shardsHistoryTabButton && !shardsHistoryTabButton.dataset.bound) {
    shardsHistoryTabButton.dataset.bound = '1';
    shardsHistoryTabButton.addEventListener('click', () => switchGamifyTab('shards'));
  }

  if (universeTabButton && !universeTabButton.dataset.bound) {
    universeTabButton.dataset.bound = '1';
    universeTabButton.addEventListener('click', () => switchGamifyTab('universe'));
  }

  if (inventoryTabButton && !inventoryTabButton.dataset.bound) {
    inventoryTabButton.dataset.bound = '1';
    inventoryTabButton.addEventListener('click', () => switchGamifyTab('inventory'));
  }

  if (galleryTabButton && !galleryTabButton.dataset.bound) {
    galleryTabButton.dataset.bound = '1';
    galleryTabButton.addEventListener('click', () => switchGamifyTab('gallery'));
  }

  if (savePresenceButton && !savePresenceButton.dataset.bound) {
    savePresenceButton.dataset.bound = '1';
    savePresenceButton.addEventListener('click', savePresence);
  }

  if (refreshGalleryButton && !refreshGalleryButton.dataset.bound) {
    refreshGalleryButton.dataset.bound = '1';
    refreshGalleryButton.addEventListener('click', loadGallery);
  }

  bindGalleryFilters();

  if (refreshUniverseButton && !refreshUniverseButton.dataset.bound) {
    refreshUniverseButton.dataset.bound = '1';
    refreshUniverseButton.addEventListener('click', loadUniversePanel);
  }

  if (claimPortalButton && !claimPortalButton.dataset.bound) {
    claimPortalButton.dataset.bound = '1';
    claimPortalButton.addEventListener('click', claimActivePortal);
  }

  if (refreshFeizButton && !refreshFeizButton.dataset.bound) {
    refreshFeizButton.dataset.bound = '1';
    refreshFeizButton.addEventListener('click', loadFeizPersonality);
  }

  if (saveFeizMoodButton && !saveFeizMoodButton.dataset.bound) {
    saveFeizMoodButton.dataset.bound = '1';
    saveFeizMoodButton.addEventListener('click', saveFeizMood);
  }

  if (refreshShardsHistoryButton && !refreshShardsHistoryButton.dataset.bound) {
    refreshShardsHistoryButton.dataset.bound = '1';
    refreshShardsHistoryButton.addEventListener('click', loadShardsHistory);
  }

  if (slotSpinButton && !slotSpinButton.dataset.bound) {
    slotSpinButton.dataset.bound = '1';
    slotSpinButton.addEventListener('click', playSlot);
  }

  if (blackjackStartButton && !blackjackStartButton.dataset.bound) {
    blackjackStartButton.dataset.bound = '1';
    blackjackStartButton.addEventListener('click', startBlackjack);
  }

  if (blackjackHitButton && !blackjackHitButton.dataset.bound) {
    blackjackHitButton.dataset.bound = '1';
    blackjackHitButton.addEventListener('click', hitBlackjack);
  }

  if (blackjackStandButton && !blackjackStandButton.dataset.bound) {
    blackjackStandButton.dataset.bound = '1';
    blackjackStandButton.addEventListener('click', standBlackjack);
  }

  leaderboardFilters.forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => loadLeaderboard(btn.dataset.leaderboard || 'level'));
  });
}


async function api(url, options = {}, withAuth = true) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (withAuth && token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'İşlem başarısız.');
  return data;
}


function isMobileLayout() {
  return window.matchMedia && window.matchMedia('(max-width: 960px)').matches;
}

function bindMobileTap(element, handler) {
  if (!element) return;
  let touchHandledAt = 0;

  element.addEventListener('touchend', (event) => {
    touchHandledAt = Date.now();
    event.preventDefault();
    handler(event);
  }, { passive: false });

  element.addEventListener('click', (event) => {
    if (Date.now() - touchHandledAt < 650) return;
    event.preventDefault();
    handler(event);
  });
}

function openMobileSidebar() {
  if (!isMobileLayout()) return;
  closeMobileRightPanel(false);
  syncMobileNav();
  document.body.classList.add('mobile-sidebar-open');
  mobileBackdrop?.classList.remove('hidden');
}

function closeMobileSidebar(hideBackdrop = true) {
  document.body.classList.remove('mobile-sidebar-open');
  if (hideBackdrop && !document.body.classList.contains('mobile-right-panel-open')) {
    mobileBackdrop?.classList.add('hidden');
  }
}

function openMobileRightPanel() {
  if (!isMobileLayout()) return;
  closeMobileSidebar(false);
  document.body.classList.add('mobile-right-panel-open');
  mobileBackdrop?.classList.remove('hidden');
  syncMobileNav();
  setTimeout(() => {
    const panel = document.querySelector('.right-panel');
    const hub = document.querySelector('.gamify-box');
    if (panel && hub) panel.scrollTo({ top: Math.max(0, hub.offsetTop - 10), behavior: 'smooth' });
  }, 40);
}

function closeMobileRightPanel(hideBackdrop = true) {
  document.body.classList.remove('mobile-right-panel-open');
  if (hideBackdrop && !document.body.classList.contains('mobile-sidebar-open')) {
    mobileBackdrop?.classList.add('hidden');
  }
  syncMobileNav();
}

function closeMobilePanels() {
  document.body.classList.remove('mobile-sidebar-open', 'mobile-right-panel-open');
  mobileBackdrop?.classList.add('hidden');
  syncMobileNav();
}

function closeMobilePanelsAfterSelect() {
  if (!isMobileLayout?.()) return;
  closeMobilePanels();
}

function syncMobileNav() {
  if (!mobileRoomButton || !mobileDmButton || !mobileGroupButton) return;
  const rightOpen = document.body.classList.contains('mobile-right-panel-open');
  mobileRoomButton.classList.toggle('active', chatMode === 'room' && !rightOpen);
  mobileDmButton.classList.toggle('active', chatMode === 'dm' && !rightOpen);
  mobileGroupButton.classList.toggle('active', chatMode === 'group' && !rightOpen);
  mobilePanelButton?.classList.toggle('active', rightOpen);
}

function syncMobileHeader() {
  if (mobileTitle && chatTitle) mobileTitle.textContent = chatTitle.textContent || '# genel';
  if (mobileStatus && statusText) mobileStatus.textContent = statusText.textContent || '';
  syncMobileNav();
}

function lastActivityText() {
  const last = messagesEl?.querySelector('.message:last-child');
  if (!last) return 'son aktivite yok';
  return 'son aktivite az önce';
}

function currentHeaderContext() {
  if (chatMode === 'dm') return activeFriend ? `${activeFriend.username} ile DM` : 'DM seç';
  if (chatMode === 'group') return activeGroup ? `${activeGroup.name} grubu` : 'Grup seç';
  return `# ${currentRoom || 'genel'}`;
}

function updateHeaderMeta() {
  if (!chatMetaText) return;

  if (chatMode === 'room') {
    const onlineCount = usersList?.querySelectorAll('li, .room-user-item, .user-row').length || roomMembers?.length || 0;
    const eventText = activeLiveEvent?.name ? activeLiveEvent.name : 'Serbia Rift stabil';
    chatMetaText.textContent = `${onlineCount} online · ${eventText} · ${lastActivityText()}`;
    return;
  }

  if (chatMode === 'dm') {
    const state = activeFriend ? formatPresence(activeFriend) : 'soldan chat seç';
    chatMetaText.textContent = `${state} · ${lastActivityText()}`;
    return;
  }

  if (chatMode === 'group') {
    chatMetaText.textContent = `${currentHeaderContext()} · ${lastActivityText()}`;
    return;
  }

  chatMetaText.textContent = 'Hazır';
}

function focusHeaderSearch() {
  if (chatMode !== 'room') {
    openFriendsCenter?.('friends');
    return;
  }

  if (messageSearchInput) {
    messageSearchInput.focus();
    messageSearchInput.scrollIntoView?.({ block: 'center', behavior: 'smooth' });
  }
}



function getLocalSettings() {
  return {
    theme: localStorage.getItem('chat_theme') || 'neon',
    compact: localStorage.getItem('chat_compact') === 'true',
    reducedMotion: localStorage.getItem('chat_reduced_motion') === 'true',
    fontSize: localStorage.getItem('chat_font_size') || 'normal',
    enterSend: localStorage.getItem('chat_enter_send') !== 'false',
    showAvatars: localStorage.getItem('chat_show_avatars') !== 'false',
    showTimes: localStorage.getItem('chat_show_times') !== 'false',
    notifyDm: localStorage.getItem('chat_notify_dm') !== 'false',
    notifyGroup: localStorage.getItem('chat_notify_group') !== 'false',
    notifyMention: localStorage.getItem('chat_notify_mention') !== 'false',
    notifyFriend: localStorage.getItem('chat_notify_friend') !== 'false',
    notificationSound: localStorage.getItem('chat_notification_sound') === 'true',
    eggsEnabled: localStorage.getItem('chat_eggs_enabled') !== 'false',
    eggIntensity: localStorage.getItem('chat_egg_intensity') || 'normal',
    eggSound: localStorage.getItem('chat_egg_sound') === 'true',
    eggOwnOnly: localStorage.getItem('chat_egg_own_only') === 'true',
    botHide: localStorage.getItem('chat_bot_hide') === 'true',
    botHighlight: localStorage.getItem('chat_bot_highlight') !== 'false',
    botCompact: localStorage.getItem('chat_bot_compact') === 'true',
    language: localStorage.getItem('chat_language') || 'tr'
  };
}

function applyLocalSettings() {
  const settings = getLocalSettings();

  document.body.classList.remove(
    'theme-light',
    'theme-dark-simple',
    'theme-vertex',
    'theme-serbia',
    'theme-limbo',
    'theme-rome',
    'theme-egypt',
    'theme-five',
    'font-small',
    'font-large',
    'hide-avatars',
    'hide-times',
    'egg-intensity-low',
    'egg-intensity-high',
    'bot-highlight-off',
    'bot-compact-mode'
  );

  document.body.classList.toggle('theme-light', settings.theme === 'light');
  document.body.classList.toggle('theme-dark-simple', settings.theme === 'dark');
  document.body.classList.toggle('theme-vertex', settings.theme === 'vertex');
  document.body.classList.toggle('theme-serbia', settings.theme === 'serbia');
  document.body.classList.toggle('theme-limbo', settings.theme === 'limbo');
  document.body.classList.toggle('theme-rome', settings.theme === 'rome');
  document.body.classList.toggle('theme-egypt', settings.theme === 'egypt');
  document.body.classList.toggle('theme-five', settings.theme === 'five');
  document.body.classList.toggle('compact-mode', settings.compact);
  document.body.classList.toggle('reduced-motion-mode', settings.reducedMotion);
  document.body.classList.toggle('font-small', settings.fontSize === 'small');
  document.body.classList.toggle('font-large', settings.fontSize === 'large');
  document.body.classList.toggle('hide-avatars', !settings.showAvatars);
  document.body.classList.toggle('hide-times', !settings.showTimes);
  document.body.classList.toggle('egg-intensity-low', settings.eggIntensity === 'low');
  document.body.classList.toggle('egg-intensity-high', settings.eggIntensity === 'high');
  document.body.classList.toggle('bot-highlight-off', !settings.botHighlight);
  document.body.classList.toggle('bot-compact-mode', settings.botCompact);
}


async function restoreSessionUser() {
  if (!token) return false;

  try {
    const data = await api('/api/me');
    user = { ...(user || {}), ...(data.user || {}) };
    localStorage.setItem('chat_user', JSON.stringify(user));
    return Boolean(user?.id && user?.username);
  } catch (error) {
    const msg = String(error?.message || '');
    if (/401|403|Token geçersiz|Geçersiz token|Yetkisiz/i.test(msg)) {
      localStorage.removeItem('chat_token');
      localStorage.removeItem('chat_user');
      token = null;
      user = null;
      return false;
    }
    return Boolean(user?.id && user?.username);
  }
}



async function startApp() {
  applyLocalSettings();

  if (!token) {
    authScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    return;
  }

  const restored = await restoreSessionUser();
  if (!restored || !user) {
    authScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    return;
  }

  authScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');

  renderProfile();
  syncMobileHeader();
  roomInput.value = currentRoom;
  connectSocket();

  Promise.allSettled([
    refreshMe(),
    loadFriends(),
    loadRequests(),
    loadBlocked(),
    loadNotifications(),
    loadRoomMembers(),
    loadModeration(),
    loadGlobalAdminStatus(),
    loadGroups(),
    loadGamify()
  ]).then(() => {
    checkForUnlockedBadges(true);
    updateMessengerUi();
    loadInventory?.();
  }).catch(() => {});
}


function renderProfile() {
  document.body.classList.remove('active-frame-frame_vertex', 'active-frame-frame_limbo', 'active-frame-frame_five', 'active-frame-frame_ataturk', 'active-name-name_glitch', 'active-name-name_neon', 'active-name-name_legend', 'active-theme-theme_limbo', 'active-theme-theme_serbia', 'active-theme-theme_egypt', 'active-theme-theme_rome', 'active-theme-theme_vertex', 'active-theme-theme_five');
  if (user?.active_profile_frame) document.body.classList.add('active-frame-' + user.active_profile_frame);
  if (user?.active_name_effect) document.body.classList.add('active-name-' + user.active_name_effect);
  if (user?.active_profile_theme) document.body.classList.add('active-theme-' + user.active_profile_theme);

  currentUsername.textContent = user.display_name || user.username;
  if (currentStatusBubble) {
    const custom = String(user?.custom_status || '').trim();
    const status = String(user?.presence_status || 'online').toLowerCase();
    currentStatusBubble.textContent = custom || `${presenceIcon?.(status) || '🟢'} ${presenceLabel?.(status) || 'Aktif'}`;
    currentStatusBubble.classList.toggle('hidden', !(custom || status));
    currentStatusBubble.dataset.presence = status;
  }
  avatarLetter.textContent = (user.display_name || user.username).charAt(0).toUpperCase();

  if (user.avatar_url) {
    avatarImg.src = user.avatar_url;
    avatarImg.classList.remove('hidden');
    avatarLetter.classList.add('hidden');
  } else {
    avatarImg.classList.add('hidden');
    avatarLetter.classList.remove('hidden');
  }

  syncAdminPrivacyButton();
  syncSocialInputs?.();
}

function connectSocket() {
  if (socket) socket.disconnect();
  socket = io({ auth: { token } });

  socket.on('connect', () => {
    statusText.textContent = 'Bağlandı';
    syncMobileHeader();
    if (chatMode === 'group' && activeGroup) {
      socket.emit('group_join', { groupId: activeGroup.id });
    } else {
      joinRoom(currentRoom);
    }
  });

  socket.on('disconnect', () => statusText.textContent = 'Bağlantı koptu');
  socket.on('connect_error', (error) => {
    statusText.textContent = 'Bağlantı hatası: ' + error.message;
    addSystemMessage(error.message || 'Bağlantı hatası.');
  });

  socket.on('system_message', addSystemMessage);

  socket.on('portal_drop', (drop) => {
    showPortalDrop(drop);
    showPolishToast?.('Portal açıldı', 'Hızlı tıkla, ödülü kap.', 'info');
  });

  socket.on('portal_claimed', ({ drop_id, username, reward_shards, reward_xp }) => {
    if (activePortalDrop?.id === drop_id) {
      portalDropOverlay?.classList.add('hidden');
      activePortalDrop = null;
    }
    addSystemMessage(`🌀 ${username} portal ödülünü aldı: +${reward_shards} shards / +${reward_xp} XP`);
  });

  socket.on('live_event_started', ({ event, text }) => {
    renderLiveEvent(event);
    addSystemMessage(text || `${event?.name || 'Live Event'} başladı.`);
    showPolishToast?.('Live Event', event?.name || 'Event başladı', 'info');
    loadUniversePanel?.();
  });

  socket.on('feiz_mood_changed', ({ mood }) => {
    showPolishToast?.('feiz mood değişti', moodLabel(mood), 'info');
    loadFeizPersonality?.();
  });

  socket.on('level_reward', ({ levels, total_shards, new_level }) => {
    const lastLevel = new_level || levels?.[levels.length - 1]?.level;
    showPolishToast?.('Level atladın!', `Level ${lastLevel} · +${total_shards || 0} shards`, 'success');
    addSystemMessage(`🎉 Level ${lastLevel} ödülü: +${total_shards || 0} shards`);
    loadGamify?.();
  });

  socket.on('room_role', ({ role }) => {
    myRoomRole = role;
    renderRole();
  });

  socket.on('global_banned', ({ reason }) => {
    alert(reason || 'Bu hesap banlandı.');
    localStorage.clear();
    location.reload();
  });

  socket.on('room_kicked', ({ room }) => {
    if (room === currentRoom) {
      addSystemMessage('Bu odadan atıldın.');
      joinRoom('genel');
    }
  });

  socket.on('room_banned', ({ room }) => {
    if (room === currentRoom) {
      addSystemMessage('Bu odadan banlandın.');
      joinRoom('genel');
    }
  });
  socket.on('chat_message', (message) => {
    if (message.sender_id === user.id || message.user_id === user.id) checkForUnlockedBadges();
    if (chatMode !== 'room') return;
    if (!message.room || message.room === currentRoom) {
      addRoomMessage(message);
      maybeRunFiveEggFromMessage(message);
      if (Number(message.sender_id || message.user_id) !== Number(user.id)) {
        markRoomMessagesRead([message.id]);
      }
    }
  });
  socket.on('users', renderUsers);
  socket.on('story_decision_update', updateStoryDecisionCards);

  socket.on('room_message_updated', (msg) => updateMessageElement('room', msg.id, msg.text, true, false));
  socket.on('room_message_deleted', (msg) => updateMessageElement('room', msg.id, msg.text, false, true));

  socket.on('room_read_summary', ({ messageId, readers }) => {
    updateRoomReadStatus(messageId, readers || []);
  });

  socket.on('dm_message_updated', (msg) => updateMessageElement('dm', msg.id, msg.text, true, false));
  socket.on('dm_message_deleted', (msg) => updateMessageElement('dm', msg.id, msg.text, false, true));

  socket.on('dm_read', ({ byId }) => {
    if (activeFriend && activeFriend.id === byId) {
      document.querySelectorAll('.read-status.mine').forEach(el => el.textContent = 'Görüldü ✓✓');
    }
  });

  socket.on('typing', (username) => {
    if (chatMode !== 'room') return;

    typingText.textContent = `${username} yazıyor...`;
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => typingText.textContent = '', 1200);
  });

  socket.on('dm_typing', ({ fromId, fromUsername }) => {
    if (chatMode === 'dm' && activeFriend && String(activeFriend.id) === String(fromId)) {
      typingText.textContent = `${fromUsername} yazıyor...`;
      clearTimeout(dmTypingTimer);
      dmTypingTimer = setTimeout(() => typingText.textContent = '', 1200);
    }
  });

  socket.on('dm_message', (message) => {
    if (message.sender_id === user.id) checkForUnlockedBadges();
    const otherId = message.sender_id === user.id ? message.receiver_id : message.sender_id;

    if (chatMode === 'dm' && activeFriend && activeFriend.id === otherId) {
      addDmMessage(message);
      maybeRunFiveEggFromMessage(message);
      markDmRead(activeFriend.id);
    } else if (message.sender_id !== user.id) {
      showBrowserNotification('Yeni DM', `${message.sender_username}: ${message.text}`);
      addNotificationToList({
        type: 'dm',
        payload: { fromUsername: message.sender_username, text: message.text },
        created_at: new Date().toISOString()
      }, true);
    }
  });

  socket.on('group_message', (message) => {
    if (message.sender_id === user.id) checkForUnlockedBadges();
    const sameGroup = chatMode === 'group' && activeGroup && Number(activeGroup.id) === Number(message.group_id);

    if (sameGroup) {
      addGroupMessage(message);
      maybeRunFiveEggFromMessage(message);
      scrollToBottom();
      return;
    }

    if (message.sender_id !== user.id) {
      showBrowserNotification('Yeni Grup DM', `${message.username || 'Grup'}: ${message.text || message.file_name || 'Dosya'}`);
      addNotificationToList({
        type: 'group_dm',
        payload: { fromUsername: message.username || 'Grup', text: message.text || message.file_name || 'Dosya', groupId: message.group_id },
        created_at: new Date().toISOString()
      }, true);
    }

    loadGroups();
  });

  socket.on('group_message_updated', (msg) => {
    if (chatMode === 'group' && activeGroup && Number(activeGroup.id) === Number(msg.group_id)) {
      updateMessageElement('group', msg.id, msg.text, true, false);
    }
  });

  socket.on('group_message_deleted', (msg) => {
    if (chatMode === 'group' && activeGroup && Number(activeGroup.id) === Number(msg.group_id)) {
      updateMessageElement('group', msg.id, msg.text, false, true);
    }
  });

  socket.on('group_updated', ({ groupId } = {}) => {
    loadGroups();
    if (activeGroup && (!groupId || Number(activeGroup.id) === Number(groupId))) {
      loadGroupDetails(activeGroup.id);
    }
  });

  socket.on('group_removed', ({ groupId } = {}) => {
    if (activeGroup && Number(activeGroup.id) === Number(groupId)) {
      activeGroup = null;
      messagesEl.innerHTML = '';
      chatTitle.textContent = 'Grup seç';
      if (groupDetailsBox) groupDetailsBox.classList.add('hidden');
    }
    loadGroups();
  });

  socket.on('notification', (notification) => {
    if (notification.type === 'error') {
      addSystemMessage(notification.payload?.message || 'Hata oluştu.');
      return;
    }

    addNotificationToList(notification, true);

    if (notification.type === 'friend_request') {
      loadRequests();
      showBrowserNotification('Arkadaş isteği', `${notification.payload.fromUsername} arkadaş isteği gönderdi.`);
    }

    if (notification.type === 'friend_accept') {
      loadFriends();
      showBrowserNotification('Arkadaş isteği kabul edildi', `${notification.payload.fromUsername} isteğini kabul etti.`);
    }

    if (notification.type === 'dm') {
      showBrowserNotification('Yeni DM', `${notification.payload.fromUsername}: ${notification.payload.text}`);
    }

    if (notification.type === 'group_dm') {
      showBrowserNotification('Yeni Grup DM', `${notification.payload.fromUsername}: ${notification.payload.text}`);
    }

    if (notification.type === 'mention' || notification.type === 'mention_everyone') {
      showBrowserNotification('Etiketlendin', `${notification.payload.fromUsername}: ${notification.payload.text}`);
    }
  });

  socket.on('reaction_state', ({ scope, messageId, reactions }) => {
    setReactionsOnElement(scope, messageId, reactions);
  });

  socket.on('friend_removed', () => {
    loadFriends();
    addSystemMessage('Bir arkadaşlık kaldırıldı.');
  });

  socket.on('blocked_by_user', () => {
    loadFriends();
    if (chatMode === 'dm') {
      activeFriend = null;
      messagesEl.innerHTML = '';
      addSystemMessage('Bu kullanıcıyla DM kapatıldı.');
    }
  });
}


function isNearBottom() {
  return messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 160;
}

function updateScrollBottomButton() {
  if (!scrollBottomButton) return;
  scrollBottomButton.classList.toggle('hidden', isNearBottom());
}

function resetMessageGrouping() {
  lastRenderedSenderKey = '';
  lastRenderedMessageType = '';
}

function updateChatHeaderAvatar() {
  if (!chatHeaderAvatar) return;

  let label = '#';
  let title = chatTitle?.textContent || '# genel';

  if (chatMode === 'dm' && activeFriend) {
    label = (activeFriend.display_name || activeFriend.username || '?').charAt(0).toUpperCase();
  } else if (chatMode === 'group' && activeGroup) {
    label = (activeGroup.name || 'G').charAt(0).toUpperCase();
  } else if (chatMode === 'room') {
    label = '#';
  }

  chatHeaderAvatar.textContent = label;
  chatHeaderAvatar.title = title;
}

function updateComposerState() {
  if (!messageInput || !messageForm) return;

  let placeholder = `#${currentRoom} odasına mesaj yaz...`;
  let disabled = false;
  let hint = getLocalSettings().enterSend ? 'Enter gönderir · Shift+Enter satır açmaz' : 'Ctrl+Enter gönderir';

  if (chatMode === 'dm') {
    disabled = !activeFriend;
    placeholder = activeFriend ? `@${activeFriend.username} kişisine mesaj yaz...` : 'Mesajlaşmak için soldan bir arkadaş seç...';
    hint = activeFriend ? 'DM açık' : 'DM seçilmedi';
  } else if (chatMode === 'group') {
    disabled = !activeGroup;
    placeholder = activeGroup ? `${activeGroup.name} grubuna mesaj yaz...` : 'Mesajlaşmak için soldan bir grup seç...';
    hint = activeGroup ? `${activeGroup.name} aktif` : 'Grup seçilmedi';
  }

  messageInput.placeholder = placeholder;
  messageInput.disabled = disabled;
  if (sendButton) sendButton.disabled = disabled;
  messageForm.classList.toggle('composer-disabled', disabled);
  if (composerHint) composerHint.textContent = hint;
}

function updateMessengerUi() {
  updateChatHeaderAvatar();
  updateComposerState();
  syncMobileHeader();
  markActiveConversation();
}

function markActiveConversation() {
  document.querySelectorAll('.conversation-item.active').forEach((el) => el.classList.remove('active'));

  if (chatMode === 'dm' && activeFriend) {
    document.querySelectorAll(`[data-conversation-type="dm"][data-user-id="${activeFriend.id}"]`).forEach((el) => el.classList.add('active'));
  }

  if (chatMode === 'group' && activeGroup) {
    document.querySelectorAll(`[data-conversation-type="group"][data-group-id="${activeGroup.id}"]`).forEach((el) => el.classList.add('active'));
  }
}


function setChatMode(nextMode) {
  clearReply();
  chatMode = nextMode;
  document.body.dataset.chatMode = chatMode;

  roomModeButton.classList.toggle('active', chatMode === 'room');
  dmModeButton.classList.toggle('active', chatMode === 'dm');
  if (groupModeButton) groupModeButton.classList.toggle('active', chatMode === 'group');

  roomPanel.classList.toggle('hidden', chatMode !== 'room');
  friendsPanel.classList.toggle('hidden', chatMode !== 'dm');
  if (groupsPanel) groupsPanel.classList.toggle('hidden', chatMode !== 'group');

  messagesEl.innerHTML = '';
  resetMessageGrouping();
  typingText.textContent = '';

  if (chatMode === 'room') {
    activeFriend = null;
    activeGroup = null;
    chatTitle.textContent = `# ${currentRoom}`;
    loadOldRoomMessages(currentRoom);
  } else if (chatMode === 'dm') {
    activeGroup = null;
    chatTitle.textContent = activeFriend ? `DM: ${activeFriend.username}` : 'DM seç';
    loadFriends?.();
    addSystemMessage('DM için soldan chat seç.');
  } else if (chatMode === 'group') {
    activeFriend = null;
    chatTitle.textContent = activeGroup ? `Grup: ${activeGroup.name}` : 'Grup seç';
    addSystemMessage('Grup için soldan grup seç veya yeni grup kur.');
  }

  updateHeaderMeta?.();
  updateHeaderMeta?.();
  syncMobileHeader();
}

async function joinRoom(room) {
  clearReply();
  currentRoom = room.toLowerCase();
  localStorage.setItem('chat_room', currentRoom);

  chatMode = 'room';
  roomModeButton.classList.add('active');
  dmModeButton.classList.remove('active');
  if (groupModeButton) groupModeButton.classList.remove('active');
  roomPanel.classList.remove('hidden');
  friendsPanel.classList.add('hidden');
  if (groupsPanel) groupsPanel.classList.add('hidden');

  roomInput.value = currentRoom;
  chatTitle.textContent = `# ${currentRoom}`;
  messagesEl.innerHTML = '';
  resetMessageGrouping();
  typingText.textContent = '';

  await loadOldRoomMessages(currentRoom);
  await Promise.allSettled([loadRoomMembers(), loadModeration()]);
  if (socket && socket.connected) socket.emit('join', { room: currentRoom });
  updateMessengerUi();
  markActiveConversation();
}

async function loadOldRoomMessages(room) {
  try {
    const data = await api(`/api/messages/${encodeURIComponent(room)}`);
    if (!data.messages.length) {
      addSystemMessage(`Burası #${room}. İlk mesajı sen gönder.`);
      return;
    }
    data.messages.forEach((message) => {
      addRoomMessage({
        id: message.id,
        user_id: message.user_id,
        sender_id: message.user_id,
        username: message.display_name || message.username,
        avatar_url: message.avatar_url,
        text: message.text,
        message_type: message.message_type,
        file_name: message.file_name,
        file_mime: message.file_mime,
        file_data: message.file_data,
        file_path: message.file_path,
        file_size: message.file_size,
        reply_to_id: message.reply_to_id,
        reply_username: message.reply_username,
        reply_text: message.reply_text,
        edited_at: message.edited_at,
        deleted_at: message.deleted_at,
        time: formatTime(message.created_at),
        user_id: message.user_id,
        readers: message.readers || [],
        story_decision: message.story_decision || message.extra_data?.story_decision
      });
    });
    scrollToBottom();
    markVisibleRoomMessagesRead();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function addRoomMessage(message) {
  addMessage({
    type: 'room',
    id: message.id,
    user_id: message.user_id,
    sender_id: message.sender_id,
    username: message.username,
    avatar_url: message.avatar_url,
    text: message.text,
    message_type: message.message_type,
    file_name: message.file_name,
    file_mime: message.file_mime,
    file_data: message.file_data,
    file_path: message.file_path,
    file_size: message.file_size,
    reply_to_id: message.reply_to_id,
    reply_username: message.reply_username,
    reply_text: message.reply_text,
    time: message.time,
    mine: user && (
      Number(message.sender_id || message.user_id) === Number(user.id)
      || String(message.username || '').toLowerCase() === String(user.username || '').toLowerCase()
      || String(message.username || '').toLowerCase() === String(user.display_name || '').toLowerCase()
    ),
    edited: Boolean(message.edited_at),
    deleted: Boolean(message.deleted_at),
    readers: message.readers || [],
    bubble_theme: message.bubble_theme || message.active_bubble_theme || (Number(message.sender_id || message.user_id) === Number(user.id) ? user?.active_bubble_theme : ''),
    name_effect: message.name_effect,
    frame_theme: message.frame_theme || message.active_profile_frame,
    story_decision: message.story_decision
  });
}

async function searchUsers() {
  const q = searchInput.value.trim();
  searchResults.innerHTML = '';

  if (q.length < 2) {
    searchResults.innerHTML = '<div class="mini-item">En az 2 karakter yaz.</div>';
    return;
  }

  try {
    const data = await api(`/api/users/search?q=${encodeURIComponent(q)}`);
    if (data.users.length === 0) {
      searchResults.innerHTML = '<div class="mini-item">Kullanıcı bulunamadı.</div>';
      return;
    }

    data.users.forEach((u) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div class="mini-left">${avatarHtml(u.username, u.avatar_url)}<div><strong>${escapeHtml(u.username)}</strong><span>${formatPresence(u)}</span></div></div>`;
      item.querySelector('.mini-left').onclick = () => openProfile(u.id);

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      const add = document.createElement('button');
      add.className = 'action-button';
      add.textContent = 'Ekle';
      add.onclick = () => sendFriendRequest(u.username);

      const block = document.createElement('button');
      block.className = 'action-button red';
      block.textContent = 'Engelle';
      block.onclick = () => blockUser(u.id);

      actions.appendChild(add);
      actions.appendChild(block);
      item.appendChild(actions);
      searchResults.appendChild(item);
    });
  } catch (error) {
    searchResults.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function sendFriendRequest(username) {
  try {
    const data = await api('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    addSystemMessage(data.message);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadRequests() {
  try {
    const data = await api('/api/friends/requests');
    requestsList.innerHTML = '';

    if (data.requests.length === 0) {
      requestsList.innerHTML = '<div class="mini-item">İstek yok.</div>';
      return;
    }

    data.requests.forEach((request) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div class="mini-left">${avatarHtml(request.username, request.avatar_url)}<div><strong>${escapeHtml(request.username)}</strong><span>Arkadaş isteği</span></div></div>`;

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      const accept = document.createElement('button');
      accept.className = 'action-button';
      accept.textContent = 'Kabul';
      accept.onclick = () => respondFriend(request.id, 'accept');

      const reject = document.createElement('button');
      reject.className = 'action-button red';
      reject.textContent = 'Red';
      reject.onclick = () => respondFriend(request.id, 'reject');

      actions.appendChild(accept);
      actions.appendChild(reject);
      item.appendChild(actions);
      requestsList.appendChild(item);
    });
  } catch (error) {
    requestsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function respondFriend(requestId, action) {
  try {
    const data = await api('/api/friends/respond', {
      method: 'POST',
      body: JSON.stringify({ requestId, action })
    });

    addSystemMessage(data.message);
    await Promise.allSettled([loadRequests(), loadFriends(), loadFriendActivity()]);
  } catch (error) {
    addSystemMessage(error.message);
  }
}


function formatShortDateTime(value) {
  if (!value) return 'aktivite yok';
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (Number.isFinite(diff)) {
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'az önce';
    if (min < 60) return `${min} dk önce`;
    const hour = Math.floor(min / 60);
    if (hour < 24) return `${hour} saat önce`;
    const day = Math.floor(hour / 24);
    if (day < 7) return `${day} gün önce`;
  }
  return date.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function renderFriendActivity(activities = []) {
  if (!friendActivityList) return;
  friendActivityList.innerHTML = '';

  if (!activities.length) {
    friendActivityList.innerHTML = '<div class="mini-item">Arkadaş aktivitesi yok.</div>';
    return;
  }

  activities.forEach((friend) => {
    const item = document.createElement('div');
    item.className = `friend-activity-item ${friend.online ? 'online' : ''}`;
    const name = escapeHtml(friend.display_name || friend.username || 'Kullanıcı');
    const last = friend.last_dm_at
      ? `${Number(friend.last_dm_sender_id) === Number(user.id) ? 'Sen' : name}: ${escapeHtml(String(friend.last_dm_text || '').slice(0, 42))}`
      : 'Henüz DM yok';
    const activeAt = friend.last_active || friend.last_seen || friend.last_dm_at;

    item.innerHTML = `
      <div class="activity-avatar-wrap">
        ${avatarHtml(friend.display_name || friend.username, friend.avatar_url)}
        <span class="activity-dot ${friend.online ? 'on' : ''}"></span>
      </div>
      <div class="activity-main">
        <strong>${name}</strong>
        <span>${friend.online ? 'Şu an online' : formatShortDateTime(activeAt)} · Level ${friend.level || 1}</span>
        <small>${last}</small>
      </div>
      <button class="activity-open" type="button">Aç</button>
    `;

    item.querySelector('.activity-avatar-wrap').onclick = () => openProfile(friend.id);
    item.querySelector('.activity-main').onclick = () => openProfile(friend.id);
    item.querySelector('.activity-open').onclick = async (event) => {
      event.stopPropagation();
      const f = findFriendById(friend.id) || friend;
      await openDm(f);
    };

    friendActivityList.appendChild(item);
  });
}

async function loadFriendActivity() {
  if (!token || !friendActivityList) return;
  try {
    friendActivityList.innerHTML = '<div class="mini-item">Aktivite yükleniyor...</div>';
    const data = await api('/api/friends/activity');
    renderFriendActivity(data.activities || []);
  } catch (error) {
    friendActivityList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}


async function loadFriends() {
  try {
    const data = await api('/api/friends');
    friends = data.friends || [];
    if (newGroupFriendsList) renderNewGroupFriends();

    friendsList.innerHTML = '';

    if (friends.length === 0) {
      friendsList.innerHTML = '<div class="mini-item">Arkadaş yok.</div>';
      return;
    }

    friends.forEach((friend) => {
      const item = document.createElement('div');
      item.className = 'mini-item conversation-item';
      item.dataset.conversationType = 'dm';
      item.dataset.userId = friend.id;
      item.innerHTML = `<div class="mini-left" data-profile-id="${friend.id}">${avatarHtml(friend.display_name || friend.username, friend.avatar_url)}<div><strong>${escapeHtml(friend.display_name || friend.username)}</strong><span>${formatPresence(friend)}</span></div></div>`;
      item.querySelector('.mini-left').onclick = () => openProfile(friend.id);

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      const dm = document.createElement('button');
      dm.className = 'action-button';
      dm.textContent = 'DM';
      dm.onclick = () => openDm(friend);

      const remove = document.createElement('button');
      remove.className = 'action-button gray';
      remove.textContent = 'Sil';
      remove.onclick = () => removeFriend(friend.id);

      const block = document.createElement('button');
      block.className = 'action-button red';
      block.textContent = 'Engelle';
      block.onclick = () => blockUser(friend.id);

      actions.appendChild(dm);
      actions.appendChild(remove);
      actions.appendChild(block);
      item.appendChild(actions);
      friendsList.appendChild(item);
    });
    markActiveConversation();
  } catch (error) {
    friendsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function removeFriend(friendId) {
  if (!confirm('Arkadaşı silmek istiyor musun?')) return;

  try {
    const data = await api(`/api/friends/${friendId}`, { method: 'DELETE' });
    addSystemMessage(data.message);
    if (activeFriend && activeFriend.id === friendId) {
      activeFriend = null;
      messagesEl.innerHTML = '';
    }
    loadFriends();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function blockUser(userId) {
  if (!confirm('Bu kullanıcıyı engellemek istiyor musun?')) return;

  try {
    const data = await api('/api/block', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    addSystemMessage(data.message);
    if (activeFriend && activeFriend.id === userId) {
      activeFriend = null;
      messagesEl.innerHTML = '';
    }
    await Promise.allSettled([loadFriends(), loadBlocked(), loadRequests()]);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadBlocked() {
  try {
    const data = await api('/api/blocked');
    blockedList.innerHTML = '';

    if (data.blocked.length === 0) {
      blockedList.innerHTML = '<div class="mini-item">Engellenen yok.</div>';
      return;
    }

    data.blocked.forEach((row) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div class="mini-left">${avatarHtml(row.username, row.avatar_url)}<div><strong>${escapeHtml(row.username)}</strong><span>Engellendi</span></div></div>`;

      const unblock = document.createElement('button');
      unblock.className = 'action-button';
      unblock.textContent = 'Kaldır';
      unblock.onclick = () => unblockUser(row.user_id);

      item.appendChild(unblock);
      blockedList.appendChild(item);
    });
  } catch (error) {
    blockedList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function unblockUser(userId) {
  try {
    const data = await api(`/api/block/${userId}`, { method: 'DELETE' });
    addSystemMessage(data.message);
    loadBlocked();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function openDm(friend) {
  clearReply();
  activeFriend = friend;
  chatMode = 'dm';

  document.body.dataset.chatMode = chatMode;
  roomModeButton.classList.remove('active');
  dmModeButton.classList.add('active');
  if (groupModeButton) groupModeButton.classList.remove('active');
  roomPanel.classList.add('hidden');
  friendsPanel.classList.remove('hidden');
  if (groupsPanel) groupsPanel.classList.add('hidden');

  chatTitle.textContent = `DM: ${friend.username}`;
  updateHeaderMeta?.();
  syncMobileHeader();
  messagesEl.innerHTML = '';
  resetMessageGrouping();
  typingText.textContent = '';

  if (socket) socket.emit('dm_join', { friendId: friend.id });

  try {
    const data = await api(`/api/dm/${friend.id}`);
    if (!data.messages.length) addSystemMessage(`${friend.username} ile DM başladı. Selam yaz.`);
    data.messages.forEach(addDmMessage);
    await markDmRead(friend.id);
    scrollToBottom();
    updateMessengerUi();
    markActiveConversation();
    closeMobilePanelsAfterSelect?.();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function markDmRead(friendId) {
  try {
    await api(`/api/dm/${friendId}/read`, { method: 'POST' });
  } catch {}
}

function addDmMessage(message) {
  addMessage({
    type: 'dm',
    id: message.id,
    user_id: message.sender_id,
    sender_id: message.sender_id,
    username: message.sender_display_name || message.sender_username || (Number(message.sender_id) === Number(user.id) ? user.username : 'Arkadaş'),
    avatar_url: message.sender_avatar_url || (Number(message.sender_id) === Number(user.id) ? user.avatar_url : null),
    text: message.text,
    message_type: message.message_type,
    file_name: message.file_name,
    file_mime: message.file_mime,
    file_data: message.file_data,
    file_path: message.file_path,
    file_size: message.file_size,
    reply_to_id: message.reply_to_id,
    reply_username: message.reply_username,
    reply_text: message.reply_text,
    time: message.time || formatTime(message.created_at),
    mine: Number(message.sender_id) === Number(user.id),
    edited: Boolean(message.edited_at),
    deleted: Boolean(message.deleted_at),
    read: Boolean(message.read_at),
    bubble_theme: message.bubble_theme || message.active_bubble_theme || (Number(message.sender_id || message.user_id) === Number(user.id) ? user?.active_bubble_theme : ''),
    name_effect: message.name_effect,
    frame_theme: message.frame_theme || message.active_profile_frame
  });
}




function showPolishToast(title, text = '', type = 'info') {
  const box = notificationsList || document.body;
  const toast = document.createElement('div');
  toast.className = `polish-toast toast-${type}`;
  toast.innerHTML = `
    <strong>${escapeHtml(title || 'Bildirim')}</strong>
    ${text ? `<span>${escapeHtml(text)}</span>` : ''}
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

function setButtonBusy(button, busy = true, text = '') {
  if (!button) return;
  if (busy) {
    button.dataset.oldText = button.textContent || '';
    button.disabled = true;
    if (text) button.textContent = text;
    button.classList.add('is-busy');
  } else {
    button.disabled = false;
    if (button.dataset.oldText) button.textContent = button.dataset.oldText;
    button.classList.remove('is-busy');
  }
}

function updatePolishQuickStats(data = {}) {
  if (!polishQuickStats) return;
  const u = data.user || user || {};
  const dailyReady = data.daily?.can_claim ? 'Hazır' : 'Alındı';
  const inventoryCount = Array.isArray(u.inventory) ? u.inventory.length : 0;
  polishQuickStats.innerHTML = `
    <span>⚡ Level ${u.level || 1}</span>
    <span>✦ ${u.shards || 0} Shards</span>
    <span>🎁 Daily ${dailyReady}</span>
    <span>🎒 ${inventoryCount} Item</span>
  `;
}

function prefersReducedMotionPolish() {
  try { return getLocalSettings().reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
}


function forceAppRefresh(delay = 550) {
  setTimeout(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', '10100');
    url.searchParams.set('fresh', Date.now().toString());
    window.location.href = url.toString();
  }, delay);
}


function rarityClass(rarity) {
  return `rarity-${String(rarity || 'common').toLowerCase()}`;
}

function itemSlotLabel(type) {
  if (type === 'bubble') return 'Mesaj';
  if (type === 'frame') return 'Çerçeve';
  if (type === 'name') return 'İsim';
  if (type === 'theme') return 'Profil Tema';
  return type || 'Item';
}

function activeItemForSlot(slot) {
  if (!user) return '';
  if (slot === 'bubble') return user.active_bubble_theme || '';
  if (slot === 'frame') return user.active_profile_frame || '';
  if (slot === 'name') return user.active_name_effect || '';
  if (slot === 'theme') return user.active_profile_theme || '';
  return '';
}

function switchGamifyTab(tab) {
  dailyTabButton?.classList.toggle('active', tab === 'daily');
  questsTabButton?.classList.toggle('active', tab === 'quests');
  lootboxTabButton?.classList.toggle('active', tab === 'lootbox');
  marketTabButton?.classList.toggle('active', tab === 'market');
  leaderboardTabButton?.classList.toggle('active', tab === 'leaderboard');
  casinoTabButton?.classList.toggle('active', tab === 'casino');
  shardsHistoryTabButton?.classList.toggle('active', tab === 'shards');
  universeTabButton?.classList.toggle('active', tab === 'universe');
  inventoryTabButton?.classList.toggle('active', tab === 'inventory');
  dailyPanel?.classList.toggle('hidden', tab !== 'daily');
  questsPanel?.classList.toggle('hidden', tab !== 'quests');
  lootboxPanel?.classList.toggle('hidden', tab !== 'lootbox');
  marketPanel?.classList.toggle('hidden', tab !== 'market');
  leaderboardPanel?.classList.toggle('hidden', tab !== 'leaderboard');
  casinoPanel?.classList.toggle('hidden', tab !== 'casino');
  shardsHistoryPanel?.classList.toggle('hidden', tab !== 'shards');
  universePanel?.classList.toggle('hidden', tab !== 'universe');
  inventoryPanel?.classList.toggle('hidden', tab !== 'inventory');
  galleryPanel?.classList.toggle('hidden', tab !== 'gallery');

  if (tab === 'market' || tab === 'daily' || tab === 'lootbox') loadGamify();
  if (tab === 'leaderboard') loadLeaderboard();
  if (tab === 'shards') loadShardsHistory();
  if (tab === 'universe') loadUniversePanel();
  if (tab === 'inventory') loadInventory();

  const box = document.querySelector('.gamify-box');
  if (box) box.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

async function loadGamify() {
  if (!token || !user || !gamifyStats) return;

  try {
    const data = await api('/api/gamify/summary');
    if (data.user) {
      user = { ...user, ...data.user };
      localStorage.setItem('chat_user', JSON.stringify(user));
      renderProfile();
    }

    gamifyStats.textContent = `Level ${data.user?.level || 1} · ${data.user?.shards || 0} Shards`;

    updatePolishQuickStats(data);
    renderDailyReward(data.daily);
    renderQuests(data.quests || []);
    renderLootbox(data.lootbox);
    renderMarket(data.market || []);
    if (!leaderboardPanel?.classList.contains('hidden')) loadLeaderboard();
  } catch (error) {
    if (questsList) questsList.innerHTML = `<div class="mini-item">Hub yüklenemedi: ${escapeHtml(error.message)}</div>`;
  }
}


function renderDailyReward(daily) {
  if (!dailyRewardText || !dailyClaimButton) return;

  const reward = daily?.reward || { shards: 75, xp: 100 };
  const nextStreak = daily?.next_streak || 1;
  const currentStreak = daily?.streak || 0;

  dailyRewardText.textContent = daily?.claimed_today
    ? `Bugünkü ödül alındı. Yarın tekrar gel.`
    : `Bugün: +${reward.shards} Shards, +${reward.xp} XP`;

  if (dailyStreakText) {
    dailyStreakText.textContent = `Streak: ${currentStreak} gün · Sıradaki: ${nextStreak}. gün`;
  }

  dailyClaimButton.textContent = daily?.claimed_today ? 'Alındı' : 'Günlük Al';
  dailyClaimButton.disabled = Boolean(daily?.claimed_today);
}

async function claimDailyReward() {
  try {
    const data = await api('/api/daily/claim', { method: 'POST' });
    addSystemMessage(`Günlük ödül alındı: +${data.reward?.shards || 0} Shards, +${data.reward?.xp || 0} XP · Streak ${data.streak}`);
    await loadGamify();
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
    await checkForUnlockedBadges(true);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function renderLootbox(lootbox) {
  if (!lootboxHistoryList) return;

  const crates = lootbox?.crates || [];
  if (crates.length && !crates.some((crate) => crate.id === selectedLootboxCrateId)) {
    selectedLootboxCrateId = crates[0].id;
  }

  if (lootboxCratesList) {
    lootboxCratesList.innerHTML = '';
    crates.forEach((crate) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `lootbox-crate-choice ${crate.id === selectedLootboxCrateId ? 'active' : ''}`;
      btn.innerHTML = `<strong>${escapeHtml(crate.icon || '📦')} ${escapeHtml(crate.name)}</strong><span>${crate.price} Shards</span>`;
      btn.onclick = () => {
        selectedLootboxCrateId = crate.id;
        renderLootbox(lootbox);
      };
      lootboxCratesList.appendChild(btn);
    });
  }

  const selected = crates.find((crate) => crate.id === selectedLootboxCrateId) || crates[0];
  if (selected) {
    if (activeCrateIcon) activeCrateIcon.textContent = selected.icon || '📦';
    if (activeCrateName) activeCrateName.textContent = selected.name;
    if (activeCrateInfo) {
      const odds = selected.rarities || {};
      activeCrateInfo.textContent = `${selected.price} Shards · Rare ${odds.rare || 0}% · Epic ${odds.epic || 0}% · Legendary ${odds.legendary || 0}%`;
    }
  }

  lootboxHistoryList.innerHTML = '';
  const history = lootbox?.history || [];
  if (!history.length) {
    lootboxHistoryList.innerHTML = '<div class="mini-item">Henüz kasa geçmişi yok.</div>';
    return;
  }

  history.forEach((entry) => {
    const item = document.createElement('div');
    item.className = `lootbox-history ${rarityClass(entry.reward_rarity)}`;
    const crateName = crates.find((crate) => crate.id === entry.crate_id)?.name || entry.crate_id || 'Kasa';
    const rewardText = entry.reward_type === 'item'
      ? `${entry.reward_name} · ${entry.reward_rarity}`
      : `${entry.reward_shards} Shards`;
    item.innerHTML = `<strong>${escapeHtml(rewardText)}</strong><span>${escapeHtml(crateName)} · ${new Date(entry.created_at).toLocaleString('tr-TR')}</span>`;
    lootboxHistoryList.appendChild(item);
  });
}

async function openLootbox() {
  if (!openLootboxButton) return;
  try {
    setButtonBusy(openLootboxButton, true, 'Açılıyor...');
    if (lootboxAnimationStage) {
      lootboxAnimationStage.classList.remove('hidden');
      lootboxAnimationStage.classList.add('running');
    }
    if (lootboxResult) {
      lootboxResult.className = 'lootbox-result loading';
      lootboxResult.textContent = 'Kasa açılıyor...';
    }

    await new Promise((resolve) => setTimeout(resolve, prefersReducedMotionPolish() ? 120 : 850));

    const data = await api('/api/lootbox/open', {
      method: 'POST',
      body: JSON.stringify({ crateId: selectedLootboxCrateId })
    });

    if (lootboxAnimationStage) {
      lootboxAnimationStage.classList.remove('running');
      lootboxAnimationStage.classList.add('hidden');
    }

    const reward = data.reward || {};
    const rarity = String(reward.rarity || reward.item?.rarity || 'rare').toLowerCase();
    if (lootboxResult) {
      lootboxResult.className = `lootbox-result reveal rarity-${rarity}`;
      if (data.type === 'item' || reward.type === 'item') {
        const item = reward.item || data.item || reward;
        lootboxResult.innerHTML = `<strong>${escapeHtml(item.icon || '🎁')} ${escapeHtml(item.name || 'Yeni item')}</strong><span>${escapeHtml(rarityLabel(item.rarity || rarity))} item kazandın.</span>`;
        showPolishToast('Kasa açıldı', `${item.name || 'Yeni item'} kazandın`, rarity === 'legendary' ? 'legendary' : 'success');
      } else {
        const shards = reward.shards || data.shards || 0;
        lootboxResult.innerHTML = `<strong>✦ ${Number(shards || 0)} Shards</strong><span>Shard refund kazandın.</span>`;
        showPolishToast('Kasa açıldı', `${Number(shards || 0)} Shards geldi`, 'success');
      }
    }

    if (data.user) {
      user = { ...user, ...data.user };
      localStorage.setItem('chat_user', JSON.stringify(user));
      renderProfile();
    }

    await loadGamify();
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
  } catch (error) {
    if (lootboxAnimationStage) {
      lootboxAnimationStage.classList.remove('running');
      lootboxAnimationStage.classList.add('hidden');
    }
    if (lootboxResult) {
      lootboxResult.className = 'lootbox-result error';
      lootboxResult.textContent = error.message;
    }
    showPolishToast('Kasa açılamadı', error.message, 'error');
  } finally {
    setButtonBusy(openLootboxButton, false);
  }
}


function renderQuests(quests) {
  if (!questsList) return;
  questsList.innerHTML = '';

  if (!quests.length) {
    questsList.innerHTML = '<div class="mini-item">Bugün görev yok.</div>';
    return;
  }

  quests.forEach((quest) => {
    const percent = Math.min(100, Math.round((Number(quest.progress || 0) / Number(quest.target || 1)) * 100));
    const item = document.createElement('div');
    item.className = `quest-card ${quest.done ? 'done' : ''} ${quest.claimed ? 'claimed' : ''}`;
    item.innerHTML = `
      <div class="quest-icon">${escapeHtml(quest.icon || '🎯')}</div>
      <div class="quest-main">
        <strong>${escapeHtml(quest.title)}</strong>
        <span>${quest.progress}/${quest.target} · +${quest.xp} XP · +${quest.shards} Shards</span>
        <div class="quest-progress"><i style="width:${percent}%"></i></div>
      </div>
    `;

    const btn = document.createElement('button');
    btn.className = 'small-button quest-claim';
    btn.textContent = quest.claimed ? 'Alındı' : (quest.done ? 'Al' : 'Bekle');
    btn.disabled = quest.claimed || !quest.done;
    btn.onclick = () => claimQuest(quest.id);
    item.appendChild(btn);
    questsList.appendChild(item);
  });
}

async function claimQuest(questId) {
  try {
    const data = await api('/api/quests/claim', {
      method: 'POST',
      body: JSON.stringify({ questId })
    });

    addSystemMessage(`Görev ödülü alındı: +${data.reward?.xp || 0} XP, +${data.reward?.shards || 0} Shards`);
    await loadGamify();
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
    await checkForUnlockedBadges(true);
  } catch (error) {
    addSystemMessage(error.message);
  }
}



function syncSocialInputs() {
  if (presenceSelect) presenceSelect.value = user?.presence_status || 'online';
  if (customStatusInput) customStatusInput.value = user?.custom_status || '';
  updateSocialPreview?.();
}

function updatePresenceChoiceButtons() {
  const value = presenceSelect?.value || user?.presence_status || 'online';
  presenceChoices?.forEach((button) => {
    button.classList.toggle('active', button.dataset.presenceChoice === value);
  });
}

function updateSocialPreview() {
  const status = presenceSelect?.value || user?.presence_status || 'online';
  const custom = String(customStatusInput?.value || user?.custom_status || '').trim();
  const name = user?.display_name || user?.username || 'Kullanıcı';

  if (socialPreviewAvatar) socialPreviewAvatar.textContent = name.charAt(0).toUpperCase();
  if (socialPreviewName) socialPreviewName.textContent = name;
  if (socialPreviewPresence) socialPreviewPresence.textContent = `${presenceIcon(status)} ${presenceLabel(status)}`;
  if (socialPreviewCustom) {
    socialPreviewCustom.textContent = custom || 'Özel durum yok';
    socialPreviewCustom.classList.toggle('hidden', !custom);
  }

  updatePresenceChoiceButtons();
}

function setPresenceChoice(value) {
  if (presenceSelect) presenceSelect.value = value;
  updateSocialPreview();
}


async function savePresence() {
  try {
    const data = await api('/api/presence', {
      method: 'PATCH',
      body: JSON.stringify({
        presenceStatus: presenceSelect?.value || 'online',
        customStatus: customStatusInput?.value || ''
      })
    });
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
    syncSocialInputs();
    socket?.emit('presence_update', {
      presenceStatus: user.presence_status || presenceSelect?.value || 'online',
      customStatus: user.custom_status || customStatusInput?.value || ''
    });
    if (chatMode === 'room' && socket?.connected) {
      setTimeout(() => socket.emit('join', { room: currentRoom }), 80);
      setTimeout(() => loadRoomMembers(), 140);
    }
    updateSocialPreview?.();
    if (socialSaveHint) socialSaveHint.textContent = 'Kaydedildi · Online listesi yenilendi.';
    showPolishToast?.('Durum güncellendi', formatPresence({ ...user, online: user.presence_status !== 'invisible' }), 'success');
  } catch (error) {
    showPolishToast?.('Durum hata', error.message, 'error');
  }
}

async function saveStory() {
  try {
    const data = await api('/api/story', {
      method: 'PATCH',
      body: JSON.stringify({ storyText: storyTextInput?.value || '' })
    });
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    syncSocialInputs();
    socket?.emit('presence_update', {
      presenceStatus: user.presence_status || 'online',
      customStatus: user.custom_status || ''
    });
    if (chatMode === 'room' && socket?.connected) {
      setTimeout(() => socket.emit('join', { room: currentRoom }), 80);
      setTimeout(() => loadRoomMembers(), 140);
    }
    await loadStories();
    showPolishToast?.('Story paylaşıldı', '24 saat görünür kalacak.', 'success');
  } catch (error) {
    showPolishToast?.('Story hata', error.message, 'error');
  }
}

async function clearStory() {
  try {
    const data = await api('/api/story', { method: 'DELETE' });
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    syncSocialInputs();
    socket?.emit('presence_update', {
      presenceStatus: user.presence_status || 'online',
      customStatus: user.custom_status || ''
    });
    if (chatMode === 'room' && socket?.connected) {
      setTimeout(() => socket.emit('join', { room: currentRoom }), 80);
      setTimeout(() => loadRoomMembers(), 140);
    }
    await loadStories();
    showPolishToast?.('Story silindi', '', 'success');
  } catch (error) {
    showPolishToast?.('Story hata', error.message, 'error');
  }
}

function renderStories(stories = []) {
  if (!storiesList) return;
  storiesList.innerHTML = '';
  if (!stories.length) {
    storiesList.innerHTML = '<div class="mini-item">Aktif story yok.</div>';
    return;
  }

  stories.forEach((story) => {
    const item = document.createElement('div');
    item.className = 'story-card';
    item.innerHTML = `
      <div class="mini-left">${avatarHtml(story.display_name || story.username, story.avatar_url)}<div><strong>${escapeHtml(story.display_name || story.username)}</strong><span>${escapeHtml(formatPresence({ ...story, online: true }))}</span></div></div>
      <p>${escapeHtml(story.story_text || '')}</p>
      <small>${new Date(story.story_expires_at).toLocaleString('tr-TR')} tarihine kadar</small>
    `;
    storiesList.appendChild(item);
  });
}

async function loadStories() {
  if (!storiesList) return;
  try {
    const data = await api('/api/stories');
    renderStories(data.stories || []);
  } catch (error) {
    storiesList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}



function setFriendsCenterTab(tab = 'friends') {
  friendsCenterTabs?.forEach((button) => {
    button.classList.toggle('active', button.dataset.friendsCenterTab === tab);
  });

  document.getElementById('friendsCenterFriendsPanel')?.classList.toggle('hidden', tab !== 'friends');
  document.getElementById('friendsCenterRequestsPanel')?.classList.toggle('hidden', tab !== 'requests');
  document.getElementById('friendsCenterBlockedPanel')?.classList.toggle('hidden', tab !== 'blocked');
  document.getElementById('friendsCenterSocialPanel')?.classList.toggle('hidden', tab !== 'social');

  if (tab === 'friends') loadFriendsCenterFriends();
  if (tab === 'requests') loadFriendsCenterRequests();
  if (tab === 'blocked') loadFriendsCenterBlocked();
  if (tab === 'social') syncSocialInputs?.();
}

function openFriendsCenter(tab = 'friends') {
  friendsCenterModal?.classList.remove('hidden');
  setFriendsCenterTab(tab);
}

function closeFriendsCenter() {
  friendsCenterModal?.classList.add('hidden');
}

function friendCenterRow({ avatarName, avatarUrl, title, subtitle, actions = [] }) {
  const item = document.createElement('div');
  item.className = 'friends-center-item';
  item.innerHTML = `<div class="mini-left">${avatarHtml(avatarName, avatarUrl)}<div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle || '')}</span></div></div>`;
  if (actions.length) {
    const actionBox = document.createElement('div');
    actionBox.className = 'mini-actions';
    actions.forEach((action) => actionBox.appendChild(action));
    item.appendChild(actionBox);
  }
  return item;
}

async function loadFriendsCenterFriends() {
  if (!friendsCenterList) return;
  try {
    const data = await api('/api/friends');
    friends = data.friends || [];
    friendsCenterList.innerHTML = '';

    if (!friends.length) {
      friendsCenterList.innerHTML = '<div class="mini-item">Henüz arkadaş yok.</div>';
      return;
    }

    friends.forEach((friend) => {
      const dm = document.createElement('button');
      dm.className = 'action-button';
      dm.textContent = 'DM';
      dm.onclick = () => {
        closeFriendsCenter();
        setChatMode('dm');
        openDm(friend);
      };

      const profile = document.createElement('button');
      profile.className = 'action-button gray';
      profile.textContent = 'Profil';
      profile.onclick = () => openProfile(friend.id);

      const item = friendCenterRow({
        avatarName: friend.display_name || friend.username,
        avatarUrl: friend.avatar_url,
        title: friend.display_name || friend.username,
        subtitle: formatPresence(friend),
        actions: [dm, profile]
      });

      friendsCenterList.appendChild(item);
    });
  } catch (error) {
    friendsCenterList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function searchFriendsCenterUsers() {
  if (!friendsCenterSearchResults) return;
  const q = String(friendsCenterSearchInput?.value || '').trim();
  if (q.length < 2) {
    friendsCenterSearchResults.innerHTML = '<div class="mini-item">Aramak için en az 2 karakter yaz.</div>';
    return;
  }

  try {
    const data = await api(`/api/users/search?q=${encodeURIComponent(q)}`);
    friendsCenterSearchResults.innerHTML = '';

    if (!data.users?.length) {
      friendsCenterSearchResults.innerHTML = '<div class="mini-item">Kullanıcı bulunamadı.</div>';
      return;
    }

    data.users.forEach((found) => {
      const add = document.createElement('button');
      add.className = 'action-button';
      add.textContent = 'Ekle';
      add.onclick = async () => {
        try {
          await api('/api/friends/request', {
            method: 'POST',
            body: JSON.stringify({ username: found.username })
          });
          add.textContent = 'Gönderildi';
          add.disabled = true;
          loadRequests?.();
        } catch (error) {
          addSystemMessage(error.message);
        }
      };

      const profile = document.createElement('button');
      profile.className = 'action-button gray';
      profile.textContent = 'Profil';
      profile.onclick = () => openProfile(found.id);

      friendsCenterSearchResults.appendChild(friendCenterRow({
        avatarName: found.display_name || found.username,
        avatarUrl: found.avatar_url,
        title: found.display_name || found.username,
        subtitle: formatPresence(found),
        actions: [add, profile]
      }));
    });
  } catch (error) {
    friendsCenterSearchResults.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function loadFriendsCenterRequests() {
  if (!friendsCenterRequestsList) return;
  try {
    const data = await api('/api/friends/requests');
    friendsCenterRequestsList.innerHTML = '';

    if (!data.requests?.length) {
      friendsCenterRequestsList.innerHTML = '<div class="mini-item">İstek yok.</div>';
      return;
    }

    data.requests.forEach((request) => {
      const accept = document.createElement('button');
      accept.className = 'action-button';
      accept.textContent = 'Kabul';
      accept.onclick = async () => {
        await respondFriend(request.id, 'accept');
        loadFriendsCenterRequests();
        loadFriendsCenterFriends();
      };

      const reject = document.createElement('button');
      reject.className = 'action-button red';
      reject.textContent = 'Red';
      reject.onclick = async () => {
        await respondFriend(request.id, 'reject');
        loadFriendsCenterRequests();
      };

      friendsCenterRequestsList.appendChild(friendCenterRow({
        avatarName: request.display_name || request.username,
        avatarUrl: request.avatar_url,
        title: request.display_name || request.username,
        subtitle: 'Arkadaş isteği',
        actions: [accept, reject]
      }));
    });
  } catch (error) {
    friendsCenterRequestsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function loadFriendsCenterBlocked() {
  if (!friendsCenterBlockedList) return;
  try {
    const data = await api('/api/blocked');
    friendsCenterBlockedList.innerHTML = '';

    if (!data.blocked?.length) {
      friendsCenterBlockedList.innerHTML = '<div class="mini-item">Engellenen yok.</div>';
      return;
    }

    data.blocked.forEach((row) => {
      const unblock = document.createElement('button');
      unblock.className = 'action-button';
      unblock.textContent = 'Kaldır';
      unblock.onclick = async () => {
        await unblockUser(row.user_id);
        loadFriendsCenterBlocked();
      };

      friendsCenterBlockedList.appendChild(friendCenterRow({
        avatarName: row.display_name || row.username,
        avatarUrl: row.avatar_url,
        title: row.display_name || row.username,
        subtitle: 'Engellendi',
        actions: [unblock]
      }));
    });
  } catch (error) {
    friendsCenterBlockedList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}


function openGalleryModal() {
  galleryModal?.classList.remove('hidden');
  loadGallery?.();
}

function closeGalleryModal() {
  galleryModal?.classList.add('hidden');
}


function galleryIcon(type) {
  if (type === 'image') return '🖼️';
  if (type === 'audio') return '🎙️';
  return '📄';
}

function renderGallery(files = []) {
  if (!galleryList) return;
  galleryList.innerHTML = '';
  if (!files.length) {
    galleryList.innerHTML = '<div class="mini-item">Bu odada dosya yok.</div>';
    return;
  }

  files.forEach((file) => {
    const item = document.createElement('a');
    item.className = `gallery-item gallery-${file.message_type}`;
    item.href = file.file_data;
    item.target = '_blank';
    item.rel = 'noopener';

    if (file.message_type === 'image') {
      item.innerHTML = `<img src="${file.file_data}" alt="${escapeHtml(file.file_name || 'foto')}" /><div><strong>${escapeHtml(file.file_name || 'Fotoğraf')}</strong><span>${escapeHtml(file.username)} · ${new Date(file.created_at).toLocaleString('tr-TR')}</span></div>`;
      item.addEventListener('click', (event) => {
        event.preventDefault();
        openMediaViewer(file.file_data, 'image');
      });
    } else {
      item.innerHTML = `<div class="gallery-file-icon">${galleryIcon(file.message_type)}</div><div><strong>${escapeHtml(file.file_name || file.text || 'Dosya')}</strong><span>${escapeHtml(file.username)} · ${file.file_size ? formatFileSize(file.file_size) + ' · ' : ''}${new Date(file.created_at).toLocaleString('tr-TR')}</span></div>`;
      if (file.message_type === 'audio') {
        item.addEventListener('click', (event) => {
          event.preventDefault();
          openMediaViewer(file.file_data, 'audio');
        });
      }
    }

    galleryList.appendChild(item);
  });
}

async function loadGallery() {
  if (!galleryList) return;
  try {
    galleryList.innerHTML = '<div class="mini-item">Galeri yükleniyor...</div>';
    const data = await api(`/api/gallery/room/${encodeURIComponent(currentRoom)}?type=${encodeURIComponent(activeGalleryFilter)}`);
    renderGallery(data.files || []);
  } catch (error) {
    galleryList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

function bindGalleryFilters() {
  document.querySelectorAll('.gallery-filter').forEach((button) => {
    if (button.dataset.bound) return;
    button.dataset.bound = '1';
    button.addEventListener('click', () => {
      activeGalleryFilter = button.dataset.galleryFilter || 'all';
      document.querySelectorAll('.gallery-filter').forEach((b) => b.classList.toggle('active', b === button));
      loadGallery();
    });
  });
}


function shardReasonIcon(reason = '') {
  if (reason.includes('daily')) return '🎁';
  if (reason.includes('quest')) return '🎯';
  if (reason.includes('market')) return '🛒';
  if (reason.includes('lootbox')) return '📦';
  if (reason.includes('casino') || reason.includes('blackjack')) return '🎰';
  if (reason.includes('admin')) return '🛡️';
  return '✦';
}


function universeThemeClass(theme = '') {
  return ['serbia','limbo','rome','egypt','vertex'].includes(theme) ? `universe-theme-${theme}` : '';
}

function applyLiveEventTheme(event) {
  document.body.classList.remove('universe-theme-serbia','universe-theme-limbo','universe-theme-rome','universe-theme-egypt','universe-theme-vertex');
  if (event?.theme) document.body.classList.add(universeThemeClass(event.theme));
}

function renderLiveEvent(event) {
  activeLiveEvent = event || null;
  applyLiveEventTheme(event);

  if (!liveEventBox) return;
  if (!event) {
    liveEventBox.classList.add('hidden');
    liveEventBox.innerHTML = '';
    return;
  }

  const endsAt = Number(event.ends_at || 0);
  const mins = Math.max(0, Math.ceil((endsAt - Date.now()) / 60000));
  liveEventBox.className = `live-event-box ${universeThemeClass(event.theme)}`;
  liveEventBox.innerHTML = `
    <div class="live-event-icon">${escapeHtml(event.icon || '⚡')}</div>
    <div>
      <strong>${escapeHtml(event.name || 'Live Event')}</strong>
      <span>${mins} dk kaldı · Mesaj at: +${Number(event.shards || 0)} shards / +${Number(event.xp || 0)} XP bonus</span>
    </div>
  `;
  liveEventBox.classList.remove('hidden');
}

function renderUniverseData(data) {
  const universe = data.universe || {};
  const energy = Number(universe.energy || 0);
  if (universeStatusText) universeStatusText.textContent = universe.active_event ? `${universe.active_event.name} aktif` : 'Evren stabil ama portal sinyali var.';
  if (universeEnergyBar) universeEnergyBar.style.width = `${Math.max(0, Math.min(100, energy))}%`;
  if (universeLevelText) universeLevelText.textContent = `Level ${Number(universe.level || 1)}`;
  if (universeEnergyText) universeEnergyText.textContent = `Energy ${energy}%`;
  if (universeEventText) universeEventText.textContent = universe.active_event ? universe.active_event.name : 'Event yok';

  renderLiveEvent(universe.active_event || null);
  updateHeaderMeta?.();

  if (inventoryList) {
    inventoryList.innerHTML = '';
    const items = data.inventory || [];
    if (!items.length) inventoryList.innerHTML = '<span class="empty-pill">Henüz item yok</span>';
    items.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'inventory-pill';
      el.textContent = `${item.item_name} ×${item.quantity}`;
      inventoryList.appendChild(el);
    });
  }

  if (titlesList) {
    titlesList.innerHTML = '';
    const titles = data.titles || [];
    if (!titles.length) titlesList.innerHTML = '<span class="empty-pill">Henüz title yok</span>';
    titles.forEach((title) => {
      const el = document.createElement('div');
      el.className = 'title-pill';
      el.textContent = title.title_name;
      titlesList.appendChild(el);
    });
  }

  if (profileVisitorsList) {
    profileVisitorsList.innerHTML = '';
    const visitors = data.visitors || [];
    if (!visitors.length) profileVisitorsList.innerHTML = '<div class="mini-item">Henüz profil ziyaretçisi yok.</div>';
    visitors.forEach((visitor) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div class="mini-left">${avatarHtml(visitor.display_name || visitor.username, visitor.avatar_url)}<div><strong>${escapeHtml(visitor.display_name || visitor.username)}</strong><span>${new Date(visitor.visited_at).toLocaleString('tr-TR')}</span></div></div>`;
      profileVisitorsList.appendChild(item);
    });
  }
}


function moodLabel(mood = 'calm') {
  const labels = {
    calm: 'sakin',
    aggressive: 'agresif',
    cursed: 'cursed',
    serious: 'serious',
    lore: 'lore'
  };
  return labels[mood] || mood;
}

function renderFeizPersonality(data) {
  const state = data.state || {};
  const canAdmin = ['owner', 'admin'].includes(String(user?.global_role || user?.role || '').toLowerCase());

  if (feizMoodText) feizMoodText.textContent = `Mood: ${moodLabel(state.mood)} · Senin lakabın: ${data.my_nickname || '-'}`;
  if (feizMoodSelect) feizMoodSelect.value = state.mood || 'calm';
  feizAdminControls?.classList.toggle('hidden', !canAdmin);

  if (feizNicknamesList) {
    feizNicknamesList.innerHTML = '';
    const list = data.nicknames || [];
    if (!list.length) feizNicknamesList.innerHTML = '<span class="empty-pill">Henüz lakap yok</span>';
    list.forEach((item) => {
      const pill = document.createElement('div');
      pill.className = 'feiz-nickname-pill';
      pill.textContent = `${item.display_name || item.username}: ${item.nickname}`;
      feizNicknamesList.appendChild(pill);
    });
  }
}

async function loadFeizPersonality() {
  try {
    const data = await api('/api/feiz/personality');
    renderFeizPersonality(data);
  } catch (error) {
    if (feizMoodText) feizMoodText.textContent = error.message;
  }
}

async function saveFeizMood() {
  try {
    const data = await api('/api/feiz/personality', {
      method: 'PATCH',
      body: JSON.stringify({ mood: feizMoodSelect?.value || 'calm' })
    });
    renderFeizPersonality(data);
    showPolishToast?.('feiz mood güncellendi', moodLabel(data.state?.mood), 'success');
  } catch (error) {
    showPolishToast?.('feiz mood hata', error.message, 'error');
  }
}


async function loadUniversePanel() {
  try {
    const data = await api('/api/universe');
    renderUniverseData(data);
    loadFeizPersonality?.();
  } catch (error) {
    if (universeStatusText) universeStatusText.textContent = error.message;
  }
}

function showPortalDrop(drop) {
  activePortalDrop = drop;
  if (!portalDropOverlay) return;

  portalDropTitle.textContent = `${drop.icon || '🌀'} ${drop.name || 'Portal açıldı!'}`;
  portalDropText.textContent = `İlk tıklayan +${drop.reward_shards || 0} shards ve +${drop.reward_xp || 0} XP alır.`;
  portalDropOverlay.className = `portal-drop-overlay ${universeThemeClass(drop.theme)}`;
  portalDropOverlay.classList.remove('hidden');

  setTimeout(() => {
    if (activePortalDrop?.id === drop.id) {
      portalDropOverlay.classList.add('hidden');
      activePortalDrop = null;
    }
  }, Math.max(2000, Number(drop.expires_at || 0) - Date.now()));
}

async function claimActivePortal() {
  if (!activePortalDrop) return;
  try {
    const drop = activePortalDrop;
    const data = await api('/api/portal/claim', {
      method: 'POST',
      body: JSON.stringify({ drop })
    });
    portalDropOverlay?.classList.add('hidden');
    activePortalDrop = null;
    showPolishToast?.('Portal ödülü alındı', `+${data.reward_shards} shards · +${data.reward_xp} XP`, 'success');
    loadGamify?.();
    loadUniversePanel?.();
  } catch (error) {
    showPolishToast?.('Portal kaçtı', error.message, 'error');
    portalDropOverlay?.classList.add('hidden');
    activePortalDrop = null;
  }
}

async function registerProfileVisit(profileId) {
  try {
    if (!profileId || Number(profileId) === Number(user?.id)) return;
    await api(`/api/profile/${profileId}/visit`, { method: 'POST' });
  } catch {}
}


function renderShardsHistory(history = []) {
  if (!shardsHistoryList) return;
  shardsHistoryList.innerHTML = '';

  if (!history.length) {
    shardsHistoryList.innerHTML = '<div class="mini-item">Henüz Shards geçmişi yok.</div>';
    return;
  }

  history.forEach((entry) => {
    const amount = Number(entry.amount || 0);
    const item = document.createElement('div');
    item.className = `shard-history-item ${amount >= 0 ? 'gain' : 'spend'}`;
    item.innerHTML = `
      <div class="shard-history-icon">${shardReasonIcon(String(entry.reason || ''))}</div>
      <div class="shard-history-main">
        <strong>${escapeHtml(entry.label || 'Shards işlem')}</strong>
        <span>${new Date(entry.created_at).toLocaleString('tr-TR')} · Bakiye: ${Number(entry.balance_after || 0)}</span>
      </div>
      <b>${amount >= 0 ? '+' : ''}${amount}</b>
    `;
    shardsHistoryList.appendChild(item);
  });
}

async function loadShardsHistory() {
  if (!shardsHistoryList) return;
  try {
    shardsHistoryList.innerHTML = '<div class="mini-item">Shards geçmişi yükleniyor...</div>';
    const data = await api('/api/shards/history');
    renderShardsHistory(data.history || []);
  } catch (error) {
    shardsHistoryList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

function previewSlotColumn(type) {
  if (type === 'bubble') return 'active_bubble_theme';
  if (type === 'frame') return 'active_profile_frame';
  if (type === 'name') return 'active_name_effect';
  if (type === 'theme') return 'active_profile_theme';
  return '';
}

function renderMarketPreview(item) {
  if (!marketPreviewBox || !item) return;
  marketPreviewBox.classList.remove('hidden');
  marketPreviewBox.className = `market-preview-box ${rarityClass(item.rarity)}`;

  const sampleBubbleClass = item.type === 'bubble' ? `cosmetic-${item.id}` : '';
  const sampleNameClass = item.type === 'name' ? `namefx-${item.id}` : '';
  const sampleFrameClass = item.type === 'frame' ? item.id : '';

  marketPreviewBox.innerHTML = `
    <div class="market-preview-head">
      <div>
        <strong>${escapeHtml(item.icon || '✦')} ${escapeHtml(item.name)}</strong>
        <span>Geçici önizleme · ${escapeHtml(itemSlotLabel(item.type))}</span>
      </div>
      <button class="small-button gray" type="button" id="stopMarketPreviewButton">Kapat</button>
    </div>
    <div class="market-preview-stage">
      <div class="message preview-message ${sampleBubbleClass} ${sampleNameClass} framefx-${item.type === 'frame' ? item.id : ''}">
        <div class="msg-avatar avatar-frame ${sampleFrameClass}">${escapeHtml((user?.display_name || user?.username || 'S').charAt(0).toUpperCase())}</div>
        <div class="msg-bubble">
          <div class="meta">${escapeHtml(user?.display_name || user?.username || 'selim')} · preview</div>
          <div class="text">Bu item sende böyle görünecek.</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('stopMarketPreviewButton')?.addEventListener('click', stopMarketPreview);
}

function startMarketPreview(item) {
  if (!item || !user) return;

  clearTimeout(marketPreviewTimer);
  if (!marketPreviewOriginalUser) marketPreviewOriginalUser = { ...user };

  const column = previewSlotColumn(item.type);
  if (column) {
    user = { ...user, [column]: item.id };
    renderProfile();
  }

  renderMarketPreview(item);
  showPolishToast?.('Market Preview', `${item.name} geçici olarak gösteriliyor.`, 'info');

  marketPreviewTimer = setTimeout(stopMarketPreview, 12000);
}

function stopMarketPreview() {
  clearTimeout(marketPreviewTimer);
  marketPreviewTimer = null;

  if (marketPreviewOriginalUser) {
    user = { ...user, ...marketPreviewOriginalUser };
    marketPreviewOriginalUser = null;
    renderProfile();
  }

  marketPreviewBox?.classList.add('hidden');
  if (marketPreviewBox) marketPreviewBox.innerHTML = '';
}


function renderMarket(items) {
  if (!marketList) return;
  marketList.innerHTML = '';

  items.forEach((item) => {
    const active = activeItemForSlot(item.type) === item.id;
    const card = document.createElement('div');
    card.className = `market-card ${rarityClass(item.rarity)} ${item.owned ? 'owned' : ''} ${active ? 'equipped' : ''}`;
    card.innerHTML = `
      <div class="market-icon">${escapeHtml(item.icon || '✦')}</div>
      <div class="market-main">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.description || '')}</span>
        <small>${itemSlotLabel(item.type)} · ${escapeHtml(item.rarity || 'common')} · ${item.price} Shards</small>
      </div>
    `;

    const actions = document.createElement('div');
    actions.className = 'market-actions';

    const preview = document.createElement('button');
    preview.className = 'small-button gray';
    preview.textContent = 'Önizle';
    preview.onclick = () => startMarketPreview(item);
    actions.appendChild(preview);

    if (!item.owned) {
      const buy = document.createElement('button');
      buy.className = 'small-button';
      buy.textContent = 'Satın al';
      buy.onclick = () => buyMarketItem(item.id);
      actions.appendChild(buy);
    } else {
      const equip = document.createElement('button');
      equip.className = 'small-button';
      equip.textContent = active ? 'Aktif' : 'Kuşan';
      equip.disabled = active;
      equip.onclick = () => equipMarketItem(item.id, item.type);

      const unequip = document.createElement('button');
      unequip.className = 'small-button gray';
      unequip.textContent = 'Çıkar';
      unequip.disabled = !active;
      unequip.onclick = () => equipMarketItem('', item.type);

      actions.appendChild(equip);
      actions.appendChild(unequip);
    }

    card.appendChild(actions);
    marketList.appendChild(card);
  });
}

async function buyMarketItem(itemId) {
  try {
    await api('/api/market/buy', {
      method: 'POST',
      body: JSON.stringify({ itemId })
    });
    addSystemMessage('Market ürünü satın alındı. Site yenileniyor...');
    await loadGamify();
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
    forceAppRefresh();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function equipMarketItem(itemId, slot) {
  try {
    const data = await api('/api/market/equip', {
      method: 'POST',
      body: JSON.stringify({ itemId, slot })
    });

    user = { ...user, ...data.user };
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
    addSystemMessage(itemId ? 'Kozmetik kuşanıldı. Site yenileniyor...' : 'Kozmetik çıkarıldı. Site yenileniyor...');
    await loadGamify();
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
    forceAppRefresh(250);
  } catch (error) {
    addSystemMessage(error.message);
  }
}


function cleanCasinoBet(input) {
  return Math.max(1, Math.min(1000, Math.floor(Number(input?.value || 1) || 1)));
}

function cardText(card) {
  if (!card) return '?';
  return `${card.rank}${card.suit}`;
}

function renderBlackjack(session) {
  if (!blackjackTable || !session) return;

  const player = (session.player || []).map(cardText).join(' ');
  const dealer = (session.dealer || []).map(cardText).join(' ');

  blackjackTable.innerHTML = `
    <div><strong>Sen:</strong> ${escapeHtml(player)} <span>(${session.player_value ?? '-'})</span></div>
    <div><strong>Dealer:</strong> ${escapeHtml(dealer)} <span>${session.dealer_value ? '(' + session.dealer_value + ')' : ''}</span></div>
    <div><strong>Durum:</strong> ${escapeHtml(session.result || 'Oynanıyor')} ${session.payout ? ' · Payout: ' + session.payout : ''}</div>
  `;

  const playing = session.status === 'playing';
  if (blackjackHitButton) blackjackHitButton.disabled = !playing;
  if (blackjackStandButton) blackjackStandButton.disabled = !playing;
}

async function refreshShardText(shards) {
  if (typeof shards === 'number') {
    user.shards = shards;
    localStorage.setItem('chat_user', JSON.stringify(user));
  }
  await loadGamify();
}

async function playSlot() {
  try {
    const bet = cleanCasinoBet(slotBetInput);
    const data = await api('/api/casino/slot', {
      method: 'POST',
      body: JSON.stringify({ bet })
    });

    if (slotResult) {
      slotResult.innerHTML = `
        <div class="slot-reels">${data.reels.map(escapeHtml).join(' ')}</div>
        <strong>${escapeHtml(data.result)}</strong>
        <span>Bet: ${data.bet} · Payout: ${data.payout} · Net: ${data.net > 0 ? '+' : ''}${data.net}</span>
      `;
    }

    await refreshShardText(data.shards);
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function startBlackjack() {
  try {
    const bet = cleanCasinoBet(blackjackBetInput);
    const data = await api('/api/casino/blackjack/start', {
      method: 'POST',
      body: JSON.stringify({ bet })
    });

    renderBlackjack(data.session);
    await refreshShardText(data.shards);
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function hitBlackjack() {
  try {
    const data = await api('/api/casino/blackjack/hit', { method: 'POST' });
    renderBlackjack(data.session);
    await refreshShardText(data.shards);
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function standBlackjack() {
  try {
    const data = await api('/api/casino/blackjack/stand', { method: 'POST' });
    renderBlackjack(data.session);
    await refreshShardText(data.shards);
    if (!shardsHistoryPanel?.classList.contains('hidden')) loadShardsHistory();
  } catch (error) {
    addSystemMessage(error.message);
  }
}


async function loadLeaderboard(type = 'level') {
  if (!leaderboardList) return;

  leaderboardFilters.forEach((btn) => btn.classList.toggle('active', (btn.dataset.leaderboard || 'level') === type));
  leaderboardList.innerHTML = '<div class="mini-item">Yükleniyor...</div>';

  try {
    const data = await api(`/api/leaderboard?type=${encodeURIComponent(type)}`);
    leaderboardList.innerHTML = '';

    (data.users || []).forEach((row) => {
      const item = document.createElement('div');
      item.className = `leaderboard-row ${Number(row.id) === Number(user.id) ? 'me' : ''}`;
      item.innerHTML = `
        <span class="leader-rank">#${row.rank}</span>
        ${avatarHtml(row.display_name || row.username, row.avatar_url)}
        <div class="leader-main">
          <strong>${escapeHtml(row.display_name || row.username)}</strong>
          <span>Lv ${row.level} · ${row.shards || 0} Shards · ${row.total_messages || 0} mesaj</span>
        </div>
      `;
      item.onclick = () => openProfile(row.id);
      leaderboardList.appendChild(item);
    });
  } catch (error) {
    leaderboardList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}


async function loadNotifications() {
  try {
    const data = await api('/api/notifications');
    notificationsList.innerHTML = '';
    unreadNotifications = data.notifications.filter(n => !n.is_read).length;
    updateBadge();

    if (data.notifications.length === 0) {
      notificationsList.innerHTML = '<div class="mini-item">Bildirim yok.</div>';
      return;
    }

    data.notifications.forEach((n) => addNotificationToList(n, false));
  } catch {
    notificationsList.innerHTML = '<div class="mini-item">Bildirimler yüklenemedi.</div>';
  }
}

function addNotificationToList(notification, isNew) {
  if (notificationsList.textContent.includes('Bildirim yok')) notificationsList.innerHTML = '';

  const item = document.createElement('div');
  item.className = 'mini-item';
  item.innerHTML = `<div><strong>${escapeHtml(notificationTitle(notification))}</strong><span>${escapeHtml(notificationText(notification))}</span></div>`;

  if (notification.id) {
    const del = document.createElement('button');
    del.className = 'action-button gray';
    del.textContent = 'Sil';
    del.onclick = () => deleteNotification(notification.id, item);
    item.appendChild(del);
  }

  notificationsList.prepend(item);

  if (isNew) {
    unreadNotifications += 1;
    updateBadge();
  }
}

async function deleteNotification(id, element) {
  try {
    await api(`/api/notifications/${id}`, { method: 'DELETE' });
    element.remove();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function notificationTitle(n) {
  if (n.type === 'friend_request') return 'Arkadaş isteği';
  if (n.type === 'friend_accept') return 'İstek kabul edildi';
  if (n.type === 'dm') return 'Yeni DM';
  if (n.type === 'group_dm') return 'Grup DM';
  if (n.type === 'mention') return 'Etiket';
  if (n.type === 'mention_everyone') return '@everyone';
  return 'Bildirim';
}

function notificationText(n) {
  const p = n.payload || {};
  if (n.type === 'friend_request') return `${p.fromUsername} arkadaş isteği gönderdi.`;
  if (n.type === 'friend_accept') return `${p.fromUsername} arkadaş oldu.`;
  if (n.type === 'dm') return `${p.fromUsername}: ${p.text || ''}`;
  if (n.type === 'group_dm') return `${p.fromUsername}: ${p.text || ''}`;
  if (n.type === 'mention' || n.type === 'mention_everyone') return `${p.fromUsername} seni ${p.room} odasında etiketledi.`;
  return p.message || '';
}

function updateBadge() {
  notificationBadge.textContent = unreadNotifications > 0 ? String(unreadNotifications) : '';
}

function renderUsers(users) {
  usersList.innerHTML = '';
  users.forEach((entry) => {
    let profile = typeof entry === 'string' ? { username: entry, display_name: entry, presence_status: 'online', online: true } : entry;
    if (Number(profile.id) === Number(user?.id)) {
      profile = { ...profile, presence_status: user.presence_status || profile.presence_status || 'online', custom_status: user.custom_status || profile.custom_status || '', online: user.presence_status !== 'invisible' };
    }
    const li = document.createElement('li');
    li.className = `room-user-item presence-${String(profile.presence_status || 'online').toLowerCase()}`;
    li.innerHTML = `<div class="mini-left">${avatarHtml(profile.display_name || profile.username, profile.avatar_url)}<div><strong>${escapeHtml(profile.display_name || profile.username)}</strong><span>${escapeHtml(roomPresenceLine(profile))}</span></div></div>`;
    if (profile.id) li.onclick = () => openProfile(profile.id);
    usersList.appendChild(li);
  });

  updateHeaderMeta?.();
  loadRoomMembers();
  loadModeration();
}


function normalizeReaderNames(readers) {
  const seen = new Set();
  return (readers || [])
    .map((reader) => String(reader?.username || '').trim())
    .filter((name) => {
      if (!name) return false;
      const key = name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function formatRoomSeenText(readers) {
  const names = normalizeReaderNames(readers);
  if (!names.length) return 'Gönderildi ✓';
  if (names.length === 1) return `${names[0]} gördü`;
  if (names.length === 2) return `${names[0]} ve ${names[1]} gördü`;
  return `${names[0]}, ${names[1]} ve ${names.length - 2} kişi daha gördü`;
}

function updateRoomReadStatus(messageId, readers) {
  const el = document.querySelector(`.message[data-type="room"][data-id="${messageId}"]`);
  if (!el) return;
  const status = el.querySelector('.room-read-status');
  if (!status) return;

  const names = normalizeReaderNames(readers);
  status.dataset.readers = JSON.stringify(names);
  status.textContent = formatRoomSeenText(readers);
  status.title = names.length ? names.join(', ') : 'Henüz gören yok';
}

function markRoomMessagesRead(messageIds) {
  if (!socket || !socket.connected || chatMode !== 'room') return;
  const ids = Array.from(new Set((messageIds || []).map(Number).filter(Number.isInteger))).slice(0, 80);
  if (!ids.length) return;
  socket.emit('room_messages_read', { room: currentRoom, messageIds: ids });
}

function markVisibleRoomMessagesRead() {
  clearTimeout(roomReadTimer);
  roomReadTimer = setTimeout(() => {
    if (chatMode !== 'room') return;
    const ids = Array.from(document.querySelectorAll('.message[data-type="room"]:not(.mine)'))
      .map((el) => Number(el.dataset.id))
      .filter(Number.isInteger);
    markRoomMessagesRead(ids);
  }, 250);
}




function resolveOwnBubbleTheme(messageBubbleTheme, isOwnMessage) {
  const fromMessage = String(messageBubbleTheme || '').trim();
  if (fromMessage) return fromMessage;
  if (!isOwnMessage) return '';
  return String(user?.active_bubble_theme || '').trim();
}

function markOwnBubble(row, bubble, activeBubble = '') {
  if (!row || !bubble) return;
  const bubbleId = String(activeBubble || '').trim();

  row.classList.add('mine', 'own-message', 'self');
  row.dataset.mine = 'true';
  row.dataset.bubbleTheme = bubbleId;

  bubble.classList.add('own-bubble');
  bubble.dataset.bubbleTheme = bubbleId;

  if (bubbleId) {
    row.classList.add(`cosmetic-${bubbleId}`);
    bubble.classList.add(`cosmetic-${bubbleId}`);
  }
}


function extractFirstUrl(text = '') {
  const match = String(text || '').match(/https?:\/\/[^\s<>"')]+/i);
  return match ? match[0] : '';
}

function linkPreviewMeta(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname.replace(/\/$/, '');
    let icon = '🔗';
    let title = host;
    let desc = url;
    let image = '';

    const directImage = /\.(png|jpe?g|gif|webp|avif)(\?.*)?$/i.test(parsed.pathname);
    if (directImage) {
      icon = '🖼️';
      title = 'Görsel linki';
      desc = host;
      image = url;
    } else if (host.includes('youtube.com') || host.includes('youtu.be')) {
      icon = '▶️';
      title = 'YouTube linki';
      desc = 'Videoyu yeni sekmede aç.';
      const videoId = host.includes('youtu.be')
        ? parsed.pathname.split('/').filter(Boolean)[0]
        : parsed.searchParams.get('v');
      if (videoId) image = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } else if (host.includes('itch.io')) {
      icon = '🎮';
      title = 'itch.io linki';
      desc = 'Oyun sayfası / proje linki.';
    } else if (host.includes('github.com')) {
      icon = '💻';
      title = 'GitHub linki';
      desc = path ? path.split('/').filter(Boolean).slice(0, 2).join(' / ') : 'Repository veya profil.';
    } else if (host.includes('netlify.app') || host.includes('render.com') || host.includes('onrender.com')) {
      icon = '🌐';
      title = 'Web app linki';
      desc = 'Deploy edilmiş site linki.';
    } else if (host.includes('openai.com') || host.includes('chatgpt.com')) {
      icon = '🤖';
      title = 'OpenAI / ChatGPT linki';
      desc = 'AI bağlantısı.';
    }

    return { url, host, icon, title, desc, image };
  } catch {
    return null;
  }
}

function linkifyText(text = '') {
  const safe = escapeHtml(text || '');
  return safe.replace(/(https?:\/\/[^\s<>"')]+)/gi, (url) => {
    const clean = url.replace(/&amp;/g, '&');
    return `<a class="message-link" href="${escapeHtml(clean)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`;
  });
}

function buildLinkPreview(url) {
  const meta = linkPreviewMeta(url);
  if (!meta) return null;

  const card = document.createElement('a');
  card.className = `link-preview-card ${meta.image ? 'has-thumb' : ''}`;
  card.href = meta.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.innerHTML = `
    ${meta.image ? `<img class="link-preview-thumb" src="${escapeHtml(meta.image)}" alt="" loading="lazy" />` : `<div class="link-preview-icon">${escapeHtml(meta.icon)}</div>`}
    <div class="link-preview-content">
      <strong>${escapeHtml(meta.title)}</strong>
      <span>${escapeHtml(meta.host)}</span>
      <p>${escapeHtml(meta.desc)}</p>
    </div>
    <div class="link-preview-arrow">↗</div>
  `;
  return card;
}

function messageMediaUrl({ file_data, file_path }) {
  const data = String(file_data || '').trim();
  const path = String(file_path || '').trim();
  if (data) return data;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return '';
}

function collectMediaViewerItems() {
  const nodes = Array.from(document.querySelectorAll('[data-media-viewer-src]'));
  mediaViewerItems = nodes.map((node) => ({
    src: node.dataset.mediaViewerSrc,
    type: node.dataset.mediaViewerType || 'image',
    title: node.dataset.mediaViewerTitle || 'Medya',
    meta: node.dataset.mediaViewerMeta || ''
  })).filter((item) => item.src);
}

function renderMediaViewer() {
  if (!mediaViewerModal || !mediaViewerStage) return;
  const item = mediaViewerItems[mediaViewerIndex];
  if (!item) return;

  mediaViewerStage.innerHTML = '';
  mediaViewerTitle.textContent = item.title || 'Medya';
  mediaViewerMeta.textContent = `${mediaViewerIndex + 1}/${mediaViewerItems.length || 1}${item.meta ? ' · ' + item.meta : ''}`;

  mediaViewerOpenLink.href = item.src;
  mediaViewerOpenLink.classList.toggle('hidden', !item.src);

  if (item.type === 'audio') {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.autoplay = true;
    audio.src = item.src;
    mediaViewerStage.appendChild(audio);
  } else if (item.type === 'video') {
    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    video.src = item.src;
    mediaViewerStage.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.title || 'Medya';
    mediaViewerStage.appendChild(img);
  }

  mediaViewerPrevButton?.classList.toggle('hidden', mediaViewerItems.length <= 1);
  mediaViewerNextButton?.classList.toggle('hidden', mediaViewerItems.length <= 1);
}

function openMediaViewer(src, type = 'image') {
  if (!src || !mediaViewerModal) { addSystemMessage?.('Medya URL bulunamadı.'); return; }
  collectMediaViewerItems();
  let index = mediaViewerItems.findIndex((item) => item.src === src);
  if (index < 0) {
    mediaViewerItems.push({ src, type, title: type === 'audio' ? 'Ses kaydı' : 'Medya', meta: '' });
    index = mediaViewerItems.length - 1;
  }
  mediaViewerIndex = Math.max(0, index);
  renderMediaViewer();
  mediaViewerModal.classList.remove('hidden');
  mediaViewerModal.setAttribute('aria-hidden', 'false');
}

function closeMediaViewer() {
  mediaViewerModal?.classList.add('hidden');
  mediaViewerModal?.setAttribute('aria-hidden', 'true');
  if (mediaViewerStage) mediaViewerStage.innerHTML = '';
}

function moveMediaViewer(delta) {
  if (!mediaViewerItems.length) return;
  mediaViewerIndex = (mediaViewerIndex + delta + mediaViewerItems.length) % mediaViewerItems.length;
  renderMediaViewer();
}

function commandPaletteBaseItems() {
  const items = [
    { icon: '💬', title: 'Genel odayı aç', subtitle: '#genel odasına git', keywords: 'oda genel chat room', run: () => joinRoom('genel') },
    { icon: '🌀', title: 'Serbia odasını aç', subtitle: '#serbia odasına git', keywords: 'serbia room oda', run: () => joinRoom('serbia') },
    { icon: '⚫', title: 'Limbo odasını aç', subtitle: '#limbo odasına git', keywords: 'limbo room oda', run: () => joinRoom('limbo') },
    { icon: '🤝', title: 'Arkadaşlar merkezini aç', subtitle: 'Arkadaşlar / istekler / sosyal', keywords: 'friend friends arkadaş dm sosyal', run: () => openFriendsCenter?.('friends') },
    { icon: '🗂️', title: 'Galeri aç', subtitle: 'Medya ve dosyalar', keywords: 'gallery galeri medya file', run: () => openGalleryModal?.() },
    { icon: '⚙️', title: 'Ayarları aç', subtitle: 'Profil, görünüm, bildirim', keywords: 'settings ayar profil', run: () => openSettings?.() },
    { icon: '🛒', title: 'Market / Gamify', subtitle: 'Shard, lootbox, market alanına git', keywords: 'market shards lootbox casino leaderboard', run: () => { syncRailActive?.('hub'); document.body.classList.add('mobile-right-panel-open'); } },
    { icon: '🤖', title: 'Feiz paneli', subtitle: 'Mood/personality ayarı', keywords: 'feiz bot ai mood', run: () => { loadFeizPersonality?.(); document.body.classList.add('mobile-right-panel-open'); } },
    { icon: '🔎', title: 'Mesaj arama', subtitle: 'Mesaj arama kutusuna odaklan', keywords: 'search ara mesaj', run: () => focusHeaderSearch?.() },
    { icon: '✍️', title: 'Mesaj yaz', subtitle: 'Composer alanına odaklan', keywords: 'write yaz composer', run: () => messageInput?.focus() }
  ];

  if (Array.isArray(friends)) {
    friends.slice(0, 20).forEach((friend) => {
      items.push({
        icon: '📨',
        title: `${displayName?.(friend) || friend.username} DM aç`,
        subtitle: '@' + (friend.username || 'kullanıcı'),
        keywords: `dm friend arkadaş ${friend.username || ''} ${friend.display_name || ''}`,
        run: () => openDm(friend)
      });
    });
  }

  if (Array.isArray(groups)) {
    groups.slice(0, 20).forEach((group) => {
      items.push({
        icon: '👥',
        title: `${group.name} grubunu aç`,
        subtitle: 'Grup sohbeti',
        keywords: `group grup ${group.name || ''}`,
        run: () => openGroup(group)
      });
    });
  }

  return items;
}

function scoreCommandItem(item, q) {
  if (!q) return 1;
  const hay = `${item.title} ${item.subtitle || ''} ${item.keywords || ''}`.toLowerCase();
  const parts = q.toLowerCase().split(/\s+/).filter(Boolean);
  return parts.every((part) => hay.includes(part)) ? parts.reduce((sum, part) => sum + (hay.startsWith(part) ? 4 : 1), 0) : 0;
}

function renderCommandPalette() {
  if (!commandPaletteList) return;
  const q = commandPaletteInput?.value || '';
  commandPaletteItems = commandPaletteBaseItems()
    .map((item) => ({ ...item, score: scoreCommandItem(item, q) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  commandPaletteIndex = Math.min(commandPaletteIndex, Math.max(0, commandPaletteItems.length - 1));
  commandPaletteList.innerHTML = '';

  if (!commandPaletteItems.length) {
    commandPaletteList.innerHTML = '<div class="command-empty">Sonuç yok.</div>';
    return;
  }

  commandPaletteItems.forEach((item, index) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `command-item ${index === commandPaletteIndex ? 'active' : ''}`;
    row.innerHTML = `
      <span class="command-icon">${escapeHtml(item.icon || '⌘')}</span>
      <span class="command-copy">
        <strong>${escapeHtml(item.title)}</strong>
        <em>${escapeHtml(item.subtitle || '')}</em>
      </span>
    `;
    row.addEventListener('click', () => runCommandPaletteItem(index));
    commandPaletteList.appendChild(row);
  });
}

function openCommandPalette() {
  if (!commandPaletteModal) return;
  commandPaletteModal.classList.remove('hidden');
  commandPaletteModal.setAttribute('aria-hidden', 'false');
  commandPaletteIndex = 0;
  renderCommandPalette();
  setTimeout(() => {
    commandPaletteInput?.focus();
    commandPaletteInput?.select();
  }, 20);
}

function closeCommandPalette() {
  commandPaletteModal?.classList.add('hidden');
  commandPaletteModal?.setAttribute('aria-hidden', 'true');
  if (commandPaletteInput) commandPaletteInput.value = '';
}

function runCommandPaletteItem(index = commandPaletteIndex) {
  const item = commandPaletteItems[index];
  if (!item) return;
  closeCommandPalette();
  item.run?.();
}



function renderStoryDecisionMessage(decision) {
  const box = document.createElement('div');
  box.className = 'story-message-card';
  if (!decision) {
    box.innerHTML = '<p>Hikaye kararı yüklenemedi.</p>';
    return box;
  }

  const total = Number(decision.total_votes || 0);
  const voted = String(decision.voted_by_me || storyVoteCache.get(String(decision.id || '')) || '');
  box.innerHTML = `
    <div class="story-message-head">
      <span>🗳️ feiz anketi</span>
      <strong>Mini Hikaye Kararı</strong>
    </div>
    <p>${escapeHtml(decision.prompt || 'Oda ne yapacak?')}</p>
    <div class="story-message-options">
      ${(decision.options || []).map((option) => {
        const votes = Number(option.votes || 0);
        const pct = total ? Math.round((votes / total) * 100) : 0;
        const selected = voted === option.key;
        return `<button class="story-option ${selected ? 'selected' : ''}" data-story-option="${escapeHtml(option.key)}" type="button" ${voted ? 'disabled' : ''}>
          <span>${escapeHtml(option.label)}${selected ? ' ✓' : ''}</span>
          <b>${votes} oy · ${pct}%</b>
          <i style="width:${pct}%"></i>
        </button>`;
      }).join('')}
    </div>
    <div class="story-result">${voted ? 'Oy kullandın. ' : ''}Şu anki sonuç: ${escapeHtml(decision.result_text || 'Henüz karar verilmedi.')}</div>
  `;

  if (!voted) {
    box.querySelectorAll('[data-story-option]').forEach((button) => {
      button.addEventListener('click', () => voteStoryDecision(button.dataset.storyOption));
    });
  }

  return box;
}


function addMessage({ type, id, user_id, sender_id, username, avatar_url, text, message_type, file_name, file_mime, file_data, file_path, file_size, reply_to_id, reply_username, reply_text, time, mine, edited, deleted, read, readers, bubble_theme, name_effect, frame_theme, story_decision }) {
  const localSettings = getLocalSettings();
  const normalizedUsername = String(username || '').toLowerCase();
  const isBotMessage = ['feiz', 'selimbot', 'bot'].includes(normalizedUsername);
  const isOwnMessage = Boolean(
    mine ||
    (user && Number(sender_id || user_id || 0) === Number(user.id)) ||
    (user && String(username || '').trim().toLowerCase() === String(user.username || '').trim().toLowerCase()) ||
    (user && String(username || '').trim().toLowerCase() === String(user.display_name || '').trim().toLowerCase())
  );
  const activeBubble = resolveOwnBubbleTheme(bubble_theme, isOwnMessage);
  const activeName = name_effect || (isOwnMessage ? user?.active_name_effect : '') || '';
  const activeFrame = frame_theme || (isOwnMessage ? user?.active_profile_frame : '') || '';

  if (isBotMessage && localSettings.botHide) return;

  const wasNearBottom = isNearBottom();
  const senderKey = `${type}:${isOwnMessage ? 'me' : normalizedUsername}`;
  const sameSender = senderKey === lastRenderedSenderKey && type === lastRenderedMessageType;

  const div = document.createElement('div');
  div.className = `message ${isOwnMessage ? 'mine own-message self' : ''} ${isBotMessage ? 'bot-message' : ''} ${sameSender ? 'same-sender' : ''} ${activeBubble ? 'cosmetic-' + activeBubble : ''} ${activeName ? 'namefx-' + activeName : ''} ${activeFrame ? 'framefx-' + activeFrame : ''}`;
  div.classList.add('message-enter');
  div.dataset.type = type;
  div.dataset.id = id;
  div.dataset.mine = isOwnMessage ? 'true' : 'false';
  const profileTargetId = Number(sender_id || user_id || 0);
  if (Number.isInteger(profileTargetId) && profileTargetId > 0) div.dataset.profileUserId = String(profileTargetId);

  lastRenderedSenderKey = senderKey;
  lastRenderedMessageType = type;

  const avatar = document.createElement(avatar_url ? 'img' : 'div');
  avatar.className = `msg-avatar ${activeFrame ? 'avatar-frame ' + activeFrame : ''}`;
  if (avatar_url) {
    avatar.src = avatar_url;
    avatar.alt = username;
  } else {
    avatar.textContent = String(username || '?').charAt(0).toUpperCase();
  }

  if (Number.isInteger(profileTargetId) && profileTargetId > 0) {
    avatar.classList.add('clickable-profile');
    avatar.title = 'Profili aç';
    avatar.addEventListener('click', (event) => {
      event.stopPropagation();
      if (isMobileLayout && isMobileLayout()) return;
      openProfile(profileTargetId);
    });
  }

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isOwnMessage) markOwnBubble(div, bubble, activeBubble);

  const meta = document.createElement('div');
  meta.className = 'meta';
  const metaParts = [username];
  if (localSettings.showTimes && time) metaParts.push(time);
  if (edited) metaParts.push('düzenlendi');
  if (deleted) metaParts.push('silindi');
  meta.textContent = metaParts.join(' • ');
  if (Number.isInteger(profileTargetId) && profileTargetId > 0) {
    meta.classList.add('clickable-profile-name');
    meta.title = 'Profili aç';
    meta.addEventListener('click', (event) => {
      event.stopPropagation();
      if (isMobileLayout && isMobileLayout()) return;
      openProfile(profileTargetId);
    });
  }

  const body = document.createElement('div');
  body.className = 'text';
  body.innerHTML = linkifyText(text);

  bubble.appendChild(meta);

  if (reply_to_id) {
    const reply = document.createElement('div');
    reply.className = 'reply-preview';
    reply.innerHTML = `<strong>${escapeHtml(reply_username || 'Mesaj')}</strong><span>${escapeHtml(reply_text || 'Yanıtlanan mesaj')}</span>`;
    bubble.appendChild(reply);
  }

  bubble.appendChild(body);

  const previewUrl = !deleted ? extractFirstUrl(text) : '';
  const linkPreview = previewUrl ? buildLinkPreview(previewUrl) : null;
  if (linkPreview) bubble.appendChild(linkPreview);

  if (message_type === 'story_decision' && !deleted) {
    bubble.appendChild(renderStoryDecisionMessage(story_decision));
  }

  if (file_data && !deleted) {
    bubble.appendChild(renderMedia({ message_type, file_name, file_mime, file_data, file_path, file_size }));
  }

  if (isOwnMessage && !deleted) {
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    const edit = document.createElement('button');
    edit.className = 'message-action';
    edit.textContent = 'Düzenle';
    edit.onclick = (event) => {
      event.stopPropagation();
      editMessage(type, id, body.textContent);
    };

    const del = document.createElement('button');
    del.className = 'message-action';
    del.textContent = 'Sil';
    del.onclick = (event) => {
      event.stopPropagation();
      deleteMessage(type, id);
    };

    actions.appendChild(edit);
    actions.appendChild(del);
    bubble.appendChild(actions);
  }

  addReactionPicker(bubble, type, id);

  if (type === 'dm' && isOwnMessage) {
    const status = document.createElement('span');
    status.className = 'read-status mine';
    status.textContent = read ? 'Görüldü ✓✓' : 'Gönderildi ✓';
    bubble.appendChild(status);
  }

  if (type === 'room' && isOwnMessage && !deleted) {
    const roomStatus = document.createElement('button');
    roomStatus.type = 'button';
    roomStatus.className = 'read-status mine room-read-status';
    roomStatus.textContent = formatRoomSeenText(readers || []);
    roomStatus.dataset.readers = JSON.stringify(normalizeReaderNames(readers || []));
    roomStatus.onclick = (event) => {
      event.stopPropagation();
      const names = JSON.parse(roomStatus.dataset.readers || '[]');
      alert(names.length ? `Görenler:\n${names.join('\n')}` : 'Henüz gören yok.');
    };
    bubble.appendChild(roomStatus);
  }

  div.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    showContextMenu(event.clientX, event.clientY, {
      type,
      id,
      text: body.textContent,
      username,
      mine: isOwnMessage,
      deleted
    });
  });

  div.addEventListener('touchstart', (event) => {
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      const touch = event.touches[0];
      showContextMenu(touch.clientX, touch.clientY, {
        type,
        id,
        text: body.textContent,
        mine,
        deleted
      });
    }, 550);
  }, { passive: true });

  div.addEventListener('touchend', () => clearTimeout(longPressTimer));
  div.addEventListener('touchmove', () => clearTimeout(longPressTimer));

  div.addEventListener('dblclick', (event) => {
    event.stopPropagation();
    sendReaction(type, id, '❤️');
  });

  div.appendChild(avatar);
  div.appendChild(bubble);
  messagesEl.appendChild(div);
  requestAnimationFrame(() => div.classList.add('message-enter-active'));
  setTimeout(() => { div.classList.remove('message-enter', 'message-enter-active'); }, 320);
  loadReactionsForMessage(type, id);
  scrollToBottom();
}

function updateMessageElement(type, id, text, edited, deleted) {
  const el = document.querySelector(`.message[data-type="${type}"][data-id="${id}"]`);
  if (!el) return;

  const body = el.querySelector('.text');
  const meta = el.querySelector('.meta');
  const actions = el.querySelector('.message-actions');

  if (body) body.textContent = text;
  if (meta) {
    if (deleted && !meta.textContent.includes('silindi')) meta.textContent += ' • silindi';
    else if (edited && !meta.textContent.includes('düzenlendi')) meta.textContent += ' • düzenlendi';
  }
  if (deleted && actions) actions.remove();
}

function editMessage(type, id, oldText) {
  const newText = prompt('Yeni mesaj:', oldText);
  if (!newText || !newText.trim()) return;

  if (type === 'dm') {
    socket.emit('dm_message_edit', { messageId: id, text: newText.trim() });
  } else {
    socket.emit('room_message_edit', { messageId: id, text: newText.trim() });
  }
}

function deleteMessage(type, id) {
  if (!confirm('Mesajı silmek istiyor musun?')) return;

  if (type === 'dm') {
    socket.emit('dm_message_delete', { messageId: id });
  } else {
    socket.emit('room_message_delete', { messageId: id });
  }
}


function showContextMenu(x, y, target) {
  if (!target || !target.id || target.deleted) return;

  contextTarget = target;

  const editButton = contextMenu.querySelector('[data-action="edit"]');
  const deleteButton = contextMenu.querySelector('[data-action="delete"]');

  editButton.style.display = target.mine ? '' : 'none';
  deleteButton.style.display = target.mine ? '' : 'none';

  contextMenu.classList.remove('hidden');

  const width = contextMenu.offsetWidth;
  const height = contextMenu.offsetHeight;
  const left = Math.min(x, window.innerWidth - width - 12);
  const top = Math.min(y, window.innerHeight - height - 12);

  contextMenu.style.left = `${Math.max(12, left)}px`;
  contextMenu.style.top = `${Math.max(12, top)}px`;
}

function hideContextMenu() {
  contextMenu.classList.add('hidden');
  contextTarget = null;
}

function startReply(target) {
  if (!target || !target.id) return;

  replyingTo = {
    type: target.type,
    id: target.id,
    username: target.username || 'Mesaj',
    text: target.text || ''
  };

  replyUsername.textContent = `Yanıtlanıyor: ${replyingTo.username}`;
  replyText.textContent = replyingTo.text.slice(0, 80);
  replyBar.classList.remove('hidden');
  messageInput.focus();
}

function clearReply() {
  replyingTo = null;
  replyBar.classList.add('hidden');
  replyUsername.textContent = '';
  replyText.textContent = '';
}


function formatVoiceTime(seconds = 0) {
  const n = Math.max(0, Math.floor(Number(seconds) || 0));
  const m = Math.floor(n / 60);
  const s = n % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateVoiceRecordTimer() {
  if (!voiceRecordTimer || !voiceRecordingStartedAt) return;
  const elapsed = (Date.now() - voiceRecordingStartedAt) / 1000;
  voiceRecordTimer.textContent = formatVoiceTime(elapsed);
}

function setVoiceRecordingUi(recording) {
  isRecording = Boolean(recording);
  voiceButton?.classList.toggle('recording', isRecording);
  if (voiceButton) {
    voiceButton.textContent = isRecording ? '⏹️' : '🎙️';
    voiceButton.title = isRecording ? 'Kaydı durdur' : 'Sesli mesaj kaydet';
  }
  if (sendButton) {
    sendButton.classList.toggle('voice-send-ready', isRecording);
    sendButton.textContent = isRecording ? 'Gönder' : 'Gönder';
    sendButton.title = isRecording ? 'Kaydı durdur ve gönder' : 'Gönder';
  }

  voiceRecordHud?.classList.toggle('hidden', !isRecording);

  clearInterval(voiceRecordingTimer);
  voiceRecordingTimer = null;

  if (isRecording) {
    voiceRecordingStartedAt = Date.now();
    updateVoiceRecordTimer();
    voiceRecordingTimer = setInterval(updateVoiceRecordTimer, 500);
  } else {
    voiceRecordingStartedAt = 0;
    if (voiceRecordTimer) voiceRecordTimer.textContent = '00:00';
  }
}

function buildVoiceBars(seedText = '') {
  const bars = document.createElement('div');
  bars.className = 'voice-wave';
  let seed = 0;
  String(seedText || '').split('').forEach(ch => seed += ch.charCodeAt(0));
  for (let i = 0; i < 24; i++) {
    const bar = document.createElement('span');
    const h = 8 + ((seed + i * 13) % 24);
    bar.style.height = `${h}px`;
    bars.appendChild(bar);
  }
  return bars;
}

function renderVoicePlayer({ file_name, file_data, file_size }) {
  const player = document.createElement('div');
  player.className = 'voice-player';

  const audio = document.createElement('audio');
  audio.src = file_data;
  audio.preload = 'metadata';

  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'voice-play';
  play.textContent = '▶';

  const speed = document.createElement('button');
  speed.type = 'button';
  speed.className = 'voice-speed';
  speed.textContent = '1x';

  const info = document.createElement('div');
  info.className = 'voice-info';

  const top = document.createElement('div');
  top.className = 'voice-top';
  top.innerHTML = `<strong>Sesli mesaj</strong><span class="voice-time">00:00</span>`;

  const wave = buildVoiceBars(file_name || file_data);
  const progress = document.createElement('input');
  progress.type = 'range';
  progress.min = '0';
  progress.max = '1000';
  progress.value = '0';
  progress.className = 'voice-progress';

  const meta = document.createElement('small');
  meta.textContent = file_size ? formatFileSize(file_size) : 'Audio';

  info.appendChild(top);
  info.appendChild(wave);
  info.appendChild(progress);
  info.appendChild(meta);

  const timeEl = top.querySelector('.voice-time');
  const speeds = [1, 1.25, 1.5, 2];
  let speedIndex = 0;

  audio.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(audio.duration)) timeEl.textContent = formatVoiceTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    progress.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    timeEl.textContent = `${formatVoiceTime(audio.currentTime)} / ${formatVoiceTime(audio.duration)}`;
    const active = Math.round((audio.currentTime / audio.duration) * 24);
    wave.querySelectorAll('span').forEach((bar, idx) => bar.classList.toggle('active', idx <= active));
  });

  audio.addEventListener('play', () => {
    play.textContent = '⏸';
    player.classList.add('playing');
  });

  audio.addEventListener('pause', () => {
    play.textContent = '▶';
    player.classList.remove('playing');
  });

  audio.addEventListener('ended', () => {
    play.textContent = '▶';
    player.classList.remove('playing');
    progress.value = '0';
    wave.querySelectorAll('span').forEach(bar => bar.classList.remove('active'));
  });

  play.onclick = (event) => {
    event.stopPropagation();
    if (audio.paused) audio.play().catch(() => addSystemMessage('Ses oynatılamadı.'));
    else audio.pause();
  };

  speed.onclick = (event) => {
    event.stopPropagation();
    speedIndex = (speedIndex + 1) % speeds.length;
    audio.playbackRate = speeds[speedIndex];
    speed.textContent = `${speeds[speedIndex]}x`;
  };

  progress.oninput = () => {
    if (!audio.duration) return;
    audio.currentTime = (Number(progress.value) / 1000) * audio.duration;
  };

  player.appendChild(play);
  player.appendChild(info);
  player.appendChild(speed);
  player.appendChild(audio);
  return player;
}


function renderMedia({ message_type, file_name, file_mime, file_data, file_path, file_size }) {
  const wrap = document.createElement('div');
  wrap.className = 'message-media';

  if (message_type === 'image') {
    const src = messageMediaUrl({ file_data, file_path });
    const img = document.createElement('img');
    img.src = src;
    img.alt = file_name || 'image';
    img.dataset.mediaViewerSrc = src;
    img.dataset.mediaViewerType = 'image';
    img.dataset.mediaViewerTitle = file_name || 'Fotoğraf';
    img.dataset.mediaViewerMeta = file_size ? formatFileSize(file_size) : 'Image';
    img.addEventListener('error', () => {
      img.classList.add('broken-media');
      img.alt = `${file_name || 'Görsel'} yüklenemedi`;
    });
    img.addEventListener('click', (event) => {
      event.stopPropagation();
      openMediaViewer(src, 'image');
    });
    wrap.appendChild(img);
    return wrap;
  }

  if (message_type === 'audio') {
    const src = messageMediaUrl({ file_data, file_path });
    const voice = renderVoicePlayer({ file_name, file_data: src, file_size });
    voice.dataset.mediaViewerSrc = src;
    voice.dataset.mediaViewerType = 'audio';
    voice.dataset.mediaViewerTitle = file_name || 'Ses kaydı';
    voice.dataset.mediaViewerMeta = file_size ? formatFileSize(file_size) : 'Audio';
    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'voice-open-viewer';
    openBtn.textContent = 'Büyük aç';
    openBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      openMediaViewer(src, 'audio');
    });
    voice.appendChild(openBtn);
    wrap.appendChild(voice);
    return wrap;
  }

  const link = document.createElement('a');
  link.className = 'file-link';
  link.href = messageMediaUrl({ file_data, file_path });
  link.target = '_blank';
  link.rel = 'noopener';
  link.download = file_name || 'dosya';
  const sizeText = file_size ? ` (${formatFileSize(file_size)})` : '';
  link.textContent = `📄 ${file_name || 'Dosya aç'}${sizeText}`;
  wrap.appendChild(link);
  return wrap;
}

function addReactionPicker(bubble, scope, messageId) {
  if (!messageId) return;

  const reactions = document.createElement('div');
  reactions.className = 'reactions';
  bubble.appendChild(reactions);

  const picker = document.createElement('div');
  picker.className = 'reaction-picker';

  ['👍', '😂', '❤️', '🔥', '😘'].forEach((emoji) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'message-action';
    btn.textContent = emoji;
    btn.onclick = (event) => {
      event.stopPropagation();
      sendReaction(scope, messageId, emoji);
    };
    picker.appendChild(btn);
  });

  bubble.appendChild(picker);
}

async function sendReaction(scope, messageId, emoji) {
  try {
    const data = await api('/api/reactions', {
      method: 'POST',
      body: JSON.stringify({ scope, messageId, emoji })
    });

    if (data.reactions) {
      setReactionsOnElement(scope, messageId, data.reactions);
    }
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function setReactionsOnElement(scope, messageId, reactionState) {
  const el = document.querySelector(`.message[data-type="${scope}"][data-id="${messageId}"]`);
  if (!el) return;

  const reactions = el.querySelector('.reactions');
  if (!reactions) return;

  reactions.innerHTML = '';

  (reactionState || []).forEach((reaction) => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'reaction-pill';
    pill.dataset.emoji = reaction.emoji;
    pill.dataset.users = JSON.stringify(reaction.users || []);
    pill.textContent = `${reaction.emoji} ${reaction.count}`;

    pill.onclick = (event) => {
      event.stopPropagation();
      showReactionUsers(reaction.emoji, reaction.users || []);
    };

    reactions.appendChild(pill);
  });
}

async function loadReactionsForMessage(scope, messageId) {
  if (!messageId) return;

  try {
    const data = await api(`/api/reactions/${scope}/${messageId}`);
    setReactionsOnElement(scope, messageId, data.reactions || []);
  } catch {}
}

function showReactionUsers(emoji, users) {
  const names = users.map(user => user.username).join(', ');
  alert(`${emoji} bırakanlar: ${names || 'Kimse yok'}`);
}

function openImageModal(src) {
  imageModalImg.src = src;
  imageModal.classList.remove('hidden');
}

function closeImageModal() {
  imageModal.classList.add('hidden');
  imageModalImg.src = '';
}

function formatFileSize(bytes) {
  const n = Number(bytes || 0);
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function refreshMe() {
  try {
    const data = await api('/api/me');
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    renderProfile();
  } catch {}
}

function displayName(person) {
  return person?.display_name || person?.username || 'Kullanıcı';
}

async function loadGlobalAdminStatus() {
  try {
    const data = await api('/api/admin/me');
    canOpenGlobalAdmin = Boolean(data.canOpenAdmin);
    globalAdminPanel.classList.toggle('hidden', !canOpenGlobalAdmin);

    if (canOpenGlobalAdmin) {
      await loadGlobalAdminPanel();
    }
  } catch {
    globalAdminPanel.classList.add('hidden');
  }
}

async function loadGlobalAdminPanel() {
  if (!canOpenGlobalAdmin) return;

  await Promise.allSettled([loadAdminUsers(), loadAdminLogs(), loadIpBans()]);
}

async function loadAdminUsers() {
  try {
    const data = await api('/api/admin/users');
    adminUsersList.innerHTML = '';

    if (!data.users.length) {
      adminUsersList.innerHTML = '<div class="mini-item">Kullanıcı yok.</div>';
      return;
    }

    data.users.forEach((u) => {
      const item = document.createElement('div');
      item.className = 'mini-item admin-user-item';

      item.innerHTML = `
        <div class="mini-left">
          ${avatarHtml(displayName(u), u.avatar_url)}
          <div>
            <strong>${escapeHtml(displayName(u))} ${u.is_banned ? '🚫' : ''}</strong>
            <span>@${escapeHtml(u.username)} • ${escapeHtml(u.global_role || 'user')}</span>
            <span>💎 ${Number(u.shards || 0)} Shards • XP ${Number(u.xp || 0)}</span>
            <span>IP: ${escapeHtml(u.last_ip || 'yok')}</span>
            <span>${escapeHtml(u.last_user_agent || 'cihaz yok')}</span>
            <span>${u.online ? 'Çevrimiçi' : formatPresence(u)}</span>
          </div>
        </div>
      `;

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      const nameBtn = document.createElement('button');
      nameBtn.className = 'action-button';
      nameBtn.textContent = 'Nick';
      nameBtn.onclick = () => changeDisplayName(u);

      const roleBtn = document.createElement('button');
      roleBtn.className = 'action-button gray';
      roleBtn.textContent = 'Rol';
      roleBtn.onclick = () => changeGlobalRole(u);

      const shardBtn = document.createElement('button');
      shardBtn.className = 'action-button';
      shardBtn.textContent = 'Shards';
      shardBtn.onclick = () => changeUserShards(u);

      const banBtn = document.createElement('button');
      banBtn.className = `action-button ${u.is_banned ? 'gray' : 'red'}`;
      banBtn.textContent = u.is_banned ? 'Ban kaldır' : 'Ban';
      banBtn.onclick = () => toggleGlobalBan(u);

      const ipBtn = document.createElement('button');
      ipBtn.className = 'action-button red';
      ipBtn.textContent = 'IP Ban';
      ipBtn.onclick = () => banIp(u.last_ip);

      actions.appendChild(nameBtn);
      actions.appendChild(roleBtn);
      actions.appendChild(shardBtn);
      actions.appendChild(banBtn);
      actions.appendChild(ipBtn);
      item.appendChild(actions);
      adminUsersList.appendChild(item);
    });
  } catch (error) {
    adminUsersList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}


async function loadAdminLogs() {
  if (!adminLogsList) return;

  try {
    const data = await api('/api/admin/logs');
    adminLogsList.innerHTML = '';

    if (!data.logs.length) {
      adminLogsList.innerHTML = '<div class="mini-item">Admin log yok.</div>';
      return;
    }

    data.logs.forEach((log) => {
      const item = document.createElement('div');
      item.className = 'mini-item admin-log-item';
      const actor = log.actor_display_name || log.actor_username || 'Sistem';
      const target = log.target_display_name || log.target_username || '';
      const details = log.details ? JSON.stringify(log.details) : '{}';

      item.innerHTML = `
        <div>
          <strong>${escapeHtml(log.action)}</strong>
          <span>${escapeHtml(actor)} ${target ? '→ ' + escapeHtml(target) : ''}</span>
          <span>${escapeHtml(details)}</span>
          <span>${new Date(log.created_at).toLocaleString('tr-TR')}</span>
        </div>
      `;

      adminLogsList.appendChild(item);
    });
  } catch (error) {
    adminLogsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}


async function changeDisplayName(u) {
  const displayNameValue = prompt('Yeni görünen ad:', displayName(u));
  if (displayNameValue === null) return;

  try {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ displayName: displayNameValue })
    });
    await loadAdminUsers();
    await loadAdminLogs();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function changeGlobalRole(u) {
  const role = prompt('Rol yaz: owner / admin / mod / user', u.global_role || 'user');
  if (role === null) return;

  try {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ globalRole: role })
    });
    await loadAdminUsers();
    await loadAdminLogs();
  } catch (error) {
    addSystemMessage(error.message);
  }
}


async function changeUserShards(u) {
  const current = Number(u.shards || 0);
  const value = prompt(
    `${displayName(u)} için yeni Shards miktarı yaz.\n\nDirekt sayı yazarsan bakiye o olur.\n+100 veya -50 yazarsan ekleme/çıkarma yapar.`,
    String(current)
  );

  if (value === null) return;

  const raw = String(value).trim();
  if (!raw) return;

  try {
    if (/^[+-]\d+$/.test(raw)) {
      await api(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ shardDelta: Number(raw) })
      });
    } else {
      const shards = Math.max(0, Math.min(9999999, Math.floor(Number(raw) || 0)));
      await api(`/api/admin/users/${u.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ shards })
      });
    }

    addSystemMessage('Shards güncellendi.');
    await loadAdminUsers();
    await loadGamify();
  } catch (error) {
    addSystemMessage(error.message);
  }
}


async function toggleGlobalBan(u) {
  const reason = u.is_banned ? '' : prompt('Ban sebebi:', 'Kurallara aykırı davranış') || 'Banlandı.';

  try {
    await api(`/api/admin/users/${u.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isBanned: !u.is_banned, banReason: reason })
    });
    await loadAdminUsers();
    await loadAdminLogs();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadIpBans() {
  try {
    const data = await api('/api/admin/ip-bans');
    ipBansList.innerHTML = '';

    if (!data.bans.length) {
      ipBansList.innerHTML = '<div class="mini-item">IP ban yok.</div>';
      return;
    }

    data.bans.forEach((ban) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div><strong>${escapeHtml(ban.ip)}</strong><span>${escapeHtml(ban.reason || '')}</span></div>`;

      const remove = document.createElement('button');
      remove.className = 'action-button gray';
      remove.textContent = 'Kaldır';
      remove.onclick = () => removeIpBan(ban.id);

      item.appendChild(remove);
      ipBansList.appendChild(item);
    });
  } catch (error) {
    ipBansList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}

async function banIpFromInput() {
  await banIp(ipBanInput.value.trim());
  ipBanInput.value = '';
}

async function banIp(ip) {
  if (!ip) {
    addSystemMessage('IP yok.');
    return;
  }

  const reason = prompt('IP ban sebebi:', 'IP ban') || 'IP ban';

  try {
    await api('/api/admin/ip-bans', {
      method: 'POST',
      body: JSON.stringify({ ip, reason })
    });
    await loadIpBans();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function removeIpBan(id) {
  try {
    await api(`/api/admin/ip-bans/${id}`, { method: 'DELETE' });
    await loadIpBans();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadRoomMembers() {
  try {
    const data = await api(`/api/room/${encodeURIComponent(currentRoom)}/members`);
    roomMembers = data.members || [];
    renderOnlineUsersDetailed();
    renderAdminMembers();
  } catch {}
}

function renderOnlineUsersDetailed() {
  if (!roomMembers.length) return;

  usersList.innerHTML = '';
  roomMembers.forEach((member) => {
    const li = document.createElement('li');
    const name = member.display_name || member.username;
    const meta = onlineStatusMeta(member);
    const role = member.role || 'member';
    const customHtml = meta.custom
      ? `<div class="online-custom-status" title="${escapeHtml(meta.custom)}"><span>💬</span>${escapeHtml(meta.custom)}</div>`
      : '';
    const storyHtml = '';

    li.className = `user-row online-user-row presence-${meta.status}`;
    li.innerHTML = `
      ${avatarHtml(name, member.avatar_url)}
      <div class="user-meta">
        <div class="online-user-top">
          <strong>${escapeHtml(name)}</strong>
          <b class="online-role-pill ${roleClass(role)}">${escapeHtml(roleLabel(role))}</b>
        </div>
        <div class="online-presence-line">
          <span class="presence-dot-mini" data-presence="${escapeHtml(meta.status)}"></span>
          <span>${escapeHtml(meta.icon)} ${escapeHtml(meta.label)}</span>
        </div>
        ${customHtml}
        ${storyHtml}
      </div>
    `;
    li.onclick = () => openProfile(member.id);
    usersList.appendChild(li);
  });
}

function renderRole() {
  myRoleText.textContent = `Rol: ${myRoomRole || 'üye'}`;
}

async function loadModeration() {
  try {
    const data = await api(`/api/room/${encodeURIComponent(currentRoom)}/moderation`);
    myRoomRole = data.myRole || null;
    roomMutedUsers = data.mutes || [];
    renderRole();
    renderAdminMembers();
    renderMutedMembers();
  } catch {}
}

function renderAdminMembers() {
  adminMembersList.innerHTML = '';

  if (!['admin', 'mod'].includes(myRoomRole)) {
    adminMembersList.innerHTML = '<div class="mini-item">Yetkin yok.</div>';
    return;
  }

  if (!roomMembers.length) {
    adminMembersList.innerHTML = '<div class="mini-item">Online üye yok.</div>';
    return;
  }

  roomMembers
    .filter((member) => member.id !== user.id)
    .forEach((member) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div class="mini-left">${avatarHtml(member.username, member.avatar_url)}<div><strong>${escapeHtml(member.username)}</strong><span>${member.role || 'üye'}</span></div></div>`;

      const actions = document.createElement('div');
      actions.className = 'mini-actions';

      if (myRoomRole === 'admin') {
        const mod = document.createElement('button');
        mod.className = 'action-button';
        mod.textContent = member.role === 'mod' ? 'Mod al' : 'Mod yap';
        mod.onclick = () => moderateUser(member.id, member.role === 'mod' ? 'unmod' : 'mod');
        actions.appendChild(mod);
      }

      const isMuted = roomMutedUsers.some((muted) => Number(muted.user_id) === Number(member.id));

      const mute = document.createElement('button');
      mute.className = 'action-button gray';
      mute.textContent = isMuted ? 'Susturma aç' : 'Sustur';
      mute.onclick = () => moderateUser(member.id, isMuted ? 'unmute' : 'mute');

      const kick = document.createElement('button');
      kick.className = 'action-button gray';
      kick.textContent = 'At';
      kick.onclick = () => moderateUser(member.id, 'kick');

      const ban = document.createElement('button');
      ban.className = 'action-button red';
      ban.textContent = 'Ban';
      ban.onclick = () => moderateUser(member.id, 'ban');

      actions.appendChild(mute);
      actions.appendChild(kick);
      actions.appendChild(ban);
      item.appendChild(actions);
      adminMembersList.appendChild(item);
    });
}

function renderMutedMembers() {
  if (!mutedMembersList) return;

  mutedMembersList.innerHTML = '';

  if (!['admin', 'mod'].includes(myRoomRole)) {
    mutedMembersList.innerHTML = '<div class="mini-item">Yetkin yok.</div>';
    return;
  }

  if (!roomMutedUsers.length) {
    mutedMembersList.innerHTML = '<div class="mini-item">Susturulan yok.</div>';
    return;
  }

  roomMutedUsers.forEach((muted) => {
    const item = document.createElement('div');
    item.className = 'mini-item';
    item.innerHTML = `<div class="mini-left">${avatarHtml(muted.username, muted.avatar_url)}<div><strong>${escapeHtml(muted.username)}</strong><span>Susturuldu</span></div></div>`;

    const unmute = document.createElement('button');
    unmute.className = 'action-button';
    unmute.textContent = 'Susturma aç';
    unmute.onclick = () => moderateUser(muted.user_id, 'unmute');

    item.appendChild(unmute);
    mutedMembersList.appendChild(item);
  });
}

async function moderateUser(userId, action) {
  try {
    const data = await api(`/api/room/${encodeURIComponent(currentRoom)}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ userId, action })
    });
    addSystemMessage(data.message);
    await Promise.allSettled([loadRoomMembers(), loadModeration()]);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function searchMessages() {
  const q = messageSearchInput.value.trim();
  messageSearchResults.innerHTML = '';

  if (q.length < 2) {
    messageSearchResults.innerHTML = '<div class="mini-item">En az 2 karakter yaz.</div>';
    return;
  }

  try {
    const url = chatMode === 'dm' && activeFriend
      ? `/api/search/messages?scope=dm&friendId=${activeFriend.id}&q=${encodeURIComponent(q)}`
      : `/api/search/messages?scope=room&room=${encodeURIComponent(currentRoom)}&q=${encodeURIComponent(q)}`;

    const data = await api(url);

    if (!data.results.length) {
      messageSearchResults.innerHTML = '<div class="mini-item">Sonuç yok.</div>';
      return;
    }

    data.results.forEach((result) => {
      const item = document.createElement('div');
      item.className = 'mini-item';
      item.innerHTML = `<div><strong>${escapeHtml(result.username)}</strong><span>${escapeHtml(result.text)}</span></div>`;
      messageSearchResults.appendChild(item);
    });
  } catch (error) {
    messageSearchResults.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}


function openSettings() {
  setSettingsCategory('account');
  if (isMobileLayout && isMobileLayout()) document.body.classList.add('settings-mobile-open');
  setTimeout(() => document.querySelector('.settings-content-v2')?.scrollTo({ top: 0, behavior: 'auto' }), 0);
  if (!settingsModal || !user) return;

  settingsUsernameInput.value = user.username || '';
  settingsDisplayNameInput.value = user.display_name || user.username || '';
  settingsBioInput.value = user.bio || '';

  const localSettings = getLocalSettings();
  settingsThemeSelect.value = localSettings.theme;
  settingsCompactToggle.checked = localSettings.compact;
  settingsReducedMotionToggle.checked = localSettings.reducedMotion;
  settingsFontSizeSelect.value = localSettings.fontSize;
  settingsEnterSendToggle.checked = localSettings.enterSend;
  settingsShowAvatarsToggle.checked = localSettings.showAvatars;
  settingsShowTimesToggle.checked = localSettings.showTimes;
  settingsNotifyDmToggle.checked = localSettings.notifyDm;
  settingsNotifyGroupToggle.checked = localSettings.notifyGroup;
  settingsNotifyMentionToggle.checked = localSettings.notifyMention;
  settingsNotifyFriendToggle.checked = localSettings.notifyFriend;
  settingsNotificationSoundToggle.checked = localSettings.notificationSound;
  settingsEggsToggle.checked = localSettings.eggsEnabled;
  settingsEggIntensitySelect.value = localSettings.eggIntensity;
  settingsEggSoundToggle.checked = localSettings.eggSound;
  settingsEggOwnOnlyToggle.checked = localSettings.eggOwnOnly;
  settingsBotHideToggle.checked = localSettings.botHide;
  settingsBotHighlightToggle.checked = localSettings.botHighlight;
  settingsBotCompactToggle.checked = localSettings.botCompact;
  settingsLanguageSelect.value = localSettings.language;

  settingsProfileStatus.textContent = '';
  settingsPasswordStatus.textContent = '';
  settingsLocalStatus.textContent = '';
  settingsCurrentPasswordInput.value = '';
  settingsNewPasswordInput.value = '';
  settingsNewPasswordAgainInput.value = '';

  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  document.body.classList.remove('settings-mobile-open');
  settingsModal?.classList.add('hidden');
}

async function saveSettingsProfile() {
  try {
    settingsProfileStatus.textContent = 'Kaydediliyor...';

    const data = await api('/api/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        username: settingsUsernameInput.value,
        displayName: settingsDisplayNameInput.value,
        bio: settingsBioInput.value
      })
    });

    user = data.user;
    token = data.token || token;
    localStorage.setItem('chat_user', JSON.stringify(user));
    localStorage.setItem('chat_token', token);

    renderProfile();
    settingsProfileStatus.textContent = 'Profil kaydedildi.';
    addSystemMessage('Ayarlar güncellendi. Bağlantı yenileniyor...');

    connectSocket();
    await Promise.allSettled([loadFriends(), loadGroups(), loadRoomMembers(), loadGlobalAdminStatus()]);
  } catch (error) {
    settingsProfileStatus.textContent = error.message;
  }
}

async function changeSettingsPassword() {
  try {
    const currentPassword = settingsCurrentPasswordInput.value;
    const newPassword = settingsNewPasswordInput.value;
    const newPasswordAgain = settingsNewPasswordAgainInput.value;

    if (newPassword !== newPasswordAgain) {
      settingsPasswordStatus.textContent = 'Yeni şifreler aynı değil.';
      return;
    }

    settingsPasswordStatus.textContent = 'Değiştiriliyor...';

    await api('/api/settings/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });

    settingsCurrentPasswordInput.value = '';
    settingsNewPasswordInput.value = '';
    settingsNewPasswordAgainInput.value = '';
    settingsPasswordStatus.textContent = 'Şifre değiştirildi.';
    addSystemMessage('Şifre başarıyla değiştirildi.');
  } catch (error) {
    settingsPasswordStatus.textContent = error.message;
  }
}

function saveLocalSettingsFromPanel() {
  localStorage.setItem('chat_theme', settingsThemeSelect.value);
  localStorage.setItem('chat_compact', String(settingsCompactToggle.checked));
  localStorage.setItem('chat_reduced_motion', String(settingsReducedMotionToggle.checked));
  localStorage.setItem('chat_font_size', settingsFontSizeSelect.value);
  localStorage.setItem('chat_enter_send', String(settingsEnterSendToggle.checked));
  localStorage.setItem('chat_show_avatars', String(settingsShowAvatarsToggle.checked));
  localStorage.setItem('chat_show_times', String(settingsShowTimesToggle.checked));
  localStorage.setItem('chat_notify_dm', String(settingsNotifyDmToggle.checked));
  localStorage.setItem('chat_notify_group', String(settingsNotifyGroupToggle.checked));
  localStorage.setItem('chat_notify_mention', String(settingsNotifyMentionToggle.checked));
  localStorage.setItem('chat_notify_friend', String(settingsNotifyFriendToggle.checked));
  localStorage.setItem('chat_notification_sound', String(settingsNotificationSoundToggle.checked));
  localStorage.setItem('chat_eggs_enabled', String(settingsEggsToggle.checked));
  localStorage.setItem('chat_egg_intensity', settingsEggIntensitySelect.value);
  localStorage.setItem('chat_egg_sound', String(settingsEggSoundToggle.checked));
  localStorage.setItem('chat_egg_own_only', String(settingsEggOwnOnlyToggle.checked));
  localStorage.setItem('chat_bot_hide', String(settingsBotHideToggle.checked));
  localStorage.setItem('chat_bot_highlight', String(settingsBotHighlightToggle.checked));
  localStorage.setItem('chat_bot_compact', String(settingsBotCompactToggle.checked));
  localStorage.setItem('chat_language', settingsLanguageSelect.value);
  applyLocalSettings();
  settingsLocalStatus.textContent = 'Tüm yerel ayarlar kaydedildi.';
}

function resetLocalSettingsFromPanel() {
  [
    'chat_theme',
    'chat_compact',
    'chat_reduced_motion',
    'chat_font_size',
    'chat_enter_send',
    'chat_show_avatars',
    'chat_show_times',
    'chat_notify_dm',
    'chat_notify_group',
    'chat_notify_mention',
    'chat_notify_friend',
    'chat_notification_sound',
    'chat_eggs_enabled',
    'chat_egg_intensity',
    'chat_egg_sound',
    'chat_egg_own_only',
    'chat_bot_hide',
    'chat_bot_highlight',
    'chat_bot_compact',
    'chat_language'
  ].forEach((key) => localStorage.removeItem(key));

  applyLocalSettings();
  openSettings();
  addSystemMessage('Bu cihazdaki görünüm ve tercih ayarları sıfırlandı.');
}

async function requestBrowserNotificationsFromSettings() {
  if (!('Notification' in window)) {
    addSystemMessage('Tarayıcın bildirim desteklemiyor.');
    return;
  }

  const permission = await Notification.requestPermission();
  addSystemMessage(permission === 'granted' ? 'Bildirimler açıldı.' : 'Bildirim izni verilmedi.');
}

async function clearNotificationsFromSettings() {
  try {
    await api('/api/notifications', { method: 'DELETE' });
    notificationsList.innerHTML = '<div class="mini-item">Bildirim yok.</div>';
    unreadNotifications = 0;
    updateBadge();
    addSystemMessage('Bildirimler temizlendi.');
  } catch (error) {
    addSystemMessage(error.message);
  }
}



function formatProfileDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
}

function formatProfileDateTime(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '-';
  }
}

function safeProfileColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? value : '#8b5cf6';
}



function profileRoleLabel(profile) {
  const role = String(profile.global_role || 'user').toLowerCase();
  if (role === 'owner') return 'OWNER';
  if (role === 'admin') return 'ADMIN';
  if (role === 'mod') return 'MOD';
  return 'USER';
}

function refreshProfileCoverFileName() {
  if (!profileCoverFileName) return;
  const file = profileCoverInput?.files?.[0];
  profileCoverFileName.textContent = file ? file.name : 'Dosya seçilmedi';
}


const PROFILE_BADGE_RARITY = {
  new_anomaly: 'common',
  first_signal: 'common',
  face_revealed: 'common',
  active_member: 'rare',
  group_energy: 'rare',
  dm_operator: 'rare',
  cover_artist: 'epic',
  vertex_witness: 'epic',
  limbo_survivor: 'epic',
  dimension_speaker: 'legendary',
  respect_protocol: 'legendary'
};

function badgeRarity(badge) {
  return String(badge?.rarity || PROFILE_BADGE_RARITY[String(badge?.key || '')] || 'common').toLowerCase();
}

function rarityLabel(rarity) {
  if (rarity === 'legendary') return 'Legendary';
  if (rarity === 'epic') return 'Epic';
  if (rarity === 'rare') return 'Rare';
  return 'Common';
}

function storedBadgeKey() {
  return user ? `chat_badges_seen_${user.id}` : 'chat_badges_seen';
}

function getSeenBadgeKeys() {
  try { return JSON.parse(localStorage.getItem(storedBadgeKey()) || '[]'); } catch { return []; }
}

function setSeenBadgeKeys(keys) {
  localStorage.setItem(storedBadgeKey(), JSON.stringify(Array.from(new Set(keys))));
}

function findFriendById(friendId) {
  return friends.find((f) => Number(f.id) === Number(friendId)) || null;
}

function renderAchievementToast(badge) {
  if (!achievementToastContainer || !badge) return;
  const rarity = badgeRarity(badge);
  const toast = document.createElement('div');
  toast.className = `achievement-toast rarity-${rarity}`;
  toast.innerHTML = `
    <div class="achievement-icon">${escapeHtml(badge.icon || '🏆')}</div>
    <div class="achievement-copy">
      <small>Başarım açıldı · ${rarityLabel(rarity)}</small>
      <strong>${escapeHtml(badge.name || 'Yeni rozet')}</strong>
      <span>${escapeHtml(badge.description || 'Yeni bir rozet kazandın.')}</span>
    </div>
    <div class="achievement-glow"></div>
  `;
  achievementToastContainer.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  playUiBeep('egg');
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 380);
  }, 5000);
}

async function checkForUnlockedBadges(force = false) {
  if (!token || !user) return;
  const now = Date.now();
  if (!force && now - badgeCheckCooldown < 4500) return;
  badgeCheckCooldown = now;

  try {
    const data = await api(`/api/profile/${user.id}`);
    const badges = (data.profile?.all_badges || data.profile?.badges || []).filter((badge) => badge.unlocked !== false);
    const keys = badges.map((badge) => badge.key).filter(Boolean);
    const seen = getSeenBadgeKeys();

    if (seen.length === 0) {
      setSeenBadgeKeys(keys);
      return;
    }

    badges.filter((badge) => badge.key && !seen.includes(badge.key)).forEach(renderAchievementToast);
    setSeenBadgeKeys(keys);
  } catch {}
}


function activityDateLabel(dateText, short = false) {
  try {
    const date = new Date(`${dateText}T12:00:00`);
    return date.toLocaleDateString('tr-TR', short ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'long' });
  } catch {
    return dateText || '-';
  }
}

function activityIntensity(count = 0, max = 0) {
  if (!count) return 0;
  if (max <= 1) return 1;
  const ratio = count / max;
  if (ratio >= .80) return 4;
  if (ratio >= .50) return 3;
  if (ratio >= .25) return 2;
  return 1;
}

function renderActivityCalendar(data) {
  if (!profileActivityGrid) return;

  const daily = Array.isArray(data?.daily) ? data.daily : [];
  const summary = data?.summary || {};
  const max = Math.max(1, ...daily.map((day) => Number(day.count || 0)));

  profileActivityGrid.innerHTML = '';

  daily.forEach((day) => {
    const count = Number(day.count || 0);
    const cell = document.createElement('div');
    cell.className = 'activity-day';
    cell.dataset.level = String(activityIntensity(count, max));
    cell.title = `${activityDateLabel(day.date)} · ${count} mesaj`;
    cell.innerHTML = `<span>${activityDateLabel(day.date, true)}</span><strong>${count}</strong>`;
    profileActivityGrid.appendChild(cell);
  });

  if (profileActivityTotal) profileActivityTotal.textContent = Number(summary.total || 0).toLocaleString('tr-TR');
  if (profileActivityActiveDays) profileActivityActiveDays.textContent = Number(summary.active_days || 0).toLocaleString('tr-TR');

  const best = summary.best_day;
  if (profileActivityBestDay) {
    profileActivityBestDay.textContent = best ? `${activityDateLabel(best.date, true)} · ${Number(best.count || 0)}` : '-';
  }

  if (profileActivityStreak) {
    const current = Number(summary.current_streak || 0);
    const longest = Number(summary.longest_streak || 0);
    profileActivityStreak.textContent = `${current} gün streak`;
    profileActivityStreak.title = `En uzun streak: ${longest} gün`;
    profileActivityStreak.dataset.active = current > 0 ? 'true' : 'false';
  }

  if (profileActivityTopDays) {
    const topDays = Array.isArray(summary.top_days) ? summary.top_days : [];
    profileActivityTopDays.innerHTML = topDays.length
      ? topDays.map((day, idx) => `<span><b>#${idx + 1}</b> ${escapeHtml(activityDateLabel(day.date, true))} · ${Number(day.count || 0)} mesaj</span>`).join('')
      : '<span>Son 30 günde aktivite yok.</span>';
  }
}

function renderActivityCalendarLoading() {
  if (!profileActivityGrid) return;
  profileActivityGrid.innerHTML = Array.from({ length: 30 }, (_, index) => `<div class="activity-day loading" data-level="0"><span>${index + 1}</span><strong>—</strong></div>`).join('');
  if (profileActivityTotal) profileActivityTotal.textContent = '—';
  if (profileActivityActiveDays) profileActivityActiveDays.textContent = '—';
  if (profileActivityBestDay) profileActivityBestDay.textContent = '—';
  if (profileActivityStreak) profileActivityStreak.textContent = 'yükleniyor';
  if (profileActivityTopDays) profileActivityTopDays.innerHTML = '<span>Aktivite yükleniyor...</span>';
}

async function loadProfileActivity(userId) {
  if (!profileActivityGrid || !userId) return;
  renderActivityCalendarLoading();

  try {
    const data = await api(`/api/activity/${userId}`);
    renderActivityCalendar(data);
  } catch (error) {
    profileActivityGrid.innerHTML = '<div class="activity-error">Aktivite yüklenemedi.</div>';
    if (profileActivityTopDays) profileActivityTopDays.innerHTML = `<span>${escapeHtml(error.message)}</span>`;
  }
}


function renderProfileAbout(profile, stats = {}, isMe = false) {
  if (!profileAboutText || !profileAboutMeta) return;
  const about = profile.bio || (isMe ? 'Burası senin mini hakkında alanın. Ayarlardan bio yazarak kişiselleştirebilirsin.' : 'Bu kullanıcı henüz bir hakkında metni eklememiş.');
  profileAboutText.textContent = about;
  profileAboutMeta.innerHTML = `
    <span>@${escapeHtml(profile.username || '')}</span>
    <span>${Number(stats.friends_count || 0)} arkadaş</span>
    <span>${Number(stats.groups_count || 0)} grup</span>
    <span>${escapeHtml(profile.favorite_egg || '/serbia')}</span>
  `;
}

function syncProfileActionState(profile, isMe = false) {
  if (!profileActionButtons || !profileMessageButton || !profileFriendButton) return;
  const isFriend = !!findFriendById(profile.id);
  profileActionButtons.classList.toggle('hidden', isMe);
  profileMessageButton.dataset.userId = String(profile.id || '');
  profileMessageButton.dataset.username = String(profile.username || '');
  profileFriendButton.dataset.userId = String(profile.id || '');
  profileFriendButton.dataset.username = String(profile.username || '');
  profileFriendButton.disabled = isFriend;
  profileFriendButton.textContent = isFriend ? 'Zaten arkadaş' : 'Arkadaş ekle';
  profileMessageButton.textContent = isFriend ? 'Mesaj gönder' : 'DM aç';
}

function syncProfileParallax(event) {
  if (!profileCardV2 || window.matchMedia('(max-width: 820px)').matches) return;
  const rect = profileCardV2.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width;
  const py = (event.clientY - rect.top) / rect.height;
  const rotateY = (px - 0.5) * 12;
  const rotateX = (0.5 - py) * 10;
  profileCardV2.style.setProperty('--tilt-x', `${rotateX.toFixed(2)}deg`);
  profileCardV2.style.setProperty('--tilt-y', `${rotateY.toFixed(2)}deg`);
  profileCardV2.style.setProperty('--parallax-x', `${((px - 0.5) * 20).toFixed(1)}px`);
  profileCardV2.style.setProperty('--parallax-y', `${((py - 0.5) * 16).toFixed(1)}px`);
}

function resetProfileParallax() {
  if (!profileCardV2) return;
  profileCardV2.style.setProperty('--tilt-x', '0deg');
  profileCardV2.style.setProperty('--tilt-y', '0deg');
  profileCardV2.style.setProperty('--parallax-x', '0px');
  profileCardV2.style.setProperty('--parallax-y', '0px');
}

function animateNumber(element, toValue, duration = 700) {
  if (!element) return;
  const fromValue = Number(String(element.textContent || '0').replace(/\D/g, '')) || 0;
  const target = Number(toValue) || 0;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.round(fromValue + (target - fromValue) * eased));
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function toggleAllBadgesPanel() {
  profileAllBadgesPanel?.classList.toggle('hidden');
}

function badgeCategoryLabel(badge) {
  const key = String(badge?.key || '');
  if (key.includes('level') || key.includes('shard') || key.includes('daily') || key.includes('casino')) return 'Progress';
  if (key.includes('friend') || key.includes('group') || key.includes('social') || key.includes('network') || key.includes('alliance')) return 'Social';
  if (key.includes('serbia') || key.includes('vertex') || key.includes('limbo') || key.includes('rome') || key.includes('egypt') || key.includes('anitkabir') || key.includes('cat') || key.includes('reset') || key.includes('rift') || key.includes('five') || key.includes('xara') || key.includes('nico') || key.includes('yasin') || key.includes('jung') || key.includes('feiz')) return 'Easter Egg';
  if (key.includes('profile') || key.includes('cover') || key.includes('bio') || key.includes('color') || key.includes('frame') || key.includes('name') || key.includes('style')) return 'Profile';
  if (key.includes('admin') || key.includes('mod') || key.includes('owner')) return 'Staff';
  return 'Chat';
}

function badgeProgressText(badge) {
  if (badge.unlocked) return 'Açıldı';
  const desc = String(badge.description || '');
  const match = desc.match(/(\d+)\+/);
  if (match) return `Hedef: ${match[1]}+`;
  if (desc.toLowerCase().includes('favori easter egg')) return 'Favori egg değiştir';
  if (desc.toLowerCase().includes('kuşandı')) return 'Item kuşan';
  return 'Kilitli';
}

function setBadgeFilter(filter) {
  activeBadgeFilter = filter || 'all';
  profileBadgeFilters?.querySelectorAll('.badge-filter').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.badgeFilter === activeBadgeFilter);
  });
  if (activeProfileUser) renderAllBadgesPanel(activeProfileUser, Number(activeProfileUser.id) === Number(user.id), true);
}

function renderBadgeSummary(allBadges) {
  if (!profileBadgeSummary) return;
  const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
  const unlocked = allBadges.filter((badge) => badge.unlocked);
  unlocked.forEach((badge) => {
    const rarity = badgeRarity(badge);
    counts[rarity] = (counts[rarity] || 0) + 1;
  });
  profileBadgeSummary.innerHTML = `
    <span>${unlocked.length}/${allBadges.length} açık</span>
    <span>Common ${counts.common || 0}</span>
    <span>Rare ${counts.rare || 0}</span>
    <span>Epic ${counts.epic || 0}</span>
    <span>Legendary ${counts.legendary || 0}</span>
  `;
}

function renderAllBadgesPanel(profile, isMe, keepFilter = false) {
  if (!profileAllBadgesList) return;

  activeProfileAllBadges = profile.all_badges || [];
  activeProfileSelectedBadges = Array.isArray(profile.selected_badges) ? [...profile.selected_badges] : [];
  const unlocked = activeProfileAllBadges.filter((badge) => badge.unlocked);

  if (!keepFilter) activeBadgeFilter = 'all';

  if (profileBadgeCounter) profileBadgeCounter.textContent = `${unlocked.length} / ${activeProfileAllBadges.length} açık`;
  if (profileBadgeHint) {
    profileBadgeHint.textContent = isMe
      ? 'Badges V2: filtrele, detay gör, en fazla 8 rozet vitrine koy.'
      : 'Badges V2: bu kullanıcının açık ve kilitli rozetleri.';
  }

  renderBadgeSummary(activeProfileAllBadges);

  profileBadgeFilters?.querySelectorAll('.badge-filter').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.badgeFilter === activeBadgeFilter);
    btn.onclick = () => setBadgeFilter(btn.dataset.badgeFilter);
  });

  profileSaveBadgesButton?.classList.toggle('hidden', !isMe);
  profileAllBadgesList.innerHTML = '';

  const filtered = activeProfileAllBadges.filter((badge) => {
    const rarity = badgeRarity(badge);
    if (activeBadgeFilter === 'unlocked') return badge.unlocked;
    if (activeBadgeFilter === 'locked') return !badge.unlocked;
    if (['common', 'rare', 'epic', 'legendary'].includes(activeBadgeFilter)) return rarity === activeBadgeFilter;
    return true;
  });

  filtered.forEach((badge) => {
    const rarity = badgeRarity(badge);
    const item = document.createElement(isMe ? 'label' : 'div');
    item.className = `profile-all-badge badges-v2-card rarity-${rarity} ${badge.unlocked ? 'unlocked' : 'locked'}`;

    const checked = activeProfileSelectedBadges.includes(badge.key);
    item.innerHTML = `
      <input type="checkbox" ${checked ? 'checked' : ''} ${(!isMe || !badge.unlocked) ? 'disabled' : ''} data-badge-key="${escapeHtml(badge.key)}">
      <span class="all-badge-icon">${escapeHtml(badge.icon || '🏆')}</span>
      <div>
        <strong>${escapeHtml(badge.name || 'Badge')}</strong>
        <small>${escapeHtml(badge.description || '')}</small>
        <div class="badge-v2-meta">
          <b>${escapeHtml(badgeCategoryLabel(badge))}</b>
          <b>${escapeHtml(badgeProgressText(badge))}</b>
        </div>
      </div>
      <em>${badge.unlocked ? rarityLabel(rarity) : 'Kilitli'}</em>
    `;

    item.onclick = (event) => {
      if (event.target?.tagName === 'INPUT') return;
      const info = `${badge.icon || '🏆'} ${badge.name}\\n${rarityLabel(rarity)} · ${badgeCategoryLabel(badge)}\\n\\n${badge.description || ''}\\n\\nDurum: ${badgeProgressText(badge)}`;
      setTimeout(() => alert(info), 0);
    };

    const checkbox = item.querySelector('input');
    if (checkbox && isMe && badge.unlocked) {
      checkbox.onchange = () => {
        const checkedBoxes = Array.from(profileAllBadgesList.querySelectorAll('input:checked'));
        if (checkedBoxes.length > 8) {
          checkbox.checked = false;
          addSystemMessage('En fazla 8 rozet seçebilirsin.');
        }
      };
    }

    profileAllBadgesList.appendChild(item);
  });

  if (!filtered.length) {
    profileAllBadgesList.innerHTML = '<div class="mini-item">Bu filtrede rozet yok.</div>';
  }
}

async function saveProfileBadgeShowcase() {
  try {
    const selected = Array.from(profileAllBadgesList.querySelectorAll('input:checked'))
      .map((input) => input.dataset.badgeKey)
      .filter(Boolean)
      .slice(0, 8);

    await api('/api/profile/badges', {
      method: 'POST',
      body: JSON.stringify({ badges: selected })
    });

    addSystemMessage('Rozet vitrini kaydedildi.');
    if (activeProfileUser) openProfile(activeProfileUser.id);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function exportProfilePng() {
  if (!profileCardV2) return;
  try {
    if (typeof html2canvas !== 'function') {
      addSystemMessage('PNG dışa aktarma kütüphanesi yüklenemedi.');
      return;
    }

    profileCardV2.classList.add('exporting-profile');
    const canvas = await html2canvas(profileCardV2, {
      backgroundColor: null,
      scale: Math.min(2, window.devicePixelRatio || 1.5),
      useCORS: true,
      logging: false
    });

    profileCardV2.classList.remove('exporting-profile');

    const link = document.createElement('a');
    const safeName = String(activeProfileUser?.username || 'profile').replace(/[^a-zA-Z0-9_-]/g, '-');
    link.download = `${safeName}-profile-card.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    profileCardV2.classList.remove('exporting-profile');
    addSystemMessage('Profil PNG oluşturulamadı: ' + error.message);
  }
}


async function openProfile(userId) {
  registerProfileVisit(userId);
  try {
    const data = await api(`/api/profile/${userId}`);
    const profile = data.profile;
    const color = safeProfileColor(profile.profile_color);
    const stats = profile.stats || {};
    activeProfileUser = profile;

    profileAvatar.className = `profile-avatar-shell ${profile.active_profile_frame ? 'avatar-frame ' + profile.active_profile_frame : ''}`;
    if (profileCardV2) {
      profileCardV2.classList.remove('profile-theme_limbo','profile-theme_serbia','profile-theme_egypt','profile-theme_rome','profile-theme_vertex','profile-theme_five');
      profileCardV2.dataset.profileTheme = profile.active_profile_theme || '';
      if (profile.active_profile_theme) profileCardV2.classList.add('profile-' + profile.active_profile_theme);
    }
    profileAvatar.innerHTML = avatarHtml(profile.username, profile.avatar_url, 'profile-avatar-inner');
    profileUsername.textContent = displayName(profile);
    profileStatus.textContent = `${formatPresence(profile)} · @${profile.username}${storyActive(profile) ? ' · Story: ' + profile.story_text : ''}`;
    profileBio.textContent = profile.bio || 'Bio yok.';
    if (profileRoleBadge) {
      profileRoleBadge.textContent = profileRoleLabel(profile);
      profileRoleBadge.classList.remove('hidden');
      profileRoleBadge.dataset.role = String(profile.global_role || 'user').toLowerCase();
    }

    profileCover.style.setProperty('--profile-color', color);
    profileCover.style.backgroundImage = profile.profile_cover_url
      ? `linear-gradient(180deg, rgba(7,10,19,.12), rgba(7,10,19,.78)), radial-gradient(circle at 15% 15%, ${color}55, transparent 30%), url("${profile.profile_cover_url}")`
      : `radial-gradient(circle at 20% 20%, ${color}88, transparent 34%), linear-gradient(135deg, ${color}, #0f172a 62%, #020617)`;

    animateNumber(profileLevel, profile.level || 1, 520);
    animateNumber(profileShards, profile.shards || 0, 950);
    animateNumber(profileTotalMessages, stats.total_messages || 0, 650);
    profileXpText.textContent = `${profile.xp || 0} XP`;
    profileNextXpText.textContent = `Next ${profile.next_level_xp || 100} XP`;
    profileLevelFill.style.width = `${Math.max(0, Math.min(100, profile.level_progress || 0))}%`;
    profileLevelFill.style.background = `linear-gradient(90deg, ${color}, #ec4899)`;

    profileJoinDate.textContent = formatProfileDate(profile.created_at);
    profileLastActive.textContent = profile.online ? 'Şu an aktif' : formatProfileDateTime(profile.last_active || profile.last_seen);
    profileFavoriteEgg.textContent = profile.favorite_egg || '/serbia';

    profileBadges.innerHTML = '';
    (profile.badges || []).forEach((badge) => {
      const item = document.createElement('div');
      const rarity = badgeRarity(badge);
      item.className = `profile-badge badges-v2-showcase rarity-${rarity}`;
      item.title = badge.description || '';
      item.innerHTML = `<span>${escapeHtml(badge.icon || '🏆')}</span><div><strong>${escapeHtml(badge.name || 'Badge')}</strong><small>${escapeHtml(badge.description || '')}</small><em>${escapeHtml(badgeCategoryLabel(badge))}</em></div><label>${rarityLabel(rarity)}</label>`;
      item.onclick = () => alert(`${badge.icon || '🏆'} ${badge.name}\n${rarityLabel(rarity)} · ${badgeCategoryLabel(badge)}\n\n${badge.description || ''}`);
      profileBadges.appendChild(item);
    });

    const isMe = Number(profile.id) === Number(user.id);
    renderProfileAbout(profile, stats, isMe);
    loadProfileActivity(profile.id);
    syncProfileActionState(profile, isMe);
    renderAllBadgesPanel(profile, isMe);
    if (profileAllBadgesPanel) profileAllBadgesPanel.classList.add('hidden');
    profileEditPanel.classList.toggle('hidden', !isMe);

    if (isMe) {
      profileBioInput.value = profile.bio || '';
      profileColorInput.value = color;
      profileFavoriteEggSelect.value = profile.favorite_egg || '/serbia';
      profileCoverInput.value = '';
      refreshProfileCoverFileName();
    }

    refreshProfileCoverFileName();
    profileModal.classList.remove('hidden');
    if (profileCardV2) profileCardV2.scrollTop = 0;
    if (isMe) checkForUnlockedBadges(true);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function closeProfile() {
  profileModal.classList.add('hidden');
  resetProfileParallax();
}

async function openProfileDmFromCard() {
  const targetId = Number(profileMessageButton?.dataset.userId || 0);
  if (!Number.isInteger(targetId) || !targetId) return;
  const friend = findFriendById(targetId);
  if (!friend) {
    addSystemMessage('DM açmak için önce arkadaş olmanız gerekiyor.');
    return;
  }
  closeProfile();
  await openDm(friend);
}

async function sendFriendRequestFromCard() {
  const username = String(profileFriendButton?.dataset.username || '').trim();
  if (!username) return;
  try {
    await api('/api/friends/request', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    addSystemMessage('Arkadaş isteği gönderildi.');
    profileFriendButton.disabled = true;
    profileFriendButton.textContent = 'İstek gönderildi';
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function saveBio() {
  try {
    let coverData = '';
    const coverFile = profileCoverInput?.files?.[0] || null;
    if (coverFile) coverData = await resizeImage(coverFile, 1200);

    const bioData = await api('/api/profile/bio', {
      method: 'POST',
      body: JSON.stringify({ bio: profileBioInput.value })
    });

    const data = await api('/api/profile/v2', {
      method: 'POST',
      body: JSON.stringify({
        coverData,
        profileColor: profileColorInput.value,
        favoriteEgg: profileFavoriteEggSelect.value
      })
    });

    user = { ...bioData.user, ...data.user };
    localStorage.setItem('chat_user', JSON.stringify(user));
    addSystemMessage('Profil kartı güncellendi.');
    await checkForUnlockedBadges(true);
    openProfile(user.id);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function removeProfileCover() {
  try {
    const data = await api('/api/profile/cover', { method: 'DELETE' });
    user = data.user;
    localStorage.setItem('chat_user', JSON.stringify(user));
    addSystemMessage('Profil kapağı kaldırıldı.');
    refreshProfileCoverFileName();
    await checkForUnlockedBadges(true);
    openProfile(user.id);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function updateMentionSuggestions() {
  if (chatMode !== 'room') {
    hideMentionPopup();
    return;
  }

  const value = messageInput.value;
  const cursor = messageInput.selectionStart;
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/(^|\s)@([a-zA-Z0-9_ğüşöçıİĞÜŞÖÇ.\-]*)$/);

  if (!match) {
    hideMentionPopup();
    return;
  }

  const query = match[2].toLowerCase();
  const base = roomMembers.filter((member) => member.id !== user.id);
  mentionCandidates = [
    { username: 'everyone', avatar_url: null },
    ...base
  ].filter((member) => member.username.toLowerCase().includes(query)).slice(0, 6);

  selectedMentionIndex = 0;

  if (mentionCandidates.length === 0) {
    hideMentionPopup();
    return;
  }

  renderMentionPopup();
}

function renderMentionPopup() {
  mentionPopup.innerHTML = '';

  mentionCandidates.forEach((member, index) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = `mention-item ${index === selectedMentionIndex ? 'active' : ''}`;
    item.innerHTML = `${avatarHtml(member.username, member.avatar_url)}<span>@${escapeHtml(member.username)}</span>`;
    item.onclick = () => applyMention(index);
    mentionPopup.appendChild(item);
  });

  const rect = messageInput.getBoundingClientRect();
  mentionPopup.style.left = `${rect.left}px`;
  mentionPopup.style.bottom = `${window.innerHeight - rect.top + 8}px`;
  mentionPopup.classList.remove('hidden');
}

function applyMention(index) {
  const member = mentionCandidates[index];
  if (!member) return;

  const value = messageInput.value;
  const cursor = messageInput.selectionStart;
  const beforeCursor = value.slice(0, cursor);
  const afterCursor = value.slice(cursor);
  const replaced = beforeCursor.replace(/(^|\s)@([a-zA-Z0-9_ğüşöçıİĞÜŞÖÇ.\-]*)$/, `$1@${member.username} `);

  messageInput.value = replaced + afterCursor;
  const newCursor = replaced.length;
  messageInput.setSelectionRange(newCursor, newCursor);
  hideMentionPopup();
  messageInput.focus();
}

function hideMentionPopup() {
  mentionPopup.classList.add('hidden');
  mentionCandidates = [];
}

function presenceIcon(status = 'online') {
  const icons = { online: '🟢', idle: '🌙', dnd: '⛔', invisible: '👻' };
  return icons[String(status || 'online').toLowerCase()] || '🟢';
}

function presenceLabel(status = 'online') {
  const labels = { online: 'Aktif', idle: 'Boşta', dnd: 'Rahatsız Etmeyin', invisible: 'Görünmez' };
  return labels[String(status || 'online').toLowerCase()] || 'Aktif';
}

function storyActive(profile) {
  if (!profile?.story_text || !profile?.story_expires_at) return false;
  return new Date(profile.story_expires_at).getTime() > Date.now();
}

function formatPresence(profile) {
  const status = String(profile?.presence_status || 'online').toLowerCase();
  if (profile?.online && status !== 'invisible') {
    const custom = String(profile.custom_status || '').trim();
    return `${presenceIcon(status)} ${presenceLabel(status)}${custom ? ' · ' + custom : ''}`;
  }

  if (!profile.last_seen) return 'Son görülme yok';

  const date = new Date(profile.last_seen);
  return `Son görülme: ${date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
}

function roomPresenceLine(profile) {
  const status = String(profile?.presence_status || 'online').toLowerCase();
  const custom = String(profile?.custom_status || '').trim();
  return `${presenceIcon(status)} ${presenceLabel(status)}${custom ? ' · ' + custom : ''}`;
}

function roleLabel(role = 'üye') {
  const clean = String(role || 'üye').toLowerCase();
  if (clean === 'owner') return 'Owner';
  if (clean === 'admin') return 'Admin';
  if (clean === 'mod') return 'Mod';
  return 'Üye';
}

function roleClass(role = 'member') {
  const clean = String(role || 'member').toLowerCase();
  if (clean === 'owner') return 'role-owner';
  if (clean === 'admin') return 'role-admin';
  if (clean === 'mod') return 'role-mod';
  return 'role-member';
}

function onlineStatusMeta(profile) {
  const status = String(profile?.presence_status || 'online').toLowerCase();
  return {
    status,
    icon: presenceIcon(status),
    label: presenceLabel(status),
    custom: String(profile?.custom_status || '').trim(),
    story: storyActive(profile) ? String(profile?.story_text || '').trim() : ''
  };
}


async function loadGroups() {
  try {
    const data = await api('/api/groups');
    groups = data.groups || [];
    renderGroups();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function renderGroups() {
  if (!groupsList) return;
  groupsList.innerHTML = '';

  if (!groups.length) {
    groupsList.innerHTML = '<div class="mini-item">Grup yok.</div>';
    return;
  }

  groups.forEach((group) => {
    const item = document.createElement('div');
    item.className = 'mini-item conversation-item';
    item.dataset.conversationType = 'group';
    item.dataset.groupId = group.id;
    item.innerHTML = `<div class="mini-left">${avatarHtml(group.name, group.avatar_url)}<div><strong>${escapeHtml(group.name)}</strong><span>${group.member_count} üye • ${group.my_role}</span></div></div>`;
    item.onclick = () => openGroup(group);
    groupsList.appendChild(item);
  });
  markActiveConversation();
}

function renderNewGroupFriends() {
  if (!newGroupFriendsList) return;
  newGroupFriendsList.innerHTML = '';

  if (!Array.isArray(friends) || !friends.length) {
    newGroupFriendsList.innerHTML = '<div class="mini-item">Grup kurmak için önce arkadaş ekle.</div>';
    return;
  }

  friends.forEach((friend) => {
    const item = document.createElement('label');
    item.className = 'mini-item selectable-row';
    item.innerHTML = `<div class="mini-left">${avatarHtml(friend.username, friend.avatar_url)}<div><strong>${escapeHtml(friend.username)}</strong><span>Gruba ekle</span></div></div><input type="checkbox">`;

    const checkbox = item.querySelector('input');
    checkbox.checked = selectedGroupFriendIds.has(friend.id);
    checkbox.onchange = () => {
      if (checkbox.checked) selectedGroupFriendIds.add(friend.id);
      else selectedGroupFriendIds.delete(friend.id);
    };

    newGroupFriendsList.appendChild(item);
  });
}

async function createGroup() {
  const name = newGroupNameInput.value.trim();
  if (!name) {
    addSystemMessage('Grup adı yaz.');
    return;
  }

  try {
    const data = await api('/api/groups', {
      method: 'POST',
      body: JSON.stringify({
        name,
        memberIds: Array.from(selectedGroupFriendIds)
      })
    });

    newGroupNameInput.value = '';
    selectedGroupFriendIds.clear();
    await loadGroups();
    renderNewGroupFriends();
    openGroup(data.group);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function openGroup(group) {
  if (!groupsPanel) {
    addSystemMessage('Grup paneli HTML içinde yok. public/index.html dosyasını da güncelle.');
    return;
  }

  clearReply();
  activeGroup = group;
  activeFriend = null;
  chatMode = 'group';
  document.body.dataset.chatMode = 'group';

  roomModeButton.classList.remove('active');
  dmModeButton.classList.remove('active');
  if (groupModeButton) groupModeButton.classList.add('active');

  roomPanel.classList.add('hidden');
  friendsPanel.classList.add('hidden');
  groupsPanel.classList.remove('hidden');

  chatTitle.textContent = `Grup: ${group.name}`;
  messagesEl.innerHTML = '';
  resetMessageGrouping();
  typingText.textContent = '';
  updateMessengerUi();
  markActiveConversation();

  if (window.innerWidth <= 760) document.body.classList.remove('mobile-sidebar-open');
  if (socket && socket.connected) socket.emit('group_join', { groupId: group.id });

  await loadGroupMessages(group.id);
  await loadGroupDetails(group.id);
  updateMessengerUi();
  markActiveConversation();
}

async function loadGroupMessages(groupId) {
  try {
    const data = await api(`/api/groups/${groupId}/messages`);
    messagesEl.innerHTML = '';
    resetMessageGrouping();
    if (!(data.messages || []).length) addSystemMessage('Bu grupta henüz mesaj yok. İlk mesajı sen gönder.');
    (data.messages || []).forEach(addGroupMessage);
    scrollToBottom();
    updateMessengerUi();
    markActiveConversation();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function loadGroupDetails(groupId) {
  try {
    const data = await api(`/api/groups/${groupId}`);
    activeGroup = data.group;
    groupMembers = data.members || [];
    if (!groupDetailsBox) return;
    groupDetailsBox.classList.remove('hidden');

    activeGroupInfo.innerHTML = `<div class="mini-item"><div class="mini-left">${avatarHtml(activeGroup.name, activeGroup.avatar_url)}<div><strong>${escapeHtml(activeGroup.name)}</strong><span>${activeGroup.member_count} üye • rolün: ${activeGroup.my_role}</span></div></div></div>`;

    renderGroupMembers();
    renderAddGroupFriends();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function renderGroupMembers() {
  groupMembersList.innerHTML = '';

  const myMember = groupMembers.find((m) => m.id === user.id);
  const canManage = myMember && ['owner', 'admin'].includes(myMember.role);

  groupMembers.forEach((member) => {
    const item = document.createElement('div');
    item.className = 'mini-item';
    item.innerHTML = `<div class="mini-left">${avatarHtml(member.display_name || member.username, member.avatar_url)}<div><strong>${escapeHtml(member.display_name || member.username)}</strong><span>${member.role} • ${member.online ? 'Çevrimiçi' : 'Çevrimdışı'}</span></div></div>`;

    const actions = document.createElement('div');
    actions.className = 'mini-actions';

    if (activeGroup.my_role === 'owner' && member.role !== 'owner') {
      const roleBtn = document.createElement('button');
      roleBtn.className = 'action-button gray';
      roleBtn.textContent = member.role === 'admin' ? 'Admin al' : 'Admin yap';
      roleBtn.onclick = () => setGroupRole(member.id, member.role === 'admin' ? 'member' : 'admin');
      actions.appendChild(roleBtn);
    }

    if (canManage && member.id !== user.id && member.role !== 'owner') {
      const remove = document.createElement('button');
      remove.className = 'action-button red';
      remove.textContent = 'Çıkar';
      remove.onclick = () => removeGroupMember(member.id);
      actions.appendChild(remove);
    }

    item.appendChild(actions);
    groupMembersList.appendChild(item);
  });
}

function renderAddGroupFriends() {
  addGroupFriendList.innerHTML = '';

  const canManage = ['owner', 'admin'].includes(activeGroup?.my_role);
  if (!canManage) {
    addGroupFriendList.innerHTML = '<div class="mini-item">Üye eklemek için grup admini olmalısın.</div>';
    return;
  }

  const memberIds = new Set(groupMembers.map((m) => m.id));
  const addable = friends.filter((f) => !memberIds.has(f.id));

  if (!addable.length) {
    addGroupFriendList.innerHTML = '<div class="mini-item">Eklenebilecek arkadaş yok.</div>';
    return;
  }

  addable.forEach((friend) => {
    const item = document.createElement('div');
    item.className = 'mini-item';
    item.innerHTML = `<div class="mini-left">${avatarHtml(friend.username, friend.avatar_url)}<div><strong>${escapeHtml(friend.username)}</strong><span>Gruba ekle</span></div></div>`;

    const add = document.createElement('button');
    add.className = 'action-button';
    add.textContent = 'Ekle';
    add.onclick = () => addGroupMember(friend.id);

    item.appendChild(add);
    addGroupFriendList.appendChild(item);
  });
}

async function addGroupMember(userId) {
  try {
    await api(`/api/groups/${activeGroup.id}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    await loadGroupDetails(activeGroup.id);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function removeGroupMember(userId) {
  if (!confirm('Bu kişiyi gruptan çıkarmak istiyor musun?')) return;

  try {
    await api(`/api/groups/${activeGroup.id}/members/${userId}`, { method: 'DELETE' });
    await loadGroupDetails(activeGroup.id);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function setGroupRole(userId, role) {
  try {
    await api(`/api/groups/${activeGroup.id}/members/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
    await loadGroupDetails(activeGroup.id);
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function leaveGroup() {
  if (!activeGroup) return;
  if (!confirm('Gruptan çıkmak istiyor musun?')) return;

  try {
    await api(`/api/groups/${activeGroup.id}/members/${user.id}`, { method: 'DELETE' });
    activeGroup = null;
    groupDetailsBox.classList.add('hidden');
    messagesEl.innerHTML = '';
    chatTitle.textContent = 'Grup seç';
    await loadGroups();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

async function changeGroupAvatar() {
  const file = groupAvatarInput.files?.[0];
  if (!file || !activeGroup) return;

  try {
    const avatar = await resizeImageToDataUrl(file, 256, 256, 0.82);
    await api(`/api/groups/${activeGroup.id}/avatar`, {
      method: 'POST',
      body: JSON.stringify({ avatar_url: avatar })
    });
    await loadGroupDetails(activeGroup.id);
    await loadGroups();
  } catch (error) {
    addSystemMessage(error.message);
  } finally {
    groupAvatarInput.value = '';
  }
}

async function removeGroupAvatar() {
  if (!activeGroup) return;

  try {
    await api(`/api/groups/${activeGroup.id}/avatar`, { method: 'DELETE' });
    await loadGroupDetails(activeGroup.id);
    await loadGroups();
  } catch (error) {
    addSystemMessage(error.message);
  }
}

function addGroupMessage(message) {
  addMessage({
    type: 'group',
    id: message.id,
    user_id: message.sender_id,
    sender_id: message.sender_id,
    username: message.display_name || message.username,
    avatar_url: message.avatar_url,
    text: message.text,
    message_type: message.message_type,
    file_name: message.file_name,
    file_mime: message.file_mime,
    file_data: message.file_data,
    file_path: message.file_path,
    file_size: message.file_size,
    reply_to_id: message.reply_to_id,
    reply_username: message.reply_display_name || message.reply_username,
    reply_text: message.reply_text,
    time: message.time || formatTime(message.created_at),
    mine: Number(message.sender_id) === Number(user.id),
    edited: message.edited_at,
    deleted: message.deleted_at,
    bubble_theme: message.bubble_theme || message.active_bubble_theme || (Number(message.sender_id || message.user_id) === Number(user.id) ? user?.active_bubble_theme : ''),
    name_effect: message.name_effect,
    frame_theme: message.frame_theme || message.active_profile_frame
  });
}




/* 5ECROPOLIS EASTER EGGS */

let fiveEggTimeout = null;
let fiveEggSafetyTimeout = null;
const FIVE_EGG_COMMANDS = ['/serbia', '/limbo', '/vertex', '/rome', '/egypt', '/anitkabir', '/cat', '/reset', '/rift', '/5ecropolis', '/selim', '/xara', '/nico', '/yasin', '/jung', '/fetullah', '/blake', '/feiz', '/pnico', '/pyasin', '/ataturk'];

function getFiveEggLayer() {
  let layer = document.getElementById('fiveEggLayer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'fiveEggLayer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
  }
  layer.classList.remove('hidden');
  layer.style.display = 'grid';
  layer.style.opacity = '1';
  return layer;
}

function clearFiveEggClasses() {
  clearTimeout(fiveEggTimeout);
  clearTimeout(fiveEggSafetyTimeout);
  fiveEggTimeout = null;
  fiveEggSafetyTimeout = null;

  Array.from(document.body.classList)
    .filter((cls) => cls.startsWith('egg-'))
    .forEach((cls) => document.body.classList.remove(cls));

  const layer = document.getElementById('fiveEggLayer');
  if (layer) {
    layer.innerHTML = '';
    layer.classList.add('hidden');
    layer.style.display = 'none';
    layer.style.opacity = '0';
    layer.remove();
  }
}

function scheduleFiveEggClear(ms = 3800) {
  clearTimeout(fiveEggTimeout);
  clearTimeout(fiveEggSafetyTimeout);

  const safeMs = Math.max(1200, Math.min(Number(ms) || 3800, 5200));
  fiveEggTimeout = setTimeout(clearFiveEggClasses, safeMs);

  // Sert güvenlik: CSS animasyonu takılsa bile kapanır.
  fiveEggSafetyTimeout = setTimeout(clearFiveEggClasses, safeMs + 900);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearFiveEggClasses();
});

window.addEventListener('blur', () => {
  setTimeout(clearFiveEggClasses, 800);
});

document.addEventListener('keydown' , (event) => {
  if (event.key === 'Escape') clearFiveEggClasses();
});

function normalizeFiveEggText(value) {
  return String(value || '').trim().toLowerCase().split(/\s+/)[0];
}

function runFiveEgg(command, username = '') {
  const settings = getLocalSettings();
  if (!settings.eggsEnabled) return false;

  const normalized = normalizeFiveEggText(command);

  if (settings.eggSound) playUiBeep('egg');

  clearFiveEggClasses();
  const layer = getFiveEggLayer();

  if (normalized === '/serbia') {
    document.body.classList.add('egg-serbia');
    layer.innerHTML = `
      <div class="egg-portal-ring"></div>
      <div class="egg-portal-core"></div>
      <div class="egg-portal-text">SERBIA GATE OPENED</div>
      <div class="egg-portal-sub">5ECROPOLIS anomaly detected</div>
    `;
    addSystemMessage(`🌀 ${username ? username + ' ' : ''}Sırbistan kapısını açtı. Frekans değişiyor...`);
    scheduleFiveEggClear(4200);
    return true;
  }

  if (normalized === '/limbo') {
    document.body.classList.add('egg-limbo');
    layer.innerHTML = `
      <div class="egg-limbo-text">LIMBO</div>
      <div class="egg-limbo-sub">sesler kesildi · gerçeklik askıya alındı</div>
    `;
    addSystemMessage(`◼ ${username ? username + ' ' : ''}Limbo'ya düştü. Ekran birkaç saniyeliğine kararıyor...`);
    scheduleFiveEggClear(3600);
    return true;
  }

  if (normalized === '/vertex') {
    document.body.classList.add('egg-vertex');
    layer.innerHTML = `
      <div class="egg-vertex-text" data-text="VERTEX">VERTEX</div>
      <div class="egg-vertex-sub">red universe breach</div>
    `;
    addSystemMessage(`🔴 VERTEX aktifleşti. Kırmızı evren çatlağı açılıyor...`);
    scheduleFiveEggClear(3600);
    return true;
  }

  if (normalized === '/rome') {
    document.body.classList.add('egg-rome');
    layer.innerHTML = `
      <div class="egg-rome-emblem">Ⅴ</div>
      <div class="egg-rome-text">ROMA PROTOKOLÜ</div>
      <div class="egg-rome-sub">kurallara uymayanlar yüksek yapıya çıkarılır</div>
    `;
    addFiveSystemMessage('rome', `🏛️ ROMA PROTOKOLÜ: Kurallar değişti. Saçlar tıraş edildi, simülasyon yeniden yazıldı.`);
    scheduleFiveEggClear(4200);
    return true;
  }


  if (normalized === '/egypt') {
    document.body.classList.add('egg-egypt');
    layer.innerHTML = `
      <div class="egg-sand"></div>
      <div class="egg-egypt-sun"></div>
      <div class="egg-pyramid egg-pyramid-left"></div>
      <div class="egg-pyramid egg-pyramid-right"></div>
      <div class="egg-egypt-text">EGYPT DESERT</div>
      <div class="egg-egypt-sub">the monument rises from the sand</div>
    `;
    addSystemMessage(`𓂀 ${username ? username + ' ' : ''}Mısır çölünü yükledi. Kumlar Anıtkabir'in gölgesini saklıyor...`);
    scheduleFiveEggClear(4300);
    return true;
  }

  if (normalized === '/anitkabir') {
    document.body.classList.add('egg-anitkabir');
    layer.innerHTML = `
      <div class="egg-anitkabir-horizon"></div>
      <div class="egg-anitkabir-pillars"></div>
      <div class="egg-anitkabir-text">ANITKABIR RISING</div>
      <div class="egg-anitkabir-sub">dimension memory restored</div>
    `;
    addSystemMessage(`🇹🇷 Anıtkabir boyut hafızasından yükseldi. Simülasyon saygı moduna geçti.`);
    scheduleFiveEggClear(4400);
    return true;
  }

  if (normalized === '/cat') {
    document.body.classList.add('egg-cat');
    layer.innerHTML = `
      <div class="egg-cat-pack">
        <span>🐈</span><span>🐈‍⬛</span><span>🐈</span><span>🐈‍⬛</span><span>🐈</span>
      </div>
      <div class="egg-cat-text">THE CATS ARE WATCHING</div>
      <div class="egg-cat-sub">kaçış reddedildi · simülasyona geri dön</div>
    `;
    addSystemMessage(`🐈 Kediler devreye girdi. Kaçış yolu kapandı.`);
    scheduleFiveEggClear(3800);
    return true;
  }

  if (normalized === '/reset') {
    document.body.classList.add('egg-reset');
    layer.innerHTML = `
      <div class="egg-reset-button">RESET</div>
      <div class="egg-reset-text">GENRE CHANGED</div>
      <div class="egg-reset-sub">dramadan absürt bilimkurguya geçildi</div>
    `;
    addSystemMessage(`⏱️ Sıfırlama düğmesine basıldı. Evren tür değiştirdi.`);
    scheduleFiveEggClear(3600);
    return true;
  }

  if (normalized === '/rift') {
    document.body.classList.add('egg-rift');
    layer.innerHTML = `
      <div class="egg-rift-line"></div>
      <div class="egg-rift-text">RED RIFT</div>
      <div class="egg-rift-sub">parallel universe bleeding through</div>
    `;
    addSystemMessage(`🩸 Kırmızı yarık açıldı. Paralel evren sızıyor...`);
    scheduleFiveEggClear(3800);
    return true;
  }

  if (normalized === '/5ecropolis') {
    document.body.classList.add('egg-5ecropolis');
    layer.innerHTML = `
      <div class="egg-five-logo">5</div>
      <div class="egg-five-text">5ECROPOLIS</div>
      <div class="egg-five-sub">all universes reserved</div>
    `;
    addSystemMessage(`Ⅴ 5ECROPOLIS protokolü aktif. Tüm evrenler senkronize ediliyor.`);
    scheduleFiveEggClear(4400);
    return true;
  }



  if (normalized === '/selim') {
    document.body.classList.add('egg-selim');
    layer.innerHTML = `
      <div class="egg-selim-pixels"></div>
      <div class="egg-selim-text">SELIM</div>
      <div class="egg-selim-sub">red pixels scattered across the simulation</div>
    `;
    addSystemMessage(`🧩 Selim antivirüs tarafından kırmızı piksellere ayrıldı.`);
    scheduleFiveEggClear(3900);
    return true;
  }

  if (normalized === '/xara') {
    document.body.classList.add('egg-xara');
    layer.innerHTML = `
      <div class="egg-xara-core"></div>
      <div class="egg-xara-orbit egg-xara-orbit-1"></div>
      <div class="egg-xara-orbit egg-xara-orbit-2"></div>
      <div class="egg-xara-text">XARA</div>
      <div class="egg-xara-sub">the reset button changed the genre</div>
    `;
    addSystemMessage(`✨ Xara sahneye girdi. Zaman değil, tür sıfırlandı.`);
    scheduleFiveEggClear(4100);
    return true;
  }

  if (normalized === '/nico') {
    document.body.classList.add('egg-nico');
    layer.innerHTML = `
      <div class="egg-nico-trail"></div>
      <div class="egg-nico-star egg-nico-star-1"></div>
      <div class="egg-nico-star egg-nico-star-2"></div>
      <div class="egg-nico-star egg-nico-star-3"></div>
      <div class="egg-nico-text">NICO</div>
      <div class="egg-nico-sub">crossing dimensions with cold-blooded calm</div>
    `;
    addSystemMessage(`❄️ Nico boyutlar arasında sessizce kaydı.`);
    scheduleFiveEggClear(3900);
    return true;
  }

  if (normalized === '/yasin') {
    document.body.classList.add('egg-yasin');
    layer.innerHTML = `
      <div class="egg-yasin-petal egg-yasin-petal-1"></div>
      <div class="egg-yasin-petal egg-yasin-petal-2"></div>
      <div class="egg-yasin-petal egg-yasin-petal-3"></div>
      <div class="egg-yasin-text">YASIN MENEKŞE</div>
      <div class="egg-yasin-sub">violet signal spreading through the portal noise</div>
    `;
    addSystemMessage(`🟣 Yasin Menekşe sinyali yayıldı. Portal gürültüsü mora döndü.`);
    scheduleFiveEggClear(4100);
    return true;
  }

  if (normalized === '/jung') {
    document.body.classList.add('egg-jung');
    layer.innerHTML = `
      <div class="egg-jung-wave"></div>
      <div class="egg-jung-wave egg-jung-wave-2"></div>
      <div class="egg-jung-text">JUNG BLAKE</div>
      <div class="egg-jung-sub">bassline from another universe detected</div>
    `;
    addSystemMessage(`🎧 Jung Blake frekansı vurdu. Evren bass ile titriyor.`);
    scheduleFiveEggClear(3900);
    return true;
  }

  if (normalized === '/fetullah') {
    document.body.classList.add('egg-fetullah');
    layer.innerHTML = `
      <div class="egg-fetullah-eye"></div>
      <div class="egg-fetullah-rays"></div>
      <div class="egg-fetullah-text">FETULLAH</div>
      <div class="egg-fetullah-sub">oracle mode enabled · the simulation is preaching</div>
    `;
    addSystemMessage(`👁️ Fetullah ortaya çıktı. Simülasyon vahiy moduna geçti.`);
    scheduleFiveEggClear(4200);
    return true;
  }


  if (normalized === '/blake') {
    document.body.classList.add('egg-blake');
    layer.innerHTML = `
      <div class="egg-blake-grid"></div>
      <div class="egg-blake-crown">♛</div>
      <div class="egg-blake-text">YUNG BLAKE</div>
      <div class="egg-blake-sub">underground frequency from the red universe</div>
    `;
    addSystemMessage(`♛ Yung Blake sahneye indi. Kırmızı evren trap frekansına geçti.`);
    scheduleFiveEggClear(4100);
    return true;
  }

  if (normalized === '/feiz') {
    document.body.classList.add('egg-feiz');
    layer.innerHTML = `
      <div class="egg-feiz-bot">FEIZ</div>
      <div class="egg-feiz-scan"></div>
      <div class="egg-feiz-text">FEIZ ONLINE</div>
      <div class="egg-feiz-sub">ai anomaly connected to the chat core</div>
    `;
    addSystemMessage(`🤖 feiz bağlandı. Chat çekirdeği yapay zekâ moduna geçti.`);
    scheduleFiveEggClear(3900);
    return true;
  }

  if (normalized === '/pnico') {
    document.body.classList.add('egg-pnico');
    layer.innerHTML = `
      <div class="egg-parallel-split"></div>
      <div class="egg-pnico-ghost egg-pnico-ghost-1">NICO</div>
      <div class="egg-pnico-ghost egg-pnico-ghost-2">NICO</div>
      <div class="egg-pnico-text">PARALLEL NICO</div>
      <div class="egg-pnico-sub">same face · different universe</div>
    `;
    addSystemMessage(`🧊 Paralel Nico görüldü. Aynı kişi, başka frekans.`);
    scheduleFiveEggClear(4100);
    return true;
  }

  if (normalized === '/pyasin') {
    document.body.classList.add('egg-pyasin');
    layer.innerHTML = `
      <div class="egg-pyasin-mirror"></div>
      <div class="egg-pyasin-flower">✦</div>
      <div class="egg-pyasin-text">PARALLEL YASIN MENEKŞE</div>
      <div class="egg-pyasin-sub">violet signal inverted through the mirror dimension</div>
    `;
    addSystemMessage(`🟪 Paralel Yasin Menekşe aynadan geçti. Menekşe sinyali tersine döndü.`);
    scheduleFiveEggClear(4300);
    return true;
  }

  if (normalized === '/ataturk') {
    document.body.classList.add('egg-ataturk');
    layer.innerHTML = `
      <div class="egg-ataturk-sun">☀</div>
      <div class="egg-ataturk-line"></div>
      <div class="egg-ataturk-text">ATATÜRK</div>
      <div class="egg-ataturk-sub">cumhuriyet frekansı · saygı modu</div>
    `;
    addSystemMessage(`🇹🇷 Atatürk protokolü aktif. Simülasyon saygı moduna geçti.`);
    scheduleFiveEggClear(4400);
    return true;
  }

  return false;
}

function maybeRunFiveEggFromMessage(message) {
  const command = normalizeFiveEggText(message?.text);
  if (!FIVE_EGG_COMMANDS.includes(command)) return false;

  const username = message?.username || message?.sender_username || message?.display_name || '';
  if (getLocalSettings().eggOwnOnly) {
    const myNames = [user?.username, user?.display_name].filter(Boolean).map((v) => String(v).toLowerCase());
    if (!myNames.includes(String(username || '').toLowerCase())) return false;
  }

  return runFiveEgg(command, username);
}

function addFiveSystemMessage(kind, message) {
  const div = document.createElement('div');
  div.className = `message system five-system five-system-${kind}`;
  div.textContent = message;
  messagesEl.appendChild(div);
  if (wasNearBottom || mine) scrollToBottom();
  else updateScrollBottomButton();
}


function addSystemMessage(message) {
  const div = document.createElement('div');
  div.className = 'message system';
  div.textContent = message;
  messagesEl.appendChild(div);
  if (wasNearBottom || mine) scrollToBottom();
  else updateScrollBottomButton();
}

function avatarHtml(username, avatarUrl, className = 'mini-avatar') {
  if (avatarUrl) return `<img class="${className}" src="${avatarUrl}" alt="">`;
  return `<div class="${className}">${escapeHtml(String(username || '?').charAt(0).toUpperCase())}</div>`;
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
  updateScrollBottomButton();
}

function formatTime(dateString) {
  try {
    return new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}


function playUiBeep(kind = 'notify') {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const isEgg = kind === 'egg';
    osc.type = isEgg ? 'sawtooth' : 'sine';
    osc.frequency.value = isEgg ? 160 : 720;
    gain.gain.value = isEgg ? 0.035 : 0.025;

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (isEgg ? 0.22 : 0.12));
    osc.stop(ctx.currentTime + (isEgg ? 0.24 : 0.14));
  } catch {}
}

function notificationAllowed(title) {
  const settings = getLocalSettings();
  const t = String(title || '').toLowerCase();

  if (t.includes('dm') && !t.includes('grup') && !settings.notifyDm) return false;
  if ((t.includes('grup') || t.includes('group')) && !settings.notifyGroup) return false;
  if ((t.includes('etiket') || t.includes('@everyone')) && !settings.notifyMention) return false;
  if (t.includes('arkadaş') && !settings.notifyFriend) return false;

  return true;
}


function showBrowserNotification(title, body) {
  if (!notificationAllowed(title)) return;
  if (getLocalSettings().notificationSound) playUiBeep('notify');
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body });
}

function escapeHtml(text) {
  return String(text || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function resizeImage(file, maxSize) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height && width > maxSize) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };

      img.onerror = reject;
      img.src = reader.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}





function updateStoryDecisionCards(data) {
  const decision = data?.decision || data;
  if (!decision) return;
  const cachedVote = storyVoteCache.get(String(decision.id || ''));
  if (cachedVote && !decision.voted_by_me) decision.voted_by_me = cachedVote;
  document.querySelectorAll('.story-message-card').forEach((card) => {
    const fresh = renderStoryDecisionMessage(decision);
    card.replaceWith(fresh);
  });
}



function renderInventory(data = {}) {
  const items = Array.isArray(data.items) ? data.items : [];
  const pet = data.companion || {};
  const pets = data.pets || {};
  const balance = Number(data.balance ?? user?.shards ?? 0);

  if (data.balance !== undefined && user) {
    user.shards = balance;
    localStorage.setItem('chat_user', JSON.stringify(user));
    if (gamifyStats) gamifyStats.textContent = `Level ${user.level || 1} · ${balance} Shards`;
  }

  if (inventoryItemsList) {
    const nonPetItems = items.filter((item) => !String(item.item_key || item.item_id || '').startsWith('pet_'));
    inventoryItemsList.innerHTML = nonPetItems.length
      ? nonPetItems.map((item) => `<div class="inventory-item-card"><span>🎒</span><div><strong>${escapeHtml(item.item_name || item.item_id)}</strong><small>${escapeHtml(item.item_key || item.item_id || '')} · ×${Number(item.quantity || 0)}</small></div></div>`).join('')
      : '<div class="mini-item">Henüz normal item yok. Eventlere katıl, lootbox aç veya hikaye oyu ver.</div>';
  }

  if (inventoryCompanionBox) {
    const petOptions = Object.entries(pets).map(([key, def]) => {
      const owned = Boolean(def.owned);
      const active = pet.pet_type === key;
      const price = Number(def.price || 0);
      const canBuy = balance >= price;
      const label = active ? 'Aktif' : owned ? 'Seç' : `${price} Shards`;
      return `<button class="pet-choice ${active ? 'active' : ''} ${!owned && !canBuy ? 'locked' : ''}" data-pet-type="${escapeHtml(key)}" type="button" ${active ? 'disabled' : ''}>
        <span class="pet-choice-icon">${escapeHtml(def.icon)}</span>
        <span class="pet-choice-copy">
          <b>${escapeHtml(def.name)}</b>
          <small>${owned ? 'Sahip' : 'Satın al'} · ${escapeHtml(def.desc || '')}</small>
        </span>
        <em>${escapeHtml(label)}</em>
      </button>`;
    }).join('');

    inventoryCompanionBox.innerHTML = `
      <div class="pet-wallet">Shards: <b>${balance.toLocaleString('tr-TR')}</b></div>
      <div class="pet-main">
        <div class="pet-orb">${escapeHtml(pet.icon || '🐈‍⬛')}</div>
        <div>
          <strong>${escapeHtml(pet.pet_name || 'Companion')}</strong>
          <span>Level ${Number(pet.level || 1)} · mood: ${escapeHtml(pet.mood || 'curious')}</span>
        </div>
      </div>
      <div class="pet-xp"><div style="width:${Math.max(0, Math.min(100, Number(pet.progress || 0)))}%"></div></div>
      <div class="pet-meta"><span>${Number(pet.xp || 0)} XP</span><span>Next ${Number(pet.next_xp || 0)} XP</span></div>
      <div class="pet-choices pet-shop">${petOptions}</div>
    `;

    inventoryCompanionBox.querySelectorAll('[data-pet-type]').forEach((button) => {
      button.addEventListener('click', () => selectCompanion(button.dataset.petType));
    });
  }
}

async function loadInventory() {
  if (!inventoryItemsList && !inventoryCompanionBox) return;
  if (inventoryItemsList) inventoryItemsList.innerHTML = '<div class="mini-item">Envanter yükleniyor...</div>';
  if (inventoryCompanionBox) inventoryCompanionBox.innerHTML = '<p>Companion yükleniyor...</p>';
  try {
    const data = await api('/api/inventory/me');
    renderInventory(data);
  } catch (error) {
    if (inventoryItemsList) inventoryItemsList.innerHTML = `<div class="mini-item">${escapeHtml(error.message)}</div>`;
  }
}


function renderReplay(data) {
  if (!chatReplayBox) return;
  const stats = data?.stats || {};
  const topUsers = Array.isArray(data?.top_users) ? data.top_users : [];
  const recent = Array.isArray(data?.recent) ? data.recent : [];

  chatReplayBox.innerHTML = `
    <div class="replay-summary">${escapeHtml(data?.summary || 'Bugün henüz özet yok.')}</div>
    <div class="replay-stats">
      <span><b>${Number(stats.total || 0)}</b> mesaj</span>
      <span><b>${Number(stats.images || 0)}</b> foto</span>
      <span><b>${Number(stats.audio || 0)}</b> ses</span>
      <span><b>${stats.top_reaction ? escapeHtml(stats.top_reaction.emoji) : '—'}</b> top reaction</span>
    </div>
    <div class="replay-list">
      <strong>En aktifler</strong>
      ${topUsers.length ? topUsers.map((u, index) => `<span>#${index + 1} ${escapeHtml(u.username)} · ${Number(u.count || 0)} mesaj</span>`).join('') : '<span>Aktif kullanıcı yok.</span>'}
    </div>
    <div class="replay-list">
      <strong>Son sinyaller</strong>
      ${recent.length ? recent.map((m) => `<span>${escapeHtml(m.username)}: ${escapeHtml((m.text || m.message_type || '').slice(0, 54))}</span>`).join('') : '<span>Bugün mesaj yok.</span>'}
    </div>
  `;
}

async function loadChatReplay() {
  if (!chatReplayBox) return;
  chatReplayBox.innerHTML = '<p>Günün özeti hazırlanıyor...</p>';
  try {
    const data = await api(`/api/replay/daily/${encodeURIComponent(currentRoom || 'genel')}`);
    renderReplay(data);
  } catch (error) {
    chatReplayBox.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

function renderStoryDecision(data) {
  if (!storyDecisionBox) return;
  const decision = data?.decision || data;
  if (!decision) {
    storyDecisionBox.innerHTML = '<p>Hikaye kararı yok.</p>';
    return;
  }

  const total = Number(decision.total_votes || 0);
  storyDecisionBox.innerHTML = `
    <div class="story-prompt">${escapeHtml(decision.prompt || 'Karar bekleniyor...')}</div>
    <div class="story-options">
      ${(decision.options || []).map((option) => {
        const votes = Number(option.votes || 0);
        const pct = total ? Math.round((votes / total) * 100) : 0;
        return `<button class="story-option" data-story-option="${escapeHtml(option.key)}" type="button">
          <span>${escapeHtml(option.label)}</span>
          <b>${votes} oy · ${pct}%</b>
          <i style="width:${pct}%"></i>
        </button>`;
      }).join('')}
    </div>
    <div class="story-result">Sonuç: ${escapeHtml(decision.result_text || 'Henüz şekillenmedi.')}</div>
  `;

  storyDecisionBox.querySelectorAll('[data-story-option]').forEach((button) => {
    button.addEventListener('click', () => voteStoryDecision(button.dataset.storyOption));
  });
}

async function loadStoryDecision() {
  if (!storyDecisionBox) return;
  storyDecisionBox.innerHTML = '<p>Hikaye kararı yükleniyor...</p>';
  try {
    const data = await api(`/api/story-decision/${encodeURIComponent(currentRoom || 'genel')}`);
    renderStoryDecision(data);
  } catch (error) {
    storyDecisionBox.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function voteStoryDecision(optionKey) {
  if (!optionKey) return;
  try {
    const data = await api(`/api/story-decision/${encodeURIComponent(currentRoom || 'genel')}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionKey })
    });
    const decision = data?.decision;
    if (decision?.id) storyVoteCache.set(String(decision.id), optionKey);
    renderStoryDecision(data);
    updateStoryDecisionCards(data);
    showPolishToast?.('Oy kaydedildi', '+2 shards · companion XP', 'success');
    loadGamify?.();
  } catch (error) {
    addSystemMessage(error.message);
    if (/zaten oy/i.test(String(error.message || ''))) loadStoryDecision?.();
  }
}

function renderCompanion(data) {
  if (!companionBox) return;
  const pet = data?.companion || {};
  const pets = data?.pets || {};
  const petOptions = Object.entries(pets).map(([key, def]) => `<button class="pet-choice ${pet.pet_type === key ? 'active' : ''}" data-pet-type="${escapeHtml(key)}" type="button">${escapeHtml(def.icon)} <span>${escapeHtml(def.name)}</span></button>`).join('');

  companionBox.innerHTML = `
    <div class="pet-main">
      <div class="pet-orb">${escapeHtml(pet.icon || '🐈‍⬛')}</div>
      <div>
        <strong>${escapeHtml(pet.pet_name || 'Companion')}</strong>
        <span>Level ${Number(pet.level || 1)} · mood: ${escapeHtml(pet.mood || 'curious')}</span>
      </div>
    </div>
    <div class="pet-xp">
      <div style="width:${Math.max(0, Math.min(100, Number(pet.progress || 0)))}%"></div>
    </div>
    <div class="pet-meta">
      <span>${Number(pet.xp || 0)} XP</span>
      <span>Next ${Number(pet.next_xp || 0)} XP</span>
    </div>
    <div class="pet-choices">${petOptions}</div>
  `;

  companionBox.querySelectorAll('[data-pet-type]').forEach((button) => {
    button.addEventListener('click', () => selectCompanion(button.dataset.petType));
  });
}

async function loadCompanion() {
  if (!companionBox) return;
  companionBox.innerHTML = '<p>Companion yükleniyor...</p>';
  try {
    const data = await api('/api/companion/me');
    renderCompanion(data);
  } catch (error) {
    companionBox.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  }
}

async function selectCompanion(petType) {
  try {
    const data = await api('/api/companion/select', {
      method: 'POST',
      body: JSON.stringify({ petType })
    });
    showPolishToast?.('Companion güncellendi', data?.companion?.pet_name || '', 'success');
    await loadInventory();
    await loadGamify?.();
  } catch (error) {
    addSystemMessage(error.message);
  }
}


/* v10.6.0 command palette + media viewer bindings */
commandPaletteInput?.addEventListener('input', () => {
  commandPaletteIndex = 0;
  renderCommandPalette();
});

commandPaletteCloseButton?.addEventListener('click', closeCommandPalette);
commandPaletteModal?.addEventListener('click', (event) => {
  if (event.target === commandPaletteModal) closeCommandPalette();
});

mediaViewerCloseButton?.addEventListener('click', closeMediaViewer);
mediaViewerModal?.addEventListener('click', (event) => {
  if (event.target === mediaViewerModal) closeMediaViewer();
});
mediaViewerPrevButton?.addEventListener('click', () => moveMediaViewer(-1));
mediaViewerNextButton?.addEventListener('click', () => moveMediaViewer(1));

document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  const target = event.target;
  const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);

  if ((event.ctrlKey || event.metaKey) && key === 'k') {
    event.preventDefault();
    openCommandPalette();
    return;
  }

  if (!commandPaletteModal?.classList.contains('hidden')) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeCommandPalette();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      commandPaletteIndex = Math.min(commandPaletteIndex + 1, Math.max(0, commandPaletteItems.length - 1));
      renderCommandPalette();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      commandPaletteIndex = Math.max(0, commandPaletteIndex - 1);
      renderCommandPalette();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runCommandPaletteItem();
    }
    return;
  }

  if (!mediaViewerModal?.classList.contains('hidden')) {
    if (event.key === 'Escape') closeMediaViewer();
    if (event.key === 'ArrowLeft') moveMediaViewer(-1);
    if (event.key === 'ArrowRight') moveMediaViewer(1);
    return;
  }

  if (!isTyping && key === '/') {
    event.preventDefault();
    openCommandPalette();
  }
});


refreshReplayButton?.addEventListener('click', loadChatReplay);
refreshStoryDecisionButton?.addEventListener('click', loadStoryDecision);
refreshCompanionButton?.addEventListener('click', loadCompanion);

refreshInventoryButton?.addEventListener('click', loadInventory);
startApp();

window.addEventListener('load', () => setTimeout(clearFiveEggClasses, 120));

window.addEventListener('load', () => requestAnimationFrame(() => document.body.classList.add('ui-ready')));

window.addEventListener('load', () => setTimeout(() => setAdminPanelVisible(false), 80));


function mobileComposerHardSnap() {
  if (!isMobileLayout() || document.activeElement !== messageInput) return;
  document.body.classList.add('keyboard-open', 'composer-focused');
  updateMobileViewportHeight?.();
  requestAnimationFrame(() => {
    scrollToBottom?.();
    messagesEl?.scrollTo?.({ top: messagesEl.scrollHeight, behavior: 'auto' });
  });
  setTimeout(() => messagesEl?.scrollTo?.({ top: messagesEl.scrollHeight, behavior: 'auto' }), 80);
  setTimeout(() => messagesEl?.scrollTo?.({ top: messagesEl.scrollHeight, behavior: 'auto' }), 220);
}

messageInput?.addEventListener('focus', mobileComposerHardSnap);
messageInput?.addEventListener('input', mobileComposerHardSnap);



/* v9.3.6 stable mobile mode: no fixed composer hacks, grid handles keyboard */
function stableMobileViewportUpdate() {
  const h = Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 700);
  document.documentElement.style.setProperty('--mobile-vvh', `${h}px`);
}

function stableMobileKeyboardState() {
  if (!isMobileLayout || !isMobileLayout()) return;
  stableMobileViewportUpdate();
  const focused = document.activeElement === messageInput;
  document.body.classList.toggle('keyboard-open', focused);
  document.body.classList.toggle('composer-focused', focused);
  if (focused) {
    setTimeout(() => {
      try {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      } catch {}
    }, 60);
    setTimeout(() => {
      try {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      } catch {}
    }, 220);
  }
}

window.visualViewport?.addEventListener('resize', stableMobileKeyboardState);
window.visualViewport?.addEventListener('scroll', stableMobileKeyboardState);
window.addEventListener('resize', stableMobileKeyboardState);
window.addEventListener('orientationchange', () => setTimeout(stableMobileKeyboardState, 250));
messageInput?.addEventListener('focus', stableMobileKeyboardState);
messageInput?.addEventListener('blur', () => setTimeout(stableMobileKeyboardState, 120));
messageInput?.addEventListener('input', stableMobileKeyboardState);
window.addEventListener('load', stableMobileKeyboardState);

/* Mobile profile: backdrop tap closes, close button always works */
profileModal?.addEventListener('click', (event) => {
  if (isMobileLayout && isMobileLayout() && event.target === profileModal) closeProfile();
});



/* v9.3.7: mobile composer must stay visible when keyboard opens */
function mobileKeepComposerVisible() {
  if (!isMobileLayout || !isMobileLayout()) return;
  stableMobileViewportUpdate?.();
  const focused = document.activeElement === messageInput;
  document.body.classList.toggle('keyboard-open', focused);
  document.body.classList.toggle('composer-focused', focused);

  if (focused) {
    const form = document.getElementById('messageForm');
    if (form) {
      form.style.display = 'grid';
      form.style.visibility = 'visible';
      form.style.opacity = '1';
    }
    requestAnimationFrame(() => {
      try { messagesEl.scrollTop = messagesEl.scrollHeight; } catch {}
    });
    setTimeout(() => {
      try { messagesEl.scrollTop = messagesEl.scrollHeight; } catch {}
    }, 120);
  }
}

messageInput?.addEventListener('focus', mobileKeepComposerVisible);
messageInput?.addEventListener('click', mobileKeepComposerVisible);
messageInput?.addEventListener('input', mobileKeepComposerVisible);
window.visualViewport?.addEventListener('resize', mobileKeepComposerVisible);
window.visualViewport?.addEventListener('scroll', mobileKeepComposerVisible);



/* v9.3.8: iOS mobile no-gap composer + settings close fix */
function mobileNoGapComposerSnap() {
  if (!isMobileLayout || !isMobileLayout()) return;
  stableMobileViewportUpdate?.();

  const focused = document.activeElement === messageInput;
  document.body.classList.toggle('keyboard-open', focused);
  document.body.classList.toggle('composer-focused', focused);

  const form = document.getElementById('messageForm');
  if (form) {
    form.style.display = 'grid';
    form.style.visibility = 'visible';
    form.style.opacity = '1';
  }

  if (focused) {
    // iOS Safari bazen viewport'u geç hesaplıyor; birkaç frame en alta zorla.
    [0, 60, 160, 320].forEach((delay) => {
      setTimeout(() => {
        try {
          messagesEl.scrollTop = messagesEl.scrollHeight;
          form?.scrollIntoView({ block: 'end', behavior: 'auto' });
        } catch {}
      }, delay);
    });
  }
}

messageInput?.addEventListener('focus', mobileNoGapComposerSnap);
messageInput?.addEventListener('click', mobileNoGapComposerSnap);
messageInput?.addEventListener('touchend', mobileNoGapComposerSnap, { passive: true });
messageInput?.addEventListener('input', mobileNoGapComposerSnap);
window.visualViewport?.addEventListener('resize', mobileNoGapComposerSnap);
window.visualViewport?.addEventListener('scroll', mobileNoGapComposerSnap);

function closeSettingsMobileSafe() {
  closeSettings?.();
  document.body.classList.remove('settings-mobile-open');
}

settingsModal?.addEventListener('click', (event) => {
  if (!isMobileLayout || !isMobileLayout()) return;
  if (event.target === settingsModal) closeSettingsMobileSafe();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && settingsModal && !settingsModal.classList.contains('hidden')) {
    closeSettingsMobileSafe();
  }
});



/* v9.5.3: mobile/desktop direct send button support for active voice recording */
sendButton?.addEventListener('click', (event) => {
  if (isRecording || mediaRecorder?.state === 'recording') {
    event.preventDefault();
    event.stopPropagation();
    stopVoiceRecording(false);
  }
}, true);


railGalleryButton?.addEventListener('click', () => {
  syncRailActive?.('gallery');
  openGalleryModal();
});

mobileGalleryButton?.addEventListener('click', () => {
  openGalleryModal();
});

galleryModal?.addEventListener('click', (event) => {
  if (event.target === galleryModal) closeGalleryModal();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeGalleryModal();
});


railFriendsCenterButton?.addEventListener('click', () => {
  syncRailActive?.('friends-center');
  openFriendsCenter('friends');
});

friendsCenterCloseButton?.addEventListener('click', closeFriendsCenter);
friendsCenterModal?.addEventListener('click', (event) => {
  if (event.target === friendsCenterModal) closeFriendsCenter();
});

friendsCenterTabs?.forEach((button) => {
  button.addEventListener('click', () => setFriendsCenterTab(button.dataset.friendsCenterTab || 'friends'));
});

friendsCenterSearchButton?.addEventListener('click', searchFriendsCenterUsers);
friendsCenterSearchInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') searchFriendsCenterUsers();
});


presenceChoices?.forEach((button) => {
  button.addEventListener('click', () => setPresenceChoice(button.dataset.presenceChoice || 'online'));
});

presenceSelect?.addEventListener('change', updateSocialPreview);
customStatusInput?.addEventListener('input', () => {
  if (socialSaveHint) socialSaveHint.textContent = 'Kaydetmeyi unutma.';
  updateSocialPreview();
});

clearCustomStatusButton?.addEventListener('click', () => {
  if (customStatusInput) customStatusInput.value = '';
  if (socialSaveHint) socialSaveHint.textContent = 'Kaydetmeyi unutma.';
  updateSocialPreview();
});


sidebarFriendsButton?.addEventListener('click', () => {
  syncRailActive?.('friends-center');
  openFriendsCenter?.('friends');
});

sidebarGalleryButton?.addEventListener('click', () => {
  syncRailActive?.('gallery');
  openGalleryModal?.();
});

sidebarSettingsButton?.addEventListener('click', () => {
  openSettings?.();
});


headerSearchButton?.addEventListener('click', focusHeaderSearch);

headerGalleryButton?.addEventListener('click', () => {
  syncRailActive?.('gallery');
  openGalleryModal?.();
});

headerFriendsButton?.addEventListener('click', () => {
  syncRailActive?.('friends-center');
  openFriendsCenter?.('friends');
});

headerSettingsButton?.addEventListener('click', () => {
  openSettings?.();
});
function mobileKeyboardScrollFix() {
  if (!isMobileLayout?.()) return;
  const run = () => {
    try {
      if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
      scrollToBottom?.();
    } catch {}
  };
  run();
  setTimeout(run, 80);
  setTimeout(run, 180);
  setTimeout(run, 360);
  setTimeout(run, 650);
}


