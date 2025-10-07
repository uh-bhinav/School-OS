import os
import sys

# Add the 'backend' directory to the Python path before running tests
# This allows pytest to find and import modules from the 'app' package.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
