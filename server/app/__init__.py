from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from config import Config
from werkzeug.exceptions import UnsupportedMediaType, BadRequest

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    migrate.init_app(app, db)

    # 延迟导入路由
    with app.app_context():
        from app.routes import bp
        app.register_blueprint(bp)

    @app.errorhandler(UnsupportedMediaType)
    def handle_unsupported_media_type(e):
        return jsonify({'error': 'Invalid content type'}), 400

    @app.errorhandler(BadRequest)
    def handle_bad_request(e):
        return jsonify({'error': 'Invalid JSON format'}), 400

    @app.before_request
    def handle_invalid_json():
        if request.method in ['POST', 'PUT'] and request.is_json:
            try:
                request.get_json()
            except BadRequest:
                return jsonify({'error': 'Invalid JSON format'}), 400

    return app 