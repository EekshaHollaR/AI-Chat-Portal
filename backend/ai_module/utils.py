import tiktoken
from typing import List, Dict

def count_tokens(text: str, model: str = "gpt-4") -> int:
    """
    Count tokens in text for a given model
    
    Args:
        text: Input text
        model: Model name
        
    Returns:
        int: Number of tokens
    """
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def truncate_conversation(
    messages: List[Dict[str, str]], 
    max_tokens: int = 4000
) -> List[Dict[str, str]]:
    """
    Truncate conversation to fit within token limit
    
    Args:
        messages: List of message dicts
        max_tokens: Maximum token limit
        
    Returns:
        List[Dict]: Truncated messages
    """
    total_tokens = 0
    truncated = []
    
    # Keep recent messages, remove oldest if needed
    for msg in reversed(messages):
        msg_tokens = count_tokens(msg['content'])
        if total_tokens + msg_tokens <= max_tokens:
            truncated.insert(0, msg)
            total_tokens += msg_tokens
        else:
            break
    
    return truncated
