from app import db
from datetime import datetime

class Rental(db.Model):
    __tablename__ = 'rentals'

    rental_id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.vehicle_id', ondelete='RESTRICT'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.customer_id', ondelete='RESTRICT'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    duration_days = db.Column(db.Integer, nullable=False)
    expected_return_time = db.Column(db.DateTime, nullable=False)
    actual_return_time = db.Column(db.DateTime, nullable=True)
    total_fee = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'rental_id': self.rental_id,
            'vehicle_id': self.vehicle_id,
            'customer_id': self.customer_id,
            'start_time': self.start_time.isoformat(),
            'duration_days': self.duration_days,
            'expected_return_time': self.expected_return_time.isoformat(),
            'actual_return_time': self.actual_return_time.isoformat() if self.actual_return_time else None,
            'total_fee': float(self.total_fee),
            'status': self.status
        } 