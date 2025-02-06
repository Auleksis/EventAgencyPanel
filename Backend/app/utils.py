import re

import bcrypt


def hash_password(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)

    return hashed.decode('utf-8')


def check_password(hashed_password: str, password: str):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))


def validate_phone_number(phone_number: str):
    russian_phone_pattern = re.compile(r"""^(?:\+7|8)\s*\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$""")
    return russian_phone_pattern.match(phone_number)
