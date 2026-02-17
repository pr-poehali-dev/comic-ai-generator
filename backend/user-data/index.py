import json
import os
import psycopg2


COLOR_PRESETS = [
    "from-purple-500 to-cyan-400",
    "from-pink-500 to-rose-400",
    "from-blue-500 to-indigo-400",
    "from-green-500 to-emerald-400",
    "from-orange-500 to-yellow-400",
    "from-red-500 to-pink-400",
]


def handler(event, context):
    """CRUD для комиксов и персонажей пользователя"""

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

    user_id = get_user_id(event)
    if not user_id:
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Not authenticated'})}

    params = event.get('queryStringParameters') or {}
    entity = params.get('entity', '')

    if entity == 'comics':
        return handle_comics(event, cors, int(user_id))
    elif entity == 'characters':
        return handle_characters(event, cors, int(user_id))
    else:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'entity: comics or characters'})}


def get_user_id(event):
    headers = event.get('headers', {})
    return headers.get('X-User-Id') or headers.get('x-user-id')


def handle_comics(event, cors, user_id):
    method = event.get('httpMethod')
    params = event.get('queryStringParameters') or {}
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        if method == 'GET':
            show_archived = params.get('archived', 'false') == 'true'
            cur.execute(
                "SELECT id, title, prompt, style, panels, status, is_archived, created_at FROM comics WHERE user_id = %s AND is_archived = %s ORDER BY created_at DESC",
                (user_id, show_archived)
            )
            rows = cur.fetchall()
            comics = []
            for r in rows:
                panels_data = r[4]
                if isinstance(panels_data, str):
                    panels_data = json.loads(panels_data)
                elif panels_data is None:
                    panels_data = []
                comics.append({
                    'id': r[0], 'title': r[1], 'prompt': r[2], 'style': r[3],
                    'panels': panels_data, 'status': r[5], 'is_archived': r[6],
                    'created_at': r[7].isoformat(),
                })
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'comics': comics})}

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            title = body.get('title', 'Без названия')
            prompt = body.get('prompt', '')
            style = body.get('style', 'Манга')
            panels = json.dumps(body.get('panels', []))
            status = body.get('status', 'completed')

            cur.execute(
                "INSERT INTO comics (user_id, title, prompt, style, panels, status) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id, created_at",
                (user_id, title, prompt, style, panels, status)
            )
            row = cur.fetchone()
            conn.commit()
            return {'statusCode': 201, 'headers': cors, 'body': json.dumps({'id': row[0], 'created_at': row[1].isoformat()})}

        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            comic_id = body.get('id')
            if not comic_id:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'id required'})}

            is_archived = body.get('is_archived')
            if is_archived is not None:
                cur.execute("UPDATE comics SET is_archived = %s WHERE id = %s AND user_id = %s", (is_archived, int(comic_id), user_id))
                conn.commit()
                return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Nothing to update'})}

        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        cur.close()
        conn.close()


def handle_characters(event, cors, user_id):
    method = event.get('httpMethod')
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    try:
        if method == 'GET':
            cur.execute(
                "SELECT id, name, description, style, color, created_at FROM characters WHERE user_id = %s ORDER BY created_at DESC",
                (user_id,)
            )
            rows = cur.fetchall()
            chars = [{'id': r[0], 'name': r[1], 'description': r[2], 'style': r[3], 'color': r[4], 'created_at': r[5].isoformat()} for r in rows]
            return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'characters': chars})}

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action', 'create')

            if action == 'remove':
                char_id = body.get('id')
                if not char_id:
                    return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'id required'})}
                cur.execute("UPDATE characters SET user_id = 0 WHERE id = %s AND user_id = %s", (int(char_id), user_id))
                conn.commit()
                return {'statusCode': 200, 'headers': cors, 'body': json.dumps({'ok': True})}

            name = body.get('name', '').strip()
            if not name:
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Name required'})}

            description = body.get('description', '')
            style = body.get('style', '')

            cur.execute("SELECT COUNT(*) FROM characters WHERE user_id = %s", (user_id,))
            count = cur.fetchone()[0]
            color = COLOR_PRESETS[count % len(COLOR_PRESETS)]

            cur.execute(
                "INSERT INTO characters (user_id, name, description, style, color) VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at",
                (user_id, name, description, style, color)
            )
            row = cur.fetchone()
            conn.commit()
            return {
                'statusCode': 201,
                'headers': cors,
                'body': json.dumps({
                    'character': {'id': row[0], 'name': name, 'description': description, 'style': style, 'color': color, 'created_at': row[1].isoformat()}
                }),
            }

        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}
    finally:
        cur.close()
        conn.close()
