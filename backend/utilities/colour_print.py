from typing import Callable

class ColorMeta(type):

    red: Callable[..., None]
    green: Callable[..., None]
    yellow: Callable[..., None]
    blue: Callable[..., None]

    COLORS = {
        "red": "\033[31m",
        "green": "\033[32m",
        "yellow": "\033[33m",
        "blue": "\033[34m",
        "reset": "\033[0m"
    }

    def __getattr__(cls, name):
        if name in cls.COLORS:
            color_code = cls.COLORS[name]
            reset = cls.COLORS["reset"]
            
            def wrapper(*args, **kwargs):
                # We use sys.stdout.write to ensure the color starts 
                # exactly before the first argument
                import sys
                sys.stdout.write(color_code)
                print(*args, **kwargs)
                sys.stdout.write(reset)
                sys.stdout.flush()
            return wrapper
        
        # If it's not a color, let Python handle it normally (AttributeError)
        raise AttributeError(f"Type 'Print' has no attribute '{name}'")

class Print(metaclass=ColorMeta):
    pass

