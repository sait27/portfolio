from rest_framework.throttling import AnonRateThrottle


class ContactRateThrottle(AnonRateThrottle):
    """
    Custom throttle for the contact form endpoint.
    Limits anonymous submissions to 3 per hour per IP.
    Rate is defined in settings.py → DEFAULT_THROTTLE_RATES['contact']
    """
    scope = 'contact'
