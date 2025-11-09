from django.contrib import admin
from .models import Conversation, Message, ConversationEmbedding

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'start_timestamp', 'end_timestamp']
    list_filter = ['status', 'created_at']
    search_fields = ['title', 'summary']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'sender', 'timestamp']
    list_filter = ['sender', 'timestamp']
    search_fields = ['content']

@admin.register(ConversationEmbedding)
class ConversationEmbeddingAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'created_at']
