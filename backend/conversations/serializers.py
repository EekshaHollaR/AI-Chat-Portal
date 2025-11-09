from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'content', 'sender', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class ConversationListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'status', 'start_timestamp', 
                  'end_timestamp', 'message_count', 'created_at']
        read_only_fields = ['id', 'start_timestamp', 'created_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()

class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'title', 'status', 'summary', 'start_timestamp',
                  'end_timestamp', 'messages', 'created_at', 'updated_at']
        read_only_fields = ['id', 'start_timestamp', 'created_at', 'updated_at']

class ConversationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ['title']

class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['conversation', 'content', 'sender']
