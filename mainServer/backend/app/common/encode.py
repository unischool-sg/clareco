import os
import subprocess
import tempfile
from pathlib import Path

from common.config import (
    ENCODE_COLOR,
    ENCODE_CRF,
    ENCODE_PIX_FMT,
    ENCODE_PRESET,
    ENCODE_TIMEOUT,
    ENCODE_VIDEO_CODEC,
)


def encode_video(video: Path) -> Path:
    fd, name = tempfile.mkstemp(suffix=".mp4")
    os.close(fd)
    output = Path(name)
    try:
        result = subprocess.run(
            ["ffmpeg", "-nostdin", "-y", "-v", "error",
             "-i", str(video.resolve()),
             "-c:v", ENCODE_VIDEO_CODEC,
             "-preset", ENCODE_PRESET,
             "-crf", ENCODE_CRF,
             "-pix_fmt", ENCODE_PIX_FMT,
             "-color_primaries", ENCODE_COLOR,
             "-color_trc", ENCODE_COLOR,
             "-colorspace", ENCODE_COLOR,
             "-c:a", "copy",
             "-movflags", "+faststart",
             str(output)],
            capture_output=True, text=True, timeout=ENCODE_TIMEOUT,
        )
        if result.returncode != 0:
            raise ValueError(f"Encode failed: {result.stderr.strip()[-500:]}")
    except BaseException:
        output.unlink(missing_ok=True)
        raise
    return output
