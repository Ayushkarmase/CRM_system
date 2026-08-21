/**
 * DeskFlow Client Embeddable Support Widget
 * Drop this script onto any website to capture support tickets directly into DeskFlow CRM.
 */
(function () {
  const config = window.DeskFlowConfig || {};
  const apiUrl = config.apiUrl || 'http://localhost:8000/api/tickets';
  const themeColor = config.themeColor || '#0f172a';
  const buttonText = config.buttonText || 'Contact Support';
  const defaultPriority = config.defaultPriority || 'Medium';

  // Inject Styles
  const style = document.createElement('style');
  style.innerHTML = `
    .df-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: ${themeColor};
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 9999px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
      cursor: pointer;
      border: none;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 999999;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .df-widget-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px -5px rgba(0,0,0,0.4);
    }
    .df-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000000;
    }
    .df-modal-card {
      background: #ffffff;
      width: 100%;
      max-width: 440px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .df-modal-header {
      background: ${themeColor};
      color: #ffffff;
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .df-modal-body {
      padding: 20px;
    }
    .df-input {
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 13px;
      box-sizing: border-box;
    }
    .df-input:focus {
      outline: none;
      border-color: #0f172a;
    }
    .df-submit-btn {
      width: 100%;
      background: ${themeColor};
      color: #ffffff;
      padding: 12px;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  // Create Trigger Button
  const btn = document.createElement('button');
  btn.className = 'df-widget-btn';
  btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> <span>${buttonText}</span>`;
  document.body.appendChild(btn);

  let modal = null;

  btn.addEventListener('click', () => {
    if (modal) {
      modal.remove();
      modal = null;
      return;
    }

    modal = document.createElement('div');
    modal.className = 'df-modal-backdrop';
    modal.innerHTML = `
      <div class="df-modal-card">
        <div class="df-modal-header">
          <strong style="font-size: 15px;">Send Support Ticket</strong>
          <button id="df-close" style="background:transparent; border:none; color:#fff; font-size:18px; cursor:pointer;">&times;</button>
        </div>
        <form id="df-form" class="df-modal-body">
          <input type="text" id="df-name" class="df-input" placeholder="Your Full Name" required />
          <input type="email" id="df-email" class="df-input" placeholder="Your Email Address" required />
          <input type="text" id="df-subject" class="df-input" placeholder="What can we help you with?" required />
          <textarea id="df-desc" class="df-input" rows="3" placeholder="Describe the issue in detail..." required></textarea>
          <button type="submit" id="df-submit" class="df-submit-btn">Submit Ticket</button>
          <div id="df-result" style="margin-top: 12px; font-size: 12px; display: none;"></div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#df-close').addEventListener('click', () => {
      modal.remove();
      modal = null;
    });

    modal.querySelector('#df-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = modal.querySelector('#df-submit');
      const resultDiv = modal.querySelector('#df-result');

      submitBtn.disabled = true;
      submitBtn.innerText = 'Submitting...';

      try {
        const payload = {
          customer_name: modal.querySelector('#df-name').value.trim(),
          customer_email: modal.querySelector('#df-email').value.trim(),
          subject: modal.querySelector('#df-subject').value.trim(),
          description: modal.querySelector('#df-desc').value.trim(),
          priority: defaultPriority,
        };

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to submit ticket');
        const data = await res.json();

        resultDiv.style.display = 'block';
        resultDiv.style.color = '#15803d';
        resultDiv.innerHTML = `<strong>Ticket #${data.ticket_id} created!</strong> We will get back to you shortly.`;
        modal.querySelector('#df-form').reset();
        submitBtn.style.display = 'none';
      } catch (err) {
        resultDiv.style.display = 'block';
        resultDiv.style.color = '#b91c1c';
        resultDiv.innerText = 'Error submitting ticket. Please try again.';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Submit Ticket';
      }
    });
  });
})();
