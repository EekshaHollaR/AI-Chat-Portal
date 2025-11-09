import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from ai_module.llm_client import LLMClient

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat with LLM
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Connected to chat'
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Receive message from WebSocket"""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'typing':
            await self.handle_typing_indicator(data)
    
    async def handle_chat_message(self, data):
        """Handle incoming chat message and get LLM response"""
        user_message = data.get('message', '')
        
        # Save user message to database
        await self.save_message(user_message, 'user')
        
        # Broadcast user message to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': user_message,
                'sender': 'user',
                'timestamp': str(timezone.now())
            }
        )
        
        # Get conversation history for context
        messages = await self.get_conversation_history()
        
        # Get LLM response with streaming
        llm_client = LLMClient()
        
        # Send typing indicator
        await self.send(text_data=json.dumps({
            'type': 'ai_typing',
            'is_typing': True
        }))
        
        # Stream AI response
        full_response = ""
        async for chunk in llm_client.stream_chat_response(messages):
            full_response += chunk
            await self.send(text_data=json.dumps({
                'type': 'ai_response_chunk',
                'chunk': chunk
            }))
        
        # Save complete AI response
        await self.save_message(full_response, 'ai')
        
        # Send completion signal
        await self.send(text_data=json.dumps({
            'type': 'ai_response_complete',
            'message': full_response,
            'timestamp': str(timezone.now())
        }))
    
    async def handle_typing_indicator(self, data):
        """Handle typing indicator"""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'is_typing': data.get('is_typing', False)
            }
        )
    
    async def chat_message(self, event):
        """Send chat message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'sender': event['sender'],
            'timestamp': event['timestamp']
        }))
    
    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'is_typing': event['is_typing']
        }))
    
    @database_sync_to_async
    def save_message(self, content, sender):
        """Save message to database"""
        from django.utils import timezone
        conversation = Conversation.objects.get(id=self.conversation_id)
        return Message.objects.create(
            conversation=conversation,
            content=content,
            sender=sender,
            timestamp=timezone.now()
        )
    
    @database_sync_to_async
    def get_conversation_history(self):
        """Get conversation history for context"""
        conversation = Conversation.objects.get(id=self.conversation_id)
        messages = conversation.messages.all().order_by('timestamp')
        return [
            {'role': 'user' if msg.sender == 'user' else 'assistant', 
             'content': msg.content}
            for msg in messages
        ]
