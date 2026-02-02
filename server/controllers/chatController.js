    const elasticsearchService = require('../services/elasticsearch');

class ChatController {
  // Intent detection patterns
  intents = {
    failed_login: /failed login|login attempt|authentication fail|login error/i,
    threats: /threat|attack|malicious|suspicious/i,
    ip_lookup: /ip|address|source|from/i,
    statistics: /stat|count|how many|total|number of/i,
    help: /help|what can you|how do/i
  };

  // @desc    Process chat query
  // @route   POST /api/chat/query
  // @access  Private
  async processQuery(req, res) {
    try {
      const { query } = req.body;

      if (!query || query.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Query is required'
        });
      }

      // Detect intent
      const intent = this.detectIntent(query);
      const timeframe = this.extractTimeframe(query);

      let response;

      switch (intent) {
        case 'failed_login':
          response = await this.handleFailedLoginQuery(timeframe);
          break;
        case 'threats':
          response = await this.handleThreatQuery(query, timeframe);
          break;
        case 'ip_lookup':
          response = await this.handleIPLookup(query, timeframe);
          break;
        case 'statistics':
          response = await this.handleStatistics(timeframe);
          break;
        case 'help':
          response = this.getHelpResponse();
          break;
        default:
          response = this.getDefaultResponse(query);
      }

      res.json({
        success: true,
        query,
        intent,
        timeframe,
        response
      });
    } catch (error) {
      console.error('Chat query error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing query'
      });
    }
  }

  // Detect user intent from query
  detectIntent(query) {
    const lowerQuery = query.toLowerCase();

    for (const [intent, pattern] of Object.entries(this.intents)) {
      if (pattern.test(lowerQuery)) {
        return intent;
      }
    }

    return 'unknown';
  }

  // Extract timeframe from query
  extractTimeframe(query) {
    const patterns = {
      '1h': /last hour|past hour|1 hour/i,
      '24h': /24 hours?|today|last day/i,
      '7d': /week|7 days?|last week/i,
      '30d': /month|30 days?|last month/i
    };

    for (const [timeframe, pattern] of Object.entries(patterns)) {
      if (pattern.test(query)) {
        return timeframe;
      }
    }

    return '24h'; // default
  }

  // Extract IP address from query
  extractIP(query) {
    const ipPattern = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/;
    const match = query.match(ipPattern);
    return match ? match[0] : null;
  }

  // Handle failed login queries
  async handleFailedLoginQuery(timeframe) {
    try {
      const hours = this.timeframeToHours(timeframe);
      const logs = await elasticsearchService.getFailedLogins(hours);

      if (logs.length === 0) {
        return {
          type: 'text',
          content: `No failed login attempts found in the last ${timeframe}.`
        };
      }

      // Group by IP
      const ipCounts = {};
      logs.forEach(log => {
        const ip = log['source.ip'] || log.sourceIp;
        ipCounts[ip] = (ipCounts[ip] || 0) + 1;
      });

      // Get top IPs
      const topIPs = Object.entries(ipCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([ip, count]) => ({ ip, count }));

      return {
        type: 'structured',
        summary: `Found ${logs.length} failed login attempts from ${Object.keys(ipCounts).length} unique IPs in the last ${timeframe}`,
        data: {
          total: logs.length,
          uniqueIPs: Object.keys(ipCounts).length,
          topIPs,
          timeframe
        },
        recommendation: topIPs[0].count > 10 
          ? `⚠️ IP ${topIPs[0].ip} has ${topIPs[0].count} attempts - consider blocking`
          : '✓ No suspicious patterns detected'
      };
    } catch (error) {
      console.error('Failed login query error:', error);
      return {
        type: 'error',
        content: 'Unable to fetch failed login data from SIEM'
      };
    }
  }

  // Handle threat queries
  async handleThreatQuery(query, timeframe) {
    try {
      const hours = this.timeframeToHours(timeframe);
      const threats = await elasticsearchService.getThreats(hours);

      if (threats.length === 0) {
        return {
          type: 'text',
          content: `No threats detected in the last ${timeframe}.`
        };
      }

      // Count by severity
      const bySeverity = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0
      };

      threats.forEach(threat => {
        const severity = threat['event.severity'] || 'Medium';
        bySeverity[severity] = (bySeverity[severity] || 0) + 1;
      });

      return {
        type: 'structured',
        summary: `Found ${threats.length} threats in the last ${timeframe}`,
        data: {
          total: threats.length,
          bySeverity,
          timeframe
        },
        recommendation: bySeverity.Critical > 0
          ? `🚨 ${bySeverity.Critical} critical threats require immediate attention!`
          : '✓ No critical threats detected'
      };
    } catch (error) {
      console.error('Threat query error:', error);
      return {
        type: 'error',
        content: 'Unable to fetch threat data from SIEM'
      };
    }
  }

  // Handle IP lookup
  async handleIPLookup(query, timeframe) {
    const ip = this.extractIP(query);

    if (!ip) {
      return {
        type: 'text',
        content: 'Please specify an IP address to lookup (e.g., "lookup IP 192.168.1.1")'
      };
    }

    try {
      const hours = this.timeframeToHours(timeframe);
      const searchQuery = `source.ip:"${ip}"`;
      const logs = await elasticsearchService.searchLogs(searchQuery, timeframe);

      return {
        type: 'structured',
        summary: `Found ${logs.length} events from IP ${ip} in the last ${timeframe}`,
        data: {
          ip,
          eventCount: logs.length,
          timeframe,
          events: logs.slice(0, 10) // Top 10 events
        },
        recommendation: logs.length > 100
          ? `⚠️ Unusual activity detected from ${ip}`
          : '✓ Normal activity levels'
      };
    } catch (error) {
      console.error('IP lookup error:', error);
      return {
        type: 'error',
        content: 'Unable to lookup IP address'
      };
    }
  }

  // Handle statistics queries
  async handleStatistics(timeframe) {
    try {
      const hours = this.timeframeToHours(timeframe);
      const stats = await elasticsearchService.getStatistics(hours);

      return {
        type: 'structured',
        summary: `Security statistics for the last ${timeframe}`,
        data: stats
      };
    } catch (error) {
      console.error('Statistics query error:', error);
      return {
        type: 'error',
        content: 'Unable to fetch statistics'
      };
    }
  }

  // Get help response
  getHelpResponse() {
    return {
      type: 'help',
      content: `
I can help you with:
• 📊 Security statistics and metrics
• 🔍 Threat investigation
• 🚨 Alert analysis
• 📈 Trend reports
• 🌍 IP and geolocation queries

Try asking:
• "Show me failed login attempts in last 24 hours"
• "List all critical threats"
• "Analyze security trends this week"
• "Lookup IP 192.168.1.1"
      `.trim()
    };
  }

  // Get default response for unknown queries
  getDefaultResponse(query) {
    return {
      type: 'text',
      content: `I understand you're asking about: "${query}". Try rephrasing your question or type "help" to see what I can do.`
    };
  }

  // Convert timeframe to hours
  timeframeToHours(timeframe) {
    const map = {
      '1h': 1,
      '24h': 24,
      '7d': 168,
      '30d': 720
    };
    return map[timeframe] || 24;
  }
}

module.exports = new ChatController();