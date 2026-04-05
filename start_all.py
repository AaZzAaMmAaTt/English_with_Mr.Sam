import subprocess
import sys


def main():
    python = sys.executable
    server = subprocess.Popen([python, "backend\\server.py"])
    bot = subprocess.Popen([python, "ielts_bot\\main.py"])
    try:
        server.wait()
        bot.wait()
    except KeyboardInterrupt:
        for proc in (server, bot):
            if proc.poll() is None:
                proc.terminate()

if __name__ == "__main__":
    main()