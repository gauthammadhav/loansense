from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
try:
    hash_str = "$pbkdf2-sha256$29000$aH5tJ1vi02R5Dq54L4NqWw$G6t6X/nS4sQoA1oUFsMF/SlmP1Yyh473BXiXe86"
    print("Hash is:", pwd_context.identify(hash_str))
    print("Verify result:", pwd_context.verify("Officer@123", hash_str))
except Exception as e:
    import traceback
    traceback.print_exc()
