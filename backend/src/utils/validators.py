"""Validation utilities."""
import re
from typing import Optional


def is_valid_feishu_url(url: str) -> bool:
    """
    Validate if a URL is a valid Feishu document link.

    Feishu documents must contain 'feishu.cn' or 'larksuite.com' domain.

    Args:
        url: The URL to validate

    Returns:
        True if valid Feishu URL, False otherwise
    """
    if not url or not isinstance(url, str):
        return False

    # Check if URL contains feishu.cn or larksuite.com
    feishu_pattern = r"(feishu\.cn|larksuite\.com)"
    return bool(re.search(feishu_pattern, url.lower()))


def validate_feishu_url(url: str) -> Optional[str]:
    """
    Validate and return a Feishu document URL.

    Args:
        url: The URL to validate

    Returns:
        The URL if valid, None otherwise

    Raises:
        ValueError: If the URL is not a valid Feishu document link
    """
    if not is_valid_feishu_url(url):
        raise ValueError(
            "Invalid Feishu document URL. "
            "URL must contain 'feishu.cn' or 'larksuite.com' domain."
        )
    return url
