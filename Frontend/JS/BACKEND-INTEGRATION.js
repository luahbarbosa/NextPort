/**
 * BACKEND INTEGRATION GUIDE
 * 
 * Este arquivo contém exemplos de integração com diferentes tipos de backend.
 * Escolha o exemplo que corresponde ao seu stack.
 */

// ===== INTEGRAÇÃO COM NODE.JS + EXPRESS =====

/**
 * Backend: Node.js + Express
 * Arquivo: backend/server.js (exemplo)
 */

/*
// Exemplo do servidor
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Endpoint: Obter dados do dashboard
app.get('/api/v1/dashboard', authenticateToken, async (req, res) => {
    try {
        const metrics = await getMetrics();
        const networkMonitor = await getNetworkMetrics();
        
        res.json({
            metrics,
            networkMonitor,
            notifications: 3,
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint: Criar novo dispositivo
app.post('/api/v1/devices', authenticateToken, async (req, res) => {
    try {
        const { name, type, location } = req.body;
        
        // Validação
        if (!name || !type || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const device = await Device.create({ name, type, location });
        res.status(201).json(device);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3001, () => console.log('API running on port 3001'));
*/

// ===== INTEGRAÇÃO COM PYTHON + FLASK =====

/*
// Arquivo: backend/app.py (exemplo)
from flask import Flask, request, jsonify
from flask_cors import CORS
from functools import wraps
import jwt

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

def verify_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').split(' ')[1] if 'Authorization' in request.headers else None
        if not token:
            return jsonify({'error': 'Missing token'}), 401
        try:
            # Verificar token
            pass
        except:
            return jsonify({'error': 'Invalid token'}), 403
        return f(*args, **kwargs)
    return decorated

@app.route('/api/v1/dashboard', methods=['GET'])
@verify_token
def get_dashboard():
    metrics = {
        'totalDevices': 128,
        'devicesOnline': 96,
        'devicesOffline': 24,
        'devicesUnstable': 8
    }
    
    networkMonitor = {
        'latency': 32,
        'bandwidth': 68,
        'uptime': 99.9,
        'connectionErrors': 12
    }
    
    return jsonify({
        'metrics': metrics,
        'networkMonitor': networkMonitor,
        'notifications': 3
    })

@app.route('/api/v1/devices', methods=['POST'])
@verify_token
def create_device():
    data = request.get_json()
    
    # Validação
    required_fields = ['name', 'type', 'location']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Salvar dispositivo no banco de dados
    device = Device.create(**data)
    
    return jsonify(device.to_dict()), 201

if __name__ == '__main__':
    app.run(debug=True, port=3001)
*/

// ===== INTEGRAÇÃO COM JAVA + SPRING BOOT =====

/*
// Arquivo: backend/DashboardController.java (exemplo)
@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard(
        @RequestHeader("Authorization") String token) {
        
        // Verificar token
        if (!authService.verifyToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        DashboardDTO dashboard = dashboardService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }
    
    @PostMapping("/devices")
    public ResponseEntity<DeviceDTO> createDevice(
        @RequestHeader("Authorization") String token,
        @RequestBody CreateDeviceRequest request) {
        
        if (!authService.verifyToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        
        if (!isValid(request)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        Device device = deviceService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(device));
    }
}
*/

// ===== INTEGRAÇÃO COM .NET / C# =====

/*
// Arquivo: backend/Controllers/DashboardController.cs (exemplo)
[ApiController]
[Route("api/v1")]
[EnableCors("NexPortPolicy")]
public class DashboardController : ControllerBase {
    
    private readonly IDashboardService _dashboardService;
    
    [HttpGet("dashboard")]
    [Authorize]
    public async Task<ActionResult<DashboardResponse>> GetDashboard() {
        try {
            var dashboard = await _dashboardService.GetDashboardAsync();
            return Ok(dashboard);
        } catch (Exception ex) {
            return StatusCode(500, new { error = ex.Message });
        }
    }
    
    [HttpPost("devices")]
    [Authorize]
    public async Task<ActionResult<DeviceResponse>> CreateDevice(
        CreateDeviceRequest request) {
        
        if (!ModelState.IsValid) {
            return BadRequest(ModelState);
        }
        
        var device = await _deviceService.CreateAsync(request);
        return CreatedAtAction(nameof(GetDashboard), device);
    }
}
*/

// ===== INTEGRAÇÃO COM GO =====

/*
// Arquivo: backend/handlers/dashboard.go (exemplo)
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func GetDashboard(c *gin.Context) {
    // Verificar autenticação
    token := c.GetHeader("Authorization")
    if token == "" {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing token"})
        return
    }
    
    dashboard := map[string]interface{}{
        "metrics": map[string]int{
            "totalDevices": 128,
            "devicesOnline": 96,
            "devicesOffline": 24,
            "devicesUnstable": 8,
        },
        "networkMonitor": map[string]interface{}{
            "latency": 32,
            "bandwidth": 68,
            "uptime": 99.9,
            "connectionErrors": 12,
        },
    }
    
    c.JSON(http.StatusOK, dashboard)
}

func CreateDevice(c *gin.Context) {
    var device Device
    if err := c.BindJSON(&device); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // Salvar dispositivo
    // ...
    
    c.JSON(http.StatusCreated, device)
}
*/

// ===== INTEGRAÇÃO COM SUPABASE (Firebase Alternative) =====

/*
// Arquivo: frontend/dashboard.js (com Supabase)

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://seu-projeto.supabase.co',
    'sua-anon-key'
)

async function fetchDashboardData() {
    const { data: dashboard, error } = await supabase
        .from('dashboards')
        .select('*')
        .single()
    
    if (error) console.error('Error:', error)
    return dashboard
}

async function registerNewDevice(deviceData) {
    const { data, error } = await supabase
        .from('devices')
        .insert([deviceData])
        .select()
    
    if (error) console.error('Error:', error)
    return data
}

// Real-time subscription
supabase
    .channel('devices')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'devices' },
        payload => {
            console.log('Device changed:', payload)
            renderDashboard(payload.new)
        }
    )
    .subscribe()
*/

// ===== INTEGRAÇÃO COM FIREBASE REALTIME DATABASE =====

/*
// Arquivo: frontend/dashboard.js (com Firebase)

import { initializeApp } from 'firebase/app'
import { getDatabase, ref, onValue, push, set } from 'firebase/database'

const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    projectId: 'your-project',
    databaseURL: 'https://your-project.firebaseio.com'
}

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

async function fetchDashboardData() {
    return new Promise((resolve) => {
        const dashboardRef = ref(db, 'dashboard')
        onValue(dashboardRef, (snapshot) => {
            resolve(snapshot.val())
        })
    })
}

async function registerNewDevice(deviceData) {
    const devicesRef = ref(db, 'devices')
    const newDeviceRef = push(devicesRef)
    await set(newDeviceRef, deviceData)
    return deviceData
}

// Real-time updates
const devicesRef = ref(db, 'devices')
onValue(devicesRef, (snapshot) => {
    const devices = snapshot.val()
    renderDashboard({ devices })
})
*/

// ===== INTEGRAÇÃO COM GRAPHQL =====

/*
// Arquivo: frontend/dashboard.js (com GraphQL)

const GRAPHQL_ENDPOINT = 'https://sua-api.com/graphql'

async function fetchDashboardData() {
    const query = `
        query {
            dashboard {
                metrics {
                    totalDevices
                    devicesOnline
                    devicesOffline
                    devicesUnstable
                }
                networkMonitor {
                    latency
                    bandwidth
                    uptime
                    connectionErrors
                }
            }
        }
    `
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ query })
    })
    
    const { data } = await response.json()
    return data.dashboard
}

async function registerNewDevice(deviceData) {
    const mutation = `
        mutation CreateDevice($input: CreateDeviceInput!) {
            createDevice(input: $input) {
                id
                name
                type
                location
                status
            }
        }
    `
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
            query: mutation,
            variables: { input: deviceData }
        })
    })
    
    const { data } = await response.json()
    return data.createDevice
}
*/

// ===== INTEGRAÇÃO COM WEBHOOKS & EVENTOS =====

/**
 * Para atualizar o dashboard em tempo real com eventos do backend
 */

function setupWebhookListener() {
    // Usar Server-Sent Events (SSE)
    const eventSource = new EventSource('/api/v1/events', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    })
    
    eventSource.addEventListener('device-status-changed', (event) => {
        const data = JSON.parse(event.data)
        console.log('Device status changed:', data)
        // Atualizar dashboard
        dashboardState.updateState({ newData: data })
    })
    
    eventSource.addEventListener('error', (event) => {
        if (event.readyState === EventSource.CLOSED) {
            console.error('Connection closed')
        }
    })
    
    return eventSource
}

// ===== INTEGRAÇÃO COM WEBSOCKET =====

/**
 * Para comunicação bidirecional em tempo real
 */

function setupWebSocketConnection() {
    const ws = new WebSocket('ws://sua-api.com/ws', [
        'Authorization',
        `Bearer ${localStorage.getItem('authToken')}`
    ])
    
    ws.addEventListener('open', () => {
        console.log('WebSocket connected')
        // Enviar mensagem de inscrição
        ws.send(JSON.stringify({
            type: 'subscribe',
            channel: 'dashboard'
        }))
    })
    
    ws.addEventListener('message', (event) => {
        const data = JSON.parse(event.data)
        
        if (data.type === 'dashboard-update') {
            dashboardState.updateState(data.payload)
        }
        
        if (data.type === 'device-alert') {
            showNotification(data.message, 'warning')
        }
    })
    
    ws.addEventListener('close', () => {
        console.log('WebSocket disconnected')
        // Reconectar depois de 5 segundos
        setTimeout(setupWebSocketConnection, 5000)
    })
    
    ws.addEventListener('error', (error) => {
        console.error('WebSocket error:', error)
    })
    
    return ws
}

// ===== ESTRUTURA ESPERADA DE RESPOSTAS =====

/**
 * Formato esperado das respostas da API
 */

const EXPECTED_RESPONSES = {
    // GET /api/v1/dashboard
    dashboard: {
        metrics: {
            totalDevices: 128,
            devicesOnline: 96,
            devicesOffline: 24,
            devicesUnstable: 8,
            onlinePercentage: 75,
            offlinePercentage: 19,
            unstablePercentage: 6
        },
        networkMonitor: {
            latency: 32,        // ms
            bandwidth: 68,      // %
            uptime: 99.9,       // %
            connectionErrors: 12
        },
        notifications: 3,
        timestamp: "2024-01-15T10:30:00Z"
    },

    // GET /api/v1/devices
    devices: [
        {
            id: 1,
            name: "Sensor Sala",
            type: "sensor",
            location: "Sala Principal",
            status: "online",
            lastSeen: "2024-01-15T10:25:00Z",
            signalStrength: -45
        }
    ],

    // POST /api/v1/devices
    deviceCreated: {
        id: 123,
        name: "Novo Dispositivo",
        type: "sensor",
        location: "Cozinha",
        status: "pending",
        createdAt: "2024-01-15T10:30:00Z"
    },

    // POST /api/v1/auth/login
    authResponse: {
        token: "eyJhbGciOiJIUzI1NiIs...",
        refreshToken: "eyJhbGciOiJIUzI1NiIs...",
        user: {
            id: 1,
            email: "user@example.com",
            name: "Laura Meneses",
            role: "admin"
        }
    }
};

// ===== TRATAMENTO DE ERROS PADRÃO =====

/**
 * Formato esperado para erros da API
 */

const ERROR_RESPONSES = {
    badRequest: {
        status: 400,
        error: "Bad Request",
        message: "Campo 'name' é obrigatório",
        errors: {
            name: "Este campo é obrigatório"
        }
    },

    unauthorized: {
        status: 401,
        error: "Unauthorized",
        message: "Token inválido ou expirado"
    },

    forbidden: {
        status: 403,
        error: "Forbidden",
        message: "Você não tem permissão para esta ação"
    },

    notFound: {
        status: 404,
        error: "Not Found",
        message: "Dispositivo não encontrado"
    },

    serverError: {
        status: 500,
        error: "Internal Server Error",
        message: "Erro ao processar a requisição"
    },

    serviceUnavailable: {
        status: 503,
        error: "Service Unavailable",
        message: "Servidor em manutenção"
    }
};

// ===== EXEMPLO COMPLETO DE IMPLEMENTAÇÃO =====

/**
 * Implementação completa com tratamento de erros
 */

class BackendIntegration {
    constructor(apiUrl, token) {
        this.apiUrl = apiUrl;
        this.token = token;
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async request(endpoint, options = {}) {
        try {
            const url = `${this.apiUrl}${endpoint}`
            const headers = {
                'Content-Type': 'application/json',
                ...options.headers
            }

            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`
            }

            const response = await fetch(url, {
                ...options,
                headers
            })

            if (response.status === 401) {
                // Token expirado - refresh
                await this.refreshToken()
                return this.request(endpoint, options)
            }

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || response.statusText)
            }

            return await response.json()

        } catch (error) {
            if (this.retryCount < this.maxRetries) {
                this.retryCount++
                await new Promise(r => setTimeout(r, 1000 * this.retryCount))
                return this.request(endpoint, options)
            }
            throw error
        }
    }

    async refreshToken() {
        // Implementar refresh de token
        console.log('Refreshing token...')
    }
}

// Usar:
// const integration = new BackendIntegration('https://api.nexport.com/v1', token)
// const dashboard = await integration.request('/dashboard')
