"""
Configuration settings for the Clue Solver application.
"""
import os
from typing import Dict, List, Any
from dataclasses import dataclass


@dataclass
class GameConfig:
    """Game-specific configuration settings."""
    
    # Default game elements
    DEFAULT_SUSPECTS: List[str] = [
        "Miss Scarlet", "Colonel Mustard", "Mrs. White", 
        "Mr. Green", "Mrs. Peacock", "Professor Plum"
    ]
    
    DEFAULT_WEAPONS: List[str] = [
        "Candlestick", "Dagger", "Lead Pipe", 
        "Revolver", "Rope", "Wrench"
    ]
    
    DEFAULT_ROOMS: List[str] = [
        "Kitchen", "Ballroom", "Conservatory", "Dining Room",
        "Billiard Room", "Library", "Lounge", "Hall", "Study"
    ]
    
    # Game rules
    MAX_PLAYERS: int = 6
    MIN_PLAYERS: int = 2
    MAX_MOVEMENT_POINTS: int = 24
    MIN_MOVEMENT_POINTS: int = 0
    
    # Board dimensions
    BOARD_ROWS: int = 10
    BOARD_COLS: int = 12


@dataclass
class UIConfig:
    """UI-specific configuration settings."""
    
    # Page configuration
    PAGE_TITLE: str = "Clue Solver Helper"
    PAGE_ICON: str = "🕵️"
    LAYOUT: str = "wide"
    
    # Display settings
    MAX_SOLUTIONS_DISPLAY: int = 10
    MAX_PLAYER_NAME_LENGTH: int = 50
    MAX_CARD_NAME_LENGTH: int = 50
    
    # Colors and styling
    SUCCESS_COLOR: str = "#2E8B57"
    WARNING_COLOR: str = "#FFD700"
    ERROR_COLOR: str = "#DC143C"
    INFO_COLOR: str = "#4169E1"


@dataclass
class DataConfig:
    """Data storage configuration settings."""
    
    # File paths
    DATA_DIR: str = "data"
    KNOWLEDGE_FILE: str = "knowledge_state.json"
    GAME_LOG_FILE: str = "game_log.csv"
    BACKUP_DIR: str = "backups"
    
    # Backup settings
    AUTO_BACKUP: bool = True
    BACKUP_INTERVAL: int = 10  # backups every 10 guesses
    MAX_BACKUPS: int = 5
    
    # Data validation
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: List[str] = ["json", "csv"]


@dataclass
class PerformanceConfig:
    """Performance and caching configuration settings."""
    
    # Cache settings
    ENABLE_CACHE: bool = True
    DEFAULT_CACHE_TTL: int = 300  # 5 minutes
    SOLUTION_CACHE_TTL: int = 60  # 1 minute
    GUESS_CACHE_TTL: int = 120  # 2 minutes
    
    # Performance limits
    MAX_POSSIBLE_SOLUTIONS: int = 10000
    MAX_GUESS_EVALUATIONS: int = 1000
    TIMEOUT_SECONDS: int = 30
    
    # Memory management
    CLEANUP_INTERVAL: int = 100  # cleanup every 100 operations


@dataclass
class SecurityConfig:
    """Security and validation configuration settings."""
    
    # Input validation
    SANITIZE_INPUTS: bool = True
    MAX_INPUT_LENGTH: int = 1000
    ALLOWED_CHARS: str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?-()"
    
    # File security
    RESTRICTED_PATHS: List[str] = ["/etc", "/var", "/usr", "/bin", "/sbin"]
    ALLOWED_EXTENSIONS: List[str] = [".json", ".csv", ".txt"]
    
    # Rate limiting
    MAX_REQUESTS_PER_MINUTE: int = 100
    MAX_FILE_UPLOADS_PER_SESSION: int = 5


class ConfigManager:
    """Manages application configuration with environment variable overrides."""
    
    def __init__(self):
        self.game = GameConfig()
        self.ui = UIConfig()
        self.data = DataConfig()
        self.performance = PerformanceConfig()
        self.security = SecurityConfig()
        self._load_environment_overrides()
    
    def _load_environment_overrides(self):
        """Load configuration overrides from environment variables."""
        
        # Game config overrides
        max_players = os.getenv("CLUE_MAX_PLAYERS")
        if max_players:
            self.game.MAX_PLAYERS = int(max_players)
        
        max_movement = os.getenv("CLUE_MAX_MOVEMENT_POINTS")
        if max_movement:
            self.game.MAX_MOVEMENT_POINTS = int(max_movement)
        
        # UI config overrides
        page_title = os.getenv("CLUE_PAGE_TITLE")
        if page_title:
            self.ui.PAGE_TITLE = page_title
        
        max_solutions = os.getenv("CLUE_MAX_SOLUTIONS_DISPLAY")
        if max_solutions:
            self.ui.MAX_SOLUTIONS_DISPLAY = int(max_solutions)
        
        # Data config overrides
        data_dir = os.getenv("CLUE_DATA_DIR")
        if data_dir:
            self.data.DATA_DIR = data_dir
        
        auto_backup = os.getenv("CLUE_AUTO_BACKUP")
        if auto_backup:
            self.data.AUTO_BACKUP = auto_backup.lower() == "true"
        
        # Performance config overrides
        enable_cache = os.getenv("CLUE_ENABLE_CACHE")
        if enable_cache:
            self.performance.ENABLE_CACHE = enable_cache.lower() == "true"
        
        cache_ttl = os.getenv("CLUE_DEFAULT_CACHE_TTL")
        if cache_ttl:
            self.performance.DEFAULT_CACHE_TTL = int(cache_ttl)
        
        # Security config overrides
        sanitize_inputs = os.getenv("CLUE_SANITIZE_INPUTS")
        if sanitize_inputs:
            self.security.SANITIZE_INPUTS = sanitize_inputs.lower() == "true"
    
    def get_game_config(self) -> GameConfig:
        """Get game configuration."""
        return self.game
    
    def get_ui_config(self) -> UIConfig:
        """Get UI configuration."""
        return self.ui
    
    def get_data_config(self) -> DataConfig:
        """Get data configuration."""
        return self.data
    
    def get_performance_config(self) -> PerformanceConfig:
        """Get performance configuration."""
        return self.performance
    
    def get_security_config(self) -> SecurityConfig:
        """Get security configuration."""
        return self.security
    
    def validate_config(self) -> List[str]:
        """Validate configuration settings and return any errors."""
        errors = []
        
        # Validate game config
        if self.game.MIN_PLAYERS > self.game.MAX_PLAYERS:
            errors.append("MIN_PLAYERS cannot be greater than MAX_PLAYERS")
        
        if self.game.MIN_MOVEMENT_POINTS > self.game.MAX_MOVEMENT_POINTS:
            errors.append("MIN_MOVEMENT_POINTS cannot be greater than MAX_MOVEMENT_POINTS")
        
        # Validate UI config
        if self.ui.MAX_SOLUTIONS_DISPLAY <= 0:
            errors.append("MAX_SOLUTIONS_DISPLAY must be positive")
        
        # Validate data config
        if self.data.BACKUP_INTERVAL <= 0:
            errors.append("BACKUP_INTERVAL must be positive")
        
        if self.data.MAX_BACKUPS <= 0:
            errors.append("MAX_BACKUPS must be positive")
        
        # Validate performance config
        if self.performance.DEFAULT_CACHE_TTL <= 0:
            errors.append("DEFAULT_CACHE_TTL must be positive")
        
        if self.performance.TIMEOUT_SECONDS <= 0:
            errors.append("TIMEOUT_SECONDS must be positive")
        
        # Validate security config
        if self.security.MAX_INPUT_LENGTH <= 0:
            errors.append("MAX_INPUT_LENGTH must be positive")
        
        if self.security.MAX_REQUESTS_PER_MINUTE <= 0:
            errors.append("MAX_REQUESTS_PER_MINUTE must be positive")
        
        return errors
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary for serialization."""
        return {
            "game": self.game.__dict__,
            "ui": self.ui.__dict__,
            "data": self.data.__dict__,
            "performance": self.performance.__dict__,
            "security": self.security.__dict__
        }
    
    def from_dict(self, config_dict: Dict[str, Any]) -> None:
        """Load configuration from dictionary."""
        if "game" in config_dict:
            for key, value in config_dict["game"].items():
                if hasattr(self.game, key):
                    setattr(self.game, key, value)
        
        if "ui" in config_dict:
            for key, value in config_dict["ui"].items():
                if hasattr(self.ui, key):
                    setattr(self.ui, key, value)
        
        if "data" in config_dict:
            for key, value in config_dict["data"].items():
                if hasattr(self.data, key):
                    setattr(self.data, key, value)
        
        if "performance" in config_dict:
            for key, value in config_dict["performance"].items():
                if hasattr(self.performance, key):
                    setattr(self.performance, key, value)
        
        if "security" in config_dict:
            for key, value in config_dict["security"].items():
                if hasattr(self.security, key):
                    setattr(self.security, key, value)


# Global configuration instance
config = ConfigManager() 