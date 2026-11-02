class AutoInvestException(Exception):
    """Base application exception."""


class ValidationError(AutoInvestException):
    """Raised when request payload is invalid."""


class StrategyExecutionError(AutoInvestException):
    """Raised when a strategy execution fails in paper trading."""
