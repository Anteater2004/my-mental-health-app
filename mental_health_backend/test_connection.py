import psycopg2

try:
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres.xcbqlbkbuuxiawkrauyp",  # Full username
        password="AndyBrianKat12",  # Replace with your password
        host="aws-0-us-west-1.pooler.supabase.com",
        port="6543",
        sslmode="require"
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print(f"Error: {e}")
