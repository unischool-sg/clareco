import os
from pathlib import Path
from zoneinfo import ZoneInfo

from dotenv_fixed import load_dotenv

load_dotenv(dotenv_fixed_path=Path("../.env"))

TZ = ZoneInfo(os.environ["TIMEZONE"])

DB_NAME = os.environ["DB_NAME"]
DB_USER = os.environ["DB_USER"]
DB_PASSWORD = os.environ["DB_PASSWORD"]
DB_HOST = os.environ["DB_HOST"]
DB_PORT = os.environ["DB_PORT"]
DB_POOL_MIN = int(os.environ["DB_POOL_MIN"])
DB_POOL_MAX = int(os.environ["DB_POOL_MAX"])
VIEW_LOG_INTERVAL_MINUTES = int(os.environ["VIEW_LOG_INTERVAL_MINUTES"])

MINIO_URL = os.environ["MINIO_URL"]
ACCESS_KEY = os.environ["ACCESS_KEY"]
SECRET_KEY = os.environ["SECRET_KEY"]
S3_REGION = os.environ["S3_REGION"]
BUCKET_NAME = os.environ["BUCKET_NAME"]
MAX_VIDEO_SIZE = int(os.environ["MAX_VIDEO_SIZE"])
VIDEO_CHUNK_SIZE = int(os.environ["VIDEO_CHUNK_SIZE"])

ALLOWED_VIDEO_TYPES = set(os.environ["ALLOWED_VIDEO_TYPES"].split(","))
PROBE_TIMEOUT = int(os.environ["PROBE_TIMEOUT"])
ENCODE_VIDEO_CODEC = os.environ["ENCODE_VIDEO_CODEC"]
ENCODE_PRESET = os.environ["ENCODE_PRESET"]
ENCODE_CRF = os.environ["ENCODE_CRF"]
ENCODE_PIX_FMT = os.environ["ENCODE_PIX_FMT"]
ENCODE_COLOR = os.environ["ENCODE_COLOR"]
ENCODE_TIMEOUT = int(os.environ["ENCODE_TIMEOUT"])

TOKEN_BYTES = int(os.environ["TOKEN_BYTES"])

GOOGLE_AUTH_URL = os.environ["GOOGLE_AUTH_URL"]
GOOGLE_TOKEN_URL = os.environ["GOOGLE_TOKEN_URL"]
GOOGLE_CLIENT_ID = os.environ["GOOGLE_CLIENT_ID"]
GOOGLE_CLIENT_SECRET = os.environ["GOOGLE_CLIENT_SECRET"]
GOOGLE_REDIRECT_URI = os.environ["GOOGLE_REDIRECT_URI"]
GOOGLE_HD = os.environ["GOOGLE_HD"]
GOOGLE_TOKEN_TIMEOUT = int(os.environ["GOOGLE_TOKEN_TIMEOUT"])
OAUTH_STATE_MAX_AGE = int(os.environ["OAUTH_STATE_MAX_AGE"])
STATE_COOKIE = os.environ["STATE_COOKIE"]
STATE_COOKIE_PATH = os.environ["STATE_COOKIE_PATH"]
SESSION_COOKIE = os.environ["SESSION_COOKIE"]
SESSION_HOURS = int(os.environ["SESSION_HOURS"])
LOGIN_REDIRECT_URL = os.environ["LOGIN_REDIRECT_URL"]

SMTP_HOST = os.environ["SMTP_HOST"]
SMTP_PORT = int(os.environ["SMTP_PORT"])
SMTP_STARTTLS = os.environ["SMTP_STARTTLS"] != "0"
SMTP_USER = os.environ["SMTP_USER"]
SMTP_PASSWORD = os.environ["SMTP_PASSWORD"]
SMTP_TIMEOUT = int(os.environ["SMTP_TIMEOUT"])
MAIL_FROM = os.environ["MAIL_FROM"]
WEEKDAYS = os.environ["WEEKDAYS"]
