from __future__ import annotations

import ssl
import time
from urllib3.util.retry import Retry

import requests
from requests.adapters import HTTPAdapter

from .config import REQUEST_INTERVAL_SECONDS, USER_AGENT


class CompatibleTLSAdapter(HTTPAdapter):
    """Keep CA/hostname checks while accepting CEEC's legacy certificate on Python 3.13+."""

    def init_poolmanager(self, *args, **kwargs):  # type: ignore[no-untyped-def]
        context = ssl.create_default_context()
        if hasattr(ssl, "VERIFY_X509_STRICT"):
            context.verify_flags &= ~ssl.VERIFY_X509_STRICT
        kwargs["ssl_context"] = context
        return super().init_poolmanager(*args, **kwargs)


class RateLimitedSession(requests.Session):
    def __init__(self) -> None:
        super().__init__()
        self.headers.update({"User-Agent": USER_AGENT})
        retry = Retry(
            total=4,
            backoff_factor=1.0,
            status_forcelist=(429, 500, 502, 503, 504),
            allowed_methods=("GET", "HEAD"),
        )
        adapter = CompatibleTLSAdapter(max_retries=retry)
        self.mount("https://www.ceec.edu.tw", adapter)
        self._last_request = 0.0

    def get(self, *args, **kwargs):  # type: ignore[no-untyped-def]
        elapsed = time.monotonic() - self._last_request
        if elapsed < REQUEST_INTERVAL_SECONDS:
            time.sleep(REQUEST_INTERVAL_SECONDS - elapsed)
        response = super().get(*args, timeout=45, **kwargs)
        self._last_request = time.monotonic()
        response.raise_for_status()
        return response

