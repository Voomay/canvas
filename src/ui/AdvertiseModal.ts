export interface AdInquiry {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  placements: string[];
  about: string;
  budget: string;
  submittedAt: string;
}

export class AdvertiseModal {
  private static activeModal: HTMLElement | null = null;

  public static open() {
    if (this.activeModal) {
      this.close();
    }

    const overlay = document.createElement('div');
    overlay.className = 'csa-ad-overlay';
    overlay.innerHTML = `
      <div class="csa-ad-card">
        <div class="csa-ad-header">
          <div>
            <span class="csa-ad-badge">📢 IN-GAME BRAND PARTNERSHIPS</span>
            <h2 class="csa-ad-title">ADVERTISE IN CANVASSING SA</h2>
            <p class="csa-ad-subtitle">Promote your brand on curbside minibus taxis, roadside billboards, and resident conversations!</p>
          </div>
          <button class="csa-ad-close-btn" id="csa-ad-close" aria-label="Close">✕</button>
        </div>

        <div id="csa-ad-form-container">
          <form id="csa-ad-form" class="csa-ad-form">
            <div class="csa-form-row">
              <div class="csa-form-group">
                <label for="csa-company">Company / Brand Name <span class="csa-req">*</span></label>
                <input type="text" id="csa-company" name="company" placeholder="e.g. Cape Takkies, Steers, Local Co." required />
              </div>
              <div class="csa-form-group">
                <label for="csa-name">Contact Person <span class="csa-req">*</span></label>
                <input type="text" id="csa-name" name="name" placeholder="e.g. Sarah / Sipho" required />
              </div>
            </div>

            <div class="csa-form-row">
              <div class="csa-form-group">
                <label for="csa-email">Business Email <span class="csa-req">*</span></label>
                <input type="email" id="csa-email" name="email" placeholder="partner@yourcompany.co.za" required />
              </div>
              <div class="csa-form-group">
                <label for="csa-phone">Phone / WhatsApp Number</label>
                <input type="tel" id="csa-phone" name="phone" placeholder="e.g. 082 123 4567" />
              </div>
            </div>

            <div class="csa-form-group">
              <label>Ad Space Opportunities in Game</label>
              <div class="csa-placement-options">
                <label class="csa-checkbox-pill">
                  <input type="checkbox" name="placement" value="Minibus Taxi Wrap" checked />
                  <span>🚐 Minibus Taxi Brand Wrap</span>
                </label>
                <label class="csa-checkbox-pill">
                  <input type="checkbox" name="placement" value="Roadside Billboards" checked />
                  <span>🪧 Roadside Billboards & Posters</span>
                </label>
                <label class="csa-checkbox-pill">
                  <input type="checkbox" name="placement" value="Resident Dialogues" />
                  <span>🗣️ Resident Dialogue Mention</span>
                </label>
                <label class="csa-checkbox-pill">
                  <input type="checkbox" name="placement" value="Victory Banner" />
                  <span>🏁 Ward Victory Banner Sponsor</span>
                </label>
              </div>
            </div>

            <div class="csa-form-group">
              <label for="csa-about">More About Your Company & Advertising Goals <span class="csa-req">*</span></label>
              <textarea id="csa-about" name="about" rows="3" placeholder="Tell us about your brand, target audience, products, or what you would like to promote..." required></textarea>
            </div>

            <div class="csa-form-group">
              <label for="csa-budget">Estimated Budget / Target Timeline</label>
              <select id="csa-budget" name="budget">
                <option value="R1,500 - R5,000 (Local Business Starter)">R1,500 – R5,000 (Local Business Starter)</option>
                <option value="R5,000 - R20,000 (Regional Campaign)" selected>R5,000 – R20,000 (Regional Campaign)</option>
                <option value="R20,000+ (National Headline Sponsor)">R20,000+ (National Headline Sponsor)</option>
                <option value="Custom / Just Exploring">Custom / Exploring Opportunities</option>
              </select>
            </div>

            <button type="submit" class="csa-ad-submit-btn">
              SUBMIT ADVERTISING INQUIRY 🚀
            </button>
          </form>
        </div>

        <div id="csa-ad-success" class="csa-ad-success" style="display: none;">
          <div class="csa-success-icon">🎉</div>
          <h3 class="csa-success-title">INQUIRY RECEIVED!</h3>
          <p class="csa-success-msg" id="csa-success-desc">
            Thank you! Our in-game advertising partnerships team has received your inquiry.
          </p>
          <div class="csa-success-details" id="csa-success-details"></div>
          <div class="csa-success-actions">
            <a href="#" id="csa-success-email-link" class="csa-btn-email-copy">
              ✉️ Send Direct Email Copy
            </a>
            <button type="button" class="csa-btn-done" id="csa-success-done">
              Done / Return to Game ✓
            </button>
          </div>
        </div>
      </div>
    `;

    this.injectStyles();

    document.body.appendChild(overlay);
    this.activeModal = overlay;

    // Close button & backdrop handlers
    const closeBtn = overlay.querySelector('#csa-ad-close');
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

    // Form submission
    const form = overlay.querySelector('#csa-ad-form') as HTMLFormElement;
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const company = (overlay.querySelector('#csa-company') as HTMLInputElement).value.trim();
      const name = (overlay.querySelector('#csa-name') as HTMLInputElement).value.trim();
      const email = (overlay.querySelector('#csa-email') as HTMLInputElement).value.trim();
      const phone = (overlay.querySelector('#csa-phone') as HTMLInputElement).value.trim();
      const about = (overlay.querySelector('#csa-about') as HTMLTextAreaElement).value.trim();
      const budget = (overlay.querySelector('#csa-budget') as HTMLSelectElement).value;

      const checkedPlacements = Array.from(overlay.querySelectorAll<HTMLInputElement>('input[name="placement"]:checked'))
        .map(input => input.value);

      const inquiry: AdInquiry = {
        companyName: company,
        contactName: name,
        email,
        phone,
        placements: checkedPlacements,
        about,
        budget,
        submittedAt: new Date().toISOString()
      };

      // Save to localStorage for persistence
      try {
        const stored = localStorage.getItem('canvassing_sa_ad_leads');
        const leads: AdInquiry[] = stored ? JSON.parse(stored) : [];
        leads.push(inquiry);
        localStorage.setItem('canvassing_sa_ad_leads', JSON.stringify(leads));
      } catch (err) {
        console.warn('Could not store lead in localStorage:', err);
      }

      // Prepare mailto link
      const emailSubject = `Canvassing SA Ad Partnership Inquiry: ${company}`;
      const emailBody = `Hi Canvassing SA Ad Partnerships Team,\n\n` +
        `We would like to inquire about in-game advertising space.\n\n` +
        `• Company: ${company}\n` +
        `• Contact: ${name}\n` +
        `• Email: ${email}\n` +
        `• Phone/WhatsApp: ${phone || 'N/A'}\n` +
        `• Desired Placements: ${checkedPlacements.join(', ') || 'All Opportunities'}\n` +
        `• Budget: ${budget}\n\n` +
        `About our company & goals:\n${about}\n\n` +
        `Looking forward to partnering!`;

      const mailtoUrl = `mailto:advertise@canvassingsa.co.za?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

      // Show success screen
      const formContainer = overlay.querySelector('#csa-ad-form-container') as HTMLElement;
      const successContainer = overlay.querySelector('#csa-ad-success') as HTMLElement;
      const successDesc = overlay.querySelector('#csa-success-desc') as HTMLElement;
      const successDetails = overlay.querySelector('#csa-success-details') as HTMLElement;
      const emailLink = overlay.querySelector('#csa-success-email-link') as HTMLAnchorElement;
      const doneBtn = overlay.querySelector('#csa-success-done');

      if (formContainer && successContainer) {
        formContainer.style.display = 'none';
        successContainer.style.display = 'block';

        if (successDesc) {
          successDesc.innerHTML = `Thank you, <strong>${name}</strong>! We are thrilled to partner with <strong>${company}</strong>.<br/>Our advertising partnerships team has received your details and will contact you at <strong>${email}</strong> within 24 hours.`;
        }

        if (successDetails) {
          successDetails.innerHTML = `
            <div class="csa-lead-summary">
              <div>🎯 <strong>Selected Ad Spaces:</strong> ${checkedPlacements.join(', ') || 'General Sponsorship'}</div>
              <div>💼 <strong>Budget Category:</strong> ${budget}</div>
            </div>
          `;
        }

        if (emailLink) {
          emailLink.href = mailtoUrl;
        }

        doneBtn?.addEventListener('click', () => this.close());
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

  private static injectStyles() {
    if (document.getElementById('csa-ad-styles')) return;

    const style = document.createElement('style');
    style.id = 'csa-ad-styles';
    style.textContent = `
      .csa-ad-overlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: rgba(7, 12, 20, 0.88);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        animation: csaFadeIn 0.22s ease-out;
        user-select: text;
        touch-action: auto;
      }
      .csa-ad-overlay.csa-closing {
        animation: csaFadeOut 0.2s ease-in forwards;
      }
      .csa-ad-card {
        background: linear-gradient(180deg, #101c2e 0%, #0a1320 100%);
        border: 2px solid #fcb813;
        box-shadow: 0 24px 52px rgba(0, 0, 0, 0.7), 0 0 28px rgba(252, 184, 19, 0.25);
        border-radius: 20px;
        width: 100%;
        max-width: 580px;
        padding: 24px 28px;
        position: relative;
        color: #ffffff;
        font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        animation: csaScaleUp 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        max-height: 92vh;
        overflow-y: auto;
      }
      .csa-ad-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 14px;
      }
      .csa-ad-badge {
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
      .csa-ad-title {
        font-size: 24px;
        font-weight: 900;
        color: #ffffff;
        margin: 0 0 4px 0;
        line-height: 1.2;
      }
      .csa-ad-subtitle {
        font-size: 13px;
        color: #94a3b8;
        font-weight: 500;
        margin: 0;
        line-height: 1.4;
      }
      .csa-ad-close-btn {
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
        flex-shrink: 0;
        margin-left: 12px;
      }
      .csa-ad-close-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border-color: #ef4444;
      }
      .csa-ad-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .csa-form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 500px) {
        .csa-form-row {
          grid-template-columns: 1fr;
        }
      }
      .csa-form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .csa-form-group label {
        font-size: 12.5px;
        font-weight: 700;
        color: #cbd5e1;
      }
      .csa-req {
        color: #ef4444;
      }
      .csa-form-group input,
      .csa-form-group select,
      .csa-form-group textarea {
        background: rgba(14, 25, 42, 0.9);
        border: 1.5px solid #1f3c6e;
        border-radius: 10px;
        padding: 10px 14px;
        color: #ffffff;
        font-family: inherit;
        font-size: 13.5px;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .csa-form-group input:focus,
      .csa-form-group select:focus,
      .csa-form-group textarea:focus {
        border-color: #fcb813;
        box-shadow: 0 0 0 3px rgba(252, 184, 19, 0.15);
      }
      .csa-form-group input::placeholder,
      .csa-form-group textarea::placeholder {
        color: #64748b;
      }
      .csa-form-group textarea {
        resize: vertical;
        min-height: 70px;
      }
      .csa-placement-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      @media (max-width: 480px) {
        .csa-placement-options {
          grid-template-columns: 1fr;
        }
      }
      .csa-checkbox-pill {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        color: #e2e8f0;
        transition: all 0.15s ease;
      }
      .csa-checkbox-pill:hover {
        background: rgba(255, 255, 255, 0.09);
        border-color: #fcb813;
      }
      .csa-checkbox-pill input {
        cursor: pointer;
        accent-color: #fcb813;
      }
      .csa-ad-submit-btn {
        background: linear-gradient(135deg, #1f9137 0%, #177a2d 100%);
        border: 2px solid #34d399;
        color: #ffffff;
        font-size: 16px;
        font-weight: 900;
        letter-spacing: 0.5px;
        padding: 14px;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.15s ease;
        margin-top: 6px;
      }
      .csa-ad-submit-btn:hover {
        background: linear-gradient(135deg, #27ab42 0%, #1f9137 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(31, 145, 55, 0.4);
      }
      .csa-ad-submit-btn:active {
        transform: translateY(0);
      }
      .csa-ad-success {
        text-align: center;
        padding: 24px 12px;
        animation: csaFadeIn 0.3s ease;
      }
      .csa-success-icon {
        font-size: 52px;
        margin-bottom: 12px;
      }
      .csa-success-title {
        font-size: 26px;
        font-weight: 900;
        color: #4ade80;
        margin-bottom: 10px;
      }
      .csa-success-msg {
        font-size: 14.5px;
        color: #e2e8f0;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .csa-lead-summary {
        background: rgba(14, 25, 42, 0.95);
        border: 1.5px solid #1f3c6e;
        border-radius: 12px;
        padding: 12px 16px;
        margin: 0 auto 24px auto;
        text-align: left;
        font-size: 13px;
        color: #cbd5e1;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .csa-success-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .csa-btn-email-copy {
        background: #1f3c6e;
        border: 1px solid #3b82f6;
        color: #ffffff;
        padding: 11px 18px;
        border-radius: 10px;
        text-decoration: none;
        font-size: 13.5px;
        font-weight: 700;
        transition: all 0.15s ease;
      }
      .csa-btn-email-copy:hover {
        background: #2b5294;
      }
      .csa-btn-done {
        background: #1f9137;
        border: 1px solid #34d399;
        color: #ffffff;
        padding: 11px 22px;
        border-radius: 10px;
        cursor: pointer;
        font-size: 13.5px;
        font-weight: 700;
        transition: all 0.15s ease;
      }
      .csa-btn-done:hover {
        background: #27ab42;
      }
    `;
    document.head.appendChild(style);
  }
}
