export interface ShareVictoryData {
  partyName: string;
  partyFullName: string;
  partyId: 'da' | 'anc' | 'pa';
  wardName: string;
  suburb: string;
  votesSecured: number;
  targetVotes: number;
  trustPercent: number;
  obstaclesCleared: number;
  residentsApproached: number;
  areaIndex: number;
  isTotalCampaign?: boolean;
}

export class ShareModal {
  private static activeModal: HTMLElement | null = null;

  public static open(data: ShareVictoryData) {
    if (this.activeModal) {
      this.close();
    }

    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://canvassingsa.co.za';
    const cleanWardName = data.wardName.replace(/^Area\s*/i, 'Ward ');
    
    // Construct rich share messages
    const shareSubject = data.isTotalCampaign
      ? `🇿🇦 FINAL ELECTION VICTORY: ${data.partyName} conquered South Africa in Canvassing SA!`
      : `🇿🇦 WARD VICTORY: ${data.partyName} won ${cleanWardName}!`;

    const shareText = data.isTotalCampaign
      ? `🗳️ FINAL ELECTION VICTORY IN CANVASSING SA! 🇿🇦\n` +
        `I just led ${data.partyFullName} (${data.partyName}) across South Africa!\n\n` +
        `🏆 Final Campaign Stats:\n` +
        `• 🗳️ Total Votes: ${data.votesSecured}\n` +
        `• 🤝 Community Trust: ${Math.round(data.trustPercent)}%\n` +
        `• 🛠️ Infrastructure Hazards Fixed: ${data.obstaclesCleared}\n` +
        `• 🗣️ Residents Convinced: ${data.residentsApproached}\n\n` +
        `Can your political party win the vote? Play Canvassing SA now!`
      : `🗳️ WARD VICTORY IN CANVASSING SA! 🇿🇦\n` +
        `I just led ${data.partyFullName} (${data.partyName}) to victory in ${cleanWardName} (${data.suburb})!\n\n` +
        `🏆 Ward Achievements:\n` +
        `• 🗳️ Votes Secured: ${data.votesSecured}/${data.targetVotes} in 30s\n` +
        `• 🤝 Community Trust: ${Math.round(data.trustPercent)}%\n` +
        `• 🛠️ Infrastructure Fixed: ${data.obstaclesCleared} Potholes & Hazards\n` +
        `• 🗣️ Residents Convinced: ${data.residentsApproached}\n\n` +
        `Think your political party can win South Africa? Play Canvassing SA now!`;

    const shortTwitterText = data.isTotalCampaign
      ? `🗳️ I just led ${data.partyName} to victory in Canvassing SA! Secured ${data.votesSecured} votes with ${Math.round(data.trustPercent)}% trust. Can your party win? 🇿🇦`
      : `🗳️ Victory! I just won ${cleanWardName} for the ${data.partyName} in Canvassing SA! Secured ${data.votesSecured}/${data.targetVotes} votes. Can your party win? 🇿🇦`;

    // Social Links
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n\nPlay here: ' + shareUrl)}`;
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortTwitterText)}&url=${encodeURIComponent(shareUrl)}&hashtags=CanvassingSA,SouthAfrica,Elections`;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    const mailUrl = `mailto:?subject=${encodeURIComponent(shareSubject)}&body=${encodeURIComponent(shareText + '\n\nPlay Canvassing SA here:\n' + shareUrl)}`;

    const overlay = document.createElement('div');
    overlay.className = 'csa-share-overlay';
    overlay.innerHTML = `
      <div class="csa-share-card">
        <div class="csa-share-header">
          <div class="csa-share-title-wrap">
            <span class="csa-share-badge">🇿🇦 OFFICIAL RESULTS</span>
            <h2 class="csa-share-title">SHARE YOUR VICTORY!</h2>
            <p class="csa-share-subtitle">${data.partyFullName} (${data.partyName}) • ${cleanWardName}</p>
          </div>
          <button class="csa-share-close-btn" id="csa-share-close" aria-label="Close">✕</button>
        </div>

        <div class="csa-share-preview">
          <div class="csa-preview-header">
            <span class="csa-preview-tag">🏆 ${data.isTotalCampaign ? 'ELECTION CHAMPION' : 'ELECTED WARD COUNCILLOR'}</span>
            <span class="csa-preview-party ${data.partyId}">${data.partyName}</span>
          </div>
          <div class="csa-preview-stats">
            <div class="csa-stat-chip">🗳️ <strong>${data.votesSecured}</strong> Votes</div>
            <div class="csa-stat-chip">🤝 <strong>${Math.round(data.trustPercent)}%</strong> Trust</div>
            <div class="csa-stat-chip">🛠️ <strong>${data.obstaclesCleared}</strong> Fixed</div>
          </div>
          <div class="csa-preview-quote">
            "I just led ${data.partyName} to victory in ${cleanWardName}! Can your party win South Africa?"
          </div>
        </div>

        <div class="csa-share-actions-grid">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-wa">
            <span class="csa-btn-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19.53-1.09 1.04-1.52 1.09-.43.05-.98.07-3.13-.82-2.15-.89-3.52-3.11-3.63-3.26-.11-.15-.87-1.16-.87-2.22 0-1.06.55-1.58.75-1.8.2-.21.43-.27.58-.27.15 0 .29 0 .42.01.13.01.31-.05.49.38.18.43.62 1.51.68 1.62.05.11.09.24.02.38-.07.15-.11.24-.22.37-.11.13-.23.29-.33.39-.11.11-.23.23-.1.45.13.22.58.96 1.24 1.55.85.76 1.57 1 1.79 1.11.22.11.36.09.49-.05.13-.15.57-.66.72-.89.15-.22.31-.19.52-.11.21.08 1.34.63 1.57.75.23.11.38.17.43.27.05.1.05.58-.14 1.11z"/>
              </svg>
            </span>
            <span class="csa-btn-text">WhatsApp</span>
          </a>
          <a href="${xUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-x">
            <span class="csa-btn-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </span>
            <span class="csa-btn-text">X / Twitter</span>
          </a>
          <a href="${fbUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-fb">
            <span class="csa-btn-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </span>
            <span class="csa-btn-text">Facebook</span>
          </a>
          <a href="${liUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-li">
            <span class="csa-btn-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </span>
            <span class="csa-btn-text">LinkedIn</span>
          </a>
          <a href="${mailUrl}" class="csa-share-btn csa-btn-mail">
            <span class="csa-btn-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </span>
            <span class="csa-btn-text">Email</span>
          </a>
          <button type="button" class="csa-share-btn csa-btn-copy" id="csa-share-copy">
            <span class="csa-btn-icon">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </span>
            <span class="csa-btn-text" id="csa-copy-label">Copy Link</span>
          </button>
        </div>

        <div class="csa-share-toast" id="csa-share-toast"></div>
      </div>
    `;

    // Inject styles once if not present
    this.injectStyles();

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    // Attach listeners
    const closeBtn = overlay.querySelector('#csa-share-close');
    closeBtn?.addEventListener('click', () => this.close());

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close();
      }
    });

    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        window.removeEventListener('keydown', onKeydown);
      }
    };
    window.addEventListener('keydown', onKeydown);

    // Copy Link button
    const copyBtn = overlay.querySelector('#csa-share-copy');
    copyBtn?.addEventListener('click', async () => {
      try {
        const fullShareContent = `${shareText}\n\nPlay Canvassing SA: ${shareUrl}`;
        await navigator.clipboard.writeText(fullShareContent);
        this.showToast('✅ Victory details & link copied to clipboard!');
        const label = overlay.querySelector('#csa-copy-label');
        if (label) label.textContent = 'Copied! ✓';
        setTimeout(() => {
          if (label) label.textContent = 'Copy Link';
        }, 2200);
      } catch (err) {
        this.showToast('⚠️ Could not copy automatically. Link: ' + shareUrl);
      }
    });
  }

  public static close() {
    if (this.activeModal) {
      this.activeModal.classList.add('csa-closing');
      setTimeout(() => {
        if (this.activeModal && this.activeModal.parentNode) {
          this.activeModal.parentNode.removeChild(this.activeModal);
        }
        this.activeModal = null;
      }, 200);
    }
  }

  private static showToast(message: string) {
    const toast = this.activeModal?.querySelector('#csa-share-toast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('visible');
      setTimeout(() => {
        toast.classList.remove('visible');
      }, 2500);
    }
  }

  private static injectStyles() {
    if (document.getElementById('csa-share-styles')) return;

    const style = document.createElement('style');
    style.id = 'csa-share-styles';
    style.textContent = `
      .csa-share-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(7, 12, 20, 0.84);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: csaFadeIn 0.22s ease-out;
        user-select: none;
        touch-action: auto;
      }
      .csa-share-overlay.csa-closing {
        animation: csaFadeOut 0.2s ease-in forwards;
      }
      .csa-share-card {
        background: linear-gradient(180deg, #111e30 0%, #0c1524 100%);
        border: 2px solid #fcb813;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.6), 0 0 24px rgba(252, 184, 19, 0.2);
        border-radius: 20px;
        width: 100%;
        max-width: 500px;
        padding: 24px;
        position: relative;
        color: #ffffff;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        animation: csaScaleUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 90vh;
        overflow-y: auto;
      }
      .csa-share-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 18px;
      }
      .csa-share-badge {
        display: inline-block;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.8px;
        color: #fcb813;
        background: rgba(252, 184, 19, 0.12);
        border: 1px solid rgba(252, 184, 19, 0.4);
        padding: 4px 10px;
        border-radius: 20px;
        margin-bottom: 6px;
      }
      .csa-share-title {
        font-size: 24px;
        font-weight: 900;
        color: #ffffff;
        margin: 0 0 4px 0;
        line-height: 1.2;
      }
      .csa-share-subtitle {
        font-size: 13.5px;
        color: #94a3b8;
        font-weight: 600;
        margin: 0;
      }
      .csa-share-close-btn {
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #94a3b8;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }
      .csa-share-close-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border-color: #ef4444;
      }
      .csa-share-preview {
        background: rgba(14, 25, 42, 0.95);
        border: 1.5px solid #1f3c6e;
        border-radius: 14px;
        padding: 14px 16px;
        margin-bottom: 20px;
      }
      .csa-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .csa-preview-tag {
        font-size: 11px;
        font-weight: 800;
        color: #4ade80;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .csa-preview-party {
        font-size: 12px;
        font-weight: 900;
        padding: 3px 8px;
        border-radius: 6px;
      }
      .csa-preview-party.da { background: #005ba6; color: #ffffff; }
      .csa-preview-party.anc { background: #fcb813; color: #0c1524; }
      .csa-preview-party.pa { background: #4ea81e; color: #ffffff; }
      .csa-preview-stats {
        display: flex;
        gap: 8px;
        margin-bottom: 10px;
        flex-wrap: wrap;
      }
      .csa-stat-chip {
        font-size: 12.5px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 5px 10px;
        border-radius: 8px;
        color: #e2e8f0;
      }
      .csa-stat-chip strong {
        color: #fcb813;
      }
      .csa-preview-quote {
        font-size: 12px;
        font-style: italic;
        color: #94a3b8;
        line-height: 1.4;
      }
      .csa-share-actions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 14px;
      }
      @media (max-width: 440px) {
        .csa-share-actions-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      .csa-share-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 12px 8px;
        border-radius: 12px;
        text-decoration: none;
        color: #ffffff;
        font-size: 12px;
        font-weight: 700;
        border: none;
        cursor: pointer;
        transition: transform 0.12s ease, filter 0.15s ease;
      }
      .csa-share-btn:hover {
        transform: translateY(-2px);
        filter: brightness(1.15);
      }
      .csa-share-btn:active {
        transform: translateY(0);
      }
      .csa-btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
      }
      .csa-btn-icon svg {
        display: block;
      }
      .csa-btn-wa { background: #25d366; }
      .csa-btn-x { background: #000000; border: 1px solid #334155; }
      .csa-btn-fb { background: #1877f2; }
      .csa-btn-li { background: #0a66c2; }
      .csa-btn-mail { background: #ea4335; }
      .csa-btn-copy { background: #223552; border: 1px solid #3b82f6; }
      .csa-share-toast {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%) translateY(10px);
        background: #10b981;
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        padding: 8px 18px;
        border-radius: 20px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        opacity: 0;
        pointer-events: none;
        transition: all 0.2s ease;
        white-space: nowrap;
      }
      .csa-share-toast.visible {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
      @keyframes csaFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes csaFadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      @keyframes csaScaleUp {
        from { transform: scale(0.94); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}
