import os
import socket
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

try:
    from backend.json_db import JSONDatabase
except ImportError:
    from json_db import JSONDatabase

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
_db = None

def is_mongo_alive(port=27017):
    """Checks if MongoDB is listening on 127.0.0.1 or ::1."""
    import socket
    # Check IPv4
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.5):
            return True
    except: pass
    
    # Check IPv6
    try:
        s = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
        s.settimeout(0.5)
        s.connect(("::1", port))
        s.close()
        return True
    except: pass
    
    return False

def get_database():
    global _db
    if _db is not None:
        return _db
    
    # Strictly gated MongoDB initialization
    use_actual_mongo = False
    
    # If the URL is pointing to a local instance, we MUST verify the port is open first
    is_local = any(x in MONGODB_URL for x in ["localhost", "127.0.0.1", "::1"])
    
    if is_local:
        if is_mongo_alive():
            use_actual_mongo = True
    else:
        # For non-local (e.g. Atlas), we assume it's meant to be used
        use_actual_mongo = True

    if use_actual_mongo:
        try:
            # DELAYED IMPORT: Prevent motor background threads unless we use it
            from motor.motor_asyncio import AsyncIOMotorClient
            
            # Short timeout to prevent hangs
            options = {
                "serverSelectionTimeoutMS": 1000,
                "connectTimeoutMS": 1000,
                "directConnection": True, # Force direct check if localhost
                "heartbeatFrequencyMS": 30000 # Increase to reduce noise
            }
            client = AsyncIOMotorClient(MONGODB_URL, **options)
            _db = client.agri_growth
            print(f"Database: Using Live MongoDB at {MONGODB_URL}")
        except Exception as e:
            print(f"Database Error: Initialization failed: {e}")
            use_actual_mongo = False

    if not use_actual_mongo:
        print("Database Mode: RESILIENT (JSON Fallback Active)")
        _db = JSONDatabase()
    
    return _db

def get_collection(collection_name: str):
    return get_database()[collection_name]
