import os
import sys

backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
project_dir = os.path.abspath(os.path.join(backend_dir, '..'))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if project_dir not in sys.path:
    sys.path.insert(0, project_dir)
