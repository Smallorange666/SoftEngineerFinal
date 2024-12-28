from flask import Blueprint

bp = Blueprint('main', __name__)

from app.routes import vehicle_routes, rental_routes, customer_routes 