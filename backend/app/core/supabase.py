import supabase
from app.core.config import settings


supabase_client = supabase.create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)