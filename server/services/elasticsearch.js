   const { Client } = require('@elastic/elasticsearch');
require('dotenv').config();

class ElasticsearchService {
  constructor() {
    this.client = new Client({
      node: process.env.ELASTICSEARCH_NODE,
      auth: {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // For development only
      }
    });
  }

  // Test connection
  async testConnection() {
    try {
      const health = await this.client.cluster.health();
      console.log('✅ Elasticsearch connected:', health.cluster_name);
      return true;
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error.message);
      return false;
    }
  }

  // Get failed login attempts
  async getFailedLogins(hours = 24) {
    try {
      const result = await this.client.search({
        index: 'logs-*',
        body: {
          query: {
            bool: {
              must: [
                {
                  match: {
                    'event.action': 'authentication_failure'
                  }
                },
                {
                  range: {
                    '@timestamp': {
                      gte: `now-${hours}h`,
                      lte: 'now'
                    }
                  }
                }
              ]
            }
          },
          size: 1000,
          sort: [{ '@timestamp': 'desc' }]
        }
      });

      return this.formatResults(result.hits.hits);
    } catch (error) {
      console.error('Error fetching failed logins:', error);
      return [];
    }
  }

  // Get security threats
  async getThreats(hours = 24, severity = null) {
    try {
      const must = [
        {
          range: {
            '@timestamp': {
              gte: `now-${hours}h`,
              lte: 'now'
            }
          }
        }
      ];

      if (severity) {
        must.push({
          match: {
            'event.severity': severity
          }
        });
      }

      const result = await this.client.search({
        index: 'security-*',
        body: {
          query: {
            bool: { must }
          },
          size: 500,
          sort: [{ '@timestamp': 'desc' }]
        }
      });

      return this.formatResults(result.hits.hits);
    } catch (error) {
      console.error('Error fetching threats:', error);
      return [];
    }
  }

  // Search logs with custom query
  async searchLogs(query, timeframe = '24h') {
    try {
      const result = await this.client.search({
        index: 'logs-*',
        body: {
          query: {
            bool: {
              must: [
                {
                  query_string: {
                    query: query
                  }
                },
                {
                  range: {
                    '@timestamp': {
                      gte: `now-${timeframe}`,
                      lte: 'now'
                    }
                  }
                }
              ]
            }
          },
          size: 100
        }
      });

      return this.formatResults(result.hits.hits);
    } catch (error) {
      console.error('Error searching logs:', error);
      return [];
    }
  }

  // Get statistics
  async getStatistics(hours = 24) {
    try {
      const [totalEvents, threatsBySeverity, topSourceIPs] = await Promise.all([
        this.getTotalEvents(hours),
        this.getThreatsBySeverity(hours),
        this.getTopSourceIPs(hours)
      ]);

      return {
        totalEvents,
        threatsBySeverity,
        topSourceIPs,
        timeframe: `${hours}h`
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      return null;
    }
  }

  async getTotalEvents(hours) {
    const result = await this.client.count({
      index: 'logs-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: `now-${hours}h`,
              lte: 'now'
            }
          }
        }
      }
    });
    return result.count;
  }

  async getThreatsBySeverity(hours) {
    const result = await this.client.search({
      index: 'security-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: `now-${hours}h`,
              lte: 'now'
            }
          }
        },
        aggs: {
          by_severity: {
            terms: {
              field: 'event.severity.keyword',
              size: 10
            }
          }
        },
        size: 0
      }
    });

    return result.aggregations.by_severity.buckets;
  }

  async getTopSourceIPs(hours, limit = 10) {
    const result = await this.client.search({
      index: 'security-*',
      body: {
        query: {
          range: {
            '@timestamp': {
              gte: `now-${hours}h`,
              lte: 'now'
            }
          }
        },
        aggs: {
          top_ips: {
            terms: {
              field: 'source.ip.keyword',
              size: limit
            }
          }
        },
        size: 0
      }
    });

    return result.aggregations.top_ips.buckets;
  }

  // Format results for frontend
  formatResults(hits) {
    return hits.map(hit => ({
      id: hit._id,
      ...hit._source,
      timestamp: hit._source['@timestamp']
    }));
  }

  // Close connection
  async close() {
    await this.client.close();
  }
}

module.exports = new ElasticsearchService(); 