const ChatEngine = {
    // Sample SIEM data
    sampleData: {
        failedLogins: [
            { ip: '203.0.113.45', attempts: 12, time: '2 mins ago', country: 'Russia' },
            { ip: '198.51.100.23', attempts: 8, time: '15 mins ago', country: 'China' },
            { ip: '192.0.2.67', attempts: 5, time: '1 hour ago', country: 'Unknown' }
        ],
        threats: [
            { type: 'SQL Injection', severity: 'Critical', source: '203.0.113.45', status: 'Active' },
            { type: 'Brute Force', severity: 'High', source: '198.51.100.23', status: 'Investigating' },
            { type: 'Port Scan', severity: 'Medium', source: '192.0.2.67', status: 'Resolved' }
        ],
        statistics: {
            total_threats: 47,
            critical: 12,
            high: 23,
            medium: 8,
            low: 4,
            resolved: 133,
            avg_response_time: '12 minutes'
        }
    },

    processQuery(query) {
        const lowerQuery = query.toLowerCase();

        // Failed logins
        if (lowerQuery.includes('failed login') || lowerQuery.includes('login attempt')) {
            return this.formatFailedLoginsResponse();
        }

        // Threats
        if (lowerQuery.includes('threat') || lowerQuery.includes('attack')) {
            if (lowerQuery.includes('critical')) {
                return this.formatCriticalThreatsResponse();
            }
            return this.formatThreatsResponse();
        }

        // IP queries
        if (lowerQuery.includes('ip') || lowerQuery.includes('russia') || lowerQuery.includes('suspicious')) {
            return this.formatIPResponse();
        }

        // Trends
        if (lowerQuery.includes('trend') || lowerQuery.includes('analyz')) {
            return this.formatTrendsResponse();
        }

        // Statistics
        if (lowerQuery.includes('stat') || lowerQuery.includes('how many') || lowerQuery.includes('count')) {
            return this.formatStatisticsResponse();
        }

        // Default response
        return this.formatDefaultResponse(query);
    },

    formatFailedLoginsResponse() {
        const data = this.sampleData.failedLogins;
        let response = `📊 <strong>Failed Login Attempts (Last 24 Hours)</strong><br><br>`;
        response += `Found <span style="color: #EF4444; font-weight: bold;">${data.reduce((sum, item) => sum + item.attempts, 0)} failed attempts</span> from ${data.length} unique IPs:<br><br>`;
        
        data.forEach(item => {
            response += `🔴 <strong>${item.ip}</strong> (${item.country})<br>`;
            response += `   → ${item.attempts} attempts • ${item.time}<br><br>`;
        });

        response += `<div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); padding: 12px; border-radius: 8px; margin-top: 12px;">`;
        response += `💡 <strong>Recommendation:</strong> Consider blocking IPs with 10+ attempts and enabling MFA.`;
        response += `</div>`;

        return response;
    },

    formatCriticalThreatsResponse() {
        return `🚨 <strong>Critical Threats Detected</strong><br><br>
                Found <span style="color: #EF4444; font-weight: bold;">12 critical threats</span> requiring immediate attention:<br><br>
                
                🔴 <strong>SQL Injection Attempt</strong><br>
                   → Source: 203.0.113.45<br>
                   → Target: /api/users<br>
                   → Status: Active<br>
                   → Time: 2 mins ago<br><br>
                
                🔴 <strong>Ransomware Signature Detected</strong><br>
                   → Source: Internal (172.16.0.45)<br>
                   → Target: File Server<br>
                   → Status: Quarantined<br>
                   → Time: 15 mins ago<br><br>
                
                🔴 <strong>Data Exfiltration Attempt</strong><br>
                   → Source: 198.51.100.23<br>
                   → Size: 2.3 GB<br>
                   → Status: Blocked<br>
                   → Time: 1 hour ago<br><br>
                
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px; border-radius: 8px; margin-top: 12px;">
                ⚠️ <strong>Action Required:</strong> Immediate investigation needed for active threats.
                </div>`;
    },

    formatThreatsResponse() {
        return `🛡️ <strong>Active Threat Summary</strong><br><br>
                Total Active Threats: <span style="color: #F59E0B; font-weight: bold;">47</span><br><br>
                
                <strong>Severity Breakdown:</strong><br>
                🔴 Critical: 12<br>
                🟠 High: 23<br>
                🟡 Medium: 8<br>
                🔵 Low: 4<br><br>
                
                <strong>Top Threat Types:</strong><br>
                • SQL Injection: 15 incidents<br>
                • Brute Force: 12 incidents<br>
                • Malware: 8 incidents<br>
                • DDoS: 7 incidents<br>
                • Phishing: 5 incidents<br><br>
                
                Average Response Time: <span style="color: #10B981;">12 minutes</span>`;
    },

    formatIPResponse() {
        return `🌍 <strong>Suspicious IP Analysis</strong><br><br>
                Found <span style="color: #EF4444; font-weight: bold;">23 suspicious IPs</span> from high-risk regions:<br><br>
                
                <strong>Top Suspicious IPs:</strong><br>
                🔴 203.0.113.45 (Russia) - 45 malicious activities<br>
                🔴 198.51.100.23 (China) - 38 malicious activities<br>
                🔴 192.0.2.67 (Unknown) - 27 malicious activities<br><br>
                
                <strong>Activity Types:</strong><br>
                • Port Scanning: 67%<br>
                • Brute Force: 22%<br>
                • SQL Injection: 11%<br><br>
                
                <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); padding: 12px; border-radius: 8px; margin-top: 12px;">
                💡 <strong>Recommendation:</strong> Add these IPs to your firewall blacklist.
                </div>`;
    },

    formatTrendsResponse() {
        return `📈 <strong>Security Trends (Last 7 Days)</strong><br><br>
                
                <strong>Threat Volume:</strong><br>
                • Total Incidents: 342<br>
                • Trend: <span style="color: #EF4444;">↑ +18%</span> from last week<br>
                • Peak Day: Friday (67 incidents)<br><br>
                
                <strong>Attack Patterns:</strong><br>
                • Most Active Hours: 2 AM - 4 AM UTC<br>
                • Most Targeted Service: Web Application (45%)<br>
                • Success Rate: <span style="color: #10B981;">3.2%</span> (down from 5.1%)<br><br>
                
                <strong>Geographic Distribution:</strong><br>
                • Russia: 34%<br>
                • China: 28%<br>
                • United States: 15%<br>
                • Other: 23%<br><br>
                
                <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); padding: 12px; border-radius: 8px; margin-top: 12px;">
                💡 <strong>Insight:</strong> Spike in automated attacks during late-night hours. Consider rate limiting.
                </div>`;
    },

    formatStatisticsResponse() {
        const stats = this.sampleData.statistics;
        return `📊 <strong>Security Statistics Overview</strong><br><br>
                
                <strong>Current Status:</strong><br>
                • Active Threats: ${stats.total_threats}<br>
                • Critical: ${stats.critical}<br>
                • High Priority: ${stats.high}<br>
                • Medium Priority: ${stats.medium}<br>
                • Low Priority: ${stats.low}<br><br>
                
                <strong>Performance Metrics:</strong><br>
                • Resolved Incidents: ${stats.resolved}<br>
                • Avg Response Time: ${stats.avg_response_time}<br>
                • Security Score: <span style="color: #10B981; font-weight: bold;">87/100</span><br><br>
                
                <strong>This Month:</strong><br>
                • Total Incidents: 1,247<br>
                • False Positives: 3.8%<br>
                • Detection Accuracy: 96.2%`;
    },

    formatDefaultResponse(query) {
        return `I understand you're asking about: "<em>${query}</em>"<br><br>
                
                I can help you with:<br>
                • 📊 Security statistics and metrics<br>
                • 🔍 Threat investigation<br>
                • 🚨 Alert analysis<br>
                • 📈 Trend reports<br>
                • 🌍 IP and geolocation queries<br><br>
                
                Try asking:<br>
                • "Show me failed login attempts"<br>
                • "List all critical threats"<br>
                • "Analyze security trends this week"<br>
                • "Show suspicious IPs from Russia"<br><br>
                
                <div style="background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); padding: 12px; border-radius: 8px; margin-top: 12px;">
                💡 <strong>Tip:</strong> Ask in natural language - no need for complex query syntax!
                </div>`;
    }
};