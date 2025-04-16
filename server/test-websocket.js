const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:3002');

ws.on('open', () => {
    console.log('Connecté au serveur WebSocket');
    
    // Enregistrer un webhook
    const registerMessage = {
        type: 'register',
        webhook: {
            nodeId: 'test-node-1',
            path: '/webhook/webflow/test-path',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"test": "data"}'
        }
    };
    
    ws.send(JSON.stringify(registerMessage));
});

ws.on('message', (data) => {
    console.log('Message reçu:', data.toString());
});

ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
});
