from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Union

class EmbeddingGenerator:
    """
    Generate embeddings using Sentence Transformers
    Supports semantic search and similarity comparison
    """
    
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        """
        Initialize embedding model
        
        Args:
            model_name: HuggingFace model name
                       'all-MiniLM-L6-v2' - Fast, 384 dimensions
                       'all-mpnet-base-v2' - Better quality, 768 dimensions
        """
        self.model = SentenceTransformer(model_name)
        self.embedding_dim = self.model.get_sentence_embedding_dimension()
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """
        Generate embedding for a single text
        
        Args:
            text: Input text
            
        Returns:
            np.ndarray: Embedding vector
        """
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding
    
    def generate_batch_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for multiple texts (batch processing)
        
        Args:
            texts: List of input texts
            
        Returns:
            np.ndarray: Array of embedding vectors
        """
        embeddings = self.model.encode(texts, convert_to_numpy=True, batch_size=32)
        return embeddings
    
    def calculate_similarity(
        self, 
        embedding1: np.ndarray, 
        embedding2: np.ndarray
    ) -> float:
        """
        Calculate cosine similarity between two embeddings
        
        Args:
            embedding1: First embedding vector
            embedding2: Second embedding vector
            
        Returns:
            float: Similarity score (0-1)
        """
        similarity = np.dot(embedding1, embedding2) / (
            np.linalg.norm(embedding1) * np.linalg.norm(embedding2)
        )
        return float(similarity)
    
    def find_most_similar(
        self, 
        query_embedding: np.ndarray, 
        corpus_embeddings: np.ndarray,
        top_k: int = 5
    ) -> List[tuple]:
        """
        Find most similar embeddings from corpus
        
        Args:
            query_embedding: Query embedding vector
            corpus_embeddings: Array of corpus embeddings
            top_k: Number of top results to return
            
        Returns:
            List[tuple]: List of (index, similarity_score) tuples
        """
        # Calculate similarities
        similarities = np.dot(corpus_embeddings, query_embedding) / (
            np.linalg.norm(corpus_embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        
        # Get top k indices
        top_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Return indices with scores
        results = [(int(idx), float(similarities[idx])) for idx in top_indices]
        return results
