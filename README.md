# Reflector - Domain Monitoring Dashboard

Advanced multi-language infrastructure intelligence system with real-time domain monitoring, security assessment, and performance analytics.

## 🚀 Live Demos

- **🌐 GitHub Pages**: [uprootiny.github.io/reflector](https://uprootiny.github.io/reflector/)
- **🏠 Custom Domain**: [dashboard.dissemblage.art](https://dashboard.dissemblage.art/)
- **📊 Health Status**: [health.json](https://uprootiny.github.io/reflector/health.json)

[![Deploy Status](https://github.com/uprootiny/reflector/workflows/Deploy%20Reflector%20Dashboard/badge.svg)](https://github.com/uprootiny/reflector/actions)

## Features

- **🔍 Real-time Domain Monitoring** - SSL certificates, DNS resolution, response times
- **🛡️ Security Assessment** - Header analysis, vulnerability detection, compliance checking  
- **⚡ Performance Analytics** - Response time tracking, bottleneck identification
- **🧠 ClojureScript Intelligence** - Advanced pattern recognition and anomaly detection
- **🌐 Multi-language Coordination** - HTML/TypeScript frontend with Clojure/Python backends
- **📊 Interactive Dashboard** - Real-time visualizations and alerts

## Architecture

### Polyglot System Design

- **Frontend**: HTML5 + TypeScript for responsive dashboard UI
- **Intelligence**: ClojureScript for functional data processing and analysis
- **Automation**: Python scripts for monitoring and data collection  
- **Coordination**: Clean interfaces between language-specific components

### Core Components

```
reflector/
├── reflector-index.html        # Main dashboard interface
├── cljs/infra-intelligence/    # ClojureScript analysis engine
├── *.py                       # Python monitoring scripts
├── extension/                 # Browser extension for monitoring
└── .github/workflows/         # CI/CD automation
```

## Quick Start

### View Live Dashboard

```bash
# Test the live deployment
curl https://uprootiny.github.io/reflector/
curl https://uprootiny.github.io/reflector/health.json

# Validate features
curl -s https://uprootiny.github.io/reflector/ | grep -q "Infrastructure Intelligence" && echo "✅ Dashboard loaded"
```

### Local Development

```bash
# Clone and setup
git clone https://github.com/uprootiny/reflector.git
cd reflector

# For ClojureScript development
cd cljs/infra-intelligence
npm install shadow-cljs react react-dom
npx shadow-cljs watch app

# Serve locally
python3 -m http.server 8080
# Navigate to http://localhost:8080/reflector-index.html
```

## Infrastructure Intelligence

### Domain Analysis Capabilities

- **SSL/TLS Assessment** - Certificate validation, encryption strength, expiration tracking
- **Security Headers** - HSTS, CSP, X-Frame-Options analysis
- **Performance Profiling** - Response time measurement, bottleneck identification
- **DNS Health** - Record validation, propagation checking
- **Compliance Scoring** - OWASP, security best practices evaluation

### Multi-Language Strengths

**ClojureScript Engine**:
- Immutable data structures for reliable analysis
- Functional composition for complex transformations  
- Reactive state management with Reagent
- Advanced pattern matching and anomaly detection

**Python Automation**:
- Concurrent monitoring across multiple domains
- Integration with external APIs and services
- Automated alerting and notification systems

**TypeScript Frontend**:
- Type-safe dashboard interactions
- Real-time data visualization
- Progressive web app capabilities

## Deployment

### Automated CI/CD

Every push triggers:
- Multi-language build validation
- ClojureScript compilation and optimization
- Automated deployment to GitHub Pages
- Health check validation
- Performance monitoring

### Manual Deployment

```bash
# Build ClojureScript components
cd cljs/infra-intelligence
npx shadow-cljs release app

# Deploy to custom domain
rsync -av --delete . user@dashboard.dissemblage.art:/var/www/reflector/
```

## API Integration

### GitHub Integration
- Repository analysis and deployment readiness assessment
- Automated project discovery and categorization
- Development activity monitoring

### Security APIs
- SSL Labs integration for certificate analysis
- Security headers validation
- Vulnerability scanning and reporting

### DNS Providers
- Multi-provider DNS resolution checking
- Performance comparison across providers
- Propagation delay measurement

## Usage Examples

### Domain Health Check

```javascript
// Using the ClojureScript API
window.infraIntelligence.inspectDomain('example.com', (result) => {
  console.log('Domain analysis:', result);
  console.log('Security score:', result.securityScore);
  console.log('Performance:', result.httpsCheck.responseTime + 'ms');
});
```

### Batch Monitoring

```python
# Python monitoring script
domains = ['hyperstitious.org', 'dissemblage.art', 'cyrillrafael.org']
results = []

for domain in domains:
    health = check_domain_health(domain)
    results.append({
        'domain': domain,
        'ssl_score': health['ssl_score'], 
        'response_time': health['response_time'],
        'security_headers': health['security_headers']
    })
```

## Contributing

1. Fork the repository
2. Create feature branch with language-specific improvements
3. Ensure cross-language integration works properly
4. Add tests for new analysis capabilities
5. Submit pull request with comprehensive documentation

## Infrastructure Philosophy

Reflector demonstrates how different programming paradigms can work together effectively:

- **Functional Programming** (Clojure) for reliable data analysis
- **Object-Oriented** (TypeScript) for interactive user interfaces  
- **Procedural** (Python) for automation and system integration
- **Declarative** (HTML/CSS) for presentation and styling

Each language handles what it does best, with clean interfaces and shared data formats enabling seamless cooperation.

## License

MIT License - see LICENSE file for details.

---

*Advanced infrastructure intelligence through polyglot programming excellence.*
