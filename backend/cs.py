from fastapi.routing import APIRoute

import app

for route in app.routes:
    if isinstance(route, APIRoute):
        print(route.path)
