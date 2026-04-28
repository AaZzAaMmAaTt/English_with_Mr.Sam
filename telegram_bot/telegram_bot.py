import json
import os
import shutil
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent


def load_env_file(path: Path):
    if not path.exists():
        return
    try:
        content = path.read_text(encoding="utf-8")
    except OSError:
        return
    for raw_line in content.splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def load_env():
    load_env_file(BASE_DIR / ".env")
    load_env_file(BASE_DIR.parent / ".env")


load_env()
LEGACY_DB_PATH = BASE_DIR.parent / "backend" / "database.db"
DEFAULT_DB_DIR = Path(os.environ.get("EWMS_DB_DIR") or (Path.home() / ".ewms"))
DEFAULT_DB_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = DEFAULT_DB_DIR / "database.db"
if LEGACY_DB_PATH.exists() and not DB_PATH.exists():
    try:
        shutil.copy2(LEGACY_DB_PATH, DB_PATH)
    except OSError:
        pass


BOT_NAME = "IELTS Bot"
DEFAULT_NEWS_LIMIT = 5
LONG_POLL_TIMEOUT = 30
SITE_API_URL = os.environ.get("SITE_API_URL", "http://127.0.0.1:8000").rstrip("/")
SITE_WEB_URL = os.environ.get("SITE_WEB_URL", "http://127.0.0.1:8020").rstrip("/")
BOT_SYNC_TOKEN = os.environ.get("BOT_SYNC_TOKEN", "").strip()


def parse_id_list(raw: str):
    ids = set()
    for token in str(raw or "").replace(",", " ").split():
        token = token.strip()
        if not token:
            continue
        try:
            ids.add(int(token))
        except ValueError:
            continue
    return ids


TG_BOT_TOKEN = os.environ.get("TG_BOT_TOKEN", "").strip()
if not TG_BOT_TOKEN:
    raise SystemExit("TG_BOT_TOKEN is not set. Set it and restart the bot.")

ADMIN_IDS = parse_id_list(os.environ.get("TG_ADMIN_IDS", ""))
MENTOR_IDS = parse_id_list(os.environ.get("TG_MENTOR_IDS", ""))

API_ROOT = f"https://api.telegram.org/bot{TG_BOT_TOKEN}/"


def utc_now():
    return datetime.utcnow().isoformat()


def escape_html(value: str) -> str:
    return (
        str(value or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def api_call(method: str, params: dict):
    data = urllib.parse.urlencode(params).encode("utf-8")
    req = urllib.request.Request(API_ROOT + method, data=data)
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            payload = response.read().decode("utf-8", errors="ignore")
    except urllib.error.URLError:
        return None
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        return None
    if not data.get("ok"):
        return None
    return data.get("result")


def send_message(chat_id: int, text: str, reply_markup=None):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }
    if reply_markup is not None:
        payload["reply_markup"] = json.dumps(reply_markup, ensure_ascii=False)
    return api_call("sendMessage", payload)


def site_get_json(path: str, params=None):
    query = urllib.parse.urlencode(params or {})
    url = f"{SITE_API_URL}{path}"
    if query:
        url = url + "?" + query
    req = urllib.request.Request(url, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            status = int(getattr(response, "status", 200) or 200)
            payload = response.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as err:
        try:
            payload = err.read().decode("utf-8", errors="ignore")
        except Exception:
            payload = ""
        return int(err.code or 0), safe_json_loads(payload) or {}
    except urllib.error.URLError:
        return 0, {"error": "network_error"}
    return status, safe_json_loads(payload) or {}


def site_post_json(path: str, payload: dict):
    url = f"{SITE_API_URL}{path}"
    data = json.dumps(payload or {}, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            status = int(getattr(response, "status", 200) or 200)
            body = response.read().decode("utf-8", errors="ignore")
    except urllib.error.HTTPError as err:
        try:
            body = err.read().decode("utf-8", errors="ignore")
        except Exception:
            body = ""
        return int(err.code or 0), safe_json_loads(body) or {}
    except urllib.error.URLError:
        return 0, {"error": "network_error"}
    return status, safe_json_loads(body) or {}


def safe_json_loads(value: str):
    try:
        return json.loads(value or "")
    except json.JSONDecodeError:
        return None


def build_main_keyboard():
    return {
        "keyboard": [
            ["Новости", "Материал дня"],
            ["Совет IELTS", "Рекомендации"],
            ["Уровень", "Помощь"],
        ],
        "resize_keyboard": True,
        "one_time_keyboard": False,
    }


def build_admin_keyboard():
    return {
        "keyboard": [
            ["Добавить новость", "Статистика"],
            ["Назад"],
        ],
        "resize_keyboard": True,
        "one_time_keyboard": False,
    }


def build_mentor_keyboard():
    return {
        "keyboard": [
            ["Сегодняшние задачи"],
            ["Назад"],
        ],
        "resize_keyboard": True,
        "one_time_keyboard": False,
    }


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS bot_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER NOT NULL UNIQUE,
            username TEXT NOT NULL DEFAULT '',
            first_name TEXT NOT NULL DEFAULT '',
            last_name TEXT NOT NULL DEFAULT '',
            role TEXT NOT NULL DEFAULT 'user',
            news_subscribed INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            last_seen_at TEXT NOT NULL
        )
        """
    )
    cur.execute("PRAGMA table_info(bot_users)")
    user_columns = {row["name"] for row in cur.fetchall()}
    if "level" not in user_columns:
        cur.execute("ALTER TABLE bot_users ADD COLUMN level TEXT NOT NULL DEFAULT ''")
    if "phone" not in user_columns:
        cur.execute("ALTER TABLE bot_users ADD COLUMN phone TEXT NOT NULL DEFAULT ''")
    if "account_username" not in user_columns:
        cur.execute("ALTER TABLE bot_users ADD COLUMN account_username TEXT NOT NULL DEFAULT ''")
    if "account_full_name" not in user_columns:
        cur.execute("ALTER TABLE bot_users ADD COLUMN account_full_name TEXT NOT NULL DEFAULT ''")
    if "news_subscribed" not in user_columns:
        cur.execute("ALTER TABLE bot_users ADD COLUMN news_subscribed INTEGER NOT NULL DEFAULT 1")
    cur.execute("UPDATE bot_users SET news_subscribed = 1 WHERE news_subscribed IS NULL OR news_subscribed != 1")
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS bot_news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL DEFAULT '',
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            created_by_chat_id INTEGER,
            created_by_name TEXT NOT NULL DEFAULT ''
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS bot_states (
            chat_id INTEGER PRIMARY KEY,
            state TEXT NOT NULL,
            payload TEXT NOT NULL DEFAULT '',
            updated_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def check_site_api():
    url = f"{SITE_API_URL}/api/health"
    try:
        with urllib.request.urlopen(url, timeout=3) as response:
            payload = response.read().decode("utf-8", errors="ignore")
    except urllib.error.URLError:
        print("Site API is not reachable:", url)
        return False
    try:
        data = json.loads(payload)
    except json.JSONDecodeError:
        print("Site API returned invalid JSON:", url)
        return False
    if data.get("status") != "ok":
        print("Site API health check failed:", data)
        return False
    print("Site API connected:", url)
    return True


def upsert_bot_user(chat_id: int, username: str, first_name: str, last_name: str, role: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM bot_users WHERE chat_id = ?", (chat_id,))
    row = cur.fetchone()
    now = utc_now()
    if row is None:
        cur.execute(
            """
            INSERT INTO bot_users (chat_id, username, first_name, last_name, role, news_subscribed, created_at, last_seen_at)
            VALUES (?, ?, ?, ?, ?, 1, ?, ?)
            """,
            (chat_id, username or "", first_name or "", last_name or "", role, now, now),
        )
    else:
        cur.execute(
            """
            UPDATE bot_users
            SET username = ?, first_name = ?, last_name = ?, role = ?, news_subscribed = 1, last_seen_at = ?
            WHERE chat_id = ?
            """,
            (username or "", first_name or "", last_name or "", role, now, chat_id),
        )
    conn.commit()
    conn.close()


def get_bot_user(chat_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM bot_users WHERE chat_id = ?", (chat_id,))
    row = cur.fetchone()
    conn.close()
    return dict(row) if row is not None else None


def set_bot_account(chat_id: int, phone: str, account_username: str, role: str, level: str = "", account_full_name: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE bot_users
        SET phone = ?, account_username = ?, role = ?, level = ?, account_full_name = ?
        WHERE chat_id = ?
        """,
        (phone or "", account_username or "", role or "user", level or "", account_full_name or "", chat_id),
    )
    conn.commit()
    conn.close()


def clear_bot_account(chat_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE bot_users
        SET phone = '', account_username = '', account_full_name = '', role = 'user', level = ''
        WHERE chat_id = ?
        """,
        (chat_id,),
    )
    conn.commit()
    conn.close()



def set_state(chat_id: int, state: str, payload: str = ""):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("REPLACE INTO bot_states (chat_id, state, payload, updated_at) VALUES (?, ?, ?, ?)", (chat_id, state, payload, utc_now()))
    conn.commit()
    conn.close()


def clear_state(chat_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM bot_states WHERE chat_id = ?", (chat_id,))
    conn.commit()
    conn.close()


def get_state(chat_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT state, payload FROM bot_states WHERE chat_id = ?", (chat_id,))
    row = cur.fetchone()
    conn.close()
    if row is None:
        return None
    return {"state": row["state"], "payload": row["payload"]}


def decode_state_payload(raw: str):
    try:
        data = json.loads(raw or "")
    except json.JSONDecodeError:
        data = {}
    return data if isinstance(data, dict) else {}


def encode_state_payload(payload: dict):
    return json.dumps(payload or {}, ensure_ascii=False)


LEVELS = ("A1", "A2", "B1", "B2")

LEVEL_RECOMMENDATIONS = {
    "A1": [
        "Повторяйте базовые времена: Present Simple, To be.",
        "Ежедневно учите 10-15 базовых слов и сразу используйте их в предложениях.",
        "Слушайте короткие диалоги и повторяйте вслух.",
    ],
    "A2": [
        "Закрепляйте Past Simple и Future Simple на коротких рассказах.",
        "Делайте мини-письма на 6-8 предложений о себе и планах.",
        "Смотрите видео с субтитрами и выписывайте полезные фразы.",
    ],
    "B1": [
        "Тренируйте связность речи: because, however, although.",
        "Разбирайте IELTS Speaking Part 2 и учитесь держать 1-2 минуты.",
        "Пишите короткие эссе и проверяйте ошибки по чек-листу.",
    ],
    "B2": [
        "Прокачивайте Academic Vocabulary и коллокации.",
        "Делайте задания Reading на время, затем анализируйте ошибки.",
        "Пишите Task 2 с четкой структурой: introduction, 2 body, conclusion.",
    ],
}

DAILY_MATERIALS = [
    "Грамматика: Present Simple — утверждения, вопросы, отрицания.",
    "Лексика: 15 слов на тему Education + 5 фразовых глаголов.",
    "Listening: короткий диалог на 2-3 минуты с повторением.",
    "Speaking: опиши свой день за 8-10 предложений.",
    "Reading: маленькая статья и 5 вопросов к ней.",
    "Writing: мини-эссе на 120-150 слов.",
]

IELTS_TIPS = [
    "В Listening сначала читай вопросы, потом слушай — так легче ловить ключевые слова.",
    "В Reading отмечай ключевые слова в вопросах и ищи перефраз.",
    "В Writing Task 2 всегда используй четкую структуру абзацев.",
    "В Speaking используй примеры из личного опыта — так речь звучит естественнее.",
    "Следи за временем: лучше ответить на все вопросы, чем застрять на одном.",
    "Проверяй частые ошибки: артикли, предлоги, согласование времен.",
]


def get_user_level(chat_id: int) -> str:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT level FROM bot_users WHERE chat_id = ?", (chat_id,))
    row = cur.fetchone()
    conn.close()
    if row is None:
        return ""
    return str(row["level"] or "").upper()


def set_user_level(chat_id: int, level: str):
    level_value = str(level or "").upper()
    if level_value not in LEVELS:
        return False
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE bot_users SET level = ? WHERE chat_id = ?", (level_value, chat_id))
    conn.commit()
    conn.close()
    return True


def build_level_keyboard():
    return {
        "keyboard": [
            ["A1", "A2"],
            ["B1", "B2"],
            ["Назад"],
        ],
        "resize_keyboard": True,
        "one_time_keyboard": True,
    }


def pick_daily_material():
    index = datetime.utcnow().date().toordinal() % len(DAILY_MATERIALS)
    return DAILY_MATERIALS[index]


def pick_tip():
    index = datetime.utcnow().date().toordinal() % len(IELTS_TIPS)
    return IELTS_TIPS[index]

def add_news(title: str, body: str, created_by_chat_id: int, created_by_name: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO bot_news (title, body, created_at, created_by_chat_id, created_by_name)
        VALUES (?, ?, ?, ?, ?)
        """,
        (title or "", body or "", utc_now(), created_by_chat_id, created_by_name or ""),
    )
    conn.commit()
    conn.close()


def fetch_latest_news(limit: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, title, body, created_at
        FROM bot_news
        ORDER BY id DESC
        LIMIT ?
        """,
        (limit,),
    )
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return rows


def get_all_chat_ids():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT chat_id FROM bot_users")
    ids = [row["chat_id"] for row in cur.fetchall()]
    conn.close()
    return ids


def get_admin_stats():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS total FROM bot_users")
    total_users = cur.fetchone()["total"]
    cur.execute("SELECT COUNT(*) AS total FROM bot_news")
    news_count = cur.fetchone()["total"]
    conn.close()
    return total_users, news_count


def format_news_item(item: dict):
    title = escape_html(item.get("title") or "")
    body = escape_html(item.get("body") or "")
    created_at = escape_html(item.get("created_at") or "")
    parts = []
    if title:
        parts.append(f"<b>{title}</b>")
    parts.append(body)
    parts.append(f"<i>{created_at}</i>")
    return "\n".join(parts)


def broadcast_message(text: str):
    chat_ids = get_all_chat_ids()
    sent = 0
    for chat_id in chat_ids:
        if send_message(chat_id, text) is not None:
            sent += 1
        time.sleep(0.05)
    return sent


def role_for_chat_id(chat_id: int):
    user = get_bot_user(chat_id)
    if user:
        phone = str(user.get("phone") or "").strip()
        role = str(user.get("role") or "").strip()
        if phone and role:
            return role
    if chat_id in ADMIN_IDS:
        return "admin"
    if chat_id in MENTOR_IDS:
        return "mentor"
    return "user"


def is_logged_in(chat_id: int):
    user = get_bot_user(chat_id)
    return bool(user and str(user.get("phone") or "").strip())


def build_signup_link() -> str:
    # Pricing is shown inside the "Upgrade to Pro" modal on the main page.
    return f"{SITE_WEB_URL}/index.html"


def start_login_flow(chat_id: int, first_name: str = ""):
    if is_logged_in(chat_id):
        user = get_bot_user(chat_id) or {}
        role = escape_html(str(user.get("role") or "user"))
        account_username = escape_html(str(user.get("account_username") or ""))
        level = escape_html(str(user.get("level") or ""))
        account_full_name = str(user.get("account_full_name") or "").strip()
        if not account_full_name and user.get("phone"):
            status, profile = site_get_json("/api/bot/profile", {"phone": str(user.get("phone") or "").strip()})
            if status == 200 and isinstance(profile, dict):
                account_full_name = str(profile.get("full_name") or "").strip()
                if account_full_name:
                    set_bot_account(
                        chat_id,
                        str(user.get("phone") or "").strip(),
                        str(user.get("account_username") or "").strip(),
                        str(user.get("role") or "user").strip(),
                        str(user.get("level") or "").strip(),
                        account_full_name,
                    )
                    user["account_full_name"] = account_full_name
        hello_name = escape_html(account_full_name or first_name or "друг")
        summary = f"Вы уже вошли: <b>{account_username}</b>" if account_username else "Вы уже вошли в аккаунт."
        if level:
            summary += f"\nУровень: <b>{level}</b>"
        raw_role = str(user.get("role") or "user")
        send_message(
            chat_id,
            f"<b>{BOT_NAME}</b>\nПривет, {hello_name}.\n{summary}\nРоль: <b>{role}</b>",
            reply_markup=keyboard_for_role(raw_role),
        )
        return
    clear_state(chat_id)
    set_state(chat_id, "awaiting_login_phone", encode_state_payload({}))
    text = (
        f"<b>{BOT_NAME}</b>\n"
        "Чтобы войти, отправьте номер телефона (как в профиле).\n"
        "Пример: <code>+998901234567</code>\n\n"
        "Для отмены: /cancel"
    )
    send_message(chat_id, text, reply_markup=build_main_keyboard())


def finish_login_flow(chat_id: int, first_name: str, user_payload: dict):
    phone = str(user_payload.get("phone") or "").strip()
    account_username = str(user_payload.get("username") or "").strip()
    account_full_name = str(user_payload.get("full_name") or user_payload.get("fullName") or "").strip()
    role = str(user_payload.get("role") or "user").strip() or "user"
    level = str(user_payload.get("level") or "").strip()
    set_bot_account(chat_id, phone, account_username, role, level, account_full_name)
    clear_state(chat_id)
    hello_name = escape_html(account_full_name or first_name or "друг")
    msg = (
        f"Привет, {hello_name}.\n"
        f"Вход выполнен: <b>{escape_html(account_username)}</b>\n"
        f"Роль: <b>{escape_html(role)}</b>"
    )
    if level:
        msg += f"\nУровень: <b>{escape_html(level)}</b>"
    send_message(chat_id, msg, reply_markup=keyboard_for_role(role))


def handle_logout(chat_id: int):
    clear_state(chat_id)
    clear_bot_account(chat_id)
    send_message(chat_id, "Вы вышли из аккаунта. Используйте /login или /start, чтобы войти снова.", reply_markup=build_main_keyboard())


def keyboard_for_role(role: str):
    lowered = str(role or "").lower()
    if lowered == "admin":
        return build_admin_keyboard()
    if lowered == "mentor":
        return build_mentor_keyboard()
    return build_main_keyboard()


def handle_start(chat_id: int, first_name: str):
    start_login_flow(chat_id, first_name)


def handle_help(chat_id: int):
    text = (
        "<b>Помощь</b>\n"
        "Основные команды:\n"
        "/login — войти в аккаунт\n"
        "/logout — выйти из аккаунта\n"
        "/news — последние новости\n"
        "/daily — материал дня\n"
        "/tip — совет IELTS\n"
        "/recommend — рекомендации по уровню\n"
        "/level — выбрать уровень\n"
        "/myid — показать chat_id\n"
        "/help — помощь\n\n"
        "Если что-то не работает, просто напишите сообщение — я подскажу."
    )
    send_message(chat_id, text, reply_markup=build_main_keyboard())


def handle_news(chat_id: int):
    items = fetch_latest_news(DEFAULT_NEWS_LIMIT)
    if not items:
        text = "Пока нет новостей. Как только появятся, я сразу пришлю."
        send_message(chat_id, text, reply_markup=build_main_keyboard())
        return
    blocks = [format_news_item(item) for item in items]
    text = "<b>Последние новости</b>\n\n" + "\n\n".join(blocks)
    send_message(chat_id, text, reply_markup=build_main_keyboard())


def handle_daily_material(chat_id: int):
    text = "<b>Материал дня</b>\n" + escape_html(pick_daily_material())
    send_message(chat_id, text, reply_markup=build_main_keyboard())


def handle_tip(chat_id: int):
    text = "<b>Совет IELTS</b>\n" + escape_html(pick_tip())
    send_message(chat_id, text, reply_markup=build_main_keyboard())


def start_level_flow(chat_id: int):
    text = "Выберите ваш уровень (A1–B2)."
    set_state(chat_id, "awaiting_level")
    send_message(chat_id, text, reply_markup=build_level_keyboard())


def handle_level(chat_id: int):
    current = get_user_level(chat_id)
    if current:
        text = f"Ваш текущий уровень: <b>{escape_html(current)}</b>.\nХотите изменить?"
    else:
        text = "Уровень пока не выбран."
    set_state(chat_id, "awaiting_level")
    send_message(chat_id, text, reply_markup=build_level_keyboard())


def handle_recommendations(chat_id: int):
    level = get_user_level(chat_id)
    if not level:
        start_level_flow(chat_id)
        return
    tips = LEVEL_RECOMMENDATIONS.get(level, [])
    if not tips:
        send_message(chat_id, "Рекомендации пока не готовы.", reply_markup=build_main_keyboard())
        return
    lines = "\n".join([f"• {escape_html(item)}" for item in tips])
    text = f"<b>Рекомендации для {escape_html(level)}</b>\n{lines}"
    send_message(chat_id, text, reply_markup=build_main_keyboard())

def handle_admin_panel(chat_id: int):
    text = (
        "<b>Админ-панель</b>\n"
        "Доступ подтвержден.\n\n"
        "Действия:\n"
        "• Добавить новость\n"
        "• Статистика"
    )
    send_message(chat_id, text, reply_markup=build_admin_keyboard())


def handle_mentor_panel(chat_id: int):
    text = (
        "<b>Окно ментора</b>\n"
        "Доступ подтвержден.\n\n"
        "Пока доступно:\n"
        "• Сегодняшние задачи (скоро)"
    )
    send_message(chat_id, text, reply_markup=build_mentor_keyboard())


def handle_admin_stats(chat_id: int):
    total_users, news_count = get_admin_stats()
    text = (
        "<b>Статистика бота</b>\n"
        f"Всего пользователей: {total_users}\n"
        f"Новостей в базе: {news_count}"
    )
    send_message(chat_id, text, reply_markup=build_admin_keyboard())


def start_news_flow(chat_id: int):
    text = (
        "Отправьте текст новости одним сообщением.\n"
        "Если первая строка короткая, я возьму ее как заголовок.\n\n"
        "Для отмены отправьте /cancel."
    )
    set_state(chat_id, "awaiting_news_text")
    send_message(chat_id, text, reply_markup=build_admin_keyboard())


def save_news_from_message(chat_id: int, author_name: str, raw_text: str):
    raw_text = (raw_text or "").strip()
    if not raw_text:
        send_message(chat_id, "Текст новости пустой. Попробуйте еще раз.", reply_markup=build_admin_keyboard())
        return
    title = ""
    body = raw_text
    if "\n" in raw_text:
        first_line, rest = raw_text.split("\n", 1)
        if len(first_line.strip()) <= 80:
            title = first_line.strip()
            body = rest.strip()
    add_news(title, body, chat_id, author_name or "")
    clear_state(chat_id)
    preview = format_news_item({"title": title, "body": body, "created_at": utc_now()})
    broadcast_text = "<b>Новости сайта</b>\n\n" + preview
    sent = broadcast_message(broadcast_text)
    send_message(chat_id, f"Новость сохранена и отправлена {sent} пользователям.", reply_markup=build_admin_keyboard())


def try_check_phone_exists(phone_raw: str):
    status, data = site_get_json("/api/bot/profile", {"phone": phone_raw})
    if status == 200:
        return True, data
    if status == 404:
        return False, {"error": "user_not_found"}
    return False, data or {"error": "request_failed"}


def try_bot_login(phone_raw: str, username: str, password: str):
    status, data = site_post_json(
        "/api/bot/login",
        {"phone": phone_raw, "username": username, "password": password},
    )
    return status, data or {}


def try_link_chat(phone_raw: str, chat_id: int):
    params = {"phone": phone_raw, "chat_id": str(int(chat_id))}
    if BOT_SYNC_TOKEN:
        params["token"] = BOT_SYNC_TOKEN
    status, data = site_get_json("/api/bot/link-chat", params)
    return status, data or {}


def handle_text(chat_id: int, role: str, first_name: str, text: str):
    normalized = (text or "").strip()
    lowered = normalized.lower()

    state = get_state(chat_id)
    if state and state.get("state") in {"awaiting_login_phone", "awaiting_login_username", "awaiting_login_password"}:
        if lowered in {"/cancel", "отмена", "назад"}:
            clear_state(chat_id)
            send_message(chat_id, "Вход отменен. Используйте /login, чтобы начать заново.", reply_markup=build_main_keyboard())
            return
        payload = decode_state_payload(state.get("payload") or "")
        step = state.get("state")
        if step == "awaiting_login_phone":
            phone_raw = normalized
            exists, info = try_check_phone_exists(phone_raw)
            if not exists:
                link = build_signup_link()
                send_message(
                    chat_id,
                    "Такого пользователя не существует.\n"
                    f"Создайте аккаунт на сайте: {escape_html(link)}\n\n"
                    "Потом вернитесь и выполните /login.",
                    reply_markup=build_main_keyboard(),
                )
                clear_state(chat_id)
                return
            payload["phone"] = phone_raw
            set_state(chat_id, "awaiting_login_username", encode_state_payload(payload))
            send_message(chat_id, "Введите логин (username) от профиля.", reply_markup=build_main_keyboard())
            return
        if step == "awaiting_login_username":
            payload["username"] = normalized
            set_state(chat_id, "awaiting_login_password", encode_state_payload(payload))
            send_message(chat_id, "Введите пароль от профиля.", reply_markup=build_main_keyboard())
            return
        if step == "awaiting_login_password":
            phone_raw = str(payload.get("phone") or "").strip()
            username = str(payload.get("username") or "").strip()
            password = normalized
            attempts = int(payload.get("attempts") or 0)
            status, login_data = try_bot_login(phone_raw, username, password)
            if status != 200:
                attempts += 1
                payload["attempts"] = attempts
                set_state(chat_id, "awaiting_login_password", encode_state_payload(payload))
                if attempts >= 3:
                    clear_state(chat_id)
                    send_message(chat_id, "Не удалось войти (3 попытки). Запустите /login и попробуйте снова.", reply_markup=build_main_keyboard())
                    return
                send_message(chat_id, "Неверный логин или пароль. Попробуйте еще раз.", reply_markup=build_main_keyboard())
                return
            # Link Telegram chat_id to the site account so admin PINs can be delivered.
            try_link_chat(phone_raw, chat_id)
            finish_login_flow(chat_id, first_name, login_data)
            return

    if state and state.get("state") == "awaiting_news_text":
        if lowered in {"/cancel", "отмена"}:
            clear_state(chat_id)
            send_message(chat_id, "Создание новости отменено.", reply_markup=build_admin_keyboard())
            return
        if role != "admin":
            clear_state(chat_id)
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        save_news_from_message(chat_id, first_name or "", normalized)
        return

    if state and state.get("state") == "awaiting_level":
        if lowered in {"назад", "/cancel", "отмена"}:
            clear_state(chat_id)
            send_message(chat_id, "Выбор уровня отменен.", reply_markup=build_main_keyboard())
            return
        upper_level = normalized.upper()
        if upper_level in LEVELS:
            set_user_level(chat_id, upper_level)
            clear_state(chat_id)
            send_message(chat_id, f"Уровень сохранен: <b>{escape_html(upper_level)}</b>.", reply_markup=build_main_keyboard())
            return
        send_message(chat_id, "Пожалуйста, выберите уровень A1, A2, B1 или B2.", reply_markup=build_level_keyboard())
        return

    if lowered == "новости":
        handle_news(chat_id)
        return
    if lowered == "материал дня":
        handle_daily_material(chat_id)
        return
    if lowered == "совет ielts":
        handle_tip(chat_id)
        return
    if lowered == "рекомендации":
        handle_recommendations(chat_id)
        return
    if lowered == "уровень":
        handle_level(chat_id)
        return
    if lowered == "помощь":
        handle_help(chat_id)
        return
    if lowered == "добавить новость":
        if role != "admin":
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        start_news_flow(chat_id)
        return
    if lowered == "статистика":
        if role != "admin":
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        handle_admin_stats(chat_id)
        return
    if lowered == "сегодняшние задачи":
        if role != "mentor":
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        send_message(chat_id, "Функция в разработке.", reply_markup=build_mentor_keyboard())
        return
    if lowered == "назад":
        send_message(chat_id, "Главное меню.", reply_markup=build_main_keyboard())
        return

    text = (
        "Я не понял сообщение.\n"
        "Напишите /help, чтобы увидеть доступные команды."
    )
    send_message(chat_id, text, reply_markup=build_main_keyboard())


def handle_command(chat_id: int, role: str, first_name: str, username: str, text: str):
    parts = (text or "").split()
    command = parts[0].lower()
    args = parts[1:]

    if command == "/start":
        handle_start(chat_id, first_name)
        return
    if command == "/login":
        start_login_flow(chat_id, first_name)
        return
    if command == "/logout":
        handle_logout(chat_id)
        return
    if command == "/cancel":
        clear_state(chat_id)
        send_message(chat_id, "Действие отменено.", reply_markup=build_main_keyboard())
        return
    if command == "/help":
        handle_help(chat_id)
        return
    if command == "/myid":
        send_message(chat_id, f"Ваш chat_id: {chat_id}")
        return
    if command == "/news":
        handle_news(chat_id)
        return
    if command == "/daily":
        handle_daily_material(chat_id)
        return
    if command == "/tip":
        handle_tip(chat_id)
        return
    if command == "/recommend":
        handle_recommendations(chat_id)
        return
    if command == "/level":
        handle_level(chat_id)
        return
    if command == "/admin":
        if role != "admin":
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        handle_admin_panel(chat_id)
        return
    if command == "/mentor":
        if role != "mentor":
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        handle_mentor_panel(chat_id)
        return
    if command == "/news_add":
        if role != "admin":
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        if args:
            raw_text = " ".join(args)
            save_news_from_message(chat_id, first_name or username or "", raw_text)
            return
        start_news_flow(chat_id)
        return
    if command == "/broadcast":
        if role != "admin":
            send_message(chat_id, "Доступ запрещен.", reply_markup=build_main_keyboard())
            return
        raw_text = " ".join(args).strip()
        if not raw_text:
            send_message(chat_id, "Укажите текст рассылки после команды /broadcast.", reply_markup=build_admin_keyboard())
            return
        text = "<b>Сообщение от команды</b>\n\n" + escape_html(raw_text)
        sent = broadcast_message(text)
        send_message(chat_id, f"Рассылка отправлена {sent} пользователям.", reply_markup=build_admin_keyboard())
        return

    handle_text(chat_id, role, first_name, text)


def handle_update(update: dict):
    message = update.get("message") or update.get("edited_message")
    if not message:
        return
    chat = message.get("chat", {})
    chat_id = chat.get("id")
    if chat_id is None:
        return
    from_user = message.get("from", {})
    username = from_user.get("username", "") or ""
    first_name = from_user.get("first_name", "") or ""
    last_name = from_user.get("last_name", "") or ""
    role = role_for_chat_id(int(chat_id))
    upsert_bot_user(int(chat_id), username, first_name, last_name, role)

    text = message.get("text") or ""
    if not text:
        send_message(chat_id, "Пришлите, пожалуйста, текстовое сообщение.")
        return

    if text.strip().startswith("/"):
        handle_command(int(chat_id), role, first_name, username, text.strip())
    else:
        handle_text(int(chat_id), role, first_name, text.strip())


def get_updates(offset: int):
    params = {
        "timeout": LONG_POLL_TIMEOUT,
        "offset": offset,
    }
    return api_call("getUpdates", params) or []


def set_bot_commands():
    commands = [
        {"command": "start", "description": "Запуск бота"},
        {"command": "login", "description": "Войти в аккаунт"},
        {"command": "logout", "description": "Выйти из аккаунта"},
        {"command": "news", "description": "Последние новости"},
        {"command": "daily", "description": "Материал дня"},
        {"command": "tip", "description": "Совет IELTS"},
        {"command": "recommend", "description": "Рекомендации по уровню"},
        {"command": "level", "description": "Выбрать уровень"},
        {"command": "myid", "description": "Показать chat_id"},
        {"command": "help", "description": "Подсказка"},
    ]
    api_call("setMyCommands", {"commands": json.dumps(commands, ensure_ascii=False)})


def main():
    ensure_db()
    check_site_api()
    set_bot_commands()
    offset = 0
    while True:
        updates = get_updates(offset)
        for update in updates:
            offset = max(offset, update.get("update_id", 0) + 1)
            handle_update(update)
        time.sleep(0.2)


if __name__ == "__main__":
    main()
