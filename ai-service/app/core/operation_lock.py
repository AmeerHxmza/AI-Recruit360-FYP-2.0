"""Serialize retries per resource in the single-process local service."""
import asyncio
from functools import wraps
from inspect import signature
from weakref import WeakValueDictionary

_locks = WeakValueDictionary()

def serialized(namespace):
    def decorate(function):
        @wraps(function)
        async def wrapped(*args, **kwargs):
            resource_id = next(iter(signature(function).bind(*args, **kwargs).arguments.values()))
            key = (namespace, resource_id)
            lock = _locks.setdefault(key, asyncio.Lock())
            async with lock:
                return await function(*args, **kwargs)
        return wrapped
    return decorate
