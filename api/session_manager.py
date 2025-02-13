from collections import deque
from typing import Dict, List

from .matching_task import MatchingTask


class SessionManager:
    """Session Manager class
    This class is responsible for managing the session of the user.

    Each session have:
    - A unique name
    - A MatchingTask object
    -
    """

    def __init__(self):
        self.max_sessions = 10
        self.queue = deque()
        self.sessions = {"default": Session("default")}

    def add_session(self, session_name: str) -> None:
        if session_name in self.sessions:
            # Move the session to the end of the queue
            self.queue.remove(session_name)
            self.queue.append(session_name)
        else:
            if len(self.sessions) >= self.max_sessions:
                # Remove the least recently used session
                lru_session = self.queue.popleft()
                del self.sessions[lru_session]
            # Add the new session
            self.sessions[session_name] = Session(session_name)
            self.queue.append(session_name)

    def get_session(self, session_name: str) -> "Session":
        return self.sessions.get(session_name)

    def remove_session(self, session_name: str) -> None:
        if session_name in self.sessions:
            del self.sessions[session_name]
            self.queue.remove(session_name)

    def get_active_sessions(self) -> List[str]:
        return list(self.sessions.keys())

    def get_session_count(self) -> int:
        return len(self.sessions)


class Session:
    def __init__(self, name: str):
        self.name = name
        self.matching_task = MatchingTask()


SESSION_MANAGER = SessionManager()
