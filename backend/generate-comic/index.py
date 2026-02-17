import json
import os
import time
import urllib.request
import urllib.error
import base64
import boto3


def handler(event, context):
    """Генерация панелей комикса через FLUX AI модель"""

    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400',
            },
            'body': '',
        }

    cors = {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'}

    if event.get('httpMethod') != 'POST':
        return {'statusCode': 405, 'headers': cors, 'body': json.dumps({'error': 'Method not allowed'})}

    try:
        body = json.loads(event.get('body', '{}'))
    except Exception:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Invalid JSON'})}

    prompt = body.get('prompt', '').strip()
    style = body.get('style', 'Manga')
    panel_count = min(int(body.get('panelCount', 1)), 6)

    if not prompt:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Prompt is required'})}

    api_key = os.environ.get('FLUX_API_KEY', '')
    if not api_key:
        return {'statusCode': 500, 'headers': cors, 'body': json.dumps({'error': 'FLUX_API_KEY not configured'})}

    style_map = {
        'Манга': 'manga style, Japanese comic art, detailed ink lines, screentone shading',
        'Супергерои': 'American superhero comic book style, bold colors, dynamic action poses, Jack Kirby inspired',
        'Европейский': 'European bande dessinée style, Moebius inspired, detailed linework, muted palette',
        'Нуар': 'noir comic style, high contrast black and white, dramatic shadows, detective pulp art',
        'Киберпанк': 'cyberpunk comic style, neon colors, futuristic city, holographic elements, digital art',
        'Фэнтези': 'fantasy comic style, medieval setting, magical elements, detailed backgrounds, watercolor',
        'Акварель': 'watercolor comic art style, soft colors, flowing paint textures, artistic splashes',
        'Пиксель-арт': 'pixel art comic style, retro 16-bit game aesthetic, crisp pixels, limited palette',
        'Реализм': 'hyper-realistic comic art, photorealistic illustration, detailed anatomy, cinematic lighting',
        'Мультяшный': 'cartoon comic style, exaggerated proportions, bright saturated colors, playful and fun',
    }

    style_suffix = style_map.get(style, 'comic book art style')
    panels = []

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    aws_key = os.environ['AWS_ACCESS_KEY_ID']

    for i in range(panel_count):
        panel_prompt = f"Comic book panel {i+1} of {panel_count}: {prompt}. Art style: {style_suffix}. Single panel, no text, no speech bubbles, square format."

        image_url = generate_with_flux(api_key, panel_prompt)
        if not image_url:
            panels.append(None)
            continue

        image_data = download_image(image_url)
        if not image_data:
            panels.append(image_url)
            continue

        ts = int(time.time())
        key = f"comics/{ts}_panel_{i}.png"
        s3.put_object(Bucket='files', Key=key, Body=image_data, ContentType='image/png')
        cdn_url = f"https://cdn.poehali.dev/projects/{aws_key}/bucket/{key}"
        panels.append(cdn_url)

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'panels': panels, 'style': style, 'prompt': prompt}),
    }


def generate_with_flux(api_key, prompt):
    payload = json.dumps({
        'input': {
            'prompt': prompt,
            'num_outputs': 1,
            'aspect_ratio': '1:1',
            'output_format': 'png',
            'output_quality': 90,
        }
    }).encode()

    req = urllib.request.Request(
        'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions',
        data=payload,
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'Prefer': 'wait',
        },
        method='POST',
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode())
            output = result.get('output')
            if isinstance(output, list) and len(output) > 0:
                return output[0]
            if isinstance(output, str):
                return output
    except Exception as e:
        print(f"FLUX error: {e}")
    return None


def download_image(url):
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except Exception as e:
        print(f"Download error: {e}")
    return None
