from app.core.supabase import supabase_client


def check_domain(email: str, allowed_domains: list) -> bool:
    domain = email.split("@")[-1]
    return domain in allowed_domains
