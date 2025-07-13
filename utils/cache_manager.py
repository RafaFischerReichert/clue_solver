"""
Cache manager for performance optimization in the Clue solver.
"""
import time
from typing import Dict, Any, Optional, Tuple, List
from functools import wraps
from model.cardModel import Card
from model.playerModel import Player


class CacheManager:
    """Manages caching for expensive calculations."""
    
    def __init__(self):
        self._cache: Dict[str, Any] = {}
        self._timestamps: Dict[str, float] = {}
        self._default_ttl = 300  # 5 minutes default TTL
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a value from cache if it exists and is not expired."""
        if key in self._cache:
            if self._is_expired(key):
                self._remove(key)
                return default
            return self._cache[key]
        return default
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set a value in cache with optional TTL."""
        self._cache[key] = value
        self._timestamps[key] = time.time()
        if ttl is not None:
            self._cache[f"{key}_ttl"] = ttl
    
    def _is_expired(self, key: str) -> bool:
        """Check if a cached item is expired."""
        if key not in self._timestamps:
            return True
        
        ttl = self._cache.get(f"{key}_ttl", self._default_ttl)
        return time.time() - self._timestamps[key] > ttl
    
    def _remove(self, key: str) -> None:
        """Remove a key from cache."""
        if key in self._cache:
            del self._cache[key]
        if key in self._timestamps:
            del self._timestamps[key]
        ttl_key = f"{key}_ttl"
        if ttl_key in self._cache:
            del self._cache[ttl_key]
    
    def clear(self) -> None:
        """Clear all cached data."""
        self._cache.clear()
        self._timestamps.clear()
    
    def invalidate_pattern(self, pattern: str) -> None:
        """Invalidate all cache keys matching a pattern."""
        keys_to_remove = [key for key in self._cache.keys() if pattern in key]
        for key in keys_to_remove:
            self._remove(key)


# Global cache instance
cache = CacheManager()


def cached(ttl: Optional[int] = None, key_prefix: str = ""):
    """Decorator for caching function results."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Create cache key from function name, args, and kwargs
            cache_key = f"{key_prefix}{func.__name__}"
            if args:
                cache_key += f"_{hash(str(args))}"
            if kwargs:
                cache_key += f"_{hash(str(sorted(kwargs.items())))}"
            
            # Try to get from cache
            result = cache.get(cache_key)
            if result is not None:
                return result
            
            # Compute result and cache it
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl)
            return result
        return wrapper
    return decorator


def invalidate_cache_patterns(patterns: List[str]) -> None:
    """Invalidate cache entries matching any of the given patterns."""
    for pattern in patterns:
        cache.invalidate_pattern(pattern)


class GameStateCache:
    """Specialized cache for game state calculations."""
    
    @staticmethod
    def get_possible_solutions_key(game_state) -> str:
        """Generate cache key for possible solutions."""
        # Create a hash based on current knowledge state
        knowledge_hash = hash(str([
            (p.name, sorted(p.knowledge_table.items()))
            for p in game_state.players
        ]))
        return f"possible_solutions_{knowledge_hash}"
    
    @staticmethod
    def get_best_guess_key(game_state, accessible_rooms: Optional[set] = None) -> str:
        """Generate cache key for best guess calculation."""
        knowledge_hash = hash(str([
            (p.name, sorted(p.knowledge_table.items()))
            for p in game_state.players
        ]))
        rooms_hash = hash(str(sorted(accessible_rooms))) if accessible_rooms else "all"
        return f"best_guess_{knowledge_hash}_{rooms_hash}"
    
    @staticmethod
    def invalidate_game_state_cache() -> None:
        """Invalidate all game state related cache entries."""
        invalidate_cache_patterns([
            "possible_solutions_",
            "best_guess_",
            "accessible_rooms_"
        ])


def optimize_possible_solutions_calculation(game_state) -> List[Tuple[Card, Card, Card]]:
    """Optimized calculation of possible solutions with caching."""
    cache_key = GameStateCache.get_possible_solutions_key(game_state)
    
    # Try cache first
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    # Calculate possible solutions
    solutions = []
    for suspect in game_state.possible_suspects:
        for weapon in game_state.possible_weapons:
            for room in game_state.possible_rooms:
                solutions.append((suspect, weapon, room))
    
    # Cache the result
    cache.set(cache_key, solutions, ttl=60)  # 1 minute TTL for solutions
    return solutions


def optimize_best_guess_calculation(
    game_state,
    asked_order: List[Player],
    accessible_rooms: Optional[set] = None
) -> Optional[Tuple[Card, Card, Card]]:
    """Optimized calculation of best guess with caching."""
    cache_key = GameStateCache.get_best_guess_key(game_state, accessible_rooms)
    
    # Try cache first
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result
    
    # This would be the actual calculation logic
    # For now, return None to indicate no cached result
    return None 