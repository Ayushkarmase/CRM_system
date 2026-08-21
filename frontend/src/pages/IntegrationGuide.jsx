import React, { useState } from 'react';
import { useToast } from '../components/Toast';
import { ticketApi } from '../services/api';
import {
  Code2,
  Copy,
  Check,
  Globe,
  Send,
  Sparkles,
  ExternalLink,
  Layers,
  Terminal,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Play,
  FileCode,
} from 'lucide-react';

export const IntegrationGuide = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('widget'); // 'widget', 'react', 'curl', 'html'
  const [copiedKey, setCopiedKey] = useState(null);

  // Test Widget State
  const [testForm, setTestForm] = useState({
    customer_name: 'Alex Johnson',
    customer_email: 'alex.j@clientcorp.io',
    subject: 'Issue with checkout invoice payment',
    description: 'Encountered 402 Payment Required error while trying to upgrade team plan.',
    priority: 'High',
  });
  const [submittingTest, setSubmittingTest] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const apiHost = window.location.origin;

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Code snippet copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleTestSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingTest(true);
      setTestResult(null);
      const res = await ticketApi.createTicket(testForm);
      setTestResult({
        success: true,
        data: res,
      });
      addToast(`Test Ticket created: ${res.ticket_id}`, 'success');
    } catch (err) {
      console.error('Test integration error:', err);
      setTestResult({
        success: false,
        error: err.response?.data?.detail || err.message,
      });
      addToast('Failed to submit test ticket', 'error');
    } finally {
      setSubmittingTest(false);
    }
  };

  const widgetCode = `<!-- 1. Place this script before </body> on your customer website -->
<script>
  (function() {
    window.DeskFlowConfig = {
      apiUrl: "${apiHost}/api/tickets",
      themeColor: "#0f172a",
      buttonText: "Need Help? Contact Support",
      defaultPriority: "Medium"
    };

    const script = document.createElement("script");
    script.src = "${apiHost}/embed/deskflow-widget.js";
    script.async = true;
    document.body.appendChild(script);
  })();
</script>`;

  const reactCode = `import React, { useState } from 'react';

export const CustomerSupportForm = () => {
  const [status, setStatus] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    subject: '',
    description: '',
    priority: 'Medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    
    try {
      const response = await fetch('${apiHost}/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Ticket submission failed');
      const ticket = await response.json();
      setStatus({ success: true, ticketId: ticket.ticket_id });
      setFormData({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'Medium' });
    } catch (err) {
      setStatus({ success: false, error: err.message });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl shadow-md space-y-4">
      <h3 className="text-lg font-bold">Contact Support</h3>
      <input 
        type="text" 
        placeholder="Your Name" 
        required 
        value={formData.customer_name} 
        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
        className="w-full p-2.5 border rounded-lg" 
      />
      <input 
        type="email" 
        placeholder="Your Email" 
        required 
        value={formData.customer_email} 
        onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
        className="w-full p-2.5 border rounded-lg" 
      />
      <input 
        type="text" 
        placeholder="Issue Subject" 
        required 
        value={formData.subject} 
        onChange={(e) => setFormData({...formData, subject: e.target.value})}
        className="w-full p-2.5 border rounded-lg" 
      />
      <textarea 
        placeholder="Describe your issue in detail..." 
        required 
        rows={4}
        value={formData.description} 
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        className="w-full p-2.5 border rounded-lg" 
      />
      <button type="submit" className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-semibold">
        {status === 'submitting' ? 'Submitting...' : 'Submit Support Ticket'}
      </button>
      {status?.success && (
        <p className="text-sm text-emerald-600 font-semibold">
          Ticket created successfully! Tracking ID: {status.ticketId}
        </p>
      )}
    </form>
  );
};`;

  const curlCode = `# Send a ticket from your backend, webhooks, or CLI
curl -X POST "${apiHost}/api/tickets" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Sarah Jenkins",
    "customer_email": "s.jenkins@clientcorp.io",
    "subject": "Unable to connect SSO domain",
    "description": "Encountered XML parsing error during Okta SAML setup",
    "priority": "High"
  }'`;

  const htmlFormCode = `<!-- Simple Vanilla HTML Form that creates DeskFlow tickets -->
<form id="deskflow-support-form" action="${apiHost}/api/tickets" method="POST">
  <input type="text" name="customer_name" placeholder="Full Name" required />
  <input type="email" name="customer_email" placeholder="Email Address" required />
  <input type="text" name="subject" placeholder="What do you need help with?" required />
  <textarea name="description" placeholder="Describe the issue..." required></textarea>
  <select name="priority">
    <option value="Low">Low</option>
    <option value="Medium" selected>Medium</option>
    <option value="High">High</option>
    <option value="Urgent">Urgent</option>
  </select>
  <button type="submit">Send Message</button>
</form>

<script>
  document.getElementById('deskflow-support-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const payload = Object.fromEntries(formData.entries());

    const res = await fetch('${apiHost}/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      alert('Your support ticket has been received! Tracking ID: ' + data.ticket_id);
      this.reset();
    }
  });
</script>`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
          <Globe className="w-4 h-4" />
          <span>Omnichannel Integration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Website & Portal Integration Guide
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium max-w-3xl">
          Embed ticket capture forms and interactive support widgets directly onto your customer websites, SaaS portals, or mobile apps so tickets flow straight into your DeskFlow queue.
        </p>
      </div>

      {/* Integration Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Embed or Call API</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose your integration method: embeddable JS widget, React/Vue form, or direct REST API webhook.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Auto-Assign & Triage</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            DeskFlow automatically validates data, assigns a sequential human-readable ID (`TKT-XXX`), and sets initial priority.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Live Agent Queue</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Support agents receive real-time notifications on the Dashboard with instant customer details and priority badges.
          </p>
        </div>
      </div>

      {/* Code Snippets Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 pt-3 bg-slate-50/70 overflow-x-auto">
          <div className="flex gap-2">
            {[
              { id: 'widget', label: 'Embedded JS Widget', icon: Code2 },
              { id: 'react', label: 'React / Next.js Form', icon: FileCode },
              { id: 'html', label: 'HTML / Webflow / WP', icon: Layers },
              { id: 'curl', label: 'cURL / Backend API', icon: Terminal },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-slate-900 border-blue-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 border-transparent hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pb-2">
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">POST /api/tickets</span>
          </div>
        </div>

        {/* Tab Content Box */}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              {activeTab === 'widget' && 'Add this embed snippet before the closing </body> tag of your website.'}
              {activeTab === 'react' && 'Drop-in React component for Next.js, Remix, Vite, or Create React App.'}
              {activeTab === 'html' && 'Standard HTML form compatible with Webflow, WordPress, Squarespace, and Shopify.'}
              {activeTab === 'curl' && 'Direct REST API call with JSON payload for backends, CI/CD, or cron jobs.'}
            </span>
            <button
              onClick={() => {
                const codeMap = {
                  widget: widgetCode,
                  react: reactCode,
                  html: htmlFormCode,
                  curl: curlCode,
                };
                copyToClipboard(codeMap[activeTab], activeTab);
              }}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-lg text-xs transition-colors shrink-0"
            >
              {copiedKey === activeTab ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Block */}
          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
              {activeTab === 'widget' && widgetCode}
              {activeTab === 'react' && reactCode}
              {activeTab === 'html' && htmlFormCode}
              {activeTab === 'curl' && curlCode}
            </pre>
          </div>
        </div>
      </div>

      {/* Interactive Live Testing Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-slate-900 text-base">Live Interactive Test Sandbox</h2>
            </div>
            <span className="text-[11px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200/60">
              Direct API Test
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Simulate a customer submitting a ticket from your website. This executes a live <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">POST /api/tickets</code> call.
          </p>

          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={testForm.customer_name}
                  onChange={(e) => setTestForm({ ...testForm, customer_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Email</label>
                <input
                  type="email"
                  required
                  value={testForm.customer_email}
                  onChange={(e) => setTestForm({ ...testForm, customer_email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject / Issue Title</label>
                <input
                  type="text"
                  required
                  value={testForm.subject}
                  onChange={(e) => setTestForm({ ...testForm, subject: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                <select
                  value={testForm.priority}
                  onChange={(e) => setTestForm({ ...testForm, priority: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={testForm.description}
                onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={submittingTest}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {submittingTest ? (
                <span>Generating Ticket...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Test Ticket from Website</span>
                </>
              )}
            </button>
          </form>

          {/* Test Result Feedback */}
          {testResult && (
            <div
              className={`p-4 rounded-xl text-xs space-y-2 border ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Ticket Generated Successfully!</span>
                  </>
                ) : (
                  <span>Submission Error</span>
                )}
              </div>
              {testResult.success ? (
                <div className="space-y-1 text-slate-700">
                  <p>
                    <strong className="text-slate-900">Assigned ID:</strong>{' '}
                    <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                      {testResult.data.ticket_id}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-900">Status:</strong> {testResult.data.status} |{' '}
                    <strong className="text-slate-900">Priority:</strong> {testResult.data.priority}
                  </p>
                  <a
                    href={`/tickets/${testResult.data.ticket_id}`}
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline mt-1 pt-1"
                  >
                    <span>View Ticket #{testResult.data.ticket_id} in Queue</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-red-700">{testResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* API Specification & CORS Reference */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3>CORS & Security Configuration</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              DeskFlow's FastAPI backend has Cross-Origin Resource Sharing (CORS) enabled, allowing requests from any authorized customer domain or web app.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
              <div><strong>Method:</strong> POST</div>
              <div><strong>Endpoint:</strong> /api/tickets</div>
              <div><strong>Content-Type:</strong> application/json</div>
              <div><strong>CORS:</strong> Access-Control-Allow-Origin: *</div>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <h3>Payload Fields Reference</h3>
            </div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-blue-300 font-semibold">customer_name:</span>
                <span>Customer full name (Required)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-blue-300 font-semibold">customer_email:</span>
                <span>Validated customer email (Required)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-blue-300 font-semibold">subject:</span>
                <span>Brief issue title (Required)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-blue-300 font-semibold">description:</span>
                <span>Detailed problem description (Required)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-mono text-blue-300 font-semibold">priority:</span>
                <span>Low, Medium, High, or Urgent (Optional)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationGuide;
