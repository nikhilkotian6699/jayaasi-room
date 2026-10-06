'use client';

/**
 * AdminQrPanel — QR management panel for a specific room.
 *
 * Shown inside the admin room inspector. Allows:
 * - View active QR
 * - Generate / regenerate QR
 * - Revoke QR
 * - View active sessions + revoke session
 * - Display QR code image (uses qrserver.com API for rendering — no npm dependency)
 */

import { useState, useEffect, useCallback } from 'react';

const QR_API = (text) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&margin=2`;

const COPY_TIMEOUT = 2000;

/**
 * @param {{ roomId: string; roomNumber: string; hotelCode: string }} props
 */
export default function AdminQrPanel({ roomId, roomNumber, hotelCode }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' | 'sessions'
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchQr = useCallback(async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/rooms/${roomId}/qr`);
      const data = await res.json();
      if (data.success) setQrData(data);
    } catch (err) {
      console.error('fetchQr error:', err);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const fetchSessions = useCallback(async () => {
    if (!roomId) return;
    setSessionsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/rooms/${roomId}/sessions`);
      const data = await res.json();
      if (data.success) setSessions(data.sessions || []);
    } catch (err) {
      console.error('fetchSessions error:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchQr();
  }, [fetchQr]);

  useEffect(() => {
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab, fetchSessions]);

  const handleGenerateQr = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/v1/admin/rooms/${roomId}/qr`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchQr();
        showToast(`QR v${data.qr.qrVersion} generated for Room ${roomNumber}`);
      }
    } catch (err) {
      showToast('Failed to generate QR', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleRevokeQr = async () => {
    if (!confirm(`Revoke active QR for Room ${roomNumber}? The physical QR will stop working immediately.`)) return;
    setRevoking(true);
    try {
      const res = await fetch(`/api/v1/admin/rooms/${roomId}/qr`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await fetchQr();
        showToast('QR revoked. Generate a new one when ready.', 'warning');
      }
    } catch (err) {
      showToast('Failed to revoke QR', 'error');
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/v1/admin/rooms/${roomId}/sessions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchSessions();
        showToast('Session revoked');
      }
    } catch (err) {
      showToast('Failed to revoke session', 'error');
    }
  };

  const handleCopyUrl = () => {
    if (!qrData?.qrUrl) return;
    navigator.clipboard.writeText(qrData.qrUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_TIMEOUT);
    });
  };

  const handleDownloadQr = () => {
    if (!qrData?.qrUrl) return;
    const url = QR_API(qrData.qrUrl);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jayaasi-room-${roomNumber}-qr.png`;
    a.target = '_blank';
    a.click();
  };

  if (loading) {
    return (
      <div className="admin-qr-panel admin-qr-panel--loading">
        <div className="admin-qr-panel__spinner" />
        <span>Loading QR data…</span>
      </div>
    );
  }

  const activeQr = qrData?.active;
  const qrUrl = qrData?.qrUrl;

  return (
    <div className="admin-qr-panel">
      {/* Toast */}
      {toast && (
        <div className={`admin-qr-panel__toast admin-qr-panel__toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="admin-qr-panel__tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'qr'}
          className={`admin-qr-panel__tab${activeTab === 'qr' ? ' admin-qr-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('qr')}
          id="qr-tab"
        >
          🔲 QR Code
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'sessions'}
          className={`admin-qr-panel__tab${activeTab === 'sessions' ? ' admin-qr-panel__tab--active' : ''}`}
          onClick={() => setActiveTab('sessions')}
          id="sessions-tab"
        >
          🔑 Sessions
        </button>
      </div>

      {/* QR Tab */}
      {activeTab === 'qr' && (
        <div className="admin-qr-panel__qr-content" role="tabpanel" aria-labelledby="qr-tab">
          {/* Status badge */}
          <div className="admin-qr-panel__status-row">
            <span className="admin-qr-panel__status-label">QR Status</span>
            {activeQr ? (
              <span className="admin-qr-panel__badge admin-qr-panel__badge--active">
                ● Active (v{activeQr.qrVersion})
              </span>
            ) : (
              <span className="admin-qr-panel__badge admin-qr-panel__badge--inactive">
                ✕ No Active QR
              </span>
            )}
          </div>

          {/* QR image preview */}
          {activeQr && qrUrl && (
            <div className="admin-qr-panel__qr-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={QR_API(qrUrl)}
                alt={`QR code for Room ${roomNumber}`}
                width={200}
                height={200}
                className="admin-qr-panel__qr-img"
              />
              <div className="admin-qr-panel__qr-id">ID: {activeQr.qrPublicId}</div>
            </div>
          )}

          {/* URL display */}
          {qrUrl && (
            <div className="admin-qr-panel__url-section">
              <div className="admin-qr-panel__url-label">Permanent URL</div>
              <div className="admin-qr-panel__url-box">
                <code className="admin-qr-panel__url-text">{qrUrl}</code>
                <button
                  className="admin-qr-panel__copy-btn"
                  onClick={handleCopyUrl}
                  id={`copy-qr-url-${roomId}`}
                  title="Copy URL"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="admin-qr-panel__actions">
            <button
              id={`generate-qr-${roomId}`}
              className="admin-qr-panel__btn admin-qr-panel__btn--primary"
              onClick={handleGenerateQr}
              disabled={generating}
            >
              {generating ? '⟳ Generating…' : activeQr ? '⟳ Regenerate QR' : '+ Generate QR'}
            </button>

            {activeQr && (
              <>
                <button
                  id={`download-qr-${roomId}`}
                  className="admin-qr-panel__btn admin-qr-panel__btn--secondary"
                  onClick={handleDownloadQr}
                >
                  ⬇ Download PNG
                </button>
                <button
                  id={`revoke-qr-${roomId}`}
                  className="admin-qr-panel__btn admin-qr-panel__btn--danger"
                  onClick={handleRevokeQr}
                  disabled={revoking}
                >
                  {revoking ? '…' : '✕ Revoke QR'}
                </button>
              </>
            )}
          </div>

          {/* History */}
          {qrData?.history?.length > 0 && (
            <div className="admin-qr-panel__history">
              <div className="admin-qr-panel__history-title">Version History</div>
              <div className="admin-qr-panel__history-list">
                {qrData.history.map((q) => (
                  <div key={q.id} className="admin-qr-panel__history-row">
                    <span className="admin-qr-panel__history-version">v{q.qrVersion}</span>
                    <span className={`admin-qr-panel__history-status ${q.status === 'ACTIVE' ? 'text-green' : 'text-muted'}`}>
                      {q.status}
                    </span>
                    <span className="admin-qr-panel__history-date">
                      {new Date(q.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="admin-qr-panel__sessions-content" role="tabpanel" aria-labelledby="sessions-tab">
          <div className="admin-qr-panel__sessions-header">
            <span className="admin-qr-panel__sessions-count">
              {sessions.length} active session{sessions.length !== 1 ? 's' : ''}
            </span>
            <button
              className="admin-qr-panel__btn admin-qr-panel__btn--ghost"
              onClick={fetchSessions}
              disabled={sessionsLoading}
            >
              ↻ Refresh
            </button>
          </div>

          {sessionsLoading ? (
            <div className="admin-qr-panel__sessions-loading">Loading sessions…</div>
          ) : sessions.length === 0 ? (
            <div className="admin-qr-panel__sessions-empty">No active sessions for this room.</div>
          ) : (
            <div className="admin-qr-panel__sessions-list">
              {sessions.map((s) => {
                const remaining = Math.max(0, Math.floor((new Date(s.expiresAt) - Date.now()) / 1000));
                return (
                  <div key={s.id} className="admin-qr-panel__session-row">
                    <div className="admin-qr-panel__session-meta">
                      <span className="admin-qr-panel__session-id">
                        {s.id.slice(0, 8)}…
                      </span>
                      <span className="admin-qr-panel__session-expires">
                        Expires in {remaining}s
                      </span>
                    </div>
                    <button
                      id={`revoke-session-${s.id}`}
                      className="admin-qr-panel__btn admin-qr-panel__btn--danger-sm"
                      onClick={() => handleRevokeSession(s.id)}
                    >
                      Revoke
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
