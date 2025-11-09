from typing import List, Dict
from .llm_client import ConversationSummarizer
import asyncio

class ConversationAnalyzer:
    """
    Analyze conversations for insights, summaries, and intelligence
    """
    
    def __init__(self, provider='openai'):
        self.summarizer = ConversationSummarizer(provider)
    
    def generate_summary(self, messages: List) -> str:
        """
        Generate conversation summary synchronously
        
        Args:
            messages: List of Message objects
            
        Returns:
            str: Summary text
        """
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        summary = loop.run_until_complete(self.summarizer.generate_summary(messages))
        loop.close()
        return summary
    
    def extract_key_points(self, messages: List) -> List[str]:
        """Extract key points from conversation"""
        # Simple implementation - can be enhanced with LLM
        key_points = []
        for msg in messages:
            if len(msg.content) > 100:  # Longer messages likely contain key points
                key_points.append(msg.content[:200])
        return key_points[:5]
    
    def analyze_sentiment(self, messages: List) -> Dict[str, float]:
        """Analyze conversation sentiment"""
        # Placeholder - implement with sentiment analysis library
        return {
            'positive': 0.6,
            'neutral': 0.3,
            'negative': 0.1
        }
