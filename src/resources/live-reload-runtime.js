(function() {
  const ws = new WebSocket('ws://localhost:3000/ws');
  ws.onmessage = msg => {
    switch(msg.data) {
      case 'ready':
        console.log('Live reload enabled...');
        break;
      case 'onchange':
        window.location.reload();
        break;
      default:
        console.error(`Unknown message type: ${msg.data}`);
    }
  }
})();