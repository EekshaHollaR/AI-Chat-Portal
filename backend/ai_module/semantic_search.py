import numpy as np
from typing import List, Dict, Optional
from datetime import datetime
from django.db.models import Q
from conversations.models import Conversation, ConversationEmbedding
from .embeddings import EmbeddingGenerator

class SemanticSearch:
    """
    Semantic search implementation for conversations
    Uses sentence transformers for embedding generation
    """
    
    def __init__(self):
        self.embedding_generator = EmbeddingGenerator(model_name='all-mpnet-base-v2')
    
    def generate_conversation_embedding(self, conversation: Conversation):
        """
        Generate and store embedding for a conversation
        
        Args:
            conversation: Conversation object
        """
        # Combine conversation content
        text_content = self._prepare_conversation_text(conversation)
        
        # Generate embedding
        embedding = self.embedding_generator.generate_embedding(text_content)
        
        # Store in database
        ConversationEmbedding.objects.update_or_create(
            conversation=conversation,
            defaults={
                'embedding_vector': embedding.tolist(),
                'metadata': {
                    'title': conversation.title,
                    'message_count': conversation.messages.count(),
                    'topics': self._extract_topics(text_content)
                }
            }
        )
    
    def search_conversations(
        self,
        query: str,
        top_k: int = 5,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        min_similarity: float = 0.3
    ) -> List[Dict]:
        """
        Search for relevant conversations using semantic search
        
        Args:
            query: Search query
            top_k: Number of results to return
            date_from: Filter conversations from date (YYYY-MM-DD)
            date_to: Filter conversations to date (YYYY-MM-DD)
            min_similarity: Minimum similarity threshold
            
        Returns:
            List[Dict]: List of conversation results with scores
        """
        # Generate query embedding
        query_embedding = self.embedding_generator.generate_embedding(query)
        
        # Build filters
        filters = Q(conversation__status='ended')
        
        if date_from:
            filters &= Q(conversation__created_at__gte=datetime.fromisoformat(date_from))
        if date_to:
            filters &= Q(conversation__created_at__lte=datetime.fromisoformat(date_to))
        
        # Get all conversation embeddings
        embeddings_qs = ConversationEmbedding.objects.filter(filters).select_related('conversation')
        
        if not embeddings_qs.exists():
            return []
        
        # Extract embeddings and IDs
        conversations = []
        corpus_embeddings = []
        
        for emb in embeddings_qs:
            conversations.append(emb.conversation)
            corpus_embeddings.append(np.array(emb.embedding_vector))
        
        corpus_embeddings = np.array(corpus_embeddings)
        
        # Find similar conversations
        results = self.embedding_generator.find_most_similar(
            query_embedding,
            corpus_embeddings,
            top_k=top_k
        )
        
        # Format results
        formatted_results = []
        for idx, score in results:
            if score >= min_similarity:
                conv = conversations[idx]
                formatted_results.append({
                    'conversation_id': str(conv.id),
                    'title': conv.title,
                    'score': score,
                    'summary': conv.summary,
                    'created_at': conv.created_at.isoformat(),
                    'message_count': conv.messages.count()
                })
        
        return formatted_results
    
    def _prepare_conversation_text(self, conversation: Conversation) -> str:
        """Prepare conversation text for embedding"""
        messages = conversation.messages.all()
        
        # Combine title, messages, and summary
        text_parts = [f"Title: {conversation.title}"]
        
        for msg in messages[:50]:  # Limit to first 50 messages
            text_parts.append(f"{msg.sender}: {msg.content}")
        
        if conversation.summary:
            text_parts.append(f"Summary: {conversation.summary}")
        
        return "\n".join(text_parts)
    
    def _extract_topics(self, text: str) -> List[str]:
        """Extract key topics from text (simple keyword extraction)"""
        # Simple implementation - can be enhanced with NLP libraries
        words = text.lower().split()
        common_words = {'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but'}
        topics = [w for w in set(words) if len(w) > 4 and w not in common_words]
        return topics[:10]  # Return top 10 keywords
