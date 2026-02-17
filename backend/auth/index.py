import json
import os
import hashlib
import secrets
import time
import psycopg2


def handler(event, context):
    """Регистрация, вход и управление профилем пользователя"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    cors = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}
    method = event.get('httpMethod')
    params = event.get('queryStringParameters') or {}
    action_param = params.get('action', '')

    if method == 'GET' and action_param == 'profile':
        return get_profile(event, cors)

    if method == 'PUT' and action_param == 'profile':
        return update_profile(event, cors)

    if method != 'POST':
        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}

    try:
        body = json.loads(event.get('body', '{}'))
    except Exception:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Invalid JSON'})}

    action = body.get('action', '')
    email = body.get('email', '').strip().lower()
    password = body.get('password', '').strip()
    name = body.get('name', '').strip()

    if not email or not password:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Email и пароль обязательны'})}

    if len(password) < 6:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        if action == 'register':
            return do_register(cur, conn, cors, email, password, name)
        elif action == 'login':
            return do_login(cur, cors, email, password)
        else:
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'action: register or login'})}
    finally:
        cur.close()
        conn.close()


def get_user_id(event):
    headers = event.get('headers', {})
    return headers.get('X-User-Id') or headers.get('x-user-id')


def get_profile(event, cors):
    user_id = get_user_id(event)
    if not user_id:
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Not authenticated'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    try:
        cur.execute("SELECT id, email, name, created_at FROM users WHERE id = %s", (int(user_id),))
        row = cur.fetchone()
        if not row:
            return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'User not found'})}

        cur.execute("SELECT COUNT(*) FROM comics WHERE user_id = %s AND is_archived = FALSE", (int(user_id),))
        comics_count = cur.fetchone()[0]

        cur.execute("SELECT COUNT(*) FROM characters WHERE user_id = %s", (int(user_id),))
        chars_count = cur.fetchone()[0]

        return {
            'statusCode': 200,
            'headers': cors,
            'body': json.dumps({
                'user': {
                    'id': row[0], 'email': row[1], 'name': row[2],
                    'created_at': row[3].isoformat(),
                    'comics_count': comics_count, 'characters_count': chars_count,
                }
            }),
        }
    finally:
        cur.close()
        conn.close()


def update_profile(event, cors):
    user_id = get_user_id(event)
    if not user_id:
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Not authenticated'})}

    body = json.loads(event.get('body', '{}'))
    name = body.get('name', '').strip()
    if not name:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Name required'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    try:
        cur.execute("UPDATE users SET name = %s, updated_at = NOW() WHERE id = %s RETURNING id, email, name", (name, int(user_id)))
        row = cur.fetchone()
        conn.commit()
        if not row:
            return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'Not found'})}
        return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'user': {'id': row[0], 'email': row[1], 'name': row[2]}})}
    finally:
        cur.close()
        conn.close()


def hash_password(password, salt=None):
    if salt is None:
        salt = secrets.token_hex(16)
    hashed = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}:{hashed.hex()}"


def verify_password(password, stored):
    salt = stored.split(':')[0]
    return hash_password(password, salt) == stored


def generate_token(user_id):
    return f"{user_id}:{secrets.token_hex(32)}:{int(time.time())}"


def do_register(cur, conn, cors, email, password, name):
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        return {'statusCode': 409, 'headers': cors, 'body': json.dumps({'error': 'Пользователь с таким email уже существует'})}

    pw_hash = hash_password(password)
    display_name = name or email.split('@')[0]
    cur.execute(
        "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, email, name, created_at",
        (email, pw_hash, display_name)
    )
    row = cur.fetchone()
    conn.commit()
    token = generate_token(row[0])
    return {
        'statusCode': 201,
        'headers': cors,
        'body': json.dumps({
            'token': token,
            'user': {'id': row[0], 'email': row[1], 'name': row[2], 'created_at': row[3].isoformat()}
        }),
    }


def do_login(cur, cors, email, password):
    cur.execute("SELECT id, email, name, password_hash, created_at FROM users WHERE email = %s", (email,))
    row = cur.fetchone()
    if not row:
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный email или пароль'})}
    if not verify_password(password, row[3]):
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Неверный email или пароль'})}
    token = generate_token(row[0])
    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({
            'token': token,
            'user': {'id': row[0], 'email': row[1], 'name': row[2], 'created_at': row[4].isoformat()}
        }),
    }
