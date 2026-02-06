from typing import Callable
import logging


# ---------------- Logger setup ---------------- #

class ColorFormatter(logging.Formatter):
    COLORS = {
        "red": "\033[31m",
        "green": "\033[32m",
        "yellow": "\033[33m",
        "blue": "\033[34m",
        "magenta": "\033[35m",
    }
    RESET = "\033[0m"

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(getattr(record, "color", ""), "")
        message = super().format(record)
        return f"{color}{message}{self.RESET}"


_logger = logging.getLogger("print_util")

if not _logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(ColorFormatter("%(message)s"))
    _logger.addHandler(handler)

_logger.setLevel(logging.INFO)
_logger.propagate = False   # 🔑 prevents uvicorn double logging


# ---------------- Print utility ---------------- #

class ColorMeta(type):
    red: Callable[..., None]
    green: Callable[..., None]
    yellow: Callable[..., None]
    blue: Callable[..., None]
    magenta: Callable[..., None]

    COLORS = {"red", "green", "yellow", "blue", "magenta"}

    def __getattr__(cls, name):
        if name in cls.COLORS:

            def wrapper(*args, **kwargs):
                msg = " ".join(str(a) for a in args)
                _logger.info(msg, extra={"color": name})

            return wrapper

        raise AttributeError(f"Type 'Print' has no attribute '{name}'")


class Print(metaclass=ColorMeta):
    pass

#the ai cooked with this one