// Threat Monitoring System
const ThreatMonitor = {
    threats: [],

    templates: [
        { severity: 'critical', title: 'Ransomware Attempt Blocked', desc: 'WannaCry variant detected on endpoint' },
        { severity: 'critical', title: 'Data Exfiltration Detected', desc: 'Large data transfer to external IP detected' },
        { severity: 'high', title: 'Brute Force Attack', desc: 'Multiple failed login attempts from external source' },
        { severity: 'high', title: 'Lateral Movement Detected', desc: 'Abnormal SMB traffic between workstations' },
        { severity: 'medium', title: 'Suspicious PowerShell Activity', desc: 'Encoded command execution detected' },
        { severity: 'medium', title: 'Port Scanning Activity', desc: 'Systematic port scan from external IP' }
    ],

    init() {
        c// Threat Monitoring System
const ThreatMonitor = {
    threats: [],
    
    getActiveThreats() {
        return [
            {
                id: 'THR-001',
                type: 'SQL Injection',
                severity: 'Critical',
                source: '203.0.113.45',
                target: '/api/users',
                status: 'Active',
                timestamp: new Date(Date.now() - 2 * 60000).toISOString()
            },
            {
                id: 'THR-002',
                type: 'Brute Force',
                severity: 'High',
                source: '198.51.100.23',
                target: '/admin/login',
                status: 'Investigating',
                timestamp: new Date(Date.now() - 15 * 60000).toISOString()
            },
            {
                id: 'THR-003',
                type: 'Port Scan',
                severity: 'Medium',
                source: '192.0.2.67',
                target: 'Network',
                status: 'Resolved',
                timestamp: new Date(Date.now() - 60 * 60000).toISOString()
            }
        ];
    },
    
    getThreatStats() {
        return {
            total: 47,
            critical: 12,
            high: 23,
            medium: 8,
            low: 4,
            resolved: 133
        };
    },
    
    getSuspiciousIPs() {
        return [
            { ip: '203.0.113.45', country: 'Russia', activities: 45 },
            { ip: '198.51.100.23', country: 'China', activities: 38 },
            { ip: '192.0.2.67', country: 'Unknown', activities: 27 }
        ];
    }
};  onst saved = localStorage.getItem('inquisitor_threats');
        if (saved) this.threats = JSON.parse(saved);
        
        // Auto-generate threats
        setInterval(() => {
            if (Math.random() > 0.6) this.generate();
        }, 60000);
    },

    generate() {
        const template = this.templates[Math.floor(Math.random() * this.templates.length)];
        const threat = {
            id: Date.now(),
            severity: template.severity,
            title: template.title,
            description: template.desc,
            source_ip: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
            timestamp: new Date().toISOString(),
            status: 'Active'
        };
        this.threats.unshift(threat);
        if (this.threats.length > 50) this.threats = this.threats.slice(0, 50);
        this.save();
        return threat;
    },

    getThreats() {
        return this.threats;
    },

    save() {
        localStorage.setItem('inquisitor_threats', JSON.stringify(this.threats));
    }
};

window.ThreatMonitor = ThreatMonitor;