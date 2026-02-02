// Main Application
const App = {
    currentView: 'dashboard',

    init() {
        if (Auth.isAuthenticated()) {
            ChatEngine.init();
            ThreatMonitor.init();
            Complaints.init();
            this.renderDashboard();
        } else {
            this.renderAuth();
        }
    },

    renderAuth() {
        let isSignup = false;
        const render = () => {
            document.getElementById('root').innerHTML = `
                <div class="min-h-screen flex items-center justify-center p-6">
                    <div class="glass-effect rounded-3xl p-10 w-full max-w-md shadow-2xl">
                        <div class="text-center mb-8">
                            <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-2xl flex items-center justify-center">
                                <svg class="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h1 class="text-4xl font-display font-black gradient-text mb-2">INQUISITOR</h1>
                            <p class="text-gray-400">AI Security Intelligence</p>
                        </div>

                        <form id="authForm" class="space-y-4">
                            <div id="error"></div>
                            ${isSignup ? `
                                <input type="text" id="name" placeholder="Full Name" required
                                    class="w-full px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none">
                            ` : ''}
                            <input type="email" id="email" placeholder="Email" required
                                class="w-full px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none">
                            <input type="password" id="password" placeholder="Password" required
                                class="w-full px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none">
                            <button type="submit" class="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyber-blue/50 transition-all">
                                ${isSignup ? 'Sign Up' : 'Sign In'}
                            </button>
                        </form>

                        <div class="mt-6 text-center">
                            <button id="toggle" class="text-sm text-gray-400 hover:text-cyber-blue">
                                ${isSignup ? 'Already have account? Sign In' : "Don't have account? Sign Up"}
                            </button>
                        </div>

                        ${!isSignup ? `
                            <div class="mt-6 pt-6 border-t border-gray-800 text-center">
                                <p class="text-xs text-gray-500 mb-2">Demo Accounts:</p>
                                <p class="text-xs text-gray-400 font-mono">admin@inquisitor.ai / admin123<br>analyst@inquisitor.ai / analyst123</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            document.getElementById('authForm').onsubmit = async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const name = document.getElementById('name')?.value;

                const result = isSignup ? Auth.signup(name, email, password) : Auth.login(email, password);
                
                if (result.success) {
                    this.init();
                } else {
                    document.getElementById('error').innerHTML = `<div class="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">${result.error}</div>`;
                }
            };

            document.getElementById('toggle').onclick = () => {
                isSignup = !isSignup;
                render();
            };
        };
        render();
    },

    renderDashboard() {
        const user = Auth.getCurrentUser();
        const risk = RiskAssessment.calculateRisk();
        const threats = ThreatMonitor.getThreats();
        const complaints = Complaints.getAll();

        document.getElementById('root').innerHTML = `
            <!-- Navbar -->
            <nav class="glass-effect sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-xl flex items-center justify-center">
                                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-xl font-display font-black gradient-text">INQUISITOR</h1>
                                <p class="text-xs text-gray-500">Security Ops</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-6">
                            <button onclick="App.switchView('dashboard')" class="text-sm font-semibold ${this.currentView === 'dashboard' ? 'text-cyber-blue' : 'text-gray-400 hover:text-white'}">Dashboard</button>
                            <button onclick="App.switchView('complaints')" class="text-sm font-semibold ${this.currentView === 'complaints' ? 'text-cyber-blue' : 'text-gray-400 hover:text-white'}">Complaints</button>
                            <button onclick="App.switchView('risk')" class="text-sm font-semibold ${this.currentView === 'risk' ? 'text-cyber-blue' : 'text-gray-400 hover:text-white'}">Risk</button>
                        </div>

                        <div class="flex items-center gap-4">
                            <div class="flex items-center gap-3 glass-effect px-4 py-2 rounded-xl">
                                <div class="w-10 h-10 bg-gradient-to-br from-cyber-blue to-cyber-purple rounded-lg flex items-center justify-center text-white font-bold">
                                    ${user.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div class="hidden md:block">
                                    <p class="text-sm font-semibold">${user.name}</p>
                                    <p class="text-xs text-gray-500">${user.role}</p>
                                </div>
                            </div>
                            <button onclick="App.logout()" class="px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 text-sm font-semibold">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Content -->
            <div id="content" class="max-w-7xl mx-auto px-6 py-8">
                ${this.currentView === 'dashboard' ? this.renderDashboardView(risk, threats) : ''}
                ${this.currentView === 'complaints' ? this.renderComplaintsView(complaints) : ''}
                ${this.currentView === 'risk' ? this.renderRiskView(risk) : ''}
            </div>
        `;
    },

    renderDashboardView(risk, threats) {
        const chat = ChatEngine.getHistory();
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Stats -->
                <div class="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="glass-effect rounded-2xl p-6 hover:border-cyber-blue transition-all">
                        <div class="text-4xl mb-2">📊</div>
                        <p class="text-sm text-gray-400 mb-1">Security Events</p>
                        <p class="text-3xl font-black gradient-text">${(47000 + Math.floor(Math.random()*1000)).toLocaleString()}</p>
                    </div>
                    <div class="glass-effect rounded-2xl p-6 hover:border-red-500 transition-all">
                        <div class="text-4xl mb-2">⚠️</div>
                        <p class="text-sm text-gray-400 mb-1">Active Threats</p>
                        <p class="text-3xl font-black text-red-400">${threats.length}</p>
                    </div>
                    <div class="glass-effect rounded-2xl p-6 hover:border-cyber-green transition-all">
                        <div class="text-4xl mb-2">🎯</div>
                        <p class="text-sm text-gray-400 mb-1">Risk Score</p>
                        <p class="text-3xl font-black text-${risk.color}-400">${risk.score}/100</p>
                    </div>
                    <div class="glass-effect rounded-2xl p-6 hover:border-yellow-500 transition-all">
                        <div class="text-4xl mb-2">📋</div>
                        <p class="text-sm text-gray-400 mb-1">Open Complaints</p>
                        <p class="text-3xl font-black text-yellow-400">${Complaints.getStats().open}</p>
                    </div>
                </div>

                <!-- Chat -->
                <div class="lg:col-span-2 glass-effect rounded-2xl p-6 h-[600px] flex flex-col">
                    <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                        <h2 class="text-2xl font-display font-black gradient-text">AI ASSISTANT</h2>
                        <span class="px-3 py-1 bg-cyber-green/20 border border-cyber-green rounded-full text-xs font-bold text-cyber-green flex items-center gap-2">
                            <span class="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></span>
                            Online
                        </span>
                    </div>

                    <div id="messages" class="flex-1 overflow-y-auto space-y-4 mb-4">
                        ${chat.length === 0 ? `
                            <div class="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <div class="text-6xl mb-4">🤖</div>
                                <p class="text-gray-400">Ask me about security events, threats, or anything!</p>
                            </div>
                        ` : chat.map(m => `
                            <div class="flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}">
                                <div class="max-w-md px-4 py-3 rounded-xl ${m.role === 'user' ? 'bg-gradient-to-r from-cyber-blue to-cyber-purple text-white' : 'glass-effect text-gray-200'}">
                                    ${m.content.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="flex gap-3">
                        <input type="text" id="chatInput" placeholder="Ask anything..." 
                            class="flex-1 px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none"
                            onkeypress="if(event.key==='Enter') App.sendMessage()">
                        <button onclick="App.sendMessage()" class="px-6 py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold rounded-xl hover:shadow-lg transition-all">
                            Send
                        </button>
                    </div>
                </div>

                <!-- Threats -->
                <div class="glass-effect rounded-2xl p-6 h-[600px] overflow-y-auto">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-display font-bold text-white">ACTIVE THREATS</h3>
                        <span class="px-2 py-1 bg-red-500/20 border border-red-500 rounded-lg text-xs font-bold text-red-400">LIVE</span>
                    </div>
                    <div class="space-y-3">
                        ${threats.length === 0 ? `
                            <div class="text-center py-12 text-gray-500">
                                <div class="text-5xl mb-3">✓</div>
                                <p>No active threats</p>
                            </div>
                        ` : threats.slice(0, 10).map(t => `
                            <div class="p-4 bg-gray-900/50 border-l-4 border-${t.severity === 'critical' ? 'red' : t.severity === 'high' ? 'orange' : 'yellow'}-500 rounded-lg hover:bg-gray-900 transition-all">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="px-2 py-1 bg-${t.severity === 'critical' ? 'red' : t.severity === 'high' ? 'orange' : 'yellow'}-500/20 text-${t.severity === 'critical' ? 'red' : t.severity === 'high' ? 'orange' : 'yellow'}-400 text-xs font-bold uppercase rounded">${t.severity}</span>
                                    <span class="text-xs text-gray-500">${this.timeAgo(t.timestamp)}</span>
                                </div>
                                <p class="font-semibold text-sm text-white mb-1">${t.title}</p>
                                <p class="text-xs text-gray-400 mb-2">${t.description}</p>
                                <p class="text-xs font-mono text-cyber-blue">🌐 ${t.source_ip}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderComplaintsView(complaints) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Submit Form -->
                <div class="glass-effect rounded-2xl p-6">
                    <h2 class="text-2xl font-display font-bold gradient-text mb-6">SUBMIT COMPLAINT</h2>
                    <form id="complaintForm" class="space-y-4">
                        <input type="text" id="title" placeholder="Issue Title" required
                            class="w-full px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none">
                        <textarea id="description" placeholder="Description" rows="4" required
                            class="w-full px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none"></textarea>
                        <select id="category" required
                            class="w-full px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none">
                            <option value="">Select Category</option>
                            <option value="Suspicious Activity">Suspicious Activity</option>
                            <option value="Vulnerability">Vulnerability</option>
                            <option value="Policy Violation">Policy Violation</option>
                            <option value="Incident">Incident</option>
                        </select>
                        <select id="priority" required
                            class="w-full px-4 py-3 bg-gray-900/50 border border-cyber-blue/30 rounded-xl text-white focus:border-cyber-blue focus:outline-none">
                            <option value="">Select Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                        </select>
                        <button type="submit" class="w-full py-3 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold rounded-xl hover:shadow-lg transition-all">
                            Submit Complaint
                        </button>
                    </form>
                </div>

                <!-- Complaints List -->
                <div class="lg:col-span-2 glass-effect rounded-2xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-display font-bold text-white">ALL COMPLAINTS</h2>
                        <div class="flex gap-2">
                            <span class="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-bold">Open: ${Complaints.getStats().open}</span>
                            <span class="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold">Resolved: ${Complaints.getStats().resolved}</span>
                        </div>
                    </div>
                    <div class="space-y-4 max-h-[600px] overflow-y-auto">
                        ${complaints.length === 0 ? `
                            <div class="text-center py-12 text-gray-500">
                                <div class="text-5xl mb-3">📋</div>
                                <p>No complaints yet</p>
                            </div>
                        ` : complaints.map(c => `
                            <div class="p-5 glass-effect rounded-xl border-l-4 border-${c.priority === 'Critical' ? 'red' : c.priority === 'High' ? 'orange' : c.priority === 'Medium' ? 'yellow' : 'blue'}-500">
                                <div class="flex items-start justify-between mb-3">
                                    <div class="flex-1">
                                        <h3 class="font-bold text-white mb-1">${c.title}</h3>
                                        <p class="text-sm text-gray-400">${c.description}</p>
                                    </div>
                                    <span class="ml-4 px-3 py-1 bg-${c.status === 'Open' ? 'yellow' : c.status === 'In Progress' ? 'blue' : 'green'}-500/20 text-${c.status === 'Open' ? 'yellow' : c.status === 'In Progress' ? 'blue' : 'green'}-400 text-xs font-bold rounded">${c.status}</span>
                                </div>
                                <div class="flex items-center gap-4 text-xs text-gray-500">
                                    <span>📂 ${c.category}</span>
                                    <span>⚡ ${c.priority}</span>
                                    <span>👤 ${c.submittedBy}</span>
                                    <span>🕒 ${this.timeAgo(c.timestamp)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    renderRiskView(risk) {
        const trend = RiskAssessment.getHistoricalTrend();
        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Risk Score -->
                <div class="glass-effect rounded-2xl p-8 text-center">
                    <h2 class="text-2xl font-display font-bold gradient-text mb-8">CURRENT RISK SCORE</h2>
                    <div class="relative w-64 h-64 mx-auto mb-6">
                        <svg class="transform -rotate-90 w-64 h-64">
                            <circle cx="128" cy="128" r="120" stroke="#1a1f3a" stroke-width="20" fill="none"/>
                            <circle cx="128" cy="128" r="120" stroke="url(#gradient)" stroke-width="20" fill="none"
                                stroke-dasharray="${(risk.score / 100) * 754} 754" stroke-linecap="round"/>
                            <defs>
                                <linearGradient id="gradient">
                                    <stop offset="0%" stop-color="#00d4ff"/>
                                    <stop offset="100%" stop-color="#bf00ff"/>
                                </linearGradient>
                            </defs>
                        </svg>
                        <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <p class="text-6xl font-black gradient-text">${risk.score}</p>
                            <p class="text-sm text-gray-400 mt-2">/ 100</p>
                        </div>
                    </div>
                    <div class="px-6 py-4 bg-${risk.color}-500/20 border border-${risk.color}-500 rounded-xl">
                        <p class="text-2xl font-bold text-${risk.color}-400 mb-2">${risk.level} Risk</p>
                        <p class="text-sm text-gray-300">${risk.recommendation}</p>
                    </div>
                </div>

                <!-- Risk Factors -->
                <div class="glass-effect rounded-2xl p-6">
                    <h2 class="text-xl font-display font-bold text-white mb-6">RISK FACTORS</h2>
                    <div class="space-y-4">
                        <div class="p-4 bg-gray-900/50 rounded-xl">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-400">Critical Threats</span>
                                <span class="text-2xl font-bold text-red-400">${risk.factors.criticalThreats}</span>
                            </div>
                            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div class="h-full bg-red-500" style="width: ${(risk.factors.criticalThreats/10)*100}%"></div>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-900/50 rounded-xl">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-400">High Threats</span>
                                <span class="text-2xl font-bold text-orange-400">${risk.factors.highThreats}</span>
                            </div>
                            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div class="h-full bg-orange-500" style="width: ${(risk.factors.highThreats/10)*100}%"></div>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-900/50 rounded-xl">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-400">Total Threats</span>
                                <span class="text-2xl font-bold text-yellow-400">${risk.factors.totalThreats}</span>
                            </div>
                            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div class="h-full bg-yellow-500" style="width: ${(risk.factors.totalThreats/20)*100}%"></div>
                            </div>
                        </div>
                        <div class="p-4 bg-gray-900/50 rounded-xl">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm text-gray-400">Open Complaints</span>
                                <span class="text-2xl font-bold text-cyber-blue">${risk.factors.openComplaints}</span>
                            </div>
                            <div class="h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div class="h-full bg-cyber-blue" style="width: ${(risk.factors.openComplaints/10)*100}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8">
                        <h3 class="text-lg font-bold text-white mb-4">Historical Trend</h3>
                        <div class="grid grid-cols-4 gap-3">
                            <div class="text-center p-3 bg-gray-900/50 rounded-xl">
                                <p class="text-xs text-gray-500 mb-1">Today</p>
                                <p class="text-xl font-bold gradient-text">${trend.current}</p>
                            </div>
                            <div class="text-center p-3 bg-gray-900/50 rounded-xl">
                                <p class="text-xs text-gray-500 mb-1">Yesterday</p>
                                <p class="text-xl font-bold text-gray-400">${trend.yesterday}</p>
                            </div>
                            <div class="text-center p-3 bg-gray-900/50 rounded-xl">
                                <p class="text-xs text-gray-500 mb-1">Last Week</p>
                                <p class="text-xl font-bold text-gray-400">${trend.lastWeek}</p>
                            </div>
                            <div class="text-center p-3 bg-gray-900/50 rounded-xl">
                                <p class="text-xs text-gray-500 mb-1">Last Month</p>
                                <p class="text-xl font-bold text-gray-400">${trend.lastMonth}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const msg = input.value.trim();
        if (!msg) return;
        
        input.value = '';
        await ChatEngine.process(msg);
        this.renderDashboard();
        
        setTimeout(() => {
            const msgDiv = document.getElementById('messages');
            if (msgDiv) msgDiv.scrollTop = msgDiv.scrollHeight;
        }, 100);
    },

    switchView(view) {
        this.currentView = view;
        this.renderDashboard();
        
        if (view === 'complaints') {
            setTimeout(() => {
                document.getElementById('complaintForm').onsubmit = (e) => {
                    e.preventDefault();
                    Complaints.submit({
                        title: document.getElementById('title').value,
                        description: document.getElementById('description').value,
                        category: document.getElementById('category').value,
                        priority: document.getElementById('priority').value
                    });
                    this.renderDashboard();
                };
            }, 100);
        }
    },

    timeAgo(timestamp) {
        const diff = Date.now() - new Date(timestamp);
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);
        if (mins < 60) return `${mins}m ago`;
        if (hrs < 24) return `${hrs}h ago`;
        return `${days}d ago`;
    },

    logout() {
        if (confirm('Logout?')) {
            Auth.logout();
            this.init();
        }
    }
};

window.App = App;