import { useEffect, useRef, useState, useCallback } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export const useWebSocket = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  const ws = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!conversationId) return;

    try {
      const wsUrl = `${WS_BASE_URL}/ws/chat/${conversationId}/`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection_established':
            console.log('Connection confirmed:', data.message);
            break;
            
          case 'chat_message':
            setMessages((prev) => [
              ...prev,
              {
                content: data.message,
                sender: data.sender,
                timestamp: data.timestamp,
              },
            ]);
            break;
            
          case 'ai_typing':
            setIsTyping(data.is_typing);
            break;
            
          case 'ai_response_chunk':
            // Handle streaming response
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.sender === 'ai' && lastMessage.isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: lastMessage.content + data.chunk },
                ];
              } else {
                return [
                  ...prev,
                  { content: data.chunk, sender: 'ai', isStreaming: true },
                ];
              }
            });
            break;
            
          case 'ai_response_complete':
            setIsTyping(false);
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.isStreaming) {
                return [
                  ...prev.slice(0, -1),
                  {
                    content: data.message,
                    sender: 'ai',
                    timestamp: data.timestamp,
                    isStreaming: false,
                  },
                ];
              }
              return prev;
            });
            break;
            
          case 'typing_indicator':
            setIsTyping(data.is_typing);
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error occurred');
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          console.log(`Reconnecting in ${timeout}ms...`);
          reconnectAttempts.current += 1;
          setTimeout(() => connect(), timeout);
        } else {
          setError('Failed to connect after multiple attempts');
        }
      };
    } catch (err) {
      console.error('Error creating WebSocket:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [conversationId]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'chat_message',
        message: message,
      }));
      
      // Add user message to local state immediately
      setMessages((prev) => [
        ...prev,
        {
          content: message,
          sender: 'user',
          timestamp: new Date().toISOString(),
        },
      ]);
    } else {
      console.error('WebSocket is not connected');
      setError('Cannot send message: not connected');
    }
  }, []);

  const sendTyping = useCallback((isTyping) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        type: 'typing',
        is_typing: isTyping,
      }));
    }
  }, []);

  return {
    messages,
    isConnected,
    isTyping,
    error,
    sendMessage,
    sendTyping,
  };
};
