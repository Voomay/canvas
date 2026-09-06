import { SoundFX } from '../systems/SoundFX';

export class TermsModal {
  private static activeModal: HTMLElement | null = null;

  public static open(onAccept?: () => void) {
    if (this.activeModal) {
      this.close();
    }

    const overlay = document.createElement('div');
    overlay.className = 'csa-terms-overlay';
    overlay.innerHTML = `
      <div class="csa-terms-card">
        <div class="csa-terms-header">
          <div class="csa-terms-header-text">
            <span class="csa-terms-badge">🇿🇦 PARODY &amp; SATIRE NOTICE</span>
            <h2 class="csa-terms-title">TERMS &amp; CONDITIONS</h2>
            <p class="csa-terms-subtitle">Important entertainment &amp; legal disclaimer for Canvassing SA</p>
          </div>
          <button class="csa-terms-close-btn" id="csa-terms-close" aria-label="Close">✕</button>
        </div>

        <div class="csa-terms-body">
          <div class="csa-terms-highlight">
            <div class="csa-terms-highlight-icon">🎮</div>
            <div class="csa-terms-highlight-content">
              <div class="csa-terms-highlight-title">THIS IS JUST A GAME!</div>
              <div class="csa-terms-highlight-desc">
                Canvassing SA is a lighthearted political parody created solely for comedy, satire, and entertainment purposes.
              </div>
            </div>
          </div>

          <div class="csa-terms-list">
            <div class="csa-terms-item">
              <div class="csa-terms-item-icon">⚖️</div>
              <div class="csa-terms-item-content">
                <h4>1. Satirical Caricatures &amp; Parody</h4>
                <p>
                  All political parties, candidates, community complaints, roadside events, dialogue choices, and character artwork are exaggerated caricatures and humorous fictionalizations of South African election campaigning.
                </p>
              </div>
            </div>

            <div class="csa-terms-item">
              <div class="csa-terms-item-icon">🚫</div>
              <div class="csa-terms-item-content">
                <h4>2. No Real-World Affiliation or Endorsements</h4>
                <p>
                  Nothing in this game constitutes real-world legal advice, formal political endorsements, factual claims, or actual municipal policies of any political party, organization, or government body.
                </p>
              </div>
            </div>

            <div class="csa-terms-item csa-terms-item-gold">
              <div class="csa-terms-item-icon">🤝</div>
              <div class="csa-terms-item-content">
                <h4>3. The Golden Rule: Please Do Not Sue Us! 😄</h4>
                <p>
                  <strong>Please do not sue us!</strong> We love South Africa, its vibrant culture, and its passionate democracy. This game is made in good fun to bring laughter to voters and candidates alike.
                </p>
              </div>
            </div>

            <div class="csa-terms-item">
              <div class="csa-terms-item-icon">🇿🇦</div>
              <div class="csa-terms-item-content">
                <h4>4. South African Sense of Humour</h4>
                <p>
                  By clicking agree and playing, you agree to take all voter drama, loud complaints, campaign promises, and pothole jumping with a healthy dose of South African humour!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="csa-terms-footer">
          <button class="csa-terms-accept-btn" id="csa-terms-accept">
            🤝 I AGREE — LET'S PLAY! 🇿🇦
          </button>
        </div>
      </div>
    `;

    this.injectStyles();
    document.body.appendChild(overlay);
    this.activeModal = overlay;

    // Prevent any clicks or touches inside or on overlay from bleeding into canvas
    const stopProp = (e: Event) => {
      e.stopPropagation();
    };
    ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click', 'touchstart', 'touchend'].forEach(evt => {
      overlay.addEventListener(evt, stopProp);
    });

    // Trigger opening animation
    requestAnimationFrame(() => {
      overlay.classList.add('csa-terms-visible');
    });

    const closeHandler = (e?: Event) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      SoundFX.getInstance().playButtonClick();
      this.close();
    };

    const acceptHandler = (e?: Event) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        localStorage.setItem('canvassing_terms_accepted', 'true');
      } catch (err) {
        console.warn('Could not save terms acceptance to localStorage:', err);
      }
      SoundFX.getInstance().playButtonClick();
      this.close();
      if (onAccept) onAccept();
    };

    const closeBtn = overlay.querySelector('#csa-terms-close');
    const acceptBtn = overlay.querySelector('#csa-terms-accept');

    closeBtn?.addEventListener('click', closeHandler);
    acceptBtn?.addEventListener('click', acceptHandler);

    // Also close on overlay click outside card
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        acceptHandler(e);
      }
    });

    // Escape key
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        acceptHandler();
        window.removeEventListener('keydown', escHandler);
      }
    };
    window.addEventListener('keydown', escHandler);
  }

  public static isAccepted(): boolean {
    try {
      return localStorage.getItem('canvassing_terms_accepted') === 'true';
    } catch {
      return false;
    }
  }

  public static close() {
    if (this.activeModal) {
      const modal = this.activeModal;
      modal.classList.remove('csa-terms-visible');
      setTimeout(() => {
        if (modal.parentNode) {
          modal.parentNode.removeChild(modal);
        }
      }, 240);
      this.activeModal = null;
    }
  }

  private static injectStyles() {
    if (document.getElementById('csa-terms-styles')) return;

    const style = document.createElement('style');
    style.id = 'csa-terms-styles';
    style.textContent = `
      .csa-terms-overlay {
        position: fixed;
        inset: 0;
        z-index: 10000;
        background: rgba(4, 9, 18, 0.86);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        pointer-events: auto;
        transition: opacity 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .csa-terms-overlay.csa-terms-visible {
        opacity: 1;
      }
      .csa-terms-card {
        background: linear-gradient(180deg, #0e1726 0%, #070d18 100%);
        border: 2px solid #233554;
        border-radius: 20px;
        width: 100%;
        max-width: 520px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(252, 184, 19, 0.12);
        transform: scale(0.92) translateY(12px);
        transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        overflow: hidden;
      }
      .csa-terms-overlay.csa-terms-visible .csa-terms-card {
        transform: scale(1) translateY(0);
      }
      .csa-terms-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 20px 22px 14px 22px;
        border-bottom: 1px solid #1a283e;
        background: rgba(14, 23, 38, 0.7);
      }
      .csa-terms-header-text {
        flex: 1;
      }
      .csa-terms-badge {
        display: inline-block;
        background: rgba(252, 184, 19, 0.12);
        color: #fcb813;
        border: 1px solid rgba(252, 184, 19, 0.35);
        font-size: 10.5px;
        font-weight: 800;
        letter-spacing: 0.6px;
        padding: 3px 9px;
        border-radius: 999px;
        margin-bottom: 6px;
        text-transform: uppercase;
      }
      .csa-terms-title {
        color: #ffffff;
        font-size: 21px;
        font-weight: 900;
        letter-spacing: -0.2px;
        margin: 0;
        line-height: 1.2;
      }
      .csa-terms-subtitle {
        color: #94a3b8;
        font-size: 12.5px;
        font-weight: 500;
        margin: 4px 0 0 0;
      }
      .csa-terms-close-btn {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #94a3b8;
        font-size: 16px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
        margin-left: 12px;
      }
      .csa-terms-close-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #ffffff;
        border-color: #ef4444;
      }
      .csa-terms-body {
        padding: 16px 22px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
        -webkit-overflow-scrolling: touch;
      }
      .csa-terms-body::-webkit-scrollbar {
        width: 6px;
      }
      .csa-terms-body::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
      }
      .csa-terms-body::-webkit-scrollbar-thumb {
        background: #233554;
        border-radius: 3px;
      }
      .csa-terms-highlight {
        display: flex;
        align-items: center;
        gap: 12px;
        background: linear-gradient(135deg, rgba(31, 145, 55, 0.18) 0%, rgba(14, 25, 42, 0.4) 100%);
        border: 1.5px solid #22c55e;
        border-radius: 14px;
        padding: 12px 14px;
      }
      .csa-terms-highlight-icon {
        font-size: 28px;
        line-height: 1;
        flex-shrink: 0;
      }
      .csa-terms-highlight-title {
        color: #4ade80;
        font-size: 14px;
        font-weight: 900;
        letter-spacing: 0.5px;
      }
      .csa-terms-highlight-desc {
        color: #f1f5f9;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.4;
        margin-top: 2px;
      }
      .csa-terms-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .csa-terms-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        background: rgba(14, 23, 38, 0.65);
        border: 1px solid #1a2942;
        border-radius: 12px;
        padding: 11px 13px;
      }
      .csa-terms-item-gold {
        background: rgba(252, 184, 19, 0.08);
        border-color: rgba(252, 184, 19, 0.35);
      }
      .csa-terms-item-icon {
        font-size: 18px;
        line-height: 1.2;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .csa-terms-item-content h4 {
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        margin: 0 0 3px 0;
      }
      .csa-terms-item-gold h4 {
        color: #fcb813;
      }
      .csa-terms-item-content p {
        color: #cbd5e1;
        font-size: 11.5px;
        line-height: 1.45;
        margin: 0;
        font-weight: 500;
      }
      .csa-terms-footer {
        padding: 14px 22px 18px 22px;
        border-top: 1px solid #1a283e;
        background: rgba(14, 23, 38, 0.85);
      }
      .csa-terms-accept-btn {
        width: 100%;
        background: linear-gradient(135deg, #1f9137 0%, #166534 100%);
        border: 2px solid #4ade80;
        color: #ffffff;
        font-family: inherit;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0.4px;
        padding: 13px 18px;
        border-radius: 12px;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(31, 145, 55, 0.45);
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
      .csa-terms-accept-btn:hover {
        background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
        border-color: #86efac;
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.6);
        transform: translateY(-1px);
      }
      .csa-terms-accept-btn:active {
        transform: translateY(1px);
      }

      @media (max-width: 480px) {
        .csa-terms-card {
          border-radius: 16px;
          max-height: 94vh;
        }
        .csa-terms-header {
          padding: 16px 16px 12px 16px;
        }
        .csa-terms-title {
          font-size: 18px;
        }
        .csa-terms-body {
          padding: 12px 16px;
          gap: 10px;
        }
        .csa-terms-footer {
          padding: 12px 16px 16px 16px;
        }
        .csa-terms-accept-btn {
          font-size: 14px;
          padding: 12px 14px;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
