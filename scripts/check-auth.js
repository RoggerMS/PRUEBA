#!/usr/bin/env node

/**
 * Script de validación automatizada del sistema de autenticación
 * 
 * Verifica:
 * - GET /api/auth/session (200)
 * - /feed sin sesión → redirección a /auth/login
 * - /demo (200) y lista posts públicos
 * - Protección de rutas que requieren autenticación
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const TIMEOUT = 10000; // 10 segundos

class AuthChecker {
  constructor() {
    this.results = [];
    this.errors = [];
    this.firstPostId = null;
  }

  async makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const client = url.protocol === 'https:' ? https : http;
      
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'AuthChecker/1.0',
          ...options.headers
        },
        timeout: TIMEOUT
      };

      const req = client.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            redirectLocation: res.headers.location
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${TIMEOUT}ms`));
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️'
    }[type] || 'ℹ️';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
    
    this.results.push({ timestamp, type, message });
  }

  async checkSessionEndpoint() {
    this.log('Checking /api/auth/session endpoint...');
    
    try {
      const response = await this.makeRequest('/api/auth/session');
      
      if (response.statusCode === 200) {
        this.log('Session endpoint responding correctly (200)', 'success');
        
        try {
          const sessionData = JSON.parse(response.body);
          if (sessionData.user) {
            this.log(`Session contains user data: ${sessionData.user.email || 'unknown'}`, 'info');
          } else {
            this.log('No active session (expected for unauthenticated request)', 'info');
          }
        } catch (e) {
          this.log('Session response is not valid JSON', 'warning');
        }
      } else {
        this.log(`Session endpoint returned ${response.statusCode}`, 'error');
        this.errors.push(`Session endpoint error: ${response.statusCode}`);
      }
    } catch (error) {
      this.log(`Failed to check session endpoint: ${error.message}`, 'error');
      this.errors.push(`Session endpoint error: ${error.message}`);
    }
  }

  async checkProtectedRouteRedirection() {
    this.log('Checking protected route redirection...');
    
    const protectedRoutes = ['/feed', '/workspace', '/settings'];
    
    for (const route of protectedRoutes) {
      try {
        const response = await this.makeRequest(route, {
          headers: { 'Accept': 'text/html' }
        });
        
        // Check for redirect to login (302/307) or login page content
        if (response.statusCode === 302 || response.statusCode === 307) {
          if (response.redirectLocation && response.redirectLocation.includes('/auth/login')) {
            this.log(`${route} correctly redirects to login`, 'success');
          } else {
            this.log(`${route} redirects but not to login: ${response.redirectLocation}`, 'warning');
          }
        } else if (response.statusCode === 200) {
          // Check if the response contains login form or redirect script
          if (response.body.includes('sign in') || response.body.includes('login') || response.body.includes('/auth/login')) {
            this.log(`${route} shows login page (200)`, 'success');
          } else {
            this.log(`${route} accessible without authentication!`, 'error');
            this.errors.push(`Protected route ${route} is accessible without auth`);
          }
        } else {
          this.log(`${route} returned unexpected status: ${response.statusCode}`, 'warning');
        }
      } catch (error) {
        this.log(`Failed to check ${route}: ${error.message}`, 'error');
        this.errors.push(`Protected route check error: ${error.message}`);
      }
    }
  }

  async checkPublicProfile() {
    this.log('Checking public profile access...');
    
    try {
      const response = await this.makeRequest('/demo');
      
      if (response.statusCode === 200) {
        this.log('Public profile /demo accessible (200)', 'success');
        
        // Check if response contains user info and public posts
        const body = response.body.toLowerCase();
        if (body.includes('admin') || body.includes('user')) {
          this.log('Profile page contains user information', 'success');
        } else {
          this.log('Profile page might not be rendering correctly', 'warning');
        }
      } else if (response.statusCode === 404) {
        this.log('Profile /demo not found (404) - user might not exist', 'warning');
      } else {
        this.log(`Public profile returned ${response.statusCode}`, 'error');
        this.errors.push(`Public profile error: ${response.statusCode}`);
      }
    } catch (error) {
      this.log(`Failed to check public profile: ${error.message}`, 'error');
      this.errors.push(`Public profile error: ${error.message}`);
    }
  }

  async checkPublicRoutes() {
    this.log('Checking public routes accessibility...');
    
    const publicRoutes = ['/', '/auth/login', '/auth/register'];
    
    for (const route of publicRoutes) {
      try {
        const response = await this.makeRequest(route);
        
        if (response.statusCode === 200) {
          this.log(`${route} accessible (200)`, 'success');
        } else if (response.statusCode >= 300 && response.statusCode < 400) {
          this.log(`${route} redirects (${response.statusCode})`, 'info');
        } else {
          this.log(`${route} returned ${response.statusCode}`, 'warning');
        }
      } catch (error) {
        this.log(`Failed to check ${route}: ${error.message}`, 'error');
        this.errors.push(`Public route error: ${error.message}`);
      }
    }
  }

  async checkApiFeed() {
    this.log('Checking /api/feed without session...');
    try {
      const response = await this.makeRequest('/api/feed');
      if (response.statusCode === 200) {
        try {
          const data = JSON.parse(response.body);
          const posts = data.posts || [];
          const hasNonPublic = posts.some(p => p.visibility !== 'public');
          if (!hasNonPublic) {
            this.log('Feed returns only public posts', 'success');
          } else {
            this.log('Feed returned non-public posts', 'error');
            this.errors.push('Feed exposes non-public posts');
          }
          this.firstPostId = posts[0]?.id || null;
        } catch (e) {
          this.log('Failed to parse feed response', 'error');
          this.errors.push('Feed parse error');
        }
      } else {
        this.log(`/api/feed returned ${response.statusCode}`, 'error');
        this.errors.push(`Feed API error: ${response.statusCode}`);
      }
    } catch (error) {
      this.log(`Failed to check feed API: ${error.message}`, 'error');
      this.errors.push(`Feed API error: ${error.message}`);
    }
  }

  async checkPublicPost() {
    if (!this.firstPostId) {
      this.log('Skipping public post check - no post id', 'warning');
      return;
    }
    this.log('Checking public post accessibility...');
    try {
      const response = await this.makeRequest(`/post/${this.firstPostId}`);
      if (response.statusCode === 200) {
        this.log(`/post/${this.firstPostId} accessible (200)`, 'success');
      } else {
        this.log(`/post/${this.firstPostId} returned ${response.statusCode}`, 'error');
        this.errors.push(`Public post error: ${response.statusCode}`);
      }
    } catch (error) {
      this.log(`Failed to check public post: ${error.message}`, 'error');
      this.errors.push(`Public post error: ${error.message}`);
    }
  }

  async checkReactEndpoint() {
    if (!this.firstPostId) {
      this.log('Skipping reaction endpoint test - no post id', 'warning');
      return;
    }
    this.log('Checking reaction endpoint without session...');
    try {
      const response = await this.makeRequest(`/api/feed/${this.firstPostId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (response.statusCode === 401) {
        this.log('React endpoint correctly requires authentication', 'success');
      } else {
        this.log(`React endpoint returned ${response.statusCode}`, 'error');
        this.errors.push(`React endpoint unauthorized check failed: ${response.statusCode}`);
      }
    } catch (error) {
      this.log(`Failed to check reaction endpoint: ${error.message}`, 'error');
      this.errors.push(`React endpoint error: ${error.message}`);
    }
  }

  async checkServer() {
    this.log('Checking if server is running...');
    
    try {
      const response = await this.makeRequest('/');
      this.log('Server is responding', 'success');
      return true;
    } catch (error) {
      this.log(`Server not responding: ${error.message}`, 'error');
      this.log('Make sure the development server is running with: npm run dev', 'info');
      return false;
    }
  }

  async run() {
    console.log('🔐 Authentication System Validation');
    console.log('=====================================');
    console.log(`Target URL: ${BASE_URL}`);
    console.log('');

    const serverRunning = await this.checkServer();
    if (!serverRunning) {
      this.generateReport();
      process.exit(1);
    }

    await this.checkSessionEndpoint();
    await this.checkPublicRoutes();
    await this.checkProtectedRouteRedirection();
    await this.checkPublicProfile();
    await this.checkApiFeed();
    await this.checkPublicPost();
    await this.checkReactEndpoint();

    this.generateReport();
  }

  generateReport() {
    console.log('');
    console.log('📊 Validation Report');
    console.log('===================');
    
    const successCount = this.results.filter(r => r.type === 'success').length;
    const errorCount = this.errors.length;
    const warningCount = this.results.filter(r => r.type === 'warning').length;
    
    console.log(`✅ Successful checks: ${successCount}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (this.errors.length > 0) {
      console.log('');
      console.log('🚨 Issues found:');
      this.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('');
    if (errorCount === 0) {
      console.log('🎉 All critical checks passed! Authentication system is working correctly.');
      process.exit(0);
    } else {
      console.log('💥 Some checks failed. Please review the issues above.');
      process.exit(1);
    }
  }
}

// Run the checker
if (require.main === module) {
  const checker = new AuthChecker();
  checker.run().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = AuthChecker;