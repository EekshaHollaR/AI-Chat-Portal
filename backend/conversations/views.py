from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer, 
    ConversationDetailSerializer,
    ConversationCreateSerializer,
    MessageCreateSerializer
)
from ai_module.conversation_analyzer import ConversationAnalyzer
from ai_module.semantic_search import SemanticSearch

@extend_schema_view(
    list=extend_schema(summary="Get all conversations", tags=["Conversations"]),
    retrieve=extend_schema(summary="Get conversation details", tags=["Conversations"]),
    create=extend_schema(summary="Create new conversation", tags=["Conversations"]),
)
class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ConversationListSerializer
        elif self.action == 'create':
            return ConversationCreateSerializer
        return ConversationDetailSerializer
    
    @extend_schema(
        summary="End conversation and generate summary",
        tags=["Conversations"],
        responses={200: ConversationDetailSerializer}
    )
    @action(detail=True, methods=['post'])
    def end_conversation(self, request, pk=None):
        """End a conversation and trigger AI summary generation"""
        conversation = self.get_object()
        
        if conversation.status == 'ended':
            return Response(
                {'error': 'Conversation already ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update conversation status
        conversation.status = 'ended'
        conversation.end_timestamp = timezone.now()
        conversation.save()
        
        # Generate AI summary
        analyzer = ConversationAnalyzer()
        messages = conversation.messages.all()
        summary = analyzer.generate_summary(messages)
        
        conversation.summary = summary
        conversation.save()
        
        # Generate embeddings for semantic search
        search = SemanticSearch()
        search.generate_conversation_embedding(conversation)
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data)
    
    @extend_schema(
        summary="Query past conversations",
        tags=["Conversations"],
        responses={200: ConversationListSerializer(many=True)}
    )
    @action(detail=False, methods=['post'])
    def query_past(self, request):
        """Query past conversations using semantic search"""
        query_text = request.data.get('query', '')
        date_from = request.data.get('date_from', None)
        date_to = request.data.get('date_to', None)
        top_k = request.data.get('top_k', 5)
        
        if not query_text:
            return Response(
                {'error': 'Query text is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Perform semantic search
        search = SemanticSearch()
        results = search.search_conversations(
            query_text, 
            top_k=top_k,
            date_from=date_from,
            date_to=date_to
        )
        
        # Get relevant conversations
        conversation_ids = [r['conversation_id'] for r in results]
        conversations = Conversation.objects.filter(id__in=conversation_ids)
        
        # Add relevance scores
        relevance_map = {r['conversation_id']: r['score'] for r in results}
        for conv in conversations:
            conv.relevance_score = relevance_map.get(str(conv.id), 0)
        
        serializer = ConversationListSerializer(conversations, many=True)
        return Response({
            'conversations': serializer.data,
            'query': query_text,
            'count': len(conversations)
        })

@extend_schema_view(
    create=extend_schema(summary="Send a message", tags=["Messages"]),
)
class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageCreateSerializer
    http_method_names = ['post']
