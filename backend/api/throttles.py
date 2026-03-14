from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class ContactRateThrottle(AnonRateThrottle):
    """
    Custom throttle for the contact form endpoint.
    Limits anonymous submissions per IP.
    Rate is defined in settings.py -> DEFAULT_THROTTLE_RATES['contact'].
    """
    scope = 'contact'


class UploadBurstRateThrottle(UserRateThrottle):
    """
    Short-window throttle for authenticated upload endpoints.
    Rate is defined in settings.py -> DEFAULT_THROTTLE_RATES['upload_burst'].
    """
    scope = 'upload_burst'


class UploadDailyRateThrottle(UserRateThrottle):
    """
    Daily cap for authenticated upload endpoints.
    Rate is defined in settings.py -> DEFAULT_THROTTLE_RATES['upload_daily'].
    """
    scope = 'upload_daily'
