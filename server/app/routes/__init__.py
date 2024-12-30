from flask import Blueprint

bp = Blueprint('api', __name__)

from app.routes import user_routes
from app.routes import rental_routes
from app.routes import vehicle_routes
from app.routes import customer_routes