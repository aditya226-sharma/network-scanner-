// Advanced Network Scanner with Real-time Features
class NetworkScanner {
    constructor() {
        this.isScanning = false;
        this.isPaused = false;
        this.scanAborted = false;
        this.scanResults = [];
        this.scanStartTime = null;
        this.scannedHosts = 0;
        this.activeHosts = 0;
        this.scanRate = 0;
        this.canvas = null;
        this.ctx = null;
        this.networkNodes = [];
        
        this.initializeCanvas();
        this.setupEventListeners();
        this.createParticles();
    }
    
    initializeCanvas() {
        this.canvas = document.getElementById('topologyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawNetworkTopology();
    }
    
    setupEventListeners() {
        document.getElementById('scanSpeed').addEventListener('input', this.updateSpeedLabel);
        document.getElementById('portPresets').addEventListener('change', this.loadPortPreset);
        
        // Real-time filtering
        document.getElementById('searchFilter').addEventListener('input', this.filterResults);
        document.getElementById('statusFilter').addEventListener('change', this.filterResults);
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${5 + Math.random() * 10}s linear infinite;
            `;
            particlesContainer.appendChild(particle);
        }
    }
    
    parseIPRange(range) {
        const parts = range.split('-');
        if (parts.length !== 2) return [];
        
        const baseIP = parts[0].trim();
        const endRange = parseInt(parts[1].trim());
        const ipParts = baseIP.split('.');
        
        if (ipParts.length !== 4) return [];
        
        const ips = [];
        const baseNum = parseInt(ipParts[3]);
        
        for (let i = baseNum; i <= endRange; i++) {
            ips.push(`${ipParts[0]}.${ipParts[1]}.${ipParts[2]}.${i}`);
        }
        
        return ips;
    }
    
    parsePorts(portString) {
        return portString.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p) && p > 0 && p <= 65535);
    }
    
    async simulatePortScan(ip, port, aggressive = false) {
        const timeout = aggressive ? 1000 : 3000;
        const successRate = aggressive ? 0.25 : 0.15;
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const isOpen = Math.random() < successRate;
                const service = this.getServiceName(port);
                resolve({ open: isOpen, service, filtered: Math.random() < 0.1 });
            }, Math.random() * timeout);
        });
    }
    
    getServiceName(port) {
        const services = {
            21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS',
            80: 'HTTP', 110: 'POP3', 143: 'IMAP', 443: 'HTTPS', 993: 'IMAPS',
            995: 'POP3S', 3389: 'RDP', 5432: 'PostgreSQL', 3306: 'MySQL',
            1433: 'MSSQL', 6379: 'Redis', 27017: 'MongoDB', 8080: 'HTTP-Alt'
        };
        return services[port] || 'Unknown';
    }
    
    simulateOSDetection() {
        const os = ['Windows 10', 'Windows Server 2019', 'Ubuntu 20.04', 'CentOS 8', 'macOS', 'FreeBSD'];
        return os[Math.floor(Math.random() * os.length)];
    }
    
    updateProgress(current, total) {
        const percentage = (current / total) * 100;
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressText').textContent = `Scanning ${current}/${total} hosts`;
        
        // Update stats
        const elapsed = (Date.now() - this.scanStartTime) / 1000;
        const rate = current / elapsed;
        const eta = total > current ? (total - current) / rate : 0;
        
        document.getElementById('currentIP').textContent = `Host ${current}`;
        document.getElementById('scanRate').textContent = rate.toFixed(1);
        document.getElementById('timeElapsed').textContent = this.formatTime(elapsed);
        document.getElementById('eta').textContent = eta > 0 ? `ETA: ${this.formatTime(eta)}` : '';
        
        // Update navbar stats
        document.getElementById('totalScanned').textContent = this.scannedHosts;
        document.getElementById('hostsFound').textContent = this.activeHosts;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    addHostResult(ip, portResults, osInfo = null) {
        const resultsContainer = document.getElementById('results');
        
        // Remove "no results" message
        const noResults = resultsContainer.querySelector('.no-results');
        if (noResults) noResults.remove();
        
        const openPorts = portResults.filter(p => p.open);
        const isActive = openPorts.length > 0;
        
        if (isActive) this.activeHosts++;
        
        const hostDiv = document.createElement('div');
        hostDiv.className = 'host-result';
        hostDiv.dataset.status = isActive ? 'active' : 'inactive';
        hostDiv.dataset.ip = ip;
        
        const hostHeader = document.createElement('div');
        hostHeader.className = 'host-header';
        hostHeader.innerHTML = `
            <span><i class="fas fa-desktop"></i> ${ip}</span>
            <span class="host-status ${isActive ? 'status-active' : 'status-inactive'}">
                ${isActive ? 'Active' : 'Inactive'}
            </span>
        `;
        
        const hostInfo = document.createElement('div');
        hostInfo.className = 'host-info';
        hostInfo.innerHTML = `
            <div><strong>Open Ports:</strong> ${openPorts.length}</div>
            <div><strong>OS:</strong> ${osInfo || 'Unknown'}</div>
        `;
        
        const portList = document.createElement('div');
        portList.className = 'port-list';
        
        if (openPorts.length > 0) {
            openPorts.forEach(port => {
                const portBadge = document.createElement('span');
                portBadge.className = 'port-badge';
                portBadge.innerHTML = `<i class="fas fa-door-open"></i> ${port.port}/${port.service}`;
                portList.appendChild(portBadge);
            });
        } else {
            portList.innerHTML = '<span style="color: rgba(255,255,255,0.6); font-style: italic;">No open ports detected</span>';
        }
        
        hostDiv.appendChild(hostHeader);
        hostDiv.appendChild(hostInfo);
        hostDiv.appendChild(portList);
        resultsContainer.appendChild(hostDiv);
        
        // Add to network topology
        this.addNetworkNode(ip, isActive, openPorts.length);
        
        // Store result
        this.scanResults.push({ ip, ports: portResults, os: osInfo, active: isActive });
    }
    
    addNetworkNode(ip, active, portCount) {
        const node = {
            ip,
            x: Math.random() * (this.canvas.width - 100) + 50,
            y: Math.random() * (this.canvas.height - 100) + 50,
            active,
            portCount,
            pulse: 0
        };
        this.networkNodes.push(node);
        this.drawNetworkTopology();
    }
    
    drawNetworkTopology() {
        if (!this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw connections
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.networkNodes.length; i++) {
            for (let j = i + 1; j < this.networkNodes.length; j++) {
                const node1 = this.networkNodes[i];
                const node2 = this.networkNodes[j];
                
                if (node1.active && node2.active) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(node1.x, node1.y);
                    this.ctx.lineTo(node2.x, node2.y);
                    this.ctx.stroke();
                }
            }
        }
        
        // Draw nodes
        this.networkNodes.forEach(node => {
            const radius = 8 + (node.portCount * 2);
            
            // Pulse effect for active nodes
            if (node.active) {
                node.pulse += 0.1;
                const pulseRadius = radius + Math.sin(node.pulse) * 3;
                
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
                this.ctx.fill();
            }
            
            // Main node
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = node.active ? '#10b981' : '#6b7280';
            this.ctx.fill();
            
            // IP label
            this.ctx.fillStyle = 'white';
            this.ctx.font = '10px Inter';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(node.ip.split('.').pop(), node.x, node.y - radius - 5);
        });
        
        if (this.isScanning) {
            requestAnimationFrame(() => this.drawNetworkTopology());
        }
    }
    
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    filterResults() {
        const searchTerm = document.getElementById('searchFilter').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        
        const hostResults = document.querySelectorAll('.host-result');
        
        hostResults.forEach(host => {
            const ip = host.dataset.ip;
            const status = host.dataset.status;
            
            const matchesSearch = ip.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || status === statusFilter;
            
            host.style.display = matchesSearch && matchesStatus ? 'block' : 'none';
        });
    }
    
    exportResults() {
        const data = {
            scanTime: new Date().toISOString(),
            totalHosts: this.scannedHosts,
            activeHosts: this.activeHosts,
            results: this.scanResults
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `network_scan_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('Scan results exported successfully!');
    }
    
    updateSpeedLabel() {
        const speed = document.getElementById('scanSpeed').value;
        const labels = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
        document.getElementById('speedLabel').textContent = labels[speed - 1];
    }
    
    loadPortPreset() {
        const preset = document.getElementById('portPresets').value;
        const presets = {
            common: '21,22,23,25,53,80,110,143,443,993,995,3389',
            web: '80,443,8080,8443,3000,5000,8000,9000',
            mail: '25,110,143,465,587,993,995',
            database: '1433,3306,5432,6379,27017,5984'
        };
        
        if (presets[preset]) {
            document.getElementById('ports').value = presets[preset];
        }
    }
    
    async autoDetectNetwork() {
        this.showToast('Auto-detecting network range...', 'warning');
        
        // Simulate network detection
        setTimeout(() => {
            const ranges = ['192.168.1.1-254', '192.168.0.1-254', '10.0.0.1-254', '172.16.0.1-254'];
            const detected = ranges[Math.floor(Math.random() * ranges.length)];
            document.getElementById('ipRange').value = detected;
            this.showToast(`Detected network range: ${detected}`);
        }, 2000);
    }
    
    async startScan() {
        if (this.isScanning) return;
        
        const ipRange = document.getElementById('ipRange').value;
        const portsInput = document.getElementById('ports').value;
        
        if (!ipRange || !portsInput) {
            this.showToast('Please enter both IP range and ports', 'error');
            return;
        }
        
        const ips = this.parseIPRange(ipRange);
        const ports = this.parsePorts(portsInput);
        
        if (ips.length === 0) {
            this.showToast('Invalid IP range format', 'error');
            return;
        }
        
        if (ports.length === 0) {
            this.showToast('Invalid ports format', 'error');
            return;
        }
        
        this.isScanning = true;
        this.scanAborted = false;
        this.isPaused = false;
        this.scanStartTime = Date.now();
        this.scannedHosts = 0;
        this.activeHosts = 0;
        this.scanResults = [];
        this.networkNodes = [];
        
        // Update UI
        document.getElementById('scanBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
        
        // Clear results
        document.getElementById('results').innerHTML = '<div class="no-results"><i class="fas fa-spinner fa-spin"></i><p>Scanning in progress...</p></div>';
        
        const aggressive = document.getElementById('aggressiveScan').checked;
        const osDetection = document.getElementById('osDetection').checked;
        const speed = parseInt(document.getElementById('scanSpeed').value);
        const delay = Math.max(50, 500 - (speed * 80));
        
        this.showToast(`Starting scan of ${ips.length} hosts on ${ports.length} ports`);
        
        for (let i = 0; i < ips.length && !this.scanAborted; i++) {
            while (this.isPaused && !this.scanAborted) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            if (this.scanAborted) break;
            
            const ip = ips[i];
            const portResults = [];
            
            // Scan ports for this host
            for (const port of ports) {
                if (this.scanAborted) break;
                
                const result = await this.simulatePortScan(ip, port, aggressive);
                portResults.push({ port, ...result });
            }
            
            // OS Detection
            const osInfo = osDetection ? this.simulateOSDetection() : null;
            
            // Add result if host has open ports or random chance
            if (portResults.some(p => p.open) || Math.random() > 0.8) {
                this.addHostResult(ip, portResults, osInfo);
            }
            
            this.scannedHosts++;
            this.updateProgress(i + 1, ips.length);
            
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // Scan completed
        this.isScanning = false;
        document.getElementById('scanBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
        
        if (this.scanAborted) {
            document.getElementById('progressText').textContent = 'Scan aborted';
            this.showToast('Scan aborted by user', 'warning');
        } else {
            document.getElementById('progressText').textContent = `Scan completed - ${this.activeHosts} active hosts found`;
            this.showToast(`Scan completed! Found ${this.activeHosts} active hosts`);
        }
        
        if (this.scanResults.length === 0) {
            document.getElementById('results').innerHTML = '<div class="no-results"><i class="fas fa-search"></i><p>No active hosts found in the specified range</p></div>';
        }
    }
    
    pauseScan() {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pauseBtn');
        
        if (this.isPaused) {
            btn.innerHTML = '<i class="fas fa-play"></i> Resume';
            this.showToast('Scan paused', 'warning');
        } else {
            btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            this.showToast('Scan resumed');
        }
    }
    
    stopScan() {
        this.scanAborted = true;
        this.isScanning = false;
        this.isPaused = false;
        
        document.getElementById('scanBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

// Global scanner instance
let scanner;

// Global functions for HTML onclick handlers
function startScan() { scanner.startScan(); }
function pauseScan() { scanner.pauseScan(); }
function stopScan() { scanner.stopScan(); }
function autoDetectNetwork() { scanner.autoDetectNetwork(); }
function loadPortPreset() { scanner.loadPortPreset(); }
function filterResults() { scanner.filterResults(); }
function exportResults() { scanner.exportResults(); }

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    scanner = new NetworkScanner();
    
    // Auto-detect network on load
    setTimeout(() => {
        scanner.autoDetectNetwork();
    }, 1000);
});