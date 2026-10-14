import struct
import socket


def reset_camera(visca_ip: str, visca_port: int) -> None:
    payload = bytes.fromhex("81 01 04 3F 02 01 FF")
    packet = struct.pack(">HHI", 0x0100, len(payload), 1) + payload

    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(2)
        sock.sendto(packet, (visca_ip, visca_port))
        sock.recvfrom(64)