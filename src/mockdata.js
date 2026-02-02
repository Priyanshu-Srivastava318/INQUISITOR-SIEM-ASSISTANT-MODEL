// Mock Data Generator - More Realistic Demo Data
const MockData = {
    // Generate realistic threats
    generateThreats(count = 10) {
        const types = [
            'SQL Injection',
            'XSS Attack',
            'Brute Force',
            'Port Scan',
            'DDoS',
            'Malware',
            'Phishing',
            'Data Exfiltration',
            'Ransomware',
            'Zero-Day Exploit'
        ];
        
        const countries = [
            { name: 'Russia', flag: '🇷🇺', likelihood: 0.25 },
            { name: 'China', flag: '🇨🇳', likelihood: 0.25 },
            { name: 'USA', flag: '🇺🇸', likelihood: 0.15 },
            { name: 'Brazil', flag: '🇧🇷', likelihood: 0.10 },
            { name: 'India', flag: '🇮🇳', likelihood: 0.10 },
            { name: 'North Korea', flag: '🇰🇵', likelihood: 0.05 },
            { name: 'Iran', flag: '🇮🇷', likelihood: 0.05 },
            { name: 'Unknown', flag: '❓', likelihood: 0.05 }
        ];
        
        const threats = [];
        
        for (let i = 0; i < count; i++) {
            const severity = this.randomSeverity();
            const type = types[Math.floor(Math.random() * types.length)];
            const country = this.weightedRandom(countries);
            const hoursAgo = Math.random() * 24;
            
            threats.push({
                id: `THR-${Date.now()}-${i}`,
                type: type,
                severity: severity,
                source_ip: this.randomIP(),
                target: this.randomTarget(),
                country: country.name,
                flag: country.flag,
                timestamp: new Date(Date.now() - hoursAgo * 3600000),
                status: Math.random() > 0.3 ? 'Active' : 'Resolved',
                attempts: Math.floor(Math.random() * 500) + 1,
                blocked: Math.random() > 0.5
            });
        }
        
        return threats.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    // Generate failed login data
    generateFailedLogins(hours = 24) {
        const logins = [];
        const count = Math.floor(Math.random() * 100) + 20;
        
        for (let i = 0; i < count; i++) {
            const hoursAgo = Math.random() * hours;
            logins.push({
                ip: this.randomIP(),
                attempts: Math.floor(Math.random() * 50) + 1,
                timestamp: new Date(Date.now() - hoursAgo * 3600000),
                username: this.randomUsername(),
                country: this.randomCountry()
            });
        }
        
        return logins.sort((a, b) => b.attempts - a.attempts);
    },
    
    // Generate time-series data for charts
    generateTimeSeriesData(hours = 24) {
        const data = [];
        const now = new Date();
        
        for (let i = hours - 1; i >= 0; i--) {
            const timestamp = new Date(now - i * 3600000);
            const baseValue = 15;
            const variation = Math.sin(i / 4) * 10; // Periodic pattern
            const noise = (Math.random() - 0.5) * 5; // Random noise
            
            data.push({
                timestamp: timestamp,
                value: Math.max(0, Math.floor(baseValue + variation + noise)),
                hour: timestamp.getHours()
            });
        }
        
        return data;
    },
    
    // Generate risk score with trend
    generateRiskScore() {
        const base = 65;
        const trend = Math.sin(Date.now() / 100000) * 15;
        const score = Math.floor(base + trend);
        
        return {
            current: Math.max(30, Math.min(95, score)),
            yesterday: Math.max(30, Math.min(95, score - 5)),
            trend: score > base ? 'increasing' : 'decreasing'
        };
    },
    
    // Generate predictions
    generatePredictions() {
        return [
            {
                type: 'DDoS Attack',
                confidence: 75 + Math.floor(Math.random() * 20),
                timeframe: '24-48 hours',
                severity: 'Critical',
                indicators: [
                    'Unusual traffic patterns from Eastern Europe',
                    'Spike in connection attempts',
                    'Known botnet signatures detected'
                ]
            },
            {
                type: 'Credential Stuffing',
                confidence: 60 + Math.floor(Math.random() * 20),
                timeframe: '3-5 days',
                severity: 'High',
                indicators: [
                    'Failed login attempts increasing',
                    'Password spray pattern detected',
                    'Matching known breach databases'
                ]
            },
            {
                type: 'Phishing Campaign',
                confidence: 50 + Math.floor(Math.random() * 20),
                timeframe: '7 days',
                severity: 'Medium',
                indicators: [
                    'Similar campaigns in industry',
                    'Suspicious email traffic patterns',
                    'Domain typosquatting detected'
                ]
            }
        ];
    },
    
    // Helper functions
    randomIP() {
        const classes = [
            () => `203.0.113.${Math.floor(Math.random() * 255)}`, // TEST-NET-3
            () => `198.51.100.${Math.floor(Math.random() * 255)}`, // TEST-NET-2
            () => `192.0.2.${Math.floor(Math.random() * 255)}`, // TEST-NET-1
            () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        ];
        
        return classes[Math.floor(Math.random() * classes.length)]();
    },
    
    randomTarget() {
        const targets = [
            '/api/users',
            '/admin/login',
            '/api/auth',
            '/dashboard',
            '/api/data',
            '/upload',
            '/api/payment',
            'Database Server',
            'Web Server',
            'Mail Server'
        ];
        
        return targets[Math.floor(Math.random() * targets.length)];
    },
    
    randomUsername() {
        const prefixes = ['admin', 'user', 'test', 'root', 'system', 'guest'];
        const suffixes = ['123', '2024', 'test', '', '_admin'];
        
        return prefixes[Math.floor(Math.random() * prefixes.length)] + 
               suffixes[Math.floor(Math.random() * suffixes.length)];
    },
    
    randomCountry() {
        const countries = ['Russia', 'China', 'USA', 'Brazil', 'India', 'Germany', 'France'];
        return countries[Math.floor(Math.random() * countries.length)];
    },
    
    randomSeverity() {
        const rand = Math.random();
        if (rand > 0.85) return 'Critical';
        if (rand > 0.60) return 'High';
        if (rand > 0.30) return 'Medium';
        return 'Low';
    },
    
    weightedRandom(items) {
        const total = items.reduce((sum, item) => sum + item.likelihood, 0);
        let random = Math.random() * total;
        
        for (const item of items) {
            if (random < item.likelihood) {
                return item;
            }
            random -= item.likelihood;
        }
        
        return items[items.length - 1];
    }
};

// Auto-refresh demo data
if (typeof window !== 'undefined') {
    // Refresh data every 30 seconds for demo purposes
    setInterval(() => {
        if (typeof updateDashboardData === 'function') {
            updateDashboardData();
        }
    }, 30000);
}