class FriendlyOnlineController {
    constructor() {
        this.apiBaseUrl = this.getApiUrl();
        this.token = localStorage.getItem('authToken');
        this.user = null;
        this.room = null;
        this.roomCode = null;
        this.socialOverview = {
            friends: [],
            raceInvites: []
        };
        this.historyRooms = [];
        this.roomPollInterval = null;
        this.socialPollInterval = null;
        this.countdownInterval = null;
        this.countdownTargetMs = null;
        this.toastTimeout = null;
        this.launchTriggered = false;

        this.trackLabels = {
            monza: 'Monza',
            bahrain: 'Bahrain',
            melbourne: 'Melbourne',
            shanghai: 'Shanghai',
            montmelo: 'Montmelo',
            leoverse: 'Leoverse'
        };

        this.init();
    }

    getApiUrl() {
        const isFileProtocol = window.location.protocol === 'file:';
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isFileProtocol || isLocalhost) {
            return 'http://localhost:5000/api';
        }
        return `${window.location.origin}/api`;
    }

    async apiRequest(path, options = {}) {
        const response = await fetch(`${this.apiBaseUrl}${path}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        });

        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            const requestError = new Error(data?.message || 'Request failed');
            requestError.status = response.status;
            throw requestError;
        }

        return data;
    }

    async init() {
        if (!this.token) {
            window.location.href = 'index.html';
            return;
        }

        this.bindEvents();

        try {
            await this.loadProfile();
            await this.loadSocialOverview(true);

            const roomCodeFromQuery = this.getRoomCodeFromQuery();
            if (roomCodeFromQuery) {
                await this.joinRoom(roomCodeFromQuery, true);
            } else {
                await this.loadActiveRoom();
            }

            await this.loadRaceHistory(true);

            this.startSocialPolling();
        } catch (error) {
            console.error('Friendly online init error:', error);
            this.showToast('No se pudo cargar el modo amistoso online', 'error');
        }
    }

    bindEvents() {
        const createRoomBtn = document.getElementById('create-room-btn');
        const joinRoomBtn = document.getElementById('join-room-btn');
        const joinRoomInput = document.getElementById('join-room-code');
        const copyRoomCodeBtn = document.getElementById('copy-room-code-btn');
        const deleteRoomBtn = document.getElementById('delete-room-btn');
        const leaveRoomBtn = document.getElementById('leave-room-btn');
        const toggleReadyBtn = document.getElementById('toggle-ready-btn');
        const participantsBody = document.getElementById('participants-body');
        const inviteFriendsList = document.getElementById('invite-friends-list');
        const pendingInvitesList = document.getElementById('pending-invites-list');
        const historyList = document.getElementById('history-list');

        if (createRoomBtn) {
            createRoomBtn.addEventListener('click', () => this.createRoom());
        }

        if (joinRoomBtn) {
            joinRoomBtn.addEventListener('click', () => this.joinRoomFromInput());
        }

        if (joinRoomInput) {
            joinRoomInput.addEventListener('input', () => {
                joinRoomInput.value = this.sanitizeRoomCode(joinRoomInput.value);
            });

            joinRoomInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.joinRoomFromInput();
                }
            });
        }

        if (copyRoomCodeBtn) {
            copyRoomCodeBtn.addEventListener('click', () => this.copyRoomCode());
        }

        if (deleteRoomBtn) {
            deleteRoomBtn.addEventListener('click', () => this.deleteCurrentRoom());
        }

        if (leaveRoomBtn) {
            leaveRoomBtn.addEventListener('click', () => this.leaveRoom());
        }

        if (toggleReadyBtn) {
            toggleReadyBtn.addEventListener('click', () => this.toggleReadyState());
        }

        if (participantsBody) {
            participantsBody.addEventListener('change', (event) => {
                const select = event.target.closest('.self-tyre-select');
                if (!select) return;
                this.updateTyre(select.value);
            });
        }

        if (inviteFriendsList) {
            inviteFriendsList.addEventListener('click', (event) => {
                const button = event.target.closest('[data-action="invite-friend"]');
                if (!button) return;
                this.inviteFriend(button.dataset.friendId);
            });
        }

        if (pendingInvitesList) {
            pendingInvitesList.addEventListener('click', (event) => {
                const button = event.target.closest('[data-action]');
                if (!button) return;

                const roomCode = button.dataset.roomCode;
                if (!roomCode) return;

                if (button.dataset.action === 'accept-invite') {
                    this.joinRoom(roomCode);
                } else if (button.dataset.action === 'reject-invite') {
                    this.rejectInvite(roomCode);
                }
            });
        }

        if (historyList) {
            historyList.addEventListener('click', (event) => {
                const button = event.target.closest('[data-action]');
                if (!button) return;

                const roomCode = button.dataset.roomCode;
                if (!roomCode) return;

                if (button.dataset.action === 'open-history-room') {
                    this.joinRoom(roomCode, true);
                    return;
                }

                if (button.dataset.action === 'leave-history-room') {
                    this.leaveRoomByCode(roomCode);
                    return;
                }

                if (button.dataset.action === 'delete-history-room') {
                    this.deleteRoomByCode(roomCode);
                }
            });
        }

        window.addEventListener('beforeunload', () => {
            this.stopRoomPolling();
            this.stopSocialPolling();
            this.stopCountdownTicker();
        });
    }

    async loadProfile() {
        const data = await this.apiRequest('/user/profile');
        this.user = data.user || null;

        const userLabel = document.getElementById('friendly-user');
        if (userLabel && this.user) {
            userLabel.textContent = this.user.displayName || this.user.username || 'Manager';
        }
    }

    async loadSocialOverview(silent = false) {
        try {
            const data = await this.apiRequest('/social/friends/overview');
            this.socialOverview = {
                friends: Array.isArray(data.friends) ? data.friends : [],
                raceInvites: Array.isArray(data.raceInvites) ? data.raceInvites : []
            };
            this.renderPendingInvites();
            this.renderInviteFriends();
        } catch (error) {
            if (error.status === 401) {
                window.location.href = 'index.html';
                return;
            }
            if (!silent) {
                this.showToast('No se pudo actualizar la lista social', 'error');
            }
        }
    }

    async loadActiveRoom() {
        try {
            const data = await this.apiRequest('/social/quick-races/active/me');
            if (data.room) {
                this.setRoomState(data.room, true);
            } else {
                this.clearRoomState();
            }
        } catch (error) {
            console.error('Load active room error:', error);
            this.clearRoomState();
        }
    }

    async createRoom() {
        const trackId = document.getElementById('track-select')?.value || 'monza';
        const laps = Number(document.getElementById('laps-select')?.value || 10);

        try {
            const data = await this.apiRequest('/social/quick-races/create', {
                method: 'POST',
                body: JSON.stringify({ trackId, laps })
            });

            this.showToast(`Sala #${data.room.roomCode} creada`);
            this.setRoomState(data.room, true);
            await this.loadSocialOverview(true);
            await this.loadRaceHistory(true);
        } catch (error) {
            this.showToast(error.message || 'No se pudo crear la sala', 'error');
        }
    }

    async joinRoomFromInput() {
        const input = document.getElementById('join-room-code');
        const roomCode = this.sanitizeRoomCode(input?.value || '');
        if (!/^\d{5}$/.test(roomCode)) {
            this.showToast('El codigo debe tener 5 cifras', 'error');
            return;
        }
        await this.joinRoom(roomCode);
    }

    async joinRoom(roomCode, silent = false) {
        const normalizedCode = this.sanitizeRoomCode(roomCode);

        try {
            const data = await this.apiRequest('/social/quick-races/join', {
                method: 'POST',
                body: JSON.stringify({ roomCode: normalizedCode })
            });

            if (!silent) {
                this.showToast(`Te uniste a la sala #${normalizedCode}`);
            }

            this.setRoomState(data.room, true);
            await this.loadSocialOverview(true);
            await this.loadRaceHistory(true);
        } catch (error) {
            this.showToast(error.message || 'No se pudo unir a la sala', 'error');
        }
    }

    async leaveRoom() {
        if (!this.roomCode) return;

        try {
            const data = await this.apiRequest(`/social/quick-races/${encodeURIComponent(this.roomCode)}/leave`, {
                method: 'POST'
            });
            this.showToast('Has salido de la sala');
            if (data?.room) {
                this.setRoomState(data.room, true);
            } else {
                this.clearRoomState();
            }
            await this.loadSocialOverview(true);
            await this.loadRaceHistory(true);
        } catch (error) {
            this.showToast(error.message || 'No se pudo salir de la sala', 'error');
        }
    }

    async refreshRoomState() {
        if (!this.roomCode) return;

        try {
            const data = await this.apiRequest(`/social/quick-races/${encodeURIComponent(this.roomCode)}`);
            if (data.room) {
                this.setRoomState(data.room, false);
            }
        } catch (error) {
            if (error.status === 403 || error.status === 404) {
                this.showToast('La sala ya no esta disponible', 'error');
                this.clearRoomState();
                await this.loadSocialOverview(true);
                await this.loadRaceHistory(true);
                return;
            }
            console.error('Refresh room error:', error);
        }
    }

    async toggleReadyState() {
        if (!this.roomCode || !this.room) return;

        const self = this.getSelfParticipant();
        const ready = !(self?.ready);

        try {
            const data = await this.apiRequest(`/social/quick-races/${encodeURIComponent(this.roomCode)}/ready`, {
                method: 'POST',
                body: JSON.stringify({ ready })
            });

            if (data.message) {
                this.showToast(data.message, data.message.toLowerCase().includes('need at least') ? 'error' : 'success');
            }

            this.setRoomState(data.room, false);
        } catch (error) {
            this.showToast(error.message || 'No se pudo actualizar tu estado', 'error');
        }
    }

    async updateTyre(tyreCompound) {
        if (!this.roomCode) return;

        try {
            const data = await this.apiRequest(`/social/quick-races/${encodeURIComponent(this.roomCode)}/tyre`, {
                method: 'POST',
                body: JSON.stringify({ tyreCompound })
            });
            this.setRoomState(data.room, false);
        } catch (error) {
            this.showToast(error.message || 'No se pudo actualizar el neumatico', 'error');
        }
    }

    async inviteFriend(friendId) {
        if (!this.roomCode || !friendId) return;

        try {
            const data = await this.apiRequest(`/social/quick-races/${encodeURIComponent(this.roomCode)}/invite`, {
                method: 'POST',
                body: JSON.stringify({ friendId })
            });

            this.showToast(data.message || 'Invitacion enviada');
            this.setRoomState(data.room, false);
            await this.loadSocialOverview(true);
        } catch (error) {
            this.showToast(error.message || 'No se pudo enviar la invitacion', 'error');
        }
    }

    async rejectInvite(roomCode) {
        try {
            await this.apiRequest(`/social/quick-races/${encodeURIComponent(roomCode)}/reject-invite`, {
                method: 'POST'
            });
            this.showToast('Invitacion rechazada');
            await this.loadSocialOverview(true);
        } catch (error) {
            this.showToast(error.message || 'No se pudo rechazar la invitacion', 'error');
        }
    }

    setRoomState(room, ensurePolling = false) {
        if (!room || !room.roomCode) {
            this.clearRoomState();
            return;
        }

        if (room.status === 'finished' || room.status === 'cancelled') {
            this.clearRoomState();
            this.loadRaceHistory(true);
            return;
        }

        const roomChanged = this.roomCode !== room.roomCode;
        this.room = room;
        this.roomCode = room.roomCode;

        if (roomChanged) {
            this.launchTriggered = false;
        }

        this.setRoomCodeInQuery(this.roomCode);
        this.renderRoom();
        this.renderInviteFriends();
        this.renderPendingInvites();

        const entryPanel = document.getElementById('entry-panel');
        const roomPanel = document.getElementById('room-panel');

        if (entryPanel) entryPanel.classList.add('hidden');
        if (roomPanel) roomPanel.classList.remove('hidden');

        if (ensurePolling || roomChanged || !this.roomPollInterval) {
            this.startRoomPolling();
        }

        if (room.status === 'racing') {
            this.launchFriendlyRace();
        }
    }

    clearRoomState() {
        this.room = null;
        this.roomCode = null;
        this.launchTriggered = false;
        this.setRoomCodeInQuery(null);
        this.stopRoomPolling();
        this.stopCountdownTicker();

        const entryPanel = document.getElementById('entry-panel');
        const roomPanel = document.getElementById('room-panel');
        const invitePanel = document.getElementById('invite-panel');
        const countdownOverlay = document.getElementById('countdown-overlay');

        if (entryPanel) entryPanel.classList.remove('hidden');
        if (roomPanel) roomPanel.classList.add('hidden');
        if (invitePanel) invitePanel.classList.add('hidden');
        if (countdownOverlay) countdownOverlay.classList.add('hidden');

        this.renderPendingInvites();
    }

    renderRoom() {
        if (!this.room) return;

        const roomCodeValue = document.getElementById('room-code-value');
        const roomHost = document.getElementById('room-host');
        const roomTrack = document.getElementById('room-track');
        const roomLaps = document.getElementById('room-laps');
        const roomStatusPill = document.getElementById('room-status-pill');
        const countdownText = document.getElementById('countdown-text');
        const participantsCount = document.getElementById('participants-count');
        const participantsBody = document.getElementById('participants-body');
        const toggleReadyBtn = document.getElementById('toggle-ready-btn');
        const deleteRoomBtn = document.getElementById('delete-room-btn');

        if (roomCodeValue) roomCodeValue.textContent = this.room.roomCode;
        if (roomHost) roomHost.textContent = this.room.host?.displayName || this.room.host?.username || 'Manager';
        if (roomTrack) roomTrack.textContent = this.getTrackName(this.room.trackId);
        if (roomLaps) roomLaps.textContent = String(this.room.laps || '-');

        if (roomStatusPill) {
            roomStatusPill.classList.remove('waiting', 'countdown');
            if (this.room.status === 'waiting') {
                roomStatusPill.textContent = 'Esperando managers';
                roomStatusPill.classList.add('waiting');
            } else if (this.room.status === 'countdown') {
                roomStatusPill.textContent = 'Cuenta atras activa';
                roomStatusPill.classList.add('countdown');
            } else if (this.room.status === 'racing') {
                roomStatusPill.textContent = 'Carrera en curso';
            } else if (this.room.status === 'cancelled') {
                roomStatusPill.textContent = 'Sala cancelada';
            } else {
                roomStatusPill.textContent = 'Sala finalizada';
            }
        }

        if (countdownText) {
            if (this.room.status === 'countdown' && typeof this.room.countdownRemainingMs === 'number') {
                countdownText.textContent = `Inicio en ${Math.max(1, Math.ceil(this.room.countdownRemainingMs / 1000))}s`;
            } else {
                countdownText.textContent = '';
            }
        }

        const participants = Array.isArray(this.room.participants) ? this.room.participants : [];
        if (participantsCount) participantsCount.textContent = String(participants.length);

        if (participantsBody) {
            participantsBody.innerHTML = participants.map((participant) => {
                const displayName = this.escapeHtml(participant.displayName || 'Manager');
                const teamName = this.escapeHtml(participant.teamName || 'Sin equipo');
                const isSelf = participant.isSelf;
                const isWaiting = this.room.status === 'waiting';

                let tyreCell = this.escapeHtml(String(participant.tyreCompound || 'medium').toUpperCase());
                if (isSelf && isWaiting) {
                    tyreCell = `
                        <select class="self-tyre-select">
                            <option value="soft" ${participant.tyreCompound === 'soft' ? 'selected' : ''}>SOFT</option>
                            <option value="medium" ${participant.tyreCompound === 'medium' ? 'selected' : ''}>MEDIUM</option>
                            <option value="hard" ${participant.tyreCompound === 'hard' ? 'selected' : ''}>HARD</option>
                        </select>
                    `;
                }

                const stateLabel = this.room.status === 'racing'
                    ? 'En carrera'
                    : participant.ready ? 'Listo' : 'Esperando';

                return `
                    <tr>
                        <td>${displayName}${participant.isHost ? ' (Host)' : ''}<br><small>${teamName}</small></td>
                        <td>${tyreCell}</td>
                        <td>${stateLabel}</td>
                    </tr>
                `;
            }).join('');
        }

        if (toggleReadyBtn) {
            const selfParticipant = this.getSelfParticipant();
            if (this.room.status === 'waiting') {
                toggleReadyBtn.disabled = false;
                toggleReadyBtn.textContent = selfParticipant?.ready ? 'Cancelar' : 'CORRER';
            } else if (this.room.status === 'countdown') {
                toggleReadyBtn.disabled = true;
                toggleReadyBtn.textContent = 'Cuenta atras';
            } else {
                toggleReadyBtn.disabled = true;
                toggleReadyBtn.textContent = 'En carrera';
            }
        }

        if (deleteRoomBtn) {
            const isHost = Boolean(this.room.currentUser?.isHost);
            deleteRoomBtn.classList.toggle('hidden', !isHost);
            deleteRoomBtn.disabled = !isHost;
            deleteRoomBtn.textContent = this.room.status === 'waiting'
                ? 'Salir y eliminar'
                : 'Eliminar sala';
        }

        this.syncCountdownOverlay();
    }

    renderInviteFriends() {
        const invitePanel = document.getElementById('invite-panel');
        const inviteFriendsList = document.getElementById('invite-friends-list');
        const inviteFriendsCount = document.getElementById('invite-friends-count');
        const inviteEmptyMessage = document.getElementById('invite-empty-message');

        if (!this.room || !invitePanel || !inviteFriendsList || !inviteEmptyMessage || !inviteFriendsCount) {
            return;
        }

        const isHost = Boolean(this.room.currentUser?.isHost);
        if (!isHost || this.room.status !== 'waiting') {
            invitePanel.classList.add('hidden');
            return;
        }

        const friends = Array.isArray(this.socialOverview.friends) ? this.socialOverview.friends : [];
        const participants = new Set((this.room.participants || []).map((participant) => participant.userId));
        const pendingInvitations = new Set(
            (this.room.pendingInvitations || [])
                .map((invitation) => invitation?.user?.id)
                .filter(Boolean)
        );

        const invitableFriends = friends.filter((friend) => !participants.has(friend.id));
        inviteFriendsCount.textContent = String(invitableFriends.length);

        if (!invitableFriends.length) {
            inviteFriendsList.innerHTML = '';
            inviteEmptyMessage.classList.remove('hidden');
            invitePanel.classList.remove('hidden');
            return;
        }

        inviteEmptyMessage.classList.add('hidden');
        inviteFriendsList.innerHTML = invitableFriends.map((friend) => {
            const friendId = this.escapeHtml(friend.id || '');
            const displayName = this.escapeHtml(friend.displayName || friend.username || 'Manager');
            const teamName = this.escapeHtml(friend.teamName || 'Sin equipo');
            const alreadyPending = pendingInvitations.has(friend.id);

            return `
                <div class="stack-item">
                    <div class="stack-main">
                        <span class="stack-title">${displayName}</span>
                        <span class="stack-sub">${teamName}</span>
                    </div>
                    <div class="stack-actions">
                        <button class="stack-action accept"
                            data-action="invite-friend"
                            data-friend-id="${friendId}"
                            ${alreadyPending ? 'disabled' : ''}>
                            ${alreadyPending ? 'Invitado' : 'Invitar'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        invitePanel.classList.remove('hidden');
    }

    renderPendingInvites() {
        const pendingInvitesCard = document.getElementById('pending-invites-card');
        const pendingInvitesList = document.getElementById('pending-invites-list');
        const pendingInvitesCount = document.getElementById('pending-invites-count');

        if (!pendingInvitesCard || !pendingInvitesList || !pendingInvitesCount) return;

        const raceInvites = Array.isArray(this.socialOverview.raceInvites) ? this.socialOverview.raceInvites : [];
        pendingInvitesCount.textContent = String(raceInvites.length);

        if (this.room || raceInvites.length === 0) {
            pendingInvitesCard.classList.add('hidden');
            pendingInvitesList.innerHTML = '';
            return;
        }

        pendingInvitesList.innerHTML = raceInvites.map((invite) => {
            const roomCode = this.escapeHtml(invite.roomCode || '');
            const hostName = this.escapeHtml(invite.host?.displayName || invite.host?.username || 'Manager');
            const trackName = this.escapeHtml(this.getTrackName(invite.trackId));
            const laps = Number(invite.laps || 10);

            return `
                <div class="stack-item">
                    <div class="stack-main">
                        <span class="stack-title">${hostName} te invito</span>
                        <span class="stack-sub">${trackName} · ${laps} vueltas · #${roomCode}</span>
                    </div>
                    <div class="stack-actions">
                        <button class="stack-action accept" data-action="accept-invite" data-room-code="${roomCode}">Entrar</button>
                        <button class="stack-action reject" data-action="reject-invite" data-room-code="${roomCode}">Rechazar</button>
                    </div>
                </div>
            `;
        }).join('');

        pendingInvitesCard.classList.remove('hidden');
    }

    async loadRaceHistory(silent = false) {
        try {
            const data = await this.apiRequest('/social/quick-races/history/me');
            this.historyRooms = Array.isArray(data.rooms) ? data.rooms : [];
            this.renderRaceHistory();
        } catch (error) {
            if (error.status === 401) {
                window.location.href = 'index.html';
                return;
            }

            if (!silent) {
                this.showToast(error.message || 'No se pudo cargar el historial de salas', 'error');
            }
        }
    }

    renderRaceHistory() {
        const historyList = document.getElementById('history-list');
        const historyCount = document.getElementById('history-count');
        const historyEmptyMessage = document.getElementById('history-empty-message');

        if (!historyList || !historyCount || !historyEmptyMessage) return;

        historyCount.textContent = String(this.historyRooms.length);

        if (!this.historyRooms.length) {
            historyList.innerHTML = '';
            historyEmptyMessage.classList.remove('hidden');
            return;
        }

        historyEmptyMessage.classList.add('hidden');
        historyList.innerHTML = this.historyRooms.map((room) => {
            const roomCode = this.escapeHtml(room.roomCode || '');
            const hostName = this.escapeHtml(room.host?.displayName || room.host?.username || 'Manager');
            const status = this.escapeHtml(this.getHistoryStatusLabel(room.status));
            const trackName = this.escapeHtml(this.getTrackName(room.trackId));
            const laps = Number(room.laps || 10);
            const participantCount = Number(room.participantCount || 0);
            const dateLabel = this.escapeHtml(this.formatHistoryDate(room.raceFinishedAt || room.updatedAt || room.createdAt));

            const actions = [];
            if (room.isActive) {
                actions.push(`<button class="stack-action neutral" data-action="open-history-room" data-room-code="${roomCode}">Abrir</button>`);
                actions.push(`<button class="stack-action" data-action="leave-history-room" data-room-code="${roomCode}">Salir</button>`);
            }
            if (room.canDelete) {
                actions.push(`<button class="stack-action reject" data-action="delete-history-room" data-room-code="${roomCode}">Eliminar</button>`);
            }

            return `
                <div class="stack-item">
                    <div class="stack-main">
                        <span class="stack-title">Sala #${roomCode} · ${status}</span>
                        <span class="stack-sub">${trackName} · ${laps} vueltas · ${participantCount} managers</span>
                        <span class="stack-sub">Host: ${hostName} · ${dateLabel}</span>
                    </div>
                    <div class="stack-actions">${actions.join('')}</div>
                </div>
            `;
        }).join('');
    }

    async leaveRoomByCode(roomCode) {
        const normalizedCode = this.sanitizeRoomCode(roomCode);
        if (!normalizedCode) return;

        try {
            const data = await this.apiRequest(`/social/quick-races/${encodeURIComponent(normalizedCode)}/leave`, {
                method: 'POST'
            });

            if (this.roomCode === normalizedCode) {
                if (data?.room) {
                    this.setRoomState(data.room, true);
                } else {
                    this.clearRoomState();
                }
            }

            this.showToast(`Has salido de la sala #${normalizedCode}`);
            await this.loadSocialOverview(true);
            await this.loadRaceHistory(true);
        } catch (error) {
            this.showToast(error.message || 'No se pudo salir de la sala', 'error');
        }
    }

    async deleteCurrentRoom() {
        if (!this.roomCode) return;
        await this.deleteRoomByCode(this.roomCode);
    }

    async deleteRoomByCode(roomCode) {
        const normalizedCode = this.sanitizeRoomCode(roomCode);
        if (!normalizedCode) return;

        const shouldDelete = window.confirm(`¿Eliminar la sala #${normalizedCode}? Esta accion no se puede deshacer.`);
        if (!shouldDelete) return;

        try {
            const data = await this.apiRequest(`/social/quick-races/${encodeURIComponent(normalizedCode)}`, {
                method: 'DELETE'
            });

            if (this.roomCode === normalizedCode) {
                this.clearRoomState();
            }

            this.showToast(data?.message || `Sala #${normalizedCode} eliminada`);
            await this.loadSocialOverview(true);
            await this.loadRaceHistory(true);
            await this.loadActiveRoom();
        } catch (error) {
            this.showToast(error.message || 'No se pudo eliminar la sala', 'error');
        }
    }

    getHistoryStatusLabel(status) {
        switch (status) {
            case 'waiting':
                return 'Esperando';
            case 'countdown':
                return 'Cuenta atras';
            case 'racing':
                return 'En carrera';
            case 'finished':
                return 'Finalizada';
            case 'cancelled':
                return 'Cancelada';
            default:
                return 'Desconocido';
        }
    }

    formatHistoryDate(value) {
        if (!value) return 'Sin fecha';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'Sin fecha';

        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    syncCountdownOverlay() {
        const overlay = document.getElementById('countdown-overlay');
        const number = document.getElementById('countdown-number');

        if (!overlay || !number) return;

        if (this.room?.status !== 'countdown' || !this.room.countdownStartAt) {
            overlay.classList.add('hidden');
            this.stopCountdownTicker();
            return;
        }

        const targetMs = new Date(this.room.countdownStartAt).getTime() + 3000;
        overlay.classList.remove('hidden');

        if (this.countdownTargetMs === targetMs && this.countdownInterval) {
            return;
        }

        this.stopCountdownTicker();
        this.countdownTargetMs = targetMs;

        const tick = () => {
            const remaining = this.countdownTargetMs - Date.now();
            if (remaining <= 0) {
                number.textContent = 'GO';
                return;
            }
            number.textContent = String(Math.max(1, Math.ceil(remaining / 1000)));
        };

        tick();
        this.countdownInterval = setInterval(tick, 100);
    }

    stopCountdownTicker() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        this.countdownTargetMs = null;
    }

    startRoomPolling() {
        this.stopRoomPolling();
        this.roomPollInterval = setInterval(() => {
            this.refreshRoomState();
        }, 1500);
    }

    stopRoomPolling() {
        if (this.roomPollInterval) {
            clearInterval(this.roomPollInterval);
            this.roomPollInterval = null;
        }
    }

    startSocialPolling() {
        this.stopSocialPolling();
        this.socialPollInterval = setInterval(() => {
            this.loadSocialOverview(true);
            this.loadRaceHistory(true);
        }, 12000);
    }

    stopSocialPolling() {
        if (this.socialPollInterval) {
            clearInterval(this.socialPollInterval);
            this.socialPollInterval = null;
        }
    }

    getSelfParticipant() {
        if (!this.room || !Array.isArray(this.room.participants)) return null;
        const myId = this.getCurrentUserId();
        return this.room.participants.find((participant) => participant.userId === myId) || null;
    }

    getCurrentUserId() {
        return String(this.user?.id || this.user?._id || '');
    }

    async copyRoomCode() {
        if (!this.roomCode) return;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(this.roomCode);
            } else {
                const temp = document.createElement('textarea');
                temp.value = this.roomCode;
                document.body.appendChild(temp);
                temp.select();
                document.execCommand('copy');
                document.body.removeChild(temp);
            }
            this.showToast('Codigo copiado');
        } catch (error) {
            this.showToast('No se pudo copiar el codigo', 'error');
        }
    }

    launchFriendlyRace() {
        if (this.launchTriggered || !this.room) return;
        this.launchTriggered = true;

        const currentUserId = this.getCurrentUserId();
        const baseParticipants = Array.isArray(this.room.participants) ? this.room.participants : [];

        const participants = baseParticipants.map((participant, index) => {
            const level = 56 + ((index * 7) % 18);
            return {
                userId: participant.userId,
                isPlayer: participant.userId === currentUserId,
                name: participant.displayName || 'Manager',
                teamName: participant.teamName || 'Sin equipo',
                pilot: {
                    id: `friendly-pilot-${participant.userId}`,
                    name: participant.displayName || 'Manager',
                    level,
                    speed: Math.min(98, level + 18),
                    control: Math.min(97, level + 14),
                    experience: Math.min(96, level + 10)
                },
                car: {
                    engine: { level: 1 },
                    aero: { level: 1 },
                    drs: { level: 1 },
                    chassis: { level: 1 }
                },
                startingTyre: participant.tyreCompound || 'medium',
                gridPosition: index + 1
            };
        });

        const me = participants.find((participant) => participant.isPlayer) || participants[0];

        const raceConfig = {
            mode: 'friendly',
            roomCode: this.room.roomCode,
            trackId: this.room.trackId || 'monza',
            laps: Number(this.room.laps || 10),
            weather: 'dry',
            startingTyre: me?.startingTyre || 'medium',
            participants,
            playerProfile: {
                userId: currentUserId,
                username: this.user?.username || this.user?.displayName || 'Manager',
                displayName: this.user?.displayName || this.user?.username || 'Manager',
                teamName: this.user?.teamName || me?.teamName || 'Tu Equipo',
                country: this.user?.country || 'ES',
                currentPilot: me?.pilot || null,
                car: {
                    engine: { level: 1 },
                    aero: { level: 1 },
                    drs: { level: 1 },
                    chassis: { level: 1 }
                }
            }
        };

        localStorage.setItem('raceConfig', JSON.stringify(raceConfig));
        window.location.href = 'online-raceMode.html';
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('friendly-toast');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.remove('hidden', 'error', 'success');
        toast.classList.add(type === 'error' ? 'error' : 'success');

        if (this.toastTimeout) {
            clearTimeout(this.toastTimeout);
        }

        this.toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, 2800);
    }

    getTrackName(trackId) {
        return this.trackLabels[trackId] || (trackId || 'Pista');
    }

    sanitizeRoomCode(value) {
        return String(value || '').replace(/\D/g, '').slice(0, 5);
    }

    getRoomCodeFromQuery() {
        const params = new URLSearchParams(window.location.search);
        return this.sanitizeRoomCode(params.get('room') || '');
    }

    setRoomCodeInQuery(roomCode) {
        const url = new URL(window.location.href);
        if (roomCode) {
            url.searchParams.set('room', roomCode);
        } else {
            url.searchParams.delete('room');
        }
        window.history.replaceState({}, '', url.toString());
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.friendlyOnlineController = new FriendlyOnlineController();
});
