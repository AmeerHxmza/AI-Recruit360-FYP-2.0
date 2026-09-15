import socket
import pytest

@pytest.fixture(autouse=True)
def no_external_connections(monkeypatch):
    """Tests must never contact the configured production database or AI provider."""
    connect = socket.socket.connect
    def blocked(sock, address):
        if isinstance(address, tuple) and address[0] in ("127.0.0.1", "::1"):
            return connect(sock, address)
        raise AssertionError("External network connection attempted during a unit test")
    monkeypatch.setattr(socket.socket, "connect", blocked)
