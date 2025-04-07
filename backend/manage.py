#!/usr/bin/env python
"""Kommandozeilen-Dienstprogramm von Django für administrative Aufgaben."""
import os
import sys


def main():
    """Führt administrative Aufgaben aus."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Konnte Django nicht importieren. Sind Sie sicher, dass es installiert ist und "
            "in Ihrer PYTHONPATH-Umgebungsvariable verfügbar ist? Haben Sie "
            "vergessen, eine virtuelle Umgebung zu aktivieren?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
