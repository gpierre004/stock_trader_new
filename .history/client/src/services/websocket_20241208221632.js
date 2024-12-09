class WebSocketService {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000; // 3 seconds
        this.listeners = new Map();
        this.isConnecting = false;
    }

    connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;

        try {
            // Close existing connection if any
            if (this.ws) {
                this.ws.close();
                this.ws = null;
            }

            this.ws = new WebSocket('ws://localhost:3001/ws');

            this.ws.onopen = () => {
                console.log('WebSocket connected');
                this.reconnectAttempts = 0;
                this.isConnecting = false;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // Notify all listeners for this message type
                    const listeners = this.listeners.get(data.type) || [];
                    listeners.forEach(callback => callback(data));
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.isConnecting = false;
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.isConnecting = false;
            };
        } catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.isConnecting = false;
            this.attemptReconnect();
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                if (!this.isConnecting) {
                    this.connect();
                }
            }, this.reconnectDelay * this.reconnectAttempts); // Exponential backoff
        } else {
            console.error('Max reconnection attempts reached');
        }
    }

    subscribe(type, callback) {
        if (!this.listeners.has(type)) {
            this.listeners.set(type, []);
        }
        this.listeners.get(type).push(callback);
    }

    unsubscribe(type, callback) {
        if (!this.listeners.has(type)) return;
        const listeners = this.listeners.get(type);
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.error('WebSocket is not connected');
            // Attempt to reconnect if not connected
            if (!this.isConnecting) {
                this.connect();
            }
        }
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        // Reset connection state
        this.isConnecting = false;
        this.reconnectAttempts = 0;
    }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
