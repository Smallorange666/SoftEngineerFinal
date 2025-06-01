from app import db
from datetime import datetime, timezone


class Customer(db.Model):
    __tablename__ = 'customers'

    customer_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.user_id'), unique=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=True)
    id_card = db.Column(db.String(18), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    updated_at = db.Column(
        db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
    is_deleted = db.Column(db.Boolean, default=False, nullable=False)
    money = db.Column(db.Numeric(10, 2), nullable=True)

    rentals = db.relationship('Rental', backref='customer', lazy=True)

    def to_dict(self):
        return {
            'customer_id': self.customer_id,
            'name': self.name,
            'phone': self.phone,
            'address': self.address,
            'id_card': self.id_card,
            'money': float(self.money)
        }
