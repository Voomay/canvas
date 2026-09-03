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
    
    // Construct rich share messages
    const shareSubject = data.isTotalCampaign
      ? `🇿🇦 FINAL ELECTION VICTORY: ${data.partyName} conquered South Africa in Canvassing SA!`
      : `🇿🇦 WARD VICTORY: ${data.partyName} won ${data.wardName}!`;

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
        `I just led ${data.partyFullName} (${data.partyName}) to victory in ${data.wardName} (${data.suburb})!\n\n` +
        `🏆 Ward Achievements:\n` +
        `• 🗳️ Votes Secured: ${data.votesSecured}/${data.targetVotes} in 30s\n` +
        `• 🤝 Community Trust: ${Math.round(data.trustPercent)}%\n` +
        `• 🛠️ Infrastructure Fixed: ${data.obstaclesCleared} Potholes & Hazards\n` +
        `• 🗣️ Residents Convinced: ${data.residentsApproached}\n\n` +
        `Think your political party can win South Africa? Play Canvassing SA now!`;

    const shortTwitterText = data.isTotalCampaign
      ? `🗳️ I just led ${data.partyName} to victory in Canvassing SA! Secured ${data.votesSecured} votes with ${Math.round(data.trustPercent)}% trust. Can your party win? 🇿🇦`
      : `🗳️ Victory! I just won ${data.wardName} for the ${data.partyName} in Canvassing SA! Secured ${data.votesSecured}/${data.targetVotes} votes. Can your party win? 🇿🇦`;

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
            <p class="csa-share-subtitle">${data.partyFullName} (${data.partyName}) • ${data.wardName}</p>
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
            "I just led ${data.partyName} to victory in ${data.wardName}! Can your party win South Africa?"
          </div>
        </div>

        <div class="csa-share-actions-grid">
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-wa">
            <span class="csa-btn-icon">💬</span>
            <span class="csa-btn-text">WhatsApp</span>
          </a>
          <a href="${xUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-x">
            <span class="csa-btn-icon">𝕏</span>
            <span class="csa-btn-text">X / Twitter</span>
          </a>
          <a href="${fbUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-fb">
            <span class="csa-btn-icon">📘</span>
            <span class="csa-btn-text">Facebook</span>
          </a>
          <a href="${liUrl}" target="_blank" rel="noopener noreferrer" class="csa-share-btn csa-btn-li">
            <span class="csa-btn-icon">💼</span>
            <span class="csa-btn-text">LinkedIn</span>
          </a>
          <a href="${mailUrl}" class="csa-share-btn csa-btn-mail">
            <span class="csa-btn-icon">✉️</span>
            <span class="csa-btn-text">Email</span>
          </a>
          <button type="button" class="csa-share-btn csa-btn-copy" id="csa-share-copy">
            <span class="csa-btn-icon">📋</span>
            <span class="csa-btn-text" id="csa-copy-label">Copy Link</span>
          </button>
        </div>

        ${typeof navigator !== 'undefined' && 'share' in navigator ? `
          <button type="button" class="csa-native-share-btn" id="csa-native-share">
            📲 More Sharing Options (Device Share)
          </button>
        ` : ''}

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

    // Native device share if supported
    const nativeBtn = overlay.querySelector('#csa-native-share');
    nativeBtn?.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: shareSubject,
            text: shareText,
            url: shareUrl
          });
        } catch (err) {
          // User dismissed share sheet
        }
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
      .csa-preview-party.pa { background: #1e6b38; color: #ffffff; }
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
        font-size: 20px;
        margin-bottom: 4px;
      }
      .csa-btn-wa { background: #25d366; }
      .csa-btn-x { background: #000000; border: 1px solid #334155; }
      .csa-btn-fb { background: #1877f2; }
      .csa-btn-li { background: #0a66c2; }
      .csa-btn-mail { background: #ea4335; }
      .csa-btn-copy { background: #223552; border: 1px solid #3b82f6; }
      .csa-native-share-btn {
        width: 100%;
        padding: 11px;
        background: rgba(255, 255, 255, 0.07);
        border: 1.5px solid rgba(255, 255, 255, 0.15);
        color: #e2e8f0;
        font-size: 13px;
        font-weight: 700;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        margin-bottom: 4px;
      }
      .csa-native-share-btn:hover {
        background: rgba(255, 255, 255, 0.12);
        border-color: #fcb813;
        color: #ffffff;
      }
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
