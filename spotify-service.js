/**
 * SpotifyService • Official Spotify Web API integration with PKCE OAuth2
 * Handles authentication, playback control, token refresh, and player polling
 */

class SpotifyService {
  constructor() {
    this.clientIdKey = 'spotify_client_id';
    this.tokenKey = 'spotify_access_token';
    this.refreshTokenKey = 'spotify_refresh_token';
    this.expiresAtKey = 'spotify_token_expires_at';
    this.verifierKey = 'spotify_pkce_verifier';

    this.clientId = localStorage.getItem(this.clientIdKey) || (window.ORBIT_CONFIG && window.ORBIT_CONFIG.spotifyClientId) || '';
    this.accessToken = localStorage.getItem(this.tokenKey) || null;
    this.refreshToken = localStorage.getItem(this.refreshTokenKey) || null;
    this.expiresAt = parseInt(localStorage.getItem(this.expiresAtKey) || '0', 10);

    this.currentState = null;
    this.subscribers = new Set();
    this.pollInterval = null;

    this.init();
  }

  async init() {
    // Check if returning from Spotify OAuth redirect with ?code=
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      await this.handleAuthCallback(code);
      // Clean query params from URL without reload
      const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    } else if (this.isAuthenticated()) {
      this.startPolling();
    }
  }

  isAuthenticated() {
    return Boolean(this.accessToken && Date.now() < this.expiresAt);
  }

  getRedirectUri() {
    // Exact redirect URI without query or hash
    return window.location.origin + window.location.pathname;
  }

  /* ==========================================================================
     PKCE OAuth2 Flow
     ========================================================================== */
  async login(clientId) {
    if (clientId) {
      this.clientId = clientId.trim();
      localStorage.setItem(this.clientIdKey, this.clientId);
    }

    if (!this.clientId) {
      throw new Error('Spotify Client ID erforderlich.');
    }

    const verifier = this.generateRandomString(64);
    localStorage.setItem(this.verifierKey, verifier);

    const challenge = await this.generateCodeChallenge(verifier);
    const redirectUri = this.getRedirectUri();

    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'user-read-recently-played',
      'playlist-read-private',
      'playlist-read-collaborative'
    ].join(' ');

    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', this.clientId);
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('redirect_uri', redirectUri);

    window.location.href = authUrl.toString();
  }

  logout() {
    this.stopPolling();
    this.accessToken = null;
    this.refreshToken = null;
    this.expiresAt = 0;
    this.currentState = null;

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.expiresAtKey);
    localStorage.removeItem(this.verifierKey);

    this.notifySubscribers();
  }

  async handleAuthCallback(code) {
    const verifier = localStorage.getItem(this.verifierKey);
    if (!verifier || !this.clientId) {
      console.warn('Spotify PKCE verifier or Client ID missing.');
      return;
    }

    const redirectUri = this.getRedirectUri();
    const params = new URLSearchParams();
    params.set('grant_type', 'authorization_code');
    params.set('code', code);
    params.set('redirect_uri', redirectUri);
    params.set('client_id', this.clientId);
    params.set('code_verifier', verifier);

    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error_description || 'Fehler beim Token-Abruf');
      }

      const data = await res.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token || this.refreshToken;
      this.expiresAt = Date.now() + (data.expires_in * 1000);

      localStorage.setItem(this.tokenKey, this.accessToken);
      if (data.refresh_token) localStorage.setItem(this.refreshTokenKey, this.refreshToken);
      localStorage.setItem(this.expiresAtKey, String(this.expiresAt));

      this.startPolling();
      this.notifySubscribers();
    } catch (e) {
      console.error('Spotify Auth Callback Failed:', e);
      if (window.orbitSuite && window.orbitSuite.showToast) {
        window.orbitSuite.showToast(`Spotify Auth Fehler: ${e.message}`, 'error');
      }
    }
  }

  async refreshAccessToken() {
    if (!this.refreshToken || !this.clientId) return false;

    const params = new URLSearchParams();
    params.set('grant_type', 'refresh_token');
    params.set('refresh_token', this.refreshToken);
    params.set('client_id', this.clientId);

    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (!res.ok) throw new Error('Token Refresh fehlgeschlagen');

      const data = await res.json();
      this.accessToken = data.access_token;
      if (data.refresh_token) this.refreshToken = data.refresh_token;
      this.expiresAt = Date.now() + (data.expires_in * 1000);

      localStorage.setItem(this.tokenKey, this.accessToken);
      if (data.refresh_token) localStorage.setItem(this.refreshTokenKey, this.refreshToken);
      localStorage.setItem(this.expiresAtKey, String(this.expiresAt));

      return true;
    } catch (e) {
      console.warn('Spotify Refresh Token Error:', e);
      this.logout();
      return false;
    }
  }

  async request(endpoint, options = {}) {
    if (Date.now() >= this.expiresAt - 60000) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed && !this.accessToken) {
        throw new Error('Nicht authentifiziert.');
      }
    }

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 204) return null; // No Content (e.g. Pause, Play, Seek success)
    if (res.status === 401) {
      await this.refreshAccessToken();
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      const retryRes = await fetch(`https://api.spotify.com/v1${endpoint}`, { ...options, headers });
      if (retryRes.status === 204) return null;
      return retryRes.json();
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err.error && err.error.message) || `HTTP ${res.status}`);
    }

    return res.json();
  }

  /* ==========================================================================
     Playback Controls & Data
     ========================================================================== */
  async fetchPlaybackState() {
    if (!this.isAuthenticated()) return null;
    try {
      const state = await this.request('/me/player');
      this.currentState = state;
      this.notifySubscribers();
      return state;
    } catch (e) {
      return null;
    }
  }

  async play(contextUri = null) {
    const body = contextUri ? JSON.stringify({ context_uri: contextUri }) : null;
    await this.request('/me/player/play', { method: 'PUT', body });
    setTimeout(() => this.fetchPlaybackState(), 400);
  }

  async pause() {
    await this.request('/me/player/pause', { method: 'PUT' });
    setTimeout(() => this.fetchPlaybackState(), 400);
  }

  async togglePlayPause() {
    if (this.currentState && this.currentState.is_playing) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async next() {
    await this.request('/me/player/next', { method: 'POST' });
    setTimeout(() => this.fetchPlaybackState(), 400);
  }

  async previous() {
    await this.request('/me/player/previous', { method: 'POST' });
    setTimeout(() => this.fetchPlaybackState(), 400);
  }

  async seek(positionMs) {
    await this.request(`/me/player/seek?position_ms=${Math.floor(positionMs)}`, { method: 'PUT' });
    if (this.currentState) this.currentState.progress_ms = positionMs;
    this.notifySubscribers();
  }

  async setVolume(volumePercent) {
    const vol = Math.max(0, Math.min(100, Math.round(volumePercent)));
    await this.request(`/me/player/volume?volume_percent=${vol}`, { method: 'PUT' });
  }

  async getPlaylists() {
    return this.request('/me/playlists?limit=12');
  }

  async getDevices() {
    return this.request('/me/player/devices');
  }

  startPolling() {
    if (this.pollInterval) return;
    this.fetchPlaybackState();
    this.pollInterval = setInterval(() => {
      this.fetchPlaybackState();
    }, 3500);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.currentState);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((cb) => cb(this.currentState));
  }

  /* ==========================================================================
     Crypto Helpers (PKCE)
     ========================================================================== */
  generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let text = '';
    const values = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < length; i++) {
      text += possible[values[i] % possible.length];
    }
    return text;
  }

  async generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}

window.SpotifyService = SpotifyService;
