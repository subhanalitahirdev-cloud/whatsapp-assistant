import { useState, useEffect } from 'react';
import { Image, FileText, Mic, Volume2 } from 'lucide-react';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'settings' | 'not-whatsapp-opened' | 'not-logged-in'>('home');
  const [storedApiKey, setStoredApiKey] = useState('');
  const [editingApiKey, setEditingApiKey] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('whatsapp_api_key');
    const savedName = localStorage.getItem('whatsapp_username');

    const chromeApi = (window as any)?.chrome;

    const setWhatsAppView = async () => {
      if (!chromeApi?.tabs?.query || !chromeApi?.scripting?.executeScript) {
        setCurrentView('not-whatsapp-opened');
        return;
      }
      try {
        const tabs = await chromeApi.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        const url = activeTab?.url || '';

        if (!url.includes('web.whatsapp.com')) {
          setCurrentView('not-whatsapp-opened');
          return;
        }

        // Check if user is logged in to WhatsApp by probing DOM in the active tab
        chromeApi.scripting.executeScript(
          {
            target: { tabId: activeTab.id as number },
            func: () => {
              const sidePanel = document.querySelector('[role="main"]');
              const chatList = document.querySelector('[data-testid="chat-list"]') || document.querySelector('[data-tab="1"]');
              return !!(sidePanel || chatList);
            }
          },
          (results: any[]) => {
            const [{ result: isLogged }] = results || [{ result: false }];
            setIsLoggedIn(!!isLogged);
            setCurrentView(isLogged ? 'home' : 'not-logged-in');
          }
        );
      } catch (error) {
        console.error('Error checking WhatsApp tab:', error);
        setCurrentView('not-whatsapp-opened');
      }
    };

    // Initial run
    setWhatsAppView();
    // Re-check every 2 seconds
    const interval = setInterval(setWhatsAppView, 2000);

    if (savedKey) {
      setStoredApiKey(savedKey);
      setEditingApiKey(savedKey);
    }
    if (savedName) {
      setUsername(savedName);
    }

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = () => {
    if (apiKey.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        localStorage.setItem('whatsapp_api_key', apiKey);
        setStoredApiKey(apiKey);
        if (username.trim()) {
          localStorage.setItem('whatsapp_username', username.trim());
        }
        setIsSubmitting(false);
        setApiKey('');
      }, 1000);
    }
  };

  const handleUpdateApiKey = () => {
    if (editingApiKey.trim()) {
      setIsSubmitting(true);
      setTimeout(() => {
        localStorage.setItem('whatsapp_api_key', editingApiKey);
        setStoredApiKey(editingApiKey);
        setIsSubmitting(false);
        setMenuOpen(false);
      }, 800);
    }
  };

  const handleDeleteApiKey = () => {
    localStorage.removeItem('whatsapp_api_key');
    setStoredApiKey('');
    setEditingApiKey('');
  };

  return (
    <div className="min-h-auto bg-white w-[20rem]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/whatsapp.svg" alt="WhatsApp Logo" className="h-8 w-8" />
        </div>

        {/* Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 hover:bg-gray-100"
        >
          <div className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-6 bg-gray-700 transition-all duration-300 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-6 bg-gray-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-6 bg-gray-700 transition-all duration-300 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </header>

      {menuOpen && (
        <div className="border-b border-gray-200 bg-gray-50 shadow-sm">
          <div className="px-6 py-2 space-y-1">
            <button
              onClick={() => {
                setCurrentView('settings');
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Update/Delete API Key
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              Help & Support
            </button>
            <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200">
              About
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-6 w-full">
        <div className="w-full max-w-6xl">
          {currentView === 'not-whatsapp-opened' ? (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">WhatsApp Web is not Opened</h1>
                <p className="text-gray-600 text-sm leading-relaxed">Please open WhatsApp Web to use AI features. The extension works seamlessly when WhatsApp Web is active in another tab.</p>
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 text-white font-semibold text-sm rounded-lg bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Open WhatsApp Web
                </a>
              </div>
            </div>
          ) : currentView === 'not-logged-in' ? (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">You are not logged in to WhatsApp</h1>
                <p className="text-gray-600 text-sm leading-relaxed">Please login to WhatsApp Web to use WhatsApp AI extension. Scan the QR code in WhatsApp Web to continue.</p>
                <button
                  onClick={() => window.open('https://web.whatsapp.com', '_blank')}
                  className="inline-block px-6 py-2 text-white font-semibold text-sm rounded-lg bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Go to WhatsApp Web
                </button>
              </div>
            </div>
          ) : currentView === 'home' ? (
            <div className="space-y-6">
              {storedApiKey ? (
                <>
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">{`Welcome ${username || 'there'}`}</h1>
                    <p className="text-gray-600 text-sm">You're all set to use WhatsApp AI features.</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow transition">
                      <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-green-50 text-green-600 mb-3">
                        <Image className="h-8 w-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Image Processing</h3>
                      <p className="text-xs text-gray-600">Upload and analyze images with AI-powered insights.</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow transition">
                      <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-blue-50 text-blue-600 mb-3">
                        <FileText className="h-8 w-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Text Generation</h3>
                      <p className="text-xs text-gray-600">Generate and refine content tailored to your needs.</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow transition">
                      <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-purple-50 text-purple-600 mb-3">
                        <Mic className="h-8 w-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Speech to Text</h3>
                      <p className="text-xs text-gray-600">Transcribe voice notes into clean, editable text.</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm hover:shadow transition">
                      <div className="flex items-center justify-center h-16 w-16 rounded-lg bg-orange-50 text-orange-600 mb-3">
                        <Volume2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">Text to Speech</h3>
                      <p className="text-xs text-gray-600">Convert text messages into natural-sounding audio.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">WhatsApp AI</h1>
                    <p className="text-gray-600 text-sm leading-normal">Please enter your name and Google API key to get started.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="username" className="block text-xs font-medium text-gray-700">Your Name</label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your name..."
                      className="w-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="apiKey" className="block text-xs font-medium text-gray-700">Google API Key</label>
                    <input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Enter your API key..."
                      className="w-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                    />
                    <p className="text-xs text-gray-500">Your API key is securely stored locally.</p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!apiKey.trim() || isSubmitting}
                    className="w-full px-4 py-2 text-white font-semibold text-sm rounded-lg bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm overflow-hidden relative group"
                  >
                    <div className="relative flex items-center justify-center">
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <>
                          <span>Enter API</span>
                          <span className="absolute right-4 transition-transform duration-300 group-hover:translate-x-1">→</span>
                        </>
                      )}
                    </div>
                    <div className="absolute inset-0 -z-10 h-full w-full scale-0 rounded-lg bg-green-600 transition-transform duration-500 group-hover:scale-100" />
                  </button>
                </>
              )}
            </div>
          ) : currentView === 'settings' ? (
            <div className="space-y-6">
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
              >
                <span>←</span>
                <span>Back</span>
              </button>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                <p className="text-gray-600 text-sm">Manage your API key and preferences</p>
              </div>

              <div className="space-y-4 rounded-lg border border-gray-200 p-6 bg-gray-50">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Update API Key</h3>

                  {storedApiKey ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-700 font-medium">✓ API Key is currently stored</p>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="editApiKey" className="block text-xs font-medium text-gray-700">Edit Google API Key</label>
                        <input
                          id="editApiKey"
                          type="password"
                          value={editingApiKey}
                          onChange={(e) => setEditingApiKey(e.target.value)}
                          placeholder="Enter your new API key..."
                          className="w-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                        <p className="text-xs text-gray-500">Leave empty to keep current key</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleUpdateApiKey}
                          disabled={!editingApiKey.trim() || editingApiKey === storedApiKey || isSubmitting}
                          className="flex-1 px-4 py-2 text-white font-semibold text-sm rounded-lg bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm overflow-hidden relative group"
                        >
                          <div className="relative flex items-center justify-center">
                            {isSubmitting ? (
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Updating...</span>
                              </div>
                            ) : (
                              'Update API Key'
                            )}
                          </div>
                        </button>

                        <button
                          onClick={handleDeleteApiKey}
                          className="flex-1 px-4 py-2 text-white font-semibold text-sm rounded-lg bg-red-500 hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm"
                        >
                          Delete Key
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-700 font-medium">⚠ No API key stored</p>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="newApiKey" className="block text-xs font-medium text-gray-700">Add Google API Key</label>
                        <input
                          id="newApiKey"
                          type="password"
                          value={editingApiKey}
                          onChange={(e) => setEditingApiKey(e.target.value)}
                          placeholder="Enter your API key..."
                          className="w-full px-4 py-2 text-sm text-gray-900 placeholder-gray-400 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white"
                        />
                      </div>

                      <button
                        onClick={handleUpdateApiKey}
                        disabled={!editingApiKey.trim() || isSubmitting}
                        className="w-full px-4 py-2 text-white font-semibold text-sm rounded-lg bg-linear-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm overflow-hidden relative group"
                      >
                        <div className="relative flex items-center justify-center">
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Saving...</span>
                            </div>
                          ) : (
                            'Save API Key'
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}

export default App;
