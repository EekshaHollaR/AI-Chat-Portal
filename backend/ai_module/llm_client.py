import os
from typing import AsyncGenerator, List, Dict
import openai
from anthropic import AsyncAnthropic
import google.generativeai as genai

class LLMClient:
    """
    Unified client for multiple LLM providers
    Supports: OpenAI, Anthropic Claude, Google Gemini, LM Studio
    """
    
    def __init__(self, provider='openai'):
        """
        Initialize LLM client
        
        Args:
            provider: 'openai', 'claude', 'gemini', or 'lmstudio'
        """
        self.provider = provider.lower()
        self._setup_client()
    
    def _setup_client(self):
        """Setup the appropriate LLM client based on provider"""
        if self.provider == 'openai':
            openai.api_key = os.getenv('OPENAI_API_KEY')
            self.model = 'gpt-4'
        
        elif self.provider == 'claude':
            self.client = AsyncAnthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
            self.model = 'claude-3-sonnet-20240229'
        
        elif self.provider == 'gemini':
            genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
            self.model = genai.GenerativeModel('gemini-pro')
        
        elif self.provider == 'lmstudio':
            # LM Studio uses OpenAI-compatible API
            openai.api_base = os.getenv('LM_STUDIO_URL', 'http://localhost:1234/v1')
            openai.api_key = 'lm-studio'  # LM Studio doesn't require real key
            self.model = 'local-model'
    
    async def stream_chat_response(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat response from LLM
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            
        Yields:
            str: Response chunks
        """
        if self.provider in ['openai', 'lmstudio']:
            async for chunk in self._stream_openai(messages, temperature, max_tokens):
                yield chunk
        
        elif self.provider == 'claude':
            async for chunk in self._stream_claude(messages, temperature, max_tokens):
                yield chunk
        
        elif self.provider == 'gemini':
            async for chunk in self._stream_gemini(messages, temperature, max_tokens):
                yield chunk
    
    async def _stream_openai(self, messages, temperature, max_tokens):
        """Stream from OpenAI API"""
        response = await openai.ChatCompletion.acreate(
            model=self.model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True
        )
        
        async for chunk in response:
            if chunk.choices.delta.get('content'):
                yield chunk.choices.delta.content
    
    async def _stream_claude(self, messages, temperature, max_tokens):
        """Stream from Anthropic Claude API"""
        # Convert messages to Claude format
        system_message = ""
        user_messages = []
        
        for msg in messages:
            if msg['role'] == 'system':
                system_message = msg['content']
            else:
                user_messages.append(msg)
        
        async with self.client.messages.stream(
            model=self.model,
            messages=user_messages,
            system=system_message if system_message else None,
            temperature=temperature,
            max_tokens=max_tokens
        ) as stream:
            async for text in stream.text_stream:
                yield text
    
    async def _stream_gemini(self, messages, temperature, max_tokens):
        """Stream from Google Gemini API"""
        # Convert messages to Gemini format
        prompt = "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages])
        
        response = await self.model.generate_content_async(
            prompt,
            stream=True,
            generation_config={
                'temperature': temperature,
                'max_output_tokens': max_tokens
            }
        )
        
        async for chunk in response:
            if chunk.text:
                yield chunk.text
    
    async def get_completion(
        self, 
        messages: List[Dict[str, str]], 
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """
        Get complete response from LLM (non-streaming)
        
        Args:
            messages: List of message dicts
            temperature: Sampling temperature
            max_tokens: Maximum tokens
            
        Returns:
            str: Complete response
        """
        full_response = ""
        async for chunk in self.stream_chat_response(messages, temperature, max_tokens):
            full_response += chunk
        return full_response


class ConversationSummarizer:
    """Generate conversation summaries using LLM"""
    
    def __init__(self, provider='openai'):
        self.llm_client = LLMClient(provider)
    
    async def generate_summary(self, messages: List[Dict]) -> str:
        """
        Generate a summary of the conversation
        
        Args:
            messages: List of Message objects
            
        Returns:
            str: Summary text
        """
        # Format conversation for summarization
        conversation_text = self._format_conversation(messages)
        
        prompt = f"""Please provide a comprehensive summary of the following conversation. 
Include:
1. Main topics discussed
2. Key points and insights
3. Any decisions or action items
4. Overall sentiment and tone

Conversation:
{conversation_text}

Summary:"""
        
        summary = await self.llm_client.get_completion([
            {'role': 'user', 'content': prompt}
        ], temperature=0.3, max_tokens=500)
        
        return summary
    
    def _format_conversation(self, messages) -> str:
        """Format messages into readable text"""
        formatted = []
        for msg in messages:
            sender = "User" if msg.sender == 'user' else "AI"
            formatted.append(f"{sender}: {msg.content}")
        return "\n".join(formatted)
