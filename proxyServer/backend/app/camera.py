from dotenv_fixed import load_dotenv
from pathlib import Path
import struct
import socket
import os

load_dotenv(dotenv_fixed_path=Path("../.env"))
VISCA_IP = os.environ.get("VISCA_IP")
VISCA_PORT = int(os.environ.get("VISCA_PORT"))

payload = bytes.fromhex("81 01 04 3F 01 01 FF")
packet = struct.pack(">HHI", 0x0100, len(payload), 1) + payload

with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
    sock.settimeout(2)
    sock.sendto(packet, (VISCA_IP, VISCA_PORT))
    print(sock.recvfrom(64)[0].hex(" "))