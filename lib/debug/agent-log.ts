'use client';

type AgentLogPayload = {
  location: string;
  message: string;
  data?: Record<string, unknown>;
  hypothesisId: string;
  runId?: string;
};

export function agentLog(payload: AgentLogPayload) {
  const entry = {
    sessionId: '8f92a2',
    timestamp: Date.now(),
    ...payload,
  };

  // Visible en consola de Xcode / Safari Web Inspector
  console.log('[DBG-8f92a2]', JSON.stringify(entry));

  // #region agent log
  if (typeof fetch !== 'undefined') {
    fetch('http://127.0.0.1:7734/ingest/a96e22fe-7db9-467b-a658-0c1b519fae26', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Session-Id': '8f92a2',
      },
      body: JSON.stringify(entry),
    }).catch(() => {});
  }
  // #endregion
}
