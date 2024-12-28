import pytest
from datetime import datetime, timedelta
from app import create_app, db
from app.models import Vehicle, Customer, Rental
from config import TestConfig

@pytest.fixture
def app():
    app = create_app(TestConfig)
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()

@pytest.fixture
def test_vehicle(app):
    vehicle = Vehicle(
        type='SUV',
        brand='Toyota',
        model='RAV4',
        color='白色',
        price_per_day=300.00,
        status='可租用',
        plate_number='测试车牌A123'
    )
    db.session.add(vehicle)
    db.session.commit()
    return vehicle

@pytest.fixture
def test_customer(app):
    customer = Customer(
        name='张三',
        phone='13800138000',
        address='北京市海淀区',
        id_card='110101199001011234'
    )
    db.session.add(customer)
    db.session.commit()
    return customer

@pytest.fixture
def test_rental(app, test_vehicle, test_customer):
    start_time = datetime.now()
    rental = Rental(
        vehicle_id=test_vehicle.vehicle_id,
        customer_id=test_customer.customer_id,
        start_time=start_time,
        duration_days=3,
        expected_return_time=start_time + timedelta(days=3),
        actual_return_time=None,
        total_fee=900.00,
        status='进行中'
    )
    db.session.add(rental)
    db.session.commit()
    return rental 